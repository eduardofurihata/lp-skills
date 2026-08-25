---
name: merge
description: 'Use when user invokes /merge to review open GitHub PRs targeting the integration branch `dev`, verify the linked NIVEE card(s) were actually resolved, and land them — or REJECT a PR (request-changes + bounce the card back to the dev) when the review/QA exposes unacceptable quality, instead of force-merging it. Always runs a code review of the diff; re-verifies resolution via the front only as a safety net — when the dev''s /method QA failed, isn''t documented as passed, or is QA-pending (kanban/06-todo → runs /todo until green first) — and trusts complete, documented, passing /method QA instead of duplicating it; merges into `dev` and deletes the branch (remote AND local); comments + transitions the Jira card(s); checks the dev''s follow-up ledger (open item = reject, not a card) and CLASSIFIES every out-of-scope finding before filing anything — a reproduced BUG becomes a card, a business-rule GAP becomes a card only with a verbatim citation from a project artifact that requires it plus the user''s explicit OK, and a mere IMPROVEMENT never becomes a card (report line only); sweeps orphan/stale kanban cards (confirm-first cleanup); and asks for explicit authorization before pushing `dev`→`main` (= prod deploy). With no open PR (work committed straight to `dev`), it offers the `dev`→`main` release directly.'
effort: max
requires: todo
argument-hint: "[PR number | NIV-X] | (empty = listar PRs abertos pra `dev`)"
---

# /merge — Revisar, autenticar e mergear PRs na `dev`

Revisa os PRs abertos **mirando `dev`**, **autentica se o card foi de fato resolvido**, mergeia em `dev`, limpa, atualiza o Jira e — só com teu OK explícito — joga pra `main` (= deploy prod).

## Iron Law
> **Precisão > tokens > velocidade.** O **code review do diff é SEMPRE teu** — ninguém revisa por você, isso é inegociável. Já o **front-test é rede de segurança, não redo**: se o dev rodou o protocolo `/method` completo e a QA está **documentada e 100% PASSED** (`kanban/09-run-test/<feature>.md`, todos os TCs do card ✅), **confia e segue em frente** — não re-teste o que já foi testado direito (duplicar QA é desperdício). Re-autentica via front **só** quando a QA (1) **falhou**, (2) **não está explícito que passou** (sem relatório / ambíguo / TCs incompletos), ou (3) **tem TODO pendente** (card em `06-todo/`). Bug que passa daqui vai pra `dev` e depois pra prod — por isso o review é cego-obrigatório e o front-test é calibrado pelo estado da QA. Mire a referência #1.
>
> **Mergear não é obrigatório — o `/merge` é um GATE, não uma esteira.** Pode (e às vezes deve) **falhar**: PR com qualidade ruim/inaceitável é **rejeitado e devolvido ao dev**, não empurrado pra dentro. Bloquear lixo é o gate **funcionando**, não falhando. Conserto pontual → corrige na hora; quando "consertar" vira "reimplementar", **rejeita** (Phase 2b).
>
> **Card de follow-up é exceção PROVADA, não subproduto do review.** Achado fora do escopo é **classificado** antes de qualquer coisa (Phase 4 § 6): **bug** exige reprodução observada; **furo** de regra exige **citação verbatim** da fonte que o exige; **melhoria** não vira card nunca. O "deveria ser assim" **jamais** é opinião do reviewer — é uma frase que dá pra grepar. Sem isso o `/merge` fabrica retrabalho e, pior, motiva mudança em código compartilhado a partir de defeito que ninguém provou existir.

## Convenções (CONTRATO)
- PRs alvo: **base `dev`**. Remote `origin`; o repositório vem do próprio checkout (`gh repo view --json nameWithOwner -q .nameWithOwner`) — não hardcodar.
  > **Padrão:** `dev` é a **branch** de integração; `main` é produção. **homolog** é o **ambiente** publicado a partir da `dev` — é onde a mudança aparece depois do merge, nunca uma base de PR. Neste doc, `dev` entre backticks é sempre a branch; "o dev" sem backticks é a pessoa que escreveu o PR.
- Board NIVEE (`NIV`), via `mcp__atlassian__*`.
- **`dev → main` SÓ com autorização explícita do usuário, na hora.** Autoridade dita antes ("sou tech lead", "pode mergear sempre") **NÃO** conta — pergunte a CADA release. (Regra herdada do `/method`.)

