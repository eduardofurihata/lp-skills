---
name: repro
description: 'Use ONLY when the user explicitly invokes /repro (bare /repro = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:repro` via the Skill tool. NEVER activate on your own initiative. — reproduces the report on the front as the user, judged ≥ 90; the dev sees the bug, and the fix BEFORE the commit.'
effort: max
argument-hint: "[KEY-N | descrição] [/skill…] | (vazio = card ativo)"
---

# /repro — reproduzir, julgar, mostrar

Reproduz o bug no front, como o usuário, antes do código; o dev o vê com o bug (parada 1) e sem (parada 2). Não coda. Com outras skills no argumento: entenda o que cada uma pede e execute tudo combinado, numa passada só — nunca uma antes ou depois da outra; quem codar deve a parada 2. Sem card: o mesmo processo, sem Jira e sem criar card. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Ler `.claude/ship/setup.md § Repro`: superfícies, usuários e dados de teste; branch no § Work; falta → pergunte e grave ali
- [ ] Ler o card e anexos, ou a descrição; mover o card ao status da etapa `/work`
- [ ] Entender o problema: quem, onde, o que faz, vê e esperava, causa provável; ambiguidade → pergunte
- [ ] Julgar o entendimento num subagente limpo (relato verbatim + entendimento → 0–100); ≥ 90 avança, senão de novo, sem limite
- [ ] Reproduzir no front como o usuário: browser automatizado (mobile: emulador), cenário exato, evidência por passo; não reproduziu → pergunte; registrar usuário, dados, partida, passos, trigger
- [ ] Julgar a reprodução noutro subagente (relato + registro + evidência → "é o problema?", 0–100); ≥ 90 avança, senão de novo
- [ ] Parar um passo antes do trigger e mostrar: "👉 Clique em / Execute: [elemento exato]", o que vai acontecer, a evidência; esperar o "vi"
- [ ] Devolver a descrição oficial: superfície · usuário e dados · partida → passos → trigger · atual vs esperado · evidência · causa

Parada 2, de quem fecha o commit, antes dele: reproduzir, ambiente idêntico, trigger disparado — o bug não aparece, com evidência; apareceu → sem commit; parada 1 de novo, `## ✅ Human check — sua vez`; pare até o dev confirmar.
