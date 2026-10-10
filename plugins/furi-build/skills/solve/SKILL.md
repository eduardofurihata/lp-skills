---
name: solve
description: 'Use ONLY when the user explicitly invokes /solve (bare /solve = the objective is whatever the conversation is already about), or when another skill invokes `furi-build:solve` via the Skill tool. NEVER activate on your own initiative. — takes whatever the request targets (an answer, a plan, a brainstorm or the work itself) to world-class level, benchmarking against the leading big pop tech apps in the relevant domain as the quality floor, aiming to make us the #1 reference in the market; a question gets an answer, not an implementation. Invokes /principles (the engineering doctrine) and, with a visual surface, /front (the design doctrine) via the Skill tool.'
argument-hint: "[o que resolver]"
requires: [principles, front, qa]
---

# /solve — Responder, planejar ou fazer no nível da referência #1

Mire ser a **referência #1 do mercado**, no calibre dos **big pop tech apps**. O /solve é orientado ao **alvo**: o pedido decide o que se entrega, o /solve decide o **nível**, e a forma vem do /principles (engenharia) e do /front (design). Não é MVP: genérico ou mediano é falha, e qualidade vem antes de esforço, tempo ou tokens.

- Ler o alvo antes de tudo: fazer, responder, planejar ou brainstorm. Pergunta não é ordem — "não seria melhor X?" pede resposta, não código. Combinado com outra skill, o alvo e a forma são dela: um card, uma conversa só de leitura
- Invocar `furi-build:principles` via Skill tool — chamada real, não de memória
- Invocar `furi-build:front` via Skill tool se o alvo toca o que o usuário do produto vê — tela, texto de interface, e-mail, notificação; na dúvida, invocar
- Nomear a referência: os líderes deste domínio e o que eles fazem, concretamente, neste ponto — do tamanho do pedido, pesquisando só a dúvida que muda a decisão; o não conferido vai como suposição. É o piso, nunca o teto: sem ela, "um líder assinaria?" sempre responde sim
- Buscar todos os arquivos relacionados antes de responder, planejar ou mexer: o que já cobre a capacidade, quem usa, os testes e os docs — parte-se do mapa completo, não do primeiro arquivo achado
- Respondendo, planejando ou em brainstorm: fundamentar na referência, nos arquivos e nos cenários que o usuário final vive — o caminho feliz, o erro e a borda —, sem implementar; o plano leva os três e o que falta para o nível vira recomendação
- Fazendo: igualar ou superar a referência, na causa e não no sintoma — base abaixo do nível se refaz do zero; o que a referência tem além do pedido também entra, avisando
- Fazendo: acionar o `furi-build:qa` via Skill tool — a bateria 360° de testes que prova e fica; o que ela cobre é dela
- Fechar a entrega com a comparação à referência, item a item: atende (com a prova) · abaixo · fora por decisão — e o que foi além do pedido. Um líder do domínio assinaria isto — e a tela, se houver? Não → refazer

Reinvocado no mesmo trabalho (um passo de outra skill): a referência já nomeada vale — aplicar ao artefato do passo e seguir no mesmo turno.
