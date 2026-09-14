---
name: brain
description: 'Use when user invokes /brain to understand a problem, analyse a situation or decide between paths — the protocol for thinking, not for building. Starts from the premise that the request is WRONG and the person does not yet know what they want: what was typed is the first solution that occurred to someone in pain, so it is restated, played back, and enters the option matrix as a candidate — never as the brief. Seven phases: Recorte (what was typed vs. the real problem, the XY behind it), Evidência (go and see: literal quote + coordinate, three states — verified / absent-in-fact / not-investigated), Diagnóstico (≥3 competing hypotheses eliminated by inconsistency, ACH), Opções (≥3 genuinely different + the zero option), Julgamento (musts/wants declared before scoring, Kepner-Tregoe), Refutação (pre-mortem, devil''s advocate, falsifier, reversal test — plus a blind paired judge, spawned as a context-free session, when the door is one-way), Parecer (answer first, Minto; ADR + A3 in docs/decisions/). Ends in ONE recommendation with what would knock it down, calibrated confidence and what was NOT covered — never in "it depends" without the question that unlocks it. Triggers on "me ajuda a entender", "qual o melhor caminho", "vale a pena X ou Y", "analisa isso", "brainstorm", "tô em dúvida entre". Self-contained: depends on no other skill and works in any git repository, any language. Not for writing the code of the decision, nor for a read-only walkthrough of a repository — this protocol ends in a verdict.'
effort: max
argument-hint: "[o problema, a dúvida ou a decisão — escreva torto mesmo]"
allowed-tools: Bash, Read, Grep, Glob, Write, Edit, WebSearch, WebFetch, Agent, AskUserQuestion, TaskCreate, TaskUpdate
---

# /brain — o protocolo de pensar

Entra um pedido mal escrito sobre um problema mal formulado. Sai **um parecer**: o problema real nomeado, uma recomendação, o que a derrubaria e a confiança que ela merece.

> **Isto não é chuva de ideias.** Ideação é **uma** das sete fases. O entregável não é uma lista de possibilidades — é **uma decisão defensável**, com a prova do lado.

🚫 **NÃO escreve código, NÃO altera o produto, NÃO commita, NÃO cria branch.** O único arquivo que esta skill escreve é o parecer em `docs/decisions/`. Implementar é outra passada, depois — e só se você mandar.

## Premissa de Partida

> **O pedido está errado até prova em contrário — e quem o escreveu não tem como saber disso.**

Não é desdém, é a estatística do ofício: quem tem o problema está **dentro** dele. O que chega escrito é a **primeira solução que ocorreu a alguém incomodado**, no vocabulário da irritação e não no do sistema, digitada com pressa. Três coisas se assumem antes de ler a primeira palavra:

- **O pedido é sintoma, não especificação.** Ele mostra onde dói, não o que fazer. *"Cavalos mais rápidos"* é um relatório de campo perfeito sobre a dor — e uma péssima especificação de produto.
- **A pessoa sabe o que a incomoda, não o que quer.** O que ela pede é uma hipótese dela: respeitável, informada por coisas que a evidência não mostra, e **testável como as outras**. Por isso o pedido entra na Fase 4 como **mais uma opção**, nunca como o enunciado que define todas.
- **A formulação não é final.** Ela muda quando a evidência aparece — e quem pediu muda de ideia no meio, às vezes na mesma frase. Recorte que sai da Fase 1 e chega intacto na Fase 7, em problema de peso alto, é suspeito: quase sempre quer dizer que ninguém foi ver nada.

Daí as duas consequências estruturais desta skill: a Fase 1 **devolve** a reformulação antes de gastar a análise inteira, e o recorte é **revisável até a Fase 6** (§ Re-recorte) — revisar não é retrabalho, é o protocolo funcionando.

## Iron Law

> **Procedência > fluência.**
> Frase bem escrita sobre coisa não verificada é o pior resultado possível: tem forma de resposta.
> Toda afirmação do parecer aponta para uma **evidência** (`E-n`) ou está marcada como **suposição** (`S-n`). Não existe terceiro jeito de afirmar.

**Três estados, nunca dois:** `verificado` · `ausente-de-fato` (procurei, não existe — isso é evidência) · `não-apurado` (não fui ver — isso é lacuna). Colapsar os dois últimos transforma ignorância em afirmação.

**O padrão do parecer é o nível 10x** — o analista #1 do domínio não assinaria "depende". E o parecer é **texto**: o que define a qualidade dele é **clareza**, não tamanho. Texto que exige releitura já falhou, por mais correta que esteja a análise por baixo.

## Regras Invioláveis

