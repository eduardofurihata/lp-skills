---
name: proto
description: 'Use when user invokes /proto to recreate a screen in 3 versions, each on a temporary parallel route in the same app ({rota-original}-v1/-v2/-v3), respecting the app design system, mobile and desktop, at /solve quality — as the screen SHOULD be, not as it is. Ends with the 3 URLs and a recommendation so the user picks one; the chosen version is implemented later by /method.'
requires: [solve, front]
argument-hint: "[rota, tela ou print]"
disable-model-invocation: true
---

# /proto — a mesma tela em 3 versões, pra escolher uma

O entregável não é uma tela, é uma **escolha**. Não commita nem implementa a escolhida — isso é o `/method`, depois da escolha.

- Invocar `furi-build:solve` e `furi-build:front` via Skill tool — o `/front` traz o `/principles`
- Perguntar qual tela, se não ficou claro
- Ler a tela atual pelos dados, estados e o que a pessoa vem fazer — não pelo layout
- Criar 3 versões que competem de verdade
- Publicar cada uma em rota paralela temporária — `{rota-original}-v1`, `-v2`, `-v3` — com a original e o código compartilhado intocados
- Desviar do `/front` num ponto só: o que falta no design system sai da composição, sem promover ao DS
- Fazer cada uma funcionar em mobile e desktop, nos breakpoints do projeto: dados reais, cada estado do `/front`, interação, a11y e console sem erro
- Entregar as 3 URLs, a aposta de cada uma e quando ela ganha, a recomendação com motivo e o que virou mock ou desvio do DS
- Perguntar qual fica
