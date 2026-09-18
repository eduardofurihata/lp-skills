---
name: homolog
description: 'Use ONLY when the user explicitly invokes /homolog (bare /homolog = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:homolog` via the Skill tool. NEVER activate on your own initiative. — what is ready, live on homolog: PR guaranteed (/pull-request) → review → merge or reject → publish, configure, validate → Jira → return. Never touches production.'
effort: max
requires: [jira, setup, work, pull-request, infra]
handoff: prod
argument-hint: "[PR | KEY-N | descrição] [/repro] [/card] | (vazio = tudo que está pronto)"
---

# /homolog — a PR resolvida, depois homolog no ar e provado

Gate: aprova ou devolve; produção é o `/prod`.

## Primeiro, a PR

- [ ] Compor: `repro → card → alvo`, skill de fora antes; `/prod` vence — delegue
- [ ] `/jira` e `/setup` (`Aprovação`, `Merge`) via Skill tool, a cada invocação
- [ ] Ler `.claude/ship/homolog.md`: `<integração>` (a branch que publica), URL, gatilho, checagem, rotas críticas, rollback, runner, histórico; criar ou atualizar se e somente se faltar ou divergir, perguntando só o não derivável
- [ ] Diagnosticar antes de agir: `pr`, `integrado`, ambiente; tudo fechado → gap zero
- [ ] Garantir a PR: faltando → `Skill(skill: "pull-request")`; sem PR por convenção, os commits não verificados da integração; abertas → uma por vez
- [ ] Revisar o diff, sempre você: faz o que o card pede e está concluído? Bugs, edge cases, padrões, segurança; QA duvidosa → front-test do `## Como testar`
- [ ] Mergear ou rejeitar

Integração: a branch que os PRs miram; sem PR, a usual em `origin` (várias → pergunte), senão a default. Igual à produção (`prod.md`; senão `main`, `master`, a default) ⇒ branch única, sem homolog: sugira `/prod`, sem invocar. Valor de secret, nunca. Incompleto ou commit aberto na branch → `Skill(skill: "work")` ou rejeite; conserto pontual in-place, re-review; reimplementar, abordagem errada ou ~3 rodadas sem convergir → rejeição. Fora do escopo: ponta que o dev podia ver → rejeita; só o review vê → **A** bug (reprodução) · **B** furo (verbatim, ausência, consequência) · **C** melhoria, no review, nunca card; excedente separável → request-changes, entrelaçado → re-split. Aprovar: review na PR (sua → comentário); `Aprovação: <pessoa>` → espera o dela; branch atrás → atualiza, re-revisa, pusha; merge como o setup manda, branch apagada, `/jira` § Sincronizar (**integrado**). Rejeitar: request-changes (o quê, por quê, o que muda), `/jira` § Sincronizar (**devolvido ao dev**).

## Só então, homolog no ar

- [ ] Publicar: push na `<integração>` dispara o workflow; esperar o run verde
- [ ] Configurar: migrations (após o código no ar), env, secrets, flags e seeds do `## DevOps` das PRs
- [ ] Validar em live: responde, commit publicado no ar, rotas críticas sem erro
- [ ] Sincronizar `/jira`, **no ar em homolog**, em cada card que subiu — só depois de validado
- [ ] Atualizar `homolog.md`; devolver estágios, PRs, run, validação, cards, achados; próximo: `/prod`

Run vermelho seu: conserte e redeploye, teto ~3; fila, runner offline, nenhum run: reporte, não contorne. Secret: pedido, nunca inventado; onde vive e o backup → `Skill(skill: "infra")`. Falhou: gap, volta ao passo dono, o card não muda; passo aberto devolve o que ficou e por quê.
