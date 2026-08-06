# Princípios de Engenharia — Fonte Única (valem em TODOS os steps)

> **Este arquivo é a fonte única.** Nenhum outro arquivo redefine os princípios — todos apontam para cá (DRY aplicado ao próprio protocolo). O que cada step tem é a **lente**: o que o princípio significa *naquele* step.

**Os princípios não são fase — são regime.** Não existe "step de aplicar SOLID". Eles valem do Step 1 ao Step 10, do artefato de texto ao código, ao que você escreve **e** ao que você toca. Quem só cobra no 7b já perdeu: a complexidade especulativa nasce no Spec e no Plano, e chega no código como fato consumado.

## Os 5 (definição canônica)

| Princípio | Regra | Falha típica |
|---|---|---|
| **SRP / SOLID** | Cada unidade (doc, decisão, task, arquivo, classe, função, componente) faz **UMA** coisa e a faz bem. Função >40 linhas → extraia helper. Componente misturando lógica+UI → hook + componente burro. | "Esse service faz tudo de pagamento" |
| **DRY** | Zero duplicação de lógica **ou de decisão**; uma única fonte de verdade. Antes de criar, **procure** (grep em `shared/`, `lib/`, `components/`, `hooks/`) — reutilizar/estender > recriar. Repetiu 2× já é candidato a extração. | "Copiei e adaptei" |
| **KISS** | A solução mais simples que atinge o nível #1. 5 linhas > 50 linhas. Simplicidade ≠ mediocridade. | "Fiz genérico pra ficar elegante" |
| **YAGNI** | APENAS o que os UCs (Step 3) e o Spec (Step 4) exigem. Zero abstração especulativa. 3 linhas similares > abstração prematura. | "Deixei preparado pro dia que precisar" |
| **Law of Demeter** | Objeto só fala com vizinhos diretos. Evite `a.b.c.d.method()`. | "Só puxei o campo lá de dentro" |

Complementos de arquitetura, inseparáveis dos 5:

- **Separação de camadas:** controller = HTTP, service = lógica, componente = UI. Lógica de negócio NUNCA no controller/componente.
- **Baixo acoplamento, alta coesão:** módulos injetáveis, independentes. Sem dependências circulares.
- **Direção de dependências:** `shared → api/web` ok. `api → web` ou `web → api` proibido.

## A tensão — resolvida de uma vez

**KISS/YAGNI matam a complexidade *desnecessária*. A complexidade *necessária* para o nível #1 (`/solve`) continua sendo requisito.** YAGNI nunca é desculpa para entregar menos do que o UC pede, nem para descartar achado real (isso é balde B — ver `follow-ups.md`). KISS nunca é desculpa para a versão pobre da feature.

**Tocou = melhora (regra do escoteiro).** Os princípios valem para o código que você **encontra**, não só para o que escreve. Duplicação, responsabilidade misturada, naming ruim, complexidade desnecessária num arquivo que você abriu → corrija ali. Deixe no nível #1, nunca no nível em que encontrou — sem sair refatorando escopo não relacionado (foco/YAGNI). Detalhe operacional: `07-implementation.md` § Refatoração Obrigatória.

## Lente por step (o que cobrar em CADA um)

| Step | O que os princípios exigem AQUI |
|---|---|
| **1 — Problema** | **KISS:** 1 frase — não cabe em uma? você não entendeu ainda. **YAGNI:** o problema é o que existe, não o adjacente que ninguém relatou. **DRY:** o inventário achou doc que já cobre isso? **atualize**, não crie paralelo. |
| **2 — User Stories** | **SRP:** 1 story = 1 necessidade de 1 persona (não empilhe duas no "e também"). **DRY:** mesma necessidade em 2 personas = 1 story com 2 atores, não 2 stories gêmeas. **YAGNI:** story sem persona do Step 1 = especulação → fora. |
| **3 — Use Cases** | **SRP:** 1 UC = 1 (ator × fluxo × estado) — não agrupe. **DRY:** tabela de assinaturas **única**, sem duplicata (já é critério do gateway 3→4). **YAGNI:** UC que nenhuma story do Step 2 pede não existe. |
| **4 — Spec** | O step onde a arquitetura é decidida — **é aqui que YAGNI é mais barato**. Toda decisão declara o **UC que a exige**; sem UC → não entra (vai para "alternativas descartadas"). **DRY:** decisão que replica mecanismo já existente no projeto → decisão é **reusar**. **SRP:** fronteiras de módulo/camada explícitas. Princípios são o critério nº 4 da hierarquia de decisão, e **desempatam** quando 1-3 empatam. |
| **5 — Test Cases** | **SRP:** 1 TC = 1 bug único. **DRY:** TC que não puxa cobertura nova é redundante (filtro de significância). **KISS/YAGNI:** teto de 10, `nº TCs == nota` — não invente TC para "ficar completo". |
| **6 — To Do** | **SRP:** 1 task = 1 responsabilidade resolvível em 1 prompt. **DRY:** task que recria o que já existe vira task de **reúso** ("estender X"), não de criação. **YAGNI:** task sem UC/TC que a exija sai da lista. |
| **7a — Plano** | **O portão mais barato do protocolo.** Duas seções obrigatórias: **Reúso antes de criar (DRY)** — o que já existe e será reutilizado/estendido; arquivo novo só com justificativa de por que nada serve. **O que NÃO vamos construir (YAGNI)** — abstrações/camadas/flags consideradas e descartadas por não ter UC que as exija. **SRP:** cada arquivo do plano declara sua responsabilidade única. |
| **7b — Codificar** | Os 5 na íntegra + limiares numéricos + "tocou = refatora". Detalhe: `07-implementation.md` § Práticas Obrigatórias. |
| **8 — Code Review** | Revisar **contra esta mesma lista, princípio a princípio e por nome** — não por proxy. Violação encontrada → triagem A/B/C (`follow-ups.md`): dentro do escopo = corrige agora; escopo novo = ledger. |
| **9 — Run Test** | Todo fix feito para um TC passar obedece os princípios — **workaround que faz o TC passar violando SRP/DRY é FAILED disfarçado**. Qualquer fix invalida o review → volta ao Step 8. |
| **10 — Done** | O done doc registra o que os princípios produziram: **o que foi reutilizado** (DRY), **o que foi descartado** (YAGNI) e **o que "tocou = refatora" elevou**. Sem isso, o registro mente sobre como a feature ficou. |

## Linha obrigatória no Gateway Check

Todo Gateway Check publicado no chat carrega esta linha — igual à de follow-ups, pelo mesmo motivo (o que não é declarado, escapa):

```markdown
- **Princípios (SRP · DRY · KISS · YAGNI · LoD):** ✅ aplicados — <1 linha: o que a lente deste step cobrou>
```

Sem a linha, o gateway **não foi publicado**. "N/A" não existe: se a lente do step não teve nada a cobrar, escreva o que você verificou e não encontrou.

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
| "O arquivo já estava ruim, não fui eu" | Tocou = refatora. Se você abriu, é seu. BLOQUEADO. |
| "Refatoro o projeto inteiro já que estou aqui" | O oposto. Foco/YAGNI: só o que você tocou. Fora disso é balde C. BLOQUEADO. |
| "Publico o gateway sem a linha de princípios, está implícito" | Implícito = inexistente, igual ao gateway silencioso. BLOQUEADO. |