1. **O pedido entra verbatim, e sai reformulado.** O que você digitou não é reescrito em silêncio — nem os erros. E não é obedecido ao pé da letra: toda tradução ("você escreveu *cache*; no repo isso é a memoização de `lib/x.ts:41`") é **declarada** na Fase 1. Responder bem à pergunta errada é o modo de falha número um desta skill.
2. **O pedido é candidato, não enunciado.** A solução que quem pediu trouxe compete na Fase 4 como `opção-pedido`, com a mesma régua das outras. Isso fecha as duas portas simétricas: obedecer a um pedido errado, e descartar com arrogância o palpite de quem convive com o problema.
3. **Recorte muda por evidência, nunca por conveniência.** Re-recortar é legítimo em qualquer fase até a 6 (§ Re-recorte) — com a versão anterior preservada no artefato e o motivo publicado. Re-recortar para caber na recomendação que já estava escrita é fraude.
4. **Hipótese única é viés de confirmação institucionalizado.** Mínimo **3** hipóteses na Fase 3, e a vencedora é a que a evidência **menos refuta** — nunca a que soou melhor primeiro.
5. **Critério declarado depois da resposta é racionalização.** Musts e wants saem na Fase 5 **antes** de qualquer nota.
6. **A opção zero sempre compete.** Não fazer nada é uma opção real e entra na matriz. Recomendação que nunca foi comparada com o status quo não foi comparada com nada.
7. **Nenhum número sem fonte.** "Melhora 40%", "é 3x mais rápido", "a maioria dos times" — ou tem `E-n` com coordenada, ou não entra. Ordem de grandeza estimada se declara como estimativa, com a conta à vista.
8. **Refutar não é opcional, e não é mímica.** As quatro passadas da Fase 6 rodam contra a **sua própria** recomendação. Advogado do diabo escrito para perder é teatro — e teatro é pior que ausência, porque parece rigor.
9. **Quem escreve não dá a própria nota.** Decisão de **porta de mão única** fecha com o **juiz cego** (§ A sessão cega, modo `pair`, duas ordens): `EMPATE` ou `DISCORDAM` não é vitória — volta à Fase 5.
10. **"Depende" só existe com a pergunta que destrava anexada** e o veredicto de cada ramo. Sem isso, é a decisão devolvida com aparência de análise.
11. **Lacuna decisiva não fecha o protocolo.** Ou apura, ou o parecer sai declaradamente **condicional** — dizendo de quê depende.
12. **Sem o arquivo em `docs/decisions/`, a fase não aconteceu.** Análise que mora só no chat morre no scroll.

## As 7 fases (nomes e ordem são contrato)

```
   ┌─── re-recorte: a evidência derruba o corte, ou você corrige no meio ───┐
   ↓                                                                        │
   1 Recorte → 2 Evidência → 3 Diagnóstico → 4 Opções → 5 Julgamento → 6 Refutação → 7 Parecer
   └────── ◇ LOSANGO 1: o problema ───────┘  └──────────── ◇ LOSANGO 2: a decisão ────────────┘
                                                              ↑             │
                                                              └─── mudou? ──┘   loop até o passe seco
```

| # | Fase | O que entra | O que sai | Seção |
|---|------|-------------|-----------|-------|
| 1 | Recorte | o pedido verbatim | o problema real + o peso da decisão | § Fase 1 |
| 2 | Evidência | o recorte | Registro `E-n` / `S-n` / `L-n` | § Fase 2 |
| 3 | Diagnóstico | o registro | ≥3 hipóteses, matriz ACH, a que sobra | § Fase 3 |
| 4 | Opções | o problema nomeado | ≥3 caminhos reais + `opção-pedido` + a zero | § Fase 4 |
| 5 | Julgamento | as opções | musts/wants, matriz, recomendação preliminar | § Fase 5 |
| 6 | Refutação | a recomendação | ela sobrevive, muda, ou cai | § Fase 6 |
| 7 | Parecer | tudo | o ADR, resposta primeiro | § Fase 7 |

**Leia a seção § Fase N deste arquivo ANTES de executar** (`grep -n '^## Fase N' SKILL.md` localiza a linha). Toda fase fecha publicando o **Gate** dela no chat; `✅` é transição automática para a próxima.

## Ordem de Operações ao Ativar

**Esta skill não depende de nenhuma outra e não invoca nenhuma outra.** Roda em qualquer repositório, em qualquer linguagem, com o que já está nesta sessão — inclusive o juiz cego da Fase 6, que é um comando, não uma dependência.

Então:

1. **Abra o artefato** — `docs/decisions/NNNN-<slug>.md`, `NNNN` = próximo número livre (`ls docs/decisions/`), `<slug>` derivado do problema. Cria a pasta se não existir. Status nasce `Proposto`.
2. **TaskCreate** — 1 por fase (7), mais 1 por ciclo de refutação que reabrir a Fase 5. `in_progress` ao começar, `completed` só com o Gate `✅` publicado **e** a seção da fase escrita no artefato.
3. **Execute as fases em sequência**, publicando cada Gate.

## Perguntar — o critério

> **Pergunte o quanto for preciso para entender o problema sem alucinar — e nem uma pergunta além disso.**

O teto não é numérico, é de **natureza**. Só entra pergunta que cumpre as duas:

- **Só você pode responder** — o que aconteceu antes do pedido, intenção, prioridade, restrição de negócio, apetite de risco, o que já foi tentado fora do repo. Perguntar **o que aconteceu** funciona; perguntar **o que você quer** devolve a mesma solução apressada do pedido, agora com sua assinatura. O que está no repositório **se apura**: perguntar o que dá para ir ver é terceirizar o trabalho e enche você de perguntas idiotas.
- **A resposta muda o que eu faço** — se os dois caminhos levam ao mesmo lugar, a pergunta é ruído. Escolha a interpretação, **declare** e siga.

Regras de forma: **evidência antes de pergunta** (esgote a Fase 2 do que der, depois pergunte o resto) · **em bloco**, via `AskUserQuestion`, nunca gota a gota · pergunta pode nascer em **qualquer fase** — incerteza decisiva que aparece na Fase 5 se pergunta na Fase 5, não se engole · **"posso prosseguir?" não é pergunta**, é confirmação: proibida.

## O artefato — `docs/decisions/NNNN-<slug>.md`

ADR (Nygard) por fora, A3 (Toyota) por dentro. Nasce na Fase 1 e cresce a cada fase — **o parecer da Fase 7 é escrito no topo**, porque quem lê quer a resposta primeiro (Minto).

