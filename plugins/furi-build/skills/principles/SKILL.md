---
name: principles
description: 'Use ONLY when the user explicitly invokes /principles (bare /principles = the target is whatever the conversation is already about), or when another skill invokes `furi-build:principles` via the Skill tool. NEVER activate on your own initiative. — the engineering doctrine: SOLID (all five), DRY, KISS, YAGNI, Law of Demeter, Motores (every capability has one owner) and continuous refactoring (everything the work touches goes up — the balance rule). With no target it loads the doctrine for the ongoing work; with a target (folder, file, diff, commit <sha>) it audits the perimeter principle by principle and by name, fixes what is below the bar without changing behaviour, and reports what went up and what was already there; `audit` = report only. Never commits, never creates a branch.'
effort: max
argument-hint: "[pasta/ | arquivo | diff | commit <sha>] [audit]"
---

# /principles — Princípios de engenharia: regime, não fase

> **Esta skill é a fonte única dos princípios de engenharia.** Nenhum outro arquivo os redefine — todos apontam para cá (DRY aplicado à própria doutrina). Quem a invoca dentro de um protocolo tem a **lente**: o que o princípio significa *naquele* passo.

**Os princípios não são fase — são regime.** Não existe "hora de aplicar SOLID". Valem do primeiro rascunho ao último review, do artefato de texto ao código, ao que você escreve **e** ao que você toca. Quem só cobra na hora de codar já perdeu: a complexidade especulativa nasce na decisão e no plano, e chega no código como fato consumado.

> **Irmã desta skill:** `/front` — fonte única dos princípios de **design** (tokens, atomicidade, composição, headless, estados, a11y), com a mesma estrutura e a mesma régua. Trabalho com superfície visual obedece às duas.

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
| **YAGNI** | APENAS o que o requisito atual exige. Zero abstração especulativa. 3 linhas similares > abstração prematura. | "Deixei preparado pro dia que precisar" |
| **LoD** (Law of Demeter) | Objeto só fala com vizinhos diretos. Seção própria abaixo. | "Só puxei o campo lá de dentro" |
| **Motores** | Toda capacidade tem **um** dono. Seção própria abaixo. | "Cada tela trata do seu jeito" |

**Como os cinco do SOLID se amarram no resto:** **OCP** é como o motor cresce (extensão, não `if` novo) · **ISP** e **LoD** são o mesmo contrato pequeno visto de dois lados · **DIP** é a regra de direção de dependências dita por princípio · **LSP** é o que faz o contrato do motor valer para todas as implementações · **SRP** diz o que cada unidade faz, **LoD** diz com quem ela fala.

Complementos de arquitetura, inseparáveis dos princípios:

- **Separação de camadas:** controller = HTTP, service = lógica, componente = UI. Lógica de negócio NUNCA no controller/componente.
- **Baixo acoplamento, alta coesão:** módulos injetáveis, independentes. Sem dependências circulares (direção: § Law of Demeter).

## Motores — a capacidade tem dono

> **Pense em motores.** Toda capacidade do sistema — calcular, validar, sincronizar, formatar, autorizar — é responsabilidade de **um motor**: uma unidade nomeada pela capacidade que entrega, que **engloba tudo** o que aquela capacidade precisa, expõe um contrato pequeno e público, e é o **único** lugar onde aquela regra vive. O resto do sistema não reimplementa: **chama o motor**.

| Regra | O que significa |
|---|---|
| **Nome = capacidade, não camada** | "motor de cálculo de frete", "motor de validação de cupom". Não `ShippingUtils`, `helpers`, `misc` — nome de camada esconde que ali mora uma regra. |
| **Engloba** | Achou pedaço da mesma capacidade solto (um `if` numa tela, um cálculo repetido num componente) → **absorve para o motor**, e o chamador passa a só chamar. Isso é refatoração, não escopo novo. |
| **Contrato pequeno** | Entrada e saída explícitas; o interior é privado. É Law of Demeter aplicada: o chamador não conhece as tripas do motor. |
| **Um dono** | Duas fontes da mesma regra = **defeito**, não estilo. Quem decide é o motor; quem exibe é a tela. |

**Auto-check:** *"Se amanhã essa regra mudar, existe UM arquivo pra abrir?"* Se a resposta for "depende" ou "vários" → não tem motor, tem espalhamento.

**A tensão com YAGNI — resolvida aqui, para não virar desculpa dos dois lados:** motor nasce da capacidade que o requisito **já exige**. "Motor genérico pro dia que precisar" é abstração especulativa: **BLOQUEADO**. YAGNI proíbe o motor **sem requisito**; a doutrina do motor proíbe a capacidade **que já existe** ficar espalhada. E motor **não é framework**: nada de registry, plugin ou DSL interna para atender um requisito.

> No front, o equivalente do motor é o **componente do design system**: a capacidade visual tem um dono e se promove para lá em vez de espalhar. Ver `front/SKILL.md` § *O design system evolui com o produto*.

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

**KISS/YAGNI matam a complexidade *desnecessária*. A complexidade *necessária* para o nível #1 (`/solve`) continua sendo requisito.** YAGNI nunca é desculpa para entregar menos do que o requisito pede, nem para descartar achado real — achado real fora do escopo se **registra**, não se some. KISS nunca é desculpa para a versão pobre da feature.

## Refatoração contínua — a cada passada o código sobe

> **Refatorar não é uma etapa nem um pedido — é o que acontece por padrão em tudo por onde o trabalho passa.** Os princípios valem para o código que você **encontra**, não só para o que escreve.

**O perímetro — tudo por onde você passou:**

