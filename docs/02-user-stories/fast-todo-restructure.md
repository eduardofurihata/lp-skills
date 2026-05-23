# Fast/Todo — User Stories

## Reler

- `docs/01-problem/fast-todo-restructure.md`

## Stories

### Persona: Desenvolvedor (usuário do Claude Code)

- **US-01** — Como desenvolvedor, quero rodar `/fast` e ter a feature encerrada formalmente (kanban em `done/`) mesmo sem rodar QA via front, para encerrar o ciclo de dev sem fricção quando vou testar manualmente.
- **US-02** — Como desenvolvedor, quero que `/fast` rode Code Review (Step 8) automaticamente, para pegar bugs de lógica/segurança/padrão antes de fechar — mesmo sem TCs executados.
- **US-03** — Como desenvolvedor, quero que o tracking file tenha estado claro (`status: done` para dev + `tests: pending` para QA), para distinguir "dev terminou" de "QA terminou" sem ambiguidade.
- **US-04** — Como desenvolvedor, quero que `/todo` (renomeado de `/test`) ainda exista para validar QA via front quando eu quiser, processando o que está em `docs/todo/`.
- **US-05** — Como desenvolvedor que tem features legacy criadas pelo `/fast` antigo (`status: pending-test`), quero que `/todo` continue reconhecendo esse formato, sem precisar migrar manualmente.

### Persona: LP de skills (lp-skills.vercel.app)

- **US-06** — Como visitante da LP, quero ver TODAS as skills do repositório listadas, para selecionar e instalar — bug de YAML não pode omitir skills do build.
- **US-07** — Como visitante da LP, quero que o catálogo reflita o estado atual do repo após cada deploy, sem cache stale.

### Persona: Manutenedor do projeto

- **US-08** — Como manutenedor, quero que o nome do slash command seja semântico (`/todo` processa `docs/todo/`) para reduzir carga cognitiva ao explicar/usar.
- **US-09** — Como manutenedor, quero que skills tenham frontmatter YAML válido (descriptions com `:` interno escapadas) para evitar parsing silencioso falhar na LP.
