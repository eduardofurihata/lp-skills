# Pedido — a entrada também tem estado

> **Alucinação de escopo é a que nenhuma regra deste repositório pegava.** O `/vac` garante *procedência*: toda afirmação carrega lastro. Quando o pedido é que está sem lastro, o modelo preenche o vazio com o plausível e entrega trabalho **impecável** para a pergunta errada — coordenadas certas, comandos rodados, screenshots existentes, todas as regras passando. O `/proof` já tinha nomeado o resultado: *"tem forma de relatório e responde a uma pergunta que ninguém fez"* (`plugins/furi-toolbox/skills/proof/SKILL.md:117`).

**Um pedido é uma afirmação como outra qualquer.** Ele afirma que existe um problema, que o problema tem uma causa e que a solução cabe num escopo. Por isso não há vocabulário novo aqui: são **os mesmos quatro estados** de `estados.md`, virados para a entrada.

## Os quatro, aplicados ao pedido

| Estado | No pedido | Exemplo |
|---|---|---|
| `[VERIFICADO]` | o usuário **disse literalmente**, ou a premissa foi conferida no disco | `- Objetivo: … — [VERIFICADO] "arruma o filtro da home que não limpa"` |
| `[AUSENTE]` | a premissa do pedido **não se sustenta** — procurei e não existe | `- Premissa: existe filtro na home — [AUSENTE] \`grep -rn "Filtro" app/(home)\` → 0 resultados` |
| `[INDISPONÍVEL]` | falta um dado que **muda a entrega**, e eu nomeei o que tentei | `- Falta: qual das 3 telas — [INDISPONÍVEL] assumi a home (única tocada no último commit)` |
| `[INFERIDO]` | **eu deduzi** o objetivo; ele ainda não é o pedido dele | `- Objetivo: … — [INFERIDO] de "arruma o filtro"; confirma-se com: home, admin ou relatórios?` |

A regra de transição que já existe resolve o caso difícil sozinha — `estados.md:16`, "`INFERIDO` nunca vira ✅ direto". Aplicada aqui: **objetivo inferido não pode ser declarado como o pedido do usuário.** Executar com ele é legítimo; chamá-lo de pedido dele, não.

## O bloco — quatro linhas, publicadas antes do trabalho existir

```markdown
## Pedido
- Objetivo: <uma frase> — [VERIFICADO] "<citação literal>" | [INFERIDO] de "<trecho>"; confirma-se com <a pergunta>
- Premissa: <o que o pedido assume que é verdade> — [VERIFICADO] arquivo:linha | [AUSENTE] <onde procurei>
- Falta: <o dado que mudaria a entrega> — [INDISPONÍVEL] assumi <X> porque <Y> | tool: AskUserQuestion → <resposta>
- Fora: <o que eu não vou fazer>
```

Custa menos que o parágrafo de preâmbulo que ele substitui. `Fora:` é a linha que mais trabalho economiza: escopo que ninguém pediu é a forma mais cara de acerto.

## Declarar ≠ perguntar (por que nenhuma skill precisou mudar)

O `/method:18` proíbe **confirmação** — "não pergunte 'posso prosseguir?'" —, não clarificação; o `/ask:30` faz a mesma distinção ("Skip 'should I proceed?' — that is confirmation, not clarification"). O `/vac` exige **declarar a interpretação com estado**. Se aquilo vira pergunta continua sendo decisão da skill:

| Skill | O que ela já faz com pedido ambíguo | Ponteiro |
|---|---|---|
| `/work` | nota 0-100; `< 90` ou ambiguidade real → `AskUserQuestion` antes de implementar | `work/SKILL.md:73-75` |
| `/repro` | mesma nota, decisão diferente: `< 90` → **ler mais código** em loop | `repro/SKILL.md:88-91` |
| `/proof` | alvo que não resolve → **recusa**, e o retorno inteiro é a recusa | `proof/SKILL.md:104-117` |
| `/ctt` | não pergunta: grava a lacuna como *open question* e segue | `ctt/SKILL.md:28` |
| `/method`, `/fast` | não têm gate de pedido — declaram e seguem | `method/SKILL.md:103-151` |

O denominador dessas notas é sempre **o card do Jira**, nunca o texto que a pessoa digitou — e a rubrica do "≥ 90" não existe em lugar nenhum do repositório. É o mesmo defeito do "score de suficiência 0-1" que as arquiteturas de guardrail vendem: número sem régua é o `PASSED` sem evidência da entrada. Por isso aqui é **lista nomeada do que falta**, nunca nota.

## Os seis sinais (`scripts/vac-pedido.mjs`)

Triagem determinística no `UserPromptSubmit`: string, regex e disco — zero modelo, o mesmo orçamento do guard. Só toca o disco quando o prompt cita arquivo que não resolve direto.

| `rule` | Pega | Não é sinal quando |
|---|---|---|
| `alvo-nao-resolve` | arquivo ou `/skill` citado que não existe — **premissa falsa, de graça** | o pedido é para **criar** (`cria`, `novo`, `adiciona`…), ou o nome vem entre crases (menção ≠ uso) |
| `reformulacao` | o prompt seguinte corrige o anterior (retratação explícita ou jaccard ≥ 0,45) | é assunto novo |
| `colagem-truncada` | cerca de código aberta e nunca fechada | as cercas fecham |
| `pipeline-sem-escopo` | `/method`, `/fast`, `/work`… com menos de 6 palavras de escopo | tem card `KEY-N` ou arquivo que resolve |
| `deixis-sem-referente` | "arruma isso" — pronome em pedido de ≤ 12 palavras, sem alvo | o alvo está nomeado, ou o próprio pedido descreve o referente |
| `skill-nao-roteada` | "commita tudo" sem `/save` — território de outra skill | a skill foi chamada |

**O prompt do usuário nunca é bloqueado.** Bloquear a resposta do modelo é uma coisa; bloquear quem está falando é outra. Todo sinal nasce `severity: "note"` e vai para `~/.claude/vac-data/vac/log.jsonl` (`kind: "pedido"`), com o campo do payload de onde o texto veio.

## Hoje: instrumentação

O que está ligado é a **medida** — sinais no log, pedido gravado em `sessions/<id>.json`. Nada é injetado, nada bloqueia, o cartão sai idêntico. `/vac log --kind pedido` é o que vai responder, com dado, qual tipo de pedido mal formulado de fato acontece aqui — e o `reformulacao` é o rótulo barato que diz quais dos outros cinco valeram a pena.

Só depois disso: o bloco no cartão (condicional), o gate em `gates.json`, a reinjeção do pedido em subagente e pós-compactação — onde o cartão e os mapas já entram —, e a linha `PEDIDO:` no veredito do verificador. Promover `note` → `block` sem golden set é repetir o erro que o `/vac` existe para corrigir.
