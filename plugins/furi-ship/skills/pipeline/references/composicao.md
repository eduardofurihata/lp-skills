# Composição — alvos e modificadores, em qualquer ordem digitada, numa ordem fixa de execução

> **Motor de apoio.** Lido pela skill que o usuário digitou, **antes** de qualquer outra coisa. O loop (`reconcile.md`) nunca vê um modificador: só vê o **alvo efetivo** — estágios e paradas já fundidos.

**Responsabilidade única:** dado o verbo digitado e o `$ARGUMENTS`, dizer **quem roda agora**, **o que faz** e **a quem delega**.

## Os verbos — lista fechada

```
ALVOS         = work · pull-request · homolog · prod        (declaram até onde vão; faixas aninhadas: prod ⊃ homolog ⊃ pull-request ⊃ work)
MODIFICADORES = repro · card                                 (acrescentam um estágio e/ou paradas)
VERBO         = token do $ARGUMENTS que casa ^/(work|pull-request|homolog|prod|repro|card)$
```

O resto do `$ARGUMENTS` (a key, a descrição, `finish`) é o **objetivo**, e passa adiante intacto. Só esses seis tokens são composição; `/method` e qualquer outra barra não são verbos deste pipeline.

## A ordem de execução é FIXA: `repro` → `card` → alvo

Não importa a ordem digitada. Cada camada **roda a própria parte** e **delega à seguinte** via Skill tool, com os verbos que sobram no argumento — chamada real, nunca "seguir de memória":

| Camada | O que faz | Por que nessa posição |
|---|---|---|
| **`/repro`** | reproduz na superfície certa (nota ≥ 90), o usuário **vê o bug** (parada 1), e a reprodução fica na conversa | a reprodução **alimenta** o card (`## Como testar` com os passos observados) e o `/method` (o cenário é o TC de referência) — tem de vir antes dos dois |
| **`/card`** | cria o card no Jira — com os passos da reprodução, se houve — e devolve a key | a key **nomeia a branch**; sem card não há estágio `card`, e o alvo recebe a key pronta |
| **alvo** | monta o alvo efetivo (base + o que os modificadores acrescentaram) e entrega ao `reconcile` | é o único que roda o loop |

`Skill(skill: "<próxima camada>", args: "<os verbos restantes> <objetivo>")` — cada camada **tira só o próprio verbo** do argumento.

## O que cada modificador deixa para o alvo

| Modificador | Estágio na escada | Como o alvo o vê | Parada que acrescenta |
|---|---|---|---|
| `/card` | `card`, antes de `branch` | já **fechado**: a key chegou no argumento | nenhuma |
| `/repro` | `reprodução`, entre `branch` e `commit` | já **fechado** se a parada 1 foi confirmada nesta conversa (ou está no registro `docs/jira/todo/<KEY>-<N>.md`); senão **aberto** → o alvo delega ao `/repro` antes de rodar | **parada 2**: `{âncora: commit, posição: depois, protocolo: repro/references/human-check.md}` — o usuário **vê o conserto** |

A **parada 1** (vê o bug) não é hook: é o critério de fechamento do estágio `reprodução`, e acontece dentro do `/repro`. Só a parada 2 é ancorada em outro estágio. Um tipo de hook, não dois.

## A tabela — quem roda o quê

| Eu sou | O argumento traz | O que faço |
|---|---|---|
| alvo | só o objetivo | monto `base(eu)` e entrego ao `reconcile` |
| alvo | `/repro` com a reprodução **já feita** nesta conversa (parada 1 confirmada) | fundo a parada 2, tiro `/repro`, entrego ao `reconcile` |
| alvo | `/repro` sem reprodução feita | delego: `Skill(skill: "repro", args: "/<eu> <os outros verbos> <objetivo>")` — e **não rodo** |
| alvo | `/card` (sem `/repro` pendente) | delego: `Skill(skill: "card", args: "/<eu> <objetivo>")` — e **não rodo** |
| alvo | outro alvo | vence o **mais distante**; se não sou eu: `Skill(skill: "<ele>", args: "<o resto sem o meu verbo>")` — o report diz qual venceu |
| `/repro` | só o objetivo | reproduzo, parada 1, **encerro** — digo o que vem depois sem invocar: `/repro /work <obj>` para corrigir · `/card` para virar card |
| `/repro` | `/card` e/ou alvo | reproduzo, parada 1, delego: `Skill(skill: "card", …)` se há `/card`, senão `Skill(skill: "<alvo>", args: "/repro <objetivo>")` |
| `/card` | só o objetivo | crio o card, **encerro** — digo `/work <KEY>-<N>` sem invocar |
| `/card` | alvo | crio o card, delego: `Skill(skill: "<alvo>", args: "<verbos restantes> <KEY>-<N>")` |
| `/card` | `/repro` sem reprodução feita | delego ao `/repro` primeiro: `Skill(skill: "repro", args: "/card <os outros verbos> <objetivo>")` |

