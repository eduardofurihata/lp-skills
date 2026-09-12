// vac-pedido.mjs — o pedido também tem estado.
//
// O /vac governa a SAÍDA: toda afirmação carrega procedência. Este módulo olha para a ENTRADA,
// porque um pedido é uma afirmação como outra qualquer — afirma que existe um problema, que ele
// tem uma causa e que cabe num escopo. Quando o pedido está vago, truncado ou parte de premissa
// falsa, o modelo preenche o vazio com o plausível e entrega trabalho impecável para a pergunta
// errada: "tem forma de relatório e responde a uma pergunta que ninguém fez" (proof/SKILL.md:117).
//
// Fase 1 é INSTRUMENTAÇÃO: toda regra nasce `severity: "note"`, nada é injetado, nada bloqueia.
// O prompt do usuário nunca se bloqueia — bloquear a resposta do modelo é uma coisa, bloquear
// quem está falando é outra. O que sai daqui vai para o log e vira dado; o que fazer com o dado
// é a decisão seguinte, tomada com ele na mão e não com palpite.
//
// Zero LLM: string + regex + disco, no mesmo orçamento do guard (~2-25 ms).

import { EXT, resolveFile } from "./vac-rules.mjs";

export const MAX_RAW = 4000; // o que guardamos do prompt (log local, nunca sai da máquina)

// --- normalização -----------------------------------------------------------

const FENCE_RE = /```/g;
// Cercas e trechos entre crases não são pedido: são material colado. Fora da análise textual.
function semCodigo(t) {
  return t.replace(/```[\s\S]*?```/g, " ").replace(/`[^`\n]*`/g, " ");
}

const STOP = new Set(
  ("a o e de da do das dos que em no na nos nas um uma uns umas para por com sem sobre como quando onde qual quais " +
    "se ser está estão isso isto esse essa este esta aquele aquela ele ela eu você vc me meu minha mais menos já " +
    "the of to in on and or for is are it this that").split(" "),
);
function tokens(t) {
  return semCodigo(t)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9_/.-]+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function jaccard(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  return inter / (A.size + B.size - inter);
}

export function resumo(t, n = 120) {
  const linha = String(t).trim().split(/\r?\n/).find((l) => l.trim()) || "";
  return linha.length > n ? linha.slice(0, n) + "…" : linha;
}

// --- os sinais --------------------------------------------------------------

const PATH_RE = new RegExp(`(?:^|[\\s"'(\\[<])((?:~/|\\.{0,2}/)?[\\w@.-]+(?:/[\\w@.-]+)*\\.(?:${EXT}))\\b`, "giu");
// Pedir para CRIAR um arquivo que não existe é o normal, não premissa falsa.
const CRIAR_RE = /\b(cri[ae]|criar|nov[oa]|adicion\w*|gera|gerar|escrev\w*|mont\w*|fa[çz]\w*|add|create)\b/iu;
const SLASH_RE = /(?:^|\s)\/([a-z][\w-]*)\b/giu;
const CARD_RE = /\b[A-Z][A-Z0-9]+-\d+\b/u;

const PIPELINE = /^\s*\/(method|fast|work|repro|prod|homolog|card|proto|solve|todo)\b(.*)$/isu;

const DEIXIS_RE = /\b(isso|isto|aquilo|esse|essa|este|esta|aquele|aquela|ele|ela|l[áa]|a[íi]|aqui|dele|dela)\b/iu;

const RETRATACAO_RE =
  /\b(n[ãa]o era isso|n[ãa]o [ée] isso|n[ãa]o foi isso|esquec[ea]\w*|na verdade|quis dizer|queria dizer|me expressei mal|deixa pra l[áa]|volta atr[áa]s|ignora o (?:que|anterior)|refaz|nada disso|pelo contr[áa]rio)\b/iu;

// Território exclusivo de outra skill. Tabela curta e literal de propósito: heurística semântica
// aqui é ruído caro. Cada linha é uma frase que só uma skill deveria atender.
const ANCORAS = [
  [/\babrir? (?:um )?pr\b|\bpull[- ]request\b|\bmanda(?:r)? (?:o )?pr\b/iu, "pull-request"],
  [/\bcommit(?:a|ar|e)\b|\bfaz(?:er)? (?:o )?commit\b/iu, "save"],
  [/\bem produ[çc][ãa]o\b|\bsobe (?:pra|para) prod\b|\bdeploy (?:em|na|pra) prod/iu, "prod"],
  [/\bp[õo]e (?:em|no) homolog\b|\bsobe (?:pra|para) homolog\b/iu, "homolog"],
  [/\bcri[ae]r? (?:um )?card\b|\babrir? (?:um )?card\b/iu, "card"],
  [/\bcode review\b|\brevisa (?:o )?(?:pr|diff|branch)\b/iu, "proof"],
];

