---
cmd: "check-artifact"
artifact: "kanban/09-run-test/ficha.md"
expect: "pass"
class: "falso-positivo-template"
origin: "labzz-afl kanban/09-run-test/ficha-tecnica-digitada-a-mao.md — formato real: claim no heading, evidência como nome de arquivo em célula, diretório declarado no topo"
fixture: {"files": {"kanban/09-run-test/evidence-ficha/tc1-1-antes-nova-lite-descoberta.png": "png", "kanban/09-run-test/evidence-ficha/tc1-2-depois.png": "png"}}
---
# Resultados de Teste — Ficha técnica digitada à mão

Evidência em `kanban/09-run-test/evidence-ficha/`

## Resumo

| Total TCs | Passed | Failed | Iterações |
|---|---|---|---|
| 1 | 1 | 0 | 1 |

## TC-1: Ficha digitada à mão aparece na lista — ✅ PASSED

| Passo | Resultado | Evidência |
|---|---|---|
| Abrir a lista de fichas | lista vazia | tc1-1-antes-nova-lite-descoberta.png |
| Digitar e salvar | ficha aparece | tc1-2-depois.png |
