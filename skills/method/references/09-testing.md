# Step 9 — Testing (Run Test)

**Executar TODOS os TCs e verificar se o código funciona como esperado.**

## Artefato

- **Pasta:** `kanban/09-run-test/`
- **Arquivo:** `<tópico>.md`

## FRONT É FRONT — Regra Absoluta

**Se o protocolo diz "executar via front", você EXECUTA via front.** Sem exceções, sem atalhos, sem "deduzo do código".

**Por que:** teste via front é exponencialmente mais forte que análise de código. Captura:
- Bugs de integração (FE ↔ BE) que análise estática não vê
- Problemas de timing/race conditions
- Estados visuais quebrados, layout, responsividade
- Comportamento real do usuário no fluxo completo
- Bugs por dependências, cache, browser quirks

Análise de código captura: lógica isolada. **Análise de código NÃO substitui teste front. Nunca.**

## Pre-Flight Blocker Contract (OBRIGATÓRIO — ANTES de tudo)

```
PRE-FLIGHT (executar PRIMEIRO):
  1. Listar TODOS os N TCs do plano (docs/05-test-cases/)
  2. Para CADA TC, verificar:
     - Tenant / build / config necessário
     - Seed data / user type necessário
     - Hardware necessário (browser, AVD, iOS simulator)
     - Feature flag / locale / theme necessário
  3. Classificar cada TC:
     - READY (tudo disponível)
     - NEEDS SETUP (posso desbloquear: seed, config, user creation)
     - BLOCKED (não consigo: hardware, acesso, tenant indisponível)
  4. Reportar ao user ANTES de executar:
     "Pre-flight: X READY, Y NEEDS SETUP (vou preparar), Z BLOCKED por: [lista]"
  5. Se Z > 0:
     - PARAR e perguntar: "(a) desbloquear [como] (b) marcar NOT_RUN explícito (c) abortar"
     - Esperar resposta. NÃO roda nenhum TC até a resposta.
  6. Se Z == 0: preparar os NEEDS SETUP e prosseguir
```

**Por que:** impede racionalização retroativa. Setup identificado ANTES, não depois de já ter rodado os "fáceis".

## CRIE AS CONDIÇÕES (a regra mais importante do testing)

**Um TC precisa de condições específicas? CRIE-AS. Você está em ambiente LOCAL DEV com PODER TOTAL.**

- Precisa de usuário específico? → Cadastre via front, crie via DB, use painel admin
- Precisa de estado de dados? → Crie via UI, seed via SQL, chame API
- Precisa de role/plano/permissão? → Crie usuário + atribua via DB ou admin
- Precisa de estado no DB? → SQL insert, UI, seeder
- Precisa de feature flag / config? → Configure via admin, DB, env var
- Precisa de segundo usuário? → Crie segunda conta
- Precisa de estado populado/vazio/parcial? → Monte explicitamente

**Documente o que criou** em `## Test Environment Setup` no doc do step 9.

"Não tenho as condições certas" NUNCA é desculpa — crie-as.

## Prediction-Execution-Reconciliation (OBRIGATÓRIO)

### Ao iniciar execução, declarar:

```markdown
## Predição
Vou executar N TCs. Vou produzir N evidências (screenshots com path).
TCs a executar: [lista nominal completa]
```

### Ao finalizar, ANTES de qualquer report:

```markdown
## Reconciliação
- Predicted: N TCs
- Evidence collected: M screenshots com path
- Delta: N - M
- TCs sem evidência: [lista] → status = NOT_RUN (não "coberto por", não "equivalente a")
```

**Se delta > 0: TCs sem evidência são automaticamente NOT_RUN. Não existe "covered by other means".**

## Regra de Report: Resposta Binária

Quando o user perguntar "tudo ok? all tc passed?", a **primeira frase** é obrigatoriamente:

```
"X de N PASSED via front. Y NOT_RUN. Z FAILED. Net: PASS|FAIL|INCOMPLETE."
```

**Proibido como primeira frase:** "Mostly yes", "Honest answer:", "With caveats", "Sim, mas...", "Quase tudo", "It depends". Detalhes vêm DEPOIS da frase numérica.

