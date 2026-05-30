---
name: todo
description: 'Use when ready to run QA on features queued in kanban/06-todo/ (cards created by /fast, pending front-validation). Executes testing via front (step 9) and promotes passing features to kanban/10-done/ with `tests: passed`'
effort: max
argument-hint: "[feature-name or 'all']"
---

Executa a fase de QA (step 9 do /method) para features pendentes na coluna `kanban/06-todo/`.
**No kanban, a COLUNA é o status:** todo card em `kanban/06-todo/` é uma feature pendente de QA — não há filtro de frontmatter. O /todo valida via front e, ao passar 100%, **promove** a feature para `kanban/10-done/<feature>.md` com `tests: passed` e **deleta** o card de `kanban/06-todo/`.

Distinção `[novo]` vs `[legacy]` (decide se roda Step 8 — Code Review):
- `[novo]` — já existe `kanban/08-code-review/<feature>.md` (o /fast já rodou o code review). /todo NÃO repete o Step 8.
- `[legacy]` — não há relatório de code review. /todo roda o Step 8 agora (o /fast antigo não rodava).

<HARD-GATE>
NÃO marque test cases como PASSED sem executar via front.
NÃO avance da execução para Done sem 100% PASSED com ZERO mudanças de código.
QUALQUER fix de código invalida o ciclo: volta ao Code Review (se legacy) ou re-executa TCs e retesta TUDO.
</HARD-GATE>

## REGRA FUNDAMENTAL: Precisão > Economia de Tempo ou Tokens

- Tokens são baratos. Bug em produção é caro. **Execute, não deduza.**
- "Front é front e ponto" — quando o protocolo diz front, é front. Sem atalhos.
- Se você se pegar pensando "vou pular este TC para economizar" → PARE. Esse pensamento É a violação. Execute.
- Trade-off explícito: prefira gastar 10x mais tokens e ter teste forte do que gastar 1x token e marcar PASSED falsamente.

## Checklist

Crie tasks via TaskCreate para cada item:

1. **Scan** — Listar features pendentes na coluna `kanban/06-todo/`
2. **Selecionar** — User escolhe qual feature (ou todas)
3. **Carregar contexto** — Ler TODOS os docs de referência (steps 1-7)
4. **Step 8 — Code Review** — Loop até 100% limpo + relatório
5. **Step 9 — Run Test** — TODOS os TCs via front com screenshot
6. **Step 10 — Done** — Promover para `kanban/10-done/` (tests: passed) + deletar o card de `kanban/06-todo/`

## Fluxo

```dot
digraph todo {
    rankdir=TB;
    node [fontname="Helvetica"];

    scan [label="Scan kanban/06-todo/" shape=box];
    has_features [label="Features pendentes?" shape=diamond];
    none [label="Nenhuma feature\npendente" shape=box];
    select [label="Selecionar feature" shape=box];
    is_legacy [label="É legacy?\n(sem kanban/08-code-review)" shape=diamond];
    context [label="Ler referências\n(steps 1-7)" shape=box];
    review [label="Step 8 — Code Review\n(legacy only — loop até limpo)" shape=box];
    testing [label="Step 9 — Run Test\n(TODOS os TCs via front)" shape=box];
    passed [label="100% PASSED\nsem mudanças?" shape=diamond];
    done [label="Phase 4 — Done\n(tests: passed)" shape=box];
    move [label="Promover\n06-todo → 10-done" shape=box];
    more [label="Mais features?" shape=diamond];
    fim [label="FIM" shape=doublecircle];

    scan -> has_features;
    has_features -> none [label="não"];
    has_features -> select [label="sim"];
    select -> context;
    context -> is_legacy;
    is_legacy -> review [label="sim — legacy"];
    is_legacy -> testing [label="não — novo /fast"];
    review -> testing;
    testing -> passed;
    passed -> review [label="não — fix → re-review (se legacy)"];
    passed -> done [label="sim"];
    done -> move;
    move -> more;
    more -> select [label="sim"];
    more -> fim [label="não"];
}
```

