# Template — `.claude/ship-setup/jira.md`

Copie o bloco abaixo para `.claude/ship-setup/jira.md` na raiz do repositório-alvo — ou para `.claude/ship-setup/jira.local.md` quando o processo é **só seu** (o modo é o que o `/setup` decidiu no passo 0 dele; o do time vale quando os dois existem). É a **estrutura** do Jira deste projeto: o que é igual para todo mundo que clona. O **board** (site, key, id) não entra aqui — é coordenada de quem usa e mora na memória da máquina (`/jira`, passo 1). Os comentários HTML são dica de preenchimento, não valor.

```markdown
# Jira — <projeto>

> Estrutura do Jira deste projeto. Dono: `/jira`. Lido pelo motor `jira-sync` a cada etapa do pipeline
> que toca card, e pelo `/card` ao criar. NÃO mora aqui: o board (memória da máquina, `/jira`) ·
> o sprint ativo (descoberto a cada uso) · as convenções do time (`.claude/ship-setup/setup.md`).

## Board
- Colunas: Backlog · A fazer · Em andamento · Em revisão · Homologação · Concluído     <!-- na ordem do board, nomes EXATOS -->
- Tipos de issue: Tarefa · Bug · História · Epic                                        <!-- os que `jira_get_project_issue_types` devolve -->
- Tipo para bug: Bug                                                                     <!-- o que o /card usa quando é bug -->
- Tipo para o resto: Tarefa                                                              <!-- melhoria, feature, tela -->

## Etapa do pipeline → status                <!-- lido pelo jira-sync: transição por NOME de status, nunca por id (o id muda) -->
| Etapa | Status neste board | Comenta? |
|---|---|---|
| trabalho começou (estágio `commit` aberto)         | Em andamento  | não |
| publicado — PR aberto/atualizado, ou push sem PR   | Em revisão    | sim |
| integrado — mergeado na integração                 | Homologação   | sim |
| no ar em homolog, verificado                       | Homologação   | sim |
| no ar em produção, verificado                      | Concluído     | sim |
| devolvido ao dev (rework)                          | Em andamento  | sim |
<!-- status que não existe neste board → "—": o jira-sync comenta e NÃO transiciona, e avisa -->

## Comentário
- Idioma: pt-BR                              <!-- o mesmo do § Jira do setup.md -->
- Formato: `## O que foi feito` leigo + `---` + `<rótulo>: <URL | PR | commit>`   <!-- o do jira-sync; mude só se o time exigir outro -->
- Nome do card sempre claro: título do PR, `## Cards` do PR e cada comentário citam `<KEY>-<N> — <título>`

## MCP — o que este servidor faz, e como                  <!-- as manhas: o que se descobre tropeçando, escrito UMA vez -->
- Servidor: mcp-atlassian (`mcp__atlassian__*`) · site: <site>.atlassian.net · um site por servidor
- Upload de anexo: FUNCIONA — não há tool `jira_upload_attachment`; é `jira_update_issue` com `fields: "{}"` + `attachments: "<caminhos>"`. O arquivo tem de estar DENTRO do CWD (path traversal fora); `jira_create_issue` não aceita anexo (sempre 2º passo); anexo que falha NÃO falha o update — confira `attachment_results`. Receita completa no `/card` (arquivo `jira-anexos.md` das references dele)
- Comentário na transição: NÃO use o parâmetro `comment` de `jira_transition_issue` (é ADF); comente antes com `jira_add_comment`, transicione depois
- <outra manha observada: o que parecia não funcionar, o que funciona, como>
```

## Como preencher

| Campo | De onde sai | Como |
|---|---|---|
| Colunas | `jira_search` (JQL `project = <KEY>`, `fields: status`, `limit: 50`) + `jira_get_transitions` num card de cada coluna visível | os `status.name` distintos, na ordem em que aparecem no board; **nomes exatos** — é por nome que o `jira-sync` transiciona |
| Tipos de issue | `jira_get_project_issue_types` (`project_key`) | os que existem; `Tipo para bug`/`Tipo para o resto` são a escolha do time entre eles |
| Etapa → status | candidato por nome (Em andamento/In Progress/Doing · Em revisão/Code Review · Verificar/Homologação/QA · Concluído/Done) | **confirma com o usuário** numa pergunta isolada, mostrando a tabela preenchida — etapa sem status equivalente fica `—` |
| Comenta? | default da tabela acima | o time pode desligar uma etapa; a linha `trabalho começou` nasce `não` porque a transição já diz tudo |
| MCP | o que já se sabe (upload, ADF) + o que se observou nesta sessão | escreva o **sintoma** (o que parecia não funcionar) e o **caminho** (o que funciona) — é o que impede a próxima pessoa de tropeçar de novo |

## Consistência (validada antes de gravar)

| Se | Então |
|---|---|
| status na tabela etapa→status que não está em `Colunas` | não grava — ou é typo, ou a coluna precisa entrar |
| `Tipo para bug` que não está em `Tipos de issue` | não grava |
| projeto sem board ágil (`boardId` vazio na memória) | `Colunas` são os status do workflow (`jira_get_transitions`), não colunas visuais; o resto igual |
| `.claude/ship-setup/setup.md § Jira → Rastreamento` ≠ `Jira` | este arquivo **não existe** — o `/jira` não roda neste repositório |
