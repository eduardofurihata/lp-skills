---
name: jira-board
description: 'Use when any Jira skill needs to know WHICH board this repository belongs to — the single owner of the project-scoped Jira memory. Reads `~/.claude/projects/<slug>/memory/jira-board.md` on EVERY invocation; if the board is not recorded yet, asks the user (offering the real boards from MCP, or a pasted board link), validates it against the site, writes it to memory and indexes it in MEMORY.md. Invoked at Step 0 by /card, /work, /pull-request, /homolog and /prod. Also usable directly — `/jira-board` shows the recorded board, `/jira-board <KEY|link>` switches it.'
effort: max
argument-hint: "(vazio = mostrar o board gravado) | <KEY> | <link do board>"
---

# /jira-board — O board do Jira deste repositório

Dono **único** da memória de projeto do Jira. Toda skill de Jira (`/card`, `/work`, `/pull-request`, `/homolog`, `/prod`) começa passando por aqui — nenhuma delas descobre, assume ou pergunta o board por conta própria.

> **Escopo: só board/projeto/site.** Não cria card, não move status, não toca em branch. Resolve *onde* o trabalho vive e devolve isso pra quem chamou.

## Iron Law

> **Perguntar uma vez, lembrar pra sempre.** O board de um repositório não muda entre duas invocações — perguntar de novo (ou adivinhar de novo) é desperdício que o usuário sente toda vez. A memória é lida **sempre**, explicitamente, no início. Confiar no que "já está no contexto" é o mesmo que não ler.

## Contrato

- **Memória por projeto.** Cada repositório tem a sua — o board do `vibe-nivee` não vaza pro `vibe-alkaline-man`. Nada de board hardcoded em skill nenhuma.
- **Default, não trava.** O que está na memória é o **padrão** do repo. Key explícita no argumento de quem chamou (`/card ALK bug X`) **vence** e **não** reescreve a memória.
- **Um site por vez.** O MCP alcança só o site do `JIRA_URL` configurado. Key/link de outro site → **avise e não grave**; nunca aproxime pra key mais parecida.
- **Só grava o que foi validado.** Key confirmada em `jira_get_all_projects`, board em `jira_get_agile_boards`. Sem validação, não grava.

## O que NÃO entra na memória

Só `site`, `key`, `boardId`, `boardName` e `url`.

**Tipo de issue, sprint ativo e transições de status ficam de fora, deliberadamente.** Cachear isso contradiz o contrato das skills que consomem daqui (`/card`: *"Nunca chutar um nome sem listar"*; `/work`: *"Status é descoberto"*) e apodrece em silêncio quando alguém mexe no workflow do projeto. Essas três coisas são descobertas **a cada uso**, sempre.

## Onde a memória mora

O caminho vem do **system prompt** (`You have a persistent file-based memory at …`) — essa é a fonte da verdade. Sem ele, derive:

```bash
MEM="$HOME/.claude/projects/$(pwd | sed 's#/#-#g')/memory"
```

O diretório **já existe** — escreva direto. Não rode `mkdir`, não cheque existência.

## Fluxo

### 1. Ler a memória (SEMPRE)

```bash
cat "$MEM/jira-board.md" 2>/dev/null
```

**Tem board gravado** → vá pro passo 5 (devolver). Não chame o MCP pra "reconfirmar": o board não mudou desde a última vez, e a ida ao servidor é o custo que esta skill existe pra eliminar.

**Não tem** (ou o arquivo está corrompido/incompleto) → passo 2.

> Ler é obrigatório mesmo que o `MEMORY.md` já esteja no contexto da sessão. Índice carregado não é leitura — o conteúdo do board está no arquivo, não no índice.

### 2. Levantar os boards reais (antes de perguntar)

```
mcp__atlassian__jira_get_all_projects          → projetos do site
mcp__atlassian__jira_get_agile_boards          → board(s) de cada candidato (project_key)
```

Para reduzir a lista antes de perguntar, cruze com o contexto local — remote do git, nome da pasta, `CLAUDE.md`. Isso **ordena** as opções (o candidato provável primeiro); **não** decide sozinho.

MCP indisponível ou não autenticado → pule pro passo 3 pedindo o link direto, e diga por que não há opções.

### 3. Perguntar (AskUserQuestion) — uma vez, e é confirmação

**Há candidato provável** (o cruzamento do passo 2 apontou **um** projeto com board) → a pergunta **confirma esse board**, não abre menu:

```
Este repositório é do board <KEY> — <nome do projeto> · board <ID>?
  Sim, é esse
  Não, é outro     ← o campo livre recebe a key ou o link do board certo
```

Listar todos os projetos do site lado a lado transforma confirmação em adivinhação: quem lê vê `ALK`, `NIV` e `TESTE` como igualmente prováveis e a pergunta parece palpite — *"por que você confundiu com o outro?"* é a resposta que isso produz. O candidato provável você já tem; o que falta é o aceite.

**Não há candidato provável** (o nome do repo não casa com projeto nenhum, ou casa com mais de um) → aí sim liste os projetos que existem de verdade, o mais provável primeiro:

```
Qual board do Jira é o deste repositório?
  <KEY> — <nome do projeto> · board <ID> (<nome do board>)
  <KEY2> — <nome> · board <ID2>
  …
```

Nos dois formatos, o campo livre ("Other") é onde o usuário cola o **link do board** — é a saída quando o board não apareceu ou o MCP não respondeu. Diga isso na descrição de uma das opções.

**A pergunta é isolada.** Nunca a embuta num bloco de perguntas da skill que chamou (`/card`, `/work`, …): misturada com decisões de produto, ela vira mais uma linha que o usuário não sabe por que está respondendo. É uma pergunta só, feita **uma vez na vida do repositório** — o passo 4 grava a resposta e ninguém pergunta de novo.

