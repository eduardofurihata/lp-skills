---
name: jira
description: 'Use ONLY when the user explicitly invokes /jira (bare /jira = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:jira` via the Skill tool. NEVER activate on your own initiative. — the Jira map of THIS repository; card writes; attachments.'
effort: max
argument-hint: "(vazio) | <KEY | link> | ler | mcp"
---

# /jira — mapa · sincronizar · anexar

**Objetivo: o mapa do Jira deste repositório em `.claude/ship/jira.md`** — colunas reais, tipos de issue, etapa → status, se comenta, manhas do MCP.

## Mapa

1. **Tem Jira?** `Rastreamento` ≠ `Jira` no setup → devolva e encerre.
2. **O board** — da memória da máquina; sem ele, confirme o candidato provável numa pergunta isolada, valide e grave; key no argumento vence sem reescrever.
3. **O mapa** — leia o arquivo; sem ele, mapeie do site (colunas exatas, tipos, etapa → status) e **confirme com o usuário** antes de gravar. `ler` refaz com o diff.
4. **Devolver** rastreamento, board e mapa. `mcp` grava uma manha.

## Sincronizar card

1. **A linha da etapa** dá status e se comenta: começou · publicado · integrado · no ar em homolog / em produção (depois de validado) · devolvido ao dev. Sem Jira, no-op.
2. **Comentar, se comenta** — `## O que foi feito` leigo (o mesmo da PR) + rótulo e link, separado da transição.
3. **Transicionar pelo NOME do status**, descobrindo a transição na hora; `—` não transiciona; nome ausente → avise, siga, sugira `ler`.

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
