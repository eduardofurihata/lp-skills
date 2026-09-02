---
name: proto
description: 'Use when user invokes /proto to recreate a screen in 3 versions, each on a temporary parallel route in the same app ({rota-original}-v1/-v2/-v3), respecting the app design system, covering mobile and desktop at the project breakpoints, at /solve quality — designed as the screen SHOULD be, not as it is. Triggers on "recria essa tela em 3 versões", "redesenha essa tela", "prototipa variações dessa tela", "quero comparar opções de UI". Ends with the 3 URLs and a recommendation so the user picks one; the chosen version is implemented later by /method or /fast.'
effort: max
requires: solve
argument-hint: "[rota, tela ou print]"
---

# /proto — a mesma tela em 3 versões, pra escolher uma

Recria a tela pedida em **3 versões**, cada uma numa **rota paralela temporária** do mesmo app. Padrão de qualidade: **invoque o `/solve`**. Não ficou claro qual tela → pergunte antes de começar.

O entregável não é uma tela. É uma **escolha**.

## O que a entrega contempla

- **3 versões que competem de verdade.** Três propostas para a mesma tela, cada uma apostando em algo diferente — e cada uma defensável como a melhor. Se as 3 pudessem coexistir como ajuste de espaçamento da mesma tela, não são 3 versões.

- **O design system do app.** Tokens, componentes, tipografia, ícones e escalas são os do projeto, lidos do projeto (e de `docs/04-spec/design-system.md`, se existir). Nada inventado fora deles; o que o DS não tem, sai da **composição** do que ele tem. Doutrina completa — tokens como fonte única, atomicidade, composição > configuração, headless, estados, Jakob, a11y AA: **`method/references/design.md`**. Aqui não se **promove** ao DS: protótipo é descartável; a promoção acontece no `/method`, quando a versão escolhida for implementada.

- **Rotas paralelas temporárias.** `{rota-original}-v1`, `-v2`, `-v3` no mesmo app. A rota original e o código compartilhado ficam intocados — o que é novo nasce dentro da pasta da própria versão. São descartáveis por contrato: a versão escolhida é implementada na rota real (`/method` ou `/fast`) e as `-v*` somem.

- **Mobile e desktop.** Cada versão desenhada para as duas pontas, nos **breakpoints do projeto** — mobile não é desktop encolhido, desktop não é mobile esticado, e nada quebra no meio do caminho.

- **Como a tela deveria ser.** A tela atual ensina os dados, os estados e o que a pessoa vem fazer ali; ela não define layout, hierarquia nem fluxo. A pergunta é como isso deveria ser no nível `/solve`, não como mexer o mínimo no que existe.

- **Protótipo que funciona.** Dados e estados reais da tela (carregando, vazio, erro, cheio, casos-limite), a interação que cada versão promete funcionando de fato, acessibilidade e estados de interação como o DS define, console sem erro — e você viu as 3, rodando, em mobile e desktop, antes de dizer que acabou.

- **Fecho que permite decidir.** No fim o usuário tem: as 3 URLs, o que cada versão aposta e quando ela ganha, sua recomendação com o motivo, e o que virou mock ou desvio do DS. Aí sim pergunte qual fica.

Não commita. Não cria docs nem kanban — isso é o `/method`, depois da escolha.

## Princípios de engenharia — valem aqui também

Protótipo descartável não é desculpa para código torto: a versão escolhida vira a base do `/method`, e o que estiver ruim vai junto.

- **DRY** — as 3 versões compartilham o que já existe no projeto (DS, hooks, utils). Nada de copiar o componente da tela original 3× "porque é temporário": o que é comum às versões sai de um lugar só; o que é específico nasce dentro da pasta da própria versão.
- **SRP / headless** — cada versão em sua pasta, sem tocar a rota original nem o código compartilhado. Componente burro + hook de dados, não um arquivão.
- **YAGNI** — 3 versões da tela pedida. Não invente feature nova, config, flag ou "modo" que ninguém pediu para diferenciá-las.
- **KISS** — a diferença entre as versões é de **proposta** (hierarquia, fluxo, densidade), não de complexidade técnica.
- **Tokens** — mesmo em protótipo, cor/espaçamento/tipografia vêm do token. Literal cravado é o que faz a versão escolhida nascer torta no `/method`.
- Detalhe: `method/references/principios.md` (engenharia) e `method/references/design.md` (design).

## PARE se pensar

"as 3 ficaram parecidas, mas cada uma tem seu charme" · "só um ajustinho nesse componente compartilhado" · "mobile depois" · "uso os breakpoints padrão da lib, todo projeto usa" · "protótipo pode ter botão morto e sem estado vazio" · "a tela já é assim, então mantenho" · "invento uma cor só pra essa versão" · "commito pra não perder"
