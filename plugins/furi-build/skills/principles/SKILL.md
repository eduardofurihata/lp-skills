---
name: principles
description: 'Use when user invokes /principles — owner of the quality doctrine: SOLID, DRY, KISS, YAGNI, LoD, Motores and refactoring, plus the clarity bar (simple, efficient, premium, easy for humans and AI). With no argument (or invoked by /solve, and through it /method) it loads the doctrine for the ongoing work; with a target (projeto, pasta/, arquivo, commit <sha>, diff, doc) it scores it 0-100 per pillar and fixes it until every pillar is ≥95 — never changes behavior, never commits or pushes; `audit` = report only. Triggers on "força esse commit a ficar simples", "deixa essa pasta clean", "aplica os princípios nesse projeto", "avalia de 0 a 100", "simplifica isso". Not for building features (/solve, /method, /fast) nor for committing (/save).'
effort: max
argument-hint: "[projeto | pasta/ | arquivo | commit <sha> | diff | doc <arquivo>] [audit]"
---

# /principles — simples, eficiente e premium, para gente e para IA

**Esta skill é a doutrina de qualidade — os princípios de engenharia e a régua de clareza — e é quem força um alvo a cumpri-la.** Cada palavra do padrão é uma prova de sim/não; a nota de 0 a 100 é calculada dos achados, não sentida; cada passada reavalia o alvo do zero, sem herdar a anterior.

Compõe com o `/solve`, não compete: simples nunca é "entregar menos"; premium nunca é "adicionar o que ninguém pediu". O `/solve` decide **o quanto** existe; o `/principles` garante que tudo o que existe esteja na forma mais clara e curta — e inteiro.

## Dois modos

| Invocação | Modo | O que acontece |
|---|---|---|
| sem argumento — pelo `/solve` (e, por ele, toda skill que o invoca), pelo usuário ou por outra skill | **régua** | Leia este arquivo inteiro agora (sem a leitura, a invocação não aconteceu). Os princípios e as provas abaixo valem para tudo que você tocar daqui em diante. Sem passada, sem nota, sem output final. |
| com alvo | **alvo** | Fluxo abaixo: inventário → achados → baldes → nota → corrige → repete até passar (passo 8). |

# Princípios de engenharia — SOLID · DRY · KISS · YAGNI · LoD · Motores

> **Esta seção é a fonte única dos princípios.** Nenhum outro arquivo os redefine — todos apontam para cá (DRY aplicado ao próprio protocolo). O que cada step do `/method` tem é a **lente**: o que o princípio significa *naquele* step. É o pilar **Princípios** da nota, e a prova é esta seção inteira.

**Os princípios não são fase — são regime.** Não existe "step de aplicar SOLID". Eles valem do Step 1 ao Step 10, do artefato de texto ao código, ao que você escreve **e** ao que você toca. Quem só cobra no 7b já perdeu: a complexidade especulativa nasce no Spec e no Plano, e chega no código como fato consumado.

> **Irmã desta skill:** `method/references/design.md` — fonte única dos princípios de **design** (tokens, atomicidade, composição, headless, estados, a11y), com a mesma estrutura e a mesma régua. Feature com superfície visual obedece aos dois.

> **SOLID são CINCO princípios, não um.** Escrever "SRP" e chamar de SOLID deixa quatro de fora — e o que não é nomeado nunca é cobrado no review.

## SOLID (os cinco, um a um)

| Princípio | Regra | Falha típica |
|---|---|---|
| **S — SRP** (responsabilidade única) | Cada unidade (doc, decisão, task, arquivo, classe, função, componente) faz **UMA** coisa e a faz bem. Função >40 linhas → extraia helper. Componente misturando lógica+UI → hook + componente burro. | "Esse service faz tudo de pagamento" |
| **O — OCP** (aberto/fechado) | Comportamento novo entra por **composição/estratégia**, sem editar o que já funciona. Mais um `if` no meio da função que todo mundo usa é o sintoma. | "Só adicionei mais um case no switch" |
| **L — LSP** (substituição) | Quem implementa o contrato **honra** o contrato: mesmas garantias, não lança onde o contrato não prevê, não exige mais do que ele exige. Subtipo que quebra o chamador não é subtipo. | "Essa implementação lança nesse caso, quem chama que trate" |
| **I — ISP** (segregação de interface) | Interface pequena, focada no que o cliente usa. Depender de 10 métodos para usar 2 é acoplamento a 8 que não lhe dizem respeito. | "A interface do service tem tudo, cada um usa o que quiser" |
| **D — DIP** (inversão de dependência) | Dependa de **abstração**, não de implementação; a direção aponta para o domínio, nunca para o detalhe (banco, HTTP, lib). O **motor define o contrato**; a infra implementa. | "O service importa o client do Prisma direto" |

