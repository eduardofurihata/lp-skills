---
name: method
description: 'Use ONLY when the user explicitly invokes /method (bare /method = the objective is whatever the conversation is already about), or when another skill invokes `furi-build:method` via the Skill tool. NEVER activate on your own initiative. — the binding doctrine: invokes /solve, /principles, /front (with a visual surface) and /qa via the Skill tool and holds every line of them, and of itself, as mandatory; closes with one ✅/❌ check of every criterion; no tracking file, never commits nor branches.'
argument-hint: "[objetivo]"
requires: [solve, principles, front, qa]
---

# /method — Doutrina obrigatória

/method é doutrina, não sugestão: cada linha deste arquivo e das skills que ele invoca vale inteira — nenhuma se pula, se comprime ou se cumpre de memória. Vontade de pular ("o pedido já tem", "é cerimônia") = dizer qual e por quê e ter o sim, não decidir calado. Combinado com outra skill, a dela vale junto, sem rebaixar esta. Invocar é chamada real pela Skill tool; mencionar não é invocar. Não cria branch/worktree, não commita, não faz push/merge.

- Primeiro ato, antes de ler, explorar, planejar ou responder: /solve, /principles e /qa invocados de fato; /front também, se o alvo toca o que o usuário do produto vê — tela, texto de interface, e-mail, notificação; na dúvida, invocar. A doutrina dá forma ao plano, não o revisa
- Cada linha delas vale contra o alvo desde o primeiro ato: na resposta, no plano e no código — no plano, cada linha é passo com critério; no código, é prova
- Os critérios do /qa valem para todo código que muda, com a bateria desenhada no plano: bug que ele provar se conserta e a bateria roda de novo, até ✅ ou o motivo declarado
- A entrega fecha com uma conferência só, cada critério numa linha: ✅ ou ❌ `<motivo>` — as invocações reais, o veredito do /qa se houve mudança, o fechamento do /solve e os arquivos mudados, no working tree
- Sozinho, sem próximo passo nem sugestão; combinado, o final da skill-alvo vence
