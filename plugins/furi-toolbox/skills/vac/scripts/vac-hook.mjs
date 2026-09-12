#!/usr/bin/env node
// vac-hook.mjs — os hooks do /vac. Um script, um subcomando por evento.
// Zero dependências, sem rede, sem escrita no repositório-alvo.
//
// Lê o JSON que o Claude Code entrega ao hook em stdin e responde por:
//   exit 0 + JSON no stdout  → injeta contexto (card)
//   exit 2 + motivo no stderr → bloqueia; o motivo volta para o modelo corrigir
//   exit 0 silencioso         → nada a dizer
//
// Subcomandos:
//   card [--subagent | --after-compact]  UserPromptSubmit / SubagentStart / SessionStart
//   check-artifact                       PostToolUse (Write|Edit|MultiEdit) em artefato de processo
//   check-stop [--subagent]              Stop (e SubagentStop, quando o Claude Code passar a
//                                        disparar SubagentStop de hook de skill — na 2.1.269 não)
//   agent-done                           PostToolUse (Agent): verificador → grava o carimbo;
//                                        outro subagente → confere o retorno como check-stop
//   stamp                                SubagentStop do verificador (mesma lógica; reservado)
//   probe                                grava o payload em <data>/vac/debug.log (VAC_DEBUG=1)
//

// Flags: --data <dir>   onde gravar o carimbo (opcional; usado pelos testes).
//                       Sem a flag: env CLAUDE_PLUGIN_DATA se existir, senão ~/.claude/vac-data.
//                       (${CLAUDE_PLUGIN_DATA} NÃO expande em hook de skill — só em hooks.json
//                       de plugin; ${CLAUDE_PLUGIN_ROOT} expande nos dois.)
// Env:   VAC_STRICT=0   desliga os bloqueios (mantém a injeção do cartão)
//        VAC_DEBUG=1    liga o `probe`
//
// Precisão > recall: cada regra abaixo prefere deixar passar a bloquear errado —
// falso positivo em hook irrita e vira VAC_STRICT=0.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SKILL_FILE = path.join(HERE, "..", "SKILL.md"); // o cartão mora no SKILL.md, entre <!-- vac:card --> e <!-- /vac:card -->

// ---------------------------------------------------------------------------
// Sintaxe (contrato com references/estados.md — mudou lá, muda aqui)
// ---------------------------------------------------------------------------

