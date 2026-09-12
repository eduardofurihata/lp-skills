# Mapa das skills — gerado por `scripts/map-skills.mjs` (`pnpm map`)

Não edite à mão: regenere. Validação: `node plugins/furi-toolbox/skills/vac/scripts/vac-hook.mjs scan --map .claude/vac/mapa-skills.md`.
Cada bullet aponta `arquivo:linha — "trecho"`; um ponteiro que o scan não encontra é o sinal para re-explorar só aquele item.

## furi-build:blind

- frontmatter — context: inline · allowed-tools: Bash, Read, Write — plugins/furi-build/skills/blind/SKILL.md:2 — "name: blind"
- gate: "Veredicto" — plugins/furi-build/skills/blind/references/system-pair.md:16 — "## Veredicto"

## furi-build:fast

- frontmatter — context: inline · effort: max · requires: method, solve, blind · handoff: todo — plugins/furi-build/skills/fast/SKILL.md:4 — "effort: max"
- artefatos: docs/05-test-cases, kanban/06-todo, kanban/08-code-review, kanban/10-done — plugins/furi-build/skills/fast/SKILL.md:79 — "Test cases: X ESCRITOS (docs/05-test-cases/), PENDENTES de execução."
- task list: TaskCreate — plugins/furi-build/skills/fast/SKILL.md:32 — "Siga a **Ordem de Operações do `/method`** (leia `method/SKILL.md` por arquivo —"
- invoca/cita: furi-build:solve — plugins/furi-build/skills/fast/SKILL.md:32 — "Siga a **Ordem de Operações do `/method`** (leia `method/SKILL.md` por arquivo —"

## furi-build:method

- frontmatter — context: inline · effort: max · requires: solve, blind · boundary: homolog, prod, setup — plugins/furi-build/skills/method/SKILL.md:4 — "effort: max"
- gate: "2. Gate Check" — plugins/furi-build/skills/method/SKILL.md:111 — "### 2. Gate Check (OBRIGATÓRIO — exibir visualmente)"
- gate: "Methodology Gate Check" — plugins/furi-build/skills/method/SKILL.md:116 — "## Methodology Gate Check"
- gate: "Loop de Follow-ups (Gate de Converg" — plugins/furi-build/skills/method/SKILL.md:173 — "## Loop de Follow-ups (Gate de Convergência)"
- gate: "Veredicto" — plugins/furi-build/skills/method/references/08-code-review.md:172 — "## Veredicto Final"
- gate: "Audit Pré" — plugins/furi-build/skills/method/references/09-testing.md:137 — "## Audit Pré-Execução — BLOQUEANTE (publicar no chat ANTES do primeiro TC rodar)"
- gate: "Audit Pós" — plugins/furi-build/skills/method/references/09-testing.md:250 — "## Audit Pós-Execução — BLOQUEANTE (publicar no chat ANTES do Gateway 9 → 10)"
- gate: "Gate de Converg" — plugins/furi-build/skills/method/references/10-done.md:48 — "## Gate de Convergência — ANTES de qualquer ação do Step 10"
- gate: "Checklist Final" — plugins/furi-build/skills/method/references/10-done.md:110 — "## Checklist Final (step terminal — sem gateway de saída)"
- gate: "Gateway Check" — plugins/furi-build/skills/method/references/gateways.md:23 — "## Gateway Check — Step N → Step N+1"
- gate: "Exceções (NÃO requer Gate Check" — plugins/furi-build/skills/method/references/gateways.md:110 — "## Exceções (NÃO requer Gate Check inicial)"
- artefatos: docs/00-context, docs/01-problem, docs/02-user-stories, docs/03-use-cases, docs/04-spec, docs/05-test-cases, kanban/06-todo, kanban/07-implementation, kanban/08-code-review, kanban/09-run-test, kanban/10-done — plugins/furi-build/skills/method/references/04-spec.md:117 — "**Migração (uma vez por projeto):** o arquivo existe no caminho antigo — `docs/0"
- task list: TaskCreate, TaskUpdate — plugins/furi-build/skills/method/SKILL.md:130 — "### 3. TaskCreate"
- invoca/cita: furi-build:solve — plugins/furi-build/skills/method/SKILL.md:105 — "**ANTES de tudo — invoque o `/solve`.** Toda vez que o `/method` for ativado, a "

## furi-build:principles

- frontmatter — context: inline · effort: max — plugins/furi-build/skills/principles/SKILL.md:4 — "effort: max"

## furi-build:proto

