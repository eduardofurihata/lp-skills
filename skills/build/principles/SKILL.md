---
name: principles
description: 'Use when user invokes /principles — owner of the quality doctrine: SOLID, DRY, KISS, YAGNI, LoD, Motores and refactoring, plus the clarity bar for humans and for AI. The bar: simple/minimalist/clean, efficient/precise/optimized, premium/professional/complete/modern, understandable by anyone of any age. With no argument it loads the doctrine for the ongoing work; with a target (projeto, pasta/, arquivo, commit <sha>, diff, doc/skill/prompt) it scores it 0-100 per pillar and fixes it until every pillar is ≥95 — never changes behavior, never commits or pushes; `audit` = report only. Triggers on "força esse commit a ficar simples", "deixa essa pasta clean", "aplica os princípios nesse projeto", "avalia de 0 a 100", "simplifica isso", "deixa isso minimalista". Not for building features nor for committing.'
effort: max
argument-hint: "[projeto | pasta/ | arquivo | commit <sha> | diff | doc/skill/prompt <arquivo>] [audit]"
---

# /principles — simples, eficiente e premium, para gente e para IA

**Esta skill é a doutrina de qualidade — os princípios de engenharia e a régua de clareza — e é quem força um alvo a cumpri-la.** Cada palavra do padrão é uma prova de sim/não; a nota de 0 a 100 é calculada dos achados, não sentida; cada passada reavalia o alvo do zero, sem herdar a anterior.

Simples nunca é "entregar menos"; premium nunca é "adicionar o que ninguém pediu". A doutrina não decide **o quanto** existe — ela garante que tudo o que existe esteja na forma mais clara e curta, e inteiro. KISS e YAGNI matam a complexidade *desnecessária*; a *necessária* para o **nível #1** (o melhor que existe no mercado) continua sendo requisito.

## Dois modos

| Invocação | Modo | O que acontece |
|---|---|---|
| sem argumento — pelo usuário ou por outra skill | **régua** | Leia este arquivo inteiro agora (sem a leitura, a invocação não aconteceu). Os princípios e as provas abaixo valem para tudo que você tocar daqui em diante. Sem passada, sem nota, sem output final. |
| com alvo | **alvo** | Fluxo abaixo: os alvos, os pilares e os pesos desta régua, rodando o motor de `references/fluxo-modo-alvo.md` — inventário → achados → baldes → nota → corrige → repete até todo pilar ≥ 95. |

# Princípios de engenharia — SOLID · DRY · KISS · YAGNI · LoD · Motores

> **Esta seção é a fonte única dos princípios.** Nenhum outro arquivo os redefine — todos apontam para cá (DRY aplicado a si mesmo). Quem aplica a doutrina numa etapa de trabalho tem a **lente**: o que o princípio significa *ali*. É o pilar **Princípios** da nota, e a prova é esta seção inteira.

**Os princípios não são fase — são regime.** Não existe "a etapa de aplicar SOLID". Valem do primeiro artefato de texto ao código, ao que você escreve **e** ao que você toca. Quem só cobra na hora de codificar já perdeu: a complexidade especulativa nasce quando se decide a arquitetura, e chega ao código como fato consumado.

> **SOLID são CINCO princípios, não um.** Escrever "SRP" e chamar de SOLID deixa quatro de fora — e o que não é nomeado nunca é cobrado no review.

## SOLID (os cinco, um a um)

| Princípio | Regra | Falha típica |
|---|---|---|
| **S — SRP** (responsabilidade única) | Cada unidade (doc, decisão, task, arquivo, classe, função, componente) tem **uma, e só uma, razão para mudar** — responde a **um** ator. "Faz uma coisa" é o sintoma; o teste é *quem pede a mudança*: dois pedidos de donos diferentes no mesmo arquivo → separe. Componente misturando lógica+UI → hook + componente burro; limiares de tamanho em § Refatoração contínua. | "Esse service faz tudo de pagamento" |
| **O — OCP** (aberto/fechado) | Comportamento novo entra por **composição/estratégia**, sem editar o que já funciona. Mais um `if` no meio da função que todo mundo usa é o sintoma. | "Só adicionei mais um case no switch" |
| **L — LSP** (substituição) | Quem implementa o contrato **honra** o contrato: mesmas garantias, não lança onde o contrato não prevê, não exige mais do que ele exige. Subtipo que quebra o chamador não é subtipo. | "Essa implementação lança nesse caso, quem chama que trate" |
| **I — ISP** (segregação de interface) | Interface pequena, focada no que o cliente usa. Depender de 10 métodos para usar 2 é acoplamento a 8 que não lhe dizem respeito. | "A interface do service tem tudo, cada um usa o que quiser" |
| **D — DIP** (inversão de dependência) | Dependa de **abstração**, não de implementação; a direção aponta para o domínio, nunca para o detalhe (banco, HTTP, lib). O **motor** (abaixo) define o contrato; a infra implementa. | "O service importa o client do Prisma direto" |

