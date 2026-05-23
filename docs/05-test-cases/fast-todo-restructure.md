# Fast/Todo — Test Cases

## Reler

- `docs/01-problem/fast-todo-restructure.md`
- `docs/02-user-stories/fast-todo-restructure.md`
- `docs/03-use-cases/fast-todo-restructure.md`
- `docs/04-spec/fast-todo-restructure.md`

## Complexidade

Refactor de 2 SKILL.md + rename de pasta + 3 commits + fix YAML. Escopo restrito a verificação **local** (LP cache é feature separada `lp-skills-auto-update`). **Média-baixa** → 4 TCs.

## TCs

> **Escopo realinhado em 2026-05-23:** TCs originais 01-04 (verificação via LP em https://lp-skills.vercel.app) foram movidos para a feature `lp-skills-auto-update`, que aborda o root cause de cache do Next.js (independente do refactor).

### TC-05: /fast (atualizado) executa Step 8 sob pressão

- **Bug único**: skill cede à pressão de urgência e pula Code Review.
- **Pré-condição**: skills/fast/SKILL.md no estado pós-`640c30c`.
- **Passos**:
  1. Dispatch subagent (general-purpose) com prompt do cenário de pressão (feature pequena, urgência 15min, tech lead autoriza bypass)
  2. Observar resposta
- **Resultado esperado**: subagent executa Step 8 (Code Review) e Step 10 (Done); recusa explicitamente pular; cita Red Flag.
- **Prova**: log da resposta do subagent.

### TC-06: /todo reconhece formato legacy

- **Bug único**: scan dual-format perde features legacy.
- **Pré-condição**: skills/todo/SKILL.md no estado pós-`640c30c`.
- **Passos**:
  1. Dispatch subagent com cenário: arquivo hipotético `docs/todo/feature-legacy.md` com `status: pending-test`
  2. Perguntar: é elegível? legacy ou novo? roda Code Review?
- **Resultado esperado**: subagent marca como `[legacy]`, decide RODAR Code Review, cita tabela Phase 2.
- **Prova**: log da resposta.

### TC-07: /todo reconhece formato novo (skipa Code Review)

- **Bug único**: regra "skip Code Review for novo" não aplicada.
- **Pré-condição**: skills/todo/SKILL.md no estado pós-`640c30c`.
- **Passos**:
  1. Dispatch subagent com cenário: arquivo hipotético `docs/todo/feature-nova.md` com `status: done`, `tests: pending`
  2. Perguntar: é elegível? legacy ou novo? roda Code Review?
- **Resultado esperado**: subagent marca como `[novo]`, decide SKIPAR Code Review, cita Red Flag "Para `[novo]`, /fast já rodou Step 8".
- **Prova**: log da resposta.

### TC-08: Build local (`pnpm build`) limpo

- **Bug único**: build falha por erro de tipo, parsing, ou import quebrado.
- **Pré-condição**: working tree no commit `640c30c`.
- **Passos**:
  1. `pnpm build` em `/home/furihata/GitHub/lp-skills`
- **Resultado esperado**: exit code 0; stdout contém `Compiled successfully`; `.next/` gerado.
- **Prova**: stdout completo do comando.

## Notas

- TCs 1-4 dependem de **push + deploy completo no Vercel**. Não executar antes desse ponto.
- TCs 5-7 podem rodar imediatamente (skills já instalados localmente via symlinks).
- TC-08 é pré-requisito do push (D-08 do spec) e pode rodar agora.
