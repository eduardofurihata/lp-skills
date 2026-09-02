---
name: card
description: 'Use when user invokes /card to create a Jira card on ANY board of the personal Atlassian from a short description — `/card [KEY] <problema>`. Discovers project, board, issue type and active sprint instead of assuming them; writes the card in PM/PO, QA and Designer voice (never dev), with a verifiable "## Como testar"; uploads any reference images sent as attachments; returns the card key + URL. Intake only — does not branch, code, or create docs.'
effort: max
argument-hint: "[KEY] <descrição do card / ideia / bug>"
---

# /card — Criar card no Jira (qualquer board)

Cria um card no **projeto que você indicar** (Atlassian pessoal) a partir de uma descrição curta, **considerando o contexto do projeto** via um **scan leve** do código/docs — pra ancorar a área do produto, a rota e um "Como testar" plausível.

> **Escopo: intake puro.** Só cria o card remoto. NÃO cria branch, NÃO cria docs/kanban, NÃO implementa, NÃO investiga fundo. Pra trabalhar o card depois → `/work <KEY>-<N>`.

## Iron Law

> **Precisão > Tokens.** Um card vago vira retrabalho lá na frente (o `/work` vai ter que adivinhar). Vale o scan leve pra escrever um card que o próximo passo pega sem dúvida. Mas **scan LEVE** — investigação profunda é o `/work`, não aqui.

## Voz do card — PM/PO, QA e Designer (nunca dev)

> **Teste de papel — o único critério.** Antes de escrever qualquer linha: *"um PM/PO, um QA ou um Designer escreveria isso?"* Se sim, **está liberado**. Se só um dev escreveria, fica de fora — o `/method` deriva isso sozinho no discovery.

| Papel | O que ele traz pro card |
|---|---|
| **PM/PO** | o problema, quem sente, impacto, objetivo e valor, regra de negócio, critério de pronto |
| **QA** | pré-condição, passos, **rota/URL** (`/checkout/pagamento`), dados de teste, resultado esperado, cenário alternativo e de erro, o que pode regredir, onde testar (mobile/desktop) |
| **Designer** | comportamento visual, estados (vazio/carregando/erro/sucesso), hierarquia, consistência com o design system, responsivo, acessibilidade, microcopy, **referência visual anexada** |

**Fica de fora — só um dev escreveria:** caminho de arquivo do código, nome de função/hook/componente/tabela interna, stack e biblioteca, prescrição de arquitetura ("crie um service X", "use cache"), estimativa técnica.

> **O par que confunde:** `/checkout/pagamento` é **rota** → liberado, é o vocabulário natural do QA. `src/app/checkout/page.tsx` é **arquivo de código** → fora. Parecem iguais e não são: um é onde o usuário navega, o outro é onde o código mora.

**Teste final da voz:** se o card só faz sentido pra quem conhece o código, foi escrito errado — reescreva. Nada se perde: o card é **intake**, não spec; quem deriva arquitetura é o `/method`.

## Convenções (CONTRATO — descobrir, nunca assumir)

- **Projeto:** o do argumento ou o inferido (passo 1). Sempre via `mcp__atlassian__*`.
- **Tipo de issue:** o que o projeto **tem** — descoberto com `jira_get_project_issue_types`. Nunca chutar um nome ("Tarefa", "Task", "Bug") sem listar.
- **Board e sprint:** descobertos com `jira_get_agile_boards` (`project_key`) → `jira_get_sprints_from_board` (`state: active`).
- **Seção obrigatória:** toda descrição termina com `## Como testar` (passos verificáveis, formato QA).
- **Idioma:** o do projeto; **default português**.
- Card novo entra **no sprint ativo** por padrão (passo 5), com o status default do board. Não mover status aqui.

> **Um site por vez:** o MCP alcança só o site do `JIRA_URL` configurado. Key que não aparece em `jira_get_all_projects` **não existe neste site** — pode estar em outro (outro servidor MCP). Diga isso; **nunca** aproxime para a key mais parecida.

