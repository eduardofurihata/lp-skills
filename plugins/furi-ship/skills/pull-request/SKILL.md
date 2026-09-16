---
name: pull-request
description: 'Use ONLY when the user explicitly invokes /pull-request (bare /pull-request = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:pull-request` via the Skill tool. NEVER activate on your own initiative. — the order of publishing the work: discover → make sure the commit is closed (/work) → push → open or update the PR against the detected integration branch, as the setup dictates → mirror on every Jira card → return. Never merges.'
effort: max
requires: [jira, setup, infra, work]
handoff: homolog
boundary: prod
argument-hint: "[KEY-N | descrição] [/repro] [/card] | (vazio = a branch atual)"
---

# /pull-request — descobrir, garantir o commit, publicar, abrir ou atualizar a PR, espelhar, devolver

O segundo **alvo**: o estado pedido é **a branch em `origin` com a PR aberta ou atualizada na integração** — ou só o push, quando o time não abre PR. Termina aí: não mergeia, não deploya. Seis passos, nesta ordem, cada um provado antes do seguinte:

1. **Descobrir — board, convenções, base, objetivo.** Composição primeiro (`repro → card → alvo`; modificador e skill de fora rodam antes; `/homolog` e `/prod` vencem — delegue; `/work` perde para este). `/jira` e `/setup` (`Abre PR`, `Template`, posição da key) via **Skill tool, a cada invocação**; base da PR = `<integração>` de `infra/SKILL.md` § Deploy, nunca `main` por ser a default. Objetivo: vazio = a branch atual e o que ela carrega; key ou descrição = esse trabalho. Na própria integração com `Abre PR: sim` → pare: o que se quer é `/homolog` ou `/prod`. Diagnóstico publicado antes de agir: `commit`, `push` (HEAD igual ao remoto), `pr` (uma PR aberta da branch cobrindo todas as keys dos commits); tudo fechado → gap zero.
2. **Garantir o commit — só se publica o que passou.** Commit aberto, árvore suja ou integração que andou → `Skill(skill: "work")` fecha e sincroniza; nunca commit avulso, nunca conflito resolvido sem re-teste, nunca force. Remoto da branch à frente (outra máquina, sugestão aceita) → traga antes.
3. **Publicar — a branch em `origin`.** Push sempre, inclusive com `Abre PR: não`: publicar é isto; a PR é o que vem depois, quando o time usa.
4. **Abrir ou atualizar a PR — como o time escolheu.** Só com `Abre PR: sim`. Os cards vêm dos **commits** (subject e trailer), nunca do nome da branch; nenhum → publicação sem card, dita. Título com todas as keys, na posição que o `/setup § Commit` manda; corpo em três camadas, dentro do template do setup se houver: `## O que foi feito` (leigo, antes/depois — o **mesmo** texto vai ao Jira) · `## Cards` (`<KEY>-<N> — <título>`) · `## Summary` e `## Solução` (técnicos) · `## Como testar` · `## DevOps` (migrations, env novas, deps, passos fora do padrão — é o que a configuração do ambiente consome) · trailer com as keys. PR já aberta na branch → título e descrição **regenerados** e um comentário com o que entrou (editar o corpo não notifica ninguém); nunca uma segunda PR.
5. **Espelhar — em cada card dos commits.** `/jira` § Sincronizar, etapa **publicado** (PR ou branch e commit); PR atualizada → só nos cards que ainda não têm o comentário. O artefato sai de `obra/12-done/` para `obra/13-ship/` com a PR e `status: in-review`. Sem Jira, no-op declarado.
6. **Devolver.** PR (URL, base) ou "publicado sem PR", branch e cards, Jira, obra; próximo: `/homolog` (ou `/prod`, em branch única).
