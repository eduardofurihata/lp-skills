---
name: pull-request
description: 'Use ONLY when the user explicitly invokes /pull-request (bare /pull-request = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:pull-request` via the Skill tool. NEVER activate on your own initiative. — the order of publishing the work: discover → make sure the commit is closed (/work) → push → open or update the PR against the detected integration branch → mirror on every Jira card → return. Never merges.'
effort: max
requires: [work]
handoff: homolog
boundary: prod
argument-hint: "[KEY-N | descrição] [/skill…] | (vazio = a branch atual)"
---

# /pull-request — descobrir, garantir o commit, publicar, abrir ou atualizar a PR, espelhar, devolver

O segundo **alvo**: a branch em `origin` com a PR aberta ou atualizada na integração — ou só o push, quando o time não abre PR. Não mergeia, não deploya. Lê `.claude/ship/setup.md`; a seção **§ Pull-request** é sua: abre PR, template, aprovação, merge, status da etapa — falta → infira das PRs mergeadas, pergunte só o não derivável, grave. Seis passos, cada um provado antes do seguinte:

1. **Descobrir.** Com outras skills no argumento: entenda o que cada uma pede e execute tudo combinado, numa passada só — nunca uma antes ou depois da outra. § Pull-request (`Abre PR`, `Template`); base = `<integração>` do § Homolog (não existe → a branch que os PRs miram; sem PR, a usual em `origin`, várias → pergunte), nunca `main` só por ser a default. Objetivo: vazio = a branch atual; key ou descrição = esse trabalho. Vazio na própria integração com `Abre PR: sim` → pare: é `/homolog` ou `/prod`. Diagnóstico antes de agir: `commit`, `push` (HEAD igual ao remoto), `pr` (uma PR aberta cobrindo todas as keys dos commits); tudo fechado → gap zero.
2. **Garantir o commit — só se publica o que passou.** Commit aberto, árvore suja ou integração que andou → `Skill(skill: "work")`; nunca commit avulso, conflito sem re-teste ou force. Remoto da branch à frente → traga antes.
3. **Publicar.** Push sempre, inclusive com `Abre PR: não`.
4. **Abrir ou atualizar a PR — como o time escolheu.** Só com `Abre PR: sim`. Cards vêm dos **commits**, nunca do nome da branch; nenhum → publicação sem card, dita. Título com todas as keys; corpo em três camadas, no template do § Pull-request se houver: `## O que foi feito` (leigo, antes/depois — o **mesmo** texto vai ao Jira) · `## Cards` · `## Summary` e `## Solução` · `## Como testar` · `## DevOps` (migrations, env, deps — o que a configuração do ambiente consome). PR já aberta → título e descrição regenerados e um comentário com o que entrou; nunca uma segunda PR.
5. **Espelhar — em cada card dos commits.** Mover o card para o status da etapa (§ Pull-request) e comentar o `## O que foi feito` com o link da PR; PR atualizada → só nos cards que ainda não têm o comentário. Sem Jira, no-op.
6. **Devolver.** PR (URL, base) ou "publicado sem PR", branch e cards, Jira; próximo: `/homolog` (ou `/prod`, em branch única).
