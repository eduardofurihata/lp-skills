# Template — `.claude/ship-setup/setup.md`

Copie o bloco abaixo para `.claude/ship-setup/setup.md` na raiz do repositório-alvo — ou para `.claude/ship-setup/setup.local.md` quando o setup é **só seu** e não vai pro git (repositório de um time que não usa este processo; mesmo formato, mesma leitura; se os dois existirem, o do time vale). Um valor por linha, `- Campo: valor`. Os comentários HTML são **dica de preenchimento**, não valor — podem ficar ou sair. O cabeçalho fica: é ele que diz a quem abre o arquivo o que **não** mora ali.

```markdown
# Setup — <projeto>

> Convenções operacionais do time neste repositório. Dono: `/setup`. Lido **sob demanda** por quem usa
> (os alvos `/work`, `/pull-request`, `/homolog`, `/prod` e os modificadores `/repro`, `/card`, via `/setup`;
> `/method` § Commit por caminho). Nunca por `CLAUDE.md`/`@import`/`.claude/rules/`, nunca da memória da máquina.
> NÃO mora aqui: topologia e nome das branches (detectados e gravados em `.claude/ship-setup/deploy.md`) ·
> board do Jira (`/jira`, memória da máquina) · estrutura do Jira (`.claude/ship-setup/jira.md`) · mapa da infra
> (`.claude/ship-setup/infra.md`) · padrões de código (`.claude/patterns.md`).

## Branch
- Trabalho: branch por card              <!-- ou: branch acumula cards (um lote, um PR) · direto na integração -->
- Nome: <key>-<n>[-slug]                 <!-- a caixa do placeholder é a do nome: <key> → niv-12 · <KEY> → AV-2192 · "—" se direto -->

## Commit
- Convenção: Conventional Commits        <!-- feat/fix/refactor/docs/chore(<escopo>): … -->
- Key do card: não entra                 <!-- ou: no escopo `feat(NIV-12): …` · no início `NIV-12 feat: …` · no fim `feat(x): … (NIV-12)` · trailer `Jira: NIV-12` -->

## PR
- Abre PR: sim                           <!-- não ⇒ o /pull-request só pusha (sem PR) e os 3 abaixo ficam "—" · "direto na integração" ⇒ não -->
- Aprovação: a própria skill             <!-- ou: <pessoa/time> — /homolog e /prod revisam e NÃO mergeiam sem o APPROVED dessa pessoa -->
- Merge: merge                           <!-- ou: squash · rebase -->
- Template: o da skill                   <!-- ou: .github/pull_request_template.md -->

## Jira
- Rastreamento: Jira                     <!-- ou: kanban local · nenhum — sem Jira o pipeline roda inteiro sem card e nenhuma etapa comenta -->
- Idioma dos cards: pt-BR
- DoD: o `## Como testar` do card        <!-- uma linha -->
- Estrutura: `.claude/ship-setup/jira.md`           <!-- dono: /jira — colunas, etapa→status, tipos de issue, manhas do MCP -->

## Infra
- Mapa: `.claude/ship-setup/infra.md`               <!-- dono: /infra — provedores, contas, onde vive cada segredo (nunca o valor) -->
- Processo: `.claude/ship-setup/deploy.md`          <!-- dono: /prod (deploy-context) — ambientes, como checar, rollback -->
- Conta (Eduzz/Labzz): —                 <!-- ou: ~/GitHub/eduzz-aws (MAPA-AWS.md, skill aws-prod) -->

## Guidelines
- nenhuma                                <!-- ou caminho/URL, ex.: ~/GitHub/eduzz-guidelines -->
```

## O fluxo do projeto — onde cada pergunta é respondida

O pipeline (`pipeline/references/reconcile.md`) monta a escada de estágios deste projeto a partir de **três respostas**, cada uma com um dono. O `/setup` não repete as que não são dele — ele diz onde estão:

| Pergunta | Resposta mora em | Quem grava |
|---|---|---|
| Tem PR, ou a branch sobe por push? | `## PR → Abre PR` (aqui) | `/setup` |
| Tem ambiente de homolog? Qual o **nome real** da branch de integração e da de produção? | `.claude/ship-setup/deploy.md § Ambientes` | `deploy-context.md` (detecta, pergunta o que não deriva, grava) |
| Tem Jira? | `## Jira → Rastreamento` (aqui) | `/setup` |

## O que é declarado aqui × o que é detectado ou mora em outro lugar

