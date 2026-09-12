---
name: work
description: 'Use when user invokes /work [KEY-N] to take a Jira card from todo to committed-locally on ANY board (personal Atlassian) — standalone. Discovers the project board from the card key (/jira-board) and the team conventions from `.claude/ship-setup/setup.md` (/setup: work directly on the integration branch, one branch per card, or one branch accumulating cards — an open batch keeps its first-card name and the new card enters through its own commit), syncs the integration branch from GitHub and branches off it — or stays on the open batch — as the setup says (gh→integração→branch), moves the card to in-progress, asks clarifying questions if the card is ambiguous, then runs /method (which invokes /solve) with the card key to implement + review + QA + commit on the branch. Stops at the local commit; ship is /pull-request + /homolog (and /prod for production).'
effort: max
requires: [jira-board, setup, method, solve]
handoff: pull-request
argument-hint: "[KEY-N] | (empty = continuar card ativo)"
---

# /work — Trabalhar um card do Jira (do todo ao commit)

Pega um card de **qualquer board** do Atlassian pessoal e leva até o **commit local** na feature branch, **10x acima da referência #1 do mercado**. **Skill standalone do projeto pessoal.** Carrega o `/solve` na ativação e reusa o `/method` (que o recarrega) como protocolo de engenharia.

> 🚫 NÃO faz push, NÃO abre PR, NÃO mergeia. Termina no **commit local** (Step 10 do `/method`). Ship é o `/pull-request` depois.

## Ordem de Operações ao Ativar

**ANTES de tudo — invoque o `/solve`.** Toda vez que o `/work` for ativado, a PRIMEIRA ação é **invocar o `/solve` via Skill tool** (`furi-build:solve`; a forma curta `solve` também resolve) para carregar o padrão — **10x acima da referência #1 do mercado**. Chamada real, não "seguir de memória": sem a invocação, o passo não aconteceu. O `/solve` define o nível; o `/work` é quem leva o card até o commit **nesse nível** — e o `/method` (passo 5) recarrega o mesmo `/solve` quando rodar. Depois disso, siga o Fluxo a partir do passo 0.

## Iron Law

> **Precisão > tokens > velocidade.** Mire **10x acima da referência #1 do mercado** (padrão do `/solve`, carregado aqui na ativação e recarregado pelo `/method`). "É simples, pulo" = a violação.
> Os princípios (**SOLID · DRY · KISS · YAGNI · LoD · Motores**), a **refatoração contínua** (tudo por onde passa sobe) e o **design** (tokens, atomicidade, estados, a11y — quando tem tela) vêm juntos e valem em **todos** os steps, não só no código — doutrina em `plugins/furi-build/skills/principles/SKILL.md` e lente por step nos references do `/method` (`plugins/furi-build/skills/method/references/`, design incluído — pacote `furi-build`, carregados pelo `/method` que o `/work` invoca). Card "pequeno" não relaxa nenhum deles.

## Disciplina em todos os passos

Os passos 1-4 são **preparação**: é neles que o card vira entendimento — qual **capacidade** ele pede, **qual motor é dono** dela (ou qual falta) e se a feature tem **superfície visual**. O passo 5 é onde o regime roda inteiro: o `/method` cobra princípios, motores, refatoração e design **declarados em cada gateway**, step a step, até o commit.

Nenhum desses passos é lugar de "adianto um código". Entender aqui é o que faz o `/method` não escorregar lá na frente.

## Argument parsing

| Arg | Modo | Ação |
|-----|------|------|
| `KEY-N` (ou URL do card) | START | roda do zero pra esse card, em **qualquer** projeto |
| vazio | CONTINUE | detecta a branch/card ativo e retoma de onde parou |

## Convenções (CONTRATO)

