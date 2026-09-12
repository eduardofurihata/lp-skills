# Motores compartilhados e fronteiras entre skills

Mapa escrito à mão (2026-09-12; motores movidos para `pipeline/references/` na mesma data). Quem inclui quem, onde cada gate é publicado e onde o regime do /vac se perde. Validado por `vac-hook.mjs scan --map`.

## Motores da `pipeline` (sede neutra — lidos por /work, /pull-request, /homolog, /prod e /repro)

- reconcile: a porta única — os quatro alvos declaram até que estágio vão; o loop diagnostica a faixa e fecha os estágios abertos — plugins/furi-ship/skills/pipeline/references/reconcile.md:3 — "**A porta única.** Os quatro alvos — `/work`, `/pull-request`, `/homolog`, `/prod` — declaram **até que estágio** vão e entregam a este loop."
- reconcile: estratificação — nenhum motor invoca skill que declara alvo nem modificador — plugins/furi-ship/skills/pipeline/references/reconcile.md:3 — "**Nenhum motor invoca uma skill que declara alvo**"
- reconcile: o gate de produção é ancorado no estágio, não na entrada — plugins/furi-ship/skills/pipeline/references/reconcile.md:50 — "Autorização explícita **ao chegar** naquele estágio — não na entrada do loop"
- composicao: ordem digitada livre, ordem de execução fixa `repro → card → alvo` — plugins/furi-ship/skills/pipeline/references/composicao.md:17 — "## A ordem de execução é FIXA: `repro` → `card` → alvo"
- deploy-context: fonte única da topologia (`<integração>`/`<produção>` detectados, ambientes, URLs) — plugins/furi-ship/skills/pipeline/references/deploy-context.md:3 — "**Fonte única do contexto de deploy.**"
- branch: fonte única da mecânica de branch; motor do estágio `branch` — plugins/furi-ship/skills/pipeline/references/branch.md:3 — "**Fonte única da mecânica de branch.**"
- work-cycle: motor do estágio `commit` (era o corpo do /work); invoca /method na borda — plugins/furi-ship/skills/pipeline/references/work-cycle.md:5 — "levar o objetivo (card ou trabalho sem card) até **um commit local**"
- pr-publish: motor dos estágios `push` e `pr` (era o corpo do /pull-request); idempotente, cards dos commits — plugins/furi-ship/skills/pipeline/references/pr-publish.md:9 — "**Idempotente, e os cards vêm dos commits.**"
- promote: motor do estágio `promovido` (era o Step 2 do /prod); atrás do gate — plugins/furi-ship/skills/pipeline/references/promote.md:9 — "**Nunca promova `<integração>` stale ou com divergência aberta**"
- smoke: contrato `passou | falhou[]` + evidência; NÃO escreve arquivo (por isso "no ar" fecha via `/vac última`, carimbo de sessão) — plugins/furi-ship/skills/pipeline/references/smoke.md:15 — "`passou` \| `falhou[]` (com o que falhou e onde), + evidência"
- smoke falho reabre o gap e volta ao reconcile — plugins/furi-ship/skills/pipeline/references/smoke.md:46 — "Smoke falho **não** é o fim do trabalho com um aviso no rodapé"
- deploy-run: push é gatilho, deploy é o run verde; fila em runner offline não é sucesso — plugins/furi-ship/skills/pipeline/references/deploy-run.md:9 — "**Push é o gatilho; deploy é o run VERDE.**"
- env-config: contrato `aplicados[] + pendentes[]`; lê `.claude/ship-setup/infra.md` — plugins/furi-ship/skills/pipeline/references/env-config.md:15 — "`.claude/ship-setup/infra.md` (**onde** vive cada segredo)"
- jira-sync: transiciona pelo NOME do status do `jira.md`; "no ar" só depois do smoke — plugins/furi-ship/skills/pipeline/references/jira-sync.md:3 — "Motor de **apoio**: não decide fluxo"
- findings: classe B exige citação verbatim `arquivo:linha` + grep (a origem do "ponteiro + trecho" dos mapas do /vac); nunca cria card — plugins/furi-ship/skills/pipeline/references/findings.md:25 — "**Citação verbatim** da fonte"

