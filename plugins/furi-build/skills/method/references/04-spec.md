# Step 4 — Spec (Autonomous Decision Loop)

## Reler antes

- Steps 1-3

## Artefato

- **Pasta:** `docs/04-spec/`
- **Arquivo:** `<tópico>.md`
- **Arquivo (feature com superfície visual):** `docs/04-spec/design-system.md` — **vive entre features**, não é por tópico. Ver § Design System abaixo.

## Design System — o artefato que evolui com o produto

Feature com superfície visual **decide o DS aqui** (doutrina completa: `design.md`). O arquivo é único e cumulativo: cada feature lê, usa e **faz crescer**.

```markdown
# Design System

## Tokens (SSOT)
| token | valor | uso |
|---|---|---|
| color.surface.raised | … | cards, popovers |
| space.4 / radius.md / motion.fast | … | … |

## Componentes
| componente | nível | estados prontos |
|---|---|---|
| Button | átomo | hover · focus-visible · active · disabled · loading |
| EmptyState | molécula | — |

## Padrões de interação
- Ação destrutiva sempre confirma; "Salvar" é sempre o mesmo rótulo e o mesmo lugar.

## Breakpoints e a11y alvo
- Breakpoints do projeto: … · piso 320px · WCAG **AA**

## Esta feature promove ao DS
- `motion.fast` (token novo) — nenhum token cobria transição de foco
- `<EmptyState>` — extraído de 3 telas que repetiam o mesmo bloco
```

**Ordem obrigatória ao precisar de algo:** **reusar** → **compor** → **promover** (criar no DS, nunca na pasta da feature).

**Projeto sem DS?** A primeira feature o **funda** com o mínimo que os UCs exigem — sem inventar paleta inteira para uma tela (YAGNI vale aqui igual). As seguintes o fazem crescer.

**Superfície visual é DERIVADA aqui** (sim/não), como o escopo de plataforma — nunca declarada pelo usuário. É o que liga ou desliga a linha de **Design** nos gateways seguintes.

## Regra central

**Resolva TODAS as decisões autonomamente — sem parar para perguntar ao usuário.**

**Para a SOLUÇÃO técnica: REFERÊNCIAS DE QUALIDADE são OBRIGATÓRIAS.** Big pop tech apps, players do mesmo domínio do negócio, OU qualquer outra referência relevante (mesmo de outro segmento) que contribua para a análise — a solução padrão de mercado é a baseline para competir no nível #1. Complexidade aceitável para atingir essa qualidade é REQUISITO, não obstáculo.

A AI resolve cada decisão usando (em ordem de prioridade):

1. **Padrões do projeto** — código existente, CLAUDE.md, `docs/04-spec/technical/patterns.md`, convenções já adotadas
2. **Big apps como referência** — big pop tech apps / líderes do mesmo domínio
3. **Boas práticas de mercado** — padrões consagrados de engenharia de alto nível
4. **Princípios de engenharia e design** — SOLID completo (SRP, OCP, LSP, ISP, DIP), DRY, KISS, YAGNI, Law of Demeter e Motores (`principios.md`); tokens, atomicidade, composição, headless, estados e a11y (`design.md`); Clean Architecture, OWASP, performance, escalabilidade

> Os princípios não são só o desempate nº 4: eles **filtram** o resultado dos níveis 1-3. Uma decisão que vem de "big app faz assim" mas viola YAGNI (nenhum UC exige) ou DRY (o projeto já tem esse mecanismo) **não passa** — volta para "alternativas descartadas".

## Autonomous Decision Loop

```
ROUND = 0

REPETIR até zero gaps:
  ROUND += 1

  1. ANALISAR — Releia TUDO:
     - Docs steps 1-3
     - Decisões tomadas em rounds anteriores
     - Código existente relevante
     - CLAUDE.md e docs/04-spec/technical/patterns.md

  2. IDENTIFICAR GAPS — Decisões em aberto:
     Stack/tecnologia | Regras de negócio | UI/UX e consistência visual | Edge cases
     Integrações | Permissões/roles | Dados/schemas | Performance | Segurança
     **Escopo de plataforma** (web/android/ios) — derivado da feature, não declarado
     **Superfície visual** (sim/não) — derivada aqui; se sim, o Design System entra como gap
     **Design System** — que token/componente já existe? o que será reusado, composto ou **promovido**?
     **Motores** — qual capacidade esta feature exige, e quem é o dono dela?
     **UI/UX obrigatório:** como features similares se comportam no app hoje? como big apps resolvem?

  3. RESOLVER CADA GAP — Para cada decisão:
     - Decisão tomada (clara, direta)
     - Justificativa (por que esta é a melhor escolha)
     - Referência (padrão do projeto / big app / princípio)
     - **UC que a exige** (Step 3) — sem UC, a decisão é especulativa (YAGNI) → vai para descartadas
     - **Já existe no projeto?** (DRY) — mecanismo equivalente encontrado → a decisão é REUSAR/ESTENDER, não criar
     - Alternativas descartadas (o que foi considerado e por que saiu)

  4. RE-ANALISAR (do zero) — Com decisões tomadas, releia TUDO:
     - Decisões geraram NOVAS ambiguidades?
     - Contradições com algo anterior?
     - Dimensões não cobertas? (segurança, performance, a11y, mobile, i18n, rollback)
     - A decisão pede **token ou componente que o DS não tem**? → reusar / compor / **promover** (registre em `design-system.md`)
     - A decisão espalha uma regra que já tem dono? → **absorve no motor**

  5. DECISÃO: gaps restantes? → novo round. Zero gaps? → sair.

SAÍDA: "✅ Spec completo — [N] rounds, [M] decisões, zero ambiguidades"
  - Resumo de TODAS as decisões com justificativas.
```

