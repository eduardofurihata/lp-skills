---
name: repro
description: "Use when user invokes /repro [CARD-CODE] to take an Eduzz Jira card from live repro to PR — the bug is reproduced on the front BEFORE any code and the dev sees it twice, before and after the fix. Step 0 (investigação + reprodução no front via Playwright, nota ≥90 em loop) → /method (implementação) → human check (o dev clica no trigger e confirma que o bug sumiu) → ship (push + PR + Jira, só depois de perguntar). As 2 validações humanas são obrigatórias mesmo em `/repro finish` (modo autônomo). Instala o /method junto (dependência)."
argument-hint: "[CARD-CODE] | finish [CARD-CODE] | (empty to continue active card)"
requires: method
---

# /repro — Card do Jira: reproduzir → corrigir → provar

**Esta skill é FERRO.** Vale para TODA a conversa.
**Violating the letter of the rules is violating the spirit of the rules.**
**Precisão > tokens > velocidade.** Tokens são baratos. Bug em produção é caro.
**Padrão de qualidade — 10x:** mire **10x acima da referência #1 do mercado** — o padrão das big pop tech apps / líderes do domínio é a baseline (o piso, não o teto; o alvo é 10x acima dele). Complexidade pra atingir esse nível é requisito, não obstáculo.

> O protocolo de engenharia é o **`/method`**, instalado junto com o `/repro` (dependência). O `/repro` cuida da investigação (Step 0), aciona o `/method` para implementar, e fecha com human check + ship.

---

## Argument Parsing (PRIMEIRO — antes de qualquer ação)

| Argumento | Modo | Ação |
|-----------|------|------|
| `finish [CARD-CODE]` ou `finish` | **FINISH** | Roda tudo (Step 0 → /method → human check → ship) sem parar — exceto as 2 validações humanas, que continuam obrigatórias |
| `[CARD-CODE]` (ex. `PROJ-36`) ou URL Jira | **START** | Roda o Step 0 e PARA na validação humana do bug (0.8) |
| vazio | **CONTINUE** | Detecta o card ativo e continua de onde parou |

**CONTINUE — routing** (lê o frontmatter `phase:` do card em `docs/jira/todo/`):

| `phase` | Ação |
|---------|------|
| `investigation` | retomar o Step 0 |
| `method` | re-invocar o `/method` (Skill tool — `furi-build:method`) e retomar do step registrado no card |
| `human-check` | rodar o human check |
| `ship` | rodar o ship (após confirmação do usuário) |
| nenhum card | "Nenhum card ativo. Use `/repro [CARD-CODE]` para começar." |

---

## Step 0 — Investigação (antes do /method)

**Objetivo:** entender e reproduzir o problema do card ANTES de implementar. Cada sub-step é bloqueante. Texto objetivo — sem cerimônia.

### 0.1 — Ler as convenções do time e atualizar main
```bash
cat .claude/ship-setup/setup.md 2>/dev/null || cat .claude/ship-setup/setup.local.md 2>/dev/null   # do time (versionado) ou só meu (fora do git); lido por caminho
git checkout main && git pull --ff-only
```
Existe (qualquer dos dois — o do time vence) → o **§ Branch** decide o 0.2 e o **§ PR** decide o ship (`references/ship.md`). Não existe → os defaults abaixo, e o `/repro` **não cria** o arquivo — quem escreve é o time, à mão ou pelo template dele. Aplicar o que está escrito é daqui; escrever, não. Em repositório Eduzz onde `.claude/` fica fora do git de propósito, o que vale é o `setup.local.md` — o processo é de quem usa, não do time, e por isso não vai pro repo.

### 0.2 — Criar branch (ou não)
| § Branch `Trabalho:` | Ação |
|---|---|
| `branch por card` (**default** sem setup) | nome pelo padrão `Nome:` do setup — default `PROJ-N`; a caixa do placeholder é a do nome. Vários cards na mesma branch (`branch acumula cards`): o nome fica no **1º card** e cada card entra pelo próprio commit (key no commit, não no nome) — é dos commits que o PR deriva a lista de cards. Se a branch já existe → `checkout`; senão → `git checkout -b <nome>`. Confirmar com `git branch --show-current` |
| `direto na integração` | nenhum `checkout -b`: o trabalho fica na `main` já atualizada; o frontmatter do card (0.3) registra `branch: main` |

### 0.3 — Registrar o card
Criar `docs/jira/todo/[CARD-CODE].md` (criar `docs/jira/todo/` e `docs/jira/done/` se não existirem). Buscar os dados via `mcp__atlassian__jira_get_issue` (`issue_key: [CARD-CODE]`) — título, descrição, tipo `BUG`|`FEATURE`, assignee. Frontmatter mínimo:

