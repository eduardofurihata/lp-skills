---
name: proto
description: 'Use when user invokes /proto to recreate a screen in 3 versions, each on a temporary parallel route in the same app ({rota-original}-v1/-v2/-v3), respecting the app design system, mobile and desktop, at /solve quality — as the screen SHOULD be, not as it is. Ends with the 3 URLs and a recommendation so the user picks one; the chosen version is implemented later by /method.'
effort: max
requires: solve
argument-hint: "[rota, tela ou print]"
disable-model-invocation: true
---

# /proto — a mesma tela em 3 versões, pra escolher uma

Recria a tela pedida em **3 versões**, cada uma numa **rota paralela temporária** do mesmo app. A PRIMEIRA ação é **invocar via Skill tool** `furi-build:solve` — ele traz o `/principles` (engenharia) e o `/front` (design). Chamada real, não "seguir de memória": sem as invocações, o passo não aconteceu. Não ficou claro qual tela → pergunte antes de começar.

O entregável não é uma tela. É uma **escolha**.

## O que a entrega contempla

- **3 versões que competem de verdade.** Cada uma aposta em algo diferente — hierarquia, fluxo, densidade — e é defensável como a melhor. A diferença é de **proposta**, não técnica; se as 3 pudessem coexistir como ajuste de espaçamento, não são 3 versões.
- **O design system do app.** Tokens, componentes e tipografia são os do projeto. O que o DS não tem sai da **composição** do que ele tem; aqui não se promove ao DS — protótipo é descartável, a promoção acontece no `/method`, quando a versão escolhida for implementada.
- **Rotas paralelas temporárias.** `{rota-original}-v1`, `-v2`, `-v3`. A rota original e o código compartilhado ficam intocados: o que é comum às versões vem de um lugar só; o que é específico nasce na pasta da própria versão.
- **Mobile e desktop.** Cada versão nas duas pontas, nos **breakpoints do projeto** — mobile não é desktop encolhido, desktop não é mobile esticado.
- **Como a tela deveria ser.** A tela atual ensina os dados, os estados e o que a pessoa vem fazer ali; não define layout, hierarquia nem fluxo. A pergunta é como isso deveria ser no nível `/solve`, não como mexer o mínimo.
- **Protótipo que funciona.** Dados e estados reais (carregando, vazio, erro, cheio, limite), a interação que cada versão promete funcionando, a11y e estados de interação como o DS define, console sem erro — e você viu as 3 rodando, em mobile e desktop, antes de dizer que acabou. Descartável não é desculpa para código torto: a escolhida vira base do `/method`.
- **Fecho que permite decidir.** As 3 URLs, o que cada versão aposta e quando ela ganha, sua recomendação com o motivo, e o que virou mock ou desvio do DS. Aí sim pergunte qual fica.

Não commita. Não cria docs nem kanban — isso é o `/method`, depois da escolha.

## PARE se pensar
"as 3 ficaram parecidas, mas cada uma tem seu charme" · "só um ajustinho nesse componente compartilhado" · "mobile depois" · "uso os breakpoints padrão da lib" · "protótipo pode ter botão morto e sem estado vazio" · "a tela já é assim, então mantenho" · "invento uma cor só pra essa versão" · "commito pra não perder" · "já sei o que o `/solve` / o `/front` diz, sigo sem invocar"
