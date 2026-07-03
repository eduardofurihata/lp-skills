# LP de Skills com Auto-Sync

> **⚠️ Superseded** por `plugin-marketplace` (2026-07-03). O mecanismo de distribuição (symlink em `~/.claude/skills/` + hook `git pull`) foi migrado para o **Claude Code plugin marketplace nativo**, porque o symlink+hook não funciona em todo SO (quebra no Windows). Ver `docs/**/plugin-marketplace.md`. Este thread fica como registro histórico.

## Problema
Não existe um canal público para distribuir as skills pessoais do Claude Code do Furihata com auto-update transparente para os usuários finais.

## Contexto
Furihata criou ~24 skills úteis (method, commit, jira, ui-ux-pro-max etc.) em `~/.claude/skills/`. Atualmente são privadas. Para compartilhar precisaria copiar manualmente, e qualquer atualização exigiria os destinatários re-instalarem. Quer uma landing page onde devs selecionam skills, copiam um prompt e o Claude Code instala via symlinks que apontam para um repo clonado — fazendo `git pull` automático a cada sessão.

## Afetados
- **Autor (Furihata)** — quer publicar skills sem fricção; mudanças locais devem propagar sem trabalho manual
- **Devs usuários do Claude Code** — querem skills curadas, instalação em 1 paste, atualizações automáticas
- **Time interno (potencial)** — quer compartilhar skills selecionadas em projeto específico (escopo "projeto compartilhado")