## Gates publicados por skill (o que o hook do /vac reconhece — scripts/gates.json)

- /method: Gateway Check por step; 9→10 é o bloco literal — plugins/furi-build/skills/method/references/gateways.md:84 — "## Gateway Check — Step 9 → Step 10"
- /method: Ratio 1:1 do Audit Pré é linha de contagem (isenta de evidência; o ledger confere o número) — plugins/furi-build/skills/method/references/09-testing.md:146 — "- Ratio M == N? ✅ SIM / ❌ NÃO"
- /method: `**Screenshot:** <path>` é a forma de evidência do Step 9 (o hook confere o arquivo) — plugins/furi-build/skills/method/references/09-testing.md:308 — "**Screenshot:** <path>"
- /method: TC que passou vira `- [x] TC-N: <nome> — ✅ (path do screenshot)` no card — plugins/furi-build/skills/method/references/06-todo.md:61 — "vira `- [x] TC-N: <nome> — ✅ (path do screenshot)`"
- /method: TaskCreate por step (Discovery, 6-9, follow-up, Closeout) — plugins/furi-build/skills/method/SKILL.md:130 — "### 3. TaskCreate"
- /method NÃO abre subagente no Step 7 (só proíbe worktree paralelo) — plugins/furi-build/skills/method/SKILL.md:14 — "**NÃO crie branch nem worktree paralelo.**"
- /todo: não publica `Gateway Check — Step 9 → 10`; o gate é o Audit Pós — plugins/furi-build/skills/todo/SKILL.md:345 — "### Audit Pós-Execução — BLOQUEANTE (publicar no chat ANTES de Phase 4)"
- /todo roda o Gate de Convergência (Phase 4) — plugins/furi-build/skills/todo/SKILL.md:24 — "roda o **Gate de Convergência** (Phase 4)"
- /fast: fecha com `Code Review: APROVADO (kanban/08-code-review/<feature>.md)` — plugins/furi-build/skills/fast/SKILL.md:78 — "Code Review: APROVADO (kanban/08-code-review/<feature>.md)"
- /homolog: bloco final `## ✅ /homolog — homolog no ar e verificado` (gate de sessão) — plugins/furi-ship/skills/homolog/SKILL.md:82 — "## ✅ /homolog — homolog no ar e verificado"
- /prod: bloco final `## ✅ /prod — produção no ar e verificada` (gate de sessão) — plugins/furi-ship/skills/prod/SKILL.md:89 — "## ✅ /prod — produção no ar e verificada"
- /pull-request: idempotente — PR aberto atualiza, nenhum cria — plugins/furi-ship/skills/pull-request/SKILL.md:21 — "PR aberto → atualiza. Nunca um segundo `create`"
- /work: bloco final `✅ /work <obj> — commitado localmente` (gate `work-close`) — plugins/furi-ship/skills/work/SKILL.md:84 — "✅ /work <KEY-N | objetivo> — commitado localmente"
- /repro é modificador: sozinho reproduz e para; composto delega ao alvo — plugins/furi-ship/skills/repro/SKILL.md:27 — "A ordem de execução é fixa — **`repro` → `card` → alvo**"

## Fronteiras onde o contexto se perde

- /proof roda em fork e em background: a sessão não espera; o relatório chega como notificação — plugins/furi-toolbox/skills/proof/SKILL.md:36 — "**a sessão não espera** — o relatório chega como notificação"
- /save roda em fork síncrono (`background: false`) — plugins/furi-toolbox/skills/save/SKILL.md:6 — "background: false"
- /blind é subprocesso `claude -p --safe-mode`, não subagente: hooks da sessão não entram lá; a saída volta por `cat` do `--out` — plugins/furi-build/skills/blind/SKILL.md:23 — "claude -p --safe-mode"
