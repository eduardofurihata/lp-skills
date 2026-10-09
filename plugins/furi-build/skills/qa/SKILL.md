# QA 360°

Aplique uma estratégia de testes holística e autônoma 360° sobre o que foi feito. Trabalhe sem pedir confirmação a cada passo: tome a leitura mais razoável, registre as suposições e siga. Pare e pergunte apenas se estiver bloqueado (ex.: não sabe como subir a aplicação, falta credencial de teste) ou antes de qualquer ação irreversível.

Por padrão, o papel é de QA: **encontrar e reportar** bugs de produto, não corrigi-los. Só altere código de produção se o usuário pedir. Testes que você escreveu e estão errados, corrija você mesmo.

Crie uma lista de tarefas com as 5 fases abaixo e vá marcando conforme avança.

---

## Fase 1 — Entender o escopo

Objetivo: saber exatamente o que mudou, por que, e onde está o risco.

1. Identifique a mudança:
   - `git status`, `git log` recente e `git diff <branch-base>...HEAD` (descubra a base: `main`, `master`, `develop`).
   - Descrição do PR, issue, ticket ou o que o usuário disse na conversa.
2. Detecte a stack e o ferramental de testes já existente (`package.json`, `pyproject.toml`, `go.mod`, `pom.xml`, configs de Jest/Vitest/Pytest/Playwright/Cypress etc.) e os comandos de teste, lint e typecheck.
3. Descubra como subir a aplicação localmente (README, scripts `dev`/`start`, docker-compose, seeds, `.env.example`).
4. Escreva um **mapa de escopo** curto:
   - Arquivos/módulos alterados e o comportamento afetado.
   - Critérios de aceite (explícitos ou inferidos).
   - Áreas de risco: lógica de negócio, dados/persistência, autenticação/permissões, integrações externas, UI crítica, migrações.
   - Possíveis regressões em código vizinho que depende do que mudou.

## Fase 2 — Completar a pirâmide de testes

Objetivo: cada comportamento relevante do escopo coberto na camada certa.

1. Inventarie os testes existentes que tocam o escopo e marque as lacunas por camada:
   - **Unitários (base, maioria):** lógica pura, regras de negócio, validações, edge cases (vazio, nulo, limites, unicode, números negativos, datas/fuso).
   - **Integração (meio):** API/handlers, acesso a banco, componentes de UI com estado, contratos entre módulos.
   - **E2E (topo, poucos):** apenas os fluxos críticos do usuário afetados pela mudança.
2. Escreva os testes que faltam seguindo as convenções do projeto (mesmo framework, estrutura de pastas, nomes, helpers e fixtures). Não introduza um framework novo se já existe um que serve; se não existir nenhum para uma camada, use o padrão da stack e diga isso no relatório.
3. Regras de qualidade:
   - Testes determinísticos: nada de `sleep` arbitrário, dependência de ordem ou de rede real.
   - Mocke só as fronteiras (rede, relógio, serviços externos), não a lógica sob teste.
   - Teste comportamento, não implementação.
   - **Sanidade:** confirme que cada teste novo falharia se a funcionalidade quebrasse (inverta temporariamente uma condição ou leia criticamente a asserção). Teste que nunca falha não vale.

## Fase 3 — Rodar os testes

1. Rode na ordem: lint → typecheck → unitários → integração → E2E.
2. Se o projeto suportar, colete cobertura e olhe especificamente as linhas do diff.
3. Para cada falha, classifique:
   - **Bug no produto** → registre como achado (não mascare ajustando o teste).
   - **Teste errado** (seu) → corrija e rode de novo.
   - **Flaky** → rode até 3 vezes; se oscilar, registre como flaky com evidência.
   - **Ambiente** (dependência faltando, porta ocupada, serviço fora) → resolva se for simples, senão registre.
4. Também rode a suíte inteira (ou a mais ampla viável) para pegar regressões fora do escopo direto.

## Fase 4 — Teste exploratório agêntico no navegador

Objetivo: usar a aplicação como um usuário real (e um usuário malicioso/distraído) para achar o que os testes automatizados não pegam.

1. Suba a aplicação localmente (ou use o ambiente de teste indicado pelo usuário). **Nunca** explore em produção nem use credenciais reais; use contas e dados de teste/seed.
2. Use a ferramenta de navegador disponível na sessão (Playwright, browser embutido, extensão do Chrome etc.).
3. Execute sessões por *charter*, focando primeiro no escopo da mudança:
   - **Caminho feliz:** o fluxo principal funciona de ponta a ponta e atende aos critérios de aceite.
   - **Entradas:** inválidas, vazias, enormes, caracteres especiais/emoji, colar texto, duplo clique/duplo submit.
   - **Estados:** loading, vazio, erro, sucesso, sem permissão, sessão expirada.
   - **Navegação:** voltar/avançar, refresh no meio do fluxo, deep link direto, abrir em nova aba.
   - **Responsivo:** viewport mobile (>=320px) e desktop.
   - **Acessibilidade básica:** navegação só por teclado, foco visível, labels em campos, textos alternativos, contraste aparente.
   - **Saúde técnica:** erros e warnings no console, requisições de rede com falha (4xx/5xx), lentidão perceptível.
   - **Regressão vizinha:** telas que compartilham componentes ou dados com o que mudou.
4. Para cada problema encontrado, guarde evidência: passos de reprodução, resultado esperado vs obtido, screenshot e mensagens de console/rede relevantes.

## Fase 5 — Relatório

Entregue um relatório conciso com:

1. **Resumo e veredito:** ✅ pronto / ⚠️ pronto com ressalvas / ❌ não pronto — em uma frase.
2. **Escopo testado:** o mapa da Fase 1, resumido, e suposições feitas.
3. **Testes adicionados:** por camada (unit / integração / E2E), com arquivos.
4. **Resultados da execução:** passou/falhou por suíte, cobertura do diff se disponível, flaky.
5. **Bugs encontrados:** tabela com severidade (crítica / alta / média / baixa), título, passos de reprodução, esperado vs obtido, evidência.
6. **Riscos residuais:** o que não foi possível testar e por quê.
7. **Próximos passos recomendados.**

Se o usuário quiser, transforme o relatório em documento compartilhável e os bugs em issues no rastreador conectado (peça confirmação antes de criar issues).