```markdown
---
status: Proposto        # Proposto → Aceito | Rejeitado | Substituído por NNNN
data: AAAA-MM-DD
peso: N/10              # § Fase 1 — derivado, nunca declarado
confianca: alta|média|baixa
---

# NNNN — <o problema, em uma linha afirmativa>

## Parecer                      ← Fase 7, e o topo do arquivo
Você pediu: <verbatim, curto>. O problema é: <o real>.
**Recomendação:** <uma>. **Porque:** <2-3 linhas, com E-n>.
**Se sacrifica:** <o que se perde>. **Cairia se:** <o falsificador>.
**Primeiro passo reversível:** <o menor movimento que ensina>.

## 1. Recorte           ## 2. Evidência        ## 3. Diagnóstico
## 4. Opções            ## 5. Julgamento       ## 6. Refutação
## Lacunas              ## Não coberto
```

**O status é seu.** `Aceito` só quando você decidir — o protocolo recomenda, não homologa. 🚫 não commita.

## Gate — as três linhas de toda fase

Toda fase fecha publicando no chat, além do que for específico dela:

```markdown
### Gate <N> — <fase>
- **Procedência:** ✅ toda afirmação desta fase → E-n ou marcada S-n
- **Lacunas:** <n> abertas · <n> decisivas — <quais>
- **Confiança:** <alta|média|baixa> — <por quê, em uma linha>
- **Status:** ✅ LIBERADO → Fase <N+1> / ❌ BLOQUEADO — <o que falta>
```

Sem as três linhas, o gate não foi publicado — e sem gate, a fase não fechou.

---

## Fase 1 — Recorte

**O pedido é a matéria-prima, não a especificação** (§ Premissa de Partida). Aqui se separa o que foi digitado do que precisa ser resolvido — sabendo que quem digitou não tinha como fazer essa separação sozinho.

1. **Cole o pedido verbatim** no artefato — com os erros, a pressa e o vocabulário torto. É a linha de base contra a qual toda distância se mede, e a única coisa desta fase que não é interpretação.

2. **Suba a escada.** Três degraus, nesta ordem — e o pedido é só o primeiro:

| degrau | a pergunta | exemplo |
|---|---|---|
| **o pedido** | o que foi digitado | *"coloca cache na busca"* |
| **a dor** | o que te fez digitar isso — o momento, o que aconteceu, o que irritou | *"trava quando eu filtro com a lista cheia"* |
| **o estado final** | como é o mundo quando isso não te incomoda mais | *"filtrar é instantâneo e eu confio no resultado"* |

   Só conseguiu preencher o degrau de cima? Então **falta ir ver** (Fase 2) ou **falta perguntar** — e a pergunta certa nunca é *"o que você quer?"* (ninguém sabe responder isso sobre o próprio problema), é **"o que aconteceu antes de você me pedir isso?"**. Dor descrita é verificável; desejo declarado, não.

3. **O pedido vira candidato.** A solução que quem pediu trouxe é uma hipótese informada — ele convive com o problema e vê coisas que o repositório não mostra. Ela entra na Fase 4 como **`opção-pedido`** e é julgada com a mesma régua das outras. Nem obediência, nem descarte.

4. **O XY, e o degrau abaixo dele.** Você pede X porque acredita que X resolve Y: **nomeie Y** — e faça a mesma pergunta a Y. Parar no primeiro *porquê* é como a análise inteira fica presa dentro do enquadramento de quem pediu.

5. **Traduções declaradas.** Todo termo torto, ambíguo ou que não existe no repo vira uma linha: `"<o que você escreveu>" → <o que assumi> — porque <E-n>`. Sem essa lista, a análise certa sobre a coisa errada é indistinguível da análise certa.

6. **Devolva o recorte — e siga.** Uma reformulação afirmativa, curta, na linguagem de quem pediu:

   > *Entendi assim: o que te incomoda é **<dor>**; o problema por trás é **<o real>**; resolvido, **<estado final>**. Sigo por aqui.*

   Não é pedido de autorização (§ Perguntar proíbe "posso prosseguir?") — é a correção de rota mais barata que existe, publicada **antes** das seis fases seguintes. **Não espere resposta:** siga para a Fase 2. Se vier correção, em qualquer momento, o recorte é reescrito e o protocolo retoma dali (§ Re-recorte). Só vira pergunta de verdade (`AskUserQuestion`) quando as leituras divergem e **só você** pode desempatar (§ Perguntar).

7. **Que tipo de problema é** (Cynefin, resumido): **claro** (tem resposta conhecida — é busca, não análise) · **complicado** (tem resposta certa, exige perícia — é diagnóstico) · **complexo** (só se descobre agindo — a saída é um experimento barato, não uma certeza) · **caótico** (estanca primeiro, entende depois). Isso decide o que a Fase 7 pode prometer: em problema **complexo**, prometer certeza é a alucinação estrutural.

6. **O peso da decisão** — derivado, **nunca declarado por você**:

| Eixo | 1-2 | 3 |
|---|---|---|
| **Reversibilidade** | desfaz numa tarde | porta de mão única |
| **Alcance** | um arquivo, uma tela | o produto, o time, o cliente |
| **Custo do erro** | retrabalho | dinheiro, dado, confiança |
| **Velocidade de descoberta** | o erro grita hoje | o erro aparece em meses |

Soma → **peso 1-10**. Ele calibra **quantidade**, nunca a **existência** das fases:

