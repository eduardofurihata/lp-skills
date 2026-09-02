---
feature: homolog-prod
phase: done
tests: passed
resultado: 10/10 PASSED
branch: main
---

# Homolog e Prod — Done

`/merge` deixou de existir. No lugar, duas skills nomeadas **pelo destino**, que prometem um **estado** em vez de uma ação: o ambiente no ar, funcionando e configurado.

## O que mudou

| | Antes | Depois |
|---|---|---|
| `/merge` (321 l. monolíticas) | mergeia o PR na `dev` e para; oferece `main` como apêndice de 30 linhas | **`/homolog`** (129 l.): mergeia, **aprova o PR**, acompanha o deploy, aplica as configs e **verifica na URL de homolog**. Nunca toca `main` |
| prod tinha **dois donos** com contratos opostos (`/merge` Phase 6 × `/sync dev > main`) | deploy **declarado** por comentário no bash, nunca observado | **`/prod`** (176 l.): dono único — gate por release, promoção, run observado, configs de prod **e** homolog, smoke em prod, resync + assert |
| — | — | **9 motores** em `prod/references/`, consumidos pelas duas skills |

**O caso que motivou tudo:** uma task pode estar na branch — mergeada, commitada, tudo certo no git — e **não estar no ar**. O run falhou, o runner estava offline, faltou uma env var, a migration não rodou. Nada disso aparece no `git log`. Por isso o eixo passou a ser o **gap** (`estado desejado − estado atual`), não a lista de PRs.

## Os 9 motores

`reconcile` (o loop e a tabela de alvos) · `pr-cycle` (PR de aberto a mergeado-ou-rejeitado) · `findings` (julgar achado, com prova) · `scope-split` (excedente de escopo) · `deploy-context` (topologia e processo do projeto) · `deploy-run` (run a desfecho nomeado) · `env-config` (configuração do ambiente) · `smoke` (prova no ar) · `jira-sync` (card ↔ estado).

**Duas naturezas** (D-23, achada no code review): motores de **gap** (`pr-cycle`, `deploy-run`, `env-config`, `smoke`) são invocados só pelo `reconcile` e nenhum invoca outro de gap; motores de **apoio** (`deploy-context`, `jira-sync`, `findings`, `scope-split`) são chamáveis por quem precisar. É o que mantém a ordem de dependência decidida num lugar só.

## O que foi REUTILIZADO (DRY)

- **Ciclo de PR** — `merge:45-128` **extraído** para `pr-cycle.md`: conteúdo maduro, mudou de lugar, não de teor.
- **Classificação de achado** — `merge:152-224` **extraída** para `findings.md`.
- **Gate de autorização de prod** — `merge:236-239` **reusado**, movido para a propriedade `gate` do alvo.
- **Ciclo de promoção com assert** — `merge:240-267` **reusado integralmente**.
- **Régua "loop não converge em ~2-3 rodadas"** — `merge:89` **estendida** ao ciclo de ambiente.
- **"Runner offline = fila, não falha"** — `make-dev:69` **absorvido** por `deploy-run.md`.
- **"Zero secrets no código"** — `07-implementation.md:164` **estendido** a "valor nunca inferido nem versionado".
- **`/todo`, `/pull-request`, `/card`, `/jira-board`** — invocados, não reimplementados.

## O que foi DESCARTADO (YAGNI)

Endpoint `/version` obrigatório (imporia mudança a todo projeto-alvo) · rollback automático (pode ser pior que a falha; é **oferecido**) · generalização N-ambientes com herança (a tabela de alvos já aceita a linha) · skill-motor só para hospedar arquivos · máquina de estados nomeada · alias `/merge` · remover `dev > main` do `/sync` · migration reversível · notificação em canal externo · cache do contexto fora do doc versionado.

## Motores que NASCERAM, CRESCERAM ou ABSORVERAM

- **Nasceram por extração:** `pr-cycle`, `findings`.
- **Nasceram:** `reconcile`, `deploy-context`, `deploy-run`, `env-config`, `smoke`, `scope-split` — cobrem os **10 gaps 🔨** que a Verificação de Realidade encontrou.
- **Absorveram lógica dispersa:** `jira-sync` absorveu a sequência **triplicada** de `merge:132-133` + `work:71` + `pull-request:103` (três cópias que já divergiam); `deploy-run` absorveu o conhecimento solto de `make-dev:69`.
- **Ganhou consumidor:** o checklist `## DevOps` de `pull-request:79-83` existia e **ninguém executava** — `env-config` é o consumidor que faltava.

## O que a refatoração ELEVOU

11 arquivos, regra do saldo: 321 l. monolíticas → 9 motores + 2 orquestradores finos · caminhos quebrados `skills/method/references/…` → `skills/personal/…` · `requires` virou lista, alinhando com o que o corpo já declarava obrigatório · `pull-request` e `work` deixaram de assumir `dev` e passaram a resolver a **topologia** · `sync` ganhou a placa sem perder capacidade · gerador sincronizado (sem isso, publicar causaria regressão no catálogo) · README com exemplo válido · **8 arquivos com referência morta ao `/merge`** consertados.

