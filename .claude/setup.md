# Setup — lp-skills

> Convenções operacionais do time neste repositório. Dono: `/setup`. Lido **sob demanda** por quem usa
> (`/work`, `/card`, `/pull-request`, `/homolog`, `/prod` via `/setup`; `/method` § Commit por caminho).
> Nunca por `CLAUDE.md`/`@import`/`.claude/rules/`, nunca da memória da máquina.
> NÃO mora aqui: topologia (detectada: `git ls-remote`) · board do Jira (`/jira-board`) · mapa da infra
> (`.claude/infra.md`) · ambientes e deploy (`.claude/deploy.md`) · padrões de código (`.claude/patterns.md`).
>
> Inferido em 2026-09-11 de: `git log -50` (49/50 em Conventional Commits, nenhuma key de card), `gh pr list --state merged` (1 PR em toda a história — o refactor #1 — contra 50 commits diretos), `gh api …/branches/main/protection` (404: sem proteção), rulesets (0), sem `CODEOWNERS`, sem template de PR, sem `CONTRIBUTING.md`, sem Jira (o fluxo é o `kanban/` local).

## Branch
- Trabalho: direto na integração
- Nome: —

## Commit
- Convenção: Conventional Commits        <!-- feat/fix/refactor/docs/chore(<escopo>): … — escopo = pacote ou área (gen, ci, setup, lp) -->
- Key do card: não entra

## PR
- Abre PR: não                           <!-- exceção pontual, por pedido explícito: refactor grande (PR #1) -->
- Aprovação: —
- Merge: —
- Template: —

## Jira
- Idioma dos cards: —                    <!-- sem Jira: os cards são kanban/06-todo … 10-done, locais -->
- DoD: `pnpm check` verde + card em `kanban/10-done/`

## Infra
- Mapa: `.claude/infra.md`
- Processo: `.claude/deploy.md`
- Conta (Eduzz/Labzz): —

## Guidelines
- README.md § Workflow do autor
