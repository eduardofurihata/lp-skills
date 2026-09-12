# Deploy Context — a topologia e o processo de deploy DESTE projeto

> **Fonte única do contexto de deploy.** `/homolog`, `/prod`, `pull-request`, `work` e `repro` (os dois via o motor `work/references/branch.md`) perguntam a topologia aqui; ninguém assume `dev`, ninguém chuta comando de deploy.

**Responsabilidade única:** responder *"qual é a topologia deste repositório e como o deploy funciona aqui?"* — lendo o doc do projeto, ou descobrindo e escrevendo-o na primeira vez.

## Iron Law

> **Descobrir uma vez, registrar no projeto, reconferir sempre.** O processo de deploy é conhecimento **do projeto** — versionado, revisável em PR, igual para todo mundo do time. Perguntar de novo a cada invocação é desperdício que o usuário sente; **inventar** URL ou comando é pior: manda a skill agir sobre um ambiente que talvez não exista.

## Contrato

| Entrada | Saída |
|---|---|
| repositório do checkout | `{topologia, ambientes[], comandos, configuração, smoke, rollback, runner}` |

## 1 — Detectar a topologia (SEMPRE, toda invocação)

A integração é a branch **para onde o trabalho converge de fato** — nunca "a que se chama `dev`". Três evidências, nesta ordem; a primeira que responde decide:

```bash
gh pr list --state all --limit 20 --json baseRefName -q '.[].baseRefName' | sort | uniq -c | sort -rn   # 1. para onde os PRs vão
git ls-remote --heads origin dev develop                                                              # 2. a branch de integração com o nome de sempre existe?
gh repo view --json defaultBranchRef -q .defaultBranchRef.name                                        # 3. a default do GitHub (onde os PRs caem por padrão)
git ls-remote --heads origin main master                                                              # produção: `main`, senão `master`
```

| Evidência | Integração |
|---|---|
| os PRs recentes miram, em maioria, uma branch | **ela** (`dev`, `develop`, `homolog`, `staging`, `main` — o nome não importa, o uso importa) |
| sem PR que responda, mas `dev`/`develop` existe em `origin` | **`dev`** (ou `develop`) |
| nada disso | a **default** do GitHub |

Produção = `main` em `origin`; senão `master`; senão a default. **A default não é produção por definição** — time que abre PR contra `dev` costuma deixar `dev` como default justamente para os PRs caírem nela (caso real: `vibe-nivee`, default `dev`, produção `main`). Integração ≠ produção ⇒ **duas branches**; integração = produção ⇒ **branch única**.

| Topologia | Consequência |
|---|---|
| **duas branches** | integração = ambiente homolog · `main` = produção |
| **branch única** | único ambiente é **prod**; `/homolog` não trabalha aqui, `/pull-request` mira a integração (= `main`), `/work` branca dela |

- **Branch morta não é integração.** Candidata que nenhum PR recente mira e que está **parada** — `git log -1 --format=%ci origin/<b>` há mais de 90 dias, ou `git rev-list --count origin/<b>..origin/<produção>` nas centenas — é legado: reporte e ignore. Caso real: `labzz-afl` tem `origin/homolog` parada desde 2026-04, 4.394 commits atrás da `main`, e 19 dos 20 últimos PRs vão para `main` — é **branch única**.
- **`dev` existe só local, não em `origin`** → conta como **branch única** para efeito de PR e deploy (não há para onde abrir PR remoto). Reporte a existência local, não a promova a integração sozinho.
- Sem `gh` autenticado → só a evidência 2 e a produção por `ls-remote`; diga que a 1 e a 3 não rodaram.
- Topologia é **detectada, nunca declarada** — a mesma regra que o `/method` aplica a escopo de plataforma. Detectada, é comparada com o que o doc registra; divergiu → § 3.

## 2 — O doc do projeto

