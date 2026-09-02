---
feature: homolog-prod
phase: code-review
veredicto: APROVADO
rodadas: 2
---

# Code Review — Homolog e Prod

Escopo: os 11 arquivos do perímetro declarado + os 8 descobertos no 7b. Revisado contra `principios.md`, princípio a princípio e por nome.

## Análise de Qualidade — princípio a princípio

**SRP** ✅ — 11 unidades, cada uma com responsabilidade de **uma frase** (§ 3 do plano). Saldo do refactor: 321 linhas monolíticas → 9 motores (54–161 l.) + 2 orquestradores (129 e 176 l.). O maior (`pr-cycle`, 161 l.) tem uma responsabilidade só — `findings` saiu dele justamente porque juntos seriam duas (D-22).

**OCP** ✅ — ambiente novo entra como **linha na tabela de alvos** do `reconcile`; loop, motores e skills não mudam. O guard de topologia é **um** por skill, no Step 0 — nenhum `if` de topologia espalhado pelos motores.

**LSP** ✅ — os 3 alvos honram o mesmo contrato de `reconcile`: variam `ambiente`, `branch`, `fonteDoDelta`, `gate` e `pré-requisito` — **valores, não garantias**. Nenhum alvo exige passo que o contrato não preveja, e nenhum motor lança onde o contrato não prevê (o "não deu para aplicar" de `env-config` é `pendentes[]`, saída prevista, não exceção).

**ISP** ✅ — cada motor expõe a linha dele da tabela de contrato. `/homolog` declara 5 campos e não conhece nada de `deploy-run`.

**DIP** ✅ — as skills dependem do contrato `docs/00-context/technical/deploy.md`, não de plataforma: `deploy-run` **recusa** comando que o doc não registre (*"não improvise comando de plataforma"*). Trocar GH Actions por outra coisa é editar o doc do projeto, não a skill.

**DRY** ✅ *(2 achados corrigidos)* — `jira-sync.md` é a única fonte da mecânica do Jira; verificado por grep: `get_transitions|transition_issue` aparece **só** lá.

**KISS** ✅ — um loop, uma porta, alvos como dados. O risco de labirinto (9 references) está nomeado no plano § 5 e mitigado pela porta única.

**YAGNI** ✅ — os 10 descartes do § 3.2 permaneceram descartados; nada especulativo entrou durante o 7b. Nenhum motor "pro dia que precisar": os 9 saem de UCs.

**LoD** ✅ *(1 achado corrigido)* — direção `skill → reconcile → motor → borda`, sem retorno.

**Motores** ✅ — 9 donos; 3 por extração, 2 absorvendo lógica dispersa, 1 (`env-config`) passando a ser o consumidor de um contrato que existia sem ninguém que o cumprisse.

**Refatoração — saldo do perímetro** ✅ — 11 arquivos elevados; 4 declarados **já no nível #1** (`todo`, `card`, `jira-board`, `lib/skills.ts`), verificados e não alterados.

**Design** ❌ N/A — sem superfície visual (D-19).

## Achados e correções (todos balde A — dentro do escopo, corrigidos no step)

| # | Achado | Classe | Correção |
|---|--------|--------|----------|
| A1 | **`homolog/SKILL.md` perdeu a Red Flag "não existe branch `homolog`"** — o plano § 3.5 exigia texto intacto, e ela ficou **mais** necessária depois do rename: agora a skill *se chama* homolog | A | Red Flag devolvida e adaptada: *"A skill se chama `/homolog`, então existe uma branch `homolog`" → NÃO…* |
| A2 | A regra *"sem `comment` na transição (ADF)"* e a mecânica `get_transitions → transition_issue` ficaram em **3** arquivos — o DRY que este trabalho vem consertar não havia completado | A | `pull-request` e `work` (2 trechos) passaram a **ponteiro puro**: o *quê* fica na skill ("status equivalente a X"), o *como* mora no motor |
| A3 | **Spec × código divergiam:** D-16 dizia "nenhum motor conhece outro", mas `pr-cycle` precisa de `jira-sync` e `findings` | A | **D-23** registrada no spec: motores de **gap** (só o `reconcile` invoca; nenhum invoca outro de gap) × motores de **apoio** (chamáveis por quem precisar). `reconcile` e `smoke` explicitam a fronteira; `deploy-run` passou a **devolver desfecho** em vez de "seguir para" outro motor |

**Rodada 2** (todo fix invalida o passe → re-review completo): re-grep das 4 invariantes + `tsc` + idempotência do gerador. Passe limpo, **zero mudanças** na terceira leitura.

## Observações (não viraram card)

| # | Achado | Classe | Por que não é card |
|---|--------|--------|--------------------|
| O1 | `card/references/jira-anexos.md:12` usa `NIV-42` hardcoded no exemplo, contrariando o "nunca hardcoded" que as skills passaram a pregar | C | Pré-existente, fora do perímetro (trata de anexos do `/card`), sem consequência funcional — é exemplo em doc. É o F-04 do ledger, `DESCARTADO` com justificativa |
| O2 | `pr-cycle`, `deploy-run`, `env-config` e `smoke` citam-se mutuamente na linha de **responsabilidade única** ("não faço X, isso é do Y") | C | **Delimitação de fronteira é desejável** — é o que impede o motor de crescer para o vizinho. Não é acoplamento: nenhuma é invocação (verificado por grep após A3) |
| O3 | `make-dev:69` mantém a nota "machine off = job queued, not failed" que `deploy-run` agora também afirma | C | Contextos distintos e legítimos: lá é sobre CI local do dev, aqui sobre entrega. O `deploy-run` é o dono **na entrega**; não há regra de negócio duplicada, e sim o mesmo fato observado em dois domínios |

## Veredicto

**APROVADO** — 2 rodadas, 3 achados classe A corrigidos no step, 3 observações registradas (nenhuma vira card), zero issues pendentes. `tsc` passa, gerador idempotente (bytes idênticos em 2 execuções), 4 invariantes estruturais verificadas por grep.