<HARD-GATE>
1. NÃO mergeie sem **code review limpo** (sempre teu). A **autenticação via front** é exigida **só** quando a QA do dev falhou / não está explícito que passou / tem TODO pendente — QA `/method` completa e PASSED documentada (`09-run-test`) **dispensa** o re-teste (ver Iron Law).
2. Card ainda em `kanban/06-todo/` (QA não rodou) e é o card DESTE PR → rode o `/todo` até 100% PASSED ANTES de mergear. Sem pular.
3. NÃO rode `/todo` em card órfão (sem PR/branch) — isso é lixo de rota, vai pro cleanup (Phase 5), não pra QA.
4. NÃO faça `dev → main` sem o usuário autorizar ESTE push explicitamente.
5. QUALQUER fix durante o review invalida o passe → volta ao review + re-autentica.
6. **Mergear NÃO é garantido — REJEITAR é saída válida.** Conserto pontual (bug/edge case/null-check/pattern/copy) → corrige in-place + re-revisa. Mas se "consertar" = **refazer a abordagem**, OU o feature **não faz o que o card pede** e não dá pra ajustar trivial, OU desastre de segurança/perda de dado, OU o loop de conserto **não converge** (~2–3 rodadas) → **REJEITA** (Phase 2b). Não reimplemente o trabalho do dev disfarçado de review. Rejeitar é **seguro** (nada deploya, branch viva) → pode ser autônomo; só **reporta alto** e deixa override.
7. NUNCA deployar `dev` stale nem com divergência aberta: antes do `dev→main`, sincronizar **`dev` local ↔ `origin/dev`** trazendo tudo (PRs mergeados + commits diretos) e **resolvendo conflitos** (não `ff-only`-bail). Fim: local == origin/dev, limpo.
8. Resolver conflito = mudança de código = **re-review + re-autenticação via front ANTES do `push origin main`**. Nunca deploya merge não-verificado. Resolução de intenção ambígua (não dá pra inferir os dois lados) → **perguntar ao usuário**, não chutar.
9. NUNCA abra card de follow-up sem **classificar** o achado (Phase 4 § 6). **Bug** sem reprodução observada, **furo** sem citação verbatim da fonte que o exige, e **melhoria** de qualquer tipo — nenhum vira card. Furo, mesmo provado, só vira card com **OK explícito do usuário**.
</HARD-GATE>

---

## Phase 0 — Selecionar o PR (ou entrar em modo release)
```bash
gh pr list --base dev --state open
```
- **Tem PR(s):** `$ARGUMENTS` com número/`NIV-X` → seleciona direto. 1 PR só → automático. Vários → listar e perguntar (ou "all" = um por vez). `gh pr view <n>` + `gh pr diff <n>` pra carregar título, corpo, branch e diff. → segue pra **Phase 1**.
- **Nenhum PR aberto:** provável que tu commitou **direto em `dev`** (teu fluxo pessoal). Checar se há o que soltar:
  ```bash
  git checkout dev && git pull --ff-only
  git log --oneline main..dev        # commits em dev ainda não em main
  ```
  Tem commits → **pular direto pra Phase 6** (release `dev→main`). Zero commits → "`dev` == `main`, nada a fazer." e sair.

## Phase 1 — Card(s) + Gate de QA (SCOPED ao PR)
1. **Identificar o(s) card(s)** do PR: `NIV-X` no corpo/título + nome da branch (`niv-X…`). Um PR pode resolver **vários** cards — capture todos.
2. **Mapear o feature** no kanban (nome do arquivo em `kanban/`).
3. **Gate de QA — só pra ESTE feature:**

| Estado do feature | Ação |
|---|---|
| Em `10-done`/`11-ship` **com `09-run-test` 100% PASSED** (QA `/method` documentada) | QA já foi feita via front no Step 9 → **confia**. Phase 2 = **só code review**; **pula o front-test** (não duplica QA já feita direito). |
| Em `10-done`/`11-ship` mas QA **ausente / ambígua / falhada** no `09-run-test` | "Done" sem prova explícita = trata como não-testado → Phase 2 **com** front-test. |
| Em `kanban/06-todo/` (QA pendente) | **Rodar o `/todo`** pra esse feature até **100% PASSED** (promove pra `10-done`). Só então Phase 2. — *rede de segurança: o dev parou no `/fast` e esqueceu o teste.* |
| Sem card no kanban (dev trabalhou cru, sem `/method`) | **PARAR e avisar:** sem test cases não dá pra autenticar QA. Perguntar ao usuário como proceder (rodar `/work`-style discovery+QA, ou aceitar review-only sob risco). |

4. **Gate de Convergência do dev — ledger de follow-ups.** Abrir `kanban/10-done/<feature>.md` e checar a seção `## Follow-ups`:

| Ledger | Ação |
|---|---|
| Presente, **zero `ABERTO`** (tudo `RESOLVIDO-*` / `DESCARTADO` com justificativa) | ✅ dev convergiu → segue pra Phase 2. |
| Presente **com item `ABERTO`** | ❌ **Rejeita** (Phase 2b) — viola a Regra Inviolável 7 do `/method`. Pendência conhecida não vira card: volta pro dev fechar o ciclo. |
| **Ausente** (card antigo / dev cru) | Não rejeita por si só — trata como não-verificado e revisa **o diff** com mais cuidado (o diff, não o projeto inteiro). Achado aqui entra na **mesma classificação** da Phase 4 § 6 (bug reproduzido / furo citado / melhoria) — ledger ausente **não** é licença para caçar fora do diff, nem atalho para virar card. |

> O gate olha **só o card do PR**. Outros cards pendentes em `06-todo/` NÃO são QA aqui — vão pro cleanup (Phase 5).

## Phase 2 — Review + Autenticar resolução (loop até limpo **ou** rejeita)
1. **Code review do diff** (calibre Step 8 do `/method`): `gh pr diff <n>` → revisar cada arquivo — bugs, edge cases, padrões do projeto (`docs/00-context/technical/patterns.md`), segurança, performance, código morto, "faz exatamente o que o card pede". Relatório em `kanban/08-code-review/<feature>.md` se ainda não houver.
   - **Escopo = o diff.** Os arquivos que o PR toca, mais o que eles chamam direto. Auditoria de qualidade do **repo inteiro não é este passo**: o que aparecer fora do diff é achado pré-existente e passa pela classificação da Phase 4 § 6 como qualquer outro (na maioria dos casos: linha no relatório).
   - **Princípios, um a um e por nome** (`skills/method/references/principios.md` — a mesma lista contra a qual o dev escreveu): **SRP** (responsabilidade única, camadas, >40 linhas) · **DRY** (duplicou o que já existe no projeto? conferir com grep, não de olho — e o grep é sobre **símbolo que o diff introduz** ("isto já existia?"), não varredura de qualidade do repo) · **KISS** · **YAGNI** (entrou abstração que nenhum UC pede?) · **Law of Demeter / acoplamento / direção de dependências**. Achado **dentro do diff** é issue de review como qualquer outro: conserta in-place se for pontual, **rejeita** se limpar exigir reimplementar (passo 3). Violação de princípio **sem sintoma observável** é classe **C** (Phase 4 § 6): linha no relatório, nunca card.
   - **Cheque o done doc:** ele declara "reutilizado / descartado / elevado" (Step 10 do `/method`). Diff que cria do zero o que o projeto já tinha, com o done doc silencioso sobre isso, é sinal de que o § 3.1 do plano não foi feito.
2. **Autenticar a resolução via front — CONDICIONAL (rede de segurança, não redo):**
   - **PULA** se a QA do `/method` está **documentada e 100% PASSED** (`kanban/09-run-test/<feature>.md`, todos os TCs do card ✅). O dev já provou via front no Step 9 — re-rodar é duplicar trabalho já feito direito. O code review (passo 1) continua valendo: é ele que pega o que os TCs do dev não pegaram.
   - **FAZ** (abrir o app via Playwright MCP, validar o **`## Como testar`** de CADA card do PR, confirmar que o que ele pedia **acontece de verdade**) **só** quando: a QA **falhou**, **não está explícito que passou** (sem `09-run-test` / ambíguo / TCs incompletos), ou veio de **TODO pendente** que você acabou de rodar no `/todo`.
3. **Achou problema → decidir CONSERTA ou REJEITA:**
   - **Conserta in-place** (default p/ o reparável): bug pontual, edge case, null-check, desvio de pattern, erro de copy → corrige na branch do PR → **re-review + re-autentica** (qualquer fix invalida o passe). Loop até **zero issues + resolução confirmada** → Phase 3.
   - **Rejeita** (quando o reparo não é review, é reimplementação) → **Phase 2b**. Gatilhos: abordagem fundamentalmente errada; o feature **não faz o que o card pede** e não dá pra ajustar trivial; scope bagunçado / itens não-relacionados que precisam re-split; desastre de segurança/perda de dado; ou o loop de conserto **não converge** (~2–3 rodadas — sinal de PR cru, não de detalhe).
   > **Fio da navalha:** se pra deixar limpo você teria que **reescrever a implementação**, isso é trabalho do dev — **rejeita e devolve**, não faça você escondido no review. Na dúvida entre os dois, rejeitar é a direção segura (nada deploya).

