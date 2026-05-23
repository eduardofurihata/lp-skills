---
date: 2026-05-23
topic: fast-todo-restructure
status: approved-design
related-skills: [method, fast, test]
---

# Design: Refactor de `/fast` + Rename de `/test` → `/todo`

## Contexto

Hoje o projeto tem três skills para o ciclo de desenvolvimento de features:

- **`/method`** — protocolo completo de engenharia (11 steps: Problema → Ship)
- **`/fast`** — variante para desenvolvimento em paralelo: roda steps 1-7b (planning + coding), escreve TCs mas deixa pendentes, cria tracking em `docs/todo/<feature>.md` com `status: pending-test`. Espera que `/test` rode depois.
- **`/test`** — companheiro do `/fast`: varre `docs/todo/`, roda code review (step 8), executa TCs via front (step 9), finaliza com done (step 10).

**Problema identificado pelo usuário:** o desenho atual obriga o desenvolvedor a rodar `/test` para que a feature seja considerada "done". Em muitos casos o usuário quer:

> "implementar rápido ou testar na mão também por ser mais rápido, só documentar e implementar basicamente"

Ou seja, quer encerrar o ciclo de desenvolvimento mesmo sem rodar o QA formal (Step 9). Os TCs continuam escritos e disponíveis caso o usuário decida validar depois.

## Decisão

**Não criar uma nova skill `/lite`.** Em vez disso:

1. **Atualizar `/fast`** para incluir steps 8 (Code Review) + 10 (Done), pulando apenas o Step 9 (Testing).
2. **Renomear `/test` para `/todo`** (mesma função, novo nome que reflete o que faz: finaliza o que está em `docs/todo/`).
3. **Ajustar o frontmatter do tracking file** para dois campos independentes: `status` (dev) e `tests` (QA).

## Escopo dos Steps

| Step | /method | /fast (atual) | /fast (novo) | /todo (novo, ex-/test) |
|------|---------|---------------|--------------|------------------------|
| 1 — Problema | ✅ | ✅ | ✅ | — |
| 2 — User Stories | ✅ | ✅ | ✅ | — |
| 3 — Use Cases | ✅ | ✅ | ✅ | — |
| 4 — Spec | ✅ | ✅ | ✅ | — |
| 5 — Test Cases | ✅ executa | ✅ escreve (pendente) | ✅ escreve (pendente) | — |
| 6 — To Do | ✅ | ✅ | ✅ | — |
| 7a — Plano | ✅ | ✅ | ✅ | — |
| 7b — Codificar | ✅ | ✅ | ✅ | — |
| 8 — Code Review | ✅ | ❌ | ✅ **(novo)** | — |
| 9 — Run Test | ✅ | ❌ | ❌ | ✅ |
| 10 — Done | ✅ | ❌ | ✅ **(novo)** | ✅ |
| 11 — Ship | ✅ | ❌ | ❌ | ❌ (continua só no /method) |

## Contrato do Tracking File

**Arquivo:** `docs/todo/<feature>.md` (não muda de pasta após /fast)

**Frontmatter:**
```yaml
---
feature: <nome-da-feature>
status: done           # dev terminou (kanban em kanban/10-done/)
tests: pending         # QA não rodou ainda
branch: <branch>
created: <YYYY-MM-DD>
---
```

**Estados possíveis:**

| `status` | `tests` | Significado |
|----------|---------|-------------|
| `done` | `pending` | Dev finalizado, QA pendente — arquivo em `docs/todo/` |
| `done` | `passed` | Tudo validado — arquivo movido para `docs/done/` |

**Transições:**
- `/fast` cria o arquivo em `docs/todo/` com `status: done` + `tests: pending`
- `/todo` lê o arquivo, executa TCs, e move para `docs/done/` com `tests: passed`

## Fluxo Completo

```
/fast feature-x
  ├─ Step 1-4 (docs)
  ├─ Step 5 (TCs escritos, pendentes)
  ├─ Step 6 (to-do quebrado)
  ├─ Step 7a (plano)
  ├─ Step 7b (codificar)
  ├─ Step 8 (code review em loop)         ← NOVO
  ├─ Step 10 (done + arquivar kanban)     ← NOVO
  └─ docs/todo/feature-x.md (status: done, tests: pending)

[opcional, quando quiser validar]

/todo feature-x
  ├─ Scan docs/todo/ por tests: pending
  ├─ Step 9 (rodar TCs via front, screenshots)
  ├─ Se fix de código → re-review (step 8) → re-test
  └─ Mover para docs/done/feature-x.md (tests: passed)
```

**Loop /fast 7b → 8:** qualquer mudança de código no Step 7b ou em loop com Step 8 invalida o code review anterior; volta ao 7b ou re-roda 8 conforme necessário. Sai do loop apenas com Step 8 100% limpo, ZERO mudanças no último passe.

## Code Review (Step 8) sem TCs executados

O Step 8 do `/method` hoje referencia TCs como input do review. No `/fast` novo, o review acontece com TCs **escritos mas pendentes**. Implicações:

- ✅ Review valida que o código **cobre os cenários listados nos TCs**
- ✅ Review valida lógica, segurança, performance, padrões do projeto (como hoje)
- ❌ Review **não substitui execução** dos TCs (isso é função do /todo)
- ⚠️ Iron Law: Step 8 do /fast NÃO pode marcar como aprovado apenas porque "o código parece cobrir os TCs" — deve validar como o Step 8 do /method faz com TCs disponíveis

