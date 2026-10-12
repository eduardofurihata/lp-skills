---
name: repro
description: 'Use ONLY when the user explicitly invokes /repro (bare /repro = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:repro` via the Skill tool. NEVER activate on your own initiative. — reproduces the report on the front as the user, judged ≥ 90; the dev sees the bug and the fix BEFORE the commit; with a card, it ends by commenting the real description on it, with screenshots.'
requires: [infra, pwx]
argument-hint: "[KEY-N | descrição] [/skill…] | (vazio = card ativo)"
---

# /repro — reproduzir, julgar, mostrar

Reproduz o bug no front como o usuário, antes de codar; o dev aprova as telas do bug, imagem por imagem (parada 1), e vê a correção (parada 2). Não coda. Com card, termina no recard: a descrição real vira um comentário no card, com as telas. Sem card: o mesmo processo, sem Jira e sem criar card.

**Os passos moram em `processo.yaml`, nesta pasta — fonte única.** Com o `runbook` instalado (`runbook --version` responde), o motor conduz e o run é feito **aqui, à vista do dev**, como no `/runbook`:

1. `runbook run <esta pasta>/processo.yaml --dir <projeto> --relato "<KEY ou descrição>"` — daqui em diante, sempre com o id do run.
2. `✋ SUA VEZ` → faça só aquele passo, aqui, e entregue com `runbook entregar <id>`. O navegador é a aba do pwx desta sessão, viva o run inteiro.
3. `⏸ PARADA` → AskUserQuestion; na `parada-1`, `Tudo ok` e `Tudo reprovado` — por imagem vai no campo livre. A fala literal vai com `runbook responder <id> "…"`; token ou senha nela → salve antes em `.secrets/` e responda só o nome da variável. Escalada (`✗`): mostre o motivo; `pular` só se ele mandar.
4. `■ FIM` → a reprodução, o que o dev confirmou e, com card, o link do comentário.

"Em fundo" no argumento → `--fundo`, como no `/runbook`.

Sem `runbook` (outra máquina ou cliente), ou com outras skills no argumento: siga os passos do `processo.yaml` na ordem, um por um. Com outras skills, faça tudo numa passada só junto com os passos delas, nunca uma antes ou depois da outra. Os passos são o checklist do run, em `.claude/ship/run.md`: escreva cada um como `- [ ]`, marque `- [x]` ao fechar e retome do primeiro aberto; quem criou o arquivo apaga ao fim. Passo `juiz` → um subagente novo (Agent tool), que recebe só o texto do passo, nunca a conversa. No `julgar-entendimento`, ele recebe o relato como o dev mandou e, se for um card, lê o card ele mesmo.

**Parada 2**, de quem fecha o commit, antes dele: `runbook run <esta pasta>/parada2.yaml --dir <projeto> --reproducao "<o resultado do /repro>"` (sem runbook: os passos de `parada2.yaml`). O bug apareceu → sem commit.

**§ Repro** no `setup.md` — só identificadores e caminhos, nunca senha ou token:

```
## Repro
- Board: <projeto ou board do Jira> (sem Jira: nenhum)
- Status: <coluna para onde o card vai quando o repro começa> (sem Jira: nenhum)
- Ambiente: local | homolog | prod
- Conta base: <papel> · `.secrets/test-accounts.md` (ou: nenhuma)
- Criar contas de teste: sim, em <ambiente> | não
- Acesso de leitura: <skill, CLI ou MCP — ex. `Skill(skill: "X")`> · <ambiente> · <o que lê> (ou: nenhum)
```

**Contas de teste são do projeto, não da task.** Ficam em `.secrets/test-accounts.md` (ambiente · papel · login · senha · para quê · criada em), com `.secrets/` no `.gitignore`. Antes de criar, procure ali uma que sirva e reutilize; crie só quando nenhuma serve e o § Repro permite, e registre a nova no arquivo, para o próximo run não criar outra. Toda informação de acesso que o dev mandar (token de MCP ou de API, chave, login, senha) é salva em `.secrets/` na hora: `.secrets/<provedor>.env` pelo nome da variável, conta em `test-accounts.md`. O valor nunca vai para resposta, print, log ou commit.

**Cenário de teste, dado real só leitura.** Montar o cenário é fazer: criar grupo, usuário, compra, mudar status. Local e homolog: monte o que precisar. Prod: escreva só em contas e dados de teste, nunca em usuário ou dado real. O dado real, pelo acesso do § Repro, só se lê (SELECT, GET, logs), para copiar o cenário do relato. Efeito que sai do sistema (cobrança real, e-mail a terceiros, nota fiscal) → pergunte antes.
