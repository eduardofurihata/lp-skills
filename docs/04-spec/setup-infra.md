# Setup e Infra — Spec

> Decisões tomadas com o usuário em 2026-09-11, a partir do levantamento de `~/GitHub` (78 repositórios) e da doutrina já existente em `prod/references/deploy-context.md` e `jira-board/SKILL.md`.

## Round 1 — Onde mora, quem lê, quem escreve

### D-01 — A casa é `.claude/`, versionada no repositório-alvo
**Decisão:** o conhecimento permanente do projeto mora em `.claude/` na raiz do repositório: `setup.md`, `infra.md`, `deploy.md`, `patterns.md`. Versionado. Um `.md` solto ali **não** é auto-carregado pelo Claude Code (só `CLAUDE.md`, `settings.json`, `rules/`, `skills/`, `agents/`, `commands/` são) — cada arquivo entra só quando alguém o lê por caminho.
**Justificativa:** as três alternativas falham no que o usuário pediu — `CLAUDE.md` carrega em toda sessão; a memória da máquina some quando é apagada e não chega ao time; `docs/00-context/` está encostado na esteira de discovery e parece brainstorming. `.claude/` já é convenção real (versionado em 8 repos do parque; o `labzz-sementezz` já tem `.claude/architecture/*.md` commitado).
**Alternativas descartadas:** `docs/project/` (cria um terceiro diretório de docs e não tem tração); `SETUP.md` na raiz (polui a raiz, concorre com README/CONTRIBUTING); `.agents/` (1 repo, outro propósito); `.claude/rules/` (auto-carregado — o problema que se quer evitar).
**Armadilha registrada:** `!.claude/setup.md` sob um `.claude/` ignorado **não reinclui nada** (`git check-ignore -v --no-index` no `labzz-afl` prova). A correção é `.claude/*` + negações — ou `git add -f`.

### D-02 — Um arquivo, um dono, uma fronteira
| Arquivo | Dono | Guarda | Não guarda |
|---|---|---|---|
| `setup.md` | `/setup` (furi-ship) | branch (direto vs por card, nome) · commit (convenção, key) · PR (abre, aprovação, merge, template) · Jira (idioma, DoD) · ponteiros de infra · guidelines | topologia (`git ls-remote`), board (`/jira-board`), URL/comando de deploy, contas, padrões de código |
| `infra.md` | `/infra` (furi-ship) | **inventário**: provedores, contas (identificadores), serviços, domínios, onde vive cada segredo, artefatos, revogação | valor de segredo (nunca), estado (contagens, saúde), processo |
| `deploy.md` | `deploy-context.md` (`/prod`) | **processo**: topologia detectada, ambientes, como checar, como setar, smoke, rollback, runner | onde vive cada segredo (é o `infra.md`) |
| `patterns.md` | `/method` Step 4 (furi-build) | padrões de código: estrutura, nomenclatura, dados, erros; cresce a cada feature | convenção de processo |

**Justificativa:** dois donos para o mesmo fato é como se perde a verdade — foi assim que o `patterns.md` ganhou dois caminhos e nenhum escritor. **Já existe?** O modelo é o do `/jira-board` (dono único, lê toda invocação, pergunta uma vez) e do `deploy-context.md` (inferir → perguntar o mínimo → escrever → reconferir).

### D-03 — Só lê quem usa algo do arquivo (critério do usuário)
**Decisão:** `/work` (§ Branch, § PR), `/card` (§ Jira), `/pull-request` (§ PR, § Commit), `/homolog` e `/prod` (§ PR + `deploy.md` + `infra.md`) invocam o `/setup` no Step 0. `/method` lê **só** o § Commit no Step 10 e o `patterns.md` no Step 4; `/jira` (Eduzz) lê § Branch e § PR no 0.1. `/fast`, `/todo`, `/solve`, `/ui`, `/proto`, `/principles`, `/jira-board`, todo o `furi-toolbox`, `/afl`, `/proof` e `/video-teams` **não leem nada** — não commitam, não branchificam, não entregam.
**Justificativa:** é a regra de "zero magia" do `/principles`: nada acontece fora do que está escrito no alvo ou apontado por caminho. Carregar por `CLAUDE.md` seria pagar contexto em toda sessão pelo que só cinco skills usam.

