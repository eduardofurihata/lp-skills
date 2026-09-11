---
name: infra
description: 'Use when someone needs to know what infrastructure THIS project uses and where each secret lives — the single owner of `.claude/infra.md`, the project infra map (versioned in the target repo, read on demand): providers, accounts and projects (identifiers only), regions, services, domains/DNS, and WHERE each secret lives (path in `.secrets/`, variable name, provider panel) — never a value. Reads `.secrets/` by file name and variable name only (never values, never key files), plus platform files (`.env.example`, `.mcp.json`, `.vercel/`, workflows, terraform, docker-compose) and read-only CLIs already authenticated (aws sts, vercel, gh, gcloud, railway, neonctl); confirms what it can, asks only what is not derivable, runs a leak gate before writing and reports the diff on every run. Invoked by the env-config engine (via /homolog and /prod) when `.claude/infra.md` is missing. Also usable directly — `/infra` refreshes and shows the diff, `/infra <provedor>` focuses one provider, `/infra audit` reports without writing. Triggers on "onde está a chave do X", "que contas esse projeto usa", "mapeia a infra", "o que tem no .secrets", "onde vive esse secret". Never applies configuration (that is env-config) and never writes a deploy process (that is deploy-context).'
effort: max
boundary: [prod, setup]
argument-hint: "(vazio = reconferir e mostrar o diff) | <provedor> | audit"
---

# /infra — O mapa da infra deste projeto

Dono **único** de `.claude/infra.md`. Responde *"o que este projeto usa de infra, onde, sob qual conta — e onde vive cada segredo"*. É o **inventário**; o **processo** (como sobe, como checa, como volta) é o `.claude/deploy.md`, do `prod/references/deploy-context.md`, e **aplicar** configuração é o `prod/references/env-config.md`. Aqui não se seta variável, não se faz deploy, não se cria conta.

> **Escopo: inventário sem valor.** O arquivo é versionado. Identificador entra; credencial, nunca.

## Iron Law

> **Inventário sem valor.** `account id`, `project id`, região, domínio, nome de serviço, nome de variável, caminho em `.secrets/` — isso é mapa, e entra. Chave, token, senha, passphrase, connection string, dump — isso é credencial, e **nunca** entra, nem "só o começo", nem "mascarado". O arquivo é versionado: um valor ali sobrevive a `git rm` e vaza para sempre. E o valor tampouco passa pelo chat ou pelo log — quem lê `.secrets/` lê **nomes**.

## Contrato

| Entrada | Saída |
|---|---|
| repositório do checkout (`.secrets/`, arquivos de plataforma, CLIs já autenticadas) | `.claude/infra.md` escrito/atualizado + **diff** contra a versão anterior + `{provedores[], segredos[], artefatos[], naoConfirmado[]}` para quem chamou |

- **Por projeto.** O mapa é o recorte **deste** repositório. Em projeto Eduzz/Labzz, a conta AWS inteira é do `~/GitHub/eduzz-aws` (`docs/MAPA-AWS.md`, skill `aws-prod`): o `infra.md` guarda o que **este** projeto usa e aponta pra lá — não copia.
- **Descobrir de arquivo, confirmar por CLI, perguntar o resto.** Nada inventado: o que não foi derivado nem confirmado fica `não confirmado` no mapa, e quem consome sabe que falta.
- **Julgamento, não estado.** Contagem de recurso, saúde, revisão de task, fatura — isso envelhece errado e mina a autoridade do resto (a lição do `MAPA-AWS.md`). O mapa diz *o que existe, onde e por quê*; *como está agora* é o `vercel ls`/`aws describe` da hora.
- **Só grava depois do gate.** Passo 6 é bloqueante.

## Onde mora

`.claude/infra.md`, ao lado de `.claude/setup.md` (convenções — `/setup`), `.claude/deploy.md` (processo) e `.claude/patterns.md` (padrões). O `/setup` § Infra aponta pra cá. `mkdir -p .claude` antes de gravar. Não é auto-carregado: só entra quando alguém o lê por caminho — e é isso que se quer.

## Fluxo

### 1. Ler o mapa atual (SEMPRE)

```bash
cat .claude/infra.md 2>/dev/null || cat .claude/infra.local.md 2>/dev/null
```

É o estado anterior — o passo 5 faz o diff contra ele. Não existe → o passo 5 reporta "criado agora".

**Do time ou só meu** — o modo é o que o `/setup` decidiu para este repositório (passo 0 dele): existe `setup.md` → modo **time**, este mapa é `infra.md`, versionado; existe só `setup.local.md` → modo **só meu**, este mapa é `infra.local.md`, fora do git (repositório de um time que não usa este processo — o `.claude/` ignorado de propósito). Nenhum dos dois → rode o `/setup` antes (Skill tool `furi-ship:setup`): é ele quem pergunta, uma vez, e não esta skill. O `infra.md` do time vence o local quando os dois existem.

### 2. Inferir de arquivos — só nomes, citando a fonte

**`.secrets/`** (se existir; é gitignored — só o `README.md` sobrevive):