- frontmatter — context: inline · effort: max · requires: solve · handoff: method, fast — plugins/furi-build/skills/proto/SKILL.md:4 — "effort: max"
- artefatos: docs/04-spec — plugins/furi-build/skills/proto/SKILL.md:20 — "- **O design system do app.** Tokens, componentes, tipografia, ícones e escalas "
- invoca/cita: furi-build:solve — plugins/furi-build/skills/proto/SKILL.md:12 — "Recria a tela pedida em **3 versões**, cada uma numa **rota paralela temporária*"

## furi-build:solve

- frontmatter — context: inline · effort: max · requires: principles, ui — plugins/furi-build/skills/solve/SKILL.md:4 — "effort: max"
- invoca/cita: furi-build:principles, furi-build:ui — plugins/furi-build/skills/solve/SKILL.md:33 — "**ANTES de tudo — invoque o `/principles` via Skill tool** (`furi-build:principl"

## furi-build:todo

- frontmatter — context: inline · effort: max · requires: method, solve, blind — plugins/furi-build/skills/todo/SKILL.md:4 — "effort: max"
- gate: "Veredicto" — plugins/furi-build/skills/todo/SKILL.md:216 — "## Veredicto Final"
- gate: "Audit Pré" — plugins/furi-build/skills/todo/SKILL.md:287 — "### Audit Pré-Execução — BLOQUEANTE (publicar no chat ANTES do primeiro TC)"
- gate: "Audit Pós" — plugins/furi-build/skills/todo/SKILL.md:345 — "### Audit Pós-Execução — BLOQUEANTE (publicar no chat ANTES de Phase 4)"
- gate: "Gate de Converg" — plugins/furi-build/skills/todo/SKILL.md:438 — "### Gate de Convergência — BLOQUEANTE (publicar no chat ANTES de promover)"
- artefatos: docs/01-problem, docs/05-test-cases, kanban/06-todo, kanban/07-implementation, kanban/08-code-review, kanban/09-run-test, kanban/10-done — plugins/furi-build/skills/todo/SKILL.md:132 — "Antes de revisar, ler TODOS os docs da feature (`docs/01-problem` → `docs/05-tes"
- task list: TaskCreate, TaskUpdate — plugins/furi-build/skills/todo/SKILL.md:36 — "Crie tasks via TaskCreate para cada item:"
- invoca/cita: furi-build:method, furi-build:solve — plugins/furi-build/skills/todo/SKILL.md:454 — "2. **Invoque o `/method`** — via **Skill tool** (`furi-build:method`; a forma cu"

## furi-build:ui

- frontmatter — context: inline · effort: max · requires: solve — plugins/furi-build/skills/ui/SKILL.md:4 — "effort: max"
- invoca/cita: furi-build:solve — plugins/furi-build/skills/ui/SKILL.md:94 — "**No modo alvo, invoque o `/solve` via Skill tool** (`furi-build:solve`; a forma"

## furi-ship:card

- frontmatter — context: inline · effort: max · requires: jira, setup, solve, work, pull-request, homolog, prod · handoff: work — plugins/furi-ship/skills/card/SKILL.md:4 — "effort: max"
- artefatos: docs/00-context — plugins/furi-ship/skills/card/SKILL.md:97 — "- `docs/MAP.md` / `docs/00-context/` (contexto de produto, se o projeto tiver) s"
- invoca/cita: furi-build:solve, furi-ship:jira, furi-ship:setup — plugins/furi-ship/skills/card/SKILL.md:22 — "**ANTES de tudo — invoque o `/solve`.** Toda vez que o `/card` for ativado, a PR"

## furi-ship:homolog

- frontmatter — context: inline · effort: max · requires: jira, setup, pipeline, todo, infra · handoff: prod — plugins/furi-ship/skills/homolog/SKILL.md:4 — "effort: max"
- gate: "✅ /homolog — homolog no ar e verificad" — plugins/furi-ship/skills/homolog/SKILL.md:82 — "## ✅ /homolog — homolog no ar e verificado"
- artefatos: kanban/08-code-review — plugins/furi-ship/skills/homolog/SKILL.md:87 — "- Review:   limpo (kanban/08-code-review/<feature>.md)"
- invoca/cita: furi-ship:jira, furi-ship:setup — plugins/furi-ship/skills/homolog/SKILL.md:50 — "1. **Invoque o `/jira`** — via **Skill tool** (`furi-ship:jira`; a forma curta `"

## furi-ship:infra

- frontmatter — context: inline · effort: max · boundary: prod, setup — plugins/furi-ship/skills/infra/SKILL.md:4 — "effort: max"
- invoca/cita: furi-ship:setup — plugins/furi-ship/skills/infra/SKILL.md:46 — "**Do time ou só meu** — o modo é o que o `/setup` decidiu para este repositório "

