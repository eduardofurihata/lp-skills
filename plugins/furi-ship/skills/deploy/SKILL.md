---
name: deploy
description: 'Use ONLY when another skill invokes `furi-ship:deploy` via the Skill tool, with the environment (or `mapa`) as the argument — never when the user types something. NEVER activate on your own initiative. — owns `.claude/ship/deploy.md` (topology, environments, how to check, configure, validate, roll back) and the deploy order: publish → configure → validate live → return. `mapa` only writes the doc.'
effort: max
user-invocable: false
requires: [infra]
argument-hint: "<homolog | prod | mapa>"
---

# deploy — o mapa do deploy; publicar, configurar, validar, devolver

Skill **interna**, invocada por `/homolog` e `/prod` com o ambiente — ou com `mapa`, por quem precisa só da topologia. Dona de **`.claude/ship/deploy.md`** (ou `.local.md`): lido no início, criado na primeira vez, atualizado quando divergir. Onde vive cada segredo é o `infra.md`.

## Mapa — `deploy.md`

1. **Detectar a topologia — a integração é para onde o trabalho converge de fato:** o doc já registra (só confirma) → a branch que os PRs recentes miram → uma branch usual em `origin` (mais de uma → pergunte) → a default. Produção: `main`, senão `master`, senão a default. Integração ≠ produção ⇒ duas branches (`<integração>` publica homolog); iguais ⇒ branch única. `dev` + `main` é só o padrão; branch parada que nenhum PR mira é legado.
2. **Ler o doc, ou escrevê-lo uma vez.** Confere → seguir sem pergunta; divergiu → reportar e corrigir; não existe → inferir dos workflows, da plataforma e dos scripts e perguntar só URLs, como se seta secret, rotas críticas e onde está o runner. Seções: Topologia · Ambientes (ambiente, branch, URL, dispara por) · Como checar · Configuração (como se seta; onde vive é o `infra.md`) · Validação (rotas críticas, credenciais de teste) · Rollback · Runner. Nunca um valor de secret. Com `mapa`, devolve aqui.

## Deploy — quatro passos, cada um provado antes do seguinte

1. **Publicar — levar o que fizemos para a infra.** O push na branch do ambiente dispara o workflow (GitHub Actions, runner self-hosted); espere o run **verde**. Vermelho não subiu: o que é seu conserte e redeploye, teto ~3; o resto, reporte. Fila é fila (runner offline, label errado): reporte, não contorne. Nenhum run → gap do workflow.
2. **Configurar — a infra.** Migrations (depois do código no ar), env, secrets, flags e seeds que o `## DevOps` dos PRs exigem. Como se seta é o `deploy.md`; onde vive é o `infra.md` (falta → `Skill(skill: "infra")`); valor de secret é pedido, nunca inventado — recebido no chat, aplica e guarda o backup em `.secrets/`. Release de produção configura prod **e** homolog. O que não aplicou fica pendente, com motivo.
3. **Validar — verificar em live se realmente foi atualizado.** Não é teste longo de QA: o ambiente responde, o commit publicado está no ar, as rotas críticas abrem sem erro. Falhou → gap, volta ao passo dono. Em produção só leitura; rollback é **oferecido**, nunca automático.
4. **Devolver.** `{publicado, configurado, validado}` a quem chamou; com passo aberto, **o que ficou, por quê e o que destrava**.
