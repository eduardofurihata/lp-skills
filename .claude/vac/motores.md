# Motores compartilhados e fronteiras entre skills

Mapa escrito à mão (2026-09-12). Quem inclui quem, onde cada gate é publicado e onde o regime do /vac se perde. Validado por `vac-hook.mjs scan --map`.

## Motores do /prod (usados por /homolog, /prod, /pull-request, /work, /repro)

- reconcile: a porta única — skill declara o alvo, o motor diagnostica o gap e chama os outros motores — plugins/furi-ship/skills/prod/references/reconcile.md:3 — "**A porta única.** `/homolog` e `/prod` declaram um **alvo** e entregam a ele."
- deploy-context: fonte única da topologia (dev/main, ambientes, URLs) — plugins/furi-ship/skills/prod/references/deploy-context.md:3 — "**Fonte única do contexto de deploy.**"
- branch: fonte única da mecânica de branch; /work e /repro apontam para cá — plugins/furi-ship/skills/work/references/branch.md:3 — "**Fonte única da mecânica de branch.**"
- smoke: contrato `passou | falhou[]` + evidência; NÃO escreve arquivo (por isso "no ar" fecha via `/vac última`, carimbo de sessão) — plugins/furi-ship/skills/prod/references/smoke.md:15 — "`passou` \| `falhou[]` (com o que falhou e onde), + evidência"
- smoke falho reabre o gap e volta ao reconcile — plugins/furi-ship/skills/prod/references/smoke.md:46 — "Smoke falho **não** é o fim do trabalho com um aviso no rodapé"
- deploy-run: push é gatilho, deploy é o run verde; fila em runner offline não é sucesso — plugins/furi-ship/skills/prod/references/deploy-run.md:9 — "**Push é o gatilho; deploy é o run VERDE.**"
- env-config: contrato `aplicados[] + pendentes[]`; lê `.claude/ship-setup/infra.md` — plugins/furi-ship/skills/prod/references/env-config.md:15 — "`.claude/ship-setup/infra.md` (**onde** vive cada segredo)"
- jira-sync: "no ar" só depois do smoke — plugins/furi-ship/skills/prod/references/jira-sync.md:55 — "**No ar em homolog, verificado**"
- findings: classe B exige citação verbatim `arquivo:linha` + grep (a origem do "ponteiro + trecho" dos mapas do /vac) — plugins/furi-ship/skills/prod/references/findings.md:25 — "**Citação verbatim** da fonte"

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
- /homolog: bloco final `## ✅ /homolog — homolog no ar e verificado` (gate de sessão) — plugins/furi-ship/skills/homolog/SKILL.md:78 — "## ✅ /homolog — homolog no ar e verificado"
- /prod: bloco final `## ✅ /prod — produção no ar e verificada` (gate de sessão) — plugins/furi-ship/skills/prod/SKILL.md:119 — "## ✅ /prod — produção no ar e verificada"
- /pull-request: idempotente — PR aberto atualiza, nenhum cria — plugins/furi-ship/skills/pull-request/SKILL.md:31 — "PR aberto → **atualiza**; nenhum → cria"

## Fronteiras onde o contexto se perde

- /proof roda em fork e em background: a sessão não espera; o relatório chega como notificação — plugins/furi-toolbox/skills/proof/SKILL.md:36 — "**a sessão não espera** — o relatório chega como notificação"
- /save roda em fork síncrono (`background: false`) — plugins/furi-toolbox/skills/save/SKILL.md:6 — "background: false"
- /blind é subprocesso `claude -p --safe-mode`, não subagente: hooks da sessão não entram lá; a saída volta por `cat` do `--out` — plugins/furi-build/skills/blind/SKILL.md:23 — "claude -p --safe-mode"