- **Qualquer projeto** do Atlassian pessoal, sempre via `mcp__atlassian__*`. A key sai do argumento (`ALK-42` → projeto `ALK`) ou da **memória do projeto** quando o argumento não traz uma — **nada hardcoded**.
- **Board vem do `/jira-board`** (passo 0, dependência obrigatória), que lê a memória do projeto e pergunta só na primeira vez. Não descubra nem pergunte o board aqui. Projeto sem board ágil → segue sem sprint, e avisa.
- **Modo de trabalho e nome da branch vêm do `/setup`** (passo 0, dependência obrigatória), que lê `.claude/ship-setup/setup.md` § Branch — versionado no repositório, do time. `branch por card`, `branch acumula cards` ou `direto na integração`: **nada hardcoded aqui**, nem "default", nem "exceção". Pedido explícito na sessão ("hoje quero branch") vence para esta invocação e não reescreve o arquivo — o passo 6 oferece `/setup branch` se for pra virar padrão.
- **Status de "em andamento" é descoberto, nunca inventado** — o nome varia por projeto ("Em andamento", "In Progress", "Doing"…). A mecânica de descobrir e aplicar, e o que fazer quando o workflow não tem equivalente, é do **`prod/references/jira-sync.md`** (fonte única).
- Card não encontrado → o projeto pode estar em **outro site Atlassian** (o MCP alcança só o site do seu `JIRA_URL`). Diga isso; não aproxime para outra key.
- **Branch base e branch de trabalho são do motor `references/branch.md`** (fonte única): a integração resolvida pelo `prod/references/deploy-context.md` § 1 (base dos PRs recentes, depois `dev`, depois o default do GitHub; branch parada que nenhum PR mira não conta), nunca assumida; depois o modo do `/setup`. Regra de criação: **gh → integração → branch**.
- O `/method` trabalha SEMPRE na branch atual e **nunca cria branch** — por isso a branch nasce AQUI, antes de invocá-lo.

## Fluxo

### 0. Board do projeto e convenções do time (SEMPRE, antes de tudo)
1. **Invoque o `/jira-board`** — via **Skill tool** (`furi-ship:jira-board`; a forma curta `jira-board` também resolve). Chamada real, não "seguir de memória": sem a invocação, o passo não aconteceu. Dependência obrigatória, junto do `/solve` e do `/method`: ele lê a memória do projeto e, se não houver board gravado, pergunta e grava. Devolve `{site, key, boardId, boardName, url, origem}`.
2. **Invoque o `/setup`** — via **Skill tool** (`furi-ship:setup`; a forma curta `setup` também resolve). Dependência obrigatória: ele lê `.claude/ship-setup/setup.md` (versionado no repositório) e, se não existir, infere, pergunta o mínimo e grava. Devolve `{branch: {modo, nome}, commit, pr, jira, infra, guidelines, origem}` — o passo 2 usa `branch`, o passo 6 usa `pr`.

Duas invocações separadas, cada uma com a sua pergunta isolada (uma vez na vida do repositório). Key explícita no argumento (`ALK-42`) **vence** o que veio da memória e **não** a reescreve. No modo CONTINUE (argumento vazio), o board da memória é o que resolve site e prefixo de branch ao retomar o card ativo. Nunca assuma o board nem as convenções, nem pergunte por eles aqui.

### 1. Buscar o card
`mcp__atlassian__jira_get_issue` (`issue_key: KEY-N`): título, descrição, tipo, `## Como testar`, assignee, **anexos**. Colar a descrição **real** do card; se houver ambiguidade, listar ≥2 interpretações (insumo do passo 4).

> **O card vem em voz de PM/PO, QA ou Designer** (`/card`), não de dev — ele diz **o quê** e **por quê**, com rota, comportamento esperado e referência visual. Traduza isso para a **capacidade** que a feature exige. Card não é spec técnica: se ele prescrever solução, isso é ruído, não contrato — quem deriva arquitetura é o `/method`.
> Tem **anexo de imagem**? Baixe (`jira_download_attachments` / `jira_get_issue_images`) e leia antes de decidir: é o que o solicitante viu.