## Os demais

| Princípio | Regra | Falha típica |
|---|---|---|
| **DRY** | Zero duplicação de lógica **ou de decisão**; uma única fonte de verdade. Antes de criar, **procure** (grep em `shared/`, `lib/`, `components/`, `hooks/`) — reutilizar/estender > recriar. Repetiu 2× já é candidato a extração. | "Copiei e adaptei" |
| **KISS** | A solução mais simples que atinge o **nível #1**. 5 linhas > 50 linhas. Simplicidade ≠ mediocridade. | "Fiz genérico pra ficar elegante" |
| **YAGNI** | APENAS o que o requisito acordado exige. Zero abstração especulativa. 3 linhas similares > abstração prematura. Nunca é desculpa para entregar menos que o requisito pede, nem para descartar achado real (vira **balde B** na triagem A/B/C do fluxo). | "Deixei preparado pro dia que precisar" |
| **LoD** (Law of Demeter) | Objeto só fala com vizinhos diretos. Seção própria abaixo. | "Só puxei o campo lá de dentro" |
| **Motores** | Toda capacidade tem **um** dono. Seção própria abaixo. | "Cada tela trata do seu jeito" |

**Como os cinco do SOLID se amarram no resto:** **OCP** é como o motor cresce (extensão, não `if` novo) · **ISP** e **LoD** são o mesmo contrato pequeno visto de dois lados · **DIP** é a direção das dependências dita por princípio · **LSP** é o que faz o contrato do motor valer para todas as implementações · **SRP** diz **a quem** cada unidade responde, **LoD** diz **com quem** ela fala.

**Separação de camadas é o SRP aplicado à arquitetura:** controller = HTTP, service = lógica, componente = UI — lógica de negócio NUNCA no controller nem no componente. Acoplamento, direção de dependências e ciclos são a **Law of Demeter** (abaixo), fonte única dessas três regras.

## Motores — a capacidade tem dono

> **Pense em motores.** Toda capacidade do sistema — calcular, validar, sincronizar, formatar, autorizar — é responsabilidade de **um motor**: uma unidade nomeada pela capacidade que entrega, que **engloba tudo** o que aquela capacidade precisa, expõe um contrato pequeno e público, e é o **único** lugar onde aquela regra vive. O resto do sistema não reimplementa: **chama o motor**.

**Motor não é princípio novo — é nome de aplicação.** Ele é o **SRP-ator** acima + **coesão funcional** (Constantine) + **information hiding** (Parnas), com a decisão que nenhum dos três toma sozinho: **qual é a unidade**. SRP manda cada unidade responder a um ator, DRY manda a regra ter uma fonte, LoD manda o contrato ser pequeno — o motor diz *de que unidade se fala*: da **capacidade**, nunca da camada (`utils`, `helpers`, `services`). Por isso cada regra dele é um princípio já dito, aplicado a essa unidade:

| Regra | É | Aplicada à capacidade |
|---|---|---|
| **Nome = capacidade, não camada** | coesão funcional · prova *acha em 1 grep* | "motor de cálculo de frete", "motor de validação de cupom" — não `ShippingUtils`, `helpers`, `misc`: nome de camada esconde que ali mora uma regra |
| **Engloba** | DRY + refatoração contínua | pedaço solto da mesma capacidade (um `if` numa tela, um cálculo repetido num componente) → **absorve**, e o chamador passa a só chamar. É refatoração, não escopo novo |
| **Contrato pequeno** | ISP + LoD + information hiding | entrada e saída explícitas; o interior é privado — o chamador não conhece as tripas |
| **Um dono** | DRY · SRP-ator | duas fontes da mesma regra = **defeito**, não estilo. Quem decide é o motor; quem exibe é a tela |

