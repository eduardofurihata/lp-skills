# lp-skills

Landing page que cataloga as skills do Claude Code do [Furihata](https://github.com/furihata) e gera um prompt para instalar com auto-update.

## Para usuários

Acesse a LP, selecione as skills, escolha o escopo (Global / Projeto / Projeto local) e cole o prompt gerado no seu Claude Code.

Cada nova sessão do Claude Code roda `git pull` no diretório fonte automaticamente, então atualizações chegam sem intervenção.

## Estrutura

```
lp-skills/
├── skills/             # source of truth — symlinkado em ~/.claude/skills/
├── app/                # Next.js App Router (a LP)
├── components/         # React components
└── lib/                # utilitários (skill reader + prompt generator)
```

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Radix UI · sonner · Geist · gray-matter.

## Dev local

```bash
pnpm install
pnpm dev
```

Acesse http://localhost:3000.

## Workflow do autor

As skills moram aqui no repo. Em `~/.claude/skills/<nome>` há um symlink apontando para `skills/<nome>/` deste repositório. Editar aqui = mudança imediata no Claude Code local, sem sync.

```bash
ln -s ~/GitHub/lp-skills/skills/<nome> ~/.claude/skills/<nome>
```

Skills de outros repos (`make-dev`, `ui-ux-pro-max`) permanecem instaladas no global por outros meios e não vivem aqui.

## Licença

MIT.
