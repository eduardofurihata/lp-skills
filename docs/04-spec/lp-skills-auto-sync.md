# LP de Skills com Auto-Sync — Spec

> **Autonomous Decision Loop:** 2 rounds, 42 decisões, zero ambiguidades.

## Escopo de Plataforma (derivado)

- **Web only** — LP renderizada em browsers. Sem app mobile no projeto.
- **Responsivo obrigatório** — grid de cards reflowa em mobile (1col), tablet (2col), desktop (3col). Sticky bar inferior em mobile.

## Stack Técnica

| Decisão | Valor | Justificativa | Referência | Alternativas descartadas |
|---|---|---|---|---|
| Framework | Next.js 15 (App Router) | Padrão de mercado para LP estática + ISR, deploy Vercel nativo, React Server Components reduz JS no client | Vercel, Linear, Anthropic.com | Astro (menos integrado com Vercel), Remix (overkill para LP) |
| Linguagem | TypeScript estrito | Type-safety no parser de frontmatter + props de componentes | Vercel/Anthropic codebases | JavaScript (perde safety) |
| Styling | Tailwind v4 | Padrão shadcn/ui, dark mode trivial, design tokens via @theme | Vercel, Linear | CSS Modules (verboso), styled-components (RSC issues) |
| Componentes | shadcn/ui (Button, Card, Checkbox, Tabs, Dialog, Toast) | Não reinventar primitives, copy-paste accessible, padrão da comunidade | Vercel templates, Linear | Radix puro (mais código), MUI (peso) |
| Fonts | Geist Sans + Geist Mono via `next/font` | Tipografia Vercel/Anthropic, otimizada (zero CLS), bold pesos servem o tema | Vercel, Anthropic | Inter (mais comum mas menos distinto) |
| Parser frontmatter | `gray-matter` | Padrão para YAML frontmatter em md, leve | Next.js docs, gatsby | Custom parser (reinventar) |
| Ícones | `lucide-react` | Default do shadcn/ui, tree-shakeable | shadcn | heroicons (menos coberto) |
| Estado client | `useState` lifted (sem store global) | Estado é trivial (skills selecionadas + escopo), Zustand overkill | React docs | Zustand (overkill), Context (re-render issues) |
| Clipboard | `navigator.clipboard.writeText` + toast | API nativa, sem dependência | MDN, shadcn toast | copy-to-clipboard lib |
| Hosting | Vercel | Deploy automático via GitHub, ISR nativo, free tier suficiente | (escolha do usuário) | GitHub Pages (sem ISR), Cloudflare Pages |

## Estrutura de Arquivos (repo `lp-skills`)

```
lp-skills/
├── skills/                           # source of truth (sync from local)
│   ├── method/SKILL.md
│   ├── commit/SKILL.md
│   └── ... (24 skills)
├── app/
│   ├── layout.tsx                    # Geist font, body dark
│   ├── page.tsx                      # Hero + SkillGrid + StickyBar
│   ├── globals.css                   # Tailwind + tokens
│   └── api/skills/route.ts           # JSON endpoint público (opcional)
├── components/
│   ├── ui/                           # shadcn primitives
│   ├── Hero.tsx
│   ├── SkillCard.tsx
│   ├── SkillGrid.tsx
│   ├── ScopeSelector.tsx
│   ├── InstallPromptViewer.tsx
│   └── StickyInstallBar.tsx
├── lib/
│   ├── skills.ts                     # filesystem reader + gray-matter
│   ├── install-prompt.ts             # gerador do prompt por escopo
│   └── utils.ts                      # cn() do shadcn
├── public/
│   └── og-image.png                  # opcional
├── scripts/
│   └── sync-from-local.sh            # hook do autor
├── docs/                             # /method artifacts
├── kanban/                           # /method artifacts
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts                # se v4 exigir
├── components.json                   # shadcn config
├── README.md
└── .gitignore
```

## Sync do Autor (`scripts/sync-from-local.sh`)

```bash
#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/home/furihata/GitHub/lp-skills"
LOCAL_SKILLS="$HOME/.claude/skills"
LOCK="/tmp/lp-skills-sync.lock"
LOG="/tmp/lp-skills-sync.log"
DEBOUNCE_SEC=30

# Debounce
if [[ -f "$LOCK" ]]; then
  age=$(( $(date +%s) - $(stat -c %Y "$LOCK") ))
  [[ $age -lt $DEBOUNCE_SEC ]] && exit 0
fi

# Lock (non-blocking)
exec 9>"$LOCK"
flock -n 9 || exit 0
touch "$LOCK"

cd "$REPO_DIR" || { echo "$(date -Iseconds) repo missing" >> "$LOG"; exit 1; }

# Pull com rebase
if ! git pull --rebase --autostash origin main 2>>"$LOG"; then
  echo "$(date -Iseconds) pull/rebase failed, aborting" >> "$LOG"
  git rebase --abort 2>/dev/null || true
  exit 1
fi

# Sync com symlinks resolvidos + excludes
rsync -aL --delete \
  --exclude='*.bak' --exclude='*.bak*' \
  --exclude='*.backup' --exclude='*.7z' \
  --safe-links \
  "$LOCAL_SKILLS/" "$REPO_DIR/skills/"

# Idempotência
if git diff --quiet skills/ && git diff --cached --quiet skills/; then
  exit 0
fi

git add skills/
git commit -m "chore(sync): skills $(date -Iseconds)" 2>>"$LOG"

if ! git push origin main 2>>"$LOG"; then
  echo "$(date -Iseconds) push failed" >> "$LOG"
  exit 1
fi
```