## Fluxo

### 1. Resolver o projeto + entender a intenção

`$ARGUMENTS` = `[KEY] <descrição>`.

**Teste duplo pra não confundir key com texto:** o primeiro token só é key se **casar `^[A-Z][A-Z0-9_]{1,9}$`** *e* **existir** em `jira_get_all_projects`. Assim `/card API não responde` cria o card com a descrição "API não responde" em vez de procurar um projeto `API`.

**Sem key:** infira do repositório — `CLAUDE.md`, remote do git, nome da pasta — cruzando com `jira_get_all_projects`.
- **Um candidato** → use e **diga qual** no report.
- **Zero ou vários** → `AskUserQuestion` listando os projetos disponíveis.

Descrição vazia → pedir 1 linha do que é o card e parar.
Se for claramente **2+ entregas distintas** → propor split (**1 card = 1 entrega**) antes de criar.

### 2. Anti-duplicata (rápido)
`mcp__atlassian__jira_search` (JQL `project = <KEY>` + termos-chave) pra ver se já existe card cobrindo isso. Achou candidato forte → mostrar e perguntar se cria mesmo assim.

### 3. Scan leve (project-aware, time-boxed)
Um passe **rápido** só pra ancorar — NÃO é o Step 0 do `/work`:
- `Grep`/`Glob` pelos termos da descrição → achar a **área provável** e a **rota**.
- `docs/MAP.md` / `docs/00-context/` se ajudar a nomear a área do produto.
- **Time-box curto.** Achou → para. **NÃO** leia o fluxo inteiro, **NÃO** reproduza no front, **NÃO** dê nota ≥90 (isso é `/work`).

**A saída do scan é traduzida pra voz dos papéis:** tipo (bug vs melhoria), **área do produto** (tela/fluxo), **rota** e um **"Como testar"** plausível. O achado de arquivo **morre aqui** — serviu pra você entender, não pro card.

### 4. Compor o card
- **Título:** conciso, imperativo, PT (≤ ~80 chars).
- **Descrição (markdown):**
  - O problema/objetivo em linguagem de produto (o porquê + quem sente + impacto).
  - **Onde o usuário sente** — tela/fluxo + **rota**.
  - Critério de pronto em **comportamento observável**, se óbvio.
  - Se for visual: estados esperados, responsivo, acessibilidade — o que um Designer diria.
  - **`## Como resolver`** — linha explícita e literal: **"Rode `/method` e `/solve` para resolver o problema deste card."** (OBRIGATÓRIO).
  - **`## Como testar`** — formato QA: **pré-condição → passos → resultado esperado**, tudo observável no front (OBRIGATÓRIO).

### 5. Criar no Jira
Descobrir o tipo antes: `mcp__atlassian__jira_get_project_issue_types` (`project_key`) → escolher o que **existe** e cabe (bug vs tarefa/melhoria). Depois:

```
mcp__atlassian__jira_create_issue
  project_key: <KEY>
  issue_type:  <tipo descoberto>
  summary:     <título>
  description: <markdown com ## Como resolver e terminando em ## Como testar>
```

**Adicionar ao sprint ativo (DEFAULT):** `jira_get_agile_boards` (`project_key`) → pegar o **sprint ativo** (`jira_get_sprints_from_board`, `state: active`) → `jira_add_issues_to_sprint`. Sem board ágil ou sem sprint ativo → deixa no backlog e **avisa no report**.

### 5.1 Anexar as referências visuais (OBRIGATÓRIO quando houver)

Toda imagem enviada como referência pra escrever o card **sobe pro card**. Não é opcional — quem for executar precisa ver o que originou o pedido.

**O upload existe no MCP, mas não onde se procura:** não há tool `jira_upload_attachment`; o upload é o parâmetro **`attachments` do `jira_update_issue`**, e o arquivo precisa estar **dentro do CWD**. Mapeamento completo, com os erros e o porquê: **`references/jira-anexos.md`** — abra antes de anexar.

