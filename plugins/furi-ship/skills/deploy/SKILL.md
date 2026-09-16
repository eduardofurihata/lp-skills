---
name: deploy
description: 'Use ONLY when another skill invokes `furi-ship:deploy` via the Skill tool, with the environment as the argument — never when the user types something. NEVER activate on your own initiative. — the deploy order: publish (take what we built to the infra, GitHub Actions on a self-hosted runner) → configure the infra (migrations, env, secrets, flags, seeds) → validate live that it really got updated (not a long QA test) → update Jira. Internal: /homolog and /prod call it.'
effort: max
user-invocable: false
requires: [jira, infra]
argument-hint: "<homolog | prod>"
---

# deploy — publicar, configurar, validar, atualizar o Jira

Skill **interna**, invocada por `/homolog` e `/prod` com o ambiente. O **como** de cada projeto é o `deploy.md` (`/infra` § Deploy); **onde** vive cada segredo é o `infra.md`. Quatro passos, nesta ordem, cada um provado antes do seguinte:

1. **Publicar — levar o que fizemos para a infra.** O push na branch do ambiente dispara o workflow (GitHub Actions, runner self-hosted); espere o run ficar **verde**. Vermelho não subiu: o que é seu (configuração, migration, env) conserte e redeploye, teto ~3; o resto, reporte. Fila é fila (runner offline ou label errado): reporte, não contorne. Nenhum run → gap do workflow.
2. **Configurar — a infra.** Migrations (sempre depois do código no ar), env, secrets, flags e seeds que o `## DevOps` dos PRs desde o último deploy exigem. **Como** se seta é o `deploy.md`; **onde** vive é o `infra.md` (falta → `Skill(skill: "infra")`); o **valor** de secret é pedido, nunca inventado nem escrito. Release de produção configura prod **e** homolog. O que não aplicou fica pendente, com motivo.
3. **Validar — verificar em live se realmente foi atualizado.** Não é teste longo de QA: o ambiente responde, o que está no ar é o commit publicado e as rotas críticas do `deploy.md` abrem sem erro. Fora do ar, versão antiga ou variável ausente → gap, volta ao passo dono. Em produção só leitura; rollback é **oferecido**, nunca automático.
4. **Atualizar o Jira.** `/jira` § Sincronizar, etapa **no ar em homolog** / **em produção** — só depois de validado. Devolva a quem chamou `{publicado, configurado, validado, cards[]}`; com passo aberto, **o que ficou, por quê e o que destrava** — meio-caminho relatado como sucesso é o defeito que este pacote conserta.
