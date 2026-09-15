---
name: front
description: 'Use ONLY when the user explicitly invokes /front (bare /front = the target is whatever the conversation is already about), or when another skill invokes `furi-build:front` via the Skill tool. NEVER activate on your own initiative. — the design doctrine for anything with a visual surface: tokens as the single source of truth, atomic design, composition over configuration, headless, every state designed, Jakob''s law, semantic consistency, context preservation, modular flows, a design system that grows with the product (reuse → compose → promote) and the modern bar (hierarchy, spacing scale, typography, interaction states, motion, density, WCAG AA, responsive from 320px). With no target it loads the doctrine for the ongoing work; with a target (screen, component, route, folder, diff) it audits it principle by principle and by name, fixes what is below the bar without changing behaviour, and reports what went up and what the design system gained; `audit` = report only. Never commits, never creates a branch.'
effort: max
argument-hint: "[tela | componente | rota | pasta/ | diff] [audit]"
---

# /front — Design: regime, não fase

> **Esta skill é a fonte única dos princípios de design.** Nenhum outro arquivo os redefine — todos apontam para cá (DRY aplicado à própria doutrina). Quem a invoca dentro de um protocolo tem a **lente**: o que o princípio significa *naquele* passo. Irmã do `/principles`, mesma régua.

**Design não é fase — é regime.** Não existe "hora de fazer a UI ficar bonita". Vale do problema ao teste: o problema nomeia a fricção, o requisito lista os estados, o design decide as telas e o design system, o código usa token, o review cobra princípio por nome e o teste prova estado por estado.

**A quem se aplica:** tudo que tem **superfície visual** — tela, componente, fluxo. Superfície visual se **deriva** do trabalho (algum passo acontece numa tela? algum estado é visto por alguém?), nunca se declara por conveniência.

## Os princípios de design (definição canônica)

| Princípio | Regra | Falha típica |
|---|---|---|
| **Tokens = SSOT** | Cor, espaçamento, tipografia, raio, sombra, motion, z-index e breakpoint saem do **token**. Valor literal em componente é hardcode visual — mesma falha de hardcodar uma URL. Token novo é **decisão de DS registrada**, nunca constante local. | `padding: 13px`, `#3B82F6` no componente |
| **Atomicidade (Atomic Design)** | Átomo → molécula → organismo → template → página. Cada peça no seu nível; **átomo não conhece regra de negócio nem faz fetch**. Nível declarado, não implícito. | `<Button>` que chama a API |
| **Composição > configuração** | `<Card><Card.Header/></Card>` em vez de props que ligam e desligam pedaços. **>2 props booleanas de aparência → recomponha.** | `<Card variant showHeader hasIcon isCompact>` |
| **Headless (lógica ⟂ apresentação)** | Comportamento (estado, teclado, foco, validação) em hook/primitivo; aparência em componente burro. É o **SRP da UI** — e é o que deixa o mesmo comportamento servir dois visuais. | modal com fetch + layout + a11y no mesmo arquivo |
| **Component-Driven** | De baixo para cima: o componente resolve **todos os seus estados** antes de entrar na tela. **Estado não desenhado = estado quebrado.** | tela só com happy path |
| **DRY cognitivo (Lei de Jakob)** | O usuário passa a maior parte do tempo em **outros** produtos. Padrão consagrado ganha de invenção; desvio só com motivo escrito. | "inventei uma navegação nova" |
| **Consistência semântica** | A mesma ação tem o mesmo **nome, ícone, lugar e consequência** em todo o produto. Erro, vazio e sucesso falam a mesma língua. | "Salvar" aqui, "Aplicar" ali |
| **Preservação de contexto** | Nunca pedir de novo o que o sistema já sabe ou o usuário já digitou. Voltar não apaga; filtro, rascunho, scroll e seleção sobrevivem à navegação. | form que zera ao voltar |
| **Fluxos modulares** | Fluxo = etapas independentes com entrada e saída próprias, não wizard monolítico. Dá para entrar no meio, retomar de onde parou e reusar a etapa em outro fluxo. | wizard de 5 passos que só roda do começo |

Complementos inseparáveis dos 9:

- **Camadas visuais:** token → primitivo → componente do DS → composição da feature. A feature compõe; ela não redefine o primitivo.
- **Nada de estilo órfão:** CSS solto que não vem do DS é dívida — ou vira token/componente, ou não existe.

