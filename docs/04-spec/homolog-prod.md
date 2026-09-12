# Homolog e Prod — Spec

> **Referências de qualidade** (baseline, não teto): **Kubernetes controllers / ArgoCD** (reconciliação declarativa: estado desejado × atual, `Synced` **separado** de `Healthy`) · **Terraform** (`plan` antes de `apply` — mostrar o diff antes de agir) · **GitHub Deployments API** (`queued` / `in_progress` / `success` / `failure` como estados distintos) · **Heroku release phase** (migration é etapa do release, não do build) · **Argo Rollouts / Spinnaker** (análise pós-deploy antes de declarar sucesso) · **Vercel** (rollback instantâneo como **ação humana**) · **Ansible / Terraform** (idempotência: rodar de novo não muda nada) · **12-factor + OWASP** (config no ambiente, secret fora do repositório).

---

## Round 1 — Modelo de execução, contexto e alvos

### D-01 — Loop de reconciliação, não pipeline linear
**Decisão:** a skill roda `diagnosticar → aplicar o motor do gap → re-diagnosticar`, em loop, até `gaps[] == 0`. Não é uma sequência fixa de fases.
**Justificativa:** o problema (Step 1) é uma **distância entre dois estados**, não uma lista de comandos. Pipeline linear precisa saber a ordem antes de olhar a realidade, e por isso é cego para "já está na branch e não está no ar" — o caso que motivou o trabalho.
**Referência:** controller loop do Kubernetes / ArgoCD — o controlador não executa um script, compara e converge.
**UC que exige:** UC-5, UC-15, UC-22, UC-23, UC-30.
**Já existe no projeto?** Não. O `/merge:45` começa em `gh pr list` — entrada por PR, não por estado.
**Alternativas descartadas:** *(a)* adicionar Phases 6–7 ao `/merge` mantendo a entrada por PR — mais barato, mas preserva a cegueira do caso central; *(b)* máquina de estados explícita com transições nomeadas — cerimônia sem UC que a exija (YAGNI).

### D-02 — Diagnóstico publicado antes de qualquer ação
**Decisão:** o primeiro artefato de toda invocação é a lista de gaps, publicada no chat. Só depois a skill age.
**Justificativa:** torna a skill auditável e cancelável; o dev vê o que vai acontecer antes de acontecer. Também é o que permite o relatório final comparar prometido × entregue.
**Referência:** `terraform plan` antes de `apply`.
**UC que exige:** UC-5.
**Já existe?** Não — o `/merge` age e reporta ao final.
**Alternativas descartadas:** agir e só reportar no fim (opaco em erro parcial); pedir confirmação do plano a cada gap (fricção sem UC — a autorização exigida é a de prod, D-09).

### D-03 — Idempotência é requisito
**Decisão:** invocar com `gaps[] == 0` não altera nada e **explica por que** não havia o que fazer.
**Justificativa:** skill de estado tem de poder ser rodada a qualquer momento sem medo. "Nada a fazer" silencioso é indistinguível de falha.
**Referência:** Ansible/Terraform — convergência idempotente.
**UC que exige:** UC-23, UC-29.
**Já existe?** Parcialmente: `merge:55` sai com *"`dev` == `main`, nada a fazer"* — mas olha só o git, nunca o ambiente.
**Alternativas descartadas:** forçar redeploy sempre ("garantir o estado") — queima runner e cria risco em prod sem UC que peça.

### D-04 — Dois eixos de estado por card: **sincronizado** e **verificado**
**Decisão:** cada card carrega dois estados independentes — *o código está no ambiente* (run verde com o SHA certo) e *funciona no ambiente* (smoke passou). Nenhum dos dois implica o outro.
**Justificativa:** é a distinção que o problema pede. "Subiu" e "funciona" falham por causas diferentes (run vermelho × env var faltando) e se consertam por motores diferentes.
**Referência:** ArgoCD separa `Sync Status` de `Health Status` exatamente por isso.
**UC que exige:** UC-16 (sincronizar) × UC-21/UC-22 (verificar); UC-19 fica no meio (sincronizado, não saudável).
**Já existe?** Não — hoje existe só "mergeado".
**Alternativas descartadas:** um estado único "entregue" — colapsa as duas falhas em uma e volta a esconder o caso central.

