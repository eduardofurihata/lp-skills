# Distribuição de Skills via Plugin Marketplace

## Problema
A distribuição atual das skills (symlink em `~/.claude/skills/` + hook bash de `git pull`) **não funciona em todo sistema operacional** — no Windows o "symlink" vira cópia congelada e o hook POSIX (`~`, `/dev/null`, `ln`, `&`) não roda, forçando o outro dev a copiar as skills manualmente a cada atualização.

## Contexto
O mecanismo antigo (thread `lp-skills-auto-sync`, shipado em 2026-05-22) assume primitivos POSIX: `ln -s` para linkar `~/.claude/skills/<skill>` → clone do repo, e um hook `SessionStart` rodando `git -C … pull --ff-only … &`. Em Linux/Mac funciona; no Windows nativo (cmd/PowerShell) `ln` copia em vez de linkar (sem Developer Mode + `winsymlinks:nativestrict`), `~` não expande, `/dev/null` não existe e `&` tem outra semântica — o `2>/dev/null` engole o erro e o sync falha em silêncio. O Claude Code tem um mecanismo **nativo** de distribuição — plugin marketplace — que clona e **copia** o plugin pro cache per-OS ele mesmo (`~/.claude/plugins/`), sem symlink, sem hook, sem caso-especial de Windows. Esta migração substitui o thread `lp-skills-auto-sync`.

## Afetados
- **Dev usuário (ex.: o dev no Windows)** — hoje não recebe atualização automática e copia skill na mão; quer instalar 1× e receber updates em qualquer SO.
- **Autor (Furihata)** — quer publicar/atualizar skills sem que a distribuição quebre por SO do destinatário, mantendo a invocação curta (`/merge`, `/method`) e o grafo de dependências entre skills.
- **Time interno (Eduzz)** — quer instalar só o bucket de trabalho e receber updates transparentes.
