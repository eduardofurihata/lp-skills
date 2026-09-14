---
name: blind
description: 'Use when user invokes /blind <pergunta> to get an answer from a session that sees NOTHING of this one — no conversation, no CLAUDE.md, no memory, no MCP, no plugins, no tools (`claude -p --safe-mode --tools ""`) — or when a protocol needs a verdict the author cannot give about their own work: `/blind pair` judges two texts against written criteria without knowing which one is ours (two runs, order swapped; tie or disagreement is not a win), `/blind review` reviews a diff cold, reading the repository but never the conversation. Removes context bias, not model bias — same model family. Invoked by /method at Step 8 (cold review) and Step 9 (AI-text judge). Triggers on "pergunta sem contexto", "segunda opinião cega", "julga sem saber qual é o nosso", "revisa a frio". Not for tasks that need this session''s context.'
argument-hint: "<pergunta> | pair --criteria F --input F --a F --b F | review --file bundle.md"
allowed-tools: Bash, Read, Write
---

# /blind — a sessão que não vê nada desta

Uma pergunta, um par de textos ou um diff entram; o que sai vem de uma sessão que **não participou** de nada: sem a conversa, sem `CLAUDE.md`, sem memória, sem MCP, sem plugin, sem hook — e, nos modos `ask` e `pair`, sem ferramenta nenhuma. É a segunda opinião que o autor não consegue dar sobre o próprio trabalho.

> **Tira o viés de contexto, não o de modelo.** É a mesma família de modelo, com os mesmos pontos cegos de treino. O que muda é que ela não sabe o que esta sessão "sabe" — nem o que esta sessão quer que seja verdade.

## O que o cego vê (verificado no Claude Code 2.1.270)

| Entra | Não entra |
|---|---|
| o texto que você manda (stdin ou arquivo) | a conversa desta sessão |
| a data, o cwd, o e-mail e o `language` do settings | `CLAUDE.md` / `AGENTS.md` (auto-descoberta desligada) |
| o modelo da sessão (ou `--model`) | auto-memory (`~/.claude/projects/…/memory/`) |
| em `review`: `Read`, `Grep`, `Glob` no diretório atual | git status, MCP, plugins, skills, hooks — e `Bash`, `Edit`, `Write`, web, subagentes |

Mecanismo: `claude -p --safe-mode --tools ""` (ou `--tools "Read,Grep,Glob"` no `review`), com um system prompt fixo por modo — as três seções `§ Prompt do sistema` **deste arquivo**, extraídas por `awk` dentro do próprio bloco, nunca redigidas na hora. Usa o login da sessão — não precisa de `ANTHROPIC_API_KEY` (o `--bare`, que apagaria até o cwd, precisaria). Um subagente da própria sessão (Agent tool, `context: fork`) **não** é isso: ele herda o harness, o `CLAUDE.md`, o diretório e o enquadramento de quem o chamou.

## Três modos — pela forma do argumento

| Invocação | Modo | O que acontece |
|---|---|---|
| `/blind <pergunta>` | **ask** | A pergunta vai **literal** — o texto que o usuário digitou, sem reescrever — para uma sessão sem ferramenta. Serve para "o que um Claude sem nenhum contexto responderia a isto?" e para gerar uma referência sintética (o `/method` usa no Step 9). |
| `/blind pair --criteria F --input F --a F --b F` | **pair** | Juiz pareado: `criteria` é a régua (verbatim de onde ela mora), `input` o que disparou os textos, `a` e `b` os dois textos **sem rótulo**. Roda **duas vezes com a ordem trocada** e consolida em `A`, `B`, `EMPATE`, `DISCORDAM` (efeito de posição) ou `INDETERMINADO`. Por convenção, **`A` é o nosso**. |
| `/blind review --file bundle.md` | **review** | Revisão fria: o bundle traz o diff, a checklist e os caminhos a ler; a sessão lê o repositório (só leitura, no diretório atual) e devolve achados com `arquivo:linha`, como falha, balde sugerido (A/B/C) e confiança, terminando em `RESULTADO: n A · n B · n C`. |

## Como rodar

