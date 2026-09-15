# Step 10 — Testing (Run Test)

**Executar TODOS os TCs e verificar se o código funciona como esperado.**

**Chame e use:** `/solve` · `/principles` · `/front` (se tem UI) — os três via Skill tool · `11-follow-ups.md`

## Artefato

`kanban/10-run-test/<tópico>.md` — nome por domínio; doc que já cobre o domínio se **atualiza**, não se duplica (`00-start.md`). Guarda a evidência de cada TC (screenshot com path, ou o motivo do FAILED) e o `## Test Environment Setup`.

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
  1. Listar TODOS os N TCs do plano (docs/06-test-cases/)
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
  1. Ler TODOS os TCs de docs/06-test-cases/ (feature + regressão)
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
- TCs em `docs/06-test-cases/<tópico>.md`: **N**
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
  2. Consultar notas do relatório 9b — focar nos pontos críticos
  3. Para CADA batch (task de grupo):
     a. TaskUpdate grupo → in_progress
     b. CADA TC do batch: executar DO ZERO via ferramenta apropriada
     c. PASSED (com screenshot/evidência) ou FAILED (motivo)
        → atualize o checklist `## Test Cases (QA)` do card `kanban/07-todo/<tópico>.md` (regras em `07-todo.md` § Checklist de QA)
     d. Bug → triagem A/B/C (`11-follow-ups.md`):
        - **A** → corrigir AGORA. Qualquer fix invalida o ciclo → RESETE o checklist de QA inteiro (vai retestar TUDO do zero)
        - **B** / **C** → registrar no ledger (`## Follow-ups` do card). NÃO corrige aqui — B vira ciclo /method no Gate de Convergência
     e. Todos TCs do batch PASSED → TaskUpdate grupo → completed
  4. Organizar kanban/10-run-test/<tópico>.md
  5. Algum FAILED com fix → volta ao Step 9 (Code Review) → retesta TUDO
  6. Todos PASSED sem nenhuma mudança de código → Step 11
