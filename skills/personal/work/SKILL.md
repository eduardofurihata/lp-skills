---
name: work
description: 'Use when user invokes /work [NIV-X] to take a NIVEE card from todo to committed-locally — standalone, NOT the Eduzz /jira. Syncs homolog from GitHub and branches off it (gh→homolog→branch), moves the card to "Em andamento", asks clarifying questions if the card is ambiguous, then runs /method (which invokes /solve) to implement + review + QA + commit on the branch. Stops at the local commit; ship is /pr + /merge.'
effort: max
requires: method
argument-hint: "[NIV-X] | (empty = continuar card ativo)"
---

# /work — Trabalhar um card NIVEE (do todo ao commit)

Pega um card do board **NIVEE** e leva até o **commit local** na feature branch, no nível da referência #1 do mercado. **Skill standalone do projeto pessoal** — NÃO é o `/jira` (esse é Eduzz, outro contexto, fica fora daqui). Reusa o `/method` (que já invoca o `/solve`) como protocolo de engenharia.

> 🚫 NÃO faz push, NÃO abre PR, NÃO mergeia. Termina no **commit local** (Step 10 do `/method`). Ship é o `/pr` depois.

## Iron Law

> **Precisão > tokens > velocidade.** Mire ser a **referência #1 do mercado** (padrão do `/solve`, que o `/method` carrega na ativação). "É simples, pulo" = a violação.

## Argument parsing

| Arg | Modo | Ação |
|-----|------|------|
| `NIV-X` (ou URL do card) | START | roda do zero pra esse card |
| vazio | CONTINUE | detecta a branch/card ativo e retoma de onde parou |

## Convenções (CONTRATO)

- Board **NIVEE**, projeto `NIV`, sempre via `mcp__atlassian__*`.
- Branch base = **`homolog`** (não `main`). Regra de criação: **gh → homolog → branch**.
- O `/method` trabalha SEMPRE na branch atual e **nunca cria branch** — por isso a branch nasce AQUI, antes de invocá-lo.

## Fluxo

### 1. Buscar o card
`mcp__atlassian__jira_get_issue` (`issue_key: NIV-X`): título, descrição, tipo, `## Como testar`, assignee. Colar a descrição **real** do card; se houver ambiguidade, listar ≥2 interpretações (insumo do passo 4).

### 2. gh → homolog → branch (REGRA DE OURO)
Nunca branchar de `homolog` stale — trazer tudo e resolver conflito antes:
```bash
git checkout homolog
git fetch origin
git merge origin/homolog    # gh → homolog: traz o remoto; CONFLITO → resolver (entender os 2 lados)
git checkout -b <branch>    # homolog → branch (a partir da homolog atual e limpa)
git branch --show-current   # confirmar
```
Nome da branch: derivado do card — `niv-X` (ou `niv-X-slug-curto`). Multi-card: `niv-X-Y` (ordem crescente). Branch já existe → `checkout` nela.
> **Manter a branch atualizada:** se `origin/homolog` andar durante o trabalho, trazer pra branch (`git merge origin/homolog`, resolvendo conflitos) — o `/method` revê e testa o resultado integrado. Branch nunca fica pra trás de homolog.
> **Exceção (Eduardo trabalha direto em homolog):** se a intenção for não usar branch, pular o `checkout -b` e seguir na `homolog` (após o sync acima). **Default = criar branch** (fluxo dos devs).

### 3. Mover o card → "Em andamento"
- Assignee (se ainda não for o executor): `mcp__atlassian__jira_update_issue`.
- Status: `mcp__atlassian__jira_get_transitions` (achar o `id`) → `mcp__atlassian__jira_transition_issue` pro **"Em andamento"**. Sem `comment` na transição (ADF).

### 4. GATE de perguntas (analisar — perguntar SÓ se necessário)
Entender o card lendo o **código** relevante. Dar uma **nota 0–100** à clareza do que precisa ser feito:
- **< 90, ou ambiguidade real** (2 caminhos opostos, requisito de produto faltando, decisão que só o usuário julga) → **PARAR e perguntar** (`AskUserQuestion`) ANTES de implementar. Só seguir com a resposta.
- **≥ 90 e sem ambiguidade** → seguir direto. **Não invente pergunta.**

> O gate é **pré-implementação** e é sobre *produto/escopo*. Dúvida de *implementação* resolve pela hierarquia (padrão do projeto > big apps > boas práticas) e documenta no spec — não vira pergunta ao usuário.

### 5. Rodar o /method
Invoque o **`/method`** (dependência obrigatória). Ele:
1. chama o **`/solve`** (padrão #1 do mercado) na ativação — é assim que "resolve com /method e /solve" acontece;
2. roda discovery (1–5) → To Do (6) → Plano (7a) → Codificar (7b) → Code Review (8) → Run Test / QA via front (9) → Done (10);
3. trabalha **na branch do passo 2** (nunca cria branch), com seus próprios gateways e audits;
4. fecha no **Step 10**: um único commit local com código + docs + card em `kanban/10-done/`.

**Não duplicar nada do `/method` aqui** — ele é o dono do protocolo. `/work` só prepara (branch + card + perguntas) e delega.

### 6. Encerrar
```
✅ /work NIV-X — implementado, revisado, testado e commitado (local).
   Branch:  <branch>
   Commit:  <hash>
   Kanban:  kanban/10-done/<feature>.md
   Próximo: /pr  (push + PR pra homolog + espelha no card)
```

## Red Flags — STOP

- "Vou usar o `/jira`" → NÃO. `/jira` é Eduzz. `/work` é o projeto pessoal, **standalone**.
- "Branchei de homolog sem `pull --ff-only`" → NÃO. **gh → homolog → branch**, sempre.
- "Deixo o `/method` criar a branch" → ele **não cria**. A branch nasce no passo 2.
- "Card claro, mas pergunto mesmo assim" → NÃO. ≥90 e sem ambiguidade → segue. Pergunta só quando a resposta **muda o que será feito**.
- "Card ambíguo, mas começo a codar e ajusto depois" → NÃO. Gate de perguntas é **antes** de implementar.
- "Terminei, já abro o PR / dou push" → NÃO. `/work` para no **commit local**. Ship é `/pr`.
