---
feature: homolog-prod
phase: implementation
created: 2026-09-02
---

# Plano de Implementação — Homolog e Prod

## 1. Contexto Consolidado

**Problema** (`docs/01-problem/homolog-prod.md`): o produto não sabe reconciliar o que está pronto com o que está no ar — as skills de entrega terminam no merge. Uma task pode estar na branch e não estar no ar (run falhou, runner offline, env var faltando, migration não rodou), e nada disso aparece no git.

**Stories** (`docs/02-user-stories/`): 18, em 4 grupos — ambiente no ar · o caminho até lá (aprovar/corrigir/rejeitar/quebrar escopo/QA/abrir PR) · configuração e verificação · quem valida e quem manda.

**Use Cases** (`docs/03-use-cases/`): 33 UCs, 12 deles de erro. Tabela de assinaturas com o contrato dos motores. Verificação de Realidade: **10 gaps · 3 duplicações · 9 capacidades prontas** — o que existe é a metade "git" do problema, bem resolvida; falta a metade "ambiente", inteira.

**Spec** (`docs/04-spec/`): 21 decisões em 3 rounds. As estruturais: **D-01** loop de reconciliação (não pipeline) · **D-02** diagnóstico publicado antes de agir · **D-04** dois eixos de estado (sincronizado × verificado) · **D-05** alvo é dado, não código · **D-06** contexto de deploy versionado no projeto · **D-09** gate é propriedade do alvo · **D-15/16** 8 motores com direção única `skill → reconcile → motor → borda` · **D-19** sem superfície visual.

**i18n:** verificado — o projeto **não tem** i18n (zero `next-intl`/`react-i18next`/`i18next`, nenhuma pasta `locales|translations|messages|lang`). Strings literais, em pt-br, com `description` do frontmatter em inglês (convenção vigente nas 22 skills).

## 2. Código Existente Relevante

| Arquivo | O que faz | Impacto |
|---|---|---|
| `skills/personal/merge/SKILL.md` (321 l.) | Iron Law · 9 HARD-GATEs · Phases 0–6 · Saída · 28 Red Flags | **Fonte da extração.** Vira `homolog/` e cede Phases 0–3 e 4§6 aos motores |
| `skills/personal/pull-request/SKILL.md` (136 l.) | PR com corpo em 3 camadas; produz o `## DevOps` (`:79-83`) | Base pela topologia (T-12); é o produtor do checklist que `env-config` consome |
| `skills/personal/work/SKILL.md` (118 l.) | `gh → dev → branch` (`:56-64`) | Branca de `main` sem `dev` (T-13) |
| `skills/personal/sync/SKILL.md` (158 l.) | Notação `=` / `>` / `gh = local`; `:144` declara ausência de gate por design | +1 linha de sinalização (T-14). **Não** reescrever |
| `skills/personal/todo/SKILL.md` (518 l.) | QA via front (Step 9) | Invocado por `pr-cycle` no gate de QA. Não alterado |
| `skills/personal/jira-board/SKILL.md` (165 l.) | Dono único da memória de board | **Modelo** do `deploy-context`, e o contraste que justifica D-06 |
| `skills/personal/make-dev/SKILL.md` (`:69`) | *"Machine off = job queued, not failed"* | Conhecimento a ser **absorvido** por `deploy-run` |
| `scripts/generate-plugins.mjs` (183 l.) | Gera os manifestos do frontmatter; `parseRequires` aceita string **ou lista** (`:53`) | Const `BUILDERS` (`:30-40`) defasada → T-15 |
| `lib/skills.ts` | `getSkills → readBucket → readSkill`; `catch { return null }` | Consumidor: frontmatter inválido = skill sumida em silêncio → TC-3 |

## 3. Estratégia de Implementação

Ordem = a numeração de `kanban/06-todo/homolog-prod.md` (T-01…T-15): estrutura → motores compartilhados → motores de ambiente → o loop → as duas skills → vizinhas → publicação. O loop (T-09) vem **depois** dos motores que ele invoca, e a publicação (T-15) por último porque o gerador lê o estado final.

**Referência de mercado para as decisões de fluxo** (já fixada no Step 4): ArgoCD (`Sync` ≠ `Health`, um controller para N ambientes descritos como dados) · `terraform plan` antes de `apply` · GitHub Deployments API (`queued` como estado próprio) · Heroku release phase · Argo Rollouts (análise pós-deploy) · Vercel (rollback humano).

