---
name: blind
description: 'Use when user invokes /blind <pergunta> to get an answer from a session that sees NOTHING of this one — no conversation, no CLAUDE.md, no memory, no MCP, no plugins, no tools (`claude -p --safe-mode --tools ""`) — or when a protocol needs a verdict the author cannot give about their own work: `/blind pair` judges two texts against written criteria without knowing which one is ours (two runs, order swapped; tie or disagreement is not a win), `/blind review` reviews a diff cold, reading the repository but never the conversation. Removes context bias, not model bias — same model family. Invoked by /method at Step 8 (cold review) and Step 9 (AI-text judge). Triggers on "pergunta sem contexto", "segunda opinião cega", "julga sem saber qual é o nosso", "revisa a frio". Not for tasks that need this session''s context.'
argument-hint: "<pergunta> | pair --criteria F --input F --a F --b F | review --file bundle.md"
allowed-tools: Bash, Read, Write
---

# /blind — a sessão que não vê nada desta

Uma pergunta, um par de textos ou um diff entram; o que sai vem de uma sessão que **não participou** de nada: sem a conversa, sem `CLAUDE.md`, sem memória, sem MCP, sem plugin, sem hook — e, nos modos `ask` e `pair`, sem ferramenta nenhuma. É a segunda opinião que o autor não consegue dar sobre o próprio trabalho.

> **Tira o viés de contexto, não o de modelo.** É a mesma família de modelo, com os mesmos pontos cegos de treino. O que muda é que ela não sabe o que esta sessão "sabe" — nem o que esta sessão quer que seja verdade.

## O que o cego vê (verificado no Claude Code 2.1.269)

| Entra | Não entra |
|---|---|
| o texto que você manda (stdin ou arquivo) | a conversa desta sessão |
| a data, o cwd, o e-mail e o `language` do settings | `CLAUDE.md` / `AGENTS.md` (auto-descoberta desligada) |
| o modelo da sessão (ou `--model`) | auto-memory (`~/.claude/projects/…/memory/`) |
| em `review`: `Read`, `Grep`, `Glob` no diretório atual | git status, MCP, plugins, skills, hooks — e `Bash`, `Edit`, `Write`, web, subagentes |

Mecanismo: `claude -p --safe-mode --tools ""` (ou `--tools "Read,Grep,Glob"` no `review`), com um system prompt fixo por modo (`references/system-ask.md`, `references/system-pair.md`, `references/system-review.md`) e `--exclude-dynamic-system-prompt-sections`. Usa o login da sessão — não precisa de `ANTHROPIC_API_KEY` (o `--bare`, que apagaria até o cwd, precisaria). Um subagente da própria sessão (Agent tool, `context: fork`) **não** é isso: ele herda o harness, o `CLAUDE.md`, o diretório e o enquadramento de quem o chamou.

## Três modos — pela forma do argumento

| Invocação | Modo | O que acontece |
|---|---|---|
| `/blind <pergunta>` | **ask** | A pergunta vai **literal** — o texto que o usuário digitou, sem reescrever — para uma sessão sem ferramenta. Serve para "o que um Claude sem nenhum contexto responderia a isto?" e para gerar uma referência sintética (o `/method` usa no Step 9). |
| `/blind pair --criteria F --input F --a F --b F` | **pair** | Juiz pareado: `criteria` é a régua (verbatim de onde ela mora), `input` o que disparou os textos, `a` e `b` os dois textos **sem rótulo**. Roda **duas vezes com a ordem trocada** e consolida em `A`, `B`, `EMPATE`, `DISCORDAM` (efeito de posição) ou `INDETERMINADO`. Por convenção, **`A` é o nosso**. |
| `/blind review --file bundle.md` | **review** | Revisão fria: o bundle traz o diff, a checklist e os caminhos a ler; a sessão lê o repositório (só leitura, no diretório atual) e devolve achados com `arquivo:linha`, como falha, balde sugerido (A/B/C) e confiança, terminando em `RESULTADO: n A · n B · n C`. |

## Como rodar

