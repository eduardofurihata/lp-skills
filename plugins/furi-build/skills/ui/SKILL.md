---
name: ui
description: 'Use when user invokes /ui — owner of the design doctrine: tokens as SSOT, atomic design, composition over configuration, headless, all states, Jakob''s law, semantic consistency, context preservation, modular flows, plus the modern bar (hierarchy, spacing scale, typography, motion, density, WCAG AA, responsive). With no argument it loads the doctrine for the ongoing work; with a target (tela, componente, pasta/, rota, diff, commit <sha>) it scores it 0-100 per pillar and fixes it until every pillar is ≥95 — never changes behavior, never commits or pushes; `audit` = report only. Triggers on "essa tela tá feia", "avalia o design disso", "revisa a UI", "deixa essa tela premium", "tá faltando estado vazio", "isso passa em a11y?", "hardcode de cor", "design system", "UX dessa tela". Not for building features nor for committing.'
effort: max
argument-hint: "[tela | componente | pasta/ | rota | diff | commit <sha>] [audit]"
requires: solve
---

# /ui — a tela no nível da referência

**Esta skill é a doutrina de design — os princípios da superfície visual e a régua do moderno — e é quem força um alvo a cumpri-la.** Cada palavra do padrão é uma prova de sim/não; a nota de 0 a 100 é calculada dos achados, não sentida; cada passada reavalia o alvo do zero, sem herdar a anterior.

Design não decide **o que** o produto faz — decide se o que ele faz **chega inteiro** ao usuário. Bonito não é o critério: o critério é o usuário saber onde olhar, o que fazer e o que aconteceu, em qualquer estado e em qualquer tamanho de tela.

## Dois modos

| Invocação | Modo | O que acontece |
|---|---|---|
| sem argumento — pelo usuário ou por outra skill | **régua** | Leia este arquivo inteiro agora (sem a leitura, a invocação não aconteceu). Os princípios e as provas abaixo valem para tudo que você tocar daqui em diante. Sem passada, sem nota, sem output final. |
| com alvo | **alvo** | Fluxo abaixo: inventário → achados → baldes → nota → corrige → repete até passar (passo 8). |

**A quem se aplica:** todo trabalho com **superfície visual** — uma tela, um componente, um fluxo, um e-mail, um documento gerado. Sem superfície visual, esta doutrina não tem o que cobrar: declare isso uma vez e siga.

# Princípios de design — os nove

> **Esta seção é a fonte única dos princípios de design.** Nenhum outro arquivo os redefine — todos apontam para cá (DRY aplicado a si mesmo). Quem aplica a doutrina numa etapa de trabalho tem a **lente**: o que o princípio significa *ali*.

**Design não é fase — é regime.** Não existe "a etapa de fazer a UI ficar bonita". Vale do primeiro artefato ao código: o problema nomeia a fricção, o requisito lista os estados, a decisão de arquitetura escolhe o design system, o código usa token, o review cobra princípio por nome e o teste prova estado por estado.

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

Complementos inseparáveis dos nove:

- **Camadas visuais:** token → primitivo → componente do DS → composição da feature. A feature compõe; ela não redefine o primitivo.
- **Nada de estilo órfão:** CSS solto que não vem do DS é dívida — ou vira token/componente, ou não existe.

## O design system evolui com o produto

Precisou de algo que o DS não tem? **Nesta ordem, sem pular:**

1. **Reusar** — o DS já resolve? use.
2. **Compor** — dá para montar com o que existe? componha. Montar com o que já existe é a forma mais barata de acertar.
3. **Promover** — não dá: crie o token/componente **no DS**, não na pasta da feature. Registre onde o projeto documenta o DS, e no registro de encerramento do trabalho.

**Componente visual novo nascendo dentro da pasta da feature = dívida de DS.** É o equivalente visual de duplicar lógica em vez de dar um dono à capacidade — e a correção é a mesma: promover, e o chamador passa a só usar.

**O inverso também vale:** se o trabalho revela que um padrão do DS está ruim ou incompleto, isso é **achado**, não conformação — é **balde B** (§ Fluxo, passo 4): fica listado com caminho, não some.

**Sem DS no projeto?** O primeiro trabalho o **funda** com o mínimo que ele exige — os tokens e componentes que os casos de uso pedem, nada além (não invente uma paleta inteira para uma tela). Cada trabalho seguinte o faz crescer. É assim que o DS acompanha o produto em vez de nascer grande e morrer desatualizado.

## Consistência é lei; mediocridade não é

> **A regra "siga o padrão existente" vale para consistência, NÃO para qualidade.**

Padrão existente que está abaixo do nível #1 **não se copia**. Ou você o **eleva** — é a refatoração contínua aplicada à UI, e o perímetro é o mesmo: tudo por onde o trabalho passou —, ou ele vira **achado**. Copiar tela ruim "por consistência" é duplicar código "porque já estava assim": a inconsistência que você evitou custa menos que a mediocridade que você propagou.

