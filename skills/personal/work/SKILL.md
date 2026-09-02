---
name: work
description: 'Use when user invokes /work [KEY-N] to take a Jira card from todo to committed-locally on ANY board (personal Atlassian) — standalone, NOT the Eduzz /jira. Discovers the project board from the card key, syncs the integration branch `dev` from GitHub and branches off it (gh→dev→branch), moves the card to in-progress, asks clarifying questions if the card is ambiguous, then runs /method (which invokes /solve) to implement + review + QA + commit on the branch. Stops at the local commit; ship is /pull-request + /merge.'
effort: max
requires: method
argument-hint: "[KEY-N] | (empty = continuar card ativo)"
---

# /work — Trabalhar um card do Jira (do todo ao commit)

Pega um card de **qualquer board** do Atlassian pessoal e leva até o **commit local** na feature branch, no nível da referência #1 do mercado. **Skill standalone do projeto pessoal** — NÃO é o `/jira` (esse é Eduzz, outro contexto, fica fora daqui). Reusa o `/method` (que já invoca o `/solve`) como protocolo de engenharia.

> 🚫 NÃO faz push, NÃO abre PR, NÃO mergeia. Termina no **commit local** (Step 10 do `/method`). Ship é o `/pull-request` depois.

## Iron Law

> **Precisão > tokens > velocidade.** Mire ser a **referência #1 do mercado** (padrão do `/solve`, que o `/method` carrega na ativação). "É simples, pulo" = a violação.
> Os princípios (**SOLID · DRY · KISS · YAGNI · LoD · Motores**), a **refatoração contínua** (tudo por onde passa sobe) e o **design** (tokens, atomicidade, estados, a11y — quando tem tela) vêm juntos e valem em **todos** os steps, não só no código — lente por step em `method/references/principios.md` e `method/references/design.md`. Card "pequeno" não relaxa nenhum deles.

## Disciplina em todos os passos

Os passos 1-4 são **preparação**: é neles que o card vira entendimento — qual **capacidade** ele pede, **qual motor é dono** dela (ou qual falta) e se a feature tem **superfície visual**. O passo 5 é onde o regime roda inteiro: o `/method` cobra princípios, motores, refatoração e design **declarados em cada gateway**, step a step, até o commit.

Nenhum desses passos é lugar de "adianto um código". Entender aqui é o que faz o `/method` não escorregar lá na frente.

## Argument parsing

| Arg | Modo | Ação |
|-----|------|------|
| `KEY-N` (ou URL do card) | START | roda do zero pra esse card, em **qualquer** projeto |
| vazio | CONTINUE | detecta a branch/card ativo e retoma de onde parou |

## Convenções (CONTRATO)

- **Qualquer projeto** do Atlassian pessoal, sempre via `mcp__atlassian__*`. A key sai do próprio argumento (`ALK-42` → projeto `ALK`) — **nada hardcoded**.
- **Board e sprint são descobertos**, não presumidos: `mcp__atlassian__jira_get_agile_boards` (`project_key`). Projeto sem board ágil → segue sem sprint, e avisa.
- **Status de "em andamento" é descoberto**: `mcp__atlassian__jira_get_transitions` e escolha a transição equivalente entre as que **existem** no workflow ("Em andamento", "In Progress", "Doing"…). Nenhuma equivalente → **avise e siga sem transicionar**; nunca invente nome de status.
- Card não encontrado → o projeto pode estar em **outro site Atlassian** (o MCP alcança só o site do seu `JIRA_URL`). Diga isso; não aproxime para outra key.
- Branch base = **`dev`** (não `main`). Regra de criação: **gh → dev → branch**.
  > **Padrão:** `dev` é a **branch** de integração, o que vem antes da `main`. **homolog** é o **ambiente** publicado a partir dela — nome de ambiente, nunca de branch. "Mergeei na dev" = integrado; "está em homolog" = no ar.
- O `/method` trabalha SEMPRE na branch atual e **nunca cria branch** — por isso a branch nasce AQUI, antes de invocá-lo.

## Fluxo

### 1. Buscar o card
`mcp__atlassian__jira_get_issue` (`issue_key: KEY-N`): título, descrição, tipo, `## Como testar`, assignee, **anexos**. Colar a descrição **real** do card; se houver ambiguidade, listar ≥2 interpretações (insumo do passo 4).

> **O card vem em voz de PM/PO, QA ou Designer** (`/card`), não de dev — ele diz **o quê** e **por quê**, com rota, comportamento esperado e referência visual. Traduza isso para a **capacidade** que a feature exige. Card não é spec técnica: se ele prescrever solução, isso é ruído, não contrato — quem deriva arquitetura é o `/method`.
> Tem **anexo de imagem**? Baixe (`jira_download_attachments` / `jira_get_issue_images`) e leia antes de decidir: é o que o solicitante viu.