**Consistência de escrita — lei, e o padrão local já está no nível #1.** A anatomia das skills pesadas é: `# /nome — título pt-br` → resumo → `## Iron Law` (blockquote com fórmula-slogan) → `## Convenções (CONTRATO)` → `<HARD-GATE>` numerado → Phases/Steps → `## Saída` (bloco literal com placeholders) → `## Red Flags — STOP` (formato `- "<desculpa em 1ª pessoa>" → NÃO. <correção>.`). Corpo em pt-br coloquial-técnico, `description` em inglês, negrito no termo operante, MAIÚSCULAS nos absolutos, `→` como operador de consequência. Os references seguem o padrão do `/method` (`principios.md`, `follow-ups.md`): fonte única declarada no topo, tabelas de decisão, lente/aplicação, racionalizações proibidas.

**Responsabilidade única por arquivo (SRP) — uma frase cada:**

| Arquivo | Responsabilidade única |
|---|---|
| `prod/references/reconcile.md` | Rodar o loop diagnosticar→aplicar→re-diagnosticar até o gap fechar |
| `prod/references/pr-cycle.md` | Levar um PR de aberto a mergeado-ou-rejeitado |
| `prod/references/findings.md` | Classificar um achado fora de escopo e dizer seu destino |
| `prod/references/scope-split.md` | Separar do PR o que excede o card e devolvê-lo rastreado |
| `prod/references/deploy-context.md` | Saber a topologia e o processo de deploy deste projeto |
| `prod/references/deploy-run.md` | Levar um deploy a um desfecho nomeado (verde/vermelho/fila) |
| `prod/references/env-config.md` | Deixar o ambiente configurado para a mudança funcionar |
| `prod/references/smoke.md` | Provar, na URL do ambiente, que as features estão lá funcionando |
| `prod/references/jira-sync.md` | Refletir no card o estado que a mudança alcançou |
| `homolog/SKILL.md` | Declarar o alvo homolog e entregá-lo ao `reconcile` |
| `prod/SKILL.md` | Declarar o alvo prod (com ou sem promoção) e entregá-lo ao `reconcile` |

### 3.1 Reúso antes de criar (DRY) — grep feito

| Preciso de | Já existe? | Decisão |
|---|---|---|
| Selecionar PR, gate de QA, review, conserta/rejeita, merge+limpeza | `merge/SKILL.md:45-128` | **extrair** para `pr-cycle.md` — o conteúdo é maduro, muda de lugar, não de teor |
| Classificar achado fora de escopo com prova (A/B/C) | `merge/SKILL.md:152-224` | **extrair** para `findings.md` (ver D-22 abaixo) |
| Comentar + transicionar card no Jira | `merge:132-133`, `work:71`, `pull-request:103` — **3 cópias** | **absorver** em `jira-sync.md`; os 3 passam a referenciar |
| Gate de autorização de prod, a cada release | `merge/SKILL.md:236-239` | **reusar**, movido para a propriedade `gate` do alvo |
| Ciclo `sincronizar → promove → resync → assert` | `merge/SKILL.md:240-267` | **reusar** integralmente em `prod/SKILL.md` |
| Régua "loop não converge em ~2-3 rodadas = trabalho cru" | `merge/SKILL.md:89` | **estender** ao ciclo de ambiente (teto de passes por gap) |
| "Runner offline = job na fila, não falho" | `make-dev/SKILL.md:69` | **absorver** em `deploy-run.md` |
| "Zero secrets no código" | `method/references/07-implementation.md:164` | **estender** a "valor de secret nunca inferido nem versionado" |
| Memória/contexto por projeto, com dono único | `jira-board/SKILL.md` | **modelo a seguir** (não reusar o arquivo: aquele é memória de máquina, este é doc versionado — D-06) |
| Triagem A/B/C do dev | `method/references/follow-ups.md` | **não reusar** — é a triagem do **dev** (destino: ciclo `/method`); a do reviewer tem destino card e provas próprias. Referenciar a diferença, não fundir |
| Rodar QA via front | `todo/SKILL.md` | **reusar** — invocado por `pr-cycle` |
| Abrir PR | `pull-request/SKILL.md` | **reusar** — invocado por `reconcile` no gap "commitado sem PR" |
| Criar card | `card/SKILL.md` | **reusar** — invocado por `scope-split` e `findings` |
| Descobrir board | `jira-board/SKILL.md` | **reusar** — Step 0 das duas skills |
| Gerar manifestos | `scripts/generate-plugins.mjs` | **reusar**; corrigir a const defasada |

