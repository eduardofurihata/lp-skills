# Step 0 — Start (estrutura + inventário)

**Antes de qualquer step: as pastas estão certas e eu sei o que já existe.** Roda UMA vez. Não produz artefato — publica os dois blocos abaixo no chat e, se preciso, arruma as pastas. Ambiguidade de estrutura não resolvida → **pare e pergunte** antes do Step 1.

## 1. Estrutura — a numeração das pastas é contrato

Confira as pastas do projeto contra o contrato. **`kanban/` (nome antigo) → `git mv kanban obra` primeiro; numeração antiga → `git mv` para a nova** (preserva histórico), **do maior para o menor** — na ordem inversa, um rename sobrescreve o outro. Pasta fora do contrato, duplicada ou com lacuna → reporte e corrija; pasta que ainda não existe **não se cria vazia**, nasce com o artefato do step.

| Step | Pasta | Antiga |
|---|---|---|
| 0 | `docs/00-context/` | — (fora da esteira, § 3) |
| 1 | `docs/01-problem/` | — |
| 2 | `docs/02-user-stories/` | — |
| 3 | `docs/03-use-cases/` | — |
| 4 | `docs/04-spec/` | — |
| 5 | `docs/05-design/` | `04-design` |
| 6 | `docs/06-test-cases/` | `05-test-cases` |
| 7 | `obra/07-todo/` | `06-todo` |
| 8 | `obra/08-implementation/` | `07-implementation` |
| 9 | `obra/09-code-review/` | `08-code-review` |
| 10 | `obra/10-run-test/` | `09-run-test` |
| 11 | `obra/11-follow-ups/` | — (nova) |
| 12 | `obra/12-done/` | `10-done` |

**Mexeu nas pastas? Commite só a arrumação antes do Step 1** (`chore: renumera docs/obra`) — ela não entra no commit único da feature.

```markdown
## Step 0 — Estrutura
- Pastas no contrato: <N>/13 · renomeadas agora: <antiga → nova, ou nenhuma> · commit: <sha> / nenhum
- Fora do contrato: <lista e o que foi feito> / nenhuma
- **Status:** ✅ estrutura OK / ❌ ambiguidade — [o que precisa de decisão]
```

## 2. Inventário de docs

**Scan único** de `docs/**/*.md` e `obra/**/*.md`, lendo o **conteúdo** (não só o nome — nomes não dizem tudo): tópico de cada arquivo e o que se relaciona com a feature atual (mesma área, fluxo, tela ou domínio).

- **O nome do arquivo é o domínio, não a task** — `pagamentos.md`, `autenticacao.md`; nunca `feat-1.md`, `add-pix.md`. Features do mesmo domínio moram no mesmo arquivo, separadas por H2/H3.
- **Relacionado existe → ATUALIZAR** (nova seção ou merge) · nada existe → **CRIAR** por domínio · redundantes → **MESCLAR** num só, preservando todo conteúdo relevante · obsoletos → **DELETAR**.
- Anti-padrão: `Glob docs/01-problem/*.md` não acha `minha-feature.md` → cria novo. O inventário já sabe que `pagamentos.md` existe e PIX é pagamento → **atualiza**.

```markdown
## Step 0 — Inventário
- Docs lidos: <N> em <M> pastas
- Relacionados a esta feature: <arquivo → por quê> / nenhum
- Ação por step: <01: atualizar pagamentos.md · 04: criar …>
```

## 3. `docs/00-context/` — brainstorming, fora da esteira

Rascunho, anotação, print, estudo que ninguém sabe se vira feature: mora ali e **não entra nos steps**. O Step 0 só **lista** o que existe como insumo; o que for virar trabalho entra pelo Step 1, do jeito que o Step 1 exige. Não se renumera, não vira artefato, não substitui nenhum step. Conhecimento **permanente** do projeto (convenções, infra, padrões) não é brainstorming: vive em `.claude/`, lido sob demanda.