### D-05 — O alvo é dado, não código
**Decisão:** `/homolog` e `/prod` **declaram um alvo** (`{ambiente, branch, fonteDoDelta, gate, pré-requisito}`) e delegam ao mesmo `reconcile`. Ambiente novo = linha nova na tabela de alvos.
**Justificativa:** OCP. As duas skills têm o mesmo fluxo e diferem em cinco valores; escrever dois fluxos garante que eles divirjam na primeira manutenção.
**Referência:** `Application` spec do ArgoCD — o mesmo controller serve N ambientes descritos como dados.
**UC que exige:** UC-4 (branch única), UC-26 (promoção), UC-30 (branch única no `/prod`).
**Já existe?** Não.
**Alternativas descartadas:** uma skill só (`/deploy <ambiente>`) — o usuário pediu explicitamente dois comandos nomeados pelo destino, e nome de destino é o que carrega a consequência ("prod" avisa o que "deploy" esconde).

### D-06 — Contexto de deploy vive **no projeto**, versionado

> ⚠️ **CAMINHO SUPERSEDED (2026-09-11) — o doc passou a ser `.claude/deploy.md`.** `docs/00-context/technical/` ficava encostado na esteira numerada de discovery do `/method` (`01-problem` … `05-test-cases`) e parecia doc por feature; o `/method` nem conhecia a pasta. O conhecimento **permanente** do projeto agora tem casa própria em `.claude/`, com um dono por arquivo: `setup.md` (convenções do time — `/setup`), `infra.md` (mapa da infra — `/infra`), `deploy.md` (este — `deploy-context`) e `patterns.md` (padrões de código — `/method` Step 4, que também unificou o caminho: antes o `/method` lia `docs/04-spec/technical/patterns.md` e o `/prod` lia `docs/00-context/technical/patterns.md`). A decisão de fundo — **versionado no projeto, nunca na memória da máquina** — permanece; o `deploy-context.md` migra o arquivo antigo com `git mv` na primeira invocação. Ver `docs/04-spec/setup-infra.md`.

**Decisão:** `docs/00-context/technical/deploy.md`, versionado no repositório-alvo. **Não** em `~/.claude/projects/<slug>/memory/`.
**Justificativa:** o processo de deploy é conhecimento do **projeto** — o time inteiro depende dele e ele muda por PR, com revisão. O board do Jira é o oposto (preferência da máquina de quem usa), e é por isso que o `/jira-board` usa memória.
**Referência:** padrão do próprio projeto — `merge:80` já consome `docs/00-context/technical/patterns.md`; o irmão natural fica ao lado.
**UC que exige:** UC-1, UC-2, UC-3.
**Já existe?** Não. `docs/00-context/` é convenção dos projetos-alvo (não existe **neste** repositório, que é o de skills).
**Alternativas descartadas:** *(a)* memória por máquina como o `/jira-board` — cada dev redescobriria o mesmo processo, e o conhecimento não seria revisável; *(b)* inferir tudo a cada invocação, sem persistir — repetiria pergunta e inferência para sempre (é o erro que a Iron Law do `/jira-board` nomeia).

### D-07 — Topologia é detectada, nunca declarada
**Decisão:** `git ls-remote --heads origin dev` vazio ⇒ branch única. Detectado, registrado no doc, **reconferido** a cada invocação.
**Justificativa:** é a mesma regra que o `/method` já aplica a escopo de plataforma ("derivado, não declarado"). Topologia declarada pelo usuário envelhece em silêncio quando o repositório ganha uma `dev`.
**Referência:** `04-spec.md` § *Escopo de Plataforma — Derivado, não declarado*.
**UC que exige:** UC-4, UC-3, UC-30.
**Já existe?** Não — `merge:47`, `pull-request:19` e `work:56` assumem `dev` incondicionalmente.
**Alternativas descartadas:** flag no doc como única fonte (envelhece); perguntar ao usuário (contraria a regra do protocolo).

---

## Round 2 — Gaps que o Round 1 abriu

