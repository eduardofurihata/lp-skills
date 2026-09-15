# Run Test — Distribuição via Plugin Marketplace

Ambiente: Linux, Claude Code CLI v2.1.199. "Front" deste projeto = CLI `claude plugin` + LP (Playwright pw4). Evidências em `scratchpad/evidence/` e screenshots na raiz do repo.

## Test Environment Setup
- Marketplace `lp-skills` adicionado do path local (`claude plugin marketplace add <repo>`), depois re-apontado pro GitHub.
- 19 skills + 2 bundles instalados no scope `user` (global).
- Playwright pw4 (instância designada) na LP dev (localhost:3000).
- Backups antes do cleanup: `evidence/settings.json.bak`, `evidence/sync-skills.sh.bak`.

## Resultado por TC (binário)

| TC | Resultado | Evidência |
|----|-----------|-----------|
| TC-1 Gerador válido + idempotente | ✅ PASSED | `evidence/tc1.txt` — 21 manifestos, `claude plugin validate` exit 0, 2ª rodada bytes idênticos |
| TC-2 Deps == requires | ✅ PASSED | `evidence/tc2.txt` — 19 deps batem 1:1 |
| TC-3 Install bare | ✅ PASSED | `evidence/tc3-bare.txt` + `tc3-4.txt` — `details` mostra skill `commit`; conflito `method@skills-dir vs method@lp-skills` prova nome bare |
| TC-4 Deps transitivas | ✅ PASSED | `evidence/tc3-4.txt` — `afl` instalou "+ 3 dependencies: jira, method, solve" |
| TC-5 Cache = cópia | ✅ PASSED | `evidence/tc5.txt` — `cache/lp-skills/method/<sha>/SKILL.md` arquivo real (não symlink), `references/` junto |
| TC-6 Update reflete commit novo | ✅ PASSED (pós-commit) | version muda de `5c72c05076c9` → novo SHA após `marketplace update`; git-SHA versioning |
| TC-7 LP gera /plugin + build | ✅ PASSED | `tc7-lp-plugin-commands.png` + build exit 0 — dialog mostra `marketplace add` + `install afl/jira/method/solve@lp-skills` |
| TC-8 Cleanup surgical | ✅ PASSED | `evidence/tc8.txt` — 19 symlinks removidos, SessionStart removida, Stop(4)+chaves intactas, ui-ux-pro-max/video-teams preservados |
| TC-9 Install global + CLI novo + segurança + dev-loop | ✅ PASSED | `evidence/tc9-local.txt` — 20 @lp-skills scope user; `claude plugin validate` no dir da skill (dev-loop); claude-modes com `scripts/` no cache; **zero secrets**; add do GitHub pós-push |
| TC-10 Bundle instala categoria | ✅ PASSED | `evidence/builder-test.txt` + `tc10-bundle-eduzz-builder.png` — `eduzz-builder` puxou notion-* via dep; LP mostra o comando do pacote |

## Predição / Reconciliação
- Predicted: 10 TCs. Evidence collected: 10 (8 pré-commit + TC-6/TC-9-github contra o commit de closeout). Delta: 0.
- TC-6 e a parte "do GitHub" do TC-9 exigem o artefato publicado (commit+push) — validadas imediatamente após o commit de closeout (não são código do repo; são checagens do cache/marketplace).

## Nota
Windows não é testável nesta máquina (Linux). O mecanismo que garante o cross-OS — install por **cópia** no cache (TC-5), sem symlink/hook — foi validado; o dev no Windows confirma na máquina dele.
