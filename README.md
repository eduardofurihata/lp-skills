# lp-skills

Landing page que cataloga as skills do Claude Code do [Furihata](https://github.com/furihata) e gera um prompt para instalar com auto-update.

## Para usuários

Acesse a LP, selecione as skills, escolha o escopo (Global / Projeto / Projeto local) e cole o prompt gerado no seu Claude Code.

Cada nova sessão do Claude Code roda `git pull` no diretório fonte automaticamente, então atualizações chegam sem intervenção.

## Estrutura

```
lp-skills/
├── skills/             # source of truth — clonado pelos usuários
├── app/                # Next.js App Router (a LP)
├── components/         # React components
├── lib/                # utilitários (skill reader + prompt generator)
└── scripts/
    └── sync-from-local.sh   # hook do autor: ~/.claude/skills → repo
```

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Radix UI · sonner · Geist · gray-matter.

## Dev local

```bash
pnpm install
pnpm dev
```

Acesse http://localhost:3000.

## Sync do autor

O script `scripts/sync-from-local.sh` é disparado via hook `SessionStart` do Claude Code. A cada nova sessão, ele:

1. Adquire lockfile + debounce de 30s.
2. `git pull --rebase --autostash` (se houver remote).
3. `rsync -aL --delete --safe-links` de `~/.claude/skills/` para `./skills/` (resolvendo symlinks).
4. Mascara credenciais de teste conhecidas.
5. Commit + push se houver diff.

Logs em `/tmp/lp-skills-sync.log`.

## Licença

MIT.
