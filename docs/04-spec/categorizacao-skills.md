# Categorização de Skills (Pessoal / Eduzz) — Spec

> **Autonomous Decision Loop:** 2 rounds, 21 decisões, zero ambiguidades.

## Escopo de Plataforma (derivado)

- **Web only** — `lp-skills` é uma LP Next.js. Confirmado: sem código mobile no projeto; spec do `lp-skills-auto-sync` já derivou "web only". Esta feature **não tem superfície mobile**.
- **Responsivo herdado** — o grid de cards já reflowa (1/2/3 col). Os elementos novos (tabs de filtro + badge de categoria) reusam primitives responsivos existentes.

## Contexto técnico relevante (re-analisado do código)

- Leitor atual `lib/skills.ts` varre **um nível** (`skills/*/SKILL.md`) e retorna `Skill[]` plano, ordenado por nome.
- `lib/install-prompt.ts` gera o prompt usando `skills: string[]` (slugs) e monta o source-path `${SOURCE_DIR}/skills/${slug}` (symlink destino `~/.claude/skills/${slug}`).
- `components/SkillsClient.tsx` tem estado liftado (`selected: Set`, `scope`). `SkillCard` já usa `Badge`. `ScopeSelector` já usa shadcn `Tabs`.
- **`scripts/sync-from-local.sh` NÃO existe** (foi especificado no auto-sync, nunca criado) e o `settings.json` não tem hook pro lp-skills. ⇒ O source-of-truth são as pastas do repo, geridas manualmente. **Não há flatten-sync para conflitar com buckets.**
- UI primitives presentes: `badge`, `button`, `dialog`, `tabs`, `tooltip`.

## Decisões — Round 1

| # | Decisão | Valor | Justificativa | Referência | Alternativas descartadas |
|---|---|---|---|---|---|
| D1 | Mecanismo de bucket | Subpastas físicas `skills/personal/` e `skills/eduzz/`; categoria **derivada** do nome da pasta-pai | Usuário pediu separação em pasta E no site; derivar evita campo manual no frontmatter (DRY) | Pedido do usuário; padrão source-of-truth do projeto | Campo `category:` no frontmatter (mantém flat — rejeitado, sem separação física + estado duplicado); repos separados (rejeitado — usuário quer centralizar) |
| D2 | Lista de categorias | Union fixo `Category = "personal" \| "eduzz"` + mapa de labels PT | Só 2 buckets; type-safety; evita ambiguidade "pasta é categoria ou skill?"; labels PT precisam de mapa | Precedente exato: `Scope` union + `SCOPE_LABELS` em install-prompt.ts | Descoberta dinâmica (qualquer subdir vira categoria) — rejeitado: ambíguo, frágil, sem label |
| D3 | Leitor `skills.ts` | Iterar `CATEGORIES`, ler `skills/<cat>/*`, anexar `category`; somar ao `Skill` | Mudança mínima, preserva campos existentes (effort, hasReferences…) | `getSkills()` atual | Walk recursivo — rejeitado (overkill, ambíguo) |
| D4 | Ordenação | Leitor retorna lista plana com `category`, ordenada por nome; UI agrupa/filtra | Separação de responsabilidades (dados ≠ apresentação) | page.tsx → getSkills → SkillsClient | Leitor retornar mapa agrupado — rejeitado (menos flexível p/ "Todas") |
| D5 | UI de filtro | Tabs no topo do grid: `[Todas] [Pessoal] [Eduzz]` com contagem; default "Todas" | Reusa shadcn `Tabs` (já usado no ScopeSelector); 1 grid só (menos scroll) | ScopeSelector; filtros do Linear/Notion/GitHub Marketplace | Seções empilhadas (mais scroll); dropdown (menos descobrível) |
| D6 | Badge de categoria no card | Badge "Pessoal"/"Eduzz" perto do nome; Eduzz com variante de destaque, Pessoal mais sóbrio | Consistência com o badge de effort; scan visual rápido | SkillCard usa `Badge variant="accent"` | Só ícone (menos claro); sem badge em "Todas" (usuário quer ver categoria) |
| D7 | Estado do filtro | `useState` liftado em SkillsClient junto de `selected`+`scope`; filtro afeta só visibilidade | Padrão de estado liftado existente; UC-12 (seleção preservada) | SkillsClient atual | Query param na URL — YAGNI no MVP (projeto não usa router-state) |
| D8 | `install-prompt.ts` | `generatePrompt` recebe skills como `{slug, category}`; source-path `${SOURCE_DIR}/skills/${category}/${slug}`; destino symlink **continua** `~/.claude/skills/${slug}` (plano) | Claude Code carrega skill de `~/.claude/skills/<slug>` (plano); só o source precisa do bucket | install-prompt.ts `symlinkBlockFor`; UC-13 | Slug-only com instalação adivinhando categoria — rejeitado (instalação não sabe a categoria) |
| D9 | Unicidade de slug | Slug **único global** (entre buckets); hoje conjuntos disjuntos | Symlink destino é plano → colisão sobrescreveria | Carregamento de skills do Claude Code; UC-6 | Install namespeado `<cat>-<slug>` — rejeitado (mudaria o nome de invocação `/jira`) |
| D10 | Migração das skills próprias | `git mv skills/<slug> skills/personal/<slug>` (10 skills) | Preserva histórico | Boa prática git; UC-16 | Recriar do zero (perde histórico) |
| D11 | Importação das skills do labzz | `cp -r` dos 5 diretórios (sem histórico do labzz), **sanitizar ANTES do git add** | Importação limpa; **a credencial nunca entra no histórico do lp-skills** | UC-17/18; segurança | `git subtree` — rejeitado: traria o commit da credencial pro histórico público |
| D12 | Distribuição por bucket | `make-dev`→`personal`; `afl`,`jira`,`notion-pull`,`notion-push`→`eduzz` | make-dev é genérica (sem IP/dependência interna); demais são contexto de trabalho | Classificação validada com usuário | Tudo em eduzz (rejeitado — make-dev é genérica) |

