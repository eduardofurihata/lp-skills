---
name: infra
description: 'Use ONLY when the user explicitly invokes /infra (bare /infra = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:infra` via the Skill tool. NEVER activate on your own initiative. — the infrastructure of THIS project, in two versioned files it owns: `infra.md` (inventory: providers, accounts, services, domains, WHERE each secret lives — never a value) and `deploy.md` (process: detected topology, environments, how to deploy, check, configure, smoke, roll back). `/infra <provedor>` focuses one; `audit` reports only.'
effort: max
boundary: [prod, setup]
argument-hint: "(vazio = reconferir e mostrar o diff) | <provedor> | audit"
---

# /infra — a infra deste projeto: o mapa e o processo

Dono **único** de dois arquivos em `.claude/ship-setup/` (ou `.local.md`, no modo só-meu do `/setup`): **`infra.md`**, o inventário — o que existe, sob qual conta, onde vive cada segredo; **`deploy.md`**, o processo — topologia, ambientes, como sobe, se checa, se configura, volta. Aqui não se seta variável nem se faz deploy.

## Os guarda-chuvas

- **Inventário sem valor.** Identificador entra (conta, projeto, região, domínio, nome de variável); credencial **nunca** — nem mascarada, nem no chat ou no log. `.secrets/` se lê por nomes (`grep -oE '^[A-Za-z_][A-Za-z0-9_]*=' <env>`); `*.pem`, `id_*`, JSON de conta de serviço não se abrem.
- **Descobrir de arquivo, confirmar por CLI, perguntar o resto.** Arquivos: `.secrets/README.md`, `.env.example`, `.mcp.json`, `.vercel/`, `*.tf`, workflows (`${{ secrets.X }}`, `runs-on`), `docker-compose*`; provedores pelos prefixos das variáveis — nem todo `AWS_*` é AWS. CLIs **read-only já autenticadas** (`aws sts get-caller-identity`, `vercel whoami`, `gcloud config list`) — nunca `login`, nunca `source` do cofre. Não derivou nem confirmou → `não confirmado (motivo)`. Repo Eduzz/Labzz: recorte + ponteiro para `eduzz-aws`.
- **Topologia é detectada, nunca declarada — e registrada uma vez.** A integração é para onde o trabalho converge **de fato**; `dev` + `main` é só o padrão. Doc que confere → zero pergunta; divergiu → corrigir; URL ou comando inventado é pior que perguntar.

## Fluxo — `/infra`

0. Modo (`setup.md` ⇒ time; só `setup.local.md` ⇒ só meu; nenhum → `Skill(skill: "setup")`). Ler `infra.md`.
1. Inferir citando a fonte → confirmar por CLI → perguntar só o não-derivável (papel de arquivo obscuro, conta canônica entre várias, o que é cópia): *"inferi isto; confirmei aquilo; preciso que você diga isso"*.
2. **Gate anti-vazamento**, bloqueante, no rascunho: `grep -nE -- '-----BEGIN|AKIA[0-9A-Z]{16}|sk_(live|test)_|ghp_[A-Za-z0-9]{20,}|://[^/[:space:]]+:[^@[:space:]]+@|(password|senha|token|secret|api[_-]?key)[[:space:]]*[=:][[:space:]]*[^[:space:]<`—-]{8,}'` — bateu → não grava; falso positivo → reescreva a linha e rode de novo.
3. Escrever no arquivo do modo e reportar o **diff**: `🗺️ Infra: <N> provedores · <M> segredos · <K> artefatos [criado | atualizado | sem mudança]` + apareceu / sumiu (pergunte antes de apagar) / mudou. `audit` = tudo, sem escrever.

**`infra.md`:** `## Provedores e contas` (conta/projeto · região · para quê · confirmado por) · `## Serviços` · `## Domínios e DNS` · `## Onde vive cada segredo` (**nome** · localmente · no ambiente · como se obtém) · `## Artefatos em .secrets/` · `## Se vazar` · `## Identificadores em uso`.

## Deploy — `deploy.md`, lido pelos alvos e pelo `/deploy`

1. **Detectar, toda invocação** — a primeira evidência decide: (0) o `deploy.md` já registra os nomes → confirma; (1) `gh pr list --state all --limit 20 --json baseRefName` — a branch que os PRs miram; (2) `git ls-remote --heads origin dev develop staging homolog` — mais de uma → pergunte; (3) a default do GitHub. Produção: `main`, senão `master`, senão a default. Integração ≠ produção ⇒ **duas branches** (`<integração>` = ambiente homolog); iguais ⇒ **branch única**. Branch parada que nenhum PR mira é legado; `dev` só local é branch única.
2. **Ler** `deploy.md`. Confere → seguir. Divergiu → reportar e corrigir. Não existe → **inferir** (workflows: `on: push: branches`, `runs-on`; `vercel.json`; scripts; migrations) e **perguntar** só URLs, como se seta secret, rotas do smoke, onde está o runner; escrever, avisando que é versionado.
3. **O doc:** `## Topologia` · `## Ambientes` (`| Ambiente | Branch | URL | Dispara por |` — daqui se lê "tem homolog?" e o nome real de cada branch) · `## Como checar` (comandos exatos) · `## Configuração` (**como** se seta; **onde** vive é o `infra.md`) · `## Smoke pós-deploy` (rotas, onde estão as credenciais de teste) · `## Rollback` · `## Runner` (onde, como saber se está online). Nunca um valor.

## PARE se pensar
"copio o valor pro mapa" · "`cat .secrets/tokens.env`" · "chuto a conta pelo nome do projeto" · "todo projeto meu tem `dev`" · "existe branch `homolog`, então é a integração" · "não achei a URL, chuto" · "o doc existe, não confiro"