**Auto-check — é o teste do ator do SRP, feito no arquivo:** *"Se amanhã essa regra mudar, existe UM arquivo pra abrir?"* Se a resposta for "depende" ou "vários" → não tem motor, tem espalhamento.

**A tensão com YAGNI — resolvida aqui, para não virar desculpa dos dois lados:** motor nasce da capacidade que os **casos de uso já exigem**. "Motor genérico pro dia que precisar" é abstração especulativa: **BLOQUEADO**. YAGNI proíbe o motor **sem caso de uso**; a doutrina do motor proíbe a capacidade **que já existe** ficar espalhada. E motor **não é framework**: nada de registry, plugin ou DSL interna para atender um caso de uso.

## Law of Demeter — fale só com o vizinho

> Um objeto conversa com quem ele **conhece de fato**: seus próprios campos, seus parâmetros, o que ele criou. `a.b.c.d.method()` não é atalho — é a declaração de que você conhece as tripas de três objetos, e de que qualquer mudança em qualquer um deles quebra você.

| Regra | O que significa |
|---|---|
| **Só o vizinho direto** | Chame o que está a **um salto**: `this.x`, um parâmetro, o que a própria unidade criou. Cada ponto a mais na cadeia é um acoplamento a mais. |
| **Contrato > navegação** | Precisou do dado lá do fundo? O vizinho **expõe** o que você precisa (`pedido.valorTotal()`); você não vai buscar (`pedido.cliente.plano.desconto.valor`). |
| **Direção declarada** | `shared → api/web` ok; `api → web` e `web → api` proibidos. Direção não declarada vira ciclo. |
| **Zero ciclo** | Dependência circular é LoD levado ao extremo: dois módulos que conhecem as tripas um do outro. Achou → quebre com contrato ou motor. |

**Auto-check:** *"Se eu renomear um campo no fim da cadeia, quantos arquivos quebram?"* Mais de um → você está **navegando**, não conversando.

**O que ele NÃO proíbe:** LoD não veta API fluente do mesmo objeto (`query.where().order().limit()` é **um** vizinho devolvendo a si mesmo), nem exige delegação cega (um wrapper por campo é o oposto: burocracia sem contrato). O que ele proíbe é **atravessar objetos** para alcançar um dado que ninguém expôs.

## Refatoração contínua — a cada passada o código sobe

> **Refatorar não é uma etapa nem um pedido — é o que acontece por padrão em tudo por onde o trabalho passa.** Os princípios valem para o código que você **encontra**, não só para o que escreve.

**O perímetro — tudo por onde você passou:**

- o arquivo que você **editou**;
- o arquivo que você **abriu só para entender**;
- o **dependente direto** que o grep revelou;
- o **caminho inteiro** que o fluxo atravessa.

**Dentro do perímetro: refatore bastante, sem timidez.** Fora do perímetro: triagem normal — **balde B** se o trabalho o expôs, **C** se não tem relação (a triagem A/B/C do fluxo). O limite é o **caminho percorrido**, não "só a linha que editei" e nem o repositório inteiro.

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

# A régua de clareza — para gente e para IA

Simples e Eficiente são a lente de SRP, DRY e KISS (§ Princípios de engenharia, acima) para qualquer alvo — commit, pasta, doc; Premium e os dois leitores são o que a doutrina não cobria.

**Toda palavra do padrão tem UMA prova aqui — sinônimo não vira pilar novo (YAGNI):** minimalista e clean → **Simples** (zero sobra) + **Premium** (acabamento) · fácil, qualquer pessoa de qualquer idade → **Humano** (teste do leigo) · objetivo, direto → **Eficiente** (menor forma) · otimizado → **Eficiente** (zero desperdício) · preciso → **Eficiente** (preciso) · completo → **Premium** (nada pela metade + fecha o ciclo) · moderno → **Premium** (moderno) · profissional → **Premium** (acabamento). O que não tem prova nomeada não é cobrado.

## Simples · Eficiente · Premium — cada palavra é uma prova