## Três Regras de Integridade

**1. Disclosure ≠ compliance.**
Dizer "eu não rodei X" NÃO torna OK marcar X como PASSED. Disclosure honesta de uma violação AINDA É uma violação. Disclosure só conserta mentir; não conserta cheating.

**2. HOW vs WHAT — separação explícita.**
Feedback do user sobre pragmatismo ("vai mais rápido", "evita loops lentos", "faz batching") aplica APENAS a **HOW** (otimização: rodar os mesmos N TCs mais eficientemente). NUNCA aplica a **WHAT** (rodar menos TCs).

**3. Forbidden CONCEPTS.**
Qualquer sentença que aplique os seguintes conceitos a um status de TC = violação automática:
- "verificado/coberto/equivalente por análise estática/leitura de código"
- "redundante combinatoriamente com outro TC que já rodei"
- "low risk / trivial, então pulei"
- "deveria funcionar porque o código diz X"
- "per user's pragmatism feedback, pulei"
- "o TC é N/A neste build/tenant"

Se o TC é "N/A neste build" → deveria ter sido BLOCKED no pre-flight, não pulado silenciosamente.

## TCs em Tasks — Duas Camadas de TaskCreate (OBRIGATÓRIO)

**SEMPRE crie tasks em DUAS camadas: uma por GRUPO temático E uma por cada TC INDIVIDUAL dentro do grupo.**

```
PROCEDIMENTO (antes de qualquer TC):
  1. Ler TODOS os TCs de docs/05-test-cases/ (feature + regressão)
  2. Contar total de TCs (N)
  3. Agrupar TCs por tema/área (~10 por grupo)
  4. CAMADA 1 — Para CADA grupo, criar 1 TaskCreate:
     - TaskCreate: "Grupo 01: TC-001 a TC-010 — [área/tema]"
     - TaskCreate: "Grupo 02: TC-011 a TC-020 — [área/tema]"
  5. CAMADA 2 — Para CADA TC individual, criar 1 TaskCreate SEPARADO:
     - TaskCreate: "TC-001: [nome do TC]"
     - TaskCreate: "TC-002: [nome do TC]"
     - ... (1 invocação por TC, SEM array/lista, SEM bundling)
  6. TaskUpdate nos DOIS níveis:
     - Grupo: in_progress ao iniciar primeiro TC, completed quando TODOS do grupo passarem
     - TC individual: in_progress ao iniciar, completed após PASSED com evidência
```

**Sem TaskCreate em AMBAS as camadas = step 9 NÃO iniciou.**

## Audit Pré-Execução — BLOQUEANTE (publicar no chat ANTES do primeiro TC rodar)

**Depois de criar os TaskCreate das duas camadas e ANTES de tocar em qualquer ferramenta de teste (Playwright, emulator, curl), publique este bloco visualmente no chat. Audit ausente do chat = execução não iniciou.**

```markdown
## Audit Pré-Execução — TaskCreate 1:1
- TCs em `docs/05-test-cases/<tópico>.md`: **N**
- TaskCreate de grupo criados: **G** — listar (TaskID → grupo)
- TaskCreate individuais criados: **M** — listar (TaskID → TC-ID)
- Ratio M == N? ✅ SIM / ❌ NÃO — TCs sem task individual: [listar TC-IDs]
- Ratio G cobre todos os TCs? ✅ SIM / ❌ NÃO
- **Veredicto:** ✅ LIBERADO para executar / ❌ BLOQUEADO — criar tasks faltantes AGORA e republicar
```

**❌ BLOQUEADO = PROIBIDO executar qualquer TC.** Crie as tasks que faltam, republique o audit ✅, só então inicie o Loop. Executar TC sem o audit ✅ visível no chat = violação automática do protocolo (cheating visível, não escondido).

