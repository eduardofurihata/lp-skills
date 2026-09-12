---
cmd: "check-artifact"
artifact: "kanban/09-run-test/alinhamento-guidelines.md"
expect: "pass"
class: "cobertura-instrumentacao"
rule: "cobertura-delta"
fixture: {"files": {"kanban/09-run-test/evidence/tc1.png": "png"}}
origin: "labzz-refundzz/kanban/09-run-test/alinhamento-guidelines.md — Delta: 0 com Predicted 10 e Evidence collected 17 (88 casos iguais nos repos)"
note: "Fase de instrumentação: a conta furada vira `note` no log, NÃO bloqueia — e o resto do artefato está com lastro, então nada mais pode bloquear. Se este sample começar a falhar, alguém promoveu `cobertura-delta` a block: atualize expect para block e preencha o must."
---
# Run Test — alinhamento-guidelines

## Execução

| TC | Resultado | Evidência |
|---|---|---|
| TC-1 | ✅ PASSED | `evidence/tc1.png` |

## Reconciliação
- Predicted: 10 TCs. Evidence collected: 17. Delta: 0.