**Nada novo é escrito onde já havia algo.** Os 5 arquivos genuinamente novos (`reconcile`, `deploy-context`, `deploy-run`, `env-config`, `smoke`) cobrem os 10 gaps 🔨 da Verificação de Realidade — nenhum tinha equivalente no repositório.

### 3.2 O que NÃO vamos construir (YAGNI)

- **Endpoint `/version` obrigatório** — imporia mudança de código a todo projeto-alvo; o run verde + smoke bastam (D-08). Se um projeto já expõe, o `deploy.md` registra como reforço opcional.
- **Rollback automático** — pode ser pior que a falha (migration aplicada, estado parcial). Registrado e **oferecido** (D-14).
- **Generalização N-ambientes com herança/override de config** — a tabela de alvos já aceita a linha extra (D-17). Staging entra sem código novo.
- **Skill-motor só para hospedar references** — entidade invocável que ninguém invoca (D-15).
- **Máquina de estados com transições nomeadas** — cerimônia sem UC; o loop com ordem por dependência resolve (D-01).
- **Alias `/merge`** — dois nomes para uma capacidade é o defeito que este trabalho conserta (D-20).
- **Remover `dev > main` do `/sync`** — quebra uso legítimo e o contrato declarado da skill; 1 linha de sinalização resolve (D-18).
- **Migration reversível / rollback de dados** — nenhum UC pede; a decisão fica com o humano, com o comando em mão.
- **Notificação em canal externo (Slack/e-mail) do deploy** — ninguém pediu.
- **Cache do contexto de deploy em memória de máquina** — o doc versionado é a fonte; cachear fora dele recria o apodrecimento que `jira-board:29` recusa.

### 3.3 Motores

| Capacidade | Motor | Ação |
|---|---|---|
| Reconciliar ambiente com origem | `prod/references/reconcile.md` | **nasce** — o único ponto de entrada das skills |
| Levar um PR a mergeado-ou-rejeitado | `prod/references/pr-cycle.md` | **nasce por extração** de `merge:45-128` |
| Julgar achado fora de escopo | `prod/references/findings.md` | **nasce por extração** de `merge:152-224` |
| Devolver excedente de escopo | `prod/references/scope-split.md` | **nasce** |
| Conhecer topologia e processo de deploy | `prod/references/deploy-context.md` | **nasce** |
| Levar o deploy a um desfecho nomeado | `prod/references/deploy-run.md` | **nasce**; **absorve** `make-dev:69` |
| Configurar o ambiente | `prod/references/env-config.md` | **nasce**; passa a **consumir** o `## DevOps` de `pull-request:79-83` |
| Provar o estado no ar | `prod/references/smoke.md` | **nasce** |
| Refletir o estado no card | `prod/references/jira-sync.md` | **nasce**; **absorve** as 3 cópias de `merge:132-133`, `work:71`, `pull-request:103` |

**Absorção planejada — quem passa a só chamar:**
- `merge`(→`homolog`)`:132-133`, `work:71`, `pull-request:103` → referenciam `jira-sync.md`.
- `make-dev:69` mantém a nota (é sobre CI local, contexto legítimo dele) e `deploy-run.md` passa a ser o dono da regra **na entrega**; a nota do `make-dev` ganha o ponteiro, não uma segunda definição.
- `homolog/SKILL.md` deixa de conter o ciclo de PR e a classificação: passa a apontar.

**D-22 (decisão nova deste 7a, registrada com o motivo):** `findings.md` **separado** de `pr-cycle.md` — o Step 4 previa 8 motores; ao ler `merge:152-224` em detalhe ficou claro que "rodar o ciclo de PR" e "julgar um achado" são duas capacidades (a segunda tem provas, classes e destinos próprios, e é usada também por `scope-split`). Fundi-las daria um arquivo de ~200 linhas com duas responsabilidades — violação direta de SRP. **9 motores.** Nenhuma outra decisão do Step 4 muda.

