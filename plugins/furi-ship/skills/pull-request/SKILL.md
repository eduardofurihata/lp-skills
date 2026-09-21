---
name: pull-request
description: 'Use ONLY when the user explicitly invokes /pull-request (bare /pull-request = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:pull-request` via the Skill tool. NEVER activate on your own initiative. — publishes the work: commit guaranteed (/work) → push → PR opened or updated against the integration branch → every Jira card mirrored → return. Never merges.'
effort: max
requires: [work]
handoff: homolog
boundary: prod
argument-hint: "[KEY-N | descrição] [/skill…] | (vazio = a branch atual)"
---

# /pull-request — o commit garantido, publicado, a PR aberta ou atualizada

O alvo: a branch em `origin` com a PR aberta ou atualizada na integração — ou só o push, se o time não abre PR. Não mergeia nem deploya. Com outras skills no argumento: entenda o que cada uma pede e execute tudo combinado, numa passada só — nunca uma antes ou depois da outra. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Ler `.claude/ship/setup.md § Pull-request`: abre PR, template, aprovação, merge, status da etapa — e a `<integração>` do § Homolog; falta → pergunte e grave ali
- [ ] Diagnosticar antes de agir: `commit`, `push` (HEAD igual ao remoto), `pr` (uma aberta com todas as keys); tudo fechado → gap zero
- [ ] Garantir o commit: aberto, árvore suja ou integração que andou → `Skill(skill: "work")`; remoto da branch à frente → traga antes
- [ ] Publicar: push sempre, mesmo com `Abre PR: não`
- [ ] Abrir ou atualizar a PR, só com `Abre PR: sim`: keys dos commits no título; corpo no template — `## O que foi feito` (leigo) · `## Cards` · `## Summary` · `## Solução` · `## Como testar` · `## DevOps`; já aberta → regenerar e comentar o que entrou, nunca uma segunda
- [ ] Mover cada card dos commits para o status da etapa e comentar o `## O que foi feito` com o link da PR; sem Jira, no-op
- [ ] Retornar PR (URL, base) ou "publicado sem PR", branch e cards; próximo: `/homolog` (ou `/prod`, em branch única)

Vazio na própria integração com `Abre PR: sim` → pare: é `/homolog` ou `/prod`. Nunca commit avulso, conflito sem re-teste ou force.
