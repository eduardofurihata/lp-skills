# Ciclo de PR — de aberto a mergeado-ou-rejeitado

> **Fonte única do ciclo de PR.** `/homolog` e `/prod` não descrevem review, gate de QA nem merge — apontam para cá. Invocado pelo `reconcile.md` quando o gap é "PR aberto e não integrado".

**Responsabilidade única:** levar **um** PR de aberto a **mergeado** ou **rejeitado**. Não deploya, não configura ambiente, não verifica no ar — isso é do `deploy-run.md`, `env-config.md` e `smoke.md`.

## Iron Law

> **O code review do diff é SEMPRE teu** — ninguém revisa por você, isso é inegociável. Já o **front-test é rede de segurança, não redo**: se o dev rodou o `/method` completo e a QA está **documentada e 100% PASSED** (`kanban/09-run-test/<feature>.md`, todos os TCs do card ✅), **confia e segue**. Re-autentica via front **só** quando a QA (1) **falhou**, (2) **não está explícito que passou**, ou (3) **tem TODO pendente** (card em `06-todo/`).
>
> **Mergear não é obrigatório — isto é um GATE, não uma esteira.** PR de qualidade inaceitável é **rejeitado e devolvido**, não empurrado para dentro. Bloquear lixo é o gate **funcionando**. Conserto pontual → corrige na hora; quando "consertar" vira "reimplementar", **rejeita**.

<HARD-GATE>
1. NÃO mergeie sem **code review limpo** (sempre teu). Autenticação via front é exigida só quando a QA do dev falhou / não está explícito que passou / tem TODO pendente.
2. Card em `kanban/06-todo/` (QA não rodou) e é o card DESTE PR → rode o `/todo` até 100% PASSED ANTES de mergear.
3. NÃO rode `/todo` em card órfão (sem PR/branch) — isso é lixo de rota, vai pro cleanup (§ 7).
4. QUALQUER fix durante o review invalida o passe → volta ao review + re-autentica.
5. **Mergear NÃO é garantido — REJEITAR é saída válida** (§ 5).
6. NUNCA mergeie branch atrás/conflitada com a integração sem atualizar, resolver e **re-autenticar**.
7. Achado fora do escopo **não** vira card sem passar pelo `findings.md`.
</HARD-GATE>

## 1 — Selecionar o PR

```bash
gh pr list --base <branch-de-integração> --state open
```
A branch de integração vem do **alvo** (`reconcile.md`): `dev` na topologia de duas branches, `main` em branch única. O repositório vem do próprio checkout (`gh repo view --json nameWithOwner -q .nameWithOwner`) — não hardcodar.

Argumento com número/`<KEY>-<N>` → seleciona direto. 1 PR só → automático. Vários → o `reconcile` processa **um por um**, re-diagnosticando entre eles (a branch andou). `gh pr view <n>` + `gh pr diff <n>` carregam título, corpo, branch e diff.

## 2 — Card(s) e gate de QA (SCOPED ao PR)

1. **Identificar o(s) card(s):** `<KEY>-<N>` no corpo/título + nome da branch (`<key-minúscula>-<n>…`, key vinda do `/jira-board`). Um PR pode resolver **vários** — capture todos.
2. **Mapear o feature** no kanban (nome do arquivo).
3. **Gate de QA — só para ESTE feature:**

| Estado do feature | Ação |
|---|---|
| Em `10-done`/`11-ship` **com `09-run-test` 100% PASSED** | QA já foi feita via front no Step 9 → **confia**. Só code review; **pula o front-test** |
| Em `10-done`/`11-ship` mas QA **ausente / ambígua / falhada** | "Done" sem prova = não-testado → review **com** front-test |
| Em `kanban/06-todo/` (QA pendente) | **Rodar o `/todo`** até **100% PASSED**. Só então o review — *rede de segurança: o dev parou no `/fast` e esqueceu o teste* |
| Sem card no kanban (dev trabalhou cru) | **PARAR e avisar:** sem test cases não dá para autenticar QA. Perguntar como proceder |

4. **Gate de convergência do dev — ledger de follow-ups.** Abrir `kanban/10-done/<feature>.md`, seção `## Follow-ups`:

| Ledger | Ação |
|---|---|
| Presente, **zero `ABERTO`** | ✅ dev convergiu → segue |
| Presente **com item `ABERTO`** | ❌ **Rejeita** (§ 5) — viola a Regra Inviolável 7 do `/method`. Pendência conhecida não vira card: volta pro dev fechar o ciclo |
| **Ausente** (card antigo / dev cru) | Não rejeita por si só — revisa **o diff** com mais cuidado. Achado aqui passa pelo `findings.md` como qualquer outro; ledger ausente **não** é licença para caçar fora do diff |

> O gate olha **só o card do PR**. Outros pendentes em `06-todo/` vão pro cleanup (§ 7).

## 3 — Review + autenticar a resolução (loop até limpo **ou** rejeita)

1. **Code review do diff** (calibre Step 8 do `/method`): `gh pr diff <n>` → cada arquivo — bugs, edge cases, padrões do projeto (`docs/00-context/technical/patterns.md`), segurança, performance, código morto, "faz exatamente o que o card pede". Relatório em `kanban/08-code-review/<feature>.md`.
   - **Escopo = o diff.** Os arquivos que o PR toca, mais o que eles chamam direto. Auditoria do repo inteiro **não é este passo**: o que aparecer fora do diff é achado pré-existente e passa pelo `findings.md`.
   - **Princípios, um a um e por nome** (`skills/personal/method/references/principios.md` — a mesma lista contra a qual o dev escreveu): **SOLID** — **SRP** (responsabilidade única, camadas, >40 linhas), **OCP** (comportamento novo entrou como `if` no meio do que já funcionava?), **LSP** (implementação lança onde o contrato não prevê?), **ISP** (interface maior que o cliente?), **DIP** (regra de negócio importando client de infra?) · **DRY** (duplicou o que já existe? conferir com grep, e o grep é sobre **símbolo que o diff introduz**, não varredura do repo) · **KISS** · **YAGNI** (entrou abstração que nenhum UC pede?) · **LoD / acoplamento / direção de dependências** · **Motores** (a capacidade tem dono, ou o diff criou a segunda fonte da mesma regra?) · **Design**, se o diff tem tela (`skills/personal/method/references/design.md`). Violação **sem sintoma observável** é classe **C** no `findings.md`: linha no relatório, nunca card.
   - **Cheque o done doc:** ele declara "reutilizado / descartado / elevado" (Step 10 do `/method`). Diff que cria do zero o que o projeto já tinha, com o done doc silencioso, é sinal de que o § 3.1 do plano não foi feito.
2. **Autenticar a resolução via front — CONDICIONAL** (rede de segurança, não redo): **PULA** se a QA está documentada e 100% PASSED. **FAZ** (Playwright MCP, validando o `## Como testar` de CADA card do PR) só quando a QA falhou, não está explícito que passou, ou veio de TODO pendente.
3. **Achou problema → CONSERTA ou REJEITA:**
   - **Conserta in-place** (default do reparável): bug pontual, edge case, null-check, desvio de pattern, erro de copy → corrige na branch do PR → **re-review + re-autentica**. Loop até zero issues.
   - **Rejeita** (quando o reparo não é review, é reimplementação) → § 5. Gatilhos: abordagem fundamentalmente errada; o feature **não faz o que o card pede** e não dá ajuste trivial; scope bagunçado que precisa re-split (→ `scope-split.md`); desastre de segurança/perda de dado; ou o loop **não converge** (~2–3 rodadas).
   > **Fio da navalha:** se para deixar limpo você teria que **reescrever a implementação**, isso é trabalho do dev — **rejeita e devolve**. Na dúvida, rejeitar é a direção segura (nada deploya).

## 4 — Aprovar e mergear

Com review limpo e resolução autenticada, **aprovar antes de mergear** — o registro de que o gate passou fica no PR, não só no chat:

```bash
gh pr review <n> --approve --body "<o que foi verificado: review limpo + QA (confiada|re-rodada) + o que o card pedia acontece>"
```