```yaml
card: [CARD-CODE]
title: [título do Jira]
type: BUG | FEATURE
branch: [nome da branch]
phase: investigation
```

Colar a **descrição real** do card e listar ao menos 2 interpretações.

### 0.4 — Atribuir o card (Jira ownership)
- Assignee (se ainda não for o executor): `mcp__atlassian__jira_update_issue` (`issue_key: [CARD-CODE]`, `fields: { "assignee": { "accountId": "[executor]" } }`).
- Status → "Em andamento": `mcp__atlassian__jira_get_transitions` (`issue_key: [CARD-CODE]`) para achar o `id` da transição, depois `mcp__atlassian__jira_transition_issue` (`issue_key`, `transition_id`).

### 0.5 — Entender o problema (nota ≥ 90)
Ler o **código** relevante e entender o problema descrito no card. Dar uma **nota 0–100** à precisão do seu entendimento. **`< 90` → revisar** (ler mais código/contexto) e repontuar, **em loop até `≥ 90`**. Registrar o entendimento no card `.md`.

### 0.6 — Reproduzir no front (Playwright MCP) (nota ≥ 90)
Abrir o **pw MCP** (instância `pw4`, fallback no pool) e reproduzir o cenário real no front. Dar uma **nota 0–100** à precisão da reprodução vs. **o que realmente está escrito no card**. **`< 90` → ajustar** e repontuar, **em loop até `≥ 90`**. Ao atingir `≥ 90`:
- **BUG:** registrar no card `.md` exatamente **como** o cenário foi reproduzido (usuário, dados, URL, passos, trigger).
- **FEATURE/implementação:** identificar e registrar **onde** vamos implementar (arquivo / fluxo / tela).

### 0.7 — Preparar a validação humana do bug
Rodar o fluxo de novo e **parar 1 passo antes do trigger**, deixando o gatilho visível na tela. Screenshot do estado pré-trigger.

### 0.8 — PARAR para validação humana (pré-fix)
Publicar no chat: ambiente pronto + "👉 Clique em **[elemento exato]**" + comportamento atual (o bug) + screenshot. **PARAR** e aguardar o dev confirmar que **viu o bug**.
- **FINISH MODE:** auto-confirmar (registrar no card que foi aceito) e seguir.
- Atualizar o card: `phase: method`.

---

## Rodar o /method

Com o problema **entendido e reproduzido**, rode o **`/method`** (instalado junto com o `/repro` — dependência obrigatória) para implementar:

1. **Invoque o `/method`** — via **Skill tool** (`furi-build:method`; a forma curta `method` também resolve). Chamada real, não "seguir de memória": sem a invocação, o passo não aconteceu. Ele invoca o `/solve` na ativação e roda discovery → implementação → code review → testes → done (commit local), com seus próprios gateways e audits.
2. **Trabalhe na branch já criada no 0.2** — o `/method` nunca cria branch.
3. Quando o `/method` finalizar (Step 10 — commit), volte aqui para o human check. Atualizar o card: `phase: human-check`.

---

## Human Check (pós-fix)

Rode `references/human-check.md`: reproduza o **mesmo fluxo do 0.7**, pare 1 passo antes do trigger e deixe o dev clicar para confirmar que **o bug não acontece mais**. **PARAR** para confirmação humana real — **obrigatório, mesmo em FINISH MODE**. Ao confirmar, atualizar o card: `phase: ship`.

---

## Ship (PERGUNTAR antes)

Após o human check confirmado, **pergunte ao usuário**:

> "Bug validado. Quer que eu rode o **ship** (push + PR + atualizar o Jira)?"

- **Sim** → siga `references/ship.md` (push, PR, comentário + transição no Jira, mover o card `.md` para `docs/jira/done/`).
- **Não** → pare. O card fica pronto para o ship quando você quiser (`/repro` retoma na `phase: ship`).

---

## Environment

```
environment: LOCAL DEV
can create users: yes
can commit: yes   (o /method commita no Step 10; push só no ship)
NEVER push fora do ship
```

## Arquivos de Referência
- O protocolo de implementação é o **`/method`** (skill separada, instalada junto — dependência)
- `references/human-check.md` — validação humana pós-fix
- `references/ship.md` — push + PR + Jira (somente após confirmação)
- `references/rationalizations.md` — racionalizações proibidas

**Abra o reference relevante ao iniciar cada fase. Não execute de memória.**