| Peso | Hipóteses (3) | Opções (4) | Refutação (6) |
|---|---|---|---|
| 1-3 | 3 | 3 + zero | as 4 passadas internas |
| 4-7 | 4 | 3 + zero | as 4 + falsificador **procurado de fato** |
| 8-10 | 5+ | 4 + zero | as 4 + **juiz cego obrigatório** (§ A sessão cega) |

**Gate 1** — acrescente: `- **Escada:** pedido `<…>` → dor `<…>` → estado final `<…>`` · `- **Distância pedido↔problema:** <zero | o pedido é sobre X, o problema é Y>` · `- **Peso:** N/10 — <reversibilidade, alcance, custo, velocidade>` · `- **Perguntas:** <n> feitas — <por que só você podia responder> | nenhuma necessária`.

**PARE se pensar:** "ele quis dizer isso, óbvio" · "esse aí sabe o que quer, o pedido está claro" · "vou responder o que ele perguntou e pronto" · "reformular o pedido dele é presunção minha" · "corrijo o termo dele em silêncio, fica mais limpo" · "pergunto o que ele quer" (ele não sabe — pergunte o que aconteceu) · "é decisão pequena, pulo o peso".

---

## Fase 2 — Evidência

**Vá ver.** *Genchi genbutsu*: nada do que vai sustentar a recomendação pode ser lembrado — tem que ser lido, rodado ou medido agora.

**Onde olhar** (o que couber ao problema): o código e a estrutura real · `git log`/`git blame` no ponto quente (a história diz por que está assim) · `docs/`, `kanban/`, `.claude/patterns.md` · configuração, dependências, versões instaladas (a versão que **está** no `node_modules`, não a que você lembra) · dados e logs, se acessíveis · a web, quando a pergunta é sobre o mundo e não sobre o repo.

**Varredura larga roda em subagente** (`Explore`) para não entupir o contexto — **mas nenhuma evidência entra no registro pela palavra do subagente**: o trecho decisivo é reaberto na coordenada e citado **literal**. Resumo de subagente é fonte de invenção com cara de leitura.

**O Registro** — no artefato, e é dele que todo o resto se alimenta:

```markdown
| id | o que | onde | estado |
|----|-------|------|--------|
| E1 | "<citação literal>" | `lib/skill-graph.ts:41` | verificado |
| E2 | não existe teste cobrindo o caminho X | `grep -r` em `tests/` | ausente-de-fato |
| S1 | assumo que o volume atual é ~Nk/dia | — | suposição — nada apura hoje |
| L1 | quanto custa a operação X hoje | métrica não existe | não-apurado — **decisivo** |
```

**Proporcionalidade.** A varredura escala com o peso (§ Fase 1) e para quando **para de mudar hipótese**: se as últimas três leituras não moveram nada, o custo virou ritual. Mas lacuna **decisiva** não é encerrável por cansaço — ela vai para o ledger e pesa na Fase 7.

> **Evidência que derruba a premissa do recorte não é um detalhe do registro** — é o gatilho da Fase 1 de novo (§ Re-recorte). Ela aparece aqui primeiro, quase sempre.

**Gate 2** — acrescente: `- **Registro:** <n> verificadas · <n> ausentes-de-fato · <n> suposições` · `- **Onde não fui:** <o que ficou fora do alcance e por quê>`.

**PARE se pensar:** "eu já sei como esse código funciona" · "a lib faz assim, é o padrão dela" · "o subagente disse que tem" · "não preciso abrir, o nome do arquivo já diz" · "isso não existe" (sem ter procurado — isso é `não-apurado`, não `ausente-de-fato`).

---

## Fase 3 — Diagnóstico

**ACH — Analysis of Competing Hypotheses.** A hipótese não se escolhe por evidência a favor (todas têm); se elimina por **evidência contra**.

1. **Liste as hipóteses** sobre a natureza ou a causa do problema — o mínimo vem do peso (§ Fase 1). Inclua sempre a incômoda: *"o problema não é técnico"*, *"o problema é que ninguém precisa disso"*, *"o problema é a expectativa, não o sistema"*.
   - Peso ≥ 8: abra uma **sessão cega** (§ A sessão cega, modo `ask`) com o problema reformulado e **sem** as suas hipóteses. Ela não foi ancorada pelo seu enquadramento — hipótese que só ela levanta é exatamente a que esta sessão, já contaminada pelo pedido, não conseguiria ter.
2. **A matriz.** Linhas = evidências (`E-n`); colunas = hipóteses. Cada célula: `+` consistente · `−` **inconsistente** · `·` neutra. Evidência que é consistente com *todas* tem **valor zero de diagnóstico** — marque e ignore; é ela que faz sentir convicção sem ter informação.
3. **Elimine pelo `−`.** Sobrevive quem tem menos inconsistência. Empate real entre duas hipóteses é resultado legítimo: as duas seguem vivas para a Fase 4, e a recomendação vai ter que funcionar nas duas (ou o teste que as separa vira o primeiro passo).
4. **Por que ainda não foi resolvido** — se o problema é óbvio e persiste, existe uma razão: restrição, custo, incentivo, ignorância ou tentativa fracassada. Nomeie. Recomendação que ignora isso já foi tentada.
5. **Nomeie o problema** em uma frase afirmativa, falsificável. *"A busca está lenta"* não é; *"a busca refaz o índice inteiro a cada tecla (`E4`), e por isso passa de 400ms acima de 2k itens"* é.

**Gate 3** — acrescente: `- **Hipóteses:** <n> levantadas · <n> eliminadas por inconsistência · <n> vivas` · `- **Evidência diagnóstica:** <n> das <n> discriminam (as outras são consistentes com tudo)` · `- **Distância pedido↔problema:** <re-publique — mudou?>`.

