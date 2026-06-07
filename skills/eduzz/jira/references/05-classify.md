# Step 5 — Classificar o card

**Effort: max**


## Objetivo
Determinar com precisão se o card é um BUG ou FEATURE, pois isso impacta o foco da investigação.

## Definições

| Tipo | Definição |
|------|-----------|
| **BUG** | Comportamento que deveria funcionar mas não funciona. Há uma expectativa estabelecida sendo violada. |
| **FEATURE** | Funcionalidade nova ou mudança deliberada no comportamento existente. |

## Sub-steps

### 5.1 — Ler título e descrição completa do card
Identificar palavras-chave:
- BUG → "não funciona", "erro", "bug", "problema", "quebrado", "falha"
- FEATURE → "adicionar", "criar", "implementar", "novo", "melhorar", "permitir"

### 5.2 — Verificar tipo declarado no Jira
O Jira tem campo de tipo (Bug, Story, Task). Usar como referência, não como única verdade.

### 5.3 — Classificar e registrar
```markdown
## Classificação
- Tipo: BUG | FEATURE
- Razão: [justificativa em 1 frase]
```

### 5.4 — Atualizar frontmatter do card .md
```yaml
type: BUG | FEATURE
```

## Impacto no Step 6

```
BUG     → Step 6 foca em condições de trigger e erro
FEATURE → Step 6 foca em requisitos e mapeamento de fluxo
```

## Critério de Saída
- Tipo definido: BUG ou FEATURE
- Razão documentada no card .md
- Frontmatter atualizado