---

## Phase 1 — Scan e Seleção

1. `Glob kanban/06-todo/*.md`
2. **Todo card aqui é pendente de QA** — no kanban, a coluna É o status. NÃO há filtro de frontmatter (cards de `06-todo` são task-breakdowns, normalmente sem frontmatter).
3. Para cada card, o nome da feature = nome do arquivo. Ler o conteúdo (task-breakdown / notas).
4. Marcar cada feature como `[novo]` ou `[legacy]`:
   - `[novo]` — existe `kanban/08-code-review/<feature>.md` → /fast já rodou Step 8.
   - `[legacy]` — não existe relatório de code review → /todo roda Step 8.
5. Apresentar lista:

```
Features pendentes de QA:

1. <feature-A> (branch: X, criado: YYYY-MM-DD) [novo]
2. <feature-B> (branch: Y, criado: YYYY-MM-DD) [legacy]

Qual feature deseja validar? (número, nome, ou "all")
```

6. Se `$ARGUMENTS` fornecido → usar como seleção
7. Se apenas 1 feature → selecionar automaticamente
8. Se "all" → processar uma por vez na ordem da listagem

---

## Phase 2 — Code Review (Step 8 do /method)

### Quando rodar Code Review

| Tipo da feature | Code Review? | Por quê |
|------------------------|--------------|---------|
| `[novo]` — existe `kanban/08-code-review/<feature>.md` | ❌ **NÃO** rodar — já rodou no /fast | Step 8 já foi executado pelo /fast. /todo só lê o relatório como contexto antes da execução. |
| `[legacy]` — sem relatório de code review | ✅ **SIM** rodar | /fast antigo parava em 7b; Step 8 nunca rodou. /todo precisa fazê-lo agora. |

**Regra inviolável:** features `[novo]` NÃO repetem code review. Features `[legacy]` SEMPRE rodam. Sem exceção. Na dúvida (sem relatório em `kanban/08-code-review/`), default para legacy (rodar review).

**Se a feature for `[novo]`, pule para Phase 3.** As subseções abaixo (Preparação, Revisão em Loop, Relatório) aplicam-se APENAS a features `[legacy]`.

### Preparação

Antes de revisar, ler TODOS os docs da feature (`docs/01-problem` → `docs/05-test-cases` + `kanban/06-todo` + `kanban/07-implementation`):
- Problema (1), User Stories (2), Use Cases (3), Spec (4), Test Cases (5), To Do (6), Plano (7)

### Revisão em Loop

```
REPETIR até 100% limpo:
  1. git diff main...HEAD (filtrar arquivos da feature)
  2. Reler plano (7a) — código implementa TUDO?
  3. Reler TCs (6) — todos cenários cobertos?
  4. Reler use cases (3) — edge cases tratados?
  5. Revisar CADA arquivo alterado:
     - Código morto / imports não usados?
     - Bugs lógicos / edge cases?
     - Padrões do projeto violados?
     - Segurança (XSS, injection, secrets, auth bypass)?
     - Performance (N+1, re-renders, memory leaks)?
     - Consistência com codebase?
     - Faz EXATAMENTE o que use cases pedem — nem mais, nem menos?
     - Regra "tocou = refatora" seguida?
  6. Problema encontrado → corrigir IMEDIATAMENTE → voltar ao 1
  7. Loop até ZERO issues — NÃO aceitar "bom o suficiente"
```

### Relatório (OBRIGATÓRIO)

**Organizar** `kanban/08-code-review/<tópico>.md`:

```markdown
# Relatório de Code Review — <feature>

## Resumo
- Branch | Total de iterações do loop | Data

## Arquivos Analisados
| Arquivo | Linhas +/- | Tipo | Veredicto |

## Problemas Encontrados e Corrigidos
### Issue #N — [título]
- Arquivo | Severidade | Categoria | Correção aplicada | Iteração

## Análise de Cobertura
- Stories atendidas | Use cases cobertos | TCs preparados | Gaps

## Análise de Segurança
Input validation | Auth | Dados sensíveis | Injection vectors

## Veredicto Final
- Status: APROVADO / REQUER correções
- Confiança: Alta/Média/Baixa
- Notas para o teste: pontos críticos
```

