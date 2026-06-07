# Ship — push + PR + Jira

> Rode **SOMENTE** após o usuário confirmar (ver `SKILL.md` → "Ship — PERGUNTAR antes").
> O **commit já foi criado pelo `/method`** (Step 10 — Done). Aqui é **push + PR + Jira + mover card**. Não criar um segundo commit (a menos que haja ajuste final pendente).

## Sub-steps

### 1 — Verificar estado final
```bash
git status        # working tree limpo; o commit do /method já está presente
git log -1 --oneline
```
Zero arquivos indesejados, zero `console.log`/debug.

### 2 — Push da branch do card
```bash
git push origin [branch]      # ex.: PROJ-36
```

### 3 — Criar PR
```bash
gh pr create --title "[tipo]([CARD-CODE]): [título conciso]" --body "$(cat <<'EOF'
## O que foi feito
[Descrição em linguagem simples, sem jargão. Qualquer pessoa entende o problema que existia e o que foi corrigido. Ex.: "Quando o usuário clicava em X, acontecia Y errado. Agora o sistema faz Z corretamente."]

---

## Summary
- [o que foi corrigido]
- [abordagem usada]

## Como reproduzir (antes do fix)
[passos resumidos da reprodução registrada no Step 0]

## Solução
[descrição da abordagem técnica]

## Test Plan
- [ ] TC-1: [descrição]
- [ ] TC-N: [descrição]

## DevOps
- [ ] Migrations: [sim/não]
- [ ] Variáveis de ambiente novas: [listar ou "nenhuma"]
- [ ] Dependências novas: [listar ou "nenhuma"]

Jira: [CARD-CODE]
🤖 Generated with Claude Code
EOF
)"
```

### 4 — Atualizar o Jira
Comentário no card:
```
mcp__atlassian__jira_post → /rest/api/3/issue/[CARD-CODE]/comments
```
```
## O que foi feito
[mesma descrição simples do PR — sem jargão]

---
PR: [URL]
Branch: [branch]
Status: Em revisão
```
Depois mover o status:
```
mcp__atlassian__jira_post → /rest/api/3/issue/[CARD-CODE]/transitions
```
Status: "Em revisão" / "Code Review" (conforme o workflow do projeto).

### 5 — Mover o card `.md` para done
```bash
mv docs/jira/todo/[CARD-CODE].md docs/jira/done/[CARD-CODE].md
```
Atualizar frontmatter:
```yaml
phase: ship
shipped: true
pr: [URL do PR]
```

### 6 — Publicar no chat
```markdown
## ✅ Card [CARD-CODE] — SHIPPED
- Branch: [branch]
- Commit: [hash] (do /method)
- PR: [URL]
- Jira: Em revisão
- Card .md: docs/jira/done/[CARD-CODE].md
```

## Critério de Saída
- Push feito para origin
- PR criado com body completo (summary, test plan, devops, `Jira: [CARD-CODE]`)
- Jira atualizado (comentário + transição) para status pós-dev
- Card `.md` em `docs/jira/done/`
- Publicação final no chat

**DONE.**