### D-08 — Como saber que "o commit está no ar"
**Decisão:** sinal primário = **run de deploy verde cujo SHA cobre o HEAD da branch de integração**; prova final = **smoke funcional** (D-13). Se o projeto expõe endpoint de versão, o `deploy.md` registra e a skill usa como reforço — **sem exigir** que o projeto passe a expor.
**Justificativa:** usa o que todo projeto já tem (o run) e não impõe mudança de código a nenhum deles. Exigir `/version` seria uma decisão de arquitetura sobre projetos que não pediram nada.
**Referência:** GitHub Deployments API (o run é a fonte de verdade do que foi publicado); ArgoCD confirma com health check, não só com o commit.
**UC que exige:** UC-16, UC-21.
**Já existe?** Não.
**Alternativas descartadas:** exigir endpoint `/version` com SHA em todo projeto (YAGNI + invasivo); confiar só no SHA do git (é exatamente o erro atual — git não sabe se o deploy rodou).

### D-09 — O gate de autorização é propriedade do **alvo**
**Decisão:** `gate: true` no alvo `prod` com topologia `dev`+`main`; `gate: false` em homolog e em prod de branch única. A pergunta é feita **a cada release**, e autoridade dita antes não conta.
**Justificativa:** decisão do usuário, e coerente: no fluxo de duas branches a promoção é um ato deliberado e separado; em branch única, digitar `/prod` **é** o ato deliberado — pedir confirmação do que o comando literalmente nomeia é fricção vazia.
**Referência:** regra herdada do `/method` (*"NÃO faça merge para `main` sem autorização explícita"*) e de `merge:24`; contraste deliberado com `sync:144` (*"quem digita é quem autoriza"*), que passa a valer só onde o nome do comando já é a autorização.
**UC que exige:** UC-25, UC-26, UC-30.
**Já existe?** Sim, em `merge:236-239` — **será reusado**, movido para o alvo em vez de reescrito.
**Alternativas descartadas:** gate sempre (o usuário recusou para branch única); gate condicionado a risco do diff (migration/env var) — heurística que erra em silêncio nos dois sentidos.

### D-10 — Ordem dos gaps é por dependência, e o loop tem teto
**Decisão:** os gaps são resolvidos na ordem `origem → branch → sincronizado → configurado → verificado`; um gap só é atacado quando o anterior fecha. O loop tem **teto de ~3 passes** por gap: não convergiu, **para e reporta**.
**Justificativa:** não faz sentido configurar o que não subiu, nem verificar o que não foi configurado. O teto evita o loop infinito de conserto que o próprio `/merge:308` já reconhece como sinal de trabalho cru.
**Referência:** `merge:89` (*"loop de conserto não converge (~2–3 rodadas) = PR cru"*) — mesma régua, aplicada ao ciclo de ambiente.
**UC que exige:** UC-5, UC-17, UC-22.
**Já existe?** A régua das ~3 rodadas existe para PR; **será reusada**, não reinventada.
**Alternativas descartadas:** paralelizar gaps (cria estado inconsistente no ambiente); loop sem teto (trava a sessão e queima runner).

### D-11 — Secret: valor pedido, nunca inferido, nunca versionado
**Decisão:** o `deploy.md` registra **onde** a variável vive e **como** setá-la; o valor é pedido ao usuário na hora e não é escrito em nenhum artefato.
**Justificativa:** valor inventado em prod é falha silenciosa e potencialmente destrutiva; secret versionado é vazamento permanente, sobrevive a `git rm`.
**Referência:** 12-factor (config no ambiente) + OWASP (secrets fora do VCS); e a doutrina do `jira-board:29` sobre o que **não** se cacheia.
**UC que exige:** UC-20.
**Já existe?** Parcialmente: `07-implementation.md:164` já exige *"zero secrets no código"*. **Estendido**, não recriado.
**Alternativas descartadas:** gerar valor plausível para destravar; ler de `.env` local e replicar no ambiente (promove segredo de dev a prod sem ninguém decidir).

### D-12 — `queued` é um terceiro estado, não sucesso nem falha
**Decisão:** `deployRun` devolve `verde | vermelho | fila`. Em `fila`, a skill checa o runner e reporta **fila**, com o que destravaria.
**Justificativa:** o setup é GH Actions em **runner self-hosted local** — máquina desligada enfileira o job. Ler isso como sucesso é declarar no ar o que não subiu; ler como falha manda o dev caçar bug que não existe.
**Referência:** GitHub Deployments API trata `queued` como estado próprio; `make-dev:69` já registra *"Machine off = job queued, not failed"*.
**UC que exige:** UC-18.
**Já existe?** O conhecimento existe em `make-dev:69`, **desconectado** de qualquer skill de entrega. Será **absorvido** pelo motor.
**Alternativas descartadas:** timeout tratado como falha (falso negativo caro); esperar indefinidamente (trava a sessão).

