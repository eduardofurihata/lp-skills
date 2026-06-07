# lp-skills

Landing page que cataloga as skills do Claude Code do [Furihata](https://github.com/furihata) e gera um prompt para instalar com auto-update. As skills são separadas em duas categorias: **Pessoal** e **Eduzz** (trabalho).

## Para usuários

Acesse a LP, filtre por categoria (Todas / Pessoal / Eduzz), selecione as skills, escolha o escopo (Global / Projeto / Projeto local) e cole o prompt gerado no seu Claude Code.

Cada nova sessão do Claude Code roda `git pull` no diretório fonte automaticamente, então atualizações chegam sem intervenção.

## Estrutura

```
lp-skills/
├── skills/             # source of truth — symlinkado em ~/.claude/skills/
│   ├── personal/       # skills pessoais (chat, commit, method, make-dev…)
│   └── eduzz/          # skills de trabalho (jira, afl, notion-pull, notion-push)
├── app/                # Next.js App Router (a LP)
├── components/         # React components
└── lib/                # utilitários (categories + skill reader + prompt generator)
```

A categoria de cada skill é **derivada da pasta-pai** (`personal`/`eduzz`); o destino do symlink em `~/.claude/skills/<nome>` continua plano (o Claude Code carrega skills de um nível só).

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Radix UI · sonner · Geist · gray-matter.

## Dev local

```bash
pnpm install
pnpm dev
```

Acesse http://localhost:3000.

## Workflow do autor

As skills moram aqui no repo, dentro do bucket da categoria. Em `~/.claude/skills/<nome>` há um symlink apontando para `skills/<categoria>/<nome>/` deste repositório. Editar aqui = mudança imediata no Claude Code local, sem sync.

```bash
ln -s ~/GitHub/lp-skills/skills/<categoria>/<nome> ~/.claude/skills/<nome>
```

Skills de outros repos (ex.: `ui-ux-pro-max`) permanecem instaladas no global por outros meios e não vivem aqui.

## Licença

MIT.
