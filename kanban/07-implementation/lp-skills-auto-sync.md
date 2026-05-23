# Plano de Implementação — LP Skills Auto-Sync

## 1. Contexto Consolidado

- **Problema** (`docs/01-problem/`): canal público inexistente para distribuir skills pessoais do Claude Code com auto-update transparente.
- **Stories** (`docs/02-user-stories/`): autor sincroniza skills sem fricção, devs instalam com 1 paste e recebem updates automáticos, time tem opção de escopo (Global, Projeto compartilhado, Projeto local).
- **Use Cases** (`docs/03-use-cases/`): 16 UCs cobrindo autor sync (happy/idempotente/symlink/diverged/lock/debounce/delete), dev LP (browse/select/copy), dev install (3 escopos/conflito/sem internet), auto-update, build Vercel.
- **Spec** (`docs/04-spec/`): Next.js 15 + Tailwind v4 + shadcn/ui + Geist + gray-matter + filesystem reads no build (zero GitHub API). Sync via bash + rsync -aL --delete --safe-links + flock + debounce 30s. 3 templates de install prompt.

## 2. Código Existente Relevante

Projeto é **brand-new** (diretório `/home/furihata/GitHub/lp-skills/` está vazio). Nenhum código existente.

**i18n:** projeto não tem i18n configurado (será criado do zero). Decisão do spec: strings em **português** no MVP (público inicial brasileiro). Não usar biblioteca de i18n nesta fase — strings literais ok, mas centralizadas em constantes quando reutilizadas.

**Referências de qualidade (big apps):**
- **Vercel.com** — LP minimalista dark com Geist, tipografia bold, CTAs claros. Replicar paleta + hierarquia visual.
- **Linear.app** — uso de monospace para conteúdo técnico, sticky bottom bars contextuais.
- **shadcn/ui showcase** — padrão de Card + Checkbox toggleable, segmented Tabs.
- **Anthropic claude.ai/docs** — apresentação de skills/agents técnicos.

## 3. Estratégia de Implementação

### Ordem (respeita dependências de 06-todo)

1. **Setup**: scaffold Next.js → instalar deps → shadcn init → adicionar componentes shadcn → globals.css com tokens → layout com Geist
2. **Library**: `lib/utils.ts` → `lib/skills.ts` → `lib/install-prompt.ts`
3. **Componentes (folhas → composições)**: SkillCard → SkillGrid → ScopeSelector → InstallPromptViewer → StickyInstallBar → SkillsClient → Hero
4. **Página**: `app/page.tsx` (server) + revalidate
5. **Sync script**: criar + chmod + testar manual → popular `./skills/`
6. **Pré-publicação**: mascarar credenciais, .gitignore, README, git init
7. **GitHub + Vercel**: push, conectar Vercel
8. **Hook**: settings.json

### Abordagem técnica por componente

**`lib/skills.ts`** — async function `getSkills()` server-only. Lê `process.cwd()/skills/`, filtra dirs, para cada um lê `SKILL.md`, parseia com `gray-matter`. Retorna `Skill[]` ordenado por nome.

**`lib/install-prompt.ts`** — função pura `generatePrompt({ skills: Skill[], scope })`. Switch por escopo, retorna string com template. Skills viram lista joined com `, `. Sem dependências externas.

**`components/SkillCard.tsx`** — client component. Props: `skill: Skill`, `selected: boolean`, `onToggle: () => void`. Card do shadcn estilizado com border violet quando selected. Click anywhere no card chama onToggle. Mostra effort badge e ícones de extras (refs/scripts/data).

**`components/SkillsClient.tsx`** — client component agregador. `useState` para `selected: Set<string>` e `scope: Scope`. Renderiza SkillGrid + StickyInstallBar. Passa callbacks pros filhos.

**`components/StickyInstallBar.tsx`** — Dialog do shadcn. Trigger é o botão fixed bottom. Dentro renderiza InstallPromptViewer + ScopeSelector. Toast via sonner.

**`app/page.tsx`** — server component, `export const revalidate = 300`, chama getSkills() em build/revalidate, passa pros componentes client.

### Sync script — abordagem

Bash com `set -euo pipefail`. Lockfile via `flock -n` (non-blocking). Debounce por `stat -c %Y` do lockfile. `git pull --rebase --autostash` (abort em conflito real). `rsync -aL --delete --safe-links --exclude=...`. Idempotência via `git diff --quiet`. Commit + push com error log. **Nunca force-push.**

### Templates de install prompt

3 strings parametrizadas por escopo. Diferem em:
- Caminho destino (`~/.claude/skills/` vs `<project>/.claude/skills/`)
- Passos extras (mkdir, gitignore)
- Texto descritivo no header

Comum: clone source uma vez em `~/.claude/lp-skills-source/`, hook SessionStart de pull global.

## 4. Mapa Test Case → Código

