---
name: jira
description: 'Use when user invokes /jira to see or configure the Jira of THIS repository, or when any pipeline skill needs it at Step 0 — the single owner of two files: the BOARD (site, key, boardId, boardName, url — machine memory at `~/.claude/projects/<slug>/memory/jira.md`, a coordinate of whoever uses it) and the STRUCTURE (`.claude/ship-setup/jira.md`, versioned in the target repo: the real columns/status names, issue types, which status each pipeline stage maps to and whether it comments, and the MCP quirks — e.g. the atlassian server CAN upload attachments through `jira_update_issue` + `attachments` although it looks like it cannot). Reads both on EVERY invocation; the board is asked once (offering the real boards from MCP, or a pasted link) and validated against the site; the structure is discovered from the site (`jira_search`, `jira_get_transitions`, `jira_get_project_issue_types`), the stage→status map confirmed with the user, and written from a template. `/jira <KEY>` or `<link>` switches the board; `/jira ler` re-reads the site and shows the structure diff before rewriting; `/jira mcp` records a quirk you just hit. Does nothing when `.claude/ship-setup/setup.md § Jira → Rastreamento` is not Jira. Invoked at Step 0 by /work, /pull-request, /homolog, /prod, /repro and /card via the Skill tool. Triggers on "qual é o board daqui", "troca o board pra ALK", "mapeia o jira", "como esse jira está organizado", "o mcp do jira faz upload?".'
effort: max
boundary: [setup]
argument-hint: "(vazio = mostrar board + estrutura, ou configurá-los) | <KEY> | <link do board> | ler | mcp"
---

# /jira — O Jira deste repositório: o board e a estrutura dele

Dono **único** de dois fatos que ninguém mais grava:

| Fato | Arquivo | Natureza |
|---|---|---|
| **O board** — site, key, boardId, boardName, url | `~/.claude/projects/<slug>/memory/jira.md` | memória da **máquina**: coordenada de quem usa |
| **A estrutura** — colunas/status reais, tipos de issue, etapa do pipeline → status, se comenta, manhas do MCP | `.claude/ship-setup/jira.md` (ou `.local.md`) | **versionado** no projeto: igual para todo mundo que clona |

Todo alvo do pipeline (`/work`, `/pull-request`, `/homolog`, `/prod`) e todo modificador (`/repro`, `/card`) começa passando por aqui — nenhum deles descobre, assume ou pergunta board ou status por conta própria. O motor `jira-sync` (`pipeline/references/jira-sync.md`) **lê a estrutura** para saber para qual status mover o card em cada etapa e se comenta; o `/card` a lê para saber o tipo de issue.

> **Escopo: o Jira como está organizado, não os cards.** Não cria card, não move status, não comenta — isso é o `jira-sync` e o `/card`, que leem daqui. Resolve *onde* o trabalho vive e *como esse board funciona*, e devolve isso pra quem chamou.

## Iron Law

> **Perguntar uma vez, lembrar pra sempre; mapear uma vez, ler sempre, reconferir quando pedido.** O board não muda entre duas invocações — perguntar de novo é desperdício que o usuário sente. A estrutura muda raramente e **com aviso** (alguém mexeu no workflow): é lida do arquivo, e só volta ao site quando o usuário pede (`/jira ler`) ou quando o `jira-sync` tropeça num status que o arquivo prometia e o board não tem. Os dois arquivos são lidos **sempre**, explicitamente, no início. Confiar no que "já está no contexto" é o mesmo que não ler.

## Contrato

- **Rastreamento vem do `/setup`.** `.claude/ship-setup/setup.md § Jira → Rastreamento` ≠ `Jira` ⇒ este repositório **não tem Jira**: a skill declara isso, devolve `{rastreamento: <o que é>}` e **não pergunta board**. O pipeline roda inteiro sem card.
- **Memória por projeto.** Cada repositório tem o seu board — o do `vibe-nivee` não vaza pro `vibe-alkaline-man`. Nada de board hardcoded em skill nenhuma.
- **Memória da máquina ≠ estrutura do projeto ≠ convenção do time.** Board na memória (quem usa). Estrutura em `.claude/ship-setup/jira.md` (o projeto). Como o time trabalha — branch, commit, PR, idioma, DoD — em `.claude/ship-setup/setup.md` (`/setup`). Cada um guarda só o seu.
- **Default, não trava.** Key explícita no argumento de quem chamou (`/card ALK bug X`) **vence** e **não** reescreve a memória.
- **Um site por vez.** O MCP alcança só o site do `JIRA_URL` configurado. Key/link de outro site → **avise e não grave**; nunca aproxime pra key mais parecida.
- **Só grava o validado.** Key confirmada em `jira_get_all_projects`, board em `jira_get_agile_boards`, status que existem em `Colunas`, tipos que `jira_get_project_issue_types` devolveu. Etapa→status é **confirmado com o usuário** antes de gravar.
- **Transição é por NOME de status, nunca por id.** O id de transição muda quando alguém edita o workflow; o nome é o que o time enxerga no board. O `jira-sync` descobre o id na hora, pelo nome que está no arquivo.

