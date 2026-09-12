# Juiz cego — quem escreve não dá a própria nota

## Problema

O `/method` é **um agente só** escrevendo o problema, o spec, o plano, o código, o code review, a execução dos testes e a nota de cada gateway. Toda a defesa contra isso hoje é **procedural**: audits 1:1, tabelas de racionalização, "relatório brutalmente honesto", frases proibidas. Nada disso muda quem julga — muda só o que ele é obrigado a escrever antes de se aprovar.

Onde o veredicto é **fato** (o screenshot existe? o TC rodou? a task está `completed`?), a evidência obrigatória segura. Onde o veredicto é **julgamento**, não há o que segurar:

| Onde | Quem julga hoje | O que ele sabe que não deveria |
|---|---|---|
| Step 9 — TC de texto gerado por IA: "lê melhor que a referência #1?" | o autor do prompt, comparando com "como a referência responderia" — **imaginada por ele** (`09-testing.md`, linha `**Vs. referência #1:**`) | qual texto é o dele, quanto custou, quais critérios ele mesmo escreveu no spec |
| Step 8 — code review: "o diff segura?" | o autor do plano, relendo o plano (`08-code-review.md` § 8a: "reler plano", "reler TCs") | a intenção — que apaga o ponto cego do próprio plano |

Um subagente da sessão (Agent tool, `context: fork`) não resolve: ele herda o harness, o `CLAUDE.md`, o diretório e — pior — o **prompt escrito pelo autor**, já com o enquadramento dele.

## Contexto

Verificado no Claude Code 2.1.269 (login OAuth, sem `ANTHROPIC_API_KEY`) nesta sessão:

- `claude -p --safe-mode` abre uma sessão **sem** a conversa, `CLAUDE.md`/`AGENTS.md`, auto-memory, git status, MCP, plugins, skills e hooks — sondagem de dentro do próprio `lp-skills` respondeu `NONE` para todos.
- `--tools ""` deixa a sessão **sem ferramenta nenhuma** (resposta literal: `NO TOOLS.`); `--tools "Read,Grep,Glob"` deixa ler o repositório e nada mais.
- Sobra o que não enviesa um veredicto: data, cwd, e-mail e o `language` do settings. E sobra o viés de **modelo** — é a mesma família. O que sai é o viés de **contexto**.
- `--bare` iria além (apaga cwd e usa `CLAUDE_CODE_SIMPLE=1`), mas só autentica com API key — fora da assinatura.
- A flag `--disallowedTools` é variádica e engole o prompt posicional; o prompt tem de ir por stdin ou arquivo.

O repositório já tinha a metade "fato" desse raciocínio em andamento: um verificador em contexto limpo que confere se cada afirmação de um artefato tem lastro. Faltava a metade "mérito" — e ela precisa ser mais cega que um subagente.

## Afetados

- **Quem roda o `/method`** — recebe `PASSED` num TC de texto de IA sem ninguém além do autor ter lido o texto, e `APROVADO` num review em que o revisor conhecia a resposta.
- **O usuário final do produto** — lê o texto que "ganhou" de uma referência imaginada.
- **Quem quer só uma segunda opinião** — "o que um Claude sem contexto nenhum diria disto?" — e não tinha como pedir isso de dentro de uma sessão cheia de contexto.

## Resultado esperado

Uma primitiva `/blind` (sessão cega, três modos: pergunta crua, juiz pareado em duas ordens, revisão fria que lê o repo) e dois pontos do `/method` que **só fecham com ela**: o Step 8 (revisão fria zerada sobre o bundle atual) e o TC de texto de IA do Step 9 (a nossa contra a referência #1, sem rótulo, `RESULTADO: A`). Entrada verbatim, saída integral, veredicto vinculante.