## Os demais

| Princípio | Regra | Falha típica |
|---|---|---|
| **DRY** | Zero duplicação de lógica **ou de decisão**; uma única fonte de verdade. Antes de criar, **procure** (grep em `shared/`, `lib/`, `components/`, `hooks/`) — reutilizar/estender > recriar. Repetiu 2× já é candidato a extração. | "Copiei e adaptei" |
| **KISS** | A solução mais simples que atinge o nível #1. 5 linhas > 50 linhas. Simplicidade ≠ mediocridade. | "Fiz genérico pra ficar elegante" |
| **YAGNI** | APENAS o que os UCs (Step 3) e o Spec (Step 4) exigem. Zero abstração especulativa. 3 linhas similares > abstração prematura. | "Deixei preparado pro dia que precisar" |
| **LoD** (Law of Demeter) | Objeto só fala com vizinhos diretos. Seção própria abaixo. | "Só puxei o campo lá de dentro" |
| **Motores** | Toda capacidade tem **um** dono. Seção própria abaixo. | "Cada tela trata do seu jeito" |

**Como os cinco do SOLID se amarram no resto:** **OCP** é como o motor cresce (extensão, não `if` novo) · **ISP** e **LoD** são o mesmo contrato pequeno visto de dois lados · **DIP** é a regra de direção de dependências dita por princípio · **LSP** é o que faz o contrato do motor valer para todas as implementações · **SRP** diz o que cada unidade faz, **LoD** diz com quem ela fala.

Complementos de arquitetura, inseparáveis dos princípios:

- **Separação de camadas:** controller = HTTP, service = lógica, componente = UI. Lógica de negócio NUNCA no controller/componente.
- **Baixo acoplamento, alta coesão:** módulos injetáveis, independentes. Sem dependências circulares.
- **Direção de dependências:** `shared → api/web` ok. `api → web` ou `web → api` proibido.

## Motores — a capacidade tem dono

> **Pense em motores.** Toda capacidade do sistema — calcular, validar, sincronizar, formatar, autorizar — é responsabilidade de **um motor**: uma unidade nomeada pela capacidade que entrega, que **engloba tudo** o que aquela capacidade precisa, expõe um contrato pequeno e público, e é o **único** lugar onde aquela regra vive. O resto do sistema não reimplementa: **chama o motor**.

| Regra | O que significa |
|---|---|
| **Nome = capacidade, não camada** | "motor de cálculo de frete", "motor de validação de cupom". Não `ShippingUtils`, `helpers`, `misc` — nome de camada esconde que ali mora uma regra. |
| **Engloba** | Achou pedaço da mesma capacidade solto (um `if` numa tela, um cálculo repetido num componente) → **absorve para o motor**, e o chamador passa a só chamar. Isso é refatoração, não escopo novo. |
| **Contrato pequeno** | Entrada e saída explícitas; o interior é privado. É Law of Demeter aplicada: o chamador não conhece as tripas do motor. |
| **Um dono** | Duas fontes da mesma regra = **defeito**, não estilo. Quem decide é o motor; quem exibe é a tela. |

**Auto-check:** *"Se amanhã essa regra mudar, existe UM arquivo pra abrir?"* Se a resposta for "depende" ou "vários" → não tem motor, tem espalhamento.

**A tensão com YAGNI — resolvida aqui, para não virar desculpa dos dois lados:** motor nasce da capacidade que os **UCs (Step 3) já exigem**. "Motor genérico pro dia que precisar" é abstração especulativa: **BLOQUEADO**. YAGNI proíbe o motor **sem UC**; a doutrina do motor proíbe a capacidade **que já existe** ficar espalhada. E motor **não é framework**: nada de registry, plugin ou DSL interna para atender um UC.

> No front, o equivalente do motor é o **componente do DS**: a capacidade visual tem um dono e se promove para lá em vez de espalhar. Ver `method/references/design.md` § *O design system evolui com o produto*.

## Law of Demeter — fale só com o vizinho

> Um objeto conversa com quem ele **conhece de fato**: seus próprios campos, seus parâmetros, o que ele criou. `a.b.c.d.method()` não é atalho — é a declaração de que você conhece as tripas de três objetos, e de que qualquer mudança em qualquer um deles quebra você.

