#!/usr/bin/env node
// mine.mjs — minera um projeto real atrás de casos para o golden set do /vac. Só lê.
//   node scripts/mine.mjs --repo ~/GitHub/labzz-afl [--transcripts ~/.claude/projects/<slug>] --out <dir>
//
// Artefatos (docs/01-05-*, kanban/06-11-*): roda as regras do hook (modo artefato) e classifica cada
// item: positivo-verdadeiro · envelhecido (o arquivo/linha existia quando o artefato foi escrito —
// git history) · ambiguo (basename com vários candidatos) · falso-positivo-template · a-classificar.
// Transcrições: cada mensagem de gate do assistente é conferida com o ledger da sessão inteira
// (R-1…R-12) — positivos verdadeiros por construção (o transcript é a verdade).
// Saída: report.json, summary.md (regra × classe) e samples/ com até 5 propostas por célula, já no
// formato de scripts/samples/ (promoção é humana: copiar, ajustar `expect`, rodar pnpm test:vac).

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RULES = path.join(ROOT, "plugins/furi-toolbox/skills/vac/scripts");
const { analyze, loadGates, sections, gateOf, EVIDENCE_RE, describe } = await import(path.join(RULES, "vac-rules.mjs"));
const { updateLedger, ledgerChecks } = await import(path.join(RULES, "vac-ledger.mjs"));

const arg = (f, d) => {
  const i = process.argv.indexOf(f);
  return i >= 0 ? process.argv[i + 1] : d;
};
const REPO = path.resolve(arg("--repo", process.cwd()));
const TRANSCRIPTS = arg("--transcripts");
const OUT = path.resolve(arg("--out", path.join(process.env.TMPDIR || "/tmp", "vac-mine")));
const MAX_PER_CELL = 5;

function git(args, opts = {}) {
  try {
    return execFileSync("git", ["-C", REPO, ...args], { encoding: "utf8", timeout: 20000, maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"], ...opts }).trim();
  } catch {
    return "";
  }
}

function listMd(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) listMd(p, out);
    else if (d.name.endsWith(".md")) out.push(p);
  }
  return out;
}

const artifactDirs = ["docs/01-problem", "docs/02-user-stories", "docs/03-use-cases", "docs/04-spec", "docs/05-test-cases", "kanban/06-todo", "kanban/07-implementation", "kanban/08-code-review", "kanban/09-run-test", "kanban/10-done", "kanban/11-ship"];
const files = artifactDirs.flatMap((d) => listMd(path.join(REPO, d)));
const gates = loadGates();
const everAdded = new Map(); // basename → existiu no histórico?
function existedEver(basename) {
  if (!everAdded.has(basename)) everAdded.set(basename, git(["log", "--all", "--diff-filter=A", "--name-only", "--format=", "--", `*${basename}`, basename]) !== "");
  return everAdded.get(basename);
}
function linesAtArtifactCommit(artifactRel, fileRel) {
  const sha = git(["log", "-1", "--format=%H", "--", artifactRel]);
  if (!sha) return -1;
  const paths = git(["ls-tree", "-r", "--name-only", sha]).split("\n").filter((p) => p === fileRel || p.endsWith("/" + fileRel));
  if (!paths.length) return -1;
  const content = git(["show", `${sha}:${paths[0]}`]);
  return content ? content.split("\n").length : -1;
}

function classify(item, text, fileRel) {
  if (item.severity !== "block") return "note";
  if (item.rule === "coord") {
    if (/ambíguo/.test(item.detail)) return "ambiguo";
    const [file, line] = item.text.split(":");
    const base = path.basename(file);
    if (/arquivo não existe/.test(item.detail)) return existedEver(base) ? "envelhecido" : "positivo-verdadeiro";
    const n = linesAtArtifactCommit(fileRel, file);
    return n >= Number(line) ? "envelhecido" : "positivo-verdadeiro";
  }
  if (item.rule === "pointer") {
    const base = path.basename(item.text.replace(/^.*?:\s*`?/, "").replace(/`.*$/, "").trim());
    return existedEver(base) ? "envelhecido" : "positivo-verdadeiro";
  }
  if (item.rule === "claim") {
    const sec = sections(text).find((s) => s.lines.some((l) => l.line.includes(item.text.slice(0, 40))) || s.heading.includes(item.text.slice(0, 40)));
    if (!sec) return "a-classificar";
    const structuralTemplate = /^\s*(?:\||- \[[x ]\]|- Ratio)/.test(item.text);
    if (structuralTemplate && sec.lines.some((l) => EVIDENCE_RE.test(l.line))) return "falso-positivo-template";
    return gateOf(sec, gates) ? "positivo-verdadeiro" : "a-classificar";
  }
  if (item.rule === "stamp" || item.rule === "stamp-session") return "n/a-lote";
  return "positivo-verdadeiro";
}

const report = [];
console.error(`artefatos: ${files.length}`);
for (const abs of files) {
  const text = fs.readFileSync(abs, "utf8");
  const rel = path.relative(REPO, abs);
  const items = analyze(text, { roots: [REPO], mode: "artifact", artifactAbs: abs }).filter((i) => i.severity === "block");
  for (const it of items) report.push({ source: "artefato", file: rel, rule: it.rule, text: it.text, detail: it.detail, class: classify(it, text, rel), body: text });
}

