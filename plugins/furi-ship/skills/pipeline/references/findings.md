# Findings — classificar um achado fora de escopo e dizer seu destino

> **Fonte única do julgamento de achado do reviewer.** Extraído de `merge:152-224`. Invocado pelo `pr-cycle.md` (review) e pelo `scope-split.md` (excedente).

**Responsabilidade única:** dado um achado fora do escopo do card, dizer **de quem é a ponta**, **qual é a classe** e **registrá-lo com a prova** no relatório do review. Não conserta, não abre PR, não mergeia — e **não cria card**: o pipeline nunca cria card sozinho; abrir um é decisão do usuário, depois, com `/card`.

> **Não confundir com `plugins/furi-build/skills/method/references/follow-ups.md`.** Aquele é a triagem do **dev** (A/B/C, destino: ciclo `/method`, e "vira card" é **proibido** como saída dele). Este é a triagem do **reviewer**, cujo destino é o **relatório com a prova** — classificado para que o usuário decida, em cinco segundos, se abre um card. As duas coexistem porque os atores são diferentes; fundi-las abriria a rota de escape que mata o loop de convergência do `/method`.

## Iron Law

> **Achado registrado é achado PROVADO, não opinião do reviewer.** O "deveria ser assim" **jamais** é opinião — é uma frase que dá para grepar. Sem isso o review fabrica retrabalho e, pior, motiva mudança em código compartilhado a partir de defeito que ninguém provou existir. A prova é o que faz a linha do relatório valer um card **quando o usuário decidir abri-lo**.

## Passo 0 — De quem é a ponta?

Antes de qualquer classificação:

- **Ponta que o dev deixou** — algo que o `/method` dele tinha superfície para ver (tocou no arquivo, o fluxo passa por ali, o ledger do card de done está sujo ou ausente) → **NÃO vira card**. É violação da Regra Inviolável 7 do `/method`: **rejeita o PR** (`pr-cycle.md` § 5) e devolve pro dev convergir.
- **Ponta que só o review externo enxerga** — impacto cross-PR, conflito com outra entrega, contexto de produção que o dev não tinha → segue para a classificação. **Não enfiar no PR atual.**

## As três classes — cada uma tem a SUA prova

| Classe | O que é | Prova exigida | Destino |
|---|---|---|---|
| **A · BUG** | O sistema **contradiz o que ele mesmo promete** (código, spec, UI, card, doc) | **Reprodução observada**: passo no front que falha (Playwright), medição de DOM/rect, linha no banco, log, saída de comando | **Relatório, com a reprodução** — candidato a card, se o usuário quiser |
| **B · FURO** | Falta comportamento que **uma fonte do projeto exige** — furo de regra de negócio / caso de uso | **Citação verbatim** da fonte (`arquivo:linha` + a frase colada) **+** `grep` provando a ausência no código **+** consequência material | **Relatório, com a citação e a consequência** — candidato a card, se o usuário quiser |
| **C · MELHORIA** | "Poderia ser de um jeito X" e **nada no projeto exige X** | **nenhuma prova é possível** — é opinião | **Relatório.** Não é candidato a nada |

> **Por que classificar primeiro:** reprodução é gate **vazio** para ausência. "O sistema não faz X" sempre se reproduz — reproduz-se a ausência. Reprodução **não** prova que X *deveria* existir. Sem classe, melhoria vestida de defeito passa com evidência aparente — e é ela que gera o retrabalho inútil.

## O teste que separa B de C — "cola a frase"

**Quem disse que deveria ser assim?**
- Resposta é um **artefato citável** → **B**.
- Resposta é "eu, o reviewer, achei melhor" → **C**, e morre no relatório.

Não vale paráfrase, não vale "o UC-17 **implica** que", não vale "pelo espírito da spec". **Cola a frase ou não é furo.** O card carrega a citação, então dá para grepar e conferir em 5 segundos.

**Fontes que autorizam um "deveria" — as ÚNICAS:**
- `docs/01-problem/` · `docs/02-user-stories/` · `docs/03-use-cases/` (UC-NN) · `docs/04-spec/` (D-NN)
- `.claude/ship-setup/deploy.md` · `.claude/ship-setup/infra.md` · `.claude/patterns.md` · `.claude/ship-setup/setup.md` (convenção **declarada** do time — ex.: PR mergeado sem a aprovação que o setup exige é furo)
- `docs/00-context/decisions/` · `docs/00-context/technical/` (decisões e docs técnicos do projeto, onde existirem)
- `CLAUDE.md` / `AGENTS.md` — os blocos **OBRIGATÓRIO**
- O `## Como testar` / critério de aceite do próprio card
- **Paridade entre regiões** — fluxo implementado numa e ausente na outra é furo **objetivo**, não opinião
- **Invariante de dinheiro, dado clínico/sensível ou segurança/privacidade** — prod tem usuários reais

**NÃO autorizam:** benchmark ("big tech faz assim" — isso é `/solve` dentro de escopo, não fábrica de card) · robustez genérica · elegância · "seria bom ter" · violação de princípio (SRP/DRY/KISS/YAGNI) **sem sintoma observável**, que é classe **C** por definição.

## Checagem negativa (A **e** B) + consequência material (B)

**Comportamento deliberado não é achado.** Antes de propor **qualquer** A ou B, grepar:
- `kanban/07-implementation/*.md` → seção **`### 3.2 O que NÃO vamos construir (YAGNI)`** — descarte explícito **com motivo**
- decisão registrada (`docs/00-context/decisions/`, `D<NN>` citado em spec/código) ou comentário no código declarando o comportamento **intencional**