function nota(rule, text, detail) {
  return { rule, severity: "note", text, detail };
}

/**
 * Triagem determinística do pedido do usuário.
 * @param {string} prompt  o texto que o usuário enviou
 * @param {{roots?: string[], anterior?: string, skills?: string[]}} ctx
 *   roots    raízes do projeto (vac-rules.projectRoots)
 *   anterior o prompt anterior desta sessão (para detectar reformulação)
 *   skills   slugs de skill conhecidos (headings do mapa .claude/vac/mapa-skills.md)
 * @returns {{sinais: Array, alvos: string[]}}
 */
export function triagem(prompt, { roots = [], anterior, skills = [] } = {}) {
  const texto = String(prompt || "");
  const sinais = [];
  const alvos = [];
  if (!texto.trim()) return { sinais, alvos };

  const limpo = semCodigo(texto);
  const palavras = tokens(texto);

  // S1 · alvo-nao-resolve — arquivo ou skill citada que não existe. É invalidCoords virado para a
  // entrada, e é o que pega PREMISSA FALSA de graça: "arruma o header.tsx" sem header.tsx no disco.
  if (roots.length && !CRIAR_RE.test(limpo)) {
    for (const m of limpo.matchAll(PATH_RE)) {
      const p = m[1];
      if (alvos.includes(p)) continue;
      alvos.push(p);
      const r = resolveFile(p, roots);
      if (!r.abs && !r.ambiguous) sinais.push(nota("alvo-nao-resolve", p, "arquivo citado no pedido não existe nesta árvore"));
    }
  }
  if (skills.length) {
    for (const m of limpo.matchAll(SLASH_RE)) {
      const s = m[1].toLowerCase();
      if (!skills.some((k) => k === s || k.endsWith(`:${s}`)))
        sinais.push(nota("alvo-nao-resolve", `/${s}`, "skill citada no pedido não existe no mapa de skills"));
    }
  }

  // S2 · reformulacao — o sinal mais barato de pedido mal resolvido é o usuário reformular no
  // prompt seguinte. É a métrica, não o defeito: sem ela, calibrar as outras regras é no escuro.
  if (anterior) {
    const antes = tokens(anterior);
    const j = jaccard(palavras, antes);
    if (RETRATACAO_RE.test(limpo)) sinais.push(nota("reformulacao", resumo(texto), "retratação explícita do pedido anterior"));
    else if (j >= 0.45 && palavras.length >= 5 && antes.length >= 5)
      sinais.push(nota("reformulacao", resumo(texto), `reformulação lexical do prompt anterior (jaccard ${j.toFixed(2)})`));
  }

  // S3 · colagem-truncada — cerca de código aberta e nunca fechada: o material chegou pela metade.
  const cercas = (texto.match(FENCE_RE) || []).length;
  if (cercas % 2 === 1) sinais.push(nota("colagem-truncada", resumo(texto), `${cercas} cerca(s) de código — uma ficou aberta`));

  // S4 · pipeline-sem-escopo — o caro não é o token do prompt, é o pipeline que ele dispara.
  const pipe = texto.match(PIPELINE);
  if (pipe) {
    const resto = pipe[2] || "";
    const sig = tokens(resto);
    if (sig.length < 6 && !CARD_RE.test(resto) && !alvos.length)
      sinais.push(nota("pipeline-sem-escopo", `/${pipe[1]} ${resumo(resto, 60)}`.trim(), `${sig.length} palavra(s) de escopo, sem card e sem arquivo`));
  }

  // S5 · deixis-sem-referente — "arruma isso" quando o "isso" morreu com o contexto anterior.
  const brutas = limpo.trim().split(/\s+/).filter(Boolean).length;
  if (brutas <= 12 && DEIXIS_RE.test(limpo) && !alvos.length && !CARD_RE.test(limpo) && !cercas)
    sinais.push(nota("deixis-sem-referente", resumo(texto), "pronome sem alvo nomeado, sem arquivo e sem trecho colado"));

  // S6 · skill-nao-roteada — pediu o que uma skill faz, sem chamá-la.
  for (const [re, slug] of ANCORAS) {
    if (!re.test(limpo)) continue;
    if (new RegExp(`(?:^|\\s)/(?:[\\w-]+:)?${slug}\\b`, "iu").test(texto)) continue;
    sinais.push(nota("skill-nao-roteada", resumo(texto, 60), `território do /${slug}, invocado por ninguém`));
  }

  return { sinais, alvos };
}

// Slugs conhecidos, lidos do mapa que `pnpm map` já gera (headings "## pkg:slug").
export function skillsDoMapa(texto = "") {
  return [...texto.matchAll(/^##\s+([\w-]+:[\w-]+)\s*$/gmu)].map((m) => m[1].toLowerCase());
}