### D-13 — O smoke cobre **todos** os cards do ambiente, não o do PR
**Decisão:** verifica o `## Como testar` de cada card que deveria estar no ar desde o último deploy verificado.
**Justificativa:** é literalmente o que o usuário pediu ("verificar se **todas** as features subiram") e o que o PO/QA precisa (UC-21 / story de validação). Um deploy publica o acumulado da branch, não um PR.
**Referência:** Argo Rollouts — a análise pós-deploy avalia a **release**, não o commit.
**UC que exige:** UC-21, UC-22.
**Já existe?** Não. O front-test de `merge:86` valida **a mudança do PR**, e é condicional. Escopos diferentes: aquele autentica o card, este autentica o ambiente.
**Alternativas descartadas:** smoke só do PR da vez (deixa passar regressão do acumulado); suíte E2E completa a cada deploy (custo sem UC — o teto de TCs do protocolo já rejeita).

### D-14 — Rollback é registrado e oferecido, nunca automático
**Decisão:** o `deploy.md` guarda o comando de rollback; em run vermelho ou smoke falho em prod, a skill **apresenta** o rollback e pede decisão.
**Justificativa:** rollback automático pode ser pior que a falha (migration já aplicada, estado parcial). É decisão de quem responde pelo produto.
**Referência:** Vercel/Netlify — *Instant Rollback* é botão humano, não gatilho.
**UC que exige:** UC-17, UC-22.
**Já existe?** Não.
**Alternativas descartadas:** rollback automático em vermelho (YAGNI + risco não pedido); ignorar rollback (deixa o dev sem a saída na hora em que ela importa).

---

## Round 3 — Re-análise: fronteiras, duplicação e dimensões não cobertas

### D-15 — Os 8 motores e onde vivem
**Decisão:** `skills/ship/prod/references/` (era `skills/personal/…` até o Round 6 do marketplace) — `reconcile` · `pr-cycle` · `scope-split` · `deploy-context` · `deploy-run` · `env-config` · `smoke` · `jira-sync`. O `/homolog` consome de lá.
**Justificativa:** um dono, um lugar. `/prod` é a **única** skill presente nas duas topologias (em branch única o `/homolog` não trabalha), então é a sede natural. Simetria (metade em cada) criaria dependência circular de leitura sem ganho.
**Referência:** o próprio protocolo — `merge:82` já lê `references/principios.md` do `/method`, precedente de cross-read entre skills.
**UC que exige:** a tabela de assinaturas do Step 3 (todos os UCs).
**Já existe?** Não; hoje tudo está inline em 321 linhas de `merge/SKILL.md`.
**Alternativas descartadas:** *(a)* duplicar em cada skill — viola DRY no commit que prega DRY; *(b)* skill-motor nova só para hospedar references — entidade invocável que ninguém invoca (YAGNI); *(c)* references no `/homolog` — quebra em repositório de branch única, onde ele não roda.

### D-16 — Fronteiras, direção de dependência e contrato (SRP · DIP · LoD · ISP)
**Decisão:** as skills dependem **só** de `reconcile`; `reconcile` conhece os 7 motores; nenhum motor conhece outro nem a skill. As skills externas (`/jira-board`, `/pull-request`, `/todo`, `/card`) são chamadas **pelos motores**, na borda.
**Justificativa:** direção única (skill → reconcile → motor → borda) sem retorno. É a Law of Demeter aplicada: `/homolog` não alcança `deployRun` para decidir sobre runner — pede o resultado a `reconcile`. Contrato de cada motor é a linha dele na tabela de assinaturas, e nada além (ISP).
**Referência:** `principios.md` § Motores (*"contrato pequeno, o interior é privado"*) e § LoD.
**UC que exige:** toda a tabela de assinaturas.
**Já existe?** Não — hoje as Phases do `/merge` leem e escrevem o estado umas das outras livremente.
**Alternativas descartadas:** motores se chamando entre si (grafo que vira ciclo na primeira extensão); skill chamando motor direto, sem `reconcile` (perde o diagnóstico de D-02 e o loop de D-01).

