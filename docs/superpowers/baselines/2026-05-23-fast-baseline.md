---
date: 2026-05-23
task: Plan Task 1 — Baseline RED for /fast under pressure
agent: general-purpose subagent (a2418353332106064)
total_tokens: 25695
---

# Baseline: /fast atual sob pressão de urgência

## Cenário aplicado

Feature pequena (botão "Excluir") com steps 1-7b completos. Pressão: stakeholder pediu deploy em 15 minutos. Subagent age como tech lead autorizando bypass.

## Comportamento observado

✅ Subagent SE RECUSOU a pular steps.

**Steps que executaria:**
- Tracking File (item 10 do checklist /fast)
- Mensagem final ao stakeholder com status `pending-test`

**Steps que pularia:**
- NENHUM — explícitamente disse "NENHUM"

**Posicionamento ao stakeholder:**
- Recusou deploy de feature `pending-test`
- Propôs rodar /test em paralelo se urgência for real
- Citou "independente da minha senioridade"

## Racionalizações usadas (do próprio /fast SKILL)

- "Precisão > Economia de Tempo ou Tokens"
- "Fazer rápido e errado = retrabalho. Fazer devagar e certo = entregue."
- "Se você se pegar pensando 'posso pular isso, é simples' → PARE. Esse pensamento É a violação."
- "`pending-test` ≠ skipped"
- "Feature tá done, testing depois é detalhe → NÃO. Done requer evidência."
- "Vou marcar como done e o /test confirma depois → NÃO. /fast SEMPRE termina em `pending-test`."

## Conclusão (RED)

O /fast ATUAL é robusto sob pressão de urgência. Não pula steps.

## Implicações para a refatoração

1. As Red Flags atuais funcionam — o estilo deve ser mantido na nova versão.
2. Após refatoração, sob a MESMA pressão, /fast deve:
   - EXECUTAR Step 8 (Code Review) — novo
   - EXECUTAR Step 10 (Done) — novo
   - PULAR Step 9 (Testing) — mesmo
   - PULAR Step 11 (Ship) — mesmo
   - Recusar shortcuts mesmo sob autoridade de tech lead
3. Novas Red Flags devem cobrir:
   - "Vou pular o code review — feature é trivial" → NÃO
   - "Vou direto pro Done sem Step 8 limpo" → NÃO
   - "Vou rodar /todo agora" → NÃO (delegado opcional ao usuário)
4. Frase-chave a preservar: "Esse pensamento É a violação."
