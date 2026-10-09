---
name: qa
description: 'Use ONLY when the user explicitly invokes /qa (bare /qa = o tema é o que a conversa já mudou), or when another skill invokes `furi-build:qa` via the Skill tool. NEVER activate on your own initiative. — leva o tema ao QA 360°: a pirâmide (unidade, integração, E2E no Playwright, no padrão do projeto, rodada até verde), a passada exploratória autônoma no navegador real como o usuário, a acessibilidade (a11y, piso legal WCAG) e a aceitação de negócio (UAT) contra os critérios de aceite. Nunca conserta código de produção.'
effort: max
argument-hint: "[tema | arquivo | rota | tela] (vazio = o que esta conversa mudou)"
---

# /qa — o QA 360°: pirâmide, exploração, a11y e aceitação, até verde

O tema entra pelo argumento ou pelo que esta conversa mudou; sai o QA 360° dele, em quatro dimensões: **pirâmide** (o que falta em cada nível, escrito e verde), **exploratório** (as jornadas de verdade no navegador real), **a11y** (acessibilidade, piso legal WCAG) e **UAT** (aceitação de negócio contra os critérios de aceite). Nunca conserta código de produção. Trabalhe os `- [ ]` abaixo na ordem: um por vez, fechando antes de abrir o próximo.

- [ ] Delimitar o tema: o que o prompt pede ou o que mudou aqui — arquivos, regras, rotas, telas; ambiguidade real → pergunte
- [ ] Ler como o projeto testa hoje: stack, runner, config, scripts, pastas, fixtures e o comando da suíte
- [ ] Adotar a ferramenta de cada nível: a do projeto; não tendo, o padrão de mercado da stack (Node: Vitest ou Jest + Supertest; Python: pytest; PHP: Pest; Go: testify) e Playwright no E2E; configurar o que faltar
- [ ] Listar a pirâmide do tema: unidade (regra, função, borda, erro), integração (rota, banco, serviço, contrato), E2E (a jornada na tela)
- [ ] Conferir nível a nível o que já está coberto: sem superfície, diga e siga; já coberto, não duplique
- [ ] Escrever o que falta no padrão do projeto: nome que diz o caso, dado real, asserção no comportamento, nunca no detalhe interno
- [ ] Rodar a suíte e iterar até verde mexendo só no teste: seletor, espera, fixture, isolamento; sem skip e sem asserção frouxa
- [ ] Parar no teste que reprova o código: ele é o bug provado — mostre o vermelho e a causa provável; o código é de quem constrói
- [ ] Passada exploratória como o usuário: dirigir o navegador real com o `/pwx` (furi-toolbox) e percorrer as jornadas de verdade, provando bordas e caminhos que a pirâmide não codifica — cada falha vira vermelho com evidência; o achado reprodutível volta como novo teste na pirâmide
- [ ] Acessibilidade (a11y), quando há superfície: rodar o checker automatizado (axe no Playwright/E2E) e provar teclado, foco visível, contraste e rótulos/ARIA — WCAG como piso legal; violação vira vermelho e, reprodutível, teste que fica
- [ ] Aceitação de negócio (UAT): validar a entrega contra os critérios de aceite / a regra de negócio como o dono do produto — a jornada entrega o resultado esperado, não só passa tecnicamente; o que falta ao aceite vira vermelho
- [ ] Retornar: tema, arquivos criados, comando da suíte e o resultado por dimensão — pirâmide (nível a nível), exploração (percorrido e achado, com evidência), a11y e UAT —, mais o que ficou sem cobertura