---

## Phase 3 — Testing (Step 9 do /method)

Executar TODOS os test cases listados em `docs/05-test-cases/<feature>.md` (+ a lista "Test Cases Pendentes" do card `kanban/10-done/<feature>.md`, se `[novo]`).

### Pre-Flight Blocker Contract (OBRIGATÓRIO — ANTES de tudo)

**ANTES de rodar qualquer TC, ANTES do batching:**

```
PRE-FLIGHT:
  1. Listar TODOS os N TCs (docs/05-test-cases/<feature>.md + lista do card kanban/10-done/, se [novo])
  2. Para CADA TC: qual tenant/seed/user/hardware/flag precisa?
  3. Classificar: READY / NEEDS SETUP / BLOCKED
  4. Reportar: "Pre-flight: X READY, Y NEEDS SETUP, Z BLOCKED por: [lista]"
  5. Z > 0 → PARAR e perguntar ao user. Nenhum TC roda até resposta.
  6. Z == 0 → preparar NEEDS SETUP e prosseguir
```

### Prediction-Execution-Reconciliation (OBRIGATÓRIO)

Início: `"Executando N TCs. Produzirei N screenshots."`
Fim (ANTES de qualquer report): `"Reconciliação: Predicted N, Evidence M, Delta N-M. TCs sem evidência: [lista] = NOT_RUN."`

**Delta > 0 → NOT_RUN. Não "coberto por", não "equivalente a".**

### Regras de Integridade

1. **Disclosure ≠ compliance.** Dizer "não rodei X" NÃO torna OK marcar PASSED.
2. **HOW vs WHAT.** Pragmatismo do user = otimizar execução (HOW), nunca reduzir escopo (WHAT).
3. **Conceitos proibidos.** "Verificado via código", "redundante com outro TC", "low risk skip", "N/A neste build" = violação.
4. **Resposta binária.** "All passed?" → "X de N PASSED. Y NOT_RUN. Z FAILED." Nunca "mostly yes, with caveats".

### TCs em Tasks — Duas Camadas de TaskCreate (OBRIGATÓRIO — ANTES de executar qualquer TC)

**SEMPRE crie tasks em DUAS camadas: uma por GRUPO temático E uma por cada TC INDIVIDUAL dentro do grupo.**

**REGRA ABSOLUTA: Cada grupo de TCs = 1 TaskCreate. Cada TC individual dentro do grupo = 1 TaskCreate SEPARADO. Ambas as camadas obrigatórias.**

```
PROCEDIMENTO (executar PRIMEIRO, antes de qualquer TC):
  1. Ler TODOS os TCs de docs/05-test-cases/<feature>.md (+ card kanban/10-done/ se [novo]) (feature + regressão)
  2. Contar total de TCs (N)
  3. Agrupar em batches de ~10 TCs por afinidade temática (área, tela, fluxo)
  4. CAMADA 1 — Para CADA grupo, criar 1 TaskCreate:
     - TaskCreate: "Grupo 01: TC-001 a TC-010 — [área/tema]"
     - TaskCreate: "Grupo 02: TC-011 a TC-020 — [área/tema]"
     - (continuar até cobrir TODOS os TCs)
  5. CAMADA 2 — Para CADA TC individual dentro de CADA grupo, criar 1 TaskCreate SEPARADO:
     - TaskCreate: "TC-001: [nome do TC]"
     - TaskCreate: "TC-002: [nome do TC]"
     - ... (1 invocação por TC, SEM array/lista, SEM bundling)
  6. TaskUpdate nos DOIS níveis:
     - Grupo: in_progress ao iniciar primeiro TC, completed quando TODOS do grupo passarem
     - TC individual: in_progress ao iniciar, completed após PASSED com evidência
```