### 3.4 Design System

**N/A — sem superfície visual** (D-19, derivado no Step 4). O entregável é markdown lido pelo Claude Code; a LP consome o frontmatter via `lib/skills.ts` sem componente, token ou layout novo.

### 3.5 Perímetro da refatoração

| Arquivo do perímetro | Por que entra | O que será elevado |
|---|---|---|
| `merge/SKILL.md` → `homolog/SKILL.md` | editado (reescrito) | 321 l. monolíticas → orquestrador fino; corrigir os caminhos quebrados `skills/method/references/…` (`:82`, `:152`); `requires` passa a lista, alinhando com o que o corpo (`:41`) já declarava |
| `pull-request/SKILL.md` | editado | base pela topologia; referência a `/merge` atualizada; a duplicata de `jira-sync` vira ponteiro |
| `work/SKILL.md` | editado | branca de `main` sem `dev`; referência a `/merge`; duplicata de `jira-sync` vira ponteiro |
| `sync/SKILL.md` | editado (1 linha) | ambiguidade de "quem leva a prod" resolvida por sinalização explícita |
| `scripts/generate-plugins.mjs` | editado | const `BUILDERS` defasada → sincronizada com a realidade (senão publicar regride o catálogo) |
| `README.md` | editado | exemplo `:53` usando um comando que deixou de existir |
| `make-dev/SKILL.md` | lido para entender; dependente do grep | ganha ponteiro para o dono da regra na entrega — **sem** segunda definição |
| `todo/SKILL.md`, `card/SKILL.md`, `jira-board/SKILL.md` | lidos para entender o contrato de invocação | **declarados já no nível #1** — nada a elevar: contratos claros, dono único, sem duplicação com este trabalho |
| `lib/skills.ts`, `.claude-plugin/marketplace.json` | no caminho do fluxo (consumidores) | `lib/skills.ts` **já no nível #1** (descoberta por convenção, sem lista manual); os JSONs são **gerados**, não editados |

**Desvio registrado no 7b — o perímetro era maior que o previsto.** O grep por `/merge` durante a implementação revelou **8 arquivos além** dos planejados carregando o nome antigo: `method/SKILL.md:69`, `method/references/rationalizations.md:112`, `method/references/follow-ups.md:135`, `method/references/10-done.md:41`, `todo/SKILL.md:443` e `jira-board/SKILL.md:3,10,116`. São referências que o rename deixaria **quebradas** — apontando para uma skill que não existe mais. Classificação: **balde A** (defeito dentro do escopo documentado: o rename é deste trabalho), portanto **corrigido agora**, não adiado. O conteúdo mudou junto com o nome onde fazia sentido: "card de follow-up é privilégio do `/merge`" passou a ser "privilégio do **reviewer** (`/homolog` e `/prod`, via `prod/references/findings.md`)", que é onde a capacidade passou a morar.

**Inventário de preservação — as 28 Red Flags do `merge:294-321` têm destino declarado** (é o que TC-7 audita):

| Grupo | Quantas | Destino |
|---|---|---|
| Board do projeto (assumir/descobrir/cachear) | 3 | `homolog/SKILL.md` + `prod/SKILL.md` (Step 0 das duas) |
| Gate de QA e prova de teste | 3 | `pr-cycle.md` |
| Rejeição, conserto e convergência do loop | 6 | `pr-cycle.md` |
| Limpeza de branch e commit do kanban | 4 | `pr-cycle.md` |
| Classificação de achado (prova, citação, causalidade) | 9 | `findings.md` |
| Cleanup de órfãos | 2 | `pr-cycle.md` |
| Autorização de prod ("já disse que pode") | 1 | `prod/SKILL.md` |
| "homolog não é branch" | 1 | **`homolog/SKILL.md`, texto intacto** — o contrato não muda com o rename |
| **Novas** (do Step 5/6) | +9 | topologia (2, nas skills) · run/fila/no ar (3, `deploy-run.md`) · secret e smoke (2, `env-config.md`/`smoke.md`) · diagnóstico antes de agir e idempotência (2, `reconcile.md`) |

## 4. Mapa de Test Cases → Código