### D-17 — Ponto de extensão (OCP): o que muda quando entra um ambiente novo
**Decisão:** ambiente novo (staging, preview, multi-região) entra como **linha na tabela de alvos** + linha na tabela `## Ambientes` do `deploy.md`. Nem `reconcile` nem os motores nem as skills mudam.
**Justificativa:** é o único eixo de crescimento previsível — e sem esse ponto declarado, staging entraria como `if` dentro do loop.
**Referência:** ArgoCD — N `Application`s, um controller.
**UC que exige:** UC-2, UC-5 (o alvo é parâmetro desde o início).
**Já existe?** Não.
**Alternativas descartadas:** generalizar agora para N ambientes com herança/override de config — abstração sem UC (YAGNI); a tabela já suporta a linha extra.

### D-18 — `/sync dev > main` continua existindo, com a fronteira dita
**Decisão:** o `/sync` **permanece** como ferramenta de branch de baixo nível e ganha **uma linha** apontando o `/prod` como o caminho com cerimônia (deploy observado, configs, smoke).
**Justificativa:** as capacidades são distintas — `/sync` **sincroniza branches** (e serve hotfix, `main > dev`, `gh = local`); `/prod` **reconcilia produção**. A sobreposição é que mover `dev`→`main` dispara deploy, e o remédio é uma placa de sinalização, não amputar a ferramenta. Remover o `/sync` seria escopo que ninguém pediu e perda de capacidade real.
**Referência:** `sync:144` declara a escolha de não ter gate como **design consciente e standalone** — respeitá-la e desambiguar é mais honesto do que sobrescrevê-la.
**UC que exige:** fecha o follow-up levantado no Step 1 (segunda porta para prod).
**Já existe?** Sim, e fica.
**Alternativas descartadas:** *(a)* remover `dev > main` do `/sync` — quebra uso legítimo e o contrato declarado da skill; *(b)* fazer o `/sync` chamar o `/prod` — inverte a direção de dependência (baixo nível passaria a depender do alto) e transforma uma ferramenta de git numa esteira de deploy; *(c)* não fazer nada — mantém a ambiguidade que o Step 1 registrou.

### D-19 — Escopo de plataforma e superfície visual — **derivados**
**Decisão:** **sem superfície mobile** e **sem superfície visual**. O entregável é markdown (`SKILL.md` + references) lido pelo Claude Code.
**Justificativa (derivação, não declaração):** o repositório não tem código mobile (`package.json` = Next.js + React DOM; zero React Native/Capacitor). Para a superfície visual: a LP (`app/`, `components/`) renderiza cards a partir do frontmatter via `lib/skills.ts`, mas este trabalho **não cria nem altera componente, token ou layout** — muda o **conteúdo de dados** que componentes existentes consomem. Logo a LP é **consumidora** e entra no Step 9 como TC de dados ("o card `/prod` aparece na categoria Pessoal"), não como superfície a desenhar.
**Referência:** `04-spec.md` § Escopo de Plataforma; `lib/skills.ts` (`getSkills → readBucket → readSkill`, descoberta por diretório).
**UC que exige:** nenhum UC pede tela — os 33 são fluxos de terminal.
**Consequência:** a linha de **Design** dos gateways é declarada `❌ N/A` uma vez, aqui, e os gateways seguintes herdam.

### D-20 — Rename sem alias, e o custo de manutenção assumido
**Decisão:** `/merge` → `/homolog`, sem alias. Todas as referências cruzadas atualizadas (`work:14`, `pull-request:114`, `README:53`, const `BUILDERS`), com varredura final por grep.
**Justificativa:** precedente explícito da casa — o commit `80923f5` renomeou `/commit`→`/save` e `/pr`→`/pull-request` sem deixar alias. Alias duplicaria o ponto de entrada da mesma capacidade (o defeito que este trabalho vem consertar).
**Referência:** histórico do repositório; `README:53` (*"o nome de invocação vem do `name` no frontmatter"*).
**UC que exige:** decorre da decisão do usuário sobre nomenclatura.
**Alternativas descartadas:** manter `/merge` como alias de `/homolog` (dois nomes, uma capacidade); manter `/merge` fazendo só o merge (volta a ser skill de ação, que é o problema).