### 2. gh → dev → branch (REGRA DE OURO)
Nunca branchar de `dev` stale — trazer tudo e resolver conflito antes:
```bash
git checkout dev
git fetch origin
git merge origin/dev        # gh → dev: traz o remoto; CONFLITO → resolver (entender os 2 lados)
git checkout -b <branch>    # dev → branch (a partir da dev atual e limpa)
git branch --show-current   # confirmar
```
Nome da branch: derivado do card — `<key-minúscula>-<n>` (ex.: `niv-12`, `alk-42`), ou `<key>-<n>-slug-curto`. Multi-card: `<key>-<n>-<m>` (ordem crescente). Branch já existe → `checkout` nela.
> **Manter a branch atualizada:** se `origin/dev` andar durante o trabalho, trazer pra branch (`git merge origin/dev`, resolvendo conflitos) — o `/method` revê e testa o resultado integrado. Branch nunca fica pra trás de `dev`.
> **Exceção (Eduardo trabalha direto em `dev`):** se a intenção for não usar branch, pular o `checkout -b` e seguir na `dev` (após o sync acima). **Default = criar branch** (fluxo dos devs).

### 3. Mover o card → em andamento
- Assignee (se ainda não for o executor): `mcp__atlassian__jira_update_issue`.
- Status: `mcp__atlassian__jira_get_transitions` → escolher a transição **equivalente a "em andamento"** entre as que o workflow daquele projeto oferece ("Em andamento", "In Progress", "Doing"…) → `mcp__atlassian__jira_transition_issue` com o `id` dela. Sem `comment` na transição (ADF).
- **Nenhuma equivalente no workflow?** Avise e siga — o trabalho não trava por causa de status. Nunca invente nome de transição nem force uma que signifique outra coisa.

### 4. GATE de perguntas (analisar — perguntar SÓ se necessário)
Entender o card lendo o **código** relevante. Ao fazer isso, já mapeie duas coisas que o `/method` vai cobrar: **qual motor é dono da regra** (ou qual falta) e **se a feature tem superfície visual** — entendimento, não implementação.

Dar uma **nota 0–100** à clareza do que precisa ser feito:
- **< 90, ou ambiguidade real** (2 caminhos opostos, requisito de produto faltando, decisão que só o usuário julga) → **PARAR e perguntar** (`AskUserQuestion`) ANTES de implementar. Só seguir com a resposta.
- **≥ 90 e sem ambiguidade** → seguir direto. **Não invente pergunta.**

> O gate é **pré-implementação** e é sobre *produto/escopo*. Dúvida de *implementação* resolve pela hierarquia (padrão do projeto > big apps > boas práticas) e documenta no spec — não vira pergunta ao usuário.

### 5. Rodar o /method
Invoque o **`/method`** (dependência obrigatória). Ele:
1. chama o **`/solve`** (padrão #1 do mercado) na ativação — é assim que "resolve com /method e /solve" acontece;
2. roda discovery (1–5) → To Do (6) → Plano (7a) → Codificar (7b) → Code Review (8) → Run Test / QA via front (9) → Done (10);
3. trabalha **na branch do passo 2** (nunca cria branch), com seus próprios gateways e audits — cada um declarando **princípios (SOLID · DRY · KISS · YAGNI · LoD · Motores)**, **refatoração do perímetro** e, se a feature tem tela, **design** (tokens, atomicidade, estados, a11y);
4. **converge os follow-ups antes de fechar:** todo achado fora de escopo vira ciclo `/method` completo (com `/solve`) até o **passe seco** — o card sai sem ponta solta (Regra Inviolável 7);
5. fecha no **Step 10**: um único commit local com código + docs + card em `kanban/10-done/` — **incluindo os ciclos de follow-up** (ciclo aninhado não commita sozinho).

**Não duplicar nada do `/method` aqui** — ele é o dono do protocolo. `/work` só prepara (branch + card + perguntas) e delega.

### 6. Encerrar
```
✅ /work KEY-N — implementado, revisado, testado e commitado (local).
   Projeto: <KEY>  ·  Board: <nome do board>
   Branch:  <branch>
   Commit:  <hash>
   Kanban:  kanban/10-done/<feature>.md
   Próximo: /pull-request  (push + PR pra dev + espelha no card)
```

## Red Flags — STOP

- "Vou usar o `/jira`" → NÃO. `/jira` é Eduzz. `/work` é o fluxo pessoal (kanban local + `/method`), **standalone** — e serve **qualquer board**, o que não o transforma no `/jira`.
- "Assumi o board de sempre" → NÃO. A key vem do argumento; board, sprint e transições são **descobertos**.
- "O status 'Em andamento' não existe nesse projeto, então inventei um" → NÃO. Escolha entre as transições que existem; nenhuma equivalente → avisa e segue.
- "Branchei de `dev` sem trazer o remoto" → NÃO. **gh → dev → branch**, sempre.
- "Branchei de `homolog`" → NÃO existe branch `homolog`. É o **ambiente**; a branch de integração é `dev`.
- "Deixo o `/method` criar a branch" → ele **não cria**. A branch nasce no passo 2.
- "Card claro, mas pergunto mesmo assim" → NÃO. ≥90 e sem ambiguidade → segue. Pergunta só quando a resposta **muda o que será feito**.
- "Card ambíguo, mas começo a codar e ajusto depois" → NÃO. Gate de perguntas é **antes** de implementar.
- "O card não falou de motor, então espalho a regra" → NÃO. O card fala de produto; a arquitetura é derivada no `/method`, e capacidade tem **um** dono.
- "O card tinha print anexado, mas nem abri" → NÃO. O anexo é o que o solicitante viu; leia antes de decidir.
- "Refatoro/arrumo a UI depois que o PR passar" → NÃO. Refatoração e design são regime, cobrados gateway a gateway dentro do `/method`.
- "Terminei, já abro o PR / dou push" → NÃO. `/work` para no **commit local**. Ship é `/pull-request`.
