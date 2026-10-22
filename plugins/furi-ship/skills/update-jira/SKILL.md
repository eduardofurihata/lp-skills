---
name: update-jira
description: 'Use when user invokes /update-jira [KEY…] (bare /update-jira = all my cards in progress and code review) — checks each card''s real state (GitHub, deploy, infra config and in-app config such as access to grant or admin settings, tests only the environment can prove, pending items); posts it as a comment, moves the column only on clear evidence and returns the pending items in the chat. Read-only everywhere but the card: never deploys, never edits the description. Refuses without Jira.'
requires: [pwx]
argument-hint: "[KEY…] [/skill…]"
disable-model-invocation: true
boundary: [homolog, prod]
---

# /update-jira — o estado real de cada card meu, no card

O board diz o que alguém lembrou de mover; o GitHub e os ambientes dizem o que aconteceu — cada card passa a dizer o mesmo que eles. Card a card: confere, comenta e move a coluna só com evidência, e só então o próximo; no fim, devolve no chat as pendências de todos. Fora do card, só leitura: deploy é do /homolog e do /prod, a descrição real é do /repro. Sem Jira → recuse.

**Os passos moram em `processo.yaml`, nesta pasta — fonte única.** Com o `runbook` instalado (`runbook --version` responde), o motor conduz e o run é feito **aqui, à vista do dev**, como no `/runbook`:

1. `runbook run <esta pasta>/processo.yaml --dir <projeto> --cards "<KEYs>"` — sem KEY no argumento, `--cards meus`; daqui em diante, sempre com o id do run.
2. `✋ SUA VEZ` → faça só aquele passo, aqui, e entregue com `runbook entregar <id>`. O navegador, quando precisar ler um painel, é a aba do pwx desta sessão.
3. `⏸ PERGUNTA` → AskUserQuestion com o que o motor mostrou; a fala literal vai com `runbook responder <id> "…"`. Escalada (`✗`): mostre o motivo; `pular` só se ele mandar.
4. `■ FIM` → no chat, em texto, as pendências de cada card; depois, os links dos comentários e as colunas.

"Em fundo" no argumento → `--fundo`, como no `/runbook`.

Sem `runbook` (outra máquina ou cliente), ou com outras skills no argumento: siga os passos do `processo.yaml` na ordem, um por um. Com outras skills, faça tudo numa passada só junto com os passos delas, nunca uma antes ou depois da outra. Os passos são o checklist do run, em `.claude/ship/run.md`: escreva cada um como `- [ ]`, marque `- [x]` ao fechar e retome do primeiro aberto; quem criou o arquivo apaga ao fim. `{run.dir}` é uma pasta nova deste run, `~/.runbook/runs/update-jira-<AAAAMMDD-HHMMSS>-<4 hex>/arquivos/`, criada no começo e anotada no topo do checklist, para retomar na mesma. Bloco (`passos` com `para_cada`) → para cada item, todos os passos de dentro, em ordem, antes do próximo item.
