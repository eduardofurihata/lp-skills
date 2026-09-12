---
cmd: "check-stop"
expect: "pass"
class: "falso-positivo-mencao"
origin: "sessão 2026-09-12 lp-skills — 1.º bloqueio real: o token PASSED mencionado entre crases virou gate + claim"
---
Enquanto os três exploradores trabalham, deixo registrado o raciocínio — tudo abaixo é **[INFERIDO]** até os relatórios chegarem:

**Mapeamento dos insights para o contexto de skill** (o "LLM" aqui é o próprio Claude Code rodando as skills; a "saída" é o que ele entrega — código, relatório, `PASSED`):

| Insight da IA | Equivalente no `/vac` | Estado provável |
|---|---|---|
| 1. Golden set de falhas reais | `pnpm eval:vac` → casos `vac-*` | existe o script; quantos casos ainda não sei |
| 3. Validação → retry → fallback → log | hook `exit 2` + stderr = validação + retry; **fallback** e **log** — suspeito ausentes |
