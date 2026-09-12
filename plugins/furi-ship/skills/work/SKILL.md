---
name: work
description: 'Use when user invokes /work [KEY-N] to get the work committed locally — implemented, reviewed and QA-tested — whatever stage it is at now. The first target of the ship pipeline: declares "up to the `commit` stage" and hands it to the reconcile engine, which diagnoses where the work is (card? branch? already committed?) and closes only what is open, in order: the branch engine (gh→integração→branch, as `.claude/ship-setup/setup.md` says — one branch per card, one batch branch, or directly on the integration branch), then the work-cycle engine, which moves the card to in-progress, asks only when the card is ambiguous, and runs /method (which invokes /solve) with the card key. Works on ANY Jira board (via /jira) and on repositories WITHOUT Jira (the objective is the description given, or the work already in the tree). Composes with the modifiers in any order: `/work /repro KEY-N` = `/repro /work KEY-N` (reproduce first, human sees the bug, fix, human sees the fix); `/card /work "…"` creates the card and then works it. Stops at the local commit and never pushes; `/pull-request`, `/homolog` and `/prod` are the farther targets of the same pipeline.'
effort: max
requires: [jira, setup, pipeline, method, solve]
handoff: pull-request
argument-hint: "[KEY-N | descrição] [/repro] [/card] | (vazio = continuar o card ativo)"
---

# /work — o trabalho commitado localmente, de onde ele estiver

O primeiro **alvo** do pipeline de entrega: o que se pede é **um estado** — o trabalho do objetivo implementado, revisado, testado e **em commit local** na branch de trabalho — não uma sequência de passos. Onde ele está agora é o que o loop descobre; o que falta é o que o loop fecha. **10x acima da referência #1 do mercado**: carrega o `/solve` na ativação e o `/method` (via `work-cycle`) o recarrega.

> 🚫 NÃO faz push, NÃO abre PR, NÃO mergeia. A faixa deste alvo termina no estágio `commit`. Os alvos seguintes da mesma escada são `/pull-request` → `/homolog` → `/prod` — cada um leva o trabalho **de onde estiver** até o próprio estágio.

## Ordem de Operações ao Ativar

**ANTES de tudo — invoque o `/solve`.** Toda vez que o `/work` for ativado, a PRIMEIRA ação é **invocar o `/solve` via Skill tool** (`furi-build:solve`; a forma curta `solve` também resolve) para carregar o padrão — **10x acima da referência #1 do mercado**. Chamada real, não "seguir de memória": sem a invocação, o passo não aconteceu. Depois disso, o Step 0.

## Iron Law

> **Precisão > tokens > velocidade.** Mire **10x acima da referência #1 do mercado** (padrão do `/solve`). "É simples, pulo" = a violação.
> Os princípios (**SOLID · DRY · KISS · YAGNI · LoD · Motores**), a **refatoração contínua** e o **design** (quando tem tela) valem em **todos** os steps — doutrina em `plugins/furi-build/skills/principles/SKILL.md`, lente por step nos references do `/method` (pacote `furi-build`, carregados pelo `/method` que o `work-cycle` invoca). Card "pequeno" não relaxa nenhum deles.
>
> **O alvo é estado, não etapa.** `/work` num card já commitado é gap zero, dito com a evidência. `/work` num card sem branch cria a branch, entende, implementa e commita — sem mandar ninguém "rodar outra coisa antes".

## Argument parsing

`composicao.md` (`pipeline/references/composicao.md`) primeiro: o argumento pode trazer um **modificador** (`/repro`, `/card`) ou um **alvo mais distante** (`/pull-request`, `/homolog`, `/prod`).

| Arg | O que acontece |
|---|---|
| `KEY-N` (ou URL do card) | objetivo = o card, em **qualquer** projeto |
| `<descrição>` sem key | objetivo = o trabalho descrito — projeto sem Jira, ou trabalho sem card |
| vazio | CONTINUE: objetivo = o card/trabalho da branch atual (`docs/jira/todo/*.md` cuja `branch:` é a atual, ou o feature em `kanban/07-implementation/`); nenhum → "Nenhum trabalho ativo. Use `/work KEY-N` ou `/work <descrição>`" |
| `… /repro` | funde: o estágio `reprodução` entra antes do `commit`, com as duas paradas humanas |
| `… /card` | funde: o estágio `card` entra antes de `branch` — o card é criado e vira o objetivo |
| `… /pull-request` · `/homolog` · `/prod` | vence o mais distante: `Skill(skill: "<ele>", args: "<o resto>")` e este alvo **não roda** |

