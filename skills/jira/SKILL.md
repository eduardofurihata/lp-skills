---
name: jira
description: Use when working on a Jira card — single entry point for the full 19-step workflow, handles /jira finish for autonomous mode
argument-hint: "[CARD-CODE] | finish [CARD-CODE] | (empty to continue active card)"
---

# Jira — Card Workflow

**Esta skill é FERRO.** Vale para TODA a conversa.
**Violating the letter of the rules is violating the spirit of the rules.**
**Precisão > tokens > velocidade.** Tokens são baratos. Bug em produção é caro.

---

## Step 0 — Argument Parsing (PRIMEIRO — antes de qualquer ação)

| Argumento | Modo | Ação |
|-----------|------|------|
| `finish [CARD-CODE]` ou `finish` | **FINISH MODE** | Rodar todos os steps (1→19) de forma autônoma |
| `AV-N` ou URL Jira | **START MODE** | Criar card file + rodar steps 1→11, parar |
| vazio | **CONTINUE MODE** | Detectar card ativo → continuar do step atual |

**CONTINUE MODE — routing:**

| Card State | Ação |
|------------|------|
| `step: N, step-status: in-progress` | Retomar step N — ler card .md para progresso |
| `step: N, step-status: done` | Executar step N+1 — ler reference correspondente |
| `step: 19, step-status: done` | Card completo — mover para `docs/jira/done/` |
| nenhum card | Informar: "Nenhum card ativo. Use `/jira AV-N` para começar." |

---

## Os Steps (contrato — NÃO alterar numeração ou arquivos)

| # | Step | Effort | Reference |
|---|------|--------|-----------|
| 1 | Update main do GH para local | max | `references/01-update-main.md` |
| 2 | Criar branch (nomenclatura multi-card) | max | `references/02-branch.md` |
| 3 | Criar .md com card info | max | `references/03-card-info.md` |
| 4 | Jira ownership + status → Em andamento | max | `references/04-jira-ownership.md` |
| 5 | Classificar o card | max | `references/05-classify.md` |
| 6 | Entender o card | max | `references/06-understand.md` |
| 7 | Investigação: simular no front | max | `references/07-investigation.md` |
| 8 | Avaliar % de correspondência | max | `references/08-evaluate.md` |
| 9 | Loop se % < 90% → voltar ao step 7 | max | `references/09-loop.md` |
| 10 | Registrar como reproduzir | max | `references/10-register.md` |
| 11 | Reproduzir no front + PARAR para validação | max | `references/11-reproduce-stop.md` |
| 12 | Estratégia de solução | max | `references/12-strategy.md` |
| 13 | Analisar complexidade | max | `references/13-complexity.md` |
| 14 | Criar test cases (N por complexidade) | max | `references/14-test-cases.md` |
| 15 | Implementação | max | `references/15-implementation.md` |
| 16 | Code review | max | `references/16-code-review.md` |
| 17a | Rodar TCs via front | max | `references/17a-run-tests.md` |
| 17b | Correção (loop: volta ao step 16) | max | `references/17b-correction.md` |
| 18 | Human check no front (sem bug) | max | `references/18-human-check.md` |
| 19 | Ship | max | `references/19-ship.md` |

**Abra o reference do step ANTES de executar. Não execute de memória.**

---

## START MODE Flow

Criar card file + pipeline tasks → executar steps 1→11 → PARAR para validação humana no step 11.

Após step 11: aguardar usuário rodar `/jira` para continuar com step 12.

---

## Phase Pipeline (MANDATORY — somente na primeira invocação do card)

Verificar se pipeline tasks já existem. Se NÃO, criar UMA task por step (20 tasks, cada uma bloqueada pela anterior):

```
TaskCreate: "Step 1 — Update main | [CARD-CODE]"                      (addBlockedBy: anterior)
TaskCreate: "Step 2 — Criar branch | [CARD-CODE]"                     (addBlockedBy: anterior)
TaskCreate: "Step 3 — Criar card .md | [CARD-CODE]"                   (addBlockedBy: anterior)
TaskCreate: "Step 4 — Jira ownership + status | [CARD-CODE]"          (addBlockedBy: anterior)
TaskCreate: "Step 5 — Classificar card | [CARD-CODE]"                 (addBlockedBy: anterior)
TaskCreate: "Step 6 — Entender card | [CARD-CODE]"                    (addBlockedBy: anterior)
TaskCreate: "Step 7 — Investigação: simular no front | [CARD-CODE]"   (addBlockedBy: anterior)
TaskCreate: "Step 8 — Avaliar % correspondência | [CARD-CODE]"        (addBlockedBy: anterior)
TaskCreate: "Step 9 — Loop se % < 90% | [CARD-CODE]"                  (addBlockedBy: anterior)
TaskCreate: "Step 10 — Registrar reprodução | [CARD-CODE]"            (addBlockedBy: anterior)
TaskCreate: "Step 11 — Reproduzir no front + PARAR | [CARD-CODE]"     (addBlockedBy: anterior)
TaskCreate: "Step 12 — Estratégia de solução | [CARD-CODE]"           (addBlockedBy: anterior)
TaskCreate: "Step 13 — Analisar complexidade | [CARD-CODE]"           (addBlockedBy: anterior)
TaskCreate: "Step 14 — Criar test cases | [CARD-CODE]"                (addBlockedBy: anterior)
TaskCreate: "Step 15 — Implementação | [CARD-CODE]"                   (addBlockedBy: anterior)
TaskCreate: "Step 16 — Code review | [CARD-CODE]"                     (addBlockedBy: anterior)
TaskCreate: "Step 17a — Rodar TCs via front | [CARD-CODE]"            (addBlockedBy: anterior)
TaskCreate: "Step 17b — Correção (se falhar) | [CARD-CODE]"           (addBlockedBy: anterior)
TaskCreate: "Step 18 — Human check no front | [CARD-CODE]"            (addBlockedBy: anterior)
TaskCreate: "Step 19 — Ship | [CARD-CODE]"                            (addBlockedBy: anterior)
```

---

## FINISH MODE (`/jira finish`)

**Run ALL steps (1→19) straight through. NO stopping.**

- Step 11 (validação humana): **AUTO-CONFIRMED** — registrar no card .md que usuário aceitou ao usar finish mode
- Step 18 (human check): **OBRIGATÓRIO — NÃO pular.** Executar navegação completa e PARAR para confirmação real
- Todos os outros gateways continuam rígidos

---

## Environment

```
environment: LOCAL DEV
test user: test2@test.com / Test123!@#
can create users: yes
can commit: yes
NEVER push (only in step 19)
```

## Branch Naming

- Single card: `AV-36`
- Multi-card: `AV-36-40` / `AV-36-40-55` / `AV-36-40-55-72`

---

## Arquivos de Referência

- `references/01` a `references/11` — steps 1-11
- `references/12` a `references/16` — steps 12-16
- `references/17a`, `references/17b` — step 17
- `references/18`, `references/19` — steps 18-19
- `references/gateways.md` — critérios bloqueantes (RÍGIDOS)
- `references/rationalizations.md` — tabela de racionalizações proibidas

**Abra o reference relevante ao iniciar cada step. Não execute de memória.**
