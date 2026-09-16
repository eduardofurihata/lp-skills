---
name: setup
description: 'Use ONLY when the user explicitly invokes /setup (bare /setup = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:setup` via the Skill tool. NEVER activate on your own initiative. — how THIS repository ships: the single owner of `.claude/ship-setup/setup.md` (team, versioned; or `setup.local.md`, never versioned): branch policy, commit convention and card key, PR policy, tracking (Jira, obra local, none), card language, DoD, new-card destination, infra and guidelines pointers. Infers from git and gh, asks at most three questions, once.'
effort: max
boundary: [jira, prod, infra]
argument-hint: "(vazio = mostrar o setup, ou criá-lo num repo novo) | branch | commit | pr | jira | infra | guidelines"
---

# /setup — as convenções do time neste repositório

Dono **único** de `.claude/ship-setup/setup.md`: como este time trabalha — branch, commit, PR, rastreamento, cards, ponteiros de infra e guidelines. Todo alvo e modificador começa por aqui. **Resolve como o time trabalha e devolve**; não cria card nem branch.

## Os guarda-chuvas

- **Perguntar uma vez, versionar no projeto, reconferir sempre.** Convenção é do **time** (versionada, revisável em PR), não da máquina (isso é o board). Lida **explicitamente a cada invocação**; completa → não se vai ao GitHub reconfirmar. Lida **sob demanda** — nunca via `CLAUDE.md`, `.claude/rules/` ou memória: carregado em toda sessão é o problema que ela resolve.
- **Declarado ≠ detectado; default, não trava.** Aqui mora **política**; fato tem outro dono: topologia e branches → `deploy.md` (`/infra`); cards de um lote → os commits; board → `/jira`; colunas → `jira.md`; segredos → `infra.md`; padrões de código → `.claude/patterns.md`. Pedido de sessão vale **para a invocação**; só `/setup <seção>` reescreve. Consistência: `direto na integração` ⇒ `Abre PR: não` ⇒ `Aprovação`, `Merge`, `Template` = `—`; branch aceita `Abre PR: não` (sobe por push); contradição não grava.
- **Do time ou só meu — decidido uma vez, para os cinco arquivos** (`setup`, `jira`, `infra`, `deploy`, `patterns`). `setup.md` existe → **time**; só `setup.local.md` → **só meu** (fora do git). Nenhum: `.claude/` não ignorado → time; ignorado → **pergunte** (org alheia ⇒ "só meu" primeiro). Time com `.claude/` ignorado → propor `.claude/*` + `!.claude/ship-setup/` + `.claude/ship-setup/*.local.md`, confirmando.

## Fluxo

1. **Ler:** `cat .claude/ship-setup/setup.md 2>/dev/null || cat .claude/ship-setup/setup.local.md`. Seis seções completas → passo 5; campo faltando → só o que falta, com o default.
2. **Inferir, citando a fonte:** `git log --format=%s -50` (≥ ~70% `tipo(escopo): …` ⇒ Conventional Commits; onde a key aparece); `gh pr list --state merged --limit 25 --json headRefName,title` × commits (PR ou push? `AV-2192` ⇒ `<KEY>-<n>`, `niv-12` ⇒ `<key>-<n>`; várias keys no título ⇒ acumula); `gh api repos/{owner}/{repo}` (`allow_*_merge`: uma só ⇒ é ela); `CODEOWNERS`, PR template, `CONTRIBUTING.md`; board do `/jira` ou `obra/` ⇒ rastreamento. Sem `gh` → diga e pergunte.
3. **Perguntar, uma vez, isolada, ≤ 3** (`AskUserQuestion`, candidato provável como confirmação): Trabalho (direto · por card · acumula) · Aprovação (a própria skill · pessoa/time — só com PR) · Merge (só se o GitHub habilita mais de uma) · Rastreamento (se a inferência não decidiu). **Não pergunte** o que tem default: Nome (`<key>-<n>[-slug]`), Key (git log), DoD (`o ## Como testar`), Destino (`sprint ativa`), Atribuir a (`—`), Infra, Guidelines.
4. **Validar e gravar** pelo § Template no arquivo do modo (`mkdir -p .claude/ship-setup`); time → avise que é versionado e entra no commit de quem chamou.
5. **Devolver** `{branch: {modo, nome}, commit: {convenção, key}, pr: {abre, aprovação, merge, template}, jira: {rastreamento, idioma, dod, destino, atribuir}, infra, guidelines, origem, arquivo}` e `⚙️ Setup (<time | só meu>): <modo> · <convenção> · PR <não | sim> · <rastreamento> [arquivo | criado agora]`.

**Modo direto:** vazio = mostra o setup; não existe → projeto novo: roda tudo e oferece `/infra` e `/jira`, sem invocar. `<seção>` = pergunta o novo valor, valida e reescreve **só ela**.

## Template — `.claude/ship-setup/setup.md`

`## Branch`: Trabalho (`branch por card` · `branch acumula cards` · `direto na integração`) · Nome (`<key>-<n>[-slug]`; `—` se direto) · `## Commit`: Convenção · Key do card (`não entra` · escopo · início · fim · trailer) · `## PR`: Abre PR · Aprovação · Merge (`merge` · `squash` · `rebase`) · Template · `## Jira`: Rastreamento (`Jira` · `obra local` · `nenhum`) · Idioma dos cards · DoD · Destino do card novo (`sprint ativa` · `backlog`) · Atribuir a · Estrutura · `## Infra`: Mapa · Processo · Conta. `## Guidelines`.

## PARE se pensar
"já li o setup nesta sessão" · "não existe, assumo branch por card" · "anoto aqui que o repo é `dev`+`main`" · "ponho no `CLAUDE.md`" · "o usuário disse 'hoje direto', atualizei o arquivo"