| TC | Código que atende | Edge cases |
|---|---|---|
| TC-1 SkillCard toggle | `SkillCard.tsx` + `SkillsClient.tsx` (estado Set) | Re-render com referência nova do Set (não mutate) |
| TC-2 ScopeSelector regenera prompt | `ScopeSelector.tsx` + `install-prompt.ts` | useMemo dependency [skills, scope] |
| TC-3 Copy + toast | `InstallPromptViewer.tsx` + sonner toast | navigator.clipboard pode ser undefined em iframe http — fallback document.execCommand |
| TC-4 Empty state | `StickyInstallBar.tsx` | size === 0 → botão disabled + texto explicativo |
| TC-5 Grid renderiza todas | `app/page.tsx` + `lib/skills.ts` | SKILL.md ausente → skip silencioso (já no parser) |
| TC-6 Responsive | `SkillGrid.tsx` Tailwind grid-cols-1 md:grid-cols-2 lg:grid-cols-3 | StickyBar com pb-24 no main pra não cobrir |
| TC-7 Sync primeira execução | `scripts/sync-from-local.sh` | Pull rebase pode dar conflito; abort + log |
| TC-8 Sync idempotente | `scripts/sync-from-local.sh` | `git diff --quiet skills/ && exit 0` antes do commit |
| TC-9 Symlink resolution | rsync `-aL` flag | --safe-links evita cycles infinitos |
| TC-10 Debounce + lockfile | `flock -n` + mtime check | Lockfile pode ficar zumbi se shell crasha — flock libera no exit |

## 5. Riscos e Pontos de Atenção

- **Vercel build path**: skills/ na raiz, Next.js também na raiz. `process.cwd()` no build = raiz do repo. Confirmar.
- **rsync ausente em Linux mínimo**: improvável em dev box, mas script roda só na máquina do autor (já tem rsync).
- **Permissões no script**: precisa `chmod +x`. Conferir no setup.
- **`set -euo pipefail` + lockfile**: se script morre antes do trap, lockfile fica. Usar `exec 9>$LOCK; flock -n 9` — fd fecha no exit, lock libera.
- **Hook SessionStart global**: pode rodar em qualquer projeto. Roda async com `&` — não afeta. Mas se o script falhar, logs em /tmp/. Mensagem clara no log.
- **Skills com nome com espaço/acento**: improvável (usuário usa kebab-case), mas o ln/symlink no install prompt assume sem espaços. Documentar limitação.
- **Tailwind v4 vs v3**: shadcn em maio/2026 oficialmente suporta v4. Se houver issue, fallback para v3.
- **Mascaramento de credenciais**: fazer ANTES do primeiro push. Edit em `~/.claude/skills/jira/SKILL.md` e re-sync, OU edit direto em `./skills/jira/SKILL.md` no repo após primeiro sync.
- **Não publicar /method artifacts**: `docs/`, `kanban/`, arquivos `*.bak*` no .gitignore.

## 6. Checklist de Implementação

### Setup
- [ ] `npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"`
- [ ] `npm install gray-matter lucide-react clsx tailwind-merge`
- [ ] `npx shadcn@latest init` — style new-york, base color neutral
- [ ] `npx shadcn@latest add button card checkbox tabs dialog sonner badge tooltip`
- [ ] `app/layout.tsx`: importar Geist via `next/font/google`, metadata SEO
- [ ] `app/globals.css`: tokens dark via `@theme`
- [ ] Smoke: `npm run dev`, abrir http://localhost:3000 — vê "Hello Next.js"

### Library
- [ ] `lib/utils.ts` (shadcn default `cn()`)
- [ ] `lib/skills.ts` — interface Skill, getSkills() lendo `./skills/`
- [ ] `lib/install-prompt.ts` — generatePrompt({skills, scope})

### Componentes
- [ ] `components/Hero.tsx`
- [ ] `components/SkillCard.tsx`
- [ ] `components/SkillGrid.tsx`
- [ ] `components/ScopeSelector.tsx`
- [ ] `components/InstallPromptViewer.tsx`
- [ ] `components/StickyInstallBar.tsx`
- [ ] `components/SkillsClient.tsx`

### Página
- [ ] `app/page.tsx` — server component, getSkills(), revalidate 300
- [ ] Toaster wired no layout

### Sync
- [ ] `scripts/sync-from-local.sh` (chmod +x)
- [ ] Execução manual: bash scripts/sync-from-local.sh → ./skills/ populado

### Pré-pub
- [ ] Mascarar `test2@test.com / Test123!@#` em skills/jira/SKILL.md e references
- [ ] `.gitignore` com node_modules, .next, .env*, *.log, *.bak*, *.backup, *.7z, kanban/, docs/, .vercel
- [ ] `README.md` com badge da LP, install one-liner, link, contribuição
- [ ] git init, first commit "feat: initial LP scaffold + skills"

### Push & Deploy
- [ ] `gh repo create lp-skills --public --source=. --push`
- [ ] Conectar Vercel via dashboard → first deploy
- [ ] Validar URL pública responde

### Hook
- [ ] Adicionar entry em ~/.claude/settings.json (SessionStart) → comando aponta para o script absoluto
- [ ] Abrir nova sessão e validar (não deve haver mudança = no-op)
