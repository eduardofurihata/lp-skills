# Step 4 — Spec (Autonomous Decision Loop)

## Reler antes

- Steps 1-3

## Artefato

- **Pasta:** `docs/04-spec/`
- **Arquivo:** `<tópico>.md`
- **Arquivo (feature com superfície visual):** `docs/04-spec/design-system.md` — **vive entre features**, não é por tópico. Ver § Design System abaixo.
- **Arquivo (padrões de código):** `.claude/patterns.md` — **vive entre features**, é do projeto. Ver § Padrões do projeto abaixo.

## Design System — o artefato que evolui com o produto

Feature com superfície visual **decide o DS aqui** (doutrina completa: `ui/SKILL.md`). O arquivo é único e cumulativo: cada feature lê, usa e **faz crescer**.

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

## Texto gerado por IA — a outra superfície derivada

**Superfície de texto gerado por IA é DERIVADA aqui** (sim/não), pelo mesmo mecanismo: a feature **produz ou altera texto que o usuário final lê como saída do sistema** — resposta de chat, resumo, e-mail ou notificação gerada, persona/prompt, resposta de RAG, troca de modelo. Nunca declarada pelo usuário; derivada dos UCs. É o que liga ou desliga a linha de **Texto de IA** nos gateways seguintes — e ela nasce `N/A` em feature sem isso, como Design nasce `N/A` sem tela.

### O produto antes da feature — a derivação em dois níveis

Antes de derivar a feature, derive o **produto**, exatamente como este step já faz com plataforma ("o projeto tem app mobile?"): **o core deste produto é IA?** Sinais verificáveis, não opinião — SDK de LLM nas dependências, prompts ou templates de saída versionados no repositório, serviço/rota de agente ou de chat, e o que o `CLAUDE.md`/README declara que o produto é.

**Produto cujo core é IA ⇒ a superfície da feature nasce `sim`.** Isso não é veredicto: a derivação continua sendo feita e publicada no Gateway 4 → 5. O que muda é o ponto de partida — e, com ele, de que lado fica o ônus da prova. Produto sem isso ⇒ deriva do zero, como sempre.

Derivou o produto? O achado é **padrão do projeto**: registre-o em `.claude/patterns.md` (§ Esta feature promove), para as próximas features não re-derivarem o mesmo fato — **registro do que foi derivado, nunca declaração que substitua a derivação**. Sem o arquivo, deriva-se de novo; nada se perde.

### Se `sim`: a referência #1 e o que "ler bem" significa

Duas decisões entram no loop como gap, e são escritas no spec:
- **A referência #1** — qual produto lê melhor neste tipo de saída (ChatGPT, Claude, o líder do domínio). Ela é o **piso**: "funcionar" não é a barra, e **empatar também não** — a barra é ler melhor que o melhor.
- **O que "ler bem" significa aqui** — tom e persona, concisão, formatação, idioma do usuário, **sem truncamento, sem placeholder, sem alucinação, sem robótico**. Isso vira o `Resultado:` de pelo menos um TC no Step 5 e o critério de FAILED no Step 9: texto que lê **igual ou pior** que a referência é teste falho, mesmo com o código certo.

Isso é da **saída lida**, não do modelo nem da infra: prompt, RAG e troca de modelo entram porque mudam o que o usuário lê.

### Se `não`: a justificativa é nomeada

`sim` se paga sozinho — a referência #1 e o "ler bem" entram no spec e são cobrados até o Step 9. `não` é a resposta barata, e por isso é a que se cobra. Quem deriva `não` escreve no spec **duas afirmações nomeadas**:

1. **Qual saída esta feature produz ou altera** — a tela, o registro, o número, o arquivo, o e-mail, o log.
2. **Por que o usuário final não a lê como saída do sistema** — porque ninguém a vê, porque quem a vê é outro sistema, ou porque o texto é escrito por pessoa (ou é constante) e a feature apenas o transporta.

Sem as duas, a derivação não aconteceu e o **Gateway 4 → 5 está BLOQUEADO**. "Não tem tela", "é backend", "é infra" não são justificativa: nenhuma das três fala da saída. E num produto cujo core é IA, a justificativa diz também **por que esta feature é a exceção**.

| Racionalização proibida | Realidade |
|------------------------|-----------|
| "É só troca de modelo / ajuste de prompt / RAG — isso é infra" | O que o usuário lê mudou. É **sim**, e a referência #1 entra no spec. |
| "Não tem tela, logo não tem superfície de texto" | Superfície de texto ≠ superfície visual. E-mail, push, webhook lido por humano, resposta que vira mensagem no WhatsApp — todos contam. |
| "O texto quem escreve é o modelo, não eu" | O usuário não lê o modelo, lê o seu produto. Quem entrega a saída responde por ela. |
| "É uma saída curta — um título, uma tag, um resumo de uma linha" | Tamanho não é critério. Se o usuário lê, vale a barra. |

