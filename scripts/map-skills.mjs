#!/usr/bin/env node
// map-skills.mjs — o mapa estrutural das skills deste repositório, gerado sem LLM.
//   pnpm map   →  .claude/vac/mapa-skills.md
//
// Lê o frontmatter de cada plugins/<pkg>/skills/<slug>/SKILL.md e faz grep determinístico
// (headings de gate, paths de artefato, Task*, Skill/Agent) no SKILL.md e nas references/.
// Cada bullet segue o contrato dos mapas do /vac (`— arquivo:linha — "trecho"`), para que
// `vac-hook.mjs scan --map` valide o mapa e uma sessão nova leia daqui em vez de explorar.
// Idempotente: rodar duas vezes não muda nada (o CI compara como faz com gen:plugins).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLUGINS = path.join(ROOT, "plugins");
const OUT = path.join(ROOT, ".claude", "vac", "mapa-skills.md");

const GATE_RE = /^#{1,6}\s+.*(Gateway Check|Gate Check|Audit Pr[ée]|Audit P[óo]s|Gate de Converg|Veredicto|Checklist Final|Smoke|no ar e verificad)/iu;
const ARTIFACT_RE = /\b(docs\/0\d-[\w-]+|kanban\/\d\d-[\w-]+|\.claude\/ship-setup\/[\w.-]+|\.claude\/vac\/?[\w.-]*|\.playwright-mcp)\b/g;
const TASK_RE = /\bTask(?:Create|Update|List|Get)\b/g;
const SKILL_REF_RE = /\b(furi-(?:build|ship|toolbox):[\w-]+)\b/g;
const AGENT_RE = /\bAgent\(|subagent_type\b/;

function rel(p) {
  return path.relative(ROOT, p).split(path.sep).join("/");
}

function frontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fm = {};
  if (!m) return fm;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (!kv) continue;
    const [, k, v] = kv;
    fm[k] = v.startsWith("[") ? v.replace(/^\[|\]$/g, "").split(",").map((x) => x.trim()).filter(Boolean) : v.replace(/^['"]|['"]$/g, "");
  }
  if (/^hooks:/m.test(m[1])) fm.hooks = "sim";
  return fm;
}

function textFiles(dir, out = []) {
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) {
      if (d.name !== "node_modules") textFiles(p, out);
    } else if (/\.(md|sh|mjs|json)$/.test(d.name)) out.push(p);
  }
  return out;
}

function trecho(line) {
  return line.trim().slice(0, 80); // substring literal: o scan faz includes()
}

function entry(fact, file, n, line) {
  return `- ${fact} — ${rel(file)}:${n} — "${trecho(line)}"`;
}

function firstMatches(files, re, key = (m) => m[0]) {
  const seen = new Map();
  for (const file of files) {
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    lines.forEach((line, i) => {
      for (const m of line.matchAll(new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g"))) {
        const k = key(m);
        if (!seen.has(k)) seen.set(k, { file, n: i + 1, line });
      }
    });
  }
  return seen;
}

const out = [
  "# Mapa das skills — gerado por `scripts/map-skills.mjs` (`pnpm map`)",
  "",
  "Não edite à mão: regenere. Validação: `node plugins/furi-toolbox/skills/vac/scripts/vac-hook.mjs scan --map .claude/vac/mapa-skills.md`.",
  "Cada bullet aponta `arquivo:linha — \"trecho\"`; um ponteiro que o scan não encontra é o sinal para re-explorar só aquele item.",
  "",
];

const skills = [];
for (const pkg of fs.readdirSync(PLUGINS).sort()) {
  const skillsDir = path.join(PLUGINS, pkg, "skills");
  if (!fs.existsSync(skillsDir)) continue;
  for (const slug of fs.readdirSync(skillsDir).sort()) {
    const skillFile = path.join(skillsDir, slug, "SKILL.md");
    if (!fs.existsSync(skillFile)) continue;
    skills.push({ pkg, slug, dir: path.join(skillsDir, slug), skillFile });
  }
}

for (const { pkg, slug, dir, skillFile } of skills) {
  const text = fs.readFileSync(skillFile, "utf8");
  const fm = frontmatter(text);
  const lines = text.split(/\r?\n/);
  const files = textFiles(dir);
  out.push(`## ${pkg}:${slug}`, "");
  const fmLine = lines.findIndex((l) => /^(context|effort|requires|handoff|boundary|user-invocable):/.test(l)) + 1 || 2;
  const facts = [
    `context: ${fm.context || "inline"}`,
    fm.effort ? `effort: ${fm.effort}` : null,
    fm["user-invocable"] !== undefined ? `user-invocable: ${fm["user-invocable"]}` : null,
    fm.requires ? `requires: ${[].concat(fm.requires).join(", ")}` : null,
    fm.handoff ? `handoff: ${[].concat(fm.handoff).join(", ")}` : null,
    fm.boundary ? `boundary: ${[].concat(fm.boundary).join(", ")}` : null,
    fm.hooks ? "hooks: no frontmatter" : null,
    fm["allowed-tools"] ? `allowed-tools: ${[].concat(fm["allowed-tools"]).join(", ")}` : null,
  ].filter(Boolean);
  out.push(entry(`frontmatter — ${facts.join(" · ")}`, skillFile, fmLine, lines[fmLine - 1] || ""));

  const gates = firstMatches(files, GATE_RE, (m) => m[0].replace(/^#{1,6}\s+/, "").trim());
  for (const [heading, { file, n, line }] of gates) out.push(entry(`gate: "${heading.replace(/"/g, "'").slice(0, 60)}"`, file, n, line));

  const artifacts = firstMatches(files, ARTIFACT_RE, (m) => m[1]);
  if (artifacts.size) {
    const list = [...artifacts.keys()].sort();
    const first = artifacts.get(list[0]);
    out.push(entry(`artefatos: ${list.join(", ")}`, first.file, first.n, first.line));
  }

  const tasks = firstMatches(files, TASK_RE);
  if (tasks.size) {
    const first = [...tasks.values()][0];
    out.push(entry(`task list: ${[...tasks.keys()].sort().join(", ")}`, first.file, first.n, first.line));
  }

  const refs = firstMatches(files, SKILL_REF_RE, (m) => m[1]);
  const others = [...refs.keys()].filter((r) => r !== `${pkg}:${slug}`).sort();
  if (others.length) {
    const first = refs.get(others[0]);
    out.push(entry(`invoca/cita: ${others.join(", ")}`, first.file, first.n, first.line));
  }

  const agent = firstMatches(files, AGENT_RE);
  if (agent.size) {
    const first = [...agent.values()][0];
    out.push(entry("subagente: chama Agent(...)", first.file, first.n, first.line));
  } else if (fm.context === "fork") {
    const n = lines.findIndex((l) => /^context:\s*fork/.test(l)) + 1;
    out.push(entry("subagente: a própria skill roda em fork", skillFile, n, lines[n - 1]));
  }
  out.push("");
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, out.join("\n").replace(/\n{3,}/g, "\n\n"));
console.log(`${rel(OUT)}: ${skills.length} skills, ${out.filter((l) => l.startsWith("- ")).length} ponteiros`);
