---
name: infra
description: 'Use ONLY when the user explicitly invokes /infra (bare /infra = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:infra` via the Skill tool. NEVER activate on your own initiative. — the infra map of THIS project in `.claude/ship/infra.md`: accounts, accesses, where each secret lives (never a value), homolog and prod environments. `audit` reports only.'
effort: max
boundary: [homolog, prod]
argument-hint: "(vazio = reconferir e mostrar o diff) | <provedor> | audit"
---

# /infra — o mapa da infra

Contas, acessos, onde vive cada segredo de `.secrets/` e os ambientes de homolog e prod — identificador entra; valor, nunca. `.secrets/` fica na raiz, no `.gitignore`; token colado no chat é salvo lá (`.secrets/<provedor>.env`), o mapa registra só o nome. Com outras skills no argumento: entenda o que cada uma pede e execute tudo combinado, numa passada só — nunca uma antes ou depois da outra. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Ler `.claude/ship/infra.md` (ou `infra.local.md`, fora do git); não existe → criar
- [ ] Inferir das pastas, citando a fonte: `.secrets/` pelos nomes (chave privada e JSON de conta de serviço não se abrem), `.env.example`, `.mcp.json`, plataforma, workflows; provedores pelos prefixos
- [ ] Confirmar os acessos por CLI, só leitura, só o já autenticado (conta, projeto, região); nunca `login`; não confirmou → diga o motivo
- [ ] Mapear os ambientes de homolog e prod: branch que publica, URL, gatilho e run, como configurar (env, secrets, migrations, flags, seeds), como checar, rollback
- [ ] Perguntar só o não-derivável
- [ ] Passar o gate anti-vazamento: chave privada, token, senha, connection string → não grava
- [ ] Gravar as seções: Provedores e contas · Serviços · Domínios e DNS · Onde vive cada segredo (nome · onde mora · como se obtém) · Ambientes (homolog, prod) · Dumps e exports · Se vazar, ordem de revogação
- [ ] Reportar o diff: apareceu, sumiu (pergunte antes de apagar), mudou; `audit` = sem gravar

Repo Eduzz/Labzz: o recorte deste projeto e um ponteiro para o mapa da conta, nunca cópia.