// Uma linha é "claim" quando afirma sucesso/verificação.
const CLAIM_RE = /(✅|\bPASSED\b|\bLIBERADO\b|\bAPROVADO\b|\[VERIFICADO\]|\bno ar\b)/u;
// Uma linha tem evidência quando traz coordenada, comando→saída, tool:, screenshot: ou evidência:.
const EVIDENCE_RE =
  /([\w@./~-]+\.[a-z0-9]{1,6}:\d+)|`[^`]+`\s*→|\btool:|\bscreenshot:|\bevid[êe]ncia:|\bevidence:/iu;
// Linhas-resumo (derivadas das outras) ficam isentas de evidência própria.
const SUMMARY_RE = /^\s*[-*]?\s*\**\s*(Veredicto|Status|Net)\s*\**\s*:/iu;
// Estados de abstenção carregam a própria justificativa.
const ABSTAIN_RE = /\[(AUSENTE|INDISPON[IÍ]VEL|INFERIDO)\]/u;
// Mensagem/artefato "de gate": só aí claim sem evidência bloqueia.
const GATE_RE =
  /(Gateway Check|Audit Pr[ée]|Audit P[óo]s|Gate de Converg[êe]ncia|Veredicto|Checklist Final|\bPASSED\b|\bSmoke\b)/u;
// Coordenada arquivo:linha (extensões conhecidas — whitelist evita "e.g:12", "12:30").
const EXT =
  "ts|tsx|js|jsx|mjs|cjs|json|md|mdx|yml|yaml|toml|css|scss|html|sh|bash|py|go|rs|sql|prisma|txt|env|xml|csv|vue|svelte|tf";
const COORD_RE = new RegExp(
  `(?<![\\w/@:.-])((?:~/|\\.{1,2}/|/)?(?:[\\w@.-]+/)*[\\w@.-]+\\.(?:${EXT}))(?::(\\d+))(?:-(\\d+))?(?![\\w:])`,
  "gu",
);
// Ponteiro de evidência para arquivo (screenshot/dump).
const POINTER_RE = /\b(?:screenshot|evid[êe]ncia|evidence):\s*`?([\w@./~-]+\.[a-z0-9]{1,6})`?/giu;
// Artefatos de processo onde o PostToolUse valida.
const ARTIFACT_RE = /(^|[\\/])(docs[\\/]0[1-5]-[^\\/]+|kanban[\\/](?:0[6-9]|1[01])-[^\\/]+|\.proof)[\\/][^\\/]+\.md$/u;
// Gates que exigem carimbo do verificador: regex → pasta do artefato.
const STAMPED_GATES = [
  { re: /Gateway Check\s*[—–-]+\s*Step\s*8\s*(?:→|->)\s*(?:Step\s*)?9/u, dir: "kanban/08-code-review", label: "8→9" },
  { re: /Gateway Check\s*[—–-]+\s*Step\s*9\s*(?:→|->)\s*(?:Step\s*)?10/u, dir: "kanban/09-run-test", label: "9→10" },
];
const VERDICT_RE =
  /VEREDITO:\s*(\d+)\s*suportadas?\s*\/\s*(\d+)\s*n[ãa]o(?:\s*suportadas?)?\s*\/\s*(\d+)\s*n[ãa]o\s*verific[áa]ve(?:l|is)[^\n]*?alvo=(\S+)\s+sha256=([0-9a-f]{64}|indispon[ií]vel)/iu;

const MAX_ITEMS = 8;
const MAX_REASON = 1800;

// ---------------------------------------------------------------------------
// Entrada / ambiente
// ---------------------------------------------------------------------------

function readStdin() {
  if (process.stdin.isTTY) return {}; // chamado à mão, sem pipe: não espera stdin
  try {
    const raw = fs.readFileSync(0, "utf8");
    return raw.trim() ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function argValue(flag) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function dataDir() {
  const fromArg = argValue("--data");
  const candidates = [fromArg, process.env.CLAUDE_PLUGIN_DATA, path.join(os.homedir(), ".claude", "vac-data")];
  const dir = candidates.find((c) => c && !c.startsWith("${") && c.trim());
  return path.join(dir, "vac");
}

function projectRoots(input) {
  const roots = [process.env.CLAUDE_PROJECT_DIR, input.cwd, process.cwd()].filter(Boolean);
  return [...new Set(roots.map((r) => path.resolve(r)))];
}

function expandHome(p) {
  return p.startsWith("~/") ? path.join(os.homedir(), p.slice(2)) : p;
}

function resolveFile(p, roots) {
  const cand = path.isAbsolute(expandHome(p)) ? [expandHome(p)] : roots.map((r) => path.join(r, p));
  return cand.find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
}

function strict() {
  return process.env.VAC_STRICT !== "0";
}

// ---------------------------------------------------------------------------
// Texto: linhas fora de blocos de código (templates e saídas coladas não contam)
// ---------------------------------------------------------------------------

function proseLines(text) {
  const out = [];
  let fenced = false;
  const lines = text.split(/\r?\n/);
  lines.forEach((line, i) => {
    if (/^\s*```/.test(line)) {
      fenced = !fenced;
      return;
    }
    if (!fenced) out.push({ n: i + 1, line, next: lines[i + 1] ?? "" });
  });
  return out;
}

function lineCount(text) {
  const parts = text.split(/\r?\n/);
  return parts.length - (parts.at(-1) === "" ? 1 : 0); // newline final não é linha
}

