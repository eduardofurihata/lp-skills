# Reconcile — o loop que leva o trabalho de onde está até o alvo

> **A porta única.** Os quatro alvos — `/work`, `/pull-request`, `/homolog`, `/prod` — declaram **até que estágio** vão e entregam a este loop. Nenhum deles invoca motor direto, e nenhum motor invoca outro motor de gap — a direção é `skill → reconcile → motor → borda`, sem retorno. Na borda, skill externa é **invocada via Skill tool** — `furi-build:method`, `furi-build:todo` (do `furi-build`, dependência declarada do `furi-ship`) e `furi-ship:infra` (mesmo pacote) — chamada real, nunca reproduzida de memória. **Nenhum motor invoca uma skill que declara alvo** (`/work`, `/pull-request`, `/homolog`, `/prod`) nem um modificador (`/repro`, `/card`): é o que impede a escada de reabrir do começo dentro dela mesma.

**Responsabilidade única:** rodar `diagnosticar → aplicar o motor do estágio aberto → re-diagnosticar` até que todo estágio **até o alvo** esteja fechado.

## Iron Law

> **O eixo é o ESTÁGIO ABERTO, não a etapa que o usuário acha que está.** A pergunta nunca é "que PR está aberto?" nem "já rodei o `/work`?" — é **"onde este trabalho está, e o que falta para chegar ao alvo?"**. Um card pode estar mergeado e fora do ar (run vermelho, env var faltando); pode estar commitado e ninguém ter pushado; pode estar no ar em homolog e nunca ter sido promovido. Nada disso aparece num `git log`. Skill que começa pela etapa em vez do estado é cega para o caso mais comum e mais silencioso.
>
> **Estado desejado − estado atual = o trabalho.** E o alvo só está atingido quando o **último** estágio da faixa fecha, provado pelo sinal observável dele.

## A escada — os estágios, na ordem canônica

```
card? → branch → reprodução? → commit → push → pr? → integrado
      → [homolog: publicado → configurado → verificado]
      → «GATE» → promovido?
      → [prod:    publicado → configurado → verificado]
```

`?` = **condicional**: existe só quando o projeto ou o modificador o pede. Estágio ausente não vira `if` no loop — ele simplesmente não está na lista que o alvo entrega, e a faixa termina no anterior presente.

| Estágio | Existe quando | Sinal observável de FECHADO | Motor que fecha |
|---|---|---|---|
| **card** | `/card` compôs **e** `Rastreamento: Jira` | `jira_get_issue <KEY>-<N>` devolve a issue, status ≠ concluído | ninguém aqui: o `/card` **rodou antes** e delegou ao alvo com a key (`composicao.md`) — chega fechado; aberto = o loop reporta, nunca cria |
| **branch** | sempre | `git branch --show-current` é a branch que `branch.md` manda para este card e este setup · `git rev-list --left-right --count origin/<integração>...HEAD` → coluna da esquerda `0` (não está atrás) · se `origin/<branch>` existe, idem contra ela | `branch.md` |
| **reprodução** | `/repro` compôs | o bug foi reproduzido na superfície certa com nota ≥ 90 **e o usuário viu** (parada 1) — nesta conversa, ou no registro `docs/jira/todo/<KEY>-<N>.md` | ninguém aqui: o `/repro` **rodou antes** e delegou (`composicao.md`) — chega fechado; aberto = o alvo devia ter delegado ao `/repro`, e o loop reporta |
| **commit** | sempre | `git status --porcelain` vazio · `git log origin/<integração>..HEAD --no-merges` tem o trabalho do objetivo · `kanban/10-done/<feature>.md` existe com `tests: passed` | `work-cycle.md` → `/method` na borda |
| **push** | sempre | `git rev-parse HEAD` == `git rev-parse origin/<branch>` | `pr-publish.md` |
| **pr** | § PR `Abre PR: sim` | `gh pr list --head <branch> --base <integração> --state open --json number,url` → exatamente 1, com `## Cards` cobrindo todas as keys dos commits | `pr-publish.md` |
| **integrado** | sempre | `git merge-base --is-ancestor <HEAD da branch> origin/<integração>` sai 0 · com PR: `gh pr view <n> --json state` → `MERGED`, branch deletada (remota **e** local) · `kanban/08-code-review/<feature>.md` existe | `pr-cycle.md` (review · QA · aprovação · merge — ou rejeição) |
| **publicado@\<amb\>** | o ambiente existe no `deploy.md § Ambientes` | `deploy-run.md` → **verde** com `headSha` cobrindo o HEAD de `origin/<branch do ambiente>` | `deploy-run.md` |
| **configurado@\<amb\>** | idem | `env-config.md` → `pendentes[]` vazio para o `## DevOps` de tudo que entrou desde o último verificado | `env-config.md` |
| **verificado@\<amb\>** | idem | `smoke.md` → todos os cards no ar desde o último smoke verde passam na URL do ambiente | `smoke.md` |
| **promovido** | duas branches (`<integração>` ≠ `<produção>`) | `git rev-list --count origin/<produção>..origin/<integração>` → `0` e `git rev-parse origin/<integração>` == `git rev-parse origin/<produção>` | `promote.md` — atrás do **GATE** |

