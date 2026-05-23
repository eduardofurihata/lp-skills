# Plano de Implementação — fast-todo-restructure

## 1. Contexto Consolidado

- **Problema** (01-problem): /fast bloqueia em pending-test exigindo /test; nome /test é genérico; YAML quebra em descriptions não-quotadas.
- **Stories** (02-user-stories): 9 stories cobrindo Dev (US-01..05), LP (US-06..07), Manutenedor (US-08..09).
- **Use Cases** (03-use-cases): 19 UCs reconciliados com 3 commits locais existentes (74aed17, 1a43061, 640c30c).
- **Spec** (04-spec): 10 decisões. Web-only. Dual-field tracking. Rename /test→/todo. YAML escape com aspas simples. Cache invalidation contingência.
- **TCs** (05-test-cases): 8 TCs (4 LP via Playwright, 3 skills via subagent, 1 build local).

## 2. Código Existente Relevante

### Arquivos alterados (já em commits)

| Arquivo | Responsabilidade | Impacto desta mudança |
|---------|------------------|------------------------|
| `skills/fast/SKILL.md` | Protocolo /fast (markdown + YAML frontmatter) | Steps 8+10 incluídos; HARD-GATE/checklist/fluxo/tracking/Red Flags atualizados; description quoted |
| `skills/todo/SKILL.md` (era `skills/test/`) | Protocolo /todo (markdown + YAML frontmatter) | Frontmatter (name), Phase 1/2/4 dual-format, fluxo + Red Flags adaptados; description quoted |

### Arquivos NÃO alterados (verificados via grep, nada a fazer)

| Arquivo | Por que não muda |
|---------|------------------|
| `skills/method/SKILL.md` e `references/*` | Zero referências a `/test` ou `/fast` como slash commands |
| `lib/skills.ts` | Lê dinâmico via `fs.readdir` + `gray-matter`; absorve mudanças automaticamente |
| `app/page.tsx`, `components/SkillsClient.tsx`, `components/SkillGrid.tsx` | Renderiza qualquer `Skill[]` — não tem hardcoded names |
| `CLAUDE.md`, `AGENTS.md`, `README.md` | Não citam /test ou /fast como contratos (grep retorna zero) |
| `next.config.ts`, `package.json`, `tsconfig.json` | Sem mudança de stack |

### Configuração i18n — NÃO aplicável

Grep do projeto:
```bash
grep -rE "next-intl|react-i18next|i18next|locales/|translations/|messages/" /home/furihata/GitHub/lp-skills/ --include="*.ts" --include="*.tsx" --include="*.json" 2>/dev/null
```
Zero matches. Projeto não tem sistema i18n. Strings em PT-BR e inglês são literais nos componentes (Hero, SkillCard, StickyInstallBar). Sem chaves de tradução; sem ação necessária.

## 3. Estratégia de Implementação

### Sequência

```
[FEITO] T-01..T-04: rename + edits + YAML fix + symlink
[AGORA] T-05..T-08: Code Review (Step 8 do /method)
[AGORA] T-09..T-14: TCs locais (Step 9 — parte 1)
[USER]  T-15..T-16: Push + Aguardar deploy (shared state — pedir confirmação)
[AGORA] T-17..T-20: TCs pós-deploy (Step 9 — parte 2)
[CONT.] T-21..T-22: Force redeploy se TC-01 falhar
[AGORA] T-23: Audit Pós-Execução
[AGORA] T-24..T-25: Done + Ship
```

### Big apps — Referência

Não aplicável para o conteúdo dos SKILL.md (são protocolos textuais), mas as práticas de escrita do protocolo seguem:
- **GitHub Skills schema** (frontmatter YAML com `name`, `description`) — padrão adotado
- **Notion blocks** (markdown estruturado) — padrão adotado
- **OpenAPI/Swagger** (description quoted quando contém `:`) — padrão YAML que estamos aplicando

### Consistência UI/UX

- Os SKILL.md seguem o padrão **já existente** no projeto: HARD-GATE no topo, REGRA FUNDAMENTAL, Checklist, Fluxo (dot graph), seções, Red Flags. Não invento estrutura nova.
- LP cards: nada muda; o SkillCard renderiza qualquer skill com frontmatter válido.

