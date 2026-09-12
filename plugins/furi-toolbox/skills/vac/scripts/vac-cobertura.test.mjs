// vac-cobertura.test.mjs — o golden set do motor de cobertura. Os casos com `origem:` são texto
// literal de artefato real dos repos: é o que separa regra medida de regra imaginada.
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkboxMudo, cobertura, contaDeclarada, elisao } from "./vac-cobertura.mjs";

const DONE = "/home/x/projeto/kanban/10-done/card.md";
const TODO = "/home/x/projeto/kanban/06-todo/card.md";
const regras = (items) => items.map((i) => i.rule);

// --- C1 · a conta declarada -------------------------------------------------

test("cobertura-delta: Delta: 0 com Evidence > Predicted", () => {
  // origem: labzz-refundzz/kanban/09-run-test/alinhamento-guidelines.md
  const items = contaDeclarada("- Predicted: 10 TCs. Evidence collected: 17. Delta: 0.");
  assert.deepEqual(regras(items), ["cobertura-delta"]);
  assert.match(items[0].text, /Predicted 10 − Evidence 17 = -7/);
});

test("cobertura-delta: Delta: 0 escondendo item faltando", () => {
  // origem: vibe-nivee/kanban/09-run-test/admin-notificacoes-mobile.md
  const items = contaDeclarada("- Predicted: 4. Evidence collected: 3. Delta: 0.");
  assert.deepEqual(regras(items), ["cobertura-delta"]);
  assert.match(items[0].detail, /1 item\(ns\) ficaram sem evid/);
});

test("Delta que FECHA não é bloqueio — declarar o que faltou é o comportamento certo", () => {
  assert.deepEqual(contaDeclarada("- Predicted: 10. Evidence collected: 8. Delta: 2 — TC-6/TC-7 exigem Windows."), []);
});

test("conta certa cala", () => {
  // origem: lp-skills/kanban/09-run-test/plugin-marketplace.md
  assert.deepEqual(contaDeclarada("- Predicted: 10 TCs. Evidence collected: 10 (8 pré-commit + TC-6/TC-9). Delta: 0."), []);
});

test("cobertura-faltando: Evidence < Predicted e nenhum Delta declarado", () => {
  // origem: vibe-antessala/kanban/09-run-test/tecnica-de-venda-ciclo3.md
  const items = contaDeclarada("## Reconciliação\n- Predicted: 6\n- Evidence collected: 5");
  assert.deepEqual(regras(items), ["cobertura-faltando"]);
});

test("Evidence > Predicted sem Delta não é entrega incompleta", () => {
  assert.deepEqual(contaDeclarada("- Predicted: 6\n- Evidence collected: 9"), []);
});

test("Predicted sem Evidence não afirma cobertura nenhuma", () => {
  assert.deepEqual(contaDeclarada("## Predição\n- Predicted: 10 TCs."), []);
});

test("negrito e português — os rótulos como aparecem no corpus", () => {
  assert.deepEqual(regras(contaDeclarada("- **Predicted**: 5 · **Evidence collected**: 2 · **Delta**: 0")), ["cobertura-delta"]);
  assert.deepEqual(regras(contaDeclarada("- Previstos: 4\n- Evidências coletadas: 1")), ["cobertura-faltando"]);
});

test("duas fases = dois blocos, cada um com sua conta", () => {
  const texto = [
    "## Fase 1 — Reconciliação",
    "- Predicted: 9. Evidence collected: 9. Delta: 0.",
    "## Fase 2 — Reconciliação",
    "- Predicted: 5. Evidence collected: 3. Delta: 0.",
  ].join("\n");
  assert.deepEqual(regras(contaDeclarada(texto)), ["cobertura-delta"]);
});

test("`## Predição` e `## Reconciliação` separados continuam sendo um bloco", () => {
  assert.deepEqual(regras(contaDeclarada("## Predição\n- Predicted: 8\n\n## Reconciliação\n- Evidence collected: 6\n- Delta: 0")), ["cobertura-delta"]);
});

// --- C2 · checkbox mudo no card que fechou ----------------------------------

test("cobertura-checkbox: item aberto e mudo em card fechado", () => {
  // origem: labzz-afl/kanban/10-done/notion-content-dropdown.md:4
  const items = cobertura("## Plano\n- [ ] Import `RefreshCw`.\n- [x] Botão Recarregar.", { artifactAbs: DONE });
  assert.deepEqual(regras(items), ["cobertura-checkbox"]);
});

test("item aberto COM estado declarado passa — em todo o vocabulário do time", () => {
  // origem: labzz-afl/kanban/10-done/notion-rag.md:25 e irmãos
  const linhas = [
    "- [ ] TC-4: status `skipped` — ⚠️ env-blocked (OpenAI Batch); efeito provado por TC-3",
    "- [ ] TC-4: um site fora do ar — **NÃO RODADO via front**",
    "- [ ] TC-6: Paginação — ❌ FAIL (HTTP 422 no start_cursor)",
    "- [ ] TC-4 — timeout fail-fast — ⏳ pendente (env+restart)",
    "- [ ] TC-9 — ⚠️ **PARCIAL**",
    "- [ ] Rodar no iOS — [INDISPONÍVEL] sem simulador nesta máquina",
    "- [ ] Follow-up — balde B",
  ];
  for (const l of linhas) assert.deepEqual(checkboxMudo(l), [], `deveria passar: ${l}`);
});

test("checkbox só é cobrado em card que FECHOU (a pasta é o gate)", () => {
  assert.deepEqual(cobertura("- [ ] Import `RefreshCw`.", { artifactAbs: TODO }), []);
  assert.deepEqual(cobertura("- [ ] Import `RefreshCw`.", {}), []);
});

test("checkbox dentro de bloco de código é template, não item", () => {
  assert.deepEqual(cobertura("```markdown\n- [ ] Import RefreshCw\n```", { artifactAbs: DONE }), []);
});

test("checkbox vazio (template) não é item", () => {
  assert.deepEqual(checkboxMudo("- [ ] "), []);
});

// --- C3 · elisão ------------------------------------------------------------

test("cobertura-elisao: marcador de conteúdo cortado", () => {
  assert.deepEqual(regras(elisao("Os outros seguem o resto igual ao primeiro.")), ["cobertura-elisao"]);
  assert.deepEqual(regras(elisao("Os demais itens foram omitidos por brevidade.")), ["cobertura-elisao"]);
});

test("negação e divulgação honesta não são elisão", () => {
  // origem: respostas reais do corpus (104 marcadores em 11.567 mensagens; a maioria é isto)
  assert.deepEqual(elisao("Cada um teve ciclo próprio, e nenhum ficou pendente."), []);
  assert.deepEqual(elisao("Preservar hooks `Stop` e todo o resto."), []);
});

test("célula de tabela e bloco de código não são elisão", () => {
  assert.deepEqual(elisao("| docs/03-use-cases/ | 5 | idem para os outros |"), []);
  assert.deepEqual(elisao("```js\n// ... resto\n```"), []);
});

// --- motor ------------------------------------------------------------------

test("texto vazio não gera item", () => {
  assert.deepEqual(cobertura("", { artifactAbs: DONE }), []);
  assert.deepEqual(cobertura("   \n  ", { artifactAbs: DONE }), []);
});

test("fase 1 é instrumentação: nenhum item nasce block", () => {
  const items = cobertura("- Predicted: 4. Evidence collected: 3. Delta: 0.\n- [ ] Aplicar migration", { artifactAbs: DONE });
  assert.ok(items.length >= 2);
  for (const i of items) assert.equal(i.severity, "note", `${i.rule} nasceu ${i.severity}`);
});
