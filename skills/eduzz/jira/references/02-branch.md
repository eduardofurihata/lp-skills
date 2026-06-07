# Step 2 — Criar branch (nomenclatura multi-card)

**Effort: max**


## Objetivo
Criar branch de trabalho com nomenclatura padronizada para o card atual.

## Nomenclatura

| Situação | Formato | Exemplo |
|----------|---------|---------|
| Card único | `PROJ-N` | `PROJ-36` |
| Dois cards | `PROJ-N-M` | `PROJ-36-40` |
| Três cards | `PROJ-N-M-P` | `PROJ-36-40-55` |
| Quatro cards | `PROJ-N-M-P-Q` | `PROJ-36-40-55-72` |

Números em ordem crescente. Sempre prefixo `PROJ-`.

## Sub-steps

### 2.1 — Determinar nome da branch
Com base no(s) card(s) sendo trabalhados:
- Um card → `PROJ-[número]`
- Múltiplos cards → `PROJ-[n1]-[n2]-[n3]` em ordem numérica crescente

### 2.2 — Verificar se branch já existe
```bash
git branch | grep PROJ-
```
Se já existir → fazer checkout sem recriar:
```bash
git checkout PROJ-36
```

### 2.3 — Criar e fazer checkout (se não existir)
```bash
git checkout -b PROJ-36
```

### 2.4 — Confirmar
```bash
git branch --show-current
```

## Critério de Saída
- Branch criada e ativa localmente
- Nomenclatura correta (PROJ-N ou multi-card)
- Pronto para step 3
