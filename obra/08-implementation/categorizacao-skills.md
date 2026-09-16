# Plano de Implementação — Categorização de Skills (Pessoal / Eduzz)

## 1. Contexto Consolidado
- **Problema** (01): skills fragmentadas em 2 repos sem separação pessoal/Eduzz.
- **Stories** (02): autor quer catálogo único com buckets; dev quer filtrar por categoria; colega Eduzz quer achar skills de trabalho marcadas.
- **Use Cases** (03): 25 UCs — leitura 2 níveis + resiliência, badges, filtro (Todas/Pessoal/Eduzz) com seleção preservada, install por categoria, migração, sanitização, descontinuação.
- **Spec** (04): 21 decisões. Buckets físicos + categoria derivada; union fixo `Category`; leitor itera buckets; filtro via Tabs; badge por categoria; install path com bucket / destino plano; slug único global; sanitização (credencial removida, AV-→genérico no jira, AV-* no afl, notion paths); descontinuar labzz só após push+build verde.

## 2. Código Existente Relevante

| Arquivo | Faz | Mudança |
|---|---|---|
| `lib/skills.ts` | Server-only (`node:fs` + gray-matter). Varre `skills/*`, parseia SKILL.md, retorna `Skill[]` plano | Varredura 2 níveis (`skills/<cat>/*`) + campo `category` |
| `lib/install-prompt.ts` | **Puro** (sem node) — vai no bundle client. `generatePrompt({skills:string[], scope})`, source-path `${SOURCE_DIR}/skills/${slug}` | Aceitar `{slug,category}`, source-path com `${category}` |
| `components/SkillsClient.tsx` | Client. Estado liftado `selected:Set`, `scope`. Deriva `selectedSlugs` | + estado `categoryFilter`; derivar `selectedSkills:{slug,category}[]`; filtrar grid |
| `components/SkillCard.tsx` | Card; usa `Badge` p/ effort | + badge de categoria (via `CategoryBadge`) |
| `components/SkillGrid.tsx` | Grid + empty state | Recebe lista já filtrada; empty state já serve |
| `components/StickyInstallBar.tsx` | Barra; prop `selectedSlugs:string[]` → Viewer | prop vira `selectedSkills:{slug,category}[]` |
| `components/InstallPromptViewer.tsx` | Client; `generatePrompt({skills,scope})` | `skills` vira `{slug,category}[]` |
| `components/Hero.tsx` | Copy "setup pessoal" | Copy reflete pessoais + trabalho |
| `components/ui/tabs.tsx`, `badge.tsx` | Primitives (Radix Tabs; Badge variants default/accent/outline) | Reusar; **não** alterar |
| `README.md` | Copy | Atualizar |

- **i18n:** projeto **NÃO** tem i18n (sem next-intl/i18next/locales nas deps). Strings literais em **PT** (padrão atual: Hero/ScopeSelector em PT). Mantém literais PT.

### ⚠️ Fronteira server/client (decisão estrutural)
`install-prompt.ts` é importado por `InstallPromptViewer` (`"use client"`) ⇒ está no bundle client e **deve permanecer livre de `node:*`**. `skills.ts` importa `node:fs`. Portanto `Category` **NÃO** pode ser exportado de `skills.ts` (arrastaria `fs` pro client).
**Solução:** novo módulo **puro** `lib/categories.ts` com `Category`, `CATEGORIES`, `CATEGORY_LABELS`. Importado por `skills.ts`, `install-prompt.ts` e componentes. Sem `node:*` nele.

## 3. Estratégia de Implementação

**Ordem:** migração de conteúdo (T1-T6) → código (T7-T9) → build (T10). Migração antes do código porque o Step 9 testa o site lendo os buckets já populados.