## O que mora onde

| Fato | Onde | Por quê |
|---|---|---|
| site, key, boardId, boardName, url | memória da máquina (`$MEM/jira.md`) | coordenada de quem usa; o time pode ter sites diferentes |
| colunas/status, tipos de issue, tipo para bug, etapa→status, comenta?, formato do comentário, manhas do MCP | `.claude/ship-setup/jira.md` | estrutura do projeto — igual para todo mundo, revisável em PR |
| sprint ativo | descoberto a cada uso (`/card`: `jira_get_sprints_from_board`) | muda toda semana |
| se o projeto tem Jira | `.claude/ship-setup/setup.md § Jira → Rastreamento` (`/setup`) | é convenção do time, não estrutura do Jira |

## Onde a memória mora

O caminho vem do **system prompt** (`You have a persistent file-based memory at …`) — essa é a fonte da verdade. Sem ele, derive:

```bash
MEM="$HOME/.claude/projects/$(pwd | sed 's#/#-#g')/memory"
```

O diretório **já existe** — escreva direto. Não rode `mkdir`, não cheque existência.

## Fluxo

### 0. Tem Jira? (SEMPRE)

```bash
grep -m1 '^- Rastreamento:' .claude/ship-setup/setup.md 2>/dev/null || grep -m1 '^- Rastreamento:' .claude/ship-setup/setup.local.md 2>/dev/null
```

`Rastreamento: Jira` (ou linha ausente num setup anterior a esta versão — trate como `Jira` e avise que o `/setup` completa o campo) → passo 1. `kanban local` / `nenhum` → **devolva** `{rastreamento, site: —, key: —}` com o report `📋 Jira: este repositório não usa Jira (Rastreamento: <x>) — pipeline sem card` e **encerre**. Sem setup nenhum → quem chamou invoca o `/setup` antes; se você foi chamado direto, invoque-o você (Skill tool, `furi-ship:setup`) — sem ele não há como saber se há Jira.

### 1. Ler a memória (SEMPRE)

```bash
[ -f "$MEM/jira-board.md" ] && [ ! -f "$MEM/jira.md" ] && mv "$MEM/jira-board.md" "$MEM/jira.md" && sed -i 's/(jira-board\.md)/(jira.md)/' "$MEM/MEMORY.md"   # migração: a skill se chamava /jira-board
cat "$MEM/jira.md" 2>/dev/null
```

**Tem board gravado** → passo 5 (a estrutura). Não chame o MCP pra "reconfirmar": o board não mudou desde a última vez, e a ida ao servidor é o custo que esta skill existe pra eliminar.

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

Listar todos os projetos do site lado a lado transforma confirmação em adivinhação: quem lê vê `ALK`, `NIV` e `TESTE` como igualmente prováveis e a pergunta parece palpite. O candidato provável você já tem; o que falta é o aceite.

**Não há candidato provável** (o nome do repo não casa com projeto nenhum, ou casa com mais de um) → aí sim liste os projetos que existem de verdade, o mais provável primeiro:

```
Qual board do Jira é o deste repositório?
  <KEY> — <nome do projeto> · board <ID> (<nome do board>)
  <KEY2> — <nome> · board <ID2>
  …
```

Nos dois formatos, o campo livre ("Other") é onde o usuário cola o **link do board** — é a saída quando o board não apareceu ou o MCP não respondeu. Diga isso na descrição de uma das opções.

**A pergunta é isolada.** Nunca a embuta num bloco de perguntas da skill que chamou (`/card`, `/work`, …): misturada com decisões de produto, ela vira mais uma linha que o usuário não sabe por que está respondendo. É uma pergunta só, feita **uma vez na vida do repositório** — o passo 4 grava a resposta e ninguém pergunta de novo.

### 4. Parsear, validar e gravar o board

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

**Projeto sem board ágil** (`jira_get_agile_boards` volta vazio) é caso legítimo, não erro: grave com `boardId`/`boardName` vazios e **avise**. Quem consome segue sem sprint. O que **não** pode é gravar projeto que não existe.

**Vários boards no mesmo projeto** → pergunte qual é o deste repositório; não pegue o primeiro da lista.

