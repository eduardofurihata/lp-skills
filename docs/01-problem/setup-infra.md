# Setup e Infra — o conhecimento permanente do projeto tem casa

## Problema

As skills não sabem **como este time trabalha neste repositório** — se abre branch ou commita direto na integração, como é a mensagem de commit, se abre PR e quem aprova, em que idioma vai o card — nem **o que o projeto usa de infra e onde vive cada segredo**. E o pouco que sabem mora em lugares que não servem para isso.

## Contexto

Três lugares guardavam conhecimento do projeto, cada um com um defeito:

| Lugar | O que tinha | Por que não serve |
|---|---|---|
| `CLAUDE.md` / `AGENTS.md` (auto-carregado) | regras gerais do repo | entra em **toda** sessão — inclusive as que não commitam, não branchificam, não entregam nada. Custo de contexto sem uso |
| `~/.claude/projects/<slug>/memory/` | o board do Jira (`/jira-board`) e memórias soltas como `infra-branch-na-main.md` | não versionado: apagar a memória perde o conhecimento; o time nunca o vê |
| `docs/00-context/technical/` | `deploy.md` (3 repos) e `patterns.md` (1 repo) | encostado na esteira numerada de discovery do `/method` (`01-problem` … `05-test-cases`), parece doc por feature. O `/method` **nem conhecia a pasta** (zero ocorrências em `furi-build`) — ela foi criada pelo `/prod` |

E a política de branch estava **hardcoded** nas skills: `work/SKILL.md` dizia *"Default = criar branch · Exceção (Eduardo trabalha direto em `dev`)"* — nome próprio dentro de uma skill distribuída para três clientes. O `patterns.md` tinha **dois caminhos** (`docs/04-spec/technical/` no `/method`, `docs/00-context/technical/` no `/prod`) e **nenhuma skill o escrevia**.

Nos 78 repositórios de `~/GitHub`, o levantamento mostrou: 1 com `origin/dev`, 77 de branch única; `.claude/` já **versionado em 8** (labzz-afl 17 arquivos, labzz-processos 12, labzz-sementezz 10 — este último com `.claude/project-overview.md` + `.claude/architecture/*.md`, exatamente o padrão que faltava nomear); `.secrets/` em 2 (`eduzz-aws`, `vibe-alkaline-man`), gitignored, misturando credenciais com dumps e evidências, e cujo `README.md` já era, na prática, o inventário que ninguém mantinha.

## Afetados

- **Eduardo** — repete a cada repositório o que já decidiu ("aqui é direto na main", "aqui abre PR"), e vê a skill assumir o contrário.
- **Dev de um repo Eduzz** — instala o `furi-ship` e recebe a exceção de outra pessoa como default.
- **Quem entrega (`/homolog`, `/prod`)** — precisa saber onde vive um secret e pergunta de novo, ou pior, lê o `deploy.md` que mistura processo com inventário.
- **O próprio time** — o conhecimento operacional vive na cabeça de quem usa a máquina certa.

## A capacidade que falta

**Declarar uma vez, versionado, e ler só quando se usa:** um lugar no repositório — nem por feature, nem da máquina, nem auto-carregado — onde mora o conhecimento permanente do projeto, com **um dono por arquivo**: convenções do time (`setup.md`), mapa da infra e onde vive cada segredo (`infra.md`), processo de deploy (`deploy.md`) e padrões de código (`patterns.md`). E a regra de leitura: **só lê quem usa algo dali**.
