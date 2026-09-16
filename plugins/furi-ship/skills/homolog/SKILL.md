---
name: homolog
description: 'Use ONLY when the user explicitly invokes /homolog (bare /homolog = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:homolog` via the Skill tool. NEVER activate on your own initiative. — gets everything that is ready live and verified on homolog: resolves the PR (review, QA gate, approve and merge — or reject), then /deploy proves the environment. Never touches production.'
effort: max
requires: [jira, setup, infra, pull-request, deploy]
handoff: prod
argument-hint: "[PR | KEY-N | descrição] [/repro] [/card] | (vazio = tudo que está pronto)"
---

# /homolog — o que está pronto, no ar em homolog e verificado

O terceiro **alvo**: o estado pedido é **o trabalho no ar em homolog, funcionando** — `integrado` → `publicado` → `configurado` → `verificado`, depois dos estágios do `/pull-request`. `<produção>` é o `/prod`.

## Os guarda-chuvas

- **Descobrir, nunca assumir.** `/jira` (board, estrutura) e `/setup` (`Abre PR`, `Aprovação`, `Merge`) via **Skill tool, a cada invocação**; `<integração>` e o ambiente de `infra/SKILL.md` § Deploy — `dev` → homolog é só o padrão; o uso decide, não o nome. Sem homolog (branch única: commit → push → `main` → prod) esta skill não trabalha: sugira `/prod`, sem invocar.
- **Isto é um GATE, não uma esteira.** Review do diff sempre teu; PR inaceitável é **rejeitado e devolvido**. Conserto pontual é in-place com re-review; "consertar" que vira reimplementar é rejeição. Achado fora do escopo é provado e registrado — nunca card.
- **Cada estágio tem a sua prova.** Mergeado é só `integrado`; "no ar" é o que o `/deploy` prova. Estágio de trás aberto é o `/pull-request` que fecha, nunca "rode antes".

## Fluxo

0. **Composição primeiro:** `repro → card → alvo`; modificador e skill de fora rodam antes; `/prod` vence — delegue; `/work` e `/pull-request` perdem. Depois `furi-ship:jira`, `furi-ship:setup` via Skill tool; `infra/SKILL.md` § Deploy. Objetivo: vazio = tudo que está pronto · `PR`/`KEY-N` = preferência de ordem.
1. **Diagnóstico, publicado antes de agir** — `pr` (sinais do `/pull-request`; aberto → `Skill(skill: "pull-request")`); `integrado` = PR `MERGED` e branch apagada; ambiente = run verde cobrindo o HEAD de `origin/<integração>`, nada pendente, smoke verde após o último deploy. Tudo fechado → gap zero.
2. **Resolver a PR** (`gh pr list --base <integração> --state open`, uma por vez):
   - **Gate de QA:** keys do título, `## Cards` e commits. artefato em `obra/12-done` + `10-run-test` 100% PASSED → só review; QA ausente/ambígua/falha → review + front-test (Playwright, `## Como testar` de cada card); artefato em `07-todo` → `git checkout <branch>` + `Skill(skill: "work", args: "<KEY>")` e push, ou rejeita; sem card → pergunte; ledger com `ABERTO` → rejeita.
   - **Review** (`gh pr diff`, arquivo a arquivo): bugs, edge cases, `.claude/patterns.md`, segurança, performance, código morto, "faz o que o card pede". Rejeita: abordagem errada, não faz o que o card pede, ~3 rodadas sem convergir.
   - **Achado fora do escopo:** ponta que o dev podia ver → rejeita. Só o review vê → **A** bug (prova: reprodução) · **B** furo (frase **verbatim** de doc/UC/setup + grep + consequência material) · **C** melhoria (opinião, só relatório); intencional documentado não é achado. Registre em `obra/09-code-review/<feature>.md` § Achados. **Excedente** (o card não pediu): separável → sai por request-changes, registrado; entrelaçado → re-split; mexer no arquivo que a mudança toca não é excedente.
   - **Aprovar e mergear:** `gh pr review <n> --approve` (PR seu → `gh pr comment`); `Aprovação: <pessoa>` → espera o `APPROVED`. Atrás/conflitante → merge de `origin/<integração>` na branch, re-review, push. `gh pr merge <n> --<Merge do setup> --delete-branch`; `git checkout <integração> && git pull --ff-only && git branch -d <branch> && git fetch --prune` (`-d` recusou → PARE). Depois: `/jira` § Sincronizar (**integrado**); `obra/13-ship/<feature>.md` (`merged`, `merge_commit`), commit e push com **paths explícitos**.
   - **Rejeitar:** `gh pr review <n> --request-changes --body "<o quê, por quê, o que muda>"`; nada mergeado nem apagado; `/jira` § Sincronizar (**devolvido ao dev**); artefato → `obra/08-implementation/`, `status: rework`. Sem PR (`Abre PR: não`) → revise os commits não verificados da integração.
3. **Publicar, configurar, validar, Jira:** `Skill(skill: "deploy", args: "homolog")` — run verde, infra configurada, atualização validada em live, card em **no ar em homolog**. Estágio aberto volta com o motivo; o alvo **não** é declarado atingido.
4. **Report:** estágios (antes × agora) · PRs (mergeado/rejeitado) · run · config · smoke (URL, N/N) · cards · achados (nenhum card criado — abra com `/card`) · próximo: `/prod`.

## PARE se pensar
"mergeei, acabou" · "fix pequeno no review, não re-testo" · "o dev deixou follow-up aberto, mas abro card e mergeio" · "já que está verificado, jogo pra produção"
