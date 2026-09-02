# Reconcile — o loop que fecha a distância entre a origem e o ambiente

> **A porta única.** `/homolog` e `/prod` declaram um **alvo** e entregam a ele. Nenhuma das duas invoca os outros motores direto, e nenhum motor invoca outro — a direção é `skill → reconcile → motor → borda`, sem retorno.

**Responsabilidade única:** rodar `diagnosticar → aplicar o motor do gap → re-diagnosticar` até `gaps[] == 0`.

## Iron Law

> **O eixo é o GAP, não o PR.** A pergunta não é "que PR está aberto?", é **"o que está pronto e não está no ar, funcionando e configurado?"**. Uma task pode estar na branch — mergeada, commitada, tudo certo no git — e não estar no ar: o run falhou, o runner estava offline, faltou uma env var, a migration não rodou. Skill que começa perguntando por PRs é cega justamente para o caso mais comum e mais silencioso.
>
> **Estado desejado − estado atual = o trabalho.** E o objetivo só está atingido quando o **último** gap fecha, provado por verificação no ar.

## O alvo — o que a skill declara

| Campo | O que é |
|---|---|
| `ambiente` | nome do ambiente publicado (homolog, prod) |
| `branch` | a branch que o publica |
| `fonteDoDelta` | onde procurar o que ainda não chegou lá |
| `gate` | pedir autorização explícita antes de agir? |
| `pré-requisito` | outro ambiente que precisa estar verificado antes |

**Duas naturezas de motor** (D-23): **motores de gap** — `pr-cycle` · `deploy-run` · `env-config` · `smoke` — fecham um gap e são invocados **só por este loop**; nenhum deles invoca outro motor de gap. **Motores de apoio** — `deploy-context` · `jira-sync` · `findings` · `scope-split` — não decidem fluxo e podem ser chamados por quem precisar. É o que mantém a ordem de dependência sendo decidida **aqui**, num lugar só.

Os alvos existentes:

| | `/homolog` | `/prod` — duas branches | `/prod` — branch única |
|---|---|---|---|
| `ambiente` | homolog | prod | prod |
| `branch` | `dev` | `main` | `main` |
| `fonteDoDelta` | PRs + commits pendentes | o que está em `dev` e não em `main` | PRs + commits pendentes |
| `gate` | não | **sim, a cada release** | não |
| `pré-requisito` | — | homolog verificado | — |

**Ambiente novo (staging, preview, multi-região) entra como LINHA nesta tabela** — mais uma linha aqui e uma no `## Ambientes` do `deploy.md`. Nem o loop, nem os motores, nem as skills mudam. Esse é o único eixo de crescimento previsto; qualquer outro pede decisão nova, não `if` novo.

## Passo 0 — Contexto e topologia

**`deploy-context.md`**, sempre, antes de tudo: topologia detectada (`git ls-remote`), doc do projeto lido (ou descoberto e escrito). O alvo declarado pela skill é **validado** contra a topologia real — alvo incompatível (ex.: `/homolog` em branch única) é recusado pela própria skill, antes de chegar aqui.

Board do Jira: **`/jira-board`**, também no Passo 0 de quem chama.

## Passo 1 — Diagnosticar (e PUBLICAR antes de agir)

Levantar os dois estados e publicar a diferença **antes** de qualquer ação:

**Estado desejado** — o que deveria estar no ar: PRs abertos para a `branch` · commits na `branch` ainda não publicados · cards que deveriam estar no ar (dos PRs mergeados e commits diretos desde o último smoke verde) · configuração que esses PRs exigem (`## DevOps`).

**Estado atual** — o que está lá: último run e seu desfecho (`deploy-run.md`) · configuração presente no ambiente (`env-config.md`) · o que responde na URL (`smoke.md`).

Publicar:

```markdown
## Diagnóstico — <ambiente>
| # | Gap | Motor |
|---|-----|-------|
| 1 | PR #42 aberto, review não feito | pr-cycle |
| 2 | `dev` tem 3 commits publicados mas o último run falhou | deploy-run |
| 3 | `STRIPE_WEBHOOK_SECRET` ausente no ambiente | env-config |
| 4 | 4 cards no ar sem verificação | smoke |
```

Gap **zero** → não mexe em nada e **diz por quê** (§ Passo 4). Publicar o diagnóstico primeiro é o que torna a skill auditável e cancelável — e é o que permite o relatório final comparar prometido × entregue.

## Passo 2 — Gate (só se o alvo pedir)

`gate: true` → **perguntar, agora, a cada release**:

> "`<branch de origem>` tem `<N>` commit(s) fora de `<branch>`, cobrindo os cards `<lista>`. Quer promover? Isso **publica em produção**, com usuários reais. [sim/não]"

