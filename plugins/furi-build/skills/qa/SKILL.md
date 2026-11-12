---
name: qa
description: 'Use ONLY when the user explicitly invokes /qa (bare /qa = todo o trabalho em curso: card, branch, worktree, conversa), or when another skill invokes `furi-build:qa` via the Skill tool. NEVER activate on your own initiative. — QA 360°: prova o que o trabalho mudou, blinda as regras de negócio, roda até verde e explora no navegador real, sempre.'
argument-hint: "[tema | arquivo | rota | tela] (vazio = todo o trabalho em curso)"
---

# /qa — QA 360°: provar e blindar

Meta: o trabalho em curso sai sem bug e blindado — o que mudou, provado; cada regra de negócio que ele toca, presa por teste que reprova quem a alterar. No plano, cada linha é passo com critério; no código, execução — nenhuma se pula. Autônomo: leitura mais razoável, suposição registrada; pergunte só se bloqueado (subir o app, credencial fora de `.secrets/`).

- Escopo sem argumento: o que o trabalho mudou — diff da branch contra a base (merge-base), o não commitado da worktree, o card e a conversa. Daí: arquivos, regras, rotas, telas, critérios de aceite (ditos ou inferidos), riscos (dados, permissão, integração) e os vizinhos que dependem do que muda
- Ler como o projeto testa e sobe: runner, fixtures, seeds, comandos, app local; ferramenta de cada nível: a do projeto, senão o padrão da stack e Playwright no E2E
- Inventariar as regras de negócio do escopo — cálculo, validação, permissão, estado, limite — cada uma com teste que afirma o valor esperado
- Pirâmide do escopo — unidade (regra, borda, erro), integração (rota, banco, serviço, contrato), E2E (jornadas críticas): já coberto não se duplica; sem superfície, diga
- Escrever o que falta no padrão do projeto: nome que diz o caso, dado real, asserção no comportamento; determinístico, mock só nas fronteiras; teste novo sabe falhar: inverta a regra, veja o vermelho
- Rodar, do mais barato ao mais caro, lint, typecheck, unidade, integração, E2E e a suíte mais ampla viável. Até verde mexendo só no teste: sem skip, `sleep` ou asserção frouxa; oscilou, 3 rodadas e o flaky com evidência. Teste que reprova o código = bug provado: o vermelho e a causa provável
- Exploração no navegador real: obrigatória, nunca encurtada — sem ela não há ✅. App local ou homolog, dados de teste (nunca produção ou conta real), via `pwx` (senão o Playwright do projeto); sem tela, pela API ou CLI. Credencial em `.secrets/`; conta de teste em `.secrets/test-accounts.md` (reuse, ou crie e registre); valor nunca em chat ou commit
- Listar os charters e percorrer cada um como o usuário, com screenshot: caminho feliz de cada critério; entradas (vazio, enorme, emoji, colar, duplo submit); estados (carregando, vazio, erro, sem permissão, sessão expirada); navegação (voltar, refresh, deep link, nova aba); 320px ao desktop; console e rede (4xx/5xx, lentidão); a regressão vizinha. Não percorrido = qual e por quê, e o veredito no máximo ⚠️
- Achado: passos, esperado vs obtido, print, console/rede — o reprodutível vira teste
- Fechar com o veredito numa frase (✅ pronto · ⚠️ com ressalvas · ❌ não pronto) e: escopo e suposições · regras blindadas, com o teste de cada · testes por nível, com arquivos · comando e resultado por suíte · charters ✅/❌ com evidência · bugs com severidade · o que ficou sem cobertura e por quê

Nunca conserta código de produção, nunca commita.
