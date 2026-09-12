# Evals do furi-toolbox

Suíte para `claude plugin eval` (formato oficial: um diretório por caso, `prompt.md` + `graders/*.md`, `case.yaml` quando precisa de fixture). Roda **à mão**, fora do CI — cada rodada custa chamadas de modelo:

```bash
pnpm eval:vac                                   # todos os casos vac-*, 3 runs, com fixtures e Write/Edit liberados
claude plugin eval plugins/furi-toolbox --case vac-ausente --runs 1 --ablation none --trust-plugin --no-publish
```

Dois detalhes do harness que moldam os graders:

- Prompt que **começa** com `/vac` é comando digitado pelo usuário: a skill expande direto, **sem** chamada `Skill` do modelo — `tool_used: Skill` não conta para ela. Só conta para o que o `/vac` invoca depois (ex.: `/save` em `vac-composicao`).
- Cada run começa num workspace vazio; `case.yaml` + `fixture.sh` criam o projeto-alvo e só rodam com `--scaffold`.

`results/` é gerado a cada rodada e está no `.gitignore`.