O script é **relativo a esta skill** — rode a partir do diretório dela ou prefixe o caminho dela:

```bash
# ask — prompt por stdin (ou --file)
printf '%s' "<pergunta, literal>" | bash scripts/blind.sh ask --out /tmp/blind-ask.md

# pair — quatro arquivos, nunca texto digitado
bash scripts/blind.sh pair --criteria criterios.md --input entrada.md --a nossa.md --b referencia.md --out /tmp/blind-pair.md

# review — bundle por --file (ou stdin), a partir da raiz do repositório
bash scripts/blind.sh review --file /tmp/bundle.md --out /tmp/blind-review.md
```

- `--effort` (`low|medium|high|xhigh|max`, default `max`) · `--model` (default: o da sessão — passe **só para rebaixar** de propósito, ex. `haiku` num smoke) · `--out F` (grava a saída integral; é o que você cola no artefato com `cat`, nunca redigitando).
- No Bash tool, passe `timeout` de 10 min; rodada longa (review de diff grande) → `run_in_background` + `--out`, e leia o arquivo quando terminar.
- Saída: `ask` e `review` imprimem a resposta integral; `pair` imprime as **duas rodadas integrais** e a `## Consolidação` com a linha `- RESULTADO: …`.
- Códigos de saída: `0` ok · `1` uso · `2` binário `claude` ausente · `3` a sessão cega falhou.

## Regras

1. **Entrada verbatim.** Critérios, textos e diff chegam por `cat`/`sed` de onde moram — resumir, parafrasear ou "adaptar" a entrada é o caminho por onde o viés volta. O prompt fixo mora nesta skill ou no reference que a invoca; nunca é redigido na hora.
2. **Saída integral.** O que o cego devolveu vai inteiro para onde for usado (`cat` do `--out`). "O cego aprovou" não é evidência; a saída dele é.
3. **Veredicto vinculante quando um protocolo invoca.** O `/method` trata `RESULTADO` e `VENCEDOR` como fato do step: quem discorda escreve a discordância **ao lado**, com justificativa — não troca o veredicto. Contexto que o cego não viu é, quase sempre, contexto que o usuário final também não vê.
4. **`pair` é sempre em duas ordens.** Uma rodada só é efeito de posição disfarçado de veredicto. `EMPATE` e `DISCORDAM` não são vitória de ninguém.
5. **O cego não corrige.** `review` devolve achados; consertar é do autor, na sessão — e conserto é código não revisado: a revisão fria roda de novo depois dele.
6. **Sem `--model` fixo para cima.** O modelo grande é o default e muda de nome — mesma doutrina do `context: fork` do `/save`. `--model` só existe para rebaixar de propósito.

## Custo — declarado

| Modo | Sessões `claude -p` | Quando |
|---|---|---|
| `ask` | 1 | a pedido |
| `pair` | 2 (uma por ordem) | por TC de texto de IA (`/method` Step 9) — mais 1 `ask` se a referência for sintética |
| `review` | 1 por saída do loop | cada vez que o Step 8 fecha (fix reabre) |

Cada sessão nasce do zero — sem o cache desta conversa — e roda com `--effort max` por default: é o preço de uma opinião que não herda nada. Contra o protocolo inteiro do `/method`, é a parte barata.

## Fora do Claude Code

Sem o binário `claude` no PATH (Codex, Cursor, CI sem CLI), o script sai com código `2` e diz por quê. Nesse caso o julgamento roda **inline**, na mesma sessão, e o relatório declara `independência: NÃO` na primeira linha — quem lê precisa saber que quem julgou foi quem escreveu.

## PARE se pensar

"eu mesmo julgo, já conheço os critérios" · "o cego não entendeu o contexto, desconsidero" · "resumo a spec pra ele, é longa" · "rodei uma ordem só, deu A" · "deu EMPATE, conta como passou" · "colo só o veredicto, o resto é ruído" · "já rodei o review antes do último fix, vale" · "passo `--model opus` pra garantir". Cada uma é a porta por onde o viés que o `/blind` tira volta a entrar.