### 2. gh → integração → branch (REGRA DE OURO)
A mecânica é do **`references/branch.md`** (motor de branch), fonte única — siga-o, não o reescreva aqui. Entrada: `branch: {modo, nome}` do `/setup` (passo 0 — pedido explícito nesta sessão, "hoje quero branch" num repo `direto`, vence **para esta invocação** e não reescreve o arquivo; no passo 6 você **oferece** gravar), a key do card e a integração resolvida pelo `prod/references/deploy-context.md` § 1. Saída: o checkout na branch de trabalho — feature branch, lote aberto ou a própria integração — sincronizada com `origin/<integração>`, e `{integração, branch, modo, lote, origem}` para o report do passo 6. É nela que o `/method` (passo 5) trabalha; ele **nunca** cria branch.

### 3. Mover o card → em andamento
- Assignee (se ainda não for o executor): `mcp__atlassian__jira_update_issue`.
- Status: mover o card para o **equivalente a "em andamento"** no workflow daquele projeto ("Em andamento", "In Progress", "Doing"…). A mecânica é do **`prod/references/jira-sync.md`**, fonte única — siga-o, não o reescreva aqui.
- **Nenhuma equivalente no workflow?** Avise e siga — o trabalho não trava por causa de status. Nunca invente nome de transição nem force uma que signifique outra coisa.

### 4. GATE de perguntas (analisar — perguntar SÓ se necessário)
Entender o card lendo o **código** relevante. Ao fazer isso, já mapeie duas coisas que o `/method` vai cobrar: **qual motor é dono da regra** (ou qual falta) e **se a feature tem superfície visual** — entendimento, não implementação.

Dar uma **nota 0–100** à clareza do que precisa ser feito:
- **< 90, ou ambiguidade real** (2 caminhos opostos, requisito de produto faltando, decisão que só o usuário julga) → **PARAR e perguntar** (`AskUserQuestion`) ANTES de implementar. Só seguir com a resposta.
- **≥ 90 e sem ambiguidade** → seguir direto. **Não invente pergunta.**

> O gate é **pré-implementação** e é sobre *produto/escopo*. Dúvida de *implementação* resolve pela hierarquia (padrão do projeto > big apps > boas práticas) e documenta no spec — não vira pergunta ao usuário.

