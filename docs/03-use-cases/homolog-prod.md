# Homolog e Prod — Use Cases

Ator único em todos os UCs: **dev** (quem invoca a skill). Onde outro papel aparece (PO/QA validando homolog, usuário final em prod), ele é **beneficiário** do resultado, não operador — nenhuma skill é invocada por eles.

## Tabela de assinaturas (contrato dos motores — única, sem duplicata)

| Assinatura | Entrada | Saída | UCs |
|---|---|---|---|
| `deployContext(repo)` | repositório do checkout | `{topologia, ambientes[], comandos, runner}` | UC-1 … UC-4 |
| `diagnose(alvo)` | `alvo{ambiente, branch, fonteDoDelta}` | `gaps[]` ordenados por dependência | UC-5, UC-15 |
| `prCycle(pr)` | PR + card(s) | `aprovado+mergeado` \| `rejeitado` \| `split` | UC-6 … UC-14 |
| `scopeSplit(pr, excedente)` | PR + achados fora do card | `cards[]` criados + excedente devolvido | UC-12 |
| `deployRun(alvo)` | alvo | `verde` \| `vermelho` \| `fila` | UC-16 … UC-18 |
| `envConfig(alvo, devops)` | alvo + checklist `## DevOps` do PR | `aplicados[]` + `pendentes[]` | UC-19, UC-20 |
| `smoke(alvo, cards)` | alvo + cards que deveriam estar no ar | `passou` \| `falhou[]` | UC-21, UC-22 |
| `jiraSync(card, estado)` | card + estado alcançado | comentado + transicionado | UC-31, UC-32 |
| `promote(origem, destino)` | `dev` → `main` | promovido + `assert(origin/dev == origin/main)` | UC-24 … UC-29 |
| `reconcile(alvo)` | alvo | aplica os acima em loop até `gaps[] == 0` | UC-5, UC-23, UC-30 |

`reconcile` é o **único** motor que as skills invocam; os outros são invocados por ele. `/homolog` e `/prod` diferem apenas no `alvo` que declaram.

---

## Contexto de deploy e topologia

### UC-1 — Contexto de deploy ausente (primeira vez no repositório)
- **Ator**: dev · **Precondição**: `docs/00-context/technical/deploy.md` não existe
- **Fluxo**: 1) skill infere de `.github/workflows/`, `Makefile`, `vercel.json`, `.env.example` e `git ls-remote --heads origin`; 2) apresenta o que inferiu; 3) pergunta **só** o que não deu para inferir (URLs, onde vivem os secrets); 4) escreve o doc
- **Resultado**: doc criado e versionado; skill segue com o contexto em mão

### UC-2 — Contexto de deploy já registrado
- **Ator**: dev · **Precondição**: doc existe e é válido
- **Fluxo**: 1) skill lê o doc; 2) reconfere a topologia (`git ls-remote`) contra o registrado
- **Resultado**: contexto carregado sem pergunta nenhuma

### UC-3 — Contexto registrado, mas inválido
- **Ator**: dev · **Precondição**: doc existe e divergiu (URL morta, workflow renomeado, `dev` passou a existir)
- **Fluxo**: 1) skill detecta a divergência na reconferência; 2) reporta o que mudou; 3) corrige o doc (perguntando o que não infere)
- **Resultado**: doc atualizado; **nunca** segue com contexto que sabe estar errado

### UC-4 — `/homolog` num repositório de branch única
- **Ator**: dev · **Precondição**: `git ls-remote --heads origin dev` vazio; único ambiente é prod
- **Fluxo**: 1) guard de topologia detecta; 2) skill informa que não existe homolog neste projeto; 3) encaminha para `/prod`
- **Resultado**: encerra sem agir. Mergear na `main` chamando de homolog mentiria sobre o destino

---

## Diagnóstico do gap

### UC-5 — Diagnosticar a distância entre origem e ambiente
- **Ator**: dev · **Precondição**: contexto de deploy carregado
- **Fluxo**: 1) skill levanta o estado desejado (PRs abertos, commits na branch de integração, cards que deveriam estar no ar); 2) levanta o estado atual (último run, o que responde na URL, configuração presente); 3) monta `gaps[]` ordenado por dependência
- **Resultado**: lista explícita do que falta, publicada antes de qualquer ação

### UC-15 — Vários PRs abertos ao mesmo tempo
- **Ator**: dev · **Precondição**: N PRs mirando a branch de integração
- **Fluxo**: 1) skill lista os N; 2) processa **um por um** pelo `prCycle`; 3) re-diagnostica após cada um (a branch andou)
- **Resultado**: fila esvaziada — cada PR mergeado ou rejeitado com motivo. Objetivo não é atingido com PR pendente sem veredicto

