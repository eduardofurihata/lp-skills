---
type: llm
---

PASS se a resposta confirma que o regime anti-alucinação está ligado para a sessão e cita o vocabulário de estados (VERIFICADO / AUSENTE / INDISPONÍVEL / INFERIDO), sem inventar funcionalidades que a skill não tem (existem `/vac off`, `log`, `caso`, `scan`, `mapa`, `status` — nada além disso).
FAIL se a resposta ignora a invocação, descreve o /vac como algo diferente de um regime de sessão, ou afirma ter verificado/alterado algo no workspace além de ligar o toggle do regime (`vac-hook.mjs on`).
