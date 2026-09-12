---
name: pull-request
description: 'Use when user invokes /pull-request to get the work published — pushed to origin and, when the repository uses PRs, with the pull request open or updated against the integration branch — whatever stage it is at now. The second target of the ship pipeline: declares "up to the `pr` stage" (or `push`, when `.claude/ship-setup/setup.md` says `Abre PR: não`) and hands it to the reconcile engine, which diagnoses where the work is and closes what is open in order — a missing branch or commit is closed by the branch and work-cycle engines (running /method), never by telling the user to run /work first; then the pr-publish engine pushes, creates or UPDATES the PR (never a second create for the same branch) with the 3-layer body (plain-language "O que foi feito" + technical Summary/Solução + DevOps + Como testar), with the card names clear in title, `## Cards` and comments, mirrors the plain-language summary to EVERY Jira card in the branch (comment + status transition, per the project jira.md), and promotes the kanban card 10-done → 11-ship. Base branch is DETECTED (`dev`, `develop`, `main`… — never assumed). Works without Jira. Composes with /repro and /card in any order. Never merges: /homolog and /prod are the farther targets.'
effort: max
requires: [jira, setup, pipeline]
handoff: homolog
boundary: prod
argument-hint: "[KEY-N | descrição] [/repro] [/card] | (vazio = a branch atual)"
---

# /pull-request — o trabalho publicado: push e PR, de onde ele estiver

O segundo **alvo** do pipeline: o estado pedido é **a branch em `origin`, com o PR aberto ou atualizado na integração** — ou só o push, quando o time não abre PR. Se o trabalho ainda não está commitado, o loop fecha isso antes (é o mesmo `work-cycle` do `/work`); se já está publicado, é gap zero.

> 🚫 NÃO mergeia, NÃO deploya. A faixa termina no estágio `pr` (ou `push`). Levar ao ar é `/homolog`; produção é `/prod`.

## Iron Law

> **Publicar é o objetivo; o PR é a forma que o time escolheu.** `Abre PR: sim` ⇒ push + PR; `Abre PR: não` ⇒ push, e pronto — o review acontece no diff da integração. Nos dois casos, **os cards ficam claros em tudo** (título, `## Cards`, comentário no Jira), e **os cards vêm dos commits, nunca do nome da branch**.
>
> **Idempotente.** Roda de novo na mesma branch a cada card do lote: PR aberto → atualiza. Nunca um segundo `create`.

## Argument parsing

`composicao.md` primeiro: o argumento pode trazer um **modificador** (`/repro`, `/card`) ou um **alvo mais distante** (`/homolog`, `/prod`) — ou `/work`, que perde para este.

| Arg | O que acontece |
|---|---|
| vazio | objetivo = a branch atual e o que ela carrega (cards dos commits) |
| `KEY-N` / `<descrição>` | objetivo = esse card/trabalho — se ainda não está commitado, o loop o leva até lá primeiro |
| `… /repro` · `/card` | funde os estágios e paradas do modificador |
| `… /homolog` · `/prod` | vence o mais distante: delega e este alvo **não roda** |

## Convenções (CONTRATO)

- **Base do PR = `<integração>` detectada** (`pipeline/references/deploy-context.md` § 1) — nunca assumida. Duas branches → `<integração>`; branch única → `<produção>` (= integração). **Nunca `main` quando existe `<integração>`.**
- **`Abre PR`, `Template` e a posição da key vêm do `/setup`** (§ PR, § Commit). **Board e estrutura do Jira vêm do `/jira`.** Step 0, a cada invocação.
- **Os cards da branch vêm dos commits** (`git log origin/<integração>..HEAD --no-merges`, subject + trailer `Jira:`). Num lote, o nome da branch é só o do 1º card.
- **Sem Jira** (`Rastreamento` ≠ Jira): publica sem card, `## Cards` diz isso, e o espelho é no-op declarado.

<HARD-GATE>
1. **Diagnóstico publicado antes de qualquer ação** — a faixa `card?` → `branch` → `reprodução?` → `commit` → `push` → `pr?`, com a evidência de cada estágio.
2. NÃO publique o que não está commitado pelo `/method` — estágio `commit` aberto é fechado pelo `work-cycle`, não por commit avulso.
3. NÃO resolva conflito com a integração aqui — é o estágio `branch` reaberto (`branch.md` § 5) e o `work-cycle` re-testa; publica-se só o que passou.
4. NÃO crie um segundo PR para a mesma branch. Aberto → `gh pr edit`.
5. NÃO mire `main` quando existe `<integração>`. Produção é `/prod`.
6. NÃO mande o usuário "rodar o `/work` antes": estágio aberto é gap que o loop fecha.
</HARD-GATE>

---

## Step 0 — Jira, convenções, contexto e composição

