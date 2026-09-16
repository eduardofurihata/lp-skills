---
name: repro
description: 'Use ONLY when the user explicitly invokes /repro (bare /repro = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:repro` via the Skill tool. NEVER activate on your own initiative. — live reproduction, a MODIFIER: the bug is reproduced where the user sees it BEFORE any code and the dev sees it twice, before and after the fix. Alone it reproduces and stops; with /card the card gets the observed steps; with a target (any order) it reproduces first and delegates, and the target runs the second human check after the commit. `finish` never skips the two human checks.'
effort: max
requires: [jira, setup, infra, work, pull-request, homolog, prod, card]
argument-hint: "[KEY-N | descrição] [/work | /pull-request | /homolog | /prod] [/card] [finish] | (vazio = card ativo)"
---

# /repro — reproduzir onde o usuário vê, e provar que sumiu

**Modificador**, não alvo: **o bug é reproduzido onde o usuário o vê, antes de qualquer código, e o dev o vê duas vezes** — o trigger com o bug (parada 1) e o mesmo trigger com o bug sumido (parada 2, depois do commit). Sozinho, reproduz e para; não implementa, não commita, não pusha.

## Os guarda-chuvas

- **Código localiza; reproduzir prova.** Superfície = onde o usuário vê: web → Playwright (`pw4`, pool `pw#` como fallback — nunca SKIP com instância livre); mobile → emulador da plataforma do card; API → chamada real com o payload do card. Cenário **exato** (usuário, dados, condições — crie o que faltar), nota **0–100** contra o que está escrito e anexado, até ≥ 90. Sem evidência (screenshot ou resposta real) não há reprodução; não reproduziu → **pergunte**, nunca "pelo código o bug é…".
- **Duas paradas humanas, obrigatórias em qualquer modo — `finish` inclusive.** O dev clica no trigger e confirma ao vivo, antes e depois. A parada 1 fecha aqui; a parada 2 é o § Human Check, executado pelo `/work` depois do commit.
- **Descobrir, nunca assumir.** `/jira` e `/setup` via **Skill tool, a cada invocação**; a branch de trabalho pela mecânica do `/work` (§ Branch, `<integração>` detectada): o código que reproduz tem de ser o que será corrigido. O anexo é o que o solicitante viu — leia antes de dar nota.

## Fluxo

0. **Composição:** ordem fixa `repro → card → alvo`. Sozinho → passos 1–4 e encerra. `… /card` → depois `Skill(skill: "card", args: "<verbos restantes> <objetivo>")`. `… /<alvo>` → depois `Skill(skill: "<alvo>", args: "/repro <objetivo>")`: o alvo vê a reprodução feita e roda a parada 2 depois do commit. Vazio = card ativo (`docs/jira/todo/*.md` com `branch:` igual à atual); `finish` passa adiante.
1. **Objetivo:** `jira_get_issue` (título, descrição, tipo `BUG`/`FEATURE`, `## Como testar`, **anexos**) ou a descrição do argumento. Com card **e** alvo: registro `docs/jira/todo/<KEY>-<N>.md` (`card`, `type`, `branch`, `phase: investigation`); assignee e `/jira` § Sincronizar (**trabalho começou**). Sem alvo ou sem card, a conversa é o registro.
2. **Entender (≥ 90):** leia o código relevante; `< 90` → mais código, repontue. Ambiguidade real → `AskUserQuestion`, mesmo em `finish`. Problema **fora do card** → nunca decida em silêncio: pergunte (o que é · como reproduzi · causa provável · relação com o card · recomendação).
3. **Reproduzir (≥ 90):** BUG → registre **como**: usuário, dados, ponto de partida (URL / tela / endpoint), passos, trigger, superfície (+ `pw#`) — no registro ou num bloco explícito da conversa; é o que a parada 2 re-executa e o `/card` transcreve. FEATURE → onde vai nascer e o estado atual desse lugar.
4. **Parada 1:** publique *ambiente pronto* + **"👉 Clique em / Execute: [elemento ou comando exato]"** + o comportamento atual + a evidência, e **PARE** até o dev confirmar. Confirmou → `phase: commit`.
5. **Saída** (sozinho): `✅ /repro <obj> — reproduzido e visto pelo dev · Repro: <superfície> · <partida> → <trigger> · Próximo: /repro /work <obj> · /card`. Composto, a saída é a do alvo.

## Human Check — parada 2, executada pelo `/work` depois do commit

1. Ambiente **idêntico** ao § 3 (usuário, dados, ponto de partida, superfície), lendo o registro se existir.
2. **Todos** os passos, na ordem, sem atalho; parar **um passo antes do trigger** — visível e pronto, não disparado (API: requisição montada, não enviada). Evidência do estado pré-trigger.
3. Texto gerado por IA? O que o dev julga é a **saída**: transcreva-a inteira (ou diga o que ler ao clicar) — nunca resuma.
4. Publique `## ✅ Human check — sua vez` (passos executados · onde está · **👉 Clique em / Execute** · comportamento esperado agora · evidência) e **PARE COMPLETAMENTE** até "ok". Confirmou → `phase: human-check`; quem chamou segue.

## PARE se pensar
"verifiquei no código, não preciso reproduzir" · "é API/mobile, leio o código" · "a reprodução é parecida com o card" · "em `finish` pulo a validação humana" · "mostro o resultado sem o dev clicar" · "pulo direto pra URL final" · "problema fora do card, ignoro"
