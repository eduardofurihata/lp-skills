---
feature: skills-internas-ship-setup
phase: done
tests: passed
resultado: 7/7 PASSED
branch: main
---

# `/setup` e `/jira-board` saem do menu `/`; `.claude/ship-setup/` — Done

A pergunta era "o `/setup` não deveria ser um processo em vez de skill?"; o incômodo real era **a lista do `/`** — duas skills que o Eduardo nunca digita aparecendo no menu. O Claude Code tem o campo para isso; virar motor custaria 57 menções, 7 relações e o modo direto para esconder duas entradas. Decisões: `docs/04-spec/setup-infra.md` D-16 e D-17.

## O que mudou

| | Antes | Depois |
|---|---|---|
| `/setup`, `/jira-board` | skills visíveis no menu `/`, invocadas só pelas 5 de entrega no Step 0 | **`user-invocable: false`** — fora do menu; invocadas via Skill tool como sempre; "modo direto" vira pedido em prosa que o modelo atende com o argumento |
| `/infra` | visível | visível (o Eduardo chama) |
| Validador | 7 checks | **check 8**: interna sem `requires` apontando pra ela é skill morta — provado a seco no `/infra` |
| LP | — | `Skill.internal` + badge `interna` no card; nó e arestas do grafo intactos |
| Description do `furi-ship` (gerada) e README | listavam as 8 skills iguais | 6 visíveis + "por baixo, fora do menu: `/jira-board` e `/setup`" |
| Layout no repo-alvo | `setup.md`, `infra.md`, `deploy.md`, `patterns.md` soltos em `.claude/` | **`.claude/ship-setup/{setup,infra,deploy}.md`** (+ `.local.md`); `patterns.md` fica na raiz — dono `/method`, pacote `furi-build`, que não conhece o ship |
| Gitignore proposto ao repo de time | 5 negações, uma por arquivo | `.claude/*` + `!.claude/ship-setup/` + `.claude/ship-setup/*.local.md` (+ o par do `patterns`) |
| Migração de caminho | só `deploy` e `patterns` tinham | `setup` e `infra` ganham a deles; `deploy-context` § 3 ganha `.claude/deploy.md` como 2º caminho antigo |
| `lp-skills` | 3 arquivos na raiz de `.claude/` | `git mv` para `.claude/ship-setup/`; `.gitignore` ganha `/.claude/ship-setup/*.local.md` |

## O que foi REUTILIZADO (DRY)

- `user-invocable` — campo nativo, documentado (*"hides it from the `/` menu… Use for background knowledge users shouldn't invoke directly"*), em vez de arquitetura nova.
- A migração lazy do `deploy-context.md` § 3 — mesmo padrão, agora nos três donos.
- O `.yarn/*` + `!.yarn/patches` do próprio `.gitignore` — o padrão de negação de pasta que o bloco novo repete.
- `TARGET_PROJECT_ROOTS` do validador usa só `.claude` — subpasta-safe, zero mudança de código.

## O que foi DESCARTADO (YAGNI)

- `/setup` como motor em `prod/references/` — resolvia a lista ao custo de dois modelos convivendo (o `/infra` fica skill).
- `skillOverrides` no `settings.json` — por máquina, fora do repo.
- Os 4 arquivos juntos em `ship-setup/` — o `patterns.md` do build numa pasta do ship quebraria a fronteira de pacotes.
- Reescrever D-01/D-10/D-12 — decisões são registro; D-17 as revisa.

## Verificação (7/7)

| # | Prova | Resultado |
|---|---|---|
| 1 | `pnpm check` (gen + validate com check 8 + typecheck) | ✅ exit 0 |
| 2 | Check 8 falha quando deve | ✅ `/infra` com `user-invocable: false` a seco → *"sem nenhuma skill listando `infra` em `requires`"*; revertido, sem diff |
| 3 | Manifestos regenerados com a description nova | ✅ `plugins/furi-ship/.claude-plugin/plugin.json` |
| 4 | Substituição dos 6 caminhos em `plugins/` | ✅ 119 trocas em 19 arquivos; `grep` de caminho antigo fora do histórico → **zero** |
| 5 | Gitignore do `lp-skills` | ✅ `.claude/ship-setup/setup.local.md` bate em `.gitignore:67`; `setup.md` não |
| 6 | Repo-alvo simulado: `.claude/` ignorado inteiro → bloco de 3 linhas | ✅ `setup.md`, `infra.md`, `patterns.md` versionáveis; `settings.local.json`, `*.local.md` ignorados |
| 7 | Arquivos reais movidos e cabeçalhos atualizados | ✅ `git mv` ×3; nenhum caminho antigo em `.claude/ship-setup/` |

**Pendente do Eduardo (interativo):** reinstalar o `furi-ship` e abrir o menu `/` — `/setup` e `/jira-board` não aparecem; rodar um `/work` e ver o Step 0 invocando as duas via Skill tool.

## Arquivos

`plugins/furi-ship/skills/{setup,jira-board}/SKILL.md` (frontmatter + modo direto) · `plugins/furi-ship/skills/{work,infra}/SKILL.md` · `plugins/furi-ship/skills/prod/references/deploy-context.md` · 19 arquivos de `plugins/` (caminho) · `scripts/{validate,generate}-plugins.mjs` · `lib/skills.ts` · `components/SkillCard.tsx` · `README.md` · `.gitignore` · `.claude/ship-setup/` (3 movidos) · `docs/04-spec/setup-infra.md` (D-16, D-17)
