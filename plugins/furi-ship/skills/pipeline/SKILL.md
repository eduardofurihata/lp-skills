---
name: pipeline
description: 'The single home of the furi-ship delivery engines — read by path, never typed. Hosts the staircase every ship target walks (card → branch → reproduction → commit → push → pr → integrated → published → configured → verified → promoted), the target contract that `/work`, `/pull-request`, `/homolog` and `/prod` declare, the composition table that lets `/repro` and `/card` modify any target in any order, and the engines that close each stage: `reconcile` (the loop), `branch`, `work-cycle`, `pr-publish`, `pr-cycle`, `promote`, `deploy-context`, `deploy-run`, `env-config`, `smoke`, plus the support engines `jira-sync`, `findings`, `scope-split` and `composicao`. Internal (`user-invocable: false`): the four target skills list it in `requires` and read `pipeline/references/*.md`; no engine invokes a skill that declares a target.'
effort: max
user-invocable: false
---

# pipeline — a sede dos motores de entrega

Skill **interna**: ninguém a digita e ninguém a invoca. Existe para dar aos motores uma casa que não é de nenhum dos quatro alvos — antes eles moravam em `prod/references/`, e o `/work` lia da pasta do `/prod` para fechar um commit local. Os alvos declaram `requires: pipeline` e leem `pipeline/references/<motor>.md` por caminho (mesmo pacote resolve no cache instalado).

## Um pipeline, quatro alvos, dois modificadores

```
   modificadores — a ordem digitada é livre; a de execução é fixa: repro → card → alvo
   ┌─────────┐                          ┌──────────┐
   │  /card  │ cria o card, delega      │  /repro  │ reproduz, o dev vê o bug, delega;
   └────┬────┘ com a key                └────┬─────┘ o dev vê o conserto depois do commit
        │                                    │
        ▼                                    ▼
  ═══════════════════ UM PIPELINE ═══════════════════
   card? → branch → reprodução? → commit → push → pr? → integrado
         → [homolog: publicado → configurado → verificado]
         → «GATE» → promovido?
         → [prod:    publicado → configurado → verificado]
              ▲                 ▲                        ▲                          ▲
            /work         /pull-request              /homolog                    /prod

   os estágios que existem são os que o projeto tem: Abre PR (setup) · ambientes e branches (deploy.md) · Rastreamento (setup)
```

Cada **alvo** faz três coisas e nada mais: **Step 0** (`/jira`, `/setup`, `deploy-context.md`, `composicao.md`) → **declara até que estágio vai** → **entrega ao `reconcile.md`**, que diagnostica a faixa inteira, publica o diagnóstico, fecha os estágios abertos na ordem com o motor de cada um, re-diagnostica a cada um, e para no estágio do alvo. Um alvo nunca manda o usuário "rodar outra skill antes": estágio aberto é gap que o loop fecha.

Cada **modificador** roda a própria parte antes e delega ao alvo com os verbos restantes — `composicao.md` é a tabela de quem roda o quê.

## Os motores

| Motor | Natureza | Fecha o estágio | Lido por |
|---|---|---|---|
| `reconcile.md` | **o loop** | todos, na ordem | os quatro alvos |
| `composicao.md` | apoio | — (quem roda o quê, antes do loop) | alvos e modificadores |
| `deploy-context.md` | apoio | — (topologia, `<integração>`/`<produção>`, `deploy.md`) | todos |
| `branch.md` | estágio | `branch` | reconcile · `/repro` sozinho |
| `work-cycle.md` | estágio | `commit` → `/method` na borda | reconcile |
| `pr-publish.md` | estágio | `push`, `pr` | reconcile |
| `pr-cycle.md` | estágio | `integrado` (review · QA via `/todo` · aprovação · merge — ou rejeição) | reconcile |
| `deploy-run.md` | estágio | `publicado@<amb>` | reconcile |
| `env-config.md` | estágio | `configurado@<amb>` → `/infra` na borda, se falta o `infra.md` | reconcile |
| `smoke.md` | estágio | `verificado@<amb>` | reconcile |
| `promote.md` | estágio | `promovido` (atrás do gate) | reconcile |
| `jira-sync.md` | apoio | — (comenta e transiciona pelo `jira.md` do projeto) | os motores de estágio |
| `findings.md` · `scope-split.md` | apoio | — (classificam e registram; **nunca criam card**) | `pr-cycle` |

**Regra de estratificação:** `skill → reconcile → motor → borda`, sem retorno. Motor de estágio é invocado só pelo loop e não invoca outro motor de estágio. **Nenhum motor invoca uma skill que declara alvo nem um modificador** — na borda só entram `/method`, `/todo` (furi-build) e `/infra`. É o que impede a escada de reabrir do começo dentro dela mesma.

## O que muda quando o projeto muda

| O projeto… | Onde está declarado/detectado | Efeito na escada |
|---|---|---|
| sobe por push, sem PR | `setup.md § PR → Abre PR: não` | o estágio `pr` não existe; `pr-cycle` revisa os commits na integração |
| não tem ambiente de homolog (branch única) | `deploy.md § Ambientes` (uma linha) | os estágios de homolog e `promovido` não existem; `/homolog` avisa e sugere `/prod` |
| integra em `develop`, produz em `master` | `deploy.md § Ambientes` (detectado por `deploy-context.md` § 1, gravado) | nada muda — os motores escrevem `<integração>`/`<produção>` |
| não tem Jira | `setup.md § Jira → Rastreamento` | o estágio `card` não existe, `/card` recusa, `jira-sync` é no-op declarado |
| ganha um ambiente (staging, preview) | mais uma linha no `deploy.md § Ambientes` | mais um bloco `[amb: publicado → configurado → verificado]` na escada; nenhum motor muda |