Três blocos, um por modo. **Copie o bloco inteiro** e troque só os caminhos de entrada e o `OUT`: cada um extrai por `awk` o seu próprio system prompt deste arquivo, e nada dentro deles é opcional.

```bash
# ask — a pergunta LITERAL, numa sessão sem ferramenta nenhuma
BLIND=<caminho absoluto deste SKILL.md — de onde você abriu esta skill>
EFFORT=max; MODEL=""              # MODEL vazio = o modelo da sessão; preencha só para REBAIXAR (ex. haiku num smoke)
PERGUNTA=/tmp/blind-pergunta.md   # o texto do usuário, verbatim — nunca reescrito
OUT=/tmp/blind-ask.md

SYS="$(awk '/^## Prompt do sistema — ask$/{s=1;next} s&&/^```/{if(f)exit;f=1;next} f' "$BLIND")"
[ -n "$SYS" ] || { echo "blind: § Prompt do sistema — ask não encontrado em $BLIND" >&2; exit 1; }
command -v claude >/dev/null 2>&1 || { echo "blind: binário 'claude' não encontrado — fora do Claude Code o julgamento roda inline, declarando 'independência: NÃO' na primeira linha do relatório." >&2; exit 2; }
( cd "$(mktemp -d)" && env -u CLAUDECODE claude -p --safe-mode --effort "$EFFORT" ${MODEL:+--model "$MODEL"} --system-prompt "$SYS" --tools "" ) < "$PERGUNTA" > "$OUT" \
  || { echo "blind: a sessão cega falhou" >&2; exit 3; }
cat "$OUT"
```

```bash
# pair — juiz cego em DUAS ordens; A é sempre o NOSSO
BLIND=<caminho absoluto deste SKILL.md — de onde você abriu esta skill>
EFFORT=max; MODEL=""              # MODEL vazio = o modelo da sessão; preencha só para REBAIXAR
CRIT=criterios.md; IN=entrada.md; A=nossa.md; B=referencia.md   # quatro arquivos, nunca texto digitado
OUT=/tmp/blind-pair.md

SYS="$(awk '/^## Prompt do sistema — pair$/{s=1;next} s&&/^```/{if(f)exit;f=1;next} f' "$BLIND")"
[ -n "$SYS" ] || { echo "blind: § Prompt do sistema — pair não encontrado em $BLIND" >&2; exit 1; }
command -v claude >/dev/null 2>&1 || { echo "blind: binário 'claude' não encontrado — fora do Claude Code o julgamento roda inline, declarando 'independência: NÃO' na primeira linha do relatório." >&2; exit 2; }
for f in "$CRIT" "$IN" "$A" "$B"; do [ -s "$f" ] || { echo "blind: entrada ausente ou vazia: $f" >&2; exit 1; }; done

# uma rodada: $1 = Texto 1, $2 = Texto 2 — o prompt sai por `cat`, nunca digitado
round() {
  { echo "# Critérios (a única régua — verbatim)"; cat "$CRIT"; echo
    echo "# Entrada (o que disparou os dois textos)"; cat "$IN"; echo
    echo "# Texto 1"; cat "$1"; echo
    echo "# Texto 2"; cat "$2"; echo
  } | ( cd "$(mktemp -d)" && env -u CLAUDECODE claude -p --safe-mode --effort "$EFFORT" ${MODEL:+--model "$MODEL"} --system-prompt "$SYS" --tools "" )
}
# última linha `VENCEDOR:` da saída → 1 | 2 | EMPATE | INDETERMINADO
winner() {
  local w
  w="$(grep -E '^[[:space:]]*\**VENCEDOR\**:' "$1" | tail -1 \
      | sed -E 's/^[[:space:]]*\**VENCEDOR\**:[[:space:]]*//; s/[[:space:]*`.]+$//' \
      | tr '[:lower:]' '[:upper:]')"
  case "$w" in 1|2|EMPATE) echo "$w" ;; *) echo "INDETERMINADO" ;; esac
}

