---
name: infra
description: 'Use ONLY when the user explicitly invokes /infra (bare /infra = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:infra` via the Skill tool. NEVER activate on your own initiative. — the map of the infra config of THIS project in `.claude/ship/infra.md`: the `.secrets/` folder and its variables, providers, accounts and accesses — where each secret lives, never a value. `<provedor>` focuses one; `audit` reports only.'
effort: max
boundary: [prod, setup]
argument-hint: "(vazio = reconferir e mostrar o diff) | <provedor> | audit"
---

# /infra — o mapa da config da infra

**Objetivo: o mapa da infra deste projeto em `.claude/ship/infra.md`** (ou `.local.md`, no modo só-meu do `/setup`) — o que existe, sob qual conta e acesso, e **onde vive cada variável e segredo** da pasta `.secrets/`. Identificador entra; **valor de credencial, nunca** — nem mascarado, nem no chat ou no log. A pasta `.secrets/` fica **na raiz** do repositório e no `.gitignore` (confira; falta → acrescente): **todo token ou credencial que o usuário colar no chat é salvo lá** (`.secrets/<provedor>.env`, pelo nome da variável), como backup para uso futuro — e o mapa registra o nome e onde mora, nunca o valor. O processo de deploy é do `deploy` (`deploy.md`); aqui não se seta variável nem se faz deploy.

## Mapa — cinco passos

1. **Ler o mapa atual** — é contra ele que o diff do fim se mede; não existe → nasce agora. Sem setup, `Skill(skill: "setup")` antes.
2. **Inferir das pastas, citando a fonte.** `.secrets/` por **nomes** (os arquivos e as chaves das variáveis dos `.env`; chaves privadas, `id_*` e JSON de conta de serviço não se abrem; dumps e exports não são credencial), o README do cofre, `.env.example`, `.mcp.json`, arquivos de plataforma (Vercel, Netlify, Railway, Fly), terraform, workflows (segredos do GitHub, runner), compose, schema do banco. Provedores pelos prefixos das variáveis — nem todo `AWS_*` é AWS. Repo Eduzz/Labzz: o recorte deste projeto e um ponteiro para o mapa da conta, nunca uma cópia.
3. **Confirmar os acessos por CLI, só leitura, só o que já está autenticado** — conta, projeto, região, time. Nunca `login`, nunca carregar o cofre no ambiente. Não confirmou → `não confirmado (motivo)`, dito; não se chuta conta pelo nome do projeto.
4. **Perguntar só o não-derivável** — papel de arquivo com nome obscuro, conta canônica entre várias, o que é cópia de outro lugar: *"inferi isto; confirmei aquilo; preciso que você diga isso"*.
5. **Gravar e reportar o diff** — antes, o gate anti-vazamento no rascunho (chave privada, token, senha, connection string com senha → não grava; falso positivo → reescreva a linha e rode de novo). Seções: Provedores e contas · Serviços · Domínios e DNS · **Onde vive cada segredo** (nome · onde mora localmente · onde mora no ambiente · como se obtém) · Dumps e exports em `.secrets/` · Se vazar, ordem de revogação · Identificadores em uso. Report: apareceu, sumiu (pergunte antes de apagar), mudou, não confirmado. `audit` = tudo isto sem gravar.