```

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
- **Qualquer fix de código** → fix invalida review → volta ao Step 9 → depois retesta TUDO no Step 10.

## Resultado de TC — Binário

- **PASSED** = resultado esperado atingido + evidência (screenshot/dump)
- **FAILED** = qualquer outra situação, incluindo "não consegui completar o fluxo"

Não existe meio-termo. Não existe "PASSED (partial)". Não existe "herança" entre TCs.

**Workaround que faz o TC passar é FAILED disfarçado.** O Step 10 não escreve feature — escreve **fix** —, e é sob a pressão de fazer passar que nasce o remendo:

- O fix vai **para o motor**, nunca de remendo no chamador: corrigir na tela o que o motor calcula errado cria a segunda fonte da regra.
- O fix mais simples que resolve a **causa** — não o mais engenhoso, nem o que "já aproveita e melhora" outra coisa (isso é ledger).
- Fix novo **reabre o perímetro**: os arquivos que ele tocou entram na regra do saldo.
- **Se tem UI:** remendo de CSS que acerta só aquele screenshot é FAILED disfarçado, e a evidência é por **estado × breakpoint**, não o happy path em desktop.

## Audit Pós-Execução — BLOQUEANTE (publicar no chat ANTES do Gateway 10 → 11)

**Quando achar que o Loop terminou e ANTES de publicar o Gateway 10 → 11, publique este bloco. Audit ausente = step 9 não terminou.**

```markdown
## Audit Pós-Execução — Execução 1:1
- Tasks individuais esperadas (do Audit Pré): **N**
- Tasks individuais com status `completed`: **C** — listar (TaskID → TC-ID)
- TCs com evidência (screenshot path em `kanban/10-run-test/<tópico>.md`): **E** — listar (TC-ID → path)
- Ratio C == N? ✅ / ❌ — tasks pendentes: [listar TaskIDs]
- Ratio E == N? ✅ / ❌ — TCs sem screenshot: [listar TC-IDs]
- Status agregado: **N PASSED**, **0 FAILED**, **0 NOT_RUN**, **0 SKIPPED**, **0 BLOCKED** ✅ / ❌
- Último ciclo sem mudanças de código? ✅ / ❌
- Follow-ups detectados no Step 10: **F** — todos classificados no ledger (A/B/C)? ✅ / ❌
- **Veredicto:** ✅ LIBERADO para o Gateway 10 → 11 / ❌ BLOQUEADO — voltar ao Loop e executar pendentes
```

> Follow-up de balde B **não bloqueia o Gateway 10 → 11** (o TC da feature passou) — ele bloqueia o **Step 11**, logo a seguir. Registrar aqui é o que garante que ele chegue lá.

**❌ BLOQUEADO = PROIBIDO publicar o Gateway 10 → 11 e PROIBIDO escrever qualquer resumo / report de conclusão.** Volte ao Loop, execute os TCs pendentes, produza evidência, republique o audit.

| Racionalização proibida | Realidade |
|------------------------|-----------|
| "28 de 30 passaram, o resto é trivial, avanço" | NÃO. Delta > 0 = BLOQUEADO. Atomicidade. |
| "O TC X é redundante com Y que já rodou" | NÃO. Sem herança. Execute X. BLOQUEADO. |
| "Marco os 2 faltantes como PASSED e documento depois" | NÃO. Sem evidência = NOT_RUN. BLOQUEADO. |
| "Reporto parcial enquanto os últimos rodam" | NÃO. Audit ✅ antes de QUALQUER report. BLOQUEADO. |
| "Publico Gateway sem Audit, audit é só formalidade" | NÃO. Audit é pré-requisito formal do Gateway. BLOQUEADO. |

## Evidência visual — estado × breakpoint (feature com superfície visual)

Um screenshot do happy path em desktop é a fatia que nunca quebra. Para TC que atravessa tela, a evidência cobre:

- **Estados:** vazio · carregando · erro · sucesso · limite (lista longa, texto longo, sem permissão) — os mesmos que o UC listou no Step 3.
- **Breakpoints do projeto**, com **320px** como piso.
- **Interação:** foco visível por teclado nos controles do fluxo.

Documente os paths em `kanban/10-run-test/<tópico>.md` identificando **qual estado e qual breakpoint** cada arquivo prova. Estado que o UC listou e que não tem evidência = TC incompleto, não PASSED.

## PARE se pensar

O Step 10 é onde mais se trapaceia — a pressão de "fazer passar" produz estas frases:

| Se você pensar | A realidade |
|---|---|
| "Verifiquei no código, marco PASSED" | Código ≠ comportamento. FRONT É FRONT. BLOQUEADO. |
| "tsc/lint passou, está testado" | tsc verifica tipos. Não é teste. BLOQUEADO. |
| "A tela carregou, marco PASSED" | Tela carregar ≠ TC passar. Passa só se o RESULTADO ESPERADO for atingido. BLOQUEADO. |
| "PASSED (partial)" | Não existe. PASSED = fluxo completo, do login à prova final. BLOQUEADO. |
| "TC parecido já passou, esse herda o resultado" | Cada TC roda isolado. Sem herança. BLOQUEADO. |
| "Vou pular este TC porque é trivial" | Trivial ≠ opcional. Execute todos. BLOQUEADO. |
| "Vou rodar metade, se passar rodo o resto" | O Gateway 10 → 11 exige 100% executado com evidência. BLOQUEADO. |
| "TC é N/A neste build/tenant" | Se é N/A, devia ter sido BLOCKED no pre-flight. Pular silenciosamente na execução = BLOQUEADO. |
| "BLOCKED — não consigo acessar" | Resolva o bloqueio: CRIE AS CONDIÇÕES. Você tem ambiente dev. BLOQUEADO se não tentou criar. |
| "Não tenho o usuário/dado/estado certo" | CRIE. Signup, insert no DB, painel admin, chamada de API — o que for preciso. BLOQUEADO. |
| "Vou marcar PASSED e tirar screenshot depois" | Sem screenshot tirado durante a execução = sem TC. BLOQUEADO. |
| "Testei no Android, no iOS funciona igual" | NÃO. iOS é outra execução. Mobile = 2 plataformas, sempre. BLOQUEADO. |
| "Disclosure de que não rodei X me libera de marcar PASSED" | **Disclosure ≠ compliance.** Dizer "não rodei" não torna OK marcar PASSED — disclosure honesta de violação ainda é violação. BLOQUEADO. |
| "Criei só task por grupo, TCs individuais são desnecessários" | Ambas as camadas são obrigatórias: grupo = organização, TC individual = rastreamento granular. BLOQUEADO. |
| "Fix foi trivial, não precisa re-review" | QUALQUER fix volta ao Step 9. BLOQUEADO. |

## Gateway 10 → 11 (o mais crítico)

**Pré-requisitos formais (ambos obrigatórios, publicados no chat ANTES deste Gateway):** o **Audit Pré-Execução** ✅ (ratio M==N de TaskCreate individual, antes de qualquer TC rodar) e o **Audit Pós-Execução** ✅ (ratio C==N de completed + E==N de evidência). **Sem os dois no chat com ✅, este Gateway não pode ser publicado** — publicá-lo sem eles é violação automática.

| Critério | Verificação obrigatória |
|----------|-------------------------|
| Audit Pré-Execução publicado ✅? | Bloco visível no chat com ratio M==N confirmado antes do primeiro TC |
| Audit Pós-Execução publicado ✅? | Bloco visível no chat com C==N, E==N, status agregado 100% PASSED |
| Cada TC tem TaskCreate próprio? | Duas camadas: 1 por grupo + 1 por TC individual. Ambas obrigatórias |
| Todos TCs executados via front? | Cada TC tem screenshot com path documentado em `kanban/10-run-test/` |
| Evidence count = TC count? | Reconciliação: Predicted N = Evidence M. Delta = 0 obrigatório |
| Zero NOT_RUN / SKIPPED / BLOCKED? | Nenhum TC sem status de execução real |
| Zero FAILED? | TODOS os TCs em PASSED |
| Zero mudanças no último ciclo? | Último passe = 100% PASSED SEM nenhum fix de código |
| Mobile: iOS + Android cobertos? | Toda feature mobile com evidência nas DUAS plataformas |
| Nenhum TC passou por workaround? | Todo fix do ciclo respeita os princípios (`/principles`). TC que só passa violando SRP/DRY = **FAILED disfarçado**. O fix vai **para o motor**, nunca de remendo no chamador |
| UI: evidência por estado × breakpoint? | Cada TC de UI com evidência nos **estados** (vazio, carregando, erro, sucesso, limite) e nos **breakpoints do projeto**, não só o happy path em desktop (`/front`) |

```markdown
## Gateway Check — Step 10 → Step 11
- Audit Pré-Execução publicado? ✅ SIM (referência ao bloco) / ❌ NÃO
- Audit Pós-Execução publicado? ✅ SIM (referência ao bloco) / ❌ NÃO
- TCs planejados: N
- Tasks de grupo criadas: G (✅ todos os TCs cobertos por algum grupo)
- Tasks individuais criadas (1 por TC): N (✅ ratio 1:1)
- TCs executados com evidência: N (✅ delta = 0)
- Status: N PASSED, 0 FAILED, 0 NOT_RUN, 0 SKIPPED, 0 BLOCKED
- Último ciclo sem mudanças de código? ✅ SIM
- Mobile iOS + Android? ✅ SIM / N/A (escopo derivado no Step 4 confirma feature sem superfície mobile)
- UI: evidência por estado × breakpoint? ✅ SIM / N/A (sem superfície visual)
- **Princípios (SOLID · DRY · KISS · YAGNI · LoD · Motores):** ✅ nenhum fix do ciclo passou por workaround — os fixes voltaram ao Step 9 e foram para o motor, não para o chamador
- **Refatoração (tudo por onde passou):** ✅ o perímetro dos fixes deste ciclo foi reaberto e elevado
- **Design (tokens · atomicidade · composição · estados · a11y):** ✅ nenhum fix visual foi remendo de CSS   ← só com superfície visual
- **Follow-ups detectados neste step:** N (registrados no ledger, classificados A/B/C) / nenhum
- **Veredicto: ✅ LIBERADO para Step 11** / ❌ BLOQUEADO — motivo: [listar]
```

> Follow-up de balde B **não bloqueia este gateway** (o TC da feature passou) — ele bloqueia o **Step 11**, logo a seguir. Registrar aqui é o que garante que ele chegue lá.
