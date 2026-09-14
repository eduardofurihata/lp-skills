---
name: pipeline
description: 'The single home of the furi-ship delivery engines — read by path, never typed. Hosts the staircase every ship target walks (card → branch → reproduction → commit → push → pr → integrated → published → configured → verified → promoted), the target contract that `/work`, `/pull-request`, `/homolog` and `/prod` declare, the composition table that lets `/repro` and `/card` modify any target in any order, and the engines that close each stage: `reconcile` (the loop), `branch`, `work-cycle`, `pr-publish`, `pr-cycle`, `promote`, `deploy-context`, `deploy-run`, `env-config`, `smoke`, plus the support engines `jira-sync`, `findings`, `scope-split` and `composicao`. Internal (`user-invocable: false`): the four target skills list it in `requires` and read the `§ <engine>` sections of `pipeline/SKILL.md`; no engine invokes a skill that declares a target.'
effort: max
user-invocable: false
---

# pipeline — a sede dos motores de entrega

Skill **interna**: ninguém a digita e ninguém a invoca. Existe para dar aos motores uma casa que não é de nenhum dos quatro alvos — antes eles moravam dentro do `/prod`, e o `/work` lia da pasta do `/prod` para fechar um commit local. Os alvos declaram `requires: pipeline` e leem as seções `§ <motor>` deste arquivo por caminho (mesmo pacote resolve no cache instalado).

## Um pipeline, quatro alvos, dois modificadores

```
   modificadores — a ordem digitada é livre; a de execução é fixa: repro → card → alvo
   ┌─────────┐                          ┌──────────┐
   │  /card  │ cria o card, delega      │  /repro  │ reproduz, o dev vê o bug, delega;
   └────┬────┘ com a key                └────┬─────┘ o dev vê o conserto depois do commit
        │                                    │
        ▼                                    ▼
  ═══════════════════ UM PIPELINE ═══════════════════
   card? → branch → reprodução? → commit → push → pr? → integrado
         → [homolog: publicado → configurado → verificado]
         → «GATE» → promovido?
         → [prod:    publicado → configurado → verificado]
              ▲                 ▲                        ▲                          ▲
            /work         /pull-request              /homolog                    /prod

   os estágios que existem são os que o projeto tem: Abre PR (setup) · ambientes e branches (deploy.md) · Rastreamento (setup)
```

Cada **alvo** faz três coisas e nada mais: **Step 0** (`/jira`, `/setup`, § deploy-context, § composicao) → **declara até que estágio vai** → **entrega ao § reconcile**, que diagnostica a faixa inteira, publica o diagnóstico, fecha os estágios abertos na ordem com o motor de cada um, re-diagnostica a cada um, e para no estágio do alvo. Um alvo nunca manda o usuário "rodar outra skill antes": estágio aberto é gap que o loop fecha.

Cada **modificador** roda a própria parte antes e delega ao alvo com os verbos restantes — § composicao é a tabela de quem roda o quê.

## Os motores

| Seção | Natureza | Fecha o estágio | Lido por |
|---|---|---|---|
| § reconcile | **o loop** | todos, na ordem | os quatro alvos |
| § composicao | apoio | — (quem roda o quê, antes do loop) | alvos e modificadores |
| § deploy-context | apoio | — (topologia, `<integração>`/`<produção>`, `deploy.md`) | todos |
| § branch | estágio | `branch` | reconcile · `/repro` sozinho |
| § work-cycle | estágio | `commit` → `/method` na borda | reconcile |
| § pr-publish | estágio | `push`, `pr` | reconcile |
| § pr-cycle | estágio | `integrado` (review · QA pendente via `/method` · aprovação · merge — ou rejeição) | reconcile |
| § deploy-run | estágio | `publicado@<amb>` | reconcile |
| § env-config | estágio | `configurado@<amb>` → `/infra` na borda, se falta o `infra.md` | reconcile |
| § smoke | estágio | `verificado@<amb>` | reconcile |
| § promote | estágio | `promovido` (atrás do gate) | reconcile |
| § jira-sync | apoio | — (comenta e transiciona pelo `jira.md` do projeto) | os motores de estágio |
| § findings · § scope-split | apoio | — (classificam e registram; **nunca criam card**) | `pr-cycle` |

Cada motor é uma seção `##` deste arquivo — `grep -n '^## ' pipeline/SKILL.md` lista todas.

**Regra de estratificação:** `skill → reconcile → motor → borda`, sem retorno. Motor de estágio é invocado só pelo loop e não invoca outro motor de estágio. **Nenhum motor invoca uma skill que declara alvo nem um modificador** — na borda só entram `/method` (furi-build) e `/infra`. É o que impede a escada de reabrir do começo dentro dela mesma.

## O que muda quando o projeto muda

| O projeto… | Onde está declarado/detectado | Efeito na escada |
|---|---|---|
| sobe por push, sem PR | `setup.md § PR → Abre PR: não` | o estágio `pr` não existe; `pr-cycle` revisa os commits na integração |
| não tem ambiente de homolog (branch única) | `deploy.md § Ambientes` (uma linha) | os estágios de homolog e `promovido` não existem; `/homolog` avisa e sugere `/prod` |
| integra em `develop`, produz em `master` | `deploy.md § Ambientes` (detectado por § deploy-context, passo 1, gravado) | nada muda — os motores escrevem `<integração>`/`<produção>` |
| não tem Jira | `setup.md § Jira → Rastreamento` | o estágio `card` não existe, `/card` recusa, `jira-sync` é no-op declarado |
| ganha um ambiente (staging, preview) | mais uma linha no `deploy.md § Ambientes` | mais um bloco `[amb: publicado → configurado → verificado]` na escada; nenhum motor muda |

## reconcile

> **A porta única.** Os quatro alvos — `/work`, `/pull-request`, `/homolog`, `/prod` — declaram **até que estágio** vão e entregam a este loop. Nenhum deles invoca motor direto, e nenhum motor invoca outro motor de gap — a direção é `skill → reconcile → motor → borda`, sem retorno. Na borda, skill externa é **invocada via Skill tool** — `furi-build:method` (do `furi-build`, dependência declarada do `furi-ship`) e `furi-ship:infra` (mesmo pacote) — chamada real, nunca reproduzida de memória. **Nenhum motor invoca uma skill que declara alvo** (`/work`, `/pull-request`, `/homolog`, `/prod`) nem um modificador (`/repro`, `/card`): é o que impede a escada de reabrir do começo dentro dela mesma.

**Responsabilidade única:** rodar `diagnosticar → aplicar o motor do estágio aberto → re-diagnosticar` até que todo estágio **até o alvo** esteja fechado.

### Iron Law

> **O eixo é o ESTÁGIO ABERTO, não a etapa que o usuário acha que está.** A pergunta nunca é "que PR está aberto?" nem "já rodei o `/work`?" — é **"onde este trabalho está, e o que falta para chegar ao alvo?"**. Um card pode estar mergeado e fora do ar (run vermelho, env var faltando); pode estar commitado e ninguém ter pushado; pode estar no ar em homolog e nunca ter sido promovido. Nada disso aparece num `git log`. Skill que começa pela etapa em vez do estado é cega para o caso mais comum e mais silencioso.
>
> **Estado desejado − estado atual = o trabalho.** E o alvo só está atingido quando o **último** estágio da faixa fecha, provado pelo sinal observável dele.

### A escada — os estágios, na ordem canônica

```
card? → branch → reprodução? → commit → push → pr? → integrado
      → [homolog: publicado → configurado → verificado]
      → «GATE» → promovido?
      → [prod:    publicado → configurado → verificado]
```

`?` = **condicional**: existe só quando o projeto ou o modificador o pede. Estágio ausente não vira `if` no loop — ele simplesmente não está na lista que o alvo entrega, e a faixa termina no anterior presente.

| Estágio | Existe quando | Sinal observável de FECHADO | Motor que fecha |
|---|---|---|---|
| **card** | `/card` compôs **e** `Rastreamento: Jira` | `jira_get_issue <KEY>-<N>` devolve a issue, status ≠ concluído | ninguém aqui: o `/card` **rodou antes** e delegou ao alvo com a key (§ composicao) — chega fechado; aberto = o loop reporta, nunca cria |
| **branch** | sempre | `git branch --show-current` é a branch que § branch manda para este card e este setup · `git rev-list --left-right --count origin/<integração>...HEAD` → coluna da esquerda `0` (não está atrás) · se `origin/<branch>` existe, idem contra ela | § branch |
| **reprodução** | `/repro` compôs | o bug foi reproduzido na superfície certa com nota ≥ 90 **e o usuário viu** (parada 1) — nesta conversa, ou no registro `docs/jira/todo/<KEY>-<N>.md` | ninguém aqui: o `/repro` **rodou antes** e delegou (§ composicao) — chega fechado; aberto = o alvo devia ter delegado ao `/repro`, e o loop reporta |
| **commit** | sempre | `git status --porcelain` vazio · `git log origin/<integração>..HEAD --no-merges` tem o trabalho do objetivo · `kanban/10-done/<feature>.md` existe com `tests: passed` | § work-cycle → `/method` na borda |
| **push** | sempre | `git rev-parse HEAD` == `git rev-parse origin/<branch>` | § pr-publish |
| **pr** | § PR `Abre PR: sim` | `gh pr list --head <branch> --base <integração> --state open --json number,url` → exatamente 1, com `## Cards` cobrindo todas as keys dos commits | § pr-publish |
| **integrado** | sempre | `git merge-base --is-ancestor <HEAD da branch> origin/<integração>` sai 0 · com PR: `gh pr view <n> --json state` → `MERGED`, branch deletada (remota **e** local) · `kanban/08-code-review/<feature>.md` existe | § pr-cycle (review · QA · aprovação · merge — ou rejeição) |
| **publicado@\<amb\>** | o ambiente existe no `deploy.md § Ambientes` | § deploy-run → **verde** com `headSha` cobrindo o HEAD de `origin/<branch do ambiente>` | § deploy-run |
| **configurado@\<amb\>** | idem | § env-config → `pendentes[]` vazio para o `## DevOps` de tudo que entrou desde o último verificado | § env-config |
| **verificado@\<amb\>** | idem | § smoke → todos os cards no ar desde o último smoke verde passam na URL do ambiente | § smoke |
| **promovido** | duas branches (`<integração>` ≠ `<produção>`) | `git rev-list --count origin/<produção>..origin/<integração>` → `0` e `git rev-parse origin/<integração>` == `git rev-parse origin/<produção>` | § promote — atrás do **GATE** |

`<integração>` e `<produção>` são **detectados** por § deploy-context, passo 1 e lidos do `deploy.md § Ambientes` — nunca escritos como `dev`/`main` aqui ou em skill nenhuma. `dev`/`main` é só o nosso padrão de quem nunca detectou.

**Duas naturezas de motor** (D-23): **motores de estágio** — `branch` · `work-cycle` · `pr-publish` · `pr-cycle` · `deploy-run` · `env-config` · `smoke` · `promote` — fecham um estágio e são invocados **só por este loop**; nenhum deles invoca outro motor de estágio. **Motores de apoio** — `deploy-context` · `jira-sync` · `findings` · `scope-split` · `composicao` — não decidem fluxo e podem ser chamados por quem precisar.

### O alvo — o que a skill declara

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

### Passo 0 — Contexto, topologia e composição

**§ deploy-context**, sempre, antes de tudo: topologia detectada, `deploy.md` lido (ou descoberto e escrito) — é dele que saem `<integração>`, `<produção>`, quais ambientes existem, e as URLs. O alvo declarado pela skill é **validado** contra a topologia real — alvo incompatível (`/homolog` em branch única) foi recusado pela própria skill, antes de chegar aqui.

Board e estrutura do Jira: **`/jira`**, no Step 0 de quem chama — devolve `rastreamento` (com `≠ Jira` o estágio `card` não existe e o `jira-sync` é no-op declarado). Convenções do time: **`/setup`**, idem — o `pr-publish` lê daí `Abre PR` (o estágio `pr` existe?), o `pr-cycle` lê `Aprovação` e `Merge`; onde vive cada segredo: `.claude/ship-setup/infra.md`, lido pelo `env-config` (que invoca o `/infra` se o arquivo faltar).

**Composição:** o alvo que chega aqui já é o **alvo efetivo** — a skill invocada aplicou § composicao: os modificadores **já rodaram** (`repro → card → alvo`) e deixaram os estágios `card` e `reprodução` fechados; o que sobra deles é a **parada 2** do `/repro` (`repro/SKILL.md` § Human Check, depois de `commit`). Este loop **nunca sabe que modificador existe**: só vê estágios e paradas.

**Montar a faixa:** a lista de estágios deste projeto (os condicionais que existem, na ordem canônica), cortada em `atéOEstágio`. Publique-a junto do diagnóstico.

### Passo 1 — Diagnosticar (e PUBLICAR antes de agir)

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

### Passo 2 — Fechar os estágios, na ordem da escada

**A ordem não se atalha:** não se pusha o que não está commitado, não se configura o que não subiu, não se verifica o que não foi configurado. Um estágio só é atacado quando o anterior está **fechado**.

Para o primeiro estágio aberto:

1. **Parada `antes`** ancorada nele? → executa o protocolo da parada (**para e espera o usuário** — é o que a parada é). Só segue com a resposta.
2. **Gate** ancorado nele? → **perguntar, agora**: *"`<integração>` tem `<N>` commit(s) fora de `<produção>`, cobrindo `<cards>`. Quer promover? Isso **publica em produção**, com usuários reais. [sim/não]"* — **Não / silêncio / qualquer coisa que não seja um "sim" explícito** → **PARA**. Nada muda. **Autoridade dita antes não conta** — "sou tech lead", "pode subir sempre", o "sim" da semana passada. A autorização é para **este** release, pedida **ao chegar aqui** — nunca na entrada do loop, onde ela expiraria antes de valer.
3. **Motor do estágio** — o da tabela. Com PR: **um por um**, re-diagnosticando entre eles.
4. **Parada `depois`** ancorada nele? → protocolo, para, espera.
5. **Re-diagnosticar** a faixa inteira.

**Re-diagnosticar depois de cada estágio fechado.** Fechar um estágio muda a realidade — o merge faz a integração andar, o que abre `publicado`; um deploy verde abre `configurado`. Confiar no diagnóstico inicial até o fim é como confiar no `git status` de dez minutos atrás.

**Teto de ~3 passes por estágio.** Não convergiu → **para e reporta** o estágio que resistiu e o que se tentou. É a mesma régua que o § pr-cycle aplica ao loop de conserto: 3 rodadas sem convergir não é detalhe, é sinal de que a causa é outra.

**Jira a cada estágio que o `jira.md` marca `Comenta? sim`** — o motor do estágio chama § jira-sync ao fechar (é o motor de apoio; não decide fluxo). Sem Jira, nada.

### Passo 3 — Fechar

**Toda a faixa fechada** → § jira-sync para cada card no estado final (o rótulo do estágio: "PR: …", "Em homolog: …", "Em produção: …") e o relatório final da skill, comparando o diagnóstico do Passo 1 com o que foi feito — estágio a estágio, com a evidência de cada fechamento.

**Faixa fechada desde o início** → **não faz nada** e explica: *"`<alvo>` já está atingido: `<evidência do último estágio>`. Nada a fazer."* Idempotência é requisito: a skill tem de poder rodar a qualquer momento sem medo, e "nada a fazer" **silencioso** é indistinguível de falha.

**Sem objetivo** (`/prod` numa árvore limpa, sem card, sem commit pendente, tudo no ar) é o mesmo caso: gap zero, dito com a evidência.

**Estágio que resistiu** (parada sem resposta, gate negado, motor sem convergir, `pendentes[]` no `env-config`) → reportar **o que ficou**, por quê, e o que destrava. O alvo **não** é declarado atingido. Meio-caminho relatado como sucesso é o defeito original desta família de skills.

### Red Flags — STOP

- "O usuário digitou `/prod`, então começo pelo deploy" → NÃO. Começa pelo **diagnóstico da faixa inteira**. O trabalho pode estar no commit local — e aí a faixa começa no `push`.
- "Não tem PR aberto, então não há nada a fazer" → NÃO. É **exatamente** o caso central: pode estar na branch e fora do ar, ou commitado e nunca pushado. Diagnostica os estágios.
- "Sei o que fazer, ajo e reporto no fim" → NÃO. O diagnóstico é publicado **antes**. Skill de estado que age às cegas não é auditável nem cancelável.
- "Mergeei o PR, objetivo cumprido" → NÃO. `integrado` é o meio da escada. Faltam publicar, configurar e verificar.
- "O estágio anterior está aberto, então mando o usuário rodar o `/work`" → NÃO. **É esta a mudança.** Estágio aberto na faixa é gap que **este loop fecha** com o motor dele (`work-cycle`, `pr-publish`…). Skill-alvo não devolve trabalho para o usuário fazer noutra skill.
- "O estágio anterior está aberto, então invoco o `/work`" → NÃO. Skill que declara alvo **não é motor**: invocá-la reabre a escada do começo dentro dela mesma. O motor do estágio `commit` é § work-cycle.
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
- "Escrevo `dev` e `main` na tabela, todo projeto meu é assim" → NÃO. `<integração>` e `<produção>` vêm do § deploy-context, passo 1 — o projeto pode chamar de `develop`, `staging`, `homologacao`.
- "Sei o que o `/method` (ou o `/infra`) faz, rodo de cabeça" → NÃO. Mencionar não é invocar: skill de borda entra pelo Skill tool, **toda** vez.

