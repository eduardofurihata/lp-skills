# Step 17a — Rodar TCs via front

**Effort: max**

---

## Objetivo
Executar todos os TCs via browser com evidência de screenshot para cada um. Cada TC tem duas tasks pré-criadas: `.a` (execução) e `.b` (correção se falhar).

## Estrutura de Tasks por TC (criar ANTES de executar qualquer TC)

Para cada TC-N:
```
TaskCreate: "TC-N.a — [nome do TC] — Execução"
TaskCreate: "TC-N.b — [nome do TC] — Correção (se falhar)"
```

Criar TODOS os pares TC-N.a + TC-N.b antes de iniciar a execução.

## Audit Pré-Execução (publicar APÓS criar tasks, ANTES de executar qualquer TC)

```markdown
## Audit Pré-Execução — Step 17a
- TCs planejados (do step 14): N
- Tasks TC-N.a criadas: N
- Tasks TC-N.b criadas: N
- Total de tasks: 2N
- Pronto para executar
```

---

## Fluxo de Execução por TC (um por vez)

Para cada TC-N, executar em sequência:

### 17a.1 — Executar TC-N.a (Sonnet Max)

```markdown
### TC-N.a — [nome] — EXECUÇÃO

**Ambiente preparado:**
- Usuário: [conta utilizada]
- Dados: [estado configurado]

**Execução:**
1. ✅ [Passo 1]
2. ✅ [Passo 2]
3. ✅ [Trigger executado]
4. ✅ Screenshot: [evidência]
5. ✅ [Verificação do resultado]

**Resultado:** PASSED / FAILED
```

### 17a.2 — Se TC-N.a PASSED
- Marcar TC-N.a como **completed**
- Marcar TC-N.b como **N/A** (não precisa ser executada)
- Avançar para TC-N+1

### 17a.3 — Se TC-N.a FAILED → ir para TC-N.b
- Marcar TC-N.a como **failed**
- Publicar no chat: `TC-N FAILED — prosseguindo para TC-N.b`
- Rodar `/jira` para iniciar TC-N.b (step 17b verificará e instruirá o switch de modelo)

### 17a.4 — Após TC-N.b concluída: Re-executar TC-N.a

```markdown
### TC-N.a — [nome] — RE-EXECUÇÃO (pós-correção)

**Resultado:** PASSED / FAILED
**Evidência:** [screenshot]
```

- Se PASSED → marcar TC-N.a completed, TC-N.b completed, avançar para TC-N+1
- Se FAILED novamente → novo ciclo TC-N.b

---

## Audit Pós-Execução (publicar ao final de todos os TCs)

```markdown
## Audit Pós-Execução — Step 17a
- TCs planejados: N
- TC-N.a PASSED: P
- TC-N.a FAILED (após retry): F
- TC-N.b executadas: B
- TC-N.b N/A: (N - B)
- NOT_RUN: 0
- Screenshots de evidência: P
- Último ciclo sem mudanças de código? ✅ SIM / ❌ NÃO
```

## Gateway 17a → 18 (todos PASSED)

```markdown
## Gateway Check — Step 17a → Step 18
- Audit Pré-Execução publicado? ✅ SIM
- Audit Pós-Execução publicado? ✅ SIM
- TCs: N PASSED, 0 FAILED, 0 NOT_RUN
- Último ciclo sem mudanças de código? ✅ SIM
- **Veredicto:** ✅ LIBERADO para Step 18
```

## Critério de Saída
- Audit Pré-Execução ✅ publicado (com tasks 2N criadas)
- Audit Pós-Execução ✅ publicado
- N PASSED, 0 FAILED, 0 NOT_RUN
- Pronto para step 18 (continuar em Sonnet Max)
