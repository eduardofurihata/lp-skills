---
name: runbook
description: 'Use when user invokes /runbook — runs a YAML process step by step through the `runbook` engine, by default here in the chat: the engine hands out one step at a time, the chat does it in front of the dev and delivers it, and the engine only advances when the delivery brings what the step requires; judges run blind in clean sessions; stops wait for the dev. "Em fundo" runs the steps in a background agent and the chat only relays events.'
argument-hint: "<processo.yaml> [--dir <projeto>] [--<entrada> <valor>…] [em fundo] | status [run]"
disable-model-invocation: true
---

# /runbook — o motor conduz; o passo é feito aqui, à vista do dev

**Quem decide o próximo passo é o motor**: pede um por vez, só avança quando a entrega traz o que o passo exige, julga em sessão cega e para quando precisa do dev. Você faz o passo pedido nesta conversa — nunca adianta, pula ou responde a uma parada no lugar do dev.

1. `runbook --version` responde; não → `runbook/install.sh` no checkout do lp-skills. `runbook validar <processo.yaml>`; erro → mostre e pare.
2. `runbook run <processo.yaml> [--dir <projeto>] --<entrada> <valor>…` pelo Bash, timeout máximo — daqui do chat, o modo é chat por padrão. A 1ª linha traz o id: passe-o **sempre** — pode haver outro run aberto.
3. **`✋ SUA VEZ`** (saída 11): faça só esse passo, por completo, aqui, dizendo numa frase o que vai fazer; sem inventar campo. Precisa do dev → AskUserQuestion, e siga no mesmo passo; orientação dele no meio vale para este passo. Entregue com `runbook entregar <id> <<'JSON'` + o objeto com os campos + `JSON` (Bash, timeout máximo): acompanha até o próximo `✋ ⏸ ■`; expirou → `runbook seguir <id>`. Novo `✋` com `faltou` ou lacunas do juiz → refaça fechando cada uma.
4. `✓ ⚖ ⤼` → uma frase curta ao dev, sem comentar o mérito.
5. **`⏸ PARADA`** (saída 10) → AskUserQuestion com a mensagem literal. Escalada (`✗` antes do `⏸`) → mostre o motivo e pergunte. Resposta → `runbook responder <id> "<fala literal>"`; `runbook pular <id> "<motivo>"` só se ele mandar.
6. **`■ FIM`** (0) → o relatório. Saída 1 → a linha e `runbook status <id>`; o dev escolhe `retomar` ou `parar`.

**Retomar, em outro chat:** `runbook lista` → `runbook seguir <id>` traz o `✋` pendente; trabalhador caído → `runbook retomar <id>`. O entregue fica salvo; a conversa anterior, não.

**Em fundo** (o dev pediu; `--fundo`): um agente em segundo plano faz os passos. Acompanhe pelo **Monitor** (expirou → `runbook seguir <id>`), repasse `▶ ✓ ↺ ⚖`; `⏸ PERGUNTA` → AskUserQuestion com as `opções:` da linha (sem elas: pular ou parar o run).

O estado é do motor, em `~/.runbook/runs/<id>/`: nunca o edite, nem o processo, durante um run.
