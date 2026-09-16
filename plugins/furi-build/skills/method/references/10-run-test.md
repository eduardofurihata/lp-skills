# Step 10 — Run Test

**FRONT É FRONT.** Cada TC roda como usuário real — abrir, navegar, clicar, preencher — com evidência. Código, tsc e "a tela carregou" **não** são teste.

**Chame e use:** `/solve` · `/principles` · `/front` (se tem UI) — os três via Skill tool · `11-follow-ups.md`

## Artefato

`kanban/10-run-test/<tópico>.md` — nome por domínio (`00-start.md`). Evidência por TC (path do screenshot ou motivo do FAILED) e `## Test Environment Setup` (o que criou, qual `pw#`).

## Antes de rodar

- **Pre-flight.** Liste TODOS os TCs (feature + regressão) e classifique: READY · NEEDS SETUP (você desbloqueia) · BLOCKED. Publique a contagem; BLOCKED > 0 → pare e pergunte **antes** de rodar qualquer TC.
- **Crie as condições** — ambiente local, poder total: usuário, dado, estado, flag, via front, DB ou API. "Não tenho as condições" nunca é desculpa.
- **Duas camadas de tasks** — uma por grupo (~10 TCs) **e uma por TC** — e o **Audit Pré-Execução** no chat: N TCs · M tasks individuais · M == N?. Sem ✅ visível, nenhum TC roda.

## Loop

1. tsc/lint; depois cada TC **do zero**, pela ferramenta do contexto: web = MCP Playwright (`mcp__playwright-4__*`; ocupado → próximo índice livre, fixado na rodada) · Android = emulador · iOS = simulador ou device · API = chamada real. **Mobile = Android E iOS, sempre.**
2. PASSED (resultado esperado + screenshot com path) ou FAILED — sem meio-termo. Atualize o `## Test Cases (QA)` do card.
3. Bug → **A**: corrige agora, **reseta o checklist**, volta ao Step 9 e retesta TUDO; **B/C**: ledger.
4. Todos PASSED sem mudança de código → Audit Pós → Gateway.

**Workaround que faz o TC passar é FAILED disfarçado.** O fix vai **para o motor**, nunca de remendo no chamador, e reabre o perímetro. Com UI, remendo de CSS é o mesmo caso — e a evidência é por **estado × breakpoint** (piso 320px), não só o happy path em desktop.

## Integridade

- **Predição → reconciliação:** "vou rodar N e produzir N evidências"; no fim, TC sem evidência = **NOT_RUN** — nunca "coberto por".
- **Report binário:** a primeira frase é `X de N PASSED via front. Y NOT_RUN. Z FAILED. Net: PASS|FAIL|INCOMPLETE.` — nunca "mostly".
- **Disclosure ≠ compliance:** dizer "não rodei X" não libera marcar PASSED. Pragmatismo muda o **como**, nunca o **quanto**.

## Audit Pós-Execução — antes do gateway

No chat: tasks N · `completed` C · evidências E · C == N e E == N? · N PASSED, 0 FAILED / NOT_RUN / BLOCKED · último ciclo sem mudança? ❌ = proibido publicar gateway ou resumo.

## PARE se pensar
"verifiquei no código, marco PASSED" · "TC parecido já passou, esse herda" · "BLOCKED, não consigo acessar" · "tiro o screenshot depois" · "no iOS funciona igual"

## Gateway 10 → 11

- [ ] **Audit Pré** e **Audit Pós** publicados ✅ (M == N · C == N · E == N)
- [ ] N PASSED via front com screenshot, 0 FAILED / NOT_RUN / BLOCKED; último ciclo sem mudança
- [ ] Mobile: Android E iOS (ou N/A derivado no Step 4); UI: estado × breakpoint
- [ ] Nenhum TC passou por workaround — fix foi ao motor e voltou pelo Step 9
- [ ] Follow-ups no ledger (balde B bloqueia o Step 11, não este)
- [ ] As **quatro linhas obrigatórias** publicadas (`SKILL.md` § Gateway Check)
