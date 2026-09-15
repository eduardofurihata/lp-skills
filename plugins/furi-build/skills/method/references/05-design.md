# Step 5 — Design

**Como cada tela deveria ser — decidida antes de qualquer código, a partir do design system.** Só roda com superfície visual (derivada no Step 4); sem ela, o Gateway 4 → 5 já declarou N/A e o próximo step é o 6.

**Chame e use:** `/solve` · `/principles` · `/front` — os três via Skill tool · `11-follow-ups.md` · `rationalizations.md`

## Artefato

`docs/05-design/<tópico>.md` — nome por domínio; doc que já cobre o domínio se **atualiza**, não se duplica (`00-start.md`). Toda tela que os UCs (Step 3) atravessam está aqui; tela sem UC não entra.

```markdown
# <Tópico> — Design

## Benchmark
- <big app / líder do domínio> — <o que se toma dele>
- **Padrão consagrado (Jakob):** <qual> · **desvio:** nenhum / <qual, e por quê>

## Telas
### <Tela> (UC-N, UC-M)
- **Compõe:** <componentes do DS — reusa / compõe de X+Y / promove>
- **Hierarquia:** <o elemento primário; o que vem depois>
- **Estados:** vazio · carregando · erro · sucesso · limite — <o que cada um mostra e o que o usuário faz a seguir>
- **Breakpoints:** <os do projeto, piso 320px — o que muda entre eles>

## Promove ao DS
- <token / componente> — <por que nada existente serve>   (ou: nada — a feature coube no DS existente)
```

`docs/05-design/design-system.md` — **único e cumulativo**, vive entre features: cada uma lê, usa e faz crescer. Projeto sem DS? A primeira feature o **funda** com o mínimo que os UCs exigem (YAGNI: nada de paleta inteira para uma tela).

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
```

**Ordem obrigatória ao precisar de algo:** **reusar** → **compor** → **promover** (criar no DS, nunca na pasta da feature). O que este step promove entra nas tabelas do DS **agora** — o 7b só usa.

## Princípios neste step

- **YAGNI** — promove ao DS só o que um UC pede; nada de paleta inteira para uma tela.
- **DRY** — reusar → compor → promover, nesta ordem; componente que já existe não nasce de novo.
- **KISS** — a composição mais simples que atinge o nível #1.
- **Motor** — o DS é o dono do token e do componente; peça visual na pasta da feature é regra espalhada.
- **Refatoração** — padrão do DS abaixo do nível #1 no perímetro → **eleva** (ou ledger).
- **Design** — é o corpo deste step (o artefato acima é a lente em forma de template). O que se cobra por princípio: **reusar → compor → promover** nesta ordem, promoção **registrada no DS agora** (o 7b só usa), desvio de padrão consagrado só com motivo escrito, e a11y AA como piso — não como meta.

## Gateway 5 → 6

- [ ] `docs/05-design/<tópico>.md` cobre **toda tela** que os UCs atravessam — componentes do DS (reusa / compõe / promove), hierarquia, **estados** (vazio · carregando · erro · sucesso · limite) e **breakpoints do projeto** (piso 320px)
- [ ] Benchmark visual citado; padrão consagrado (Jakob) nomeado, desvio com motivo escrito
- [ ] `docs/05-design/design-system.md` inventariado e com as **promoções já registradas** nele
- [ ] a11y alvo (**AA**) definido
- [ ] As **quatro linhas obrigatórias** publicadas (`SKILL.md` § Gateway Check)