| Regra | O que significa |
|---|---|
| **Só o vizinho direto** | Chame o que está a **um salto**: `this.x`, um parâmetro, o que a própria unidade criou. Cada ponto a mais na cadeia é um acoplamento a mais. |
| **Contrato > navegação** | Precisou do dado lá do fundo? O vizinho **expõe** o que você precisa (`pedido.valorTotal()`); você não vai buscar (`pedido.cliente.plano.desconto.valor`). |
| **Direção declarada** | `shared → api/web` ok; `api → web` e `web → api` proibidos. Direção não declarada vira ciclo. |
| **Zero ciclo** | Dependência circular é LoD levado ao extremo: dois módulos que conhecem as tripas um do outro. Achou → quebre com contrato ou motor. |

**Auto-check:** *"Se eu renomear um campo no fim da cadeia, quantos arquivos quebram?"* Mais de um → você está **navegando**, não conversando.

**Por que ele acompanha SOLID e não é detalhe:** SRP diz **o que** cada unidade faz; LoD diz **com quem** ela pode falar. Sem ele, unidades de responsabilidade única seguem amarradas umas nas outras — e o motor nunca fecha, porque todo mundo alcança o interior de todo mundo. O **contrato pequeno do motor É a Law of Demeter aplicada**.

**A tensão — resolvida:** LoD **não** proíbe API fluente do mesmo objeto (`query.where().order().limit()` é **um** vizinho devolvendo a si mesmo), nem exige delegação cega (um wrapper por campo é o oposto: burocracia sem contrato). O que ele proíbe é **atravessar objetos** para alcançar um dado que ninguém expôs.

## A tensão — resolvida de uma vez

**KISS/YAGNI matam a complexidade *desnecessária*. A complexidade *necessária* para o nível #1 (`/solve`) continua sendo requisito.** YAGNI nunca é desculpa para entregar menos do que o UC pede, nem para descartar achado real (isso é balde B — ver `method/references/follow-ups.md`). KISS nunca é desculpa para a versão pobre da feature.

## Refatoração contínua — a cada passada o código sobe

> **Refatorar não é um step nem um pedido — é o que acontece por padrão em tudo por onde o trabalho passa.** Os princípios valem para o código que você **encontra**, não só para o que escreve.

**O perímetro — tudo por onde você passou:**

- o arquivo que você **editou**;
- o arquivo que você **abriu só para entender**;
- o **dependente direto** que o grep revelou;
- o **caminho inteiro** que o fluxo da feature atravessa.

**Dentro do perímetro: refatore bastante, sem timidez.** Fora do perímetro: é balde C (`method/references/follow-ups.md`) — o limite é o **caminho percorrido**, não "só a linha que editei" e nem o repositório inteiro.

**O que elevar, por arquivo do perímetro:**

| Achou | Faça |
|---|---|
| duplicação de lógica | extraia — e se for capacidade, vira **motor** |
| a mesma capacidade espalhada | **absorve** no motor; o chamador só chama |
| responsabilidade misturada | separe (SRP) |
| naming que não diz a capacidade | renomeie |
| função >40 linhas · componente >300 · service >400 | divida |
| código morto, import morto, `_unused` | **delete** — sem `// removed`, sem re-export |
| comentário que mente | corrija ou remova |
| TODO/FIXME resolúvel | resolva agora |
| `a.b.c.d` / ciclo / direção invertida | contrato (LoD, DIP) |

**Regra do saldo:** nenhum arquivo do perímetro sai da passada no nível em que entrou. Ou ele **entrou já no nível #1** — e você **declara isso** —, ou ele **subiu**.

**Não é desculpa para:** reescrever o repositório (fora do perímetro = C), adiar a feature, nem criar abstração que nenhum UC pede (YAGNI continua valendo).

Detalhe operacional por arquivo: `method/references/07-implementation.md` § Refatoração Obrigatória. No front, o equivalente é elevar o padrão visual em vez de copiá-lo: `method/references/design.md` § *Consistência é lei; mediocridade não é*.

## Lente por step (o que cobrar em CADA um)