- **Não / silêncio / qualquer coisa que não seja um "sim" explícito** → **PARA**. Nada muda.
- **Autoridade dita antes não conta** — "sou tech lead", "pode subir sempre", o "sim" da semana passada. A autorização é para **este** release.

`gate: false` → segue direto. O que cai é a **pergunta**, nunca o review, nem a QA, nem o smoke.

## Passo 3 — Fechar os gaps, na ordem da dependência

```
origem → branch → sincronizado → configurado → verificado
```

| Gap | Motor | Observação |
|---|---|---|
| Trabalho commitado em feature branch, sem PR | **`/pull-request`** | nada chega ao ambiente sem passar por review |
| PR aberto (review, QA, aprovação, merge, rejeição) | **`pr-cycle.md`** | vários PRs → **um por um**, re-diagnosticando entre eles |
| PR entrega além do card | **`scope-split.md`** | |
| Achado fora do escopo | **`findings.md`** | |
| `pré-requisito` do alvo não verificado | **este loop, no alvo do pré-requisito** | `/prod` roda a verificação de homolog antes de cogitar prod |
| Commits na branch e não publicados | **`deploy-run.md`** | os três desfechos: verde · vermelho · fila |
| Publicado e sem configuração | **`env-config.md`** | |
| Configurado e não verificado | **`smoke.md`** | o último gap, e o único que autoriza dizer "no ar" |

**A ordem não se atalha:** não se configura o que não subiu, não se verifica o que não foi configurado. Gap só é atacado quando o anterior fecha.

**Re-diagnosticar depois de cada gap fechado.** Fechar um gap muda a realidade — o merge de um PR faz a branch andar, o que abre o gap de deploy; um deploy verde abre o de configuração. Confiar no diagnóstico inicial até o fim é como confiar no `git status` de dez minutos atrás.

**Teto de ~3 passes por gap.** Não convergiu → **para e reporta** o gap que resistiu e o que se tentou. É a mesma régua que o `pr-cycle.md` aplica ao loop de conserto: 3 rodadas sem convergir não é detalhe, é sinal de que a causa é outra.

## Passo 4 — Fechar

**Todos os gaps fechados** → `jira-sync.md` para cada card ("Em `<ambiente>`: `<URL>`") e o relatório final, comparando o diagnóstico do Passo 1 com o que foi feito.

**Gap zero desde o início** → **não faz nada** e explica: *"`<ambiente>` está no ar com tudo verificado: `<N>` cards, run `<id>` verde, configuração completa, smoke em `<URL>` passou em `<data>`. Nada a fazer."* Idempotência é requisito: a skill tem de poder rodar a qualquer momento sem medo, e "nada a fazer" **silencioso** é indistinguível de falha.

**Gap que resistiu** → reportar **o que ficou**, por quê, e o que destrava. O objetivo **não** é declarado atingido. Meio-caminho relatado como sucesso é o defeito original desta família de skills.

## Red Flags — STOP

- "Não tem PR aberto, então não há nada a fazer" → NÃO. É **exatamente** o caso central: a task pode estar na branch e fora do ar. Diagnostica o ambiente.
- "Sei o que fazer, ajo e reporto no fim" → NÃO. O diagnóstico é publicado **antes**. Skill de estado que age às cegas não é auditável nem cancelável.
- "Mergeei o PR, objetivo cumprido" → NÃO. Merge é o **primeiro** gap, não o último. Faltam sincronizar, configurar e verificar.
- "Configuro enquanto o deploy roda, ganho tempo" → NÃO. A ordem é dependência, não preferência: configurar o que não subiu deixa o ambiente num estado que ninguém sabe descrever.
- "Diagnostiquei no começo, sigo o plano até o fim" → NÃO. Cada gap fechado muda a realidade. Re-diagnostica.
- "São 3 PRs, mergeio os três e depois vejo" → NÃO. Um por um, re-diagnosticando: a branch andou, e o PR seguinte pode ter ficado atrás.
- "O usuário autorizou o deploy da semana passada" → NÃO vale para sempre. `gate: true` pergunta a **cada** release.
- "Branch única não tem gate, então também não precisa de review" → NÃO. O que cai é a **pergunta**. Review, QA e smoke continuam.
- "Está tudo no ar, então não digo nada" → NÃO. Gap zero se **declara**, com a evidência. Silêncio parece falha.
- "Um gap não fechou, mas os outros sim — reporto sucesso" → NÃO. O objetivo é o estado inteiro. Diz o que ficou e o que destrava.
- "Tento de novo até passar" → NÃO. Teto de ~3 passes por gap. Depois disso, a causa não é transitória.
