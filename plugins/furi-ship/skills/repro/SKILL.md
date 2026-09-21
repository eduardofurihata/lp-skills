---
name: repro
description: 'Use ONLY when the user explicitly invokes /repro (bare /repro = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:repro` via the Skill tool. NEVER activate on your own initiative. — reproduces the report on the front as the user, judged ≥ 90; the dev sees the bug and the fix BEFORE the commit.'
effort: max
argument-hint: "[KEY-N | descrição] [/skill…] | (vazio = card ativo)"
---

# /repro — reproduzir, julgar, mostrar

Reproduz o bug no front como o usuário, antes de codar; o dev o vê com o bug (parada 1) e sem (parada 2). Não coda. Com outras skills no argumento: entenda o que cada uma pede e execute tudo combinado, numa passada só — nunca uma antes ou depois da outra; quem codar deve a parada 2. Sem card: o mesmo processo, sem Jira e sem criar card. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Ler `.claude/ship/infra.md`: o ambiente e onde vivem usuários e dados de teste (`.secrets/`, não no setup); falta → `Skill(skill: "infra")`
- [ ] Ler o card e anexos, ou a descrição; mover o card ao status de `/work`
- [ ] Entender o problema: quem, onde, o que faz, vê e esperava, causa; ambiguidade → pergunte
- [ ] Julgar o entendimento num subagente limpo (relato verbatim + entendimento → 0–100); ≥ 90 avança, senão de novo, sem limite
- [ ] Reproduzir no front como usuário: browser automatizado, cenário exato, evidência por passo; não reproduziu → outro caminho, em loop até reproduzir — "não consegui" não existe; registrar usuário, dados, passos, trigger
- [ ] Julgar a reprodução noutro subagente (relato + registro + evidência → 0–100); ≥ 90 avança, senão de novo
- [ ] Parar um passo antes do trigger e mostrar: "👉 Clique em: [elemento exato]", o que vai acontecer, a evidência; esperar o dev
- [ ] Devolver a descrição oficial: superfície · usuário e dados · partida → passos → trigger · atual × esperado · evidência · causa

Parada 2, de quem fecha o commit, antes dele: reproduzir, mesmo ambiente, trigger disparado: o bug não aparece, com evidência; apareceu → sem commit; parada 1 de novo, `## ✅ Human check`; pare até o dev confirmar.
