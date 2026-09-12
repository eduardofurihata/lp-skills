# Verificador — o contrato entre quem escreveu e quem confere

> **Quem escreveu não julga a própria prova.** O verificador é um subagente em contexto limpo — `furi-toolbox:vac-verifier` (`plugins/furi-toolbox/agents/vac-verifier.md`) — que recebe **só** o alvo e as fontes que ele cita. Não recebe a conversa; por isso não herda o que a conversa "sabe". Um verificador no mesmo contexto do gerador erra junto com ele.

## Quando roda

| Gatilho | Alvo |
|---|---|
| `/vac <arquivo.md>` | o arquivo |
| `/vac diff` | `git status --short` + `git diff` do working tree (o que está para ser revisado, commitado ou não) |
| `/vac última` | a última resposta do assistente, salva pelo chamador em um arquivo temporário |
| Gate de outra skill com `stamp: verifier` (`Gateway Check — Step 8 → 9`, `9 → 10`, `Audit Pós … Phase 4` do `/todo`, `Code Review: APROVADO (…)` do `/fast`, `QA completo` — tabela em `references/gates.md`) | o artefato daquele gate: o path citado na seção, senão o gravado nesta janela, senão o mais recente da pasta (`kanban/08-code-review/`, `kanban/09-run-test/`) — o hook `Stop` bloqueia a liberação sem carimbo válido |
| Gate com `stamp: session` (`## ✅ /homolog — homolog no ar…`, `## ✅ /prod — produção no ar…`) | o próprio bloco final: o chamador grava o bloco num arquivo, roda `/vac <arquivo>` e publica **o mesmo texto** — o hook compara o hash normalizado do bloco com os carimbos desta sessão (o smoke não escreve artefato; o bloco é o que existe) |

Custo: um subagente por verificação. Só em gate ou a pedido — nunca por prompt.

## Como o chamador invoca (chamada real)

```
Agent(
  subagent_type: "furi-toolbox:vac-verifier",
  description: "Verificar <alvo>",
  prompt: "alvo=<caminho relativo ao projeto>\nfontes=<caminhos que o alvo cita, um por linha>\nmodo=<artefato|diff|resposta>"
)
```

- `alvo=` é obrigatório e é um **caminho** (para `diff` e `última`, o chamador grava o conteúdo em um arquivo antes — o verificador só lê disco).
- `fontes=` são os caminhos que o alvo cita; o verificador descobre outros se precisar (Grep/Glob), mas começa pelos declarados.
- **Espere o retorno e publique o relatório inteiro** — inclusive as `NÃO SUPORTADA`. Resumir "o verificador aprovou" no lugar do relatório é exatamente o que o `/vac` existe para impedir.
- Fora do Claude Code (Codex, Cursor): não há subagente. Verifique inline **e declare** no relatório: `independência: NÃO — verificado no mesmo contexto do gerador`.

## O que o verificador devolve (formato — igual ao do agente; mudou aqui, mude lá)

```
## Verificação — <alvo>
- <afirmação, citada literalmente> — SUPORTADA <arquivo:linha | comando → saída>
- <afirmação> — NÃO SUPORTADA <o que a fonte diz de fato, com coordenada>
- <afirmação> — NÃO VERIFICÁVEL <o que faltaria para apurar>
- <afirmação sem evidência na linha, mas verdadeira> — SUPORTADA <coordenada> (sem evidência na linha)

## O que NÃO foi coberto
<afirmações que o verificador não conseguiu classificar e por quê — "nenhuma — conferido" quando for o caso; em branco não vale>

## Cobertura declarada
<n> afirmações lidas · <fontes abertas> · <o que foi rodado>

VEREDITO: <n> suportadas / <m> não suportadas / <k> não verificáveis · alvo=<caminho> sha256=<hash do conteúdo do alvo | indisponível>
```

A última linha é **contrato com o hook** — `SubagentStop` do verificador (hooks do plugin) ou, para o síncrono, `agent-done` (`PostToolUse` do `Agent` com `agentType` do verificador): ele recalcula o sha256 do alvo, confere que bate com o que o verificador leu (quando o verificador conseguiu calcular; `indisponível` = confia no arquivo atual), grava `~/.claude/vac-data/vac/stamps/<sha256>.ok` e registra na sessão o hash normalizado do alvo e de cada seção dele (é assim que `/vac última` fecha um gate "no ar"). Alvo editado depois → hash novo → sem carimbo → o gate exige `/vac` de novo. Gate só libera com carimbo **e** `m = 0`. O relatório recebido e não publicado bloqueia a resposta seguinte.

## O que o chamador faz com o relatório

- `NÃO SUPORTADA` → corrige o **alvo** (a afirmação, ou o código que ela descreve) e roda o verificador de novo. Não discute com o relatório; discute com a fonte.
- `NÃO VERIFICÁVEL` → vira `[INDISPONÍVEL]` no alvo, com o que faltou. Não vira ✅.
- `(sem evidência na linha)` → acrescenta a evidência que o verificador encontrou. É formato, não conteúdo — mas é o formato que impede a próxima alucinação.