> **O GitHub recusa aprovar o próprio PR** (`Can not approve your own pull request`). Autor == usuário → registrar a aprovação como comentário (`gh pr comment <n> --body "<mesmo texto> — aprovação registrada por comentário: o GitHub não permite auto-aprovação"`) e seguir. **Isso não é falha**, e não é motivo para pular o registro.

```bash
# Branch atualizada com a integração? (ela pode ter andado desde o PR)
gh pr view <n> --json mergeable,mergeStateStatus    # CONFLICTING / BEHIND → atualizar
#   se conflitante/atrás:
git checkout <branch> && git fetch origin && git merge origin/<integração>   # RESOLVER os 2 lados
#     resolução mudou código → re-rodar § 3 (review + autenticação) na branch atualizada
git push origin <branch>                            # atualiza o PR

# mergeável e (re-)autenticada:
gh pr merge <n> --merge --delete-branch             # merge commit (padrão do histórico) + apaga a REMOTA
git checkout <integração> && git pull --ff-only     # traz o merge pro local (e libera a branch p/ delete)

# === apagar a LOCAL — passo OBRIGATÓRIO, não "se sobrar tempo" ===
git branch -d <branch>                              # -d recusa se houver commit não mergeado (é o safety net)
git fetch origin --prune                            # limpa o remote-tracking morto

# verificação (as duas listagens têm que vir VAZIAS):
git branch --list <branch>; git ls-remote --heads origin <branch>
```

**Limpeza da branch = local E remota. As duas, sempre.** O `--delete-branch` do `gh` só mata a remota; a local fica e vira lixo que confunde o próximo `/work` (branch morta com o mesmo nome, sem upstream, indistinguível de trabalho em andamento).
- `git branch -d` **falha se você estiver nela** — por isso o `checkout` da integração vem antes, não depois.
- `-d` reclamou "not fully merged" → **PARE**. Investigue (`git log origin/<integração>..<branch>`) e reporte. **Nunca** troque por `-D` para calar o aviso.
- Merge via REST API (fallback do `gh pr merge` com "EOF") **não apaga nada**: as duas deleções são suas.

### Depois do merge — card, kanban e o commit do que você editou

1. **Card:** comentar + transicionar via **`jira-sync.md`** (fonte única).
2. **PR:** responder discussão aberta (`gh pr comment`).
3. **Kanban:** `kanban/11-ship/<feature>.md` com `merged`, `merged_at`, `merge_commit`. Ledger **stale** (item `ABERTO`/`ADIADO` que outro ciclo deste mesmo PR resolveu) → corrija: card de ship que mente sobre convergência envenena o gate da próxima release.
4. **Commitar e pushar o que você editou — OBRIGATÓRIO, não "depois".** O `gh pr merge` acontece no GitHub, então `origin/<integração>` já andou; o kanban é edição **local**. Sem este passo a árvore fica suja e os cards no `origin` ainda dizem `in-review` — e o `/prod` promoveria uma integração **sem** o que você escreveu.
   ```bash
   # paths EXPLÍCITOS — sessões paralelas compartilham a árvore; `git add -A` rouba o trabalho alheio
   git add kanban/11-ship/<feature>.md [outros arquivos que VOCÊ editou]
   git commit -m "chore(kanban): marca <feature> como mergeado em <integração>"
   git push origin <integração>          # dispara o pre-push gate (lint/typecheck/testes/build)

   git fetch origin
   [ "$(git rev-parse <integração>)" = "$(git rev-parse origin/<integração>)" ] \
     && echo "✓ local == origin" || echo "✗ divergiu — investigar"
   git status --short                    # vazio
   ```
   > Gate **vermelho** neste push = a integração que você acabou de mergear não passa no gate. Não force: investigue antes de seguir — é exatamente o que seria deployado.

## 5 — Rejeitar (saída TERMINAL — não mergeia)

Rejeitar é seguro: nada vai para a integração nem para o ar, branch e PR ficam vivos para o dev iterar → **autônomo, sem pedir permissão** (≠ autorização de prod); só deixa o motivo **explícito** e reporta alto. Override do usuário: "mergeia assim mesmo".

