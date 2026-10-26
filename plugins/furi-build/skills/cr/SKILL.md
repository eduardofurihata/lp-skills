---
name: cr
description: 'Use when the user invokes /cr (bare /cr = what was done in this conversation) — code review in a new agent, scored 0 to 100.'
argument-hint: "[o que revisar]"
disable-model-invocation: true
---

# /cr — code review com nota

- Abrir um agente novo (Agent tool, sem fork) com o prompt, literal: “code review e dar nota de 0 a 100 o que foi feito.” — com argumento, ele vai depois, como o escopo
- Não usar a skill /code-review, nem você nem o agente
- Devolver o review e a nota do agente, sem mudar nada no código
