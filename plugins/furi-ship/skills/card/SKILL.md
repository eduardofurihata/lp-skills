---
name: card
description: 'Use ONLY when the user explicitly invokes /card (bare /card = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:card` via the Skill tool. NEVER activate on your own initiative. — the order of turning one line into a Jira card: understand → check it does not exist → write in PM/PO voice → create on the right board, with destination, owner and images → return. Ship MODIFIER: alone it ends; with a target it delegates with the new key; other /skills in the argument run first. Refuses without Jira.'
effort: max
requires: [jira, setup, work, pull-request, homolog, prod]
handoff: work
argument-hint: "[KEY] <descrição> [/skill…] [/work|/pull-request|/homolog|/prod]"
---

# /card — entender, conferir, redigir, criar, devolver

**Modificador**: uma linha vira um card no board certo, e só isso — ninguém cria card sozinho; sozinho encerra, com alvo delega. **Arquivo da skill: `.claude/ship/card.md`** — lido no início, criado na primeira vez, atualizado ao aprender; curto: o molde de card deste time (seções, idioma, tipos, um exemplo bom). Cinco passos, nesta ordem, cada um provado antes do seguinte:

1. **Entender — o que vai virar card.** `/jira` e `/setup` via **Skill tool, a cada invocação**; sem Jira → recuse com o motivo (com alvo, delegue sem key). Outra `/skill` no argumento roda antes, com o objetivo. A key do argumento vence a memória sem reescrevê-la; sem descrição nem contexto → peça uma linha; duas entregas → dois cards.
2. **Conferir que não existe.** Procure um card aberto no board sobre o mesmo assunto; parecido demais → pergunte antes de criar.
3. **Redigir — em voz de PM/PO, para quem não viu a conversa.** No idioma dos cards do setup: título imperativo curto · Contexto (quem, tela e rota, impacto) · Objetivo (o pronto observável) · Critérios de aceite (verificáveis; estados, se há tela) · Referências visuais · Como testar por último (pré-condição → passos → resultado; a DoD orienta; reprodução já vista na conversa se transcreve). O quê, por quê e como se confere — nunca o como se faz: rota sim, arquivo não.
4. **Criar — no board certo, com destino, dono e imagens.** Tipo pelo `/jira` (bug ou o resto); destino e dono pelo setup (`Destino do card novo`: sprint ativa, descoberta na hora, senão backlog avisado; `Atribuir a`, senão sem dono avisado); toda imagem de referência sobe (`jira/SKILL.md` § Anexar imagem a um card) e é citada no card — anexo que falhou é dito, não presumido.
5. **Devolver.** Key, título, tipo, destino, dono, anexos, URL. Sozinho, encerre e sugira `/work <KEY>-<N>`; com alvo, `Skill(skill: "<alvo>", args: "<verbos restantes> <KEY>-<N>")`.