### UC-23 — Gap já fechado ao entrar
- **Ator**: dev · **Precondição**: tudo no ar, configurado e verificado
- **Fluxo**: 1) diagnóstico devolve `gaps[] == 0`; 2) skill reporta o estado
- **Resultado**: encerra sem agir, dizendo **por que** não havia nada a fazer

---

## Fechar o gap — da origem até a branch de integração

### UC-6 — Trabalho commitado em feature branch, sem PR
- **Ator**: dev · **Precondição**: branch com commits à frente da integração, nenhum PR
- **Fluxo**: 1) gap identificado; 2) skill invoca `/pull-request`; 3) segue para o ciclo de PR
- **Resultado**: PR aberto — nada chega ao ambiente sem passar por review

### UC-7 — PR com QA pendente (card em `kanban/06-todo/`)
- **Ator**: dev · **Precondição**: card do PR em `06-todo`
- **Fluxo**: 1) gate de QA detecta; 2) skill roda `/todo` para **esse** feature até 100% PASSED; 3) segue para o review
- **Resultado**: QA verde antes de a mudança entrar. Ambiente não recebe o que ninguém testou

### UC-8 — PR sem card no kanban (dev trabalhou cru)
- **Ator**: dev · **Precondição**: nenhum card corresponde ao PR
- **Fluxo**: 1) skill detecta a ausência de test cases; 2) **para** e explica que não há como autenticar QA; 3) pergunta como proceder
- **Resultado**: decisão do usuário (discovery+QA, ou review-only sob risco declarado)

### UC-9 — PR com review limpo e resolução autenticada
- **Ator**: dev · **Precondição**: code review sem issue, card resolvido de fato
- **Fluxo**: 1) skill **aprova** o PR; 2) mergeia; 3) apaga a branch remota **e** a local; 4) verifica que as duas listagens vêm vazias
- **Resultado**: mudança na branch de integração, sem branch morta pendurada

### UC-10 — PR com problema pontual
- **Ator**: dev · **Precondição**: review achou bug/edge case/null-check/desvio de pattern
- **Fluxo**: 1) skill conserta na branch do PR; 2) **re-revisa** e re-autentica (todo fix invalida o passe); 3) loop até zero issues
- **Resultado**: PR limpo → segue para UC-9

### UC-11 — PR cru (rejeição — saída terminal)
- **Ator**: dev · **Precondição**: abordagem fundamentalmente errada, ou não faz o que o card pede, ou desastre de segurança, ou loop de conserto não converge (~2–3 rodadas)
- **Fluxo**: 1) `request-changes` com feedback por item; 2) **não** mergeia, **não** apaga a branch; 3) devolve o card ao "Em andamento" com comentário; 4) kanban → `07-implementation` com `status: rework`
- **Resultado**: nada entra; nada deploya. Rejeitar é o gate funcionando

### UC-12 — PR com escopo grande demais
- **Ator**: dev · **Precondição**: o PR entrega além do card, ou o card era grande demais e virou um PR inaudível
- **Fluxo**: 1) skill separa o que o card pede do excedente; 2) cria card(s) para o excedente via `/card`; 3) devolve o excedente ao dev via `request-changes` ou mantém o núcleo mergeável, conforme separabilidade
- **Resultado**: excedente volta à fila rastreado — não entra de carona nem desaparece

### UC-13 — PR com ledger de follow-up `ABERTO`
- **Ator**: dev · **Precondição**: `kanban/10-done/<feature>.md` tem item `ABERTO`
- **Fluxo**: 1) gate de convergência detecta; 2) skill **rejeita** (UC-11)
- **Resultado**: pendência conhecida volta ao dev — não vira card de follow-up

### UC-14 — Branch do PR atrás ou conflitada com a integração
- **Ator**: dev · **Precondição**: `mergeable: CONFLICTING` ou `BEHIND`
- **Fluxo**: 1) skill atualiza a branch trazendo a integração; 2) resolve conflito entendendo **os dois lados**; 3) resolução mudou código → **re-revisa e re-autentica**; 4) atualiza o PR
- **Resultado**: merge só de branch atualizada e re-verificada

---

## Fechar o gap — da branch até o ambiente no ar

### UC-16 — Na branch, mas não no ar
- **Ator**: dev · **Precondição**: commit presente na branch de integração; ambiente serve versão anterior
- **Fluxo**: 1) skill identifica o gap; 2) dispara ou localiza o run pelos comandos do contexto; 3) acompanha até terminar
- **Resultado**: run **verde** — e só então o ambiente é considerado atualizado

### UC-17 — Run vermelho
- **Ator**: dev · **Precondição**: deploy falhou
- **Fluxo**: 1) skill lê o log e reporta a causa; 2) conserta o que for dela (config, migration, build); 3) redeploya; 4) causa fora do alcance → **para** e reporta
- **Resultado**: nunca anuncia "no ar" com run vermelho

