---
name: pull-request
description: 'Use ONLY when the user explicitly invokes /pull-request (bare /pull-request = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:pull-request` via the Skill tool. NEVER activate on your own initiative. — pushes the branch and opens or updates the pull request against the detected integration branch, as the team setup dictates: a missing commit is closed by /work first; 3-layer body, cards from the commits, each card commented and moved on the Jira board. Never merges.'
effort: max
requires: [jira, setup, infra, work]
handoff: homolog
boundary: prod
argument-hint: "[KEY-N | descrição] [/repro] [/card] | (vazio = a branch atual)"
---

# /pull-request — o trabalho publicado: push e PR, conforme o setup

O segundo **alvo** da entrega: o estado pedido é **a branch em `origin` com o PR aberto ou atualizado na integração** — ou só o push, quando o time não abre PR. Estágios `push` → `pr`, depois dos do `/work`. Termina em `pr` (ou `push`): **não mergeia, não deploya**.

## Os guarda-chuvas

- **Descobrir, nunca assumir.** Board e estrutura vêm do `/jira`; `Abre PR`, `Template` e a posição da key vêm do `/setup` — os dois via **Skill tool, a cada invocação**. Base do PR: a `<integração>` de `infra/SKILL.md` § Deploy, nunca `main` por ser a default.
- **Publicar é o objetivo; o PR é a forma que o time escolheu.** `Abre PR: sim` ⇒ push + PR; `não` ⇒ push, e pronto. Idempotente: PR aberto na branch → **título e descrição regenerados e um comentário com o que entrou** (editar o corpo não notifica ninguém), nunca um segundo `create`. Os cards vêm dos **commits**, não do nome da branch: cada um claro no título e no `## Cards`, comentado e movido no board; sem card, publica e diz.
- **Só se publica o que passou.** Árvore suja, integração que andou ou commit faltando é o `/work` que fecha (`Skill(skill: "work")`, antes) — nunca commit avulso, nunca conflito resolvido sem re-teste, nunca `--force`. `origin/<branch>` à frente → merge dela.

## Fluxo

0. **Composição primeiro:** ordem fixa `repro → card → alvo`; modificador e skill de fora rodam antes e saem do argumento; `/homolog` e `/prod` vencem — delegue e não rode; `/work` perde para este. Depois `furi-ship:jira` e `furi-ship:setup` via Skill tool; `<integração>` por `infra/SKILL.md` § Deploy.
1. **Objetivo:** vazio = a branch atual e o que ela carrega · `KEY-N` ou descrição = esse trabalho. Na própria integração com `Abre PR: sim` → PARE: o que se quer é `/homolog` ou `/prod`.
2. **Diagnóstico, publicado antes de agir** — `commit` fechado (os sinais do `/work`; aberto → `Skill(skill: "work", args: "<objetivo>")` e volte); `push` fechado = `git rev-parse HEAD` == `git rev-parse origin/<branch>`; `pr` fechado = `gh pr list --head <branch> --base <integração> --state open` devolve **um** PR com todas as keys dos commits. Tudo fechado → gap zero, dito com a evidência.
3. **Push:** `git push -u origin <branch>` — sempre, inclusive com `Abre PR: não`.
4. **Contexto, não invenção:** keys dos commits — `git log origin/<integração>..HEAD --no-merges --format='%s%n%(trailers:key=Jira,valueonly)' | grep -oE '[A-Z][A-Z0-9]+-[0-9]+' | sort -u` (só subject e trailer); nenhuma → a do nome da branch; nenhuma em lugar algum → publicação sem card, dita. Título de cada card via `jira_get_issue`; `git diff <integração>...<branch>` e os docs de cada card → problema leigo, solução técnica, TCs, impacto de deploy.
5. **PR** (`Abre PR: sim`): `gh pr list --head <branch> --base <integração> --state open -q '.[0]'` → vazio = `gh pr create --base <integração>`; aberto = `gh pr edit <n> --title --body` + `gh pr comment <n>` com o que este ciclo acrescentou. Título: `<tipo>(<KEY>-<N>, <KEY>-<M>): <resumo>` — todas as keys, em ordem, na posição que o `/setup § Commit` manda. Corpo (dentro das seções do `Template:` do setup, se houver): `## O que foi feito` (leigo, antes/depois — o **mesmo** texto vai ao Jira) · `## Cards` (`<KEY>-<N> — <título>`) · `## Summary (técnico)` · `## Solução` · `## Como testar` (`- [ ] TC-n`) · `## DevOps` (migrations · env novas · deps · passos fora do padrão — é o que a configuração do ambiente consome) · trailer `Jira: <keys>`.
6. **Espelhar em cada card:** `/jira` § Sincronizar, etapa **publicado** — rótulo `PR: <URL>` (sem PR: `Publicado em: <branch> @ <hash>`) + `Branch:`; PR atualizado → só nos cards que ainda não têm o comentário. Sem Jira → no-op declarado.
7. **Obra:** `mv obra/12-done/<feature>.md obra/13-ship/` com `pr:` e `status: in-review`.
8. **Report:** PR (URL, base) ou "publicado sem PR" · branch e cards · Jira · obra · próximo: `/homolog` (ou `/prod`, em branch única).

## PARE se pensar
"árvore suja, pusho o que está commitado" · "a integração andou, resolvo o conflito e pusho" · "já tem PR, crio outro" · "`Abre PR: não`, então nem pusho" · "os cards são os do nome da branch" · "push recusado, uso `--force`" · "escrevi só a parte técnica"
