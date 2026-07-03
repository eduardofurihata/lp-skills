# Done — Distribuição via Plugin Marketplace

Migração da distribuição das skills do mecanismo antigo (symlink em `~/.claude/skills/` + hook `git pull`, que quebrava no Windows) para o **Claude Code plugin marketplace nativo** (copia per-OS, funciona igual em Windows/macOS/Linux). Inclui bundles por categoria (`furi-builder`, `eduzz-builder`).

## Artefatos (Steps 1-9)
- Problema: `docs/01-problem/plugin-marketplace.md`
- User Stories: `docs/02-user-stories/plugin-marketplace.md`
- Use Cases: `docs/03-use-cases/plugin-marketplace.md`
- Spec: `docs/04-spec/plugin-marketplace.md` (2 rounds + Round 3 bundles)
- Test Cases: `docs/05-test-cases/plugin-marketplace.md`
- To Do: movido para cá (deletado de `kanban/06-todo/`)
- Plano: `kanban/07-implementation/plugin-marketplace.md`
- Code Review: `kanban/08-code-review/plugin-marketplace.md`
- Run Test: `kanban/09-run-test/plugin-marketplace.md`

## Código alterado/criado
- **NOVO** `scripts/generate-plugins.mjs` — gera manifestos do frontmatter (fonte única)
- **NOVO** `.claude-plugin/marketplace.json` — catálogo (21 plugins: 19 skills + 2 bundles) [gerado]
- **NOVO** `skills/<cat>/<skill>/.claude-plugin/plugin.json` ×19 [gerado]
- **NOVO** `bundles/{furi,eduzz}-builder/.claude-plugin/plugin.json` ×2 [gerado]
- **NOVO** `components/BundleInstall.tsx` — atalho de pacote na LP
- **EDIT** `lib/install-prompt.ts` — comandos `/plugin` + `generateBundlePrompt` + `BUNDLES` (removida a maquinaria de escopo)
- **EDIT** `components/{SkillsClient,StickyInstallBar,InstallPromptViewer}.tsx` — modelo marketplace; viewer refatorado p/ `prompt: string`
- **DEL** `components/ScopeSelector.tsx` — escopo não existe no modelo marketplace
- **EDIT** `components/Hero.tsx`, `app/layout.tsx` — copy alinhada (+ DRY na meta description)
- **EDIT** `README.md`, `package.json` (script `gen:plugins`), `docs/01-problem/lp-skills-auto-sync.md` (superseded)

## Ações de ambiente (máquina do autor)
- 19 symlinks `~/.claude/skills/*`→repo **removidos**; hook `SessionStart` (sync-skills) **removido** de `~/.claude/settings.json` (Stop e demais hooks preservados).
- 19 skills + `eduzz-builder` instalados via marketplace, scope `user` (global).
- Preservados: `ui-ux-pro-max`, `video-teams`, `method.bak-*.7z`.

## Status final dos TCs — 10/10 PASSED
- [x] TC-1: Gerador 21 manifestos válidos + idempotentes
- [x] TC-2: Deps geradas == `requires` (1:1)
- [x] TC-3: Install → invocação BARE (`/commit`, não namespaced)
- [x] TC-4: Deps transitivas (afl → jira → method → solve)
- [x] TC-5: Cache = CÓPIA real (garantia cross-OS)
- [x] TC-6: Update reflete commit novo (git-SHA versioning)
- [x] TC-7: LP gera comandos `/plugin` + build verde
- [x] TC-8: Cleanup surgical (só o repo; terceiros + hooks preservados)
- [x] TC-9: Install global + CLI novo + zero secrets + dev-loop
- [x] TC-10: Bundle instala a categoria inteira (furi/eduzz-builder)

## Nota
`skills/personal/merge/SKILL.md` tinha uma edição **pré-existente** do usuário (anterior a esta feature) — **fora do escopo deste commit**, deixada não-commitada para o usuário versionar à parte.