| Step | O que os princípios exigem AQUI |
|---|---|
| **1 — Problema** | **KISS:** 1 frase — não cabe em uma? você não entendeu ainda. **YAGNI:** o problema é o que existe, não o adjacente que ninguém relatou. **DRY:** o inventário achou doc que já cobre isso? **atualize**, não crie paralelo. **Motor:** o problema nomeia a **capacidade que falta**, não a tela onde ela some. **Refatoração:** doc que já cobre o domínio → **consolide**, não crie um paralelo. |
| **2 — User Stories** | **SRP:** 1 story = 1 necessidade de 1 persona (não empilhe duas no "e também"). **DRY:** mesma necessidade em 2 personas = 1 story com 2 atores, não 2 stories gêmeas. **YAGNI:** story sem persona do Step 1 = especulação → fora. **Motor:** stories que pedem a mesma capacidade apontam para o **mesmo motor** — anote isso, o Step 4 vai usar. **Refatoração:** story empilhada → **separe** agora, custa uma linha. |
| **3 — Use Cases** | **SRP:** 1 UC = 1 (ator × fluxo × estado) — não agrupe. **DRY:** tabela de assinaturas **única**, sem duplicata (já é critério do gateway 3→4). **YAGNI:** UC que nenhuma story do Step 2 pede não existe. **Motor:** UCs que compartilham regra são do mesmo motor; a tabela de assinaturas já é o **esboço do contrato** dele. **Refatoração:** UC agrupado → **quebre**; assinatura duplicada → **funda**. |
| **4 — Spec** | O step onde a arquitetura é decidida — **é aqui que YAGNI é mais barato**. Toda decisão declara o **UC que a exige**; sem UC → não entra (vai para "alternativas descartadas"). **DRY:** decisão que replica mecanismo já existente no projeto → decisão é **reusar**. **SRP:** fronteiras de módulo/camada explícitas. **DIP + LoD:** cada decisão de integração declara a **direção da dependência** e quem fala com quem — fronteira mal desenhada aqui vira `a.b.c.d` no 7b. **OCP:** onde a solução vai precisar crescer? o ponto de extensão é decisão, não improviso. **Motor:** cada decisão declara **qual motor é dono da regra** — motor novo é nomeado e tem contrato desenhado aqui. **Refatoração:** decisão que replica mecanismo existente vira **estender o motor que já existe**. Princípios são o critério nº 4 da hierarquia de decisão, e **desempatam** quando 1-3 empatam. |
| **5 — Test Cases** | **SRP:** 1 TC = 1 bug único. **DRY:** TC que não puxa cobertura nova é redundante (filtro de significância). **KISS/YAGNI:** teto de 10, `nº TCs == nota` — não invente TC para "ficar completo". **Motor:** o TC exercita o **comportamento do motor pelo front**, nunca a peça interna. **Refatoração:** TC redundante → **funda** (é o próprio filtro de significância). |
| **6 — To Do** | **SRP:** 1 task = 1 responsabilidade resolvível em 1 prompt. **DRY:** task que recria o que já existe vira task de **reúso** ("estender X"), não de criação. **YAGNI:** task sem UC/TC que a exija sai da lista. **Motor:** cada task declara **qual motor** ela constrói, estende ou absorve — task que espalha a mesma regra por N telas não existe. **Refatoração:** task que recria o existente vira task de **extensão**. |
| **7a — Plano** | **O portão mais barato do protocolo.** Seções obrigatórias: **Reúso antes de criar (DRY)** — o que já existe e será reutilizado/estendido; arquivo novo só com justificativa de por que nada serve. **O que NÃO vamos construir (YAGNI)** — abstrações/camadas/flags consideradas e descartadas por não ter UC que as exija. **Motores (§ 3.3)** — qual nasce, qual é estendido, qual lógica dispersa será absorvida. **SRP:** cada arquivo do plano declara sua responsabilidade única. **OCP/DIP:** o plano declara os **pontos de extensão** e de quem cada arquivo depende, em que direção. **Refatoração:** o plano **lista o perímetro** (o que será aberto/atravessado) e o que será elevado em cada arquivo. |
| **7b — Codificar** | Todos na íntegra (SOLID · DRY · KISS · YAGNI · LoD · Motores) + limiares numéricos + **refatoração do perímetro**. A capacidade mora no motor; a mesma regra encontrada fora → **absorve**. Detalhe: `method/references/07-implementation.md` § Práticas Obrigatórias. |
| **8 — Code Review** | Revisar **contra esta mesma lista, princípio a princípio e por nome** — não por proxy, e **os cinco do SOLID**, não só o SRP. **Motor:** a capacidade vazou? existe segunda fonte da mesma regra? o contrato virou tripa exposta? **Refatoração:** confira o **saldo** — todo arquivo do perímetro subiu ou já estava no nível #1. Violação encontrada → triagem A/B/C (`method/references/follow-ups.md`): dentro do escopo = corrige agora; escopo novo = ledger. |
| **9 — Run Test** | Todo fix feito para um TC passar obedece os princípios — **workaround que faz o TC passar violando SRP/DRY é FAILED disfarçado**. **Motor:** o fix vai **para o motor**, nunca de remendo no chamador. **Refatoração:** fix novo reabre o perímetro do fix. Qualquer fix invalida o review → volta ao Step 8. |
| **10 — Done** | O done doc registra o que os princípios produziram: **o que foi reutilizado** (DRY), **o que foi descartado** (YAGNI), **quais motores nasceram, cresceram ou absorveram** e **o que a refatoração do perímetro elevou**. Sem isso, o registro mente sobre como a feature ficou. |