`<integração>` e `<produção>` são **detectados** por `deploy-context.md` § 1 e lidos do `deploy.md § Ambientes` — nunca escritos como `dev`/`main` aqui ou em skill nenhuma. `dev`/`main` é só o nosso padrão de quem nunca detectou.

**Duas naturezas de motor** (D-23): **motores de estágio** — `branch` · `work-cycle` · `pr-publish` · `pr-cycle` · `deploy-run` · `env-config` · `smoke` · `promote` — fecham um estágio e são invocados **só por este loop**; nenhum deles invoca outro motor de estágio. **Motores de apoio** — `deploy-context` · `jira-sync` · `findings` · `scope-split` · `composicao` — não decidem fluxo e podem ser chamados por quem precisar.

## O alvo — o que a skill declara

| Campo | O que é |
|---|---|
| `atéOEstágio` | o último estágio que este alvo tem de fechar. É o **único** campo que distingue os quatro alvos |
| `ambiente` | `—`, `homolog` ou `prod`. `—` não é `if`: os estágios de ambiente ficam fora da faixa |
| `branch` | onde o trabalho tem de estar quando o alvo fecha — a de trabalho, `<integração>` ou `<produção>` |
| `fonteDoDelta` | o **objetivo**: o card (`KEY-N`), ou o trabalho que já está na árvore/branch quando não há card |
| `gate` | `{antesDe: <estágio>}` ou `—`. Autorização explícita **ao chegar** naquele estágio — não na entrada do loop |
| `paradas[]` | `{âncora: <estágio>, posição: antes|depois, protocolo: <arquivo>}` — vazio por padrão; os modificadores acrescentam |

**Os alvos**, nas duas topologias (`<integração>` e `<produção>` detectados):

| | `/work` | `/pull-request` | `/homolog` | `/prod` — duas branches | `/prod` — branch única |
|---|---|---|---|---|---|
| `atéOEstágio` | `commit` | `pr` (ou `push`, sem PR) | `verificado@homolog` | `verificado@prod` | `verificado@prod` |
| `ambiente` | — | — | homolog | prod (passa por homolog) | prod |
| `branch` | a de trabalho | a de trabalho | `<integração>` | `<produção>` | `<produção>` (= integração) |
| `fonteDoDelta` | o card × os commits da branch | commits locais fora de `origin/<branch>` | PRs abertos para `<integração>` + commits nela não publicados | o acima + o que está em `<integração>` e não em `<produção>` | PRs abertos para `<produção>` + commits nela não publicados |
| `gate` | — | — | — | `{antesDe: promovido}` | — |

`/homolog` em branch única **não declara alvo**: a skill avisa que não há ambiente intermediário e **sugere** `/prod` — sem invocá-lo (skill-alvo não invoca skill-alvo). `/prod` com homolog já verificado: o diagnóstico mostra tudo fechado até `verificado@homolog` e a faixa efetiva vira `«GATE» → promovido → prod{publicado, configurado, verificado}` — **não é modo especial, é resultado do diagnóstico**.

**Ambiente novo (staging, preview, multi-região) entra como LINHA no `deploy.md § Ambientes`** e como um bloco `[<amb>: publicado → configurado → verificado]` na escada, na posição que a linha diz. Nem o loop, nem os motores, nem as skills mudam. Esse é o único eixo de crescimento previsto; qualquer outro pede decisão nova, não `if` novo.

## Passo 0 — Contexto, topologia e composição

**`deploy-context.md`**, sempre, antes de tudo: topologia detectada, `deploy.md` lido (ou descoberto e escrito) — é dele que saem `<integração>`, `<produção>`, quais ambientes existem, e as URLs. O alvo declarado pela skill é **validado** contra a topologia real — alvo incompatível (`/homolog` em branch única) foi recusado pela própria skill, antes de chegar aqui.

Board e estrutura do Jira: **`/jira`**, no Step 0 de quem chama — devolve `rastreamento` (com `≠ Jira` o estágio `card` não existe e o `jira-sync` é no-op declarado). Convenções do time: **`/setup`**, idem — o `pr-publish` lê daí `Abre PR` (o estágio `pr` existe?), o `pr-cycle` lê `Aprovação` e `Merge`; onde vive cada segredo: `.claude/ship-setup/infra.md`, lido pelo `env-config` (que invoca o `/infra` se o arquivo faltar).