## Regras do Loop

- **Sem limite de rounds** — rode quantos for necessário.
- **Cada round re-analisa TUDO do zero** — não confie na memória.
- **Mínimo 1 round** — features "simples" escondem complexidade.
- **NÃO pergunte ao usuário** — resolva baseado na hierarquia acima.
- **Contradição interna** → resolva pela opção mais consistente com o projeto existente; documente o motivo.
- **Hierarquia de decisão:** padrão existente no projeto > big apps > boas práticas > julgamento técnico.
- **Qualidade > velocidade** — 5 rounds com spec perfeito > 1 round com retrabalho.

## Escopo de Plataforma — Derivado, não declarado

**PROIBIDO** aceitar "web-only, skip mobile" como declaração do usuário. O escopo de plataforma é derivado da Verificação de Realidade (Step 3) + análise do projeto:

- Projeto tem app mobile? Feature tem superfície mobile?
- Se superfície existe em mobile → TCs mobile OBRIGATÓRIOS (Android + iOS).
- Se projeto é web-only (confirmado por ausência de código mobile) → documentar explicitamente no spec "feature não tem superfície mobile".

## Quando parar e perguntar

**Apenas se:**
1. Decisão **IRREVERSÍVEL** (rollback custoso, escolha de fornecedor, estrutura de dados core)
2. **2+ caminhos radicalmente opostos** (não variações sutis)
3. **Alto impacto** que só o usuário pode julgar

"Não tenho certeza do melhor approach" **NÃO** é motivo para parar. Resolva pela hierarquia e documente.

## Princípios neste step (`principios.md`)

**Este é o step onde a arquitetura é decidida — e onde YAGNI é MAIS BARATO.** Uma abstração recusada aqui custa uma linha; recusada no Step 8 custa reescrever o que já foi codado.

- **YAGNI** — cada decisão declara o **UC que a exige**. Sem UC → não entra, vai para "alternativas descartadas" com o motivo. Camada, flag, config, tabela ou abstração "pro futuro" = especulação.
- **DRY** — antes de decidir criar, procure: o projeto já resolve isso? (grep + `patterns.md` + CLAUDE.md). Se sim, a decisão é **reusar/estender**, e isso fica escrito.
- **SRP** — as fronteiras de módulo/camada saem daqui: quem é dono de quê, o que é service, o que é UI, o que é shared. Fronteira mal desenhada aqui vira o "service que faz tudo" no 7b.
- **KISS** — entre duas soluções que atingem o nível #1, ganha a mais simples. Complexidade só se paga com requisito, nunca com elegância.
- **Law of Demeter / acoplamento** — decisões de integração declaram a direção da dependência (`shared → api/web` ok; `api ↔ web` proibido) e **quem fala com quem**. Fronteira mal desenhada aqui vira `a.b.c.d` no 7b.
- **OCP** — onde a solução vai precisar crescer? O **ponto de extensão é decisão**, não improviso do 7b. Sem isso, o crescimento vira `if` novo no meio do que já funcionava.
- **DIP** — decisões declaram dependência de **abstração**, não de implementação: o motor define o contrato, a infra (banco, HTTP, lib) implementa. Direção aponta ao domínio.
- **Motor** — **é aqui que o motor é nomeado e desenhado**: fronteira, contrato público, o que fica dentro e o que fica fora. Cada decisão declara **qual motor é dono da regra**; regra sem dono é regra que vai nascer espalhada.
- **Refatoração** — decisão que replica mecanismo já existente vira decisão de **estender o motor que já existe**, não de criar um irmão.
- **Design** (se tem UI) — o step decide o **DS**: inventário em `docs/04-spec/design-system.md`, o que reusa / compõe / **promove**, qual padrão consagrado se aplica (Jakob) e o motivo de qualquer desvio, breakpoints, a11y alvo (AA) e benchmark visual citado. Ver `design.md`.

## Gateway 4 → 5

- [ ] Autonomous Decision Loop fechou com **zero gaps**
- [ ] Cada decisão com justificativa + referência + alternativas descartadas
- [ ] **Cada decisão declara o UC que a exige** (YAGNI) — sem UC, foi para descartadas
- [ ] **Reúso verificado antes de criar** (DRY) — decisões que o projeto já resolve viraram "reusar/estender"
- [ ] Fronteiras de módulo/camada explícitas (SRP) + direção de dependências declarada (DIP/LoD) + pontos de extensão previstos (OCP)
- [ ] **Cada decisão declara qual motor é dono da regra**; motor novo nomeado e com contrato desenhado
- [ ] Escopo de plataforma derivado (não declarado)
- [ ] **Superfície visual derivada** (sim/não) — publicada no gateway; é ela que liga/desliga a linha de Design daqui em diante
- [ ] **Se tem UI:** `docs/04-spec/design-system.md` inventariado; promoções ao DS declaradas; breakpoints e a11y alvo (AA) definidos; benchmark visual citado
- [ ] Artefato `docs/04-spec/<tópico>.md` existe com conteúdo substantivo
- [ ] **Princípios declarados** na linha do Gateway Check
- [ ] **Refatoração declarada** na linha própria do Gateway Check
- [ ] **Design declarado** na linha própria — ou `❌ N/A — sem superfície visual, derivado do Step 4` (a declaração **única**, que os gateways seguintes herdam)
