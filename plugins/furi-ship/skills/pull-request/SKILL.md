---
name: pull-request
description: 'Use when user invokes /pull-request to publish the current branch: push it and open — or update — the GitHub pull request targeting the integration branch (`dev`, or `main` on a single-branch repo — detected, never assumed). Reads the team conventions via /setup (`.claude/ship-setup/setup.md`: whether this repo opens PRs at all, the PR template, where the card key goes in the title). `Abre PR: não` ⇒ pushes and mirrors to Jira without creating a PR. A PR already open for the branch ⇒ updates it (title and `## Cards` derived from the branch commits) instead of failing on a second create. Creates the PR with a 3-layer body (plain-language "O que foi feito" anyone understands + technical Summary/Solução for the reviewer and AI + DevOps notes + Como testar), mirrors the plain-language summary to EVERY Jira card in the branch on the board recorded in project memory via /jira-board (comment + status transition), and promotes the kanban card 10-done → 11-ship. Requires the work to be already committed (via /work). Never targets main when dev exists — production is /prod.'
effort: max
requires: [jira-board, setup]
handoff: homolog
boundary: prod
argument-hint: "(nenhum — usa a branch atual)"
---

# /pull-request — Publicar a branch: abrir ou atualizar o PR (feature branch → integração)

Sobe a branch atual e abre o PR no GitHub **mirando a integração** — ou **atualiza** o PR que já está aberto para ela — com uma descrição que serve **três leitores ao mesmo tempo** (pessoa leiga, reviewer/IA, devops) e espelha o resumo em **cada** card do Jira que a branch carrega. É a **porta única de publicar**: em repositório que não usa PR (§ PR `Abre PR: não`) ela pusha, espelha e não cria PR — o comando é o mesmo, a política decide.

> Pré-requisito: o trabalho já está **commitado** (Step 10 do `/method`, via `/work`). `/pull-request` **não** implementa nem commita feature nova — só publica o que já passou.

## Iron Law
> **Precisão > tokens.** Um PR mal descrito custa caro no review e no deploy. A descrição **é parte da entrega**, não enfeite.

## Convenções (CONTRATO)
- **Base do PR = a branch de integração, resolvida pela TOPOLOGIA — nunca assumida:** `prod/references/deploy-context.md` § 1 (base dos PRs recentes → `dev` → default do GitHub; branch parada que nenhum PR mira não conta).
  | Topologia | Base do PR |
  |---|---|
  | `dev` **e** `main` em `origin` | **`dev`**. Nunca `main` — produção é o `/prod` |
  | só `main` (branch única) | **`main`** — é a única integração que existe |

  > **Padrão:** `dev` é a **branch** de integração. **homolog** é o **ambiente** publicado a partir dela — não é base de PR, é onde a mudança aparece depois do merge. Uma branch remota *chamada* `homolog` que nenhum PR mira é legado, não base.
- **Os cards da branch vêm dos commits, nunca do nome da branch.** Num lote (`branch acumula cards`) o nome é só o do 1º card; cada card entrou pelo próprio commit, com a própria key (Step 10 do `/method`). É essa lista que faz o título, o `## Cards` e o espelho no Jira — a mesma para criar e para atualizar.
- **Board:** o da **memória do projeto** — vem do `/jira-board` (passo 0), nunca hardcoded. Via `mcp__atlassian__*`.
- **Convenções do time:** vêm do `/setup` (passo 0), que lê `.claude/ship-setup/setup.md` — **§ PR** (`Abre PR`, `Template`) e **§ Commit** (onde a key entra no título). `Abre PR: não` ⇒ este repositório não usa PR: esta skill **pusha**, espelha no Jira e **pula só o passo 3**. `Aprovação` e `Merge` são lidos por quem mergeia (`/homolog`/`/prod`), não aqui.
- **Idempotente.** Roda de novo na mesma branch a cada card do lote: PR aberto → **atualiza**; nenhum → cria. Nunca um segundo `create` (o GitHub recusa dois PRs da mesma head, e um PR novo perderia o review do aberto).
- Remote = `origin`. O repositório vem do próprio checkout (`gh repo view --json nameWithOwner -q .nameWithOwner`) — não hardcodar.