### D-04 — Quem está em outro pacote lê por caminho e não cria
**Decisão:** `/method` (furi-build) e `/jira` (eduzz-builder) fazem `cat .claude/setup.md 2>/dev/null || cat .claude/setup.local.md 2>/dev/null` (D-12), aplicam o que está escrito e, sem arquivo, mantêm o default que já tinham (Conventional Commits; `main` + branch `PROJ-N`). **Nunca** criam o arquivo. Declaram `boundary: setup` (linha pontilhada no grafo), **nunca** `requires: setup`.
**Justificativa:** `requires` gera `dependencies` no manifesto — `furi-build → furi-ship` e `eduzz-builder → furi-ship` são as duas arestas que o README proíbe. Ler um arquivo do projeto-alvo por caminho não cria dependência de pacote, exatamente como o `/method` já lê o `CLAUDE.md`. O validador precisou conhecer as raízes `.claude`, `.github` e `.secrets` (`TARGET_PROJECT_ROOTS`), senão tratava `` `.claude/setup.md` `` como caminho de skill.

### D-05 — Topologia continua detectada; o setup declara política
**Decisão:** `Trabalho: direto na integração | branch por card` é política e mora no setup. A **integração** (`dev` ou `main`) continua vindo de `git ls-remote --heads origin dev` a cada invocação — Iron Law do `deploy-context.md`, intacta.
**Justificativa:** declarada, a topologia apodrece no dia em que a `dev` some; política não apodrece, muda por decisão. Consistência validada na gravação: `direto` ⇒ `Abre PR: não` ⇒ `Aprovação/Merge/Template: —`.

### D-06 — `Aprovação:` tem duas semânticas
**Decisão:** `a própria skill` (default — `/homolog`/`/prod` revisam e aprovam, como hoje) ou `<pessoa/time>` (a skill revisa e registra por comentário; o merge **espera** um review `APPROVED` dessa pessoa; sem ele o gap "aprovação pendente" fica aberto e reportado). `Merge:` decide `--merge|--squash|--rebase` no `pr-cycle`.
**Justificativa:** sem efeito no `pr-cycle`, "quem aprova" seria texto decorativo.

## Round 2 — O `/infra`

### D-07 — Inventário sem valor, com gate bloqueante
**Decisão:** o `/infra` lê `.secrets/` **por nome de arquivo e nome de chave** (`grep -oE '^[A-Za-z_][A-Za-z0-9_]*='`), nunca abre arquivos de chave (`*.pem`, `id_*`, `*service-account*.json`), classifica dumps/tfstate/evidências como *artefato*, confirma por CLI read-only já autenticada (`aws sts`, `vercel whoami`, `gh`, `gcloud config list`, `railway`, `neonctl`), pergunta só o não-derivável e, **antes de gravar**, varre o rascunho com padrões de segredo (`-----BEGIN`, `AKIA…`, `sk_live_`, `ghp_`, URL com senha, `token=…`) — bateu, não grava.
**Justificativa:** o arquivo é versionado; um valor ali sobrevive a `git rm`. É a doutrina do `vibe-alkaline-man/.secrets/README.md` ("Identificadores em uso — não são segredo") e do `eduzz-aws/docs/MAPA-AWS.md` ("julgamento, não estado").

### D-08 — Recorte do projeto, ponteiro para a conta
**Decisão:** em repo Eduzz/Labzz o `infra.md` guarda só o que **este** projeto usa e aponta para `~/GitHub/eduzz-aws` (`MAPA-AWS.md`, skill `aws-prod`) como fonte da conta.
**Justificativa:** duas cópias do mapa da conta divergem; o `MAPA-AWS.md` já resolve precedência (gerado ganha do manual).

### D-09 — `env-config` lê o `infra.md` e invoca o `/infra` quando falta
**Decisão:** "onde vive" sai do `infra.md`; "como setar" continua no `deploy.md`. Sem `infra.md`, o `env-config` invoca `furi-ship:infra` antes de aplicar qualquer coisa.
**Justificativa:** era o `deploy.md` que respondia "onde vivem os secrets" — misturando processo com inventário. Um fato, um dono.

## Round 3 — Migração e o que não muda

### D-10 — Migração lazy, com `git mv`
**Decisão:** `deploy-context.md` migra `docs/00-context/technical/deploy.md → .claude/deploy.md` na primeira invocação; o `/method` Step 4 migra `patterns.md` de qualquer dos dois caminhos antigos. `mkdir -p .claude` antes. Repos conhecidos (`vibe-nivee`, `vibe-alkaline-man`) podem ser migrados à mão, um commit cada.
**Justificativa:** 78 repositórios não se migram numa tarde; o arquivo nasce por uso, como o `deploy.md` sempre nasceu.

