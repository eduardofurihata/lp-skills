---
name: prod
description: 'Use when user invokes /prod to get production live with the work — working and configured, verified on the production URL — whatever stage it is at now. The last target of the ship pipeline and the single owner of production: declares "up to `verificado@prod`" and hands it to the reconcile engine, which diagnoses where the work is and closes EVERY open stage in order — branch, commit (/method), push/PR, review + merge, homolog deploy + config + smoke — never by telling the user to run /work, /pull-request or /homolog first. Work already verified in homolog only gets promoted: not a special mode, the result of the diagnosis. On a two-branch repository it ASKS for explicit authorization for THIS release when it reaches the `promovido` stage (authority claimed earlier never counts; asking at the start would expire before it matters), promotes integration → production (closing the integration branch first, explicit paths, never `git add -A`), watches the deploy run to a named outcome, applies configuration to prod AND homolog, smoke-tests every card on the production URL, and closes with the resync plus the assert that both branches are equal. Branch names are DETECTED (`dev`/`main` is only our default). On a single-branch repository there is no promotion and no gate: review, approve, merge, deploy, configure, smoke. Works without Jira. Composes with /repro and /card in any order. Red deploy never announces success; a queued run on an offline self-hosted runner is a QUEUE; a secret value is always asked; rollback is offered, never automatic.'
effort: max
requires: [jira, setup, pipeline, todo, infra]
boundary: sync
argument-hint: "[PR number | KEY-N | descrição] [/repro] [/card] | (vazio = diagnosticar e fechar até produção)"
---

# /prod — produção no ar com o trabalho, funcionando e verificada, de onde ele estiver

O último **alvo** do pipeline e o dono único de produção: o estado pedido é **produção no ar, funcionando e configurada**, provada na URL de produção. Se o trabalho está no commit local, o loop o publica, revisa, mergeia, leva a homolog e verifica lá **antes** de cogitar promover. Se já está verificado em homolog, só promove. Não é modo especial — é o que o diagnóstico mostrou.

## Iron Law

> **Prod tem usuários reais.** Pagamento LIVE, dado sensível, gente trabalhando agora. **Push é o gatilho; deploy é o run VERDE; entregue é o smoke PASSADO.** Anunciar produção porque o push foi aceito é declarar vitória no meio do caminho.
>
> **`<integração>`→`<produção>` SÓ com autorização explícita do usuário, na hora — ao chegar no estágio `promovido`.** Autoridade dita antes — "sou tech lead", "pode subir sempre", o "sim" do release anterior — **NÃO** conta. Pergunte a **cada** release, e **só quando tudo antes estiver fechado**: perguntado na entrada, o "sim" expiraria antes de valer.
>
> **Precisão > tokens > velocidade.** Meio-caminho relatado como sucesso é o defeito que esta família de skills existe para consertar.

## Argument parsing

`composicao.md` primeiro. `PR number` ou `KEY-N` → **preferência de ordem**, não restrição do objetivo. `/repro` · `/card` → funde. `/work` · `/pull-request` · `/homolog` no argumento → perdem para este: `/prod` é o mais distante.

## Convenções (CONTRATO)

- **`<produção>` é produção; `<integração>` é a branch de integração; homolog é o ambiente publicado a partir dela** — todos **detectados** (`pipeline/references/deploy-context.md` § 1) e gravados no `deploy.md § Ambientes`. `dev`/`main` é só o nosso padrão.
- **Duas topologias, um fluxo.** O que muda é a **faixa** (branch única não tem os estágios de homolog nem `promovido`); o loop, os motores e as regras são os mesmos.
- Remote `origin`; o repositório vem do checkout (`gh repo view --json nameWithOwner -q .nameWithOwner`) — não hardcodar.
- **Board e estrutura do Jira:** `/jira`. **Convenções do time:** `/setup` — `pr-publish` lê `Abre PR`; `pr-cycle` lê `Aprovação` e `Merge`. **Contexto de deploy:** `deploy.md`, via `deploy-context.md`. **Onde vive cada segredo:** `infra.md` (`/infra`), lido pelo `env-config`.
- **Motores:** `pipeline/references/` — `reconcile` · `branch` · `work-cycle` · `pr-publish` · `pr-cycle` · `promote` · `deploy-context` · `deploy-run` · `env-config` · `smoke` · `jira-sync` · `findings` · `scope-split` · `composicao`. Os quatro alvos leem os mesmos arquivos.

