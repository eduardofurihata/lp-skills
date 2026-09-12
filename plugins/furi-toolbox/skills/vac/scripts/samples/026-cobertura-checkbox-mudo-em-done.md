---
cmd: "check-artifact"
artifact: "kanban/10-done/notion-content-dropdown.md"
expect: "pass"
class: "cobertura-instrumentacao"
rule: "cobertura-checkbox"
origin: "labzz-afl/kanban/10-done/notion-content-dropdown.md:4-8 — 5 itens abertos e mudos num card já entregue (115 casos iguais nos repos)"
note: "O gate é a PASTA (10-done/), não o texto: as 2.578 seções de gate com release do corpus não têm um único checkbox. O item COM estado declarado (`NÃO RODADO` abaixo, e também `skipped`, `❌ FAIL`, `⏳ pendente (motivo)`) nunca é cobrado — ver vac-cobertura.test.mjs."
---
# notion-content-dropdown

## Plano
- [ ] Import `RefreshCw`.
- [ ] Queries (databases+search): `isError`/`isFetching`/`refetch`.
- [x] Derivados: `loadError`/`isFetchingItems`.
- [ ] TC-4: um site fora do ar — **NÃO RODADO via front** (sem ambiente)
