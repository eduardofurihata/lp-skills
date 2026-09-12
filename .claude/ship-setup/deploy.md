# Deploy — lp-skills

> Escrito pelo `deploy-context.md` (`/prod`). Tudo abaixo foi **inferido** dos arquivos do repositório — nenhum item precisou ser perguntado, e nenhum valor de secret aparece aqui.
> **Processo**, não inventário: o que existe e onde vive cada segredo é o `.claude/ship-setup/infra.md` (`/infra`); as convenções do time, o `.claude/ship-setup/setup.md` (`/setup`).

## Topologia

**Branch única** (`main`). Inferido de `git ls-remote --heads origin` → só `refs/heads/main`.
Consequência: não existe ambiente de homolog. O `/homolog` não trabalha neste repositório — quem entrega é o `/prod`, sem gate de autorização.

## Ambientes

| Ambiente | Branch | URL | Dispara por |
|---|---|---|---|
| prod | `main` | https://lp-skills.vercel.app | push em `main` → **integração Git da Vercel** (deploy é da plataforma; o `.github/workflows/ci.yml` só confere os manifestos gerados — não deploya) |

Projeto Vercel: `lp-skills` (`.vercel/project.json` → `prj_OIEX4hHuHPmxL4ccd84KPM71Tsd4`).
Preview: a Vercel cria um deploy de preview por branch/PR — não usado hoje, já que só existe `main`.

## Como checar

```bash
vercel ls lp-skills                          # deploys recentes, com estado (Ready / Building / Error)
vercel inspect <deployment-url>              # detalhe de um deploy
vercel logs <deployment-url>                 # log de build/runtime
curl -s -o /dev/null -w "%{http_code}" https://lp-skills.vercel.app   # o ar responde?
```
Vercel CLI presente na máquina: `50.32.1`. **Não existe `gh run`** para este projeto — o deploy não passa por GitHub Actions.

## Configuração

- **Env vars / secrets:** **nenhuma** (inventário: `.claude/ship-setup/infra.md`). Não há `.env`, `.env.example` nem leitura de `process.env` de app — a LP lê o frontmatter dos `SKILL.md` do próprio repositório em build time (`lib/skills.ts`). Se algum dia houver, o comando para setar é `vercel env add <NOME> production` (*Vercel → Project → Settings → Environment Variables*), onde cada uma vive fica registrado no `infra.md`, e o **valor é sempre perguntado**, nunca escrito em nenhum dos dois.
- **Migrations:** **nenhuma** — projeto sem banco (sem `prisma/`, `drizzle/`, `migrations/`).
- **Feature flags:** nenhuma.
- **Seeds:** nenhum.
- **Passo obrigatório antes de publicar:** `pnpm gen:plugins` — os manifestos (`.claude-plugin/marketplace.json` e os `plugin.json`) são **gerados** do frontmatter, nunca escritos à mão. Rodar 2× tem de produzir bytes idênticos (invariante do próprio script).

## Smoke pós-deploy

Rotas críticas:
- `/` — a LP inteira: catálogo de skills renderizado do frontmatter.

O que verificar: os cards das skills aparecem com nome (`/nome`) e descrição; o contador total bate com o número de diretórios em `skills/**`; os filtros de categoria (Build / Ship / Toolbox) funcionam; os cards de pacote batem com os plugins do `marketplace.json`; os comandos `/plugin install` são copiáveis.

Marketplace (a outra metade da produção — é o que `/plugin marketplace update` puxa): `gh api repos/eduardofurihata/lp-skills/contents/.claude-plugin/marketplace.json -q .content | base64 -d | jq '.plugins[].name'` lista exatamente os plugins gerados por `pnpm gen:plugins`.

**Skill que desaparece do catálogo = frontmatter inválido** — `lib/skills.ts` faz `catch { return null }` e a engole em silêncio. Este é o modo de falha mais importante do projeto, e só aparece no smoke.

Credenciais de teste: **nenhuma** — a LP é pública e sem autenticação.

## Rollback

```bash
vercel rollback                              # volta ao deploy anterior (promove o último Ready)
vercel ls lp-skills                          # para escolher um alvo específico
vercel promote <deployment-url>              # promove um deploy específico a produção
```
Rollback é **oferecido, nunca automático** — mesmo aqui, onde não há banco: o ar é a página que os usuários usam para instalar as skills.

## Runner

**Não se aplica.** O build roda na infraestrutura da Vercel, não em runner self-hosted. Logo, o estado "fila por runner offline" não existe neste projeto — os estados possíveis são os da Vercel (`Building` / `Ready` / `Error` / `Canceled`).

## Versão no ar

O projeto não expõe endpoint de versão. A prova de que o commit subiu é: deploy `Ready` cujo commit corresponde ao `HEAD` de `main` (`vercel ls` mostra o SHA) **+** o smoke da `/`.
