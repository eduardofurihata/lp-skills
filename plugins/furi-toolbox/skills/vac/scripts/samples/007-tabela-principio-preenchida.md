---
cmd: "check-artifact"
artifact: "kanban/08-code-review/login.md"
expect: "pass"
class: "falso-positivo-template"
origin: "template 08-code-review.md:122-136 preenchido com coordenada na coluna de evidência"
fixture: {"files": {"lib/skills.ts": 120, "lib/graph.ts": 40}}
---
# Code Review — login

## Análise de Qualidade

| Princípio | Veredicto | Evidência |
|---|---|---|
| SRP | ✅ | lib/skills.ts:12 |
| DRY | ✅ | lib/graph.ts:7 |
| KISS | ⚠️ | lib/graph.ts:30 — condicional aninhado; corrigido |
