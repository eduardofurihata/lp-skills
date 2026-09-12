---
name: homolog
description: 'Use when user invokes /homolog to get the work live on the homolog environment — working and configured, verified on the homolog URL — whatever stage it is at now. The third target of the ship pipeline: declares "up to `verificado@homolog`" and hands it to the reconcile engine, which diagnoses where the work is and closes what is open in order: a missing branch, commit, push or PR is closed by the branch, work-cycle (/method) and pr-publish engines — never by telling the user to run /work or /pull-request first; then pr-cycle reviews the diff, runs /todo when QA is pending, APPROVES and merges into the integration branch (or REJECTS a raw PR back to the dev) and deletes the branch (remote AND local); deploy-run watches the run to a named outcome (green/red/queued — a self-hosted runner offline is a QUEUE, never a success); env-config applies what the change needs (env vars, secrets, migrations, flags, seeds — a secret value is always asked; /infra maps where each lives); smoke verifies on the homolog URL that EVERY card that should be live is live. The integration branch and the homolog environment are DETECTED and recorded in `.claude/ship-setup/deploy.md` (`dev` is only our default — `develop`, `staging` work the same); a repo with `Abre PR: não` goes from commit to push straight into the integration branch and then to deploy. Works without Jira. Composes with /repro and /card in any order. Never touches production: /prod is the farther target. On a single-branch repository there is no homolog environment: it says so and suggests /prod.'
effort: max
requires: [jira, setup, pipeline, todo, infra]
handoff: prod
argument-hint: "[PR number | KEY-N | descrição] [/repro] [/card] | (vazio = diagnosticar e fechar até homolog)"
---

# /homolog — tudo que está pronto, no ar em homolog e funcionando, de onde estiver

O terceiro **alvo** do pipeline: o estado pedido é **o trabalho no ar no ambiente de homolog, funcionando e configurado**. Mergear é um dos estágios do caminho, não o objetivo — e se o trabalho ainda está no commit local, ou nem isso, o loop fecha os estágios de trás antes de chegar ao merge.

## Iron Law

> **Precisão > tokens > velocidade.** Uma task pode estar na `<integração>` — mergeada, commitada, tudo certo no git — e **não estar no ar**: o run falhou, o runner estava offline, faltou uma env var, a migration não rodou. Nada disso aparece no `git log`. Por isso o eixo é o **estágio aberto** entre o que está pronto e o que responde na URL de homolog, nunca a lista de PRs.
>
> **"Mergeado" não é "entregue".** Só o smoke na URL de homolog dá o direito de dizer que está no ar.
>
> **Isto é um GATE, não uma esteira.** PR de qualidade inaceitável é rejeitado e devolvido ao dev — bloquear lixo é o gate funcionando, não falhando.

## Argument parsing

`composicao.md` primeiro. `PR number` ou `KEY-N` → **preferência de ordem** (aquele primeiro), não restrição do objetivo: o estado do ambiente continua sendo o alvo. `/repro` · `/card` → funde. `/prod` → vence o mais distante: delega e este alvo **não roda**. `/work` · `/pull-request` → perdem para este.

## Convenções (CONTRATO)

- **`<integração>` é a branch de integração; `homolog` é o AMBIENTE publicado a partir dela** — os dois **detectados** por `pipeline/references/deploy-context.md` § 1 e gravados no `deploy.md § Ambientes`. `dev` é só o nosso padrão; `develop`/`staging`/`homologacao` funcionam igual. Neste doc, "o dev" sem backticks é a pessoa que escreveu o PR.
- **`<produção>` não é assunto desta skill.** Produção é o **`/prod`**, com autorização explícita a cada release.
- Remote `origin`; o repositório vem do próprio checkout (`gh repo view --json nameWithOwner -q .nameWithOwner`) — não hardcodar.
- **Board e estrutura do Jira:** `/jira`. **Convenções do time:** `/setup` — o `pr-publish` lê `Abre PR`; o `pr-cycle` lê `Aprovação` e `Merge`. **Contexto de deploy:** `deploy.md`, via `deploy-context.md`. **Onde vive cada segredo:** `infra.md` (`/infra`), lido pelo `env-config`.
- **Sem PR** (`Abre PR: não`): o estágio `pr` não existe — do `commit` o loop vai a `push` **direto na `<integração>`**, o `pr-cycle` revisa os commits não verificados, e segue para `publicado → configurado → verificado`.