## composicao

> **Motor de apoio.** Lido pela skill que o usuário digitou, **antes** de qualquer outra coisa. O loop (§ reconcile) nunca vê um modificador: só vê o **alvo efetivo** — estágios e paradas já fundidos.

**Responsabilidade única:** dado o verbo digitado e o `$ARGUMENTS`, dizer **quem roda agora**, **o que faz** e **a quem delega**.

### Os verbos — lista fechada

```
ALVOS         = work · pull-request · homolog · prod        (declaram até onde vão; faixas aninhadas: prod ⊃ homolog ⊃ pull-request ⊃ work)
MODIFICADORES = repro · card                                 (acrescentam um estágio e/ou paradas)
VERBO         = token do $ARGUMENTS que casa ^/(work|pull-request|homolog|prod|repro|card)$
```

O resto do `$ARGUMENTS` (a key, a descrição, `finish`) é o **objetivo**, e passa adiante intacto. Só esses seis tokens são composição; `/method` e qualquer outra barra não são verbos deste pipeline.

### A ordem de execução é FIXA: `repro` → `card` → alvo

Não importa a ordem digitada. Cada camada **roda a própria parte** e **delega à seguinte** via Skill tool, com os verbos que sobram no argumento — chamada real, nunca "seguir de memória":

| Camada | O que faz | Por que nessa posição |
|---|---|---|
| **`/repro`** | reproduz na superfície certa (nota ≥ 90), o usuário **vê o bug** (parada 1), e a reprodução fica na conversa | a reprodução **alimenta** o card (`## Como testar` com os passos observados) e o `/method` (o cenário é o TC de referência) — tem de vir antes dos dois |
| **`/card`** | cria o card no Jira — com os passos da reprodução, se houve — e devolve a key | a key **nomeia a branch**; sem card não há estágio `card`, e o alvo recebe a key pronta |
| **alvo** | monta o alvo efetivo (base + o que os modificadores acrescentaram) e entrega ao `reconcile` | é o único que roda o loop |

`Skill(skill: "<próxima camada>", args: "<os verbos restantes> <objetivo>")` — cada camada **tira só o próprio verbo** do argumento.

### O que cada modificador deixa para o alvo

| Modificador | Estágio na escada | Como o alvo o vê | Parada que acrescenta |
|---|---|---|---|
| `/card` | `card`, antes de `branch` | já **fechado**: a key chegou no argumento | nenhuma |
| `/repro` | `reprodução`, entre `branch` e `commit` | já **fechado** se a parada 1 foi confirmada nesta conversa (ou está no registro `docs/jira/todo/<KEY>-<N>.md`); senão **aberto** → o alvo delega ao `/repro` antes de rodar | **parada 2**: `{âncora: commit, posição: depois, protocolo: repro/SKILL.md § Human Check}` — o usuário **vê o conserto** |

A **parada 1** (vê o bug) não é hook: é o critério de fechamento do estágio `reprodução`, e acontece dentro do `/repro`. Só a parada 2 é ancorada em outro estágio. Um tipo de hook, não dois.

### A tabela — quem roda o quê

| Eu sou | O argumento traz | O que faço |
|---|---|---|
| alvo | só o objetivo | monto `base(eu)` e entrego ao `reconcile` |
| alvo | `/repro` com a reprodução **já feita** nesta conversa (parada 1 confirmada) | fundo a parada 2, tiro `/repro`, entrego ao `reconcile` |
| alvo | `/repro` sem reprodução feita | delego: `Skill(skill: "repro", args: "/<eu> <os outros verbos> <objetivo>")` — e **não rodo** |
| alvo | `/card` (sem `/repro` pendente) | delego: `Skill(skill: "card", args: "/<eu> <objetivo>")` — e **não rodo** |
| alvo | outro alvo | vence o **mais distante**; se não sou eu: `Skill(skill: "<ele>", args: "<o resto sem o meu verbo>")` — o report diz qual venceu |
| `/repro` | só o objetivo | reproduzo, parada 1, **encerro** — digo o que vem depois sem invocar: `/repro /work <obj>` para corrigir · `/card` para virar card |
| `/repro` | `/card` e/ou alvo | reproduzo, parada 1, delego: `Skill(skill: "card", …)` se há `/card`, senão `Skill(skill: "<alvo>", args: "/repro <objetivo>")` |
| `/card` | só o objetivo | crio o card, **encerro** — digo `/work <KEY>-<N>` sem invocar |
| `/card` | alvo | crio o card, delego: `Skill(skill: "<alvo>", args: "<verbos restantes> <KEY>-<N>")` |
| `/card` | `/repro` sem reprodução feita | delego ao `/repro` primeiro: `Skill(skill: "repro", args: "/card <os outros verbos> <objetivo>")` |

```
/repro ALK-42              → reproduz · parada 1 · encerra ("para corrigir: /repro /work ALK-42")
/card "login trava"        → cria ALK-43 · encerra ("para trabalhar: /work ALK-43")
/repro /card "login trava" → reproduz · parada 1 · Skill(card, "login trava") → card com os passos observados
/repro /work ALK-42        → reproduz · parada 1 · Skill(work, "/repro ALK-42") → /work funde a parada 2 e roda até commit
/work /repro ALK-42        → /work delega Skill(repro, "/work ALK-42") → igual ao de cima
/repro /prod ALK-42        → reproduz · parada 1 · Skill(prod, "/repro ALK-42") → /prod funde a parada 2 e roda até verificado@prod
/prod /repro ALK-42        → /prod delega Skill(repro, "/prod ALK-42") → igual ao de cima
/card /prod "login trava"  → cria ALK-43 · Skill(prod, "ALK-43") → /prod roda até verificado@prod
/prod /card "login trava"  → /prod delega Skill(card, "/prod login trava") → igual ao de cima
/repro /card /prod "x"     → reproduz · Skill(card, "/repro /prod x") → cria ALK-44 · Skill(prod, "/repro ALK-44") → /prod: reprodução já feita ⇒ funde a parada 2 e roda
/prod /repro /card "x"     → /prod delega Skill(repro, "/card /prod x") → cai no de cima
/work /prod ALK-42         → /work delega Skill(prod, "ALK-42") — o mais distante vence
```

### O que o alvo efetivo carrega para o loop

```
alvo = {
  atéOEstágio, ambiente, branch, fonteDoDelta, gate,      # da base do alvo
  estágios[]  = escada do projeto (os condicionais que existem), cortada em atéOEstágio
  paradas[]   = [parada 2] se /repro compôs, senão []
  objetivo    = o que sobrou do $ARGUMENTS (KEY-N, descrição, finish)
}
```

Publique o alvo efetivo **dentro** do bloco de diagnóstico do `reconcile` Passo 1 (a linha `Faixa: … · paradas: …`) — este pipeline não tem persistência por hook: o chat é o registro, auditável.

### Regras

- **Ordem digitada livre, ordem de execução fixa.** `repro → card → alvo`. Se dois caminhos produzirem resultados diferentes, a tabela está errada — não o usuário.
- **Modificador não roda o pipeline.** Sozinho, faz só a própria parte e encerra. Com alvo, faz a própria parte e delega. Nunca invoca `/method` por conta própria.
- **Skill que declara alvo não invoca skill que declara alvo** — exceto a delegação "vence o mais distante", que acontece **antes** de qualquer loop rodar. Depois que um `reconcile` começou, nenhum outro começa dentro dele.
- **Um alvo delega a um modificador só para trás** (`/repro` não feito, `/card` não criado) — nunca durante o loop.
- **`finish` é do objetivo, não da composição.** Passa adiante intacto; quem o interpreta é a parada (suprime as perguntas opcionais e **nunca** as duas humanas).
- **Sem Jira, `/card` recusa** (`Rastreamento` ≠ Jira, via `/setup`) com o motivo nomeado — e delega ao alvo mesmo assim, sem key: `/card /prod` num repo sem Jira vira `/prod "<descrição>"`, dito em voz alta.

### Red Flags — STOP

- "`/repro /prod` — rodo o `/repro` inteiro, com `/method`, e depois o `/prod`" → NÃO. O `/repro` faz **só a reprodução** e delega; o `/method` roda dentro do loop do `/prod`, uma vez.
- "`/prod /repro` é diferente de `/repro /prod`" → NÃO. Ordem de execução fixa: o `/prod` delega ao `/repro` e o resultado é o mesmo.
- "Recebi `/repro`, a reprodução já foi confirmada nesta conversa, mas delego de novo" → NÃO. Reprodução feita = estágio fechado. Funde a parada 2 e roda. (Delegar de novo é o loop infinito.)
- "Digitaram `/work /prod`, rodo o `/work` e aviso do `/prod`" → NÃO. Vence o mais distante.
- "Vi um `/` no argumento, é composição" → só os seis verbos. `/method`, um caminho de rota, um `/` na descrição do card não são verbos.
- "Fundi o modificador mas esqueci de tirar o verbo do argumento" → NÃO. O objetivo que chega ao loop é limpo: `ALK-42`, não `/repro ALK-42`.
- "O `/card` criou o card e eu, alvo, crio a branch com a key errada" → NÃO. A key chega no argumento da delegação; é ela que o § branch usa.

## deploy-context

> **Fonte única do contexto de deploy.** `/homolog`, `/prod`, `pull-request`, `work` e `repro` (os dois via o motor § branch) perguntam a topologia aqui; ninguém assume `dev`, ninguém chuta comando de deploy.

**Responsabilidade única:** responder *"qual é a topologia deste repositório e como o deploy funciona aqui?"* — lendo o doc do projeto, ou descobrindo e escrevendo-o na primeira vez.

### Iron Law

> **Descobrir uma vez, registrar no projeto, reconferir sempre.** O processo de deploy é conhecimento **do projeto** — versionado, revisável em PR, igual para todo mundo do time. Perguntar de novo a cada invocação é desperdício que o usuário sente; **inventar** URL ou comando é pior: manda a skill agir sobre um ambiente que talvez não exista.

### Contrato

| Entrada | Saída |
|---|---|
| repositório do checkout | `{topologia, ambientes[], comandos, configuração, smoke, rollback, runner}` |

### 1 — Detectar a topologia (SEMPRE, toda invocação)

A integração é a branch **para onde o trabalho converge de fato** — nunca "a que se chama `dev`". `dev` + `main` é só o **nosso padrão**: um projeto pode integrar em `develop`, `staging`, `homologacao` e produzir em `master`. Quatro evidências, nesta ordem; a primeira que responde decide:

```bash
grep -E '^\| (homolog|prod) ' .claude/ship-setup/deploy.md 2>/dev/null     # 0. o doc já registrou os nomes REAIS (gravados numa detecção anterior) — é a evidência, se existir
gh pr list --state all --limit 20 --json baseRefName -q '.[].baseRefName' | sort | uniq -c | sort -rn   # 1. para onde os PRs vão
git ls-remote --heads origin dev develop staging homolog homologacao                                  # 2. uma branch de integração com nome usual existe?
gh repo view --json defaultBranchRef -q .defaultBranchRef.name                                        # 3. a default do GitHub (onde os PRs caem por padrão)
git ls-remote --heads origin main master production                                                   # produção: `main`, senão `master`, senão `production`
```

| Evidência | Integração |
|---|---|
| o `deploy.md` já tem a linha do ambiente com a branch | **ela** — e a evidência 1 só **confirma**; divergiu → § 3, nunca troca em silêncio |
| os PRs recentes miram, em maioria, uma branch | **ela** (`dev`, `develop`, `homolog`, `staging`, `main` — o nome não importa, o uso importa) |
| sem PR que responda, mas uma das usuais existe em `origin` | **ela** — e se existir mais de uma (`dev` e `staging`), **pergunte** qual é a integração; não pegue a primeira |
| nada disso | a **default** do GitHub |

O nome detectado é o que fica **gravado** no `## Ambientes` do doc (§ 2) — é o "registrar no setup" que o pipeline lê nas próximas vezes. A partir daí todo motor escreve `<integração>`/`<produção>` e lê o nome real daqui.

Produção = `main` em `origin`; senão `master`; senão a default. **A default não é produção por definição** — time que abre PR contra `dev` costuma deixar `dev` como default justamente para os PRs caírem nela (caso real: `vibe-nivee`, default `dev`, produção `main`). Integração ≠ produção ⇒ **duas branches**; integração = produção ⇒ **branch única**.

| Topologia | Consequência |
|---|---|
| **duas branches** | `<integração>` = ambiente homolog · `<produção>` = produção; a escada tem os dois blocos de ambiente e o estágio `promovido` |
| **branch única** | único ambiente é **prod**; `/homolog` não trabalha aqui, os estágios de homolog e `promovido` não existem; o `pr-publish` mira `<produção>` |

- **Branch morta não é integração.** Candidata que nenhum PR recente mira e que está **parada** — `git log -1 --format=%ci origin/<b>` há mais de 90 dias, ou `git rev-list --count origin/<b>..origin/<produção>` nas centenas — é legado: reporte e ignore. Caso real: `labzz-afl` tem `origin/homolog` parada desde 2026-04, 4.394 commits atrás da `main`, e 19 dos 20 últimos PRs vão para `main` — é **branch única**.
- **`dev` existe só local, não em `origin`** → conta como **branch única** para efeito de PR e deploy (não há para onde abrir PR remoto). Reporte a existência local, não a promova a integração sozinho.
- Sem `gh` autenticado → só a evidência 2 e a produção por `ls-remote`; diga que a 1 e a 3 não rodaram.
- Topologia é **detectada, nunca declarada** — a mesma regra que o `/method` aplica a escopo de plataforma. Detectada, é comparada com o que o doc registra; divergiu → § 3.

### 2 — O doc do projeto

**`.claude/ship-setup/deploy.md`** — versionado no repositório, na mesma casa do `.claude/ship-setup/setup.md` (convenções do time — `/setup`), do `.claude/ship-setup/infra.md` (mapa da infra — `/infra`) e do `.claude/patterns.md` (padrões de código — `/method` Step 4). É a casa do conhecimento **permanente** do projeto: nada ali é por feature, nada ali é da máquina. Um `.md` solto em `.claude/` não é auto-carregado — só entra quando alguém o lê por caminho, como este motor faz. **Do time ou só meu:** o `/setup` (Step 0 de quem chega aqui) decidiu o modo deste repositório — `setup.md` existe ⇒ este doc é `deploy.md`, versionado; só `setup.local.md` existe ⇒ este doc é **`deploy.local.md`**, fora do git (repositório de um time que não usa este processo). Leitura: `cat .claude/ship-setup/deploy.md 2>/dev/null || cat .claude/ship-setup/deploy.local.md 2>/dev/null`; o do time vence. Se este motor rodar sem o `/setup`, no modo time confira `git check-ignore -v .claude/ship-setup/deploy.md`.

Fronteira com o `infra.md`: **este doc é processo** (como sobe, como checa, como seta, como volta); **o `infra.md` é inventário** (o que existe, sob qual conta, onde vive cada segredo). Onde vive uma variável se lê lá; como setá-la, aqui.

```markdown
# Deploy — <projeto>

## Topologia
duas branches (`<integração>` + `<produção>`) | branch única (`<produção>`)      <!-- os nomes REAIS detectados no § 1 — ex.: `dev` + `main`, `develop` + `master` -->

## Ambientes                <!-- é daqui que o pipeline lê "tem homolog?" e o nome real de cada branch -->
| Ambiente | Branch | URL | Dispara por |
|---|---|---|---|
| homolog | `<integração>` | https://…  | push em `<integração>` → `.github/workflows/<x>.yml` (runner self-hosted) |
| prod    | `<produção>`   | https://…  | push em `<produção>` → `.github/workflows/<y>.yml` (runner self-hosted) |
<!-- branch única: só a linha de prod. Ambiente extra (staging, preview): mais uma linha, na ordem da escada -->

## Como checar          <!-- comandos EXATOS, copiáveis; não descrição -->
gh run list --branch <branch> --limit 5
gh run watch <id> --exit-status

## Configuração         <!-- por ambiente: COMO se seta. ONDE cada segredo vive é o `.claude/ship-setup/infra.md`. Nunca o valor -->
- Env vars / secrets: comando: <como> (ex.: `vercel env add <NOME> production` · `gh secret set <NOME>`) · onde vive cada um: `.claude/ship-setup/infra.md`
- Migrations: <comando>
- Feature flags: <onde/como>
- Seeds: <comando>

## Smoke pós-deploy
- Rotas críticas: /… , /…
- Credenciais de teste: <onde estão> (nunca o valor aqui)

## Rollback
<comando exato>

## Runner
self-hosted em <onde> · como conferir se está online: <comando/observação>
<!-- máquina desligada ⇒ job enfileirado, não falho -->

## Versão no ar (opcional)
<endpoint que devolve o SHA, se o projeto expõe — reforço, não requisito>
```