## Convenções (CONTRATO)

- **Qualquer projeto** do Atlassian, via `mcp__atlassian__*`. A key sai do argumento ou da **memória do projeto** — nada hardcoded. **Sem Jira** (`/setup` § Jira `Rastreamento` ≠ Jira) o pipeline roda inteiro sem card.
- **Board e estrutura do Jira vêm do `/jira`**; **modo de trabalho e nome da branch vêm do `/setup`** § Branch (`branch por card` · `branch acumula cards` · `direto na integração`) — Step 0, dependências obrigatórias, lidas a **cada** invocação. Pedido explícito na sessão ("hoje quero branch") vence para esta invocação e não reescreve o arquivo; a saída oferece `/setup branch` se for pra virar padrão.
- **A branch nasce no estágio `branch`** (`pipeline/references/branch.md`), antes de qualquer código; **`<integração>` é detectada** (`pipeline/references/deploy-context.md` § 1), nunca assumida. O `/method` **nunca cria branch**.
- **Status e comentário no card são do `jira-sync`**, que lê o `jira.md` do projeto — nunca inventados aqui.

<HARD-GATE>
1. **Diagnóstico publicado antes de qualquer ação** — a faixa inteira (`card?` → `branch` → `reprodução?` → `commit`), estágio a estágio, com a evidência.
2. NÃO implemente fora do `/method` — o `work-cycle` o invoca via Skill tool, com o objetivo como argumento. Código sem review frio e sem QA não vira commit.
3. NÃO pushe. A faixa termina em `commit`.
4. NÃO crie card por iniciativa própria. O estágio `card` só existe com `/card` composto.
5. NÃO mande o usuário "rodar outra skill antes": estágio aberto é gap que o loop fecha.
</HARD-GATE>

---

## Step 0 — Jira, convenções, contexto e composição

1. **Invoque o `/jira`** — via **Skill tool** (`furi-ship:jira`; a forma curta `jira` também resolve). Chamada real, não "seguir de memória": sem a invocação, o passo não aconteceu. Devolve `{rastreamento, site, key, boardId, boardName, url, estrutura, origem}` — com `rastreamento ≠ Jira`, devolve isso e o pipeline segue sem card.
2. **Invoque o `/setup`** — via **Skill tool** (`furi-ship:setup`; a forma curta `setup` também resolve). Devolve `{branch: {modo, nome}, commit, pr, jira: {rastreamento, …}, infra, guidelines, origem, arquivo}` — o `branch.md` usa `branch`; o `/method` usa `commit`. Duas invocações separadas, cada uma com a sua pergunta isolada (uma vez na vida do repositório).
3. **`pipeline/references/deploy-context.md`** § 1 — `<integração>` detectada (e o `deploy.md` lido, se existir).
4. **`pipeline/references/composicao.md`** — o alvo efetivo: estágios e paradas dos modificadores presentes, o verbo tirado do argumento, o objetivo limpo.

## Step 1 — Declarar o alvo e entregar ao `reconcile`

```
alvo = {
  atéOEstágio:   commit
  ambiente:      —
  branch:        a de trabalho (modo do /setup § Branch, nome pelo branch.md)
  fonteDoDelta:  o objetivo (KEY-N · descrição · o que já está na árvore)
  gate:          —
  paradas:       [] ∪ as dos modificadores
}
```

Entregue ao **`pipeline/references/reconcile.md`**, que faz o resto: publica o diagnóstico da faixa **antes** de agir, fecha os estágios abertos na ordem — `card` (`/card`, só se composto) → `branch` (`branch.md`) → `reprodução` (`/repro`, só se composto) → `commit` (`work-cycle.md` → `/method`) — re-diagnostica a cada um, e para no `commit`.

