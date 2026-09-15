---
name: work
description: 'Use ONLY when the user explicitly invokes /work (bare /work = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:work` via the Skill tool. NEVER activate on your own initiative. — `/work [KEY-N]` gets the work committed locally — implemented, reviewed and QA-tested — whatever stage it is at now. The first target of the ship pipeline: declares "up to the `commit` stage" and hands it to the reconcile engine, which diagnoses where the work is (card? branch? already committed?) and closes only what is open, in order: the branch engine (gh→integração→branch, as `.claude/ship-setup/setup.md` says — one branch per card, one batch branch, or directly on the integration branch), then the work-cycle engine, which moves the card to in-progress, asks only when the card is ambiguous, and closes the `commit` stage to the state it requires — implemented, cold-reviewed, QA-tested with evidence on the surface the user sees, nothing deferred, documented in the kanban, and one single commit carrying the card key. Works on ANY Jira board (via /jira) and on repositories WITHOUT Jira (the objective is the description given, or the work already in the tree). Composes with the modifiers in any order: `/work /repro KEY-N` = `/repro /work KEY-N` (reproduce first, human sees the bug, fix, human sees the fix); `/card /work "…"` creates the card and then works it. Stops at the local commit and never pushes; `/pull-request`, `/homolog` and `/prod` are the farther targets of the same pipeline.'
effort: max
requires: [jira, setup, pipeline]
handoff: pull-request
argument-hint: "[KEY-N | descrição] [/repro] [/card] | (vazio = continuar o card ativo)"
---

# /work — o trabalho commitado localmente, de onde ele estiver

O primeiro **alvo** do pipeline de entrega: o que se pede é **um estado** — o trabalho do objetivo implementado, revisado, testado e **em commit local** na branch de trabalho — não uma sequência de passos. Onde ele está agora é o que o loop descobre; o que falta é o que o loop fecha. O nível é o do `pipeline/SKILL.md` § nivel — a referência #1 do domínio como piso.

> 🚫 NÃO faz push, NÃO abre PR, NÃO mergeia. A faixa deste alvo termina no estágio `commit`. Os alvos seguintes da mesma escada são `/pull-request` → `/homolog` → `/prod` — cada um leva o trabalho **de onde estiver** até o próprio estágio.

## Ordem de Operações ao Ativar

**ANTES de tudo — a régua.** Leia `pipeline/SKILL.md § nivel` e mire o nível que ele declara: a **referência #1 deste domínio**, nomeada, é o **piso** — não o "bom o suficiente". Se a base atual não chega lá, refazer **no lugar** é decisão válida. Depois disso, o Step 0.

## Iron Law

> **Precisão > tokens > velocidade.** Mire o nível do `pipeline/SKILL.md` § nivel. "É simples, pulo" = a violação.
> Os princípios (**SOLID · DRY · KISS · YAGNI · LoD · Motores**), a **refatoração do perímetro** e o **design** (quando tem tela) são cobrados no estado que fecha o estágio `commit` (`pipeline/SKILL.md` § work-cycle, § 4). Card "pequeno" não relaxa nenhum deles.
>
> **O alvo é estado, não etapa.** `/work` num card já commitado é gap zero, dito com a evidência. `/work` num card sem branch cria a branch, entende, implementa e commita — sem mandar ninguém "rodar outra coisa antes".

## Argument parsing

`pipeline/SKILL.md` § composicao (`pipeline/SKILL.md` § composicao) primeiro: o argumento pode trazer um **modificador** (`/repro`, `/card`) ou um **alvo mais distante** (`/pull-request`, `/homolog`, `/prod`).

| Arg | O que acontece |
|---|---|
| `KEY-N` (ou URL do card) | objetivo = o card, em **qualquer** projeto |
| `<descrição>` sem key | objetivo = o trabalho descrito — projeto sem Jira, ou trabalho sem card |
| vazio | CONTINUE: objetivo = o card/trabalho da branch atual (`docs/jira/todo/*.md` cuja `branch:` é a atual, ou o feature em `kanban/08-implementation/`); nenhum → "Nenhum trabalho ativo. Use `/work KEY-N` ou `/work <descrição>`" |
| `… /repro` | funde: o estágio `reprodução` entra antes do `commit`, com as duas paradas humanas |
| `… /card` | funde: o estágio `card` entra antes de `branch` — o card é criado e vira o objetivo |
| `… /pull-request` · `/homolog` · `/prod` | vence o mais distante: `Skill(skill: "<ele>", args: "<o resto>")` e este alvo **não roda** |