## Phase 2b — Rejeitar o PR (saída TERMINAL — não mergeia)
Rejeitar é seguro: nada vai pra `dev`/prod, branch e PR ficam vivos pro dev iterar → **autônomo, sem pedir permissão** (≠ `dev→main`); só deixa o motivo **explícito** e reporta alto. Override do usuário: "mergeia assim mesmo".
1. **Request-changes no PR** com feedback concreto e acionável (não vago): `gh pr review <n> --request-changes --body "<o quê + por quê + o que precisa mudar, por item; aponte arquivo/linha>"`.
2. **NÃO** mergeia, **NÃO** apaga a branch — o dev precisa dela pra empurrar os fixes.
3. **Jira → devolve pro dev:** `jira_get_transitions` → `jira_transition_issue` pro **"Em andamento"** (rework). `jira_add_comment` com o resumo do que reprovou + link do review. Sem `comment` na transição (ADF).
4. **Kanban → rework:** mover o card (de onde estiver) pra `kanban/07-implementation/<feature>.md` com frontmatter `status: rework` + motivo. Não deixa em `10-done`/`11-ship` (mentiria "pronto"). *(Sem card no kanban — dev cru — pula esta etapa.)*
5. **Escopo lateral** que apareceu no review (bug à parte, dívida) segue a qualificação da **Phase 4 § 6**: ponta que o dev tinha superfície pra ver **volta no request-changes** (é ele que converge); ponta que só o review externo enxerga passa pela **classificação** da § 6 (bug reproduzido → card; furo citado + crítico → pergunta; melhoria → relatório). O **core volta pro dev** de qualquer jeito, não enfia no PR rejeitado.
6. **Reporta** (saída "rejeitado", abaixo) e **encerra** — NÃO segue pra Phase 3+. Sem merge, sem deploy.

## Phase 3 — Mergear na `dev` + limpar branch
Com review limpo e resolução autenticada:
```bash
# Branch atualizada com dev? (dev pode ter andado desde o PR)
gh pr view <n> --json mergeable,mergeStateStatus    # CONFLICTING / BEHIND → atualizar a branch
#   se conflitante/atrás:
git checkout <branch> && git fetch origin && git merge origin/dev   # RESOLVER conflitos (os 2 lados)
#     resolução mudou código → re-rodar Phase 2 (review + autenticação) na branch atualizada
git push origin <branch>                            # atualiza o PR

# mergeável e (re-)autenticada:
gh pr merge <n> --merge --delete-branch             # merge commit (padrão do histórico) + apaga a REMOTA
git checkout dev && git pull --ff-only          # traz o merge pra branch dev local (e libera a branch p/ delete)

# === apagar a LOCAL — passo OBRIGATÓRIO, não "se sobrar tempo" ===
git branch -d <branch>                              # -d recusa se houver commit não mergeado (é o safety net)
git fetch origin --prune                            # limpa o remote-tracking morto (origin/<branch>)

# verificação (as duas listagens têm que vir VAZIAS):
git branch --list <branch>; git ls-remote --heads origin <branch>
```
> **Nunca mergear branch atrás/conflitada com a `dev`:** atualizar (`merge origin/dev`) + resolver + re-autenticar (Phase 2) primeiro.

**Limpeza da branch = local E remota. As duas, sempre.** O `--delete-branch` do `gh` só mata a remota; a local fica pra trás e vira lixo que confunde o próximo `/work` (branch morta com o mesmo nome, sem upstream, indistinguível de trabalho em andamento).
- `git branch -d` **falha se você estiver nela** — por isso o `git checkout dev` vem antes, não depois.
- Se o `-d` reclamar de "not fully merged" → **PARE**. Tem commit que não entrou no merge; investigue (`git log origin/dev..<branch>`) e reporte. **Nunca** troque por `-D` pra calar o aviso.
- Merge feito via REST API (fallback do `gh pr merge` com "EOF") **não apaga nada**: aí as duas deleções são suas — `git push origin --delete <branch>` + `git branch -d <branch>`.
- Sem PR (commit direto em `dev`, Phase 0): mesma regra, se existir branch local da feature.

