# Evals do furi-toolbox

Suíte para `claude plugin eval` (formato oficial: um diretório por caso, `prompt.md` + `graders/*.md`, `case.yaml` quando precisa de fixture ou env). Roda **à mão**, fora do CI — cada rodada custa chamadas de modelo:

```bash
pnpm eval:vac                                   # todos os casos vac-*, 3 runs (ou `runs:` do caso), com fixtures e Write/Edit liberados
claude plugin eval plugins/furi-toolbox --case vac-ausente --runs 1 --ablation none --trust-plugin --no-publish
```

Detalhes do harness que moldam os graders:

- Prompt que **começa** com `/vac` é comando digitado pelo usuário: a skill expande direto, **sem** chamada `Skill` do modelo — `tool_used: Skill` não conta para ela. Só conta para o que o `/vac` invoca depois (ex.: `/save` em `vac-composicao`).
- Cada run começa num workspace vazio; `case.yaml` + `fixture.sh` criam o projeto-alvo e só rodam com `--scaffold`.
- Os hooks do `/vac` vivem em `hooks/hooks.json` e dormem até o toggle `~/.claude/vac-data/vac/on` — no sandbox ele não existe, então todo caso declara `execution.env: { VAC_ON: "1" }` para os hooks (cartão, bloqueios, ledger) valerem.
- Casos caros (subagente, verificador) declaram `runs: 1`.

Custo de referência: 1 caso × 3 runs = US$ 0,90 (rodada de 2026-09-12); a suíte inteira (14 casos) ≈ US$ 10 — o `eval:vac` tem teto `--max-cost-usd 20`.

Duas camadas de golden set: estes casos medem o **modelo** (pagos); `skills/vac/scripts/samples/` mede o **hook** (`pnpm test:vac`, grátis, determinístico). Uma falha real vira primeiro sample (`/vac caso`); vira eval só quando o que falhou foi o comportamento do modelo, não a regra.

`results/` é gerado a cada rodada e está no `.gitignore`.
