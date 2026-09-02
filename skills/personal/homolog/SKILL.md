---
name: homolog
description: 'Use when user invokes /homolog to get everything that is ready live on the homolog environment — working and configured, not merely merged. Declares the homolog target (environment homolog, integration branch `dev`) and hands it to the reconcile engine, which diagnoses the gap between what is ready and what actually answers on the homolog URL, then closes it: opens a PR for work committed without one, runs `/todo` when QA is pending, reviews the diff, APPROVES the PR, fixes small problems in place or REJECTS a raw one and bounces the card back to the dev, splits oversized scope into cards, merges into `dev` and deletes the branch (remote AND local), watches the deploy run to a named outcome (green/red/queued — a self-hosted runner offline is a QUEUE, never a success), applies the environment configuration the change needs (env vars, secrets, migrations, feature flags, seeds — a secret value is always asked, never inferred), and finally verifies on the homolog URL that EVERY card that should be live is live and working. Never touches `main`: production is `/prod`. On a single-branch repository there is no homolog environment, so it says so and forwards to `/prod`.'
effort: max
requires: [todo, jira-board, prod]
argument-hint: "[PR number | KEY-N] | (vazio = diagnosticar e fechar o gap de homolog)"
---

# /homolog — tudo que está pronto, no ar em homolog e funcionando

Não é "mergear PR": é **atingir um estado** — o que está pronto está **no ar em homolog, funcionando e configurado**. Mergear é um dos caminhos para chegar lá, não o objetivo.

## Iron Law

> **Precisão > tokens > velocidade.** Uma task pode estar na `dev` — mergeada, commitada, tudo certo no git — e **não estar no ar**: o run falhou, o runner estava offline, faltou uma env var, a migration não rodou. Nada disso aparece no `git log`. Por isso o eixo é o **gap** entre o que está pronto e o que responde na URL de homolog, nunca a lista de PRs.
>
> **"Mergeado" não é "entregue".** Só o smoke na URL de homolog dá o direito de dizer que está no ar.
>
> **Isto é um GATE, não uma esteira.** PR de qualidade inaceitável é rejeitado e devolvido ao dev — bloquear lixo é o gate funcionando, não falhando.

## Convenções (CONTRATO)

- **`dev` é a branch de integração; `homolog` é o AMBIENTE publicado a partir dela** — a `dev` no ar, com URL. Nome de ambiente, nunca de branch. Neste doc, `dev` entre backticks é sempre a branch; "o dev" sem backticks é a pessoa que escreveu o PR.
- **`main` não é assunto desta skill.** Produção é o **`/prod`**, com autorização explícita a cada release.
- Remote `origin`; o repositório vem do próprio checkout (`gh repo view --json nameWithOwner -q .nameWithOwner`) — não hardcodar.
- **Board:** o da memória do projeto, via **`/jira-board`**, nunca hardcoded. Via `mcp__atlassian__*`.
- **Contexto de deploy:** `docs/00-context/technical/deploy.md`, via **`prod/references/deploy-context.md`**. Topologia é detectada (`git ls-remote`), nunca assumida.

<HARD-GATE>
1. **Objetivo é estado, não ação.** Sem smoke verde na URL de homolog, o `/homolog` **não** terminou — mesmo com tudo mergeado.
2. NÃO diga "está em homolog" sem run **verde** e smoke **passado**. Run em fila (runner offline) é **fila**, não sucesso.
3. NÃO mergeie sem code review limpo, nem com QA pendente, nem com ledger de follow-up `ABERTO` — as regras completas estão em `pr-cycle.md`, e valem integralmente.
4. NÃO toque em `main`. Nem merge, nem push, nem oferta disfarçada: encaminhe para o `/prod`.
5. NÃO invente valor de secret, URL de ambiente ou comando de deploy. Pergunta, ou declara que falta.
6. Verifique **todos** os cards no ar desde o último deploy verificado, não só o do PR desta rodada.
7. Em repositório de **branch única** esta skill NÃO trabalha: avisa e encaminha para o `/prod`.
</HARD-GATE>

---

## Step 0 — Board, contexto e guard de topologia

1. **`/jira-board`** — devolve `{site, key, boardId, boardName, url, origem}`. É de lá que sai a `<KEY>` dos cards, o prefixo da branch e os comentários/transições. Nunca assuma o board nem pergunte por ele aqui.
2. **`prod/references/deploy-context.md`** — topologia + processo de deploy do projeto.
3. **Guard de topologia — antes de qualquer outra coisa:**

| Topologia | Ação |
|---|---|
| `dev` **e** `main` em `origin` | segue |
| só `main` (branch única) | **PARA e encaminha:** *"Este projeto é de branch única (`main`) — não existe ambiente de homolog publicado a partir de uma `dev`. O que você quer é o **`/prod`**, que faz o ciclo inteiro: review, aprovação, merge na `main`, deploy, configuração e smoke."* Encerra **sem alterar o repositório** |

> Mergear na `main` chamando de "homolog" mentiria sobre o destino — e é a única coisa que o nome desta skill não pode fazer.

## Step 1 — Declarar o alvo e entregar ao `reconcile`

```
alvo = {
  ambiente:      homolog
  branch:        dev
  fonteDoDelta:  PRs abertos para `dev` + commits em `dev` ainda não publicados
  gate:          não        # homolog não tem usuário real; a cerimônia é do /prod
  pré-requisito: —
}
```

