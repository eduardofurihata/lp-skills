# lp-skills

Skills do [Furihata](https://github.com/eduardofurihata), distribuídas como plugins que **Claude Code**, **Codex**, **Cursor**, **Copilot** e **VS Code** instalam direto do GitHub — igual em **Windows, macOS e Linux**, sem symlink e sem hook. As skills são separadas em três categorias: **Build** (o método: `/solve`, `/method`, `/proto`), **Ship** (a entrega — um pipeline só: os alvos `/work`, `/pull-request`, `/homolog`, `/prod`, que levam o trabalho de onde estiver até o próprio estágio; os modificadores `/repro` e `/card`, que compõem com qualquer alvo; e `/setup`, `/jira`, `/infra`, que configuram o processo, o Jira e a infra do projeto) e **Toolbox** (ferramentas avulsas: `/brain`, o parecer que entende o problema antes de decidir, `/blind`, a sessão que não vê nada, `/ask`, `/chat`, `/save`, `/sync`…).

Este repo é as duas coisas ao mesmo tempo: os **pacotes** (`plugins/<pacote>/`, três, um por categoria) com os catálogos que cada cliente lê, e a **landing page** (Next.js) que ajuda a montar os comandos de instalação.

**Uma cópia de cada skill, três clientes.** Todos convergiram em `skills/<slug>/SKILL.md` e discordam só de *onde o manifesto mora* — e como cada um mora num lugar diferente, os três coexistem no mesmo diretório:

| Cliente | Manifesto que ele lê | Como acha as skills |
|---|---|---|
| Claude Code | `.claude-plugin/plugin.json` | escaneia `skills/` na raiz do pacote |
| Agent Plugins v1 — Cursor, Copilot, VS Code, Codex | `plugin.json` na raiz | `skills/` |
| Codex nativo | `.codex-plugin/plugin.json` | `skills: "./skills/"` |

Por isso não existe cópia de distribuição neste repo: **um push atualiza todos os clientes**.

## Para usuários — Claude Code

O marketplace tem **3 pacotes** (plugins), um por categoria — você instala o pacote, não skill por skill. Cada pacote já traz todas as skills da categoria dentro.

```
# 1) adicione o marketplace (uma vez por máquina)
/plugin marketplace add eduardofurihata/lp-skills

# 2) instale o pacote que quiser (um, alguns ou todos)
/plugin install furi-build@lp-skills       # o método (/solve, /method, /proto)
/plugin install furi-ship@lp-skills        # a entrega (alvos: /work, /pull-request, /homolog, /prod · modificadores: /repro, /card · config: /setup, /jira, /infra)
/plugin install furi-toolbox@lp-skills     # ferramentas avulsas (/brain, /blind, /ask, /chat, /save, /sync, /make-dev, /video-teams…)
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

**Os três pacotes são independentes — nenhum puxa nenhum.** O `furi-build` é o método (do problema ao commit local) e não sabe o que é Jira, PR nem deploy; o `furi-ship` é o processo de entrega e o Jira, e declara o estágio do commit como **estado exigido** (implementado, revisado, testado com evidência, documentado, um commit) em vez de chamar quem constrói; o `furi-toolbox` são as avulsas. Instalar o `furi-ship` sozinho funciona — mas quem quiser o método que fecha aquele estado com protocolo instala o `furi-build` também; é a combinação recomendada.

Depois de instalado, cada skill é invocada pelo nome curto (`/method`, `/repro`, …) — a forma namespaced (`/furi-build:method`) também funciona. O Claude Code **copia** o pacote para o cache dele (`~/.claude/plugins/cache/lp-skills/<pacote>/<sha>/`) ele mesmo, por SO — por isso funciona igual em qualquer sistema, sem os problemas de symlink no Windows. Cada pacote é copiado separadamente, então um caminho `plugins/<outro-pacote>/skills/…` citado numa skill identificaria o arquivo **no repo**, não no cache — por isso nenhuma skill cita outro pacote (ver **Critério de pacote**).

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
├── plugins/                  # os 3 pacotes — FONTE das skills, nada gerado aqui dentro de skills/
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

Cada pasta em `plugins/` **é** a raiz de um pacote, e as skills dela moram em `plugins/<pacote>/skills/<slug>/`. A categoria de cada skill é derivada do pacote (`furi-build` → `build`), e o mapa categoria↔pacote sai do catálogo gerado — a LP não repete essa lista. O nome de invocação (`/homolog`) vem do `name` no frontmatter do `SKILL.md`. Dependência entre pacotes seria derivada do `requires` — e **não há nenhuma**: os três são independentes.

**Critério de pacote:** a skill que não tem `requires` **e** de quem nenhuma outra skill depende ou invoca vai para `furi-toolbox` — funciona sozinha (o `/brain` e o `/blind` são os casos-limite: sem dependências, sem dependentes, sem citar outra skill e sem uma linha que cite empresa, linguagem ou forja — funcionam em qualquer repositório, então são toolbox). O `/blind` é o caso extremo: uma sessão que não vê nada — nem esta conversa, nem `CLAUDE.md`, nem arquivos, nem internet, nem ferramenta — e por isso nenhuma skill a invoca nem é invocada por ela; o `/brain`, que precisa da mesma segunda opinião, carrega o **próprio** bloco de sessão cega (`claude -p --safe-mode`) em vez de depender do `/blind` — é o preço de cada um ser instalável sozinho. As que entram no grafo se dividem pelo que tocam: **`furi-ship`** é o `/jira`, o `/setup`, o `/infra`, a `pipeline` e toda skill que os lista em `requires` — quem fala com board, GitHub ou ambiente. Dentro dele há **um pipeline só**: os quatro **alvos** (`/work`, `/pull-request`, `/homolog`, `/prod`) declaram até que estágio vão e entregam ao loop da `pipeline` (skill **interna**, `user-invocable: false` — só hospeda os motores; o `pnpm check` exige que toda interna seja alvo de algum `requires`), que diagnostica onde o trabalho está e fecha só o que falta; os dois **modificadores** (`/repro`, `/card`) rodam a própria parte e delegam ao alvo, em qualquer ordem digitada (`/repro /prod` = `/prod /repro`); `/setup`, `/jira` e `/infra` são invocadas no Step 0 de todas e também digitáveis, para configurar um projeto novo; **`furi-build`** é o resto do grafo (`/solve`, `/method`, `/proto`) — constrói sem saber o que é Jira, PR ou deploy.

**`build` e `ship` não se conhecem.** Nenhum campo de relação atravessa entre os dois — nem `requires`, nem `handoff`, nem `boundary` —, e nenhuma skill de um cita o nome, o caminho ou o comando de uma skill do outro. É o que faz cada um ser instalável e utilizável sozinho. **Nenhum `requires` atravessa pacote nenhum**, aliás: é por isso que nenhum manifesto tem `dependencies`. O que sobra entre pacotes são menções sem dependência — o `/sync` (toolbox) encaminha para o `/prod`, e o `/prod` o cita como fronteira: linha tracejada e pontilhada no grafo, nada que o instalador precise puxar. Onde o `furi-ship` precisava do método, ele declara o **estado** que o estágio exige (implementado, revisado, testado com evidência, documentado, um commit) e confere o sinal observável — a mesma forma que já usava nos outros estágios da escada; o `furi-build` fecha esse estado com protocolo, quando está instalado, e o ship não precisa saber disso.

**O conhecimento permanente de um projeto mora em `.claude/`, versionado no repositório-alvo** — quatro arquivos, um dono cada. Os três do processo de entrega ficam na pasta **`.claude/ship-setup/`**: `setup.md` (convenções do time: branch, commit, PR, Jira — `/setup`), `infra.md` (mapa da infra e onde vive cada segredo, nunca o valor — `/infra`) e `deploy.md` (processo de deploy — `/prod` via `deploy-context`). O quarto, `.claude/patterns.md` (padrões de código do projeto), fica na raiz de `.claude/` e não em `ship-setup/`: ele não é do processo de entrega — quem o escreve é quem implementa. Não é a esteira por feature (`docs/01-problem/` … `kanban/`) nem a memória da máquina (`~/.claude/projects/`, onde só o board do Jira mora). Um `.md` solto em `.claude/` não é auto-carregado — cada arquivo é **lido sob demanda, por quem usa algo dele**, nunca via `CLAUDE.md`. Cada um tem uma variante **`<x>.local.md`** — mesmo formato, **nunca versionada** (como o `settings.local.json`) — para o repositório de um time que não usa este processo: o setup de uma pessoa não vai pro git dos outros, e o `/setup` pergunta uma vez qual dos dois é o caso; o do time vence quando os dois existem. Quem não é o dono lê por caminho e não cria: quem fecha o commit aplica o § Commit do `setup.md`; escrever é do dono.

## Workflow do autor

**Fonte única = o frontmatter dos `SKILL.md`.** Os manifestos e os catálogos são gerados, nunca escritos à mão — e não há cópia de skill para dessincronizar:

```bash
pnpm check     # gera os manifestos + valida os 3 pacotes + typecheck da LP
git add -A && git commit && git push   # publicar = dar push
```

`pnpm check` é exatamente o que o CI roda. Ele falha se um manifesto commitado não for o que o frontmatter produz — porque nesse caso o GitHub serviria aos clientes uma versão que ninguém gerou. Rodar `pnpm gen:plugins` sozinho também funciona; o `check` só acrescenta as provas.

Para o Claude Code e para o Cursor, cada push já é a versão nova (Git SHA / re-index). Para o Codex, veja a seção dele: o usuário precisa reinstalar.

**Skill que depende de outra a invoca via Skill tool** no ponto de uso (`furi-build:<nome>` / `furi-ship:<nome>`) e a lista em `requires` — mencionar não é invocar. Hand-offs ("Próximo: /pull-request") e fronteiras ("isso é o /prod") ficam como menção: o próximo passo é decisão do usuário. Caminho de arquivo dentro de uma skill diz o escopo: `<slug>/SKILL.md` e `references/x.md` são do **mesmo pacote** (resolvem no cache instalado) — as skills do `furi-ship` são mono-arquivo, com seções `§ <Seção>` dentro do próprio `SKILL.md`; o `/method` mantém os `references/` dele; `plugins/<pacote>/skills/<slug>/…` é de **outro pacote** e por isso é proibido: nenhuma skill cita outro pacote, nem por caminho nem por nome; `docs/…`, `kanban/…`, `.claude/…`, `.github/…`, `.secrets/…` são do **projeto-alvo** — lidos por caminho no repositório onde a skill roda, e ler um deles não cria dependência entre pacotes (o validador conhece essas raízes em `TARGET_PROJECT_ROOTS`).

**As três relações têm campo no frontmatter** — é a regra acima em forma declarada, e é dela que sai o grafo da [LP](https://lp-skills.vercel.app). Todos aceitam `x` ou `[x, y]`, e o `pnpm check` falha se um alvo não for o `name` de nenhuma skill:

| campo | quando usar | efeito |
|---|---|---|
| `requires` | a skill **invoca** a outra / não roda sem ela | linha cheia no grafo **e** dependência entre pacotes no manifesto |
| `handoff` | o **próximo passo** é a outra skill, quando o usuário quiser | linha tracejada no grafo |
| `boundary` | **fronteira**: isso é assunto da outra skill, não desta | linha pontilhada no grafo |

Só o `requires` vira `dependencies` do pacote: instalar tem que trazer o que a skill **invoca**, não para onde ela encaminha — é o que mantém o `furi-toolbox` avulso, mesmo com o `/sync` entregando para o `/prod`.

**Nenhuma skill se ativa sozinha.** Uma skill roda quando o usuário digita o comando (`/x` sem argumento = o objetivo é o que a conversa já está tratando) ou quando outra skill a invoca pela Skill tool — nunca porque o modelo achou que cabia. A `description` é o que o modelo lê para decidir, então ela **descreve a capacidade** ("Covers …") e nunca traz gatilho ("Triggers on …", "Use when you want …", "before any code change"). Duas defesas, e o `pnpm check` exige uma delas:

| defesa | quem leva | por quê |
|---|---|---|
| `disable-model-invocation: true` no frontmatter | toda skill que **nenhuma outra invoca pela Skill tool** — a `pipeline` (lida por caminho), o `/proto` e o toolbox inteiro | é o gate do Claude Code: tira a skill da listagem do modelo e bloqueia a Skill tool. Só o usuário digitando `/<name>` a roda. Garantia por código |
| a sentinela `NEVER activate on your own initiative.` na `description` | quem **outra skill invoca pela Skill tool** — o `/solve` na ativação do `/method`, o `/jira`, o `/setup` e o `/infra` no Step 0, o próprio `/method` (ciclo de follow-up), e os 4 alvos e os 2 modificadores do ship, que se delegam na composição (`/repro /prod`) | a trava bloquearia essa chamada — **inclusive na composição**: digitar `/repro /prod` não libera o `/prod` para a Skill tool, porque o gate procura o token na mensagem do usuário e a expansão do comando não o deixa lá (provado na 2.1.272). A defesa é o texto; a sentinela é o que o `pnpm check` confere e o que a LP corta antes de exibir |

A trava também vale para **todo** subagente e para coordinator mode — um workflow não invoca uma skill travada. Quem precisar disso migra a skill para a sentinela.

**Skill que roda em subagente** (`context: fork`) declara `effort` e **não declara `model`**. Sem `model:` o fork usa o modelo padrão de subagente (ou o da sessão), então acompanha a atualização de modelo em vez de ficar preso a um alias — o `/save` (`background: false`, a sessão espera o retorno inline) é o exemplo. `model:` só entra quando a escolha for deliberada e para baixo (`haiku`, `sonnet`): nunca para fixar o modelo grande, que é o default e muda de nome.

**Skill que precisa de uma opinião que não herda nada** abre uma sessão nova, não um subagente: `env -u CLAUDECODE claude -p --safe-mode --tools ""`, num diretório temporário vazio, com o texto por stdin — sem a conversa, sem `CLAUDE.md`, sem memória, sem MCP, sem plugin, sem arquivo e sem ferramenta, com o login da sessão. Um fork herda o harness, o `CLAUDE.md` e o enquadramento de quem o chamou — tira o custo de contexto, não o viés. O `/blind` (toolbox) é essa sessão na mão do usuário: `/blind <texto>` manda o texto verbatim e devolve a resposta inteira; nenhuma skill o invoca — quem precisa do mecanismo (o `/brain`) carrega o próprio bloco. Mesma regra de modelo: `--model` só para rebaixar.

**Editando uma skill com feedback imediato** (sem republicar a cada tecla): carregue o pacote em modo dev, in-place, apontando para a raiz dele — carrega o pacote inteiro com todas as skills:

```bash
claude --plugin-dir ~/GitHub/lp-skills/plugins/furi-build      # furi-build
claude --plugin-dir ~/GitHub/lp-skills/plugins/furi-ship       # furi-ship
claude --plugin-dir ~/GitHub/lp-skills/plugins/furi-toolbox    # furi-toolbox
```

Skills de outros repos (ex.: `ui-ux-pro-max`) permanecem instaladas por outros meios e não vivem aqui.

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