**Nenhum valor de secret no `deploy.md`, nunca.** O doc diz *onde* a variável vive e *como* setá-la; o valor é pedido na hora (§ env-config). Secret versionado sobrevive a `git rm` e vaza para sempre.

### 3 — Os três caminhos

| Estado | O que fazer |
|---|---|
| **Doc no caminho antigo** (`.claude/deploy.md` — a raiz de `.claude/`, antes da pasta `ship-setup/` — ou `docs/00-context/technical/deploy.md`) e nada em `.claude/ship-setup/deploy.md` | migrar antes de qualquer outra coisa: `mkdir -p .claude/ship-setup && git mv <caminho-antigo> .claude/ship-setup/deploy.md`. Avisar (é arquivo versionado — entra no commit de quem chamou). No modo **só meu** o destino é `deploy.local.md` e o `git mv` vira `git rm --cached` + `mv` (o antigo estava versionado; o novo não fica). Depois, um dos três estados abaixo |
| **Doc existe e confere** com a topologia detectada | ler e seguir. **Zero pergunta.** |
| **Doc não existe** | § 4 — inferir, perguntar o resto, escrever |
| **Doc existe e divergiu** (URL morta, workflow renomeado, `dev` passou a existir, topologia mudou) | reportar **o que mudou**, corrigir o doc (perguntando só o não-derivável) e seguir. **Nunca** seguir com contexto que você sabe estar errado |

### 4 — Descobrir: inferir primeiro, perguntar o mínimo

**Inferir** (e **citar a fonte** de cada item inferido):

| Fonte | O que sai dela |
|---|---|
| `.github/workflows/*.yml` | o que dispara o deploy (`on: push: branches:`), o job, e se `runs-on: self-hosted` |
| `vercel.json` / `.vercel/project.json` / `netlify.toml` | plataforma e nome do projeto |
| `Makefile` / `package.json` scripts | comandos de build, migration, seed |
| `.env.example` / `.env.template` | **quais** variáveis existem (nunca valores) |
| `prisma/migrations/`, `alembic/`, `db/migrate/` | que há migration, e a ferramenta |
| `gh pr list --json baseRefName` · `git ls-remote --heads origin` · `gh repo view --json defaultBranchRef` | a topologia (§ 1) |

**Perguntar** — só o que não é derivável de arquivo nenhum:
- as **URLs** de cada ambiente;
- **como se seta** um secret em cada ambiente (comando ou painel) — *onde vive* cada um não se pergunta aqui: é o `.claude/ship-setup/infra.md` (`/infra`), e se ele não existe é o `env-config` quem o invoca na hora de aplicar;
- as **rotas críticas** do smoke, se não houver rota óbvia;
- **onde está** o runner self-hosted e como conferir se está online.

Apresentar separado, sempre — *"inferi isto (destas fontes); preciso que você confirme aquilo"*. **Zero URL inventada, zero comando chutado.** Não sabe e não perguntou → o campo fica explicitamente vazio no doc, e quem consumir sabe que falta.

Escrever o doc no arquivo do modo — `deploy.md` (avisar que é versionado: entra no commit de quem chamou) ou `deploy.local.md` (avisar que fica fora do git).

### 5 — Como se sabe que o commit está no ar

Sinal primário: **run de deploy verde cujo SHA cobre o HEAD** da branch do ambiente (§ deploy-run). Prova final: **smoke funcional** (§ smoke). Se o projeto expõe versão no ar, use como reforço.

Nenhum projeto é obrigado a expor endpoint de versão por causa desta skill — o run e o smoke bastam.

### Red Flags — STOP

- "Todo projeto meu tem `dev`, assumo" → NÃO. § 1 primeiro, **toda** invocação. Assumir `dev` em branch única é o bug que quebra `/homolog`, `/pull-request` e `/work` de uma vez.
- "Existe uma branch `homolog` no remoto, então é a integração" → NÃO. Nome não é uso: se nenhum PR a mira e ela está parada, é legado. § 1 decide pelos PRs, não pelo nome.
- "O doc já existe, então não confiro a topologia" → NÃO. Reconferir é barato; doc stale manda a skill agir no ambiente errado.
- "Não achei a URL de homolog, chuto pelo padrão do projeto" → NÃO. **Pergunta.** URL inventada = smoke passando em lugar nenhum, ou falhando por engano.
- "Escrevo o valor do secret no doc para não perguntar de novo" → NÃO. **Nunca.** O doc diz onde e como; o valor é pedido na hora.
- "Guardo isso na memória da máquina, como o `/jira`" → NÃO. Board é preferência de quem usa; deploy é conhecimento do time, e tem que ser versionado e revisável.
- "`.claude/` é do Claude, é coisa local, não versiono" → NÃO. `.claude/ship-setup/deploy.md`, `setup.md`, `infra.md` e `patterns.md` são do **time**; só `settings.local.json`, `plans/` e `worktrees/` são pessoais. Está no `.gitignore`? O `/setup` propõe a correção (`.claude/*` + negações) — não mude o doc de lugar.
- "Anoto no `deploy.md` onde vive cada secret, é tudo configuração" → NÃO. Onde vive é inventário (`infra.md`); aqui é o comando de setar. Um fato, um dono.
- "Pergunto tudo, é mais seguro" → NÃO (o oposto). O que está em `.github/workflows/` você **lê**. Perguntar o derivável é a fricção que faz a skill ser abandonada.
- "`dev` existe local, então a topologia é de duas branches" → NÃO. Sem `origin/dev` não há para onde abrir PR nem o que deployar. Reporta a local, não a promove.

## branch

> **Fonte única da mecânica de branch.** **Motor de estágio:** invocado pelo § reconcile quando o estágio `branch` está aberto — para qualquer alvo, e também pelo `/repro` sozinho (que precisa estar na branch certa para reproduzir). Ninguém reescreve o fetch/merge, os três modos, o lote aberto, o nome da branch nem o "manter atualizada". Quem chamou já invocou o `/setup` (modo e nome) — este motor só **aplica**. **Sem card** (`rastreamento` ≠ Jira, ou objetivo sem key): `branch por card`/`acumula cards` usam o slug do objetivo no lugar de `<key>-<n>`; `direto na integração` não muda nada.

**Responsabilidade única:** deixar o checkout na branch de trabalho certa, sincronizada com `origin/<integração>`, antes de qualquer código. Não decide o modo (é do `/setup` § Branch), não descobre a topologia (é do § deploy-context, passo 1 — este motor a consome), não commita, não pusha, não abre PR. O `/method` **nunca cria branch**: a branch nasce aqui.

### Iron Law

> **gh → integração → branch.** Nunca trabalhar sobre integração stale; nunca assumir `dev`; nunca renomear a branch de um lote. Um clone de ontem já é stale. Branch que já existe no `origin` traz o **próprio remoto** antes da integração: o local nunca fica atrás de `origin/<branch>`.

### Contrato

| Entrada | Saída |
|---|---|
| `branch: {modo, nome}` do `/setup` (Step 0 de quem chamou — pedido explícito na sessão vence **para esta invocação** e não reescreve o arquivo) · `<KEY>-<N>` do card (+ slug curto, se o padrão `Nome:` tiver) — ou só o slug do objetivo, sem card · a **integração** resolvida pelo § deploy-context, passo 1 | checkout na branch de trabalho, sincronizada com `origin/<integração>` · `{integração, branch, modo, lote: {aberto, cards[]}, origem: arquivo \| criado agora \| override de sessão}` para o report de quem chamou |

### 1 — gh → integração

A branch de integração vem da **topologia**, nunca assumida — resolvida pelo § deploy-context, passo 1 (base dos PRs recentes → `dev` → default do GitHub; branch parada que nenhum PR mira não conta). Nunca trabalhar sobre integração stale — trazer tudo e resolver conflito antes:
```bash
partida=$(git branch --show-current)   # em `branch acumula cards`, é daqui que se decide o lote (§ 3)
git fetch origin
git checkout <integração>
git merge origin/<integração>   # gh → integração: traz o remoto; CONFLITO → resolver (entender os 2 lados)
```
> **Padrão:** `dev` é a **branch** de integração, o que vem antes da `main`. **homolog** é o **ambiente** publicado a partir dela — nome de ambiente, nunca de branch. "Mergeei na dev" = integrado; "está em homolog" = no ar. Uma branch remota *chamada* `homolog` que nenhum PR mira é legado, não integração.

### 2 — → branch: o modo do setup decide

O que acontece depois vem do **§ Branch do `/setup`** — a lógica mora lá, aqui só se aplica:

| `Trabalho:` no setup | Ação | Branch de trabalho |
|---|---|---|
| `branch por card` | `git checkout -b <nome>` a partir da integração limpa (branch já existe → `checkout` nela **e § 5**: o próprio remoto, depois a integração); `git branch --show-current` confirma | a feature branch |
| `branch acumula cards` | `$partida` é um **lote aberto** (§ 3) → `git checkout $partida` **e § 5** (o próprio remoto, depois a integração — o card entra nela); senão → `git checkout -b <nome>`, como em `branch por card` | a branch do lote |
| `direto na integração` | nenhum `checkout -b` | a própria integração, já sincronizada |

### 3 — Lote aberto

**Lote aberto** = `$partida` não é a integração, tem key no nome, e **nenhum PR dela foi mergeado ou fechado** (`gh pr list --head $partida --state merged --json number` e `--state closed` vazios). PR mergeado encerra o lote: o próximo card nasce em branch nova. Branch sem PR ainda também é lote aberto.

Os cards do lote **não são anotados em lugar nenhum**: são os commits da branch desde a integração (subject + trailer `Jira:`, sem merges) — a mesma derivação que o `/pull-request` usa para o título e o `## Cards`. É isso que sai em `lote.cards[]` para o report de quem chamou.

### 4 — Nome da branch

O padrão `Nome:` do setup, com `<key>`/`<n>`/`<slug>` do card — a **caixa do placeholder é a do nome** (`<key>-<n>` → `niv-12`; `<KEY>-<n>` → `AV-2192`; `-slug` curto, se o padrão tiver). Em `branch acumula cards` o nome é o do **1º card e não muda**: os cards do lote são os **commits** da branch — cada um com a key do **seu** card (o Step 10 do `/method` a põe no commit, com a key que quem chamou passou como argumento) — e é deles que o `/pull-request` deriva o título e o `## Cards` do PR. Renomear a branch a cada card não linka nada no Jira (o parser exige a key completa: em `AV-2192-2218` ele lê só `AV-2192`) e quebra preview URL, clone e worktree.

### 5 — Manter a branch atualizada (gh → branch → integração)

`branch por card` e `branch acumula cards`: a branch de trabalho nunca fica atrás de **nenhum** dos dois remotos que a alimentam — o dela e o da integração —, nesta ordem:

```bash
git fetch origin
git rev-parse -q --verify origin/<branch> >/dev/null && git merge origin/<branch>   # gh → branch: o que só existe no origin (outra máquina, sugestão aceita no PR); sem remoto ainda → pula sozinho
git merge origin/<integração>                                                        # gh → integração: a base andou
```

CONFLITO em qualquer um → resolver entendendo os 2 lados (nunca `--ours`/`--theirs` cego, nunca rebase, nunca force); o `/method` revê e testa o resultado integrado. Sentido único `origin → local`: este motor **não pusha** — o push é o passo 1 do `/pull-request`. Roda ao entrar numa branch que já existe (§ 2), ao entrar num lote aberto (§ 3), quando quem chamou **retoma** um card (modo CONTINUE: já na branch do registro, sincroniza antes de seguir) e se `origin/<integração>` andar durante o trabalho.

### 6 — Override de sessão

Pedido explícito nesta sessão ("hoje quero branch" num repo `direto`) vence **para esta invocação** e não reescreve o setup — `origem: override de sessão` na saída. Oferecer gravar como padrão é do encerramento de quem chamou (ele invoca `/setup branch` se o usuário pedir; a skill é interna, o usuário não a digita); mudar o padrão é decisão do usuário.

### Red Flags — STOP

- "Modo veio da minha cabeça, não do `/setup`" → NÃO. A entrada é o `{modo, nome}` de quem chamou (que invocou o `/setup`); sem ele, este motor não roda.
- "Acabei de clonar, pulo o fetch" → NÃO. **gh → integração → branch**, toda vez — clone de ontem já é stale.
- "Branchei de `dev` sem trazer o remoto" → NÃO. **gh → integração → branch**, sempre.
- "Branchei de `homolog`" → NÃO. `homolog` é o **ambiente**; a integração é a que o § deploy-context, passo 1 resolve — e uma branch remota com esse nome que nenhum PR mira é legado parado, não integração.
- "Todo projeto meu tem `dev`, dou `checkout dev`" → NÃO. Resolva a integração primeiro (§ deploy-context, passo 1): em branch única o `checkout dev` falha e o fluxo trava na largada.
- "Card novo no lote, renomeio a branch pra `AV-2192-2218`" → NÃO. O nome fica no 1º card. O card entra pelo **commit** (com a key dele) e o `/pull-request` atualiza o PR. Rename não linka no Jira e quebra preview, clone e worktree.
- "Modo `acumula`, o PR da branch já foi mergeado, sigo nela" → NÃO. PR mergeado **encerra o lote**; o card nasce em branch nova.
- "A branch é minha, ninguém mais pusha nela, pulo o `origin/<branch>`" → NÃO. Outra máquina sua ou uma sugestão aceita na UI do PR deixam o local atrás, e o push do `/pull-request` é recusado. O `rev-parse` custa nada; sem remoto, pula sozinho.
- "Copio esta mecânica para dentro da minha skill, fica mais direto" → NÃO. Foi assim que o `checkout main` hardcoded sobreviveu numa skill enquanto a outra resolvia a topologia. Aponte para cá.

## work-cycle

> **Motor de estágio.** Invocado só pelo § reconcile quando o estágio `commit` está aberto — o trabalho do objetivo ainda não está em commit na branch de trabalho. Era o corpo do `/work`; agora o `/work` só declara o alvo e este motor faz. Na borda, invoca o **`/method`** (`furi-build:method`) via Skill tool — chamada real, nunca reproduzida de memória.

**Responsabilidade única:** levar o objetivo (card ou trabalho sem card) até **um commit local** na branch de trabalho, com código + docs + card em `kanban/10-done/` — implementado, revisado e testado pelo `/method`. Não pusha (§ pr-publish), não abre PR, não cria branch (§ branch, o estágio anterior, já fechou).

### Iron Law

> **Precisão > tokens > velocidade.** Ler o card inteiro, entender ≥ 90, perguntar só o que muda o que será feito — e então delegar ao `/method`, que é o dono do protocolo. Este motor **prepara e delega**; não reimplementa um step sequer do `/method`.

### Contrato

| Entrada | Saída |
|---|---|
| objetivo (`<KEY>-<N>`, ou a descrição do trabalho sem card) + `branch` (já sincronizada, do estágio anterior) + `setup` (§ Commit) + `jira` (estrutura, ou `rastreamento ≠ Jira`) | commit local na branch, `kanban/10-done/<feature>.md` com `tests: passed`, `{commit, feature, keys[]}` para o loop |

### Sinal de fechado (o que o `reconcile` confere)

```bash
git status --porcelain                                   # vazio
git log origin/<integração>..HEAD --no-merges --format=%s # tem o trabalho do objetivo (a key, quando há card)
ls kanban/10-done/<feature>.md                           # existe, com `tests: passed`
```

**Ambíguo:**

| Sinal | O que fazer |
|---|---|
| árvore suja com código, sem commit | **não** commita avulso: é trabalho que não passou pelo `/method` — volta ao § 4 e o `/method` absorve a árvore como ponto de partida (ele lê o que existe) |
| card em `kanban/06-todo/` (o `/method` parou antes do Step 9) | QA não rodou: volta ao § 4 e o `/method` **retoma do que existe** (Inventário de Docs lê docs, card, plano e review) — fecha o Step 9 (front, 100% PASSED) e o Step 10 (card em `10-done/` + commit) |
| `10-done` existe mas `tests:` não é `passed` | "done sem prova" = não testado. Mesma coisa: o `/method` retoma e refaz o Step 9 |
| commits na branch **sem key nenhuma** e há card | o commit anterior não seguiu o § Commit — não reescreva histórico; o commit deste ciclo leva a key, e o `pr-publish` deriva os cards dos commits que a têm |
| sem card e a árvore está limpa | não há objetivo: o estágio está **fechado por vazio** — o loop reporta gap zero |