## Padrões do projeto — `.claude/patterns.md`, o artefato que evolui com o código

O nível 1 da hierarquia de decisão ("padrões do projeto") precisa de um lugar onde o padrão esteja **escrito**, não só implícito no código. Esse lugar é **`.claude/patterns.md`** — um arquivo único e cumulativo, versionado, do projeto (não por feature, não da máquina): cada feature **lê, usa e faz crescer**. Mora em `.claude/` junto de `setup.md` (convenções do time — dono `/setup`, `furi-ship`), `deploy.md` e `infra.md`; nenhum deles é auto-carregado — este step o lê por caminho, como lê o `CLAUDE.md`: `cat .claude/patterns.md 2>/dev/null || cat .claude/patterns.local.md 2>/dev/null`. **`patterns.local.md`** é a variante de quem trabalha num repositório de time que não usa este processo (`.claude/` ignorado de propósito; o sinal é existir `setup.local.md` e não `setup.md`) — mesmo formato, fora do git, **não** entra no commit do Step 10. O do time vence quando os dois existem.

```markdown
# Padrões do projeto

## Estrutura
- feature-first: `src/features/<área>/{ui,model,api}` · shared só o que 2+ features usam

## Nomenclatura
- arquivos kebab-case · componentes PascalCase · hooks `use*` · motores `<Coisa>Engine`

## Dados e validação
- schema Zod na borda (rota/form); dentro do motor o dado já é confiável

## Erros
- `Result<T, E>` nos motores; `throw` só na borda HTTP

## Esta feature promove
- `Result<T, E>` — 3 motores tratavam erro de 3 jeitos
```

**Ordem obrigatória ao decidir:** **seguir** o que está escrito → **estender** (caso novo do mesmo padrão) → **promover** (padrão que esta feature fixou e as próximas vão precisar — escrever aqui, na seção `## Esta feature promove`, e depois consolidar na seção certa). Padrão que vive só na cabeça de quem codou não é padrão: é a próxima inconsistência.

**Projeto sem `patterns.md`?** A primeira feature o **funda** com o mínimo que ela mesma fixou — sem inventar guia de estilo inteiro (YAGNI vale aqui igual). As seguintes o fazem crescer.

O arquivo também é onde fica registrado o que a derivação do **produto** já apurou (§ Texto gerado por IA — "o core deste produto é IA?"), para as próximas features não re-derivarem o mesmo fato. É **registro do derivado**, não declaração: a derivação de cada feature continua acontecendo e sendo publicada no gateway.

**Migração (uma vez por projeto):** o arquivo existe no caminho antigo — `docs/00-context/technical/patterns.md` ou `docs/04-spec/technical/patterns.md` — e não em `.claude/`? `mkdir -p .claude && git mv <caminho-antigo> .claude/patterns.md`, avisar, e o `git mv` entra no commit do Step 10. Se `.claude/` estiver no `.gitignore`, **não decida sozinho**: pode ser o time mantendo processo de agente fora do repo — aí o destino é `patterns.local.md` (e o antigo sai do índice: `git rm --cached`). Quem decide o modo é o `/setup` (`furi-ship`); sem ele, pergunte.

## Regra central

**Resolva TODAS as decisões autonomamente — sem parar para perguntar ao usuário.**

**Para a SOLUÇÃO técnica: REFERÊNCIAS DE QUALIDADE são OBRIGATÓRIAS.** Big pop tech apps, players do mesmo domínio do negócio, OU qualquer outra referência relevante (mesmo de outro segmento) que contribua para a análise — a solução padrão de mercado é a **baseline** — o piso a partir do qual se compete; a barra é 10x acima dela. Complexidade aceitável para atingir essa qualidade é REQUISITO, não obstáculo.

A AI resolve cada decisão usando (em ordem de prioridade):

1. **Padrões do projeto** — código existente, CLAUDE.md, `.claude/patterns.md`, convenções já adotadas
2. **Big apps como referência** — big pop tech apps / líderes do mesmo domínio
3. **Boas práticas de mercado** — padrões consagrados de engenharia de alto nível
4. **Princípios de engenharia e design** — SOLID completo (SRP, OCP, LSP, ISP, DIP), DRY, KISS, YAGNI, Law of Demeter e Motores (`principles/SKILL.md`); tokens, atomicidade, composição, headless, estados e a11y (`ui/SKILL.md`); Clean Architecture, OWASP, performance, escalabilidade

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
     - CLAUDE.md e .claude/patterns.md

  2. IDENTIFICAR GAPS — Decisões em aberto:
     Stack/tecnologia | Regras de negócio | UI/UX e consistência visual | Edge cases
     Integrações | Permissões/roles | Dados/schemas | Performance | Segurança
     **Escopo de plataforma** (web/android/ios) — derivado da feature, não declarado
     **Superfície visual** (sim/não) — derivada aqui; se sim, o Design System entra como gap
     **Superfície de texto gerado por IA** (sim/não) — derivada aqui, começando pelo **produto** (core de IA ⇒ nasce `sim`);
       se sim, a referência #1 e "o que ler bem significa" entram como gap; se não, a saída nomeada e o porquê de não ser lida
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

