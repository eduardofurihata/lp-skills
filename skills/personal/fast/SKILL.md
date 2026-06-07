---
name: fast
description: 'Use when developing features rapidly — /fast É o /method rodando do Step 1 ao Step 8 e PARANDO no Code Review. Mesmas regras, mesmos references, mesmos gateways do /method; a única diferença é ONDE para. Escreve os Test Cases (Step 5) mas NÃO os executa (Step 9 é do /todo). NÃO faz Step 10 (Done/commit). O card em kanban/06-todo/ + o relatório em kanban/08-code-review/ ficam como handoff para o /todo rodar a QA depois.'
effort: max
requires: method
argument-hint: "[feature-name]"
---

# /fast — O /method até o Code Review

**`/fast` NÃO é uma metodologia própria. `/fast` É o `/method`** — mesmas regras, mesmos references (`skills/method/references/*.md`), mesmos gateways, mesma disciplina. **A ÚNICA diferença é ONDE ele para:** roda os Steps 1 a 8 e encerra após o Code Review (Step 8) limpo.

> 🚫 **NÃO crie branch.** Trabalhe SEMPRE na branch atual. Proibido `git checkout -b`, `git switch -c`, `git branch <nome>`. (Mesma regra do /method.)

<HARD-GATE>
1. NÃO redefina nenhum step aqui. Para CADA step, abra o reference do /method (`skills/method/references/0X-*.md`) e siga ao pé da letra — INCLUSIVE o Step 5 (quantidade de TCs = nota de complexidade 1-10 derivada dos Steps 3-4, teto de 10; ver `05-test-cases.md`). /fast NÃO tem regra de test case própria — nada de ISTQB/12 técnicas/escalas paralelas.
2. PARE após o Step 8 (Code Review APROVADO, zero mudanças no último passe). NÃO execute Step 9 (Run Test via front) nem Step 10 (Done/commit).
3. NÃO crie card em `kanban/10-done/`. NÃO delete o card de `kanban/06-todo/`. NÃO commite. Nada disso pertence ao escopo "até o code review".
</HARD-GATE>

## Iron Law (idêntica à do /method)

> **Precisão > Tokens, Velocidade ou Conveniência.**
> "Posso pular isso, é simples" → PARE. Esse pensamento É a violação.
> Prefira gastar 10× mais tokens e acertar do que 1× e errar. Vale para TODOS os steps que /fast roda (1-8).

## Como rodar

Siga a **Ordem de Operações do `/method`** (ver `method/SKILL.md`): Inventário de Docs → Gate Check → TaskCreate → executar os steps em sequência, publicando o **Gateway Check** de cada um no chat. **A diferença é só parar no Step 8.**

| Step | Reference | /fast roda? |
|------|-----------|-------------|
| 1 — Problema | `references/01-problema.md` | ✅ |
| 2 — User Stories | `references/02-user-stories.md` | ✅ |
| 3 — Use Cases | `references/03-use-cases.md` | ✅ |
| 4 — Spec | `references/04-spec.md` | ✅ |
| 5 — Test Cases (**ESCREVE**, não executa) | `references/05-test-cases.md` | ✅ |
| 6 — To Do (+ checklist `## Test Cases (QA)`) | `references/06-todo.md` | ✅ |
| 7a — Plano | `references/07-implementation.md` | ✅ |
| 7b — Codificar | `references/07-implementation.md` | ✅ |
| 8 — Code Review (loop até limpo) | `references/08-code-review.md` | ✅ **← PARA AQUI** |
| 9 — Run Test (via front) | — | ❌ é do /todo |
| 10 — Done (card + commit) | — | ❌ não roda |

**TaskCreate:** crie tasks só para os Steps 1-8 (Discovery 1-5 + To Do + Plano 7a + Codificar 7b + Code Review). Nenhuma task de Step 9 ou 10. Regra do /method: **1 TaskCreate = 1 task** (proibido bundling).

## Loop 7b → 8 (igual ao /method, sem o 9)

```
Codificar (7b) → Code Review (8)
  ↳ APROVADO sem mudanças de código → FIM do /fast
  ↳ FAILED / fix necessário → volta ao 7b → re-review
```

QUALQUER mudança de código invalida o review anterior. O ciclo só encerra com Code Review **APROVADO** e **ZERO mudanças no último passe**. (No /method o loop é 7-8-9; no /fast é 7-8 — o re-test via front é do /todo.)

## Handoff para o /todo (sem artefato extra)

Como o Step 10 não roda, **o estado final do /fast já é o handoff**:

- `kanban/06-todo/<feature>.md` **PERMANECE** (criado no Step 6, não deletado) — é a fila de QA. Já contém a seção `## Test Cases (QA)` com um `- [ ]` por TC (semeada no Step 6, conforme `06-todo.md`).
- `kanban/08-code-review/<feature>.md` **existe** (Step 8) — sinaliza ao /todo que o code review já rodou (`[novo]`, não repete).
- Código fica **não-commitado** na branch atual.

O `/todo` escaneia `kanban/06-todo/`, vê o relatório de review, roda o Step 9 (front) e só então cria o card em `kanban/10-done/` com `tests: passed`.

## Finalizando

Ao aprovar o Step 8, informe:

```
Feature "<nome>" — Dev até Code Review completo (/method Steps 1-8).
Code Review: APROVADO (kanban/08-code-review/<feature>.md)
Test cases: X ESCRITOS (docs/05-test-cases/), PENDENTES de execução.
Fila de QA: kanban/06-todo/<feature>.md (o /todo consome de lá).
Código: NÃO commitado.

Para validar via front, rode /todo. /fast não roda Step 9 nem commita.
```

## Red Flags — STOP

- "Vou pular o Step 4/5 porque é simples" → NÃO. /fast roda os Steps 1-8 COMPLETOS, com as regras do /method.
- "Vou inventar uma regra de test case mais completa (ISTQB, 12 técnicas, 50-100 TCs)" → NÃO. Step 5 = `05-test-cases.md`, `nº TCs == nota de complexidade`, teto de 10. /fast não tem regra própria.
- "Essa feature é complexa, mereço passar de 10 TCs" → NÃO. Teto é 10. Transbordou? Quebre a feature (ver `05-test-cases.md`).
- "Vou criar o card de done com tests: pending" → NÃO. /fast para no Step 8. Quem cria o done é o /todo (após QA) ou o /method (completo).
- "Vou commitar ao terminar" → NÃO. /fast não chega no Step 10. Código fica não-commitado.
- "Vou rodar o Step 9 porque a feature é importante" → NÃO. /fast PARA no 8. Step 9 é do /todo, invocado pelo usuário.
- "Vou pular o code review — é trivial / urgente / CEO pediu" → NÃO. Step 8 é o último gate do /fast. Sem ele, /fast não termina.
- "Vou fazer Step 8 mental, sem relatório" → NÃO. Step 8 = relatório formal em `kanban/08-code-review/` (ver `08-code-review.md`).
- "Vou codar sem plano (7a)" → NÃO. 7a antes de 7b, sempre.