**Hook em `~/.claude/settings.json`:**
```json
{
  "hooks": {
    "SessionStart": [
      {"matcher":"","hooks":[{"type":"command","command":"/home/furihata/GitHub/lp-skills/scripts/sync-from-local.sh &"}]}
    ]
  }
}
```

## Geração do Install Prompt (`lib/install-prompt.ts`)

Função pura: `generatePrompt({ skills: string[], scope: 'global' | 'project-shared' | 'project-local' }): string`

### Template Global
```
Por favor, instale estas skills do Claude Code do repositório público de Furihata:

Repositório: https://github.com/furihata/lp-skills
Skills selecionadas: <skills>
Escopo: Global (~/.claude/skills/)

Execute os passos abaixo:

1. Clone ou atualize o repositório fonte:
   if [ ! -d ~/.claude/lp-skills-source ]; then
     git clone https://github.com/furihata/lp-skills ~/.claude/lp-skills-source
   else
     git -C ~/.claude/lp-skills-source pull --ff-only
   fi

2. Para cada skill em [<skills>], crie symlink em ~/.claude/skills/:
   - Se o diretório já existir como pasta real, mover para backup: mv ~/.claude/skills/<skill> ~/.claude/skills/<skill>.backup-$(date +%s)
   - Se já for symlink antigo, sobrescrever: ln -sfn ~/.claude/lp-skills-source/skills/<skill> ~/.claude/skills/<skill>

3. Configure auto-update via hook em ~/.claude/settings.json:
   - No array hooks.SessionStart, adicione (sem duplicar):
     {"matcher":"","hooks":[{"type":"command","command":"git -C ~/.claude/lp-skills-source pull --ff-only -q 2>/dev/null &"}]}

4. Verifique: ls -la ~/.claude/skills/ | grep lp-skills-source

5. Reporte sucesso ou erros.
```

### Template Projeto Compartilhado
Mesma estrutura, mas no passo 2: destino `<project>/.claude/skills/<skill>`. Adiciona passo:
```
0. Garanta que está no diretório raiz do projeto. Se .claude/skills/ não existir, mkdir -p .claude/skills/
```

### Template Projeto Local
Mesma estrutura do "Projeto Compartilhado", mas adiciona passo:
```
0a. Adicione `.claude/skills/` ao .gitignore do projeto (se ainda não estiver). echo ".claude/skills/" >> .gitignore
```

## Leitor de Skills (`lib/skills.ts`)

```typescript
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

export interface Skill {
  slug: string;
  name: string;
  description: string;
  effort?: string;
  argumentHint?: string;
  hasReferences: boolean;
  hasScripts: boolean;
  hasData: boolean;
}

export async function getSkills(): Promise<Skill[]> {
  const skillsDir = path.resolve(process.cwd(), 'skills');
  const entries = await fs.readdir(skillsDir, { withFileTypes: true });
  const skillDirs = entries.filter(e => e.isDirectory() && !e.name.startsWith('.'));

  const skills = await Promise.all(skillDirs.map(async dir => {
    const skillPath = path.join(skillsDir, dir.name);
    const skillFile = path.join(skillPath, 'SKILL.md');
    try {
      const content = await fs.readFile(skillFile, 'utf-8');
      const { data } = matter(content);
      const subdirs = await fs.readdir(skillPath, { withFileTypes: true });
      return {
        slug: dir.name,
        name: data.name ?? dir.name,
        description: data.description ?? '',
        effort: data.effort,
        argumentHint: data['argument-hint'],
        hasReferences: subdirs.some(d => d.isDirectory() && d.name === 'references'),
        hasScripts: subdirs.some(d => d.isDirectory() && d.name === 'scripts'),
        hasData: subdirs.some(d => d.isDirectory() && d.name === 'data'),
      };
    } catch {
      return null;
    }
  }));

  return skills.filter((s): s is Skill => s !== null).sort((a, b) => a.name.localeCompare(b.name));
}
```

## Página Principal (`app/page.tsx`)

- `export const revalidate = 300` (ISR 5min como safety net)
- Server component que chama `getSkills()` em build/revalidate
- Composição: `<Hero count={skills.length} />` → `<SkillsClient skills={skills} />` (client component que carrega seleção/escopo/sticky)

