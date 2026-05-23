# Step 2 — Criar branch (nomenclatura multi-card)

**Effort: max**


## Objetivo
Criar branch de trabalho com nomenclatura padronizada para o card atual.

## Nomenclatura

| Situação | Formato | Exemplo |
|----------|---------|---------|
| Card único | `AV-N` | `AV-36` |
| Dois cards | `AV-N-M` | `AV-36-40` |
| Três cards | `AV-N-M-P` | `AV-36-40-55` |
| Quatro cards | `AV-N-M-P-Q` | `AV-36-40-55-72` |

Números em ordem crescente. Sempre prefixo `AV-`.

## Sub-steps

### 2.1 — Determinar nome da branch
Com base no(s) card(s) sendo trabalhados:
- Um card → `AV-[número]`
- Múltiplos cards → `AV-[n1]-[n2]-[n3]` em ordem numérica crescente

### 2.2 — Verificar se branch já existe
```bash
git branch | grep AV-
```
Se já existir → fazer checkout sem recriar:
```bash
git checkout AV-36
```

### 2.3 — Criar e fazer checkout (se não existir)
```bash
git checkout -b AV-36
```

### 2.4 — Confirmar
```bash
git branch --show-current
```

## Critério de Saída
- Branch criada e ativa localmente
- Nomenclatura correta (AV-N ou multi-card)
- Pronto para step 3