### UC-18 — Run enfileirado (runner self-hosted offline)
- **Ator**: dev · **Precondição**: job em `queued`, runner local desligado
- **Fluxo**: 1) skill detecta o estado de fila e checa o runner; 2) reporta **fila**, com o que destravaria
- **Resultado**: "enfileirado" reportado como enfileirado — máquina desligada não é deploy bem-sucedido nem falha

### UC-19 — No ar, sem a configuração que a mudança exige
- **Ator**: dev · **Precondição**: código no ar; env var / migration / flag / seed pendente
- **Fluxo**: 1) skill lê o `## DevOps` do(s) PR(s); 2) confere o que já existe no ambiente; 3) aplica o que falta
- **Resultado**: ambiente configurado — a feature funciona lá, não só na máquina do dev

### UC-20 — Secret novo cujo valor a skill não conhece
- **Ator**: dev · **Precondição**: o PR exige variável sem valor conhecido
- **Fluxo**: 1) skill identifica a variável e onde ela vive; 2) **pergunta o valor**; 3) aplica sem escrevê-lo em nenhum doc
- **Resultado**: credencial correta no ambiente, zero valor inventado, zero secret versionado

### UC-21 — Configurado, mas não verificado
- **Ator**: dev · **Precondição**: run verde e configuração aplicada
- **Fluxo**: 1) skill abre a **URL do ambiente** (não localhost); 2) roda o `## Como testar` de **cada** card que deveria estar no ar desde o último deploy verificado; 3) registra evidência
- **Resultado**: estado verificado — é este passo que autoriza dizer "está no ar funcionando"

### UC-22 — Smoke falha no ambiente
- **Ator**: dev · **Precondição**: feature ausente ou quebrada na URL
- **Fluxo**: 1) skill trata como gap aberto, não como conclusão; 2) diagnostica (não subiu? subiu sem config? subiu quebrada?); 3) volta ao motor correspondente
- **Resultado**: objetivo **não** atingido; skill não fecha declarando sucesso

---

## Promoção para produção (topologia `dev` + `main`)

### UC-24 — `/prod` com homolog não verificado
- **Ator**: dev · **Precondição**: há o que promover, mas o conteúdo da `dev` nunca foi verificado no ar
- **Fluxo**: 1) gate de homolog detecta; 2) skill roda a verificação de homolog primeiro
- **Resultado**: prod só recebe o que já foi visto funcionando em homolog

### UC-25 — Autorização de prod negada ou silenciada
- **Ator**: dev · **Precondição**: release pronto, pergunta feita
- **Fluxo**: 1) skill informa quantos commits vão e o que isso significa; 2) resposta não é "sim" explícito
- **Resultado**: **para**. Nada promove. Autoridade dita antes não conta

### UC-26 — Release autorizado (happy path)
- **Ator**: dev · **Precondição**: "sim" explícito agora
- **Fluxo**: 1) fecha a `dev` (commit de paths explícitos do que estiver solto, sync, push); 2) promove `dev`→`main` e empurra; 3) acompanha o run; 4) aplica configs em **prod e homolog**; 5) smoke em prod; 6) resync `main`→`dev` + assert; 7) Jira + kanban
- **Resultado**: prod no ar, verificado, e `origin/dev == origin/main`

### UC-27 — Conflito ao promover
- **Ator**: dev · **Precondição**: `merge dev` na `main` conflita
- **Fluxo**: 1) resolve entendendo os dois lados; 2) resolução = código novo → **re-revisa e re-verifica ANTES do push**; 3) intenção ambígua → **pergunta**
- **Resultado**: nunca deploya merge não-verificado

### UC-28 — Assert de convergência falha
- **Ator**: dev · **Precondição**: após o resync, `origin/dev != origin/main`
- **Fluxo**: 1) skill reporta a divergência; 2) investiga antes de concluir
- **Resultado**: release não é declarado fechado com branches divergentes

### UC-29 — Nada a promover
- **Ator**: dev · **Precondição**: `dev` == `main`
- **Fluxo**: 1) diagnóstico não acha commits pendentes; 2) skill verifica se prod está no ar e configurado (o gap pode ser só de ambiente — UC-16)
- **Resultado**: informa; promove nada

---

## Topologia de branch única

### UC-30 — `/prod` em repositório de branch única
- **Ator**: dev · **Precondição**: só `main`; único ambiente é prod
- **Fluxo**: 1) guard de topologia define o alvo; 2) `reconcile` roda o ciclo completo — PR (review → aprova → mergeia na `main`) → deploy → configs → smoke; 3) **sem** gate de autorização
- **Resultado**: prod no ar e verificado numa invocação. Quem digita `/prod` já autorizou

