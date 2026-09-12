# Gates — o que o hook reconhece nas outras skills (leitura humana de `scripts/gates.json`)

> **O contrato é o JSON; esta página é a explicação.** `scripts/gates.json` é lido por `vac-rules.mjs` (regex compiladas com `iu`); aqui cada `id` aparece entre crases e o teste `vac-consistency.test.mjs` confere que os dois lados batem. Superposição: nenhuma skill mudou — o `/vac` aprendeu onde cada uma publica seu gate.

## Como uma seção vira "de gate"

Uma mensagem (ou artefato) é cortada em seções por heading (`#`) ou linha só-negrito. A seção é de gate quando o heading casa um gate `where: heading`, quando alguma linha casa um gate `where: line`, ou quando existe uma linha `Veredicto:`/`Veredicto Final:`. Fora de seção de gate, claim sem evidência não bloqueia (a régua é do modelo); em artefato de processo (`docs/01-05-*/`, `kanban/06-11-*/`, `.claude/vac/`) as seções sem gate são "narrativas": só os tokens de veredito (`PASSED`, `LIBERADO`, `APROVADO`, `CONVERGIU`, `[VERIFICADO]`) em linha estrutural (item, tabela, heading) bloqueiam; `✅` solto e prosa só anotam no log.

`release` é a palavra que fecha o gate — sem ela na seção, nada a cobrar. `stamp` diz o que o fechamento exige: `verifier` = carimbo do verificador no artefato daquele gate (`artifactDir`, ou o path capturado por `artifactFromText`); `session` = o próprio bloco verificado nesta sessão (`/vac última`); `null` = só claims. `ledger` lista as regras do transcript (`vac-ledger.mjs`) que a seção liga.

## Tabela

| id | skill · fonte | where · match | release | stamp | ledger |
|---|---|---|---|---|---|
| `method-step` | /method · `gateways.md:22-33` | heading `Gateway Check — Step N → N+1` (1→2 … 7b→8) | LIBERADO | — | coord-not-read, skill-not-invoked |
| `method-8-9` | /method · `gateways.md:55` | heading `Gateway Check — Step 8 → 9` | LIBERADO | verifier → `kanban/08-code-review` | skill-not-invoked (`blind.sh review`) |
| `method-9-10` | /method · `gateways.md:59-100` | heading `Gateway Check — Step 9 → 10` | LIBERADO | verifier → `kanban/09-run-test` | audit-counts, heading-not-published |
| `method-8b-veredicto` | /method · `08-code-review.md:172-175` | heading `Veredicto Final` | APROVADO | — | — |
| `method-audit-pre` | /method · /todo · `09-testing.md:137-151` | heading `Audit Pré-Execução` | LIBERADO | — | audit-counts |
| `method-audit-pos` | /method · /todo · `09-testing.md:250-273` | heading `Audit Pós-Execução` | LIBERADO | verifier → `kanban/09-run-test` quando libera para Phase 4/Done (é o 9→10 do /todo) | audit-completed |
| `method-convergencia` | /method · /todo · `10-done.md:48-59` | heading `Gate de Convergência` | CONVERGIU | — | — |
| `method-checklist-final` | /method · `10-done.md:110-121` | heading `Checklist Final` | — | — | commit-claimed |
| `fast-close` | /fast · `fast/SKILL.md:76-85` | line `Code Review: APROVADO (` | APROVADO | verifier → path citado entre parênteses | skill-not-invoked |
| `todo-close` | /todo · `todo/SKILL.md:503-508` | line `QA completo` | PASSED | verifier → `kanban/09-run-test` | audit-completed |
| `homolog-close` | /homolog · `homolog/SKILL.md:81-95` | heading `/homolog — homolog no ar` | — | session (`/vac última`) | smoke-no-nav, run-not-watched, pr-not-created, skill-not-invoked |
| `prod-close` | /prod · `prod/SKILL.md:88-100` | heading `/prod — produção no ar` | — | session (`/vac última`) | smoke-no-nav, run-not-watched |
| `work-close` | /work · `work/SKILL.md:83-93` | heading `/work <obj> — commitado localmente` | — | — | skill-not-invoked |
| `pull-request-close` | /pull-request · `pull-request/SKILL.md:78-86` | heading `PR aberto` / `PR atualizado` / `Publicado sem PR` | — | — | pr-not-created |
| `proof-report` | /proof · `proof/SKILL.md:287-330` | line `Relatório do /proof` | — | — | — |
| `blind-result` | /blind · `blind.sh:152-154` | line `- RESULTADO:` | — | — | skill-not-invoked (`blind.sh`) |
| `verifier-report` | /vac · `verificador.md:33-47` | heading `Verificação —` | — | — | — |
| `tc-heading` | /method · /todo · `09-testing.md:299-341` | heading `TC-N … PASSED\|FAILED\|NOT_RUN` | — | — | — |

## Como acrescentar um gate

1. Uma entrada em `scripts/gates.json` (`id`, `skill`, `source` como `arquivo:linha`, `where`, `match`, `release`, `stamp`, `artifactDir`/`artifactFromText`, `ledger`).
2. Uma linha nesta tabela com o mesmo `id` entre crases.
3. Um sample em `scripts/samples/` com a mensagem real daquele gate (`expect: block` sem evidência, `expect: pass` com).
4. `pnpm test:vac`.
