# lp-skills

Skills do Claude Code do [Furihata](https://github.com/eduardofurihata), distribuídas como um **Claude Code plugin marketplace** — instala e atualiza igual em **Windows, macOS e Linux**, sem symlink e sem hook. As skills são separadas em duas categorias: **Pessoal** e **Eduzz** (trabalho).

Este repo é as duas coisas ao mesmo tempo: o **marketplace** (`.claude-plugin/marketplace.json` + um plugin por skill) e a **landing page** (Next.js) que ajuda a montar os comandos de instalação.

## Para usuários

No seu Claude Code:

```
# 1) adicione o marketplace (uma vez por máquina)
/plugin marketplace add eduardofurihata/lp-skills

# 2) instale as skills que quiser (as dependências entram automáticas)
/plugin install method@lp-skills
/plugin install jira@lp-skills

# 3) atualize quando houver versão nova
/plugin marketplace update
```

Não quer escolher uma a uma? Instale um **pacote** inteiro:

```
/plugin install furi-builder@lp-skills     # todas as skills pessoais
/plugin install eduzz-builder@lp-skills    # todas as skills de trabalho (Eduzz)
```

Os pacotes (`furi-builder`, `eduzz-builder`) são plugins agregadores: instalá-los puxa, via dependências, todas as skills da categoria de uma vez.

A skill é invocada pelo nome curto (`/method`, `/jira`, …). O Claude Code **copia** o plugin para o cache dele (`~/.claude/plugins/`) ele mesmo, por SO — por isso funciona igual em qualquer sistema, sem os problemas de symlink no Windows.

Prefere escolher visualmente? Acesse a [LP](https://lp-skills.vercel.app), filtre por categoria, selecione as skills e copie os comandos `/plugin` gerados.

> **Requisito:** Claude Code recente (recomendado v2.1.142+). Se `/plugin` não aparecer, atualize o Claude Code.

> **Para um time/projeto:** adicione o marketplace no `.claude/settings.json` do projeto (`extraKnownMarketplaces`) para que todo mundo o conheça ao clonar; cada dev instala as skills que precisa.

## Estrutura

```
lp-skills/
├── .claude-plugin/
│   └── marketplace.json    # catálogo do marketplace (GERADO)
├── skills/                 # source of truth — um plugin single-skill por pasta
│   ├── personal/<skill>/
│   │   ├── SKILL.md
│   │   └── .claude-plugin/plugin.json   # (GERADO)
│   └── eduzz/<skill>/…
├── scripts/
│   └── generate-plugins.mjs   # gera marketplace.json + os plugin.json do frontmatter
├── app/                    # Next.js App Router (a LP)
├── components/             # React components
└── lib/                    # categorias + leitor de skills + gerador de comandos
```

A categoria de cada skill é derivada da pasta-pai (`personal`/`eduzz`). O nome de invocação (`/merge`) vem do `name` no frontmatter do `SKILL.md`; as dependências vêm do `requires`.

## Workflow do autor

**Fonte única = o frontmatter dos `SKILL.md`.** Os manifestos são gerados, nunca escritos à mão:

```bash
pnpm gen:plugins    # lê skills/**/SKILL.md → escreve marketplace.json + os plugin.json
git add -A && git commit && git push   # publicar = dar push (versionamento por git-SHA)
```

Cada push vira uma versão nova (não há `version` fixado); os usuários recebem no próximo `/plugin marketplace update`.

**Editando uma skill com feedback imediato** (sem republicar a cada tecla): carregue o plugin em modo dev, in-place, apontando para a pasta da skill:

```bash
claude --plugin-dir ~/GitHub/lp-skills/skills/personal/merge
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
