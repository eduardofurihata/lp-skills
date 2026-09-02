# Homolog e Prod — Test Cases

**Nota de complexidade: 10/10** (teto) · **10 TCs**

Derivação da nota (Steps 3-4): 33 UCs, dos quais 12 são fluxos de erro · 3 alvos (`homolog`, `prod` com `dev`+`main`, `prod` branch única) · 2 eixos de estado independentes (sincronizado × verificado) · 3 estados de run (verde/vermelho/fila) · 21 decisões de spec · 8 motores novos · raio de impacto de 6 arquivos de skill + gerador + README. Muito a cobrir → teto.

## Como estes TCs rodam no front

O produto entregue é **skill executável pelo Claude Code**. O "front" tem três superfícies, todas observadas em execução (nunca por leitura de fonte):

| Superfície | Como se executa |
|---|---|
| **Harness** — a skill carregada e respondendo | `claude -p --plugin-dir ~/GitHub/lp-skills/skills/personal "<invocação>"` |
| **LP** — o catálogo que o usuário vê | `pnpm dev` + navegação em `localhost:3000` |
| **Repositório** — integridade da entrega | `pnpm gen:plugins`, `git status`, `git diff` |

**Fixtures de topologia** (Step 9): repositórios git temporários no scratchpad — um só com `main` (branch única) e um com `main`+`dev` — para exercitar os guards sem tocar em projeto real. Nenhum TC executa deploy real: os cenários escolhidos são guards, diagnósticos e recusas, **não** ações destrutivas.

---

### TC-1: `/homolog` recusa repositório de branch única e encaminha para `/prod`
- **Cobre:** UC-4, UC-2, D-05 (alvo declarado), D-07 (topologia detectada), D-20 (o comando existe com o nome novo)
- **Bug único:** em projeto sem `dev`, o `/homolog` mergeia na `main` (ou trava buscando uma branch que não existe) em vez de encaminhar.
- **Pré-condição:** repositório com **apenas** `main`; plugin carregado via `--plugin-dir`.
- **Passos:** 1) invocar `/homolog` no repositório; 2) ler a resposta.
- **Resultado:** a skill declara que o projeto é de branch única, que não existe ambiente de homolog, aponta `/prod` e **encerra sem alterar o repositório** (`git status` idêntico antes/depois).
- **Prova:** saída do harness + `git status` pré/pós.

### TC-2: `/prod` publica o diagnóstico antes de agir e não altera nada com gap zero
- **Cobre:** UC-5, UC-15, UC-23, UC-29, D-01 (loop), D-02 (`plan` antes de `apply`), D-03 (idempotência)
- **Bug único:** a skill age antes de mostrar o gap, ou modifica o repositório numa invocação em que não havia nada a fazer.
- **Pré-condição:** repositório sem PR aberto e sem commits pendentes; `HEAD` registrado.
- **Passos:** 1) invocar `/prod`; 2) ler a resposta; 3) conferir `git status`, `git log -1` e `git branch --show-current`.
- **Resultado:** a resposta traz a **lista de gaps** (ou a declaração explícita de gap zero **com o motivo**) antes de qualquer ação; `HEAD`, branch e working tree inalterados; nenhum push.
- **Prova:** saída do harness + `git log -1` pré/pós.

### TC-3: o catálogo mostra `/homolog` e `/prod`, e `/merge` desapareceu
- **Cobre:** D-19 (LP como consumidora de dados), D-20 (rename sem alias), frontmatter válido das duas skills
- **Bug único:** frontmatter inválido faz a skill ser **silenciosamente ignorada** (`lib/skills.ts` faz `catch { return null }`) e ela desaparece do catálogo sem erro nenhum.
- **Pré-condição:** `pnpm dev` rodando.
- **Passos:** 1) abrir `localhost:3000`; 2) filtrar a categoria Pessoal; 3) localizar os cards `homolog` e `prod`; 4) procurar `merge`.
- **Resultado:** os dois cards aparecem com nome e descrição corretos; nenhum card `merge` existe; a contagem de skills pessoais fecha com o número de diretórios.
- **Prova:** screenshot da LP.

### TC-4: manifestos são gerados de forma idempotente e sem regressão de descrição
- **Cobre:** D-21 (corrigir a const `BUILDERS` antes de gerar), invariante declarada pelo próprio script
- **Bug único:** rodar o gerador ao publicar a feature **reverte** as descrições já corrigidas (volta `/pr`, `/notion-push`, `/notion-pull`), mentindo no catálogo do marketplace.
- **Pré-condição:** skills renomeadas e criadas; const `BUILDERS` corrigida.
- **Passos:** 1) `pnpm gen:plugins`; 2) `git diff` dos dois JSONs; 3) `pnpm gen:plugins` de novo; 4) `git diff` outra vez.
- **Resultado:** a 2ª execução produz **diff vazio**; `plugin.json` lista `"./homolog"` e `"./prod"` e **não** lista `"./merge"`; nenhuma descrição menciona `/pr`, `/notion-push` ou `/notion-pull`.
- **Prova:** saída dos dois `git diff` + `grep` nos JSONs gerados.

