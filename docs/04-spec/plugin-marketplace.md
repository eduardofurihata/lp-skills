# Distribuição de Skills via Plugin Marketplace — Spec

> **Autonomous Decision Loop:** 2 rounds, 20 decisões, zero ambiguidades.
> Fontes oficiais: `code.claude.com/docs/en/plugin-marketplaces`, `/plugins`, `/plugins-reference`.

> ⚠️ **ESTADO ATUAL: ver [Round 4](#decisões-round-4--marketplace-de-2-plugins) + [Round 5](#decisões-round-5--3º-builder-furi-toolbox) + [Round 6](#decisões-round-6--furi-builder-vira-furi-build--furi-ship) + [Round 7](#decisões-round-7--repro-vai-para-o-furi-ship-eduzz-builder-sai).** O modelo "1 plugin por skill" (Rounds 1–3, decisões 2/4/10/11/12/21–23) foi **substituído** por **1 plugin por categoria** — 2 no Round 4 (`furi-builder`, `eduzz-builder`), 3 desde o Round 5 (`furi-toolbox` para as skills avulsas), 4 desde o Round 6 (`furi-build` + `furi-ship` substituem o `furi-builder`), 3 desde o Round 7 (o `/repro` vai para o `furi-ship` e o `eduzz-builder`, vazio, sai) — que empacotam as skills. O gatilho: verificação empírica (2026-07-03) de que skill empacotada num plugin **continua invocável bare** (`/method`) — o medo que motivou o "1 plugin por skill" (namespacing quebraria as cross-refs) não se confirmou.

> ⚠️ **LAYOUT SUPERSEDED (2026-09-11) — `skills/<cat>/` não existe mais.** As decisões 10, 26, 30, 31 e 38 descrevem a pasta de categoria como raiz do plugin (`skills/build`, com `skills:["./<slug>"]`) e os pacotes do Codex como **cópia gerada** em `plugins/`. As duas coisas foram substituídas por **um diretório por pacote com uma única cópia de cada skill**:
>
> `plugins/<pacote>/` passa a ser a raiz **e** a fonte — `plugin.json` na raiz ([Agent Plugins v1](https://agent-plugins.org/specification), que Cursor/Copilot/VS Code/Codex leem), `.claude-plugin/plugin.json` (Claude Code), `.codex-plugin/plugin.json` (Codex nativo) e `skills/<slug>/SKILL.md` — **uma** cópia, escaneada pelos três. O gatilho: os três clientes convergiram em `skills/<slug>/SKILL.md` e discordam só de onde o manifesto mora; como cada manifesto mora num lugar diferente, eles coexistem, e a cópia de distribuição (que podia divergir sem ninguém notar) deixou de ter razão de existir. O Claude Code escaneia `skills/` na raiz do plugin por default, então o campo `skills:[…]` saiu do manifesto. O drift agora é impossível por construção e checado por `scripts/validate-plugins.mjs` no CI. Ver o README (§ Estrutura).

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

## Decisões (Round 5 — 3º builder `furi-toolbox`)

> Estende o Round 4 (não substitui nada). Motivação (2026-09-10): dentro do `furi-builder` conviviam o **workflow** (`method`, `solve`, `fast`, `todo`, `proto`, `card`, `work`, `pull-request`, `homolog`, `prod`, `jira-board` — um grafo de `requires`/invocações que só faz sentido instalado junto) e **ferramentas avulsas** que ninguém requer e não requerem ninguém. O pedido: as avulsas num plugin próprio, com nome em inglês.

| # | Decisão | Justificativa | Referência / Alternativas descartadas |
|---|---|---|---|
| 31 | **3ª categoria `toolbox` = plugin `furi-toolbox`**, mesma mecânica das outras (pasta `skills/toolbox/` é a raiz do plugin; `plugin.json` gerado lá; entrada no `marketplace.json` com `category: "toolbox"`) | Modelo do Round 4 já é "1 plugin por categoria" — a 3ª entra sem mudar o mecanismo, só o dado (`CATEGORIES`) | (a) sub-pasta dentro de `personal/` → gerador e LP teriam que aprender um nível de aninhamento sem ganho de instalação separada; (b) `furi-tools`/`furi-utils`/`furi-kit` → nome escolhido pelo dono: `furi-toolbox` |
| 32 | **Critério de pertencimento à `toolbox`**: categoria é dona primeiro — skill de trabalho é `eduzz/` antes de qualquer critério. Entre as pessoais: sem `requires` **e** nenhuma outra skill a lista em `requires` ou a invoca via Skill tool. Hoje: `ask`, `chat`, `chat-out`, `claude-shortcuts`, `ctt`, `make-dev`, `proof`, `save`, `sync`, `video-teams` (10) | Objetivo e verificável por grep; "sozinha" precisa de definição pra não virar gosto — e a dona vem antes, senão skill de trabalho sem deps cairia no pacote pessoal | `proof` cumpria o critério de avulsa desde o início (sem deps, sem dependentes) e ficou em `eduzz/` enquanto auditava PRs da Eduzz (`AV-*`); reescrito como método genérico — arquivo único, sem citar empresa, skill, linguagem ou forja — passou para a `toolbox`: "de trabalho" é o que fala o vocabulário da empresa, não o que se usa no trabalho. `solve` fica em `personal/`: não tem `requires`, mas 5 skills dependem dele (`method`, `fast`, `todo`, `proto`, `card`) — é a base do grafo, não uma ferramenta solta. Menção como fronteira (`/prod` citando `/sync` numa red flag) não é dependência |
| 33 | **Zero deps cruzadas** com o `furi-toolbox`: ele não declara `dependencies` e nenhum builder o declara | Consequência direta do critério 32; `crossBuilderDeps` do gerador deriva isso sozinho do `requires` | declarar `furi-builder → furi-toolbox` "por conveniência" → instalar o workflow forçaria as avulsas, o oposto do pedido |
| 34 | **Categoria vira dado na LP**: `CategoryFilter`, `SkillsClient` (counts), `Hero` (nº de pacotes) e o gerador (`slugsByCategory`) iteram `CATEGORIES`/`BUNDLES` em vez de listar `personal`/`eduzz` na mão; `Record<Category, …>` em `CategoryBadge` obriga toda categoria nova a ganhar cor (âmbar `--color-toolbox`) | 3 lugares listavam as categorias literalmente — adicionar a 3ª sem isso seria a 3ª cópia da mesma lista (DRY) | manter literais → próxima categoria repete esta edição em 4 arquivos |
| 35 | **Prompt de instalação testa com skill do próprio pacote** (`Bundle.example`: `/method`, `/save`, `/jira`) | O passo 5 mandava testar `/method` em qualquer pacote — no `furi-toolbox` esse teste "falha" num install que deu certo | manter `/method` fixo → falso negativo no pacote novo |

**Efeito na máquina de quem já tinha o `furi-builder`**: no próximo auto-update ele perde as 8 avulsas e o `/proof`; `/plugin install furi-toolbox@lp-skills` traz as avulsas de volta — o `/proof` inclusive, que veio do `eduzz-builder` para a `toolbox` quando virou método genérico. Não há caminho automático — plugin novo é instalação nova.

## Decisões (Round 6 — `furi-builder` vira `furi-build` + `furi-ship`)

> Estende o Round 5 (não substitui nada). Motivação (2026-09-10): o grafo de dependências das 11 skills de `personal/` (invocação via Skill tool, leitura de `references/`, handoff) tem um corte limpo — **build** (`solve`, `method`, `fast`, `todo`, `proto`: como se constrói) e **ship** (`jira-board`, `card`, `work`, `pull-request`, `homolog`, `prod` + os motores de `prod/references/`: como o trabalho entra e chega ao ar). Só 3 arestas cruzam o corte (`card → solve`, `work → method`, `pr-cycle → todo`), todas na direção ship → build. Build nunca depende de ship. O pedido: duas pastas, dois plugins, `personal` extinta.

| # | Decisão | Justificativa | Referência / Alternativas descartadas |
|---|---|---|---|
| 36 | **`personal` vira duas categorias: `build` = plugin `furi-build`, `ship` = plugin `furi-ship`**; `furi-builder` deixa de existir. Mesma mecânica (pasta = raiz do plugin, `plugin.json` gerado, entrada no `marketplace.json` com `category`); ordem `build, ship, toolbox, eduzz` | O grafo já separa os dois grupos; um plugin só forçava quem quer o método a instalar Jira/deploy junto | (a) sub-pasta dentro de `personal/` → mesma objeção da 31; (b) `furi-builder` fica como nome do `build` → confundiria com o pacote antigo no cache de quem já tinha; (c) `build`/`ship` sem prefixo → genérico num marketplace com outros donos |
| 37 | **Critério de pertencimento:** `ship` = o `/jira-board` e toda skill que o lista em `requires` (quem fala com board, GitHub ou ambiente); `build` = o resto do grafo. Dependência entre pacotes **só ship → build**, derivada do `requires` (`crossBuilderDeps`): `furi-ship → furi-build`, `eduzz-builder → furi-build` (`jira requires method`) | Verificável por grep, como a 32; `homolog ↔ prod` são mutuamente dependentes e ficam juntos; o `/method` cita `/homolog`/`/prod` como fronteira, não como `requires` — build continua sem saber o que é PR | `todo` em ship (o `pr-cycle` o invoca) → criaria dep build → ship por `fast`/`method`; `todo` é o Step 9–10 do método, fica em build |
| 38 | **Convenção de caminhos de arquivo nos SKILL.md:** mesmo pacote → `<slug>/references/x.md` (resolve no cache instalado, que copia o pacote inteiro); outro pacote → caminho de repo `skills/<cat>/<slug>/…`, **só como menção** — quem precisa do conteúdo invoca a skill dona via Skill tool | O cache é por plugin (`~/.claude/plugins/cache/lp-skills/<plugin>/<sha>/`): caminho de outro pacote nunca resolve lá. Auditadas as 6 linhas cruzadas (`pr-cycle:59`, `findings:7`, `work:18`, `method:69`, `follow-ups:135`, `rationalizations:112`): nenhuma é leitura obrigatória de um step | `${CLAUDE_PLUGIN_ROOT}` de outro plugin → não existe; caminho do cache com `<sha>` → muda a cada push |
| 39 | **Namespace nas invocações segue a skill-alvo:** `solve`/`method`/`todo` → `furi-build:`; `jira-board`/`card`/`pull-request`/`homolog` → `furi-ship:` (29 ocorrências, incluindo `eduzz/jira`) | O namespace é o pacote de quem é chamada, não de quem chama | manter `furi-builder:` "porque a forma curta resolve" → texto mentiria sobre um plugin que não existe |
| 40 | **Cor `--color-ship` sky-400/500** (`#38BDF8` / `rgba(14,165,233,.14)`), mesmo padrão 400/500 de eduzz e toolbox; `build` herda o neutro que `personal` tinha | Contraste 7.3:1 sobre o soft no card (AAA); matiz distinto de âmbar, esmeralda e do roxo de seleção (dec. 34) | duas cores novas → o core do fluxo perderia o "sóbrio" que já era a decisão da 34 |
| 41 | **`/work` invoca o `/solve` na ativação** (bloco "Ordem de Operações ao Ativar", `requires` ganha `solve`, Red Flag) — mesmo padrão de `card`, `method`, `todo`, `fast`, `proto` | Era a única skill do grafo que chegava ao `/solve` só por tabela (via `/method`); o padrão da casa é chamada real na ativação | — |

**Efeito na máquina de quem tinha o `furi-builder`**: no próximo auto-update ele some do marketplace (o cache antigo continua com as 20 skills pré-Round 5 até o uninstall). Caminho: `/plugin uninstall furi-builder@lp-skills` (em cada escopo onde estava — `user` e `local`), depois `/plugin install furi-build@lp-skills` + `/plugin install furi-ship@lp-skills`; o `eduzz-builder` passa a depender do `furi-build` (dependência só age no install). Não há caminho automático — plugin novo é instalação nova.

## Decisões (Round 7 — `/repro` vai para o `furi-ship`; `eduzz-builder` sai)

> Estende o Round 6 (não substitui nada). Motivação (2026-09-12): a auditoria do `/repro` (ex-`/jira`, a última skill do `eduzz-builder`) mostrou **duas** ocorrências literais de "Eduzz", ambas rótulo — nenhum board, key, URL, conta ou status da empresa. O que ele tem de próprio (reproduzir ao vivo antes de codar; o dev vê o bug duas vezes) é **método**, não vocabulário de empresa — o mesmo movimento que tirou o `/proof` do `eduzz/` (dec. 32). E o isolamento (check 7, irmãos não se citam) o obrigava a duplicar pior o que o `furi-ship` já tinha: `cat setup.md` em vez de `/setup`, sem `/jira-board`, `git checkout main` hardcoded, e um `ship.md` que era um `/pull-request` sem `--base`, sem idempotência e sem cards derivados dos commits.

| # | Decisão | Justificativa | Referência / Alternativas descartadas |
|---|---|---|---|
| 42 | **`/repro` passa para o `furi-ship`, generalizado para qualquer projeto/board:** `requires: [jira-board, setup, solve, method, pull-request]`, `handoff: homolog`. Identidade preservada — reprodução com nota ≥ 90 **na superfície onde o usuário vê o bug** (web via Playwright `pw4` + pool; mobile no emulador; API com chamada real — a tabela do Step 9 do `/method`) e **2 validações humanas obrigatórias em todo modo**, `finish` inclusive. O resto é delegado: Step 0 = `/jira-board` + `/setup`; branch pelo motor (dec. 46); status via `jira-sync.md`; ship = `/pull-request` invocado após perguntar (em `finish`, direto); `ship.md` apagado. O registro `docs/jira/todo/<KEY>.md` (`phase:`) continua sendo o estado do card; depois do commit do `/method` ele só entra em commit **por caminho explícito** (sem isso o guard "working tree limpo" do `/pull-request` para a skill) | Pelo critério da dec. 37 (`ship` = quem fala com board, GitHub ou ambiente) o lugar é o ship; pelo da dec. 32 ("de trabalho" = vocabulário da empresa) ele não era Eduzz. Resolve também a contradição interna: o Step 0.8 auto-confirmava em `finish` enquanto description, `human-check.md` e `rationalizations.md` diziam "obrigatória" | (a) manter no `eduzz-builder` e copiar as melhorias à mão a cada mudança do ship (a deriva já aparecia no diff `jira → repro`); (b) `/repro` como modo do `/work` — o `/work` não tem ponto de inserção entre o gate e o `/method`, e o human check pós-fix é outra skill de fato; (c) `/repro` termina no commit e entrega "Próximo: /pull-request" como o `/work` — perderia o "quer que eu rode o ship?" que é parte do fluxo |
| 43 | **`eduzz-builder` deixa de existir.** `plugins/eduzz-builder/` apagado; entrada removida de `PACKAGES` no gerador; marketplaces regenerados com **3 pacotes** | Pacote vazio falha o check 3 do validador ("nenhuma skill dentro"); pacote com skill que não é da empresa é rótulo mentindo. `/afl` (D-14), `/proof` e `/video-teams` (toolbox) já tinham saído | Manter com placeholder ou relaxar o check 3 — superfície viva para um pacote sem conteúdo |
| 44 | **Check 7 do validador (pacotes irmãos não se citam) removido; o check 8 (interna tem quem a invoque) vira 7.** `BLIND_PAIRS`, `citation()`, 7a e 7b saem inteiros | Sem par de irmãos, o check passava vazio e a mensagem final ("pacotes irmãos não se citam") mentia. Código morto não fica | `BLIND_PAIRS = []` "para o futuro" — YAGNI; se voltar um pacote paralelo, o check volta do git |
| 45 | **Categoria `eduzz` sai da LP:** `type Category`, `CATEGORIES`, `CATEGORY_LABELS`, o bundle em `install-prompt.ts`, as duas cores em `CategoryBadge`, `--color-eduzz*` no CSS, o grid `lg:grid-cols-4 → 3`, a prosa do Hero. O bundle `ship` ganha `example: "/work"` no lugar de `/jira-board` (interna desde a D-16, não aparece no menu) | `CATEGORY_PACKAGE` é derivado do marketplace com cast `as Record<Category,string>`: sem a chave no tipo o `tsc` não avisa e `lib/skills.ts` faz `path.join(undefined)` em runtime. Tirar do tipo faz o compilador apontar o resto | Deixar `eduzz` no tipo com pacote inexistente — quebra silenciosa no build |
| 46 | **Motor de branch `work/references/branch.md`** (dono: `/work`): recebe o § 2 do `/work` inteiro — gh → integração → branch, os 3 modos do § Branch, lote aberto, nome da branch, manter atualizada, override de sessão — com contrato (`{modo, nome}` do `/setup` + key + integração do `deploy-context` § 1 → checkout sincronizado + `{integração, branch, modo, lote, origem}`). `/work` § 2 e `/repro` § 2 apontam para ele como fonte única, no padrão dos `prod/references/*` | Segunda skill precisando da mesma mecânica; sem motor seria a terceira cópia (a do `/repro` antigo já divergia: `checkout main`). Mesma regra que criou o `jira-sync.md` | `/repro` ler `work/SKILL.md` § 1–3 por arquivo (precedente `fast → method/SKILL.md`) — o leitor veria também os passos 5–6 do `/work`; reescrever no `/repro` — a deriva de sempre |

**Efeito na máquina de quem tinha o `eduzz-builder`**: no próximo auto-update ele some do marketplace (o cache antigo continua com o `/repro` velho até o uninstall). Caminho: `/plugin uninstall eduzz-builder@lp-skills` + `/plugin install furi-ship@lp-skills` — o `/repro` vem nele, com o mesmo nome curto. Não há caminho automático — plugin novo é instalação nova.

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
