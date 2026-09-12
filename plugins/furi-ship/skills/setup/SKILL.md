---
name: setup
description: 'Use when any ship skill needs the team conventions of THIS repository — the single owner of `.claude/setup.md` (versioned in the target repo, read on demand, never via CLAUDE.md nor machine memory): branch policy (work directly on the integration branch or branch per card, branch naming), commit convention (Conventional Commits, where the card key goes), PR policy (open or not, who approves, merge strategy, template), team Jira conventions (card language, DoD — the board itself stays in /jira-board), infra pointers and external guidelines. Reads the file on EVERY invocation; if absent, infers what is derivable (git log, gh api branch protection and merge settings, CODEOWNERS, PR template, CONTRIBUTING), asks only what is not, writes the file from a template — as the team file `.claude/setup.md` (versioned) or, when the repo keeps `.claude/` out of git on purpose and the process is one person''s, as `.claude/setup.local.md` (same format, never versioned; the team file wins when both exist). Never declares topology (git ls-remote), environments (`.claude/deploy.md`), the infra map (`.claude/infra.md`) or code patterns (`.claude/patterns.md`). Invoked at Step 0 by /work, /card, /pull-request, /homolog and /prod. Also usable directly — `/setup` shows the recorded conventions, `/setup <seção>` edits one section.'
effort: max
boundary: [jira-board, prod, infra]
argument-hint: "(vazio = mostrar o setup gravado) | branch | commit | pr | jira | infra | guidelines"
---

# /setup — As convenções do time neste repositório

Dono **único** de `.claude/setup.md`. Toda skill de entrega (`/work`, `/card`, `/pull-request`, `/homolog`, `/prod`) começa passando por aqui — nenhuma delas assume, descobre ou pergunta convenção por conta própria. O `/method` (§ Commit) **lê o arquivo por caminho** e aplica o que está escrito; criar e editar é daqui.

> **Escopo: só convenção do time.** Não cria card, não cria branch, não abre PR, não mexe em ambiente. Resolve *como este time trabalha neste repositório* e devolve isso pra quem chamou.

## Iron Law

> **Perguntar uma vez, versionar no projeto, reconferir sempre.** Convenção de trabalho é conhecimento do **time** — versionado, revisável em PR, igual para todo mundo que clona. Não é preferência da máquina de quem usa (isso é o board, e mora no `/jira-board`). O arquivo é lido **sempre**, explicitamente, no início. "Já está no contexto" não é leitura.

## Contrato

- **Por repositório.** O `vibe-nivee` abre branch por card; o `lp-skills` trabalha direto na `main`. Cada um tem o seu `.claude/setup.md`; nada de convenção hardcoded em skill nenhuma.
- **Do time ou só meu.** `.claude/setup.md` é **do time** — versionado, igual para quem clona. `.claude/setup.local.md` é **só meu** — mesmo formato, **nunca** vai pro git (como o `settings.local.json`). Serve ao repositório de um time que **não usa** este processo: o setup de uma pessoa seria lixo para os outros, e nem por isso deixa de existir. Regra de leitura: **o do time existe → é ele que vale**, sem sobreposição local; não existe → o local; nenhum → descobrir, e o passo 0 decide **onde** gravar. Vale para os quatro arquivos (`setup`, `infra`, `deploy`, `patterns`).
- **Declarado ≠ detectado.** O arquivo declara **política**. O que é fato do repositório é detectado na hora e **nunca** escrito aqui: a branch de integração (`dev` ou `main`) vem de `git ls-remote` (`prod/references/deploy-context.md` § 1); a key do card vem do argumento ou do nome da branch atual.
- **Default, não trava.** O que está no arquivo é o padrão do repo. Pedido explícito na sessão ("hoje quero branch", "abre PR desta vez") **vence para esta invocação** e **não** reescreve o arquivo. Só `/setup <seção>` reescreve.
- **Só grava o confirmado.** Inferência **ordena** as opções; quem decide é o usuário (uma vez na vida do repositório).
- **Consistência é obrigatória:** `Trabalho: direto na integração` ⇒ `Abre PR: não` ⇒ `Aprovação`, `Merge` e `Template` ficam `—`. Contradição não é gravada.
- **Lido sob demanda, por quem usa.** Nunca via `CLAUDE.md`, `@import` ou `.claude/rules/` — esses entram em **toda** sessão, inclusive nas que não commitam nem entregam nada.