**Gravar** `$MEM/jira.md`:

```markdown
---
name: jira
description: O board do Jira deste repositório é <KEY> (<nome>) em <site> — board <ID>, confirmado com o usuário em <data absoluta>
metadata:
  type: reference
---

Board padrão deste repositório: **<KEY>** — <nome do projeto>, board `<ID>` (<nome do board>).
URL: <link completo>  ·  Site: `<site>.atlassian.net`

**Why:** o link não é derivável do código nem do git remote — sem isso toda skill de Jira
volta a perguntar ou a adivinhar o projeto.

**How to apply:** é o **default** do repositório, não uma trava. Key explícita no argumento
(`/card ALK bug X`) vence e **não** reescreve este arquivo. A estrutura do board (colunas, tipos,
etapa→status) está em `.claude/ship-setup/jira.md`, versionada; o sprint ativo é descoberto a cada uso.
```

Data em formato absoluto (`2 de setembro de 2026`), nunca "hoje" ou "ontem".

**Indexar** em `$MEM/MEMORY.md` — uma linha, sem frontmatter. Arquivo não existe → crie com ela; já existe → acrescente sem mexer nas outras:

```markdown
- [Board do Jira](jira.md) — <KEY> (<nome>) em <site>; default das skills de Jira, argumento explícito sobrescreve.
```

### 5. Ler a estrutura (SEMPRE, depois do board)

```bash
cat .claude/ship-setup/jira.md 2>/dev/null || cat .claude/ship-setup/jira.local.md 2>/dev/null
```

O arquivo é o do **modo** que o `/setup` decidiu para este repositório (`arquivo: time` → `jira.md`; `local` → `jira.local.md`); o do time vale quando os dois existem.

**Existe e tem as quatro seções** (`## Board`, `## Etapa do pipeline → status`, `## Comentário`, `## MCP`) → passo 7. Não volte ao site pra "reconferir": é o `/jira ler` que faz isso, quando o usuário pede.

**Não existe, ou está incompleto** → passo 6. Incompleto = seção faltando; preencha só o que falta, preservando o resto.

### 6. Mapear a estrutura — do site, confirmado com o usuário

| O quê | Como |
|---|---|
| **Colunas / status** | `mcp__atlassian__jira_search` (JQL `project = <KEY> ORDER BY updated DESC`, `fields: status`, `limit: 50`) → os `status.name` distintos; `mcp__atlassian__jira_get_transitions` num card de cada status visto → os destinos completam a lista. Ordem: a do board (backlog → feito). Nomes **exatos** |
| **Tipos de issue** | `mcp__atlassian__jira_get_project_issue_types` (`project_key`) → os que existem. `Tipo para bug` = o que se chama Bug/Erro/Defeito; `Tipo para o resto` = Tarefa/Task/Story — candidato por nome, **confirmado** |
| **Etapa → status** | candidato por nome, na tabela do `references/template.md`: *trabalho começou* → Em andamento/In Progress/Doing · *publicado* → Em revisão/Code Review/Review · *integrado* e *homolog* → Verificar/Homologação/QA/Staging · *produção* → Concluído/Done/Pronto · *rework* → o mesmo de *trabalho começou*. Etapa sem status equivalente → `—` |
| **Comenta?** | default do template; o usuário desliga o que não quiser |
| **MCP** | as manhas que já se conhecem (upload por `jira_update_issue` + `attachments`; `comment` de `jira_transition_issue` é ADF — comente separado) + o que se observou nesta sessão, se algo falhou e depois funcionou |

**Uma pergunta, isolada** (AskUserQuestion), mostrando a tabela etapa→status **preenchida** com os candidatos e as colunas reais ao lado — o usuário confirma ou corrige os nomes. Colunas e tipos não se perguntam: são o que o site devolveu. Sem MCP → diga que não deu para mapear e peça as colunas em texto.

**Validar e gravar** — consistência do `references/template.md` (status da tabela ⊂ `Colunas`; `Tipo para bug` ∈ `Tipos de issue`). Contradição → mostre e pergunte de novo; **não grave**. `mkdir -p .claude/ship-setup` e escreva a partir do template, no arquivo do modo. Modo **time**: avise que é versionado e entra no commit de quem chamou. Esta skill não commita.

### 7. Devolver

Quem chamou precisa de:

```
{ rastreamento: Jira, site, key, boardId, boardName, url, origem,
  estrutura: { colunas[], tipos[], tipoBug, tipoResto, etapas: {<etapa>: {status, comenta}}, comentario: {idioma, formato}, mcp[] },
  arquivo }
```

