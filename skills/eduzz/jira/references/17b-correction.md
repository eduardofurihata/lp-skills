# Step 17b — Correção (loop pós-FAILED)

**Effort: max**

---

## Quando chegar aqui
Step 17a retornou F > 0 (algum TC FAILED). O switch para Opus já foi feito.

## Objetivo
Identificar a causa raiz do TC falhado e corrigir o código. Após correção, voltar ao step 16 (code review, Opus) antes de re-rodar os TCs.

## Sub-steps

### 17b.1 — Identificar root cause do FAILED
Para cada TC FAILED:
```markdown
## TC-N — Root Cause do FAILED
- Resultado esperado: [o que o TC esperava]
- Resultado obtido: [o que aconteceu de fato]
- Causa raiz: [por que a implementação não satisfaz o TC]
- Arquivo/linha: [onde está o problema]
```

### 17b.2 — Corrigir código
Fazer a correção mínima necessária para satisfazer o(s) TC(s) falhados, sem introduzir novos problemas.

### 17b.3 — Verificação básica pós-correção
```bash
npx tsc --noEmit
```
Zero erros antes de prosseguir.

### 17b.4 — Registrar correção no card .md
```markdown
## Correção — Iteração N (Step 17b)
- TC(s) que falharam: [lista]
- Causa raiz: [descrição]
- Correção aplicada: [o que foi mudado]
- Arquivo: [path:linha]
```

## Próximo Step Obrigatório: Step 16 (Code Review, Opus)

**QUALQUER mudança de código invalida a aprovação anterior do step 16.**
Voltar ao step 16 com o mesmo modelo (Opus) antes de re-rodar os TCs.

Rode `/jira` para continuar. O step 16 irá verificar o modelo ao iniciar.

## Critério de Saída
- Root cause identificado e documentado
- Correção aplicada
- Zero erros tsc
- Pronto para step 16 (code review, continuar em Opus)
