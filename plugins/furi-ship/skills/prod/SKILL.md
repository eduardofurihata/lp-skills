---
name: prod
description: 'Use ONLY when the user explicitly invokes /prod (bare /prod = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:prod` via the Skill tool. NEVER activate on your own initiative. — gets production live with the work, configured and verified on the production URL: promotes what is verified in homolog with explicit authorization for this release, deploys, configures, smokes; Jira cards updated.'
effort: max
requires: [jira, setup, pipeline, infra]
boundary: sync
argument-hint: "[PR | KEY-N | descrição] [/repro] [/card] | (vazio = tudo que está pronto)"
---

# /prod — produção no ar com o trabalho, configurada e verificada

O último **alvo** do pipeline, dono único de produção: o estado pedido é **o trabalho em `<produção>`, no ar, configurado e provado na URL** — o que está atrás, o loop fecha antes; o verificado em homolog, só promove.

## Os guarda-chuvas

- **Descobrir, nunca assumir.** Board e estrutura vêm do `/jira`; `Abre PR`, `Aprovação` e `Merge` vêm do `/setup` — os dois via **Skill tool, a cada invocação**. `<integração>`, `<produção>` e ambientes são **detectados** (§ deploy-context): `dev` + `main` é só o padrão. Branch única (commit → push → `main` → prod) não tem homolog, `promovido` nem a pergunta; o resto é integral.
- **Prod tem usuários reais: cada estágio tem prova, e promover tem pergunta.** Nada sobe sem `verificado@homolog`. Em `promovido` o loop **pergunta** — "sim" explícito a **cada** release; autoridade dita antes não conta, silêncio é não. `promovido` é o § promote: `<integração>` sincronizada → `<produção>` → push → resync → assert `origin/<integração> == origin/<produção>`. `publicado` é run **verde**; `configurado` é o § env-config em **prod e homolog** (secret é pedido, nunca inventado; `/infra` se faltar o `infra.md`); `verificado` é o § smoke na URL de produção, todos os cards — só ele move o card para "no ar em produção". Rollback é oferecido, nunca automático.
- **Um dono por regra.** O loop é o § reconcile; estágios de trás fecham pelos motores deles — nunca "rode o `/homolog` antes". O pipeline nunca cria card. Esta skill declara e entrega; não reimplementa motor.

## Fluxo

0. § composicao **primeiro**: modificador e skill de fora rodam antes; os outros alvos perdem — `/prod` é o mais distante. Depois `furi-ship:jira` e `furi-ship:setup` via Skill tool; § deploy-context.
1. Objetivo: vazio = tudo que está pronto · `PR`, `KEY-N` ou descrição = preferência de ordem.
2. Declare `alvo = {atéOEstágio: verificado@prod, ambiente: prod, branch: <produção>, fonteDoDelta: o que está em <integração>, em PR ou commitado e não em <produção>, gate: {antesDe: promovido} (branch única: —), paradas: as dos modificadores}` e entregue ao § reconcile, do `card?` ao `verificado@prod`.
3. Report: estágios (antes × agora) · autorização · promoção (commits, cards) · run · config (prod, homolog) · smoke (URL, N/N cards) · cards · assert. Gate negado: ⛔ produção intocada.

## PARE se pensar
"o usuário já disse que eu podia" · "pergunto no começo pra adiantar" · "verifiquei em homolog, prod é igual" · "resolvi o conflito e pushei"
