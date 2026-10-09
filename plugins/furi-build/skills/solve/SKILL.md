---
name: solve
description: 'Use ONLY when the user explicitly invokes /solve (bare /solve = the objective is whatever the conversation is already about), or when another skill invokes `furi-build:solve` via the Skill tool. NEVER activate on your own initiative. — resolve the requested task at world-class level, benchmarking against the leading big pop tech apps in the relevant domain as the quality baseline, aiming to make us the #1 reference in the market. Invokes /principles (the engineering doctrine) and, with a visual surface, /front (the design doctrine) via the Skill tool.'
effort: max
argument-hint: "[o que resolver]"
requires: [principles, front]
---

# /solve — Resolver no nível da referência #1

Mire ser a **referência #1 do mercado**, no calibre dos **big pop tech apps**. Não é MVP: genérico ou mediano é falha, e qualidade vem antes de esforço, tempo ou tokens. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Invocar `furi-build:principles` via Skill tool — chamada real, não de memória
- [ ] Invocar `furi-build:front` via Skill tool sempre que o trabalho tocar uma superfície visual — derivada, nunca declarada
- [ ] Definir a referência: os líderes reconhecidos deste domínio — o que eles fazem é o piso, nunca o teto
- [ ] Procurar com grep o que já cobre a capacidade
- [ ] Reescrever no lugar o que já existe — nunca `-v2`, `-new` ou paralelo "pra limpar depois"; arquivo novo só quando nada cobre
- [ ] Refazer do zero se a base atual não chega ao nível #1
- [ ] Igualar ou superar a referência
- [ ] Pensar os TCs como o usuário final: o caminho feliz, o erro e a borda que ele vive de verdade — cada um coberto por um teste, nunca só pelo olhar
- [ ] Perguntar antes de entregar: "um líder do domínio assinaria isto — e esta tela?" Não → refazer