**Composição:** o alvo que chega aqui já é o **alvo efetivo** — a skill invocada aplicou `composicao.md`: os modificadores **já rodaram** (`repro → card → alvo`) e deixaram os estágios `card` e `reprodução` fechados; o que sobra deles é a **parada 2** do `/repro` (`repro/references/human-check.md`, depois de `commit`). Este loop **nunca sabe que modificador existe**: só vê estágios e paradas.

**Montar a faixa:** a lista de estágios deste projeto (os condicionais que existem, na ordem canônica), cortada em `atéOEstágio`. Publique-a junto do diagnóstico.

## Passo 1 — Diagnosticar (e PUBLICAR antes de agir)

Para **cada estágio da faixa**, na ordem, colher o sinal observável da tabela acima — comando real, saída literal — e classificar `fechado` / `aberto` / `ambíguo`. **Não parar no primeiro aberto:** o diagnóstico é da faixa inteira, porque é ele que diz ao usuário o tamanho do trabalho antes de qualquer ação.

Publicar:

```markdown
## Diagnóstico — alvo <nome do alvo> (até `<atéOEstágio>`) · objetivo: <KEY>-<N> | <descrição do trabalho sem card>
| Estágio | Estado | Evidência | Motor |
|---|---|---|---|
| branch | fechado | `git branch --show-current` → `niv-42` · 0 atrás de origin/dev | — |
| commit | fechado | `git status --porcelain` → vazio · kanban/10-done/niv-42.md `tests: passed` | — |
| push | ABERTO | HEAD a1b2c3 ≠ origin/niv-42 (não existe) | pr-publish |
| pr | ABERTO | `gh pr list --head niv-42` → [] | pr-publish |
| integrado | ABERTO | — | pr-cycle |
| publicado@homolog | ABERTO | — | deploy-run |
| configurado@homolog | ABERTO | — | env-config |
| verificado@homolog | ABERTO | — | smoke |
Faixa: 8 estágios · 2 fechados · 6 abertos · paradas: nenhuma · gate: —
```

Estágio **ambíguo** (árvore suja com commits locais; PR fechado com a branch viva; run verde com SHA antigo) não é fechado nem aberto: é **pergunta** ou é a regra do motor — cada motor tem a coluna "ambíguo" dele. Nunca resolva ambiguidade em silêncio.

**Faixa longa** (`/prod` do zero: 10+ estágios abertos) não é erro — é o pedido. Diga o tamanho no diagnóstico (`Faixa: 13 estágios · 11 abertos`) para o usuário saber o que está pedindo antes de o loop começar; ele pode cancelar aqui.

**Tudo fechado** → não mexe em nada e **diz por quê** (Passo 3). Publicar o diagnóstico primeiro é o que torna a skill auditável e cancelável — e é o que permite o relatório final comparar prometido × entregue.

## Passo 2 — Fechar os estágios, na ordem da escada

**A ordem não se atalha:** não se pusha o que não está commitado, não se configura o que não subiu, não se verifica o que não foi configurado. Um estágio só é atacado quando o anterior está **fechado**.

Para o primeiro estágio aberto:

1. **Parada `antes`** ancorada nele? → executa o protocolo da parada (**para e espera o usuário** — é o que a parada é). Só segue com a resposta.
2. **Gate** ancorado nele? → **perguntar, agora**: *"`<integração>` tem `<N>` commit(s) fora de `<produção>`, cobrindo `<cards>`. Quer promover? Isso **publica em produção**, com usuários reais. [sim/não]"* — **Não / silêncio / qualquer coisa que não seja um "sim" explícito** → **PARA**. Nada muda. **Autoridade dita antes não conta** — "sou tech lead", "pode subir sempre", o "sim" da semana passada. A autorização é para **este** release, pedida **ao chegar aqui** — nunca na entrada do loop, onde ela expiraria antes de valer.
3. **Motor do estágio** — o da tabela. Com PR: **um por um**, re-diagnosticando entre eles.
4. **Parada `depois`** ancorada nele? → protocolo, para, espera.
5. **Re-diagnosticar** a faixa inteira.

**Re-diagnosticar depois de cada estágio fechado.** Fechar um estágio muda a realidade — o merge faz a integração andar, o que abre `publicado`; um deploy verde abre `configurado`. Confiar no diagnóstico inicial até o fim é como confiar no `git status` de dez minutos atrás.

**Teto de ~3 passes por estágio.** Não convergiu → **para e reporta** o estágio que resistiu e o que se tentou. É a mesma régua que o `pr-cycle.md` aplica ao loop de conserto: 3 rodadas sem convergir não é detalhe, é sinal de que a causa é outra.