Como decidir na hora:

| Situação | O que fazer |
|---|---|
| Padrão existente é bom | Siga. Consistência ganha de preferência pessoal. |
| Padrão existente é ruim **e está no perímetro** | **Eleve** — e a elevação vale para os outros usos daquele padrão que o perímetro alcança. |
| Padrão existente é ruim e está **fora** do perímetro | **Balde B** se este trabalho o expôs, **C** se não (§ Fluxo, passo 4). Nunca copiar "para ficar igual". |
| Não existe padrão | Os líderes reconhecidos do domínio são a referência, e o que você definir **vira** padrão: promova ao DS. |

## Moderno não é enfeite — o que se cobra

O benchmark do nível #1 — o calibre dos líderes do domínio — aplicado ao **visual**, não só ao comportamento:

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

## O nível — antes de julgar

**No modo alvo, invoque o `/solve` via Skill tool** (`furi-build:solve`; a forma curta `solve` também resolve) **antes do passo 3**. É ele quem define o **nível #1** deste domínio: quem são os líderes reconhecidos e qual é o calibre que a tela precisa alcançar. Sem isso, "moderno" e "abaixo do nível #1" viram gosto pessoal — e esta skill vira opinião, não régua.

**No modo régua, não invoque nada.** Quem carregou a régua já está num trabalho com o nível definido; reinvocar só fecharia um ciclo sem acrescentar nada. A chamada é do modo alvo, e só dele.

# Fluxo (modo alvo)

1. **Alvo e jeito** — pelo argumento. `audit` (ou "só avalia") em qualquer posição = só relatório, nada é alterado; sem `audit` = **força**: avalia e corrige.

   | Argumento | Alvo | O que se lê |
   |---|---|---|
   | caminho de componente | o componente | o arquivo + `grep` de quem o usa + o que ele importa do DS |
   | caminho de pasta · rota · tela | a pasta/rota e tudo que ela renderiza | cada arquivo dela, seguindo a árvore de componentes |
   | `diff` · `alteração` | a parte visual do não commitado | `git diff HEAD` + os untracked de `git status --porcelain`, lidos do disco |
   | `commit <sha>` · `HEAD` | a parte visual do commit | `git show <sha>` |
   | `projeto` · `ds` · `.` | o design system e quem o consome | os tokens, os primitivos, e `git ls-files` dos componentes |

2. **Snapshot** — `git status` limpo é pré-condição para tudo que escreve: é o que permite desfazer. Sujo → pare e peça para commitar antes. Dispensam: `diff` (o alvo é o que está sujo) e `audit` (nada é escrito).

3. **Passada** — inventário **do zero**: leia o alvo inteiro, agora, do disco — e releia a doutrina acima. Monte a tabela de novo, sem copiar a passada anterior nem usar a conversa. **Primeiro ache o DS** (tokens, primitivos, a convenção do projeto): sem saber o que existe, "faltou token" e "devia reusar" não são verificáveis. Cada "não" vira uma linha da tabela do Output final; o mesmo achado em N lugares é 1 linha com os N lugares, e o peso conta por lugar. **Um achado, um pilar** — o mais específico. Se o app roda, veja a tela nos estados e nos breakpoints; se não roda, a leitura do código é a evidência, e o que não deu para verificar é declarado no output.

4. **Baldes** — triagem A/B/C do alvo. Todo achado é classificado; nenhum fica só na cabeça.

   | Balde | O que é | Faz |
   |---|---|---|
   | **A** | dentro do alvo e corrigível sem mudar comportamento | **corrige agora** |
   | **B** | fora do alvo mas exposto por ele (o primitivo que ele usa, o padrão que ele copiou) — ou dentro, mas exige decisão de produto ou de DS | **lista com caminho, não toca**; fica para um ciclo próprio de trabalho |
   | **C** | pré-existente sem relação com o alvo, ou gosto pessoal sem regra no projeto | **descarta com 1 linha de motivo** |

5. **Nota** — por pilar, os seis: Tokens, Atomicidade, Estados, A11y, Consistência, Moderno. `100 − Σ pesos dos achados de balde A`, piso 0. Nota final = a **menor** das seis; nenhum pilar compensa outro — tela linda que não navega por teclado não passa.

   | Peso | Quando |
   |---|---|
   | **−10 grave** | o usuário trava ou é excluído: estado não desenhado (vazio, erro, carregando), contraste abaixo de AA, controle sem foco visível ou sem nome acessível, quebra no breakpoint de piso, contexto perdido ao voltar |
   | **−5 média** | funciona, mas destoa ou custa manutenção: valor literal no lugar de token, prop booleana de aparência empilhada, nível atômico errado, lógica e apresentação no mesmo arquivo, padrão inventado no lugar do consagrado |
   | **−2 leve** | acabamento: espaçamento fora da escala, peso tipográfico decorativo, motion sem token, densidade acidental |