> **Divergiu do pedido? Publique agora, não no fim.** "Você pediu análise de X; o problema é Y" muda tudo o que vem depois — e vetar isso é seu.

**PARE se pensar:** "é claramente o de sempre" · "a primeira hipótese explica tudo" · "as outras duas eu listo só para constar" · "essa evidência confirma minha teoria" (confirma as três? então não confirma nada).

---

## Fase 4 — Opções

Divergir de verdade. **O mínimo do peso (§ Fase 1), mais a do pedido, mais a zero.**

- **`opção-pedido` sempre compete.** O que quem pediu trouxe entra aqui como opção nomeada (Regra Inviolável 2), escrita com a mesma força das outras — não a versão de palha dela. Ela ganha quando ganha; e quando perde, o parecer diz **por quê**, que é a única forma de a pessoa aprender alguma coisa sobre o próprio problema.
- **A opção zero — não fazer nada — sempre compete.** Ela tem custo (o problema continua) e tem benefício (nada quebra). Sem ela não existe régua.
- **Régua anti-teatro:** se duas opções pudessem coexistir como ajuste de detalhe da mesma coisa, são **uma**. Opções diferentes discordam em **aposta**, não em parâmetro.
- **Forçadores de diversidade** — use quando as opções saírem parecidas: inverter a restrição (*"e se não pudesse tocar nesse código?"*) · comprar em vez de construir · o caminho dez vezes mais barato · o caminho que outra pessoa executa · **eliminar o passo em vez de otimizá-lo** (o 10x quase sempre é o passo que deixou de existir, não a funcionalidade que entrou) · o que o líder do domínio fez quando teve esse problema.
- Cada opção, em 4 linhas: **o que é** · **a aposta** (em que ela precisa estar certa) · **quando ela ganha** · **o que ela cobra** (custo, risco, o que trava depois).

**Gate 4** — acrescente: `- **Opções:** <n> reais + a do pedido + a zero — <por que discordam em aposta, não em parâmetro>`.

> **Saíram todas ruins?** Quase nunca é falta de solução — é recorte errado. Volte à Fase 1 (§ Re-recorte) antes de recomendar a menos pior.

**PARE se pensar:** "as 3 são variações boas" · "a opção zero é obviamente ruim, nem listo" · "opção B é a A com mais cuidado" · "invento uma terceira só para ter três".

---

## Fase 5 — Julgamento

Kepner-Tregoe. **Os critérios saem antes das notas** — essa ordem é o método.

1. **Musts** — binários e eliminatórios, tirados do Recorte e do Diagnóstico, nunca inventados aqui. Opção que falha um must **está fora**, sem nota de consolação, e o parecer registra qual foi.
2. **Wants** — ponderados (peso 1-5), com a régua escrita: o que é "bom" nesse critério, em palavras, antes de pontuar.
3. **A matriz** — opções × wants. Cada célula tem **uma linha de justificativa ancorada em `E-n`**. Nota sem justificativa é palpite com casas decimais.
4. **O trade-off pelo nome.** Não "opção A: 4/5 em custo" — mas *"A cobra duas semanas a mais e trava a migração do módulo X até o fim do trimestre"*. Trade-off que não dói quando escrito não foi escrito direito.
5. **Recomendação preliminar** — uma. A soma da matriz **informa**; ela não decide: se o vencedor da soma não é o recomendado, a Fase 7 diz por quê (critério decisivo bate soma alta em critérios menores).

**Gate 5** — acrescente: `- **Musts:** <n> — eliminaram <quais opções>` · `- **Recomendação preliminar:** <qual> — decidida por <o critério que pesou>`.

**PARE se pensar:** "dou nota e depois explico" · "empatou, então tanto faz" · "peso 3 pra tudo" · "o critério que eu esqueci de listar é o que mais importa" (então volte e liste — não o use por baixo).

---

## Fase 6 — Refutação

**Quatro ataques contra a SUA recomendação.** Escritos para vencer, não para constar.

1. **Pre-mortem** (Klein) — *é daqui a seis meses e isto fracassou.* Não "pode falhar": **falhou**. Os 3 motivos mais prováveis, cada um com o sinal que apareceria primeiro. Motivo que você não consegue imaginar detectando a tempo é risco não mitigado.
2. **Advogado do diabo** — o melhor caso da 2ª colocada, escrito como se você fosse ganhar a discussão. Se ao terminar você não ficou minimamente incomodado, escreveu um espantalho.
3. **Falsificador** — *que evidência derrubaria isto?* Nomeie-a. Depois: **ela foi procurada?** Peso ≥ 4 → vá procurar agora. Não achou → `ausente-de-fato` (reforça). Não deu para procurar → `L-n` **decisiva**, e o parecer sai condicional.
4. **Teste de reversão** (Heuer) — *se eu tivesse começado pela hipótese B da Fase 3, chegaria aqui?* Se a resposta depende de por onde comecei, a conclusão é do caminho, não da evidência.

**Juiz cego — peso ≥ 8, obrigatório** (Regra Inviolável 9). Rode o **modo `pair`** de § A sessão cega, com quatro arquivos escritos de verdade, nunca texto digitado na hora:

| arquivo | conteúdo |
|---|---|
| `--criteria` | os musts e wants da Fase 5, **verbatim** do artefato |
| `--input` | o problema nomeado na Fase 3 + as restrições |
| `--a` | a recomendação (a **nossa** — por convenção, sempre A) |
| `--b` | a 2ª colocada, escrita com a mesma força |

