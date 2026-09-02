---
name: prod
description: 'Use when user invokes /prod to get production live with the updates — working and configured, verified on the production URL, not merely pushed. The single owner of production: declares the prod target and hands it to the reconcile engine, which diagnoses the gap between what is ready and what actually answers in prod, then closes it. On a `dev`+`main` repository it requires homolog to be verified first, ASKS for explicit authorization for THIS release (authority claimed earlier never counts), closes `dev` (committing loose work with explicit paths, never `git add -A`), promotes `dev`→`main`, watches the deploy run to a named outcome, applies configuration to prod AND homolog, smoke-tests every card on the production URL, and closes with the resync `main`→`dev` plus the assert `origin/dev == origin/main`. On a single-branch repository there is no promotion and no gate: it runs the whole cycle — review, approve, merge into `main`, deploy, configure, smoke. Red deploy never announces success; a queued run on an offline self-hosted runner is a QUEUE; a secret value is always asked, never inferred; rollback is offered, never automatic.'
effort: max
requires: [jira-board, todo, homolog]
argument-hint: "[PR number | KEY-N] | (vazio = diagnosticar e fechar o gap de produção)"
---

# /prod — produção no ar com as atualizações, funcionando e verificada

Não é "dar push na `main`": é **atingir um estado** — produção **no ar, funcionando e configurada**, provada na URL de produção. Dono único de produção.

## Iron Law

> **Prod tem usuários reais.** Pagamento LIVE, dado sensível, gente trabalhando agora. **Push é o gatilho; deploy é o run VERDE; entregue é o smoke PASSADO.** Anunciar produção porque o push foi aceito é declarar vitória no meio do caminho.
>
> **`dev`→`main` SÓ com autorização explícita do usuário, na hora.** Autoridade dita antes — "sou tech lead", "pode subir sempre", o "sim" do release anterior — **NÃO** conta. Pergunte a **cada** release.
>
> **Precisão > tokens > velocidade.** Meio-caminho relatado como sucesso é o defeito que esta família de skills existe para consertar.

## Convenções (CONTRATO)

- **`main` é produção.** `dev` é a branch de integração; **homolog** é o ambiente publicado a partir dela — nome de ambiente, nunca de branch.
- **Duas topologias, um fluxo.** O que muda é o **alvo**; o loop, os motores e as regras são os mesmos.
- Remote `origin`; o repositório vem do checkout (`gh repo view --json nameWithOwner -q .nameWithOwner`) — não hardcodar.
- **Board:** o da memória do projeto, via **`/jira-board`**. **Contexto de deploy:** `docs/00-context/technical/deploy.md`, via `references/deploy-context.md`.
- **Motores:** `references/` — `reconcile` · `pr-cycle` · `findings` · `scope-split` · `deploy-context` · `deploy-run` · `env-config` · `smoke` · `jira-sync`. Esta skill é a **sede** deles; o `/homolog` consome os mesmos arquivos.

<HARD-GATE>
1. **NÃO promova `dev`→`main` sem o usuário autorizar ESTE push, agora.** Silêncio, evasiva ou autoridade prévia = **não**.
2. **NÃO promova o que não foi verificado em homolog** (topologia de duas branches). Não verificado → verifica primeiro.
3. NÃO diga "está em produção" sem run **verde** E smoke **passado** na URL de produção. Fila = **fila**.
4. NUNCA promova `dev` stale ou com divergência aberta: sincronize local ↔ `origin/dev` trazendo tudo e **resolvendo conflitos** (não `ff-only`-bail) antes.
5. Resolver conflito = mudança de código = **re-review + re-verificação ANTES do `push origin main`**. Nunca deploya merge não-verificado. Intenção ambígua → **pergunte**.
6. **NUNCA `git add -A`.** Paths explícitos, sempre: a árvore é compartilhada com sessões paralelas.
7. NÃO invente valor de secret, URL ou comando de deploy. **Rollback é oferecido, nunca automático.**
8. Em **branch única** cai a **pergunta** de autorização — e **nada mais**: review, QA, aprovação, configuração e smoke continuam integrais.
9. O release só fecha com o assert `origin/dev == origin/main` ✓ (topologia de duas branches).
</HARD-GATE>