## 4. Mapa TC → Código

| TC | Bug coberto | Código/Arquivo |
|----|-------------|----------------|
| TC-01 | LP omite skills | `lib/skills.ts:32-58` (parsing) + `skills/*/SKILL.md` (frontmatter válido) |
| TC-02 | rename incompleto | ausência de `skills/test/` no working tree + `name: todo` no frontmatter |
| TC-03 | description velha do /fast | `skills/fast/SKILL.md:3` (description quoted, novo conteúdo) |
| TC-04 | description com YAML quebrado | `skills/todo/SKILL.md:3` (description quoted) |
| TC-05 | /fast cede sob pressão | `skills/fast/SKILL.md` (HARD-GATE + Red Flags + Loop 7b→8) |
| TC-06 | scan legacy quebrado | `skills/todo/SKILL.md` Phase 1 §3 (filtro dual) + Phase 2 tabela "Quando rodar" |
| TC-07 | skip Code Review novo não aplicado | `skills/todo/SKILL.md` Phase 2 tabela + Red Flag |
| TC-08 | build falha | `next.config.ts`, `tsconfig.json`, `package.json` (sem mudança esperada) |

## 5. Riscos e Pontos de Atenção

| Risco | Mitigação |
|-------|-----------|
| Push para origin/main sem confirmação do user | T-15 marcado como `[USER]` — pedir confirmação explícita |
| Build local quebrar (TC-08) | Rodar ANTES do push; se falhar, investigar e fixar |
| Cache stale após push (Bug 2 hipótese) | T-21..T-22 contingência: force redeploy sem cache |
| LP demorar pra atualizar pós-deploy | Aguardar Vercel build Ready via `vercel ls`; ISR `revalidate=300` pode demorar até 5min |
| Symlink local quebrar em sessão futura | Já atualizado (`~/.claude/skills/todo`); persistente |
| Outro deploy "Building" em paralelo (visto durante a sessão) | Aguardar Ready; verificar commit deployado bate com 640c30c |

## 6. Checklist de Implementação

### Step 7b (já feito)
- [x] T-01 a T-04 (commits 74aed17, 1a43061, 640c30c + symlink)

### Step 8 (Code Review — pendente)
- [ ] T-05 Review skills/fast/SKILL.md contra UCs e Spec
- [ ] T-06 Review skills/todo/SKILL.md contra UCs e Spec
- [ ] T-07 Grep zero referências obsoletas em todos os locais
- [ ] T-08 Validar parsing YAML local de 8 skills

### Step 9 (Run Test — pendente)
- [ ] T-09 Pre-flight TCs
- [ ] T-10 Audit Pré-Execução publicado
- [ ] T-11 TC-05 (pressure /fast)
- [ ] T-12 TC-06 (/todo legacy)
- [ ] T-13 TC-07 (/todo novo)
- [ ] T-14 TC-08 (build local)
- [ ] T-15 git push (precisa OK do user)
- [ ] T-16 Vercel Ready
- [ ] T-17 TC-01 (LP 8 skills)
- [ ] T-18 TC-02 (sem /test)
- [ ] T-19 TC-03 (/fast description)
- [ ] T-20 TC-04 (/todo description)
- [ ] T-21..T-22 Contingência (se TC-01 fail)
- [ ] T-23 Audit Pós-Execução publicado

### Closeout
- [ ] T-24 Step 10 Done
- [ ] T-25 Step 11 Ship com smoke evidência

## Notas

- O **Step 7b está completo** (código já implementado). Esta task fica como insumo — qualquer ajuste descoberto no Code Review (Step 8) volta para 7b e reinicia o Loop 7-8-9.
- **Pre-push validation (T-14)** é OBRIGATÓRIO antes de T-15 (D-08 do Spec).
- Se Code Review (Step 8) encontrar issues que exigem novo commit, gera novo commit, todos os TCs do Step 9 são re-executados (Iron Law: any code change invalidates).