## O que NÃO entra no arquivo

| Coisa | Onde mora | Por quê |
|---|---|---|
| Topologia (`dev`+`main` ou branch única) | `git ls-remote --heads origin dev`, toda invocação | fato, não política — declarado apodrece |
| Board, site, key do Jira | `~/.claude/projects/<slug>/memory/jira-board.md` (`/jira-board`) | coordenada de quem usa, não do time |
| Tipo de issue, sprint, transições | descobertos a cada uso (`/card`, `/work`) | mudam quando alguém mexe no workflow |
| URL de ambiente, comando de deploy, runner, rollback | `.claude/deploy.md` (`prod/references/deploy-context.md`) | processo de deploy tem dono próprio |
| Provedores, contas, onde vive cada segredo | `.claude/infra.md` (`/infra`) | inventário de infra tem dono próprio |
| Padrões de código | `.claude/patterns.md` (`/method` Step 4) | cresce com o código, não com o processo |

## Onde mora

`.claude/setup.md`, na raiz do repositório — ao lado de `.claude/infra.md`, `.claude/deploy.md` e `.claude/patterns.md`. É a casa do conhecimento **permanente** do projeto: o que não é por feature (`docs/01-problem/` … `docs/05-test-cases/`, `kanban/`) e não é da máquina (`~/.claude/projects/`).

Por que `.claude/` e não `CLAUDE.md`: um `.md` solto em `.claude/` **não** é carregado automaticamente — só `CLAUDE.md`, `settings.json`, `rules/`, `skills/`, `agents/` e `commands/` são. É exatamente o que se quer: o arquivo só entra quando alguém o lê por caminho. **Nunca** o mova para `.claude/rules/` nem o importe do `CLAUDE.md`.

Diferente da memória, o diretório pode não existir: `mkdir -p .claude` antes de gravar.

**Duas variantes, um formato:** `setup.md` é do time e versionado; `setup.local.md` é só de quem usa e fica fora do git — para o repositório de um time que não adota este processo (o `.claude/` ignorado de propósito é o sinal). A mesma regra vale para `infra`, `deploy` e `patterns`; o modo é decidido **uma vez por repositório**, aqui, no passo 0.

## Fluxo

### 0. Do time ou só meu? — onde o setup vive neste repositório (SEMPRE, antes de ler)

```bash
git check-ignore -v .claude/setup.md
ls .claude/setup.md .claude/setup.local.md 2>/dev/null
```

| Situação | Modo | O que fazer |
|---|---|---|
| `setup.md` existe (ignorado ou não) | **time** | é ele que vale — passo 1. Se estiver ignorado, avise: arquivo do time fora do git é mentira silenciosa; a correção é a do quadro abaixo, **confirmando antes** |
| `setup.local.md` existe, sem `setup.md` | **só meu** | passo 1, lendo o local. Nada a corrigir no `.gitignore`: é assim que tem de ser |
| nenhum dos dois, `.claude/` **não** ignorado | **time** | grave `setup.md` no passo 4; recomende, sem impor, ignorar o pessoal: `.claude/settings.local.json`, `.claude/*.local.md`, `.claude/plans/`, `.claude/worktrees/` |
| nenhum dos dois, `.claude/` **ignorado** (`.gitignore:<n>:.claude/`) | **perguntar** | ignorar `.claude/` não é defeito por definição — pode ser o time dizendo "processo de agente não entra aqui". **Uma pergunta**, isolada: |

