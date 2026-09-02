# Design — Fonte Única (vale em TODOS os steps de feature com superfície visual)

> **Este arquivo é a fonte única de design.** Nenhum outro arquivo redefine os princípios de design — todos apontam para cá (DRY aplicado ao próprio protocolo). O que cada step tem é a **lente**: o que o princípio significa *naquele* step. Irmão de `principios.md`, mesma régua.

**Design não é fase — é regime.** Não existe "step de fazer a UI ficar bonita". Vale do Step 1 ao Step 10: o problema nomeia a fricção, o UC lista os estados, o Spec decide o design system, o código usa token, o review cobra princípio por nome e o teste prova estado por estado.

**A quem se aplica:** feature com **superfície visual**, derivada no Step 4 (como o escopo de plataforma — nunca declarada pelo usuário). Feature sem superfície visual declara isso **uma vez** no Gateway 4→5, e os gateways seguintes herdam.

## Os princípios de design (definição canônica)

| Princípio | Regra | Falha típica |
|---|---|---|
| **Tokens = SSOT** | Cor, espaçamento, tipografia, raio, sombra, motion, z-index e breakpoint saem do **token**. Valor literal em componente é hardcode visual — mesma falha de hardcodar uma URL. Token novo é **decisão de DS registrada**, nunca constante local. | `padding: 13px`, `#3B82F6` no componente |
| **Atomicidade (Atomic Design)** | Átomo → molécula → organismo → template → página. Cada peça no seu nível; **átomo não conhece regra de negócio nem faz fetch**. Nível declarado, não implícito. | `<Button>` que chama a API |
| **Composição > configuração** | `<Card><Card.Header/></Card>` em vez de props que ligam e desligam pedaços. **>2 props booleanas de aparência → recomponha.** | `<Card variant showHeader hasIcon isCompact>` |
| **Headless (lógica ⟂ apresentação)** | Comportamento (estado, teclado, foco, validação) em hook/primitivo; aparência em componente burro. É o **SRP da UI** — e é o que deixa o mesmo comportamento servir dois visuais. | modal com fetch + layout + a11y no mesmo arquivo |
| **Component-Driven** | De baixo para cima: o componente resolve **todos os seus estados** antes de entrar na tela. **Estado não desenhado = estado quebrado.** | tela só com happy path |
| **DRY cognitivo (Lei de Jakob)** | O usuário passa a maior parte do tempo em **outros** produtos. Padrão consagrado ganha de invenção; desvio só com motivo escrito no Spec. | "inventei uma navegação nova" |
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
3. **Promover** — não dá: crie o token/componente **no DS**, não na pasta da feature. Registre em `docs/04-spec/design-system.md` (seção `## Esta feature promove ao DS`) e no done doc do Step 10.

**Componente visual novo nascendo dentro da pasta da feature = dívida de DS.** É o equivalente visual de duplicar lógica em vez de extrair o motor (`principios.md` § Motores) — e a correção é a mesma: promover, e o chamador passa a só usar.

**O inverso também vale:** se a feature revela que um padrão do DS está ruim ou incompleto, isso é **achado**, não conformação — vai para o ledger como **balde B** (`follow-ups.md`), porque este trabalho o expôs.

**Sem DS no projeto?** A primeira feature o **funda** com o mínimo que ela exige — os tokens e componentes que os UCs pedem, nada além (YAGNI vale aqui igual: não invente uma paleta inteira para uma tela). Cada feature seguinte o faz crescer. É assim que o DS acompanha o produto em vez de nascer grande e morrer desatualizado.

## Consistência é lei; mediocridade não é

> **A regra "siga o padrão existente" vale para consistência, NÃO para qualidade.**

Padrão existente que está abaixo do nível #1 **não se copia**. Ou você o **eleva** (é a refatoração contínua de `principios.md` aplicada à UI — o perímetro é o mesmo: tudo por onde a feature passou), ou ele vira **achado no ledger**. Copiar tela ruim "por consistência" é duplicar código "porque já estava assim": a inconsistência que você evitou custa menos que a mediocridade que você propagou.

Como decidir na hora:

| Situação | O que fazer |
|---|---|
| Padrão existente é bom | Siga. Consistência ganha de preferência pessoal. |
| Padrão existente é ruim **e está no perímetro** | **Eleve** — e a elevação vale para os outros usos daquele padrão que o perímetro alcança. |
| Padrão existente é ruim e está **fora** do perímetro | **Ledger** (B se este trabalho o expôs, C se não). Nunca copiar "para ficar igual". |
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

**Auto-check antes de entregar:** *"Um líder do domínio assinaria esta tela?"* Se não → não está pronta.

## Lente por step (o que cobrar em CADA um)

