---
feature: branch-lote-pr-idempotente
phase: done
tests: passed
resultado: 6/6 PASSED
branch: main
---

# Branch que acumula cards, PR idempotente e integração por evidência — Done

`/work 2218` + `/pull-request` passam a bastar em qualquer repositório: a política que o Eduardo redigitava no prompt todo dia ("feitos nessa branch", "dentro do PR aberto por mim", `/sync main gh > this branch`) agora mora no `.claude/setup.md` e é executada por quem tem o dever de executá-la. Decisão registrada: `docs/04-spec/setup-infra.md` D-15.

## O que mudou

| | Antes | Depois |
|---|---|---|
| § Branch (`/setup`) | 2 modos; multi-card era um exemplo órfão num comentário HTML | 3 modos — **`branch acumula cards`** entra; o nome fica no 1º card; caixa vem do placeholder (`<KEY>-<n>` → `AV-2192`); inferida dos PRs mergeados |
| Cards de um lote | ninguém sabia (nome da branch trazia só o 1º) | derivados dos **commits** (`git log origin/<integração>..HEAD --no-merges`, subject + trailer `Jira:`) — uma fonte, três consumidores (título, `## Cards`, Jira de cada card) |
| `/pull-request` com PR já aberto | `gh pr create` incondicional — estourava na 2ª execução | `gh pr list --head` antes; existe ⇒ `gh pr edit` |
| `/pull-request` com `Abre PR: não` | **parava antes do push** — repo sem PR não publicava nada até o `/prod` | pusha, espelha em cada card, promove o kanban; pula só o `gh pr create` |
| `branch por card` + `Abre PR: não` | contradição, não gravava | válido: a branch sobe por push |
| Key do commit (`/method` Step 10) | do nome da branch — num lote, o 2º card saía com a key do 1º | do **card ativo** (`[KEY-N]`, passado pelo `/work`); nome da branch é fallback |
| Integração (`deploy-context` § 1) | `ls-remote origin dev` vazio ⇒ `main` — `develop`/`homolog`/`staging` viravam "branch única" | base dos PRs recentes → `dev`/`develop` → default do GitHub; produção = `main`/`master`; branch parada descartada |
| `/work` com override de sessão | aplicava e esquecia | aplica e **oferece** `/setup branch` no fim |

## O que foi REUTILIZADO (DRY)

- A regra "só `/setup <seção>` reescreve" — o `/work` não ganhou escrita; ganhou uma oferta.
- O push que o `/pull-request` já fazia (passo 1) — o modo `não` só muda onde o guard fica.
- `pr-cycle.md` § 6 já tinha a carve-out de `Abre PR: não`; o `reconcile.md` passa a apontar pra ela em vez de abrir um gap que não fecha.
- `jira-sync.md` continua a fonte única de transição — ganhou a linha "publicado sem PR".
- `ship.md` do `eduzz-builder` já fazia "push, e pula o PR" — o furi-ship se alinhou a ele, sem citá-lo (pacotes irmãos não se conhecem; o `validate:plugins` cobra).

## O que foi DESCARTADO (YAGNI)

- **Renomear a branch a cada card.** O parser do Jira exige a key completa: em `AV-2192-2218` lê só `AV-2192`. Linear/GitHub/GitLab mantêm a branch com identidade estável.
- **`Abre PR` com 3 valores.** "Novo vs. reusa" decorre do § Branch; o GitHub nem permite dois PRs da mesma head.
- **Anotar os cards do lote** no setup ou no kanban. Apodrece a cada card — o título do PR #173 provou (5 no título, 11 nos commits).
- **`/work` dar o push** no modo `não`. Quebraria "para no commit local" e faria o comando variar por projeto.

## Verificação (6/6)

| # | Prova | Resultado |
|---|---|---|
| 1 | `.claude/setup.md` do `lp-skills` (`direto` + `Abre PR: não`) continua válido sem edição | ✅ valores preservados |
| 2 | Integração por evidência em 3 topologias reais | ✅ `labzz-afl` → `main` (19/20 PRs; `homolog` morta ignorada) · `vibe-nivee` → `dev` (20/20; default `dev`, produção `main`) · `labzz-sementezz` → `main` |
| 3 | Cards da branch `AV-2192` derivados dos commits | ✅ 11 keys limpas com `--no-merges` + subject + trailer; `%b` trazia 21 (cards relacionados) e o título do PR #173 tinha 5 |
| 4 | Idempotência: PR aberto da branch é encontrado antes de criar | ✅ `gh pr list --head AV-2192 --base main --state open` → #173 (edit real não rodou: trabalho vivo) |
| 5 | Modo `não`: guard reposicionado, push permanece no passo 1, passo 3 pulado | ✅ por leitura do fluxo |
| 6 | `pnpm check` (gen + validate + typecheck) | ✅ exit 0 — pegou e corrigiu uma citação cruzada `eduzz-builder → /pull-request` |

## Arquivos

`plugins/furi-ship/skills/setup/{SKILL.md,references/template.md}` · `plugins/furi-ship/skills/work/SKILL.md` · `plugins/furi-ship/skills/pull-request/SKILL.md` · `plugins/furi-build/skills/method/{SKILL.md,references/10-done.md}` · `plugins/furi-ship/skills/prod/{SKILL.md,references/deploy-context.md,references/reconcile.md,references/jira-sync.md,references/pr-cycle.md}` · `plugins/eduzz-builder/skills/repro/SKILL.md` (1 linha) · `docs/04-spec/setup-infra.md` (D-15)