1. **Materializar no projeto** — copie cada imagem para `.card-refs/` no diretório atual (obrigatório: caminho fora do CWD é rejeitado).
2. **Anexar** (o card já existe, então já temos a key):
   ```
   mcp__atlassian__jira_update_issue
     issue_key:   <KEY>-<N>
     fields:      "{}"                 ← obrigatório mesmo quando só se anexa
     attachments: ".card-refs/ref-01.png,.card-refs/ref-02.png"
   ```
3. **Verificar** — confira `attachment_results` no retorno (ou `jira_get_issue`). **Anexo que falha não falha o update**: sem conferir, o sucesso é falso.
4. **Referenciar** — acrescente à descrição uma seção `## Referências visuais` citando os anexos pelo nome do arquivo.
5. **Limpar** `.card-refs/` depois de confirmado.

> **Imagem colada no chat não vira arquivo em disco** — não há o que anexar. Peça o caminho ao usuário. Imagem arrastada/informada por caminho, ou screenshot do Playwright, já está em disco.

### 6. Reportar
```
✅ Card criado: <KEY>-<N>
   <título>  ·  Projeto: <KEY> (<nome>)  ·  Tipo: <tipo descoberto>
   Onde: <área do produto> · rota <rota>
   Sprint: <nome do sprint ativo>   (ou "backlog — sem sprint ativo")
   Anexos: <N>/<N>
   URL: <link>

   Resolver: /work <KEY>-<N>  (roda /method + /solve)
```

## Red Flags — STOP

**Projeto e convenções**
- "Assumi o projeto de sempre" → NÃO. Key vem do argumento ou da inferência declarada; na dúvida, **pergunte**.
- "Chutei o tipo `Tarefa`" → NÃO. Liste com `jira_get_project_issue_types` e escolha entre os que existem.
- "A key não apareceu, usei a mais parecida" → NÃO. Não existe neste site → **avise**; pode estar em outro site Atlassian.
- "Criei sem dizer em qual board" → NÃO. O report sempre diz projeto e sprint.

**Voz**
- "Escrevi o card como dev" → NÃO. PM/PO, QA ou Designer. Teste de papel antes de cada linha.
- "Coloquei o caminho do arquivo pra ajudar o dev" → NÃO. Rota sim, arquivo não. Isso é `/method`.
- "Prescrevi a solução no card" → NÃO. O card diz **o quê** e **por quê**; o **como** é do `/work` + `/method`.
- "`## Como testar` sem resultado esperado observável" → NÃO. Pré-condição → passos → resultado.
- "Esqueci o `## Como testar`" ou o `## Como resolver` → card incompleto. Ambos sempre.

**Anexos**
- "Não achei tool de upload no MCP, então pulei" → NÃO. É `jira_update_issue` + `attachments` (`references/jira-anexos.md`).
- "Passei o caminho absoluto de `~/Downloads`" → é rejeitado. Copie pro projeto e use caminho relativo.
- "O update retornou ok, então anexou" → NÃO. Anexo falha em silêncio; confira `attachment_results`.
- "O usuário viu a imagem no chat, não precisa anexar" → NÃO. Quem executa o card não estava na conversa.

**Escopo**
- "Vou investigar fundo pra escrever o card perfeito" → NÃO. Scan **leve**. Investigação/reprodução é o `/work`.
- "Vou criar branch / docs / kanban / mover status" → NÃO. `/card` só cria o card remoto (sprint ativo faz parte — passo 5; status de workflow, não).
- "1 card gigante com 3 entregas" → NÃO. 1 card = 1 entrega; proponha split.
- "Crio sem checar duplicata" → cheque antes (passo 2).
- "Deixei no backlog sem avisar" → NÃO. Default é **sprint ativo**; backlog só sem sprint ativo — e **avisa no report**.
