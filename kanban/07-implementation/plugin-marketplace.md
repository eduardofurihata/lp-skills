# Plano de Implementação — Distribuição via Plugin Marketplace

## 1. Contexto Consolidado
- **Problema**: symlink+hook não funciona em todo SO (Windows quebra); dev copia na mão. → migrar pro plugin marketplace nativo (copia per-OS).
- **Stories/UCs/Spec**: `docs/0{1..5}/plugin-marketplace.md`. Arquitetura: 19 plugins single-skill-root (bare names via frontmatter `name`), deps via `plugin.json`, manifestos **gerados** do frontmatter, LP emite comandos `/plugin`, cleanup dos symlinks/hook, install global + validação em CLI novo.

## 2. Código Existente Relevante
- `lib/skills.ts` — leitor server (gray-matter) de `skills/<cat>/<slug>/SKILL.md`; expõe `Skill{slug,name,description,effort,category,requires}`. **Não muda**; `.claude-plugin/` dentro do slug é ignorado (só checa references/scripts/data; filtra `.`-dirs).
- `lib/categories.ts` — `Category = "personal"|"eduzz"`, puro. Reusar no gerador.
- `lib/install-prompt.ts` — `generatePrompt({skills,scope})`, `expandDeps`, `SkillNode`, `InstallSkill`, `Scope`, `SCOPE_*`. **Reescrever `generatePrompt`; manter `expandDeps`/`InstallSkill`; remover `Scope`/`SCOPE_*`.**
- `components/SkillsClient.tsx` — orquestra selected/scope/filter; `expandDeps`. **Remover estado `scope`.**
- `components/StickyInstallBar.tsx` — barra + dialog. **Remover props/uso de scope + `<ScopeSelector>`.**
- `components/InstallPromptViewer.tsx` — chama `generatePrompt`. **Tirar `scope`.**
- `components/ScopeSelector.tsx` — **DELETAR** (escopo deixa de existir no modelo marketplace; Scout rule).
- **i18n**: projeto NÃO tem i18n (sem next-intl/locales). Strings literais PT, como o resto da LP. Documentado.

## 3. Estratégia de Implementação

### T1 — Gerador `scripts/generate-plugins.mjs` (ESM, só node+gray-matter)
- Varre `skills/{personal,eduzz}/*/SKILL.md`, `matter()` o frontmatter.
- Para cada skill emite `skills/<cat>/<slug>/.claude-plugin/plugin.json`:
  ```json
  { "name": <name>, "description": <1ª frase>, "skills": ["./"], "dependencies": [{"name": <req>}] }
  ```
  (omite `dependencies` se vazio; **sem `version`** → git-SHA.)
- Emite `.claude-plugin/marketplace.json`: `{name:"lp-skills", owner:{name:"Eduardo Furihata"}, metadata:{description}, plugins:[{name,source:"./skills/<cat>/<slug>",description,category}]}`.
- **Idempotente**: chaves em ordem fixa, JSON 2-spaces + newline final, plugins ordenados por name. Rodar 2× = bytes idênticos.
- Helpers: `firstSentence(desc)`, `parseRequires(v)` (espelha `lib/skills.ts`: string|array→array).

### T2 — `package.json`: `"gen:plugins": "node scripts/generate-plugins.mjs"`.

### T3 — Rodar `pnpm gen:plugins` → 19 plugin.json + marketplace.json (commit).

### T4 — `lib/install-prompt.ts`
- `generatePrompt({skills}: {skills: InstallSkill[]}): string` → texto:
  ```
  Instale estas skills do Claude Code (marketplace de Furihata).

  1) Adicione o marketplace (uma vez por máquina):
     /plugin marketplace add eduardofurihata/lp-skills

  2) Instale (dependências entram automáticas):
     /plugin install <slug>@lp-skills        ← uma linha por skill de installSkills

  3) Atualizar depois: /plugin marketplace update
  ```
- Manter `expandDeps`, `SkillNode`, `InstallSkill`. Remover `Scope`, `SCOPE_LABELS`, `SCOPE_DESCRIPTIONS`, `targetBaseFor`, `preStepsFor`, `symlinkBlockFor`, `stepsFor`, `headerFor`.
- Constantes: `REPO_SLUG = "eduardofurihata/lp-skills"`, `MARKETPLACE = "lp-skills"`.

