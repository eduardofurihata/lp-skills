---
name: brain
description: 'Use when user invokes /brain to understand a problem or decide between paths — thinking, not building. Assumes the request is WRONG and restates it; seven phases, blind judge on one-way doors, ONE recommendation as an ADR in docs/decisions/.'
effort: max
argument-hint: "[o problema ou a decisão — escreva torto mesmo]"
allowed-tools: Bash, Read, Grep, Glob, Write, Edit, WebSearch, WebFetch, Agent, AskUserQuestion, TaskCreate, TaskUpdate
disable-model-invocation: true
---

# /brain

Entra um pedido mal escrito; sai **um parecer** — o problema real, uma recomendação, o que a derrubaria, a confiança. 🚫 Não escreve código, não commita; só `docs/decisions/NNNN-<slug>.md`.

**O pedido está errado até prova em contrário** — é a primeira solução de alguém incomodado: sintoma, não especificação. Entra **verbatim**, sai **reformulado** e compete como `opção-pedido`. O recorte é revisável até a Fase 6, **por evidência, nunca por conveniência**.

**Procedência > fluência.** Toda afirmação é evidência (`E-n`) ou suposição (`S-n`); três estados: `verificado` · `ausente-de-fato` (procurei — evidência) · `não-apurado` (não fui ver — lacuna `L-n`). **"Depende" só passa com a pergunta que destrava**; lacuna decisiva → apura, ou parecer condicional.

## As 7 fases — nomes e ordem são contrato

1. **Recorte.** A escada: pedido → dor (o que aconteceu antes) → estado final; **peso 1-10 derivado** (reversibilidade, alcance, custo, velocidade), que calibra quantidade, não existência. Devolva a reformulação e **siga**. Pergunte só o que **só você** responde e muda o que eu faço — o que aconteceu, nunca "o que você quer".
2. **Evidência.** Vá ver: código, `git log`, docs, dados. Subagente varre, mas **nada entra pela palavra dele** — citação literal com coordenada.
3. **Diagnóstico (ACH).** ≥ 3 hipóteses, a incômoda inclusa; sobrevive a que a evidência **menos refuta**; o problema nomeado em frase falsificável. Peso ≥ 8: `scripts/blind-ask.sh`, sem as suas hipóteses.
4. **Opções.** ≥ 3 caminhos que discordam em **aposta**, mais a `opção-pedido` e a **opção zero**.
5. **Julgamento (Kepner-Tregoe).** Musts e wants **antes** de qualquer nota, ancoradas em `E-n`; **uma** recomendação preliminar.
6. **Refutação** — quatro ataques contra a **sua** recomendação, para vencer: pre-mortem, advogado do diabo, falsificador (**procurado** se peso ≥ 4), reversão. Peso ≥ 8: **juiz cego** `scripts/blind-pair.sh` (quatro arquivos, duas ordens): `B` → cai; `EMPATE`/`DISCORDAM` → volta à 5; sem `claude` → inline, `independência: NÃO`. Loop até o **passe seco**.
7. **Parecer (Minto).** Resposta primeiro, no topo do artefato e no chat: *Você pediu · O problema é · **Recomendação** · Porque (E-n) · Se sacrifica · Cairia se · Confiança · Primeiro passo reversível*. Status é seu: `Proposto` → `Aceito` | `Rejeitado`.

**Artefato:** ADR — `## Parecer` no topo, uma seção por fase, `## Lacunas`. Um **gate** por fase (*procedência · lacunas · confiança · status*) — sem ele, a fase não fechou.

## PARE se pensar
"já sei a resposta" · "ele quis dizer isso, óbvio" · "pergunto o que ele quer" · "o subagente disse que tem" · "depende do contexto"
