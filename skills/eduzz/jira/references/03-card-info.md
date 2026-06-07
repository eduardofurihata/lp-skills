# Step 3 — Criar .md com card info

**Effort: max**


## Objetivo
Criar o arquivo de tracking do card em `docs/jira/todo/[CARD-CODE].md` com todas as seções necessárias para o workflow completo.

## Localização
```
docs/jira/todo/PROJ-36.md
```
Criar pasta se não existir: `docs/jira/todo/` e `docs/jira/done/`.

## Template do Arquivo

```markdown
---
card: PROJ-36
title: [título do card no Jira]
type: BUG | FEATURE
branch: PROJ-36
step: 3
step-status: done
---

## Descrição do Card
[colar descrição completa do Jira]

## Interpretações do Card
1. [interpretação primária]
2. [interpretação alternativa — obrigatória]

## Ambiente Necessário
- Usuário: [tipo de usuário necessário]
- Dados: [dados/estado necessário]
- Integrações: [integrações relevantes]
- URL/Fluxo: [URL exata mencionada no card]

## Mapa de Problemas
[preenchido no step 7-9]

## Passos para Reproduzir
[preenchido no step 10]

## Reprodução Final
[preenchido no step 11]

## Estratégia de Solução
[preenchido no step 12]

## Complexidade
[preenchido no step 13]

## Test Cases
[preenchido no step 14]

## Implementação
[preenchido no step 15]
```

## Sub-steps

### 3.1 — Verificar se docs/jira/ existe
```bash
ls docs/jira/
```
Se não existir, criar estrutura:
```bash
mkdir -p docs/jira/todo docs/jira/done
```

### 3.2 — Buscar dados do card via Jira MCP
```
mcp__atlassian__jira_get → /rest/api/3/issue/PROJ-36
```
Extrair: título, descrição, tipo, prioridade, assignee.

### 3.3 — Criar o arquivo com template preenchido
Preencher frontmatter e seção "Descrição do Card" com dados reais do Jira.

### 3.4 — Validar arquivo criado
Verificar que o arquivo existe e tem todas as seções.

## Critério de Saída
- `docs/jira/todo/PROJ-36.md` criado
- Frontmatter preenchido (`step: 3`, `step-status: done`)
- Seção "Descrição do Card" com conteúdo real do Jira
- Mínimo 2 interpretações listadas (mesmo que preliminares)
