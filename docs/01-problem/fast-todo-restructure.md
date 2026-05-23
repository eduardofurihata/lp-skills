# Fast/Todo — Restructure

## Problema

O `/fast` para no step 7b e exige `/test` para encerrar a feature, mas o desenvolvedor frequentemente quer encerrar o ciclo de dev sem rodar o QA formal — testando manualmente ou deixando QA para depois.

## Contexto

O fluxo atual de skills no projeto lp-skills é:
- `/method` — 11 steps completos (full rigor)
- `/fast` — steps 1-7b (planejamento + codificação), cria `docs/todo/<feature>.md` com `status: pending-test`
- `/test` — steps 8-10 (code review, testing via front, done) para features pendentes

Esse modelo bloqueia o ciclo de dev: feature criada por `/fast` fica em `pending-test` até `/test` rodar. Para mudanças onde o desenvolvedor quer testar manualmente, isso é fricção desnecessária.

Adicionalmente, o naming `/test` é genérico e não reflete o que a skill faz: ela processa o que está em `docs/todo/`. O slash command natural seria `/todo`.

Por fim, ao escrever as novas descriptions com `\`tests: pending\``, o YAML parser do `gray-matter` interpreta `: ` como sub-key e quebra o parsing — as skills `/fast` e `/todo` deixam de aparecer na LP deployada.

## Afetados

- **Desenvolvedor (usuário do Claude Code)** — precisa de caminho rápido para fechar feature sem QA formal, mantendo disciplina de docs+plano+review.
- **LP de skills (lp-skills.vercel.app)** — precisa renderizar todas as skills corretamente; bug de YAML omite skills do build.
- **Manutenção do projeto** — `/test` como nome é cognitivamente ambíguo; `/todo` casa com `docs/todo/`.