```
/repro ALK-42              → reproduz · parada 1 · encerra ("para corrigir: /repro /work ALK-42")
/card "login trava"        → cria ALK-43 · encerra ("para trabalhar: /work ALK-43")
/repro /card "login trava" → reproduz · parada 1 · Skill(card, "login trava") → card com os passos observados
/repro /work ALK-42        → reproduz · parada 1 · Skill(work, "/repro ALK-42") → /work funde a parada 2 e roda até commit
/work /repro ALK-42        → /work delega Skill(repro, "/work ALK-42") → igual ao de cima
/repro /prod ALK-42        → reproduz · parada 1 · Skill(prod, "/repro ALK-42") → /prod funde a parada 2 e roda até verificado@prod
/prod /repro ALK-42        → /prod delega Skill(repro, "/prod ALK-42") → igual ao de cima
/card /prod "login trava"  → cria ALK-43 · Skill(prod, "ALK-43") → /prod roda até verificado@prod
/prod /card "login trava"  → /prod delega Skill(card, "/prod login trava") → igual ao de cima
/repro /card /prod "x"     → reproduz · Skill(card, "/repro /prod x") → cria ALK-44 · Skill(prod, "/repro ALK-44") → /prod: reprodução já feita ⇒ funde a parada 2 e roda
/prod /repro /card "x"     → /prod delega Skill(repro, "/card /prod x") → cai no de cima
/work /prod ALK-42         → /work delega Skill(prod, "ALK-42") — o mais distante vence
```

## O que o alvo efetivo carrega para o loop

```
alvo = {
  atéOEstágio, ambiente, branch, fonteDoDelta, gate,      # da base do alvo
  estágios[]  = escada do projeto (os condicionais que existem), cortada em atéOEstágio
  paradas[]   = [parada 2] se /repro compôs, senão []
  objetivo    = o que sobrou do $ARGUMENTS (KEY-N, descrição, finish)
}
```

Publique o alvo efetivo **dentro** do bloco de diagnóstico do `reconcile` Passo 1 (a linha `Faixa: … · paradas: …`) — este pipeline não tem persistência por hook: o chat é o registro, auditável.

## Regras

- **Ordem digitada livre, ordem de execução fixa.** `repro → card → alvo`. Se dois caminhos produzirem resultados diferentes, a tabela está errada — não o usuário.
- **Modificador não roda o pipeline.** Sozinho, faz só a própria parte e encerra. Com alvo, faz a própria parte e delega. Nunca invoca `/method` por conta própria.
- **Skill que declara alvo não invoca skill que declara alvo** — exceto a delegação "vence o mais distante", que acontece **antes** de qualquer loop rodar. Depois que um `reconcile` começou, nenhum outro começa dentro dele.
- **Um alvo delega a um modificador só para trás** (`/repro` não feito, `/card` não criado) — nunca durante o loop.
- **`finish` é do objetivo, não da composição.** Passa adiante intacto; quem o interpreta é a parada (suprime as perguntas opcionais e **nunca** as duas humanas).
- **Sem Jira, `/card` recusa** (`Rastreamento` ≠ Jira, via `/setup`) com o motivo nomeado — e delega ao alvo mesmo assim, sem key: `/card /prod` num repo sem Jira vira `/prod "<descrição>"`, dito em voz alta.

## Red Flags — STOP

- "`/repro /prod` — rodo o `/repro` inteiro, com `/method`, e depois o `/prod`" → NÃO. O `/repro` faz **só a reprodução** e delega; o `/method` roda dentro do loop do `/prod`, uma vez.
- "`/prod /repro` é diferente de `/repro /prod`" → NÃO. Ordem de execução fixa: o `/prod` delega ao `/repro` e o resultado é o mesmo.
- "Recebi `/repro`, a reprodução já foi confirmada nesta conversa, mas delego de novo" → NÃO. Reprodução feita = estágio fechado. Funde a parada 2 e roda. (Delegar de novo é o loop infinito.)
- "Digitaram `/work /prod`, rodo o `/work` e aviso do `/prod`" → NÃO. Vence o mais distante.
- "Vi um `/` no argumento, é composição" → só os seis verbos. `/method`, um caminho de rota, um `/` na descrição do card não são verbos.
- "Fundi o modificador mas esqueci de tirar o verbo do argumento" → NÃO. O objetivo que chega ao loop é limpo: `ALK-42`, não `/repro ALK-42`.
- "O `/card` criou o card e eu, alvo, crio a branch com a key errada" → NÃO. A key chega no argumento da delegação; é ela que o `branch.md` usa.