## Componentes — Design System

### Tokens (CSS variables em `globals.css`)
```css
@theme {
  --color-bg: #0A0A0A;
  --color-surface: #111111;
  --color-border: #1F1F1F;
  --color-text: #FAFAFA;
  --color-text-muted: #A1A1AA;
  --color-accent: #7C3AED;
  --color-accent-soft: #7C3AED20;
}
```

### Hero
- H1 bold 5xl-7xl: "Claude Code skills, curated."
- Subtítulo muted text-lg: "<N> skills do meu setup pessoal. Selecione, copie, cole no seu Claude Code."
- Padding generoso (py-24)

### SkillCard
- Card surface bg, border, hover lift sutil
- Header: nome (font-bold), badge effort se houver (small, accent-soft bg)
- Description: text-muted, 3-4 linhas max com line-clamp
- Footer: ícones discretos para has Refs/Scripts/Data (lucide)
- Toggle: clique no card todo seleciona; quando selecionado, borda accent + bg accent-soft
- Checkbox visual no canto superior direito

### ScopeSelector
- Segmented control 3 abas usando shadcn Tabs estilizado
- Labels: "Global", "Projeto", "Projeto (local)"
- Subtítulo abaixo descrevendo cada (tooltip ou caption)

### InstallPromptViewer
- `<pre>` com bg surface, font Geist Mono, texto wrap
- Botão Copy no canto superior direito (variant outline)
- Toast on copy: "Copiado!"

### StickyInstallBar
- Fixed bottom, surface bg, border top accent quando há seleção
- Texto: "<N> skill<plural> selecionada<plural>" + ScopeSelector inline em md+
- Botão CTA accent: "Copiar prompt de instalação" → abre Dialog com InstallPromptViewer

## Acessibilidade

- Contraste mínimo WCAG AA (verificar tokens) ✅ (#FAFAFA on #0A0A0A = 19:1)
- Cards focáveis via tab, Enter/Space toggle (use shadcn Checkbox semantics)
- Aria-label nos botões de copy/sticky
- Sem motion problemática (sem parallax/auto-animate); transições < 300ms

## Performance

- Server components prerender, ISR 300s
- Geist via next/font (zero CLS)
- Sem chamadas externas no client (skills vêm prerendered)
- Lighthouse target: ≥95 perf, ≥95 a11y, ≥100 SEO

## SEO

- `<title>` em layout: "Claude Code Skills — Furihata"
- Meta description: "<N> skills curadas do Claude Code. Selecione, copie o prompt e instale com auto-update."
- OG image opcional (`public/og-image.png`)
- `robots: index, follow`

## Segurança

- **Sem secrets no repo público** — scan já feito; vou mascarar `test2@test.com / Test123!@#` em `skills/jira/SKILL.md` para `<placeholder-email> / <placeholder-password>` antes do primeiro push
- **CSP**: Next.js padrão; sem inline scripts (next/script para tudo)
- **Sem analytics invasivos** no MVP
- **CORS**: API `/api/skills` só GET, mesma origem por padrão; se exposta cross-origin no futuro, header `Access-Control-Allow-Origin: *` ok (dados públicos)
- **Bash do install prompt**: instruções incluem `mv $dir $dir.backup-$(date +%s)` antes de `ln -sfn` (proteção contra perda de dados do usuário). Claude Code do destinatário valida antes de executar.

## Build & Deploy

- Repo `https://github.com/furihata/lp-skills` (público)
- Vercel project conectado: rootDirectory raiz, build command `next build`
- Webhook GitHub → Vercel rebuild automático em cada push
- ISR 300s como safety net se webhook falhar

## Decisões UI/UX adicionais (round 2)

| Decisão | Valor | Referência |
|---|---|---|
| Cards: hover shadow | `hover:shadow-[0_0_0_1px_var(--color-accent)]` | Vercel cards |
| Animations | Fade-in stagger no grid (50ms entre cards), CSS-only | Linear |
| Empty state | "Selecione skills para gerar o prompt" no StickyBar | Notion |
| Mobile menu | Não há nav; LP single-page sem header complexo | Linear LP |
| Loading | Sem skeleton (página estática); fallback ISR transparente | Vercel |
| Error boundary | `not-found.tsx` + `error.tsx` defaults Next.js | Next.js docs |
| Dark only | Sem toggle light/dark no MVP (público dev) | Linear |
| Localization | Português + Inglês? **Não no MVP** — strings em PT (público inicial brasileiro) | YAGNI |

## Gateway 4 → 5 ✅

- [x] Autonomous Decision Loop fechou com zero gaps (2 rounds)
- [x] Cada decisão com justificativa + referência + alternativas
- [x] Escopo de plataforma derivado (web only, responsivo)
- [x] Artefato substantivo
