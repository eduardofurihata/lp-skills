// vac-cobertura.mjs — a entrega corresponde ao que foi prometido.
//
// O /vac governa a PROCEDÊNCIA da saída (toda afirmação tem lastro) e, em vac-pedido.mjs, a ENTRADA.
// Este módulo olha a terceira face: COBERTURA. Completude é uma afirmação implícita — toda entrega
// afirma "isto é tudo", e é a única afirmação que ninguém cobrava. Item não entregue e não declarado
// é um [AUSENTE] / [INDISPONÍVEL] que o modelo calou: abster não bloqueia, calar a omissão inventa
// completude. Nenhum vocabulário novo, então — são os mesmos quatro estados de estados.md.
//
// E nenhum pipeline novo: o denominador JÁ está escrito no disco pelo próprio protocolo —
// `Predicted: N` / `Evidence collected: M` / `Delta: D` (193 artefatos nos repos) e o checkbox `- [ ]`
// do card que já fechou. Faltava a conta. É contagem contra contagem, a única classe de regra que o
// /vac já provou acertar (audit-counts, vac-ledger.mjs:428).
//
// O `Ratio X == Y?` do Audit Pré (method/references/09-testing.md:146) foi TENTADO e descartado: a
// regra não sabe quais duas das três contagens do bloco o Ratio compara, e o único disparo em 6.581
// artefatos era falso positivo. O `audit-counts` já confere esse bloco contra o transcript.
//
// Fase 1 é INSTRUMENTAÇÃO: toda regra nasce `severity: "note"` — pedido.md:63, "promover note → block
// sem golden set é repetir o erro que o /vac existe para corrigir". Zero LLM, zero transcript: o
// denominador e o numerador estão na mesma string.

import { ABSTAIN_RE, EVIDENCE_RE, proseLines, stripMentions } from "./vac-rules.mjs";

// --- vocabulário ------------------------------------------------------------

// Os rótulos, medidos no corpus (200 "Predicted:", 90 "Evidence collected:", 99 "Delta:", e as
// variantes em português). `**` opcional porque metade das ocorrências vem em negrito.
const B = "\\*{0,2}";
const PREVISTO_RE = new RegExp(`${B}(?:Predicted|Previst[oa]s?)${B}\\s*:\\s*${B}\\s*(\\d+)`, "giu");
const COLETADO_RE = new RegExp(`${B}(?:Evidence\\s+collected|Evid[êe]ncias?\\s+coletadas?)${B}\\s*:\\s*${B}\\s*(\\d+)`, "giu");
const DELTA_RE = new RegExp(`${B}Delta${B}\\s*:\\s*${B}\\s*(-?\\d+)`, "giu");

// Checkbox não marcado.
const ABERTO_RE = /^\s*[-*+]\s*\[ \]\s*(.*)$/u;
// Estado declarado na linha de um item aberto. ABSTAIN_RE é o vocabulário do /vac; o resto é o
// vocabulário que as outras skills já usam para a mesma coisa (estados.md § Mapa) — superposição,
// nunca substituição. Sem isto, `- [ ] TC-4: status skipped — env-blocked` seria punido, e ele é
// exatamente o comportamento que o /vac premia. Os marcadores foram LIDOS dos 890 cards fechados
// dos repos, não imaginados: o time declara com "NÃO RODADO", "❌ FAIL", "⏳ pendente (env+restart)",
// "⚠️ PARCIAL" — o primeiro rascunho desta lista deixava 25 desses passar por mudos.
// A QUALIDADE da abstenção ("INDISPONÍVEL sem tentativa nomeada não existe", estados.md:18) é do
// verificador, camada semântica — aqui a régua é só: declarou alguma coisa, ou calou.
const DECLARADO_RE = new RegExp(
  [
    "❌|⏳|⚠️|🚧",
    "\\b(?:FAIL(?:ED|OU)?|NOT_RUN|N/A|skipped|blocked|env-blocked|TODO|WIP)\\b",
    "\\bn[ãa]o\\s+(?:rodad|executad|test[áa]v|aplicad|feit|implementad|verificad|alcanç)\\w*",
    "\\b(?:pendente|parcial|bloquead[oa]|adiad[oa]|descartad[oa]|aguarda\\w*|falta\\w*|posterga\\w*)\\b",
    "\\bfora do escopo\\b|\\bn[ãa]o se aplica\\b|\\bbalde [BC]\\b",
  ].join("|"),
  "iu",
);

