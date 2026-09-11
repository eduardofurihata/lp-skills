# Deploy Context — a topologia e o processo de deploy DESTE projeto

> **Fonte única do contexto de deploy.** `/homolog`, `/prod`, `pull-request` e `work` perguntam a topologia aqui; ninguém assume `dev`, ninguém chuta comando de deploy.

**Responsabilidade única:** responder *"qual é a topologia deste repositório e como o deploy funciona aqui?"* — lendo o doc do projeto, ou descobrindo e escrevendo-o na primeira vez.

## Iron Law

> **Descobrir uma vez, registrar no projeto, reconferir sempre.** O processo de deploy é conhecimento **do projeto** — versionado, revisável em PR, igual para todo mundo do time. Perguntar de novo a cada invocação é desperdício que o usuário sente; **inventar** URL ou comando é pior: manda a skill agir sobre um ambiente que talvez não exista.

## Contrato

| Entrada | Saída |
|---|---|
| repositório do checkout | `{topologia, ambientes[], comandos, configuração, smoke, rollback, runner}` |

## 1 — Detectar a topologia (SEMPRE, toda invocação)

```bash
git ls-remote --heads origin dev     # vazio ⇒ não há branch de integração remota
git ls-remote --heads origin main
```

| Resultado | Topologia | Consequência |
|---|---|---|
| `dev` **e** `main` existem em `origin` | **duas branches** | `dev` = integração (ambiente homolog) · `main` = produção |
| só `main` | **branch única** | único ambiente é **prod**; `/homolog` não trabalha aqui, `/pull-request` mira `main`, `/work` branca de `main` |

- **`dev` existe só local, não em `origin`** → conta como **branch única** para efeito de PR e deploy (não há para onde abrir PR remoto). Reporte a existência local, não a promova a integração sozinho.
- Topologia é **detectada, nunca declarada** — a mesma regra que o `/method` aplica a escopo de plataforma. Detectada, é comparada com o que o doc registra; divergiu → § 3.

## 2 — O doc do projeto

**`docs/00-context/technical/deploy.md`** — versionado no repositório, ao lado do `patterns.md` que o review já consome.

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

## Configuração         <!-- por ambiente: ONDE vive e COMO se seta. Nunca o valor -->
- Env vars / secrets: <onde> · comando: <como>
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
| `git ls-remote --heads origin` | a topologia (§ 1) |

**Perguntar** — só o que não é derivável de arquivo nenhum:
- as **URLs** de cada ambiente;
- **onde vivem** os secrets de cada ambiente (painel da plataforma? `gh secret`? gerenciador?);
- as **rotas críticas** do smoke, se não houver rota óbvia;
- **onde está** o runner self-hosted e como conferir se está online.

Apresentar separado, sempre — *"inferi isto (destas fontes); preciso que você confirme aquilo"*. **Zero URL inventada, zero comando chutado.** Não sabe e não perguntou → o campo fica explicitamente vazio no doc, e quem consumir sabe que falta.

Escrever o doc, avisar que foi criado (é arquivo versionado — entra no commit de quem chamou).

## 5 — Como se sabe que o commit está no ar

Sinal primário: **run de deploy verde cujo SHA cobre o HEAD** da branch do ambiente (`deploy-run.md`). Prova final: **smoke funcional** (`smoke.md`). Se o projeto expõe versão no ar, use como reforço.

Nenhum projeto é obrigado a expor endpoint de versão por causa desta skill — o run e o smoke bastam.

## Red Flags — STOP

- "Todo projeto meu tem `dev`, assumo" → NÃO. `git ls-remote` primeiro, **toda** invocação. Assumir `dev` em branch única é o bug que quebra `/homolog`, `/pull-request` e `/work` de uma vez.
- "O doc já existe, então não confiro a topologia" → NÃO. Reconferir é barato; doc stale manda a skill agir no ambiente errado.
- "Não achei a URL de homolog, chuto pelo padrão do projeto" → NÃO. **Pergunta.** URL inventada = smoke passando em lugar nenhum, ou falhando por engano.
- "Escrevo o valor do secret no doc para não perguntar de novo" → NÃO. **Nunca.** O doc diz onde e como; o valor é pedido na hora.
- "Guardo isso na memória da máquina, como o `/jira-board`" → NÃO. Board é preferência de quem usa; deploy é conhecimento do time, e tem que ser versionado e revisável.
- "Pergunto tudo, é mais seguro" → NÃO (o oposto). O que está em `.github/workflows/` você **lê**. Perguntar o derivável é a fricção que faz a skill ser abandonada.
- "`dev` existe local, então a topologia é de duas branches" → NÃO. Sem `origin/dev` não há para onde abrir PR nem o que deployar. Reporta a local, não a promove.