## Guard — onde estou? (ANTES de tudo, DEPOIS do passo 0)
```bash
git branch --show-current
git status                 # working tree limpo; commit do /method presente
```
- Branch atual = a **própria branch de integração** (`dev`, ou `main` em branch única) **e** § PR `Abre PR: sim` → **PARAR.** Avisar: *"/pull-request é pra feature branch → integração. Você já está nela; para levar ao ar use o `/homolog` (ou o `/prod`, se for produção)."* Não abrir PR. Com `Abre PR: não` (trabalho `direto na integração`) estar nela é o esperado: o push do passo 1 é nela — seguir.
- Branch = feature → seguir. `Abre PR: não` não é motivo de parada: é motivo de **pular o passo 3**.
- Working tree sujo / sem commit da feature → **PARAR** e mandar fechar no `/work` (`/method` até o Step 10) antes.
- **Branch atualizada com a integração?**
  ```bash
  git fetch origin
  git merge-base --is-ancestor origin/<integração> HEAD && echo "✓ contém a integração atual" || echo "✗ ATRÁS da integração"
  ```
  `✗` (a integração andou desde o `/work`) → **PARAR** e mandar rodar `/work` de novo pra integrar `origin/<integração>` (merge + resolver conflitos) e **re-testar** — `/pull-request` publica só o que já passou, não resolve conflito não-testado.
- **Branch atualizada com o próprio remoto?** (`origin/<branch>` existe — outra máquina, sugestão aceita na UI do PR)
  ```bash
  git rev-parse -q --verify origin/<branch> >/dev/null && { git merge-base --is-ancestor origin/<branch> HEAD && echo "✓ contém origin/<branch>" || echo "✗ origin/<branch> tem commit que o local não tem"; }
  ```
  `✗` → **PARAR** e mandar rodar `/work` de novo (o motor `work/references/branch.md` § 5 traz `origin/<branch>` e re-testa) — o `git push` do passo 1 seria recusado, e `--force` não é caminho.

## Fluxo

### 0. Board do projeto (SEMPRE, antes de tudo)
**Invoque o `/jira-board`** — via **Skill tool** (`furi-ship:jira-board`; a forma curta `jira-board` também resolve). Chamada real, não "seguir de memória": sem a invocação, o passo não aconteceu. Dependência obrigatória: ele lê a memória do projeto e, se não houver board gravado, pergunta e grava. Devolve `{site, key, boardId, boardName, url, origem}`.

É de lá que sai a `<KEY>` usada no título do PR, no corpo, no comentário do card e no prefixo da branch. Nunca assuma o board nem pergunte por ele aqui.

**Depois, invoque o `/setup`** — via **Skill tool** (`furi-ship:setup`; a forma curta `setup` também resolve). Dependência obrigatória: lê `.claude/ship-setup/setup.md` e, se não existir, infere, pergunta o mínimo e grava. Daqui saem `Abre PR` (decide se o passo 3 roda), `Template` (decide o corpo no passo 3) e a posição da key (§ Commit — decide o título). Duas invocações separadas, cada uma com a sua pergunta isolada.

### 1. Push
```bash
git push -u origin <branch>
```
Sempre — inclusive com `Abre PR: não`: publicar é isto; o PR é o que vem depois, quando o repositório usa.

### 2. Levantar o contexto da entrega (não inventar)
- **Cards da branch** — dos **commits**, nunca do nome da branch (num lote, o nome é só o do 1º card):
  ```bash
  git log origin/<integração>..HEAD --no-merges --format='%s%n%(trailers:key=Jira,valueonly)' | grep -oE '[A-Z][A-Z0-9]+-[0-9]+' | sort -u
  ```
  Só o **subject** e o trailer `Jira:` — o corpo livre cita cards *relacionados*, não os do commit; `--no-merges` porque um merge da integração traz keys alheias. Nenhuma key em commit nenhum → a do nome da branch; nenhuma em lugar algum → publicação sem card (diga isso, não invente uma). Para cada key, `mcp__atlassian__jira_get_issue` → o título vai no `## Cards`.
- `git diff <integração>...<branch>` — o que realmente mudou.
- Docs do feature: `docs/01-problem` … `docs/05-test-cases` + `kanban/09-run-test` — de **cada** card do lote.
- Extrair daí: **o problema em linguagem leiga**, a **solução técnica**, os **TCs**, e o **impacto de deploy** (migrations? env novas? deps?).

