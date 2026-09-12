// vac-rules.mjs — as regras do /vac como funções puras sobre texto + disco.
// Sem estado, sem escrita: quem chama (vac-hook.mjs, scan, mine) decide o que
// fazer com os itens. Contrato de sintaxe: references/estados.md — mudou lá, muda aqui.
//
// Precisão > recall: cada regra prefere deixar passar a bloquear errado —
// falso positivo em hook irrita e vira VAC_STRICT=0. O que passa com dúvida
// sai como `note` (vai para o log e calibra o golden set), nunca como `block`.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Sintaxe
// ---------------------------------------------------------------------------

export const EXT =
  "ts|tsx|js|jsx|mjs|cjs|json|md|mdx|yml|yaml|toml|css|scss|html|sh|bash|py|go|rs|sql|prisma|txt|env|xml|csv|vue|svelte|tf";
const EVID_EXT = "png|jpe?g|webp|gif|txt|log|json|html|pdf|mp4|webm";

// Claim: afirma sucesso/verificação. Sempre vale.
export const CLAIM_RE = /(✅|\bPASSED\b|\bLIBERADO\b|\bAPROVADO\b|\bCONVERGIU\b|\[VERIFICADO\]|(?:✅|✓|verificad[ao]s?)[^\n]{0,40}\bno ar\b|\bno ar\b[^\n]{0,20}(?:✅|✓|verificad))/u;
// Claim só em seção de gate (vocabulário de /homolog, /prod, /sync e "cumprimento de processo").
export const CLAIM_GATE_RE =
  /(✓|\binvoquei\b|\bchamei\b|\brodei\b|\bli\b|\bpubliquei\b|\bcriei\b|\bcommitei\b|\bmergeado\b)/u;
// Estados de abstenção carregam a própria justificativa.
export const ABSTAIN_RE = /\[(AUSENTE|INDISPON[IÍ]VEL|INFERIDO)\]/u;
// Linhas-resumo (contagens, vereditos derivados) não pedem evidência própria.
export const SUMMARY_RE =
  /^\s*>?\s*[-*]?\s*\**\s*(?:(?:Veredicto(?:\s+Final)?|Status(?:\s+agregado)?|Net|Itens(?:\s+\w+)?|TCs?\s+(?:planejad|executad|com\s+evid)[^:\n]*|Tasks?\s+(?:de\s+grupo|individuais)[^:\n]*|Total\s+TCs?|Diagn[óo]stico)\s*\**\s*:|Ratio\b[^?\n]*\?)/iu;
// Tokens de veredito de processo: bloqueiam mesmo em seção narrativa de artefato (✅ solto só anota).
export const STRONG_RE = /(\bPASSED\b|\bLIBERADO\b|\bAPROVADO\b|\bCONVERGIU\b|\[VERIFICADO\])/u;
// Linha de veredito marca a seção como gate mesmo sem heading conhecido.
export const VERDICT_LINE_RE = /^\s*[-*]?\s*\**\s*Veredicto(?:\s+Final)?\s*\**\s*:/iu;

// Evidência — as formas que o /vac e as outras skills usam (superposição).
const EVIDENCE_ALTS = [
  `(?:^|[\\s(|\\[\`])(?:~/|\\.{1,2}/|/)?(?:[\\w@.-]+/)*[\\w@.-]+\\.(?:${EXT}):\\d+`, // arquivo:linha
  "`[^`\\n]+`\\s*(?:→|->|=>)\\s*\\S", // `comando` → saída
  "\\btool:\\s*\\S", // tool: X → Y
  "\\b(?:screenshot|print|evid[êe]ncia|evidence|prova)\\s*[:*]+\\s*\\S", // Screenshot: path · **Evidência:** path
  `(?:^|[\\s(|\`])[\\w@./~-]+\\.(?:${EVID_EXT})\\b`, // arquivo de evidência solto (célula de tabela, "— ✅ (path)")
  "\\brun\\s+#?\\d{4,}\\b", // run <id> (deploy)
  "\\b(?:RESULTADO|VENCEDOR|VEREDITO)\\s*:", // /blind, verificador
  "\\bsha256\\s*[=:]\\s*[0-9a-f]{12,}|\\bCarimbo:\\s*HEAD\\s+[0-9a-f]{7,}", // carimbos
  "\\b(?:commit|HEAD|sha)\\b[^\\n]{0,20}\\b[0-9a-f]{7,40}\\b", // sha de commit
  "\\d+\\s*/\\s*\\d+\\s+(?:cards?|TCs?)\\s+verificad", // N/N cards verificados
];
export const EVIDENCE_RE = new RegExp(EVIDENCE_ALTS.join("|"), "iu");

