# Step 4b — Design

**Como cada tela deveria ser — decidida antes de qualquer código, a partir do design system.** Só roda com superfície visual (derivada no Step 4a); sem ela, o Gateway 4a → 4b já declarou N/A e o próximo step é o 5.

**Chame e use:** `/solve` · `/principles` · `/front` — os três via Skill tool · `lentes.md` (linha deste step) · `follow-ups.md`

## Artefato

`docs/04-design/<tópico>.md` — nome por domínio; doc que já cobre o domínio se **atualiza**, não se duplica (`inventario-docs.md`). Toda tela que os UCs (Step 3) atravessam está aqui; tela sem UC não entra.

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

`docs/04-design/design-system.md` — **único e cumulativo**, vive entre features: cada uma lê, usa e faz crescer. Projeto sem DS? A primeira feature o **funda** com o mínimo que os UCs exigem (YAGNI: nada de paleta inteira para uma tela).

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

## Gateway 4b → 5

Critérios e formato: `gateways.md` — as quatro linhas obrigatórias do Gateway Check inclusive.