## furi-ship:jira

- frontmatter — context: inline · effort: max · boundary: setup — plugins/furi-ship/skills/jira/SKILL.md:4 — "effort: max"
- invoca/cita: furi-ship:setup — plugins/furi-ship/skills/jira/SKILL.md:63 — "`Rastreamento: Jira` (ou linha ausente num setup anterior a esta versão — trate "

## furi-ship:pipeline

- frontmatter — context: inline · effort: max · user-invocable: false — plugins/furi-ship/skills/pipeline/SKILL.md:4 — "effort: max"
- gate: "Smoke" — plugins/furi-ship/skills/pipeline/references/deploy-context.md:79 — "## Smoke pós-deploy"
- artefatos: docs/00-context, docs/01-problem, docs/02-user-stories, docs/03-use-cases, docs/04-spec, docs/05-test-cases, kanban/06-todo, kanban/07-implementation, kanban/08-code-review, kanban/09-run-test, kanban/10-done, kanban/11-ship — plugins/furi-ship/skills/pipeline/references/deploy-context.md:100 — "| **Doc no caminho antigo** (`.claude/deploy.md` — a raiz de `.claude/`, antes d"
- invoca/cita: furi-build:method, furi-build:todo, furi-ship:infra — plugins/furi-ship/skills/pipeline/references/reconcile.md:3 — "> **A porta única.** Os quatro alvos — `/work`, `/pull-request`, `/homolog`, `/p"

## furi-ship:prod

- frontmatter — context: inline · effort: max · requires: jira, setup, pipeline, todo, infra · boundary: sync — plugins/furi-ship/skills/prod/SKILL.md:4 — "effort: max"
- gate: "✅ /prod — produção no ar e verificad" — plugins/furi-ship/skills/prod/SKILL.md:89 — "## ✅ /prod — produção no ar e verificada"
- invoca/cita: furi-ship:jira, furi-ship:setup — plugins/furi-ship/skills/prod/SKILL.md:51 — "1. **Invoque o `/jira`** — via **Skill tool** (`furi-ship:jira`; a forma curta `"

## furi-ship:pull-request

- frontmatter — context: inline · effort: max · requires: jira, setup, pipeline · handoff: homolog · boundary: prod — plugins/furi-ship/skills/pull-request/SKILL.md:4 — "effort: max"
- artefatos: kanban/11-ship — plugins/furi-ship/skills/pull-request/SKILL.md:84 — "- Kanban: kanban/11-ship/<feature>.md"
- invoca/cita: furi-ship:jira, furi-ship:setup — plugins/furi-ship/skills/pull-request/SKILL.md:54 — "1. **Invoque o `/jira`** — via **Skill tool** (`furi-ship:jira`; a forma curta `"

## furi-ship:repro

- frontmatter — context: inline · effort: max · requires: jira, setup, pipeline, solve, work, pull-request, homolog, prod, card — plugins/furi-ship/skills/repro/SKILL.md:4 — "effort: max"
- artefatos: docs/04-spec — plugins/furi-ship/skills/repro/references/human-check.md:31 — "- Saída que só nasce no clique → diga **o que ele deve ler** quando clicar e **c"
- invoca/cita: furi-build:method, furi-build:solve, furi-ship:jira, furi-ship:setup — plugins/furi-ship/skills/repro/references/rationalizations.md:5 — "> A fase de implementação/testes roda no `/method` — skill separada, invocada vi"

## furi-ship:setup

- frontmatter — context: inline · effort: max · boundary: jira, prod, infra — plugins/furi-ship/skills/setup/SKILL.md:4 — "effort: max"
- artefatos: docs/01-problem, docs/05-test-cases, kanban/10-done — plugins/furi-ship/skills/setup/SKILL.md:46 — "`.claude/ship-setup/setup.md` — a pasta `ship-setup/` é a casa do processo de en"

## furi-ship:work

- frontmatter — context: inline · effort: max · requires: jira, setup, pipeline, method, solve · handoff: pull-request — plugins/furi-ship/skills/work/SKILL.md:4 — "effort: max"
- artefatos: kanban/07-implementation, kanban/10-done — plugins/furi-ship/skills/work/SKILL.md:35 — "| vazio | CONTINUE: objetivo = o card/trabalho da branch atual (`docs/jira/todo/"
- invoca/cita: furi-build:method, furi-build:solve, furi-build:todo, furi-ship:jira, furi-ship:setup — plugins/furi-ship/skills/work/SKILL.md:79 — "Os motores vivem em `pipeline/references/`. **Não reimplemente nenhum aqui** — s"

## furi-toolbox:ask