**`.claude/ship-setup/deploy.md`** — versionado no repositório, na mesma casa do `.claude/ship-setup/setup.md` (convenções do time — `/setup`), do `.claude/ship-setup/infra.md` (mapa da infra — `/infra`) e do `.claude/patterns.md` (padrões de código — `/method` Step 4). É a casa do conhecimento **permanente** do projeto: nada ali é por feature, nada ali é da máquina. Um `.md` solto em `.claude/` não é auto-carregado — só entra quando alguém o lê por caminho, como este motor faz. **Do time ou só meu:** o `/setup` (Step 0 de quem chega aqui) decidiu o modo deste repositório — `setup.md` existe ⇒ este doc é `deploy.md`, versionado; só `setup.local.md` existe ⇒ este doc é **`deploy.local.md`**, fora do git (repositório de um time que não usa este processo). Leitura: `cat .claude/ship-setup/deploy.md 2>/dev/null || cat .claude/ship-setup/deploy.local.md 2>/dev/null`; o do time vence. Se este motor rodar sem o `/setup`, no modo time confira `git check-ignore -v .claude/ship-setup/deploy.md`.

Fronteira com o `infra.md`: **este doc é processo** (como sobe, como checa, como seta, como volta); **o `infra.md` é inventário** (o que existe, sob qual conta, onde vive cada segredo). Onde vive uma variável se lê lá; como setá-la, aqui.

```markdown
# Deploy — <projeto>

## Topologia
duas branches (`dev` + `main`) | branch única (`main`)

## Ambientes
| Ambiente | Branch | URL | Dispara por |
|---|---|---|---|
| homolog | `dev`  | https://…  | push em `dev` → `.github/workflows/<x>.yml` (runner self-hosted) |
| prod    | `main` | https://…  | push em `main` → `.github/workflows/<y>.yml` (runner self-hosted) |
<!-- branch única: só a linha de prod -->

## Como checar          <!-- comandos EXATOS, copiáveis; não descrição -->
gh run list --branch <branch> --limit 5
gh run watch <id> --exit-status

## Configuração         <!-- por ambiente: COMO se seta. ONDE cada segredo vive é o `.claude/ship-setup/infra.md`. Nunca o valor -->
- Env vars / secrets: comando: <como> (ex.: `vercel env add <NOME> production` · `gh secret set <NOME>`) · onde vive cada um: `.claude/ship-setup/infra.md`
- Migrations: <comando>
- Feature flags: <onde/como>
- Seeds: <comando>

## Smoke pós-deploy
- Rotas críticas: /… , /…
- Credenciais de teste: <onde estão> (nunca o valor aqui)

## Rollback
<comando exato>

## Runner
self-hosted em <onde> · como conferir se está online: <comando/observação>
<!-- máquina desligada ⇒ job enfileirado, não falho -->

## Versão no ar (opcional)
<endpoint que devolve o SHA, se o projeto expõe — reforço, não requisito>
```

**Nenhum valor de secret neste arquivo, nunca.** O doc diz *onde* a variável vive e *como* setá-la; o valor é pedido na hora (`env-config.md`). Secret versionado sobrevive a `git rm` e vaza para sempre.

## 3 — Os três caminhos

| Estado | O que fazer |
|---|---|
| **Doc no caminho antigo** (`.claude/deploy.md` — a raiz de `.claude/`, antes da pasta `ship-setup/` — ou `docs/00-context/technical/deploy.md`) e nada em `.claude/ship-setup/deploy.md` | migrar antes de qualquer outra coisa: `mkdir -p .claude/ship-setup && git mv <caminho-antigo> .claude/ship-setup/deploy.md`. Avisar (é arquivo versionado — entra no commit de quem chamou). No modo **só meu** o destino é `deploy.local.md` e o `git mv` vira `git rm --cached` + `mv` (o antigo estava versionado; o novo não fica). Depois, um dos três estados abaixo |
| **Doc existe e confere** com a topologia detectada | ler e seguir. **Zero pergunta.** |
| **Doc não existe** | § 4 — inferir, perguntar o resto, escrever |
| **Doc existe e divergiu** (URL morta, workflow renomeado, `dev` passou a existir, topologia mudou) | reportar **o que mudou**, corrigir o doc (perguntando só o não-derivável) e seguir. **Nunca** seguir com contexto que você sabe estar errado |

## 4 — Descobrir: inferir primeiro, perguntar o mínimo