**Output do Step 8 em /fast:** mesmo relatório de `kanban/08-code-review/<tópico>.md` que o /method gera, com nota explícita "TCs escritos mas pendentes de execução — /todo necessário para validação completa".

## Renomeação `/test` → `/todo`

**Operações:**

1. `git mv skills/test skills/todo`
2. Editar `skills/todo/SKILL.md`:
   - `name: test` → `name: todo`
   - Atualizar description (mencionar `docs/todo/` como source)
   - Atualizar lógica de scan: procurar `tests: pending` (em vez de `status: pending-test`)
   - Atualizar referências internas de "/test" para "/todo"
   - Atualizar lógica de saída: move pra `docs/done/` com `tests: passed`

3. Atualizar outras skills que mencionam `/test`:
   - `skills/fast/SKILL.md` — substituir referências a `/test` por `/todo`
   - `skills/method/SKILL.md` — verificar se menciona `/test` ou `/fast`
   - `skills/method/references/*.md` — varredura completa

4. **Compatibilidade legacy:** features hoje em `docs/todo/` com `status: pending-test` (criadas pelo /fast antigo). **Decisão: Opção A.** `/todo` reconhece AMBOS os formatos legacy (`status: pending-test`) e novo (`tests: pending`), processa igual. Sem script de migração. Implementação concreta no /todo:
   - Ler frontmatter
   - Se `status: pending-test` (legacy) OU `tests: pending` (novo) → entra no scan
   - Processa normalmente, no fim escreve frontmatter novo (`status: done`, `tests: passed`) ao mover pra `docs/done/`

## Atualização do `/fast`

**Mudanças no SKILL.md:**

1. **Description:** remover "leaves them PENDING" no contexto de tracking obsoleto, ajustar para refletir steps 1-8 + 10.
2. **HARD-GATE:** remover "NÃO execute steps 8-10". Adicionar "NÃO execute Step 9 (testing) — isso é função do /todo. NÃO execute Step 11 (ship) — isso continua só no /method."
3. **Checklist:** adicionar Step 8 (Code Review) e Step 10 (Done) entre os itens 9 e 10 atuais.
4. **Fluxo (dot graph):** adicionar nós para `step8` e `step10`, ajustar arestas.
5. **Tracking file structure:** atualizar frontmatter exemplo com `status: done` + `tests: pending`.
6. **Red Flags:** ajustar — remover "Vou já fazer o code review → NÃO. /fast PARA no 7b" (agora é o oposto: /fast FAZ code review). Adicionar "Vou pular o code review porque está urgente → NÃO. Step 8 é obrigatório."
7. **Loop 7b → 8:** adicionar regra de invalidação por mudanças de código.

## Atualização do `/method`

**Discovery obrigatório no plano de implementação:**

```bash
grep -rn "/test\b" skills/method/
grep -rn "/fast\b" skills/method/
grep -rn "pending-test" skills/method/
```

Para cada match:
- Se cita `/test` no contexto do contrato antigo (testing companion) → substituir por `/todo`
- Se cita `/fast` no contexto do contrato antigo (para em 7b) → atualizar para refletir que /fast agora termina em Done
- Se cita `pending-test` → atualizar pro novo schema (`tests: pending`)

Discovery deve ser rodado nos seguintes locais (todos):
- `skills/method/SKILL.md`
- `skills/method/references/*.md`
- `skills/fast/SKILL.md`
- `skills/test/SKILL.md` (que vira `skills/todo/SKILL.md`)
- `docs/` (qualquer doc que mencione esses contratos)
- `kanban/` (idem)
- `CLAUDE.md`, `AGENTS.md`, `README.md`

## Migração

**Para features legacy em `docs/todo/` (criadas com /fast antigo):**

- Status legacy `status: pending-test` → equivale a `status: done-pending-execution` (não tinha Step 8 nem 10).
- Recomendação: usuário roda `/todo` (ex-`/test`) normalmente. `/todo` detecta legacy → executa Steps 8 + 9 + 10 (como /test faz hoje) e move pra done com `tests: passed`.
- `/todo` NÃO faz upgrade automático de frontmatter (só processa).

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| /fast pular Step 8 alegando "review não é necessário sem TCs executados" | Iron Law explícita: "Step 8 NÃO é opcional. Sem code review, /fast não termina." |
| Confusão entre `status` (dev) e `tests` (QA) | Documentar bem no SKILL.md; tabela de transições visível. |
| Features legacy quebrarem com novo /todo | /todo reconhece formato legacy (Opção A). |
| Step 8 do /fast vira "review de fachada" porque TCs não rodaram | Step 8 do /fast roda IGUAL ao Step 8 do /method, com TCs como input mesmo pendentes. |
| Rename `/test` → `/todo` quebrar slash commands existentes em scripts/docs | Grep do projeto inteiro por `/test` antes do PR; ajustar tudo. |

## Out of Scope

- **Step 11 (Ship)** continua apenas no `/method` (não é adicionado nem ao /fast nem ao /todo).
- **Script de migração automático** para features legacy — pode ser feito depois se necessário; por ora, `/todo` lida com legacy via reconhecimento de formato.
- **Mudanças em `/method`** além de ajustar referências cruzadas a /fast e /todo.

## Próximos Passos

1. User review deste spec → ajustes se necessário
2. `writing-plans` → gerar plano de implementação detalhado
3. `writing-skills` (TDD) → baseline scenarios → editar SKILLs → re-test → refactor loopholes
4. Commit + (se desejado) PR