### D-11 — O que não muda
`/jira-board` continua na memória da máquina (board é coordenada de quem usa). `/jira` (Eduzz) mantém `git checkout main && git pull --ff-only` no 0.1 (D-D do plano). `docs/00-context/decisions/` e `docs/00-context/` de contexto de produto continuam valendo como fonte no `findings.md` e no `/card`, onde existirem — só o **técnico permanente** mudou de casa.

## Round 4 — O caso do repositório que não é seu (2026-09-12)

### D-12 — Modo local: `.claude/<x>.local.md`
**Decisão:** cada um dos quatro arquivos tem a variante `<x>.local.md` — mesmo formato, **nunca versionada** (espelha o `settings.local.json`). O `/setup` decide o modo **uma vez por repositório**, no passo 0: `setup.md` existe ⇒ time; só `setup.local.md` ⇒ só meu; nenhum e `.claude/` não ignorado ⇒ time; nenhum e `.claude/` ignorado ⇒ **pergunta** ("só meu" primeiro quando o remote é de organização alheia e o ignore é deliberado). O do time vence quando os dois existem. `/infra`, `deploy-context`, `/method` (patterns e § Commit) e `/jira` leem `x.md || x.local.md` e seguem o modo decidido.
**Justificativa:** o usuário levantou o caso real — no `labzz-afl` "os arquivos de setup não irão para o GitHub porque os outros devs não usam meu processo e é lixo para eles". Ignorar `.claude/` ali é decisão do time, não defeito; a versão anterior do `/setup` (D-01) insistia em corrigir o `.gitignore`. Mexer no `.gitignore` de um repositório alheio sem perguntar passa a ser red flag.
**Alternativas descartadas:** memória da máquina (`~/.claude/projects/…`) — perde ao apagar e não tem formato; guardar o setup do projeto dentro do pacote de skills — é o que o `/afl` faz para o AFL (D-13), mas não escala para cada repo Eduzz; `setup.md` versionado "mesmo assim" — é exatamente o lixo que o usuário não quer impor ao time.
**Risco aceito:** `.local.md` some com a máquina. Recriar custa um minuto; o `env-vault` do usuário (backup de `.env*` e `.secrets/` a cada 15 min) é o candidato natural para incluir `.claude/*.local.md` — mudança naquele repo, não aqui.

### D-13 — Texto gerado por IA é superfície derivada no `/method`; o `/afl` fica como overlay de produto
**Decisão:** o `/afl` **não** é descontinuado. A única regra exclusiva dele — *texto que o usuário lê como saída do agente tem que ler como o app top de linha, senão o teste falha* — deixa de ser "AFL" e vira regra **geral e condicional** do `/method`: o Step 4 deriva *superfície de texto gerado por IA (sim/não)* pelo mesmo mecanismo da superfície visual; se sim, o spec nomeia a referência #1 e "o que ler bem significa", o Step 5 tem um TC com resultado na qualidade do texto lido, e no Step 9 texto pior que a referência é FAILED. Se não, a linha nasce `N/A`, como Design sem tela. O `/afl` enxuto (≈15 linhas) fica com o que só o produto sabe: *no AFL, toda feature presume essa superfície = sim até o Step 4 derivar o contrário* — e com a razão de existir: é o setup do AFL que não pode morar no repo do AFL, morando no pacote do dono do processo. Saem do `/afl` o bloco de ambiente (cópia do `/jira`) e a explicação de `AV-N` (o `/jira` deriva).
**Justificativa:** o levantamento mostrou que o `/afl` era wrapper (zero dependentes; os 29 cards do `labzz-afl` sempre nomearam o `/jira`), mas a regra é útil e vale para qualquer produto com texto de IA (alkaline, chat-furi, nivee) — o usuário pediu para preservá-la "sem perder a generalidade das skills". Generalizar no `/method` como superfície derivada é o que mantém a generalidade: nada menciona AFL, e feature sem IA não paga nada.
**Alternativas descartadas:** apagar o `/afl` (perderia a presunção de produto e o lugar do setup não-versionável do AFL); pôr a regra no `/jira` (regra de produto de IA numa skill genérica de card Eduzz); copiar a regra no `/afl` e no `/method` (duas verdades).