### Fluxo

#### 1. Buscar o objetivo

**Com card:** `mcp__atlassian__jira_get_issue` (`issue_key: <KEY>-<N>`): título, descrição, tipo, `## Como testar`, assignee, **anexos**. Colar a descrição **real** do card; ambiguidade → listar ≥ 2 interpretações (insumo do § 3).

> **O card vem em voz de PM/PO, QA ou Designer** (`/card`), não de dev — diz **o quê** e **por quê**, com rota, comportamento esperado e referência visual. Traduza para a **capacidade** que a feature exige. Card não é spec técnica: se prescrever solução, é ruído — quem deriva arquitetura é o `/method`.
> Tem **anexo de imagem**? Baixe (`jira_download_attachments` / `jira_get_issue_images`) e leia antes de decidir: é o que o solicitante viu.

**Sem card** (`rastreamento` ≠ Jira, ou o usuário chamou o alvo sem key): o objetivo é a descrição que veio no argumento ou, sem ela, **o trabalho que já está na árvore** (`git status --porcelain` + `git diff`). Nenhum dos dois → não há objetivo; devolva ao loop como fechado por vazio.

**Com reprodução na conversa** (o `/repro` compôs, ou rodou sozinho antes): os passos observados, a superfície e o trigger são insumo do entendimento — não refaça a reprodução aqui.

#### 2. Mover o card → em andamento

Só com card. Assignee (se ainda não for o executor): `mcp__atlassian__jira_update_issue`. Status: § jira-sync com a etapa **trabalho começou** — ele lê no `jira.md` o status e se comenta. Nenhuma equivalente → avisa e segue.

#### 3. GATE de perguntas (analisar — perguntar SÓ se necessário)

Entender o objetivo lendo o **código** relevante. Já mapeie o que o `/method` vai cobrar: **qual motor é dono da regra** (ou qual falta) e **se há superfície visual** — entendimento, não implementação.

Nota **0–100** à clareza do que precisa ser feito:
- **< 90, ou ambiguidade real** (2 caminhos opostos, requisito de produto faltando, decisão que só o usuário julga) → **PARAR e perguntar** (`AskUserQuestion`) ANTES de implementar. Só seguir com a resposta.
- **≥ 90 e sem ambiguidade** → seguir. **Não invente pergunta.**

> O gate é **pré-implementação** e é sobre *produto/escopo*. Dúvida de *implementação* resolve pela hierarquia (padrão do projeto > big apps > boas práticas) e documenta no spec — não vira pergunta.

#### 4. Rodar o `/method`

**Invoque o `/method`** — via **Skill tool** (`furi-build:method`; a forma curta `method` também resolve), **passando o objetivo como argumento** (`<KEY>-<N>`, ou o nome do feature sem card). Chamada real: sem a invocação, o passo não aconteceu. Ele:

1. chama o **`/solve`** (padrão 10x acima do #1 do mercado) na ativação;
2. roda discovery (1–5) → To Do (6) → Plano (7a) → Codificar (7b) → Code Review (8) → Run Test / QA via front (9) → Done (10);
3. trabalha **na branch atual** (nunca cria branch — o estágio `branch` já fechou), com os próprios gateways e audits — princípios (SOLID · DRY · KISS · YAGNI · LoD · Motores), refatoração do perímetro e, se há tela, design;
4. **converge os follow-ups antes de fechar**: todo achado fora de escopo vira ciclo `/method` completo até o passe seco (Regra Inviolável 7);
5. fecha no **Step 10**: um único commit local com código + docs + card em `kanban/10-done/` — com a key do **card ativo** onde o § Commit do setup mandar. Num lote, a branch é do 1º card; o commit é do card de hoje.

**Não duplicar nada do `/method` aqui** — ele é o dono do protocolo.

#### 5. Devolver ao loop

```
{ commit: <hash>, feature: <nome>, keys: [<KEY>-<N>], kanban: kanban/10-done/<feature>.md }
```

O loop re-diagnostica: `commit` fechado abre `push`. Se o alvo era `/work`, o loop para aqui e a skill reporta.

### Red Flags — STOP

- "Sei o que o `/method` faz, implemento direto" → NÃO. Mencionar não é invocar. O `/method` entra pelo Skill tool, **toda** vez — é ele que tem os gateways, o review frio e a QA.
- "Deixo o `/method` criar a branch" → ele **não cria**. O estágio `branch` (§ branch) fechou antes de este motor rodar.
- "Invoquei o `/method` sem passar o card; ele tira a key da branch" → NÃO. Num lote a branch é do 1º card e o commit sairia com a key errada. O argumento é `<KEY>-<N>`.
- "Card claro, mas pergunto mesmo assim" → NÃO. ≥ 90 e sem ambiguidade → segue.
- "Card ambíguo, mas começo a codar e ajusto depois" → NÃO. Gate de perguntas é **antes**.
- "A árvore já tem código, só commito" → NÃO. Código que não passou pelo `/method` não tem review nem QA. O `/method` parte dele.
- "Não tem card, então não tem o que fazer" → depende: tem descrição ou árvore suja → é o objetivo. Nada → fechado por vazio, e o loop diz isso.
- "O card não falou de motor, então espalho a regra" → NÃO. O card fala de produto; a arquitetura é derivada no `/method`, e capacidade tem **um** dono.
- "O card tinha print anexado, mas nem abri" → NÃO. O anexo é o que o solicitante viu.
- "Terminei, já pusho" → NÃO. Este motor fecha em **commit local**. `push` é o próximo estágio, do § pr-publish — e é o loop que decide se ele está na faixa.

## pr-publish

> **Motor de estágio.** Invocado só pelo § reconcile quando `push` ou `pr` está aberto. Era o corpo do `/pull-request`; agora o `/pull-request` só declara o alvo e este motor faz. Os dois estágios moram aqui porque o segundo é uma consequência do primeiro **quando o setup pede**: `Abre PR: não` ⇒ o estágio `pr` não existe e este motor fecha em `push`.

**Responsabilidade única:** pôr a branch em `origin` e, se o repositório usa PR, abrir **ou atualizar** o PR na integração com o corpo 3-em-1 — depois espelhar em cada card do Jira e promover o kanban. Não revisa (§ pr-cycle), não mergeia, não commita (§ work-cycle já fechou).

### Iron Law

> **Idempotente, e os cards vêm dos commits.** Roda de novo na mesma branch a cada card do lote: PR aberto → **atualiza**; nenhum → cria. Nunca um segundo `create` (o GitHub recusa dois PRs da mesma head, e um PR novo perderia o review do aberto). O nome da branch é só o do 1º card; cada card entrou pelo próprio commit, com a própria key — é essa lista que faz o título, o `## Cards` e o espelho no Jira. **Os nomes dos cards ficam claros em tudo**: título, corpo e comentário citam `<KEY>-<N> — <título>`.

### Contrato

| Entrada | Saída |
|---|---|
| branch de trabalho (com o commit do estágio anterior) + `<integração>` (do § deploy-context, passo 1) + `setup` (§ PR `Abre PR`, `Template`; § Commit posição da key) + `jira` (estrutura ou `≠ Jira`) | branch em `origin`; PR criado/atualizado (ou "publicado sem PR"); cards comentados/transicionados; kanban em `11-ship`; `{pr, url, keys[]}` para o loop |

### Sinal de fechado (o que o `reconcile` confere)

```bash
git fetch origin
git rev-parse HEAD; git rev-parse origin/<branch>                       # iguais ⇒ push fechado
gh pr list --head <branch> --base <integração> --state open --json number,url,title   # 1 PR, com todas as keys dos commits ⇒ pr fechado (só com Abre PR: sim)
```

**Ambíguo:**

| Sinal | O que fazer |
|---|---|
| a integração andou desde o commit (`git rev-list --left-right --count origin/<integração>...HEAD` → esquerda > 0) | **não é este motor**: é o estágio `branch` reaberto — o loop re-diagnostica, § branch, passo 5 traz `origin/<integração>` (merge, nunca rebase) e o `work-cycle` **re-testa**. Publicar só o que já passou; não resolver conflito não-testado |
| `origin/<branch>` à frente do local (outra máquina, sugestão aceita na UI) | merge de `origin/<branch>`, **nunca** `--force`; re-testa se mudou código |
| branch atual **é** a própria integração e `Abre PR: sim` | o alvo `pull-request` não faz sentido: **PARE e diga** — está na integração; o que se quer é `/homolog` ou `/prod`. Com `Abre PR: não` (trabalho `direto na integração`) estar nela é o esperado: o push é nela |
| PR aberto sem o card novo do lote no `## Cards` | estágio `pr` **aberto**: `gh pr edit`, nunca 2º `create` |
| PR **fechado** (não mergeado) e a branch viva | **perguntar** antes de reabrir ou criar outro — alguém fechou por um motivo |
| working tree suja | é o estágio `commit` reaberto — não publica; o loop volta ao `work-cycle` |

### Fluxo

#### 1. Push

```bash
git push -u origin <branch>
```

Sempre — inclusive com `Abre PR: não`: publicar é isto; o PR é o que vem depois, quando o repositório usa.

#### 2. Levantar o contexto da entrega (não inventar)

- **Cards da branch** — dos **commits**, nunca do nome da branch:
  ```bash
  git log origin/<integração>..HEAD --no-merges --format='%s%n%(trailers:key=Jira,valueonly)' | grep -oE '[A-Z][A-Z0-9]+-[0-9]+' | sort -u
  ```
  Só o **subject** e o trailer `Jira:` — o corpo livre cita cards *relacionados*, não os do commit; `--no-merges` porque um merge da integração traz keys alheias. Nenhuma key em commit nenhum → a do nome da branch; nenhuma em lugar algum → **publicação sem card** (diga isso, não invente uma — e sem Jira é o normal). Para cada key, `mcp__atlassian__jira_get_issue` → o título vai no `## Cards`.
- `git diff <integração>...<branch>` — o que realmente mudou.
- Docs do feature: `docs/01-problem` … `docs/05-test-cases` + `kanban/09-run-test` — de **cada** card do lote.
- Extrair daí: **o problema em linguagem leiga**, a **solução técnica**, os **TCs**, e o **impacto de deploy** (migrations? env novas? deps?).

#### 3. Abrir ou atualizar o PR — corpo 3-em-1

**§ PR `Abre PR: não`** → **pule este passo inteiro** e siga para o 4: o push do passo 1 já publicou. Não crie PR "só desta vez" sem pedido explícito do usuário — mudar a convenção é `/setup pr`.

**Antes de criar, sempre:**
```bash
gh pr list --head <branch> --base <integração> --state open --json number,url -q '.[0]'
```
| Resultado | Ação |
|---|---|
| vazio | `gh pr create` (abaixo) |
| PR aberto | `gh pr edit <n> --title "<título>" --body "<corpo>"` — o **mesmo** título e corpo abaixo, regenerados: `## Cards` e as keys do título vêm dos commits; `O que foi feito`, `Solução`, `Como testar` e `DevOps` absorvem o que o card novo mudou. **Nunca** um segundo `create` |

`--base` é `<integração>` (detectada). O título leva **todas** as keys da branch (passo 2), em ordem crescente, na posição que o § Commit do setup mandar: no escopo (`<tipo>(<KEY>-<N>, <KEY>-<M>): …`, o default abaixo), no início (`<KEY>-<N> <tipo>: …`), no fim (`<tipo>(<escopo>): … (<KEY>-<N>, <KEY>-<M>)`) ou ausente (`<tipo>(<escopo>): …` — as keys ficam no trailer `Jira:` do corpo, que é sempre escrito). Um card só → uma key. Se o § PR `Template:` apontar um arquivo (ex.: `.github/pull_request_template.md`), o corpo segue **as seções dele** — preenchidas, não deixadas em branco — e as 3 camadas daqui entram dentro delas (o `## O que foi feito` leigo e o `## Cards` são obrigatórios em qualquer template).

```bash
gh pr create --base <integração> --title "<tipo>(<KEY>-<N>, <KEY>-<M>): <título conciso>" --body "$(cat <<'EOF'
## O que foi feito
[Linguagem simples, ZERO jargão — qualquer pessoa, de qualquer idade ou nível de
conhecimento, entende o problema que existia e o que mudou. Concreto, com antes/depois.
Ex.: "Quando o paciente tentava agendar sem ter crédito, a tela travava. Agora aparece
um aviso claro e o paciente é levado direto pra tela de comprar crédito."]

## Cards
- <KEY>-<N> — <título do card no Jira>
- <KEY>-<M> — <título do card no Jira>

---

## Summary (técnico)
- [o que foi feito + abordagem]
- [decisões relevantes / trade-offs]

## Solução
[Descrição técnica da implementação — pro reviewer e pra IA lerem e entenderem o diff.]

## Como testar
- [ ] TC-1: [passo + resultado esperado]
- [ ] TC-N: ...

## DevOps
- [ ] Migrations: [sim — qual / não]
- [ ] Variáveis de ambiente novas: [listar / nenhuma]
- [ ] Dependências novas: [listar / nenhuma]
- [ ] Passos de deploy fora do padrão: [listar / nenhum]

Jira: <KEY>-<N>, <KEY>-<M>
🤖 Generated with Claude Code
EOF
)"
```
> A seção **"O que foi feito"** é a MESMA que vai pro Jira (passo 4). Escreva uma vez, use nos dois. Sem card, o `## Cards` diz `— (publicação sem card)` e o trailer `Jira:` não é escrito.

#### 4. Espelhar em cada card do Jira

Para **cada** card do passo 2 — não só o do nome da branch. § jira-sync com a etapa **publicado**: ele lê no `jira.md` o status de destino e se comenta; o rótulo é `PR: <URL>` (ou `Publicado em: <branch> @ <hash>` sem PR) + `Branch: <branch>`, e o corpo é a **mesma** descrição leiga do PR. PR **atualizado** (não criado): comenta só nos cards que **ainda não têm** o comentário deste motor — os anteriores já receberam o deles quando entraram. Sem Jira → o `jira-sync` é no-op declarado.

#### 5. Promover o kanban

```bash
mv kanban/10-done/<feature>.md kanban/11-ship/<feature>.md
```
Frontmatter:
```yaml
pr: <URL do PR>                # sem PR: "— (push em <branch>)"
status: in-review
```
> O feature **não estava** em `kanban/10-done/`? É sinal de QA não rodada — mas se este motor rodou, o estágio `commit` estava fechado e o `work-cycle` já passou por isso. Anote e siga; o `pr-cycle` confere de novo antes de mergear.

#### 6. Devolver ao loop

```
{ pr: <n> | —, url, keys: [...], branch, hash }
```

O loop re-diagnostica: `pr` (ou `push`) fechado abre `integrado`. Se o alvo era `/pull-request`, o loop para aqui e a skill reporta.

### Red Flags — STOP

- "Working tree sujo, mas pusho o que está commitado" → NÃO. É o estágio `commit` reaberto; o loop volta ao `work-cycle`. Este motor não decide isso.
- "A integração andou, resolvo o conflito aqui e pusho" → NÃO. Conflito resolvido é código novo sem teste. Estágio `branch` reaberto → § branch, passo 5 → `work-cycle` re-testa.
- "O setup diz `Abre PR: não`, mas abro assim mesmo — é mais seguro" → NÃO. Convenção do time é contrato. Pushe, espelhe, **não crie PR**; mudar é `/setup pr`.
- "`Abre PR: não`, então nem pusho" → NÃO. O push é o passo 1, **sempre**. O que o `não` pula é o passo 3.
- "Já tem PR aberto pra essa branch, crio outro" → NÃO. `gh pr edit` no aberto.
- "Os cards do PR são os do nome da branch" → NÃO. São os dos **commits**. Num lote, o nome é só o do 1º card.
- "Sem card, então sem PR" → NÃO. PR sem card é publicação válida: `## Cards` diz que não há, e segue.
- "Escrevi o corpo do PR só com a parte técnica" → NÃO. As 3 camadas: leiga, técnica, DevOps. Quem lê o PR pode não ser dev — e o `## DevOps` é o que o `env-config` vai consumir.
- "Comentei no Jira só no card do nome da branch" → NÃO. Em **cada** card dos commits, com o nome de cada um claro.
- "Push recusado (`non-fast-forward`), uso `--force`" → NÃO. Merge de `origin/<branch>`, re-testa. `--force` não é caminho.

## pr-cycle

> **Fonte única do ciclo de PR.** `/homolog` e `/prod` não descrevem review, gate de QA nem merge — apontam para cá. **Motor de estágio:** invocado pelo § reconcile quando o estágio `integrado` está aberto — PR aberto e não mergeado, ou (sem PR) commits na integração ainda não revisados.

**Responsabilidade única:** levar **um** PR de aberto a **mergeado** ou **rejeitado**. Não deploya, não configura ambiente, não verifica no ar — isso é do § deploy-run, § env-config e § smoke.

### Iron Law

> **O code review do diff é SEMPRE teu** — ninguém revisa por você, isso é inegociável. Já o **front-test é rede de segurança, não redo**: se o dev rodou o `/method` completo e a QA está **documentada e 100% PASSED** (`kanban/09-run-test/<feature>.md`, todos os TCs do card ✅), **confia e segue**. Re-autentica via front **só** quando a QA (1) **falhou**, (2) **não está explícito que passou**, ou (3) **tem TODO pendente** (card em `06-todo/`).
>
> **Mergear não é obrigatório — isto é um GATE, não uma esteira.** PR de qualidade inaceitável é **rejeitado e devolvido**, não empurrado para dentro. Bloquear lixo é o gate **funcionando**. Conserto pontual → corrige na hora; quando "consertar" vira "reimplementar", **rejeita**.

<HARD-GATE>
1. NÃO mergeie sem **code review limpo** (sempre teu). Autenticação via front é exigida só quando a QA do dev falhou / não está explícito que passou / tem TODO pendente.
2. Card em `kanban/06-todo/` (QA não rodou) e é o card DESTE PR → **invoque o `/method`** (Skill tool — `furi-build:method`): ele retoma do que existe e fecha o Step 9 (100% PASSED) e o Step 10 (card em `10-done/` + commit na branch do PR — pushe) ANTES de mergear.
3. NÃO rode o `/method` em card órfão (sem PR/branch) — isso é lixo de rota, vai pro cleanup (§ 7).
4. QUALQUER fix durante o review invalida o passe → volta ao review + re-autentica.
5. **Mergear NÃO é garantido — REJEITAR é saída válida** (§ 5).
6. NUNCA mergeie branch atrás/conflitada com a integração sem atualizar, resolver e **re-autenticar**.
7. Achado fora do escopo vai para o § findings, que o classifica e **registra com a prova** — o pipeline **nunca cria card sozinho**.
</HARD-GATE>

### 1 — Selecionar o PR

```bash
gh pr list --base <branch-de-integração> --state open
```
A branch de integração vem do **alvo** (§ reconcile): `dev` na topologia de duas branches, `main` em branch única. O repositório vem do próprio checkout (`gh repo view --json nameWithOwner -q .nameWithOwner`) — não hardcodar.

Argumento com número/`<KEY>-<N>` → seleciona direto. 1 PR só → automático. Vários → o `reconcile` processa **um por um**, re-diagnosticando entre eles (a branch andou). `gh pr view <n>` + `gh pr diff <n>` carregam título, corpo, branch e diff.

### 2 — Card(s) e gate de QA (SCOPED ao PR)

1. **Identificar o(s) card(s):** as keys do título e do `## Cards` do PR + as dos commits da branch (`git log <integração>..<head> --no-merges --format='%s%n%(trailers:key=Jira,valueonly)'`, key do projeto vinda do `/jira`). O nome da branch traz só o 1º card de um lote — não pare nele. Um PR pode resolver **vários** — capture todos.
2. **Mapear o feature** no kanban (nome do arquivo).
3. **Gate de QA — só para ESTE feature:**

| Estado do feature | Ação |
|---|---|
| Em `10-done`/`11-ship` **com `09-run-test` 100% PASSED** | QA já foi feita via front no Step 9 → **confia**. Só code review; **pula o front-test** |
| Em `10-done`/`11-ship` mas QA **ausente / ambígua / falhada** | "Done" sem prova = não-testado → review **com** front-test |
| Em `kanban/06-todo/` (QA pendente) | **Invocar o `/method`** (Skill tool) — retoma do que existe, fecha o Step 9 até **100% PASSED** e o Step 10 (card em `10-done/` + commit na branch do PR; `git push origin <branch>` para o PR carregar o commit). Só então o review — *rede de segurança: o dev parou o `/method` antes do teste*. Não passa → rejeita (§ 5) |
| Sem card no kanban (dev trabalhou cru) | **PARAR e avisar:** sem test cases não dá para autenticar QA. Perguntar como proceder |

4. **Gate de convergência do dev — ledger de follow-ups.** Abrir `kanban/10-done/<feature>.md`, seção `## Follow-ups`:

| Ledger | Ação |
|---|---|
| Presente, **zero `ABERTO`** | ✅ dev convergiu → segue |
| Presente **com item `ABERTO`** | ❌ **Rejeita** (§ 5) — viola a Regra Inviolável 7 do `/method`. Pendência conhecida não vira card: volta pro dev fechar o ciclo |
| **Ausente** (card antigo / dev cru) | Não rejeita por si só — revisa **o diff** com mais cuidado. Achado aqui passa pelo § findings como qualquer outro; ledger ausente **não** é licença para caçar fora do diff |

> O gate olha **só o card do PR**. Outros pendentes em `06-todo/` vão pro cleanup (§ 7).

### 3 — Review + autenticar a resolução (loop até limpo **ou** rejeita)

1. **Code review do diff** (calibre Step 8 do `/method`): `gh pr diff <n>` → cada arquivo — bugs, edge cases, padrões do projeto (`.claude/patterns.md` — ou, se o projeto ainda não migrou, o caminho antigo `docs/00-context/technical/patterns.md`; quem migra é o `/method`, Step 4), segurança, performance, código morto, "faz exatamente o que o card pede". Relatório em `kanban/08-code-review/<feature>.md`.
   - **Escopo = o diff.** Os arquivos que o PR toca, mais o que eles chamam direto. Auditoria do repo inteiro **não é este passo**: o que aparecer fora do diff é achado pré-existente e passa pelo § findings.
   - **Princípios, um a um e por nome** (`plugins/furi-build/skills/principles/SKILL.md` — a mesma lista contra a qual o dev escreveu): **SOLID** — **SRP** (responsabilidade única, camadas, >40 linhas), **OCP** (comportamento novo entrou como `if` no meio do que já funcionava?), **LSP** (implementação lança onde o contrato não prevê?), **ISP** (interface maior que o cliente?), **DIP** (regra de negócio importando client de infra?) · **DRY** (duplicou o que já existe? conferir com grep, e o grep é sobre **símbolo que o diff introduz**, não varredura do repo) · **KISS** · **YAGNI** (entrou abstração que nenhum UC pede?) · **LoD / acoplamento / direção de dependências** · **Motores** (a capacidade tem dono, ou o diff criou a segunda fonte da mesma regra?) · **Design**, se o diff tem tela (`plugins/furi-build/skills/ui/SKILL.md`). Violação **sem sintoma observável** é classe **C** no § findings: linha no relatório, nunca card.
   - **Cheque o done doc:** ele declara "reutilizado / descartado / elevado" (Step 10 do `/method`). Diff que cria do zero o que o projeto já tinha, com o done doc silencioso, é sinal de que o § 3.1 do plano não foi feito.
2. **Autenticar a resolução via front — CONDICIONAL** (rede de segurança, não redo): **PULA** se a QA está documentada e 100% PASSED. **FAZ** (Playwright MCP, validando o `## Como testar` de CADA card do PR) só quando a QA falhou, não está explícito que passou, ou veio de TODO pendente.
3. **Achou problema → CONSERTA ou REJEITA:**
   - **Conserta in-place** (default do reparável): bug pontual, edge case, null-check, desvio de pattern, erro de copy → corrige na branch do PR → **re-review + re-autentica**. Loop até zero issues.
   - **Rejeita** (quando o reparo não é review, é reimplementação) → § 5. Gatilhos: abordagem fundamentalmente errada; o feature **não faz o que o card pede** e não dá ajuste trivial; scope bagunçado que precisa re-split (→ § scope-split); desastre de segurança/perda de dado; ou o loop **não converge** (~2–3 rodadas).
   > **Fio da navalha:** se para deixar limpo você teria que **reescrever a implementação**, isso é trabalho do dev — **rejeita e devolve**. Na dúvida, rejeitar é a direção segura (nada deploya).

### 4 — Aprovar e mergear

Com review limpo e resolução autenticada, **aprovar antes de mergear** — o registro de que o gate passou fica no PR, não só no chat:

```bash
gh pr review <n> --approve --body "<o que foi verificado: review limpo + QA (confiada|re-rodada) + o que o card pedia acontece>"
```

**Quem aprova é o § PR `Aprovação:` do `.claude/ship-setup/setup.md`** (lido pelo `/setup` no Step 0 de quem chamou):

| `Aprovação:` | O que muda |
|---|---|
| `a própria skill` (default) | o fluxo acima, como está: o review desta skill **é** a aprovação |
| `<pessoa/time>` | esta skill revisa e registra o review **por comentário** (`gh pr comment`), mas o merge **espera** um review `APPROVED` dessa pessoa — `gh pr view <n> --json reviews --jq '.reviews[] | select(.state=="APPROVED") | .author.login'`. Sem ele, o gap fica **aberto** como *"aprovação pendente de `<quem>`"*, é reportado, e o ciclo **não** mergeia. Não é a skill que o fecha |

> **O GitHub recusa aprovar o próprio PR** (`Can not approve your own pull request`). Autor == usuário → registrar a aprovação como comentário (`gh pr comment <n> --body "<mesmo texto> — aprovação registrada por comentário: o GitHub não permite auto-aprovação"`) e seguir. **Isso não é falha**, e não é motivo para pular o registro.

```bash
# Branch atualizada com a integração? (ela pode ter andado desde o PR)
gh pr view <n> --json mergeable,mergeStateStatus    # CONFLICTING / BEHIND → atualizar
#   se conflitante/atrás:
git checkout <branch> && git fetch origin && git merge origin/<integração>   # RESOLVER os 2 lados
#     resolução mudou código → re-rodar § 3 (review + autenticação) na branch atualizada
git push origin <branch>                            # atualiza o PR

# mergeável e (re-)autenticada:
gh pr merge <n> --<merge|squash|rebase> --delete-branch   # estratégia = § PR `Merge:` do setup (default: merge commit) + apaga a REMOTA
git checkout <integração> && git pull --ff-only     # traz o merge pro local (e libera a branch p/ delete)

# === apagar a LOCAL — passo OBRIGATÓRIO, não "se sobrar tempo" ===
git branch -d <branch>                              # -d recusa se houver commit não mergeado (é o safety net)
git fetch origin --prune                            # limpa o remote-tracking morto

# verificação (as duas listagens têm que vir VAZIAS):
git branch --list <branch>; git ls-remote --heads origin <branch>
```

**Limpeza da branch = local E remota. As duas, sempre.** O `--delete-branch` do `gh` só mata a remota; a local fica e vira lixo que confunde o próximo `/work` (branch morta com o mesmo nome, sem upstream, indistinguível de trabalho em andamento).
- `git branch -d` **falha se você estiver nela** — por isso o `checkout` da integração vem antes, não depois.
- `-d` reclamou "not fully merged" → **PARE**. Investigue (`git log origin/<integração>..<branch>`) e reporte. **Nunca** troque por `-D` para calar o aviso.
- Merge via REST API (fallback do `gh pr merge` com "EOF") **não apaga nada**: as duas deleções são suas.

#### Depois do merge — card, kanban e o commit do que você editou

1. **Card:** § jira-sync com a etapa **integrado** (fonte única — status e "comenta?" vêm do `jira.md`).
2. **PR:** responder discussão aberta (`gh pr comment`).
3. **Kanban:** `kanban/11-ship/<feature>.md` com `merged`, `merged_at`, `merge_commit`. Ledger **stale** (item `ABERTO`/`ADIADO` que outro ciclo deste mesmo PR resolveu) → corrija: card de ship que mente sobre convergência envenena o gate da próxima release.
4. **Commitar e pushar o que você editou — OBRIGATÓRIO, não "depois".** O `gh pr merge` acontece no GitHub, então `origin/<integração>` já andou; o kanban é edição **local**. Sem este passo a árvore fica suja e os cards no `origin` ainda dizem `in-review` — e o `/prod` promoveria uma integração **sem** o que você escreveu.
   ```bash
   # paths EXPLÍCITOS — sessões paralelas compartilham a árvore; `git add -A` rouba o trabalho alheio
   git add kanban/11-ship/<feature>.md [outros arquivos que VOCÊ editou]
   git commit -m "chore(kanban): marca <feature> como mergeado em <integração>"
   git push origin <integração>          # dispara o pre-push gate (lint/typecheck/testes/build)

   git fetch origin
   [ "$(git rev-parse <integração>)" = "$(git rev-parse origin/<integração>)" ] \
     && echo "✓ local == origin" || echo "✗ divergiu — investigar"
   git status --short                    # vazio
   ```
   > Gate **vermelho** neste push = a integração que você acabou de mergear não passa no gate. Não force: investigue antes de seguir — é exatamente o que seria deployado.

### 5 — Rejeitar (saída TERMINAL — não mergeia)

Rejeitar é seguro: nada vai para a integração nem para o ar, branch e PR ficam vivos para o dev iterar → **autônomo, sem pedir permissão** (≠ autorização de prod); só deixa o motivo **explícito** e reporta alto. Override do usuário: "mergeia assim mesmo".

1. **Request-changes** com feedback concreto e acionável, por item, apontando arquivo/linha: `gh pr review <n> --request-changes --body "<o quê + por quê + o que precisa mudar>"`.
2. **NÃO** mergeia, **NÃO** apaga a branch — o dev precisa dela.
3. **Card → devolve pro dev:** § jira-sync com a etapa **devolvido ao dev** — comentário com o que reprovou + link do review; o status é o que o `jira.md` mapeia para rework.
4. **Kanban → rework:** mover o card para `kanban/07-implementation/<feature>.md` com `status: rework` + motivo. Não deixar em `10-done`/`11-ship` (mentiria "pronto"). *(Dev cru, sem card — pula.)*
5. **Escopo lateral** que apareceu: ponta que o dev tinha superfície para ver **volta no request-changes**; ponta que só o review externo enxerga passa pelo § findings. O **core volta pro dev**, não se enfia no PR rejeitado.
6. **Reporta e encerra.** Sem merge, sem deploy.

### 6 — Sem PR aberto

Trabalho commitado em feature branch e nenhum PR → **não é gap deste motor**: é o estágio `push`/`pr` aberto, e quem o fecha é o § pr-publish, acionado pelo `reconcile` na ordem da escada — este motor só entra quando o PR existe. Não abra o PR "à mão" daqui: pula o corpo 3-em-1 e o espelho no Jira. Commit direto na branch de integração (`.claude/ship-setup/setup.md` § PR `Abre PR: não`) → não há PR a rodar; o estágio `integrado` é fechado por este motor **revisando o diff dos commits ainda não verificados na integração** (`git log <último SHA verificado>..origin/<integração>` — o último verificado é o do smoke mais recente registrado; sem registro, os commits desde o último run verde) — a convenção dispensa o PR, não o review.

### 7 — Cleanup de órfãos (confirm-first)

Varrer `kanban/06-todo/` e classificar cada card que **não é** o do PR:
- Tem **PR aberto** ou **branch viva** → QA pendente real. **Deixar quieto.**
- **Órfão** (sem PR, sem branch) → provável lixo de rota abandonada.

Listar os órfãos e **perguntar**: *"Esses cards em `06-todo/` não têm PR nem branch — rota mudou e podem ser removidos, ou é QA pendente de verdade?"* Confirmado → `rm`. **Nunca** auto-deletar. **Nunca** rodar o `/method` em órfão.

### Red Flags — STOP

- "O dev marcou done **sem prova** (`09-run-test` ausente/ambíguo/falhado), mergeio assim mesmo" → NÃO. "Done" sem QA documentada = não-testado → front-test.
- "A QA `/method` passou 100% e está documentada, mas re-testo tudo no front por via das dúvidas" → NÃO (o oposto). Isso é **duplicar QA já feita direito**. O code review é teu; no front é **só seguir em frente**.
- "Card em `06-todo`, mergeio e testo depois" → NÃO. Gate de QA: invoca o `/method` (Skill tool) ANTES.
- "Rodo o `/method` em todos os pendentes de `06-todo`" → NÃO. Só o card do PR. Órfão é cleanup (§ 7).
- "Apago os órfãos de uma vez" → NÃO. Confirm-first, sempre.
- "Fix pequeno no review, não re-testo" → NÃO. Qualquer fix → re-review + re-autentica.
- "O loop de conserto não fecha, sigo reescrevendo no review" → NÃO. ~2–3 rodadas sem convergir = PR cru → REJEITA.
- "Código tá limpo, mas o feature não faz o que o card pede — mergeio" → NÃO. Resolução não-autenticada = rejeita.
- "Para mergear eu reescrevi metade da implementação" → NÃO. Isso é trabalho do dev. Reescrita ≠ review → rejeita e devolve.
- "Achei um null-check faltando, então rejeito o PR" → NÃO (o oposto). Conserto pontual é in-place; rejeição é para inaceitável/reimplementação. Não vire trigger-happy.
- "O dev deixou follow-up aberto mas abro card e mergeio" → NÃO. Card de follow-up não lava violação do `/method`. Ledger sujo = **rejeita**.
- "Mergeei, o ciclo acabou" → NÃO. Editou kanban sem commit+push deixa a árvore suja e os cards no `origin` mentindo — e o `/prod` promoveria sem o que você escreveu.
- "Vou commitar o kanban com `git add -A`" → NÃO. A árvore é compartilhada com sessões paralelas; sempre paths explícitos.
- "O `--delete-branch` já apagou a branch" → apagou **só a remota**. A local também sai, com `fetch --prune` depois.
- "Não consegui aprovar o PR (é meu), então pulo o registro" → NÃO. Registra por comentário e segue: o rastro de que o gate passou fica no PR.
- "Aprovo primeiro e reviso depois, o merge é o que importa" → NÃO. A aprovação **atesta** o review; aprovar antes é assinar em branco.
- "Mergeei com a estratégia que eu prefiro" → NÃO. `Merge:` é o § PR do `.claude/ship-setup/setup.md`. Histórico do time não é gosto da skill.
- "O setup nomeia quem aprova, mas o review está limpo — mergeio" → NÃO. `Aprovação: <pessoa>` ⇒ espera o `APPROVED` dela. Gap aberto é reportado, não pulado.

## deploy-run

> **Fonte única do que acontece entre o push e o ambiente atualizado.** Invocado pelo § reconcile quando o gap é "está na branch e não está no ar".

**Responsabilidade única:** disparar (ou localizar) o run e levá-lo a **um** de três desfechos nomeados. Não configura ambiente (§ env-config), não verifica comportamento (§ smoke), não decide rollback (o usuário decide).

### Iron Law

> **Push é o gatilho; deploy é o run VERDE.** Anunciar "está no ar" porque o push foi aceito é declarar vitória no meio do caminho — é exatamente o defeito que estas skills existem para consertar. E **desfecho tem nome**: `verde`, `vermelho` ou `fila`. Nunca "provavelmente subiu".

### Contrato

| Entrada | Saída |
|---|---|
| alvo (`{ambiente, branch}`) + comandos do § deploy-context | `verde` \| `vermelho` \| `fila` — com o SHA coberto e o link do run |

### 1 — Localizar ou disparar

O deploy é disparado **pelo push** na branch do ambiente (é o que o § deploy-context registra em *Dispara por*). Depois do push, localizar o run correspondente:

```bash
gh run list --branch <branch> --limit 5          # o mais recente cujo headSha == HEAD
gh run watch <id> --exit-status                  # acompanha até terminar
```
Projeto que não usa GH Actions → os comandos vêm do `deploy.md` (§ *Como checar*). **Não improvise comando de plataforma que o doc não registra.**

**Nenhum run para o HEAD atual?** O push não disparou nada (workflow não cobre essa branch, ou foi desabilitado). Isso é um **gap de configuração**, não um deploy — reporte e não fique esperando.

### 2 — Os três desfechos

| Desfecho | Como se reconhece | O que fazer |
|---|---|---|
| **verde** | run `success`, e o `headSha` do run **cobre** o HEAD da branch | devolve `verde`: ambiente **sincronizado**. Ainda **não** é "funcionando" — quem encadeia os gaps seguintes é o § reconcile |
| **vermelho** | run `failure` / `cancelled` / `timed_out` | § 3 |
| **fila** | run `queued` / `waiting` / `pending`, sem progresso | § 4 |

> **Verde ≠ verificado.** São dois eixos independentes: *o código está lá* e *funciona lá*. Um run verde com env var faltando entrega uma tela de erro — sincronizado e quebrado ao mesmo tempo.

### 3 — Vermelho: diagnostica, conserta o que é seu, redeploya

```bash
gh run view <id> --log-failed        # o log do passo que quebrou, não o log inteiro
```

1. **Ler e reportar a causa** — em uma frase, com o passo que falhou.
2. **É seu?** Configuração faltando, migration pendente, variável ausente, lockfile desatualizado → **devolve `vermelho` com a causa nomeada**, para o § reconcile reabrir o gap certo (configuração é gap de `env-config`, não conserto daqui) e disparar o redeploy.
3. **Não é seu?** Bug de código, teste quebrado, credencial que só o usuário tem, quota, indisponibilidade da plataforma → **PARA** e reporta com a causa e o que destravaria.
4. **Teto de ~3 tentativas** por gap. Não convergiu → para. Redeploy em loop queima runner e esconde a causa real.

**Nunca anuncie "no ar" com run vermelho.** O estado é: *não subiu, e por isto*.

**Rollback é oferecido, nunca automático.** O comando está no `deploy.md` (§ *Rollback*). Em ambiente com usuário real, apresente:
> "O deploy de `<ambiente>` falhou em `<passo>`. O ar está com a versão anterior / com versão parcial. Rollback disponível: `<comando>`. Quer que eu rode? [sim/não]"

Rollback automático pode ser pior que a falha — migration já aplicada, estado parcial. Quem responde pelo produto decide.

### 4 — Fila: fila é fila

`queued` sem progresso quase sempre é **runner self-hosted offline** — o setup padrão destes projetos. Máquina desligada **enfileira** o job; ele não falhou e não vai rodar até a máquina voltar.

**Duas filas, e a distinção é a resposta:**

| Fila | Como se reconhece | O que significa |
|---|---|---|
| **vai rodar** — runner online, ocupado com outro job | há runner `online` cujos **labels** atendem ao `runs-on` do job | é espera real. Aguarde **uma** janela declarada (~2–3 min, ou o que o `deploy.md` registrar) e reconfira |
| **não vai rodar nunca** — nenhum runner compatível online | todos `offline`, **ou** os online não têm os labels que o `runs-on` exige | é **ausência**, não lentidão. Reportar imediatamente; esperar não muda nada |

```bash
gh run list --branch <branch> --limit 3       # status queued persistente
gh api repos/{owner}/{repo}/actions/runners --jq '.runners[] | {name, status, labels: [.labels[].name]}'
```
**Label que não casa enfileira igual a runner desligado** — um job com `runs-on: [self-hosted, gpu]` fica em fila para sempre se o único runner online tem só `self-hosted`. Comparar os labels exigidos com os dos runners online é parte do diagnóstico, não detalhe.

Conferir o runner conforme o `deploy.md` (§ *Runner*) e reportar **o tipo de fila**, não "aguardando":
> *não vai rodar:* "O deploy de `<ambiente>` está **enfileirado e não vai rodar** (não falhou, não rodou): nenhum runner online atende ao `runs-on: <labels>` — `<nome>` está offline. O ar segue com a versão anterior. Destrava ligando o runner: o job pega sozinho."
> *vai rodar:* "O deploy de `<ambiente>` está **na fila** — runner `<nome>` online e ocupado. Reconferi depois de `<janela>` e ainda estava em fila; o ar segue com a versão anterior."

- **Fila NÃO é sucesso** — não transiciona card, não diz "no ar", não segue para o smoke.
- **Fila NÃO é falha** — não manda ninguém caçar bug de código, não sugere rollback.
- **Não esperar indefinidamente.** Fila do tipo "não vai rodar nunca" → reporta **na hora**. Fila do tipo "vai rodar" → **uma** janela de espera declarada, e se continuar em fila depois dela, reporta. Em nenhum caso o loop fica esperando: reportou o estado, o gap fica aberto e a skill encerra dizendo o que falta.
- **Não contornar.** Não reaponte o workflow para runner GitHub-hosted, não cancele e re-dispare esperando sorte diferente, não edite o `runs-on` para "destravar". O runner é a máquina do usuário; mudar isso é decisão dele.

### Red Flags — STOP

- "Pushei para a branch, então deployei" → NÃO. Push é gatilho; deploy é o run **verde**, observado.
- "O run está `queued` há 10 minutos, deve ter passado" → NÃO. Runner offline enfileira. **Fila é fila** — reporta como fila.
- "Está em fila, então é só esperar mais" → NÃO necessariamente. Sem runner online **com os labels que o job exige**, esperar não muda nada: é ausência, não lentidão. Confira os labels antes de chamar de espera.
- "Troco o `runs-on` para GitHub-hosted para destravar" → NÃO. Isso muda a infra do usuário por conta própria — e gasta minutos que ele evita de propósito.
- "Deu timeout no watch, considero sucesso e sigo" → NÃO. Timeout não é desfecho: reclassifique em vermelho ou fila e reporte.
- "Run verde, então a feature está funcionando" → NÃO. Verde = **sincronizado**. Funcionar é o § smoke que prova.
- "Falhou, mas dou rollback depois" → NÃO. Se há usuário real no ar, a decisão de rollback é **agora**, e é do usuário.
- "Rodo rollback automático para deixar o ar estável" → NÃO. Migration aplicada, estado parcial: pode ser pior que a falha. Ofereça.
- "Redeployo até passar" → NÃO. Teto de ~3. Depois disso a causa não é transitória.
- "Não achei run, mas o push funcionou, então subiu" → NÃO. Sem run, nada foi publicado: é gap de configuração do workflow.
- "Uso `vercel --prod` porque conheço a plataforma" → NÃO. O comando é o que o `deploy.md` registra. Comando improvisado deploya o que ninguém pediu.

## env-config

> **Fonte única da configuração de ambiente.** Invocado pelo § reconcile quando o gap é "está no ar e não funciona porque falta configuração".

**Responsabilidade única:** aplicar no ambiente o que a mudança exige — env vars, secrets, migrations, feature flags e seeds. Não deploya (§ deploy-run), não verifica comportamento (§ smoke).

### Iron Law

> **Valor de secret é PEDIDO, nunca inferido — e nunca escrito em arquivo.** Credencial inventada em produção é falha silenciosa que parece configuração feita; secret versionado sobrevive a `git rm` e vaza para sempre. Tudo o mais se descobre; o valor, não.

### Contrato

| Entrada | Saída |
|---|---|
| alvo + o `## DevOps` do(s) PR(s) da release + § deploy-context (**como** se seta) + `.claude/ship-setup/infra.md` (**onde** vive cada segredo) | `aplicados[]` + `pendentes[]` (com o motivo de cada pendente) |

**Dois arquivos, dois fatos.** `.claude/ship-setup/deploy.md` (§ deploy-context) diz o **comando** para setar em cada ambiente; `.claude/ship-setup/infra.md` (`/infra`) diz **onde** cada variável vive — localmente (`.secrets/…`), no ambiente (painel, `gh secret`, gerenciador) e como se obtém. `infra.md` não existe → **invoque o `/infra`** via Skill tool (`furi-ship:infra`; a forma curta `infra` também resolve) antes de aplicar qualquer coisa: ele mapeia o `.secrets/` e os provedores e escreve o arquivo. Mencionar não é invocar.

### 1 — De onde vem a lista

O `/pull-request` já produz o checklist, em todo PR:

```markdown
## DevOps
- [ ] Migrations: [sim — qual / não]
- [ ] Variáveis de ambiente novas: [listar / nenhuma]
- [ ] Dependências novas: [listar / nenhuma]
- [ ] Passos de deploy fora do padrão: [listar / nenhum]
```

**Este motor é o consumidor que faltava.** O checklist existia e ninguém executava — era contrato escrito sem quem cumprisse.

Reunir a lista de **todos** os PRs que entraram no ambiente desde o último deploy verificado (uma release publica o acumulado, não um PR). PR sem a seção, ou com ela em branco → **não presumir "nenhuma"**: conferir o diff em busca de `process.env`, `ConfigService`, arquivos de migration e seeds novos, e reportar o que achou.

### 2 — Os cinco tipos

| Tipo | Como se confere o que já existe | Como se aplica |
|---|---|---|
| **Env var** (não sensível) | listagem do ambiente conforme o `deploy.md` | seta pelo comando do `deploy.md`; valor derivável (URL, flag, nome) pode ser proposto — **confirmando** com o usuário |
| **Secret** | listar **nomes**, nunca valores; onde cada um vive: `.claude/ship-setup/infra.md` § Onde vive cada segredo | **pergunta o valor** ao usuário e aplica. Zero exceção |
| **Migration** | estado de migration do ambiente (comando do `deploy.md`) | roda as pendentes; é **etapa do release**, depois do deploy do código |
| **Feature flag** | onde o `deploy.md` registra | liga/desliga o que a mudança exige |
| **Seed** | o que a feature precisa existir no banco para aparecer | roda o seed registrado |

**Ordem:** código no ar (verde) → migrations → env/secrets → flags → seeds → smoke. Migration antes do código no ar quebra a versão que está rodando; flag antes da migration liga tela para dado que não existe.

### 3 — Secret: o único caminho

1. Identificar **o nome** da variável e **onde** ela vive (`cat .claude/ship-setup/infra.md 2>/dev/null || cat .claude/ship-setup/infra.local.md 2>/dev/null` → § Onde vive cada segredo — sem nenhum dos dois, `/infra` primeiro). O `infra.md` diz também **como se obtém** (painel, comando) — é o que vai na pergunta do passo 3, para o usuário saber onde buscar.
2. Conferir se já existe no ambiente — **pelo nome**. Existe e a mudança não pede troca → nada a fazer.
3. Falta → **perguntar**:
   > "O PR `<n>` exige `<NOME_DA_VAR>` em `<ambiente>` (vive em `<onde>`; obtém-se em `<como>`). Não tenho esse valor. Me passa o valor, ou você prefere setar direto lá?"
4. Aplicar pelo comando do `deploy.md`.
5. **Não escrever o valor** em nenhum lugar: nem no `deploy.md`, nem no `infra.md`, nem no card, nem no kanban, nem no relatório, nem no commit. O que se registra é *"`<NOME>` configurada em `<ambiente>`"*. Variável **nova** que o `infra.md` ainda não mapeia → acrescente a linha dela lá (nome + onde vive + como se obtém — nunca o valor); é o `/infra` quem confere no próximo diff.

**Nunca:** gerar valor plausível para destravar · copiar valor do `.env` local para o ambiente (promove segredo de dev a prod sem ninguém decidir) · reaproveitar o valor de homolog em prod.

### 4 — Ambos os ambientes, quando é release de produção

Ao subir para produção na topologia de duas branches, a configuração é aplicada em **prod e homolog**: o resync `main`→`dev` deixa as duas branches iguais, e homolog com configuração defasada passa a mentir na próxima validação. Prod primeiro (é o que tem usuário real), homolog em seguida.

### 5 — O que fica pendente

Não deu para aplicar (o usuário não tinha o valor, o acesso não é seu, a plataforma recusou) → entra em `pendentes[]` **com o motivo**, o gap **não** fecha, e o § smoke não é chamado como se estivesse tudo pronto. Reportar:
> "`<ambiente>` está sincronizado mas **não configurado**: falta `<X>` porque `<motivo>`. A feature `<Y>` não vai funcionar até isso."

### Red Flags — STOP

- "Criei a env var com um valor plausível" → NÃO. Valor de secret **nunca** é inferido. Pergunte.
- "Copiei do meu `.env` local" → NÃO. Isso promove segredo de desenvolvimento a produção sem ninguém decidir.
- "Uso em prod o mesmo valor de homolog" → NÃO. São ambientes distintos por definição; se fossem iguais não haveria dois.
- "Anoto o valor no `deploy.md` (ou no `infra.md`) para não perguntar de novo" → NÃO. **Nunca.** Vaza em commit e sobrevive a `git rm`.
- "Não tem `infra.md`, mas eu sei onde vive, sigo" → NÃO. Sem o arquivo, `/infra` primeiro — mapa na cabeça é o que faz a próxima pessoa perguntar de novo.
- "O PR não tem seção DevOps, então não há configuração" → NÃO. Confira o diff (`process.env`, migrations, seeds) e reporte o que achou.
- "Rodo a migration antes do deploy, para o banco estar pronto" → NÃO. Quebra a versão que está rodando agora. Código no ar primeiro.
- "Configurei só o ambiente que estou soltando" → NÃO, quando é release de prod: o resync iguala as branches e homolog fica mentindo.
- "Faltou uma variável, mas o resto está ok, chamo o smoke" → NÃO. Gap aberto é gap aberto: o smoke vai falhar e o diagnóstico vira ruído.
- "Não tenho acesso, então marco como feito e aviso" → NÃO. Vai para `pendentes[]` com o motivo, e o objetivo **não** é declarado atingido.

## smoke

> **Fonte única da verificação no ar.** Invocado pelo § reconcile como **último** gap: é o passo que autoriza dizer "está no ar funcionando".

**Responsabilidade única:** abrir o ambiente publicado e provar que cada feature que deveria estar lá **está e funciona**. Não conserta, não deploya, não configura.

### Iron Law

> **É este passo que dá o direito de dizer "está no ar".** Sem ele, "deployado" é uma afirmação sobre o git, não sobre o produto. E a URL é a **do ambiente** — `localhost` prova apenas que a sua máquina funciona.

### Contrato

| Entrada | Saída |
|---|---|
| alvo (`{ambiente, URL}`) + os cards que deveriam estar no ar | `passou` \| `falhou[]` (com o que falhou e onde), + evidência |

### 1 — O escopo é o ambiente, não o PR

Verificar o `## Como testar` de **cada card** que deveria estar no ar **desde o último deploy verificado** — não apenas o card do PR desta rodada.

**Por quê:** um deploy publica o **acumulado** da branch. Se três PRs entraram e você só verifica o terceiro, os outros dois sobem sem ninguém olhar — e é exatamente a pergunta que quem valida faz ("todas as features subiram?").

Como montar a lista: os cards dos PRs mergeados desde o último smoke verde, mais os commits diretos na branch de integração no mesmo intervalo. Sem `## Como testar` no card → usar os TCs de `docs/05-test-cases/<feature>.md`; sem nenhum dos dois → reportar que a feature **não é verificável** e por quê (não invente critério de aceite).

### 2 — Como se executa

Playwright MCP, apontando para a **URL do ambiente** (do § deploy-context):

1. Abrir a URL do ambiente. Não responde / 5xx / página de erro da plataforma → não é smoke falho de feature: é **ambiente fora do ar**, gap grave, reporte antes de qualquer outra coisa.
2. Autenticar com as credenciais de teste do ambiente (o `deploy.md` diz **onde** estão — nunca guarda o valor).
3. Para cada card: seguir os passos do `## Como testar` e observar o **resultado declarado**.
4. Registrar evidência por card (screenshot com caminho), como o Step 9 do `/method` exige.

**Ambiente de produção tem usuário real.** Smoke em prod é **leitura e caminho feliz**, com dado de teste quando é preciso escrever. Não criar pedido de verdade, não disparar cobrança, não mexer em dado de terceiro. Não dá para verificar sem efeito colateral → declare isso em vez de improvisar.

### 3 — Os desfechos

| Resultado | Significado | Ação |
|---|---|---|
| Todos os cards passam | ambiente **verificado** | § jira-sync para cada card com a etapa **no ar em homolog** ou **no ar em produção** (rótulo `Em homolog/produção: <URL>`) e o objetivo fecha |
| Algum card falha | objetivo **não** atingido | § 4 |
| Feature não verificável (sem critério) | não conta como passou | reporta explicitamente; não inventa critério |

### 4 — Falhou: é gap reaberto, não conclusão

Smoke falho **não** é o fim do trabalho com um aviso no rodapé — é um gap que voltou a abrir. Diagnosticar **qual** e **reportar ao § reconcile**, que reabre o gap e chama o motor certo — este motor diagnostica, não invoca (D-23):

| Sintoma | Gap provável | Volta para |
|---|---|---|
| Feature simplesmente não existe na tela | não subiu (run de outro SHA, ou run em fila) | § deploy-run |
| Tela de erro, 500, "variável não definida" | falta configuração | § env-config |
| Feature existe mas se comporta diferente do card | defeito de código — ou o card não foi resolvido de fato | § pr-cycle (e, se for achado fora do escopo, § findings) |
| Só em produção falha, homolog estava ok | configuração divergente entre ambientes | § env-config, passo 4 |

Em produção, além de reabrir o gap: **oferecer o rollback** (§ deploy-run, passo 3) — há usuário real vendo a falha agora.

### Red Flags — STOP

- "Testei em localhost e passou" → NÃO. Homolog é a branch de integração **no ar**; prod é prod. `localhost` prova que a sua máquina funciona.
- "Verifico só o card do PR desta rodada" → NÃO. O deploy publica o acumulado; a pergunta é se **todas** as features subiram.
- "Mergeou e o run ficou verde, então está funcionando" → NÃO. Verde é *sincronizado*. Funcionar é este passo.
- "A QA do dev já passou no Step 9, não preciso verificar no ar" → NÃO. Aquilo provou o **código**, na máquina dele. Isto prova o **ambiente** — env var, migration, build de produção.
- "Smoke falhou, mas o merge está feito, reporto e encerro" → NÃO. Gap reaberto: diagnostica e volta ao motor certo.
- "Não achei `## Como testar`, então considero ok" → NÃO. Sem critério, a feature não é verificável — e isso se **declara**, não se assume.
- "Crio um pedido de verdade em prod para testar o fluxo" → NÃO. Usuário real, cobrança real. Caminho feliz de leitura, dado de teste, ou declara que não é verificável sem efeito colateral.
- "A home abriu, o deploy está ok" → NÃO. Home no ar não diz nada sobre a feature que subiu.

## promote

> **Motor de estágio.** Invocado só pelo § reconcile, **depois** do gate autorizado, na topologia de duas branches (`<integração>` ≠ `<produção>`). Em branch única o estágio não existe. Era o Step 2 do `/prod`; agora o `/prod` só declara o alvo e este motor faz.

**Responsabilidade única:** levar `<integração>` para `<produção>` — sincronizada, com conflitos resolvidos e re-verificados — e fechar com o resync e o assert. O push em `<produção>` é o **gatilho** do deploy; o que vem depois (`deploy-run` → `env-config` → `smoke`) são os estágios seguintes, do loop.

### Iron Law

> **Prod tem usuários reais.** Pagamento LIVE, dado sensível, gente trabalhando agora. **Nunca promova `<integração>` stale ou com divergência aberta**, e **toda resolução de conflito que muda código exige re-review + re-verificação ANTES do push em `<produção>`**. `git add -A` não existe aqui: a árvore é compartilhada com sessões paralelas.

### Contrato

| Entrada | Saída |
|---|---|
| `<integração>` e `<produção>` (do § deploy-context, passo 1) + gate **já autorizado** pelo loop (a pergunta é do `reconcile`, ao chegar neste estágio) + `verificado@homolog` fechado (o estágio anterior) | `origin/<produção>` == `origin/<integração>`, com o push que dispara o deploy; `{commits, cards[]}` para o loop |

### Sinal de fechado (o que o `reconcile` confere)

```bash
git fetch origin
git rev-list --count origin/<produção>..origin/<integração>          # 0
[ "$(git rev-parse origin/<integração>)" = "$(git rev-parse origin/<produção>)" ] && echo iguais
```

**Ambíguo:**

| Sinal | O que fazer |
|---|---|
| `origin/<produção>` tem commit que `<integração>` não tem (hotfix direto em prod) | divergência: merge nos **dois** sentidos, resolvendo os dois lados, e **re-review** do que mudou — ou `/sync <produção> > <integração>` antes (é a ferramenta de branch; ela não deploya) |
| `<integração>` local atrás de `origin/<integração>` | sincronizar antes (passo 0) — `<integração>` stale promove o que ninguém revisou |
| conflito em qualquer merge | resolver entendendo **os dois lados** — nunca `ff-only`-bail, nunca `ours`/`theirs` às cegas; intenção ambígua → **pergunte**; resolução que muda código → **re-review + re-verificação antes do push** |
| assert `✗` depois do resync | investigue antes de concluir. O release **não fecha** com branches divergentes |

### Fluxo — `sincronizar+resolver → promove → resync → assert`, nessa ordem

```bash
# === 0) FECHAR a <integração>: tudo atualizado + RESOLVER conflitos, ANTES de promover ===
git checkout <integração>
git fetch origin
git merge origin/<integração>          # traz TODOS os PRs mergeados; CONFLITO → resolver (os 2 lados)
# solto na árvore que é SEU (kanban, docs)? paths EXPLÍCITOS, nunca `git add -A`
git add <paths que VOCÊ editou>
git commit -m "chore(kanban): <o que fechou>"
git push origin <integração>           # no-op se não havia nada

# 1) <integração> → <produção> (promove)
git checkout <produção> && git pull --ff-only
git merge <integração>                 # CONFLITO → resolver → re-review + re-verificar ANTES do passo 2

# 2) <produção> → GitHub   ←  DISPARA o deploy de PROD
git push origin <produção>

# 3) resync <produção> → <integração>
git checkout <integração> && git merge <produção>
git push origin <integração>

# 4) ASSERT
git fetch origin
[ "$(git rev-parse origin/<integração>)" = "$(git rev-parse origin/<produção>)" ] \
  && echo "✓ origin/<integração> == origin/<produção>" || echo "✗ DIVERGIRAM — investigar"
```

`<integração>` e `<produção>` são os nomes **detectados** — `dev`/`main` é só o nosso padrão; o projeto pode chamar `develop`/`master`.

### Devolver ao loop

```
{ commits: <N>, cards: [<KEY>-<N>, …], sha: <HEAD de origin/<produção>> }
```

O loop re-diagnostica: `promovido` fechado abre `publicado@prod`. O `env-config` que vem depois aplica em **prod e homolog** — o resync igualou as branches, e homolog com configuração defasada mente na próxima validação.

### Red Flags — STOP

- "A `<integração>` local está atrás, mas o que importa é o que eu tenho" → NÃO. Sincroniza e resolve **antes**.
- "Resolvi o conflito e pushei pra `<produção>`" → NÃO. Conflito resolvido = código novo → re-review + re-verificação **antes** do push.
- "Uso `ours`/`theirs` pra destravar o merge" → NÃO. Entende os dois lados; ambíguo → pergunta.
- "Commito com `git add -A`, é mais rápido" → NÃO. A árvore é compartilhada com sessões paralelas; paths explícitos.
- "O assert deu `✗` mas o deploy passou, fecho assim" → NÃO. Release não fecha com `origin/<integração> != origin/<produção>`.
- "Pergunto a autorização aqui de novo, por segurança" → NÃO. O gate é do `reconcile`, ao chegar neste estágio — uma vez por release. Se você está aqui, foi autorizado agora.
- "Promovi e o release acabou" → NÃO. Promoção é um estágio; faltam publicado, configurado e verificado em prod.
- "Uso `/sync <integração> > <produção>` que é mais direto" → é uma ferramenta de **branch**, sem deploy observado, sem configuração e sem smoke. Para **entregar** produção, o caminho é o loop.
- "Escrevo `dev` e `main` nos comandos" → NÃO. Os nomes vêm do § deploy-context, passo 1.

## jira-sync

> **Fonte única da escrita no card.** Antes deste motor, a mesma sequência estava escrita em **três** lugares — três cópias que já divergiam no detalhe. Quem toca card aponta para cá; ninguém redescreve a mecânica. Motor de **apoio**: não decide fluxo; é chamado pelo motor de estágio que acabou de fechar um estágio.

**Responsabilidade única:** dado um card e o estágio que a mudança alcançou, **comentar** (se o `jira.md` diz que esta etapa comenta) e **transicionar** para o status que o `jira.md` mapeia. Não decide se o estágio foi alcançado (isso é do motor de estágio), não cria card (isso é `/card`), não descobre o board nem a estrutura (isso é `/jira`).

### Contrato

| Entrada | Saída |
|---|---|
| `<KEY>-<N>` + estágio alcançado + o que foi entregue (linguagem leiga) + URL/PR/commit | card comentado e/ou transicionado conforme o `jira.md`, ou avisado do que não havia |

O board (`<KEY>`, site) e a **estrutura** (`etapas: {<etapa>: {status, comenta}}`, `comentario: {idioma, formato}`) vêm do **`/jira`** (Step 0 de quem chama) — nunca hardcoded, nunca redescobertos aqui. Via `mcp__atlassian__*`.

**Sem Jira** (`rastreamento` ≠ `Jira`, do `/setup` via `/jira`) → este motor é **no-op declarado**: registra `Jira: — (Rastreamento: <x>)` no relatório do motor que chamou e devolve. Não pergunta board, não tenta comentar.

### A sequência — sempre nesta ordem

#### 0. Ler a linha da etapa no mapa

No `estrutura.etapas` devolvido pelo `/jira` (o `## Etapa do pipeline → status` do `.claude/ship-setup/jira.md`), a linha da etapa alcançada diz duas coisas: **`status`** (o nome exato do status de destino, ou `—`) e **`comenta`** (sim/não).

| Estágio fechado | Etapa no `jira.md` | Quem chama |
|---|---|---|
| `commit` aberto pela primeira vez (o trabalho começou) | trabalho começou | § work-cycle |
| `push` / `pr` | publicado | § pr-publish |
| `integrado` | integrado | § pr-cycle |
| `verificado@homolog` | no ar em homolog | § smoke |
| `verificado@prod` | no ar em produção | § smoke |
| rejeição no `pr-cycle` § 5 | devolvido ao dev | § pr-cycle |

#### 1. Comentar — só se `comenta: sim`

`mcp__atlassian__jira_add_comment` com `issue_key: <KEY>-<N>`, no idioma do `comentario.idioma` e no formato do `comentario.formato` (o default é este):

```markdown
## O que foi feito
[Linguagem simples, ZERO jargão — qualquer pessoa entende o problema que existia e o que mudou.
Concreto, com antes/depois.]

---
<rótulo do estágio>: <URL do ambiente | PR | commit>
```

**A descrição leiga é escrita UMA vez e reusada.** O `## O que foi feito` do PR (`pr-publish`) é o mesmo texto que vai para o card — não reescreva, não "adapte para o Jira". **O nome do card fica claro em tudo**: o comentário abre com `<KEY>-<N> — <título>` quando o card não é o único da branch (é o que deixa o histórico legível num lote).

#### 2. Transicionar — pelo NOME que o `jira.md` diz, descobrindo o id na hora

`status: —` na linha da etapa → **não transiciona**; o comentário do passo 1 (se houve) já registrou o fato. Avise uma vez no relatório.

`status: <nome>` →

```
mcp__atlassian__jira_get_transitions   issue_key: <KEY>-<N>
```
Escolher a transição cujo **destino** tem exatamente o `<nome>` do `jira.md` (o id muda quando alguém edita o workflow; o nome é o que o `/jira` gravou e o time enxerga no board).

```
mcp__atlassian__jira_transition_issue   issue_key: <KEY>-<N>   transition_id: <id da escolhida>
```

> **Sem `comment` na transição.** O parâmetro existe mas o formato é ADF; o comentário vai no passo 1, sempre separado.

**O nome do `jira.md` não está entre as transições disponíveis** (o card já está lá; o workflow mudou; a transição depende de outro status) → **avise e siga** — a entrega não trava por causa de status — e **sugira `/jira ler`** no relatório: é o sinal de que a estrutura gravada e o board divergiram. **Nunca** escolha "a parecida": o `jira.md` existe para isso não acontecer.

### Rótulo de cada estágio — o que vai depois do `---`

| Estágio | Rótulo |
|---|---|
| trabalho começou | *(sem comentário por default — `comenta: não`; a transição diz tudo)* |
| publicado, com PR — **em cada card da branch** | `PR: <URL>` · `Branch: <branch>` |
| publicado, sem PR (§ PR `Abre PR: não`) — em cada card da branch | `Publicado em: <branch> @ <hash>` · `Branch: <branch>` |
| integrado | `Merged em <integração>: <commit>` |
| **no ar em homolog, verificado** | `Em homolog: <URL>` |
| **no ar em produção, verificado** | `Em produção: <URL>` |
| devolvido ao dev (rework) | o que reprovou + link do review |

> **"No ar" só se diz depois do § smoke.** Comentar "está em homolog" com o run vermelho, ou antes da verificação, é a mentira que este trabalho inteiro existe para impedir.

### Um site por vez

O MCP alcança apenas o site do `JIRA_URL` configurado. Key ausente naquele site → **avisar** que o card pode estar em outro site. **Nunca** aproximar para uma key parecida.

### Red Flags — STOP

- "Sei que o status chama 'Concluído', transiciono direto" → NÃO. O nome vem do `jira.md`; o **id** vem de `get_transitions`, **sempre** — o workflow é de cada projeto e o id muda.
- "O `jira.md` diz 'Em revisão' mas não existe; uso 'Code Review', é parecido" → NÃO. Avisa, segue sem transicionar, sugere `/jira ler`. Parecido é como a verdade se perde.
- "Não tem `jira.md`, então descubro a transição pelo nome como antes" → NÃO. Sem estrutura, o `/jira` (Step 0 de quem chamou) a teria mapeado. Se você está aqui sem ela, o Step 0 não rodou — volte.
- "Passo o comentário junto na transição, é uma chamada menos" → NÃO. ADF. Comentário no passo 1, transição no 2.
- "Não achei transição equivalente, então paro a entrega" → NÃO. Avisa e segue.
- "`comenta: não`, mas comento mesmo assim pra ficar registrado" → NÃO. O time desligou por um motivo. A transição registra.
- "Sem Jira, então invento um comentário no kanban local" → NÃO. Sem Jira é no-op declarado. O kanban local é do `/method`.
- "Escrevo a descrição técnica no card, o dev entende" → NÃO. Quem lê o card não estava na conversa e pode não ser dev. Linguagem leiga, com antes/depois.
- "Reescrevo o resumo para o Jira" → NÃO. É o **mesmo** texto do PR. Escreve uma vez, usa nos dois.
- "Comento 'está em homolog' logo depois de mergear" → NÃO. Merge ≠ no ar. Só depois do § smoke.
- "Copio esta sequência para dentro da minha skill, fica mais direto" → NÃO. Foi assim que ela virou três cópias divergentes. Aponte para cá.

## findings

> **Fonte única do julgamento de achado do reviewer.** Extraído de `merge:152-224`. Invocado pelo § pr-cycle (review) e pelo § scope-split (excedente).

**Responsabilidade única:** dado um achado fora do escopo do card, dizer **de quem é a ponta**, **qual é a classe** e **registrá-lo com a prova** no relatório do review. Não conserta, não abre PR, não mergeia — e **não cria card**: o pipeline nunca cria card sozinho; abrir um é decisão do usuário, depois, com `/card`.

> **Não confundir com `plugins/furi-build/skills/method/references/follow-ups.md`.** Aquele é a triagem do **dev** (A/B/C, destino: ciclo `/method`, e "vira card" é **proibido** como saída dele). Este é a triagem do **reviewer**, cujo destino é o **relatório com a prova** — classificado para que o usuário decida, em cinco segundos, se abre um card. As duas coexistem porque os atores são diferentes; fundi-las abriria a rota de escape que mata o loop de convergência do `/method`.

### Iron Law

> **Achado registrado é achado PROVADO, não opinião do reviewer.** O "deveria ser assim" **jamais** é opinião — é uma frase que dá para grepar. Sem isso o review fabrica retrabalho e, pior, motiva mudança em código compartilhado a partir de defeito que ninguém provou existir. A prova é o que faz a linha do relatório valer um card **quando o usuário decidir abri-lo**.

### Passo 0 — De quem é a ponta?

Antes de qualquer classificação:

- **Ponta que o dev deixou** — algo que o `/method` dele tinha superfície para ver (tocou no arquivo, o fluxo passa por ali, o ledger do card de done está sujo ou ausente) → **NÃO vira card**. É violação da Regra Inviolável 7 do `/method`: **rejeita o PR** (§ pr-cycle, passo 5) e devolve pro dev convergir.
- **Ponta que só o review externo enxerga** — impacto cross-PR, conflito com outra entrega, contexto de produção que o dev não tinha → segue para a classificação. **Não enfiar no PR atual.**

### As três classes — cada uma tem a SUA prova

| Classe | O que é | Prova exigida | Destino |
|---|---|---|---|
| **A · BUG** | O sistema **contradiz o que ele mesmo promete** (código, spec, UI, card, doc) | **Reprodução observada**: passo no front que falha (Playwright), medição de DOM/rect, linha no banco, log, saída de comando | **Relatório, com a reprodução** — candidato a card, se o usuário quiser |
| **B · FURO** | Falta comportamento que **uma fonte do projeto exige** — furo de regra de negócio / caso de uso | **Citação verbatim** da fonte (`arquivo:linha` + a frase colada) **+** `grep` provando a ausência no código **+** consequência material | **Relatório, com a citação e a consequência** — candidato a card, se o usuário quiser |
| **C · MELHORIA** | "Poderia ser de um jeito X" e **nada no projeto exige X** | **nenhuma prova é possível** — é opinião | **Relatório.** Não é candidato a nada |

> **Por que classificar primeiro:** reprodução é gate **vazio** para ausência. "O sistema não faz X" sempre se reproduz — reproduz-se a ausência. Reprodução **não** prova que X *deveria* existir. Sem classe, melhoria vestida de defeito passa com evidência aparente — e é ela que gera o retrabalho inútil.

### O teste que separa B de C — "cola a frase"

**Quem disse que deveria ser assim?**
- Resposta é um **artefato citável** → **B**.
- Resposta é "eu, o reviewer, achei melhor" → **C**, e morre no relatório.

Não vale paráfrase, não vale "o UC-17 **implica** que", não vale "pelo espírito da spec". **Cola a frase ou não é furo.** O card carrega a citação, então dá para grepar e conferir em 5 segundos.

**Fontes que autorizam um "deveria" — as ÚNICAS:**
- `docs/01-problem/` · `docs/02-user-stories/` · `docs/03-use-cases/` (UC-NN) · `docs/04-spec/` (D-NN)
- `.claude/ship-setup/deploy.md` · `.claude/ship-setup/infra.md` · `.claude/patterns.md` · `.claude/ship-setup/setup.md` (convenção **declarada** do time — ex.: PR mergeado sem a aprovação que o setup exige é furo)
- `docs/00-context/decisions/` · `docs/00-context/technical/` (decisões e docs técnicos do projeto, onde existirem)
- `CLAUDE.md` / `AGENTS.md` — os blocos **OBRIGATÓRIO**
- O `## Como testar` / critério de aceite do próprio card
- **Paridade entre regiões** — fluxo implementado numa e ausente na outra é furo **objetivo**, não opinião
- **Invariante de dinheiro, dado clínico/sensível ou segurança/privacidade** — prod tem usuários reais

**NÃO autorizam:** benchmark ("big tech faz assim" — isso é `/solve` dentro de escopo, não fábrica de card) · robustez genérica · elegância · "seria bom ter" · violação de princípio (SRP/DRY/KISS/YAGNI) **sem sintoma observável**, que é classe **C** por definição.

### Checagem negativa (A **e** B) + consequência material (B)

**Comportamento deliberado não é achado.** Antes de propor **qualquer** A ou B, grepar:
- `kanban/07-implementation/*.md` → seção **`### 3.2 O que NÃO vamos construir (YAGNI)`** — descarte explícito **com motivo**
- decisão registrada (`docs/00-context/decisions/`, `D<NN>` citado em spec/código) ou comentário no código declarando o comportamento **intencional**

Achou → **não é card**. No máximo uma **pergunta** ao usuário, se o motivo registrado parecer stale.

> **Vale para a classe A também, e é onde o review mais escorrega.** Reproduziu o comportamento, mas ele está **documentado como intencional**? Então o sistema **não contradiz o que promete — ele cumpre**. Não é bug: é **revisão de decisão de produto**, que só o usuário toma → pergunta, **nunca** card autônomo. Reprodução prova que o comportamento existe; ela **não** prova que ele está errado.

**Consequência material.** Bug reproduzido já tem sintoma por definição; furo precisa de uma destas para virar card: dinheiro · dado clínico/sensível · segurança/privacidade · perda de dado · usuário travado sem saída · quebra de paridade entre regiões. Fora dessa lista → linha no relatório.
> É esta porta que carrega o "**é crítico e deveria ter**": furo crítico é **candidato** mesmo sendo pré-existente — criticidade **substitui** causalidade. Furo não-crítico não é candidato nem quando o PR passou por perto.

**Causalidade — vale para bug pré-existente:** bug reproduzido que o PR **não criou, tocou nem agravou** e **sem** consequência material → `DESCARTADO` com justificativa de uma linha. Com consequência material → candidato.

### Registrar — o único destino

**Nada aqui cria card.** Todo achado vai para `kanban/08-code-review/<feature>.md`, seção **`## Achados do review`** — uma linha por achado, com **classe**, **prova** e se é **candidato a card**:

```markdown
## Achados do review

| # | Achado | Classe | Prova | Candidato a card? |
|---|--------|--------|-------|-------------------|
| F1 | Agendar sem crédito trava a tela em /agenda | A | Playwright: clique em "Confirmar" → spinner infinito (screenshot f1.png) | **sim** — bug reproduzido, consequência: usuário travado |
| F2 | Paridade: fluxo X existe em BR e não em PT | B | `docs/03-use-cases/uc-17.md:12` — "*o fluxo vale para todas as regiões*" · grep sem ocorrência em `pt/` | **sim** — furo citado, crítico |
| O1 | `useAutosave` sem guarda de gravação em voo | A | não reproduzido (mecanismo inferido do código); pré-existente | não |
| O2 | Política de canal poderia ser tipada pelo catálogo | C | nada no projeto exige; sem sintoma observável | não |
```

A mesma tabela vai para o **relatório final da skill** (`Achados:` na saída do `/homolog`/`/prod`), com a linha *"nenhum card criado — abra com `/card` o que quiser levar adiante"*. O usuário decide; quando decidir, o `/card` recebe **os passos que você já executou** (A) ou **a citação da fonte** (B) — nunca hipótese a testar — e **descreve o defeito sem prescrever a implementação** (a solução é do `/method` do card, com o escopo na mão).

**Registrar ≠ criar card.** Ponta anotada não some — fica auditável no relatório, com a prova pronta para virar card em cinco segundos, sem virar trabalho de ninguém por decisão do reviewer.

> Achado é **privilégio do reviewer**, nunca saída do dev (ponta do dev → rejeita). Mas privilégio **com prova**: reprodução (A), ou citação + criticidade (B). Se virar rota de escape do `/method`, o loop de convergência morre — e se virasse card automático, o pipeline estaria criando trabalho que ninguém pediu.

### Red Flags — STOP

- "Acho a ponta solta, abro o card" → NÃO. **O pipeline nunca cria card sozinho.** Ponta do dev → rejeita. Achado do reviewer → **classifica e registra com a prova**; candidato ou não, o destino é o relatório — o card é decisão do usuário, com `/card`.
- "É bug reproduzido, então pelo menos esse eu crio" → NÃO. Reproduzido = **candidato forte**, marcado como tal na tabela. Criar continua sendo do usuário.
- "O mecanismo é claro no código, então abro o card sem reproduzir" → NÃO. Classe A exige **reprodução observada**. **"pode" / "poderia" / "em teoria" / "risco futuro"** no título é a assinatura do não-reproduzido: se o achado precisa dessas palavras para se sustentar, ele não passou na porta.
- "Reproduzi que o sistema não faz X, então é furo" → NÃO. Reproduzir **ausência** não prova o "deveria". Sem citação verbatim, é classe **C**.
- "O UC-17 **implica** isso" / "pelo espírito da spec" → NÃO. Paráfrase não é citação. **Cola a frase ou não é furo.**
- "É dívida pré-existente, mas grave, então abro card" → só se **bug reproduzido com consequência material** ou **furo citado e crítico**. "Grave no meu julgamento" não é critério — é alucinação com aparência de rigor.
- "O furo é real e provado, então crio o card" → NÃO. Furo é juízo de **direção de produto** → registra como candidato, com a citação. Ninguém cria sozinho.
- "Reproduzi, logo é bug" / "não preciso conferir se é intencional" → NÃO. Checagem negativa é obrigatória em **A e B**. Comportamento documentado como **intencional** não é defeito — é decisão de produto, e revisá-la é chamada do usuário.
- "O card já explica como corrigir no hook compartilhado" → NÃO. Card **descreve** o defeito; a solução é do `/method`, com escopo na mão.
- "Perguntei ao usuário no meio do review se abro o card" → NÃO. O review não para para isso: registra, e a decisão vem no relatório final, de uma vez. Perguntar no meio é o card entrando de carona na atenção do review.
- "Junto esta triagem com a do `/method`, é a mesma tabela A/B/C" → NÃO. Atores diferentes: lá é o dev convergindo; aqui é o reviewer provando. Fundir abre a rota de escape que mata a convergência do dev.

## scope-split

> Invocado pelo § pr-cycle quando o PR entrega **além** do card, ou quando o card era grande demais e virou um PR que ninguém consegue revisar.

**Responsabilidade única:** decidir o que do PR pertence ao card, o que é excedente, e devolver o excedente **declarado** — no `request-changes` e no relatório — sem deixá-lo entrar de carona nem desaparecer. **Não cria card**: o pipeline nunca cria card sozinho; o usuário abre com `/card`, a partir do que ficou registrado.

> **Não confundir com § findings.** Lá o assunto é **achado do reviewer** (algo que o PR não faz e talvez devesse). Aqui é **código que o PR traz** e o card não pediu. Um julga ausência, o outro julga excesso.

### Iron Law

> **Excedente não desaparece nem entra de carona.** Mergear "porque já está pronto" é aceitar código que ninguém especificou, ninguém testou contra critério e ninguém vai lembrar de ter recebido. Descartar em silêncio joga fora trabalho real. **Registrar** — o que é, por que saiu, onde está — é o que mantém o trabalho vivo até alguém decidir o que fazer com ele.

### 1 — Isto é excedente?

| Situação | É excedente? |
|---|---|
| Arquivo/feature que o `## Como testar` do card não menciona e nenhum UC do card exige | **sim** |
| Refatoração de arquivo **no perímetro** da mudança (o `/method` exige — regra do saldo) | **não.** É a passada elevando o que tocou |
| Renomeação/limpeza em arquivo que o PR nem abriu | **sim** |
| Segunda feature completa, com telas e regras próprias | **sim**, e é o caso mais claro |
| Correção pontual de bug encontrado no caminho, com sintoma no fluxo do card | **não** — é conserto in-place legítimo |

Dúvida entre "elevou o perímetro" e "trouxe feature nova" → olhe o `kanban/07-implementation/<feature>.md` § 3.5: o perímetro estava **declarado** no plano. Fora do perímetro declarado e sem UC do card = excedente.

### 2 — Separável ou não?

| Caso | Decisão |
|---|---|
| O excedente sai do diff sem quebrar o que o card pede | `request-changes` pedindo que ele saia deste PR + **registro do excedente** (o que é, por que saiu) no relatório — candidato a card, se o usuário quiser |
| O excedente está entrelaçado (mesmos arquivos, mesma refatoração) e separar exigiria reescrever | **rejeita o PR** (§ pr-cycle, passo 5) com o pedido de re-split — dois PRs; o segundo escopo fica registrado como candidato a card |
| O card era grande demais e o PR só refletiu isso | **propõe a quebra** no relatório: as partes, em voz de produto, cada uma candidata a card; o PR atual passa a resolver apenas a primeira. Quebrar de fato é o usuário, com `/card` |

### 3 — Devolver declarado

Para cada excedente que vira trabalho futuro: **registre** — em `kanban/08-code-review/<feature>.md` § `## Achados do review` (a tabela do § findings, classe `E · EXCEDENTE`) e no relatório final da skill — **o que é**, **por que saiu deste PR** e **onde está** (branch/commit, para ninguém reescrever do zero). Em voz de produto, nunca prescrevendo implementação (a solução é do `/method` do card, com o escopo na mão). **Não invoque o `/card`**: o pipeline nunca cria card sozinho; o usuário abre, se quiser, e o registro é o que ele cola.

No `request-changes`, dizer exatamente: o que sai, que fica registrado como candidato a card, e o que fica.

> Excedente que **não** vira trabalho futuro (código morto, sobra de experimento) não é candidato a nada: pede-se a remoção no `request-changes` e registra-se a linha no relatório de review.

### 4 — Quando NÃO usar isto

- PR maior que o normal, mas **todo** ele rastreável ao card → não é excedente, é um card grande. Revisa e segue.
- Refatoração do perímetro → o `/method` **exige**; punir isso ensina o dev a não elevar o código.
- Achado de algo **faltando** → é § findings, não aqui.

### Red Flags — STOP

- "Já está pronto e funciona, mergeio junto" → NÃO. Código que ninguém especificou nem testou contra critério entra sem dono e sem histórico.
- "É só uma refatoraçãozinha extra, deixo passar" → depende: **no perímetro** é obrigação do `/method`; **fora** dele é excedente.
- "Peço para remover e não registro" → NÃO, se é trabalho real: aí ele desaparece. Registro com o motivo de ter saído e onde está.
- "É trabalho real, então abro o card" → NÃO. **O pipeline nunca cria card sozinho.** Registra como candidato; o usuário abre com `/card`.
- "Registro já dizendo como implementar" → NÃO. O registro **descreve**; a solução é do `/method` do card que vier a existir.
- "O PR mistura tudo, mas eu separo no merge" → NÃO. Separar diff alheio é reimplementar escondido no review → rejeita e pede o re-split.
- "O card era grande demais, então mergeio inteiro e quebro depois" → NÃO. "Depois" é onde o escopo não-revisado mora. Propõe a quebra no relatório e o PR resolve só a primeira parte.