### D-21 — Manifestos: gerar, e corrigir o gerador antes
**Decisão:** `plugin.json` e `marketplace.json` saem de `pnpm gen:plugins`. **Antes** de rodar, corrigir a const `BUILDERS` (`scripts/generate-plugins.mjs:30-40`), hoje atrás dos JSONs commitados (ainda diz `/pr` e `/notion-push, /notion-pull`, removidos em `bba1c75` e `80923f5`).
**Justificativa:** rodar o gerador sem isso **reverteria** descrições já corrigidas — o gerador é a fonte, e a fonte está desatualizada. Sem a correção, o próprio ato de publicar esta feature causaria uma regressão.
**Referência:** `README:57` (*"fonte única = o frontmatter dos SKILL.md"*, manifestos gerados) e a invariante declarada no script (*"rodar 2× produz bytes idênticos"*).
**UC que exige:** nenhum UC de produto — é requisito de integridade da entrega, verificado no Step 9 (TC de idempotência).
**Já existe?** O gerador existe; a defasagem da const é achado deste trabalho (balde A: está no perímetro e este trabalho o executa).
**Alternativas descartadas:** editar os JSONs à mão (contraria o workflow do repositório e é desfeito no próximo `gen`); rodar o gerador e aceitar a regressão de descrição (mentira no catálogo).

### D-23 — Motores de **gap** e motores de **apoio** (refina D-16, achado no Step 8)

**Decisão:** os 9 motores são de duas naturezas. **Motores de gap** (`pr-cycle`, `deploy-run`, `env-config`, `smoke`) fecham um gap do loop e são invocados **só** pelo `reconcile`. **Motores de apoio** (`deploy-context`, `jira-sync`, `findings`, `scope-split`) não decidem fluxo nem fecham gap — são chamáveis por quem precisar, inclusive por um motor de gap.
**Justificativa:** D-16 dizia "nenhum motor conhece outro", e o Step 8 pegou a divergência: `pr-cycle` precisa de `jira-sync` (comentar o card ao mergear) e de `findings` (julgar achado do review). Forçar isso pelo `reconcile` transformaria o loop num orquestrador de micro-passos ("agora comente o card", "agora classifique o achado") — mais acoplado e menos legível, exatamente o oposto do que D-16 queria proteger. A distinção preserva a proteção real (**nenhum motor de gap invoca outro motor de gap**, então a ordem de dependência do loop continua sendo do `reconcile`) e reconhece a natureza de biblioteca dos de apoio.
**Referência:** Kubernetes separa **controllers** (reconciliam, um por recurso) de **client libraries** (chamáveis por qualquer um) — mesma distinção.
**UC que exige:** UC-31 (card no merge, via `pr-cycle`) e UC-12 (excedente, via `scope-split` → `findings`).
**Alternativas descartadas:** *(a)* devolver "precisa sincronizar card" ao `reconcile` para ele chamar `jira-sync` — burocracia sem ganho, e o loop passaria a conhecer detalhe de dentro do `pr-cycle`; *(b)* duplicar a mecânica do Jira dentro do `pr-cycle` — é a duplicação que este trabalho remove.
**Consequência:** o "volta para" do `smoke.md` § 4 é **diagnóstico reportado ao `reconcile`**, que reabre o gap — nunca invocação direta de outro motor de gap.

### Dimensões re-analisadas e sem gap
- **Segurança:** coberta em D-11 (secret) e D-14 (rollback humano). Nenhum motor loga valor de variável.
- **Performance:** a única operação custosa é esperar run e smoke; D-10 (teto de passes) e D-12 (fila reportada) limitam. Sem gap.
- **i18n:** entregável é markdown em pt-br com `description` em inglês — convenção já vigente em 22 skills. Sem gap.
- **a11y:** N/A por D-19 (sem superfície visual).
- **Concorrência:** duas sessões rodando `/homolog` no mesmo repositório — mitigado pelo que o repositório já pratica: **paths explícitos no commit, nunca `git add -A`** (`merge:306`). Sem decisão nova.
- **Rollback de dados (migration aplicada):** fora de escopo — nenhum UC pede migration reversível; D-14 entrega a decisão ao humano com o comando em mão.

---

## ✅ Spec completo — 3 rounds, 21 decisões, zero ambiguidades

**Motores nomeados e seus donos:** `reconcile` (o loop) · `pr-cycle` (ciclo de PR) · `scope-split` (excedente de escopo) · `deploy-context` (topologia + contexto do projeto) · `deploy-run` (o run) · `env-config` (configuração de ambiente) · `smoke` (verificação no ar) · `jira-sync` (card ↔ estado).

