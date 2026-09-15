# Step 0 — Start (estrutura + inventário)

**Antes de qualquer step: as pastas estão certas e eu sei o que já existe.** Roda UMA vez, no início. Não produz artefato `.md` — publica os dois blocos abaixo no chat e, se preciso, arruma as pastas.

**Chame e use:** `rationalizations.md` · `SKILL.md` § Gateway Check

## 1. Estrutura — a numeração das pastas é contrato

Confira as pastas do projeto contra a tabela. **Pasta na numeração antiga → `git mv` para a nova** (preserva histórico); pasta fora do contrato, numeração duplicada ou lacuna → reporte e corrija. Só pergunte quando houver ambiguidade real (duas pastas disputando o mesmo step).

| Step | Pasta | Numeração antiga que ainda aparece por aí |
|---|---|---|
| 0 | `docs/00-context/` | — (não se renumera; ver § 3) |
| 1 | `docs/01-problem/` | — |
| 2 | `docs/02-user-stories/` | — |
| 3 | `docs/03-use-cases/` | — |
| 4 | `docs/04-spec/` | — |
| 5 | `docs/05-design/` | `docs/04-design/` |
| 6 | `docs/06-test-cases/` | `docs/05-test-cases/` |
| 7 | `kanban/07-todo/` | `kanban/06-todo/` |
| 8 | `kanban/08-implementation/` | `kanban/07-implementation/` |
| 9 | `kanban/09-code-review/` | `kanban/08-code-review/` |
| 10 | `kanban/10-run-test/` | `kanban/09-run-test/` |
| 11 | `kanban/11-follow-ups/` | — (pasta nova) |
| 12 | `kanban/12-done/` | `kanban/10-done/` |

> Renomeie **do maior para o menor** (`10-done` → `12-done` antes de `09-run-test` → `10-run-test`, e assim por diante) — na ordem inversa, um rename sobrescreve o outro.

Pasta que não existe ainda **não se cria vazia**: ela nasce quando o step que a usa produzir o artefato.

```markdown
## Step 0 — Estrutura
- Pastas no contrato: <N>/13 · renomeadas agora: <lista `antiga → nova`, ou nenhuma>
- Fora do contrato: <lista, e o que foi feito> / nenhuma
- **Status:** ✅ estrutura OK / ❌ ambiguidade — [o que precisa de decisão]
```

## 2. Inventário de docs

**Scan único**, para não re-escanear a cada step e para decidir criar/atualizar/mesclar/excluir com consistência.

```
1. LISTAR TUDO — Glob docs/**/*.md e kanban/**/*.md (todas as pastas de uma vez)
2. LER — o CONTEÚDO de CADA arquivo (não só o nome)
   - Muitos arquivos: leia pelo menos título + H2s + primeira frase de cada seção
3. MAPEAR — para cada arquivo: tópico/domínio, features documentadas
4. ANOTAR — quais se relacionam com a feature atual? (mesma área, fluxo, tela ou domínio)
```

- **Ler = ler o CONTEÚDO, não o nome.** Glob retorna nomes; nomes não dizem tudo.
- **Features relacionadas = mesmo arquivo.** "Adicionar PIX" + "adicionar boleto" → `pagamentos.md`.
- **O nome do arquivo reflete o DOMÍNIO, não a task.** ✅ `pagamentos.md`, `autenticacao.md`, `dashboard-admin.md` · ❌ `feat-1.md`, `add-pix.md`.
- **Ao mesclar, preserve todo conteúdo relevante** — reorganize, não descarte. Dentro do arquivo, H2/H3 separam features.

| Situação | Ação |
|----------|------|
| Arquivo relacionado existe (mesmo domínio) | **ATUALIZAR** (nova seção ou merge) |
| Nada relacionado existe | **CRIAR**, nomeado por domínio |
| Arquivos redundantes | **MESCLAR** num só; deletar os redundantes |
| Arquivos obsoletos | **DELETAR** |

**Anti-padrão:** `Glob docs/01-problem/*.md` → não acha `minha-feature.md` → cria novo. O correto: o inventário já sabe que existe `pagamentos.md`, e PIX é pagamento → **atualiza**.

```markdown
## Step 0 — Inventário
- Docs lidos: <N> em <M> pastas
- Relacionados a esta feature: <arquivo → por quê> / nenhum
- Ação por step: <01: atualizar pagamentos.md · 04: criar … >
```

## 3. `docs/00-context/` — brainstorming, fora da esteira

Rascunho, anotação de conversa, print, referência solta, estudo que ninguém sabe se vira feature: é ali que mora, e **não entra nos steps**. O Step 0 apenas **lista** o que existe como insumo; o que for virar trabalho entra pelo **Step 1**, escrito do jeito que o Step 1 exige.

- Não se renumera, não se organiza por feature, não vira artefato.
- Doc de lá **não substitui** nenhum step — citar um rascunho não cumpre Problema, Spec nem Design.
- Conhecimento **permanente** do projeto (convenções, infra, padrões de código) não é brainstorming e não mora aqui: ele vive em `.claude/`, lido sob demanda por quem usa.

## Saída do Step 0

Os dois blocos publicados no chat (**Estrutura** e **Inventário**) e as pastas arrumadas. Não há gateway: o Step 0 não produz artefato — ele garante que os próximos produzam no lugar certo. Ambiguidade de estrutura não resolvida → **pare e pergunte** antes do Step 1.