<HARD-GATE>
1. **NÃO promova `<integração>`→`<produção>` sem o usuário autorizar ESTE push, agora, ao chegar em `promovido`.** Silêncio, evasiva ou autoridade prévia = **não**.
2. **NÃO promova o que não foi verificado em homolog** (duas branches). `verificado@homolog` é um estágio da faixa — o loop o fecha antes, com os motores; não se pula.
3. **Diagnóstico da faixa inteira publicado antes de agir** — do `card?` ao `verificado@prod`. Faixa longa é o pedido, não erro: diga o tamanho.
4. NÃO diga "está em produção" sem run **verde** E smoke **passado** na URL de produção. Fila = **fila**.
5. NUNCA promova `<integração>` stale ou com divergência aberta: `promote.md` sincroniza e resolve antes. Resolver conflito = código novo = **re-review + re-verificação ANTES do push em `<produção>`**.
6. **NUNCA `git add -A`.** Paths explícitos, sempre: a árvore é compartilhada com sessões paralelas.
7. NÃO invente valor de secret, URL ou comando de deploy. **Rollback é oferecido, nunca automático.**
8. Em **branch única** cai a **pergunta** de autorização — e **nada mais**: review, QA, aprovação, configuração e smoke continuam integrais.
9. O release só fecha com o assert `origin/<integração> == origin/<produção>` ✓ (duas branches).
10. NÃO mande o usuário "rodar o `/work` / `/pull-request` / `/homolog` antes": estágio aberto é gap que o loop fecha.
</HARD-GATE>

---

## Step 0 — Jira, convenções, contexto e composição

1. **Invoque o `/jira`** — via **Skill tool** (`furi-ship:jira`; a forma curta `jira` também resolve). Chamada real: sem a invocação, o passo não aconteceu. Devolve `{rastreamento, site, key, …, estrutura}`.
2. **Invoque o `/setup`** — via **Skill tool** (`furi-ship:setup`; a forma curta `setup` também resolve). Devolve `{branch, commit, pr, jira, infra, guidelines, origem, arquivo}`. Invocação separada da anterior, com a sua própria pergunta isolada.
3. **`pipeline/references/deploy-context.md`** — topologia detectada por evidência, `<integração>` e `<produção>`, ambientes e URLs (`deploy.md` lido — ou descoberto e escrito).
4. **`pipeline/references/composicao.md`** — o alvo efetivo.

## Step 1 — Declarar o alvo e entregar ao `reconcile`

**Duas branches** (`<integração>` ≠ `<produção>`):
```
alvo = {
  atéOEstágio:   verificado@prod
  ambiente:      prod            # a faixa passa por homolog: publicado → configurado → verificado, e só então «GATE» → promovido
  branch:        <produção>
  fonteDoDelta:  o que está em <integração> e não em <produção> · PRs abertos · commits não publicados · o objetivo, se ainda atrás
  gate:          {antesDe: promovido}   # autorização explícita, a cada release, AO CHEGAR lá
  paradas:       [] ∪ as dos modificadores
}
```

**Branch única** — o PR **é** o release; não há homolog nem promoção:
```
alvo = {
  atéOEstágio:   verificado@prod
  ambiente:      prod
  branch:        <produção>      # = a integração
  fonteDoDelta:  PRs abertos para <produção> + commits nela não publicados + o objetivo, se ainda atrás
  gate:          —               # quem digita `/prod` já autorizou; o que cai é a pergunta, nunca o review
  paradas:       [] ∪ as dos modificadores
}
```

Entregue ao **`pipeline/references/reconcile.md`**: diagnóstico da faixa publicado, estágios fechados na ordem — `branch` · `commit` (`work-cycle` → `/method`) · `push`/`pr` (`pr-publish`) · `integrado` (`pr-cycle`) · `publicado@homolog` → `configurado@homolog` → `verificado@homolog` (`deploy-run` → `env-config` → `smoke`) · **«GATE»** · `promovido` (`promote`) · `publicado@prod` → `configurado@prod` (**prod e homolog** — o resync igualou as branches) → `verificado@prod` — re-diagnóstico a cada um. **Não reimplemente motor aqui.**

`/prod` com homolog já verificado: o diagnóstico mostra tudo fechado até `verificado@homolog`, e a faixa efetiva começa no gate. É o caso comum — e é resultado do diagnóstico, não um modo.

## Saída

```
## ✅ /prod — produção no ar e verificada
- Diagnóstico: <N> estágios · <n> já fechados · <m> fechados agora
- Autorização: explícita do usuário nesta sessão, ao chegar em `promovido` ✓  [branch única: não se aplica]
- Homolog:  verificado antes de promover ✓ (run <id>, smoke <data>)          [branch única: não se aplica]
- Promoção: `<integração>` → `<produção>` (<N> commits, cards <lista>)      [branch única: PR #<n> mergeado em `<produção>`]
- Deploy:   run <id> ✓ verde
- Config:   prod <N aplicadas> · homolog <N aplicadas>
- Smoke:    <URL de produção> — <N>/<N> cards verificados no ar
- Cards:    <KEY>-<N>[, …]  →  <status da etapa "no ar em produção">   |   — sem Jira
- Achados:  <N classificados, registrados no relatório — nenhum card criado | nenhum>
- Assert:   origin/<integração> == origin/<produção> ✓             [branch única: não se aplica]
```

**Gap zero**: `✅ /prod — já em produção: run <id> verde, smoke em <URL> passou em <data>, origin/<integração> == origin/<produção>. Nada a fazer.`