## Princípios neste step (`principles/SKILL.md`)

**Este é o step onde a arquitetura é decidida — e onde YAGNI é MAIS BARATO.** Uma abstração recusada aqui custa uma linha; recusada no Step 8 custa reescrever o que já foi codado.

- **YAGNI** — cada decisão declara o **UC que a exige**. Sem UC → não entra, vai para "alternativas descartadas" com o motivo. Camada, flag, config, tabela ou abstração "pro futuro" = especulação.
- **DRY** — antes de decidir criar, procure: o projeto já resolve isso? (grep + `.claude/patterns.md` + CLAUDE.md). Se sim, a decisão é **reusar/estender**, e isso fica escrito.
- **SRP** — as fronteiras de módulo/camada saem daqui: quem é dono de quê, o que é service, o que é UI, o que é shared. Fronteira mal desenhada aqui vira o "service que faz tudo" no 7b.
- **KISS** — entre duas soluções que atingem o nível 10x, ganha a mais simples. Complexidade só se paga com requisito, nunca com elegância.
- **Law of Demeter / acoplamento** — decisões de integração declaram a direção da dependência (`shared → api/web` ok; `api ↔ web` proibido) e **quem fala com quem**. Fronteira mal desenhada aqui vira `a.b.c.d` no 7b.
- **OCP** — onde a solução vai precisar crescer? O **ponto de extensão é decisão**, não improviso do 7b. Sem isso, o crescimento vira `if` novo no meio do que já funcionava.
- **DIP** — decisões declaram dependência de **abstração**, não de implementação: o motor define o contrato, a infra (banco, HTTP, lib) implementa. Direção aponta ao domínio.
- **Motor** — **é aqui que o motor é nomeado e desenhado**: fronteira, contrato público, o que fica dentro e o que fica fora. Cada decisão declara **qual motor é dono da regra**; regra sem dono é regra que vai nascer espalhada.
- **Refatoração** — decisão que replica mecanismo já existente vira decisão de **estender o motor que já existe**, não de criar um irmão.
- **Design** (se tem UI) — o step decide o **DS**: inventário em `docs/04-spec/design-system.md`, o que reusa / compõe / **promove**, qual padrão consagrado se aplica (Jakob) e o motivo de qualquer desvio, breakpoints, a11y alvo (AA) e benchmark visual citado. Ver `ui/SKILL.md`.

## Gateway 4 → 5

- [ ] Autonomous Decision Loop fechou com **zero gaps**
- [ ] Cada decisão com justificativa + referência + alternativas descartadas
- [ ] **Cada decisão declara o UC que a exige** (YAGNI) — sem UC, foi para descartadas
- [ ] **Reúso verificado antes de criar** (DRY) — decisões que o projeto já resolve viraram "reusar/estender"
- [ ] Fronteiras de módulo/camada explícitas (SRP) + direção de dependências declarada (DIP/LoD) + pontos de extensão previstos (OCP)
- [ ] **Cada decisão declara qual motor é dono da regra**; motor novo nomeado e com contrato desenhado
- [ ] Escopo de plataforma derivado (não declarado)
- [ ] **Superfície visual derivada** (sim/não) — publicada no gateway; é ela que liga/desliga a linha de Design daqui em diante
- [ ] **Superfície de texto gerado por IA derivada** (sim/não) — publicada no gateway, a partir do **produto** (core de IA ⇒ nasce `sim`). **`sim`** → a referência #1 e o "ler bem" estão no spec. **`não`** → o spec nomeia **a saída que a feature produz** e **por que o usuário final não a lê como saída do sistema** ("não tem tela / é backend / é infra" não conta). É ela que liga/desliga a linha de Texto de IA daqui em diante
- [ ] **Se tem UI:** `docs/04-spec/design-system.md` inventariado; promoções ao DS declaradas; breakpoints e a11y alvo (AA) definidos; benchmark visual citado
- [ ] **`.claude/patterns.md` lido** (nível 1 da hierarquia); padrões que esta feature fixa **promovidos** a ele — ou declarado que coube nos existentes; projeto sem o arquivo → fundado com o mínimo. Derivação de produto já registrada nele é **ponto de partida**, nunca substituto da derivação desta feature
- [ ] Artefato `docs/04-spec/<tópico>.md` existe com conteúdo substantivo
- [ ] **Princípios declarados** na linha do Gateway Check
- [ ] **Refatoração declarada** na linha própria do Gateway Check
- [ ] **Design declarado** na linha própria — ou `❌ N/A — sem superfície visual, derivado do Step 4` (a declaração **única**, que os gateways seguintes herdam)
