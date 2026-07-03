# lp-skills

Skills do Claude Code do [Furihata](https://github.com/eduardofurihata), distribuídas como um **Claude Code plugin marketplace** — instala e atualiza igual em **Windows, macOS e Linux**, sem symlink e sem hook. As skills são separadas em duas categorias: **Pessoal** e **Eduzz** (trabalho).

Este repo é as duas coisas ao mesmo tempo: o **marketplace** (`.claude-plugin/marketplace.json` + **2 plugins** que empacotam as skills) e a **landing page** (Next.js) que ajuda a montar os comandos de instalação.

## Para usuários

O marketplace tem **2 pacotes** (plugins) — você instala o pacote, não skill por skill. Cada pacote já traz todas as skills da categoria dentro.

```
# 1) adicione o marketplace (uma vez por máquina)
/plugin marketplace add eduardofurihata/lp-skills

# 2) instale o pacote que quiser (um, ou os dois)
/plugin install furi-builder@lp-skills     # todas as skills pessoais
/plugin install eduzz-builder@lp-skills    # todas as skills de trabalho (Eduzz)

# 3) atualize quando houver versão nova
/plugin marketplace update
```

`eduzz-builder` **puxa o `furi-builder` junto** (dependência): o `/jira` e o `/afl` usam o `/method` e o `/solve`, que são pessoais — então instalar o pacote de trabalho traz também os pessoais que ele precisa.

Depois de instalado, cada skill é invocada pelo nome curto (`/method`, `/jira`, …) — a forma namespaced (`/furi-builder:method`) também funciona. O Claude Code **copia** o plugin para o cache dele (`~/.claude/plugins/`) ele mesmo, por SO — por isso funciona igual em qualquer sistema, sem os problemas de symlink no Windows.

Prefere escolher visualmente? Acesse a [LP](https://lp-skills.vercel.app), filtre por categoria, selecione as skills e copie os comandos `/plugin` gerados.

> **Requisito:** Claude Code recente (recomendado v2.1.142+). Se `/plugin` não aparecer, atualize o Claude Code.

> **Para um time/projeto:** adicione o marketplace no `.claude/settings.json` do projeto (`extraKnownMarketplaces`) para que todo mundo o conheça ao clonar; cada dev instala as skills que precisa.

## Estrutura

```
lp-skills/
├── .claude-plugin/
│   └── marketplace.json    # catálogo do marketplace — só 2 plugins (GERADO)
├── skills/                 # source of truth
│   ├── personal/           # = plugin furi-builder (raiz)
│   │   ├── .claude-plugin/plugin.json   # empacota as skills abaixo (GERADO)
│   │   └── <skill>/SKILL.md
│   └── eduzz/              # = plugin eduzz-builder (raiz)
│       ├── .claude-plugin/plugin.json   # (GERADO)
│       └── <skill>/SKILL.md
├── scripts/
│   └── generate-plugins.mjs   # gera os 2 plugin.json + o marketplace.json do frontmatter
├── app/                    # Next.js App Router (a LP)
├── components/             # React components
└── lib/                    # categorias + leitor de skills + gerador de comandos
```

Cada pasta de categoria (`skills/personal`, `skills/eduzz`) **é** a raiz de um plugin; o `plugin.json` gerado lá lista as skills da categoria em `skills: ["./<slug>", …]`. A categoria de cada skill é derivada da pasta-pai. O nome de invocação (`/merge`) vem do `name` no frontmatter do `SKILL.md`; a dependência cruzada entre pacotes (eduzz → furi) é derivada do `requires`.

## Workflow do autor

**Fonte única = o frontmatter dos `SKILL.md`.** Os manifestos são gerados, nunca escritos à mão:

```bash
pnpm gen:plugins    # lê skills/**/SKILL.md → escreve marketplace.json + os plugin.json
git add -A && git commit && git push   # publicar = dar push (versionamento por git-SHA)
```

Cada push vira uma versão nova (não há `version` fixado); os usuários recebem no próximo `/plugin marketplace update`.

**Editando uma skill com feedback imediato** (sem republicar a cada tecla): carregue o plugin em modo dev, in-place, apontando para a pasta da categoria (a raiz do plugin) — carrega o pacote inteiro com todas as skills:

```bash
claude --plugin-dir ~/GitHub/lp-skills/skills/personal   # furi-builder
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
