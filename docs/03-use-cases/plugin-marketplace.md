# Distribuição de Skills via Plugin Marketplace — Use Cases

## UC-1 — Dev adiciona o marketplace (qualquer SO)
- **Ator**: Dev
- **Precondição**: Claude Code v2.1.142+ instalado e autenticado
- **Fluxo**: 1) Roda `/plugin marketplace add eduardofurihata/lp-skills`; 2) Claude Code clona o repo pro cache interno; 3) lê `.claude-plugin/marketplace.json`
- **Resultado**: Marketplace `lp-skills` registrado; 19 plugins ficam disponíveis em `/plugin`. Idêntico em Windows/Mac/Linux.

## UC-2 — Dev instala uma skill sem dependências
- **Ator**: Dev
- **Precondição**: Marketplace adicionado
- **Fluxo**: 1) `/plugin install commit@lp-skills`; 2) Claude Code **copia** o dir do plugin pro cache `~/.claude/plugins/`; 3) `/reload-plugins` ou nova sessão
- **Resultado**: `/commit` invocável (nome bare, do frontmatter `name`). Nenhum symlink criado.

## UC-3 — Dev instala uma skill com cadeia de dependências
- **Ator**: Dev
- **Precondição**: Marketplace adicionado
- **Fluxo**: 1) `/plugin install afl@lp-skills`; 2) Claude Code lê `dependencies` e instala transitivamente `jira` → `method` → `solve`
- **Resultado**: `afl`, `jira`, `method`, `solve` instalados; `/afl` funciona e suas chamadas internas a `/jira`, `/method` resolvem.

## UC-4 — Dev no Windows instala e usa
- **Ator**: Dev (Windows nativo, sem Developer Mode)
- **Precondição**: Marketplace adicionado
- **Fluxo**: 1) `/plugin install merge@lp-skills`; 2) Claude Code copia pro cache per-OS (sem `ln`, sem hook, sem `~`)
- **Resultado**: `/merge` funciona no Windows exatamente como no Linux. Sem cópia manual.

## UC-5 — Dev atualiza skills instaladas
- **Ator**: Dev (já instalou antes)
- **Precondição**: Autor deu push de commits novos
- **Fluxo**: 1) `/plugin marketplace update`; 2) Claude Code re-pull do marketplace; 3) versionamento por git-SHA marca cada commit como versão nova; 4) plugins instalados atualizam
- **Resultado**: Skills na versão mais recente, sem reinstalar.

## UC-6 — Dev filtra por categoria (bucket de trabalho)
- **Ator**: Dev do time Eduzz
- **Precondição**: Marketplace adicionado
- **Fluxo**: 1) Abre `/plugin`; 2) vê os plugins com `category` (`personal`/`eduzz`); 3) instala só os `eduzz`
- **Resultado**: Só skills de trabalho instaladas.

## UC-7 — Visitante da LP gera os comandos de instalação
- **Ator**: Visitante do site
- **Precondição**: LP publicada
- **Fluxo**: 1) Seleciona N skills + escopo; 2) LP mostra os comandos `/plugin marketplace add` + `/plugin install <skill>@lp-skills` (deps já expandidas); 3) copia
- **Resultado**: Comandos no clipboard, prontos pra colar no Claude Code.

## UC-8 — Autor gera os manifestos a partir do frontmatter
- **Ator**: Autor
- **Precondição**: Skills em `skills/<cat>/<skill>/SKILL.md` com frontmatter `name`, `description`, `requires`
- **Fluxo**: 1) Roda o gerador (`pnpm gen:plugins`); 2) script lê o frontmatter; 3) emite `skills/<cat>/<skill>/.claude-plugin/plugin.json` (name, description, dependencies) e `.claude-plugin/marketplace.json`
- **Resultado**: 19 plugin.json + marketplace.json gerados, consistentes com o frontmatter. Zero edição manual.

## UC-9 — Autor descontinua o mecanismo antigo (cleanup)
- **Ator**: Autor
- **Precondição**: `~/.claude/skills/*` tem symlinks pro repo; `~/.claude/settings.json` tem hook `SessionStart` → `sync-skills.sh`
- **Fluxo**: 1) Remove os symlinks que apontam pra `GitHub/lp-skills/skills`; 2) remove o hook `SessionStart` do `sync-skills.sh` no settings; 3) preserva skills não geridas por este repo (`ui-ux-pro-max`, `video-teams`)
- **Resultado**: Claude Code limpo do mecanismo antigo; nenhuma skill de terceiros afetada.

## UC-10 — Autor instala globalmente e valida em CLI novo
- **Ator**: Autor
- **Precondição**: Marketplace publicado no GitHub; cleanup feito
- **Fluxo**: 1) `/plugin marketplace add …` + instala os plugins globalmente; 2) abre **novo** CLI (`claude`); 3) confere `claude plugin list` e invoca uma skill
- **Resultado**: Skills disponíveis globalmente via marketplace; invocação bare funciona; sem symlink.

## UC-11 — Autor mantém edição com feedback imediato (dev loop)
- **Ator**: Autor
- **Precondição**: Repo clonado localmente
- **Fluxo**: 1) Edita `skills/<cat>/<skill>/SKILL.md`; 2) carrega a skill em modo dev in-place (`--plugin-dir` no dir do plugin ou `@skills-dir`) em vez do cache; 3) vê a mudança na sessão
- **Resultado**: Loop de autoria imediato preservado; distribuição continua pelo marketplace (publish → update).

## UC-12 — Skill removida/renomeada no repo
- **Ator**: Autor
- **Precondição**: Skill existe no marketplace e devs a instalaram
- **Fluxo**: 1) Autor remove a skill do repo e regenera; 2) opcionalmente registra em `renames` do marketplace.json; 3) push
- **Resultado**: No próximo `/plugin marketplace update` o dev migra/deixa de ver a skill sem erro fatal.

## UC-13 — Dev sem internet tenta adicionar o marketplace
- **Ator**: Dev
- **Precondição**: Sem conexão
- **Fluxo**: 1) `/plugin marketplace add …`; 2) clone falha
- **Resultado**: Claude Code reporta erro de rede; nada instalado, sem estado parcial. Retenta online.

## UC-14 — Colisão de nome de skill já instalada de outra fonte
- **Ator**: Dev
- **Precondição**: Dev já tem uma skill `merge` de outra origem (ou skills-dir local)
- **Fluxo**: 1) Instala `merge@lp-skills`; 2) Claude Code resolve pelo namespace de marketplace (`merge@lp-skills`) e sinaliza conflito de invocação se houver
- **Resultado**: Instalação não silencia conflito; dev escolhe qual manter. (Escopo desta migração: garantir que o nosso plugin declare nome estável; resolução de conflito é do Claude Code.)