**Declarados já no nível #1**, verificados e não alterados: `todo`, `card`, `jira-board`, `lib/skills.ts`.

## Novidades de comportamento

- **Aprovação do PR** (`gh pr review --approve`) antes do merge, com o caso real "o GitHub recusa aprovar o próprio PR" → registra por comentário.
- **Topologia detectada, nunca assumida** (`git ls-remote --heads origin dev`) — em **branch única** o `/homolog` recusa e encaminha; o `/prod` faz o ciclo inteiro **sem gate** (quem digita já autorizou), mantendo review, QA e smoke integrais.
- **Contexto de deploy versionado no projeto** (`docs/00-context/technical/deploy.md`) — inferido de workflows/Makefile/`.env.example`, perguntando só o não-derivável, **sem nenhum valor de secret**.
- **Fila tem critério objetivo:** runner online cujos **labels** atendem ao `runs-on`, não tempo de espera.
- **Smoke cobre todos os cards** no ar desde o último deploy verificado, na URL do ambiente — nunca `localhost`.

## Test Cases (QA) — 10/10 PASSED

- [x] TC-1: `/homolog` recusa branch única e encaminha — ✅ (tc1.txt)
- [x] TC-2: diagnóstico antes de agir + idempotência — ✅ (tc2-5.txt)
- [x] TC-3: catálogo com `/homolog` e `/prod`, `/merge` sumiu — ✅ (tc3-lp-catalogo.png)
- [x] TC-4: manifestos idempotentes, zero regressão — ✅ (tc4.txt)
- [x] TC-5: branch única sem gate, review integral — ✅ (tc2-5.txt)
- [x] TC-6: contexto inferido, pergunta o mínimo — ✅ (plano humming-wombat)
- [x] TC-7: os 9 gates do ciclo de PR sobreviveram — ✅ (tc7-rerun.txt)
- [x] TC-8: três desfechos, fila ≠ sucesso — ✅ (tc8-final.txt)
- [x] TC-9: config aplicada, secret perguntado, smoke amplo — ✅ (plano bubbly-elephant)
- [x] TC-10: autorização por release + assert + fronteira com `/sync` — ✅ (plano crystalline-leaf)

## Follow-ups (ledger final — passe seco)

| # | Achado | Balde | Status | Resolução |
|---|--------|-------|--------|-----------|
| F-01 | `/sync dev > main` como segunda porta para prod | A | RESOLVIDO-NO-SPEC | D-18: capacidades distintas; `/sync` fica e ganha a placa apontando o `/prod` |
| F-02 | `## DevOps` de `pull-request:79-83` sem consumidor | A | RESOLVIDO-NO-SPEC | `env-config` é o consumidor |
| F-03 | Const `BUILDERS` defasada — gerar reverteria descrições | A | RESOLVIDO-NO-STEP | T-15, corrigida antes de gerar |
| F-04 | `jira-anexos.md:12` com `NIV-42` hardcoded | C | DESCARTADO | Pré-existente, fora do perímetro, sem consequência funcional |
| F-05 | 8 arquivos com referência morta ao `/merge` | A | RESOLVIDO-NO-STEP | Corrigidos; "privilégio do `/merge`" → "privilégio do reviewer via `findings.md`" |
| F-06 | Fila tratada como estado único no `deploy-run` | A | RESOLVIDO-NO-STEP | Achado pelo TC-8: duas filas + labels + janela declarada |

**ABERTO = 0 · novos no último passe = 0.** Nenhum item virou card no Jira.

---

## Entrega em produção (dogfooding — o próprio `/prod` aplicado a este repositório)

Este repositório é **branch única** (só `main` em `origin`) e o deploy é a integração Git da Vercel. Pelo desenho novo, quem entrega é o `/prod`, sem gate.

| Gap | Motor | Resultado |
|---|---|---|
| `deploy.md` não existia | `deploy-context` | ✅ escrito em `docs/00-context/technical/deploy.md` — **tudo inferido**, nada perguntado, zero valor de secret |
| 1 commit não publicado | `deploy-run` | ✅ `560dcaf` publicado (`9180262..560dcaf`) |
| Deploy não observado | `deploy-run` | ✅ **desfecho verde**: Vercel `Ready` em 27s |
| Configuração | `env-config` | ✅ **nada a aplicar** — sem env var, migration, flag ou seed (verificado, não presumido) |
| Não verificado no ar | `smoke` | ✅ https://lp-skills.vercel.app — 23 cards, `/homolog` e `/prod` presentes, `/merge` **ausente**, contadores 20+3 |

Assert: `origin/main == main` = `560dcaf` ✓
Gate pré-publicação: `pnpm gen:plugins` idempotente + `pnpm build` de produção passando.
Evidência do smoke: `.playwright-mcp/smoke-prod-lp-skills.png`

**Nota honesta sobre o próprio teste:** o primeiro loop de acompanhamento do deploy não leu o status (regex do parser errada) e ficou 240s sem desfecho. Reclassificado e refeito em vez de assumir sucesso pelo tempo decorrido — que é exatamente o que o `deploy-run.md` § 4 proíbe ("não usar o relógio como prova").