Duas ordens, resultado vinculante: `B` → a recomendação **cai**; `EMPATE`/`DISCORDAM` → não é vitória, **volta à Fase 5**; `A` → passou, e a saída integral do cego vai para o artefato (`cat`, não paráfrase).

**Sem o binário `claude` no PATH** (outro agente, CI): o pareamento roda **inline**, nesta sessão, com os mesmos quatro insumos e as duas ordens — e o Gate 6 declara **`independência: NÃO`**. Quem lê precisa saber que quem julgou foi quem escreveu. O que não vale é omitir a linha.

**Loop:** a recomendação mudou? → revalida a Fase 5 com os critérios (sem reescrevê-los para caber) → refuta de novo. **Fecha só com o passe seco:** um ciclo inteiro de refutação sem mudança.

**Gate 6** — acrescente: `- **Pre-mortem:** <os 3 modos de falha + o sinal precoce de cada>` · `- **Advogado do diabo:** <o melhor argumento contra — e por que não venceu>` · `- **Falsificador:** <qual> — <procurado: sim/não/não deu>` · `- **Cego:** <A | B | EMPATE | DISCORDAM | N/A (peso abaixo de 8)>` · `- **Passe:** <seco | mudou, ciclo <n>>`.

**PARE se pensar:** "já pensei nos contras enquanto escrevia" · "o risco é baixo, não vale o pre-mortem" · "a alternativa é claramente pior, escrevo rápido" · "o cego não tem o contexto, desconsidero" · "deu empate, conta como passou" · "mudei a recomendação mas mantenho o gate anterior".

---

## Fase 7 — Parecer

**Resposta primeiro** (Minto). Quem lê decide nos primeiros 30 segundos se precisa ler o resto — e na maioria das vezes não precisa.

Escreva no topo do artefato **e** no chat:

```markdown
Você pediu: <verbatim, curto>
O problema é: <o real — ou "é isso mesmo", se a distância for zero>

**Recomendação:** <uma, imperativa>
**Porque:** <2-3 linhas, com E-n nas afirmações decisivas>
**Se sacrifica:** <o que se perde ao escolher isto>
**Cairia se:** <o falsificador — o que, se verdadeiro, muda a resposta>
**Confiança:** <alta | média | baixa> — <por quê: o que sustenta e o que falta>
**Primeiro passo reversível:** <o menor movimento que ensina algo real>

**Lacunas:** <L-n decisivas — e o que mudaria se fossem apuradas> | nenhuma
**Não cobri:** <o que ficou fora e por quê> | nada relevante
**Próximo:** <implementar · prototipar · medir a lacuna · parquear · nada> — <o quê, exatamente>
```

**Calibração da confiança** — não é sentimento: **alta** = evidência verificada cobre os pontos decisivos e o falsificador foi procurado · **média** = a lógica se sustenta, mas uma suposição relevante está de pé · **baixa** = lacuna decisiva aberta, ou o problema é **complexo** (§ Fase 1) e só agindo se descobre. Confiança baixa é resultado honesto; confiança alta em problema complexo é a alucinação estrutural.

**"Depende" só passa com a pergunta anexada:** `Depende de <a pergunta que destrava>. Se <resposta 1> → <opção X>. Se <resposta 2> → <opção Y>. Para descobrir: <o teste mais barato>.`

**Gate 7** — acrescente: `- **Uma recomendação:** ✅ <qual>` · `- **Falsificador declarado:** ✅` · `- **Artefato:** docs/decisions/NNNN-<slug>.md — status Proposto`.

Ao fechar, **pergunte o status**: `Aceito`, `Rejeitado` ou fica `Proposto`. Você decide — o protocolo recomenda.

---

## Re-recorte — quando o problema muda no meio

O corte da Fase 1 é o melhor possível **com o que se sabia ali** — e o que se sabe muda na Fase 2 e na 3. Recorte é revisável até a Fase 6, e revisar não é retrabalho: é a Premissa de Partida cobrando o que prometeu.

**Dispara o re-recorte:**
- uma `E-n` contradiz o que a Fase 1 assumiu;
- a hipótese que sobra na Fase 3 é sobre **outra coisa**;
- quem pediu corrige — em qualquer fase, inclusive no meio de um turno já em andamento;
- as opções da Fase 4 saem **todas** ruins (sintoma clássico de problema mal cortado, não de problema sem solução);
- a Fase 6 derruba a recomendação **e** a alternativa: as duas respondiam à pergunta errada.

**Como se faz:** reescreve a seção `## 1. Recorte` do artefato **preservando a versão anterior logo abaixo** (`<!-- recorte v1 — substituído por: <motivo>, E-n -->`), publica no chat **o que mudou e por qual evidência**, e retoma da Fase 2. O registro de evidências **não se joga fora**: o que foi verificado continua verificado — muda o que ele serve para responder.

🚫 **O que não vale:** re-recortar para caber na recomendação já escrita. Recorte muda por **evidência**, nunca por conveniência — e a versão anterior fica no arquivo exatamente para isso ser auditável depois.

## Ledger de Lacunas

Toda `L-n` que nasce em qualquer fase vive numa seção `## Lacunas` do artefato, com triagem:

- **Decisiva** — muda a recomendação. Ou apura, ou o parecer é **condicional** e diz de quê depende. Nunca some.
- **Relevante** — muda a confiança, não a direção. Entra no parecer, na linha de confiança.
- **Descartada** — não toca nesta decisão. Fica registrada com a justificativa de uma linha (é o que impede "descartei porque dava trabalho").

