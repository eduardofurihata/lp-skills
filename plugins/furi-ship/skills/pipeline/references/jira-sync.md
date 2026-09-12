# Jira Sync — refletir no card o estado que a mudança alcançou

> **Fonte única da escrita no card.** Antes deste arquivo, a mesma sequência estava escrita em **três** lugares — três cópias que já divergiam no detalhe. Quem toca card aponta para cá; ninguém redescreve a mecânica. Motor de **apoio**: não decide fluxo; é chamado pelo motor de estágio que acabou de fechar um estágio.

**Responsabilidade única:** dado um card e o estágio que a mudança alcançou, **comentar** (se o `jira.md` diz que esta etapa comenta) e **transicionar** para o status que o `jira.md` mapeia. Não decide se o estágio foi alcançado (isso é do motor de estágio), não cria card (isso é `/card`), não descobre o board nem a estrutura (isso é `/jira`).

## Contrato

| Entrada | Saída |
|---|---|
| `<KEY>-<N>` + estágio alcançado + o que foi entregue (linguagem leiga) + URL/PR/commit | card comentado e/ou transicionado conforme o `jira.md`, ou avisado do que não havia |

O board (`<KEY>`, site) e a **estrutura** (`etapas: {<etapa>: {status, comenta}}`, `comentario: {idioma, formato}`) vêm do **`/jira`** (Step 0 de quem chama) — nunca hardcoded, nunca redescobertos aqui. Via `mcp__atlassian__*`.

**Sem Jira** (`rastreamento` ≠ `Jira`, do `/setup` via `/jira`) → este motor é **no-op declarado**: registra `Jira: — (Rastreamento: <x>)` no relatório do motor que chamou e devolve. Não pergunta board, não tenta comentar.

## A sequência — sempre nesta ordem

### 0. Ler a linha da etapa no mapa

No `estrutura.etapas` devolvido pelo `/jira` (o `## Etapa do pipeline → status` do `.claude/ship-setup/jira.md`), a linha da etapa alcançada diz duas coisas: **`status`** (o nome exato do status de destino, ou `—`) e **`comenta`** (sim/não).

| Estágio fechado | Etapa no `jira.md` | Quem chama |
|---|---|---|
| `commit` aberto pela primeira vez (o trabalho começou) | trabalho começou | `work-cycle.md` |
| `push` / `pr` | publicado | `pr-publish.md` |
| `integrado` | integrado | `pr-cycle.md` |
| `verificado@homolog` | no ar em homolog | `smoke.md` |
| `verificado@prod` | no ar em produção | `smoke.md` |
| rejeição no `pr-cycle` § 5 | devolvido ao dev | `pr-cycle.md` |

### 1. Comentar — só se `comenta: sim`

`mcp__atlassian__jira_add_comment` com `issue_key: <KEY>-<N>`, no idioma do `comentario.idioma` e no formato do `comentario.formato` (o default é este):

```markdown
## O que foi feito
[Linguagem simples, ZERO jargão — qualquer pessoa entende o problema que existia e o que mudou.
Concreto, com antes/depois.]

---
<rótulo do estágio>: <URL do ambiente | PR | commit>
```

**A descrição leiga é escrita UMA vez e reusada.** O `## O que foi feito` do PR (`pr-publish`) é o mesmo texto que vai para o card — não reescreva, não "adapte para o Jira". **O nome do card fica claro em tudo**: o comentário abre com `<KEY>-<N> — <título>` quando o card não é o único da branch (é o que deixa o histórico legível num lote).

### 2. Transicionar — pelo NOME que o `jira.md` diz, descobrindo o id na hora

`status: —` na linha da etapa → **não transiciona**; o comentário do passo 1 (se houve) já registrou o fato. Avise uma vez no relatório.

`status: <nome>` →

```
mcp__atlassian__jira_get_transitions   issue_key: <KEY>-<N>
```
Escolher a transição cujo **destino** tem exatamente o `<nome>` do `jira.md` (o id muda quando alguém edita o workflow; o nome é o que o `/jira` gravou e o time enxerga no board).

```
mcp__atlassian__jira_transition_issue   issue_key: <KEY>-<N>   transition_id: <id da escolhida>
```

> **Sem `comment` na transição.** O parâmetro existe mas o formato é ADF; o comentário vai no passo 1, sempre separado.

**O nome do `jira.md` não está entre as transições disponíveis** (o card já está lá; o workflow mudou; a transição depende de outro status) → **avise e siga** — a entrega não trava por causa de status — e **sugira `/jira ler`** no relatório: é o sinal de que a estrutura gravada e o board divergiram. **Nunca** escolha "a parecida": o `jira.md` existe para isso não acontecer.

## Rótulo de cada estágio — o que vai depois do `---`

| Estágio | Rótulo |
|---|---|
| trabalho começou | *(sem comentário por default — `comenta: não`; a transição diz tudo)* |
| publicado, com PR — **em cada card da branch** | `PR: <URL>` · `Branch: <branch>` |
| publicado, sem PR (§ PR `Abre PR: não`) — em cada card da branch | `Publicado em: <branch> @ <hash>` · `Branch: <branch>` |
| integrado | `Merged em <integração>: <commit>` |
| **no ar em homolog, verificado** | `Em homolog: <URL>` |
| **no ar em produção, verificado** | `Em produção: <URL>` |
| devolvido ao dev (rework) | o que reprovou + link do review |

> **"No ar" só se diz depois do `smoke.md`.** Comentar "está em homolog" com o run vermelho, ou antes da verificação, é a mentira que este trabalho inteiro existe para impedir.

## Um site por vez

O MCP alcança apenas o site do `JIRA_URL` configurado. Key ausente naquele site → **avisar** que o card pode estar em outro site. **Nunca** aproximar para uma key parecida.

## Red Flags — STOP

- "Sei que o status chama 'Concluído', transiciono direto" → NÃO. O nome vem do `jira.md`; o **id** vem de `get_transitions`, **sempre** — o workflow é de cada projeto e o id muda.
- "O `jira.md` diz 'Em revisão' mas não existe; uso 'Code Review', é parecido" → NÃO. Avisa, segue sem transicionar, sugere `/jira ler`. Parecido é como a verdade se perde.
- "Não tem `jira.md`, então descubro a transição pelo nome como antes" → NÃO. Sem estrutura, o `/jira` (Step 0 de quem chamou) a teria mapeado. Se você está aqui sem ela, o Step 0 não rodou — volte.
- "Passo o comentário junto na transição, é uma chamada menos" → NÃO. ADF. Comentário no passo 1, transição no 2.
- "Não achei transição equivalente, então paro a entrega" → NÃO. Avisa e segue.
- "`comenta: não`, mas comento mesmo assim pra ficar registrado" → NÃO. O time desligou por um motivo. A transição registra.
- "Sem Jira, então invento um comentário no kanban local" → NÃO. Sem Jira é no-op declarado. O kanban local é do `/method`.
- "Escrevo a descrição técnica no card, o dev entende" → NÃO. Quem lê o card não estava na conversa e pode não ser dev. Linguagem leiga, com antes/depois.
- "Reescrevo o resumo para o Jira" → NÃO. É o **mesmo** texto do PR. Escreve uma vez, usa nos dois.
- "Comento 'está em homolog' logo depois de mergear" → NÃO. Merge ≠ no ar. Só depois do `smoke.md`.
- "Copio esta sequência para dentro da minha skill, fica mais direto" → NÃO. Foi assim que ela virou três cópias divergentes. Aponte para cá.
