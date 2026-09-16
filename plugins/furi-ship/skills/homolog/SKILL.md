---
name: homolog
description: 'Use ONLY when the user explicitly invokes /homolog (bare /homolog = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:homolog` via the Skill tool. NEVER activate on your own initiative. — what is ready, live on homolog: PR guaranteed (/pull-request) → QA gate → review → merge or reject → /deploy homolog → Jira → return. Never touches production.'
effort: max
requires: [jira, setup, pull-request, deploy]
handoff: prod
argument-hint: "[PR | KEY-N | descrição] [/repro] [/card] | (vazio = tudo que está pronto)"
---

# /homolog — descobrir, garantir a PR, gate de QA, revisar, mergear ou rejeitar, publicar, devolver

O terceiro **alvo**: o trabalho no ar em homolog. É um **gate, não uma esteira**; `<produção>` é o `/prod`. **Arquivo da skill: `.claude/ship/homolog.md`** — lido no início, criado na primeira vez, atualizado a cada ciclo: último deploy validado, cards no ar desde então, pendências. Sete passos:

1. **Descobrir.** Composição primeiro (`repro → card → alvo`; modificador e skill de fora rodam antes; `/prod` vence — delegue). `/jira` e `/setup` (`Aprovação`, `Merge`) via **Skill tool, a cada invocação**; `<integração>` e o ambiente no `deploy.md § Ambientes` (não existe → `Skill(skill: "deploy", args: "mapa")`). Sem homolog (branch única) → sugira `/prod`, sem invocar. Diagnóstico antes de agir: `pr`, `integrado`, ambiente (run verde, configurado, validado); tudo fechado → gap zero.
2. **Garantir a PR.** Faltando → `Skill(skill: "pull-request")`. Sem PR por convenção → revise os commits não verificados da integração. PRs abertas → **uma por vez**.
3. **Gate de QA.** Cards = título, `## Cards` e commits. Artefato em `obra/12-done/` com QA 100% → só review; QA ausente ou falha → review com front-test do `## Como testar`; artefato em `obra/07-todo/` → feche o commit na branch da PR (`Skill(skill: "work")`) ou rejeite; sem card → mesmo gate, sem Jira; ledger `ABERTO` → rejeite.
4. **Revisar — o diff, sempre você.** Bugs, edge cases, padrões do projeto, segurança, "faz o que o card pede". Conserto pontual in-place com re-review; reimplementar, abordagem errada ou ~3 rodadas sem convergir → rejeição. Achado fora do escopo: ponta que o dev podia ver → rejeita; só o review vê → **A** bug (reprodução) · **B** furo (frase verbatim + ausência + consequência) · **C** melhoria — registrado em `obra/09-code-review/`, **nunca card**. Excedente separável → sai por request-changes; entrelaçado → re-split.
5. **Mergear — ou rejeitar.** Aprovar registra o review na PR (PR sua → comentário); `Aprovação: <pessoa>` → espera o aprovado dela. Branch atrás → atualiza, re-revisa, pusha. Merge pela estratégia do setup; branch apagada remota e local; `/jira` § Sincronizar (**integrado**); `obra/13-ship/` commitado com paths explícitos. Rejeitar: request-changes com o quê, por quê, o que muda; `/jira` § Sincronizar (**devolvido ao dev**); artefato → `obra/08-implementation/`, rework.
6. **Publicar, configurar, validar — e só então o Jira.** `Skill(skill: "deploy", args: "homolog")`; validado → `/jira` § Sincronizar, **no ar em homolog**, em cada card que subiu. Passo aberto volta com o motivo; o card não muda.
7. **Devolver.** Estágios, PRs, run, validação, cards, achados; próximo: `/prod`.