## Linha obrigatória no Gateway Check

Todo Gateway Check publicado no chat carrega estas linhas — igual à de follow-ups, pelo mesmo motivo (o que não é declarado, escapa):

```markdown
- **Princípios (SOLID · DRY · KISS · YAGNI · LoD · Motores):** ✅ aplicados — <1 linha: o que a lente deste step cobrou>
- **Refatoração (tudo por onde passou):** ✅ <N> elevados — <o que subiu> / nada a elevar — verifiquei <X> e já estava no nível #1
- **Design (tokens · atomicidade · composição · estados · a11y):** ✅ <o que a lente cobrou>   ← só em feature com superfície visual (`method/references/design.md`)
```

Sem elas, o gateway **não foi publicado**. "N/A" não existe: se a lente do step não teve nada a cobrar, escreva o que você verificou e não encontrou. A linha de **Design** é a única condicional — feature sem superfície visual declara isso **uma vez** no Gateway 4→5 e as seguintes herdam (`method/references/design.md` § Linha obrigatória).

# A régua de clareza — para gente e para IA

Simples e Eficiente são a lente de SRP, DRY e KISS (§ Princípios de engenharia, acima) para qualquer alvo — commit, pasta, doc; Premium e os dois leitores são o que a doutrina não cobria. Tem tela? `method/references/design.md` (tokens, estados, a11y) vale junto.

## Simples · Eficiente · Premium — cada palavra é uma prova

| Pilar | Prova (sim/não) | Falha típica |
|---|---|---|
| **Simples** — 1 coisa | Cada unidade (arquivo, função, seção, commit) faz UMA coisa, e o nome diz qual | `utils.ts` com 12 funções sem parentesco · commit "ajustes gerais" |
| **Simples** — 1ª linha | A primeira linha (H1, cabeçalho, docstring, subject) diz o que é e para que serve | `# Notas` · `feat: wip` · arquivo que abre com 20 imports e nenhum cabeçalho |
| **Simples** — nome diz | Nome de arquivo, pasta, função e variável se entende sem abrir: sem abreviação, sem `v2/new/old/final`, sem sigla que o projeto não usa em todo lugar | `handleData` · `utils2.ts` · `final_FINAL.md` · `qtd` |
| **Simples** — zero sobra | Nada que ninguém usa nem lê: código, import ou arquivo morto, seção vazia, comentário que repete o código, TODO vencido | `// removed` · `_unused` · `## Referências` vazio |
| **Eficiente** — menor forma | Não existe versão mais curta com o mesmo significado e comportamento: 5 linhas > 50, 1 tabela > 3 parágrafos, sem preâmbulo | função de 60 linhas com 3 caminhos iguais · "antes de começar, é importante lembrar que…" |
| **Eficiente** — 1 fonte | Cada regra, valor ou decisão mora em UM lugar; o resto aponta | o mesmo limite em 2 arquivos · README repetindo o CONTRIBUTING |
| **Eficiente** — preciso | Todo número, nome, caminho e comando é real e exato | "roda o script de build" · `path/to/file` · link morto · "aproximadamente" |
| **Premium** — nada pela metade | Tudo que está presente está terminado: sem `TODO/WIP/???/(preencher)`, seção sem corpo, função que só lança "não implementado" | `## Como testar` vazio · `throw new Error("not implemented")` |
| **Premium** — fecha o ciclo | O leitor faz o que veio fazer sem sair para perguntar: doc diz como usar, pasta tem porta de entrada (README/índice), commit tem o porquê, skill tem output e "Próximo" | README que diz o que é, mas não como rodar |
| **Premium** — moderno | A forma atual da stack e do projeto: sem API descontinuada, sem legado ao lado do novo | `require` ao lado de `import` · `componentWillMount` · `moment` num projeto que já usa `date-fns` |
| **Premium** — acabamento | O formatter do projeto passa; sem erro de escrita no texto visível; sem lixo | `console.log('aqui')` · arquivo de debug esquecido |

Premium se mede contra o que o alvo **promete** (nome + 1ª linha), nunca contra o que daria para acrescentar.