**NÃO execute TCs como lista solta.** Ambas as camadas de TaskCreate são OBRIGATÓRIAS. Sem TaskCreate em AMBAS = Phase 3 NÃO iniciou.

| Racionalização | Realidade |
|----------------|-----------|
| "Tasks de grupo bastam, TCs individuais são desnecessários" | NÃO. Grupo = organização. TC individual = rastreamento granular. Ambas obrigatórias. BLOQUEADO. |
| "Só crio 1 task por grupo" | NÃO. Grupo + TC individual. BLOQUEADO. |

### Audit Pré-Execução — BLOQUEANTE (publicar no chat ANTES do primeiro TC)

**Depois de criar os TaskCreate das duas camadas e ANTES de tocar em qualquer ferramenta de teste (Playwright, emulator, curl), publique este bloco visualmente no chat. Audit ausente = execução não iniciou.**

```markdown
## Audit Pré-Execução — TaskCreate 1:1
- TCs totais (docs/05-test-cases/ + card kanban/10-done/ se [novo]): **N**
- TaskCreate de grupo criados: **G** — listar (TaskID → grupo)
- TaskCreate individuais criados: **M** — listar (TaskID → TC-ID)
- Ratio M == N? ✅ SIM / ❌ NÃO — TCs sem task individual: [listar TC-IDs]
- Ratio G cobre todos os TCs? ✅ SIM / ❌ NÃO
- **Veredicto:** ✅ LIBERADO para executar / ❌ BLOQUEADO — criar tasks faltantes AGORA e republicar
```

**❌ BLOQUEADO = PROIBIDO executar qualquer TC.** Crie as tasks faltantes, republique o audit ✅, só então inicie o Loop. Executar TC sem o audit ✅ visível = violação automática (cheating visível).

| Racionalização proibida | Realidade |
|------------------------|-----------|
| "Já declarei nas Duas Camadas, audit é redundante" | NÃO. Declaração em prosa ≠ audit publicado com números. BLOQUEADO. |
| "Conto de cabeça, não preciso publicar" | NÃO. Audit silencioso = inexistente. BLOQUEADO. |
| "Rodo enquanto crio o que falta" | NÃO. Audit ✅ antes de TUDO. BLOQUEADO. |
| "Faltam 2 de 30, começo pelos 28" | NÃO. Atomicidade. 100% ou BLOQUEADO. |

### Loop de Execução

```
REPETIR até todos passarem SEM NENHUMA MUDANÇA DE CÓDIGO:
  1. tsc/lint — se falhar, corrigir antes de testar
  2. Consultar notas do relatório de review (8)
  3. Para CADA batch (task):
     a. TaskUpdate → in_progress
     b. CADA TC do batch: executar DO ZERO via:
        - Web → Playwright MCP (mcp__playwright-*)
        - Android → AVD emulator
        - iOS → iOS simulator (Xcode) ou device físico
        - Login como usuário real
        - Seguir CADA passo do TC
        - Screenshot como prova de cada PASSED
     c. PASSED (com screenshot) ou FAILED (motivo detalhado)
     d. Bug encontrado → corrigir IMEDIATAMENTE → ATENÇÃO:
        QUALQUER fix invalida o ciclo:
        - `[legacy]`: volta ao Phase 2 (Code Review) → retesta TUDO
        - `[novo]`: volta ao Phase 3 (re-executa TODOS os TCs do zero — code review do /fast cobre apenas o código original, fixes do /todo são código novo não revisado; se fix for não-trivial, considere escalar de volta para /fast e re-rodar Step 8)
     e. Todos TCs do batch PASSED → TaskUpdate → completed
  4. Todos PASSED sem mudança → Phase 4
```

### Audit Pós-Execução — BLOQUEANTE (publicar no chat ANTES de Phase 4)

