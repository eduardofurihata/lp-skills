# Template — `.claude/setup.md`

Copie o bloco abaixo para `.claude/setup.md` na raiz do repositório-alvo — ou para `.claude/setup.local.md` quando o setup é **só seu** e não vai pro git (repositório de um time que não usa este processo; mesmo formato, mesma leitura; se os dois existirem, o do time vale). Um valor por linha, `- Campo: valor`. Os comentários HTML são **dica de preenchimento**, não valor — podem ficar ou sair. O cabeçalho fica: é ele que diz a quem abre o arquivo o que **não** mora ali.

```markdown
# Setup — <projeto>

> Convenções operacionais do time neste repositório. Dono: `/setup`. Lido **sob demanda** por quem usa
> (`/work`, `/card`, `/pull-request`, `/homolog`, `/prod` via `/setup`; `/method` § Commit por caminho).
> Nunca por `CLAUDE.md`/`@import`/`.claude/rules/`, nunca da memória da máquina.
> NÃO mora aqui: topologia (detectada: `git ls-remote`) · board do Jira (`/jira-board`) · mapa da infra
> (`.claude/infra.md`) · ambientes e deploy (`.claude/deploy.md`) · padrões de código (`.claude/patterns.md`).

## Branch
- Trabalho: branch por card              <!-- ou: direto na integração -->
- Nome: <key-minúscula>-<n>[-slug]       <!-- ex.: niv-12, alk-42-login · multi-card <key>-<n>-<m> · "—" se direto -->

## Commit
- Convenção: Conventional Commits        <!-- feat/fix/refactor/docs/chore(<escopo>): … -->
- Key do card: não entra                 <!-- ou: no escopo `feat(NIV-12): …` · no início `NIV-12 feat: …` · trailer `Jira: NIV-12` -->

## PR
- Abre PR: sim                           <!-- "direto na integração" ⇒ não; aí os 3 abaixo ficam "—" -->
- Aprovação: a própria skill             <!-- ou: <pessoa/time> — /homolog e /prod revisam e NÃO mergeiam sem o APPROVED dessa pessoa -->
- Merge: merge                           <!-- ou: squash · rebase -->
- Template: o da skill                   <!-- ou: .github/pull_request_template.md -->

## Jira
- Idioma dos cards: pt-BR
- DoD: o `## Como testar` do card        <!-- uma linha -->

## Infra
- Mapa: `.claude/infra.md`               <!-- dono: /infra — provedores, contas, onde vive cada segredo (nunca o valor) -->
- Processo: `.claude/deploy.md`          <!-- dono: /prod (deploy-context) — ambientes, como checar, rollback -->
- Conta (Eduzz/Labzz): —                 <!-- ou: ~/GitHub/eduzz-aws (MAPA-AWS.md, skill aws-prod) -->

## Guidelines
- nenhuma                                <!-- ou caminho/URL, ex.: ~/GitHub/eduzz-guidelines -->
```

## O que é declarado aqui × o que é detectado ou mora em outro lugar

| Campo | Declarado aqui | Detectado / mora em outro lugar |
|---|---|---|
| Branch: modo, padrão de nome | sim | integração (`dev` vs `main`) → `git ls-remote` (`prod/references/deploy-context.md` § 1) |
| Commit: convenção, posição da key | sim (inferível do `git log`) | a key em si → nome da branch atual |
| PR: abre, aprovação, merge, template | sim (merge/template/proteção inferíveis via `gh api` e `.github/`) | autor → `gh pr view` |
| Jira: idioma, DoD | sim | board/site/key → `/jira-board` (memória); tipo de issue, sprint e transições → descobertos a cada uso |
| Infra: ponteiros, conta | sim (ponteiros) | o conteúdo → `.claude/infra.md` (`/infra`) e `.claude/deploy.md` (`deploy-context`) |
| Guidelines | sim (ponteiro) | — |
| Topologia, ambientes, URLs, secrets, runner, rollback | **não** | `.claude/deploy.md` |
| Padrões de código | **não** | `.claude/patterns.md` (`/method` Step 4) |

## Consistência (validada antes de gravar)

| Se | Então |
|---|---|
| `Trabalho: direto na integração` | `Nome: —` · `Abre PR: não` · `Aprovação: —` · `Merge: —` · `Template: —` |
| `Trabalho: branch por card` | `Abre PR: sim` (o `/pull-request` é o caminho de integração) |
| `Abre PR: não` | `/pull-request` **para** e encaminha para `/homolog`/`/prod` |
| `Aprovação: <pessoa/time>` | `/homolog` e `/prod` revisam por comentário e **esperam** o `APPROVED` dessa pessoa antes de mergear |

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
- Idioma dos cards: —                    <!-- sem Jira: cards são kanban/ local -->
- DoD: `pnpm check` verde + card em `kanban/10-done/`

## Infra
- Mapa: `.claude/infra.md`
- Processo: `.claude/deploy.md`
- Conta (Eduzz/Labzz): —

## Guidelines
- README.md § Workflow do autor
```
