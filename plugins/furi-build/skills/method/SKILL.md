---
name: method
description: 'Use ONLY when the user explicitly invokes /method (bare /method = the objective is whatever the conversation is already about), or when another skill invokes `furi-build:method` via the Skill tool. NEVER activate on your own initiative. — the binding doctrine: invokes /solve, /principles, /front (with a visual surface) and /qa via the Skill tool and holds every line of them, and of itself, as mandatory; closes with one ✅/❌ check of every criterion; no tracking file, never commits nor branches.'
argument-hint: "[objetivo]"
requires: [solve, principles, front, qa]
---

# /method — Doutrina obrigatória

/method é doutrina, não sugestão: cada linha deste arquivo e das skills que ele invoca vale inteira — nenhuma se pula, se comprime ou se cumpre de memória. Vontade de pular ("o pedido já tem", "é cerimônia") = dizer qual e por quê e ter o sim, não decidir calado. Combinado com outra skill, a dela vale junto, sem rebaixar esta; o final dela vence o do /method. Invocar é chamada real pela Skill tool; mencionar não é invocar. Não cria branch/worktree, não commita, não faz push/merge.

- /solve invocado de fato — ele lê o alvo e nomeia a referência
- /principles invocado de fato, pelo /solve ou aqui
- /front invocado de fato se o alvo toca o que o usuário do produto vê — na dúvida, invocar
- Cada linha delas vale contra o alvo: na resposta, no plano e no código
- Todo código que mudou passa pelo /qa, invocado de fato — pelo /solve ou aqui
- Bug que o /qa provar se conserta e o /qa roda de novo, até ✅ ou o motivo declarado
- A entrega fecha com uma conferência só, cada critério numa linha: ✅ ou ❌ `<motivo>` — as invocações reais, o veredito do /qa se houve mudança
- Com ela, a comparação à referência do /solve, item a item, e os arquivos mudados — tudo no working tree, sem commit
- Sozinho, sem próximo passo nem sugestão; combinado, o final da skill-alvo vence
