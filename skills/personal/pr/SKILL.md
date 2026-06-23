---
name: pr
description: 'Use when user invokes /pr to open a GitHub pull request for the current feature branch targeting homolog. Pushes the branch and creates the PR with a 3-layer body (plain-language "O que foi feito" anyone understands + technical Summary/Solução for the reviewer and AI + DevOps notes + Como testar), mirrors the plain-language summary to the NIVEE Jira card (comment + status transition), and promotes the kanban card 10-done → 11-ship. Requires the work to be already committed (via /work). Base is always homolog, never main.'
effort: max
argument-hint: "(nenhum — usa a branch atual)"
---

# /pr — Abrir PR (feature branch → homolog)

Sobe a branch atual e abre o PR no GitHub **mirando `homolog`**, com uma descrição que serve **três leitores ao mesmo tempo** (pessoa leiga, reviewer/IA, devops) e espelha o resumo no card NIVEE.

> Pré-requisito: o trabalho já está **commitado** (Step 10 do `/method`, via `/work`). `/pr` **não** implementa nem commita feature nova — só publica o que já passou.

## Iron Law
> **Precisão > tokens.** Um PR mal descrito custa caro no review e no deploy. A descrição **é parte da entrega**, não enfeite.

## Convenções (CONTRATO)
- **Base do PR = `homolog`. NUNCA `main`.** (Release `homolog→main` é decisão do usuário, feita no `/merge`.)
- Board NIVEE (`NIV`), via `mcp__atlassian__*`.
- Remote = `origin` (`nivee-org/vibe-nivee`).

## Guard — onde estou? (ANTES de tudo)
```bash
git branch --show-current
git status                 # working tree limpo; commit do /method presente
```
- Branch atual = **`homolog`** ou **`main`** → **PARAR.** Avisar: *"/pr é pra feature branch → homolog. Você está em `homolog`; pro release `homolog→main` use o `/merge`."* Não abrir PR.
- Branch = feature → seguir.
- Working tree sujo / sem commit da feature → **PARAR** e mandar fechar no `/work` (`/method` até o Step 10) antes.

## Fluxo

### 1. Push
```bash
git push -u origin <branch>
```

### 2. Levantar o contexto da entrega (não inventar)
- Card `NIV-X` — do nome da branch (`niv-X…`) ou do card em `kanban/`.
- `git diff homolog...<branch>` — o que realmente mudou.
- Docs do feature: `docs/01-problem` … `docs/05-test-cases` + `kanban/09-run-test`.
- Extrair daí: **o problema em linguagem leiga**, a **solução técnica**, os **TCs**, e o **impacto de deploy** (migrations? env novas? deps?).

### 3. Criar o PR — corpo 3-em-1
```bash
gh pr create --base homolog --title "<tipo>(NIV-X): <título conciso>" --body "$(cat <<'EOF'
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

Jira: NIV-X
🤖 Generated with Claude Code
EOF
)"
```
> A seção **"O que foi feito"** é a MESMA que vai pro Jira (passo 4). Escreva uma vez, use nos dois.

### 4. Espelhar no card NIVEE
Comentário — `mcp__atlassian__jira_add_comment` (`issue_key: NIV-X`):
```
## O que foi feito
[a MESMA descrição leiga do PR]

---
PR: <URL>
Branch: <branch>
Status: Em revisão
```
Transição de status — `mcp__atlassian__jira_get_transitions` (achar o `id`) → `mcp__atlassian__jira_transition_issue` pro status de revisão ("Em revisão" / "Code Review", conforme o workflow). **Sem `comment` na transição (ADF).**

### 5. Promover o kanban
```bash
mv kanban/10-done/<feature>.md kanban/11-ship/<feature>.md
```
Atualizar frontmatter:
```yaml
pr: <URL do PR>
status: in-review
```
> O feature **não estava** em `kanban/10-done/`? É sinal de QA não rodada (parou no `/fast`). Não bloquear o PR aqui — anotar e deixar o **gate de QA do `/merge`** resolver.

### 6. Reportar
```
## ✅ PR aberto — NIV-X
- PR:     <URL>   (base: homolog)
- Branch: <branch>
- Jira:   Em revisão (comentário + transição)
- Kanban: kanban/11-ship/<feature>.md
- Próximo: /merge (review + gate de QA + merge pra homolog)
```

## Red Flags — STOP
- "Abro o PR contra `main`" → NÃO. Base é **`homolog`**. `main` é via `/merge`, com OK explícito.
- "Estou em `homolog`, abro o PR mesmo assim" → NÃO. `/pr` é pra feature branch. Pare e oriente pro `/merge`.
- "Descrição técnica já basta" → NÃO. As **3 camadas** (leigo + técnico + DevOps) são obrigatórias.
- "Escrevo só 'corrige bug' em 'O que foi feito'" → NÃO. Tem que ser entendível por qualquer pessoa, com antes/depois concreto.
- "Pulo o espelhamento no Jira" → NÃO. PR e card andam juntos (descrição + transição).
- "Commito um ajuste rápido antes do push" → se precisa de código novo, volte pro `/work` (`/method` com re-review). `/pr` só publica o que já passou.