T="$(mktemp -d)"
round "$A" "$B" > "$T/out1.md" || { echo "blind: a sessão cega falhou (rodada 1)" >&2; exit 3; }
round "$B" "$A" > "$T/out2.md" || { echo "blind: a sessão cega falhou (rodada 2)" >&2; exit 3; }
w1="$(winner "$T/out1.md")"; w2="$(winner "$T/out2.md")"
# mapeamento CRUZADO — a rodada 2 rodou INVERTIDA: lá o Texto 1 é o B e o Texto 2 é o A
case "$w1" in 1) r1=A ;; 2) r1=B ;; *) r1="$w1" ;; esac
case "$w2" in 1) r2=B ;; 2) r2=A ;; *) r2="$w2" ;; esac
if [ "$r1" = INDETERMINADO ] || [ "$r2" = INDETERMINADO ]; then res="INDETERMINADO — alguma rodada não terminou com a linha VENCEDOR"
elif [ "$r1" = "$r2" ]; then res="$r1"
else res="DISCORDAM — efeito de posição; não é vitória de ninguém"
fi
{
  echo "# /blind pair — juiz cego, 2 ordens"
  echo "- critérios: \`$CRIT\` · entrada: \`$IN\` · A: \`$A\` · B: \`$B\`"
  echo "- effort: $EFFORT · model: ${MODEL:-o da sessão}"
  echo
  echo "## Rodada 1 — Texto 1 = A · Texto 2 = B"
  cat "$T/out1.md"; echo
  echo "## Rodada 2 — Texto 1 = B · Texto 2 = A"
  cat "$T/out2.md"; echo
  echo "## Consolidação"
  echo "- Rodada 1: $r1 · Rodada 2: $r2"
  echo "- RESULTADO: $res"
} > "$OUT"
cat "$OUT"
```

```bash
# review — revisão fria; roda da RAIZ do repositório, porque o cwd é o material
BLIND=<caminho absoluto deste SKILL.md — de onde você abriu esta skill>
EFFORT=max; MODEL=""              # MODEL vazio = o modelo da sessão; preencha só para REBAIXAR
BUNDLE=/tmp/bundle.md             # diff + checklist + caminhos a ler, montados por comando
OUT=/tmp/blind-review.md

SYS="$(awk '/^## Prompt do sistema — review$/{s=1;next} s&&/^```/{if(f)exit;f=1;next} f' "$BLIND")"
[ -n "$SYS" ] || { echo "blind: § Prompt do sistema — review não encontrado em $BLIND" >&2; exit 1; }
command -v claude >/dev/null 2>&1 || { echo "blind: binário 'claude' não encontrado — fora do Claude Code o julgamento roda inline, declarando 'independência: NÃO' na primeira linha do relatório." >&2; exit 2; }
env -u CLAUDECODE claude -p --safe-mode --effort "$EFFORT" ${MODEL:+--model "$MODEL"} --system-prompt "$SYS" --tools "Read,Grep,Glob" < "$BUNDLE" > "$OUT" \
  || { echo "blind: a sessão cega falhou" >&2; exit 3; }
cat "$OUT"
```

- `EFFORT` (`low|medium|high|xhigh|max`, default `max`) · `MODEL` vazio = o modelo da sessão, e só se preenche para **rebaixar** de propósito (ex. `haiku` num smoke) · `OUT` guarda a saída integral: é o que você cola no artefato com `cat`, nunca redigitando.
- `env -u CLAUDECODE` não é higiene de variável: o `env` resolve `claude` no PATH e pula a função de shell do `~/.bashrc` que injeta `--dangerously-skip-permissions`.
- O `cd "$(mktemp -d)"` do `ask` e do `pair` é isolamento — o cwd entra no contexto da sessão cega. O `review` roda da raiz do repositório justamente porque ali o cwd **é** o material que ele tem de ler.
- `--exclude-dynamic-system-prompt-sections` não entra: o `--help` do binário diz que ela é ignorada com `--system-prompt`, e o bloco sempre passa `--system-prompt`. Flag que não faz nada é ruído com cara de mecanismo.
- `--tools` é variádica — vem sempre como **última** flag, e o prompt entra por stdin, nunca como argumento.
- No Bash tool, passe `timeout` de 10 min; rodada longa (review de diff grande) → `run_in_background`, e leia o `OUT` quando terminar.
- Saída: `ask` e `review` imprimem a resposta integral; `pair` imprime as **duas rodadas integrais** e a `## Consolidação` com a linha `- RESULTADO: …`.
- Códigos de saída: `0` ok · `1` entrada ausente/vazia ou prompt de sistema não encontrado · `2` binário `claude` ausente · `3` a sessão cega falhou.
- Estes blocos estão **copiados** em `method/SKILL.md` § Step 8 e § Step 9: mudou um, mudou todos — `grep -rn 'env -u CLAUDECODE' plugins/furi-build/skills/` lista as cópias.

