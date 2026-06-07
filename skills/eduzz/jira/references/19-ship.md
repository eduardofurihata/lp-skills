# Step 19 — Ship

**Effort: max**


## Objetivo
Commitar, pushar, criar PR e atualizar o Jira. Fim do workflow.

## Sub-steps

### 19.1 — Verificar estado final antes de commitar
```bash
git status
git diff
```
Zero arquivos indesejados, zero console.logs.

### 19.2 — Commit com mensagem padronizada
```bash
git add path/to/specific/file.ts path/to/other.ts
git commit -m "$(cat <<'EOF'
fix(PROJ-36): [descrição concisa do que foi corrigido]

[descrição opcional mais detalhada se a mudança for complexa]

Jira: PROJ-36
Co-Authored-By: Claude Sonnet Max <noreply@anthropic.com>
EOF
)"
```

**Nunca usar `git add .` ou `git add -A`** — adicionar apenas arquivos específicos da correção.

### 19.3 — Push
```bash
git push origin PROJ-36
```

### 19.4 — Criar PR
```bash
gh pr create --title "fix(PROJ-36): [título conciso]" --body "$(cat <<'EOF'
## O que foi feito
[Descrição em linguagem simples, sem jargão técnico. Qualquer pessoa deve conseguir entender o problema que existia e o que foi corrigido. Ex: "Quando o usuário clicava em X, acontecia Y de forma incorreta. Agora o sistema faz Z corretamente."]

---

## Summary
- [Bullet: o que foi corrigido]
- [Bullet: abordagem usada]

## Como Reproduzir (antes do fix)
[passos resumidos da reprodução]

## Solução
[descrição da abordagem técnica]

## Test Plan
- [ ] TC-1: [descrição]
- [ ] TC-2: [descrição]
- [ ] TC-N: [descrição]

## DevOps
- [ ] Migrations: [sim/não]
- [ ] Variáveis de ambiente novas: [listar ou "nenhuma"]
- [ ] Dependências novas: [listar ou "nenhuma"]

Jira: PROJ-36
🤖 Generated with Claude Sonnet Max
EOF
)"
```

### 19.5 — Atualizar Jira
Adicionar comentário no card com:
```
mcp__atlassian__jira_post → /rest/api/3/issue/PROJ-36/comments
```

**Conteúdo do comentário:**
```
## O que foi feito
[Mesma descrição simples do PR — qualquer pessoa entende o problema e a correção, sem jargão técnico]

---
PR: [URL]
Branch: PROJ-36
Status: Em revisão
```

Depois mover o status:
```
mcp__atlassian__jira_post → /rest/api/3/issue/PROJ-36/transitions
```
Status: "Em revisão" | "Code Review" (conforme workflow do projeto).

### 19.6 — Mover card .md para done
```bash
mv docs/jira/todo/PROJ-36.md docs/jira/done/PROJ-36.md
```

### 19.7 — Atualizar frontmatter final do card .md
```yaml
step: 19
step-status: done
shipped: true
pr: [URL do PR]
shipped-at: [data]
```

### 19.8 — Publicar no chat

```markdown
## ✅ Card PROJ-36 — SHIPPED

- Branch: PROJ-36
- Commit: [hash]
- PR: [URL]
- Jira: Em revisão
- Card .md: docs/jira/done/PROJ-36.md
```

## Critério de Saída
- Commit criado com mensagem padronizada e específica
- Push feito para origin
- PR criado com body completo (summary, test plan, devops)
- Jira atualizado para status pós-dev
- Card .md em `docs/jira/done/`
- Publicação final no chat

**DONE.**
