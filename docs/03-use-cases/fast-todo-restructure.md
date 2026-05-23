# Fast/Todo — Use Cases

## Reler

- `docs/01-problem/fast-todo-restructure.md`
- `docs/02-user-stories/fast-todo-restructure.md`

## Verificação de Realidade

Código já implementado em 3 commits locais (não pushados):
- `74aed17` refactor: rename /test to /todo, support dual-field tracking
- `1a43061` feat(/fast): include steps 8 + 10, dual-field tracking, optional /todo
- `640c30c` fix(skills): quote descriptions with backticked colon expressions

UCs abaixo são derivados das stories E reconciliados com o código existente (Rule 2: código vira insumo, não substituto).

---

## US-01 — /fast encerra com done sem QA via front

### UC-01 — Happy path: /fast com docs prontos
- **Ator**: Desenvolvedor
- **Precondição**: `docs/01-problem/` até `docs/04-spec/` existem para a feature
- **Fluxo**:
  1. Dev invoca `/fast <feature>`
  2. Gate Check passa ✅
  3. /fast executa steps 5, 6, 7a, 7b, 8, 10 em sequência
  4. Step 8 (Code Review) entra em loop até zero issues
  5. Step 10 cria `kanban/10-done/<feature>.md`, deleta `kanban/06-todo/<feature>.md`
  6. Tracking `docs/todo/<feature>.md` criado com `status: done` + `tests: pending`
- **Resultado**: feature dev-completed; QA opcional via `/todo`

### UC-02 — Erro: docs incompletos
- **Ator**: Desenvolvedor
- **Precondição**: falta algum doc em `docs/01-04`
- **Fluxo**:
  1. Dev invoca `/fast <feature>`
  2. Gate Check ❌ BLOQUEADO — lista docs faltantes
  3. /fast executa os steps 1-4 faltantes primeiro
- **Resultado**: docs preenchidos, fluxo retoma em UC-01

## US-02 — /fast roda Code Review

### UC-03 — Code Review em loop até limpo
- **Ator**: Desenvolvedor + /fast
- **Precondição**: Step 7b completo (código implementado)
- **Fluxo**:
  1. /fast inicia Step 8: lê `kanban/07-implementation/`, `docs/05-test-cases/`, `docs/03-use-cases/`
  2. Para cada arquivo alterado: revisa código morto, bugs, segurança, performance, padrões
  3. Issue encontrada → corrige IMEDIATAMENTE → volta ao passo 2
  4. Zero issues → publica relatório em `kanban/08-code-review/<feature>.md`
- **Resultado**: relatório APROVADO

### UC-04 — Fix invalidação de Code Review
- **Ator**: /fast
- **Precondição**: Step 8 rodou com 1+ fix
- **Fluxo**:
  1. Fix de código aplicado em 7b
  2. /fast invalida o último Code Review
  3. Re-executa Step 8 do zero
- **Resultado**: ciclo só encerra com ZERO mudanças no último passe

### UC-05 — Pressão para pular Step 8 (negativo)
- **Ator**: Stakeholder ou Dev tentando bypass
- **Precondição**: pressão de urgência ("CEO pediu", "feature trivial", "sou tech lead")
- **Fluxo**:
  1. Pressão para pular Step 8 emerge
  2. /fast consulta Red Flags do SKILL.md
  3. Recusa explícita com citação do protocolo
- **Resultado**: Step 8 é executado normalmente

## US-03 — Tracking dual-field

### UC-06 — /fast cria tracking dual-field
- **Ator**: /fast
- **Precondição**: Step 10 concluído
- **Fluxo**:
  1. /fast cria `docs/todo/<feature>.md` com frontmatter:
     ```yaml
     status: done
     tests: pending
     ```
  2. Inclui lista de TCs pendentes e notas para QA
- **Resultado**: tracking dual-field gravado

### UC-07 — /todo atualiza tracking
- **Ator**: /todo
- **Precondição**: tracking com `tests: pending`, TCs PASSED via front
- **Fluxo**:
  1. /todo move tracking de `docs/todo/` para `docs/done/`
  2. Atualiza frontmatter para `tests: passed`, adiciona `tested: <data>`
- **Resultado**: feature 100% encerrada (dev + QA)

## US-04 — /todo existe para QA opcional

### UC-08 — Scan e seleção
- **Ator**: /todo
- **Precondição**: 1+ arquivos em `docs/todo/`
- **Fluxo**:
  1. Glob `docs/todo/*.md`
  2. Filtra por `tests: pending` OU `status: pending-test`
  3. Marca cada um como `[novo]` ou `[legacy]`
  4. Apresenta lista ou auto-seleciona se 1 só
- **Resultado**: feature selecionada para QA

### UC-09 — Execução de TCs via front
- **Ator**: /todo
- **Precondição**: feature selecionada, TCs listados
- **Fluxo**:
  1. Pre-Flight: classifica TCs em READY/NEEDS SETUP/BLOCKED
  2. Cria 1 TaskCreate por grupo + 1 por TC individual
  3. Publica Audit Pré-Execução no chat (ratio 1:1)
  4. Loop: executa cada TC via Playwright MCP / AVD / iOS, screenshot por PASSED
  5. Publica Audit Pós-Execução