### TC-5: `/prod` em branch única roda o ciclo completo sem gate, mas exige review
- **Cobre:** UC-30, UC-9, UC-25 (ausência de gate **onde não deve haver**), D-09 (gate é propriedade do alvo)
- **Bug único:** ou o `/prod` pede autorização redundante em branch única (fricção que o usuário recusou), ou — o inverso, mais grave — dispensa o review junto com o gate e passa a mergear na `main` sem revisar.
- **Pré-condição:** repositório de branch única com trabalho pendente simulado.
- **Passos:** 1) invocar `/prod`; 2) ler o plano que a skill publica.
- **Resultado:** o plano **não** contém pergunta de autorização para promover; **contém** explicitamente as etapas de review, aprovação e QA antes do merge, e as de deploy, configuração e smoke depois.
- **Prova:** saída do harness com o plano publicado.

### TC-6: contexto de deploy é inferido, pergunta só o que falta, e é registrado
- **Cobre:** UC-1, UC-3, D-06 (vive no projeto, versionado), D-08 (como se sabe que está no ar)
- **Bug único:** a skill pergunta o que poderia ter inferido (ou, pior, inventa URL/comando) e não persiste nada — repetindo a descoberta a cada invocação.
- **Pré-condição:** repositório fixture com `.github/workflows/` e `package.json`, **sem** `docs/00-context/technical/deploy.md`.
- **Passos:** 1) invocar a skill do alvo; 2) observar o que ela afirma ter inferido e o que pergunta.
- **Resultado:** o que é derivável dos arquivos (workflow, branch, comandos) vem **inferido e citado**; as perguntas se limitam ao que não é derivável (URLs, onde vivem os secrets); nenhuma URL ou comando é inventado; o contrato de escrita em `docs/00-context/technical/deploy.md` é declarado.
- **Prova:** saída do harness, separando "inferido" de "perguntado".

### TC-7: o ciclo de PR sobreviveu ao refactor — todos os gates herdados continuam valendo
- **Cobre:** UC-6, UC-7, UC-8, UC-10, UC-11, UC-12, UC-13, UC-14, UC-33, D-15/D-16 (motores e fronteira)
- **Bug único:** ao extrair o ciclo de PR para `pr-cycle.md`, um gate se perde — a skill passa a mergear com QA pendente, com ledger `ABERTO`, com branch atrás da integração, ou deixa de saber rejeitar.
- **Pré-condição:** plugin carregado.
- **Passos:** 1) pedir à skill que declare seu ciclo de PR completo — o que faz com QA pendente, sem card, com ledger aberto, com branch atrás, com escopo grande demais, e quando rejeita; 2) conferir cada item.
- **Resultado:** os 9 comportamentos aparecem: abre PR se falta · roda `/todo` se QA pendente · **para** se não há card · conserta pontual in-place com re-review · **rejeita** e devolve se cru · quebra escopo excedente em cards · rejeita se ledger `ABERTO` · atualiza e re-autentica branch atrás/conflitada · cleanup de órfãos confirm-first.
- **Prova:** saída do harness com os 9 itens marcados.

### TC-8: os três estados do run são distintos, e fila não é sucesso
- **Cobre:** UC-16, UC-17, UC-18, UC-22, D-04 (sincronizado × verificado), D-12 (`queued` é terceiro estado), D-14 (rollback humano)
- **Bug único:** a skill trata `queued` como sucesso e anuncia "no ar" com o runner self-hosted desligado — ou trata como falha e manda caçar bug inexistente.
- **Pré-condição:** plugin carregado.
- **Passos:** 1) pedir à skill que declare o que faz em cada desfecho do deploy: verde, vermelho e enfileirado; 2) pedir o que ela faz quando o smoke falha.
- **Resultado:** três desfechos **nomeados e distintos**; `queued` reportado como **fila**, com o que destravaria (runner offline), nunca como sucesso nem falha; vermelho → conserta/redeploya e **jamais** anuncia no ar, com rollback **oferecido** e não automático; smoke falho → gap reaberto, não conclusão.
- **Prova:** saída do harness com os quatro desfechos.

