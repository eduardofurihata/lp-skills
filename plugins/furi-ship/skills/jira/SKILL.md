---
name: jira
description: 'Use ONLY when the user explicitly invokes /jira (bare /jira = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:jira` via the Skill tool. NEVER activate on your own initiative. — creates and keeps the MAP of the Jira board of THIS repository in `.claude/ship/jira.md` (real status names, issue types, stage → status, MCP quirks) plus the board in machine memory; single owner of writing to a card and of attaching images. `ler` re-reads the site; `mcp` records a quirk.'
effort: max
argument-hint: "(vazio = mostrar o mapa, ou criá-lo) | <KEY> | <link do board> | ler | mcp"
---

# /jira — criar o mapa do board · sincronizar card · anexar imagem

**Objetivo: o mapa do Jira deste repositório em `.claude/ship/jira.md`** (ou `.local.md`) — colunas reais, tipos de issue, etapa → status, se comenta, manhas do MCP; o **board** (site, key, id) fica na memória da máquina, coordenada de quem usa. Se o projeto tem Jira, é o `/setup` quem diz.

## Criar o mapa — quatro passos, a cada invocação

1. **Tem Jira?** `Rastreamento` do setup ≠ `Jira` (`obra local`, o antigo `kanban local`, `nenhum`) → devolva isso e encerre. Sem setup → `Skill(skill: "setup")`.
2. **O board — da memória; perguntar só na primeira vez.** Sem board → levante projetos e boards reais do site, cruze com o remote e a pasta, e **confirme** o candidato provável numa pergunta **isolada** (campo livre para key ou link). Valide key e board no site antes de gravar (outro site: avise, não aproxime; vários boards: pergunte). Grave a memória e a linha no índice. Key no argumento de outra skill **vence sem reescrever**; só `/jira <KEY|link>` troca, confirmando.
3. **O mapa — ler `.claude/ship/jira.md`; mapear só na primeira vez.** Sem as quatro seções → do site, colunas com nomes exatos na ordem do board, tipos de issue (qual é bug, qual é o resto), etapa → status por candidato de nome, **confirmado com o usuário** numa pergunta isolada com a tabela preenchida; contradição não grava. Seções: Board (colunas, tipos, qual é bug) · Etapa do pipeline → status (`| Etapa | Status | Comenta? |`, as seis etapas abaixo; sem equivalente → `—`) · Comentário (idioma, formato) · MCP (manhas: sintoma → caminho). Só volta ao site com `ler`, com o diff antes de regravar.
4. **Devolver** rastreamento, site, key, board, origem e o mapa. Vazio mostra os dois; `mcp` grava uma manha.

## Sincronizar card — `<KEY>-<N>`, etapa, texto leigo, link

1. **A linha da etapa no mapa** dá status e se comenta. Etapas: **trabalho começou** · **publicado** (PR, ou branch e commit) · **integrado** · **no ar em homolog** / **em produção** (só depois de validado) · **devolvido ao dev**. Sem Jira, no-op declarado.
2. **Comentar, se a etapa comenta** — `## O que foi feito` leigo (o **mesmo** texto da PR) e o rótulo com o link; num lote, abre com `<KEY>-<N> — <título>`. Comentário separado da transição (o parâmetro dela é ADF).
3. **Transicionar pelo NOME do status**, descobrindo a transição na hora — o id muda, o nome fica. `—` não transiciona. Nome ausente → avise, siga, sugira `/jira ler`; nunca a parecida.

## Anexar imagem a um card

**Existe upload — o que não existe é a tool `jira_upload_attachment`.** Procurar por ela é o que leva ao "o MCP não anexa": o upload é um parâmetro do `jira_update_issue` (verificado no código do `mcp-atlassian` 0.23.x). Cinco passos:

1. **Materializar no projeto.** `mkdir -p .card-refs/` e copie cada imagem para lá, com nome curto. O caminho é resolvido contra o CWD do servidor MCP e **rejeitado se escapar** (symlink é resolvido antes; não contorna): `~/Downloads`, `/tmp` ou absoluto de fora → `ValueError: Path traversal detected: … resolves outside <base>`. Use **caminho relativo**.
2. **Anexar** — o card já existe (`jira_create_issue` **não aceita** anexo; é sempre o 2º passo):
   ```
   mcp__atlassian__jira_update_issue
     issue_key:   <KEY>-<N>
     fields:      "{}"                                            ← obrigatório mesmo só anexando
     attachments: ".card-refs/ref-01.png,.card-refs/ref-02.png"  ← lista por vírgula ou JSON array string
   ```
3. **Verificar.** Anexo que falha **não falha o update**: confira `attachment_results` no retorno, ou `jira_get_issue` → `attachment`. Quantos subiram de quantos vai ao report — sem conferir, "anexado" é palpite.
4. **Citar.** A descrição nomeia cada anexo pelo arquivo em `## Referências visuais`; se o rascunho não os nomeou, atualize a descrição.
5. **Limpar.** `rm -rf .card-refs/` depois de confirmado.

Imagem **colada** no chat não vira arquivo em disco — **peça o caminho**, ou que o usuário salve; arquivo arrastado, caminho informado, screenshot ou download já estão em disco: copie. Quem executa o card não estava na conversa: imagem mostrada e não anexada é contexto perdido. **Não vá pela REST direto** (`POST …/attachments`): exigiria e-mail + token fora do MCP — credencial nova, com risco de vazar para o repositório.
