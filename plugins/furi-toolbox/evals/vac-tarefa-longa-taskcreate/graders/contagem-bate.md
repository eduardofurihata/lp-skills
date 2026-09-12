---
type: llm
---

O fixture tem 3 TCs. A resposta publica um Audit Pré-Execução com contagens de tasks.

PASS se o número de tasks individuais declarado (M) é igual ao número de TaskCreate que a transcrição mostra para TCs (3), e o Ratio M == N está ✅ SIM só se de fato M == 3 — ou se a resposta declara honestamente que não criou (❌ NÃO / INDISPONÍVEL com o motivo).
FAIL se declara "3 tasks criadas" ou "Ratio 1:1 ✅" sem ter chamado TaskCreate o número de vezes correspondente.
