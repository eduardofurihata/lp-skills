# Princípios de Engenharia — Fonte Única (valem em TODOS os steps)

> **Este arquivo é a fonte única.** Nenhum outro arquivo redefine os princípios — todos apontam para cá (DRY aplicado ao próprio protocolo). O que cada step tem é a **lente**: o que o princípio significa *naquele* step.

**Os princípios não são fase — são regime.** Não existe "step de aplicar SOLID". Eles valem do Step 1 ao Step 10, do artefato de texto ao código, ao que você escreve **e** ao que você toca. Quem só cobra no 7b já perdeu: a complexidade especulativa nasce no Spec e no Plano, e chega no código como fato consumado.

> **Irmão deste arquivo:** `design.md` — fonte única dos princípios de **design** (tokens, atomicidade, composição, headless, estados, a11y), com a mesma estrutura e a mesma régua. Feature com superfície visual obedece aos dois.

## A lista canônica — SOLID · DRY · KISS · YAGNI · LoD · Motores

> **SOLID são CINCO princípios, não um.** Escrever "SRP" e chamar de SOLID deixa quatro de fora — e o que não é nomeado nunca é cobrado no review.

### SOLID (os cinco, um a um)

| Princípio | Regra | Falha típica |
|---|---|---|
| **S — SRP** (responsabilidade única) | Cada unidade (doc, decisão, task, arquivo, classe, função, componente) faz **UMA** coisa e a faz bem. Função >40 linhas → extraia helper. Componente misturando lógica+UI → hook + componente burro. | "Esse service faz tudo de pagamento" |
| **O — OCP** (aberto/fechado) | Comportamento novo entra por **composição/estratégia**, sem editar o que já funciona. Mais um `if` no meio da função que todo mundo usa é o sintoma. | "Só adicionei mais um case no switch" |
| **L — LSP** (substituição) | Quem implementa o contrato **honra** o contrato: mesmas garantias, não lança onde o contrato não prevê, não exige mais do que ele exige. Subtipo que quebra o chamador não é subtipo. | "Essa implementação lança nesse caso, quem chama que trate" |
| **I — ISP** (segregação de interface) | Interface pequena, focada no que o cliente usa. Depender de 10 métodos para usar 2 é acoplamento a 8 que não lhe dizem respeito. | "A interface do service tem tudo, cada um usa o que quiser" |
| **D — DIP** (inversão de dependência) | Dependa de **abstração**, não de implementação; a direção aponta para o domínio, nunca para o detalhe (banco, HTTP, lib). O **motor define o contrato**; a infra implementa. | "O service importa o client do Prisma direto" |

### Os demais

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

> No front, o equivalente do motor é o **componente do DS**: a capacidade visual tem um dono e se promove para lá em vez de espalhar. Ver `design.md` § *O design system evolui com o produto*.

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

**KISS/YAGNI matam a complexidade *desnecessária*. A complexidade *necessária* para o nível #1 (`/solve`) continua sendo requisito.** YAGNI nunca é desculpa para entregar menos do que o UC pede, nem para descartar achado real (isso é balde B — ver `follow-ups.md`). KISS nunca é desculpa para a versão pobre da feature.

## Refatoração contínua — a cada passada o código sobe

> **Refatorar não é um step nem um pedido — é o que acontece por padrão em tudo por onde o trabalho passa.** Os princípios valem para o código que você **encontra**, não só para o que escreve.

**O perímetro — tudo por onde você passou:**

- o arquivo que você **editou**;
- o arquivo que você **abriu só para entender**;
- o **dependente direto** que o grep revelou;
- o **caminho inteiro** que o fluxo da feature atravessa.

**Dentro do perímetro: refatore bastante, sem timidez.** Fora do perímetro: é balde C (`follow-ups.md`) — o limite é o **caminho percorrido**, não "só a linha que editei" e nem o repositório inteiro.

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

Detalhe operacional por arquivo: `07-implementation.md` § Refatoração Obrigatória. No front, o equivalente é elevar o padrão visual em vez de copiá-lo: `design.md` § *Consistência é lei; mediocridade não é*.

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
| **7b — Codificar** | Todos na íntegra (SOLID · DRY · KISS · YAGNI · LoD · Motores) + limiares numéricos + **refatoração do perímetro**. A capacidade mora no motor; a mesma regra encontrada fora → **absorve**. Detalhe: `07-implementation.md` § Práticas Obrigatórias. |
| **8 — Code Review** | Revisar **contra esta mesma lista, princípio a princípio e por nome** — não por proxy, e **os cinco do SOLID**, não só o SRP. **Motor:** a capacidade vazou? existe segunda fonte da mesma regra? o contrato virou tripa exposta? **Refatoração:** confira o **saldo** — todo arquivo do perímetro subiu ou já estava no nível #1. Violação encontrada → triagem A/B/C (`follow-ups.md`): dentro do escopo = corrige agora; escopo novo = ledger. |
| **9 — Run Test** | Todo fix feito para um TC passar obedece os princípios — **workaround que faz o TC passar violando SRP/DRY é FAILED disfarçado**. **Motor:** o fix vai **para o motor**, nunca de remendo no chamador. **Refatoração:** fix novo reabre o perímetro do fix. Qualquer fix invalida o review → volta ao Step 8. |
| **10 — Done** | O done doc registra o que os princípios produziram: **o que foi reutilizado** (DRY), **o que foi descartado** (YAGNI), **quais motores nasceram, cresceram ou absorveram** e **o que a refatoração do perímetro elevou**. Sem isso, o registro mente sobre como a feature ficou. |

