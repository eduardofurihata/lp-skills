# Step 1 — Update main do GH para local

**Effort: max**


## Objetivo
Garantir que a branch local main está sincronizada com origin antes de criar uma nova branch de trabalho.

## Sub-steps

### 1.1 — Verificar branch atual
```bash
git branch --show-current
```
Se não estiver em main/master, anote a branch atual.

### 1.2 — Fetch origin
```bash
git fetch origin
```

### 1.3 — Checkout main e merge
```bash
git checkout main
git merge origin/main
```
Se o projeto usa `master` em vez de `main`, substituir.

### 1.4 — Verificar resultado
```bash
git log --oneline -5
```
Confirmar que o HEAD está no commit mais recente de origin.

## Critério de Saída
- Branch main local está no mesmo commit que origin/main
- Sem conflitos de merge
- Pronto para step 2

## ❌ Bloqueantes
- Conflitos de merge → resolver antes de prosseguir
- Mudanças não commitadas → stash ou commit antes
