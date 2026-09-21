---
name: prod
description: 'Use ONLY when the user explicitly invokes /prod (bare /prod = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:prod` via the Skill tool. NEVER activate on your own initiative. — /homolog guaranteed → homolog promoted (PR reviewed and fixed, or merge and push) → configured, checked live, Jira card. Single owner of production.'
effort: max
requires: [homolog, infra]
boundary: sync
argument-hint: "[PR | KEY-N | descrição] [/skill…] | (vazio = tudo pronto)"
---

# /prod — homolog promovido, produção no ar

Quem digita `/prod` autoriza o release — promover não pergunta. Com outras skills no argumento: entenda o que cada uma pede e execute tudo combinado, numa passada só — nunca uma antes ou depois da outra. Sem card: o mesmo processo, sem Jira e sem criar card. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Ler `.claude/ship/setup.md § Prod`: tem processo de PR para produção? status da etapa; tem homolog? no § Homolog; falta → pergunte e grave ali
- [ ] Ler `.claude/ship/infra.md`, o ambiente de prod: branch que publica, URL, gatilho e run, como configurar e checar, rollback; falta → `Skill(skill: "infra")`
- [ ] Garantir o `/homolog` completo: `Skill(skill: "homolog")`; sem homolog, vai a branch de trabalho
- [ ] Trazer homolog para produção: sem PR → merge e push, sem revisar; com processo de PR → abrir ou atualizar a PR para produção; PR sua → só mergear; PR de outro → revisar (o card faz sentido e o código o atende? bugs, edge cases, padrões, segurança, regressão), corrigir as pendências na branch e commitar, aprovar, mergear
- [ ] Fazer todas as configs do ambiente de prod, pelo mapa do infra: migrations, env, secrets, flags, seeds
- [ ] Checar se realmente está no ar o que subimos: responde, commit no ar, rotas críticas
- [ ] Atualizar o status do card Jira para o da etapa, se houver card
- [ ] Retornar promoção (PR ou push), run, checagem, cards

Conflito ao promover: entenda os dois lados, nunca force; mudou código → re-review. Hotfix direto em produção → merge de volta em homolog. Run vermelho seu: conserte, teto ~3. Rollback oferecido, nunca automático.
