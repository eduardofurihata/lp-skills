# Anexar imagem a um card do Jira via MCP (mcp-atlassian)

> **Existe upload — o que não existe é a tool `jira_upload_attachment`.** Procurar por ela é o que leva ao "o MCP não anexa". O upload é um parâmetro do `jira_update_issue` (verificado no código do `mcp-atlassian` 0.23.x). Dono: `/jira`. Lido pelo `/card` ao subir referências visuais e por quem anexar evidência de QA ou print de review.

## Receita — nesta ordem

1. **Materializar no projeto.** `mkdir -p .card-refs/` e copie cada imagem para lá, com nome curto e descritivo. O caminho passa por checagem anti-traversal: é resolvido contra o CWD do servidor MCP e **rejeitado se escapar** (symlink é resolvido antes; não contorna). `~/Downloads`, `/tmp` ou absoluto de fora → `ValueError: Path traversal detected: … resolves outside <base>` — o `<base>` da mensagem é o CWD real; é para lá que o arquivo vai. Use **caminho relativo**.
2. **Anexar** — o card já existe: `jira_create_issue` **não aceita** anexo, é sempre o 2º passo.
   ```
   mcp__atlassian__jira_update_issue
     issue_key:   <KEY>-<N>
     fields:      "{}"                                   ← obrigatório mesmo só anexando
     attachments: ".card-refs/ref-01.png,.card-refs/ref-02.png"   ← lista por vírgula ou JSON array string
   ```
3. **Verificar.** Anexo que falha **não falha o update** (o servidor loga o erro e segue): confira `attachment_results` no retorno, ou `jira_get_issue` → `attachment`. Quantos subiram de quantos vai ao report. Sem conferir, "anexado" é palpite.
4. **Citar.** A descrição nomeia cada anexo pelo arquivo em `## Referências visuais`; se o rascunho não os nomeou, `jira_update_issue` com `fields: {"description": "<descrição atualizada>"}`.
5. **Limpar.** `rm -rf .card-refs/` depois de confirmado.

## O que é arquivo e o que não é

| Origem | Anexa? |
|---|---|
| Imagem **colada** no chat | não vira arquivo em disco — **peça o caminho** (ou que o usuário salve) |
| Arquivo arrastado / caminho informado | sim — copie para `.card-refs/` |
| Screenshot do Playwright, arquivo baixado | sim — já está em disco |

Quem executa o card não estava na conversa: imagem que o usuário mostrou e não subiu é contexto perdido.

**Não vá pela REST direto** (`POST /rest/api/3/issue/{key}/attachments`): exigiria e-mail + API token fora do MCP — credencial nova, com risco de vazar para o repositório. O MCP já está autenticado no site certo.

## PARE se pensar
"não achei tool de upload, então não dá" · "passei o caminho de `~/Downloads`" · "o update deu ok, então anexou" · "o usuário viu no chat, não precisa anexar"