**Inferir** (e **citar a fonte** de cada item inferido):

| Fonte | O que sai dela |
|---|---|
| `.github/workflows/*.yml` | o que dispara o deploy (`on: push: branches:`), o job, e se `runs-on: self-hosted` |
| `vercel.json` / `.vercel/project.json` / `netlify.toml` | plataforma e nome do projeto |
| `Makefile` / `package.json` scripts | comandos de build, migration, seed |
| `.env.example` / `.env.template` | **quais** variáveis existem (nunca valores) |
| `prisma/migrations/`, `alembic/`, `db/migrate/` | que há migration, e a ferramenta |
| `gh pr list --json baseRefName` · `git ls-remote --heads origin` · `gh repo view --json defaultBranchRef` | a topologia (§ 1) |

**Perguntar** — só o que não é derivável de arquivo nenhum:
- as **URLs** de cada ambiente;
- **como se seta** um secret em cada ambiente (comando ou painel) — *onde vive* cada um não se pergunta aqui: é o `.claude/ship-setup/infra.md` (`/infra`), e se ele não existe é o `env-config` quem o invoca na hora de aplicar;
- as **rotas críticas** do smoke, se não houver rota óbvia;
- **onde está** o runner self-hosted e como conferir se está online.

Apresentar separado, sempre — *"inferi isto (destas fontes); preciso que você confirme aquilo"*. **Zero URL inventada, zero comando chutado.** Não sabe e não perguntou → o campo fica explicitamente vazio no doc, e quem consumir sabe que falta.

Escrever o doc no arquivo do modo — `deploy.md` (avisar que é versionado: entra no commit de quem chamou) ou `deploy.local.md` (avisar que fica fora do git).

## 5 — Como se sabe que o commit está no ar

Sinal primário: **run de deploy verde cujo SHA cobre o HEAD** da branch do ambiente (`deploy-run.md`). Prova final: **smoke funcional** (`smoke.md`). Se o projeto expõe versão no ar, use como reforço.

Nenhum projeto é obrigado a expor endpoint de versão por causa desta skill — o run e o smoke bastam.

## Red Flags — STOP

- "Todo projeto meu tem `dev`, assumo" → NÃO. § 1 primeiro, **toda** invocação. Assumir `dev` em branch única é o bug que quebra `/homolog`, `/pull-request` e `/work` de uma vez.
- "Existe uma branch `homolog` no remoto, então é a integração" → NÃO. Nome não é uso: se nenhum PR a mira e ela está parada, é legado. § 1 decide pelos PRs, não pelo nome.
- "O doc já existe, então não confiro a topologia" → NÃO. Reconferir é barato; doc stale manda a skill agir no ambiente errado.
- "Não achei a URL de homolog, chuto pelo padrão do projeto" → NÃO. **Pergunta.** URL inventada = smoke passando em lugar nenhum, ou falhando por engano.
- "Escrevo o valor do secret no doc para não perguntar de novo" → NÃO. **Nunca.** O doc diz onde e como; o valor é pedido na hora.
- "Guardo isso na memória da máquina, como o `/jira-board`" → NÃO. Board é preferência de quem usa; deploy é conhecimento do time, e tem que ser versionado e revisável.
- "`.claude/` é do Claude, é coisa local, não versiono" → NÃO. `.claude/ship-setup/deploy.md`, `setup.md`, `infra.md` e `patterns.md` são do **time**; só `settings.local.json`, `plans/` e `worktrees/` são pessoais. Está no `.gitignore`? O `/setup` propõe a correção (`.claude/*` + negações) — não mude o doc de lugar.
- "Anoto no `deploy.md` onde vive cada secret, é tudo configuração" → NÃO. Onde vive é inventário (`infra.md`); aqui é o comando de setar. Um fato, um dono.
- "Pergunto tudo, é mais seguro" → NÃO (o oposto). O que está em `.github/workflows/` você **lê**. Perguntar o derivável é a fricção que faz a skill ser abandonada.
- "`dev` existe local, então a topologia é de duas branches" → NÃO. Sem `origin/dev` não há para onde abrir PR nem o que deployar. Reporta a local, não a promove.