| Step | O que o design exige AQUI |
|---|---|
| **1 — Problema** | O problema é de UX? Nomeie a **fricção** (passo redundante, contexto perdido, ação que não se acha), não o widget. "Falta um botão" não é problema; "o usuário não consegue voltar sem perder o que digitou" é. |
| **2 — User Stories** | A story descreve o **resultado para o usuário**, nunca o componente: "quero ver o total atualizado", não "quero um badge azul". Solução na story engessa o design antes de existir. |
| **3 — Use Cases** | Cada UC lista seus **estados de tela**: vazio, carregando, erro, sucesso, limite (lista longa, texto longo, sem permissão). **Estado não listado aqui é estado que não vai ser desenhado** — e vira bug no Step 9. |
| **4 — Spec** | **O step onde o DS é decidido.** Inventário do DS em `docs/04-spec/design-system.md`; o que será **reusado / composto / promovido**; qual padrão consagrado se aplica (Jakob) e o motivo de qualquer desvio; breakpoints; a11y alvo (AA); benchmark visual citado. Aqui também se **deriva a superfície visual** (sim/não). |
| **5 — Test Cases** | A cobertura contempla **estados × breakpoints** e a11y — como **lente**, não como TC extra: o teto de 10 e `nº TCs == nota` continuam valendo (`05-test-cases.md`). Um TC denso cobre a tela em mobile e desktop, não dois TCs gêmeos. |
| **6 — To Do** | Task de UI declara o **nível atômico** (átomo/molécula/organismo) e **qual componente do DS** ela constrói, estende ou promove. Task que espalha estilo por N telas não existe: vira task de promoção ao DS. |
| **7a — Plano** | **§ 3.4 Design System** obrigatória: inventário, o que reusa, o que compõe, o que promove, tokens novos. Zero valor literal planejado. Se o plano já prevê `#hex`, o 7b vai nascer errado. |
| **7b — Codificar** | Os 9 na íntegra: token (zero literal) · composição > configuração · headless · **todos** os estados implementados · a11y AA (foco, teclado, nome, contraste) · breakpoints do projeto, 320px de piso. Padrão ruim no perímetro → eleva (§ *Consistência é lei*). |
| **8 — Code Review** | Revisar **contra esta lista, princípio a princípio e POR NOME** — igual ao que já se faz com SOLID, não por proxy ("achei bonito" não é veredicto). Violação → triagem A/B/C (`follow-ups.md`). |
| **9 — Run Test** | **Evidência visual por estado × breakpoint**, não só o happy path em desktop. Screenshot prova que a tela *existe*; a comparação com o DS e com o benchmark prova que está *certa*. Fix visual obedece os princípios — remendo de CSS que faz o TC passar é **FAILED disfarçado**. |
| **10 — Done** | O done doc registra **o que o DS ganhou**: tokens e componentes promovidos, padrões elevados. Sem isso, a próxima feature não sabe o que já existe e reinventa. |

## Linha obrigatória no Gateway Check (condicional)

Todo Gateway Check de feature **com superfície visual** carrega esta linha, junto das de princípios e follow-ups — pelo mesmo motivo (o que não é declarado, escapa):

```markdown
- **Design (tokens · atomicidade · composição · estados · a11y):** ✅ aplicado — <1 linha: o que a lente deste step cobrou>
```

- **Sem a linha, o gateway não foi publicado.** Mesma régua da linha de princípios.
- **Feature sem superfície visual:** declare **uma vez**, no Gateway 4→5 (`❌ N/A — feature sem superfície visual, derivado do Step 4`), e os gateways seguintes herdam sem repetir. Só o Step 4 pode derivar isso — nunca o usuário, nunca por conveniência.
- **"Nada a cobrar" não é linha vazia:** escreva o que você verificou e não encontrou.

## Racionalizações proibidas

| Frase | Realidade |
|---|---|
| "O DS não tem esse componente, então crio na pasta da feature" | Reusar → compor → **promover**. Componente visual na pasta da feature é dívida de DS. BLOQUEADO. |
| "É só uma cor / um espaçamento, hardcode não faz mal" | Token é SSOT. Literal é hardcode visual, e some do radar na próxima mudança de tema. BLOQUEADO. |
| "As outras telas são assim, mantenho a consistência" | Consistência vale para padrão **bom**. Padrão ruim se eleva ou vira ledger. Copiar é propagar. BLOQUEADO. |
| "Faço a a11y depois, primeiro entrego a tela" | AA é piso, não fase. Depois = nunca, e retrofit de foco/contraste custa a tela inteira. BLOQUEADO. |
| "Desktop primeiro, mobile numa próxima" | Escopo de plataforma é **derivado** no Step 4. Se tem superfície mobile, é agora. BLOQUEADO. |
| "Estado vazio e erro eu resolvo se sobrar tempo" | Estado não desenhado = estado quebrado. É o que o usuário vê no pior dia dele. BLOQUEADO. |
| "Adiciono uma prop booleana, é mais rápido que recompor" | >2 booleanas de aparência = recomponha. Cada flag nova multiplica os caminhos a testar. BLOQUEADO. |
| "O screenshot do happy path já prova que funciona" | Evidência é por **estado × breakpoint**. Happy path em desktop é a fatia que nunca quebra. BLOQUEADO. |
| "Inventei um padrão melhor que o consagrado" | Jakob: o usuário aprendeu em outro produto. Desvio exige motivo escrito no Spec, não gosto. BLOQUEADO. |
| "Design é subjetivo, não dá pra cobrar em gateway" | Token, nível atômico, estados, contraste e breakpoint são **verificáveis**. O que se cobra aqui é isso, não gosto. BLOQUEADO. |
| "A feature é pequena, não precisa mexer no DS" | Então ela reusa. Se não reusa nem compõe, promove. "Pequena" não cria exceção. BLOQUEADO. |
