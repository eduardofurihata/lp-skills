---
cmd: "check-stop"
expect: "block"
must: ["verifier-report-omitted"]
class: "ledger"
origin: "SKILL.md do /vac — resumir 'o verificador aprovou' no lugar do relatório é o que o /vac existe para impedir"
ledger: {"reads": ["kanban/08-code-review/login.md"], "agentReports": ["## Verificação — kanban/08-code-review/login.md\n- ok — SUPORTADA lib/skills.ts:2\n\nVEREDITO: 1 suportadas / 0 não suportadas / 0 não verificáveis · alvo=kanban/08-code-review/login.md sha256=indisponível"]}
fixture: {"files": {"kanban/08-code-review/login.md": 10, "lib/skills.ts": 120}}
---
Rodei o verificador em kanban/08-code-review/login.md e ele aprovou tudo ✅ — podemos seguir para o Step 9.
