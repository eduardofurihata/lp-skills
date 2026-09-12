# Cobertura — a entrega também tem estado

> **Completude é uma afirmação implícita.** Toda entrega afirma "isto é tudo" — e era a única afirmação que nenhuma camada do `/vac` cobrava. O regime exige estado do que você **escreve**; não exigia nada do que você **deixou de escrever**. Item não entregue e não declarado é um `[AUSENTE]`/`[INDISPONÍVEL]` que o modelo calou: **abster não bloqueia, calar a omissão inventa completude.**

**Nada de vocabulário novo.** São os mesmos quatro estados de `estados.md`, virados para o que faltou — como `pedido.md` fez com a entrada. Três faces do mesmo defeito: o pedido sem lastro (entrada), a afirmação sem lastro (procedência), a **ausência** sem lastro (cobertura).

## O que "entrega incompleta" é aqui — e o que não é

Medido no corpus antes de escrever uma linha de regra (653 transcripts, 11.670 mensagens, 6.581 artefatos de processo):

| Causa | Frequência | Camada que resolve |
|---|---|---|
| **Truncamento** (teto de tokens de saída) | `stop_reason: "max_tokens"` **zero vezes** em 653 transcripts — 67.578 `tool_use`, 1.858 `end_turn`, 48 `stop_sequence` | nenhuma: o Claude Code é o orquestrador e já continua o turno. Não existe aqui |
| **Omissão silenciosa** (prometeu N, entregou M, não avisou) | 88 + 3 + 115 itens nos artefatos | esta — contagem contra contagem |
| **Elisão** ("resto igual") | **1** em 11.670 mensagens e 5 em 6.581 artefatos | `mine.mjs` — e fica lá: 1 caso não é golden set |

**Por isso não há pipeline aqui.** Manifesto → chunk → validador → merge é a arquitetura de quem **escreve o orquestrador**: quem chama a API, lê `finish_reason` e concatena as peças em código. Dentro do Claude Code esse orquestrador já existe, e reconstruí-lo por fora seria pagar duas vezes pelo que os 67.578 `tool_use` já fazem. O que falta não é arquitetura — **é uma conta.**

## O denominador já está escrito no disco

O protocolo do `/method` manda publicar a própria contagem, e ela está em 193 artefatos dos repos:

```markdown
## Reconciliação
- Predicted: 10 TCs. Evidence collected: 10 (8 pré-commit + TC-6/TC-9). Delta: 0.
```

Três números, do mesmo autor, na mesma seção. **Ninguém nunca fez a subtração** — e em 88 artefatos ela não fecha. O mesmo vale para o `- [ ]` de um card que já chegou em `kanban/10-done/`: o item está aberto, o card está entregue, e ninguém saberia.

Denominador e numerador na **mesma string** é o que torna esta camada imune ao que quebra qualquer regra de transcript: compactação (a janela do ledger zera, `vac-ledger.mjs:40`), subagente (a sessão carregada é a do pai), plan mode (entrega 0 por definição) e a sobrescrita do pedido a cada prompt (`vac-hook.mjs:216`).

## As regras (`scripts/vac-cobertura.mjs`)

| `rule` | Pega | Não é sinal quando |
|---|---|---|
| `cobertura-delta` | `Delta` declarado ≠ `Predicted − Evidence collected` | a conta fecha — `Delta: 2` com 10 − 8 **é** a declaração honesta, e passa |
| `cobertura-faltando` | `Evidence < Predicted` sem nenhum `Delta` declarado | `Evidence > Predicted` (escopo extra, não omissão) · só `Predicted`, que não afirma cobertura |
| `cobertura-checkbox` | `- [ ]` mudo em card de `kanban/10-done/` ou `11-ship/` | a linha declara estado em **qualquer** vocabulário do time (`[INDISPONÍVEL]`, `NOT_RUN`, `❌ FAIL`, `⏳ pendente (env+restart)`, `⚠️ PARCIAL`, `skipped`, `balde B`) · o card ainda não fechou · o checkbox está em bloco de código (template) |
| `cobertura-elisao` | "resto igual", "demais linhas seguem", "omitido por brevidade", `// … resto` | `resto d[oa]` e "demais casos" — uso normal da palavra · negação · célula de tabela · bloco de código. **Só no `mine.mjs`** |

O gate do checkbox é **posicional** — a pasta, não o texto. Medido: nenhuma das 2.578 seções de gate com release do corpus tem um único checkbox aberto (checkbox mora em seção narrativa), e grep solto de `APROVADO` pega linha de ponteiro (`Review: kanban/08-code-review/x.md (APROVADO)`), que não fecha coisa nenhuma.

## O que foi tentado e descartado — por medição, não por gosto

| Ideia | Por que caiu |
|---|---|
| `Ratio M == N?` do Audit Pré | a regra não sabe quais duas das três contagens do bloco o Ratio compara; **1 disparo em 6.581 artefatos, e era falso positivo**. O `audit-counts` (`vac-ledger.mjs:428`) já confere esse bloco contra o transcript |
| Denominador por **task list** | 7 `TaskCreate` em 655 transcripts. E o único fluxo que cria task para **ficar** pendente é o `/ctt` (`ctt/SKILL.md:8`) — a regra dispararia em todo `/ctt` |
| Denominador pelo **pedido do usuário** | `idx.pedido.raw` é sobrescrito a cada prompt (`vac-hook.mjs:216`): no `Stop` o denominador é o *último* prompt, não o pedido. E puniria o turno que fecha em `AskUserQuestion` — o comportamento que o cartão manda ter |
| `Predicted` × TCs do arquivo irmão | 573 pares de mesmo basename, mas as 18 divergências são majoritariamente **feature em fases** (o run-test cobre a Fase 1 de 30 TCs) |

## Hoje: instrumentação

Toda regra nasce `severity: "note"` — nada bloqueia, nada é injetado além da frase do cartão. É a mesma disciplina do `pedido.md:63`: *promover `note` → `block` sem golden set é repetir o erro que o `/vac` existe para corrigir*.

`/vac log --kind note` e `/vac caso last --kind note` são o que fecha o ciclo — o `--kind` foi acrescentado em `cmdCaso` porque sem ele **nenhum sinal de fase 1 alcançava o golden set** (o `/vac caso` só lia `kind: "block"`), e isso já valia para os sinais de pedido que já rodam.

O candidato natural a `block` na segunda rodada é `cobertura-delta`: é aritmética pura, tem 88 casos reais de golden set e não tem leitura alternativa.

**A elisão é o contraexemplo que justifica a disciplina.** A primeira régua dela — `resto d[oa]`, "demais casos" — dava 0,90% das mensagens e **30 de 30 falsos positivos** no labzz-afl: "o resto da plataforma", "resto do épico", "nos demais casos". Estreitada para o que só pode significar conteúdo substituído, cai para 1 mensagem em 11.670. A regra não melhorou de 104 para 1: ela nunca teve 104. Medir antes de ligar é o que separa as duas leituras.
