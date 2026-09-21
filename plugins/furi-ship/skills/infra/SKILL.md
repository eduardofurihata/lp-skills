---
name: infra
description: 'Use ONLY when the user explicitly invokes /infra (bare /infra = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:infra` via the Skill tool. NEVER activate on your own initiative. — the infra map of THIS project in `.claude/ship/infra.md`: providers, accounts, accesses and where each secret lives, never a value. `audit` reports only.'
effort: max
boundary: [homolog, prod]
argument-hint: "(vazio = reconferir e mostrar o diff) | <provedor> | audit"
---

# /infra — o mapa da infra

O que existe, sob qual conta e acesso, e onde vive cada segredo de `.secrets/` — identificador entra; valor, nunca. `.secrets/` fica na raiz e no `.gitignore`; token colado no chat é salvo lá (`.secrets/<provedor>.env`) e o mapa registra só o nome e onde mora. Publicar e configurar: `/homolog` e `/prod`. Com outras skills no argumento: entenda o que cada uma pede e execute tudo combinado, numa passada só — nunca uma antes ou depois da outra. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Ler `.claude/ship/infra.md` (ou `infra.local.md`, fora do git); não existe → nasce agora
- [ ] Inferir das pastas, citando a fonte: `.secrets/` pelos nomes (chave privada e JSON de conta de serviço não se abrem), `.env.example`, `.mcp.json`, plataforma, terraform, workflows, compose, schema; provedores pelos prefixos, nem todo `AWS_*` é AWS
- [ ] Confirmar os acessos por CLI, só leitura, só o já autenticado (conta, projeto, região, time); nunca `login`; não confirmou → dizer o motivo
- [ ] Perguntar só o não-derivável, dizendo o que inferiu e confirmou
- [ ] Passar o gate anti-vazamento: chave privada, token, senha, connection string → não grava
- [ ] Gravar as seções: Provedores e contas · Serviços · Domínios e DNS · Onde vive cada segredo (nome · onde mora · como se obtém) · Dumps e exports · Se vazar, ordem de revogação · Identificadores em uso
- [ ] Reportar o diff: apareceu, sumiu (pergunte antes de apagar), mudou, não confirmado; `audit` = sem gravar

Repo Eduzz/Labzz: o recorte deste projeto e um ponteiro para o mapa da conta, nunca cópia; conta não se chuta pelo nome do projeto.