## Dois leitores

| Pilar | Prova (sim/não) | Falha típica |
|---|---|---|
| **Humano** — teste do leigo | Alguém de fora, de qualquer idade, lê só o nome e a 1ª linha e responde "o que é e para que serve" | `core/` · `misc.md` · `chore: stuff` |
| **Humano** — uma leitura basta | Ordem = ordem de uso; todo termo é definido antes de ser usado; ninguém precisa voltar para entender | glossário no fim · passo 3 depende do passo 7 |
| **IA** — acha em 1 grep | Nome do arquivo e da pasta = nome do que contém (capacidade, domínio), não camada genérica | `Button` dentro de `comp1.tsx` · cálculo de frete em `helpers.ts` |
| **IA** — decide pela 1ª linha | Lendo só o cabeçalho, o agente sabe se é ali que mexe: 1 coisa por arquivo, propósito declarado | script sem docstring · `index.ts` que só reexporta 40 coisas |
| **IA** — zero magia | Nada acontece fora do que está escrito no alvo ou apontado por caminho: sem registro automático, config que age à distância, convenção que só mora na cabeça de alguém | rota registrada em outro arquivo sem aparecer no da rota · `.env` que ninguém documentou |
| **IA** — comando roda sem gente | Todo comando citado roda por copy-paste: sem pergunta interativa, sem variável não declarada, e diz se deu certo | `make setup` que faz perguntas · "roda os testes" (qual comando?) |
| **IA** — igual aos irmãos | Mesma forma, mesmo nome, mesmo lugar que os vizinhos — a IA aprende com um e acerta os outros | `a.service.ts` ao lado de `bService.ts` · `## Como testar` só em um doc |

## Onde a prova muda de forma

| Prova | projeto · pasta | arquivo | commit · diff | doc · skill · prompt |
|---|---|---|---|---|
| 1ª linha | H1 + 1ª frase do README (ou índice da pasta); nome da pasta | cabeçalho ou docstring | commit: subject como o `/save` escreve (Conventional Commits), corpo com o porquê se não for óbvio · diff: — | H1 + tese |
| 1 coisa | 1 domínio por pasta; irmãos com parentesco | 1 responsabilidade | 1 intenção por commit ou diff | 1 assunto por doc; 1 ideia por seção |
| 1 fonte | entre pastas e entre docs | dentro do arquivo | o diff não copia o que já existe no repo (`grep` antes) | não repete outro doc — aponta |
| fecha o ciclo | README com como rodar e testar | entrada → saída explícitas | mensagem responde "por quê"; diff não deixa nada pela metade | como usar + próximo passo |
| comando roda | scripts de `package.json` e `Makefile` | — | — | comandos citados |
| igual aos irmãos | convenção de nome e layout entre pastas | vs. arquivos da mesma pasta | vs. `git log --oneline -20` | vs. docs irmãos |

# Fluxo (modo alvo)

1. **Alvo e jeito** — pelo argumento. `audit` (ou "só avalia") em qualquer posição = só relatório, nada é alterado; sem `audit` = **força**: avalia e corrige.

   | Argumento | Alvo | O que se lê |
   |---|---|---|
   | `commit <sha>` · `HEAD` · `HEAD~n` | mensagem **e** diff do commit | `git show <sha>` |
   | `diff` · `alteração` | tudo não commitado (staged, unstaged, untracked) | `git diff HEAD` + os untracked de `git status --porcelain`, lidos do disco |
   | `projeto` · `repo` · `.` | todos os arquivos rastreados | `git ls-files` — leitura completa, sem amostragem |
   | caminho de pasta | a pasta e tudo dentro | cada arquivo dela |
   | caminho de arquivo (`doc`, `skill` ou `prompt` na frente escolhe a coluna da tabela acima) | o arquivo | o arquivo + `grep` de quem o usa |

2. **Snapshot** — `git status` limpo é pré-condição para tudo que escreve (projeto, pasta, arquivo, commit): é o que permite desfazer. Sujo → pare e peça para commitar antes (`/save`). Dispensam: `diff` (o alvo é o que está sujo) e `audit` (nada é escrito). Em `commit <sha>`, as correções entram no working tree como mudança nova e a **mensagem só recebe uma proposta** — reescrever histórico não é desta skill.

