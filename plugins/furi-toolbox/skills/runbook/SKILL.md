---
name: runbook
description: 'Use when user invokes /runbook — runs a process written in YAML step by step through the `runbook` engine of this machine: every step goes to the same agent conversation and only advances when the answer brings what the step requires, judges run in clean sessions, stops wait for the dev. The chat starts the run, relays each event and carries the dev''s answers to the stops; it never does the steps.'
argument-hint: "<processo.yaml> [--dir <projeto>] [--<entrada> <valor>…] | status [run]"
disable-model-invocation: true
---

# /runbook — o processo roda no motor; o chat só acompanha

O `runbook` executa um processo (YAML) passo a passo: manda cada passo para a mesma conversa do agente, só avança quando a resposta traz o que o passo exige, roda juízes em sessão limpa e para quando precisa do dev. **Quem decide o próximo passo é o motor.** Você não executa passo nenhum, não resume, não pula e não responde a uma parada no lugar do dev.

1. **Garantir o comando.** `runbook --version` responde; não → rode `runbook/install.sh` no checkout do lp-skills (Node ≥ 20) e repita.
2. **Validar.** `runbook validar <processo.yaml>`; erro → mostre ao dev e pare.
3. **Rodar.** `runbook run <processo.yaml> [--dir <projeto>] --<entrada> <valor>…` pelo **Monitor**, com o timeout máximo — cada linha que ele imprime é um evento; a primeira traz o id do run. O trabalho segue em segundo plano: se o Monitor expirar, rearme com `runbook seguir <run>` (pode repetir linhas já vistas). Sem Monitor (outro cliente): rode em segundo plano e consulte `runbook status <run>`.
4. **Repassar.** Cada linha `▶ ✓ ↺ ⚖` vira uma frase curta para o dev — sem comentar o mérito, sem antecipar passos.
5. **Paradas.** Linha `⏸ PARADA` (o comando sai com 10): mostre a mensagem literal e pergunte ao dev. Linha `⏸ PERGUNTA`: é o agente do run perguntando — pergunte ao dev com **AskUserQuestion**, a pergunta literal; as `opções:` da linha são as escolhas e, sem elas, as escolhas são `Pular este passo` (→ `runbook pular`) e `Parar o run` (→ `runbook parar`); a resposta livre vem no campo de texto dele. Com a resposta, `runbook responder <run> "<fala literal do dev>"`, também pelo Monitor. Escalada (`✗` antes do `⏸`: juiz abaixo da nota, resposta incompleta, comando que falhou): mostre o motivo e pergunte — `responder` refaz o passo com a orientação dele; `runbook pular <run> "<motivo>"` só quando o dev mandar pular, com as palavras dele.
6. **Fim.** `■ FIM` (sai com 0): mostre o relatório. Saída 1 (erro ou queda): mostre a linha e `runbook status <run>`; o dev decide entre `runbook retomar <run>` e `runbook parar <run>`.

O estado é do motor, em `~/.runbook/runs/<run>/`: nunca edite os arquivos dele nem o processo durante um run.
