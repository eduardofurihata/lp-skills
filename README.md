# lp-skills

Skills do [Furihata](https://github.com/eduardofurihata), distribuídas como plugins que **Claude Code**, **Codex**, **Cursor**, **Copilot** e **VS Code** instalam direto do GitHub — igual em **Windows, macOS e Linux**, sem symlink e sem hook. As skills são separadas em quatro categorias: **Build** (o método: `/principles`, `/ui`, `/solve`, `/method`, `/fast`, `/todo`, `/proto`), **Ship** (a entrega: `/jira-board`, `/setup`, `/infra`, `/card`, `/work`, `/pull-request`, `/homolog`, `/prod`), **Toolbox** (ferramentas avulsas: `/ask`, `/chat`, `/save`, `/sync`…) e **Eduzz** (trabalho).

Este repo é as duas coisas ao mesmo tempo: os **pacotes** (`plugins/<pacote>/`, quatro, um por categoria) com os catálogos que cada cliente lê, e a **landing page** (Next.js) que ajuda a montar os comandos de instalação.

**Uma cópia de cada skill, três clientes.** Todos convergiram em `skills/<slug>/SKILL.md` e discordam só de *onde o manifesto mora* — e como cada um mora num lugar diferente, os três coexistem no mesmo diretório:

| Cliente | Manifesto que ele lê | Como acha as skills |
|---|---|---|
| Claude Code | `.claude-plugin/plugin.json` | escaneia `skills/` na raiz do pacote |
| Agent Plugins v1 — Cursor, Copilot, VS Code, Codex | `plugin.json` na raiz | `skills/` |
| Codex nativo | `.codex-plugin/plugin.json` | `skills: "./skills/"` |

Por isso não existe cópia de distribuição neste repo: **um push atualiza todos os clientes**.

## Para usuários — Claude Code

O marketplace tem **4 pacotes** (plugins), um por categoria — você instala o pacote, não skill por skill. Cada pacote já traz todas as skills da categoria dentro.

```
# 1) adicione o marketplace (uma vez por máquina)
/plugin marketplace add eduardofurihata/lp-skills

# 2) instale o pacote que quiser (um, alguns ou todos)
/plugin install furi-build@lp-skills       # o método (/principles, /ui, /solve, /method, /fast, /todo, /proto)
/plugin install furi-ship@lp-skills        # a entrega (/jira-board, /setup, /infra, /card, /work, /pull-request, /homolog, /prod) — puxa o furi-build
/plugin install furi-toolbox@lp-skills     # ferramentas avulsas (/ask, /chat, /save, /sync, /make-dev…)
/plugin install eduzz-builder@lp-skills    # skills de trabalho (Eduzz): /jira, /afl, /proof, /video-teams
```

**3) ligue o auto-update — ele nasce DESLIGADO.** Marketplace de terceiro não atualiza sozinho por default; só os oficiais. Ligue de um dos dois jeitos:

```jsonc
// ~/.claude/settings.json — declarativo, e sincroniza entre máquinas
{
  "extraKnownMarketplaces": {
    "lp-skills": { "source": { "source": "github", "repo": "eduardofurihata/lp-skills" }, "autoUpdate": true }
  }
}
```

Ou pela UI: `/plugin` → aba **Marketplaces** → `lp-skills` → ligue o auto-update (é o mesmo campo que o JSON grava). Confira que a entrada ficou com `"autoUpdate": true`.

Com ele ligado, o Claude Code busca versão nova em segundo plano depois que a sessão começa (com atraso de até ~10 min, para a sessão em curso não trocar de versão no meio) e avisa para rodar `/reload-plugins` — ou a versão nova entra no próximo start. Para puxar na hora: `/plugin marketplace update lp-skills`.

