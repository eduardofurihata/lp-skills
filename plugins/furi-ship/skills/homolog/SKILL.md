---
name: homolog
description: 'Use ONLY when the user explicitly invokes /homolog (bare /homolog = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:homolog` via the Skill tool. NEVER activate on your own initiative. — PR reviewed and merged, homolog live and proven. Never touches production.'
effort: max
requires: [work, pull-request, infra]
handoff: prod
argument-hint: "[PR | KEY-N | descrição] [/skill…] | (vazio = tudo pronto)"
---

# /homolog — a PR resolvida, homolog no ar e provado

Aprova ou devolve; produção é o `/prod`. Com outras skills no argumento: entenda o que cada uma pede e execute tudo combinado, numa passada só — nunca uma antes ou depois da outra. Sem card: o mesmo processo, sem Jira e sem criar card. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Ler `.claude/ship/setup.md § Homolog`: `<integração>`, URL, gatilho, checagem, rotas críticas, rollback, runner, histórico, status da etapa; aprovação e merge no § Pull-request; falta → pergunte e grave ali
- [ ] Diagnosticar: `pr`, `integrado`, ambiente
- [ ] Garantir a PR: faltando → `Skill(skill: "pull-request")`; abertas → uma por vez
- [ ] Revisar o diff, sempre você: faz o que o card ou o prompt pede? Bugs, edge cases, padrões, segurança
- [ ] Mergear (como o § Pull-request manda, branch apagada, comentário no card) ou rejeitar (request-changes: o quê, por quê, o que muda; card volta ao status de `/work`)
- [ ] Publicar: push na `<integração>`, run verde
- [ ] Configurar: migrations (depois do código), env, secrets, flags, seeds do `## DevOps`
- [ ] Validar em live: responde, commit no ar, rotas críticas sem erro
- [ ] Mover cada card que subiu para o status da etapa — só depois de validado
- [ ] Atualizar § Homolog e retornar PRs, run, validação, cards, achados; próximo: `/prod`

Integração igual à produção (§ Prod) ⇒ branch única: `/prod`. Incompleto → `Skill(skill: "work")` ou rejeite; ~3 rodadas → rejeição. Fora do escopo → no review, nunca card. Run vermelho seu: conserte, teto ~3; fila ou runner offline: reporte. Secret: pedido, nunca inventado → `Skill(skill: "infra")`. Falhou: volta ao passo dono.