| Pilar | Prova (sim/não) | Falha típica |
|---|---|---|
| **Simples** — 1 coisa | Cada unidade (arquivo, função, seção, commit) faz UMA coisa, e o nome diz qual | `utils.ts` com 12 funções sem parentesco · commit "ajustes gerais" |
| **Simples** — 1ª linha | A primeira linha (H1, cabeçalho, docstring, subject) diz o que é e para que serve | `# Notas` · `feat: wip` · arquivo que abre com 20 imports e nenhum cabeçalho |
| **Simples** — nome diz | Nome de arquivo, pasta, função e variável se entende sem abrir: sem abreviação, sem `v2/new/old/final`, sem sigla que o projeto não usa em todo lugar | `handleData` · `utils2.ts` · `final_FINAL.md` · `qtd` |
| **Simples** — zero sobra | Nada que ninguém usa nem lê: código, import ou arquivo morto, seção vazia, comentário que repete o código, TODO vencido | `// removed` · `_unused` · `## Referências` vazio |
| **Eficiente** — menor forma | Não existe versão mais curta com o mesmo significado e comportamento: 5 linhas > 50, 1 tabela > 3 parágrafos, sem preâmbulo | função de 60 linhas com 3 caminhos iguais · "antes de começar, é importante lembrar que…" |
| **Eficiente** — zero desperdício | Nada é buscado, calculado ou desenhado duas vezes, nem dentro do laço o que cabe fora | consulta dentro do `for` (N+1) · `.find()` dentro de `.map()` · carregar a lista inteira só para contar |
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
| 1ª linha | H1 + 1ª frase do README (ou índice da pasta); nome da pasta | cabeçalho ou docstring | commit: subject em Conventional Commits, corpo com o porquê se não for óbvio · diff: — | H1 + tese |
| 1 coisa | 1 domínio por pasta; irmãos com parentesco | 1 responsabilidade | 1 intenção por commit ou diff | 1 assunto por doc; 1 ideia por seção |
| 1 fonte | entre pastas e entre docs | dentro do arquivo | o diff não copia o que já existe no repo (`grep` antes) | não repete outro doc — aponta |
| fecha o ciclo | README com como rodar e testar | entrada → saída explícitas | mensagem responde "por quê"; diff não deixa nada pela metade | como usar + próximo passo |
| comando roda | scripts de `package.json` e `Makefile` | — | — | comandos citados |
| igual aos irmãos | convenção de nome e layout entre pastas | vs. arquivos da mesma pasta | vs. `git log --oneline -20` | vs. docs irmãos |

# Fluxo (modo alvo)

**Leia `references/fluxo-modo-alvo.md` agora** — é o motor desta passada: snapshot, inventário do zero, baldes A/B/C, fórmula da nota, checks, correção, repetição até todo pilar ≥ 95 e Output final. É o mesmo motor que o `/ui` roda, e ele é a fonte única dessas regras. Sem essa leitura, o modo alvo não roda. Daqui sai o que é **desta** régua:

## Alvos — passo 1

| Argumento | Alvo | O que se lê |
|---|---|---|
| `commit <sha>` · `HEAD` · `HEAD~n` | mensagem **e** diff do commit | `git show <sha>` |
| `diff` · `alteração` | tudo não commitado (staged, unstaged, untracked) | `git diff HEAD` + os untracked de `git status --porcelain`, lidos do disco |
| `projeto` · `repo` · `.` | todos os arquivos rastreados | `git ls-files` — leitura completa, sem amostragem |
| caminho de pasta | a pasta e tudo dentro | cada arquivo dela |
| caminho de arquivo (`doc`, `skill` ou `prompt` na frente escolhe a coluna de § Onde a prova muda de forma) | o arquivo | o arquivo + `grep` de quem o usa |

## Pilares e pesos — passo 5

Os seis: **Simples · Eficiente · Premium · Humano · IA · Princípios**.

| Peso | Quando |
|---|---|
| **10 — grave** | um leitor falha: não dá para saber o que é, achar, rodar ou confiar — 1ª linha ausente ou enganosa, comando quebrado, magia, pela metade, 2 fontes da mesma verdade, regra sem dono |
| **5 — média** | entende-se, mas com esforço que não precisava: forma mais longa, nome que não diz, sobra, legado ao lado do novo, limiar numérico estourado |
| **2 — leve** | acabamento: formatação, escrita, pequena diferença dos irmãos |

## O que esta régua exige a mais