Achou → **não é card**. No máximo uma **pergunta** ao usuário, se o motivo registrado parecer stale.

> **Vale para a classe A também, e é onde o review mais escorrega.** Reproduziu o comportamento, mas ele está **documentado como intencional**? Então o sistema **não contradiz o que promete — ele cumpre**. Não é bug: é **revisão de decisão de produto**, que só o usuário toma → pergunta, **nunca** card autônomo. Reprodução prova que o comportamento existe; ela **não** prova que ele está errado.

**Consequência material.** Bug reproduzido já tem sintoma por definição; furo precisa de uma destas para virar card: dinheiro · dado clínico/sensível · segurança/privacidade · perda de dado · usuário travado sem saída · quebra de paridade entre regiões. Fora dessa lista → linha no relatório.
> É esta porta que carrega o "**é crítico e deveria ter**": furo crítico é **candidato** mesmo sendo pré-existente — criticidade **substitui** causalidade. Furo não-crítico não é candidato nem quando o PR passou por perto.

**Causalidade — vale para bug pré-existente:** bug reproduzido que o PR **não criou, tocou nem agravou** e **sem** consequência material → `DESCARTADO` com justificativa de uma linha. Com consequência material → candidato.

## Registrar — o único destino

**Nada aqui cria card.** Todo achado vai para `kanban/08-code-review/<feature>.md`, seção **`## Achados do review`** — uma linha por achado, com **classe**, **prova** e se é **candidato a card**:

```markdown
## Achados do review

| # | Achado | Classe | Prova | Candidato a card? |
|---|--------|--------|-------|-------------------|
| F1 | Agendar sem crédito trava a tela em /agenda | A | Playwright: clique em "Confirmar" → spinner infinito (screenshot f1.png) | **sim** — bug reproduzido, consequência: usuário travado |
| F2 | Paridade: fluxo X existe em BR e não em PT | B | `docs/03-use-cases/uc-17.md:12` — "*o fluxo vale para todas as regiões*" · grep sem ocorrência em `pt/` | **sim** — furo citado, crítico |
| O1 | `useAutosave` sem guarda de gravação em voo | A | não reproduzido (mecanismo inferido do código); pré-existente | não |
| O2 | Política de canal poderia ser tipada pelo catálogo | C | nada no projeto exige; sem sintoma observável | não |
```

A mesma tabela vai para o **relatório final da skill** (`Achados:` na saída do `/homolog`/`/prod`), com a linha *"nenhum card criado — abra com `/card` o que quiser levar adiante"*. O usuário decide; quando decidir, o `/card` recebe **os passos que você já executou** (A) ou **a citação da fonte** (B) — nunca hipótese a testar — e **descreve o defeito sem prescrever a implementação** (a solução é do `/method` do card, com o escopo na mão).

**Registrar ≠ criar card.** Ponta anotada não some — fica auditável no relatório, com a prova pronta para virar card em cinco segundos, sem virar trabalho de ninguém por decisão do reviewer.

> Achado é **privilégio do reviewer**, nunca saída do dev (ponta do dev → rejeita). Mas privilégio **com prova**: reprodução (A), ou citação + criticidade (B). Se virar rota de escape do `/method`, o loop de convergência morre — e se virasse card automático, o pipeline estaria criando trabalho que ninguém pediu.

## Red Flags — STOP

- "Acho a ponta solta, abro o card" → NÃO. **O pipeline nunca cria card sozinho.** Ponta do dev → rejeita. Achado do reviewer → **classifica e registra com a prova**; candidato ou não, o destino é o relatório — o card é decisão do usuário, com `/card`.
- "É bug reproduzido, então pelo menos esse eu crio" → NÃO. Reproduzido = **candidato forte**, marcado como tal na tabela. Criar continua sendo do usuário.
- "O mecanismo é claro no código, então abro o card sem reproduzir" → NÃO. Classe A exige **reprodução observada**. **"pode" / "poderia" / "em teoria" / "risco futuro"** no título é a assinatura do não-reproduzido: se o achado precisa dessas palavras para se sustentar, ele não passou na porta.
- "Reproduzi que o sistema não faz X, então é furo" → NÃO. Reproduzir **ausência** não prova o "deveria". Sem citação verbatim, é classe **C**.
- "O UC-17 **implica** isso" / "pelo espírito da spec" → NÃO. Paráfrase não é citação. **Cola a frase ou não é furo.**
- "É dívida pré-existente, mas grave, então abro card" → só se **bug reproduzido com consequência material** ou **furo citado e crítico**. "Grave no meu julgamento" não é critério — é alucinação com aparência de rigor.
- "O furo é real e provado, então crio o card" → NÃO. Furo é juízo de **direção de produto** → registra como candidato, com a citação. Ninguém cria sozinho.
- "Reproduzi, logo é bug" / "não preciso conferir se é intencional" → NÃO. Checagem negativa é obrigatória em **A e B**. Comportamento documentado como **intencional** não é defeito — é decisão de produto, e revisá-la é chamada do usuário.
- "O card já explica como corrigir no hook compartilhado" → NÃO. Card **descreve** o defeito; a solução é do `/method`, com escopo na mão.
- "Perguntei ao usuário no meio do review se abro o card" → NÃO. O review não para para isso: registra, e a decisão vem no relatório final, de uma vez. Perguntar no meio é o card entrando de carona na atenção do review.
- "Junto esta triagem com a do `/method`, é a mesma tabela A/B/C" → NÃO. Atores diferentes: lá é o dev convergindo; aqui é o reviewer provando. Fundir abre a rota de escape que mata a convergência do dev.
