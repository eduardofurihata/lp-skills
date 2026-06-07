# Step 17 — Testing via front

**Modelo: 🔵 Sonnet Max**

## Objetivo
Executar todos os TCs via browser com evidência de screenshot para cada um. Sem exceções.

## Regras Absolutas

1. **Execução real via browser** — "já testei mentalmente" não conta
2. **Screenshot obrigatório por TC** — após o step ⚡ PROVA de cada TC
3. **TaskCreate por TC** — marcar como completed após execução com resultado
4. **Sem herança de estado** — cada TC roda isolado, sem presumir estado do TC anterior
5. **100% PASSED ou voltar ao step 15** — sem "quase passou"

## Audit Pré-Execução (publicar ANTES de rodar qualquer TC)

```markdown
## Audit Pré-Execução — Step 17
- TCs planejados (do step 14): N
- TaskCreate individuais existentes: N
- Ratio 1:1 ✅
- Pronto para executar todos os N TCs
```

**Sem este audit publicado no chat, não iniciar a execução.**

## Template de Execução por TC

```markdown
### TC-N — [nome] — EXECUÇÃO

**Ambiente preparado:**
- Usuário: [conta utilizada]
- Dados: [estado configurado]

**Execução passo a passo:**
1. ✅ [Passo 1 executado]
2. ✅ [Passo 2 executado]
3. ✅ [Trigger executado]
4. ✅ Screenshot tirado: [nome do arquivo / evidência MCP]
5. ✅ [Verificação do resultado esperado]

**Resultado:** PASSED / FAILED
**Evidência:** [screenshot / link]
**TaskCreate:** marcada como completed
```

## Audit Pós-Execução (publicar ANTES do Gateway step 17→18)

```markdown
## Audit Pós-Execução — Step 17
- TCs planejados: N
- TCs executados: N
- PASSED: N
- FAILED: 0
- NOT_RUN: 0
- Screenshots de evidência: N
- Ratio C==N: ✅
- Delta: 0
- Último ciclo sem mudanças de código: ✅
```

**Sem este audit publicado no chat, não avançar para step 18.**

## Se TC FAILED
1. Identificar root cause do FAILED
2. Voltar ao **step 15** (implementação) para corrigir
3. Passar pelo **step 16** (code review)
4. Re-executar **TODOS os TCs** do step 17 do início (não só o que falhou)
5. O ciclo SÓ encerra com 100% PASSED e zero mudanças de código no último passe

## Critério de Saída
- Audit Pré-Execução ✅ publicado no chat
- Audit Pós-Execução ✅ publicado no chat
- N PASSED, 0 FAILED, 0 NOT_RUN
- N screenshots de evidência
- Último ciclo sem mudanças de código
- Pronto para validação humana (step 18)

```yaml
step: 17
step-status: done
```
