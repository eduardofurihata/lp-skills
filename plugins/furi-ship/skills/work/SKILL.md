---
name: work
description: 'Use when user invokes /work [KEY-N] to take a Jira card from todo to committed-locally on ANY board (personal Atlassian) — standalone. Discovers the project board from the card key (/jira-board) and the team conventions from `.claude/setup.md` (/setup: work directly on the integration branch or branch per card, branch naming), syncs the integration branch from GitHub and branches off it when the setup says so (gh→integração→branch), moves the card to in-progress, asks clarifying questions if the card is ambiguous, then runs /method (which invokes /solve) to implement + review + QA + commit on the branch. Stops at the local commit; ship is /pull-request + /homolog (and /prod for production).'
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
- **Modo de trabalho e nome da branch vêm do `/setup`** (passo 0, dependência obrigatória), que lê `.claude/setup.md` § Branch — versionado no repositório, do time. `branch por card` ou `direto na integração`: **nada hardcoded aqui**, nem "default", nem "exceção". Pedido explícito na sessão ("hoje quero branch") vence para esta invocação e não reescreve o arquivo.
- **Status de "em andamento" é descoberto, nunca inventado** — o nome varia por projeto ("Em andamento", "In Progress", "Doing"…). A mecânica de descobrir e aplicar, e o que fazer quando o workflow não tem equivalente, é do **`prod/references/jira-sync.md`** (fonte única).
- Card não encontrado → o projeto pode estar em **outro site Atlassian** (o MCP alcança só o site do seu `JIRA_URL`). Diga isso; não aproxime para outra key.
- Branch base = a **integração** (`dev`; ou `main`, em branch única — detectada, nunca assumida). Regra de criação: **gh → integração → branch**.
  > **Padrão:** `dev` é a **branch** de integração, o que vem antes da `main`. **homolog** é o **ambiente** publicado a partir dela — nome de ambiente, nunca de branch. "Mergeei na dev" = integrado; "está em homolog" = no ar.
- O `/method` trabalha SEMPRE na branch atual e **nunca cria branch** — por isso a branch nasce AQUI, antes de invocá-lo.

## Fluxo

### 0. Board do projeto e convenções do time (SEMPRE, antes de tudo)
1. **Invoque o `/jira-board`** — via **Skill tool** (`furi-ship:jira-board`; a forma curta `jira-board` também resolve). Chamada real, não "seguir de memória": sem a invocação, o passo não aconteceu. Dependência obrigatória, junto do `/solve` e do `/method`: ele lê a memória do projeto e, se não houver board gravado, pergunta e grava. Devolve `{site, key, boardId, boardName, url, origem}`.
2. **Invoque o `/setup`** — via **Skill tool** (`furi-ship:setup`; a forma curta `setup` também resolve). Dependência obrigatória: ele lê `.claude/setup.md` (versionado no repositório) e, se não existir, infere, pergunta o mínimo e grava. Devolve `{branch: {modo, nome}, commit, pr, jira, infra, guidelines, origem}` — o passo 2 usa `branch`, o passo 6 usa `pr`.

Duas invocações separadas, cada uma com a sua pergunta isolada (uma vez na vida do repositório). Key explícita no argumento (`ALK-42`) **vence** o que veio da memória e **não** a reescreve. No modo CONTINUE (argumento vazio), o board da memória é o que resolve site e prefixo de branch ao retomar o card ativo. Nunca assuma o board nem as convenções, nem pergunte por eles aqui.

### 1. Buscar o card
`mcp__atlassian__jira_get_issue` (`issue_key: KEY-N`): título, descrição, tipo, `## Como testar`, assignee, **anexos**. Colar a descrição **real** do card; se houver ambiguidade, listar ≥2 interpretações (insumo do passo 4).

> **O card vem em voz de PM/PO, QA ou Designer** (`/card`), não de dev — ele diz **o quê** e **por quê**, com rota, comportamento esperado e referência visual. Traduza isso para a **capacidade** que a feature exige. Card não é spec técnica: se ele prescrever solução, isso é ruído, não contrato — quem deriva arquitetura é o `/method`.
> Tem **anexo de imagem**? Baixe (`jira_download_attachments` / `jira_get_issue_images`) e leia antes de decidir: é o que o solicitante viu.

### 2. gh → integração → branch (REGRA DE OURO)
A branch de integração vem da **topologia**, nunca assumida — `git ls-remote --heads origin dev` vazio ⇒ branch única, e a integração é `main` (detalhe: `prod/references/deploy-context.md`). Nunca trabalhar sobre integração stale — trazer tudo e resolver conflito antes:
```bash
git checkout <integração>
git fetch origin
git merge origin/<integração>   # gh → integração: traz o remoto; CONFLITO → resolver (entender os 2 lados)
```
O que acontece depois vem do **§ Branch do `/setup`** (passo 0) — a lógica mora lá, aqui só se aplica:

| `Trabalho:` no setup | Ação | Branch de trabalho |
|---|---|---|
| `branch por card` | `git checkout -b <nome>` a partir da integração limpa (branch já existe → `checkout` nela); `git branch --show-current` confirma | a feature branch |
| `direto na integração` | nenhum `checkout -b` | a própria integração, já sincronizada |