### Referência big apps (UI/UX)
- **Filtro por categoria com contagem:** VS Code Marketplace, Raycast Store, GitHub (filtros de repo), Linear (filter tabs), Notion (views) — segmented control/tabs com label + contagem. Reusar o **mesmo padrão visual do `ScopeSelector`** (já é Tabs) = consistência interna é LEI.
- **Badge de categoria:** GitHub topic labels / npm keywords — cor distinta por categoria. **Seleção já usa roxo (accent)**; para não colidir, Eduzz usa **esmeralda** (novo token), Pessoal usa `default` (sóbrio).

### Tasks
- **T1** Criar `skills/personal/` e `skills/eduzz/`; `git mv` das 10 skills → `personal/`.
- **T2** `cp -r labzz-skillzz/skills/make-dev skills/personal/make-dev`.
- **T3** `cp -r` `afl jira notion-pull notion-push` → `skills/eduzz/` (sem `git add`).
- **T4** Sanitizar `skills/eduzz/jira`: remover linha da credencial (`SKILL.md`), ajustar `references/07-investigation.md`; `AV-…`→`PROJ-123`/`PROJ-123-456` (5 arquivos). Manter `can create users: yes`, `argument-hint:"[CARD-CODE]"`.
- **T5** `skills/eduzz/afl/SKILL.md`: adicionar `## Contexto Eduzz` com `AV-*` (ex.: AV-36; multi AV-36-40-55) + test user via `can create users`; atualizar bloco "Environment, Branching, Test User".
- **T6** `skills/eduzz/notion-pull`+`notion-push`: path interno→`<caminho-do-pm-forge>`; nomes de doc→genéricos; `insta`→`<slug>`/`exemplo`; manter `localhost:9432`.
- **T7** `lib/categories.ts` (novo, puro) + `lib/skills.ts`:
  ```ts
  // lib/categories.ts
  export type Category = "personal" | "eduzz";
  export const CATEGORIES: Category[] = ["personal", "eduzz"];
  export const CATEGORY_LABELS: Record<Category, string> = { personal: "Pessoal", eduzz: "Eduzz" };
  ```
  `skills.ts`: `Skill` ganha `category: Category`; `getSkills` itera `CATEGORIES`, `readdir(skills/<cat>)`, parseia, anexa `category`; mantém resiliência (try/catch por skill, `readdir` por bucket com catch → bucket ausente vira `[]`).
