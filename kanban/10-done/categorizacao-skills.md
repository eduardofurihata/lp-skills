# Done — Categorização de Skills (Pessoal / Eduzz)

Consolidação das skills do `labzz-skillzz` no `lp-skills`, separadas em buckets **Pessoal** e **Eduzz**, com sanitização e descontinuação do `labzz-skillzz`.

## Artefatos (Steps 1-9)
- Problema: `docs/01-problem/categorizacao-skills.md`
- User Stories: `docs/02-user-stories/categorizacao-skills.md`
- Use Cases: `docs/03-use-cases/categorizacao-skills.md` (25 UCs)
- Spec: `docs/04-spec/categorizacao-skills.md` (2 rounds, 21 decisões)
- Test Cases: `docs/05-test-cases/categorizacao-skills.md` (8 TCs + regressão)
- To Do: promovido para este done (card de `06-todo` deletado)
- Plano: `kanban/07-implementation/categorizacao-skills.md`
- Code Review: `kanban/08-code-review/categorizacao-skills.md` (APROVADO, 1 issue corrigido)
- Run Test: `kanban/09-run-test/categorizacao-skills.md` (8/8 PASSED)

## Arquivos de código alterados
**Novos:** `lib/categories.ts`, `components/CategoryBadge.tsx`, `components/CategoryFilter.tsx`
**Modificados:** `lib/skills.ts` (varredura 2 níveis + `category`), `lib/install-prompt.ts` (path por categoria), `components/SkillsClient.tsx` (filtro + seleção preservada), `components/SkillCard.tsx` (badge), `components/StickyInstallBar.tsx`, `components/InstallPromptViewer.tsx` (prop `{slug,category}`), `components/ui/badge.tsx` (variante `none`), `components/Hero.tsx` (copy), `app/globals.css` (tokens esmeralda), `README.md`
**Migração de conteúdo:** 10 skills → `skills/personal/` (git mv); `make-dev` → `skills/personal/`; `afl`,`jira`,`notion-pull`,`notion-push` → `skills/eduzz/` (sanitizadas)

## Sanitização aplicada
- Credencial de teste `test2@test.com / Test123!@#` **removida** do `/jira` (capacidade preservada via `can create users: yes`).
- `AV-` generalizado para `PROJ-` no `/jira` (genérico); padrão `AV-*` concentrado no `/afl` (seção "Contexto Eduzz").
- `/notion-*`: path interno `labzz-pm-forge` e nomes de doc reais removidos; `localhost:9432` mantido.

## Status final dos TCs (8/8 PASSED)
- [x] TC-1: Leitor varre 2 níveis e deriva categoria, resiliente a lixo — ✅ (tc1-tc2-home-badges.png)
- [x] TC-2: Badge de categoria correto na visão "Todas" — ✅ (tc1-tc2-home-badges.png)
- [x] TC-3: Filtro Todas/Pessoal/Eduzz com contagem — ✅ (tc3-filtro-eduzz.png; 4/11/15)
- [x] TC-4: Filtro preserva seleção e o prompt inclui as ocultas — ✅ (tc4-tc5-prompt-global.png)
- [x] TC-5: Install prompt com path por categoria, destino plano, escopos — ✅ (tc5-prompt-projeto.png)
- [x] TC-6: Sanitização do /jira — credencial removida e AV- generalizado — ✅ (grep=0/0)
- [x] TC-7: afl carrega AV-* e notion sanitizado — ✅
- [x] TC-8: Migração íntegra, slug único e build verde — ✅ (11/4, next build verde)

## Issue corrigido (Code Review)
- **Issue #1:** migração quebrou 10 symlinks locais `~/.claude/skills/*` (+ `make-dev` apontando pro labzz) → re-apontados para `skills/personal/<slug>` (11 OK, 0 quebrados).

## Descontinuação do labzz-skillzz (executada pós-commit/push)
Gate: só após commit + push + build verde do lp-skills (todos ✅).
- Pasta local `/home/furihata/GitHub/labzz-skillzz` — ✅ removida
- Projeto Vercel `labzz-skillzz` (URL `frontend-kappa-orpin-83.vercel.app`) — ✅ removido (`lp-skills` preservado)
- Repo GitHub `eduardofurihata/labzz-skillzz` — ⏳ **PENDENTE (ação do usuário)**: o token `gh` não tem o escopo `delete_repo`. Para concluir: `gh auth refresh -h github.com -s delete_repo` e então `gh repo delete eduardofurihata/labzz-skillzz --yes` (ou deletar pela UI do GitHub).
- `~/.claude/settings.json` não referencia labzz → nada a limpar (UC-25)
- Symlinks locais `~/.claude/skills/*` re-apontados para `skills/personal/<slug>` (Issue #1 do review).