- o arquivo que você **editou**;
- o arquivo que você **abriu só para entender**;
- o **dependente direto** que o grep revelou;
- o **caminho inteiro** que o fluxo da feature atravessa.

**Dentro do perímetro: refatore bastante, sem timidez.** Fora do perímetro: não é seu — **liste o achado**, não mexa. O limite é o **caminho percorrido**, não "só a linha que editei" e nem o repositório inteiro.

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

**Não é desculpa para:** reescrever o repositório (fora do perímetro se lista), adiar a entrega, nem criar abstração que nenhum requisito pede (YAGNI continua valendo).

Quando o trabalho é **texto** — doc, spec, plano, task —, o perímetro é o artefato: doc consolidado em vez de paralelo, decisão fundida, task separada. No front, o equivalente é elevar o padrão visual em vez de copiá-lo: `front/SKILL.md` § *Consistência é lei; mediocridade não é*.

## Aplicar a um alvo

Sem argumento, a doutrina acima passa a valer para o trabalho em curso — é isso que um protocolo que invoca esta skill quer. Com um alvo, ela vira uma passada:

1. **Alvo.** `pasta/`, `arquivo`, `diff` (o working tree) ou `commit <sha>`. `audit` no fim = só relatório, nada é editado.
2. **Perímetro.** O alvo + o que você abriu para entender + os dependentes diretos que o grep revelou + o caminho que o fluxo atravessa. Declare-o antes de mexer.
3. **Passada, por arquivo, princípio a princípio e POR NOME.** As tabelas acima são o checklist — para cada linha, a *falha típica* aconteceu aqui? Os cinco do SOLID inclusive; motores: a regra tem um dono ou está espalhada?
4. **Corrigir** o que está abaixo do nível, dentro do perímetro — tabela *Achou → Faça*, regra do saldo. **Sem mudar comportamento:** refatoração preserva o que o código faz; se corrigir exige mudar comportamento, isso é achado, não correção. Fora do perímetro: **lista**, não mexe.
5. **Relatório**, por arquivo: o que subiu · o que já estava no nível #1 (declarado) · achados fora do perímetro · o que exigiria mudança de comportamento (não feito). **Nunca commita, nunca cria branch** — quem decide o que fazer com a passada é quem a pediu.

> Dentro do `/method`: cada step traz a **lente** desta doutrina na seção *Princípios neste step* do próprio reference (`method/references/`), e a declara na linha obrigatória do Gateway Check (`method/SKILL.md` § Gateway Check) — mesma doutrina, cobrada step a step.

## Racionalizações proibidas

| Frase | Realidade |
|---|---|
| "Princípio é coisa de código, aqui é doc" | Doc duplicado, decisão empilhada e task agrupada são a MESMA falha, mais barata de corrigir. BLOQUEADO. |
| "Aplico tudo na hora de codar, lá é o lugar" | Na hora de codar a complexidade especulativa já foi decidida antes — você só implementa o erro. BLOQUEADO. |
| "Deixo a abstração pronta, é só um arquivinho a mais" | YAGNI. Sem requisito que exija, não entra. BLOQUEADO. |
| "Duplicar é mais rápido que entender o que existe" | DRY. Procure primeiro (grep). Duplicata é dívida com juros. BLOQUEADO. |
| "É genérico demais mas fica elegante" | KISS. Elegância que ninguém pediu é complexidade. BLOQUEADO. |
| "YAGNI, então não faço o que foi pedido" | Inversão. YAGNI mata especulação, não requisito nem achado real. BLOQUEADO. |
| "Simplifiquei, ficou 'bom o suficiente'" | KISS ≠ mediocridade. O piso é o nível #1 (`/solve`). BLOQUEADO. |
| "O arquivo já estava ruim, não fui eu" | Passou por ali, é seu. Está no perímetro → sobe. BLOQUEADO. |
| "Refatoro o projeto inteiro já que estou aqui" | O limite é o **perímetro** (o que você editou, abriu, atravessou), não o repositório. Fora dele se lista. BLOQUEADO. |
| "Só mexi numa linha, não precisa elevar o arquivo" | O arquivo está no perímetro. Regra do saldo: sai melhor do que entrou, ou você declara que já estava no nível #1. BLOQUEADO. |
| "Abri o arquivo só pra ler, não conta" | Conta. Ler é passar. Se enxergou o problema, ele está no seu perímetro. BLOQUEADO. |
| "SOLID eu cubro com o SRP" | SOLID são **cinco**. OCP, LSP, ISP e DIP não são opcionais, e o que não é nomeado nunca é revisado. BLOQUEADO. |
| "É só um `if` a mais, não precisa de motor" | O `if` é a **segunda fonte** da mesma regra. Absorve no motor. BLOQUEADO. |
| "Crio o motor genérico agora e ligo depois" | Motor sem requisito é especulação (YAGNI). Motor nasce da capacidade que já existe. BLOQUEADO. |
| "Cada tela trata do seu jeito, fica mais simples" | KISS local, caos global. A regra tem **um** dono. BLOQUEADO. |
| "Só puxei o campo lá de dentro, é mais rápido" | LoD. O vizinho **expõe**; você não atravessa. Cada ponto na cadeia é um acoplamento. BLOQUEADO. |
| "Dupliquei a lógica pro teste passar, limpo depois" | Workaround que viola princípio é falha disfarçada de verde. BLOQUEADO. |
| "Refatorei e aproveitei pra mudar o comportamento" | Refatoração preserva comportamento. Mudança de comportamento é achado registrado, não efeito colateral da passada. BLOQUEADO. |