3. **Passada** — inventário **do zero**: leia o alvo inteiro, agora, do disco — e releia a doutrina acima, a régua do pilar Princípios. Monte a tabela de novo — não copie linhas da passada anterior nem use a conversa. Cada "não" vira uma linha da tabela do Output final; o mesmo achado em N lugares é 1 linha com os N lugares, e o peso conta por lugar. **Um achado, um pilar** — o mais específico: se uma prova de clareza o nomeia, é dela; Princípios fica com o que só a doutrina — e, com tela, `method/references/design.md` — cobre (OCP, LSP, ISP, DIP, YAGNI, LoD, Motores, perímetro, limiares; tokens, estados, a11y). Todo caminho (`ls`), comando (existe) e link (responde) citado pelo alvo é conferido — é a prova "preciso" em qualquer projeto.

4. **Baldes** — a triagem A/B/C do `/method` (`method/references/follow-ups.md`), com o alvo no lugar do escopo da feature. Todo achado é classificado; nenhum fica só na cabeça.

   | Balde | O que é | Faz |
   |---|---|---|
   | **A** | dentro do alvo e corrigível sem mudar comportamento | **corrige agora** |
   | **B** | fora do alvo mas exposto por ele (o helper que importa, o doc que linka) — ou dentro, mas exige mudar comportamento ou decisão de produto | **lista com caminho, não toca**; o próximo é `/method` ou `/fast` |
   | **C** | pré-existente sem relação com o alvo, ou gosto pessoal sem regra no projeto | **descarta com 1 linha de motivo** |

5. **Nota** — por pilar, os seis: Simples, Eficiente, Premium, Humano, IA, Princípios. `100 − Σ pesos dos achados de balde A`, piso 0. Nota final = a **menor** das seis; nenhum pilar compensa outro.

   | Peso | Quando |
   |---|---|
   | **−10 grave** | um leitor falha: não dá para saber o que é, achar, rodar ou confiar — 1ª linha ausente ou enganosa, comando quebrado, magia, pela metade, 2 fontes da mesma verdade, regra sem dono |
   | **−5 média** | entende-se, mas com esforço que não precisava: forma mais longa, nome que não diz, sobra, legado ao lado do novo, limiar numérico estourado |
   | **−2 leve** | acabamento: formatação, escrita, pequena diferença dos irmãos |

6. **Checks — linha de base** — os do próprio projeto, se existem (`package.json` scripts `lint`, `typecheck`/`tsc`, `test`, `format`; `Makefile` alvos `lint`, `test`, `check`), antes de tocar em qualquer coisa. Sem checks → diga no output.

7. **Corrige** (força) — todo balde A. Só dentro do alvo. Comportamento idêntico: refatorar não é feature. Apagar um arquivo inteiro ou renomear um nome público/exportado → **pergunte antes**. Correção que precisaria sair do alvo → pergunte, ou vira B. Nunca `git commit`, nunca `git push`, nunca `--amend`. No fim, os checks de novo: verde não vira vermelho — virou, é seu, corrija antes de seguir.

8. **Repete** os passos 3 → 5 e 7 até uma passada do zero dar **todo pilar ≥ 95**. `audit` para depois do passo 5. Três passadas seguidas sem a nota subir → pare e mostre o que trava (quase sempre é uma decisão do usuário).

## Output final

```
/principles <alvo> · força | audit
Nota: <antes> → <depois>   (Simples · Eficiente · Premium · Humano · IA · Princípios: nn/nn/nn/nn/nn/nn → nn/nn/nn/nn/nn/nn)

| pilar | achado | arquivo:linha | peso | balde | status |
|---|---|---|---|---|---|
| … | … | … | −5 | A | corrigido   (audit: aberto) |
| … | … | … | −10 | B | aberto — fora do alvo |
| … | … | … | −2 | C | descartado: <motivo> |

Mensagem proposta: <subject>   (só em commit <sha>)
Passadas: N · Checks: lint ✓ · typecheck ✓ · test ✓   (ou: nenhum no projeto)
Próximo: /save
```

Em `audit`: `Nota: <antes>` só, sem "depois"; `Passadas: 1`; `Checks:` só a conferência do passo 3 — lint/test não rodam, não há antes/depois; `Próximo: /principles <alvo>` para aplicar.

# Racionalizações proibidas — PARE se pensar

