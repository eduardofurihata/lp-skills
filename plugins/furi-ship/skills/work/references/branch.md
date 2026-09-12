# Branch — da integração sincronizada à branch de trabalho (gh → integração → branch)

> **Fonte única da mecânica de branch.** `/work` (passo 2) e `/repro` (§ 2) apontam para cá; nenhum dos dois reescreve o fetch/merge, os três modos, o lote aberto, o nome da branch nem o "manter atualizada". Quem chamou já invocou o `/setup` (modo e nome) — este motor só **aplica**.

**Responsabilidade única:** deixar o checkout na branch de trabalho certa, sincronizada com `origin/<integração>`, antes de qualquer código. Não decide o modo (é do `/setup` § Branch), não descobre a topologia (é do `prod/references/deploy-context.md` § 1 — este motor a consome), não commita, não pusha, não abre PR. O `/method` **nunca cria branch**: a branch nasce aqui.

## Iron Law

> **gh → integração → branch.** Nunca trabalhar sobre integração stale; nunca assumir `dev`; nunca renomear a branch de um lote. Um clone de ontem já é stale. Branch que já existe no `origin` traz o **próprio remoto** antes da integração: o local nunca fica atrás de `origin/<branch>`.

## Contrato

| Entrada | Saída |
|---|---|
| `branch: {modo, nome}` do `/setup` (Step 0 de quem chamou — pedido explícito na sessão vence **para esta invocação** e não reescreve o arquivo) · `<KEY>-<N>` do card (+ slug curto, se o padrão `Nome:` tiver) · a **integração** resolvida pelo `prod/references/deploy-context.md` § 1 | checkout na branch de trabalho, sincronizada com `origin/<integração>` · `{integração, branch, modo, lote: {aberto, cards[]}, origem: arquivo \| criado agora \| override de sessão}` para o report de quem chamou |

## 1 — gh → integração

A branch de integração vem da **topologia**, nunca assumida — resolvida pelo `prod/references/deploy-context.md` § 1 (base dos PRs recentes → `dev` → default do GitHub; branch parada que nenhum PR mira não conta). Nunca trabalhar sobre integração stale — trazer tudo e resolver conflito antes:
```bash
partida=$(git branch --show-current)   # em `branch acumula cards`, é daqui que se decide o lote (§ 3)
git fetch origin
git checkout <integração>
git merge origin/<integração>   # gh → integração: traz o remoto; CONFLITO → resolver (entender os 2 lados)
```
> **Padrão:** `dev` é a **branch** de integração, o que vem antes da `main`. **homolog** é o **ambiente** publicado a partir dela — nome de ambiente, nunca de branch. "Mergeei na dev" = integrado; "está em homolog" = no ar. Uma branch remota *chamada* `homolog` que nenhum PR mira é legado, não integração.

## 2 — → branch: o modo do setup decide

O que acontece depois vem do **§ Branch do `/setup`** — a lógica mora lá, aqui só se aplica:

| `Trabalho:` no setup | Ação | Branch de trabalho |
|---|---|---|
| `branch por card` | `git checkout -b <nome>` a partir da integração limpa (branch já existe → `checkout` nela **e § 5**: o próprio remoto, depois a integração); `git branch --show-current` confirma | a feature branch |
| `branch acumula cards` | `$partida` é um **lote aberto** (§ 3) → `git checkout $partida` **e § 5** (o próprio remoto, depois a integração — o card entra nela); senão → `git checkout -b <nome>`, como em `branch por card` | a branch do lote |
| `direto na integração` | nenhum `checkout -b` | a própria integração, já sincronizada |

## 3 — Lote aberto

**Lote aberto** = `$partida` não é a integração, tem key no nome, e **nenhum PR dela foi mergeado ou fechado** (`gh pr list --head $partida --state merged --json number` e `--state closed` vazios). PR mergeado encerra o lote: o próximo card nasce em branch nova. Branch sem PR ainda também é lote aberto.

Os cards do lote **não são anotados em lugar nenhum**: são os commits da branch desde a integração (subject + trailer `Jira:`, sem merges) — a mesma derivação que o `/pull-request` usa para o título e o `## Cards`. É isso que sai em `lote.cards[]` para o report de quem chamou.

