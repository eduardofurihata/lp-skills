---
name: jira
description: 'Use ONLY when the user explicitly invokes /jira (bare /jira = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:jira` via the Skill tool. NEVER activate on your own initiative. — the Jira of THIS repository: the BOARD (machine memory) and the STRUCTURE (`.claude/ship-setup/jira.md`, versioned: real status names, issue types, stage → status, MCP quirks); also the single owner of writing to a card (comment + transition by status NAME) and attaching images. `ler` re-reads the site; `mcp` records a quirk.'
effort: max
argument-hint: "(vazio = mostrar board e estrutura, ou configurar) | <KEY> | <link do board> | ler | mcp"
---

# /jira — o Jira deste repositório: board, estrutura e a escrita no card

Dono **único** de dois fatos: o **board** (site, key, boardId, url — memória da máquina, `$MEM/jira.md`: coordenada de quem usa) e a **estrutura** (`.claude/ship-setup/jira.md` ou `.local.md`: colunas reais, tipos de issue, etapa → status, se comenta, manhas do MCP — igual para quem clona). Quem toca card passa aqui.

## Os guarda-chuvas

- **Perguntar uma vez, lembrar sempre; mapear uma vez, ler sempre.** Os dois arquivos são lidos **explicitamente a cada invocação** e nunca reconfirmados no site — isso é `/jira ler`. A pergunta é **isolada**, uma vez por repositório, e **confirma** o candidato provável.
- **Só grava o validado; transição é por NOME.** Key em `jira_get_all_projects`, board em `jira_get_agile_boards`, status ⊂ colunas, tipos do site, etapa → status confirmado com o usuário. O id da transição muda; o nome fica. Um site por vez: key de outro → avise, não aproxime.
- **Argumento é override, não redefinição.** `/card ALK …` vence sem reescrever a memória; só `/jira <KEY|link>` troca o board, confirmando. Board é de quem usa; colunas são do projeto.

## Fluxo

0. `Rastreamento` do `setup.md` ≠ `Jira` (`obra local`/`kanban local`, `nenhum`) → devolva `{rastreamento}` e encerre. Sem setup → `Skill(skill: "setup")` antes.
1. `cat "$MEM/jira.md"` (`MEM` do system prompt). Sem board → `jira_get_all_projects` + `jira_get_agile_boards`, cruzados com remote e pasta → `AskUserQuestion`: *"Este repositório é do board <KEY> — <projeto> · board <ID>?"*, campo livre para key ou link. Validar; sem board ágil é legítimo; vários → pergunte. Gravar `$MEM/jira.md` + linha no `$MEM/MEMORY.md`.
2. `cat .claude/ship-setup/jira.md`. Sem as quatro seções → mapear: `jira_search` (`project = <KEY>`, `fields: status`) + `jira_get_transitions` → colunas exatas na ordem do board; `jira_get_project_issue_types` → tipos, bug/resto por nome; etapa → status por candidato (In Progress · Review · QA · Done; rework = o de começou), **uma pergunta isolada** com a tabela preenchida; gravar pelo § Template.
3. Devolver `{rastreamento, site, key, boardId, url, origem, estrutura: {colunas, tipos, tipoBug, tipoResto, etapas: {<etapa>: {status, comenta}}, mcp}}` e `📋 Jira: <KEY> · board <ID> · <site> [memória | gravado agora]`.

**Modo direto:** vazio = mostra os dois; `<KEY>`/`<link>` = troca o board; `ler` = refaz o passo 2 e mostra o diff antes de regravar; `mcp` = registra uma manha.

## Sincronizar card — `<KEY>-<N>` + etapa + texto leigo + link

Etapas: **trabalho começou** · **publicado** (`PR: <URL>` / `Publicado em: <branch> @ <hash>`) · **integrado** (`Merged em <integração>: <commit>`) · **no ar em homolog** / **em produção** (`Em <ambiente>: <URL>`, só depois do smoke) · **devolvido ao dev** (o que reprovou + review). Sem Jira, no-op.
1. A linha da etapa no `jira.md` dá `status` e `comenta`.
2. `comenta: sim` → `jira_add_comment`: `## O que foi feito` leigo (o **mesmo** texto do PR) + `---` + `<rótulo>: <link>`; num lote, abre com `<KEY>-<N> — <título>`.
3. `status: <nome>` → `jira_get_transitions` → a transição cujo destino tem esse nome → `jira_transition_issue` (sem `comment`: é ADF). `—` → não transiciona. Nome ausente → avise, siga, sugira `/jira ler`.

## Anexar imagem a um card

Existe upload; não existe a tool `jira_upload_attachment`. `mkdir -p .card-refs/`, copie a imagem (caminho **relativo** ao CWD; fora → `Path traversal`); `jira_update_issue` com `fields: "{}"` + `attachments: ".card-refs/a.png"` (2º passo: `jira_create_issue` não aceita); confira `attachment_results` — anexo que falha não falha o update; cite o arquivo em `## Referências visuais`; limpe `.card-refs/`. Imagem colada no chat não é arquivo — peça o caminho.

## Template — `.claude/ship-setup/jira.md`

`## Board` (Colunas na ordem do board, nomes exatos · Tipos de issue · Tipo para bug · Tipo para o resto) · `## Etapa do pipeline → status` (`| Etapa | Status | Comenta? |`, as seis etapas do § Sincronizar; começou não comenta; sem equivalente → `—`) · `## Comentário` (Idioma · Formato) · `## MCP` (manhas).

## PARE se pensar
"inferi o board do nome da pasta e segui" · "gravei o id da transição" · "uso 'Code Review', é parecido" · "o update deu ok, então anexou"
