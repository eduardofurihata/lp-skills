---
name: setup
description: 'Use ONLY when the user explicitly invokes /setup (bare /setup = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:setup` via the Skill tool. NEVER activate on your own initiative. — the process of THIS repository in `.claude/ship/setup.md`: conventions and the map that connects each ship stage to its branch, Jira status and infra environment. Read, created or updated on every call.'
effort: max
boundary: [jira, prod, infra]
argument-hint: "(vazio = ler, criar ou atualizar) | branch | commit | pr | jira | guidelines"
---

# /setup — decidir o modo, ler, inferir, perguntar, conectar, gravar, devolver

Dono **único** de `.claude/ship/setup.md`: **como este time trabalha e como as peças se ligam** — branch × etapa do ship × Jira × infra. Todo alvo e modificador começa por aqui; a cada chamada o arquivo é lido, criado ou atualizado. Sete passos:

1. **Decidir o modo — do time ou só meu, uma vez, para todos os arquivos de `.claude/ship/`.** `setup.md` existe → time (versionado); só `setup.local.md` → só meu (fora do git; o do time vence). Nenhum → time; com `.claude/` ignorado pelo git, **pergunte** antes de decidir ou de mexer no `.gitignore`.
2. **Ler — a cada invocação, explicitamente.** Completo → passo 5; faltando algo → só o que falta, com o default. Nunca via `CLAUDE.md`, `.claude/rules/` ou memória.
3. **Inferir — o que o repositório já responde, antes de perguntar.** Convenção de commit e key pelo histórico; PR ou push, modo de branch e nome pelas PRs mergeadas; merge e aprovação pelo GitHub e pelos arquivos do time; rastreamento pelo board do `/jira` ou pela pasta `obra/`. Cite a fonte. Inferência **ordena**; o usuário decide.
4. **Perguntar — uma vez, isolada, no máximo três.** Trabalho (direto na integração · branch por card · branch acumula cards) · Aprovação (a própria skill · pessoa) · Merge · Rastreamento — cada uma só se a inferência não decidiu; com candidato provável, a pergunta **confirma**. O resto tem default.
5. **Conectar — o § Processo, lido dos mapas dos donos, nunca inventado.** Uma linha por etapa — `/work` · `/pull-request` · `/homolog` · `/prod` — com a **branch** (o modo daqui + `<integração>`/`<produção>` do `deploy.md`), o **status no Jira** (`jira.md`) e o **ambiente** (nome, URL e provedor do `deploy.md` e do `infra.md`). Mapa que não existe → `—` e o dono nomeado; branch única → homolog `—`. Refeito a cada leitura: retrato, não fonte.
6. **Validar e gravar.** `direto na integração` ⇒ `Abre PR: não` ⇒ aprovação, merge e template `—`; sem Jira, cards e coluna Jira `—`; contradição não grava. Seções: Branch · Commit · PR · Jira (rastreamento, idioma, DoD, destino do card novo, atribuir a) · Processo · Guidelines. O fato mora no dono — topologia no `deploy.md`, board no `/jira`, segredos no `infra.md`.
7. **Devolver** branch, commit, PR, Jira, processo, guidelines, origem e arquivo. Pedido de sessão vale para a invocação e não reescreve; `/setup <seção>` regrava **só ela**. Projeto novo: grava com `—` onde falta mapa e oferece `/jira`, `deploy mapa` e `/infra`, sem invocar.