1. **Invoque o `/jira`** — via **Skill tool** (`furi-ship:jira`; a forma curta `jira` também resolve). Chamada real: sem a invocação, o passo não aconteceu. Devolve `{rastreamento, site, key, …, estrutura}` — é de lá que saem a `<KEY>` do título e do `## Cards`, e o status/comentário da etapa **publicado**.
2. **Invoque o `/setup`** — via **Skill tool** (`furi-ship:setup`; a forma curta `setup` também resolve). Daqui saem `Abre PR` (o estágio `pr` existe?), `Template` (o corpo) e a posição da key (§ Commit — o título). Duas invocações separadas, cada uma com a sua pergunta isolada.
3. **`pipeline/references/deploy-context.md`** § 1 — `<integração>` detectada; topologia.
4. **`pipeline/references/composicao.md`** — o alvo efetivo.

## Step 1 — Declarar o alvo e entregar ao `reconcile`

```
alvo = {
  atéOEstágio:   pr            # push, quando o /setup diz `Abre PR: não`
  ambiente:      —
  branch:        a de trabalho (base do PR = <integração>)
  fonteDoDelta:  commits locais fora de origin/<branch> · o objetivo, se ainda não commitado
  gate:          —
  paradas:       [] ∪ as dos modificadores
}
```

Entregue ao **`pipeline/references/reconcile.md`**: diagnóstico da faixa publicado, estágios fechados na ordem — os de trás (`branch`, `commit`) pelos motores deles se estiverem abertos; `push` e `pr` pelo **`pr-publish.md`** (push · contexto dos commits · PR criado ou atualizado com o corpo 3-em-1 · espelho em cada card via `jira-sync` · kanban `10-done → 11-ship`) — re-diagnóstico a cada um, e para em `pr`.

**Não reimplemente nenhum motor aqui.** A mecânica do PR (título, corpo, template, idempotência, espelho) mora no `pr-publish.md`, para os quatro alvos.

## Saída

```
## ✅ /pull-request — <PR aberto | PR atualizado | Publicado sem PR> — <KEY>-<N>[, <KEY>-<M>] | <objetivo sem card>
- Diagnóstico: <N> estágios · <n> já fechados · <m> fechados agora
- PR:     <URL>   (base: <integração>)        ← sem PR: "— (§ PR `Abre PR: não` — push em <branch> @ <hash>)"
- Branch: <branch>   [<n> cards, dos commits]
- Jira:   <status da etapa "publicado" em cada card (comentário + transição) | — sem Jira>
- Kanban: kanban/11-ship/<feature>.md
- Próximo: /homolog (review + QA + merge + deploy + verificação no ar) — ou /prod, em branch única
```

**Gap zero**: `✅ /pull-request — já publicado: PR #<n> aberto para <integração>, HEAD == origin/<branch>. Nada a fazer. Próximo: /homolog.`

**Estágio que resistiu**: `⚠️ /pull-request — parou em <estágio>: <por quê> · Destrava: <o quê>`.

## Red Flags — STOP

- "Working tree sujo, mando rodar o `/work` antes" → NÃO. **É esta a mudança.** Estágio `commit` aberto é gap que o loop fecha com o `work-cycle` (→ `/method`). Este alvo não devolve trabalho ao usuário.
- "A integração andou, resolvo o conflito e pusho" → NÃO. Conflito é código novo sem teste: estágio `branch` reaberto, `work-cycle` re-testa.
- "Assumi o board de sempre / o do outro repositório" → NÃO. O board é o da **memória deste repositório**, via `/jira`.
- "Já conheço o `/jira` / o `/setup`, sigo sem invocar" → NÃO. Skill entra pelo Skill tool, **toda** vez.
- "O setup diz `Abre PR: não`, mas abro assim mesmo — é mais seguro" → NÃO. Convenção do time é contrato. Mudar é `/setup pr`.
- "`Abre PR: não`, então nem pusho" → NÃO. O push é sempre. O que o `não` tira é o estágio `pr`.
- "Já tem PR aberto pra essa branch, crio outro" → NÃO. `gh pr edit` no aberto.
- "Estou na `<integração>` e abro PR dela pra ela mesma" → NÃO. Na integração com `Abre PR: sim` o alvo não faz sentido: diga e sugira `/homolog`/`/prod`. Com `Abre PR: não`, estar nela é o esperado.
- "Mirei `main` porque é a default" → NÃO. Base é `<integração>` detectada. `main` quando existe `dev` é produção — é `/prod`.
- "Os cards são os do nome da branch" → NÃO. São os dos **commits**.
- "Sem card, então sem PR" → NÃO. Publicação sem card é válida e é dita.
- "Comentei no Jira só no card do nome da branch" → NÃO. Em **cada** card dos commits, com o nome claro.
- "Digitaram `/pull-request /prod`, faço o PR e aviso" → NÃO. Vence o mais distante: delega ao `/prod`.
- "Copio o corpo do PR pra dentro daqui" → NÃO. Mora no `pr-publish.md`, para os quatro alvos.