<HARD-GATE>
1. **Objetivo é estado, não ação.** Sem smoke verde na URL de homolog, o `/homolog` **não** terminou — mesmo com tudo mergeado.
2. **Diagnóstico da faixa inteira publicado antes de agir** — do `card?` ao `verificado@homolog`.
3. NÃO diga "está em homolog" sem run **verde** e smoke **passado**. Run em fila (runner offline) é **fila**, não sucesso.
4. NÃO mergeie sem code review limpo, nem com QA pendente, nem com ledger de follow-up `ABERTO` — regras em `pr-cycle.md`, integrais.
5. NÃO toque em `<produção>`. Nem merge, nem push, nem oferta disfarçada: sugira o `/prod`, sem invocá-lo.
6. NÃO invente valor de secret, URL de ambiente ou comando de deploy. Pergunta, ou declara que falta.
7. Verifique **todos** os cards no ar desde o último deploy verificado, não só o do PR desta rodada.
8. NÃO mande o usuário "rodar o `/work` / `/pull-request` antes": estágio aberto é gap que o loop fecha.
9. Em repositório de **branch única** esta skill NÃO trabalha: avisa e sugere o `/prod`.
</HARD-GATE>

---

## Step 0 — Jira, convenções, contexto, guard e composição

1. **Invoque o `/jira`** — via **Skill tool** (`furi-ship:jira`; a forma curta `jira` também resolve). Chamada real: sem a invocação, o passo não aconteceu. Devolve `{rastreamento, site, key, …, estrutura}`.
2. **Invoque o `/setup`** — via **Skill tool** (`furi-ship:setup`; a forma curta `setup` também resolve). Devolve `{branch, commit, pr, jira, infra, guidelines, origem, arquivo}`. Invocação separada da anterior, com a sua própria pergunta isolada.
3. **`pipeline/references/deploy-context.md`** — topologia, `<integração>`, ambientes e URLs (`deploy.md`).
4. **Guard de topologia — antes de qualquer outra coisa:**

| Topologia | Ação |
|---|---|
| `<integração>` ≠ `<produção>` em `origin` | segue |
| branch única | **PARA e sugere:** *"Este projeto é de branch única (`<produção>`) — não existe ambiente de homolog publicado a partir de uma integração. O que você quer é o **`/prod`**, que faz o ciclo inteiro."* Encerra **sem alterar o repositório** e **sem invocar** o `/prod` (skill-alvo não invoca skill-alvo) |

5. **`pipeline/references/composicao.md`** — o alvo efetivo.

## Step 1 — Declarar o alvo e entregar ao `reconcile`

```
alvo = {
  atéOEstágio:   verificado@homolog
  ambiente:      homolog
  branch:        <integração>
  fonteDoDelta:  PRs abertos para <integração> + commits nela não publicados + o objetivo, se ainda atrás
  gate:          —            # homolog não tem usuário real; a cerimônia é do /prod
  paradas:       [] ∪ as dos modificadores
}
```

Entregue ao **`pipeline/references/reconcile.md`**: diagnóstico publicado, estágios fechados na ordem — `branch` · `commit` (`work-cycle` → `/method`) · `push`/`pr` (`pr-publish`) se estiverem abertos; depois `integrado` (`pr-cycle`) → `publicado@homolog` (`deploy-run`) → `configurado@homolog` (`env-config`) → `verificado@homolog` (`smoke`) — re-diagnóstico a cada um, e para no `verificado@homolog`.

Os motores vivem em `pipeline/references/`. **Não reimplemente nenhum aqui** — se uma regra do ciclo de PR ou do deploy precisar mudar, ela muda no motor, para os quatro alvos. Na borda, os motores invocam via Skill tool: **`/method`** (`work-cycle`), **`/todo`** (`pr-cycle`, QA pendente), **`/infra`** (`env-config`, quando falta o `infra.md`) — nunca reproduzidos de memória.

## Saída

```
## ✅ /homolog — homolog no ar e verificado
- Diagnóstico: <N> estágios · <n> já fechados · <m> fechados agora
- PRs:      #<n> aprovado + mergeado em `<integração>`  ·  branch deletada: remota ✓ + local ✓
            [#<m> REJEITADO — <motivo>]   |   sem PR: <k> commits revisados na <integração>
- QA:       <já estava verde | rodei /todo: X/X PASSED>
- Review:   limpo (kanban/08-code-review/<feature>.md)
- Deploy:   run <id> ✓ verde
- Config:   <N aplicadas: VAR_X, migration Y | nada a aplicar>
- Smoke:    <URL de homolog> — <N>/<N> cards verificados no ar
- Cards:    <KEY>-<N>[, <KEY>-<M>]  →  <status da etapa "no ar em homolog">   |   — sem Jira
- Achados:  <N classificados (A:x B:y C:z), registrados no relatório — nenhum card criado | nenhum>
- Cleanup:  <N órfãos removidos | nenhum>
- `<produção>`: NÃO tocada — produção é o `/prod`
```

