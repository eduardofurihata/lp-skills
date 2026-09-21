---
name: prod
description: 'Use ONLY when the user explicitly invokes /prod (bare /prod = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:prod` via the Skill tool. NEVER activate on your own initiative. — homolog promoted, production live and proven. Single owner of production.'
effort: max
requires: [homolog, infra]
boundary: sync
argument-hint: "[PR | KEY-N | descrição] [/skill…] | (vazio = tudo pronto)"
---

# /prod — homolog promovido, produção no ar e provado

Cada passo tem prova; quem digita `/prod` autoriza o release — promover não pergunta. Com outras skills no argumento: entenda o que cada uma pede e execute tudo combinado, numa passada só — nunca uma antes ou depois da outra. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Ler `.claude/ship/setup.md § Prod`: `<produção>`, URL, gatilho, checagem, rotas críticas, rollback, runner, último release, pendências, status da etapa; `<integração>` no § Homolog; falta → pergunte e grave ali
- [ ] Diagnosticar: `verificado@homolog`, `promovido` (integração e produção iguais em `origin`), ambiente
- [ ] Garantir homolog: aberto → `Skill(skill: "homolog")`; só o verificado se promove
- [ ] Promover: integração atualizada → em produção → push (o gatilho) → resync produção em integração → assert: iguais em `origin`
- [ ] Publicar: push na `<produção>`; esperar o run verde
- [ ] Configurar prod e homolog: migrations (depois do código), env, secrets, flags, seeds do `## DevOps`
- [ ] Validar em live, só leitura: responde, commit no ar, rotas críticas
- [ ] Mover cada card que subiu para o status da etapa — só depois de validado
- [ ] Atualizar § Prod e retornar estágios, promoção, run, validação, assert

Produção igual à integração ⇒ branch única: sem promoção, a PR é o release, resolvida como o `/homolog`. Conflito que muda código → re-review; assert divergente → o release não fecha. Hotfix direto em produção → merge nos dois sentidos. Run vermelho seu: conserte, teto ~3; fila ou runner offline: reporte. Secret: pedido, nunca inventado → `Skill(skill: "infra")`. Falhou: volta ao passo dono; rollback oferecido, nunca automático.