## Convenções (CONTRATO)

- **Qualquer projeto** do Atlassian, via `mcp__atlassian__*`. A key sai do argumento ou da **memória do projeto** — nada hardcoded. **Sem Jira** (`/setup` § Jira `Rastreamento` ≠ Jira) o pipeline roda inteiro sem card.
- **Board e estrutura do Jira vêm do `/jira`**; **modo de trabalho e nome da branch vêm do `/setup`** § Branch (`branch por card` · `branch acumula cards` · `direto na integração`) — Step 0, dependências obrigatórias, lidas a **cada** invocação. Pedido explícito na sessão ("hoje quero branch") vence para esta invocação e não reescreve o arquivo; a saída oferece `/setup branch` se for pra virar padrão.
- **A branch nasce no estágio `branch`** (`pipeline/SKILL.md` § branch), antes de qualquer código; **`<integração>` é detectada** (`pipeline/SKILL.md` § deploy-context, passo 1), nunca assumida. Fechar o estágio `commit` **nunca cria branch**.
- **Status e comentário no card são do `jira-sync`**, que lê o `jira.md` do projeto — nunca inventados aqui.

<HARD-GATE>
1. **Diagnóstico publicado antes de qualquer ação** — a faixa inteira (`card?` → `branch` → `reprodução?` → `commit`), estágio a estágio, com a evidência.
2. NÃO commite sem o estado exigido — o `work-cycle` (§ 4) declara o que tem de estar fechado. Código sem review frio e sem QA registrados não vira commit.
3. NÃO pushe. A faixa termina em `commit`.
4. NÃO crie card por iniciativa própria. O estágio `card` só existe com `/card` composto.
5. NÃO mande o usuário "rodar outra skill antes": estágio aberto é gap que o loop fecha.
</HARD-GATE>

---

## Step 0 — Jira, convenções, contexto e composição

1. **Invoque o `/jira`** — via **Skill tool** (`furi-ship:jira`; a forma curta `jira` também resolve). Chamada real, não "seguir de memória": sem a invocação, o passo não aconteceu. Devolve `{rastreamento, site, key, boardId, boardName, url, estrutura, origem}` — com `rastreamento ≠ Jira`, devolve isso e o pipeline segue sem card.
2. **Invoque o `/setup`** — via **Skill tool** (`furi-ship:setup`; a forma curta `setup` também resolve). Devolve `{branch: {modo, nome}, commit, pr, jira: {rastreamento, …}, infra, guidelines, origem, arquivo}` — o `pipeline/SKILL.md` § branch usa `branch`; quem fecha o estágio `commit` usa `commit`. Duas invocações separadas, cada uma com a sua pergunta isolada (uma vez na vida do repositório).
3. **`pipeline/SKILL.md` § deploy-context, passo 1** — `<integração>` detectada (e o `deploy.md` lido, se existir).
4. **`pipeline/SKILL.md` § composicao** — o alvo efetivo: estágios e paradas dos modificadores presentes, o verbo tirado do argumento, o objetivo limpo.

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

Entregue ao **`pipeline/SKILL.md` § reconcile**, que faz o resto: publica o diagnóstico da faixa **antes** de agir, fecha os estágios abertos na ordem — `card` (`/card`, só se composto) → `branch` (`pipeline/SKILL.md` § branch) → `reprodução` (`/repro`, só se composto) → `commit` (`pipeline/SKILL.md` § work-cycle) — re-diagnostica a cada um, e para no `commit`.

