---
name: infra
description: 'Use ONLY when the user explicitly invokes /infra (bare /infra = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:infra` via the Skill tool. NEVER activate on your own initiative. — the infrastructure of THIS project, in two versioned files it owns: `infra.md` (the map: providers, accounts, services, domains, WHERE each secret lives — never a value) and `deploy.md` (the process: detected topology, environments, how to deploy, check, configure, validate, roll back). `/infra <provedor>` focuses one; `audit` reports only.'
effort: max
boundary: [prod, setup]
argument-hint: "(vazio = reconferir e mostrar o diff) | <provedor> | audit"
---

# /infra — mapear a infra, registrar o deploy

Dono **único** de dois arquivos em `.claude/ship/` (ou `.local.md`, no modo só-meu do `/setup`): **`infra.md`**, o mapa — o que existe, sob qual conta, onde vive cada segredo; **`deploy.md`**, o processo — topologia, ambientes, como sobe, se checa, se configura, se valida, volta. Lidos por caminho, nunca auto-carregados. Aqui não se seta variável nem se faz deploy.

## Mapa — `infra.md`

Cinco passos, nesta ordem, e nenhum valor de credencial em nenhum deles:

1. **Ler o mapa atual** — é contra ele que o diff do fim se mede; não existe → nasce agora. O modo (time ou só meu) é o do `/setup`; sem setup, `Skill(skill: "setup")` antes.
2. **Inferir de arquivo, citando a fonte.** `.secrets/` por **nomes** (arquivos e chaves das variáveis — chaves, `.pem` e JSON de conta de serviço não se abrem), o README do cofre, `.env.example`, arquivos de plataforma, workflows (segredos do GitHub, runner self-hosted), terraform, compose; provedores pelos prefixos das variáveis — nem todo `AWS_*` é AWS. Repo Eduzz/Labzz: o recorte deste projeto e um ponteiro para o mapa da conta, nunca uma cópia.
3. **Confirmar por CLI, só leitura, só o que já está autenticado** — conta, projeto, região. Nunca `login`, nunca carregar o cofre no ambiente. Não confirmou → `não confirmado (motivo)`, dito. Julgamento, não estado: contagem, fatura e saúde envelhecem errado.
4. **Perguntar só o não-derivável** — papel de arquivo com nome obscuro, conta canônica entre várias, o que é cópia de outro lugar: *"inferi isto; confirmei aquilo; preciso que você diga isso"*.
5. **Gravar e reportar o diff** — depois do gate anti-vazamento no rascunho (chave privada, token, senha, connection string com senha → não grava; falso positivo → reescreva a linha e rode de novo). Seções: provedores e contas · serviços · domínios e DNS · **onde vive cada segredo** (nome, onde mora localmente, onde mora no ambiente, como se obtém) · artefatos em `.secrets/` · se vazar, ordem de revogação · identificadores em uso. Report: apareceu, sumiu (pergunte antes de apagar), mudou, não confirmado. `audit` = tudo isto sem gravar.

## Deploy — `deploy.md`, lido pelos alvos e pelo `deploy`

Três passos, nesta ordem, toda vez que alguém precisa da topologia:

1. **Detectar — a integração é para onde o trabalho converge de fato.** A primeira evidência decide: o `deploy.md` já registra os nomes (só confirma) → a branch que os PRs recentes miram → uma branch de integração usual em `origin` (mais de uma → pergunte) → a default do GitHub. Produção: `main`, senão `master`, senão a default. Integração ≠ produção ⇒ **duas branches** (`<integração>` publica o ambiente homolog); iguais ⇒ **branch única**, só prod. `dev` + `main` é só o padrão; branch parada que nenhum PR mira é legado; `dev` só local é branch única.
2. **Ler o doc — ou escrevê-lo uma vez.** Confere com o detectado → seguir, zero pergunta. Divergiu → reportar o que mudou e corrigir, nunca seguir com contexto errado. Não existe → inferir dos workflows (o que dispara o deploy, o runner), da plataforma e dos scripts, e perguntar só URLs, como se seta secret em cada ambiente, rotas críticas e onde está o runner; URL ou comando inventado é pior que perguntar. Gravar avisando que é versionado.
3. **O doc, seção a seção:** Topologia · Ambientes (ambiente, branch, URL, dispara por — é daqui que se lê "tem homolog?" e o nome real de cada branch; ambiente novo é uma linha a mais) · Como checar (comandos exatos) · Configuração (**como** se seta em cada ambiente — onde vive é o `infra.md`) · Validação pós-deploy (rotas críticas, onde estão as credenciais de teste) · Rollback · Runner (onde, como saber se está online). Nunca um valor de secret.