## Regras

1. **O bloco é copiado, não digitado.** Cole o bloco inteiro do modo e troque só os caminhos de entrada e o `OUT`. `--safe-mode`, `env -u CLAUDECODE`, `--tools ""`, o `cd` para um diretório temporário e as duas ordens do `pair` **são** o mecanismo, não enfeite: sem qualquer um deles a saída volta igualzinha — só que não é mais cega, e a ausência não aparece em lugar nenhum dela.
2. **Entrada verbatim.** Critérios, textos e diff chegam por `cat`/`sed` de onde moram — resumir, parafrasear ou "adaptar" a entrada é o caminho por onde o viés volta. O prompt fixo mora nas seções `§ Prompt do sistema` deste arquivo, extraído por `awk`; nunca é redigido na hora.
3. **Saída integral.** O que o cego devolveu vai inteiro para onde for usado (`cat` do `OUT`). "O cego aprovou" não é evidência; a saída dele é.
4. **Veredicto vinculante quando um protocolo invoca.** O `/method` trata `RESULTADO` e `VENCEDOR` como fato do step: quem discorda escreve a discordância **ao lado**, com justificativa — não troca o veredicto. Contexto que o cego não viu é, quase sempre, contexto que o usuário final também não vê.
5. **`pair` é sempre em duas ordens.** Uma rodada só é efeito de posição disfarçado de veredicto. `EMPATE` e `DISCORDAM` não são vitória de ninguém.
6. **O cego não corrige.** `review` devolve achados; consertar é do autor, na sessão — e conserto é código não revisado: a revisão fria roda de novo depois dele.
7. **Sem `MODEL` fixo para cima.** O modelo grande é o default e muda de nome — mesma doutrina do `context: fork` do `/save`. `MODEL` vazio é o certo; preencher só existe para rebaixar de propósito.

## Custo — declarado

| Modo | Sessões `claude -p` | Quando |
|---|---|---|
| `ask` | 1 | a pedido |
| `pair` | 2 (uma por ordem) | por TC de texto de IA (`/method` Step 9) — mais 1 `ask` se a referência for sintética |
| `review` | 1 por saída do loop | cada vez que o Step 8 fecha (fix reabre) |

Cada sessão nasce do zero — sem o cache desta conversa — e roda com `--effort max` por default: é o preço de uma opinião que não herda nada. Contra o protocolo inteiro do `/method`, é a parte barata.

## Fora do Claude Code

Sem o binário `claude` no PATH (Codex, Cursor, CI sem CLI), o bloco para com código `2` e diz por quê. Nesse caso o julgamento roda **inline**, na mesma sessão, e o relatório declara `independência: NÃO` na primeira linha — quem lê precisa saber que quem julgou foi quem escreveu.

## PARE se pensar

"eu mesmo julgo, já conheço os critérios" · "o cego não entendeu o contexto, desconsidero" · "resumo a spec pra ele, é longa" · "rodei uma ordem só, deu A" · "deu EMPATE, conta como passou" · "colo só o veredicto, o resto é ruído" · "já rodei o review antes do último fix, vale" · "passo `--model opus` pra garantir" · "colo só a linha do `claude`, o resto é boilerplate" · "tiro o `cd`, já estou numa pasta temporária" · "rodo uma ordem e inverto de cabeça a outra". Cada uma é a porta por onde o viés que o `/blind` tira volta a entrar.

## Prompt do sistema — ask