### 3. Abrir ou atualizar o PR — corpo 3-em-1
**§ PR `Abre PR: não`** → **pule este passo inteiro** e siga para o 4: o push do passo 1 já publicou. Não crie PR "só desta vez" sem pedido explícito do usuário — mudar a convenção é `/setup pr`.

**Antes de criar, sempre** — esta skill roda de novo na mesma branch a cada card do lote:
```bash
gh pr list --head <branch> --base <integração> --state open --json number,url -q '.[0]'
```
| Resultado | Ação |
|---|---|
| vazio | `gh pr create` (abaixo) |
| PR aberto | `gh pr edit <n> --title "<título>" --body "<corpo>"` — o **mesmo** título e corpo abaixo, regenerados: `## Cards` e as keys do título vêm dos commits; `O que foi feito`, `Solução`, `Como testar` e `DevOps` absorvem o que o card novo mudou. **Nunca** um segundo `create` |

`--base` é a integração resolvida pela topologia (Convenções). O título leva **todas** as keys da branch (passo 2), em ordem crescente, na posição que o § Commit do setup mandar: no escopo (`<tipo>(<KEY>-<N>, <KEY>-<M>): …`, o default abaixo), no início (`<KEY>-<N> <tipo>: …`), no fim (`<tipo>(<escopo>): … (<KEY>-<N>, <KEY>-<M>)`) ou ausente (`<tipo>(<escopo>): …` — as keys ficam no trailer `Jira:` do corpo, que é sempre escrito). Um card só → uma key. Se o § PR `Template:` apontar um arquivo (ex.: `.github/pull_request_template.md`), o corpo segue **as seções dele** — preenchidas, não deixadas em branco — e as 3 camadas daqui entram dentro delas (o `## O que foi feito` leigo e o `## Cards` são obrigatórios em qualquer template).
```bash
gh pr create --base <integração> --title "<tipo>(<KEY>-<N>, <KEY>-<M>): <título conciso>" --body "$(cat <<'EOF'
## O que foi feito
[Linguagem simples, ZERO jargão — qualquer pessoa, de qualquer idade ou nível de
conhecimento, entende o problema que existia e o que mudou. Concreto, com antes/depois.
Ex.: "Quando o paciente tentava agendar sem ter crédito, a tela travava. Agora aparece
um aviso claro e o paciente é levado direto pra tela de comprar crédito."]

## Cards
- <KEY>-<N> — <título do card no Jira>
- <KEY>-<M> — <título do card no Jira>

---

## Summary (técnico)
- [o que foi feito + abordagem]
- [decisões relevantes / trade-offs]

## Solução
[Descrição técnica da implementação — pro reviewer e pra IA lerem e entenderem o diff.]

## Como testar
- [ ] TC-1: [passo + resultado esperado]
- [ ] TC-N: ...

## DevOps
- [ ] Migrations: [sim — qual / não]
- [ ] Variáveis de ambiente novas: [listar / nenhuma]
- [ ] Dependências novas: [listar / nenhuma]
- [ ] Passos de deploy fora do padrão: [listar / nenhum]

Jira: <KEY>-<N>, <KEY>-<M>
🤖 Generated with Claude Code
EOF
)"
```
> A seção **"O que foi feito"** é a MESMA que vai pro Jira (passo 4). Escreva uma vez, use nos dois.

### 4. Espelhar em cada card do Jira
Para **cada** card do passo 2 — não só o do nome da branch. Comentário — `mcp__atlassian__jira_add_comment` (`issue_key: <KEY>-<N>`):
```
## O que foi feito
[a MESMA descrição leiga do PR]

---
PR: <URL>                      ← sem PR (Abre PR: não): "Publicado em: <branch> @ <hash>"
Branch: <branch>
Status: Em revisão
```
PR **atualizado** (não criado): comenta só nos cards que **ainda não têm** o comentário desta skill — os anteriores já receberam o deles quando entraram.

Transição de status — mover o card para o status **equivalente a "em revisão"** no workflow daquele projeto. A mecânica (descobrir a transição, aplicar, e o que fazer se o workflow não tiver equivalente) é do **`prod/references/jira-sync.md`**, fonte única — siga-o, não o reescreva aqui.