**Quando achar que o Loop terminou e ANTES de publicar qualquer resumo, relatório ou avançar para Phase 4 (Done), publique este bloco. Audit ausente = Phase 3 não terminou.**

```markdown
## Audit Pós-Execução — Execução 1:1
- Tasks individuais esperadas (do Audit Pré): **N**
- Tasks individuais com status `completed`: **C** — listar (TaskID → TC-ID)
- TCs com evidência (screenshot path em `kanban/09-run-test/<tópico>.md`): **E** — listar (TC-ID → path)
- Ratio C == N? ✅ / ❌ — tasks pendentes: [listar]
- Ratio E == N? ✅ / ❌ — TCs sem screenshot: [listar]
- Status agregado: **N PASSED**, **0 FAILED**, **0 NOT_RUN**, **0 SKIPPED**, **0 BLOCKED** ✅ / ❌
- Último ciclo sem mudanças de código? ✅ / ❌
- **Veredicto:** ✅ LIBERADO para Phase 4 (Done) / ❌ BLOQUEADO — voltar ao Loop
```

**❌ BLOQUEADO = PROIBIDO avançar para Phase 4, PROIBIDO resumo de conclusão, PROIBIDO promover a feature para `kanban/10-done/`.** Volte ao Loop, execute pendentes, produza evidência, republique o audit.

| Racionalização proibida | Realidade |
|------------------------|-----------|
| "28 de 30 passaram, o resto é trivial, avanço" | NÃO. Delta > 0 = BLOQUEADO. Atomicidade. |
| "TC X é redundante com Y que já rodou" | NÃO. Sem herança. Execute X. BLOQUEADO. |
| "Marco os 2 faltantes PASSED e documento depois" | NÃO. Sem evidência = NOT_RUN. BLOQUEADO. |
| "Reporto parcial enquanto os últimos rodam" | NÃO. Audit ✅ antes de QUALQUER report. BLOQUEADO. |

**MOBILE = ANDROID E iOS, SEMPRE.** Nenhuma feature mobile pode ser marcada PASSED rodando em apenas uma plataforma. Se a iOS não estiver disponível na máquina, peça ao usuário antes de marcar PASSED — não invente.

### FRONT É FRONT — REGRA ABSOLUTA

**Quando o protocolo diz "executar via front", você EXECUTA via front. Sem atalhos, sem deduzir do código, sem economizar tokens.**

Por que: o teste front é exponencialmente mais forte que análise de código. Captura bugs de integração, timing, layout, comportamento real, browser quirks. Análise de código captura: lógica isolada. **Análise de código NÃO substitui front. Nunca.**

#### Padrões de Burla — TODOS PROIBIDOS

| Burla | Por que está PROIBIDO |
|-------|-----------------------|
| "Verifiquei no código, marco PASSED" | Código != comportamento. Execute via front. |
| "tsc passou, está testado" | tsc verifica tipos, não comportamento. |
| "Já testei TC parecido, esse herda" | Cada TC roda isolado. Sem herança. |
| "A tela carregou, marco PASSED" | Tela carregar != TC passar. RESULTADO ESPERADO ou FAILED. |
| "TC trivial, vou pular" | Trivial != opcional. Execute todos. |
| "Vou economizar tokens não rodando" | Tokens são baratos. Execute. |
| "BLOCKED" | Não está bloqueado. Resolva o impedimento. |
| "Marco PASSED, screenshot depois" | Sem screenshot agora = sem TC. |
| "Testei só Android, iOS deve igual" | iOS é outro TC. Execute. |
| "O usuário corrige se errar" | Sua responsabilidade. Execute. |

### Resultados (OBRIGATÓRIO)

**Organizar** `kanban/09-run-test/<tópico>.md`:

```markdown
# Resultados de Teste — <feature>

## Resumo
- Total TCs | Passed | Failed | Iterações do ciclo review-test

## Resultados
| TC | Status | Screenshot | Notas |

## Ciclos de Fix (se houve)
| Fix | Arquivo | Iteração | Re-review necessário? |
```

