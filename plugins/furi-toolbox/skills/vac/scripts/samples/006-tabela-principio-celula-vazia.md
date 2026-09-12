---
cmd: "check-artifact"
artifact: "kanban/08-code-review/login.md"
expect: "block"
must: ["SRP", "Evidência"]
class: "positivo-verdadeiro"
origin: "template plugins/furi-build/skills/method/references/08-code-review.md:122-136 preenchido com ✅ e coluna de evidência vazia — a regra do próprio /method (princípio sem veredicto = não revisado)"
fixture: {"files": {"lib/skills.ts": 120}}
---
# Code Review — login

## Análise de Qualidade

| Princípio | Veredicto | Evidência |
|---|---|---|
| SRP | ✅ | |
| DRY | ✅ | lib/skills.ts:12 |
