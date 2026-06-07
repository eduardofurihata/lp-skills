# Step 13 — Analisar complexidade

**Effort: max**


## Objetivo
Atribuir um score de 1 a 10 à correção para determinar quantos test cases são necessários no step 14.

## Critérios de Scoring

| Dimensão | Baixo (1-3) | Médio (4-6) | Alto (7-10) |
|----------|------------|-------------|-------------|
| Arquivos modificados | 1-2 | 3-4 | 5+ |
| Complexidade lógica | if/else simples | múltiplas condições | algoritmo / recursão |
| Side effects potenciais | zero fluxos | 1-2 fluxos laterais | múltiplos fluxos críticos |
| Usuários afetados | nicho / admin | segmento específico | todos os usuários |
| Reversibilidade | fácil (feature flag) | médio | migração / breaking change |
| Integrações envolvidas | nenhuma | 1 integração | múltiplas / webhook |

## Tabela Score → N Test Cases

| Score | N TCs mínimos |
|-------|---------------|
| 1 | 1 TC |
| 2 | 2 TCs |
| 3 | 3 TCs |
| 4 | 4 TCs |
| 5 | 5 TCs |
| 6 | 6 TCs |
| 7 | 7 TCs |
| 8 | 8 TCs |
| 9 | 9 TCs |
| 10 | 10 TCs |

## Sub-steps

### 13.1 — Avaliar cada dimensão
```markdown
## Análise de Complexidade

| Dimensão | Score parcial | Razão |
|----------|---------------|-------|
| Arquivos a modificar | N | [razão] |
| Complexidade lógica | N | [razão] |
| Side effects | N | [razão] |
| Usuários afetados | N | [razão] |
| Reversibilidade | N | [razão] |
| Integrações | N | [razão] |
```

### 13.2 — Calcular score final
Média ponderada ou julgamento Opus considerando o peso de cada dimensão.

```markdown
**Score final: N/10**
**Síntese:** [por que este score — fatores dominantes]
**Test Cases necessários: N**
```

### 13.3 — Atualizar card .md
```markdown
## Complexidade
- Score: N/10
- TCs necessários: N
- Principais fatores: [listar]
```

## Critério de Saída
- Score 1-10 definido e justificado por dimensão
- Número de TCs determinado (igual ao score)
- Card .md atualizado
- Pronto para criação de TCs (step 14)