### T5 — Componentes
- `SkillsClient`: remover `scope`/`setScope`; parar de passar scope.
- `StickyInstallBar`: remover `scope`/`onScopeChange`; remover `<ScopeSelector>`; ajustar texto (tirar "· escopo X"); dialog só com `<InstallPromptViewer skills=… />`.
- `InstallPromptViewer`: props só `{skills}`; `generatePrompt({skills})`.
- Deletar `ScopeSelector.tsx`.

### T6 — README + doc
- README: seção "Para usuários" → `/plugin marketplace add …` + `/plugin install …@lp-skills` + `/plugin marketplace update`; "Workflow do autor" → dev-loop via `--plugin-dir`/`@skills-dir` + gerar/commitar manifestos; nota de requisito (Claude Code recente). Nota "pra time/projeto: adicionar o marketplace no `.claude/settings.json` do projeto".
- `docs/01-problem/lp-skills-auto-sync.md`: 1 linha "> **Superseded** por `plugin-marketplace` (2026-07-03) — mecanismo migrado pra plugin marketplace nativo."

### T7 — `pnpm build` verde.

### T8 — Cleanup (máquina do autor) — SURGICAL
- Investigar `~/GitHub/labzz-skillzz` (existe? tem skills?). `sync-skills.sh` gere lp-skills **e** labzz-skillzz.
  - **Se labzz ativo**: remover lp-skills do array `REPOS` do `sync-skills.sh` (manter hook p/ labzz) + remover os symlinks lp-skills.
  - **Se labzz ausente/vazio**: remover o hook `SessionStart` do `~/.claude/settings.json` (`del(.hooks.SessionStart)`) — é o único hook lá — e o symlink-set.
- Remover symlinks de `~/.claude/skills/*` cujo `readlink` casa `*/GitHub/lp-skills/skills/*`. **Preservar** `ui-ux-pro-max/`, `video-teams/` (dirs reais) e `method.bak-*.7z`.
- **Backup** do `settings.json` antes de editar; validar JSON depois. Preservar hooks `Stop` e todo o resto.

### T9 — Publish: no Step 10, commit único + `git push origin main` (autorizado por "subir o plugin"; confirmar com o usuário antes do push por ser outward-facing).

### T10 — Install global + validação (Step 9): ver TC-9.

## 4. Mapa Test Cases → Código
- **TC-1/TC-2** → T1/T3 (gerador, deps).
- **TC-3/TC-4/TC-5** → T3 manifestos + `claude plugin` (marketplace local, install, cache=cópia).
- **TC-6** → git-SHA versioning (sem `version`).
- **TC-7** → T4/T5/T7 (LP + build).
- **TC-8** → T8 (cleanup surgical).
- **TC-9** → T9/T10 (push, GitHub add, CLI novo, segurança, dev-loop).

## 5. Riscos e Atenção
- **Namespacing**: confirmar empiricamente no Step 9 que a invocação é bare (`/commit`, não `lp-skills:commit`). Se vier namespaced, ajustar `plugin.json` (validar `skills:["./"]`). — mitigação já no plano.
- **`enabledPlugins`/team scope**: fora do escopo primário; só nota no README (schema não 100% verificado → não gerar comando que eu não confirmei).
- **Cleanup destrutivo**: backup + surgical + preservar terceiros/labzz. TC-8 valida.
- **`claude plugin install` exato**: confirmar subcomando CLI (`claude plugin install <name>@<mkt>`) antes de rodar no Step 9.
- **Push = redeploy Vercel da LP**: desejado (LP passa a mostrar comandos /plugin). Confirmar antes.

## 6. Checklist de Implementação
- [ ] T1: `scripts/generate-plugins.mjs`
- [ ] T2: `package.json` script
- [ ] T3: rodar gerador → manifestos
- [ ] T4: `lib/install-prompt.ts`
- [ ] T5: SkillsClient/StickyInstallBar/InstallPromptViewer + deletar ScopeSelector
- [ ] T6: README + nota superseded
- [ ] T7: `pnpm build`
- [ ] T8: cleanup surgical (symlinks + hook/script)
- [ ] T9/T10: publish + install global + validação (Step 9)