- frontmatter — context: inline — plugins/furi-toolbox/skills/ask/SKILL.md:2 — "name: ask"

## furi-toolbox:chat

- frontmatter — context: inline · effort: max — plugins/furi-toolbox/skills/chat/SKILL.md:4 — "effort: max"
- task list: TaskCreate, TaskGet, TaskList, TaskUpdate — plugins/furi-toolbox/skills/chat/SKILL.md:22 — "| **Core tools** | Read, Glob, Grep, WebSearch, WebFetch, TaskGet, TaskList, Cro"

## furi-toolbox:chat-out

- frontmatter — context: inline · handoff: chat — plugins/furi-toolbox/skills/chat-out/SKILL.md:4 — "handoff: chat"
- task list: TaskCreate, TaskUpdate — plugins/furi-toolbox/skills/chat-out/SKILL.md:13 — "All tools restored: Write, Edit, NotebookEdit, Bash (all commands), TaskCreate, "

## furi-toolbox:claude-shortcuts

- frontmatter — context: inline · allowed-tools: Bash, Read, Edit, Write — plugins/furi-toolbox/skills/claude-shortcuts/SKILL.md:2 — "name: claude-shortcuts"

## furi-toolbox:ctt

- frontmatter — context: inline — plugins/furi-toolbox/skills/ctt/SKILL.md:2 — "name: ctt"
- task list: TaskCreate, TaskList, TaskUpdate — plugins/furi-toolbox/skills/ctt/SKILL.md:3 — "description: Use when user invokes /ctt to capture a request into the Claude Cod"

## furi-toolbox:make-dev

- frontmatter — context: inline — plugins/furi-toolbox/skills/make-dev/SKILL.md:2 — "name: make-dev"

## furi-toolbox:proof

- frontmatter — context: fork · effort: high — plugins/furi-toolbox/skills/proof/SKILL.md:4 — "context: fork"
- subagente: a própria skill roda em fork — plugins/furi-toolbox/skills/proof/SKILL.md:4 — "context: fork"

## furi-toolbox:save

- frontmatter — context: fork · effort: low — plugins/furi-toolbox/skills/save/SKILL.md:5 — "context: fork"
- subagente: a própria skill roda em fork — plugins/furi-toolbox/skills/save/SKILL.md:5 — "context: fork"

## furi-toolbox:sync

- frontmatter — context: inline · effort: max · handoff: prod — plugins/furi-toolbox/skills/sync/SKILL.md:4 — "effort: max"

## furi-toolbox:vac

- frontmatter — context: inline · effort: max — plugins/furi-toolbox/skills/vac/SKILL.md:4 — "effort: max"
- gate: "Audit Pré" — plugins/furi-toolbox/skills/vac/scripts/samples/009-ratio-sim.md:7 — "## Audit Pré-Execução — TaskCreate 1:1"
- gate: "Gateway Check" — plugins/furi-toolbox/skills/vac/scripts/samples/012-gateway-9-10-sem-audit-publicado.md:10 — "## Gateway Check — Step 9 → Step 10"
- gate: "✅ /homolog — homolog no ar e verificad" — plugins/furi-toolbox/skills/vac/scripts/samples/015-smoke-sem-navegacao.md:10 — "## ✅ /homolog — homolog no ar e verificado"
- gate: "Audit Pós" — plugins/furi-toolbox/skills/vac/scripts/samples/018-tool-tasklist-sem-chamada.md:10 — "## Audit Pós-Execução — Execução 1:1"
- artefatos: docs/01-05, docs/01-problem, docs/03-use-cases, docs/05-test-cases, kanban/06-11, kanban/06-todo, kanban/08-code-review, kanban/09-run-test, kanban/10-done, kanban/11-ship — plugins/furi-toolbox/skills/vac/SKILL.md:49 — "7. **Deixe o hook conferir o barato.** No `Stop`, no `Write`/`Edit` de artefato "
- task list: TaskCreate, TaskList, TaskUpdate — plugins/furi-toolbox/skills/vac/SKILL.md:3 — "description: 'Use when user invokes /vac — vacina contra alucinação. Turns on th"
- invoca/cita: furi-build:solve, furi-toolbox:vac-verifier — plugins/furi-toolbox/skills/vac/scripts/vac-samples.test.mjs:10 — "//   ledger: {"reads": ["lib/x.ts"], "bash": ["pnpm typecheck"], "skills": ["fur"
- subagente: chama Agent(...) — plugins/furi-toolbox/skills/vac/SKILL.md:57 — "Agent("

## furi-toolbox:video-teams

- frontmatter — context: inline — plugins/furi-toolbox/skills/video-teams/SKILL.md:2 — "name: video-teams"
