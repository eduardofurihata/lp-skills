---
name: method
description: 'Use ONLY when the user explicitly invokes /method (bare /method = the objective is whatever the conversation is already about), or when another skill invokes `furi-build:method` via the Skill tool. NEVER activate on your own initiative. — the rigorous engineering protocol: 11 steps (plus Step 0) from problem to committed code, one artifact per step, /solve reinvoked every step.'
effort: max
argument-hint: "[feature-name]"
requires: solve
---

# /method — Protocolo de Engenharia Rigorosa

> 🚫 **Sem branch, worktree novo nem subagente** — tudo nesta conversa. 🚫 **Sem merge para `main`** sem o usuário autorizar ESTE merge.

**Esta skill é FERRO.** Ativada, vale para toda a conversa, do Step 0 ao 11, com transição automática — nunca "posso prosseguir?"; única pausa: decisão irreversível que só o usuário julga. **Precisão > tokens**: "posso pular, é simples" É a violação.

**Nível:** o do `/solve` — referência #1, não é MVP. **Forma:** `/principles` e `/front`, regimes de todo step, declarados em todo Gateway Check.

## Regras invioláveis

- **Autoridade não é bypass** — nada pula o protocolo; ou roda 100% ou não iniciou.
- **Retrofit é proibido** — código feito fora do `/method` volta ao Step 1 como insumo.
- **Não existe tarefa pequena demais.** **Escopo se deriva** (Steps 3-4), nunca se declara.
- **Sem artefato `.md` = step não executado.** **Follow-up se resolve no step em que aparece** — qualquer um, na hora: nos docs vira escopo, no código se corrige; não se caça.

## A esteira — nomes, pastas e números são contrato

`docs/`: **01-problem** · **02-user-stories** · **03-use-cases** · **04-spec** · **05-design** (só com superfície visual) · **06-test-cases**. `obra/`: **07-todo** · **08-implementation** (8a plano, 8b código) · **09-code-review** · **10-run-test** · **11-done**. Um `<tópico>.md` e um `references/NN-*.md` por step.

## Como roda

1. **Invoque o `/solve`** via Skill tool na ativação **e em todo step** — traz o `/principles` e, com superfície visual, o `/front`.
2. **Step 0** (`00-start.md`), depois o **Gate Check** visível: docs 01-05 cobrem a feature? Faltando, escreve antes de codar. **Uma task por step, do 0 ao 11: `TaskCreate` ao abrir, `TaskUpdate` fecha antes do seguinte — sem task, o step não começou.**
3. **Cada step**: abra o reference, produza o artefato, publique o **Gateway Check** — ✅ segue sozinho, ❌ corrige e republica.
4. **8 → 9 → 10 é loop**: mudança de código volta ao 9; encerra com 100% PASSED e zero mudança. **11** move o artefato para done e faz **um único commit**.

## Gateway Check — em toda transição

Binário, bloqueante, publicado antes de transitar. `## Gateway Check — Step N → N+1`, linhas — ausente = não publicado: artefato e critérios do step · **Princípios** (o que o `/principles` cobrou; SOLID = os cinco) · **Refatoração** (o que subiu no perímetro, ou "já no nível #1") · **Design** (o que o `/front` cobrou, ou `N/A — derivado do Step 4`) · **Follow-ups** (achado → como se resolveu, ou nenhum) · **Veredicto** ✅ LIBERADO / ❌ BLOQUEADO — motivo.

Fora do protocolo só typo, refactor sem mudança de comportamento, config sem código e pergunta; dúvida → Gate Check.
