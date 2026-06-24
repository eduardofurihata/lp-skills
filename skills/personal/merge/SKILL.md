---
name: merge
description: 'Use when user invokes /merge to review open GitHub PRs targeting homolog, verify the linked NIVEE card(s) were actually resolved, and land them — or REJECT a PR (request-changes + bounce the card back to the dev) when the review/QA exposes unacceptable quality, instead of force-merging it. Runs a code review of the diff + verifies resolution via the front; if the feature is QA-pending (still in kanban/06-todo) runs /todo until green first; merges into homolog and deletes the branch; comments + transitions the Jira card(s); opens a follow-up card if scope was left over; sweeps orphan/stale kanban cards (confirm-first cleanup); and asks for explicit authorization before pushing homolog→main (= prod deploy). With no open PR (work committed straight to homolog), it offers the homolog→main release directly.'
effort: max
requires: todo
argument-hint: "[PR number | NIV-X] | (empty = listar PRs abertos pra homolog)"
---

# /merge — Revisar, autenticar e mergear PRs em homolog

Revisa os PRs abertos **mirando `homolog`**, **autentica se o card foi de fato resolvido**, mergeia em `homolog`, limpa, atualiza o Jira e — só com teu OK explícito — joga pra `main` (= deploy prod).

## Iron Law
> **Precisão > tokens > velocidade.** "O dev disse que tá pronto" não é prova — **autentique você** (review + front). Bug que passa daqui vai pra `homolog` e depois pra prod. Mire a referência #1.
>
> **Mergear não é obrigatório — o `/merge` é um GATE, não uma esteira.** Pode (e às vezes deve) **falhar**: PR com qualidade ruim/inaceitável é **rejeitado e devolvido ao dev**, não empurrado pra dentro. Bloquear lixo é o gate **funcionando**, não falhando. Conserto pontual → corrige na hora; quando "consertar" vira "reimplementar", **rejeita** (Phase 2b).

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
6. **Mergear NÃO é garantido — REJEITAR é saída válida.** Conserto pontual (bug/edge case/null-check/pattern/copy) → corrige in-place + re-revisa. Mas se "consertar" = **refazer a abordagem**, OU o feature **não faz o que o card pede** e não dá pra ajustar trivial, OU desastre de segurança/perda de dado, OU o loop de conserto **não converge** (~2–3 rodadas) → **REJEITA** (Phase 2b). Não reimplemente o trabalho do dev disfarçado de review. Rejeitar é **seguro** (nada deploya, branch viva) → pode ser autônomo; só **reporta alto** e deixa override.
7. NUNCA deployar `homolog` stale nem com divergência aberta: antes do `homolog→main`, sincronizar **local homolog ↔ origin/homolog** trazendo tudo (PRs mergeados + commits diretos) e **resolvendo conflitos** (não `ff-only`-bail). Fim: local == origin/homolog, limpo.
8. Resolver conflito = mudança de código = **re-review + re-autenticação via front ANTES do `push origin main`**. Nunca deploya merge não-verificado. Resolução de intenção ambígua (não dá pra inferir os dois lados) → **perguntar ao usuário**, não chutar.
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

## Phase 2 — Review + Autenticar resolução (loop até limpo **ou** rejeita)
1. **Code review do diff** (calibre Step 8 do `/method`): `gh pr diff <n>` → revisar cada arquivo — bugs, edge cases, padrões do projeto (`docs/00-context/technical/patterns.md`), segurança, performance, código morto, "faz exatamente o que o card pede". Relatório em `kanban/08-code-review/<feature>.md` se ainda não houver.
2. **Autenticar a resolução via front:** abrir o app (Playwright MCP) e validar o **`## Como testar`** do card — o que o card pedia **acontece de verdade**? Confirmar para CADA card do PR ("quais cards" foram resolvidos).
3. **Achou problema → decidir CONSERTA ou REJEITA:**
   - **Conserta in-place** (default p/ o reparável): bug pontual, edge case, null-check, desvio de pattern, erro de copy → corrige na branch do PR → **re-review + re-autentica** (qualquer fix invalida o passe). Loop até **zero issues + resolução confirmada** → Phase 3.
   - **Rejeita** (quando o reparo não é review, é reimplementação) → **Phase 2b**. Gatilhos: abordagem fundamentalmente errada; o feature **não faz o que o card pede** e não dá pra ajustar trivial; scope bagunçado / itens não-relacionados que precisam re-split; desastre de segurança/perda de dado; ou o loop de conserto **não converge** (~2–3 rodadas — sinal de PR cru, não de detalhe).
   > **Fio da navalha:** se pra deixar limpo você teria que **reescrever a implementação**, isso é trabalho do dev — **rejeita e devolve**, não faça você escondido no review. Na dúvida entre os dois, rejeitar é a direção segura (nada deploya).

## Phase 2b — Rejeitar o PR (saída TERMINAL — não mergeia)
Rejeitar é seguro: nada vai pra `homolog`/prod, branch e PR ficam vivos pro dev iterar → **autônomo, sem pedir permissão** (≠ `homolog→main`); só deixa o motivo **explícito** e reporta alto. Override do usuário: "mergeia assim mesmo".
1. **Request-changes no PR** com feedback concreto e acionável (não vago): `gh pr review <n> --request-changes --body "<o quê + por quê + o que precisa mudar, por item; aponte arquivo/linha>"`.
2. **NÃO** mergeia, **NÃO** apaga a branch — o dev precisa dela pra empurrar os fixes.
3. **Jira → devolve pro dev:** `jira_get_transitions` → `jira_transition_issue` pro **"Em andamento"** (rework). `jira_add_comment` com o resumo do que reprovou + link do review. Sem `comment` na transição (ADF).
4. **Kanban → rework:** mover o card (de onde estiver) pra `kanban/07-implementation/<feature>.md` com frontmatter `status: rework` + motivo. Não deixa em `10-done`/`11-ship` (mentiria "pronto"). *(Sem card no kanban — dev cru — pula esta etapa.)*
5. **Escopo lateral** que apareceu no review (bug à parte, dívida) ainda vira card de follow-up (Phase 4.5) — mas o **core volta pro dev**, não enfia no PR rejeitado.
6. **Reporta** (saída "rejeitado", abaixo) e **encerra** — NÃO segue pra Phase 3+. Sem merge, sem deploy.