## O design system evolui com o produto

Precisou de algo que o DS não tem? **Nesta ordem, sem pular:**

1. **Reusar** — o DS já resolve? use.
2. **Compor** — dá para montar com o que existe? componha (é o que o `/proto` já faz).
3. **Promover** — não dá: crie o token/componente **no DS**, não na pasta da feature. Promoção é decisão de DS **registrada** no design system do projeto, nunca constante local.

**Componente visual novo nascendo dentro da pasta da feature = dívida de DS.** É o equivalente visual de duplicar lógica em vez de extrair o motor (`principles/SKILL.md` § Motores) — e a correção é a mesma: promover, e o chamador passa a só usar.

**O inverso também vale:** se o trabalho revela que um padrão do DS está ruim ou incompleto, isso é **achado**, não conformação — registre-o; padrão ruim não se copia "para ficar igual".

**Sem DS no projeto?** O primeiro trabalho o **funda** com o mínimo que ele exige — os tokens e componentes que o requisito pede, nada além (YAGNI vale aqui igual: não invente uma paleta inteira para uma tela). Cada trabalho seguinte o faz crescer. É assim que o DS acompanha o produto em vez de nascer grande e morrer desatualizado.

## Consistência é lei; mediocridade não é

> **A regra "siga o padrão existente" vale para consistência, NÃO para qualidade.**

Padrão existente que está abaixo do nível #1 **não se copia**. Ou você o **eleva** (é a refatoração contínua de `principles/SKILL.md` aplicada à UI — o perímetro é o mesmo: tudo por onde o trabalho passou), ou ele vira **achado registrado**. Copiar tela ruim "por consistência" é duplicar código "porque já estava assim": a inconsistência que você evitou custa menos que a mediocridade que você propagou.

Como decidir na hora:

| Situação | O que fazer |
|---|---|
| Padrão existente é bom | Siga. Consistência ganha de preferência pessoal. |
| Padrão existente é ruim **e está no perímetro** | **Eleve** — e a elevação vale para os outros usos daquele padrão que o perímetro alcança. |
| Padrão existente é ruim e está **fora** do perímetro | **Registre** o achado. Nunca copiar "para ficar igual". |
| Não existe padrão | Big pop tech apps / líderes do domínio (`/solve`), e o que você definir **vira** padrão: promova ao DS. |

## Moderno não é enfeite — o que se cobra