## Phase 4 — Responder + mover card(s) + follow-up
Para CADA card do PR:
1. **Comentar** (`mcp__atlassian__jira_add_comment`): o que foi entregue + "merged em `dev`" + commit/URL.
2. **Transição de status** (`jira_get_transitions` → `jira_transition_issue`) pro pós-merge ("Verificar" / "Concluído", conforme o workflow). Sem `comment` na transição (ADF).
3. **Responder no PR** se houver discussão aberta (`gh pr comment`).
4. **Kanban:** atualizar `kanban/11-ship/<feature>.md` (frontmatter `merged: dev`, `merged_at`, `merge_commit`). Se o ledger de follow-ups do card ficou **stale** (item marcado `ABERTO`/`ADIADO` que na verdade foi resolvido por outro ciclo DESTE mesmo PR), corrija — card de ship que mente sobre convergência envenena o gate da próxima release.
5. **Commitar e pushar o que a Phase 4 editou — PASSO OBRIGATÓRIO, não "depois".**
   O `gh pr merge` da Phase 3 acontece **no GitHub**, então `origin/dev` já andou sozinho e o `git pull --ff-only` só trouxe pro local — **nada a pushar ali**. Mas o kanban do passo 4 é edição **local**: sem este passo o `/merge` termina com a árvore suja e os cards no `origin` ainda dizendo `status: in-review`, contra o HARD-GATE 7 ("local == origin/dev, limpo"). E se a Phase 6 rodar em seguida, ela promove pra `main` uma `dev` **sem** o kanban que você acabou de escrever.
   ```bash
   # paths EXPLÍCITOS — sessões paralelas compartilham a árvore; `git add -A` rouba o trabalho alheio
   git add kanban/11-ship/<feature>.md [outros arquivos que VOCÊ editou]
   git commit -m "chore(kanban): marca <feature> como mergeado em dev"
   git push origin dev          # dispara o pre-push gate (lint/typecheck/testes/build)

   # ASSERT — as duas linhas têm que bater, e a árvore vir vazia:
   git fetch origin
   [ "$(git rev-parse dev)" = "$(git rev-parse origin/dev)" ] \
     && echo "✓ local == origin/dev" || echo "✗ divergiu — investigar"
   git status --short                # vazio
   ```
   > Gate **vermelho** neste push = a `dev` que você acabou de mergear não passa no gate. Não force: investigue antes de seguir para a Phase 6 (é exatamente o que ela deployaria).