### 5. Rodar o /method
**Invoque o `/method`** — via **Skill tool** (`furi-build:method`; a forma curta `method` também resolve), **passando o card como argumento** (`KEY-N`). Chamada real, não "seguir de memória": sem a invocação, o passo não aconteceu. Dependência obrigatória. Ele:
1. chama o **`/solve`** (padrão 10x acima do #1 do mercado) na ativação — é assim que "resolve com /method e /solve" acontece;
2. roda discovery (1–5) → To Do (6) → Plano (7a) → Codificar (7b) → Code Review (8) → Run Test / QA via front (9) → Done (10);
3. trabalha **na branch do passo 2** (nunca cria branch), com seus próprios gateways e audits — cada um declarando **princípios (SOLID · DRY · KISS · YAGNI · LoD · Motores)**, **refatoração do perímetro** e, se a feature tem tela, **design** (tokens, atomicidade, estados, a11y);
4. **converge os follow-ups antes de fechar:** todo achado fora de escopo vira ciclo `/method` completo (com `/solve`) até o **passe seco** — o card sai sem ponta solta (Regra Inviolável 7);
5. fecha no **Step 10**: um único commit local com código + docs + card em `kanban/10-done/` — **incluindo os ciclos de follow-up** (ciclo aninhado não commita sozinho) — com a key do **card ativo** (o argumento) onde o § Commit mandar. Num lote, a branch é do 1º card; o commit é do card de hoje.

**Não duplicar nada do `/method` aqui** — ele é o dono do protocolo. `/work` só prepara (branch + card + perguntas) e delega.

### 6. Encerrar
```
✅ /work KEY-N — implementado, revisado, testado e commitado (local).
   Projeto: <KEY>  ·  Board: <nome do board> [memória do projeto | argumento]
   Setup:   <branch por card | branch acumula cards | direto na integração> [arquivo | criado agora | override de sessão]
   Branch:  <branch>  [feature branch | lote: <n> cards — <keys, dos commits> | direto na integração]
   Commit:  <hash>
   Kanban:  kanban/10-done/<feature>.md
   Próximo: /pull-request  (push · abre ou atualiza o PR — ou só pusha, se § PR `Abre PR: não` · espelha em cada card)
```

Houve override de sessão no passo 2? Uma linha a mais, **oferecendo** — nunca gravando: *"Hoje foi `<modo>`; quer que vire o padrão deste repositório?"* — um "sim" e você invoca `/setup branch` (skill interna: o usuário não a digita).

## Red Flags — STOP

- "Descobri/perguntei o board direto aqui" → NÃO. Passo 0 é o `/jira-board`; ele é o único dono da memória do projeto. Skill que pergunta o board por conta própria pergunta de novo amanhã.
- "Pulei o passo 0 porque já sei o board desta sessão" → NÃO. A leitura da memória é **toda** invocação.
- "Assumi o board de sempre" → NÃO. Board vem do `/jira-board`; a key, do argumento ou da memória; sprint e transições são **descobertos** na hora.
- "Assumi que crio branch (é o fluxo dos devs)" / "assumi que trabalho direto (é o meu repo)" → NÃO. O modo vem do **`/setup`** § Branch, lido do `.claude/ship-setup/setup.md` a cada invocação. Sem arquivo, o `/setup` pergunta — uma vez na vida do repositório.
- "Já sei o setup desta sessão, sigo sem invocar" → NÃO. Mencionar não é invocar; a leitura é **toda** vez.
- "O usuário pediu branch hoje, atualizei o `.claude/ship-setup/setup.md`" → NÃO. Override de sessão vale pra invocação. Só `/setup branch` reescreve o arquivo.
- "O status 'Em andamento' não existe nesse projeto, então inventei um" → NÃO. Escolha entre as transições que existem; nenhuma equivalente → avisa e segue.
- "Resolvi a branch de cabeça (`checkout dev`, `checkout main`, branchei de `homolog`, renomeei o lote)" → NÃO. Passo 2 é o motor `references/branch.md`: integração pela topologia, modo pelo `/setup`, lote pelos PRs — e as red flags dele valem aqui.
- "Deixo o `/method` criar a branch" → ele **não cria**. A branch nasce no passo 2.
- "Invoquei o `/method` sem passar o card; ele tira a key da branch" → NÃO. Num lote a branch é do 1º card e o commit sairia com a key errada. O argumento é `KEY-N`.
- "Já conheço o `/solve` / o `/jira-board` / o `/setup` / o `/method`, sigo sem invocar" → NÃO. Mencionar não é invocar: a skill entra pelo Skill tool, **toda** vez.
- "Card claro, mas pergunto mesmo assim" → NÃO. ≥90 e sem ambiguidade → segue. Pergunta só quando a resposta **muda o que será feito**.
- "Card ambíguo, mas começo a codar e ajusto depois" → NÃO. Gate de perguntas é **antes** de implementar.
- "O card não falou de motor, então espalho a regra" → NÃO. O card fala de produto; a arquitetura é derivada no `/method`, e capacidade tem **um** dono.
- "O card tinha print anexado, mas nem abri" → NÃO. O anexo é o que o solicitante viu; leia antes de decidir.
- "Refatoro/arrumo a UI depois que o PR passar" → NÃO. Refatoração e design são regime, cobrados gateway a gateway dentro do `/method`.
- "Terminei, já abro o PR / dou push" → NÃO. `/work` para no **commit local**. Ship é `/pull-request`.
