# Scope Split — separar do PR o que excede o card e devolvê-lo rastreado

> Invocado pelo `pr-cycle.md` quando o PR entrega **além** do card, ou quando o card era grande demais e virou um PR que ninguém consegue revisar.

**Responsabilidade única:** decidir o que do PR pertence ao card, o que é excedente, e devolver o excedente **rastreado** — sem deixá-lo entrar de carona nem desaparecer.

> **Não confundir com `findings.md`.** Lá o assunto é **achado do reviewer** (algo que o PR não faz e talvez devesse). Aqui é **código que o PR traz** e o card não pediu. Um julga ausência, o outro julga excesso.

## Iron Law

> **Excedente não desaparece nem entra de carona.** Mergear "porque já está pronto" é aceitar código que ninguém especificou, ninguém testou contra critério e ninguém vai lembrar de ter recebido. Descartar em silêncio joga fora trabalho real.

## 1 — Isto é excedente?

| Situação | É excedente? |
|---|---|
| Arquivo/feature que o `## Como testar` do card não menciona e nenhum UC do card exige | **sim** |
| Refatoração de arquivo **no perímetro** da mudança (o `/method` exige — regra do saldo) | **não.** É a passada elevando o que tocou |
| Renomeação/limpeza em arquivo que o PR nem abriu | **sim** |
| Segunda feature completa, com telas e regras próprias | **sim**, e é o caso mais claro |
| Correção pontual de bug encontrado no caminho, com sintoma no fluxo do card | **não** — é conserto in-place legítimo |

Dúvida entre "elevou o perímetro" e "trouxe feature nova" → olhe o `kanban/07-implementation/<feature>.md` § 3.5: o perímetro estava **declarado** no plano. Fora do perímetro declarado e sem UC do card = excedente.

## 2 — Separável ou não?

| Caso | Decisão |
|---|---|
| O excedente sai do diff sem quebrar o que o card pede | **card para o excedente** + `request-changes` pedindo que ele saia deste PR |
| O excedente está entrelaçado (mesmos arquivos, mesma refatoração) e separar exigiria reescrever | **rejeita o PR** (`pr-cycle.md` § 5) com o pedido de re-split — dois PRs, um por card |
| O card era grande demais e o PR só refletiu isso | **quebra o card**: cards menores para as partes, e o PR atual passa a resolver apenas a primeira |

## 3 — Devolver rastreado

Para cada excedente que vira trabalho futuro: **`/card`** no board do projeto (o `/jira-board` já resolveu qual é), descrevendo **o que é** e **por que saiu deste PR** — nunca prescrevendo implementação (a solução é do `/method` do card, com o escopo na mão). O tipo de issue é descoberto pelo `/card` no projeto de destino.

No `request-changes`, dizer exatamente: o que sai, para qual card foi, e o que fica.

> Excedente que **não** vira trabalho futuro (código morto, sobra de experimento) não precisa de card: pede-se a remoção no `request-changes` e registra-se a linha no relatório de review.

## 4 — Quando NÃO usar isto

- PR maior que o normal, mas **todo** ele rastreável ao card → não é excedente, é um card grande. Revisa e segue.
- Refatoração do perímetro → o `/method` **exige**; punir isso ensina o dev a não elevar o código.
- Achado de algo **faltando** → é `findings.md`, não aqui.

## Red Flags — STOP

- "Já está pronto e funciona, mergeio junto" → NÃO. Código que ninguém especificou nem testou contra critério entra sem dono e sem histórico.
- "É só uma refatoraçãozinha extra, deixo passar" → depende: **no perímetro** é obrigação do `/method`; **fora** dele é excedente.
- "Peço para remover e não abro card" → NÃO, se é trabalho real: aí ele desaparece. Card com o motivo de ter saído.
- "Abro o card já dizendo como implementar" → NÃO. O card **descreve**; a solução é do `/method`.
- "O PR mistura tudo, mas eu separo no merge" → NÃO. Separar diff alheio é reimplementar escondido no review → rejeita e pede o re-split.
- "O card era grande demais, então mergeio inteiro e quebro depois" → NÃO. "Depois" é onde o escopo não-revisado mora.