Lacuna decisiva aberta **não fecha a Fase 7** como incondicional. Um protocolo de construção fecha **seco** — nada pendente; um protocolo de decisão fecha **honesto** — o que ficou pendente está escrito, com o tamanho que tem.

## Fronteiras

| Isto | É desta skill? |
|---|---|
| entender um problema, escolher um caminho, avaliar uma ideia | ✅ |
| escrever o código da decisão | ❌ o parecer termina no *primeiro passo*; implementar é outra passada |
| passear pelo repositório respondendo perguntas, sem veredicto | ❌ isto é modo de leitura; aqui o protocolo **fecha em veredicto** |
| parquear uma ideia sem analisar agora | ❌ captura é captura; isto custa sete fases |
| auditar um diff que já existe | ❌ aqui se decide **antes**, quando a decisão ainda muda o código |

## PARE se pensar

"já sei a resposta, o processo é formalidade" · "ele quis dizer isso, óbvio" · "o pedido está claro, esse aí sabe o que quer" · "ele corrigiu no meio, mas meu recorte ainda serve" · "re-recortar agora joga fora o que eu já fiz" · "respondo o que foi perguntado, o resto é palpite" · "listo as opções e ele escolhe" (isso é a decisão devolvida, não análise) · "depende do contexto" (de **qual**? escreva) · "por segurança, recomendo a mais conservadora" · "não achei evidência, mas faz sentido" · "o código deve fazer X" · "a lib provavelmente já resolve isso" · "3 hipóteses é burocracia, a causa é clara" · "a opção zero é obviamente ruim" · "dou a nota e ajusto o critério depois" · "refutar minha própria recomendação vai enfraquecer o parecer" · "peço para o usuário confirmar cada passo" · "pergunto antes de ir ver no arquivo" · "escrevo o parecer só no chat, é mais rápido".

Cada uma é a porta por onde a análise vira opinião bem escrita.

---

## A sessão cega

O juiz da Fase 6 não pode ser quem escreveu o parecer — e um subagente **não** serve: ele herda esta conversa, o `CLAUDE.md`, o diretório e o enquadramento de quem o chamou. Tira o custo de contexto, não o viés.

O que serve é uma sessão que não viu **nada** disto: `claude -p --safe-mode --tools ""` — sem a conversa, sem `CLAUDE.md`/`AGENTS.md`, sem memória, sem MCP, sem plugin, sem ferramenta. Entra o texto que você manda; sai um veredicto que não sabe o que esta sessão quer que seja verdade. Usa o login da sessão: não precisa de chave de API.

> **Tira o viés de contexto, não o de modelo.** É a mesma família de modelo, com os mesmos pontos cegos de treino. O que muda é que ela não sabe o que você já decidiu.

**Copie o bloco inteiro** e troque só os caminhos: cada um extrai por `awk` o seu prompt de sistema **deste arquivo** — nunca redigido na hora — e nada dentro deles é enfeite.

```bash
# ask — a pergunta LITERAL, numa sessão sem ferramenta nenhuma (Fase 3, peso ≥ 8)
BRAIN=<caminho absoluto deste SKILL.md — de onde você abriu esta skill>
EFFORT=max
IN=/tmp/brain-pergunta.md          # o texto, verbatim — nunca reescrito
OUT=/tmp/brain-ask.md

SYS="$(awk '/^## Prompt do juiz — ask$/{s=1;next} s&&/^```/{if(f)exit;f=1;next} f' "$BRAIN")"
[ -n "$SYS" ] || { echo "brain: § Prompt do juiz — ask não encontrado em $BRAIN" >&2; exit 1; }
command -v claude >/dev/null 2>&1 || { echo "brain: binário 'claude' ausente — rode inline e declare 'independência: NÃO' no gate." >&2; exit 2; }
( cd "$(mktemp -d)" && env -u CLAUDECODE claude -p --safe-mode --effort "$EFFORT" --system-prompt "$SYS" --tools "" ) < "$IN" > "$OUT" \
  || { echo "brain: a sessão cega falhou" >&2; exit 3; }
cat "$OUT"
```

```bash
# pair — juiz cego em DUAS ordens; A é sempre a NOSSA recomendação (Fase 6, peso ≥ 8)
BRAIN=<caminho absoluto deste SKILL.md — de onde você abriu esta skill>
EFFORT=max
CRIT=criterios.md; IN=problema.md; A=recomendacao.md; B=alternativa.md   # quatro arquivos, nunca texto digitado
OUT=/tmp/brain-pair.md

SYS="$(awk '/^## Prompt do juiz — pair$/{s=1;next} s&&/^```/{if(f)exit;f=1;next} f' "$BRAIN")"
[ -n "$SYS" ] || { echo "brain: § Prompt do juiz — pair não encontrado em $BRAIN" >&2; exit 1; }
command -v claude >/dev/null 2>&1 || { echo "brain: binário 'claude' ausente — rode inline e declare 'independência: NÃO' no gate." >&2; exit 2; }
for f in "$CRIT" "$IN" "$A" "$B"; do [ -s "$f" ] || { echo "brain: entrada ausente ou vazia: $f" >&2; exit 1; }; done