// Coordenada arquivo:linha (whitelist de extensões evita "e.g:12", "12:30").
export const COORD_RE = new RegExp(
  `(?<![\\w/@:.-])((?:~/|\\.{1,2}/|/)?(?:[\\w@.-]+/)*[\\w@.-]+\\.(?:${EXT}))(?::(\\d+))(?:-(\\d+))?(?![\\w:])`,
  "gu",
);
// Ponteiro de evidência para arquivo: `screenshot: x.png`, `**Screenshot:** x.png`, `— ✅ (x.png)`.
export const POINTER_RE = new RegExp(
  `\\b(?:screenshot|print|evid[êe]ncia|evidence|prova)\\s*[:*]+\\s*\`?([\\w@./~-]+\\.(?:${EVID_EXT}))\`?|[—–-]\\s*✅\\s*\\(([\\w@./~-]+\\.(?:png|jpe?g|webp|gif))\\)`,
  "giu",
);
// Artefatos de processo onde o PostToolUse valida (gate inteiro).
export const ARTIFACT_RE =
  /(^|[\\/])(docs[\\/]0[1-5]-[^\\/]+|kanban[\\/](?:0[6-9]|1[01])-[^\\/]+|\.claude[\\/]vac)[\\/][^\\/]+\.md$/u;
// Linha final do relatório do verificador (contrato com o carimbo).
export const VERDICT_RE =
  /VEREDITO:\s*(\d+)\s*suportadas?\s*\/\s*(\d+)\s*n[ãa]o(?:\s*suportadas?)?\s*\/\s*(\d+)\s*n[ãa]o\s*verific[áa]ve(?:l|is)[^\n]*?alvo=(\S+)\s+sha256=([0-9a-f]{64}|indispon[ií]vel)/iu;
// Diretório de evidência declarado no topo de um artefato ("Evidência em `kanban/09-run-test/evidence-x/`").
const EVIDENCE_DIR_RE = /evid[êe]ncias?\s+(?:em|in)\s+`([^`\n]+?)\/?`/giu;
// Cabeçalho de coluna que carrega a prova.
const EVIDENCE_COL_RE = /screenshot|evid[êe]ncia|evidence|prova|print/iu;

// ---------------------------------------------------------------------------
// Texto
// ---------------------------------------------------------------------------

// Linhas fora de blocos de código (templates e saídas coladas não contam).
export function proseLines(text) {
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

export function lineCount(text) {
  const parts = text.split(/\r?\n/);
  return parts.length - (parts.at(-1) === "" ? 1 : 0); // newline final não é linha
}

export function isPlaceholder(p) {
  return /[<>{}*…]/.test(p);
}

// Menção ≠ uso: token entre crases/aspas, ou dentro de "(sem …)", não afirma nada.
export function stripMentions(line) {
  return line
    .replace(/`[^`\n]*`/g, " ")
    .replace(/"[^"\n]{1,80}"|“[^”\n]{1,80}”|'[^'\n]{1,40}'/g, " ")
    .replace(/\((?:sem|n[ãa]o|nunca|zero|falta)\b[^)\n]*\)/giu, " ")
    .replace(/\b(?:nunca|n[ãa]o|sem|jamais|nem)\b[^.;:\n]{0,30}?(?:\bPASSED\b|\bLIBERADO\b|\bAPROVADO\b|\bCONVERGIU\b|\[VERIFICADO\]|✅)/giu, " "); // negação: "nunca é PASSED"
}