### 5. Promover o kanban
```bash
mv kanban/10-done/<feature>.md kanban/11-ship/<feature>.md
```
Atualizar frontmatter:
```yaml
pr: <URL do PR>                # sem PR: "— (push em <branch>)"
status: in-review
```
> O feature **não estava** em `kanban/10-done/`? É sinal de QA não rodada (parou no `/fast`). Não bloquear o PR aqui — anotar e deixar o **gate de QA do `/homolog`** resolver.

### 6. Reportar
```
## ✅ <PR aberto | PR atualizado | Publicado sem PR> — <KEY>-<N>[, <KEY>-<M>]
- PR:     <URL>   (base: <integração>)        ← sem PR: "— (§ PR `Abre PR: não` — push em <branch> @ <hash>)"
- Branch: <branch>   [<n> cards, dos commits]
- Jira:   Em revisão em cada card (comentário + transição)
- Kanban: kanban/11-ship/<feature>.md
- Próximo: /homolog (review + gate de QA + merge + deploy + verificação no ar) — ou /prod, em branch única
```

## Red Flags — STOP
- "Assumi o board de sempre / o do outro repositório" → NÃO. Skill não tem board padrão. O board é o da **memória deste repositório**, via `/jira-board`.
- "Descobri/perguntei o board direto aqui" → NÃO. Passo 0 é o `/jira-board`; ele é o único dono da memória do projeto. Skill que pergunta o board por conta própria pergunta de novo amanhã.
- "Pulei o passo 0 porque já sei o board desta sessão" → NÃO. A leitura da memória é **toda** invocação.
- "Já conheço o `/jira-board` / o `/setup`, sigo sem invocar" → NÃO. Mencionar não é invocar: a skill entra pelo Skill tool, **toda** vez.
- "O setup diz `Abre PR: não`, mas abro assim mesmo — é mais seguro" → NÃO. Convenção do time é contrato. Pushe, espelhe, **não crie PR**; mudar é `/setup pr`, não é aqui.
- "`Abre PR: não`, então nem pusho" → NÃO. O push é o passo 1, **sempre**. O que o `não` pula é o passo 3.
- "Já tem PR aberto pra essa branch, crio outro" → NÃO. `gh pr edit` no aberto. O GitHub recusa a segunda head, e o review já está lá.
- "Tirei a key do nome da branch" → NÃO. As keys vêm dos **commits**. Num lote o nome é só o 1º card — título, `## Cards` e Jira sairiam com um card só.
- "Comentei só no card do nome da branch" → NÃO. **Cada** card do lote recebe comentário e transição.
- "Ignorei o template de PR do repo e usei o meu" → NÃO. § PR `Template:` aponta um arquivo → o corpo segue as seções dele. As 3 camadas entram **dentro**.
- "Abro o PR contra `main`" → NÃO, havendo `dev`. Base é a **integração** (`dev`); `main` é via `/prod`, com OK explícito. Em branch única, `main` **é** a integração — aí é a base certa.
- "Abro o PR contra `homolog`" → NÃO. `homolog` é o **ambiente**; a base é a integração que o `deploy-context.md` § 1 resolve — uma branch remota com esse nome que nenhum PR mira é legado parado.
- "Todo projeto meu tem `dev`, abro contra ela" → NÃO. Resolva a integração primeiro (`deploy-context.md` § 1): em branch única não existe `origin/dev`, e o PR não tem para onde ir.
- "Estou em `dev`, abro o PR mesmo assim" → NÃO, com `Abre PR: sim`. `/pull-request` é pra feature branch; pare e oriente pro `/homolog`. Com `Abre PR: não` (trabalho direto), estar na integração é o esperado — pusha e segue.
- "Descrição técnica já basta" → NÃO. As **3 camadas** (leigo + técnico + DevOps) são obrigatórias.
- "Escrevo só 'corrige bug' em 'O que foi feito'" → NÃO. Tem que ser entendível por qualquer pessoa, com antes/depois concreto.
- "Pulo o espelhamento no Jira" → NÃO. PR e card andam juntos (descrição + transição).
- "Commito um ajuste rápido antes do push" → se precisa de código novo, volte pro `/work` (`/method` com re-review). `/pull-request` só publica o que já passou.
- "Push recusado (non-fast-forward), dou `--force`" → NÃO. `origin/<branch>` tem o que o local não tem: `/work` de novo (`work/references/branch.md` § 5), depois volta aqui.