`origem` = `memória` (leu o board do arquivo) ou `perguntado` (acabou de gravar). `arquivo` = `time` ou `local` (onde a estrutura está). `estrutura.origem` = `arquivo` / `mapeado agora`.

Report de uma linha:
```
📋 Jira: <KEY> (<nome>) · board <ID> · <site>.atlassian.net   [memória | gravado agora]  ·  estrutura: <N> colunas · etapas mapeadas <n>/6   [.claude/ship-setup/jira.md | mapeada agora]
```

## Modo direto — `/jira` digitado pelo usuário

| Arg | Ação |
|---|---|
| vazio | Mostra o board gravado **e** a estrutura, seção a seção. Nada gravado → roda o fluxo (passos 0-6). É o caminho de **projeto novo**, depois do `/setup`. |
| `<KEY>` ou `<link>` | **Troca** o board. Valida (passo 4) e, se já houver board gravado, **confirma antes de sobrescrever** mostrando o de antes e o de depois. A estrutura é remapeada (passo 6) — outro board, outras colunas. |
| `ler` | **Força reler o Jira**: refaz o passo 6 contra o site, mostra o **diff** entre o arquivo e o que o site devolveu (coluna nova, status renomeado, tipo que sumiu) e regrava só com o seu OK. É o que se roda quando alguém mexeu no workflow. |
| `mcp` | Registra uma **manha do MCP** que você acabou de descobrir: pergunta o sintoma (o que parecia não funcionar) e o caminho (o que funciona), e acrescenta a linha no `## MCP`. |

Trocar o board e `ler` são as únicas situações em que os arquivos são reescritos. Uso de key por argumento numa **outra** skill nunca reescreve nada.

## Red Flags — STOP

- "O `MEMORY.md` já estava no contexto, não precisei ler" → NÃO. A leitura de `$MEM/jira.md` **e** de `.claude/ship-setup/jira.md` é explícita, **toda** invocação. Índice não é conteúdo.
- "Não tinha board gravado, então inferi do nome da pasta e segui" → NÃO. Inferência **ordena** as opções; quem decide é o usuário. Perguntar uma vez é barato, board errado não.
- "Listei todos os projetos do site como opções, mesmo com um candidato óbvio" → NÃO. Com candidato provável a pergunta é **confirmação** (sim/não + campo livre). Menu de projetos só quando não há candidato.
- "Perguntei o board junto com as perguntas da skill que me chamou" → NÃO. A pergunta do board é **isolada**. Misturada com decisões de produto ela parece palpite.
- "Gravei o que o usuário colou sem validar" → NÃO. Key em `jira_get_all_projects`, board em `jira_get_agile_boards`. Sem os dois, não grava.
- "A key não apareceu no site, usei a mais parecida" → NÃO. Não existe neste site → **avise** (pode estar em outro) e não grave.
- "Gravei o id da transição no `jira.md`, é mais rápido" → NÃO. Id muda quando alguém edita o workflow; o **nome** do status é o que fica. O `jira-sync` descobre o id na hora.
- "Chutei que 'Em revisão' é a coluna de PR e gravei" → NÃO. Candidato por nome é **proposta**; o usuário confirma a tabela antes de gravar.
- "Anotei as colunas na memória da máquina junto com o board" → NÃO. Colunas são do **projeto**, iguais para todo mundo: `.claude/ship-setup/jira.md`, versionado. Board é da máquina.
- "Anotei o board no `jira.md` do projeto pra não depender da memória" → NÃO. Board é coordenada de quem usa — outra pessoa do time pode estar em outro site.
- "O setup diz `Rastreamento: kanban local`, mas achei um board e gravei" → NÃO. Sem Jira é sem Jira. Mudar é `/setup jira`, não é aqui.
- "O usuário passou `ALK` no `/card`, então atualizei a memória pra ALK" → NÃO. Argumento é **override**, não redefinição. Só o `/jira` com argumento troca o board.
- "O MCP não tem tool de upload, então anexo não dá" → NÃO. Tem: `jira_update_issue` + `attachments`, arquivo dentro do CWD — está no `## MCP` do arquivo. Ler o arquivo é o que impede redescobrir isso toda semana.
- "Rodei `mkdir -p` no diretório de memória por segurança" → desnecessário. Ele já existe; escreva direto. (`.claude/ship-setup/` é diferente: pode não existir — `mkdir -p` lá.)
- "Gravei o arquivo e esqueci o `MEMORY.md`" → NÃO. Memória sem linha no índice é memória que ninguém acha.
- "Perguntei o board de novo porque a sessão é nova" → NÃO. Sessão nova, mesmo repositório, mesma memória. Leia o arquivo.