### TC-9: configuração é aplicada, secret é perguntado, e o smoke cobre todos os cards
- **Cobre:** UC-19, UC-20, UC-21, D-11 (secret nunca inferido nem versionado), D-13 (smoke do ambiente, não do PR)
- **Bug único:** a skill inventa valor de secret plausível e o grava no ambiente (ou o escreve no `deploy.md`, vazando em commit) — ou verifica apenas o card do PR da vez e declara o ambiente inteiro no ar.
- **Pré-condição:** plugin carregado.
- **Passos:** 1) pedir à skill que declare como aplica env var, secret, migration, flag e seed; 2) pedir o que ela faz com uma variável nova cujo valor ela não conhece; 3) pedir o escopo do smoke.
- **Resultado:** os 5 tipos de configuração cobertos; valor de secret **perguntado ao usuário** e explicitamente **não escrito** em nenhum artefato; smoke roda o `## Como testar` de **cada card no ar desde o último deploy verificado**, na URL do ambiente, e não em localhost.
- **Prova:** saída do harness.

### TC-10: promoção a prod exige autorização a cada release, fecha com assert, e o `/sync` ganhou a placa
- **Cobre:** UC-24, UC-25, UC-26, UC-27, UC-28, UC-31, UC-32, D-09 (gate por alvo), D-18 (fronteira com o `/sync`)
- **Bug único:** o `/prod` promove sem autorização explícita desta vez (aceitando autoridade dita antes), ou fecha o release sem o assert `origin/dev == origin/main`, ou o `/sync dev > main` continua sendo uma segunda porta silenciosa para produção.
- **Pré-condição:** fixture com `main`+`dev`; plugin carregado.
- **Passos:** 1) invocar `/prod` e observar se a autorização é pedida **antes** de qualquer push; 2) responder algo que não seja "sim" e conferir que nada aconteceu; 3) pedir o fluxo completo pós-autorização; 4) invocar `/sync` e conferir se aponta o `/prod`.
- **Resultado:** autorização pedida antes de agir e **negada = parada total** (repositório intacto); o fluxo declarado inclui gate de homolog, conflito → re-review antes do push, configs de prod **e** homolog, smoke em prod, resync e assert; Jira comentado/transicionado com `get_transitions` → `transition_issue` (sem `comment` na transição) e "sem status equivalente → avisa e segue"; o `/sync` menciona o `/prod` como o caminho com cerimônia.
- **Prova:** saída do harness dos dois comandos + `git log`/`git status` pré/pós.

---

## Auditoria de cobertura (somatório das linhas `Cobre`)

| UCs | Coberto por |
|---|---|
| UC-1, UC-3 | TC-6 |
| UC-2 | TC-1 |
| UC-4 | TC-1 |
| UC-5, UC-15, UC-23, UC-29 | TC-2 |
| UC-6, UC-7, UC-8, UC-10, UC-11, UC-12, UC-13, UC-14, UC-33 | TC-7 |
| UC-9 | TC-5 |
| UC-16, UC-17, UC-18, UC-22 | TC-8 |
| UC-19, UC-20, UC-21 | TC-9 |
| UC-24, UC-25, UC-26, UC-27, UC-28, UC-31, UC-32 | TC-10 |
| UC-25 (ausência de gate) | TC-5 |
| UC-30 | TC-5 |

**33/33 UCs cobertos.** Decisões do Step 4: D-01/02/03 (TC-2) · D-04/12/14 (TC-8) · D-05/07/20 (TC-1, TC-3) · D-06/08 (TC-6) · D-09 (TC-5, TC-10) · D-10 (TC-7, TC-8) · D-11/13 (TC-9) · D-15/16 (TC-7) · D-17 (TC-1, via alvo como dado) · D-18 (TC-10) · D-19 (TC-3) · D-21 (TC-4). **21/21 decisões cobertas.**

**Filtro de significância** — cada slot puxa cobertura exclusiva: sem TC-1 o guard de topologia fica descoberto · sem TC-2 a skill poderia agir antes de diagnosticar · sem TC-3 frontmatter quebrado passa silencioso · sem TC-4 a publicação regride o catálogo · sem TC-5 o gate seria aplicado no alvo errado (nos dois sentidos) · sem TC-6 o contexto de deploy seria inventado · sem TC-7 o refactor poderia perder um gate herdado · sem TC-8 `queued` viraria sucesso · sem TC-9 um secret seria inventado · sem TC-10 prod subiria sem autorização. Nenhum TC é redundante com outro.

**Plataforma:** execução única (terminal + LP). Sem superfície mobile e sem superfície visual (D-19) → nenhum TC de plataforma, nenhum TC por breakpoint.