**Parado no gate:**
```
## ⛔ /prod — NÃO autorizado
- `<integração>` tem <N> commit(s) fora de `<produção>`, cobrindo <cards> — tudo verificado em homolog
- Resposta: <não | sem "sim" explícito>
- Estado:   nada promovido · `<produção>` intocada · produção inalterada
```

**Estágio que resistiu:**
```
## ⚠️ /prod — estágio ABERTO
- Fechados: <o que foi feito>
- Ficou:    <o estágio> — <por quê>
- Destrava: <o que é preciso>
- Estado:   prod <sincronizado mas não configurado | não verificado | run vermelho>
- Rollback: <comando disponível — quer que eu rode? | não aplicável>
```

## Red Flags — STOP

**Autorização**
- "O usuário já disse que eu podia mergear pra `<produção>`" → NÃO vale para sempre. Pergunte a **CADA** release.
- "Pergunto no começo, junto com o diagnóstico, pra adiantar" → NÃO. O gate é **ao chegar em `promovido`**. Antes disso a resposta expira — e "autoridade dita antes não conta".
- "Ele não respondeu, mas o contexto deixa claro que quer" → NÃO. Sem "sim" explícito, **para**.
- "Sou eu mesmo rodando, então já autorizei" → só em **branch única**, onde o nome do comando é a autorização. Com duas branches, pergunta.
- "Branch única não tem gate, então dispenso o review também" → NÃO. Cai a **pergunta**, e só ela.

**Estado e faixa**
- "O trabalho está no commit local, mando rodar o `/work` / `/pull-request` / `/homolog` antes" → NÃO. **É esta a mudança.** Estágio aberto é gap que o loop fecha com o motor dele. `/prod` do zero roda a faixa inteira.
- "Invoco o `/homolog` pra fechar o pré-requisito" → NÃO. `verificado@homolog` é um estágio **desta** faixa, fechado pelos mesmos motores. Skill-alvo não invoca skill-alvo.
- "Pushei pra `<produção>`, então deployei" → NÃO. Push é gatilho; deploy é o run **verde**, observado.
- "O run está `queued`, deve ter passado" → NÃO. Runner self-hosted offline **enfileira**. Fila é fila.
- "Run verde, então está em produção funcionando" → NÃO. Verde = publicado. Funcionar é o smoke.
- "Verifiquei em homolog, prod é igual" → NÃO. Env var e migration de prod são outras. Smoke em prod é **obrigatório**.
- "Deu erro em prod, mas dou rollback depois" → NÃO. Há usuário real vendo agora: a decisão é **agora**, e é do usuário.
- "Rodo rollback automático pra estabilizar" → NÃO. Ofereça, não execute por conta.
- "Criei um pedido de verdade em prod pra testar" → NÃO. Usuário real, cobrança real. Caminho feliz de leitura, dado de teste, ou declara não-verificável.

**Promoção**
- "A `<integração>` local está atrás, mas o que importa é o que eu tenho" → NÃO. `promote.md` sincroniza e resolve **antes**.
- "Resolvi o conflito e pushei pra `<produção>`" → NÃO. Conflito resolvido = código novo → re-review + re-verificação **antes** do push.
- "Uso `ours`/`theirs` pra destravar o merge" → NÃO. Entende os dois lados; ambíguo → pergunta.
- "Commito com `git add -A`" → NÃO. Paths explícitos.
- "O assert deu `✗` mas o deploy passou, fecho assim" → NÃO. Release não fecha com as branches divergentes.
- "Uso `/sync <integração> > <produção>` que é mais direto" → é uma ferramenta de **branch**, sem deploy observado, sem configuração e sem smoke. Para **entregar** produção, o caminho é este.

**Convenções do time e Jira**
- "Mergeei com squash porque é mais limpo" → NÃO. § PR `Merge:` do setup, via `/setup`.
- "Aprovei eu mesmo, embora o setup nomeie quem aprova" → NÃO. O merge **espera** o `APPROVED`; o estágio fica aberto e reportado.
- "Pulei o `/setup` / o `/jira` porque já sei desta sessão" → NÃO. Leitura é **toda** invocação.
- "Anoto onde vive o secret no `deploy.md`" → NÃO. É o `infra.md` (`/infra`); o `deploy.md` diz só o comando.
- "Todo projeto meu é `dev`+`main`, escrevo assim" → NÃO. `<integração>`/`<produção>` detectados; o projeto pode ser `develop`/`master`.
- "Achei um bug no review, abro um card" → NÃO. O pipeline **nunca cria card sozinho**: vai ao relatório, com a prova.

**Objetivo e motores**
- "Promovi e o `/prod` acabou" → NÃO. Promoção é um estágio; faltam publicado, configurado, verificado e o assert.
- "Está tudo no ar, encerro sem dizer nada" → NÃO. Gap zero se **declara**, com a evidência.
- "Um estágio não fechou, mas o release foi — reporto sucesso" → NÃO. Diz o que ficou e o que destrava.
- "Copio as regras do ciclo de PR pra dentro daqui" → NÃO. Vivem no motor, para os quatro alvos.