O benchmark do `/solve` (referência #1, calibre dos big pop tech apps) aplicado ao **visual**, não só ao comportamento:

- **Hierarquia** — o olho sabe onde olhar primeiro. **Um** elemento primário por tela; se tudo grita, nada é ouvido.
- **Escala de espaçamento** — espaçamento vem da escala do DS, e proximidade agrupa (Gestalt). Tela apertada e tela vazada são o mesmo defeito: espaçamento sem intenção.
- **Tipografia** — escala com poucos degraus, altura de linha e medida de linha legíveis. Peso é hierarquia, não decoração.
- **Estados de interação** — hover, focus-visible, active, disabled, loading, selected. **Todo elemento clicável tem os seis**; faltando um, o componente não está pronto.
- **Motion com propósito** — duração e easing vêm de token. Anima o que dá continuidade (o que entra, sai, se move); nunca o que atrasa a tarefa. Respeita `prefers-reduced-motion`.
- **Densidade** — quantidade de informação por tela é **decisão** documentada, não acidente.
- **Vazio, erro e carregando são telas de verdade** — com o que fazer a seguir. Spinner órfão e "algo deu errado" sem saída são estados não desenhados.
- **A11y — WCAG AA é piso, não meta:** contraste 4.5:1 (texto) e 3:1 (elementos de UI), foco visível, alvo de toque ≥24px, navegação completa por teclado, nome acessível em todo controle, ordem de leitura coerente.
- **Responsivo** — nos **breakpoints do projeto**, com **320px como piso**. Mobile não é desktop encolhido; desktop não é mobile esticado; nada quebra no meio do caminho.

## Aplicar a um alvo

Sem argumento, a doutrina acima passa a valer para o trabalho em curso — é isso que um protocolo que invoca esta skill quer. Com um alvo, ela vira uma passada:

1. **Alvo.** `tela`, `componente`, `rota`, `pasta/` ou `diff` (o working tree). `audit` no fim = só relatório, nada é editado.
2. **Perímetro.** O alvo + o que você abriu para entender + os componentes que ele compõe + **o design system do projeto** (tokens, tema, componentes de UI — e `docs/05-design/design-system.md`, se o projeto o mantém). Declare-o antes de mexer.
3. **Passada, princípio a princípio e POR NOME.** A tabela dos 9 é o checklist — para cada linha, a *falha típica* aconteceu aqui? Some a régua do moderno: **todos os estados** (vazio · carregando · erro · sucesso · limite; hover · focus-visible · active · disabled · loading · selected) × **breakpoints do projeto** (320px de piso) × **a11y AA**. Veja a tela rodando, estado por estado — snapshot e screenshot, não dedução do código.
4. **Corrigir** o que está abaixo do nível, dentro do perímetro: **reusar → compor → promover**, nunca peça visual solta na pasta da feature; padrão ruim no perímetro se **eleva**; zero literal onde cabe token. **Sem mudar comportamento:** o que a tela faz continua igual; se corrigir exige mudar fluxo ou regra, isso é achado, não correção. Fora do perímetro: **lista**, não mexe.
5. **Relatório**: por tela/componente, o que subiu · o que já estava no nível #1 (declarado) · **o que o DS ganhou** (tokens e componentes promovidos) · achados fora do perímetro · o que exigiria mudança de comportamento (não feito). **Nunca commita, nunca cria branch** — quem decide o que fazer com a passada é quem a pediu.

> Dentro do `/method`: quando a superfície visual é derivada (Step 4), cada step traz a **lente** desta doutrina no bullet *Design* da seção *Princípios neste step* do próprio reference (`method/references/`), e a declara na linha de design do Gateway Check (`method/SKILL.md` § Gateway Check) — mesma doutrina, cobrada step a step.

## Racionalizações proibidas

| Frase | Realidade |
|---|---|
| "O DS não tem esse componente, então crio na pasta da feature" | Reusar → compor → **promover**. Componente visual na pasta da feature é dívida de DS. BLOQUEADO. |
| "É só uma cor / um espaçamento, hardcode não faz mal" | Token é SSOT. Literal é hardcode visual, e some do radar na próxima mudança de tema. BLOQUEADO. |
| "As outras telas são assim, mantenho a consistência" | Consistência vale para padrão **bom**. Padrão ruim se eleva ou vira achado. Copiar é propagar. BLOQUEADO. |
| "Faço a a11y depois, primeiro entrego a tela" | AA é piso, não fase. Depois = nunca, e retrofit de foco/contraste custa a tela inteira. BLOQUEADO. |
| "Desktop primeiro, mobile numa próxima" | Escopo de plataforma se **deriva** do projeto (tem app mobile? a tela existe lá?), não se declara por conveniência. Se tem superfície mobile, é agora. BLOQUEADO. |
| "Estado vazio e erro eu resolvo se sobrar tempo" | Estado não desenhado = estado quebrado. É o que o usuário vê no pior dia dele. BLOQUEADO. |
| "Adiciono uma prop booleana, é mais rápido que recompor" | >2 booleanas de aparência = recomponha. Cada flag nova multiplica os caminhos a testar. BLOQUEADO. |
| "O screenshot do happy path já prova que funciona" | Evidência é por **estado × breakpoint**. Happy path em desktop é a fatia que nunca quebra. BLOQUEADO. |
| "Inventei um padrão melhor que o consagrado" | Jakob: o usuário aprendeu em outro produto. Desvio exige motivo escrito, não gosto. BLOQUEADO. |
| "Design é subjetivo, não dá pra cobrar" | Token, nível atômico, estados, contraste e breakpoint são **verificáveis**. O que se cobra aqui é isso, não gosto. BLOQUEADO. |
| "A feature é pequena, não precisa mexer no DS" | Então ela reusa. Se não reusa nem compõe, promove. "Pequena" não cria exceção. BLOQUEADO. |
| "Ajustei o CSS e aproveitei pra mudar o fluxo" | Elevar a tela preserva o que ela faz. Mudança de fluxo ou regra é achado registrado, não efeito colateral da passada. BLOQUEADO. |