| Frase | Realidade |
|---|---|
| "Princípio é coisa de código, aqui é doc" | Doc duplicado, story empilhada e UC agrupado são a MESMA falha, mais barata de corrigir. BLOQUEADO. |
| "Aplico tudo no 7b, lá é o lugar" | No 7b a complexidade especulativa já foi decidida no Spec e no Plano — você só implementa o erro. BLOQUEADO. |
| "Deixo a abstração pronta, é só um arquivinho a mais" | YAGNI. Sem UC que exija, não entra. BLOQUEADO. |
| "Duplicar é mais rápido que entender o que existe" | DRY. Procure primeiro (grep). Duplicata é dívida com juros. BLOQUEADO. |
| "É genérico demais mas fica elegante" | KISS. Elegância que ninguém pediu é complexidade. BLOQUEADO. |
| "YAGNI, então não faço o que o UC pede" | Inversão. YAGNI mata especulação, não requisito nem achado real (balde B). BLOQUEADO. |
| "Simplifiquei, ficou 'bom o suficiente'" | KISS ≠ mediocridade. O piso é o nível #1 do `/solve`. BLOQUEADO. |
| "Premium é adicionar mais" | Premium se mede contra o que o alvo promete (nome + 1ª linha), não contra o que daria para acrescentar. BLOQUEADO. |
| "O arquivo já estava ruim, não fui eu" | Passou por ali, é seu. Está no perímetro → sobe. BLOQUEADO. |
| "Refatoro o projeto inteiro já que estou aqui" | O limite é o **perímetro** (o que você editou, abriu, atravessou), não o repositório. Fora dele é balde C. BLOQUEADO. |
| "Não é do alvo, mas já que estou aqui" | Fora do alvo é balde B (listar) ou C (descartar com motivo) — nunca correção silenciosa. BLOQUEADO. |
| "Só mexi numa linha, não precisa elevar o arquivo" | O arquivo está no perímetro. Regra do saldo: sai melhor do que entrou, ou você declara que já estava no nível #1. BLOQUEADO. |
| "Abri o arquivo só pra ler, não conta" | Conta. Ler é passar. Se enxergou o problema, ele está no seu perímetro. BLOQUEADO. |
| "SOLID eu cubro com o SRP" | SOLID são **cinco** — SRP, OCP, LSP, ISP, DIP. O que não é nomeado nunca é revisado. BLOQUEADO. |
| "É só um `if` a mais, não precisa de motor" | O `if` é a **segunda fonte** da mesma regra. Absorve no motor. BLOQUEADO. |
| "Crio o motor genérico agora e ligo depois" | Motor sem UC é especulação (YAGNI). Motor nasce da capacidade que já existe. BLOQUEADO. |
| "Cada tela trata do seu jeito, fica mais simples" | KISS local, caos global. A regra tem **um** dono. BLOQUEADO. |
| "Só puxei o campo lá de dentro, é mais rápido" | LoD. O vizinho **expõe**; você não atravessa. Cada ponto na cadeia é um acoplamento. BLOQUEADO. |
| "Publico o gateway sem a linha de princípios, está implícito" | Implícito = inexistente, igual ao gateway silencioso. Vale para as linhas de refatoração e design também. BLOQUEADO. |
| "É só um nome, todo mundo entende" | Nome que não diz falha nos dois leitores: o humano abre para descobrir, a IA não acha no grep. BLOQUEADO. |
| "A nota é 94, arredonda" | A nota é calculada dos achados, não sentida. Abaixo de 95 → outra passada. BLOQUEADO. |
| "Reavalio de memória, já conheço o alvo" | Cada passada lê o alvo do disco, do zero. Memória herda o erro da passada anterior. BLOQUEADO. |
| "Li 5 arquivos, o resto deve estar igual" | Leitura completa, sem amostragem. O que não foi lido não foi avaliado. BLOQUEADO. |
| "Tiro esse `if`, ninguém deve usar" | Correção não muda comportamento. Sem certeza de quem usa → grep, ou vira balde B. BLOQUEADO. |
| "A IA entende sem cabeçalho" | A IA decide pela 1ª linha se é ali que mexe. Sem cabeçalho, ela abre tudo ou erra o arquivo. BLOQUEADO. |
| "O lint já estava vermelho, não é meu" | Linha de base no passo 6 justamente para isso: diga o que já estava vermelho no output, e não deixe verde virar vermelho. BLOQUEADO. |
| "Renomeio o export, depois vejo quem usa" | Nome público/exportado só se renomeia perguntando antes. BLOQUEADO. |
| "Commito pra não perder" · "amend na mensagem, é rapidinho" | Esta skill nunca commita, nunca dá push, nunca faz `--amend`. O commit é do `/save`. BLOQUEADO. |
| "Marco como C pra fechar logo" | C é pré-existente sem relação com o alvo, com 1 linha de motivo — não é gaveta de achado inconveniente. BLOQUEADO. |
| "Já conheço os princípios, não preciso ler o arquivo" | Modo régua é a leitura desta skill inteira. Sem ela, a invocação não aconteceu. BLOQUEADO. |
