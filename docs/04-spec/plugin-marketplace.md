# Distribuição de Skills via Plugin Marketplace — Spec

> **Autonomous Decision Loop:** 2 rounds, 20 decisões, zero ambiguidades.
> Fontes oficiais: `code.claude.com/docs/en/plugin-marketplaces`, `/plugins`, `/plugins-reference`.

> ⚠️ **ESTADO ATUAL: ver [Round 4](#decisões-round-4--marketplace-de-2-plugins).** O modelo "1 plugin por skill" (Rounds 1–3, decisões 2/4/10/11/12/21–23) foi **substituído** por **2 plugins** (`furi-builder`, `eduzz-builder`) que empacotam as skills. O gatilho: verificação empírica (2026-07-03) de que skill empacotada num plugin **continua invocável bare** (`/method`) — o medo que motivou o "1 plugin por skill" (namespacing quebraria as cross-refs) não se confirmou.

## Escopo de Plataforma (derivado, não declarado)

- **Não há superfície mobile.** O artefato distribuído são skills do **Claude Code CLI**, que roda em desktop (Windows/Mac/Linux). Não existe app Android/iOS — **nenhum TC mobile**.
- **A "plataforma" relevante é o SO do destinatário.** O objetivo central é funcionar **igual em Windows, macOS e Linux** — que é exatamente onde o mecanismo antigo (symlink+hook) falhava. Cobertura cross-OS é o eixo de execução dos TCs.
- **A LP** é um site estático informativo (Next.js/Vercel), já existente — muda só a geração de comandos de instalação.

## Decisões (Round 1)

| # | Decisão | Justificativa | Referência | Alternativas descartadas |
|---|---|---|---|---|
| 1 | **Mecanismo**: plugin marketplace nativo do Claude Code | O Claude Code clona e **copia** o plugin pro cache per-OS ele mesmo → funciona em todo SO, sem symlink/hook/`~`/`/dev/null` | plugin-marketplaces docs ("copies the plugin directory to a cache location") | (a) symlink+hook = o bug atual (Windows); (b) motor Node de sync próprio = cross-OS mas reinventa distribuição, mais manutenção; (c) script PowerShell paralelo = dobra superfície e diverge |
| 2 | **Granularidade**: 1 plugin por skill, layout *single-skill-root* (SKILL.md na raiz do dir do plugin, sem subdir `skills/`) | Preserva invocação **bare** (`/merge`), requisito das 250+ cross-refs; habilita install seletivo + deps | plugins-reference §614 ("SKILL.md at root … invocation name = frontmatter `name`") | (a) 1 plugin/categoria com `skills/` → namespaced `/furihata-personal:merge`, quebra cross-refs; (b) 1 plugin monolítico → idem + sem install seletivo |
| 3 | **Nome de invocação**: frontmatter `name` (já presente nos 19) | Nome estável e bare, independente do dir de cache (que é uma version-string) | plugins-reference §45/§612/§614 | Fallback pro basename do dir → vira version-string no cache (quebra a invocação) |
| 4 | **Plugin id** = nome da skill (sem prefixo) | O sufixo `@lp-skills` já desambigua no install; brevidade | marketplace entry `name` | `furihata-<skill>` — verboso e redundante dado o namespace de marketplace |
| 5 | **Marketplace name** = `lp-skills` | Casa com o repo; não é nome reservado | reserved-names list | outro nome = desalinha do repo |
| 6 | **Manifestos GERADOS** de `skills/**/SKILL.md` por `scripts/generate-plugins.mjs` | DRY: fonte única (frontmatter), zero drift entre 19 arquivos | princípio DRY; a LP já lê o mesmo frontmatter (`lib/skills.ts`) | 19 plugin.json à mão = divergem, violam DRY |
| 7 | **Dependencies** no plugin.json, direto do `requires` do frontmatter | Resolução transitiva nativa (`afl`→`jira`→`method`→`solve`) | plugins-reference §523 (`dependencies`), §959 (transitivo) | Expandir deps no comando de install = frágil, perde resolução nativa |
| 8 | **Versionamento**: **omitir `version`** → git-SHA (cada commit = versão) | Auto-update a cada push, sem bump manual (repo itera rápido) | plugin-marketplaces "version resolution" | semver manual → esquece de bumpar → dev não atualiza |
| 9 | **Categoria**: campo `category` (`personal`/`eduzz`) por entry | Preserva o split atual; filtro no `/plugin` | marketplace entry fields (category/tags) | perder o split = pior UX pro time |
| 10 | **Estrutura**: manter `skills/<cat>/<skill>/`; só adicionar `.claude-plugin/plugin.json` dentro; marketplace.json na raiz com `source: "./skills/<cat>/<skill>"` | Churn mínimo; a LP continua lendo `skills/` pro catálogo (DRY LP↔marketplace) | plugins-reference (source = subdir) | mover pra `plugins/` = churn grande, quebra a LP, sem ganho |
| 11 | **`"skills": ["./"]`** explícito em cada plugin.json | Robustez cross-versão (funciona antes do v2.1.142 do auto-detect); explícito > implícito | plugins-reference §612 (path aponta pra dir com SKILL.md → frontmatter name) | Só auto-detect → exige v2.1.142+ no dev (versão desconhecida) |
| 12 | **LP**: reescrever `generatePrompt` → comandos `/plugin marketplace add` + `/plugin install <skill>@lp-skills`; manter `expandDeps` pra listar a cadeia | A LP tem que ensinar o mecanismo novo; reusar o resolvedor de deps | Scout rule; DRY | manter o prompt de symlink = ensina o mecanismo quebrado |
| 13 | **README**: reescrever instalação/workflow pro marketplace; marcar `lp-skills-auto-sync` como superseded | Doc precisa refletir a realidade | — | deixar doc antigo = engana o próximo dev |
| 14 | **Cleanup**: remover os symlinks `~/.claude/skills/*`→repo + o hook `SessionStart` do `sync-skills.sh`; preservar `ui-ux-pro-max`, `video-teams` | Elimina o mecanismo antigo sem tocar skills de terceiros | UC-9 | remover tudo cegamente = apagaria skills não geridas |
| 15 | **Dev loop do autor**: pós-cleanup, autoria via `--plugin-dir`/`@skills-dir` no repo; distribuição via marketplace | Preserva edição imediata sem symlink; separa autoria de distribuição | plugins §"Develop a plugin in your skills directory" | só marketplace no autor = perde edição imediata |

## Decisões (Round 2 — re-análise, novos gaps)

| # | Gap identificado | Decisão |
|---|---|---|
| 16 | `.claude-plugin/` dentro do skill dir confunde a LP (`lib/skills.ts`)? | **Não** — `readBucket` lista os slugs e filtra `.`-dirs; `readSkill` só checa `references/scripts/data`. `.claude-plugin` é ignorado. Sem mudança na LP necessária pra isso. |
| 17 | marketplace.json na raiz + arquivos do Next no clone do dev | Aceitável: o Claude Code só lê `.claude-plugin/` + dirs dos plugins; o resto é bloat no cache. Repo dedicado = YAGNI. |
| 18 | Escopos da LP (global/project-shared/project-local) no modelo marketplace | Install de plugin é **user-global** por natureza. Simplificar: fluxo primário = 2 comandos `/plugin` (global). Project/team vira **nota** (team marketplace via `.claude/settings.json` do projeto), não 3 templates de symlink. Remove complexidade morta (Scout rule). |
| 19 | Secrets no corpo das skills (o install copia arquivos) | Re-verificar antes do push. O thread `auto-sync` já mascarou credenciais de teste do `jira`. Grep de segurança no Step 9. |
| 20 | Skills com `scripts/` (ex.: `claude-modes`) rodam do cache? | Sim — `scripts/` não é dir especial de plugin; é copiado junto e referenciado relativo/`${CLAUDE_PLUGIN_ROOT}`. Zero caminho absoluto hardcoded (confirmado por grep). Validar 1 skill-com-scripts no Step 9. |

## Decisões (Round 3 — bundles por categoria)

| # | Decisão | Justificativa | Alternativas descartadas |
|---|---|---|---|
| 21 | **Bundles `furi-builder` / `eduzz-builder`**: plugins agregadores (só `dependencies` = todas as skills da categoria, sem skill própria) | Deixa o dev instalar uma categoria inteira num comando (`/plugin install eduzz-builder@lp-skills`), mantendo o install individual | (a) instalar tudo sempre (sem granularidade); (b) multi-skill plugin por categoria → namespaced, quebra cross-refs |
| 22 | **Gerados pelo mesmo `generate-plugins.mjs`** em `bundles/<name>/.claude-plugin/plugin.json` | Fonte única; deps derivadas das skills da categoria | manter à mão → drift |
| 23 | **LP surfaça os bundles** (componente `BundleInstall`) + `generateBundlePrompt` | O dev escolhe pacote OU skills individuais na própria LP | só documentar no README → menos descoberto |

## Decisões (Round 4 — marketplace de 2 plugins)

> Substitui as decisões 2, 4, 10, 11, 12, 21, 22 e 23. Motivação: o marketplace com ~21 entradas (1 plugin por skill + 2 agregadores vazios) poluía o `/plugin`; o pedido é **2 plugins**, cada um trazendo suas skills dentro.

| # | Decisão | Justificativa | Referência / Alternativas descartadas |
|---|---|---|---|
| 24 | **Invocação bare sobrevive ao empacotamento** — refuta o bloqueio da decisão 2 | Teste empírico (2026-07-03): plugin `furitest` com `skills:["./meths/methtest"]`; `claude -p --plugin-dir … "/methtest"` **e** `"/furitest:methtest"` ambos dispararam a skill | A doc (`skills.md`) só garante a forma namespaced como canônica ("Plugin skills use a `plugin-name:skill-name` namespace"); a forma curta resolve quando **não há ambiguidade** — confirmado rodando |
| 25 | **Granularidade: 2 plugins** (`furi-builder` = personal, `eduzz-builder` = eduzz), cada um empacotando TODAS as skills da categoria | É o pedido; um `/plugin` limpo (2 entradas, não 21) | (a) 1 plugin/skill (dec. 2) → 21 entradas, a poluição que queremos remover; (b) 1 plugin monolítico → perde o split personal/eduzz |
| 26 | **Raiz de cada plugin = a pasta da categoria** (`skills/personal`, `skills/eduzz`); `source` do marketplace aponta pra ela; `skills: ["./<slug>", …]` lista as skills | Zero movimentação de pasta; a LP continua lendo `skills/<cat>/<slug>/` (dec. 16 segue válida); install copia só a categoria (não o repo todo) | callstack-agent-skills usa exatamente `source` + `skills:[…]` (padrão real comprovado); `source:"./"` copiaria o Next inteiro (bloat) |
| 27 | **Sem install por skill** — instala-se o pacote inteiro | Diretriz explícita do dono ("nao instala mais individualmente, o pacote todo mesmo") | manter granularidade por skill exigiria manter 21 plugins |
| 28 | **Dep cruzada entre pacotes**: `eduzz-builder` → `dependencies:[furi-builder]`, derivada do `requires` (jira/afl usam method/solve, que são personal) | Correção sem duplicar skill; duplicar `method` nos 2 plugins criaria ambiguidade e quebraria o `/method` bare (dec. 24) | (a) duplicar method em eduzz → quebra bare; (b) não declarar → `/jira` referencia `/method` ausente |
| 29 | **`generate-plugins.mjs` reescrito**: emite 2 `plugin.json` (em `skills/<cat>/.claude-plugin/`) + `marketplace.json` de 2 entradas; **poda** os manifestos por-skill e `bundles/` | Fonte única mantida; o gerador é a autoridade dos artefatos (limpa o legado) | deixar legado no repo → manifesto órfão confunde |
| 30 | **LP: só vitrine + 2 pacotes** — remove seleção por skill, `StickyInstallBar`, `expandDeps`, `generatePrompt`; `SkillCard`/`SkillGrid` viram só-leitura; `BundleInstall` é a instalação | A instalação passou a ser 2 comandos; seleção por skill não mapeia mais à realidade | manter seleção → gera `/plugin install <skill>@lp-skills` inexistente |

### Formato novo (Round 4) — `skills/<cat>/.claude-plugin/plugin.json`
```json
{
  "name": "eduzz-builder",
  "description": "…",
  "author": { "name": "Eduardo Furihata" },
  "skills": ["./afl", "./jira", "./notion-pull", "./notion-push"],
  "dependencies": [{ "name": "furi-builder" }]
}
```
(dependencies só quando há dep cruzada; `version` omitido de propósito.)

### Formato novo (Round 4) — `marketplace.json` (2 entradas)
```json
{
  "name": "lp-skills",
  "owner": { "name": "Eduardo Furihata" },
  "metadata": { "description": "Skills do Claude Code do Furihata — pessoais e Eduzz." },
  "plugins": [
    { "name": "eduzz-builder", "source": "./skills/eduzz", "description": "…", "category": "eduzz" },
    { "name": "furi-builder", "source": "./skills/personal", "description": "…", "category": "personal" }
  ]
}
```

### Instalação (Round 4)
- Adicionar: `/plugin marketplace add eduardofurihata/lp-skills`
- Instalar: `/plugin install furi-builder@lp-skills` e/ou `/plugin install eduzz-builder@lp-skills` (o segundo puxa o primeiro)
- Invocar: `/method`, `/jira`, … (bare) — `/furi-builder:method` também funciona
- Atualizar: `/plugin marketplace update`

## Grafo de Dependências (fonte: frontmatter `requires`)

```
solve            (raiz)
method  → solve
work    → method
todo    → method
fast    → method
jira    → method
merge   → todo
afl     → jira
```
Sem deps: `apf, ask, card, chat, chat-out, claude-modes, commit, make-dev, notion-pull, notion-push, pr`.
No plugin.json declara-se só a dep **direta**; o Claude Code resolve transitivo.

## Artefatos a criar/editar

> ⚠️ Superseded pelo Round 4 (2 plugins). Artefatos/formato atuais na seção Round 4; o abaixo é o registro do modelo 1-plugin-por-skill.

```
lp-skills/
├── .claude-plugin/
│   └── marketplace.json            # NOVO (gerado) — 19 entries
├── skills/<cat>/<skill>/
│   ├── SKILL.md                    # inalterado (frontmatter já tem name/description/requires)
│   └── .claude-plugin/
│       └── plugin.json             # NOVO (gerado) — name, description, skills:["./"], dependencies
├── scripts/
│   └── generate-plugins.mjs        # NOVO — lê frontmatter → emite manifestos (idempotente, chaves ordenadas)
├── lib/install-prompt.ts           # EDIT — gera comandos /plugin
├── components/…                    # EDIT — StickyInstallBar/Viewer refletem comandos /plugin
├── README.md                       # EDIT — instalação via marketplace
├── package.json                    # EDIT — script "gen:plugins"
└── docs/01-problem/lp-skills-auto-sync.md  # EDIT — nota "superseded by plugin-marketplace"
```

### Formato do `plugin.json` (gerado)
```json
{
  "name": "jira",
  "description": "<primeira frase do description do frontmatter>",
  "skills": ["./"],
  "dependencies": [{ "name": "method" }]
}
```
(omitir `dependencies` quando vazio; omitir `version` de propósito.)

### Formato do `marketplace.json` (gerado)
```json
{
  "name": "lp-skills",
  "owner": { "name": "Eduardo Furihata" },
  "metadata": { "description": "Skills do Claude Code do Furihata — pessoais e Eduzz." },
  "plugins": [
    { "name": "method", "source": "./skills/personal/method", "description": "…", "category": "personal" }
  ]
}
```

## Instalação (comandos)

> ⚠️ Superseded pelo Round 4 — a instalação atual (por pacote) está em "Instalação (Round 4)". O abaixo é o modelo antigo (install por skill).

- Adicionar: `/plugin marketplace add eduardofurihata/lp-skills` (ou CLI `claude plugin marketplace add eduardofurihata/lp-skills`)
- Instalar: `/plugin install <skill>@lp-skills` (deps resolvidas)
- Atualizar: `/plugin marketplace update`
- Requisito mínimo documentado: Claude Code recente (v2.1.142+ recomendado; `skills:["./"]` cobre versões anteriores).

## Cleanup (máquina do autor)
- Remover symlinks em `~/.claude/skills/*` cujo target casa `…/GitHub/lp-skills/skills/*` (16 links: afl, apf, ask, card, chat, chat-out, claude-modes, commit, fast, jira, make-dev, merge, method, notion-pull, notion-push, pr, solve, todo, work).
- Remover do `~/.claude/settings.json` o hook `SessionStart` que roda `sync-skills.sh`.
- **Preservar**: `ui-ux-pro-max/`, `video-teams/` (dirs reais, não geridos por este repo) e o arquivo `method.bak-*.7z`.

## Segurança
- marketplace.json/plugin.json = metadados públicos, sem secrets.
- `/plugin marketplace add` e `install` **não executam** código do plugin; skills são markdown. Scripts de skill (`scripts/`) só rodam quando a skill é invocada e o usuário aprova — mesmo modelo de hoje.
- Re-scan de secrets no corpo das skills antes do push (Step 9).

## Gateway 4 → 5 ✅
- [x] Autonomous Decision Loop fechou (2 rounds, 20 decisões, zero gaps)
- [x] Cada decisão com justificativa + referência + alternativas
- [x] Escopo de plataforma derivado (CLI desktop cross-OS; sem mobile)
- [x] Artefato substantivo
