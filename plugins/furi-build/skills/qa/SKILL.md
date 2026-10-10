---
name: qa
description: 'Use ONLY when the user explicitly invokes /qa (bare /qa = o tema é o que a conversa já mudou), or when another skill invokes `furi-build:qa` via the Skill tool. NEVER activate on your own initiative. — estratégia de testes holística e autônoma 360° sobre o que foi feito: entende o escopo, completa a pirâmide (unidade, integração, E2E), roda os testes do escopo até verde e faz a passada exploratória agêntica completa no navegador real.'
argument-hint: "[tema | arquivo | rota | tela] (vazio = o que esta conversa mudou)"
---

# /qa — QA 360°: holístico e autônomo

O escopo sai provado. Autônomo: tome a leitura mais razoável, registre a suposição e siga — pergunte só se bloqueado (subir o app, credencial de teste).

- Delimitar o que foi feito: argumento, diff da conversa ou da branch (`git diff <base>...HEAD`), card ou PR — arquivos, regras, rotas e telas afetadas; critérios de aceite (explícitos ou inferidos); áreas de risco (regra de negócio, dados, permissão, integração, migração) e os vizinhos que dependem do que mudou
- Ler como o projeto testa e sobe: stack, runner, configs, scripts, pastas, fixtures e seeds, o comando da suíte, lint e typecheck, e como rodar o app local
- Adotar a ferramenta de cada nível: a do projeto; não tendo, o padrão da stack (Node: Vitest ou Jest + Supertest; Python: pytest; PHP: Pest; Go: testify) e Playwright no E2E — configurar o que faltar
- Listar a pirâmide do escopo — unidade (regra, borda, erro), integração (rota, banco, serviço, contrato), E2E (só as jornadas críticas) — e conferir nível a nível o que já cobre: sem superfície, diga e siga; já coberto, não duplique
- Escrever o que falta no padrão do projeto: nome que diz o caso, dado real, asserção no comportamento e nunca no detalhe interno; determinístico, mock só nas fronteiras (rede, relógio, serviço externo); todo teste novo tem que saber falhar — confira
- Rodar lint, typecheck, unidade, integração e E2E do escopo, do mais barato ao mais caro, e a suíte mais ampla viável para pegar regressão
- Iterar até verde mexendo só no teste: seletor, espera, fixture, isolamento; sem skip, sem `sleep`, sem asserção frouxa. Oscilou: até 3 rodadas, e o flaky vai com evidência
- Parar no teste que reprova o código: é o bug provado — mostre o vermelho e a causa provável
- Subir o app local ou de homolog com dados de teste — nunca produção, nunca credencial real — e dirigir o navegador real da máquina (o `pwx`, se instalado; senão o Playwright do projeto)
- Percorrer as jornadas como o usuário, por charter, começando pelo escopo: caminho feliz contra os critérios de aceite; entradas (vazio, enorme, emoji, colar, duplo submit); estados (carregando, vazio, erro, sem permissão, sessão expirada); navegação (voltar, refresh, deep link, nova aba); de 320px ao desktop; console e rede (4xx/5xx, lentidão); a regressão vizinha
- Registrar cada achado com passos, esperado vs obtido, screenshot e console/rede — e o reprodutível volta como teste novo na pirâmide
- Fechar com o veredito numa frase (✅ pronto · ⚠️ com ressalvas · ❌ não pronto), depois: escopo e suposições · testes criados por nível, com arquivos · comando e resultado por suíte · bugs com severidade e evidência · o que ficou sem cobertura e por quê

Nunca conserta código de produção, nunca commita.