`furi-ship` e `eduzz-builder` **puxam o `furi-build` junto** (dependência): o `/work` roda o `/method`, o `/card` e os motores usam o `/solve` e o `/todo`, o `/jira` roda o `/method` — então instalar o pacote de entrega ou o de trabalho traz também o método que ele precisa. A dependência vai só nessa direção: `build` não sabe o que é Jira, PR nem deploy. O `furi-toolbox` não puxa nem é puxado por ninguém: cada skill dele funciona sozinha.

Depois de instalado, cada skill é invocada pelo nome curto (`/method`, `/jira`, …) — a forma namespaced (`/furi-build:method`) também funciona. O Claude Code **copia** o pacote para o cache dele (`~/.claude/plugins/cache/lp-skills/<pacote>/<sha>/`) ele mesmo, por SO — por isso funciona igual em qualquer sistema, sem os problemas de symlink no Windows. Cada pacote é copiado separadamente, então um caminho `plugins/<outro-pacote>/skills/…` citado numa skill identifica o arquivo **no repo**, não no cache: entra como menção, e quem precisa do conteúdo invoca a skill dona.

Prefere escolher visualmente? Acesse a [LP](https://lp-skills.vercel.app), filtre por categoria, selecione as skills e copie os comandos gerados.

> **Requisito:** Claude Code recente (recomendado v2.1.142+). Se `/plugin` não aparecer, atualize o Claude Code.

> **Para um time/projeto:** ponha o marketplace no `.claude/settings.json` do projeto (`extraKnownMarketplaces`, com `autoUpdate: true`) — todo mundo o conhece ao clonar, já atualizando; cada dev instala os pacotes que precisa.

## Para usuários — Cursor, Copilot e VS Code

Cada pacote tem um `plugin.json` na raiz conforme o [Agent Plugins v1](https://agent-plugins.org/specification), o padrão aberto que Cursor, Copilot e VS Code leem — nenhuma conversão, é o mesmo diretório que o Claude Code usa.

No Cursor: **Customize → Plugins → importe a URL do repositório** (`https://github.com/eduardofurihata/lp-skills`) como marketplace e instale os pacotes.

Para atualizar sozinho, ligue **Enable Auto Refresh** no marketplace importado — ele re-indexa a cada push (no máximo a cada ~10 min) e precisa do **Cursor GitHub App** instalado no repo. Ressalva que vale saber: auto-refresh atualiza o conteúdo dos pacotes existentes; quando um pacote **novo** aparece no repo, é preciso re-importar a URL para ele ser descoberto.

## Para usuários — Codex

O Codex lê o catálogo nativo (`.agents/plugins/marketplace.json`) e o manifesto `.codex-plugin/plugin.json` de cada pacote:

```bash
# 1) adicione o marketplace uma vez; ele fica salvo em ~/.codex/config.toml
codex plugin marketplace add eduardofurihata/lp-skills --ref main

# 2) instale os pacotes
codex plugin add furi-build@lp-skills
codex plugin add furi-ship@lp-skills
codex plugin add furi-toolbox@lp-skills
codex plugin add eduzz-builder@lp-skills

# 3) confira o estado global
codex plugin list --marketplace lp-skills
```

**Atualização no Codex não é automática** — é o único dos três em que você puxa na mão. Os pacotes instalados ficam em cache (`~/.codex/plugins/cache/lp-skills/<pacote>/<versão>/`), então além de atualizar o marketplace é preciso reinstalar para o cache pegar a versão nova:

```bash
codex plugin marketplace upgrade lp-skills
codex plugin add furi-build@lp-skills       # repita para os pacotes que você usa
```

Para o cache saber que mudou, o gerador acrescenta ao semver um cachebuster derivado do **conteúdo** das skills do pacote — editar uma skill muda a versão.

Para testar no checkout local antes de publicar, troque o primeiro comando por `codex plugin marketplace add /caminho/absoluto/para/lp-skills`. Abra uma conversa nova após instalar ou atualizar, para ela carregar as skills.

## Estrutura

```
lp-skills/
├── plugins/                  # os 4 pacotes — FONTE das skills, nada gerado aqui dentro de skills/
│   └── <pacote>/
│       ├── plugin.json               # Agent Plugins v1 — Cursor, Copilot, VS Code, Codex (GERADO)
│       ├── .claude-plugin/plugin.json # Claude Code (GERADO)
│       ├── .codex-plugin/plugin.json  # Codex nativo (GERADO)
│       └── skills/<skill>/SKILL.md    # a skill — uma cópia, lida pelos três
├── .claude-plugin/
│   └── marketplace.json      # catálogo do Claude Code — 1 pacote por categoria (GERADO)
├── .agents/plugins/
│   └── marketplace.json      # catálogo do Codex (GERADO)
├── scripts/
│   ├── generate-plugins.mjs  # frontmatter → os 3 manifestos de cada pacote + os 2 catálogos
│   └── validate-plugins.mjs  # falha se um pacote não serve algum dos 3 clientes
├── .github/workflows/ci.yml  # roda os dois acima: o que está no GitHub é o que foi gerado
├── app/                      # Next.js App Router (a LP)
├── components/               # React components
└── lib/                      # categorias + leitor de skills + grafo de relações + gerador de comandos
```

Cada pasta em `plugins/` **é** a raiz de um pacote, e as skills dela moram em `plugins/<pacote>/skills/<slug>/`. A categoria de cada skill é derivada do pacote (`furi-build` → `build`), e o mapa categoria↔pacote sai do catálogo gerado — a LP não repete essa lista. O nome de invocação (`/homolog`) vem do `name` no frontmatter do `SKILL.md`; a dependência cruzada entre pacotes (ship → build, eduzz → build) é derivada do `requires`.

**Critério de pacote:** categoria é dona primeiro — skill de trabalho mora em `eduzz-builder`, antes de qualquer outro critério (o `/proof` não tem dependências, mas audita PRs da Eduzz: é Eduzz). Entre as pessoais, a que não tem `requires` **e** de quem nenhuma outra skill depende ou invoca vai para `furi-toolbox` — funciona sozinha. As que entram no grafo se dividem pelo que tocam: **`furi-ship`** é o `/jira-board`, o `/setup`, o `/infra` e toda skill que os lista em `requires` — quem fala com board, GitHub ou ambiente (`/card`, `/work`, `/pull-request`, `/homolog`, `/prod`); **`furi-build`** é o resto do grafo (`/principles`, `/ui`, `/solve`, `/method`, `/fast`, `/todo`, `/proto`) — constrói sem saber o que é Jira, PR ou deploy. A dependência só vai de ship para build, nunca o inverso: o `/method` cita `/homolog`, `/prod` e `/setup` como fronteira, não como `requires`.

**O conhecimento permanente de um projeto mora em `.claude/`, versionado no repositório-alvo** — quatro arquivos, um dono cada: `setup.md` (convenções do time: branch, commit, PR, Jira — `/setup`), `infra.md` (mapa da infra e onde vive cada segredo, nunca o valor — `/infra`), `deploy.md` (processo de deploy — `/prod` via `deploy-context`) e `patterns.md` (padrões de código — `/method` Step 4). Não é a esteira por feature (`docs/01-problem/` … `kanban/`) nem a memória da máquina (`~/.claude/projects/`, onde só o board do Jira mora). Um `.md` solto em `.claude/` não é auto-carregado — cada arquivo é **lido sob demanda, por quem usa algo dele**, nunca via `CLAUDE.md`. Cada um tem uma variante **`<x>.local.md`** — mesmo formato, **nunca versionada** (como o `settings.local.json`) — para o repositório de um time que não usa este processo: o setup de uma pessoa não vai pro git dos outros, e o `/setup` pergunta uma vez qual dos dois é o caso; o do time vence quando os dois existem. Quem está em outro pacote lê por caminho e não cria: o `/method` aplica o § Commit do `setup.md`, o `/jira` da Eduzz aplica o § Branch; escrever é do dono.

## Workflow do autor

**Fonte única = o frontmatter dos `SKILL.md`.** Os manifestos e os catálogos são gerados, nunca escritos à mão — e não há cópia de skill para dessincronizar:

```bash
pnpm check     # gera os manifestos + valida os 4 pacotes + typecheck da LP
git add -A && git commit && git push   # publicar = dar push
```

`pnpm check` é exatamente o que o CI roda. Ele falha se um manifesto commitado não for o que o frontmatter produz — porque nesse caso o GitHub serviria aos clientes uma versão que ninguém gerou. Rodar `pnpm gen:plugins` sozinho também funciona; o `check` só acrescenta as provas.

Para o Claude Code e para o Cursor, cada push já é a versão nova (Git SHA / re-index). Para o Codex, veja a seção dele: o usuário precisa reinstalar.

**Skill que depende de outra a invoca via Skill tool** no ponto de uso (`furi-build:<nome>` / `furi-ship:<nome>` / `eduzz-builder:<nome>`) e a lista em `requires` — mencionar não é invocar. Hand-offs ("Próximo: /pull-request") e fronteiras ("isso é o /prod") ficam como menção: o próximo passo é decisão do usuário. Caminho de arquivo dentro de uma skill diz o escopo: `<slug>/references/x.md` é do **mesmo pacote** (resolve no cache instalado); `plugins/<pacote>/skills/<slug>/…` é de **outro pacote** e entra só como menção — o conteúdo chega invocando a skill dona; `docs/…`, `kanban/…`, `.claude/…`, `.github/…`, `.secrets/…` são do **projeto-alvo** — lidos por caminho no repositório onde a skill roda, e ler um deles não cria dependência entre pacotes (o validador conhece essas raízes em `TARGET_PROJECT_ROOTS`).

**As três relações têm campo no frontmatter** — é a regra acima em forma declarada, e é dela que sai o grafo da [LP](https://lp-skills.vercel.app). Todos aceitam `x` ou `[x, y]`, e o `pnpm check` falha se um alvo não for o `name` de nenhuma skill:

| campo | quando usar | efeito |
|---|---|---|
| `requires` | a skill **invoca** a outra / não roda sem ela | linha cheia no grafo **e** dependência entre pacotes no manifesto |
| `handoff` | o **próximo passo** é a outra skill, quando o usuário quiser | linha tracejada no grafo |
| `boundary` | **fronteira**: isso é assunto da outra skill, não desta | linha pontilhada no grafo |

Só o `requires` vira `dependencies` do pacote: instalar tem que trazer o que a skill **invoca**, não para onde ela encaminha — é o que mantém o `furi-toolbox` avulso, mesmo com o `/sync` entregando para o `/prod`.

**Editando uma skill com feedback imediato** (sem republicar a cada tecla): carregue o pacote em modo dev, in-place, apontando para a raiz dele — carrega o pacote inteiro com todas as skills:

```bash
claude --plugin-dir ~/GitHub/lp-skills/plugins/furi-build      # furi-build
claude --plugin-dir ~/GitHub/lp-skills/plugins/furi-build --plugin-dir ~/GitHub/lp-skills/plugins/furi-ship   # furi-ship (precisa dos dois: invoca furi-build:*)
claude --plugin-dir ~/GitHub/lp-skills/plugins/furi-toolbox    # furi-toolbox
claude --plugin-dir ~/GitHub/lp-skills/plugins/eduzz-builder   # eduzz-builder
```

Skills de outros repos (ex.: `ui-ux-pro-max`, `video-teams`) permanecem instaladas por outros meios e não vivem aqui.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Radix UI · sonner · Geist · gray-matter.

## Dev local

```bash
pnpm install
pnpm dev
```

Acesse http://localhost:3000.

## Licença

MIT.
