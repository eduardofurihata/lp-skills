---
name: homolog
description: 'Use ONLY when the user explicitly invokes /homolog (bare /homolog = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:homolog` via the Skill tool. NEVER activate on your own initiative. — what is ready, live on homolog: PR guaranteed (/pull-request) → review the diff → merge or reject → /deploy homolog → Jira → return. Never touches production.'
effort: max
requires: [jira, setup, pull-request, deploy]
handoff: prod
argument-hint: "[PR | KEY-N | descrição] [/repro] [/card] | (vazio = tudo que está pronto)"
---

# /homolog — descobrir, garantir a PR, revisar, mergear ou rejeitar, publicar, devolver

O terceiro **alvo**: o trabalho no ar em homolog. É um **gate**: aprova ou devolve; `<produção>` é o `/prod`. **Arquivo da skill: `.claude/ship/homolog.md`** — lido no início, criado na primeira vez, atualizado a cada ciclo: último deploy validado, cards no ar desde então, pendências. Seis passos:

1. **Descobrir.** Composição primeiro (`repro → card → alvo`; modificador e skill de fora rodam antes; `/prod` vence — delegue). `/jira` e `/setup` (`Aprovação`, `Merge`) via **Skill tool, a cada invocação**; `<integração>` e o ambiente no `deploy.md § Ambientes` (não existe → `Skill(skill: "deploy", args: "mapa")`). Sem homolog (branch única) → sugira `/prod`, sem invocar. Diagnóstico antes de agir: `pr`, `integrado`, ambiente (run verde, configurado, validado); tudo fechado → gap zero.
2. **Garantir a PR.** Faltando → `Skill(skill: "pull-request")`. Sem PR por convenção → revise os commits não verificados da integração. PRs abertas → **uma por vez**.
3. **Revisar — o diff, sempre você: faz o que o card pede e está concluído?** Cards = título, `## Cards` e commits; sem card → mesmo crivo, sem Jira. Bugs, edge cases, padrões do projeto, segurança; QA duvidosa → front-test do `## Como testar`. Incompleto ou commit aberto na branch da PR → `Skill(skill: "work")` ou rejeite. Conserto pontual in-place com re-review; reimplementar, abordagem errada ou ~3 rodadas sem convergir → rejeição. Achado fora do escopo: ponta que o dev podia ver → rejeita; só o review vê → **A** bug (reprodução) · **B** furo (frase verbatim + ausência + consequência) · **C** melhoria — registrado no review da PR, **nunca card**. Excedente separável → sai por request-changes; entrelaçado → re-split.
4. **Mergear — ou rejeitar.** Aprovar registra o review na PR (PR sua → comentário); `Aprovação: <pessoa>` → espera o aprovado dela. Branch atrás → atualiza, re-revisa, pusha. Merge pela estratégia do setup; branch apagada remota e local; `/jira` § Sincronizar (**integrado**). Rejeitar: request-changes com o quê, por quê, o que muda; `/jira` § Sincronizar (**devolvido ao dev**); volta ao dev para rework.
5. **Publicar, configurar, validar — e só então o Jira.** `Skill(skill: "deploy", args: "homolog")`; validado → `/jira` § Sincronizar, **no ar em homolog**, em cada card que subiu. Passo aberto volta com o motivo; o card não muda.
6. **Devolver.** Estágios, PRs, run, validação, cards, achados; próximo: `/prod`.
