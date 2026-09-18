---
name: deploy
description: 'Use ONLY when another skill invokes `furi-ship:deploy` via the Skill tool, with the environment (or `mapa`) as the argument. NEVER activate on your own initiative. — owns `.claude/ship/deploy.md` and the deploy order: publish → configure → validate live → return. `mapa` only writes the doc.'
effort: max
user-invocable: false
requires: [infra]
argument-hint: "<homolog | prod | mapa>"
---

# deploy — o mapa, depois o ambiente no ar e provado

Interna: `/homolog` e `/prod` a invocam com o ambiente. Cada passo provado antes do seguinte: o Jira só muda com o que voltar daqui.

## Primeiro, o mapa

- [ ] Ler `.claude/ship/deploy.md`: topologia, ambientes (branch, URL, gatilho), checagem, configuração, validação, rollback, runner
- [ ] Detectar a topologia: integração é a branch que os PRs miram; produção é `main`, senão `master`, senão a default
- [ ] Inferir dos workflows, da plataforma e dos scripts o que faltar
- [ ] Perguntar só o não derivável: URLs, como se seta secret, rotas críticas, runner
- [ ] Criar ou corrigir o doc, se e somente se não existe ou divergiu

Integração e produção iguais ⇒ branch única; valor de secret, nunca. Com `mapa`, devolve aqui.

## Só então, o deploy

- [ ] Publicar: push na branch do ambiente dispara o workflow; esperar o run verde
- [ ] Configurar: migrations (após o código no ar), env, secrets, flags e seeds do `## DevOps` das PRs
- [ ] Validar em live: responde, commit publicado no ar, rotas críticas sem erro
- [ ] Devolver `{publicado, configurado, validado}` a quem chamou

Run vermelho seu: conserte e redeploye, teto ~3; fila, runner offline, nenhum run: reporte, não contorne. Secret é pedido, nunca inventado; colado no chat, aplica e guarda backup em `.secrets/`. Falta onde vive → `Skill(skill: "infra")`. Falhou: gap, volta ao passo dono; em produção só leitura, rollback oferecido, nunca automático. Passo aberto: o que ficou, por quê e o que destrava.