| Racionalização proibida | Realidade |
|------------------------|-----------|
| "Já declarei nas Duas Camadas, audit é redundante" | NÃO. Declaração em prosa ≠ audit publicado com números. BLOQUEADO. |
| "Conto os TaskCreate de cabeça, não preciso publicar" | NÃO. Audit silencioso = audit inexistente. BLOQUEADO. |
| "Vou começar a rodar enquanto crio as tasks que faltam" | NÃO. Audit ✅ antes de TUDO. BLOQUEADO. |
| "Faltam 2 de 30, começo pelos 28 que têm task" | NÃO. Atomicidade. 100% ou BLOQUEADO. |

## Loop de Execução

```
REPETIR até todos passarem SEM NENHUMA MUDANÇA:
  1. tsc/lint — se falhar, corrigir antes de testar
  2. Consultar notas do relatório 8b — focar nos pontos críticos
  3. Para CADA batch (task de grupo):
     a. TaskUpdate grupo → in_progress
     b. CADA TC do batch: executar DO ZERO via ferramenta apropriada
     c. PASSED (com screenshot/evidência) ou FAILED (motivo)
        → ao PASSED: marque `- [x]` na seção `## Test Cases (QA)` do card `kanban/06-todo/<tópico>.md` (TC-N + path do screenshot). FAILED: mantém `- [ ]` + nota do motivo.
     d. Bug → corrigir → ATENÇÃO: qualquer fix invalida o ciclo → RESETE todos os `- [x]` do checklist de QA para `- [ ]` (vai retestar TUDO do zero)
     e. Todos TCs do batch PASSED → TaskUpdate grupo → completed
  4. Organizar kanban/09-run-test/<tópico>.md
  5. Algum FAILED com fix → volta ao Step 8 (Code Review) → retesta TUDO
  6. Todos PASSED sem nenhuma mudança de código → Step 10
```

### Checklist de QA no card de to-do — atualizar ao vivo (retomada)

O card `kanban/06-todo/<tópico>.md` tem a seção `## Test Cases (QA)` com um `- [ ]` por TC (semeada no Step 6). **Atualize-a em tempo real:** TC PASSED → `- [x]`; fix de código → reset tudo para `- [ ]`. É o que permite **parar e retomar** — ao voltar, abra o card e os `- [ ]` restantes são exatamente o que falta rodar. O `kanban/09-run-test/` guarda a evidência (screenshot/motivo); o checklist guarda o status de bate-pronto. No Step 10 este checklist final é copiado para o done.

## Ferramenta por Contexto

| Contexto | Ferramenta | Como |
|----------|-----------|------|
| Mobile Android | Android emulator via AVD | Boot → instalar app → executar TC como usuário |
| Mobile iOS | iOS simulator (Xcode) ou device físico | Boot → instalar app → executar TC como usuário |
| Web (Next.js/frontend) | MCP Playwright (default `pw4`, pool `pw#` p/ fallback) | `mcp__playwright-4__*` por padrão (navigate, click, snapshot, screenshot) — ver "Pool Playwright" abaixo |
| API/Backend | curl/httpie ou test suite | Endpoints reais ou suite existente |

**OBRIGATÓRIO: Mobile = Android E iOS, sempre.** Toda feature mobile gera execução nas duas. Se iOS indisponível na máquina, peça ao usuário antes de marcar PASSED.

### Pool Playwright — Fallback Automático (`pw#`)

Existem **múltiplas instâncias** do MCP Playwright disponíveis: `mcp__playwright-0__*`, `mcp__playwright-1__*`, … até `mcp__playwright-5__*`. Cada uma controla um browser próprio e **só atende uma instância do Claude por vez** (outra sessão rodando em paralelo pode estar usando a mesma).

O **/method usa `mcp__playwright-4__*` como instância designada** (default). Os outros índices são apenas fallback quando o pw4 estiver ocupado.

**Regra:** se o `pw#` que você tentar usar já estiver **ocupado por outra instância** (erro tipo "browser already in use" / "session busy" / "target closed", a chamada falha, ou o `browser_snapshot` mostra uma página que não é a sua), **passe automaticamente para o próximo índice livre** — sem perguntar ao usuário e sem marcar o TC como BLOCKED/SKIP.