## Phase 3 — Mergear em homolog + limpar branch
Com review limpo e resolução autenticada:
```bash
# Branch atualizada com homolog? (homolog pode ter andado desde o PR)
gh pr view <n> --json mergeable,mergeStateStatus    # CONFLICTING / BEHIND → atualizar a branch
#   se conflitante/atrás:
git checkout <branch> && git fetch origin && git merge origin/homolog   # RESOLVER conflitos (os 2 lados)
#     resolução mudou código → re-rodar Phase 2 (review + autenticação) na branch atualizada
git push origin <branch>                            # atualiza o PR

# mergeável e (re-)autenticada:
gh pr merge <n> --merge --delete-branch             # merge commit (padrão do histórico) + apaga a branch
git checkout homolog && git pull --ff-only          # traz o merge pro homolog local
```
> **Nunca mergear branch atrás/conflitada com homolog:** atualizar (`merge origin/homolog`) + resolver + re-autenticar (Phase 2) primeiro.
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
- **Sim explícito** (só então) — ciclo `sincronizar+resolver → promove → deploy → resync → assert`, **nessa ordem**:
  ```bash
  # === 0) SINCRONIZAR homolog: tudo atualizado + RESOLVER conflitos, ANTES de deployar ===
  git checkout homolog
  git fetch origin
  git merge origin/homolog             # traz TODOS os PRs mergeados; CONFLITO → resolver (ver abaixo)
  git push origin homolog              # sobe commits diretos (no-op se não há)

  # 1) homolog → main (promove)
  git checkout main && git pull --ff-only
  git merge homolog                    # CONFLITO → resolver

  # 2) main → GitHub   ←  DEPLOYA PROD (GH Actions)
  git push origin main

  # 3) resync main → homolog
  git checkout homolog && git merge main
  git push origin homolog

  # 4) ASSERT
  git fetch origin
  [ "$(git rev-parse origin/homolog)" = "$(git rev-parse origin/main)" ] \
    && echo "✓ origin/homolog == origin/main" || echo "✗ DIVERGIRAM — investigar"
  ```
  > **Resolução de conflitos (em QUALQUER merge acima):** resolver entendendo **os dois lados** — nunca `ff-only`-bail, nunca descartar um lado às cegas. **Toda resolução que muda código → re-review + re-autenticar via front ANTES do `push origin main`** (não deploya merge não-verificado). Intenção genuinamente ambígua (não dá pra inferir) → **perguntar ao usuário**.
  > **Assert `✗`** → resync não fechou (`origin/homolog != origin/main`); investigar antes de concluir.

  Depois: transicionar o(s) card(s) pro status final pós-deploy (se o workflow tiver). **Resultado garantido: `origin/homolog == origin/main`, sem conflito pendente.**

## Saída

**Mergeado:**
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

**Rejeitado** (qualidade inaceitável — NÃO mergeou):
```
## ⛔ /merge — PR #<n> REJEITADO
- Cards:    NIV-X[, NIV-Y]  →  Em andamento (devolvido ao dev)
- Motivo:   <por que reprovou — concreto, por item>
- Ação:     request-changes no PR ✓  ·  branch preservada ✓  ·  kanban → 07-implementation
- Merge:    ✗ NÃO mergeado — homolog/prod intocados
- Override: responda "mergeia assim mesmo" pra forçar
```

## Red Flags — STOP
- "O dev marcou done, mergeio sem autenticar" → NÃO. Autentique via front (Phase 2).
- "Card em `06-todo`, mergeio e testo depois" → NÃO. Gate de QA: roda `/todo` ANTES.
- "Rodo `/todo` em todos os pendentes de `06-todo`" → NÃO. Só o card do PR. Órfão é cleanup (Phase 5).
- "Apago os órfãos de uma vez" → NÃO. Confirm-first, sempre. Nunca auto-delete.
- "O usuário já disse que eu posso mergear pra main" → NÃO vale pra sempre. Pergunte a CADA `homolog→main`.
- "Fix pequeno no review, não re-testo" → NÃO. Qualquer fix → re-review + re-autentica.
- "O loop de conserto não fecha, sigo reescrevendo no review" → NÃO. ~2–3 rodadas sem convergir = PR cru → REJEITA e devolve (Phase 2b).
- "Código tá limpo, mas o feature não faz o que o card pede — mergeio" → NÃO. Resolução não-autenticada = rejeita, não merge.
- "Pra mergear eu reescrevi metade da implementação" → NÃO. Isso é trabalho do dev. Reescrita ≠ review → rejeita e devolve.
- "Achei um null-check faltando, então rejeito o PR" → NÃO (o oposto). Conserto pontual é in-place; rejeição é só pra inaceitável/reimplementação. Não vire trigger-happy.
- "Acho a ponta solta, deixo sem card" → NÃO. Follow-up vira card (Phase 4.5), não some.
