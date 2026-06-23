---
name: merge
description: 'Use when user invokes /merge to review open GitHub PRs targeting homolog, verify the linked NIVEE card(s) were actually resolved, and land them. Runs a code review of the diff + verifies resolution via the front; if the feature is QA-pending (still in kanban/06-todo) runs /todo until green first; merges into homolog and deletes the branch; comments + transitions the Jira card(s); opens a follow-up card if scope was left over; sweeps orphan/stale kanban cards (confirm-first cleanup); and asks for explicit authorization before pushing homolog→main (= prod deploy). With no open PR (work committed straight to homolog), it offers the homolog→main release directly.'
effort: max
requires: todo
argument-hint: "[PR number | NIV-X] | (empty = listar PRs abertos pra homolog)"
---

# /merge — Revisar, autenticar e mergear PRs em homolog

Revisa os PRs abertos **mirando `homolog`**, **autentica se o card foi de fato resolvido**, mergeia em `homolog`, limpa, atualiza o Jira e — só com teu OK explícito — joga pra `main` (= deploy prod).

## Iron Law
> **Precisão > tokens > velocidade.** "O dev disse que tá pronto" não é prova — **autentique você** (review + front). Bug que passa daqui vai pra `homolog` e depois pra prod. Mire a referência #1.

## Convenções (CONTRATO)
- PRs alvo: **base `homolog`**. Remote `origin` (`nivee-org/vibe-nivee`).
- Board NIVEE (`NIV`), via `mcp__atlassian__*`.
- **`homolog → main` SÓ com autorização explícita do usuário, na hora.** Autoridade dita antes ("sou tech lead", "pode mergear sempre") **NÃO** conta — pergunte a CADA release. (Regra herdada do `/method`.)

<HARD-GATE>
1. NÃO mergeie sem code review limpo + resolução autenticada via front.
2. Card ainda em `kanban/06-todo/` (QA não rodou) e é o card DESTE PR → rode o `/todo` até 100% PASSED ANTES de mergear. Sem pular.
3. NÃO rode `/todo` em card órfão (sem PR/branch) — isso é lixo de rota, vai pro cleanup (Phase 5), não pra QA.
4. NÃO faça `homolog → main` sem o usuário autorizar ESTE push explicitamente.
5. QUALQUER fix durante o review invalida o passe → volta ao review + re-autentica.
</HARD-GATE>

---

## Phase 0 — Selecionar o PR (ou entrar em modo release)
```bash
gh pr list --base homolog --state open
```
- **Tem PR(s):** `$ARGUMENTS` com número/`NIV-X` → seleciona direto. 1 PR só → automático. Vários → listar e perguntar (ou "all" = um por vez). `gh pr view <n>` + `gh pr diff <n>` pra carregar título, corpo, branch e diff. → segue pra **Phase 1**.
- **Nenhum PR aberto:** provável que tu commitou **direto em `homolog`** (teu fluxo pessoal). Checar se há o que soltar:
  ```bash
  git checkout homolog && git pull --ff-only
  git log --oneline main..homolog        # commits em homolog ainda não em main
  ```
  Tem commits → **pular direto pra Phase 6** (release `homolog→main`). Zero commits → "`homolog` == `main`, nada a fazer." e sair.

## Phase 1 — Card(s) + Gate de QA (SCOPED ao PR)
1. **Identificar o(s) card(s)** do PR: `NIV-X` no corpo/título + nome da branch (`niv-X…`). Um PR pode resolver **vários** cards — capture todos.
2. **Mapear o feature** no kanban (nome do arquivo em `kanban/`).
3. **Gate de QA — só pra ESTE feature:**

| Estado do feature | Ação |
|---|---|
| Em `kanban/10-done/` ou `kanban/11-ship/` | QA já rodou (via `/work`→`/method` ou `/todo`). Seguir pra Phase 2. |
| Em `kanban/06-todo/` (QA pendente) | **Rodar o `/todo`** pra esse feature até **100% PASSED** (promove pra `10-done`). Só então Phase 2. — *rede de segurança: o dev parou no `/fast` e esqueceu o teste.* |
| Sem card no kanban (dev trabalhou cru, sem `/method`) | **PARAR e avisar:** sem test cases não dá pra autenticar QA. Perguntar ao usuário como proceder (rodar `/work`-style discovery+QA, ou aceitar review-only sob risco). |

> O gate olha **só o card do PR**. Outros cards pendentes em `06-todo/` NÃO são QA aqui — vão pro cleanup (Phase 5).

## Phase 2 — Review + Autenticar resolução (loop até limpo)
1. **Code review do diff** (calibre Step 8 do `/method`): `gh pr diff <n>` → revisar cada arquivo — bugs, edge cases, padrões do projeto (`docs/00-context/technical/patterns.md`), segurança, performance, código morto, "faz exatamente o que o card pede". Relatório em `kanban/08-code-review/<feature>.md` se ainda não houver.
2. **Autenticar a resolução via front:** abrir o app (Playwright MCP) e validar o **`## Como testar`** do card — o que o card pedia **acontece de verdade**? Confirmar para CADA card do PR ("quais cards" foram resolvidos).
3. **Achou problema → corrige IMEDIATAMENTE** (na branch do PR) → **re-review + re-autentica** (qualquer fix invalida o passe anterior). Loop até **zero issues + resolução confirmada**.