## Decisões — Round 2 (re-análise do zero)

| # | Decisão | Valor | Justificativa | Referência | Alternativas descartadas |
|---|---|---|---|---|---|
| D13 | Sanitização — credencial | Remover linha `test user: test2@test.com / Test123!@#` de `jira/SKILL.md`; em `07-investigation.md`, linha vira `Criar usuário do tipo correto (se necessário)`. Manter `can create users: yes` | Tudo público; capacidade preservada (Claude cria conta) | UC-18; decisão do usuário | Mascarar com placeholder `<...>` (ok, mas remover é mais limpo já que `can create users` cobre) |
| D14 | Sanitização — `AV-` no jira | Trocar exemplos `AV-36`/`AV-N`/`AV-36-40` por `PROJ-123`/`PROJ-123-456` (30 ocorrências, 5 arquivos); `argument-hint` continua `[CARD-CODE]` | `/jira` genérico, cego ao project key | UC-19; pedido do usuário | Manter AV- (rejeitado — acopla o genérico ao Eduzz) |
| D15 | `AV-*` no afl | Adicionar seção "Contexto Eduzz" em `afl/SKILL.md`: project key segue `AV-*` (ex.: AV-36; multi-card AV-36-40-55), test user via `can create users`. Atualizar o bloco "Environment… Identical to /jira" para carregar a especificidade Eduzz | Especificidade Eduzz vive só no `/afl`; ele considera o `av-*` ao acionar o `/jira` | UC-20; correção do usuário ("av-*") | Deixar no jira (rejeitado) |
| D16 | Sanitização — notion | `notion-pull`: `/home/furihata/GitHub/labzz-pm-forge` → `<caminho-do-pm-forge>`; nomes de doc ("Reels — Product Doc"/"Stories"/"AI Features") → genéricos ("Doc A"/"Doc B"/…); slug `insta` → `<slug>`/`exemplo`. `localhost:9432` mantido (genérico) | Remove path/username/doc interno | UC-21 | Manter (rejeitado — vaza estrutura interna) |
| D17 | Copy do Hero/README | Atualizar subtítulo do Hero e README de "skills do meu setup pessoal" → refletir pessoais **e de trabalho (Eduzz)** | Catálogo agora tem 2 contextos | Hero.tsx; README.md | Manter copy antiga (rejeitado — desatualizada) |
| D18 | Empty state do filtro | Reusar empty state do SkillGrid; mensagem adequada quando filtro zera | UX consistente | SkillGrid.tsx | Sem tratamento (rejeitado) |
| D19 | i18n / labels | Strings PT: "Todas", "Pessoal", "Eduzz" | Consistente com projeto PT | spec auto-sync (PT no MVP) | i18n EN (YAGNI) |
| D20 | Acessibilidade | Tabs de filtro acessíveis (shadcn Tabs já é); badge tem texto; contagem em texto | WCAG AA herdado | a11y do projeto | — |
| D21 | Descontinuação labzz | Pasta local + repo `eduardofurihata/labzz-skillzz` + projeto Vercel `frontend` (prj_Y1xoh…). Só **após** push e build verde. settings.json não referencia labzz → nada a limpar | Centralizar; remover duplicidade | UC-22/23/24/25 | Manter labzz como arquivo morto (rejeitado — usuário pediu apagar) |

## Modelo de dados (final)

```ts
export type Category = "personal" | "eduzz";

export interface Skill {
  slug: string;
  name: string;
  description: string;
  effort?: string;
  argumentHint?: string;
  hasReferences: boolean;
  hasScripts: boolean;
  hasData: boolean;
  category: Category;   // ← novo, derivado da pasta-pai
}
```

## Estrutura de pastas (final)

```
skills/
├── personal/
│   ├── apf/ ask/ chat/ chat-out/ claude-modes/ commit/ fast/ method/ solve/ todo/   (git mv)
│   └── make-dev/                                                                     (do labzz)
└── eduzz/
    ├── jira/        (sanitizado: credencial removida, AV-→PROJ-123)
    ├── afl/         (+ seção Contexto Eduzz com AV-*)
    ├── notion-pull/ (sanitizado: path/nomes)
    └── notion-push/ (sanitizado)
```

## Fronteira público/privado (resolvida pelo usuário)

- Repo `lp-skills` é **público**. Decisão do usuário: trabalhar tudo público.
- AFL é produto **público** (agentsforlife.org) → nome/posicionamento não são sensíveis.
- Única higiene de segurança real: **não exibir a credencial de teste** (D13). Demais sanitizações (AV-, notion paths) são organização, não segurança.

## Performance / SEO / Build

- Server component + ISR 300s herdado; categorização é build-time (zero custo client).
- `next build` deve passar (tsc estrito + lint). Sem novas deps.

## Gateway 4 → 5 ✅

- [x] Autonomous Decision Loop fechou com zero gaps (2 rounds, 21 decisões)
- [x] Cada decisão com justificativa + referência + alternativas
- [x] Escopo de plataforma derivado (web only, sem superfície mobile)
- [x] Artefato substantivo
