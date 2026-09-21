---
name: prod
description: 'Use ONLY when the user explicitly invokes /prod (bare /prod = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:prod` via the Skill tool. NEVER activate on your own initiative. — /homolog guaranteed → homolog promoted to production (PR or merge and push) → configured from the infra map → checked live → Jira card. Single owner of production.'
effort: max
requires: [homolog, infra]
boundary: sync
argument-hint: "[PR | KEY-N | descrição] [/skill…] | (vazio = tudo pronto)"
---

# /prod — homolog promovido, produção configurada e no ar

Quem digita `/prod` autoriza o release — promover não pergunta. Com outras skills no argumento: entenda o que cada uma pede e execute tudo combinado, numa passada só — nunca uma antes ou depois da outra. Sem card: o mesmo processo, sem Jira e sem criar card. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Ler `.claude/ship/setup.md § Prod`: tem processo de PR para produção? status da etapa — e no § Homolog, tem homolog?; falta → pergunte e grave ali
- [ ] Ler `.claude/ship/infra.md`, o ambiente de prod: branch que publica, URL, gatilho e run, como configurar, como checar, rollback; falta → `Skill(skill: "infra")`
- [ ] Garantir o `/homolog` completo: `Skill(skill: "homolog")`; sem homolog, vai a branch de trabalho
- [ ] Trazer homolog para produção: com processo de PR → abrir ou atualizar a PR para produção, aprovar (revisar só se você não for o autor) e mergear; sem PR → merge e push
- [ ] Fazer todas as configs do ambiente de prod, pelo mapa do infra: migrations (depois do código), env, secrets, flags, seeds
- [ ] Checar se realmente está no ar o que subimos: responde, commit no ar, rotas críticas sem erro
- [ ] Atualizar o status do card Jira para o da etapa, se houver card
- [ ] Retornar promoção (PR ou push), run, checagem, cards

Conflito ao promover: entendendo os dois lados, nunca force; mudou código → re-review. Hotfix direto em produção → merge de volta em homolog. Run vermelho seu: conserte, teto ~3; fila ou runner offline: reporte. Rollback oferecido, nunca automático. Secret: pedido, nunca inventado.