```
`.claude/` está fora do git neste repositório (.gitignore:<n>). O setup é:
  Só meu — gravo em `.claude/setup.local.md`, que fica fora do git     ← provável em repo de time que não usa este processo (ex.: remote github.com/eduzz/*)
  Do time — corrijo o `.gitignore` (`.claude/*` + negações) e gravo `.claude/setup.md`
```

O candidato provável vem do contexto: remote de organização que não é do usuário + `.claude/` ignorado de propósito (com comentário, com exceções tipo `!.claude/settings.json`) ⇒ **"só meu" primeiro**. Repo do próprio usuário ⇒ "do time" primeiro. A resposta define o modo **deste repositório** para os quatro arquivos (`setup`, `infra`, `deploy`, `patterns`) — o `/infra`, o `deploy-context` e o `/method` seguem o que você decidiu aqui.

Correção do `.gitignore` quando o modo é **time** e `.claude/` está ignorado:

```gitignore
# antes                 # depois — o pessoal fica fora, o do time entra
.claude/                .claude/*
                        !.claude/setup.md
                        !.claude/infra.md
                        !.claude/deploy.md
                        !.claude/patterns.md
```

> **Por que trocar `.claude/` por `.claude/*`:** no git, negação (`!x`) **não reinclui** um arquivo cujo diretório pai está excluído. `.claude/` + `!.claude/setup.md` deixa o `setup.md` ignorado do mesmo jeito — e `git check-ignore` prova. Com `.claude/*` o que se exclui são os *filhos*, e aí a negação funciona. Alternativa, se o time não quiser mexer no `.gitignore`: `git add -f .claude/setup.md` (arquivo já rastreado não sofre ignore). **Nunca** mude o `.gitignore` de um repositório do time sem a resposta do passo acima — era decisão deles.

> **`.local.md` não é versionado, então pode sumir com a máquina.** Recriar custa um minuto (`/setup` infere e pergunta ≤3 coisas). Se o usuário tem backup de arquivos locais (ex.: um cofre de `.env` como o `env-vault`), `.claude/*.local.md` é candidato natural a entrar nele — sugira, não faça.

### 1. Ler o arquivo (SEMPRE)

```bash
cat .claude/setup.md 2>/dev/null || cat .claude/setup.local.md 2>/dev/null
```

**Existe e tem as seis seções** (`## Branch`, `## Commit`, `## PR`, `## Jira`, `## Infra`, `## Guidelines`) → passo 5. Não chame `gh` nem `git log` pra "reconfirmar": a convenção não mudou desde a última vez, e a ida ao GitHub é o custo que esta skill existe pra eliminar.

**Não existe, ou está incompleto** → passo 2. Incompleto = seção faltando; preencha só o que falta, preservando o resto. O arquivo gravado no passo 4 é o do **modo** decidido no passo 0.

### 2. Inferir (antes de perguntar) — e citar a fonte de cada item

| Fonte | O que sai dela | Como |
|---|---|---|
| `git log --format=%s -50` | convenção de commit | ≥ ~70% casam `^(feat|fix|refactor|docs|chore|test|perf|build|ci|style)(\(.+\))?!?:` → Conventional Commits |
| idem + `git log --format=%b -50` | posição da key do card | `[A-Z][A-Z0-9]+-\d+` no escopo (`feat(NIV-12): …`), no início (`NIV-12 feat: …`), em trailer (`Jira: NIV-12`) ou ausente |
| `gh pr list --state merged --limit 20` × `git log --no-merges --format=%h -50` | abre PR? | muitos PRs vs commits diretos **ordena** a pergunta 1 — não decide |
| `gh api repos/{owner}/{repo} --jq '{allow_merge_commit,allow_squash_merge,allow_rebase_merge}'` | estratégia de merge | **só uma** habilitada → é ela; mais de uma → pergunta 3 |
| `gh api repos/{owner}/{repo}/branches/<integração>/protection` | PR obrigatório, nº de aprovações | `404` = sem proteção (diga); `403` = sem permissão (diga; não assuma) |
| `gh api repos/{owner}/{repo}/rulesets` | idem, formato novo | complementa a linha acima |
| `.github/CODEOWNERS` | candidato a "quem aprova" | um único dono para `*` que é o próprio usuário ⇒ candidato a `a própria skill` |
| `.github/pull_request_template.md` (ou `PULL_REQUEST_TEMPLATE.md`, `.github/PULL_REQUEST_TEMPLATE/`) | template de PR | existe → candidato a `Template:` |
| `CONTRIBUTING.md` | confirma ou contradiz tudo acima | cite o trecho; contradição entre doc e `git log` é pergunta, não escolha |
| board do `/jira-board` (Step 0 anterior) + `jira_search` de 2–3 cards | idioma dos cards | texto dos cards decide; sem board → `—` |

`<integração>` vem de `git ls-remote --heads origin dev` (vazio ⇒ `main`) — a mesma regra do `deploy-context.md`. Sem remote GitHub ou `gh` não autenticado → pule as linhas de `gh`, diga por quê, e pergunte o que elas responderiam.

### 3. Perguntar (AskUserQuestion) — uma vez, isolada, no máximo três perguntas numa chamada

1. **Trabalho:** direto na integração ou branch por card? *(inferência ordena: repo com 40 commits diretos e 1 PR mostra "direto" primeiro)*
2. **Aprovação:** a própria skill (`/homolog`/`/prod` revisam e aprovam) ou uma pessoa/time? *(só se `Abre PR: sim`)*
3. **Merge:** merge, squash ou rebase? *(só se o GitHub tem mais de uma habilitada)*

Com candidato provável, a pergunta **confirma**, não abre menu:

```
Neste repositório o trabalho é direto na `main` (40 commits diretos, 1 PR)?
  Sim, direto na integração
  Não, branch por card       ← o campo livre recebe o padrão de nome, se for outro
```

**Não pergunte** `Nome` (default `<key-minúscula>-<n>[-slug]`), `Key do card` (vem do `git log`; sem histórico → `não entra`), `DoD` (default `o ## Como testar do card`), `Infra` (ponteiros fixos) nem `Guidelines` (default `nenhuma`). Tudo isso é editável depois por `/setup <seção>` — perguntar o que tem default sensato é a fricção que faz a skill ser abandonada.

**A pergunta é isolada.** Nunca a embuta no bloco de perguntas da skill que chamou (`/work`, `/card`, …): misturada com decisões de produto ela vira mais uma linha que o usuário não sabe por que está respondendo. É uma pergunta só, feita **uma vez na vida do repositório**.

### 4. Validar e gravar

- Consistência: `direto na integração` ⇒ `Abre PR: não` ⇒ `Aprovação: —`, `Merge: —`, `Template: —`. `branch por card` ⇒ `Abre PR: sim` (o `/pull-request` é o caminho). Contradição → mostre e pergunte de novo; **não grave**.
- `mkdir -p .claude` e escreva a partir de **`references/template.md`** — um valor por linha, `- Campo: valor`, comentários HTML como dica. Mantenha o cabeçalho do template: ele diz a quem lê o que **não** mora ali. O nome do arquivo é o do **modo** (passo 0): `setup.md` (time) ou `setup.local.md` (só meu).
- Modo **time**: avise que o arquivo é **versionado** e entra no commit de quem chamou (`/work` → Step 10 do `/method`; `/prod` → o commit de fechamento). Modo **só meu**: avise que ele fica **fora do git** (`git status` não o mostra) e, se o usuário tem backup de locais, que vale incluí-lo. Esta skill não commita.

### 5. Devolver

Quem chamou precisa de:

```
{ branch: {modo, nome}, commit: {convenção, key}, pr: {abre, aprovação, merge, template},
  jira: {idioma, dod}, infra: {mapa, processo, conta}, guidelines, origem, arquivo }
```

`arquivo` = `time` (`.claude/setup.md`) ou `local` (`.claude/setup.local.md`) — é o que diz ao `/infra`, ao `deploy-context` e ao `/method` em qual par de arquivos escrever neste repositório.

`origem` = `arquivo` (leu), `criado agora` (passos 2-4 rodaram) ou `atualizado` (seção editada) — é o que permite ao chamador dizer a procedência no report dele.

Report de uma linha:
```
⚙️ Setup (<do time | só meu>): <direto na integração | branch por card> · <convenção>[ +key <posição>] · PR <não | sim · merge <x> · aprova: <y>> · cards <idioma>   [arquivo | criado agora]
```

## Como cada consumidor aplica

| Skill | Usa | Aplica |
|---|---|---|
| `/work` | § Branch, § PR | `branch por card` → `checkout -b` com o padrão de nome; `direto` → fica na integração. `Próximo:` = `/pull-request` se `Abre PR: sim`, senão `/homolog` (ou `/prod` em branch única) |
| `/card` | § Jira | idioma do card; a `DoD` orienta o `## Como testar` |
| `/pull-request` | § PR, § Commit | `Abre PR: não` → **para** e encaminha; `Template:` → corpo nas seções do arquivo; key no título conforme § Commit |
| `/homolog`, `/prod` (`pr-cycle`) | § PR | `Merge:` decide `--merge/--squash/--rebase`; `Aprovação: <pessoa>` → merge **espera** o `APPROVED` dela |
| `/method` (por caminho) | § Commit | mensagem do Step 10 na convenção, key vinda do nome da branch |

Quem lê por caminho **aplica o que está escrito** e, sem arquivo, mantém o próprio default — **não cria** o arquivo. Criar é aqui.

## Modo direto (usuário chamando `/setup`)

| Arg | Ação |
|---|---|
| vazio | Mostra o setup gravado, seção a seção — e **qual** está valendo (`setup.md` do time ou `setup.local.md` só meu). Não existe → roda o fluxo (passos 0-4). |
| `branch` · `commit` · `pr` · `jira` · `infra` · `guidelines` | Mostra o valor atual da seção, pergunta o novo, valida a consistência com as outras e **reescreve só aquela seção** — confirmando antes/depois. |

Editar uma seção é a única situação em que o arquivo é reescrito. Override por argumento numa **outra** skill nunca reescreve nada.

## Red Flags — STOP

- "Já li o setup nesta sessão, sigo sem invocar" → NÃO. A leitura é explícita, **toda** invocação. Contexto de sessão não é arquivo.
- "Não existe, então assumo branch por card (é o fluxo dos devs)" → NÃO. Inferência ordena; o usuário decide. Uma pergunta é barata; branch errada no repo errado, não.
- "Anoto aqui que o repo é `dev`+`main`" → NÃO. Topologia é `git ls-remote`, toda vez. Declarada, apodrece no dia em que a `dev` some.
- "Anoto o board aqui pra não depender do `/jira-board`" → NÃO. Board é coordenada de quem usa; mora na memória da máquina.
- "Anoto a URL de homolog / o comando de deploy / o runner" → NÃO. É `.claude/deploy.md`, dono `deploy-context.md`.
- "Anoto a conta da Vercel / onde está a chave do Neon" → NÃO. É `.claude/infra.md`, dono `/infra`.
- "Anoto que o projeto usa Zod e feature-first" → NÃO. É `.claude/patterns.md`, dono `/method` Step 4.
- "Ponho `@.claude/setup.md` no `CLAUDE.md` pra carregar sempre" / "movo pra `.claude/rules/`" → NÃO. Só quem usa lê. Carregado em toda sessão é o problema que este arquivo existe pra resolver.
- "Gravo em `~/.claude/projects/<slug>/memory/`" → NÃO. Memória apagada = convenção perdida, e o time nunca a vê. Setup que não pode ir pro repo tem casa: `.claude/setup.local.md`.
- "`.claude/` está no `.gitignore`, então corrijo o `.gitignore`" → NÃO sem perguntar. Pode ser o time dizendo que processo de agente não entra ali — e aí o setup é **só meu** (`setup.local.md`). Mexer no `.gitignore` de um repositório do time é decisão deles (passo 0). E lembre: `!x` sob `.claude/` **não funciona**.
- "Gravei `setup.local.md` num repo que já tem `setup.md`" → NÃO. O do time existe → é ele que vale. Local não sobrepõe convenção de time.
- "Está ignorado, então guardo em outro lugar fora de `.claude/`" → NÃO. O lugar é `.claude/setup.local.md` — mesmo formato, mesma leitura, só não versionado.
- "Perguntei nome da branch, DoD, guidelines, tudo de uma vez, é mais completo" → NÃO. Três perguntas no máximo; o resto tem default e `/setup <seção>`.
- "Perguntei junto com as perguntas do `/work`" → NÃO. Isolada, uma vez na vida do repo.
- "O usuário disse 'hoje trabalho direto', atualizei o setup" → NÃO. Override de sessão vale pra invocação. Só `/setup branch` reescreve.
- "Gravei `direto na integração` com `Abre PR: sim`" → NÃO. Contradição não é gravada.
- "Sem `gh` autenticado, chutei a estratégia de merge" → NÃO. Diga que não deu pra derivar e pergunte.