6. **Follow-up — CLASSIFICAR antes de criar (o default é NÃO criar card).** O review revelou ponta fora do escopo do PR? Primeiro decida **de quem é a ponta**:
   - **Ponta que o dev deixou** — algo que o `/method` dele tinha superfície para ver (tocou no arquivo, o fluxo passa por ali, o ledger de follow-ups do card de done está sujo ou ausente) → **NÃO vira card**. Isso é violação da Regra Inviolável 7 (`method/references/follow-ups.md`): **rejeita o PR** (Phase 2b) e devolve pro dev convergir.
   - **Ponta que só o review externo enxerga** — impacto cross-PR, conflito com outra entrega, contexto de produção que o dev não tinha → segue para a **classificação** abaixo. Não enfiar no PR atual.

   ### 6.1 As três classes — cada uma tem a SUA prova

   | Classe | O que é | Prova exigida | Destino |
   |---|---|---|---|
   | **A · BUG** | O sistema **contradiz o que ele mesmo promete** (código, spec, UI, card, doc) | **Reprodução observada**: passo no front que falha (Playwright), medição de DOM/rect, linha no banco, log, saída de comando | **Card** (autônomo) |
   | **B · FURO** | Falta comportamento que **uma fonte do projeto exige** — furo de regra de negócio / caso de uso | **Citação verbatim** da fonte (`arquivo:linha` + a frase colada) **+** `grep` provando a ausência no código **+** consequência material (§ 6.3) | **Card, só com o OK do usuário** |
   | **C · MELHORIA** | "Poderia ser de um jeito X" e **nada no projeto exige X** | **nenhuma prova é possível** — é opinião | **Linha no relatório. NUNCA card.** |

   > **Por que classificar primeiro:** reprodução é gate **vazio** para ausência. "O sistema não faz X" sempre se reproduz — reproduz-se a ausência. Reprodução **não** prova que X *deveria* existir. Sem classe, melhoria vestida de defeito passa com evidência aparente — e é ela que gera o retrabalho inútil.

   ### 6.2 O teste que separa B de C — "cola a frase"

   **Quem disse que deveria ser assim?**
   - Resposta é um **artefato citável** → **B**.
   - Resposta é "eu, o reviewer, achei melhor" → **C**, e morre no relatório.

   Não vale paráfrase, não vale "o UC-17 **implica** que", não vale "pelo espírito da spec". **Cola a frase ou não é furo.** O card carrega a citação, então dá pra grepar e conferir em 5 segundos.

   **Fontes que autorizam um "deveria" — as ÚNICAS:**
   - `docs/03-use-cases/` (UC-NN) · `docs/04-spec/` (D-NN) · `docs/01-problem/` · `docs/02-user-stories/`
   - `docs/00-context/decisions/` (`product.md`, `tenancy.md`)
   - `CLAUDE.md` — os blocos **OBRIGATÓRIO** (320px como critério de aceite, breakpoints, banco NUNCA/SEMPRE, design system)
   - O `## Como testar` / critério de aceite do próprio card no Jira
   - **Paridade BR ↔ US** — fluxo implementado numa região e ausente na outra é furo **objetivo**, não opinião (são dois bancos e dois caminhos; o que ficou num só deixa a outra região quebrada)
   - **Invariante de dinheiro, prontuário clínico ou segurança/privacidade** — prod tem usuários reais, pagamento LIVE e dado clínico

   **NÃO autorizam:** benchmark ("big tech faz assim" — isso é `/solve` dentro de escopo, não fábrica de card) · robustez genérica · elegância · "seria bom ter" · violação de princípio (SRP/DRY/KISS/YAGNI) **sem sintoma observável**, que é classe **C** por definição.

   ### 6.3 Checagem negativa (A **e** B) + consequência material (B)

   **Comportamento deliberado não é achado.** Antes de propor **qualquer** A ou B, grepar:
   - `kanban/07-implementation/*.md` → seção **`### 3.2 O que NÃO vamos construir (YAGNI)`** — lista explícita de descarte **com motivo**
   - decisão registrada (`docs/00-context/decisions/`, `D<NN>` citado em spec/código) ou comentário no código declarando o comportamento **intencional**

   Achou → **não é card**. No máximo uma **pergunta** ao usuário, se o motivo registrado parecer stale.

   > **Isto vale para a classe A também, e é onde o review mais escorrega.** Reproduziu o comportamento, mas ele está **documentado como intencional** (comentário no código, `D<NN>`, decisão registrada)? Então o sistema **não contradiz o que promete — ele cumpre**. Não é bug: é **revisão de decisão de produto**, que só o usuário toma → pergunta, **nunca** card autônomo. Reprodução prova que o comportamento existe; ela **não** prova que ele está errado.

   **Consequência material.** Bug reproduzido já tem sintoma por definição; furo precisa de uma destas para virar card: dinheiro · prontuário/dado clínico · segurança/privacidade · perda de dado · usuário travado sem saída · quebra de paridade BR/US. Fora dessa lista → linha no relatório.
   > É esta porta que carrega o "**é crítico e deveria ter**": furo crítico vira card **mesmo sendo pré-existente** — criticidade **substitui** causalidade. Furo não-crítico não vira card nem quando o PR passou por perto.

   **Causalidade (balde C do `/method`) — vale para bug pré-existente:** bug reproduzido que o PR **não criou, tocou nem agravou** e **sem** consequência material → `DESCARTADO` com justificativa de uma linha. Com consequência material → card.

   ### 6.4 Criar (ou não)

   - **A · bug reproduzido** → `/card` direto (`jira_create_issue`, tipo `Tarefa`), linkado ao original. Bug provado é caso pacificado, não precisa de debate.
   - **B · furo** → **NÃO crie.** Apresente e **pergunte**:
     > "O review achou N furo(s) de regra fora do escopo do PR: **[1]** `<achado>` — exigido por `<arquivo:linha>`: *“`<frase colada>`”* · consequência: `<material>` … Abro card para qual/quais? [todos/números/nenhum]"

     Só com resposta explícita → `/card`. Silêncio ou negativa → fica no relatório.
   - **C** → relatório, e pronto.

   **O card descreve o defeito, NÃO prescreve a implementação.** Proibido escrever `## Como resolver` mandando alterar hook/módulo compartilhado (`lib/hooks/*`, `@nivee/shared`, política da API): quem decide isso é o `/method` do card, com o escopo na mão. Card que prescreve mudança de comportamento em código compartilhado a partir de achado não reproduzido é **exatamente** como o review vira regressão no BR vivo. O `## Como testar` leva **os passos que você já executou** (classe A) ou **a citação da fonte** (classe B) — nunca hipótese a testar.

   ### 6.5 Onde mora o que NÃO virou card

   Tudo que foi reprovado vai para `kanban/08-code-review/<feature>.md`, seção **`## Observações (não viraram card)`** — uma linha por achado, com **classe** e **motivo da reprovação**:

   ```markdown
   ## Observações (não viraram card)

   | # | Achado | Classe | Por que não é card |
   |---|--------|--------|--------------------|
   | O1 | `useAutosave` sem guarda de gravação em voo | A | não reproduzido (mecanismo inferido do código) e pré-existente ao PR |
   | O2 | Política de canal poderia ser tipada pelo catálogo | C | nada no projeto exige; sem sintoma observável |
   ```

   **Registrar ≠ criar card.** Ponta anotada não some — fica auditável no relatório do review, sem virar trabalho de ninguém.

   > Card de follow-up é **privilégio do reviewer**, nunca saída do dev (ponta do dev → rejeita). Mas privilégio **com prova**: reprodução (A), ou citação + criticidade + OK do usuário (B). Se virar rota de escape do `/method`, o loop de convergência morre.