## Linha obrigatória no Gateway Check

Todo Gateway Check publicado no chat carrega estas linhas — igual à de follow-ups, pelo mesmo motivo (o que não é declarado, escapa):

```markdown
- **Princípios (SOLID · DRY · KISS · YAGNI · LoD · Motores):** ✅ aplicados — <1 linha: o que a lente deste step cobrou>
- **Refatoração (tudo por onde passou):** ✅ <N> elevados — <o que subiu> / nada a elevar — verifiquei <X> e já estava no nível #1
- **Design (tokens · atomicidade · composição · estados · a11y):** ✅ <o que a lente cobrou>   ← só em feature com superfície visual (`design.md`)
```

Sem elas, o gateway **não foi publicado**. "N/A" não existe: se a lente do step não teve nada a cobrar, escreva o que você verificou e não encontrou. A linha de **Design** é a única condicional — feature sem superfície visual declara isso **uma vez** no Gateway 4→5 e as seguintes herdam (`design.md` § Linha obrigatória).

## Racionalizações proibidas

| Frase | Realidade |
|---|---|
| "Princípio é coisa de código, aqui é doc" | Doc duplicado, story empilhada e UC agrupado são a MESMA falha, mais barata de corrigir. BLOQUEADO. |
| "Aplico tudo no 7b, lá é o lugar" | No 7b a complexidade especulativa já foi decidida no Spec e no Plano — você só implementa o erro. BLOQUEADO. |
| "Deixo a abstração pronta, é só um arquivinho a mais" | YAGNI. Sem UC que exija, não entra. BLOQUEADO. |
| "Duplicar é mais rápido que entender o que existe" | DRY. Procure primeiro (grep). Duplicata é dívida com juros. BLOQUEADO. |
| "É genérico demais mas fica elegante" | KISS. Elegância que ninguém pediu é complexidade. BLOQUEADO. |
| "YAGNI, então não faço o que o UC pede" | Inversão. YAGNI mata especulação, não requisito nem achado real (balde B). BLOQUEADO. |
| "Simplifiquei, ficou 'bom o suficiente'" | KISS ≠ mediocridade. O piso é o nível #1 do `/solve`. BLOQUEADO. |
| "O arquivo já estava ruim, não fui eu" | Passou por ali, é seu. Está no perímetro → sobe. BLOQUEADO. |
| "Refatoro o projeto inteiro já que estou aqui" | O limite é o **perímetro** (o que você editou, abriu, atravessou), não o repositório. Fora dele é balde C. BLOQUEADO. |
| "Só mexi numa linha, não precisa elevar o arquivo" | O arquivo está no perímetro. Regra do saldo: sai melhor do que entrou, ou você declara que já estava no nível #1. BLOQUEADO. |
| "Abri o arquivo só pra ler, não conta" | Conta. Ler é passar. Se enxergou o problema, ele está no seu perímetro. BLOQUEADO. |
| "SOLID eu cubro com o SRP" | SOLID são **cinco**. OCP, LSP, ISP e DIP não são opcionais, e o que não é nomeado nunca é revisado. BLOQUEADO. |
| "É só um `if` a mais, não precisa de motor" | O `if` é a **segunda fonte** da mesma regra. Absorve no motor. BLOQUEADO. |
| "Crio o motor genérico agora e ligo depois" | Motor sem UC é especulação (YAGNI). Motor nasce da capacidade que já existe. BLOQUEADO. |
| "Cada tela trata do seu jeito, fica mais simples" | KISS local, caos global. A regra tem **um** dono. BLOQUEADO. |
| "Só puxei o campo lá de dentro, é mais rápido" | LoD. O vizinho **expõe**; você não atravessa. Cada ponto na cadeia é um acoplamento. BLOQUEADO. |
| "Publico o gateway sem a linha de princípios, está implícito" | Implícito = inexistente, igual ao gateway silencioso. Vale para as linhas de refatoração e design também. BLOQUEADO. |