### 4. Parsear, validar e gravar

**Parsear o link** — três formatos reais:

| Formato | Exemplo |
|---|---|
| Team-managed | `https://<site>.atlassian.net/jira/software/projects/<KEY>/boards/<ID>` |
| Company-managed | `https://<site>.atlassian.net/jira/software/c/projects/<KEY>/boards/<ID>` |
| Legado (RapidBoard) | `https://<site>.atlassian.net/secure/RapidBoard.jspa?rapidView=<ID>&projectKey=<KEY>` |

Não parseou → mostre o que você entendeu e **pergunte de novo**. Não invente a key a partir de pedaços do texto.

**Validar** — sem isso, não grava:
- a key existe em `jira_get_all_projects`?
- o board existe em `jira_get_agile_boards` (`project_key`)?
- o `<site>` do link é o mesmo do `JIRA_URL` do MCP?

Key ou board que não existe neste site → **avise que pode estar em outro site Atlassian** (outro servidor MCP) e **não grave**. Gravar um board inalcançável só adia a falha pro `/card`.

**Projeto sem board ágil** (`jira_get_agile_boards` volta vazio) é caso legítimo, não erro: grave com `boardId`/`boardName` vazios e **avise**. Quem consome segue sem sprint — é exatamente o que o `/work` já prevê (*"Projeto sem board ágil → segue sem sprint, e avisa"*). O que **não** pode é gravar projeto que não existe.

**Vários boards no mesmo projeto** → pergunte qual é o deste repositório; não pegue o primeiro da lista.

**Gravar** `$MEM/jira-board.md`:

```markdown
---
name: jira-board
description: O board do Jira deste repositório é <KEY> (<nome>) em <site> — board <ID>, confirmado com o usuário em <data absoluta>
metadata:
  type: reference
---

Board padrão deste repositório: **<KEY>** — <nome do projeto>, board `<ID>` (<nome do board>).
URL: <link completo>  ·  Site: `<site>.atlassian.net`

**Why:** o link não é derivável do código nem do git remote — sem isso toda skill de Jira
(`/card`, `/work`, `/pull-request`, `/homolog`, `/prod`) volta a perguntar ou a adivinhar o projeto.

**How to apply:** é o **default** do repositório, não uma trava. Key explícita no argumento
(`/card ALK bug X`) vence e **não** reescreve este arquivo. Tipo de issue, sprint e transições
continuam sendo descobertos a cada uso — nunca lidos daqui.
```

Data em formato absoluto (`2 de setembro de 2026`), nunca "hoje" ou "ontem".

**Indexar** em `$MEM/MEMORY.md` — uma linha, sem frontmatter. Arquivo não existe → crie com ela; já existe → acrescente sem mexer nas outras:

```markdown
- [Board do Jira](jira-board.md) — <KEY> (<nome>) em <site>; default das skills de Jira, argumento explícito sobrescreve.
```

### 5. Devolver

Quem chamou precisa de:

```
{ site, key, boardId, boardName, url, origem }
```

`origem` = `memória` (leu do arquivo) ou `perguntado` (acabou de gravar) — é o que permite ao chamador dizer a procedência no report dele.

Report de uma linha:
```
📋 Board: <KEY> (<nome>) · board <ID> · <site>.atlassian.net   [memória do projeto | gravado agora]
```

## Modo direto (usuário chamando `/jira-board`)

| Arg | Ação |
|---|---|
| vazio | Mostra o board gravado. Não tem nada gravado → roda o fluxo (passos 2-4). |
| `<KEY>` ou `<link>` | **Troca** o board. Valida (passo 4) e, se já houver board gravado, **confirma antes de sobrescrever** mostrando o de antes e o de depois. |

Trocar o board é a única situação em que o arquivo é reescrito. Uso de key por argumento numa **outra** skill nunca reescreve nada.

## Red Flags — STOP

- "O `MEMORY.md` já estava no contexto, não precisei ler" → NÃO. A leitura de `jira-board.md` é explícita, **toda** invocação. Índice não é conteúdo.
- "Não tinha board gravado, então inferi do nome da pasta e segui" → NÃO. Inferência **ordena** as opções; quem decide é o usuário. Perguntar uma vez é barato, board errado não.
- "Listei todos os projetos do site como opções, mesmo com um candidato óbvio" → NÃO. Com candidato provável a pergunta é **confirmação** (sim/não + campo livre). Menu de projetos só quando não há candidato — senão o irrelevante entra na tela com o mesmo peso do certo.
- "Perguntei o board junto com as perguntas da skill que me chamou" → NÃO. A pergunta do board é **isolada**. Misturada com decisões de produto ela parece palpite, e o usuário não sabe o que está confirmando.
- "Gravei o que o usuário colou sem validar" → NÃO. Key em `jira_get_all_projects`, board em `jira_get_agile_boards`. Sem os dois, não grava.
- "A key não apareceu no site, usei a mais parecida" → NÃO. Não existe neste site → **avise** (pode estar em outro) e não grave.
- "Cachei o tipo de issue e as transições junto, pra economizar" → NÃO. Só board/projeto/site. O resto é descoberto a cada uso, sempre.
- "O usuário passou `ALK` no `/card`, então atualizei a memória pra ALK" → NÃO. Argumento é **override**, não redefinição. Só o `/jira-board` com argumento troca o board.
- "Rodei `mkdir -p` no diretório de memória por segurança" → desnecessário. Ele já existe; escreva direto.
- "Gravei o arquivo e esqueci o `MEMORY.md`" → NÃO. Memória sem linha no índice é memória que ninguém acha.
- "Perguntei o board de novo porque a sessão é nova" → NÃO. Sessão nova, mesmo repositório, mesma memória. Leia o arquivo.