**Gap zero**: `✅ /homolog — já no ar: run <id> verde, smoke em <URL> passou em <data>, <N> cards verificados. Nada a fazer.`

**Estágio que resistiu**:
```
## ⚠️ /homolog — estágio ABERTO
- Fechados: <o que foi feito>
- Ficou:    <o estágio> — <por quê>
- Destrava: <o que é preciso>
- Estado:   homolog <sincronizado mas não configurado | não verificado | fora do ar>
```

## Red Flags — STOP

**Objetivo e estado**
- "Mergeei o PR, o `/homolog` acabou" → NÃO. `integrado` é o meio da escada. Faltam publicar, configurar e verificar.
- "Não tem PR aberto, nada a fazer" → NÃO. É o caso central: pode estar na `<integração>` e fora do ar — ou no commit local. Diagnostica a faixa.
- "O trabalho está no commit local, mando rodar o `/pull-request`" → NÃO. **É esta a mudança.** `push`/`pr` abertos são gaps que o loop fecha com o `pr-publish`.
- "O run ficou verde, então está em homolog funcionando" → NÃO. Verde = **publicado**. Funcionar é o smoke que prova.
- "O run está `queued` há 10 minutos, deve ter subido" → NÃO. Runner self-hosted offline **enfileira**. Fila é fila.
- "Testei em `localhost` e passou" → NÃO. Homolog é a `<integração>` **no ar**, com URL.
- "Verifico só o card do PR desta rodada" → NÃO. O deploy publica o acumulado.
- "Está tudo no ar, então encerro sem dizer nada" → NÃO. Gap zero se **declara**, com a evidência.
- "Um estágio não fechou, mas o resto sim — reporto sucesso" → NÃO. Diz o que ficou e o que destrava.

**Fronteira com produção**
- "Já que a `<integração>` está verificada, jogo pra `<produção>`" → NÃO. Produção é o **`/prod`**, com autorização explícita na hora.
- "Ofereço o release no fim, só perguntando" → NÃO. Nem a oferta: sugere o `/prod` e encerra.
- "Branch única, mergeio na `<produção>` e chamo de homolog" → NÃO. Isso é o `/prod`. O nome tem que dizer o destino.
- "Digitaram `/homolog /prod`, faço homolog e aviso" → NÃO. Vence o mais distante: delega ao `/prod`.

**Topologia e contexto**
- "A skill se chama `/homolog`, então existe uma branch `homolog`" → NÃO. Homolog é o **ambiente**, publicado a partir da `<integração>`. Buscar PRs com base `homolog` devolve lista vazia e parece "nada a mergear".
- "Todo projeto meu tem `dev`, assumo" → NÃO. `deploy-context.md` § 1 a **toda** invocação — o nome real pode ser `develop`, `staging`, e fica gravado no `deploy.md`.
- "Não achei a URL de homolog, chuto pelo padrão" → NÃO. Pergunta, ou declara que falta.
- "Anoto o valor do secret no `deploy.md` (ou no `infra.md`) pra não perguntar de novo" → NÃO. Nunca.

**Convenções do time**
- "Mergeei com squash porque é mais limpo" → NÃO. A estratégia é o § PR `Merge:` do setup.
- "Aprovei eu mesmo, embora o setup nomeie quem aprova" → NÃO. `Aprovação: <pessoa/time>` ⇒ o merge **espera** o `APPROVED` dessa pessoa; o estágio fica aberto e reportado.
- "Sem PR, então sem review" → NÃO. `Abre PR: não` dispensa o PR, não o review: o `pr-cycle` revisa os commits não verificados na `<integração>`.
- "Pulei o `/setup` / o `/jira` porque já sei desta sessão" → NÃO. Leitura é **toda** invocação.

**Cards e motores**
- "Achei um bug no review, abro um card" → NÃO. O pipeline **nunca cria card sozinho**: achado classificado (`findings.md`) vai para o relatório, com a prova; o card é decisão sua, depois.
- "Copio as regras do ciclo de PR pra dentro daqui" → NÃO. Vivem no motor, para os quatro alvos.
- "Chamo o `deploy-run` direto, sem passar pelo `reconcile`" → NÃO. A porta é única.
- "Sei o que o `/todo` (ou o `/method`, o `/infra`) faz, rodo de cabeça" → NÃO. Mencionar não é invocar.