- **T8** `lib/install-prompt.ts`: `import type { Category } from "./categories"`; `interface InstallSkill { slug: string; category: Category }`; `generatePrompt({ skills: InstallSkill[], scope })`; `symlinkBlockFor` usa `${SOURCE_DIR}/skills/${category}/${slug}`; destino `${targetBase}/${slug}` inalterado. `REPO_URL`/`SOURCE_DIR` inalterados (repo único).
- **T9** UI:
  - `components/CategoryBadge.tsx` (novo): map `category`→label+estilo. Eduzz = Badge esmeralda; Pessoal = Badge `default`.
  - `components/CategoryFilter.tsx` (novo): Tabs `[Todas][Pessoal][Eduzz]` com contagem; props `value`, `onChange`, `counts`.
  - `SkillCard`: render `<CategoryBadge category={skill.category}/>` junto do effort.
  - `SkillsClient`: estado `categoryFilter: "all"|Category` (default "all"); `visible = filter(skills)`; passar `visible` ao grid; `selectedSkills` = skills selecionadas (todas, não só visíveis) mapeadas p/ `{slug,category}`; computar `counts`.
  - `StickyInstallBar` + `InstallPromptViewer`: prop `selectedSkills:{slug,category}[]`.
  - `Hero` + `README`: copy "pessoais e de trabalho (Eduzz)".
  - Novo token em `globals.css`: `--color-eduzz`, `--color-eduzz-soft` (esmeralda, ex.: #10B981 / rgba).
- **T10** `pnpm build` verde + greps de sanitização.

### Esmeralda (token)
```css
--color-eduzz: #34D399;
--color-eduzz-soft: rgba(16, 185, 129, 0.12);
```

## 4. Mapa Test Cases → Código

| TC | Código que atende | Edge/validação |
|----|---|---|
| TC-1 | `skills.ts` varredura 2 níveis + try/catch por skill e por bucket | SKILL.md ausente → skill nula filtrada; bucket ausente → `[]`; pasta fora de bucket ignorada (só itera CATEGORIES) |
| TC-2 | `CategoryBadge` em `SkillCard` | label correto por categoria; Eduzz distinto |
| TC-3 | `CategoryFilter` + `SkillsClient.visible` + `counts` | contagem por tab; "Todas" default |
| TC-4 | `SkillsClient`: filtro afeta `visible`, seleção em `selected:Set` (global); `selectedSkills` ignora filtro | trocar filtro não mexe em `selected`; prompt inclui ocultas; empty state via SkillGrid |
| TC-5 | `install-prompt.ts` source-path com `${category}`; destino plano | seleção mista: cada `{slug,category}`; escopo ortogonal |
| TC-6 | T4 (edição de conteúdo) | grep credencial/AV- = 0 |
| TC-7 | T5 + T6 | afl tem `AV-*`/Contexto Eduzz; notion sem path/doc interno; localhost mantido |
| TC-8 | T1-T3 (migração) + T10 (build) + Closeout (descontinuação) | 11 personal + 4 eduzz; slug único; labzz removido só após push |

## 5. Riscos e Pontos de Atenção
- **🔴 Server/client boundary:** `Category` em `lib/categories.ts` puro. Se cair em `skills.ts`, `next build` quebra o bundle client com `node:fs`. (Mitigado por T7.)
- **Credencial no histórico:** sanitizar (T4) **antes** de `git add` das skills eduzz. `cp` (não `git subtree`) garante que o commit da credencial do labzz não entra no histórico público.
- **Slug único:** hoje disjunto (11 vs 4). Sem colisão. Se futuramente colidir, symlink plano sobrescreve — manter regra.
- **Seleção vs filtro:** `selectedSkills` deriva de `selected:Set` sobre TODAS as skills, não sobre `visible` — senão filtrar perderia seleção oculta (TC-4).
- **Descontinuação irreversível:** ordem fixa — só apaga labzz (pasta/repo/Vercel) no Step 10, após commit+push+build verde. Confirmação do usuário já dada.
- **Tocou = refatora:** ao editar `SkillsClient`/`StickyInstallBar`/`InstallPromptViewer`, propagar a troca `string[]`→`{slug,category}[]` sem deixar tipo morto.

## 6. Checklist de Implementação
- [x] T1 — buckets + git mv 10 skills → personal — `skills/`
- [x] T2 — make-dev → personal — `skills/personal/make-dev`
- [x] T3 — afl/jira/notion-* → eduzz (sem git add) — `skills/eduzz/`
- [x] T4 — sanitizar jira (credencial + AV-) — `skills/eduzz/jira/**`
- [x] T5 — afl Contexto Eduzz (AV-*) — `skills/eduzz/afl/SKILL.md`
- [x] T6 — sanitizar notion — `skills/eduzz/notion-*/SKILL.md`
- [x] T7 — `lib/categories.ts` + `lib/skills.ts` (2 níveis + category)
- [x] T8 — `lib/install-prompt.ts` (path por categoria)
- [x] T9 — `CategoryBadge` + `CategoryFilter` + `SkillsClient`/`SkillCard`/`StickyInstallBar`/`InstallPromptViewer`/`Hero` + token esmeralda + README
- [x] T10 — `pnpm build` verde + greps sanitização

## Gateway 7a → 7b ✅
- [x] Plano autocontido (contexto + estratégia + mapa TC→código + checklist)
- [x] i18n verificado (projeto não tem → literais PT)
- [x] Referência big apps citada (VS Code Marketplace/Raycast/GitHub/Linear/Notion)
- [x] Artefato substantivo