### ANTI-PADRÕES PROIBIDOS

```
NUNCA SKIP ou BLOCKED — resolva o impedimento
NUNCA "Ran tsc, no errors" — tsc é pré-requisito, não teste
NUNCA "Verified via code" — execute via FRONT com screenshot
NUNCA "Fix was trivial, doesn't need re-test" — QUALQUER fix invalida o ciclo (legacy: volta Phase 2; novo: re-executa Phase 3)
NUNCA batch fixes — corrija CADA bug IMEDIATAMENTE ao encontrar
NUNCA "I'll test the rest later" — TODOS os TCs, AGORA
```

---

## Phase 4 — Done

Ao passar 100% dos TCs sem nenhuma mudança de código, **promova** a feature de `kanban/06-todo/` para `kanban/10-done/`.

> **/todo NÃO faz commit.** O commit é ação exclusiva do Step 10 no `/method` completo. O /todo promove o card e atualiza o frontmatter (`tests: passed`), mas deixa o versionamento (git) para você.

### Para features `[novo]` (já têm `kanban/10-done/<feature>.md`, criado pelo /fast)

1. **Atualizar o frontmatter** de `kanban/10-done/<feature>.md`:
   ```yaml
   ---
   feature: <nome>
   status: done
   tests: passed       # era 'pending'
   branch: <branch>
   created: <YYYY-MM-DD>
   tested: <YYYY-MM-DD>  # nova chave: dia que /todo rodou
   ---
   ```

2. **Anexar resumo de QA** ao `kanban/10-done/<feature>.md`, sob nova seção:
   ```markdown
   ## QA (rodado por /todo em <data>)
   - Total TCs: X | PASSED: X | FAILED: 0
   - Evidências: kanban/09-run-test/<feature>.md
   ```

3. **Deletar o card da coluna to-do:** `rm kanban/06-todo/<feature>.md`

### Para features `[legacy]` (sem `kanban/10-done/<feature>.md`)

/todo precisa criar o card de done:

1. **Criar** `kanban/10-done/<feature>.md` com frontmatter + links para todos os docs (steps 1-9), arquivos de código alterados e status final dos TCs (todos PASSED):
   ```yaml
   ---
   feature: <nome>
   status: done
   tests: passed
   branch: <branch>
   created: <YYYY-MM-DD>   # data original se conhecida; senão a de hoje
   tested: <YYYY-MM-DD>
   ---
   ```

2. **Deletar o card da coluna to-do:** `rm kanban/06-todo/<feature>.md`

### Comum a ambos

- **Informar**:
  ```
  Feature "<nome>" — QA completo.
  TCs: X/X PASSED | Status: done, tests: passed
  Promovida para kanban/10-done/<feature>.md (card de kanban/06-todo/ removido)
  ```

- **Mais features?** → voltar ao Phase 1 (Seleção) para a próxima

---

## Golden Rule

**Encontrou problema? CORRIJA IMEDIATAMENTE.**

- Não documente para depois
- Não pule para o próximo TC
- Não "note para review"
- Não "vou juntar tudo no final"
- PARE e CORRIJA AGORA

## Red Flags — STOP e Revise

- "Feature é `[legacy]`, code review é desnecessário" → NÃO. Para `[legacy]`, Step 8 é obrigatório (não foi rodado pelo /fast antigo).
- "Feature é `[novo]`, vou rodar code review pra garantir" → NÃO. Para `[novo]`, /fast já rodou Step 8. Re-rodar é desperdício e contradiz o contrato.
- "Esse TC é trivial, posso pular" → NÃO. TODOS os TCs.
- "Vou marcar como PASSED sem screenshot" → NÃO. Screenshot = prova.
- "O fix foi pequeno, não precisa re-test" → PRECISA. QUALQUER fix volta à execução completa.
- "tsc passou, está testado" → tsc verifica tipos, não comportamento.
- "BLOCKED — não consigo acessar" → Resolva o impedimento. Pergunte ao usuário se necessário.