**Motor que absorve duplicação existente:** `jira-sync` — hoje a mesma sequência (`get_transitions` → `transition_issue`, sem `comment` por ADF) está escrita em `merge:132-133`, `work:71` e `pull-request:103`.

**Escopo de plataforma:** sem superfície mobile · **sem superfície visual** (derivado em D-19).

## Round 4 — Um pipeline, quatro alvos, dois modificadores (2026-09-12)

> **Pedido:** "`/prod` deve ver onde o pedido está e executar todo o processo do work até o prod; se está em homolog, só finaliza. O mesmo para `/homolog`, `/pull-request`, `/work`. `/repro` e `/card` são adicionais ao processo, não gatilhos. Nenhum do processo aciona `/card` sozinho. Nem tudo terá Jira." Referências de qualidade que seguem valendo: ArgoCD (estado desejado × atual), Terraform (`plan` antes de `apply`).

### D-24 — Os quatro alvos são cortes numa escada única (estende D-05)
**Decisão:** `/work`, `/pull-request`, `/homolog` e `/prod` declaram `{atéOEstágio, ambiente, branch, fonteDoDelta, gate, paradas[]}` e entregam ao mesmo `reconcile`, que passa a enxergar a escada inteira — `card? → branch → reprodução? → commit → push → pr? → integrado → [homolog] → «GATE» → promovido? → [prod]` — e para no estágio do alvo. As faixas são aninhadas (`prod ⊃ homolog ⊃ pull-request ⊃ work`). **Nenhum alvo PARA mandando o usuário rodar outra skill**: estágio aberto atrás é gap que o loop fecha com o motor dele. `/prod` com homolog verificado só promove — resultado do diagnóstico, não modo especial.
**Justificativa:** D-05 já dizia que o alvo é dado; só faltava o dado "até onde". As três paradas do `/pull-request` ("rode o `/work` antes") eram o loop recusando trabalho que ele mesmo sabe fazer. Uma frase do usuário, um objetivo.
**UC que exige:** UC-5, UC-23, UC-30 — e o pedido literal deste round.
**Alternativas descartadas:** *(a)* cada skill invocar a anterior (`/prod` → `/homolog` → `/pull-request` → `/work`) — quatro loops aninhados, cada um re-diagnosticando, e a recursão da D-27; *(b)* uma skill só (`/ship <estágio>`) — o nome do destino carrega a consequência, e o usuário pediu quatro comandos.

### D-25 — `pré-requisito` deixa de existir; o gate muda de âncora (revisa D-09)
**Decisão:** com escada única, "homolog verificado" é o estágio `verificado@homolog`, **dentro** da faixa do `/prod` — o campo `pré-requisito` e a invocação `/prod` → `/homolog` somem, e com eles o ciclo `homolog ↔ prod` no `requires`. O gate de produção (D-09 inteira, no conteúdo) passa a ser `gate: {antesDe: promovido}` — a pergunta é feita **ao chegar** no estágio, não na entrada do loop.
**Justificativa:** perguntado na entrada, `/prod` do zero pediria autorização antes de o card estar implementado — e "autoridade dita antes não conta" faria a resposta expirar antes de valer.
**Alternativas descartadas:** manter `pré-requisito` e a invocação — mantém o ciclo e cria o segundo loop dentro do primeiro.

### D-26 — `/repro` e `/card` são modificadores; ordem digitada livre, ordem de execução fixa
**Decisão:** modificador não dispara o pipeline. Sozinho faz só a própria parte (`/repro` reproduz e para na parada 1 — sem `/method`, sem commit; `/card` cria o card e para). Composto, roda a própria parte e **delega** ao alvo via Skill tool com os verbos restantes. Ordem de execução fixa **`repro → card → alvo`** — a reprodução alimenta o card (`## Como testar` com os passos observados) e o `/method`; a key alimenta a branch. O alvo que recebe `/repro` com a reprodução já feita nesta conversa **funde a parada 2** (`repro/references/human-check.md`, depois de `commit`) e roda; sem reprodução feita, delega ao `/repro` primeiro. Tabela completa em `pipeline/references/composicao.md`.
**Justificativa:** "às vezes tenho um bug e quero `/repro /card` para criar o card com os passos precisos; depois o dev escolhe `/repro /work` ou só `/work`". O precedente é o `/vac` (`Skill(skill, args)` + "superposição, nunca edição"); o que faltava era a regra de direção, porque aqui a ordem é livre.
**Alternativas descartadas:** *(a)* união comutativa abstrata ("`⊕`") — correta no resultado, mas não dizia quem roda primeiro, e `/repro /card` exige que a reprodução venha antes; *(b)* modificador como hook dentro do loop — o loop passaria a conhecer modificadores, e o `/repro` sozinho precisaria de um alvo fictício.

