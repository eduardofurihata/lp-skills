# Jira Sync — refletir no card o estado que a mudança alcançou

> **Fonte única da escrita no card.** Antes deste arquivo, a mesma sequência estava escrita em **três** lugares (`merge:132-133`, `work:71`, `pull-request:103`) — três cópias que já divergiam no detalhe. Quem toca card aponta para cá; ninguém redescreve a mecânica.

**Responsabilidade única:** dado um card e o estado que a mudança alcançou, **comentar** e **transicionar**. Não decide se o estado foi alcançado (isso é de quem chama), não cria card (isso é `/card`), não descobre o board (isso é `/jira-board`).

## Contrato

| Entrada | Saída |
|---|---|
| `<KEY>-<N>` + estado alcançado + o que foi entregue (linguagem leiga) + URL/commit | card comentado + transicionado, ou avisado que não havia transição equivalente |

O board, a `<KEY>` e o site vêm do **`/jira-board`** (Step 0 de quem chama), nunca hardcoded. Via `mcp__atlassian__*`.

## A sequência — sempre nesta ordem

### 1. Comentar

`mcp__atlassian__jira_add_comment` com `issue_key: <KEY>-<N>`:

```markdown
## O que foi feito
[Linguagem simples, ZERO jargão — qualquer pessoa entende o problema que existia e o que mudou.
Concreto, com antes/depois.]

---
<rótulo do estado>: <URL do ambiente | PR | commit>
```

**A descrição leiga é escrita UMA vez e reusada.** O `## O que foi feito` do PR (`pull-request`) é o mesmo texto que vai para o card — não reescreva, não "adapte para o Jira".

### 2. Descobrir a transição — nunca chutar o nome

```
mcp__atlassian__jira_get_transitions   issue_key: <KEY>-<N>
```
Escolher, entre as que **aquele** workflow oferece, a **equivalente** ao estado alcançado. Nomes variam por projeto ("Em andamento" / "In Progress" / "Doing"; "Em revisão" / "Code Review"; "Verificar" / "Homologação"; "Concluído" / "Done").

```
mcp__atlassian__jira_transition_issue   issue_key: <KEY>-<N>   transition_id: <id da escolhida>
```

> **Sem `comment` na transição.** O parâmetro existe mas o formato é ADF; o comentário vai no passo 1, sempre separado.

**Nenhuma equivalente no workflow?** **Avise e siga** — a entrega não trava por causa de status. O comentário do passo 1 já registrou o fato.

## Mapa de estados → o que dizer no card

| Estado alcançado | Quem chama | Rótulo no comentário | Transição alvo |
|---|---|---|---|
| Trabalho começou | `/work` | — | equivalente a "em andamento" |
| PR aberto, em revisão | `/pull-request` | `PR: <URL>` · `Branch: <branch>` | equivalente a "em revisão" / "code review" |
| Mergeado na integração | `pr-cycle.md` | `Merged em <integração>: <commit>` | equivalente a "verificar" / pós-merge |
| **No ar em homolog, verificado** | `smoke.md` via `/homolog` | `Em homolog: <URL>` | equivalente a "homologação" / "verificar" |
| **No ar em produção, verificado** | `smoke.md` via `/prod` | `Em produção: <URL>` | equivalente a "concluído" / pós-deploy |
| Devolvido ao dev (rework) | `pr-cycle.md` § 5 | o que reprovou + link do review | equivalente a "em andamento" |

> **"No ar" só se diz depois do `smoke.md`.** Comentar "está em homolog" com o run vermelho, ou antes da verificação, é a mentira que este trabalho inteiro existe para impedir.

## Um site por vez

O MCP alcança apenas o site do `JIRA_URL` configurado. Key ausente naquele site → **avisar** que o card pode estar em outro site. **Nunca** aproximar para uma key parecida.

## Red Flags — STOP

- "Sei que o status chama 'Concluído', transiciono direto" → NÃO. `get_transitions` primeiro, **sempre** — o workflow é de cada projeto.
- "Passo o comentário junto na transição, é uma chamada menos" → NÃO. ADF. Comentário no passo 1, transição no 2.
- "Não achei transição equivalente, então paro a entrega" → NÃO. Avisa e segue.
- "Escrevo a descrição técnica no card, o dev entende" → NÃO. Quem lê o card não estava na conversa e pode não ser dev. Linguagem leiga, com antes/depois.
- "Reescrevo o resumo para o Jira" → NÃO. É o **mesmo** texto do PR. Escreve uma vez, usa nos dois.
- "Comento 'está em homolog' logo depois de mergear" → NÃO. Merge ≠ no ar. Só depois do `smoke.md`.
- "Copio esta sequência para dentro da minha skill, fica mais direto" → NÃO. Foi assim que ela virou três cópias divergentes. Aponte para cá.
