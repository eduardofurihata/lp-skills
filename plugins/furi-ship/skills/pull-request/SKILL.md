---
name: pull-request
description: 'Use when user invokes /pull-request to open a GitHub pull request for the current feature branch targeting the integration branch (`dev`, or `main` on a single-branch repo — detected, never assumed). Reads the team conventions via /setup (`.claude/setup.md`: whether this repo opens PRs at all, the PR template, where the card key goes in the title) and stops when the repo integrates directly. Pushes the branch and creates the PR with a 3-layer body (plain-language "O que foi feito" anyone understands + technical Summary/Solução for the reviewer and AI + DevOps notes + Como testar), mirrors the plain-language summary to the Jira card on the board recorded in project memory via /jira-board (comment + status transition), and promotes the kanban card 10-done → 11-ship. Requires the work to be already committed (via /work). Never targets main when dev exists — production is /prod.'
effort: max
requires: [jira-board, setup]
handoff: homolog
boundary: prod
argument-hint: "(nenhum — usa a branch atual)"
---

# /pull-request — Abrir PR (feature branch → dev)

Sobe a branch atual e abre o PR no GitHub **mirando `dev`**, com uma descrição que serve **três leitores ao mesmo tempo** (pessoa leiga, reviewer/IA, devops) e espelha o resumo no card do Jira.

> Pré-requisito: o trabalho já está **commitado** (Step 10 do `/method`, via `/work`). `/pull-request` **não** implementa nem commita feature nova — só publica o que já passou.

## Iron Law
> **Precisão > tokens.** Um PR mal descrito custa caro no review e no deploy. A descrição **é parte da entrega**, não enfeite.

## Convenções (CONTRATO)
- **Base do PR = a branch de integração, resolvida pela TOPOLOGIA — nunca assumida:**
  ```bash
  git ls-remote --heads origin dev     # vazio ⇒ branch única
  ```
  | Topologia | Base do PR |
  |---|---|
  | `dev` **e** `main` em `origin` | **`dev`**. Nunca `main` — produção é o `/prod` |
  | só `main` (branch única) | **`main`** — é a única integração que existe |

  > **Padrão:** `dev` é a **branch** de integração. **homolog** é o **ambiente** publicado a partir dela — não é base de PR, é onde a mudança aparece depois do merge. Detalhe da topologia: `prod/references/deploy-context.md`.
- **Board:** o da **memória do projeto** — vem do `/jira-board` (passo 0), nunca hardcoded. Via `mcp__atlassian__*`.
- **Convenções do time:** vêm do `/setup` (passo 0), que lê `.claude/setup.md` — **§ PR** (`Abre PR`, `Template`) e **§ Commit** (onde a key entra no título). `Abre PR: não` ⇒ este repositório integra direto; esta skill **para** e encaminha (Guard). `Aprovação` e `Merge` são lidos por quem mergeia (`/homolog`/`/prod`), não aqui.
- Remote = `origin`. O repositório vem do próprio checkout (`gh repo view --json nameWithOwner -q .nameWithOwner`) — não hardcodar.

## Guard — onde estou? (ANTES de tudo, DEPOIS do passo 0)
```bash
git branch --show-current
git status                 # working tree limpo; commit do /method presente
```
- **§ PR do setup diz `Abre PR: não`** → **PARAR.** Avisar: *"Este repositório não abre PR (`.claude/setup.md` § PR — trabalho direto na integração). O que está na integração vai ao ar pelo `/homolog` (ou `/prod`, em branch única). Para mudar a convenção: `/setup pr`."* Não abrir PR — nem "só desta vez" sem pedido explícito do usuário.
- Branch atual = a **própria branch de integração** (`dev`, ou `main` em branch única) → **PARAR.** Avisar: *"/pull-request é pra feature branch → integração. Você já está nela; para levar ao ar use o `/homolog` (ou o `/prod`, se for produção)."* Não abrir PR.
- Branch = feature → seguir.
- Working tree sujo / sem commit da feature → **PARAR** e mandar fechar no `/work` (`/method` até o Step 10) antes.
- **Branch atualizada com a integração?**
  ```bash
  git fetch origin
  git merge-base --is-ancestor origin/<integração> HEAD && echo "✓ contém a integração atual" || echo "✗ ATRÁS da integração"
  ```
  `✗` (a integração andou desde o `/work`) → **PARAR** e mandar rodar `/work` de novo pra integrar `origin/<integração>` (merge + resolver conflitos) e **re-testar** — `/pull-request` publica só o que já passou, não resolve conflito não-testado.

## Fluxo

### 0. Board do projeto (SEMPRE, antes de tudo)
**Invoque o `/jira-board`** — via **Skill tool** (`furi-ship:jira-board`; a forma curta `jira-board` também resolve). Chamada real, não "seguir de memória": sem a invocação, o passo não aconteceu. Dependência obrigatória: ele lê a memória do projeto e, se não houver board gravado, pergunta e grava. Devolve `{site, key, boardId, boardName, url, origem}`.

É de lá que sai a `<KEY>` usada no título do PR, no corpo, no comentário do card e no prefixo da branch. Nunca assuma o board nem pergunte por ele aqui.

**Depois, invoque o `/setup`** — via **Skill tool** (`furi-ship:setup`; a forma curta `setup` também resolve). Dependência obrigatória: lê `.claude/setup.md` e, se não existir, infere, pergunta o mínimo e grava. Daqui saem `Abre PR` (decide o Guard), `Template` (decide o corpo no passo 3) e a posição da key (§ Commit — decide o título). Duas invocações separadas, cada uma com a sua pergunta isolada.

### 1. Push
```bash
git push -u origin <branch>
```

