---
name: repro
description: 'Use ONLY when the user explicitly invokes /repro (bare /repro = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:repro` via the Skill tool. NEVER activate on your own initiative. — reproduces the report on the front as the user, judged ≥ 90; the dev sees the bug and the fix BEFORE the commit; with a card, it ends by commenting the real description on it, with screenshots.'
requires: [infra, pwx]
argument-hint: "[KEY-N | descrição] [/skill…] | (vazio = card ativo)"
---

# /repro — reproduzir, julgar, mostrar

Reproduz o bug no front como o usuário, antes de codar; o dev aprova as telas do bug, imagem por imagem (parada 1), e vê a correção (parada 2). Não coda. Com card, termina no recard: a descrição real vira um comentário no card, com as telas. Sem card: o mesmo processo, sem Jira e sem criar card.

**Os passos moram em `processo.yaml`, nesta pasta — fonte única.** Com o `runbook` instalado (`runbook --version` responde), quem os executa é o motor, um por vez, na mesma conversa; você só acompanha:

1. `runbook run <esta pasta>/processo.yaml --dir <projeto> --relato "<KEY ou descrição>"` pelo **Monitor**, timeout máximo — cada linha é um evento. Monitor expirou → `runbook seguir <run>`.
2. Repasse cada linha ao dev numa frase curta. Você não executa passo nenhum, não resume e não pula.
3. `⏸ PARADA` ou `⏸ PERGUNTA` → pergunte ao dev com AskUserQuestion: as `opções:` da linha; sem elas, `Pular este passo` (→ `runbook pular`) e `Parar o run` (→ `runbook parar`); na `parada-1`, `Tudo ok` e `Tudo reprovado` — por imagem vai no campo livre. A fala literal dele vai com `runbook responder <run> "…"`, pelo Monitor — se ela trouxer um token ou senha, salve-o antes em `.secrets/` e responda só o nome da variável: o que vai no `responder` fica gravado no estado do run. Escalada (`✗`): mostre o motivo — `responder` refaz o passo com a orientação dele; `pular` só se ele mandar, com as palavras dele.
4. `■ FIM` → mostre o resultado: a reprodução, o que o dev confirmou e, com card, o link do comentário.

Sem `runbook` (outra máquina ou cliente), ou com outras skills no argumento: siga os passos do `processo.yaml` na ordem, um por um — com outras skills, numa passada só com os delas, nunca uma antes ou depois da outra. Os passos são o checklist do run, em `.claude/ship/run.md`: escreva cada um como `- [ ]`, marque `- [x]` ao fechar, retome do primeiro aberto; quem o criou apaga ao fim. Passo `juiz` → um subagente novo (Agent tool), que recebe só o texto do passo, nunca a conversa; no `julgar-entendimento`, ele recebe o relato como o dev mandou e, sendo um card, lê o card ele mesmo.

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