function isPlaceholder(p) {
  return /[<>{}*…]/.test(p);
}

// (a) coordenadas arquivo:linha que não resolvem
function invalidCoords(text, roots) {
  const bad = [];
  const seen = new Set();
  for (const { line } of proseLines(text)) {
    const clean = line.replace(/https?:\/\/\S+/g, ""); // URL não é coordenada
    for (const m of clean.matchAll(COORD_RE)) {
      const [, file, start] = m;
      const key = `${file}:${start}`;
      if (seen.has(key) || isPlaceholder(file)) continue;
      seen.add(key);
      const abs = resolveFile(file, roots);
      if (!abs) {
        bad.push(`${key} — arquivo não existe`);
        continue;
      }
      const size = fs.statSync(abs).size;
      if (size > 2_000_000) continue; // arquivo enorme: não conta linhas
      const total = lineCount(fs.readFileSync(abs, "utf8"));
      if (Number(start) > total) bad.push(`${key} — arquivo tem ${total} linhas`);
    }
  }
  return bad;
}

// (b) claims sem evidência (só em contexto de gate)
function unbackedClaims(text) {
  if (!GATE_RE.test(text)) return [];
  const bad = [];
  for (const { line, next } of proseLines(text)) {
    if (!CLAIM_RE.test(line)) continue;
    if (SUMMARY_RE.test(line) || ABSTAIN_RE.test(line)) continue;
    if (EVIDENCE_RE.test(line) || /^\s*```/.test(next)) continue;
    bad.push(line.trim().slice(0, 140));
  }
  return bad;
}

// ponteiros screenshot:/evidência: que apontam para arquivo inexistente
function deadPointers(text, roots) {
  const bad = [];
  for (const { line } of proseLines(text)) {
    for (const m of line.matchAll(POINTER_RE)) {
      const p = m[1];
      if (isPlaceholder(p)) continue;
      if (!resolveFile(p, roots)) bad.push(`${m[0].trim()} — arquivo não existe`);
    }
  }
  return bad;
}

// (c) gate LIBERADO sem carimbo válido do verificador
function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function newestMd(dir) {
  if (!fs.existsSync(dir)) return undefined;
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join(dir, f))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return files[0];
}

function readStamp(hash) {
  const file = path.join(dataDir(), "stamps", `${hash}.ok`);
  if (!fs.existsSync(file)) return undefined;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return {};
  }
}

function missingStamps(text, roots) {
  if (!/\bLIBERADO\b/u.test(text)) return [];
  const bad = [];
  for (const gate of STAMPED_GATES) {
    if (!gate.re.test(text)) continue;
    const root = roots.find((r) => fs.existsSync(path.join(r, gate.dir)));
    if (!root) continue; // projeto sem esteira /method: nada a cobrar
    const artifact = newestMd(path.join(root, gate.dir));
    if (!artifact) continue;
    const rel = path.relative(root, artifact);
    const stamp = readStamp(sha256(artifact));
    if (!stamp) bad.push(`gate ${gate.label} LIBERADO sem carimbo do verificador para ${rel} → rode /vac ${rel}`);
    else if (Number(stamp.m) > 0)
      bad.push(`gate ${gate.label} LIBERADO com ${stamp.m} afirmação(ões) NÃO SUPORTADA(s) em ${rel} → corrija e rode /vac ${rel} de novo`);
  }
  return bad;
}

// ---------------------------------------------------------------------------
// Saída
// ---------------------------------------------------------------------------

function inject(eventName, text) {
  process.stdout.write(
    JSON.stringify({ hookSpecificOutput: { hookEventName: eventName, additionalContext: text } }),
  );
  process.exit(0);
}

function block(header, items) {
  const lines = items.slice(0, MAX_ITEMS).map((i) => `- ${i}`);
  if (items.length > MAX_ITEMS) lines.push(`- … e mais ${items.length - MAX_ITEMS}`);
  const footer =
    "Coordenada de outro repositório? Use caminho absoluto. Sem como apurar? Troque o ✅ por [AUSENTE]/[INDISPONÍVEL]/[INFERIDO] com o motivo. Falso positivo? VAC_STRICT=0 e reporte a linha.";
  process.stderr.write(`${header}\n${lines.join("\n")}\n${footer}`.slice(0, MAX_REASON));
  process.exit(2);
}

// ---------------------------------------------------------------------------
// Subcomandos
// ---------------------------------------------------------------------------

function cardText() {
  const skill = fs.readFileSync(SKILL_FILE, "utf8");
  const m = skill.match(/<!--\s*vac:card\s*-->([\s\S]*?)<!--\s*\/vac:card\s*-->/);
  if (!m) throw new Error("SKILL.md sem o bloco <!-- vac:card --> … <!-- /vac:card -->");
  return m[1].trim();
}

function touchedArtifacts(roots) {
  for (const root of roots) {
    try {
      const out = execFileSync("git", ["status", "--short", "--", "docs", "kanban", ".claude", ".proof"], {
        cwd: root,
        encoding: "utf8",
        timeout: 3000,
        stdio: ["ignore", "pipe", "ignore"],
      });
      const lines = out.split(/\r?\n/).filter(Boolean);
      if (lines.length) return lines.slice(0, 20).join("\n");
    } catch {
      /* sem git ou fora de repo: sem lista */
    }
  }
  return "";
}

function cmdCard(input) {
  const event = input.hook_event_name || "UserPromptSubmit";
  let text = cardText();
  if (process.argv.includes("--subagent")) {
    text += "\nVocê é um subagente: não herde afirmações da conversa que o criou — releia as fontes do disco antes de afirmar.";
  } else if (process.argv.includes("--after-compact")) {
    const touched = touchedArtifacts(projectRoots(input));
    text =
      "Contexto compactado ou sessão retomada: o que você \"lembra\" é um resumo — não afirme nada a partir dele sem reler a fonte.\n" +
      text +
      (touched ? `\nArtefatos de processo modificados nesta árvore (releia antes de afirmar sobre eles):\n${touched}` : "");
  }
  inject(event, text);
}

function cmdCheckArtifact(input) {
  if (!strict()) process.exit(0);
  if (!/^(Write|Edit|MultiEdit)$/.test(input.tool_name || "")) process.exit(0);
  const file = input.tool_input?.file_path;
  if (!file || !ARTIFACT_RE.test(file)) process.exit(0);
  const roots = projectRoots(input);
  const abs = resolveFile(file, roots);
  if (!abs) process.exit(0);
  const text = fs.readFileSync(abs, "utf8");
  const items = [
    ...invalidCoords(text, roots).map((i) => `coordenada não resolve: ${i}`),
    ...deadPointers(text, roots).map((i) => `evidência apontada não existe: ${i}`),
    ...unbackedClaims(text).map((i) => `claim sem evidência: "${i}"`),
  ];
  if (!items.length) process.exit(0);
  block(`[/vac] ${path.relative(roots[0], abs)} gravado com afirmações sem lastro — corrija o artefato:`, items);
}

function cmdCheckStop(input) {
  if (!strict() || input.stop_hook_active === true) process.exit(0);
  const text = input.last_assistant_message || "";
  if (!text.trim()) process.exit(0);
  const roots = projectRoots(input);
  const items = [
    ...invalidCoords(text, roots).map((i) => `coordenada não resolve: ${i}`),
    ...deadPointers(text, roots).map((i) => `evidência apontada não existe: ${i}`),
    ...unbackedClaims(text).map((i) => `claim sem evidência em contexto de gate: "${i}"`),
    ...missingStamps(text, roots),
  ];
  if (!items.length) process.exit(0);
  const who = process.argv.includes("--subagent") ? "retorno do subagente" : "resposta";
  block(`[/vac] Bloqueado antes de encerrar — a ${who} tem afirmações sem lastro (este aviso não se repete no mesmo turno). Corrija e conclua:`, items);
}

function agentReport(input) {
  const r = input.tool_response;
  if (!r) return "";
  if (typeof r === "string") return r;
  const c = r.content;
  if (typeof c === "string") return c;
  if (Array.isArray(c)) return c.map((b) => (typeof b === "string" ? b : b?.text ?? "")).join("\n");
  return "";
}

function cmdAgentDone(input) {
  if (input.tool_name !== "Agent") process.exit(0);
  const type = String(input.tool_response?.agentType ?? input.tool_input?.subagent_type ?? "");
  const text = agentReport(input);
  if (/vac-verifier/.test(type)) return stampFrom(text, input);
  if (!strict() || !text.trim()) process.exit(0);
  const roots = projectRoots(input);
  const items = [
    ...invalidCoords(text, roots).map((i) => `coordenada não resolve: ${i}`),
    ...deadPointers(text, roots).map((i) => `evidência apontada não existe: ${i}`),
    ...unbackedClaims(text).map((i) => `claim sem evidência em contexto de gate: "${i}"`),
  ];
  if (!items.length) process.exit(0);
  block(`[/vac] O retorno do subagente (${type || "?"}) tem afirmações sem lastro — não o repasse como fato; confira ou marque o estado real:`, items);
}

function cmdStamp(input) {
  return stampFrom(input.last_assistant_message || "", input);
}

function stampFrom(text, input) {
  const m = text.match(VERDICT_RE);
  if (!m) {
    process.stderr.write(
      "[/vac] relatório do verificador sem a linha final `VEREDITO: <n> suportadas / <m> não suportadas / <k> não verificáveis · alvo=<path> sha256=<hash|indisponível>` — o carimbo não foi gravado. Termine o relatório com ela.",
    );
    process.exit(2);
  }
  const [, n, mm, k, target, claimed] = m;
  const roots = projectRoots(input);
  const abs = resolveFile(target, roots);
  if (!abs) {
    process.stderr.write(`[/vac] alvo do VEREDITO não encontrado: ${target} — carimbo não gravado.`);
    process.exit(0);
  }
  const actual = sha256(abs);
  if (/^[0-9a-f]{64}$/.test(claimed) && actual !== claimed) {
    process.stderr.write(
      `[/vac] sha256 do VEREDITO (${claimed.slice(0, 12)}…) não bate com o arquivo atual (${actual.slice(0, 12)}…) — o alvo mudou durante a verificação; carimbo não gravado. Rode \`sha256sum ${target}\` e verifique de novo.`,
    );
    process.exit(0);
  }
  const dir = path.join(dataDir(), "stamps");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, `${actual}.ok`),
    JSON.stringify({ alvo: target, n: Number(n), m: Number(mm), k: Number(k), at: new Date().toISOString(), session: input.session_id ?? null }),
  );
  process.exit(0);
}

function cmdProbe(input) {
  if (process.env.VAC_DEBUG !== "1") process.exit(0);
  const dir = dataDir();
  fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(path.join(dir, "debug.log"), `${new Date().toISOString()} ${JSON.stringify(input)}\n`);
  process.exit(0);
}

const COMMANDS = {
  card: cmdCard,
  "check-artifact": cmdCheckArtifact,
  "check-stop": cmdCheckStop,
  "agent-done": cmdAgentDone,
  stamp: cmdStamp,
  probe: cmdProbe,
};

const sub = process.argv[2];
const run = COMMANDS[sub];
if (!run) {
  process.stderr.write(`vac-hook: subcomando desconhecido "${sub}". Use: ${Object.keys(COMMANDS).join(" | ")}\n`);
  process.exit(0); // nunca derruba a sessão por erro de configuração
}
try {
  run(readStdin());
} catch (err) {
  process.stderr.write(`vac-hook ${sub}: ${err?.message ?? err}\n`);
  process.exit(0); // erro interno do hook não bloqueia o modelo
}
