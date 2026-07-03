# Distribuição de Skills via Plugin Marketplace — User Stories

## Dev usuário (público / dev no Windows)
- Como dev, quero adicionar o marketplace e instalar uma skill com 2 comandos (`/plugin marketplace add` + `/plugin install`), para não depender de symlink nem de hook bash.
- Como dev no **Windows**, quero que a instalação funcione igual ao Mac/Linux, para parar de copiar skill na mão a cada atualização.
- Como dev, quero que instalar uma skill traga automaticamente as skills de que ela depende (ex.: `jira` puxa `method` → `solve`), para não ter que descobrir e instalar dependências manualmente.
- Como dev, quero invocar a skill pelo nome curto (`/merge`, `/method`), para não quebrar a memória muscular nem as referências que uma skill faz a outra.
- Como dev, quero rodar um comando de update (`/plugin marketplace update`) e receber a versão nova, para ficar sempre atualizado sem reinstalar.
- Como dev do time Eduzz, quero filtrar/instalar só o bucket de trabalho (categoria `eduzz`), para não poluir meu setup com skills pessoais.

## Autor (Furihata)
- Como autor, quero publicar as skills por um canal nativo do Claude Code, para que a distribuição não quebre pelo SO do destinatário.
- Como autor, quero que os manifestos de plugin sejam **gerados** a partir do frontmatter dos `SKILL.md` (fonte única), para não manter 19 arquivos à mão que divergem.
- Como autor, quero descontinuar os symlinks `~/.claude/skills/*` e o hook `sync-skills` deste repo e limpar meu Claude Code, para eliminar o mecanismo antigo que confundia (edição local parecia "publicada").
- Como autor, quero instalar o marketplace globalmente na minha máquina e validar num CLI novo, para dogfoodar exatamente o que o dev recebe.
- Como autor, quero documentar a instalação no README e na LP, para que qualquer dev instale sem eu explicar.
- Como autor, quero continuar editando skills com feedback imediato durante o desenvolvimento, para não perder o loop de autoria rápido.

## LP (site)
- Como visitante da LP, quero selecionar skills e escopo e copiar os comandos `/plugin` prontos, para instalar sem montar comando na mão.