| TC | Atende | Edge cases / validações |
|---|---|---|
| TC-1 | guard de topologia em `homolog/SKILL.md` + `deploy-context.md` | `dev` existe só local (não em `origin`) → conta como branch única para efeito de PR; encerrar **sem** tocar no repositório |
| TC-2 | `reconcile.md` §diagnóstico + §idempotência | gap zero tem de vir **com motivo**; nenhum efeito colateral (nem `fetch` que altere estado local) |
| TC-3 | frontmatter de `homolog/SKILL.md` e `prod/SKILL.md` | `requires` como **lista** tem de ser aceito por `parseRequires` (`generate-plugins.mjs:53`) e por `lib/skills.ts`; `description` com aspas simples e `''` escapado |
| TC-4 | `scripts/generate-plugins.mjs` const `BUILDERS` | 2ª execução com diff vazio; `./merge` ausente; zero menção a `/pr`, `/notion-*` |
| TC-5 | `prod/SKILL.md` tabela de alvos | branch única: `gate: false` **sem** afrouxar review/QA/smoke |
| TC-6 | `deploy-context.md` §inferência | separar explicitamente "inferido" de "perguntado"; zero URL/comando inventado |
| TC-7 | `pr-cycle.md` + `findings.md` + `scope-split.md` | os 9 comportamentos herdados presentes; aprovação com o caso "não se aprova o próprio PR" |
| TC-8 | `deploy-run.md` | 3 desfechos distintos; `queued` ≠ sucesso ≠ falha; rollback oferecido |
| TC-9 | `env-config.md` + `smoke.md` | 5 tipos de config; secret perguntado e não persistido; smoke em URL, não localhost |
| TC-10 | `prod/SKILL.md` + `jira-sync.md` + `sync/SKILL.md` | autorização antes de agir; negativa = parada total; assert de convergência; placa no `/sync` |

## 5. Riscos e Pontos de Atenção

1. **Perder uma Red Flag no refactor** — é o risco maior: elas são o mecanismo antifalha mais valioso do arquivo. Mitigação: o inventário de preservação do § 3.5 (28 com destino) + TC-7 auditando o comportamento no harness.
2. **Publicar e regredir o catálogo** — rodar `gen:plugins` com a const defasada desfaz `bba1c75`/`80923f5`. Mitigação: T-15 corrige antes de gerar; TC-4 prova.
3. **Frontmatter inválido some em silêncio** (`catch { return null }`). Mitigação: TC-3 pela LP, que é o único lugar onde a falha aparece.
4. **`requires` como lista** — suportado por `parseRequires` (`:53`), mas não há precedente em uso no repositório. Mitigação: TC-3/TC-4 exercitam; se falhar, cair para string única e registrar o desvio aqui.
5. **Sobre-fragmentação** — 9 references podem virar labirinto. Mitigação: direção única declarada (D-16) e `reconcile` como porta única; cada arquivo com a responsabilidade de uma frase (§ 3).
6. **Fixtures de teste** — repositórios git temporários no scratchpad, **sem remote**: `gh` não funciona lá. Os TCs escolhidos (guards, diagnóstico, recusas) não dependem de `gh`; o que dependeria seria deploy real, deliberadamente fora dos TCs.
7. **Não trocar de branch** (goal do usuário) — todo o trabalho na `main`, um único commit no Step 10, com paths explícitos.

## 6. Checklist de Implementação

- [x] T-01 — `git mv merge → homolog`; criar `prod/references/`
- [x] T-02 — `pr-cycle.md` (extração de `merge:45-128`) + aprovação do PR
- [x] T-03 — `jira-sync.md` (absorve 3 cópias)
- [x] T-02b — `findings.md` (extração de `merge:152-224`) — **D-22**
- [x] T-04 — `deploy-context.md`
- [x] T-05 — `deploy-run.md` (absorve `make-dev:69`)
- [x] T-06 — `env-config.md`
- [x] T-07 — `smoke.md`
- [x] T-08 — `scope-split.md`
- [x] T-09 — `reconcile.md`
- [x] T-10 — `homolog/SKILL.md` reescrito
- [x] T-11 — `prod/SKILL.md` criado
- [x] T-12 — `pull-request/SKILL.md`
- [x] T-13 — `work/SKILL.md`
- [x] T-14 — `sync/SKILL.md` (+1 linha)
- [x] T-15 — `generate-plugins.mjs` + `README:53` + `pnpm gen:plugins`
