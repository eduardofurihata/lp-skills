# Step 4 — Spec

**Toda decisão em aberto, resolvida aqui — sem perguntar.** Zero ambiguidade sobra para os steps seguintes.

**Chame e use:** `/solve` · `/principles` · `/front` (se tem UI) — os três via Skill tool · `11-follow-ups.md`

## Artefato

`docs/04-spec/<tópico>.md` — nome por domínio; doc que já cobre o domínio se **atualiza**, não se duplica (`00-start.md`).

```markdown
# <Tópico> — Spec

## Escopo derivado
- **Plataformas:** web · android · ios — <o que a Verificação de Realidade (Step 3) e o código do projeto sustentam>
- **Superfície visual:** sim / não — <por quê>

## Decisões
### D-N — <decisão em uma frase>
- **Justificativa:** <por que esta é a melhor escolha>
- **Referência:** <`/solve` (big app / boa prática / princípio) ou código existente>
- **UC que exige:** UC-N
- **Já existe no projeto?** <mecanismo encontrado → reusar/estender | nada → criar>
- **Descartadas:** <alternativa — por que saiu>
```

## Hierarquia de decisão

Cada decisão se resolve, nesta ordem:

1. **`/solve`** — a referência #1: big pop tech apps / líderes do domínio, boas práticas consagradas (Clean Architecture, OWASP, performance, escalabilidade) e os princípios (`/principles`; `/front` se tem UI)
2. **Código existente** — o código do projeto, CLAUDE.md, `.claude/patterns.md`, convenções já adotadas

## Autonomous Decision Loop

```
ROUND = 0

REPETIR até zero gaps:
  ROUND += 1

  1. ANALISAR — releia TUDO:
     - Docs dos Steps 1-3
     - Decisões dos rounds anteriores
     - Código existente relevante
     - CLAUDE.md e .claude/patterns.md

  2. IDENTIFICAR GAPS — decisões em aberto:
     Stack/tecnologia | Regras de negócio | Edge cases | Integrações
     Permissões/roles | Dados/schemas | Performance | Segurança
     **Escopo de plataforma** (web/android/ios) — derivado, não declarado
     **Superfície visual** (sim/não) — derivada, não declarada
     **Motores** — qual capacidade esta feature exige, e quem é o dono dela?

  3. RESOLVER CADA GAP — no formato D-N do artefato:
     decisão · justificativa · referência · UC que exige · já existe? · descartadas

  4. RE-ANALISAR (do zero) — com as decisões tomadas, releia TUDO:
     - Decisões geraram NOVAS ambiguidades? Contradizem algo anterior?
     - Dimensões não cobertas? (segurança, performance, i18n, rollback)
     - A decisão espalha uma regra que já tem dono? → **absorve no motor**

  5. DECISÃO: gaps restantes? → novo round. Zero gaps? → sair.

SAÍDA: "✅ Spec completo — [N] rounds, [M] decisões, zero ambiguidades"
```

- **Sem limite de rounds** — rode quantos for necessário.
- **Cada round re-analisa TUDO do zero** — não confie na memória.
- **Mínimo 1 round** — features "simples" escondem complexidade.
- **Contradição interna** → a opção mais consistente com o projeto existente; documente o motivo.

## Escopo derivado, nunca declarado

**PROIBIDO** aceitar "web-only, skip mobile" ou "isso não tem UI" como declaração do usuário. Os dois saem da Verificação de Realidade (Step 3) + análise do projeto:

- Projeto tem app mobile? A feature tem superfície mobile? Se tem → Android e iOS entram no escopo.
- Projeto web-only (confirmado pela ausência de código mobile) → o spec documenta "feature não tem superfície mobile".
- **Superfície visual = sim** quando algum UC lista estados de tela (Step 3) ou algum passo do happy path acontece numa tela do projeto.

## Princípios neste step

O step onde a arquitetura é decidida — **é aqui que YAGNI é mais barato**.

- **YAGNI** — toda decisão declara o **UC que a exige**; sem UC → não entra (vai para "alternativas descartadas").
- **DRY** — decisão que replica mecanismo já existente no projeto → a decisão é **reusar**.
- **KISS** — entre duas soluções que atingem o nível #1, ganha a mais simples: complexidade só se paga com requisito, nunca com elegância.
- **SRP** — fronteiras de módulo/camada explícitas.
- **DIP + LoD** — cada decisão declara dependência de **abstração**, não de implementação (o motor define o contrato, a infra implementa), a **direção da dependência** e quem fala com quem. Fronteira mal desenhada aqui vira `a.b.c.d` no 8b.
- **OCP** — onde a solução vai precisar crescer? o ponto de extensão é decisão, não improviso.
- **Motor** — cada decisão declara **qual motor é dono da regra**; motor novo é nomeado e tem contrato desenhado aqui.
- **Refatoração** — decisão que replica mecanismo existente vira **estender o motor que já existe**.
- **Design** — aqui se **deriva a superfície visual** (§ Escopo derivado, nunca declarado). Decisão de arquitetura não fixa tela: o que é visual espera o 4b.

## PARE se pensar

- **"Não tem UI, pulo o `/front`."** Superfície visual é **derivada** aqui, nunca declarada. Sem ela, declare `❌ N/A` uma vez no Gateway 4 → 5 — é o que dispensa o `/front` dali em diante. Antes disso, BLOQUEADO.

## Gateway 4 → 5

- [ ] Autonomous Decision Loop fechou com **zero gaps**
- [ ] Cada decisão (D-N) com justificativa + referência (`/solve` > código existente) + alternativas descartadas + **UC que a exige**
- [ ] Cada decisão declara **qual motor é dono da regra**, a **direção da dependência** e o ponto de extensão previsto
- [ ] **Escopo de plataforma** (web/android/ios) **derivado** aqui, não declarado
- [ ] **Superfície visual derivada** (sim/não) — é o que liga o Step 5 e a linha de design nos gateways seguintes
- [ ] Artefato `docs/04-spec/<tópico>.md` existe com conteúdo substantivo
- [ ] As **quatro linhas obrigatórias** publicadas (`SKILL.md` § Gateway Check)

**Sem superfície visual:** a linha de Design declara `❌ N/A — derivado do Step 4` **uma vez** aqui, o Step 5 não roda e os gateways seguintes herdam — o próximo é o **Step 6**.
