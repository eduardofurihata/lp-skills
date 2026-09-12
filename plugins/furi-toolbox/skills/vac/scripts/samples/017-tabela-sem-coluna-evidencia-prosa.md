---
cmd: "check-artifact"
artifact: "kanban/08-code-review/login.md"
expect: "pass"
class: "falso-positivo-template"
origin: "tabela de qualidade sem coluna de evidência e com justificativa em prosa — passa com note (calibração), não bloqueia"
---
# Code Review — login

| Princípio | Veredicto | Comentário |
|---|---|---|
| SRP | ✅ | cada módulo faz uma coisa |
| DRY | ✅ | helper único para o parse |