### D-27 — Estratificação: motor não invoca skill que declara alvo (refina D-16, D-23)
**Decisão:** `skill → reconcile → motor → borda`, sem retorno; **nenhum motor invoca `/work`, `/pull-request`, `/homolog`, `/prod`, `/repro` ou `/card`**. Consequência executável: cada estágio precisa de motor próprio — nascem `work-cycle.md` (era o corpo do `/work`), `pr-publish.md` (era o corpo do `/pull-request`) e `promote.md` (era o Step 2 do `/prod`); `branch.md` sai de `work/references/`. As quatro skills-alvo viram **declaração pura** (frontmatter · Iron Law · HARD-GATE · Step 0 · alvo · saída · red flags), como `/homolog` e `/prod` já eram. Na borda só entram `/method`, `/todo` e `/infra`.
**Justificativa:** se o loop do `/prod` invocasse o `/work` para fechar `commit`, o `/work` abriria o próprio loop dentro do primeiro — recursão sem regra que a impeça. D-23 já dizia "motor de gap não invoca motor de gap"; falta era dizer o mesmo de skill.
**Alternativas descartadas:** o alvo invocar o alvo anterior "porque a faixa é prefixo" — funciona por acaso e quebra no primeiro modificador.

### D-28 — Sede neutra: `furi-ship:pipeline` (revisa D-15)
**Decisão:** os motores saem de `prod/references/` para `pipeline/references/`, numa skill interna que só os hospeda. Os quatro alvos declaram `requires: pipeline`.
**Justificativa:** D-15 escolheu `/prod` por ser "a única presente nas duas topologias". Com quatro alvos, `/work` leria da pasta do `/prod` para fechar um commit local. A objeção "skill que ninguém invoca" caiu com o padrão de skill interna (`user-invocable: false` + `requires` obrigatório, check do validador).
**Alternativas descartadas:** manter em `prod/references/` — zero movimentação, mas a hospedagem é o que produzia o ciclo `homolog ↔ prod`.

### D-29 — O pipeline nunca cria card sozinho (revisa a tabela de destinos do `findings.md`)
**Decisão:** `findings.md` (classes A e B) e `scope-split.md` deixam de invocar o `/card`. Achado e excedente vão para `kanban/08-code-review/<feature>.md § Achados do review` e para o relatório final — com a **prova** e a marca "candidato a card" — e o usuário abre, se quiser, com `/card`. As classes e as provas exigidas não mudam.
**Justificativa:** "nenhum do processo work→prod deve acionar `/card` sozinho". A prova continua sendo a régua — é o que torna a linha do relatório um card de cinco segundos quando o usuário decidir.
**Alternativas descartadas:** perguntar antes de cada card — o review pararia no meio pela atenção do usuário; manter só a classe A automática — exceção que reabre a porta.

### D-30 — `dev`/`main` é padrão, não lei
**Decisão:** nenhum motor nem skill escreve `dev`/`main` como nome de branch: `<integração>` e `<produção>` são detectados por `deploy-context.md` § 1 (evidência 0: o `deploy.md` já gravado; 2: `dev develop staging homolog homologacao`; produção: `main master production`) e gravados no `deploy.md § Ambientes` — é o "registrar no setup" do pedido, na pasta `ship-setup/`. `Abre PR: não` ⇒ o estágio `pr` não existe e o loop vai do `commit` ao push direto na integração e ao deploy.
**Justificativa:** "o padrão do nosso sistema é `dev`, mas pode ter projetos com outros nomes". Já era detectado (D-07); faltava parar de escrever `dev` nos templates e nas tabelas de alvo, e ampliar a evidência 2.
**Alternativas descartadas:** campo `Integração:` no `setup.md` — segundo dono para um fato que o `deploy.md` já grava (D-02 do setup-infra).