- **Passo 3 (passada)** — releia a doutrina acima, que é a régua do pilar Princípios. **Um achado, um pilar:** se uma prova de clareza o nomeia, é dela; Princípios fica com o que só a doutrina cobre (OCP, LSP, ISP, DIP, YAGNI, LoD, Motores, perímetro, limiares). Todo caminho (`ls`), comando (existe) e link (responde) citado pelo alvo é conferido — é a prova "preciso" em qualquer projeto.
- **Passo 6 (checks)** — os do projeto: `package.json` scripts `lint`, `typecheck`/`tsc`, `test`, `format`; `Makefile` alvos `lint`, `test`, `check`.
- **Passo 7 (corrige)** — comportamento idêntico significa que refatorar não muda o que o alvo faz. Apagar um arquivo inteiro ou renomear um nome público/exportado → **pergunte antes**.
- **Output** — em `commit <sha>`, acrescenta a linha `Mensagem proposta: <subject>`; a mensagem só recebe proposta, nunca `--amend`.

# Racionalizações proibidas — PARE se pensar

As do fluxo estão em `references/fluxo-modo-alvo.md`; estas são da doutrina.

| Frase | Realidade |
|---|---|
| "Princípio é coisa de código, aqui é doc" | Doc duplicado, requisito empilhado e caso de uso agrupado são a MESMA falha, mais barata de corrigir. BLOQUEADO. |
| "Aplico tudo na hora de codificar, lá é o lugar" | Quando você chega no código, a complexidade especulativa já foi decidida — você só implementa o erro. BLOQUEADO. |
| "Deixo a abstração pronta, é só um arquivinho a mais" · "crio o motor genérico agora e ligo depois" | YAGNI. Sem caso de uso que exija, não entra — o motor nasce da capacidade que **já existe**. BLOQUEADO. |
| "Duplicar é mais rápido que entender o que existe" | DRY. Procure primeiro (grep). Duplicata é dívida com juros. BLOQUEADO. |
| "É genérico demais mas fica elegante" | KISS. Elegância que ninguém pediu é complexidade. BLOQUEADO. |
| "YAGNI, então não faço o que o requisito pede" | Inversão. YAGNI mata especulação, não requisito nem achado real (balde B). BLOQUEADO. |
| "Simplifiquei, ficou 'bom o suficiente'" | KISS ≠ mediocridade. O piso é o nível #1. BLOQUEADO. |
| "Premium é adicionar mais" | Isso é escopo novo, não acabamento — e escopo não é desta skill. A régua é o que o alvo **promete**. BLOQUEADO. |
| "O arquivo já estava ruim, não fui eu" | Passou por ali, é seu. Está no perímetro → sobe. BLOQUEADO. |
| "Refatoro o projeto inteiro já que estou aqui" | O limite é o **perímetro** — o que você editou, abriu, atravessou — nunca o repositório. Fora dele, a triagem A/B/C do fluxo decide: B se este trabalho o expôs, C se não tem relação. BLOQUEADO. |
| "Só mexi numa linha, não precisa elevar o arquivo" | O arquivo está no perímetro. Regra do saldo: sai melhor do que entrou, ou você declara que já estava no nível #1. BLOQUEADO. |
| "Abri o arquivo só pra ler, não conta" | Conta. Ler é passar. Se enxergou o problema, ele está no seu perímetro. BLOQUEADO. |
| "SOLID eu cubro com o SRP" | SOLID são **cinco** — SRP, OCP, LSP, ISP, DIP. O que não é nomeado nunca é revisado. BLOQUEADO. |
| "É só um `if` a mais, não precisa de motor" | O `if` é a **segunda fonte** da mesma regra. Absorve no motor. BLOQUEADO. |
| "Cada tela trata do seu jeito, fica mais simples" | KISS local, caos global. A regra tem **um** dono. BLOQUEADO. |
| "Só puxei o campo lá de dentro, é mais rápido" | LoD. O vizinho **expõe**; você não atravessa. Cada ponto na cadeia é um acoplamento. BLOQUEADO. |
| "É só um nome, todo mundo entende" | Nome que não diz falha nos dois leitores: o humano abre para descobrir, a IA não acha no grep. BLOQUEADO. |
| "Tiro esse `if`, ninguém deve usar" | Correção não muda comportamento. Sem certeza de quem usa → grep, ou vira balde B. BLOQUEADO. |
| "A IA entende sem cabeçalho" | A IA decide pela 1ª linha se é ali que mexe. Sem cabeçalho, ela abre tudo ou erra o arquivo. BLOQUEADO. |
| "Renomeio o export, depois vejo quem usa" | Nome público/exportado só se renomeia perguntando antes. BLOQUEADO. |
| "Já conheço os princípios, não preciso ler o arquivo" | Modo régua é a leitura desta skill inteira. Sem ela, a invocação não aconteceu. BLOQUEADO. |