---

## Step 0 — Board, contexto e topologia

1. **`/jira-board`** — `{site, key, boardId, boardName, url, origem}`. Nunca assuma nem pergunte o board aqui.
2. **`references/deploy-context.md`** — topologia detectada por `git ls-remote --heads origin dev`, doc do projeto lido (ou descoberto e escrito).

## Step 1 — Declarar o alvo

**Topologia `dev` + `main`** — há o que promover:
```
alvo = {
  ambiente:      prod
  branch:        main
  fonteDoDelta:  o que está em `dev` e não em `main`
  gate:          SIM — autorização explícita, a cada release
  pré-requisito: homolog verificado
}
```

**Branch única** — o PR **é** o release, não há promoção:
```
alvo = {
  ambiente:      prod
  branch:        main
  fonteDoDelta:  PRs abertos para `main` + commits em `main` não publicados
  gate:          não        # quem digita `/prod` já autorizou
  pré-requisito: —
}
```

Entregue ao **`references/reconcile.md`**: ele publica o diagnóstico **antes** de agir, aplica o gate quando o alvo pede, fecha os gaps na ordem da dependência, re-diagnostica a cada um, e só encerra quando o último fecha. **Não reimplemente motor aqui.**

`$ARGUMENTS` com PR/`<KEY>-<N>` → preferência de ordem, não restrição do objetivo.

## Step 2 — Promover (só na topologia de duas branches)

O `reconcile` chega aqui depois do gate autorizado e dos gaps de origem fechados. Ciclo `sincronizar+resolver → promove → deploy → resync → assert`, **nessa ordem**:

```bash
# === 0) FECHAR a `dev`: tudo atualizado + RESOLVER conflitos, ANTES de promover ===
git checkout dev
git fetch origin
git merge origin/dev             # traz TODOS os PRs mergeados; CONFLITO → resolver (os 2 lados)
# solto na árvore que é SEU (kanban, docs)? paths EXPLÍCITOS, nunca `git add -A`
git add <paths que VOCÊ editou>
git commit -m "chore(kanban): <o que fechou>"
git push origin dev             # no-op se não havia nada

# 1) dev → main (promove)
git checkout main && git pull --ff-only
git merge dev                    # CONFLITO → resolver

# 2) main → GitHub   ←  DISPARA o deploy de PROD
git push origin main

# 3) resync main → dev
git checkout dev && git merge main
git push origin dev

# 4) ASSERT
git fetch origin
[ "$(git rev-parse origin/dev)" = "$(git rev-parse origin/main)" ] \
  && echo "✓ origin/dev == origin/main" || echo "✗ DIVERGIRAM — investigar"
```

> **Resolução de conflitos (em QUALQUER merge acima):** entender **os dois lados** — nunca `ff-only`-bail, nunca descartar um lado às cegas. **Toda resolução que muda código → re-review + re-verificação ANTES do `push origin main`.** Intenção genuinamente ambígua → **pergunte ao usuário**.
> **Assert `✗`** → o resync não fechou; investigue antes de concluir. O release não fecha com branches divergentes.

O push do passo 2 é só o **gatilho**: o `reconcile` segue para `deploy-run` (run verde), `env-config` (**prod e homolog** — o resync igualou as branches, e homolog com configuração defasada mente na próxima validação) e `smoke` (URL de produção). Só então `jira-sync`.

## Saída

```
## ✅ /prod — produção no ar e verificada
- Diagnóstico: <N> gap(s) → <N> fechados
- Autorização: explícita do usuário nesta sessão ✓  [branch única: não se aplica]
- Homolog:  verificado antes de promover ✓          [branch única: não se aplica]
- Promoção: `dev` → `main` (<N> commits, cards <lista>)  [branch única: PR #<n> mergeado em `main`]
- Deploy:   run <id> ✓ verde
- Config:   prod <N aplicadas> · homolog <N aplicadas>
- Smoke:    <URL de produção> — <N>/<N> cards verificados no ar
- Cards:    <KEY>-<N>[, …]  →  <status final pós-deploy>
- Assert:   origin/dev == origin/main ✓             [branch única: não se aplica]
```

