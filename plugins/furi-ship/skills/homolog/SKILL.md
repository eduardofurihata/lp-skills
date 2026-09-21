---
name: homolog
description: 'Use ONLY when the user explicitly invokes /homolog (bare /homolog = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:homolog` via the Skill tool. NEVER activate on your own initiative. — homolog live with what shipped: /pull-request guaranteed → PR approved (reviewed and fixed if you are not the author) and merged → environment configured from the infra map → checked live → Jira card → return. Never touches production.'
effort: max
requires: [work, pull-request, infra]
handoff: prod
argument-hint: "[PR | KEY-N | descrição] [/skill…] | (vazio = tudo pronto)"
---

# /homolog — a PR aprovada, homolog configurado e no ar

Aprova e põe no ar; produção é o `/prod`. Com outras skills no argumento: entenda o que cada uma pede e execute tudo combinado, numa passada só — nunca uma antes ou depois da outra. Sem card: o mesmo processo, sem Jira e sem criar card. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Ler `.claude/ship/setup.md § Homolog`: tem homolog? tem processo de PR? status da etapa; falta → pergunte e grave ali
- [ ] Parar se não tem homolog: nada a fazer — diga e retorne
- [ ] Ler `.claude/ship/infra.md`, o ambiente de homolog: branch que publica, URL, gatilho e run, como configurar, como checar, rollback; falta → `Skill(skill: "infra")`
- [ ] Garantir o `/pull-request` completo: sem PR ou push → `Skill(skill: "pull-request")`
- [ ] Aprovar a PR, se há processo de PR: PR sua → só mergear; PR de outro → revisar (o card faz sentido e o código o atende? bugs, edge cases, padrões, segurança), corrigir as pendências na branch da PR e commitar, aprovar, mergear
- [ ] Fazer todas as configs do ambiente de homolog, pelo mapa do infra: migrations (depois do código), env, secrets, flags, seeds
- [ ] Checar se realmente está no ar o que subimos: responde, commit no ar, rotas críticas sem erro
- [ ] Atualizar o status do card Jira para o da etapa, se houver card
- [ ] Retornar o resultado: PR, run, checagem, cards; próximo: `/prod`

Run vermelho seu: conserte, teto ~3; fila ou runner offline: reporte. Secret: pedido, nunca inventado.
