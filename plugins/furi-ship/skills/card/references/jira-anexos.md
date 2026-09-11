# Anexar arquivo a um card do Jira via MCP — mapeamento

> **Existe upload via MCP.** O que não existe é uma tool chamada `jira_upload_attachment` — e é procurar por ela que leva à conclusão errada de que "o MCP não faz upload". Este arquivo mapeia o caminho certo, verificado no código do `mcp-atlassian` 0.23.x.

## O caminho certo, em uma linha

**`mcp__atlassian__jira_update_issue` com o parâmetro `attachments`.**

```
mcp__atlassian__jira_update_issue
  issue_key:   NIV-42
  fields:      "{}"                                   ← obrigatório mesmo quando só se anexa
  attachments: ".card-refs/ref-01.png,.card-refs/ref-02.png"
```

`attachments` aceita **lista separada por vírgula** ou **JSON array string** (`'[".card-refs/a.png"]'`).

## As quatro regras que fazem isso funcionar (ou falhar em silêncio)

### 1. Não existe tool de upload dedicada

O servidor expõe, para anexos, apenas **leitura**: `jira_download_attachments` e `jira_get_issue_images`. O upload vive **dentro** do `update_issue` (`servers/jira.py` → `jira/issues.py`, que chama `upload_attachments()` de `jira/attachments.py`). Procurar por "upload" na lista de tools não encontra nada — e a ausência não significa que não dá.

### 2. `jira_create_issue` NÃO aceita `attachments`

Anexar é **sempre um segundo passo**, depois de o card existir e ter key. Não tente criar já com anexo.

### 3. O arquivo precisa estar DENTRO do CWD do servidor MCP

O caminho passa por uma validação anti-traversal (`utils/io.py`): ele é resolvido contra o diretório de trabalho e **rejeitado se escapar**. Symlink é resolvido antes, então linkar não contorna.

```
ValueError: Path traversal detected: /home/user/Downloads/print.png resolves outside /home/user/GitHub/projeto
```

- **Consequência prática:** imagem em `~/Downloads`, `/tmp` ou qualquer lugar fora do projeto **falha**. Copie para dentro do projeto (ex.: `.card-refs/`) e passe **caminho relativo**.
- **A mensagem de erro é útil:** ela revela o `<base>` — o CWD real do servidor. Se não for o diretório que você esperava, é para lá que o arquivo precisa ir.

### 4. Anexo que falha NÃO falha o update

O código loga o erro e **segue com o update** ("continue with the update even if attachments fail"). O retorno traz `attachment_results` em `custom_fields`.

> **Portanto: verificar é obrigatório.** Sem conferir `attachment_results` (ou reler com `jira_get_issue`), você reporta um sucesso que pode não ter acontecido. Nunca diga "anexado" sem ter olhado.

## Receita completa

```
1. mkdir .card-refs/  e copiar as imagens pra lá   (nomes curtos e descritivos)
2. jira_update_issue  issue_key=<KEY>-<N>  fields="{}"  attachments=".card-refs/a.png,.card-refs/b.png"
3. conferir attachment_results  (ou jira_get_issue) — quantos subiram de quantos
4. atualizar a descrição com "## Referências visuais" citando os anexos pelo nome
5. rm -rf .card-refs/
```

## Imagem colada no chat

Imagem **colada** na conversa não vira arquivo em disco — não há caminho para passar. **Peça o caminho ao usuário** (ou que ele salve o arquivo). Já estão em disco, e servem direto: imagem arrastada/informada por caminho, screenshot do Playwright, arquivo baixado.

## Por que não usar a API REST direto

Funcionaria (`POST /rest/api/3/issue/{key}/attachments` com `X-Atlassian-Token: no-check`), mas exigiria Basic Auth com e-mail + API token — credencial nova, gerenciada fora do MCP, com risco de vazar para o repositório. **O MCP já está autenticado no site certo.** Use o MCP.

## Reúso

A mecânica é do Jira, não do `/card`. `/work` e `/pull-request` também tocam cards e podem consumir este arquivo quando precisarem anexar (evidência de QA, screenshot de review) — sem redefinir nada.