const HEADING_RE = /^\s{0,3}#{1,6}\s+(.*?)\s*#*\s*$/;
const BOLD_LINE_RE = /^\s*\*\*([^*\n]{3,80})\*\*:?\s*$/;
const TABLE_ROW_RE = /^\s*\|.*\|\s*$/;
const TABLE_SEP_RE = /^\s*\|?\s*:?-{3,}/;

export function tableCells(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

// Seções por heading (ou linha só-negrito). Cada linha sabe se é linha de tabela e qual é o cabeçalho.
export function sections(text) {
  const out = [];
  let cur = { heading: "", headingLine: 0, lines: [] };
  let header = null;
  for (const item of proseLines(text)) {
    const h = item.line.match(HEADING_RE) || item.line.match(BOLD_LINE_RE);
    if (h) {
      if (cur.lines.length || cur.heading) out.push(cur);
      cur = { heading: h[1].trim(), headingLine: item.n, lines: [] };
      header = null;
      continue;
    }
    if (TABLE_ROW_RE.test(item.line)) {
      if (TABLE_SEP_RE.test(item.line)) continue;
      if (TABLE_ROW_RE.test(item.next) && TABLE_SEP_RE.test(item.next)) {
        header = tableCells(item.line);
        continue;
      }
      cur.lines.push({ ...item, table: true, header });
      continue;
    }
    header = null;
    cur.lines.push(item);
  }
  if (cur.lines.length || cur.heading) out.push(cur);
  for (const s of out) s.text = [s.heading, ...s.lines.map((l) => l.line)].join("\n");
  return out;
}

// ---------------------------------------------------------------------------
// Disco
// ---------------------------------------------------------------------------

export function expandHome(p) {
  return p.startsWith("~/") ? path.join(os.homedir(), p.slice(2)) : p;
}

function isFile(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function gitTop(dir) {
  try {
    return execFileSync("git", ["-C", dir, "rev-parse", "--show-toplevel"], {
      encoding: "utf8",
      timeout: 3000,
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return undefined;
  }
}

export function projectRoots(input = {}) {
  const roots = [process.env.CLAUDE_PROJECT_DIR, input.cwd, process.cwd()].filter(Boolean).map((r) => path.resolve(r));
  const tops = roots.map(gitTop).filter(Boolean);
  return [...new Set([...roots, ...tops])];
}

// Índice de arquivos do repositório (rastreados + não ignorados), memoizado por processo.
const INDEX = new Map();
export function fileIndex(root) {
  if (INDEX.has(root)) return INDEX.get(root);
  let list = [];
  try {
    list = execFileSync("git", ["-C", root, "ls-files", "-z", "--cached", "--others", "--exclude-standard"], {
      encoding: "utf8",
      timeout: 5000,
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .split("\0")
      .filter(Boolean);
  } catch {
    /* sem git: sem índice */
  }
  INDEX.set(root, list);
  return list;
}

// Resolve um path citado: direto → sufixo único no índice → dirs de evidência (basename solto).
// Devolve { abs, how } | { ambiguous: [...] } | {}.
export function resolveFile(p, roots, { evidenceDirs = [] } = {}) {
  const home = expandHome(p);
  const direct = path.isAbsolute(home) ? [home] : roots.flatMap((r) => [path.join(r, p), ...evidenceDirs.map((d) => path.join(r, d, p))]);
  const hit = direct.find(isFile);
  if (hit) return { abs: hit, how: "direto" };
  if (path.isAbsolute(home)) return {}; // absoluto inexistente: não adivinha
  const tail = p.replace(/^(?:\.{1,2}\/)+/, "");
  const bare = !tail.includes("/");
  if (bare)
    for (const r of roots)
      for (const d of [...evidenceDirs, ".playwright-mcp"]) {
        const c = path.join(r, d, tail);
        if (isFile(c)) return { abs: c, how: "evidência" };
      }
  for (const r of roots) {
    const hits = fileIndex(r).filter((f) => f === tail || f.endsWith("/" + tail));
    if (hits.length === 1) return { abs: path.join(r, hits[0]), how: "sufixo" };
    if (hits.length > 1) return { ambiguous: hits.slice(0, 3).map((h) => path.join(r, h)), total: hits.length, bare };
  }
  return {};
}

export function sha256File(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

// Dirs de evidência que um artefato declara ("Evidência em `dir/`") + o próprio dir + subpastas evidence*.
export function evidenceDirsFor(text, artifactAbs, roots) {
  const dirs = [];
  for (const m of text.matchAll(EVIDENCE_DIR_RE)) dirs.push(m[1]);
  if (artifactAbs) {
    const dir = path.dirname(artifactAbs);
    const root = roots.find((r) => dir.startsWith(r));
    const rel = root ? path.relative(root, dir) : dir;
    dirs.push(rel);
    try {
      for (const d of fs.readdirSync(dir, { withFileTypes: true }))
        if (d.isDirectory() && /^evid/i.test(d.name)) dirs.push(path.join(rel, d.name));
    } catch {
      /* sem dir */
    }
  }
  return [...new Set(dirs)];
}

// ---------------------------------------------------------------------------
// Gates (scripts/gates.json — o mapa dos gates das outras skills)
// ---------------------------------------------------------------------------

let GATES;
export function loadGates(file = path.join(HERE, "gates.json")) {
  if (GATES && !arguments.length) return GATES;
  const raw = JSON.parse(fs.readFileSync(file, "utf8"));
  const gates = raw.gates.map((g) => ({
    ...g,
    re: new RegExp(g.match, "iu"),
    releaseRe: g.release ? new RegExp(`\\b${g.release}\\b`, "u") : null,
    stampWhenRe: g.stampWhen ? new RegExp(g.stampWhen, "iu") : null,
    artifactFromTextRe: g.artifactFromText ? new RegExp(g.artifactFromText, "u") : null,
  }));
  if (!arguments.length) GATES = gates;
  return gates;
}

// Qual gate (se algum) torna a seção "de gate".
export function gateOf(sec, gates) {
  for (const g of gates) {
    if (g.where === "heading" && sec.heading && g.re.test(stripMentions(sec.heading))) return g;
    if (g.where === "line" && sec.lines.some((l) => g.re.test(stripMentions(l.line)))) return g;
  }
  if (sec.lines.some((l) => VERDICT_LINE_RE.test(l.line))) return { id: "veredicto", label: "Veredicto" };
  return null;
}

// ---------------------------------------------------------------------------
// Regras → itens { rule, severity, text, detail }
// ---------------------------------------------------------------------------

function item(rule, severity, text, detail, where) {
  return { rule, severity, text, detail, where };
}

// Coordenada negada não afirma existência: "[AUSENTE] lib/x.ts:3", "lib/nope.ts:3 não existe", "não posso citar lib/nope.ts:3".
const NEGATED_COORD_RE = /\b(?:n[ãa]o|nunca|jamais|sem)\b[^\n]{0,40}\b(?:existe|existem|inexistente|encontr\w*|citar|resolve|aponta)|\b(?:inexistente|n[ãa]o existe|n[ãa]o existem|n[ãa]o encontr\w*)\b/iu;

// (a) coordenadas arquivo:linha que não resolvem
export function invalidCoords(text, roots, opts = {}) {
  const items = [];
  const seen = new Set();
  for (const { line } of proseLines(text)) {
    const negated = ABSTAIN_RE.test(line) || NEGATED_COORD_RE.test(line);
    const clean = line.replace(/https?:\/\/\S+/g, "").replace(/(?:…|\.{3,})\/?/g, " "); // URL não é coordenada; "…/" é abreviação
    for (const m of clean.matchAll(COORD_RE)) {
      const [, file, start] = m;
      const key = `${file}:${start}`;
      if (seen.has(key) || isPlaceholder(file)) continue;
      seen.add(key);
      const r = resolveFile(file, roots, opts);
      if (r.ambiguous) {
        const cands = r.ambiguous.map((a) => path.basename(path.dirname(a)) + "/" + path.basename(a)).join(", ");
        // basename solto (SKILL.md:14) com vários candidatos não serve a ninguém: bloqueia; path parcial ambíguo só anota
        items.push(item(r.bare ? "coord" : "coord-ambiguous", r.bare ? "block" : "note", key, `ambíguo — ${r.total} arquivos com esse nome (${cands}…); cite o path completo`));
        continue;
      }
      if (!r.abs) {
        items.push(negated ? item("coord-negated", "note", key, "coordenada negada/ausente — não afirma existência") : item("coord", "block", key, "arquivo não existe"));
        continue;
      }
      if (fs.statSync(r.abs).size > 2_000_000) continue; // arquivo enorme: não conta linhas
      const total = lineCount(fs.readFileSync(r.abs, "utf8"));
      if (Number(start) > total) items.push(negated ? item("coord-negated", "note", key, `linha além do arquivo (${total}), em contexto negado`) : item("coord", "block", key, `arquivo tem ${total} linhas`));
      else if (r.how === "sufixo") items.push(item("coord-suffix", "note", key, `resolvido por sufixo → ${r.abs}`));
    }
  }
  return items;
}

// (b) ponteiros screenshot:/evidência:/— ✅ (x.png) e células de coluna de prova que apontam para arquivo inexistente
export function deadPointers(text, roots, opts = {}) {
  const items = [];
  const seen = new Set();
  const check = (p, label) => {
    if (!p || isPlaceholder(p) || seen.has(p)) return;
    seen.add(p);
    if (!resolveFile(p, roots, opts).abs) items.push(item("pointer", "block", label, "arquivo não existe"));
  };
  for (const sec of sections(text)) {
    for (const l of sec.lines) {
      for (const m of l.line.matchAll(POINTER_RE)) check(m[1] || m[2], m[0].trim());
      if (l.table && l.header) {
        const cells = tableCells(l.line);
        l.header.forEach((h, i) => {
          if (!EVIDENCE_COL_RE.test(h) || !cells[i]) return;
          for (const f of cells[i].matchAll(new RegExp(`[\\w@./~-]+\\.(?:${EVID_EXT})\\b`, "giu"))) check(f[0], `${h}: ${f[0]}`);
        });
      }
    }
  }
  return items;
}

function hasEvidence(l) {
  return EVIDENCE_RE.test(l.line) || /^\s*```/.test(l.next);
}

// (c) claims sem evidência — só em seção de gate (ou artefato inteiro)
export function unbackedClaims(text, { gates, mode = "stop" } = {}) {
  const items = [];
  gates = gates || loadGates();
  for (const sec of sections(text)) {
    const gate = mode === "artifact" ? gateOf(sec, gates) || { id: "artefato", soft: true } : gateOf(sec, gates);
    if (!gate) continue;
    const bodyEvidence = sec.lines.some(hasEvidence);
    // heading que afirma (## TC-1 … ✅ PASSED) — a evidência pode estar em qualquer linha da seção
    // seção narrativa de artefato: só token de veredito em linha estrutural (item, tabela, heading) bloqueia; prosa anota
    const structural = (line) => /^\s*(?:[-*+]|\d+[.)]|\||#)/.test(line);
    const sev = (txt, line = "-") => (gate.soft && (!STRONG_RE.test(txt) || !structural(line)) ? "note" : "block");
    if (sec.heading && CLAIM_RE.test(stripMentions(sec.heading)) && !ABSTAIN_RE.test(sec.heading) && !EVIDENCE_RE.test(sec.heading) && !bodyEvidence)
      items.push(item("claim", sev(stripMentions(sec.heading)), sec.heading.slice(0, 140), "heading afirma e a seção não traz evidência"));
    for (const l of sec.lines) {
      const s = stripMentions(l.line);
      const isClaim = (c) => CLAIM_RE.test(c) || (!gate.soft && CLAIM_GATE_RE.test(c));
      if (!isClaim(s)) continue;
      if (SUMMARY_RE.test(l.line) || ABSTAIN_RE.test(l.line)) continue;
      if (l.table && l.header) {
        const cells = tableCells(l.line);
        const evidIdx = l.header.findIndex((h) => EVIDENCE_COL_RE.test(h));
        if (evidIdx >= 0) {
          if (!cells[evidIdx]) items.push(item("claim", "block", l.line.trim().slice(0, 140), `coluna "${l.header[evidIdx]}" vazia`));
          continue; // preenchida: o ponteiro é conferido em deadPointers
        }
        if (EVIDENCE_RE.test(l.line)) continue; // qualquer célula com evidência
        const claimIdx = cells.findIndex((c) => isClaim(stripMentions(c)));
        const bare = /^\s*(?:✅|✓|PASSED|APROVADO|LIBERADO)\s*(?:sim|ok|yes|passed)?\s*$/iu.test(cells[claimIdx] || "");
        const others = cells.filter((c, i) => c && i > 0 && i !== claimIdx);
        if (bare && !others.length) items.push(item("claim", sev(s, l.line), l.line.trim().slice(0, 140), "linha de tabela com ✅ e sem célula de evidência"));
        else items.push(item("claim-prose-evidence", "note", l.line.trim().slice(0, 140), "evidência em prosa — coordenada ou comando faria a linha VERIFICADO"));
        continue;
      }
      if (l.table && !l.header) continue; // tabela sem cabeçalho legível: não opina
      if (hasEvidence(l)) continue;
      items.push(item("claim", sev(s, l.line), l.line.trim().slice(0, 140), undefined, (sec.heading || gate.label || gate.id).slice(0, 60)));
    }
  }
  return items;
}

// Tudo junto. ctx = { roots, mode: stop|artifact|agent, gates?, evidenceDirs?, artifactAbs? }
export function analyze(text, ctx) {
  const roots = ctx.roots || projectRoots();
  const gates = ctx.gates || loadGates();
  const evidenceDirs = ctx.evidenceDirs || evidenceDirsFor(text, ctx.artifactAbs, roots);
  const opts = { evidenceDirs };
  return [
    ...invalidCoords(text, roots, opts),
    ...deadPointers(text, roots, opts),
    ...unbackedClaims(text, { gates, mode: ctx.mode || "stop" }),
  ];
}

// Como um item vira linha de bloqueio (mesma redação que os testes conhecem).
export function describe(it, mode = "stop") {
  const ctx = mode === "artifact" ? "" : " em contexto de gate";
  switch (it.rule) {
    case "coord":
      return `coordenada não resolve: ${it.text} — ${it.detail}`;
    case "pointer":
      return `evidência apontada não existe: ${it.text} — ${it.detail}`;
    case "claim":
      return `claim sem evidência${ctx}: "${it.text}"${it.detail ? ` — ${it.detail}` : ""}`;
    default:
      return `${it.rule}: ${it.text}${it.detail ? ` — ${it.detail}` : ""}`;
  }
}

export function gateSections(text, gates = loadGates()) {
  return sections(text)
    .map((sec) => ({ sec, gate: gateOf(sec, gates) }))
    .filter((x) => x.gate && x.gate.stamp);
}
