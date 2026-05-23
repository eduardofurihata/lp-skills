# Fast/Todo Restructure — To Do

## Reler

- `docs/01-problem/` até `docs/05-test-cases/fast-todo-restructure.md`

## Tasks

Código já implementado em 3 commits locais. Este To Do reflete as tasks pendentes do Step 7b em diante.

### Implementação (Step 7b — já feito)

- [x] **T-01** Rename `skills/test/` → `skills/todo/` via `git mv` + edits internos (commit `74aed17`)
- [x] **T-02** Update `skills/fast/SKILL.md` com steps 8 + 10 + tracking dual-field + Red Flags (commit `1a43061`)
- [x] **T-03** Fix YAML quoting nas descriptions (commit `640c30c`)
- [x] **T-04** Atualizar symlink local `~/.claude/skills/todo`

### Code Review (Step 8 — pendente)

- [ ] **T-05** Revisar `skills/fast/SKILL.md` contra Use Cases (UC-01 a UC-07) e Spec (D-01, D-03, D-06)
- [ ] **T-06** Revisar `skills/todo/SKILL.md` contra Use Cases (UC-08 a UC-11) e Spec (D-02, D-03, D-05, D-06)
- [ ] **T-07** Verificar zero referências obsoletas em `/method/`, `CLAUDE.md`, `AGENTS.md`, `README.md`, `lib/`, `app/`, `components/` (grep `/test\b`, `pending-test`)
- [ ] **T-08** Validar YAML parsing local de todas as 8 skills via node + gray-matter

### Testing (Step 9 — pendente)

#### Pre-flight (antes de qualquer TC)

- [ ] **T-09** Pre-flight: classificar TCs 1-8 em READY/NEEDS SETUP/BLOCKED
- [ ] **T-10** Audit Pré-Execução: publicar no chat com ratio M==N

#### TCs locais (sem depender de deploy)

- [ ] **T-11** TC-05: pressure test do /fast (subagent)
- [ ] **T-12** TC-06: /todo recognize legacy (subagent)
- [ ] **T-13** TC-07: /todo recognize novo (subagent)
- [ ] **T-14** TC-08: build local `pnpm build`

#### Push + Deploy

- [ ] **T-15** `git push origin main` (3 commits)
- [ ] **T-16** Aguardar Vercel build Ready (monitorar via `vercel ls` ou UI)

#### TCs pós-deploy (front via Playwright)

- [ ] **T-17** TC-01: LP renderiza 8 skills
- [ ] **T-18** TC-02: /test ausente na LP
- [ ] **T-19** TC-03: /fast tem descrição nova
- [ ] **T-20** TC-04: /todo tem descrição com `tests: pending`

#### Contingência (se TC-01 falhar)

- [ ] **T-21** Force redeploy sem cache via Vercel UI ou CLI (`vercel redeploy <url> --force`)
- [ ] **T-22** Re-rodar TC-01 a TC-04 após cache invalidado

#### Audit pós-execução

- [ ] **T-23** Audit Pós-Execução: ratio C==N e E==N publicado, status agregado

### Closeout (Steps 10-11)

- [ ] **T-24** Step 10 — Done: criar `kanban/10-done/fast-todo-restructure.md` com resumo + links
- [ ] **T-25** Step 11 — Ship: criar `kanban/11-ship/fast-todo-restructure.md` (smoke prod = TC-01 + screenshot, evidência)

## Dependências

```
T-01..T-04 (FEITAS) → T-05..T-08 (Code Review) → T-09..T-14 (TCs locais) → T-15..T-16 (Push+Deploy) → T-17..T-20 (TCs pós-deploy) → T-23 → T-24 → T-25
```

T-21..T-22 (contingência): só se T-17 falhar.

## Notas

- Push e deploy são **shared state actions** — pedir confirmação ao usuário antes de T-15.
- Step 11 requer smoke em prod com evidência — TC-01 PASSED com screenshot serve.