// Elisão: os marcadores de "entreguei a forma, cortei o conteúdo". A lista é literal e ESTREITA por
// medição: o primeiro rascunho aceitava `resto d[oa]` e `demais casos` e deu 30 falsos positivos em
// 30 no labzz-afl — "o resto da plataforma", "resto do épico", "nos demais casos" são uso normal da
// palavra. Só sobra o que não tem segunda leitura: a elisão precisa dizer que algo foi SUBSTITUÍDO.
const ELISAO_RE =
  /(?:(?:o\s+)?resto (?:[ée]|fica|segue|seria)?\s*(?:igual|idem|an[áa]logo|o mesmo)|demais (?:itens|arquivos|linhas|campos|m[ée]todos) (?:s[ãa]o|seguem|ficam|idem|an[áa]logos)|e assim por diante|an[áa]log[oa] para os demais|(?:omitid|abreviad|cortad|suprimid)[oa]s? por brevidade|(?:\/\/|#|<!--)\s*(?:\.\.\.|…)\s*(?:resto|restante|demais|continua|idem))/iu;
// Negação e divulgação honesta não são elisão: "nenhum ficou pendente", "nada foi omitido".
const NEGADO_RE = /\b(?:nenhum|nada|zero|sem|n[ãa]o|nunca|jamais)\b[^.;:\n]{0,40}$/iu;

// `phase: "instrumentacao"` é o que diz ao hook para guardar o corpo no log: sem o corpo, o
// `/vac caso --kind note` gera um sample vazio e a fase 1 não tem como virar golden set.
function nota(rule, text, detail) {
  return { rule, severity: "note", phase: "instrumentacao", text, detail };
}

// --- C1 · a conta declarada tem de fechar -----------------------------------

// Cada `Predicted` abre um bloco e consome o `Evidence collected` e o `Delta` que vierem antes do
// próximo `Predicted` — assim uma feature em duas fases, com dois blocos, é conferida duas vezes, e
// um `## Predição` separado do `## Reconciliação` (353 e 262 ocorrências) continua sendo um bloco só.
function blocosDeclarados(texto) {
  const at = (re) => [...texto.matchAll(re)].map((m) => ({ i: m.index, n: Number(m[1]), raw: m[0] }));
  const previstos = at(PREVISTO_RE);
  const coletados = at(COLETADO_RE);
  const deltas = at(DELTA_RE);
  const proximo = (lista, de, ate) => lista.find((x) => x.i > de && (ate === undefined || x.i < ate));
  return previstos.map((p, k) => {
    const fim = previstos[k + 1]?.i;
    return { previsto: p, coletado: proximo(coletados, p.i, fim), delta: proximo(deltas, p.i, fim) };
  });
}

export function contaDeclarada(texto) {
  const items = [];
  for (const { previsto, coletado, delta } of blocosDeclarados(texto)) {
    if (!coletado) continue; // só `Predicted` não afirma cobertura nenhuma
    const N = previsto.n;
    const M = coletado.n;
    if (delta) {
      // A conta fechando JÁ É a declaração honesta: `Predicted: 10 · Evidence: 8 · Delta: 2` diz o
      // que faltou. O que não pode é `Delta: 0` com 10 − 8.
      if (delta.n === N - M) continue;
      items.push(
        nota(
          "cobertura-delta",
          `Delta: ${delta.n} (Predicted ${N} − Evidence ${M} = ${N - M})`,
          M < N
            ? `a conta não fecha e ${N - M} item(ns) ficaram sem evidência — declare o Delta real ou o estado de cada um`
            : "a conta não fecha — corrija o Delta declarado",
        ),
      );
      continue;
    }
    if (M < N)
      items.push(
        nota(
          "cobertura-faltando",
          `Predicted ${N} · Evidence collected ${M}`,
          `${N - M} item(ns) previsto(s) sem evidência e sem Delta declarado — diga quais e com que estado`,
        ),
      );
  }
  return items;
}

// --- C2 · checkbox aberto e mudo em artefato que fecha -----------------------

// Um `- [ ]` num plano em andamento é o normal — é trabalho a fazer. O que a regra pega é o item
// aberto e MUDO num card que JÁ FECHOU: ninguém saberia que ele ficou de fora.
//
// O gate aqui é POSICIONAL — a pasta (`kanban/10-done/`, `11-ship/`) —, não o texto. Medido: o
// heading de gate com release não alcança um só checkbox em 2.578 seções do corpus, porque checkbox
// mora em seção narrativa; e grep solto de "APROVADO" pega linha de ponteiro ("Review: x.md
// (APROVADO)"), que não fecha coisa nenhuma. A pasta é o único sinal de fechamento que não mente.
export const CARD_FECHADO_RE = /[\\/](?:kanban|docs)[\\/](?:10-done|11-ship)[\\/][^\\/]+\.md$/u;

export function checkboxMudo(texto) {
  const items = [];
  for (const { line } of proseLines(texto)) {
    const m = line.match(ABERTO_RE);
    if (!m) continue;
    const corpo = m[1];
    if (!corpo.trim()) continue; // checkbox de template, sem item
    if (ABSTAIN_RE.test(corpo) || DECLARADO_RE.test(corpo) || EVIDENCE_RE.test(corpo)) continue;
    items.push(
      nota(
        "cobertura-checkbox",
        `- [ ] ${corpo.trim().slice(0, 100)}`,
        "item aberto e sem estado num card que já fechou — marque, ou declare [AUSENTE]/[INDISPONÍVEL] com o motivo",
      ),
    );
  }
  return items;
}

// --- C3 · elisão ------------------------------------------------------------
// Exportada para scripts/mine.mjs classificar sobre os repos reais. NÃO ligada no hook: a medição
// vem antes da regra (taxonomia.md § ordem de custo-benefício).
export function elisao(texto) {
  const items = [];
  for (const { line } of proseLines(texto)) {
    if (/^\s*\|/.test(line)) continue; // célula de tabela: compressão legítima ("idem", "—")
    const limpo = stripMentions(line);
    const m = limpo.match(ELISAO_RE);
    if (!m) continue;
    const antes = limpo.slice(0, m.index);
    if (NEGADO_RE.test(antes)) continue; // "nenhum ficou pendente", "nada foi omitido"
    items.push(nota("cobertura-elisao", line.trim().slice(0, 120), `marcador de conteúdo elidido ("${m[0]}") — escreva o item ou declare o estado dele`));
  }
  return items;
}

// --- motor ------------------------------------------------------------------

/**
 * A entrega corresponde ao que foi prometido? Só disco e string — nada de transcript, nada de sessão.
 * @param {string} text  artefato ou resposta final
 * @param {{artifactAbs?: string}} ctx  artifactAbs: o card que o PostToolUse gravou
 * @returns {Array<{rule: string, severity: string, text: string, detail: string}>}
 */
export function cobertura(text, { artifactAbs } = {}) {
  if (!text || !text.trim()) return [];
  const items = [...contaDeclarada(text)];
  if (artifactAbs && CARD_FECHADO_RE.test(artifactAbs)) items.push(...checkboxMudo(text));
  return items;
}