1. **Request-changes** com feedback concreto e acionável, por item, apontando arquivo/linha: `gh pr review <n> --request-changes --body "<o quê + por quê + o que precisa mudar>"`.
2. **NÃO** mergeia, **NÃO** apaga a branch — o dev precisa dela.
3. **Card → devolve pro dev:** transição para "Em andamento" (rework) + comentário com o que reprovou, via `jira-sync.md`.
4. **Kanban → rework:** mover o card para `kanban/07-implementation/<feature>.md` com `status: rework` + motivo. Não deixar em `10-done`/`11-ship` (mentiria "pronto"). *(Dev cru, sem card — pula.)*
5. **Escopo lateral** que apareceu: ponta que o dev tinha superfície para ver **volta no request-changes**; ponta que só o review externo enxerga passa pelo `findings.md`. O **core volta pro dev**, não se enfia no PR rejeitado.
6. **Reporta e encerra.** Sem merge, sem deploy.

## 6 — Sem PR aberto

Trabalho commitado em feature branch e nenhum PR → o gap é "falta PR": **invocar `/pull-request`** e voltar ao § 1. Commit direto na branch de integração (fluxo pessoal) → não há PR a rodar; o `reconcile` segue para os gaps de ambiente.

## 7 — Cleanup de órfãos (confirm-first)

Varrer `kanban/06-todo/` e classificar cada card que **não é** o do PR:
- Tem **PR aberto** ou **branch viva** → QA pendente real. **Deixar quieto.**
- **Órfão** (sem PR, sem branch) → provável lixo de rota abandonada.

Listar os órfãos e **perguntar**: *"Esses cards em `06-todo/` não têm PR nem branch — rota mudou e podem ser removidos, ou é QA pendente de verdade?"* Confirmado → `rm`. **Nunca** auto-deletar. **Nunca** rodar `/todo` em órfão.

## Red Flags — STOP

- "O dev marcou done **sem prova** (`09-run-test` ausente/ambíguo/falhado), mergeio assim mesmo" → NÃO. "Done" sem QA documentada = não-testado → front-test.
- "A QA `/method` passou 100% e está documentada, mas re-testo tudo no front por via das dúvidas" → NÃO (o oposto). Isso é **duplicar QA já feita direito**. O code review é teu; no front é **só seguir em frente**.
- "Card em `06-todo`, mergeio e testo depois" → NÃO. Gate de QA: roda `/todo` ANTES.
- "Rodo `/todo` em todos os pendentes de `06-todo`" → NÃO. Só o card do PR. Órfão é cleanup (§ 7).
- "Apago os órfãos de uma vez" → NÃO. Confirm-first, sempre.
- "Fix pequeno no review, não re-testo" → NÃO. Qualquer fix → re-review + re-autentica.
- "O loop de conserto não fecha, sigo reescrevendo no review" → NÃO. ~2–3 rodadas sem convergir = PR cru → REJEITA.
- "Código tá limpo, mas o feature não faz o que o card pede — mergeio" → NÃO. Resolução não-autenticada = rejeita.
- "Para mergear eu reescrevi metade da implementação" → NÃO. Isso é trabalho do dev. Reescrita ≠ review → rejeita e devolve.
- "Achei um null-check faltando, então rejeito o PR" → NÃO (o oposto). Conserto pontual é in-place; rejeição é para inaceitável/reimplementação. Não vire trigger-happy.
- "O dev deixou follow-up aberto mas abro card e mergeio" → NÃO. Card de follow-up não lava violação do `/method`. Ledger sujo = **rejeita**.
- "Mergeei, o ciclo acabou" → NÃO. Editou kanban sem commit+push deixa a árvore suja e os cards no `origin` mentindo — e o `/prod` promoveria sem o que você escreveu.
- "Vou commitar o kanban com `git add -A`" → NÃO. A árvore é compartilhada com sessões paralelas; sempre paths explícitos.
- "O `--delete-branch` já apagou a branch" → apagou **só a remota**. A local também sai, com `fetch --prune` depois.
- "Não consegui aprovar o PR (é meu), então pulo o registro" → NÃO. Registra por comentário e segue: o rastro de que o gate passou fica no PR.
- "Aprovo primeiro e reviso depois, o merge é o que importa" → NÃO. A aprovação **atesta** o review; aprovar antes é assinar em branco.
