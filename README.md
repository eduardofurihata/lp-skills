# lp-skills

Skills do Claude Code do [Furihata](https://github.com/eduardofurihata), distribuídas como um **Claude Code plugin marketplace** — instala e atualiza igual em **Windows, macOS e Linux**, sem symlink e sem hook. As skills são separadas em quatro categorias: **Build** (o método: `/principles`, `/solve`, `/method`, `/fast`, `/todo`, `/proto`), **Ship** (a entrega: `/jira-board`, `/card`, `/work`, `/pull-request`, `/homolog`, `/prod`), **Toolbox** (ferramentas avulsas: `/ask`, `/chat`, `/save`, `/sync`…) e **Eduzz** (trabalho).

Este repo é as duas coisas ao mesmo tempo: o **marketplace** (`.claude-plugin/marketplace.json` + **4 plugins**, um por categoria, que empacotam as skills) e a **landing page** (Next.js) que ajuda a montar os comandos de instalação.

## Para usuários

O marketplace tem **4 pacotes** (plugins), um por categoria — você instala o pacote, não skill por skill. Cada pacote já traz todas as skills da categoria dentro.

```
# 1) adicione o marketplace (uma vez por máquina)
/plugin marketplace add eduardofurihata/lp-skills

# 2) instale o pacote que quiser (um, alguns ou todos)
/plugin install furi-build@lp-skills       # o método (/principles, /solve, /method, /fast, /todo, /proto)
/plugin install furi-ship@lp-skills        # a entrega (/jira-board, /card, /work, /pull-request, /homolog, /prod) — puxa o furi-build
/plugin install furi-toolbox@lp-skills     # ferramentas avulsas (/ask, /chat, /save, /sync, /make-dev…)
/plugin install eduzz-builder@lp-skills    # skills de trabalho (Eduzz): /jira, /afl, /proof, /video-teams

# 3) atualize quando houver versão nova
/plugin marketplace update
```

`furi-ship` e `eduzz-builder` **puxam o `furi-build` junto** (dependência): o `/work` roda o `/method`, o `/card` e os motores usam o `/solve` e o `/todo`, o `/jira` roda o `/method` — então instalar o pacote de entrega ou o de trabalho traz também o método que ele precisa. A dependência vai só nessa direção: `build` não sabe o que é Jira, PR nem deploy. O `furi-toolbox` não puxa nem é puxado por ninguém: cada skill dele funciona sozinha.

Depois de instalado, cada skill é invocada pelo nome curto (`/method`, `/jira`, …) — a forma namespaced (`/furi-build:method`) também funciona. O Claude Code **copia** o plugin para o cache dele (`~/.claude/plugins/`) ele mesmo, por SO — por isso funciona igual em qualquer sistema, sem os problemas de symlink no Windows. Cada pacote é copiado separadamente (`~/.claude/plugins/cache/lp-skills/<plugin>/<sha>/`), então um caminho `skills/<cat>/…` citado numa skill de outro pacote identifica o arquivo no repo — resolve no checkout, não no cache; nenhuma skill precisa lê-lo para funcionar: quem precisa do conteúdo invoca a skill dona.

Prefere escolher visualmente? Acesse a [LP](https://lp-skills.vercel.app), filtre por categoria, selecione as skills e copie os comandos `/plugin` gerados.

> **Requisito:** Claude Code recente (recomendado v2.1.142+). Se `/plugin` não aparecer, atualize o Claude Code.

> **Para um time/projeto:** adicione o marketplace no `.claude/settings.json` do projeto (`extraKnownMarketplaces`) para que todo mundo o conheça ao clonar; cada dev instala as skills que precisa.

## Estrutura

```
lp-skills/
├── .claude-plugin/
│   └── marketplace.json    # catálogo do marketplace — 1 plugin por categoria (GERADO)
├── skills/                 # source of truth
│   ├── build/              # = plugin furi-build (raiz) — o método
│   │   ├── .claude-plugin/plugin.json   # empacota as skills abaixo (GERADO)
│   │   └── <skill>/SKILL.md
│   ├── ship/               # = plugin furi-ship (raiz) — a entrega
│   │   ├── .claude-plugin/plugin.json   # (GERADO)
│   │   └── <skill>/SKILL.md
│   ├── toolbox/            # = plugin furi-toolbox (raiz) — skills avulsas
│   │   ├── .claude-plugin/plugin.json   # (GERADO)
│   │   └── <skill>/SKILL.md
│   └── eduzz/              # = plugin eduzz-builder (raiz)
│       ├── .claude-plugin/plugin.json   # (GERADO)
│       └── <skill>/SKILL.md
├── scripts/
│   └── generate-plugins.mjs   # gera os plugin.json + o marketplace.json do frontmatter
├── app/                    # Next.js App Router (a LP)
├── components/             # React components
└── lib/                    # categorias + leitor de skills + gerador de comandos
```

Cada pasta de categoria (`skills/build`, `skills/ship`, `skills/toolbox`, `skills/eduzz`) **é** a raiz de um plugin; o `plugin.json` gerado lá lista as skills da categoria em `skills: ["./<slug>", …]`. A categoria de cada skill é derivada da pasta-pai. O nome de invocação (`/homolog`) vem do `name` no frontmatter do `SKILL.md`; a dependência cruzada entre pacotes (ship → build, eduzz → build) é derivada do `requires`.

**Critério de pasta:** categoria é dona primeiro — skill de trabalho mora em `eduzz/`, antes de qualquer outro critério (o `/proof` não tem dependências, mas audita PRs da Eduzz: é `eduzz/`). Entre as pessoais, a que não tem `requires` **e** de quem nenhuma outra skill depende ou invoca vai para `toolbox/` — funciona sozinha. As que entram no grafo se dividem pelo que tocam: **`ship/`** é o `/jira-board` e toda skill que o lista em `requires` — quem fala com board, GitHub ou ambiente (`/card`, `/work`, `/pull-request`, `/homolog`, `/prod`); **`build/`** é o resto do grafo (`/principles`, `/solve`, `/method`, `/fast`, `/todo`, `/proto`) — constrói sem saber o que é Jira, PR ou deploy. A dependência só vai de ship para build, nunca o inverso: o `/method` cita `/homolog` e `/prod` como fronteira, não como `requires`.

## Workflow do autor

**Fonte única = o frontmatter dos `SKILL.md`.** Os manifestos são gerados, nunca escritos à mão:

```bash
pnpm gen:plugins    # lê skills/**/SKILL.md → escreve marketplace.json + os plugin.json
git add -A && git commit && git push   # publicar = dar push (versionamento por git-SHA)
```

Cada push vira uma versão nova (não há `version` fixado); os usuários recebem no próximo `/plugin marketplace update`.

**Skill que depende de outra a invoca via Skill tool** no ponto de uso (`furi-build:<nome>` / `furi-ship:<nome>` / `eduzz-builder:<nome>`) e a lista em `requires` — mencionar não é invocar. Hand-offs ("Próximo: /pull-request") e fronteiras ("isso é o /prod") ficam como menção: o próximo passo é decisão do usuário. Caminho de arquivo dentro de uma skill diz o escopo: `<slug>/references/x.md` é do **mesmo pacote** (resolve no cache instalado); `skills/<cat>/<slug>/…` é de **outro pacote** e entra só como menção — o conteúdo chega invocando a skill dona.

**Editando uma skill com feedback imediato** (sem republicar a cada tecla): carregue o plugin em modo dev, in-place, apontando para a pasta da categoria (a raiz do plugin) — carrega o pacote inteiro com todas as skills:

```bash
claude --plugin-dir ~/GitHub/lp-skills/skills/build      # furi-build
claude --plugin-dir ~/GitHub/lp-skills/skills/build --plugin-dir ~/GitHub/lp-skills/skills/ship   # furi-ship (precisa dos dois: invoca furi-build:*)
claude --plugin-dir ~/GitHub/lp-skills/skills/toolbox    # furi-toolbox
claude --plugin-dir ~/GitHub/lp-skills/skills/eduzz      # eduzz-builder
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