## Phase 3 — Mergear em homolog + limpar branch
Com review limpo e resolução autenticada:
```bash
gh pr merge <n> --merge --delete-branch     # merge commit (padrão do histórico) + apaga a branch
git checkout homolog && git pull --ff-only  # traz o merge pro homolog local
```
> Branch remota apagada pelo `--delete-branch`. Apagar a local também se existir: `git branch -d <branch>`.

## Phase 4 — Responder + mover card(s) + follow-up
Para CADA card do PR:
1. **Comentar** (`mcp__atlassian__jira_add_comment`): o que foi entregue + "merged em `homolog`" + commit/URL.
2. **Transição de status** (`jira_get_transitions` → `jira_transition_issue`) pro pós-merge ("Verificar" / "Concluído", conforme o workflow). Sem `comment` na transição (ADF).
3. **Responder no PR** se houver discussão aberta (`gh pr comment`).
4. **Kanban:** atualizar `kanban/11-ship/<feature>.md` (frontmatter `merged: homolog`, `merged_at`).
5. **Follow-up:** o review/autenticação revelou ponta fora de escopo (bug lateral, dívida, melhoria)? → **criar card** seguindo o fluxo do `/card` (`jira_create_issue`, tipo `Tarefa`, `## Como testar`) e linkar ao card original. Não enfiar no PR atual.

## Phase 5 — Cleanup de órfãos (confirm-first)
Varrer `kanban/06-todo/` e classificar cada card que **não é** o do PR:
- Tem **PR aberto** ou **branch viva** correspondente → QA pendente real. **Deixar quieto** (não apagar).
- **Órfão** (sem PR, sem branch) → provável lixo de rota abandonada.

Listar os órfãos e **perguntar**: *"Esses cards em `06-todo/` não têm PR nem branch — rota mudou e podem ser removidos, ou é QA pendente de verdade?"*
- Confirmar remoção → `rm` o card de `06-todo/` (e perguntar sobre docs/kanban relacionados órfãos).
- **Nunca** auto-deletar. **Nunca** rodar `/todo` em órfão.

## Phase 6 — homolog → main (PERGUNTAR — é deploy prod)
Chega aqui por **dois caminhos**: depois de mergear um PR (Phases 1–5), **ou** direto da Phase 0 quando não há PR e tu commitou direto em `homolog`. Nos dois, o alvo já está em `homolog`. **Perguntar**:
> "`homolog` tem <N> commit(s) fora de `main`. Quer jogar pra **`main`**? Isso **deploya em produção** (GH Actions). [sim/não]"

- **Não / silêncio** → PARAR. Fica em `homolog`. Fim.
- **Sim explícito** (só então) — ciclo completo `homolog → main → resync`, **nessa ordem**:
  ```bash
  # 0) homolog local == origin (já feito se veio de PR; refaz por segurança)
  git checkout homolog && git pull --ff-only

  # 1) homolog → main (promove)
  git checkout main && git pull --ff-only
  git merge homolog              # ff limpo quando main é ancestral de homolog (estado normal)

  # 2) main → GitHub   ←  DEPLOYA PROD (GH Actions)
  git push origin main

  # 3) resync main → homolog   (deixa origin/homolog == origin/main)
  git checkout homolog && git merge --ff-only main
  git push origin homolog
  ```
  > **Guard:** se o `git merge homolog` em `main` **não** for fast-forward nem limpo (conflito, ou `main` tem commit que `homolog` não tem) → **PARAR e avisar** que `main` divergiu. Não force, não resolva às cegas — chamar o usuário.

  Depois: transicionar o(s) card(s) pro status final pós-deploy (se o workflow tiver). **Resultado: `origin/homolog == origin/main`.**

## Saída
```
## ✅ /merge — PR #<n>
- Cards:    NIV-X[, NIV-Y]  →  <status pós-merge>
- QA:       <já estava verde | rodei /todo: X/X PASSED>
- Review:   limpo (kanban/08-code-review/<feature>.md)
- Merge:    homolog ✓  ·  branch deletada ✓
- Follow-up: <NIV-Z criado | nenhum>
- Cleanup:  <N órfãos removidos | nenhum>
- main:     <NÃO (fica em homolog) | SIM — deployado>
```

## Red Flags — STOP
- "O dev marcou done, mergeio sem autenticar" → NÃO. Autentique via front (Phase 2).
- "Card em `06-todo`, mergeio e testo depois" → NÃO. Gate de QA: roda `/todo` ANTES.
- "Rodo `/todo` em todos os pendentes de `06-todo`" → NÃO. Só o card do PR. Órfão é cleanup (Phase 5).
- "Apago os órfãos de uma vez" → NÃO. Confirm-first, sempre. Nunca auto-delete.
- "O usuário já disse que eu posso mergear pra main" → NÃO vale pra sempre. Pergunte a CADA `homolog→main`.
- "Fix pequeno no review, não re-testo" → NÃO. Qualquer fix → re-review + re-autentica.
- "Acho a ponta solta, deixo sem card" → NÃO. Follow-up vira card (Phase 4.5), não some.