- **Resultado**: 100% PASSED ou loop volta

## US-05 — /todo reconhece legacy

### UC-10 — Feature legacy
- **Ator**: /todo
- **Precondição**: tracking com `status: pending-test` (sem `tests:`)
- **Fluxo**:
  1. /todo marca como `[legacy]`
  2. Roda Phase 2 (Code Review) — não foi rodado pelo /fast antigo
  3. Roda Phase 3 (Testing)
  4. Phase 4 cria `kanban/10-done/` do zero, move tracking, reescreve frontmatter
- **Resultado**: feature legacy migrada para novo formato e validada

### UC-11 — Feature novo
- **Ator**: /todo
- **Precondição**: tracking com `tests: pending` (status: done)
- **Fluxo**:
  1. /todo marca como `[novo]`
  2. SKIPA Phase 2 (Code Review já rodou no /fast)
  3. Lê `kanban/08-code-review/<feature>.md` como contexto
  4. Roda Phase 3 (Testing)
  5. Phase 4 anexa seção QA ao `kanban/10-done/` existente
- **Resultado**: QA validado; tracking movido para `docs/done/`

## US-06 + US-07 — LP renderiza skills

### UC-12 — Build com getSkills() correto
- **Ator**: Vercel build
- **Precondição**: skills/ contém N pastas com SKILL.md válido
- **Fluxo**:
  1. `next build` roda em `/vercel/path0`
  2. RSC `HomePage` chama `getSkills()` via `lib/skills.ts`
  3. `fs.readdir('skills')` retorna N entries
  4. `gray-matter` parsa cada SKILL.md
  5. HTML estático gerado com N cards
- **Resultado**: LP serve N skills

### UC-13 — Frontmatter inválido (NEGATIVO — encontrado em prod)
- **Ator**: Vercel build
- **Precondição**: SKILL.md com `: ` literal em description não-escapada
- **Fluxo**:
  1. `gray-matter` falha o parse
  2. `try/catch` em lib/skills.ts:51 retorna `null`
  3. `.filter((s) => s !== null)` remove a skill da lista
  4. HTML servido tem N-1 cards
- **Resultado**: skill silenciosamente omitida da LP — confirmado nos commits 74aed17 + 1a43061 (antes do fix 640c30c)

### UC-14 — Cache stale (HIPÓTESE — Bug 2 pendente)
- **Ator**: Vercel build + Turbopack
- **Precondição**: build com `Restored build cache from previous deployment`
- **Fluxo**:
  1. Build inicia com cache restaurada de deploy anterior
  2. Turbopack pode não invalidar pages estáticas quando `skills/` (fora de `app/`) muda
  3. HTML servido reflete build anterior à inclusão das pastas em `skills/`
- **Resultado**: LP serve HTML stale — pendente verificação após push

## US-08 — Naming /todo

### UC-15 — Invocação /todo
- **Ator**: Claude Code
- **Precondição**: skills/todo/SKILL.md com `name: todo`
- **Fluxo**:
  1. Usuário digita `/todo <feature>`
  2. Claude Code resolve via skills/todo/SKILL.md
- **Resultado**: skill executada

### UC-16 — Symlink local atualizado
- **Ator**: Manutenedor
- **Precondição**: `~/.claude/skills/test` apontava para `skills/test`
- **Fluxo**:
  1. `rm ~/.claude/skills/test` (antigo, agora quebrado)
  2. `ln -s /home/furihata/GitHub/lp-skills/skills/todo ~/.claude/skills/todo`
- **Resultado**: skill disponível localmente sob novo nome — confirmado nesta sessão

## US-09 — YAML válido

### UC-17 — Description com backtick e `:` interno
- **Ator**: Manutenedor
- **Precondição**: description contém literais como `` `tests: pending` ``
- **Fluxo**:
  1. Wrap description em aspas simples: `description: '... \`tests: pending\` ...'`
  2. YAML interpreta como string literal única
  3. `gray-matter` parsa corretamente
- **Resultado**: skill renderiza na LP — confirmado pelo commit 640c30c + teste local

### UC-18 — Deploy + verificação
- **Ator**: Manutenedor + Vercel
- **Precondição**: 3 commits locais não pushados
- **Fluxo**:
  1. `git push origin main`
  2. Vercel detecta push, dispara build automático
  3. Após build Ready: visitar https://lp-skills.vercel.app
  4. Confirmar 8 cards (apf, ask, chat, chat-out, commit, fast, method, todo)
- **Resultado esperado**: 8 cards visíveis

### UC-19 — Cache invalidação manual (se UC-18 falhar)
- **Ator**: Manutenedor
- **Precondição**: UC-18 deploy completo mas LP ainda mostra 6 cards
- **Fluxo**:
  1. Vercel UI → Deployments → último deploy → "Redeploy"
  2. Desmarcar "Use existing Build Cache"
  3. Aguardar Ready
  4. Re-visitar LP
- **Resultado esperado**: 8 cards visíveis após cache limpa