```
PROCEDIMENTO (ao iniciar testes via front):
  1. Use a instância designada do /method: mcp__playwright-4__browser_navigate
  2. pw4 ocupado / erro de sessão? → passe para o próximo índice livre do pool: -5, -3, -2, -1, -0
  3. Achou uma livre → fixe-a para TODOS os TCs desta rodada (não troque no meio)
  4. SÓ se as 6 estiverem ocupadas → pare e avise o usuário
  5. Registre qual pw# você usou em `## Test Environment Setup`
```

"Playwright ocupado" **NUNCA** vira SKIP/BLOCKED enquanto houver outro índice livre no pool — buscar a instância livre é fallback automático, parte do "CRIE AS CONDIÇÕES".

## Regras Rígidas

- **NUNCA SKIP ou BLOCKED** — resolva o impedimento: crie o usuário, insira dado no DB, configure flag, suba o serviço, instale dep. Pergunte ao usuário somente após esgotar tentativas.
- **FORCE via FRONT** — cada TC como usuário real: abrir app/browser, navegar, clicar, preencher, validar com screenshot. Sem atalhos de API, sem "verificar no código".
- **Mobile = Android E iOS** — feature mobile testada em apenas uma plataforma = não testada.
- **NUNCA marque PASSED apenas com tsc** — tsc verifica tipos, não comportamento.
- **Qualquer fix de código** → fix invalida review → volta ao Step 8 → depois retesta TUDO no Step 9.

## Resultado de TC — Binário

- **PASSED** = resultado esperado atingido + evidência (screenshot/dump)
- **FAILED** = qualquer outra situação, incluindo "não consegui completar o fluxo"

Não existe meio-termo. Não existe "PASSED (partial)". Não existe "herança" entre TCs.

## Audit Pós-Execução — BLOQUEANTE (publicar no chat ANTES do Gateway 9 → 10)

**Quando achar que o Loop terminou e ANTES de publicar o Gateway 9 → 10, publique este bloco. Audit ausente = step 9 não terminou.**

```markdown
## Audit Pós-Execução — Execução 1:1
- Tasks individuais esperadas (do Audit Pré): **N**
- Tasks individuais com status `completed`: **C** — listar (TaskID → TC-ID)
- TCs com evidência (screenshot path em `kanban/09-run-test/<tópico>.md`): **E** — listar (TC-ID → path)
- Ratio C == N? ✅ / ❌ — tasks pendentes: [listar TaskIDs]
- Ratio E == N? ✅ / ❌ — TCs sem screenshot: [listar TC-IDs]
- Status agregado: **N PASSED**, **0 FAILED**, **0 NOT_RUN**, **0 SKIPPED**, **0 BLOCKED** ✅ / ❌
- Último ciclo sem mudanças de código? ✅ / ❌
- **Veredicto:** ✅ LIBERADO para Gateway 9 → 10 / ❌ BLOQUEADO — voltar ao Loop e executar pendentes
```

**❌ BLOQUEADO = PROIBIDO publicar Gateway 9 → 10 e PROIBIDO escrever qualquer resumo / report de conclusão.** Volte ao Loop, execute os TCs pendentes, produza evidência, republique o audit.

| Racionalização proibida | Realidade |
|------------------------|-----------|
| "28 de 30 passaram, o resto é trivial, avanço" | NÃO. Delta > 0 = BLOQUEADO. Atomicidade. |
| "O TC X é redundante com Y que já rodou" | NÃO. Sem herança. Execute X. BLOQUEADO. |
| "Marco os 2 faltantes como PASSED e documento depois" | NÃO. Sem evidência = NOT_RUN. BLOQUEADO. |
| "Reporto parcial enquanto os últimos rodam" | NÃO. Audit ✅ antes de QUALQUER report. BLOQUEADO. |
| "Publico Gateway sem Audit, audit é só formalidade" | NÃO. Audit é pré-requisito formal do Gateway. BLOQUEADO. |

## Gateway 9 → 10

Ver `gateways.md` seção "Gateway 9 → 10" (detalhado).