Os motores são as seções `§ <motor>` do `pipeline/SKILL.md`. **Não reimplemente nenhum aqui** — se uma regra do ciclo de trabalho precisar mudar, ela muda no motor, para os quatro alvos de uma vez. O `work-cycle` declara **o estado** que o estágio `commit` exige (§ 4) e retoma do que já existe quando a QA ficou pendente.

## Saída

```
✅ /work <KEY-N | objetivo> — commitado localmente (implementado, revisado, testado)
   Diagnóstico: <N> estágios · <n> já fechados · <m> fechados agora  [paradas: <repro: 2 | nenhuma>]
   Projeto: <KEY> · Board: <nome> [memória | argumento]   |   sem Jira (Rastreamento: <x>)
   Setup:   <branch por card | branch acumula cards | direto na integração> [arquivo | criado agora | override de sessão]
   Branch:  <branch>  [feature branch | lote: <n> cards — <keys, dos commits> | direto na integração]
   Commit:  <hash>
   Kanban:  kanban/12-done/<feature>.md
   Jira:    <em andamento (transição) | — sem Jira>
   Próximo: /pull-request (push + PR) · /homolog · /prod — cada um leva daqui até o próprio estágio
```

Houve override de sessão no estágio `branch`? Uma linha a mais, **oferecendo** — nunca gravando: *"Hoje foi `<modo>`; quer que vire o padrão deste repositório?"* — um "sim" e você invoca `/setup branch`.

**Gap zero** (já estava commitado): `✅ /work KEY-N — já commitado: <hash> em <branch>, kanban/12-done/<feature>.md tests: passed. Nada a fazer. Próximo: /pull-request.`

**Estágio que resistiu** (parada sem resposta, estado que não convergiu em ~3 passadas): `⚠️ /work KEY-N — parou em <estágio>: <por quê> · Destrava: <o quê>`.

## Red Flags — STOP

- "Descobri/perguntei o board direto aqui" → NÃO. Step 0 é o `/jira`; ele é o único dono da memória e da estrutura.
- "Pulei o Step 0 porque já sei o board/setup desta sessão" → NÃO. Mencionar não é invocar; a leitura é **toda** invocação.
- "Assumi que crio branch (é o fluxo dos devs)" / "assumi que trabalho direto (é o meu repo)" → NÃO. O modo vem do **`/setup`** § Branch. Sem arquivo, o `/setup` pergunta — uma vez na vida do repositório.
- "O usuário pediu branch hoje, atualizei o `.claude/ship-setup/setup.md`" → NÃO. Override de sessão vale pra invocação. Só `/setup branch` reescreve.
- "Comecei a implementar, a branch eu vejo depois" → NÃO. O diagnóstico vem primeiro; `branch` fecha antes de `commit`, e fechar o `commit` nunca cria branch.
- "Resolvi a branch de cabeça (`checkout dev`, `checkout main`, renomeei o lote)" → NÃO. É o motor `pipeline/SKILL.md` § branch: integração pela topologia, modo pelo `/setup`, lote pelos PRs.
- "Já está commitado, mas refaço o ciclo pra garantir" → NÃO. Gap zero se declara com a evidência; não se refaz.
- "Não tem card, então não dá pra trabalhar" → NÃO. Sem Jira o objetivo é a descrição ou o que está na árvore. Nem tudo tem card.
- "Não tem card, então crio um" → NÃO. Só com `/card` composto. O pipeline nunca cria card sozinho.
- "`/work /repro`, então rodo o `/repro` inteiro antes" → NÃO. É **um** loop: o estágio `reprodução` e a parada entram na faixa deste alvo (`pipeline/SKILL.md` § composicao).
- "Digitaram `/work /prod`, faço o `/work` e aviso" → NÃO. Vence o mais distante: delega ao `/prod` e não roda.
- "Já conheço o `/jira` / o `/setup`, sigo sem invocar" → NÃO. Skill entra pelo Skill tool, **toda** vez.
- "Terminei, já abro o PR / dou push" → NÃO. `/work` para no **commit local**. Push é a faixa do `/pull-request`.
- "Copio as regras do `work-cycle` pra dentro daqui, fica mais direto" → NÃO. Vivem no motor, para os quatro alvos. Divergência aqui é a duplicação renascendo.