6. **Checks — linha de base** — os do próprio projeto, se existem (`lint`, `typecheck`, teste de a11y, storybook, visual regression), antes de tocar em qualquer coisa. Sem checks → diga no output.

7. **Corrige** (força) — todo balde A. Só dentro do alvo. Comportamento idêntico: trocar literal por token, desenhar o estado que falta e nomear o controle não mudam o que a tela faz. Criar token ou componente novo no DS, ou renomear algo que outros consomem → **pergunte antes**. Correção que precisaria sair do alvo → pergunte, ou vira B. Nunca `git commit`, nunca `git push`, nunca `--amend`. No fim, os checks de novo: verde não vira vermelho.

8. **Repete** os passos 3 → 5 e 7 até uma passada do zero dar **todo pilar ≥ 95**. `audit` para depois do passo 5. Três passadas seguidas sem a nota subir → pare e mostre o que trava (quase sempre é uma decisão de produto ou de DS).

## Output final

```
/ui <alvo> · força | audit
Nota: <antes> → <depois>   (Tokens · Atomicidade · Estados · A11y · Consistência · Moderno: nn/nn/nn/nn/nn/nn → nn/nn/nn/nn/nn/nn)

| pilar | achado | arquivo:linha | peso | balde | status |
|---|---|---|---|---|---|
| … | … | … | −5 | A | corrigido   (audit: aberto) |
| … | … | … | −10 | B | aberto — fora do alvo |
| … | … | … | −2 | C | descartado: <motivo> |

Não verificado: <o que exigia o app rodando e não rodou>   (ou: nada — tela vista em todos os estados)
Passadas: N · Checks: lint ✓ · typecheck ✓   (ou: nenhum no projeto)
Próximo: revisar o diff e commitar
```

Em `audit`: `Nota: <antes>` só, sem "depois"; `Passadas: 1`; `Checks:` só a conferência do passo 3; `Próximo: /ui <alvo>` para aplicar.

# Racionalizações proibidas — PARE se pensar

| Frase | Realidade |
|---|---|
| "O DS não tem esse componente, então crio na pasta da feature" | Reusar → compor → **promover**. Componente visual na pasta da feature é dívida de DS. BLOQUEADO. |
| "É só uma cor / um espaçamento, hardcode não faz mal" | Token é SSOT. Literal é hardcode visual, e some do radar na próxima mudança de tema. BLOQUEADO. |
| "As outras telas são assim, mantenho a consistência" | Consistência vale para padrão **bom**. Padrão ruim se eleva ou vira balde. Copiar é propagar. BLOQUEADO. |
| "Faço a a11y depois, primeiro entrego a tela" | AA é piso, não fase. Depois = nunca, e retrofit de foco/contraste custa a tela inteira. BLOQUEADO. |
| "Desktop primeiro, mobile numa próxima" | Escopo de plataforma se decide junto com a arquitetura, não na hora de codar. Se tem superfície mobile, é agora. BLOQUEADO. |
| "Estado vazio e erro eu resolvo se sobrar tempo" | Estado não desenhado = estado quebrado. É o que o usuário vê no pior dia dele. BLOQUEADO. |
| "Adiciono uma prop booleana, é mais rápido que recompor" | >2 booleanas de aparência = recomponha. Cada flag nova multiplica os caminhos a testar. BLOQUEADO. |
| "O screenshot do happy path já prova que funciona" | Evidência é por **estado × breakpoint**. Happy path em desktop é a fatia que nunca quebra. BLOQUEADO. |
| "Inventei um padrão melhor que o consagrado" | Jakob: o usuário aprendeu em outro produto. Desvio exige motivo escrito, não gosto. BLOQUEADO. |
| "Design é subjetivo, não dá pra cobrar" | Token, nível atômico, estados, contraste e breakpoint são **verificáveis**. O que se cobra aqui é isso, não gosto. BLOQUEADO. |
| "A feature é pequena, não precisa mexer no DS" | Então ela reusa. Se não reusa nem compõe, promove. "Pequena" não cria exceção. BLOQUEADO. |
| "A nota é 94, arredonda" | A nota é calculada dos achados, não sentida. Abaixo de 95 → outra passada. BLOQUEADO. |
| "Não achei o DS, então sigo meu gosto" | Achar o DS é o passo 3. Sem ele, nenhum achado é verificável — procure os tokens e os primitivos antes de julgar. BLOQUEADO. |
| "Já conheço os princípios, não preciso ler o arquivo" | Modo régua é a leitura desta skill inteira. Sem ela, a invocação não aconteceu. BLOQUEADO. |