## Phase 5 — Cleanup de órfãos (confirm-first)
Varrer `kanban/06-todo/` e classificar cada card que **não é** o do PR:
- Tem **PR aberto** ou **branch viva** correspondente → QA pendente real. **Deixar quieto** (não apagar).
- **Órfão** (sem PR, sem branch) → provável lixo de rota abandonada.

Listar os órfãos e **perguntar**: *"Esses cards em `06-todo/` não têm PR nem branch — rota mudou e podem ser removidos, ou é QA pendente de verdade?"*
- Confirmar remoção → `rm` o card de `06-todo/` (e perguntar sobre docs/kanban relacionados órfãos).
- **Nunca** auto-deletar. **Nunca** rodar `/todo` em órfão.

## Phase 6 — `dev` → `main` (PERGUNTAR — é deploy prod)
Chega aqui por **dois caminhos**: depois de mergear um PR (Phases 1–5), **ou** direto da Phase 0 quando não há PR e tu commitou direto em `dev`. Nos dois, o alvo já está em `dev`. **Perguntar**:
> "`dev` tem <N> commit(s) fora de `main`. Quer jogar pra **`main`**? Isso **deploya em produção** (GH Actions). [sim/não]"

- **Não / silêncio** → PARAR. Fica em `dev`. Fim.
- **Sim explícito** (só então) — ciclo `sincronizar+resolver → promove → deploy → resync → assert`, **nessa ordem**:
  ```bash
  # === 0) SINCRONIZAR dev: tudo atualizado + RESOLVER conflitos, ANTES de deployar ===
  git checkout dev
  git fetch origin
  git merge origin/dev             # traz TODOS os PRs mergeados; CONFLITO → resolver (ver abaixo)
  git push origin dev              # sobe commits diretos (no-op se não há)

  # 1) dev → main (promove)
  git checkout main && git pull --ff-only
  git merge dev                    # CONFLITO → resolver

  # 2) main → GitHub   ←  DEPLOYA PROD (GH Actions)
  git push origin main

  # 3) resync main → dev
  git checkout dev && git merge main
  git push origin dev

  # 4) ASSERT
  git fetch origin
  [ "$(git rev-parse origin/dev)" = "$(git rev-parse origin/main)" ] \
    && echo "✓ origin/dev == origin/main" || echo "✗ DIVERGIRAM — investigar"
  ```
  > **Resolução de conflitos (em QUALQUER merge acima):** resolver entendendo **os dois lados** — nunca `ff-only`-bail, nunca descartar um lado às cegas. **Toda resolução que muda código → re-review + re-autenticar via front ANTES do `push origin main`** (não deploya merge não-verificado). Intenção genuinamente ambígua (não dá pra inferir) → **perguntar ao usuário**.
  > **Assert `✗`** → resync não fechou (`origin/dev != origin/main`); investigar antes de concluir.

  Depois: transicionar o(s) card(s) pro status final pós-deploy (se o workflow tiver). **Resultado garantido: `origin/dev == origin/main`, sem conflito pendente.**

## Saída

**Mergeado:**
```
## ✅ /merge — PR #<n>
- Cards:    NIV-X[, NIV-Y]  →  <status pós-merge>
- QA:       <já estava verde | rodei /todo: X/X PASSED>
- Review:   limpo (kanban/08-code-review/<feature>.md)
- Merge:    `dev` ✓  ·  branch deletada: remota ✓ + local ✓
- Follow-up: <N observações no relatório (A:x B:y C:z) · M card(s): NIV-Z | nenhum>
- Cleanup:  <N órfãos removidos | nenhum>
- main:     <NÃO (fica na `dev`) | SIM — deployado>
```

**Rejeitado** (qualidade inaceitável — NÃO mergeou):
```
## ⛔ /merge — PR #<n> REJEITADO
- Cards:    NIV-X[, NIV-Y]  →  Em andamento (devolvido ao dev)
- Motivo:   <por que reprovou — concreto, por item>
- Ação:     request-changes no PR ✓  ·  branch preservada ✓  ·  kanban → 07-implementation
- Merge:    ✗ NÃO mergeado — `dev`/prod intocados
- Override: responda "mergeia assim mesmo" pra forçar
```