```bash
find .secrets -type f | sort                                  # a árvore — nomes, tamanhos, nunca conteúdo
cat .secrets/README.md 2>/dev/null                            # é doc: lido inteiro
for f in $(find .secrets -maxdepth 1 -type f \( -name '*.env' -o -name '.env*' \)); do
  echo "== $f"; grep -oE '^[A-Za-z_][A-Za-z0-9_]*=' "$f" | tr -d '=' | sort   # SÓ as chaves
done
```

| O que é | Como entra no mapa |
|---|---|
| `.env`-like (`tokens.env`, `atlassian.env`) | **nomes** das variáveis → § Onde vive cada segredo (`onde mora localmente: .secrets/tokens.env`) |
| `*.pem`, `id_*`, `*.pub`, `*passphrase*`, `*service-account*.json`, `*.p12`, `*.ppk` | **nunca abertos** — só nome e tipo ("chave SSH", "conta de serviço Google") |
| `*.sql`, `*.dump`, `*.tfstate`, `*.tfvars`, `*.tar.gz`, `*.png`, `*.json` de export, `*.diff` | **artefato**, não credencial → § Artefatos (o que é, de quando, pode apagar?) |
| `*-REMOVIDO`, `*-antes-*`, `*-depois-*` | artefato de operação já encerrada — vale registrar como histórico |
| `README.md` do `.secrets/` | doc: o "por quê", "o que mora aqui", "se vazar", "identificadores em uso" — é a **fonte mais rica** e migra pro mapa |

**Arquivos de plataforma** (todos são nomes/estrutura, sem segredo):

| Fonte | O que sai dela |
|---|---|
| `.env.example` / `.env.template` | **quais** variáveis o app espera (nunca valor) |
| `.mcp.json` | servidores MCP e as variáveis que cada um exige |
| `.vercel/project.json`, `vercel.json` | projeto Vercel (`projectId`, `orgId`) |
| `netlify.toml`, `railway.json`, `fly.toml`, `render.yaml` | plataforma e nome do serviço |
| `*.tf`, `terraform/` | provedor, região, recursos declarados, backend do state |
| `.github/workflows/*.yml` | `${{ secrets.X }}` → segredos que vivem no GitHub; `runs-on: self-hosted` |
| `docker-compose*.yml` | serviços locais, imagens, portas |
| `prisma/schema.prisma`, `drizzle.config.*`, `alembic.ini` | provider do banco |
| `package.json` scripts | CLIs de deploy/migração em uso |

**Provedores** são derivados dos prefixos das variáveis (`VERCEL_`, `NEON_`/`DATABASE_URL`, `AWS_`, `GOOGLE_`/`GCP_`, `CLOUDFLARE_`, `RESEND_`, `STRIPE_`, `ASAAS_`, `JIRA_`, `RAILWAY_`, `SUPABASE_`…) e dos arquivos de plataforma. Prefixo que não conhece → pergunte no passo 4. **Nem todo `AWS_*` é AWS** (o `MAPA-AWS.md` § 7.1 tem o caso) — confirme.

### 3. Confirmar por CLI — read-only, só o que já está autenticado

```bash
aws sts get-caller-identity 2>/dev/null          # conta e principal
vercel whoami 2>/dev/null && vercel project ls    # time e projetos
gh repo view --json nameWithOwner,visibility      # repo e visibilidade; gh api …/actions/secrets → NOMES dos secrets
gcloud config list 2>/dev/null                    # projeto ativo
railway status 2>/dev/null
neonctl projects list 2>/dev/null
```

**Nunca** `login`, **nunca** `export` de credencial lida do `.secrets/`, **nunca** um comando que grave. Falhou ou não está autenticado → o campo fica `não confirmado (CLI ausente / não autenticada)` — diga qual e siga. Não invente conta pelo nome do projeto.

### 4. Perguntar — só o não-derivável (AskUserQuestion, uma chamada, poucas perguntas)

- Papel de um arquivo cujo nome não diz (`deploys-labzz-studio`?).
- Qual é a conta **canônica** quando há mais de uma do mesmo provedor (o alkaline tem três contas Asaas e três do Meta — o README dele diz qual é a casa).
- O que é **cópia** de outro lugar (`neon-url.txt` = cópia do `DATABASE_URL` em `tokens.env`) — cópia entra no mapa como cópia, com a fonte.
- Em repo Eduzz/Labzz: qual stack do `MAPA-AWS.md` § 2 é a deste projeto.

Apresente separado: *"inferi isto (destas fontes); confirmei aquilo (por CLI); preciso que você diga isso"*.

### 5. Escrever e reportar o diff

Escreva a partir de **`references/template.md`** (`mkdir -p .claude`), no arquivo do **modo** (`infra.md` ou `infra.local.md` — passo 1). Depois, contra o que o passo 1 leu:

```
🗺️ Infra: <N> provedores · <M> segredos mapeados · <K> artefatos   [criado agora | atualizado | sem mudança]
  + apareceu:  .secrets/cloudflare.env (CLOUDFLARE_DNS_TOKEN) · provedor Cloudflare
  − sumiu:     .secrets/gratta-urls.txt (URL vencida — o README já previa descarte)
  ~ mudou:     Resend: domínio verificado envio.… → apex (README, 26/08)
  ? não confirmado: conta AWS (aws CLI não autenticada)
```

Sumiu do `.secrets/` mas continua no mapa → pergunte se saiu de uso ou só mudou de lugar; não apague em silêncio. Em repo Eduzz/Labzz, o mapa começa com o ponteiro pro `eduzz-aws` e guarda só o recorte.

`audit` → tudo acima **sem** escrever: só o relatório e o diff que *seria* aplicado.

### 6. Gate anti-vazamento — antes de gravar, bloqueante

Varra o conteúdo **que vai ser gravado** (o rascunho, não o arquivo em disco):

```bash
grep -nE -- '-----BEGIN|AKIA[0-9A-Z]{16}|sk_(live|test)_|ghp_[A-Za-z0-9]{20,}|xox[bp]-|://[^/[:space:]]+:[^@[:space:]]+@|(password|senha|token|secret|api[_-]?key)[[:space:]]*[=:][[:space:]]*[^[:space:]<`—-]{8,}' <rascunho>
```

Bateu → **não grava**. Mostre a linha com o trecho mascarado (`AKIA…`), corrija o rascunho (o que era pra ser *nome* virou *valor*?) e rode o gate de novo. Falso positivo (ex.: `- Token da API: alkaline-man-jornada (escopo Data.Export)` é **nome** de token, não valor) → reescreva a linha pra deixar óbvio que é nome (`nome do token:`), e rode de novo. **Nunca** "gravo assim mesmo".

Depois de gravar, **no modo time**: `git check-ignore -v .claude/infra.md` → ignorado → avise e proponha a mesma correção do `/setup` passo 0 (`.claude/` → `.claude/*` + `!.claude/infra.md`), confirmando antes. O mapa do time é para ser versionado. **No modo só meu** (`infra.local.md`), estar fora do git é o esperado — nada a propor; o cuidado é o oposto: confira que ele **não** aparece em `git status`.

## Como se relaciona com o resto

| Arquivo | Dono | O que guarda | Onde este mapa entra |
|---|---|---|---|
| `.claude/setup.md` | `/setup` | convenções do time | § Infra aponta pra cá |
| `.claude/deploy.md` | `deploy-context.md` | processo: ambientes, como checar, como setar, rollback | § Configuração diz o **comando** para setar; **onde vive** cada segredo é daqui |
| `env-config.md` (motor do `/homolog`/`/prod`) | `/prod` | aplica configuração no ambiente | lê § Onde vive cada segredo; sem `infra.md` → invoca `/infra` antes |
| `.secrets/README.md` | o projeto | "por que `.secrets`" + o que mora ali | fonte de leitura; depois do mapa pode virar "por quê + ponteiro pro `infra.md`" (decisão do projeto, não desta skill) |
| `~/GitHub/eduzz-aws` (`MAPA-AWS.md`, `aws-prod`) | Eduzz/Labzz | a conta inteira | o mapa aponta pra lá e guarda só o recorte deste projeto |

## Red Flags — STOP

- "Copio o valor pro mapa pra não perguntar de novo" → NÃO. **Nunca.** Versionado = vazado pra sempre.
- "`cat .secrets/tokens.env` pra ver o que tem" → NÃO. Só as chaves (`grep -oE '^[A-Za-z_][A-Za-z0-9_]*='`). Valor não passa pelo chat nem pelo log.
- "Abro o JSON da conta de serviço pra pegar o `project_id`" → NÃO. O JSON carrega a chave privada. `project_id` vem do `gcloud config list`, do README ou de pergunta.
- "`set -a; . .secrets/tokens.env`" pra confirmar por CLI → NÃO. Confirmar usa a autenticação **que já existe** na máquina. Carregar o cofre no ambiente da sessão é exposição sem necessidade (e o README do alkaline registra que esse `source` quebra).
- "Não estou autenticado, chuto a conta pelo nome do projeto" → NÃO. `não confirmado`, dito.
- "Em repo Eduzz copio o `MAPA-AWS.md` pra cá" → NÃO. Recorte deste projeto + ponteiro. Duas cópias divergem.
- "O gate bateu num falso positivo, gravo assim mesmo" → NÃO. Reescreve a linha, roda de novo.
- "Escrevo o mapa dentro do `deploy.md`, é tudo infra" → NÃO. Deploy é processo; inventário é aqui. Dois donos pro mesmo arquivo é como se perde a verdade.
- "Anoto quantos containers/serviços estão rodando" → NÃO. Estado envelhece errado; o mapa é julgamento. Número é `describe` da hora.
- "Sumiu do `.secrets/`, apago do mapa" → NÃO. Pergunte: saiu de uso ou mudou de lugar? O mapa é onde o time vai procurar.
- "Já rodei hoje, o mapa está atualizado" → NÃO. Diff é barato; `.secrets/` muda sem avisar ninguém.