## 4 — Nome da branch

O padrão `Nome:` do setup, com `<key>`/`<n>`/`<slug>` do card — a **caixa do placeholder é a do nome** (`<key>-<n>` → `niv-12`; `<KEY>-<n>` → `AV-2192`; `-slug` curto, se o padrão tiver). Em `branch acumula cards` o nome é o do **1º card e não muda**: os cards do lote são os **commits** da branch — cada um com a key do **seu** card (o Step 10 do `/method` a põe no commit, com a key que quem chamou passou como argumento) — e é deles que o `/pull-request` deriva o título e o `## Cards` do PR. Renomear a branch a cada card não linka nada no Jira (o parser exige a key completa: em `AV-2192-2218` ele lê só `AV-2192`) e quebra preview URL, clone e worktree.

## 5 — Manter a branch atualizada (gh → branch → integração)

`branch por card` e `branch acumula cards`: a branch de trabalho nunca fica atrás de **nenhum** dos dois remotos que a alimentam — o dela e o da integração —, nesta ordem:

```bash
git fetch origin
git rev-parse -q --verify origin/<branch> >/dev/null && git merge origin/<branch>   # gh → branch: o que só existe no origin (outra máquina, sugestão aceita no PR); sem remoto ainda → pula sozinho
git merge origin/<integração>                                                        # gh → integração: a base andou
```

CONFLITO em qualquer um → resolver entendendo os 2 lados (nunca `--ours`/`--theirs` cego, nunca rebase, nunca force); o `/method` revê e testa o resultado integrado. Sentido único `origin → local`: este motor **não pusha** — o push é o passo 1 do `/pull-request`. Roda ao entrar numa branch que já existe (§ 2), ao entrar num lote aberto (§ 3), quando quem chamou **retoma** um card (modo CONTINUE: já na branch do registro, sincroniza antes de seguir) e se `origin/<integração>` andar durante o trabalho.

## 6 — Override de sessão

Pedido explícito nesta sessão ("hoje quero branch" num repo `direto`) vence **para esta invocação** e não reescreve o setup — `origem: override de sessão` na saída. Oferecer gravar como padrão é do encerramento de quem chamou (ele invoca `/setup branch` se o usuário pedir; a skill é interna, o usuário não a digita); mudar o padrão é decisão do usuário.

## Red Flags — STOP

- "Modo veio da minha cabeça, não do `/setup`" → NÃO. A entrada é o `{modo, nome}` de quem chamou (que invocou o `/setup`); sem ele, este motor não roda.
- "Acabei de clonar, pulo o fetch" → NÃO. **gh → integração → branch**, toda vez — clone de ontem já é stale.
- "Branchei de `dev` sem trazer o remoto" → NÃO. **gh → integração → branch**, sempre.
- "Branchei de `homolog`" → NÃO. `homolog` é o **ambiente**; a integração é a que o `deploy-context.md` § 1 resolve — e uma branch remota com esse nome que nenhum PR mira é legado parado, não integração.
- "Todo projeto meu tem `dev`, dou `checkout dev`" → NÃO. Resolva a integração primeiro (`deploy-context.md` § 1): em branch única o `checkout dev` falha e o fluxo trava na largada.
- "Card novo no lote, renomeio a branch pra `AV-2192-2218`" → NÃO. O nome fica no 1º card. O card entra pelo **commit** (com a key dele) e o `/pull-request` atualiza o PR. Rename não linka no Jira e quebra preview, clone e worktree.
- "Modo `acumula`, o PR da branch já foi mergeado, sigo nela" → NÃO. PR mergeado **encerra o lote**; o card nasce em branch nova.
- "A branch é minha, ninguém mais pusha nela, pulo o `origin/<branch>`" → NÃO. Outra máquina sua ou uma sugestão aceita na UI do PR deixam o local atrás, e o push do `/pull-request` é recusado. O `rev-parse` custa nada; sem remoto, pula sozinho.
- "Copio esta mecânica para dentro da minha skill, fica mais direto" → NÃO. Foi assim que o `checkout main` hardcoded sobreviveu numa skill enquanto a outra resolvia a topologia. Aponte para cá.