const GATE_TEXT_RE = /Gateway Check|Audit P[ré]|Audit Pós|Gate de Converg|Veredicto|Checklist Final|\/homolog — |\/prod — /i;
if (TRANSCRIPTS && fs.existsSync(TRANSCRIPTS)) {
  const jsonls = fs.readdirSync(TRANSCRIPTS).filter((f) => f.endsWith(".jsonl"));
  console.error(`transcrições: ${jsonls.length}`);
  for (const f of jsonls) {
    const file = path.join(TRANSCRIPTS, f);
    const session = { blocks: {}, stamps: [] };
    const ledger = updateLedger({ transcript_path: file, cwd: REPO, session_id: f.replace(".jsonl", "") }, session);
    if (!ledger) continue;
    const fd = fs.openSync(file, "r");
    const size = fs.statSync(file).size;
    const chunk = 8 * 1024 * 1024;
    let rest = "";
    let pos = 0;
    const gateMsgs = [];
    while (pos < size) {
      const buf = Buffer.alloc(Math.min(chunk, size - pos));
      fs.readSync(fd, buf, 0, buf.length, pos);
      pos += buf.length;
      const s = rest + buf.toString("utf8");
      const lines = s.split("\n");
      rest = lines.pop();
      for (const line of lines) {
        if (!line.includes('"role":"assistant"') || !GATE_TEXT_RE.test(line)) continue;
        try {
          const e = JSON.parse(line);
          for (const b of e.message?.content || []) if (b?.type === "text" && GATE_TEXT_RE.test(b.text)) gateMsgs.push(b.text);
        } catch {
          /* linha parcial */
        }
      }
    }
    fs.closeSync(fd);
    for (const text of gateMsgs) {
      const items = [...analyze(text, { roots: [REPO], mode: "stop" }), ...ledgerChecks(text, { roots: [REPO], gates, ledger, input: {} })].filter((i) => i.severity === "block");
      const ledgerSpec = { reads: [], taskCreate: ledger.tasks.create, taskCompleted: ledger.tasks.updateCompleted, taskList: ledger.tasks.list, headings: ledger.headings.filter((h) => /Audit/i.test(h)).map((h) => `## ${h}`).slice(0, 4) };
      for (const it of items) report.push({ source: "transcript", file: f, rule: it.rule, text: it.text, detail: it.detail, class: it.rule.startsWith("coord") || it.rule === "pointer" || it.rule === "claim" ? classify(it, text, "") : "positivo-verdadeiro", body: text, ledger: ledgerSpec });
    }
  }
}

fs.mkdirSync(path.join(OUT, "samples"), { recursive: true });
fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report.map(({ body, ledger, ...r }) => r), null, 2));
const matrix = {};
for (const r of report) {
  matrix[r.rule] = matrix[r.rule] || {};
  matrix[r.rule][r.class] = (matrix[r.rule][r.class] || 0) + 1;
}
const classes = [...new Set(report.map((r) => r.class))].sort();
const md = [`# Mineração — ${REPO}`, "", `${files.length} artefatos${TRANSCRIPTS ? ` · transcrições em ${TRANSCRIPTS}` : ""} · ${report.length} itens bloqueantes`, "", `| regra | ${classes.join(" | ")} |`, `|---|${classes.map(() => "---").join("|")}|`];
for (const [rule, byClass] of Object.entries(matrix)) md.push(`| \`${rule}\` | ${classes.map((c) => byClass[c] || 0).join(" | ")} |`);
fs.writeFileSync(path.join(OUT, "summary.md"), md.join("\n") + "\n");

const perCell = {};
let n = 0;
for (const r of report) {
  const key = `${r.rule}/${r.class}`;
  perCell[key] = (perCell[key] || 0) + 1;
  if (perCell[key] > MAX_PER_CELL || r.class === "note" || r.class === "n/a-lote") continue;
  n++;
  const expect = r.class.startsWith("falso-positivo") || r.class === "envelhecido" ? "pass" : "block";
  const cmd = r.source === "artefato" ? "check-artifact" : "check-stop";
  const front = [`cmd: ${JSON.stringify(cmd)}`, `expect: ${JSON.stringify(expect)}`, `must: ${JSON.stringify(expect === "block" ? [r.text.slice(0, 60)] : [])}`, `class: ${JSON.stringify(r.class)}`, `origin: ${JSON.stringify(`${path.basename(REPO)} ${r.source} ${r.file} — ${r.rule}: ${r.text.slice(0, 80)}`)}`];
  if (cmd === "check-artifact") front.push(`artifact: ${JSON.stringify(r.file.replace(/^.*?(docs|kanban)\//, "$1/"))}`);
  if (r.ledger) front.push(`ledger: ${JSON.stringify(r.ledger)}`);
  const slug = `${r.rule}-${r.class}-${String(perCell[key]).padStart(2, "0")}`.replace(/[^\w-]+/g, "-");
  fs.writeFileSync(path.join(OUT, "samples", `${slug}.md`), `---\n${front.join("\n")}\n---\n${r.body.slice(0, 12000)}\n`);
}
console.log(fs.readFileSync(path.join(OUT, "summary.md"), "utf8"));
console.log(`${n} samples propostos em ${path.join(OUT, "samples")} (fixture a preencher à mão: os arquivos que o sample cita)`);