Os motores vivem em `pipeline/references/`. **Não reimplemente nenhum aqui** — se uma regra do ciclo de trabalho precisar mudar, ela muda no motor, para os quatro alvos de uma vez. Na borda, o `work-cycle` invoca o **`/method`** (`furi-build:method`) e, quando a QA está pendente, o **`/todo`** (`furi-build:todo`) — via Skill tool, nunca reproduzidos de memória.

## Saída

```
✅ /work <KEY-N | objetivo> — commitado localmente (implementado, revisado, testado)
   Diagnóstico: <N> estágios · <n> já fechados · <m> fechados agora  [paradas: <repro: 2 | nenhuma>]
   Projeto: <KEY> · Board: <nome> [memória | argumento]   |   sem Jira (Rastreamento: <x>)
   Setup:   <branch por card | branch acumula cards | direto na integração> [arquivo | criado agora | override de sessão]
   Branch:  <branch>  [feature branch | lote: <n> cards — <keys, dos commits> | direto na integração]
   Commit:  <hash>
   Kanban:  kanban/10-done/<feature>.md
   Jira:    <em andamento (transição) | — sem Jira>
   Próximo: /pull-request (push + PR) · /homolog · /prod — cada um leva daqui até o próprio estágio
```

Houve override de sessão no estágio `branch`? Uma linha a mais, **oferecendo** — nunca gravando: *"Hoje foi `<modo>`; quer que vire o padrão deste repositório?"* — um "sim" e você invoca `/setup branch`.

**Gap zero** (já estava commitado): `✅ /work KEY-N — já commitado: <hash> em <branch>, kanban/10-done/<feature>.md tests: passed. Nada a fazer. Próximo: /pull-request.`

**Estágio que resistiu** (parada sem resposta, `/method` sem convergir): `⚠️ /work KEY-N — parou em <estágio>: <por quê> · Destrava: <o quê>`.

## Red Flags — STOP

- "Descobri/perguntei o board direto aqui" → NÃO. Step 0 é o `/jira`; ele é o único dono da memória e da estrutura.
- "Pulei o Step 0 porque já sei o board/setup desta sessão" → NÃO. Mencionar não é invocar; a leitura é **toda** invocação.
- "Assumi que crio branch (é o fluxo dos devs)" / "assumi que trabalho direto (é o meu repo)" → NÃO. O modo vem do **`/setup`** § Branch. Sem arquivo, o `/setup` pergunta — uma vez na vida do repositório.
- "O usuário pediu branch hoje, atualizei o `.claude/ship-setup/setup.md`" → NÃO. Override de sessão vale pra invocação. Só `/setup branch` reescreve.
- "Comecei pelo `/method`, a branch eu vejo depois" → NÃO. O diagnóstico vem primeiro; `branch` fecha antes de `commit`. O `/method` nunca cria branch.
- "Resolvi a branch de cabeça (`checkout dev`, `checkout main`, renomeei o lote)" → NÃO. É o motor `branch.md`: integração pela topologia, modo pelo `/setup`, lote pelos PRs.
- "Já está commitado, mas rodo o `/method` de novo pra garantir" → NÃO. Gap zero se declara com a evidência; não se refaz.
- "Não tem card, então não dá pra trabalhar" → NÃO. Sem Jira o objetivo é a descrição ou o que está na árvore. Nem tudo tem card.
- "Não tem card, então crio um" → NÃO. Só com `/card` composto. O pipeline nunca cria card sozinho.
- "`/work /repro`, então rodo o `/repro` inteiro antes" → NÃO. É **um** loop: o estágio `reprodução` e a parada entram na faixa deste alvo (`composicao.md`).
- "Digitaram `/work /prod`, faço o `/work` e aviso" → NÃO. Vence o mais distante: delega ao `/prod` e não roda.
- "Já conheço o `/solve` / o `/jira` / o `/setup` / o `/method`, sigo sem invocar" → NÃO. Skill entra pelo Skill tool, **toda** vez.
- "Terminei, já abro o PR / dou push" → NÃO. `/work` para no **commit local**. Push é a faixa do `/pull-request`.
- "Copio as regras do `work-cycle` pra dentro daqui, fica mais direto" → NÃO. Vivem no motor, para os quatro alvos. Divergência aqui é a duplicação renascendo.