**Jira a cada estágio que o `jira.md` marca `Comenta? sim`** — o motor do estágio chama `jira-sync.md` ao fechar (é o motor de apoio; não decide fluxo). Sem Jira, nada.

## Passo 3 — Fechar

**Toda a faixa fechada** → `jira-sync.md` para cada card no estado final (o rótulo do estágio: "PR: …", "Em homolog: …", "Em produção: …") e o relatório final da skill, comparando o diagnóstico do Passo 1 com o que foi feito — estágio a estágio, com a evidência de cada fechamento.

**Faixa fechada desde o início** → **não faz nada** e explica: *"`<alvo>` já está atingido: `<evidência do último estágio>`. Nada a fazer."* Idempotência é requisito: a skill tem de poder rodar a qualquer momento sem medo, e "nada a fazer" **silencioso** é indistinguível de falha.

**Sem objetivo** (`/prod` numa árvore limpa, sem card, sem commit pendente, tudo no ar) é o mesmo caso: gap zero, dito com a evidência.

**Estágio que resistiu** (parada sem resposta, gate negado, motor sem convergir, `pendentes[]` no `env-config`) → reportar **o que ficou**, por quê, e o que destrava. O alvo **não** é declarado atingido. Meio-caminho relatado como sucesso é o defeito original desta família de skills.

## Red Flags — STOP

- "O usuário digitou `/prod`, então começo pelo deploy" → NÃO. Começa pelo **diagnóstico da faixa inteira**. O trabalho pode estar no commit local — e aí a faixa começa no `push`.
- "Não tem PR aberto, então não há nada a fazer" → NÃO. É **exatamente** o caso central: pode estar na branch e fora do ar, ou commitado e nunca pushado. Diagnostica os estágios.
- "Sei o que fazer, ajo e reporto no fim" → NÃO. O diagnóstico é publicado **antes**. Skill de estado que age às cegas não é auditável nem cancelável.
- "Mergeei o PR, objetivo cumprido" → NÃO. `integrado` é o meio da escada. Faltam publicar, configurar e verificar.
- "O estágio anterior está aberto, então mando o usuário rodar o `/work`" → NÃO. **É esta a mudança.** Estágio aberto na faixa é gap que **este loop fecha** com o motor dele (`work-cycle`, `pr-publish`…). Skill-alvo não devolve trabalho para o usuário fazer noutra skill.
- "O estágio anterior está aberto, então invoco o `/work`" → NÃO. Skill que declara alvo **não é motor**: invocá-la reabre a escada do começo dentro dela mesma. O motor do estágio `commit` é `work-cycle.md`.
- "Pergunto a autorização de prod logo na entrada, para não esquecer" → NÃO. O gate é **ao chegar em `promovido`**. Pedido antes de implementar, a resposta expira antes de valer — e "autoridade dita antes não conta".
- "Configuro enquanto o deploy roda, ganho tempo" → NÃO. A ordem é dependência, não preferência.
- "Diagnostiquei no começo, sigo o plano até o fim" → NÃO. Cada estágio fechado muda a realidade. Re-diagnostica.
- "São 3 PRs, mergeio os três e depois vejo" → NÃO. Um por um, re-diagnosticando.
- "O usuário autorizou o deploy da semana passada" → NÃO vale para sempre. `gate` pergunta a **cada** release, ao chegar no estágio.
- "Branch única não tem gate, então também não precisa de review" → NÃO. O que cai é a **pergunta**. Review, QA e smoke continuam.
- "A parada do `/repro` atrapalha o fluxo, pulo" → NÃO. Parada é o que o modificador **é**. Sem ela, `/repro /prod` seria só `/prod`.
- "Não tem card, então crio um pra rastrear" → NÃO. O estágio `card` só existe quando o usuário compôs `/card`. Sem Jira, o pipeline roda inteiro sem card — nem tudo tem Jira.
- "Está tudo no ar, então não digo nada" → NÃO. Faixa fechada se **declara**, com a evidência. Silêncio parece falha.
- "Um estágio não fechou, mas os outros sim — reporto sucesso" → NÃO. O alvo é a faixa inteira. Diz o que ficou e o que destrava.
- "Tento de novo até passar" → NÃO. Teto de ~3 passes por estágio. Depois disso, a causa não é transitória.
- "Escrevo `dev` e `main` na tabela, todo projeto meu é assim" → NÃO. `<integração>` e `<produção>` vêm do `deploy-context.md` § 1 — o projeto pode chamar de `develop`, `staging`, `homologacao`.
- "Sei o que o `/method` (ou o `/todo`, o `/infra`) faz, rodo de cabeça" → NÃO. Mencionar não é invocar: skill de borda entra pelo Skill tool, **toda** vez.
