---
name: create-test
description: 'Use when user invokes /create-test [tema] — supre a pirâmide de teste do tema tratado no prompt ou na conversa: unidade, integração e E2E no Playwright, no padrão do projeto e rodados até verde.'
effort: max
argument-hint: "[tema | arquivo | rota | tela] (vazio = o que esta conversa mudou)"
disable-model-invocation: true
---

# /create-test — delimitar o tema, suprir a pirâmide, rodar até verde

O tema entra pelo argumento ou pelo que esta conversa mudou; sai a pirâmide dele suprida: o que falta em cada nível, escrito e verde. Nunca conserta código de produção. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Delimitar o tema: o que o prompt pede ou o que mudou aqui — arquivos, regras, rotas, telas; ambiguidade real → pergunte
- [ ] Ler como o projeto testa hoje: stack, runner, config, scripts, pastas, fixtures e o comando da suíte
- [ ] Adotar a ferramenta de cada nível: a do projeto; não tendo, o padrão de mercado da stack (Node: Vitest ou Jest + Supertest; Python: pytest; PHP: Pest; Go: testify) e Playwright no E2E; configurar o que faltar
- [ ] Listar a pirâmide do tema: unidade (regra, função, borda, erro), integração (rota, banco, serviço, contrato), E2E (a jornada na tela)
- [ ] Conferir nível a nível o que já está coberto: sem superfície, diga e siga; já coberto, não duplique
- [ ] Escrever o que falta no padrão do projeto: nome que diz o caso, dado real, asserção no comportamento, nunca no detalhe interno
- [ ] Rodar a suíte e iterar até verde mexendo só no teste: seletor, espera, fixture, isolamento; sem skip e sem asserção frouxa
- [ ] Parar no teste que reprova o código: ele é o bug provado — mostre o vermelho e a causa provável; o código é de quem constrói
- [ ] Retornar: tema, arquivos criados, comando da suíte, resultado por nível e o que ficou sem cobertura
