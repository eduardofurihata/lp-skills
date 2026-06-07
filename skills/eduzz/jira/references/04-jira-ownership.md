# Step 4 — Jira ownership + status → Em andamento

**Effort: max**


## Objetivo
Assumir o card no Jira e marcar como "Em andamento" para sinalizar que o trabalho começou.

## Sub-steps

### 4.1 — Verificar assignee atual
```
mcp__atlassian__jira_get → /rest/api/3/issue/PROJ-36
```
Verificar campo `assignee`.

### 4.2 — Atribuir a si mesmo (se necessário)
```
mcp__atlassian__jira_put → /rest/api/3/issue/PROJ-36/assignee
Body: { "accountId": "[accountId do executor]" }
```
Se já está assignado ao executor correto, pular.

### 4.3 — Obter transições disponíveis
```
mcp__atlassian__jira_get → /rest/api/3/issue/PROJ-36/transitions
```
Localizar a transição para "Em andamento" (ou equivalente no projeto).

### 4.4 — Executar transição
```
mcp__atlassian__jira_post → /rest/api/3/issue/PROJ-36/transitions
Body: { "transition": { "id": "[id da transição]" } }
```

### 4.5 — Confirmar status
```
mcp__atlassian__jira_get → /rest/api/3/issue/PROJ-36
```
Verificar que status agora é "Em andamento".

## Critério de Saída
- Card assignado ao executor
- Status = "Em andamento" (ou equivalente)
- Pronto para step 5
