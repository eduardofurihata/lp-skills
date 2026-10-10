---
name: method
description: 'Use ONLY when the user explicitly invokes /method (bare /method = the objective is whatever the conversation is already about), or when another skill invokes `furi-build:method` via the Skill tool. NEVER activate on your own initiative. — rigorous engineering protocol: Step 0, then the decision record via /adr, then /ticrd (Todo, Implementation, Code review, Run test, Done) from the ADR to one commit, living docs in place.'
argument-hint: "[objetivo]"
requires: [solve, adr, ticrd]
---

# /method — Protocolo de Engenharia Rigorosa

/method é a espinha: Step 0 → /adr → /ticrd. Combinado com outra skill, os steps rodam inteiros — ela intercala o que pede, não a substitui nem rebaixa; combinada, é o final dela que vence o do /method. Vontade de pular ou comprimir um step ("o pedido já tem", "é cerimônia") = declarar o plano combinado e ter o sim, não decidir calado — comprimir o ADR nunca é pular story nem use case. Não cria branch/worktree/subagente nem faz push/merge. O Step 0, o Step 1 e cada step T-R da /ticrd invocam /solve (Skill tool real), o do 0 antes de tudo; o Step 1 e cada step T-R da /ticrd fecham publicando o Gateway → próximo: uma linha, barata e obrigatória — ✅ LIBERADO (marca `- [x]` o step no `track/<objetivo>.md`) ou ❌ BLOQUEADO: `<motivo>` (refaz o step). Cada linha é uma ação fechada antes da próxima.

## Step 0 — Start
- Invocar /solve (Skill tool) antes de qualquer leitura, pergunta ou item de outra skill — é a 1ª ação do run
- Rotear cada parte do pedido ao doc dono em `docs/` (novo só sem dono, com motivo, nomeado pela capacidade) e publicar Roteamento
- Declarar o plano combinado quando houver outra skill, no argumento ou como outro /comando no mesmo prompt — o Step 0 roda antes do 1º item dela
- Criar `track/<objetivo>.md`: `- [ ] Step 0`, `- [ ] Step 1 — ADR`, `- [ ] Step 2 — TICRD` com `- [ ] T`, `- [ ] I`, `- [ ] C`, `- [ ] R`, `- [ ] D`; sob o Step 1 e sob T-R, `- [ ] /solve` e `- [ ] Gateway`
- Retomar do primeiro `- [ ]`, se o `<objetivo>.md` já existe em `track/` — caindo entre T e D, é o Step 2

## Step 1 — ADR
- Invocar /adr (Skill tool) com o objetivo e o Roteamento → `docs/adr/NNNN-<slug>.md`: problema, user stories, use cases, spec, design e test cases
- O Gateway confere as 6 seções: problema em 1 frase (≤150) e contexto (≤300), sem solução; cada story com UC; cada UC e decisão da spec com TC; até 10 TCs
- BLOQUEADO → corrigir o mesmo arquivo; ainda não é decisão

## Step 2 — TICRD
- Invocar /ticrd (Skill tool) com o caminho do ADR e o do `track/<objetivo>.md` — Todo, Implementation, Code review, Run test e Done, do ADR ao commit
- Encerrar com o que foi feito — hash e placar que a /ticrd devolveu —, sem pendência; sozinho, sem próximo passo nem sugestão; combinado, o final da skill-alvo vence