### 2. Levantar o contexto da entrega (não inventar)
- Card `<KEY>-<N>` — do nome da branch (`<key-minúscula>-<n>…`, com a key vinda do passo 0) ou do card em `kanban/`.
- `git diff <integração>...<branch>` — o que realmente mudou.
- Docs do feature: `docs/01-problem` … `docs/05-test-cases` + `kanban/09-run-test`.
- Extrair daí: **o problema em linguagem leiga**, a **solução técnica**, os **TCs**, e o **impacto de deploy** (migrations? env novas? deps?).

### 3. Criar o PR — corpo 3-em-1
`--base` é a integração resolvida pela topologia (Convenções). O título segue o § Commit do setup: key no escopo (`<tipo>(<KEY>-<N>): …`, o default abaixo), no início (`<KEY>-<N> <tipo>: …`) ou ausente (`<tipo>(<escopo>): …` — a key fica no trailer `Jira:` do corpo, que é sempre escrito). Se o § PR `Template:` apontar um arquivo (ex.: `.github/pull_request_template.md`), o corpo segue **as seções dele** — preenchidas, não deixadas em branco — e as 3 camadas daqui entram dentro delas (o `## O que foi feito` leigo é obrigatório em qualquer template).
```bash
gh pr create --base <integração> --title "<tipo>(<KEY>-<N>): <título conciso>" --body "$(cat <<'EOF'
## O que foi feito
[Linguagem simples, ZERO jargão — qualquer pessoa, de qualquer idade ou nível de
conhecimento, entende o problema que existia e o que mudou. Concreto, com antes/depois.
Ex.: "Quando o paciente tentava agendar sem ter crédito, a tela travava. Agora aparece
um aviso claro e o paciente é levado direto pra tela de comprar crédito."]

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

Jira: <KEY>-<N>
🤖 Generated with Claude Code
EOF
)"
```
> A seção **"O que foi feito"** é a MESMA que vai pro Jira (passo 4). Escreva uma vez, use nos dois.

### 4. Espelhar no card do Jira
Comentário — `mcp__atlassian__jira_add_comment` (`issue_key: <KEY>-<N>`):
```
## O que foi feito
[a MESMA descrição leiga do PR]

---
PR: <URL>
Branch: <branch>
Status: Em revisão
```
Transição de status — mover o card para o status **equivalente a "em revisão"** no workflow daquele projeto. A mecânica (descobrir a transição, aplicar, e o que fazer se o workflow não tiver equivalente) é do **`prod/references/jira-sync.md`**, fonte única — siga-o, não o reescreva aqui.

### 5. Promover o kanban
```bash
mv kanban/10-done/<feature>.md kanban/11-ship/<feature>.md
```
Atualizar frontmatter:
```yaml
pr: <URL do PR>
status: in-review
```
> O feature **não estava** em `kanban/10-done/`? É sinal de QA não rodada (parou no `/fast`). Não bloquear o PR aqui — anotar e deixar o **gate de QA do `/homolog`** resolver.

### 6. Reportar
```
## ✅ PR aberto — <KEY>-<N>
- PR:     <URL>   (base: <integração>)
- Branch: <branch>
- Jira:   Em revisão (comentário + transição)
- Kanban: kanban/11-ship/<feature>.md
- Próximo: /homolog (review + gate de QA + merge + deploy + verificação no ar)
```

## Red Flags — STOP
- "Assumi o board de sempre / o do outro repositório" → NÃO. Skill não tem board padrão. O board é o da **memória deste repositório**, via `/jira-board`.
- "Descobri/perguntei o board direto aqui" → NÃO. Passo 0 é o `/jira-board`; ele é o único dono da memória do projeto. Skill que pergunta o board por conta própria pergunta de novo amanhã.
- "Pulei o passo 0 porque já sei o board desta sessão" → NÃO. A leitura da memória é **toda** invocação.
- "Já conheço o `/jira-board` / o `/setup`, sigo sem invocar" → NÃO. Mencionar não é invocar: a skill entra pelo Skill tool, **toda** vez.
- "O setup diz `Abre PR: não`, mas abro assim mesmo — é mais seguro" → NÃO. Convenção do time é contrato. Pare, encaminhe pro `/homolog`/`/prod`; mudar é `/setup pr`, não é aqui.
- "Ignorei o template de PR do repo e usei o meu" → NÃO. § PR `Template:` aponta um arquivo → o corpo segue as seções dele. As 3 camadas entram **dentro**.
- "Abro o PR contra `main`" → NÃO, havendo `dev`. Base é a **integração** (`dev`); `main` é via `/prod`, com OK explícito. Em branch única, `main` **é** a integração — aí é a base certa.
- "Abro o PR contra `homolog`" → NÃO existe branch `homolog`. É o **ambiente**; a base é `dev` (ou `main`, em branch única).
- "Todo projeto meu tem `dev`, abro contra ela" → NÃO. `git ls-remote` primeiro: em branch única não existe `origin/dev`, e o PR não tem para onde ir.
- "Estou em `dev`, abro o PR mesmo assim" → NÃO. `/pull-request` é pra feature branch. Pare e oriente pro `/homolog`.
- "Descrição técnica já basta" → NÃO. As **3 camadas** (leigo + técnico + DevOps) são obrigatórias.
- "Escrevo só 'corrige bug' em 'O que foi feito'" → NÃO. Tem que ser entendível por qualquer pessoa, com antes/depois concreto.
- "Pulo o espelhamento no Jira" → NÃO. PR e card andam juntos (descrição + transição).
- "Commito um ajuste rápido antes do push" → se precisa de código novo, volte pro `/work` (`/method` com re-review). `/pull-request` só publica o que já passou.
