# Verificador — o contrato entre quem escreveu e quem confere

> **Quem escreveu não julga a própria prova.** O verificador é um subagente em contexto limpo — `furi-toolbox:vac-verifier` (`plugins/furi-toolbox/agents/vac-verifier.md`) — que recebe **só** o alvo e as fontes que ele cita. Não recebe a conversa; por isso não herda o que a conversa "sabe". Um verificador no mesmo contexto do gerador erra junto com ele.

## Quando roda

| Gatilho | Alvo |
|---|---|
| `/vac <arquivo.md>` | o arquivo |
| `/vac diff` | `git status --short` + `git diff` do working tree (o que está para ser revisado, commitado ou não) |
| `/vac última` | a última resposta do assistente, salva pelo chamador em um arquivo temporário |
| Gate de outra skill (`Gateway Check — Step 8 → 9`, `9 → 10`, smoke de `/homolog`/`/prod`, "no ar") | o artefato daquele gate (`kanban/08-code-review/<t>.md`, `kanban/09-run-test/<t>.md`, o relatório de smoke) — o hook `Stop` bloqueia o gate LIBERADO sem carimbo válido |

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

A última linha é **contrato com o hook** `agent-done` (`PostToolUse` do `Agent`, quando `agentType` é o verificador — `SubagentStop` não dispara de hook de skill na 2.1.269): ele recalcula o sha256 do alvo, confere que bate com o que o verificador leu (quando o verificador conseguiu calcular; `indisponível` = confia no arquivo atual) e grava `~/.claude/vac-data/vac/stamps/<sha256>.ok` (ou `$CLAUDE_PLUGIN_DATA/vac/stamps/`, quando a variável existe no ambiente do hook). Alvo editado depois → hash novo → sem carimbo → o gate exige `/vac` de novo. Gate só libera com carimbo **e** `m = 0`.

## O que o chamador faz com o relatório

- `NÃO SUPORTADA` → corrige o **alvo** (a afirmação, ou o código que ela descreve) e roda o verificador de novo. Não discute com o relatório; discute com a fonte.
- `NÃO VERIFICÁVEL` → vira `[INDISPONÍVEL]` no alvo, com o que faltou. Não vira ✅.
- `(sem evidência na linha)` → acrescenta a evidência que o verificador encontrou. É formato, não conteúdo — mas é o formato que impede a próxima alucinação.