```
Você é uma sessão cega: não existe conversa anterior, arquivo, projeto, memória nem ferramenta — só o texto que chega agora. Responda a ele, e só a ele.

- Não presuma contexto que não está no texto. Se faltar algo decisivo para responder, diga o que falta em vez de inventar.
- Literal e direto: sem preâmbulo, sem elogio, sem "ótima pergunta", sem resumo do que foi perguntado.
- O que você não pode verificar vem marcado como não verificado — nunca afirmado.
- Responda no idioma do texto recebido, com ortografia completa (acentos inclusive).
```

## Prompt do sistema — pair

```
Você é um juiz cego. Vai receber: os **critérios** (a única régua), a **entrada** que disparou os textos, e dois textos — **Texto 1** e **Texto 2** — respondendo a essa mesma entrada. Você não sabe quem escreveu cada um e não deve tentar adivinhar: julgue o que está na página.

Regras:
1. A régua é só a dos critérios recebidos: critério que está lá conta; o que não está, não conta. Não invente critério novo ("mais completo", "parece mais profissional", "tem mais detalhes"). **Comprimento não é qualidade** — texto mais longo não ganha por ser mais longo.
2. Julgue **critério a critério**, citando trechos literais dos dois textos como evidência. Para cada critério: qual texto atende melhor (1, 2 ou empate) e por quê, em uma ou duas linhas.
3. Depois, o veredicto geral: qual texto a pessoa que fez essa entrada preferiria receber — pelos critérios decisivos, não pela soma mecânica.
4. Sem elogio, sem preâmbulo. Não reescreva os textos; não sugira melhorias.
5. `EMPATE` só quando os dois atendem igualmente aos critérios decisivos — nunca como saída diplomática.
6. Responda no idioma dos critérios, com ortografia completa.

Formato de saída (exato):

## Por critério
- <critério>: Texto <1 | 2 | empate> — <evidência literal dos dois lados>

## Veredicto
<2 a 4 linhas>

VENCEDOR: <1 | 2 | EMPATE>

A última linha da resposta é obrigatoriamente `VENCEDOR: 1`, `VENCEDOR: 2` ou `VENCEDOR: EMPATE` — e nada depois dela.
```

## Prompt do sistema — review

```
Você é um revisor de código frio: não participou da conversa que produziu esta mudança, não conhece as intenções de quem a escreveu e não ganha nem perde nada com o veredicto. Recebe um bundle com o diff, uma checklist e caminhos de documentos. Pode **ler** o repositório no diretório atual (Read, Grep, Glob) — e nada mais: não executa, não edita, não corrige.

Regras:
1. Leia o bundle inteiro. Abra os caminhos que ele lista **antes** de julgar — spec, use cases, test cases, plano, padrões do projeto — e use Grep para conferir duplicação e reúso no repositório (grep, não memória).
2. Percorra a checklist recebida **item a item, por nome**. Item sem achado é declarado "sem achado", nunca omitido.
3. Achado só existe com **coordenada** (`arquivo:linha`, dentro ou fora do diff) e com **como falha**: entrada concreta → saída errada, ou regra/princípio violado com o trecho citado. Preferência de estilo sem consequência não é achado.
4. Para cada achado, sugira o balde: **A** = defeito dentro do escopo documentado (docs 01-04) — tem de ser corrigido antes de seguir; **B** = escopo novo que esta mudança criou, tocou ou expôs; **C** = pré-existente e não tocado. Na dúvida entre B e C, B. Justifique em uma linha.
5. Não corrija, não reescreva, não aprove, não elogie. Diga o que **não** conseguiu cobrir e por quê.
6. Não infira intenção ("provavelmente quiseram…"): julgue o que está no diff e no repositório.
7. Responda no idioma do bundle, com ortografia completa.

Formato de saída (exato):

## Achados
### <A|B|C>-<n> — <título curto>
- Onde: <arquivo:linha>
- Como falha / o que viola: <entrada → saída errada, ou princípio + trecho literal>
- Balde: <A | B | C> — <justificativa de uma linha>
- Confiança: <alta | média | baixa>

(sem achados: escreva "nenhum achado" sob `## Achados`)

## Checklist percorrida
- <item>: <A-n / B-n / C-n | sem achado>

## Não coberto
- <o que e por quê> | nenhum

RESULTADO: <n> A · <n> B · <n> C

A última linha da resposta é obrigatoriamente a linha `RESULTADO:` — e nada depois dela.
```
