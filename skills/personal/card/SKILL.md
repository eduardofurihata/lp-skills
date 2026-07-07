---
name: card
description: 'Use when user invokes /card to create a Jira card on the NIVEE board (personal project) from a short description. Project-aware light scan to anchor area/component, fills the NIV conventions (tipo "Tarefa", "## Como resolver" com /method + /solve, "## Como testar"), adds it to the active sprint, and returns the card key + URL. Intake only — does not branch, code, or create docs.'
effort: max
argument-hint: "[descrição do card / ideia / bug]"
---

# /card — Criar card no board NIVEE

Cria um card no board **NIVEE** (projeto `NIV`, Atlassian pessoal) a partir de uma descrição curta, **considerando o contexto do projeto** via um **scan leve** do código/docs — pra ancorar área, componente e um "Como testar" plausível.

> **Escopo: intake puro.** Só cria o card remoto. NÃO cria branch, NÃO cria docs/kanban, NÃO implementa, NÃO investiga fundo. Pra trabalhar o card depois → `/work NIV-X`.

## Iron Law

> **Precisão > Tokens.** Um card vago vira retrabalho lá na frente (o `/work` vai ter que adivinhar). Vale o scan leve pra escrever um card que o próximo passo pega sem dúvida. Mas **scan LEVE** — investigação profunda é o `/work`, não aqui.

## Convenções do board NIVEE (CONTRATO — não inventar)

- **Projeto:** key `NIV`, board **NIVEE** (Atlassian pessoal `eduardofurihata`) — sempre via `mcp__atlassian__*`.
- **Tipo:** `Tarefa`. Nunca "Task", "Story" ou "Bug" como nome de tipo — no board o tipo é **Tarefa**.
- **Seção obrigatória:** toda descrição termina com `## Como testar` (passos verificáveis).
- **Idioma:** português.
- Card novo entra **no sprint ativo** por padrão (passo 5), com o status default do board (A Fazer). Não mover status aqui.

## Fluxo

### 1. Entender a intenção
Ler `$ARGUMENTS` (a ideia / bug / melhoria). Vazio → pedir 1 linha do que é o card e parar.
Se for claramente **2+ entregas distintas** → propor split (**1 card = 1 entrega**) antes de criar.

### 2. Anti-duplicata (rápido)
`mcp__atlassian__jira_search` (JQL `project = NIV` + termos-chave) pra ver se já existe card cobrindo isso. Achou candidato forte → mostrar e perguntar se cria mesmo assim.

### 3. Scan leve (project-aware, time-boxed)
Um passe **rápido** só pra ancorar — NÃO é o Step 0 do `/work`:
- `Grep`/`Glob` pelos termos da descrição → achar a **área/arquivo provável**.
- `docs/MAP.md` / `docs/00-context/` se ajudar a nomear o componente.
- **Time-box curto.** Achou a área → para. **NÃO** leia o fluxo inteiro, **NÃO** reproduza no front, **NÃO** dê nota ≥90 (isso é `/work`).
- Saída do scan: **tipo** (bug vs feature), **área/componente** e um **"Como testar"** plausível.

### 4. Compor o card
- **Título:** conciso, imperativo, PT (≤ ~80 chars).
- **Descrição (markdown):**
  - O problema/objetivo em linguagem clara (o porquê + contexto).
  - Área/componente provável (do scan) — dá um norte pro `/work`.
  - Critério de pronto, se óbvio.
  - **`## Como resolver`** — linha explícita e literal: **"Rode `/method` e `/solve` para resolver o problema deste card."** (OBRIGATÓRIO — sempre presente, com esses dois comandos nomeados).
  - **`## Como testar`** — passos verificáveis (OBRIGATÓRIO).

### 5. Criar no Jira
`mcp__atlassian__jira_create_issue`:
```
project_key: NIV
issue_type:  Tarefa
summary:     <título>
description: <markdown com ## Como resolver e terminando em ## Como testar>
```
**Adicionar ao sprint ativo (DEFAULT).** Depois de criar o card: `mcp__atlassian__jira_get_agile_boards` (board NIVEE) → pegar o **sprint ativo** do board → `mcp__atlassian__jira_add_issues_to_sprint` com o card recém-criado. Se o board **não tiver sprint ativo**, deixa no backlog e **avisa no report**.

### 6. Reportar
```
✅ Card criado: NIV-XX
   <título>  ·  Tipo: Tarefa  ·  Área: <componente do scan>
   Sprint: <nome do sprint ativo>   (ou "backlog — board sem sprint ativo")
   URL: <link>

   Resolver: /work NIV-XX  (roda /method + /solve)
```

## Red Flags — STOP

- "Vou investigar fundo pra escrever o card perfeito" → NÃO. `/card` é scan **leve**. Investigação/reprodução é o `/work`.
- "Esqueci o `## Como testar`" → card incompleto. Sempre incluir.
- "Tipo = Bug / Story / Task" → NÃO. O tipo é **Tarefa**.
- "Vou criar branch / docs / kanban / mover status" → NÃO. `/card` só cria o card remoto (adicionar ao **sprint ativo** faz parte — passo 5; mover status de workflow, não).
- "Descrição sem dizer pra usar `/method` e `/solve`" → NÃO. Toda descrição traz o `## Como resolver` com essa instrução literal (passo 4).
- "Deixei no backlog sem avisar" → NÃO. Default é **sprint ativo**; só cai no backlog se o board não tiver sprint ativo — e aí **avisa no report**.
- "1 card gigante com 3 entregas" → NÃO. 1 card = 1 entrega; proponha split.
- "Crio sem checar duplicata" → cheque antes (passo 2).