Nome da branch: o padrão `Nome:` do setup, com `<key>`/`<n>`/`<slug>` do card — default `<key-minúscula>-<n>` (ex.: `niv-12`, `alk-42`) ou `<key>-<n>-slug-curto`; multi-card `<key>-<n>-<m>` (ordem crescente).
> **Manter a branch atualizada** (só em `branch por card`): se `origin/<integração>` andar durante o trabalho, trazer pra branch (`git merge origin/<integração>`, resolvendo conflitos) — o `/method` revê e testa o resultado integrado. Branch nunca fica pra trás da integração.
> Pedido explícito nesta sessão ("hoje quero branch" num repo `direto`) vence **para esta invocação** e não reescreve o setup — mudar o padrão é `/setup branch`.

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
**Invoque o `/method`** — via **Skill tool** (`furi-build:method`; a forma curta `method` também resolve). Chamada real, não "seguir de memória": sem a invocação, o passo não aconteceu. Dependência obrigatória. Ele:
1. chama o **`/solve`** (padrão 10x acima do #1 do mercado) na ativação — é assim que "resolve com /method e /solve" acontece;
2. roda discovery (1–5) → To Do (6) → Plano (7a) → Codificar (7b) → Code Review (8) → Run Test / QA via front (9) → Done (10);
3. trabalha **na branch do passo 2** (nunca cria branch), com seus próprios gateways e audits — cada um declarando **princípios (SOLID · DRY · KISS · YAGNI · LoD · Motores)**, **refatoração do perímetro** e, se a feature tem tela, **design** (tokens, atomicidade, estados, a11y);
4. **converge os follow-ups antes de fechar:** todo achado fora de escopo vira ciclo `/method` completo (com `/solve`) até o **passe seco** — o card sai sem ponta solta (Regra Inviolável 7);
5. fecha no **Step 10**: um único commit local com código + docs + card em `kanban/10-done/` — **incluindo os ciclos de follow-up** (ciclo aninhado não commita sozinho).

**Não duplicar nada do `/method` aqui** — ele é o dono do protocolo. `/work` só prepara (branch + card + perguntas) e delega.

### 6. Encerrar
```
✅ /work KEY-N — implementado, revisado, testado e commitado (local).
   Projeto: <KEY>  ·  Board: <nome do board> [memória do projeto | argumento]
   Setup:   <branch por card | direto na integração> [arquivo | criado agora]
   Branch:  <branch>  [feature branch | direto na integração]
   Commit:  <hash>
   Kanban:  kanban/10-done/<feature>.md
   Próximo: /pull-request  (push + PR pra integração + espelha no card)      ← § PR `Abre PR: sim`
            /homolog — ou /prod, em branch única (o que está na integração vai ao ar)   ← § PR `Abre PR: não`
```

## Red Flags — STOP

- "Descobri/perguntei o board direto aqui" → NÃO. Passo 0 é o `/jira-board`; ele é o único dono da memória do projeto. Skill que pergunta o board por conta própria pergunta de novo amanhã.
- "Pulei o passo 0 porque já sei o board desta sessão" → NÃO. A leitura da memória é **toda** invocação.
- "Assumi o board de sempre" → NÃO. Board vem do `/jira-board`; a key, do argumento ou da memória; sprint e transições são **descobertos** na hora.
- "Assumi que crio branch (é o fluxo dos devs)" / "assumi que trabalho direto (é o meu repo)" → NÃO. O modo vem do **`/setup`** § Branch, lido do `.claude/setup.md` a cada invocação. Sem arquivo, o `/setup` pergunta — uma vez na vida do repositório.
- "Já sei o setup desta sessão, sigo sem invocar" → NÃO. Mencionar não é invocar; a leitura é **toda** vez.
- "O usuário pediu branch hoje, atualizei o `.claude/setup.md`" → NÃO. Override de sessão vale pra invocação. Só `/setup branch` reescreve o arquivo.
- "O status 'Em andamento' não existe nesse projeto, então inventei um" → NÃO. Escolha entre as transições que existem; nenhuma equivalente → avisa e segue.
- "Branchei de `dev` sem trazer o remoto" → NÃO. **gh → integração → branch**, sempre.
- "Branchei de `homolog`" → NÃO existe branch `homolog`. É o **ambiente**; a branch de integração é `dev` (ou `main`, em branch única).
- "Todo projeto meu tem `dev`, dou `checkout dev`" → NÃO. `git ls-remote` primeiro: em branch única o `checkout dev` falha e o fluxo trava na largada.
- "Deixo o `/method` criar a branch" → ele **não cria**. A branch nasce no passo 2.
- "Já conheço o `/solve` / o `/jira-board` / o `/setup` / o `/method`, sigo sem invocar" → NÃO. Mencionar não é invocar: a skill entra pelo Skill tool, **toda** vez.
- "Card claro, mas pergunto mesmo assim" → NÃO. ≥90 e sem ambiguidade → segue. Pergunta só quando a resposta **muda o que será feito**.
- "Card ambíguo, mas começo a codar e ajusto depois" → NÃO. Gate de perguntas é **antes** de implementar.
- "O card não falou de motor, então espalho a regra" → NÃO. O card fala de produto; a arquitetura é derivada no `/method`, e capacidade tem **um** dono.
- "O card tinha print anexado, mas nem abri" → NÃO. O anexo é o que o solicitante viu; leia antes de decidir.
- "Refatoro/arrumo a UI depois que o PR passar" → NÃO. Refatoração e design são regime, cobrados gateway a gateway dentro do `/method`.
- "Terminei, já abro o PR / dou push" → NÃO. `/work` para no **commit local**. Ship é `/pull-request`.