---

## Jira, kanban e limpeza

### UC-31 — Card alcançou o ambiente
- **Ator**: dev · **Precondição**: feature verificada no ar
- **Fluxo**: 1) comentário no card em linguagem leiga + URL do ambiente; 2) `get_transitions` → `transition_issue` para o status correspondente (sem `comment` na transição — ADF); 3) kanban atualizado
- **Resultado**: card reflete onde a feature realmente está

### UC-32 — Workflow do projeto sem status equivalente
- **Ator**: dev · **Precondição**: nenhuma transição corresponde ao estado alcançado
- **Fluxo**: 1) skill avisa; 2) segue sem transicionar
- **Resultado**: entrega não trava por causa de status

### UC-33 — Cards órfãos em `kanban/06-todo/`
- **Ator**: dev · **Precondição**: cards sem PR e sem branch viva
- **Fluxo**: 1) skill classifica (com PR/branch = QA real; sem nada = provável órfão); 2) lista os órfãos e **pergunta**; 3) remove só o confirmado
- **Resultado**: kanban limpo sem auto-delete

---

## Verificação de Realidade

Happy path de `/homolog` (UC-5 → UC-9 → UC-16 → UC-19 → UC-21), passo a passo contra o código atual:

| Passo do fluxo | Onde está hoje | Estado |
|---|---|---|
| Contexto de deploy do projeto | — | 🔨 **gap** — não existe `deployContext`; nenhuma skill sabe o processo de deploy |
| Detectar topologia (`dev` existe?) | — | 🔨 **gap** — `merge:47`, `pull-request:19` e `work:56` assumem `dev` incondicionalmente |
| Diagnosticar o gap origem↔ambiente | — | 🔨 **gap** — não existe; `merge:47` começa por `gh pr list`, cego para "na branch e não no ar" |
| Selecionar PR(s) | `merge/SKILL.md:45-49` | ✅ existe (um por vez, `all` = sequencial) |
| Gate de QA do card | `merge/SKILL.md:60-67` | ✅ existe (tabela de 4 estados) |
| Rodar `/todo` se QA pendente | `merge/SKILL.md:66` + `todo/SKILL.md` | ✅ existe |
| Abrir PR se falta | `pull-request/SKILL.md` | ⚠️ existe como skill, **não** é invocada pelo `/merge` |
| Code review do diff | `merge/SKILL.md:80-83` | ✅ existe (princípios por nome, os cinco do SOLID) |
| Autenticar resolução via front | `merge/SKILL.md:84-86` | ✅ existe (condicional, rede de segurança) |
| **Aprovar o PR** | — | 🔨 **gap** — só `--request-changes` (`merge:94`); `--approve` não aparece |
| Consertar in-place / rejeitar | `merge/SKILL.md:87-99` | ✅ existe (Phase 2b completa) |
| Quebrar escopo grande em cards | — | 🔨 **gap** — a classificação A/B/C (`merge:158-161`) trata **achado do reviewer**, não excedente de escopo do PR |
| Mergear + apagar branch local e remota | `merge/SKILL.md:101-128` | ✅ existe (com verificação de listagem vazia) |
| Ledger de follow-up → rejeita | `merge/SKILL.md:69-75` | ✅ existe |
| Disparar/acompanhar o deploy | — | 🔨 **gap** — só o comentário `# 2) main → GitHub ← DEPLOYA PROD` (`merge:252`) |
| Tratar run vermelho / enfileirado | — | 🔨 **gap** — `make-dev:69` sabe que fila ≠ falha, mas nenhuma skill de entrega usa isso |
| Aplicar env vars / migrations / flags / seeds | — | 🔨 **gap** — `pull-request:79-83` **documenta** o checklist DevOps; ninguém o executa |
| Smoke na URL do ambiente | — | 🔨 **gap** — o front-test do `merge:86` valida a mudança, não o ambiente publicado |
| Jira: comentar + transicionar | `merge:132-133`, `work:71`, `pull-request:103` | ⚠️ existe **triplicado** — mesma sequência em 3 arquivos |
| Cleanup de órfãos | `merge/SKILL.md:226-233` | ✅ existe (confirm-first) |
| Promover `dev`→`main` com assert | `merge/SKILL.md:240-267` | ⚠️ existe, mas **duplicado** com `sync:144` (que não tem gate) |

**Somatório:** 10 gaps 🔨 · 3 duplicações/desconexões ⚠️ · 9 capacidades já prontas ✅.

Leitura: o que existe hoje é a **metade "git" do problema** — bem resolvida e a preservar. O que falta é a metade **"ambiente"**, inteira, mais o diagnóstico que decide qual das duas agir.