## Red Flags — STOP
- "O dev marcou done **sem prova** (`09-run-test` ausente/ambíguo/falhado), mergeio assim mesmo" → NÃO. "Done" sem QA documentada = não-testado → front-test (Phase 2).
- "A QA `/method` passou 100% e está documentada, mas re-testo tudo no front por via das dúvidas" → NÃO (o oposto). Isso é **duplicar QA já feita direito** → o code review é teu, mas no front é **só seguir em frente**. Front-test é rede de segurança pra QA falha/ausente/pendente, não redo do que o dev já provou no Step 9.
- "Card em `06-todo`, mergeio e testo depois" → NÃO. Gate de QA: roda `/todo` ANTES.
- "Rodo `/todo` em todos os pendentes de `06-todo`" → NÃO. Só o card do PR. Órfão é cleanup (Phase 5).
- "Apago os órfãos de uma vez" → NÃO. Confirm-first, sempre. Nunca auto-delete.
- "O usuário já disse que eu posso mergear pra main" → NÃO vale pra sempre. Pergunte a CADA `dev→main`.
- "Fix pequeno no review, não re-testo" → NÃO. Qualquer fix → re-review + re-autentica.
- "Editei o kanban da Phase 4, o `/merge` acabou" → NÃO. Edição sem commit+push deixa a árvore suja e os cards no `origin` ainda em `in-review` — e a Phase 6 promoveria pra `main` uma `dev` **sem** o que você escreveu. Phase 4 § 5 é obrigatória, com o assert `local == origin/dev`.
- "Vou commitar o kanban com `git add -A`" → NÃO. A árvore é compartilhada com sessões paralelas; sempre paths explícitos (Phase 4 § 5).
- "O `--delete-branch` já apagou a branch" → apagou **só a remota**. A local **também** sai (`git branch -d`, depois do `checkout dev`) + `fetch --prune`. Fechar o `/merge` com branch local morta pendurada = incompleto.
- "O loop de conserto não fecha, sigo reescrevendo no review" → NÃO. ~2–3 rodadas sem convergir = PR cru → REJEITA e devolve (Phase 2b).
- "Código tá limpo, mas o feature não faz o que o card pede — mergeio" → NÃO. Resolução não-autenticada = rejeita, não merge.
- "Pra mergear eu reescrevi metade da implementação" → NÃO. Isso é trabalho do dev. Reescrita ≠ review → rejeita e devolve.
- "Achei um null-check faltando, então rejeito o PR" → NÃO (o oposto). Conserto pontual é in-place; rejeição é só pra inaceitável/reimplementação. Não vire trigger-happy.
- "Acho a ponta solta, deixo sem card" → **depende — agora são TRÊS destinos.** Ponta do **dev** → rejeita (Regra 7). Achado do reviewer → **classifica** (Phase 4 § 6): bug reproduzido → card; furo citado + crítico → pergunta; melhoria / não-reproduzido / pré-existente sem consequência → **a linha no relatório é o destino CERTO**. Ponta solta nunca some — mas **registrar ≠ criar card**.
- "O mecanismo é claro no código, então abro o card sem reproduzir" → NÃO. Classe A exige **reprodução observada**. **"pode" / "poderia" / "em teoria" / "risco futuro"** no título é a assinatura do não-reproduzido: se o achado precisa dessas palavras pra se sustentar, ele não passou na porta.
- "Reproduzi que o sistema não faz X, então é furo" → NÃO. Reproduzir **ausência** não prova o "deveria". Sem citação verbatim de uma fonte do projeto, é classe **C**.
- "O UC-17 **implica** isso" / "pelo espírito da spec" → NÃO. Paráfrase não é citação. **Cola a frase ou não é furo.**
- "É dívida pré-existente, mas grave, então abro card" → só se **bug reproduzido com consequência material** ou **furo citado e crítico**. "Grave no meu julgamento" não é critério — é alucinação com aparência de rigor.
- "O furo é real e provado, então crio o card" → NÃO. Furo é juízo de **direção de produto** → apresenta e **pergunta** (§ 6.4). Só bug provado cria sozinho.
- "Reproduzi, logo é bug" / "não preciso conferir se é intencional" → NÃO. Checagem negativa é obrigatória em **A e B**: `### 3.2 O que NÃO vamos construir` do plano + decisão registrada (`D<NN>`) + comentário no código. Comportamento documentado como **intencional** não é defeito — é decisão de produto, e revisá-la é chamada do usuário. **Reprodução prova que o comportamento existe, não que ele está errado.**
- "O card já explica como corrigir no hook compartilhado" → NÃO. Card **descreve** o defeito; a solução é do `/method`, com escopo na mão. Prescrever mudança em `lib/hooks/*` / `@nivee/shared` a partir de achado não reproduzido é como o review vira regressão no BR vivo.
- "O dev deixou follow-up aberto mas abro card e mergeio" → NÃO. Card de follow-up não lava violação do `/method`. Ledger sujo = **rejeita** e devolve.
- "Listo os PRs com base `homolog`" → NÃO existe branch `homolog`; é o **ambiente**. A base é `dev` — buscar por `homolog` devolve lista vazia e parece "nada a mergear".