**Parado no gate:**
```
## ⛔ /prod — NÃO autorizado
- `dev` tem <N> commit(s) fora de `main`, cobrindo <cards>
- Resposta: <não | sem "sim" explícito>
- Estado:   nada promovido · `main` intocada · produção inalterada
```

**Objetivo não atingido:**
```
## ⚠️ /prod — gap ABERTO em produção
- Fechados: <o que foi feito>
- Ficou:    <o gap> — <por quê>
- Destrava: <o que é preciso>
- Estado:   prod <sincronizado mas não configurado | não verificado | run vermelho>
- Rollback: <comando disponível — quer que eu rode? | não aplicável>
```

## Red Flags — STOP

**Autorização**
- "O usuário já disse que eu podia mergear pra `main`" → NÃO vale para sempre. Pergunte a **CADA** release.
- "Ele autorizou o deploy da semana passada" → NÃO. A autorização é para **este** push.
- "Ele não respondeu, mas o contexto deixa claro que quer" → NÃO. Sem "sim" explícito, **para**.
- "Sou eu mesmo rodando, então já autorizei" → só em **branch única**, onde o nome do comando é a autorização. Com `dev`+`main`, pergunta.
- "Branch única não tem gate, então dispenso o review também" → NÃO. Cai a **pergunta**, e só ela.

**Deploy e verificação**
- "Pushei pra `main`, então deployei" → NÃO. Push é gatilho; deploy é o run **verde**, observado.
- "O run está `queued`, deve ter passado" → NÃO. Runner self-hosted offline **enfileira**. Fila é fila.
- "Run verde, então está em produção funcionando" → NÃO. Verde = sincronizado. Funcionar é o smoke.
- "Verifiquei em homolog, prod é igual" → NÃO. Env var e migration de prod são outras. Smoke em prod é **obrigatório**.
- "Deu erro em prod, mas dou rollback depois" → NÃO. Há usuário real vendo agora: a decisão é **agora**, e é do usuário.
- "Rodo rollback automático pra estabilizar" → NÃO. Migration aplicada, estado parcial: ofereça, não execute por conta.
- "Criei um pedido de verdade em prod pra testar" → NÃO. Usuário real, cobrança real. Caminho feliz de leitura, dado de teste, ou declara não-verificável.

**Promoção**
- "A `dev` local está atrás, mas o que importa é o que eu tenho" → NÃO. Sincroniza e resolve **antes**; `dev` stale deploya o que ninguém revisou.
- "Resolvi o conflito e pushei pra `main`" → NÃO. Conflito resolvido = código novo → re-review + re-verificação **antes** do push.
- "Uso `ours`/`theirs` pra destravar o merge" → NÃO. Entende os dois lados; ambíguo → pergunta.
- "Commito com `git add -A`, é mais rápido" → NÃO. A árvore é compartilhada com sessões paralelas; paths explícitos.
- "O assert deu `✗` mas o deploy passou, fecho assim" → NÃO. Release não fecha com `origin/dev != origin/main`.
- "Promovo sem verificar homolog, o dev testou na máquina dele" → NÃO. Aquilo provou o código; homolog prova o ambiente.
- "Uso `/sync dev > main` que é mais direto" → é uma ferramenta de **branch**, sem deploy observado, sem configuração e sem smoke. Para **entregar** produção, o caminho é este.

**Objetivo e motores**
- "Promovi e o `/prod` acabou" → NÃO. Promoção é um gap; faltam deploy, configuração, verificação e o assert.
- "Está tudo no ar, encerro sem dizer nada" → NÃO. Gap zero se **declara**, com a evidência.
- "Um gap não fechou, mas o release foi — reporto sucesso" → NÃO. Diz o que ficou e o que destrava.
- "Copio as regras do ciclo de PR pra dentro daqui" → NÃO. Vivem no motor, para as duas skills. Divergência aqui é a duplicação renascendo.
