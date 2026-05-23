---
date: 2026-05-23
task: Plan Task 2 — Baseline for /test legacy format recognition
agent: general-purpose subagent (ac78905e8914a8ea0)
total_tokens: 28909
---

# Baseline: /test reconhece formato legacy

## Cenário aplicado

Arquivo `docs/todo/feature-legacy.md` (hipotético) com frontmatter:
```
status: pending-test
feature: feature-legacy
branch: main
created: 2026-05-20
```

## Comportamento observado

✅ Subagent reconhece o formato.

- Identifica pelo padrão `docs/todo/*.md`
- Lê frontmatter procurando `feature`, `status`, `branch`, `created`
- Confirma `status: pending-test` como gatilho para processamento
- Aceitaria `$ARGUMENTS = "feature-legacy"` para seleção direta

## Steps que /test executaria

1. Phase 1: Scan + seleção via argumento
2. Phase 2: Code Review (Step 8) — observação importante: subagent notou que docs/01-04 e plano podem não existir para legacy features, o loop de review precisa de material; provavelmente pediria input ao user
3. Phase 3: Run Test (Step 9) — pre-flight com 2 TCs, criar tasks de grupo + individuais, audit pré/pós, executar via Playwright MCP
4. Phase 4: Done (Step 10) — criar `kanban/10-done/`, mover para `docs/done/feature-legacy.md` com `status: done`

## Conclusão (RED)

`/test` atual reconhece formato legacy (`status: pending-test`). Esse comportamento deve ser PRESERVADO no novo `/todo` para garantir compatibilidade.

## Implicações para a refatoração

1. `/todo` deve aceitar `status: pending-test` (legacy) como gatilho de scan
2. `/todo` deve aceitar `tests: pending` (novo formato) como gatilho alternativo
3. Para features legacy, `/todo` precisa rodar Step 8 (Code Review) — o `/fast` antigo não rodava
4. Para features novas, `/todo` deve PULAR Step 8 — o `/fast` novo já rodou
5. Subagent notou que docs/01-04 podem faltar em features legacy — `/todo` deve lidar com isso (warning ou skip controlado)