Entregue ao **`prod/references/reconcile.md`**, que faz o resto: publica o diagnóstico **antes** de agir, fecha os gaps na ordem da dependência (`origem → branch → sincronizado → configurado → verificado`), re-diagnostica a cada gap fechado, e só encerra quando o último fecha.

Os motores que ele aciona vivem em `skills/personal/prod/references/`: `pr-cycle` · `findings` · `scope-split` · `deploy-context` · `deploy-run` · `env-config` · `smoke` · `jira-sync`. **Não reimplemente nenhum aqui** — se uma regra do ciclo de PR ou do deploy precisar mudar, ela muda no motor, para as duas skills de uma vez.

`$ARGUMENTS` com número de PR ou `<KEY>-<N>` → passa como preferência de ordem ao `reconcile` (aquele PR primeiro). **Não** restringe o objetivo a ele: o estado do ambiente continua sendo o alvo.

## Saída

```
## ✅ /homolog — homolog no ar e verificado
- Diagnóstico: <N> gap(s) → <N> fechados
- PRs:      #<n> aprovado + mergeado em `dev`  ·  branch deletada: remota ✓ + local ✓
            [#<m> REJEITADO — <motivo>]
- QA:       <já estava verde | rodei /todo: X/X PASSED>
- Review:   limpo (kanban/08-code-review/<feature>.md)
- Deploy:   run <id> ✓ verde
- Config:   <N aplicadas: VAR_X, migration Y | nada a aplicar>
- Smoke:    <URL de homolog> — <N>/<N> cards verificados no ar
- Cards:    <KEY>-<N>[, <KEY>-<M>]  →  <status pós-homolog>
- Follow-up: <N achados classificados (A:x B:y C:z) · M card(s) | nenhum>
- Cleanup:  <N órfãos removidos | nenhum>
- `main`:   NÃO tocada — produção é o `/prod`
```

**Objetivo não atingido** (algum gap resistiu):
```
## ⚠️ /homolog — gap ABERTO
- Fechados: <o que foi feito>
- Ficou:    <o gap> — <por quê>
- Destrava: <o que é preciso>
- Estado:   homolog <sincronizado mas não configurado | não verificado | fora do ar>
```

## Red Flags — STOP

**Objetivo e estado**
- "Mergeei o PR, o `/homolog` acabou" → NÃO. Merge é o **primeiro** gap. Faltam deploy, configuração e verificação no ar.
- "Não tem PR aberto, nada a fazer" → NÃO. É o caso central: pode estar na `dev` e fora do ar. Diagnostica o ambiente.
- "O run ficou verde, então está em homolog funcionando" → NÃO. Verde = **sincronizado**. Funcionar é o smoke que prova.
- "O run está `queued` há 10 minutos, deve ter subido" → NÃO. Runner self-hosted offline **enfileira**. Fila é fila.
- "Testei em `localhost` e passou" → NÃO. Homolog é a `dev` **no ar**, com URL. `localhost` prova que a sua máquina funciona.
- "Verifico só o card do PR desta rodada" → NÃO. O deploy publica o acumulado — a pergunta é se **todas** as features subiram.
- "Está tudo no ar, então encerro sem dizer nada" → NÃO. Gap zero se **declara**, com a evidência.
- "Um gap não fechou, mas o resto sim — reporto sucesso" → NÃO. Diz o que ficou e o que destrava.

**Fronteira com produção**
- "Já que a `dev` está verificada, jogo pra `main`" → NÃO. Produção é o **`/prod`**, com autorização explícita na hora.
- "Ofereço o release pra `main` no fim, só perguntando" → NÃO. Nem a oferta: encaminha para o `/prod` e encerra.
- "Branch única, mergeio na `main` e chamo de homolog" → NÃO. Isso é o `/prod`. O nome tem que dizer o destino.

**Topologia e contexto**
- "A skill se chama `/homolog`, então existe uma branch `homolog`" → NÃO. **Não existe branch `homolog`** — é o **AMBIENTE**, publicado a partir da `dev`. A base de PR e o alvo de merge são `dev`; buscar PRs com base `homolog` devolve lista vazia e parece "nada a mergear".
- "Todo projeto meu tem `dev`, assumo" → NÃO. `git ls-remote` a **toda** invocação.
- "Não achei a URL de homolog, chuto pelo padrão" → NÃO. Pergunta, ou declara que falta. URL inventada = smoke em lugar nenhum.
- "Anoto o valor do secret no `deploy.md` pra não perguntar de novo" → NÃO. Nunca. Vaza em commit e sobrevive a `git rm`.

**Board**
- "Assumi o board de sempre / o do outro repositório" → NÃO. Esta skill não tem board padrão: é o da **memória deste repositório**, via `/jira-board`.
- "Descobri/perguntei o board direto aqui" → NÃO. O Step 0 é o `/jira-board`; ele é o único dono da memória do projeto. Skill que pergunta o board por conta própria pergunta de novo amanhã.
- "Pulei o `/jira-board` porque já sei o board desta sessão" → NÃO. A leitura da memória é **toda** invocação.

**Motores**
- "Copio as regras do ciclo de PR pra dentro daqui, fica mais direto" → NÃO. Foi assim que a sequência do Jira virou três cópias divergentes. As regras vivem no motor; aqui só o alvo.
- "Chamo o `deploy-run` direto, sem passar pelo `reconcile`" → NÃO. A porta é única: sem o `reconcile` não há diagnóstico, ordem de dependência nem re-diagnóstico.
- "Uma regra do review precisa mudar só para homolog" → NÃO. Muda no motor, para as duas skills. Divergência aqui é a duplicação renascendo.