| Campo | Declarado aqui | Detectado / mora em outro lugar |
|---|---|---|
| Branch: modo, padrão de nome | sim (caixa inferível dos PRs mergeados) | integração → `pipeline/references/deploy-context.md` § 1 (base dos PRs recentes, `dev`, default do GitHub); os cards de um lote → os commits da branch |
| Commit: convenção, posição da key | sim (inferível do `git log`) | a key em si → o card ativo do `/work`, senão o nome da branch |
| PR: abre, aprovação, merge, template | sim (merge/template/proteção inferíveis via `gh api` e `.github/`) | autor → `gh pr view` |
| Jira: rastreamento, idioma, DoD | sim | board/site/key → `/jira` (memória da máquina); colunas, etapa→status, tipos de issue e manhas do MCP → `.claude/ship-setup/jira.md` (`/jira`); sprint ativo → descoberto a cada uso |
| Infra: ponteiros, conta | sim (ponteiros) | o conteúdo → `.claude/ship-setup/infra.md` (`/infra`) e `.claude/ship-setup/deploy.md` (`deploy-context`) |
| Guidelines | sim (ponteiro) | — |
| Topologia, nome real das branches, ambientes (tem homolog?), URLs, secrets, runner, rollback | **não** | `.claude/ship-setup/deploy.md` — detectado por `pipeline/references/deploy-context.md` § 1 e gravado; `dev`/`main` é só o padrão de quem nunca detectou |
| Padrões de código | **não** | `.claude/patterns.md` (`/method` Step 4) |

## Consistência (validada antes de gravar)

| Se | Então |
|---|---|
| `Trabalho: direto na integração` | `Nome: —` · `Abre PR: não` · `Aprovação: —` · `Merge: —` · `Template: —` |
| `Trabalho: branch por card` · `branch acumula cards` | `Abre PR: sim` é o esperado (o `/pull-request` é o caminho de integração); `não` é válido — a branch sobe por push, sem PR |
| `Trabalho: branch acumula cards` | um lote, um PR: o `/pull-request` **atualiza** o PR aberto da branch (título e `## Cards` derivados dos commits) em vez de abrir outro; o nome da branch é o do 1º card e **não muda** |
| `Abre PR: não` | `/pull-request` **pusha** a branch atual, espelha no Jira e **não abre PR**; o que está na integração vai ao ar pelo `/homolog`/`/prod` |
| `Aprovação: <pessoa/time>` | `/homolog` e `/prod` revisam por comentário e **esperam** o `APPROVED` dessa pessoa antes de mergear |
| `Rastreamento: kanban local` · `nenhum` | `Idioma dos cards: —` · `Estrutura: —` · o estágio `card` não existe · `/card` recusa com o motivo nomeado · nenhuma skill pergunta board · `jira-sync` é no-op declarado |

## Exemplo real — `lp-skills`

Repositório de branch única, sem Jira, ~40 commits diretos na `main` e 1 PR na história (um refactor grande):

```markdown
## Branch
- Trabalho: direto na integração
- Nome: —

## Commit
- Convenção: Conventional Commits
- Key do card: não entra

## PR
- Abre PR: não                           <!-- exceção pontual: refactor grande (PR #1) -->
- Aprovação: —
- Merge: —
- Template: —

## Jira
- Rastreamento: kanban local             <!-- sem Jira: cards são kanban/ local -->
- Idioma dos cards: —
- DoD: `pnpm check` verde + card em `kanban/10-done/`
- Estrutura: —

## Infra
- Mapa: `.claude/ship-setup/infra.md`
- Processo: `.claude/ship-setup/deploy.md`
- Conta (Eduzz/Labzz): —

## Guidelines
- README.md § Workflow do autor
```

## Exemplo real — `labzz-afl` (§§ Branch e PR)

Repositório de time, branch única (`main`), branches `AV-NNNN` em maiúscula, vários cards por branch e um PR por lote (ex.: PR #173 — branch `AV-2192`, título `feat(AV-2192, AV-2211, AV-2218, …)`):

```markdown
## Branch
- Trabalho: branch acumula cards
- Nome: <KEY>-<n>[-slug]                 <!-- AV-2192 · o nome fica no 1º card; os demais entram no título e no ## Cards do PR -->

## Commit
- Convenção: Conventional Commits
- Key do card: no fim                    <!-- feat(automacoes): … (AV-2218) — a key do card ativo, não a da branch -->

## PR
- Abre PR: sim
- Aprovação: a própria skill             <!-- sem proteção de branch, sem CODEOWNERS -->
- Merge: merge                           <!-- 57 "Merge pull request" nos últimos 300 commits -->
- Template: o da skill
```
