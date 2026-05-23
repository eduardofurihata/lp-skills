# LP de Skills com Auto-Sync — User Stories

## Autor (Furihata)
- Como autor de skills, quero que criar/editar uma skill em `~/.claude/skills/` automaticamente sincronize com o repositório público, para não precisar fazer commits manuais sempre que iterar.
- Como autor, quero que skills via symlink (ex: `make-dev` apontando para `labzz-skillzz`) sejam resolvidas no sync, para que o conteúdo real apareça no repo público.
- Como autor, quero ver no log se algum sync falhou (ex: push rejeitado), para resolver conflitos manualmente sem perda de dados.
- Como autor, quero excluir arquivos `.bak`, `.backup`, `.7z` do sync, para manter o repo público limpo.
- Como autor, quero mascarar credenciais de teste (`test2@test.com / Test123!@#` no skill `jira`) antes do primeiro push público, para não vazar nada.

## Dev usuário (público geral)
- Como dev, quero ver todas as skills disponíveis numa landing page com descrição clara, para decidir quais instalar.
- Como dev, quero selecionar múltiplas skills com checkboxes, para instalar apenas as que me interessam.
- Como dev, quero escolher o escopo de instalação (Global, Projeto compartilhado, Projeto local), para que as skills fiquem no lugar certo do meu setup.
- Como dev, quero copiar um prompt pronto e colar no meu Claude Code, para que a instalação seja 1 paste sem comandos manuais.
- Como dev, quero que minhas skills instaladas atualizem automaticamente quando o autor publica versão nova, para não precisar reinstalar.
- Como dev, quero que a LP em tema dark seja rápida (estática, sem flash de loading), para boa UX em qualquer rede.

## Time / Stakeholder (escopo Projeto compartilhado)
- Como tech lead de um projeto, quero que skills selecionadas sejam commitadas no `.claude/skills/` do projeto, para que toda a equipe tenha o mesmo setup ao clonar o repo.

## Time / Stakeholder (escopo Projeto local)
- Como dev em projeto compartilhado, quero instalar skills no projeto sem que entrem no git do projeto (gitignored), para uso pessoal sem impactar a equipe.