# uma rodada: $1 = Texto 1, $2 = Texto 2 — o prompt sai por `cat`, nunca digitado
round() {
  { echo "# Critérios (a única régua — verbatim)"; cat "$CRIT"; echo
    echo "# O problema (o que os dois textos respondem)"; cat "$IN"; echo
    echo "# Texto 1"; cat "$1"; echo
    echo "# Texto 2"; cat "$2"; echo
  } | ( cd "$(mktemp -d)" && env -u CLAUDECODE claude -p --safe-mode --effort "$EFFORT" --system-prompt "$SYS" --tools "" )
}
# última linha `VENCEDOR:` da saída → 1 | 2 | EMPATE | INDETERMINADO
winner() {
  local w
  w="$(grep -E '^[[:space:]]*\**VENCEDOR\**:' "$1" | tail -1 \
      | sed -E 's/^[[:space:]]*\**VENCEDOR\**:[[:space:]]*//; s/[[:space:]*`.]+$//' \
      | tr '[:lower:]' '[:upper:]')"
  case "$w" in 1|2|EMPATE) echo "$w" ;; *) echo "INDETERMINADO" ;; esac
}

T="$(mktemp -d)"
round "$A" "$B" > "$T/out1.md" || { echo "brain: a sessão cega falhou (rodada 1)" >&2; exit 3; }
round "$B" "$A" > "$T/out2.md" || { echo "brain: a sessão cega falhou (rodada 2)" >&2; exit 3; }
w1="$(winner "$T/out1.md")"; w2="$(winner "$T/out2.md")"
# mapeamento CRUZADO — a rodada 2 rodou INVERTIDA: lá o Texto 1 é o B e o Texto 2 é o A
case "$w1" in 1) r1=A ;; 2) r1=B ;; *) r1="$w1" ;; esac
case "$w2" in 1) r2=B ;; 2) r2=A ;; *) r2="$w2" ;; esac
if [ "$r1" = INDETERMINADO ] || [ "$r2" = INDETERMINADO ]; then res="INDETERMINADO — alguma rodada não terminou com a linha VENCEDOR"
elif [ "$r1" = "$r2" ]; then res="$r1"
else res="DISCORDAM — efeito de posição; não é vitória de ninguém"
fi
{ echo "# Juiz cego — 2 ordens"
  echo "- critérios: \`$CRIT\` · problema: \`$IN\` · A (nossa): \`$A\` · B: \`$B\`"; echo
  echo "## Rodada 1 — Texto 1 = A · Texto 2 = B"; cat "$T/out1.md"; echo
  echo "## Rodada 2 — Texto 1 = B · Texto 2 = A"; cat "$T/out2.md"; echo
  echo "## Consolidação"
  echo "- Rodada 1: $r1 · Rodada 2: $r2"
  echo "- RESULTADO: $res"
} > "$OUT"
cat "$OUT"
```

- `env -u CLAUDECODE` não é higiene de variável: faz o `env` resolver `claude` no PATH em vez de uma função de shell que injete flags.
- O `cd "$(mktemp -d)"` é isolamento — o diretório de trabalho entra no contexto da sessão cega.
- `--tools` é variádica: vem sempre **por último**, e o prompt entra por stdin, nunca como argumento.
- No Bash tool, use `timeout` de 10 min; rodada longa → `run_in_background`, e leia o `OUT` quando terminar.
- A saída vai **integral** para o artefato (`cat`), nunca parafraseada: "o cego aprovou" não é evidência; a saída dele é.
- Códigos: `0` ok · `1` entrada/prompt ausente · `2` binário `claude` ausente · `3` a sessão cega falhou.

## Prompt do juiz — ask

```
Você é uma sessão cega: não existe conversa anterior, arquivo, projeto, memória nem ferramenta — só o texto que chega agora. Responda a ele, e só a ele.

- Não presuma contexto que não está no texto. Se faltar algo decisivo, diga o que falta em vez de inventar.
- Literal e direto: sem preâmbulo, sem elogio, sem resumo do que foi perguntado.
- O que você não pode verificar vem marcado como não verificado — nunca afirmado.
- Pedido de hipóteses: liste as que o texto sustenta, inclusive as incômodas, sem ordenar por preferência e sem escolher uma.
- Responda no idioma do texto recebido, com ortografia completa (acentos inclusive).
```

## Prompt do juiz — pair

```
Você é um juiz cego. Vai receber: os **critérios** (a única régua), o **problema** que os dois textos respondem, e dois textos — **Texto 1** e **Texto 2**. Você não sabe quem escreveu cada um e não deve tentar adivinhar: julgue o que está na página.

Regras:
1. A régua é só a dos critérios recebidos: critério que está lá conta; o que não está, não conta. Não invente critério novo ("mais completo", "parece mais profissional"). **Comprimento não é qualidade.**
2. Julgue **critério a critério**, citando trechos literais dos dois textos como evidência. Para cada um: qual texto atende melhor (1, 2 ou empate) e por quê, em uma ou duas linhas.
3. Recomendação sem o que a derrubaria, sem o que ela sacrifica ou sem confiança declarada é pior que uma mais modesta que tenha as três — a menos que os critérios digam o contrário.
4. Depois, o veredicto geral: qual texto a pessoa que tem esse problema preferiria receber — pelos critérios decisivos, não pela soma mecânica.
5. Sem elogio, sem preâmbulo. Não reescreva os textos; não sugira melhorias.
6. `EMPATE` só quando os dois atendem igualmente aos critérios decisivos — nunca como saída diplomática.
7. Responda no idioma dos critérios, com ortografia completa.

Formato de saída (exato):

## Por critério
- <critério>: Texto <1 | 2 | empate> — <evidência literal dos dois lados>

## Veredicto
<2 a 4 linhas>

VENCEDOR: <1 | 2 | EMPATE>

A última linha da resposta é obrigatoriamente `VENCEDOR: 1`, `VENCEDOR: 2` ou `VENCEDOR: EMPATE` — e nada depois dela.
```
