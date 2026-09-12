---
feature: blind-judge
phase: done
tests: passed
resultado: 6/6 PASSED
branch: main
---

# Juiz cego — `/blind` e os dois pontos do `/method` que só fecham com ele — Done

Onde o veredicto do `/method` era julgamento do próprio autor — "o texto lê melhor que a referência #1?" (Step 9) e "o diff segura?" (Step 8) — agora quem julga é uma sessão que não viu nada desta: `claude -p --safe-mode --tools ""`, sem conversa, `CLAUDE.md`, memória, MCP, plugin, hook nem ferramenta (só `Read`/`Grep`/`Glob` no modo `review`). Problema em `docs/01-problem/blind-judge.md`; decisões D-01…D-10 em `docs/04-spec/blind-judge.md`.

## O que mudou

| | Antes | Depois |
|---|---|---|
| Segunda opinião sem contexto | não existia — subagente herda harness, `CLAUDE.md`, cwd e o prompt do autor | **`/blind`** (`furi-build`): `ask` (pergunta crua, zero tools), `pair` (juiz pareado, 2 ordens), `review` (lê o repo, não executa) — `scripts/blind.sh` + 3 system prompts fixos |
| Step 8 — saída do loop | o autor declara "100% limpo" e escreve o 8b | passo 9 do 8a: **revisão fria** sobre bundle montado por comando (diff + status + checklist do passo 5 via `sed` + caminhos), carimbo sha256; `RESULTADO: 0 A` no bundle atual fecha; fix reabre. 8b ganha `## Revisão Fria` (saída integral + triagem com justificativa para rebaixar `A`) |
| Step 9 — TC de texto de IA | `**Vs. referência #1:** <como ela responderia>` — escrito pelo autor | bloco com a saída da referência #1 para a MESMA entrada (real, ou **sintética** via `/blind ask` com prompt fixo) + `/blind pair` em 2 ordens colado integral; **`RESULTADO: A` = PASSED, o resto = FAILED**; Audit Pós ganha `J == T` |
| Spec (Step 4) | referência #1 e "ler bem" "escritas no spec", sem lugar fixo | heading **exato** `## Texto gerado por IA` + `**Referência #1:**` + `**Ler bem significa:**` — extraível por `sed`, entregue verbatim ao juiz |
| Gateways | 8→9 e 9→10 sem juiz | 8→9 exige revisão fria zerada; 9→10 exige `RESULTADO: A`; princípio 10 nomeia quem lê |
| Racionalizações | — | Categoria 14 (10 linhas) + Red Flags; Regra Inviolável 11 no `method/SKILL.md` |
| `/fast` e `/todo` | — | `requires: […, blind]`; `/fast` para após o 8 **com** revisão fria; `/todo` (que duplica 8/9 inline) ganha o passo 8 do loop, a seção no relatório, o juiz no TC de texto e a linha `J` |

## O que foi REUTILIZADO (DRY)

- A checklist do passo 5 do `08-code-review.md` é a que o revisor frio recebe — `sed` do próprio arquivo, não uma segunda lista.
- A régua do juiz é a seção do spec (`04-spec.md` já dizia "a fonte é uma só"); só ganhou heading fixo.
- A triagem A/B/C (`follow-ups.md`) absorve os achados do revisor — nenhum fluxo novo.
- A doutrina de modelo do `context: fork` (README:150) vale igual para o processo: `--model` só rebaixa.
- A regra "transcrição integral" do texto de IA vale para a saída do cego: `cat` do `--out`, nunca resumo.
- Estilo de script dos antigos `proof/scripts` (`set -uo pipefail`, `usage()`); `allowed-tools` como no `/claude-shortcuts`.

## O que foi DESCARTADO (YAGNI)

- **Juiz cego em todos os gateways** — fuzzy, custo × 10, pouco sinal. Só onde o veredicto é julgamento.
- **`--bare`** — apagaria até o cwd, mas só autentica com API key; o usuário usa a assinatura.
- **Subagente (`agents/*.md`) como juiz** — não é cego: herda harness, `CLAUDE.md`, cwd e o prompt do autor.
- **`--disallowedTools`** — variádica (engole o prompt) e lista de negação que envelhece; `--tools` como allowlist, testado.
- **Toolbox** — o README diz que skill invocada por outra sai do toolbox; `/method` invoca.
- **Referência só real** — na maioria dos produtos não há como obter; sintética às cegas com origem declarada.
- **TCs cegos no Step 5 e triagem `C` às cegas** — candidatos seguintes, registrados em D-05.

## Verificação (6/6)

| # | Prova | Resultado |
|---|---|---|
| 1 | `blind.sh ask --model haiku`, pedindo a lista de tools e se vê CLAUDE.md/memória/git status | ✅ `NO TOOLS` · `NADA` — `--out` gravou 15 bytes |
| 2 | `blind.sh pair --model haiku`: "A capital da França é Paris." (A) × resposta longa em inglês com "founded by the Romans in 1200 BC" (B), critérios concisão/idioma/sem alucinação | ✅ Rodada 1: `VENCEDOR: 1` → A · Rodada 2: `VENCEDOR: 2` → A · `RESULTADO: A`; o juiz apontou a alucinação e o idioma nas duas ordens |
| 3 | `blind.sh review --model haiku` da raiz do repo, bundle com `firstN` (`i <= n`) + checklist de 3 itens + `README.md` para ler | ✅ `A-1 lib/slice.ts:4` (off-by-one com entrada→saída), `A-2` (undefined além do tamanho), `B-1` após ler `lib/utils.ts`; checklist item a item; `RESULTADO: 2 A · 1 B · 0 C` |
| 4 | `env PATH=/usr/bin:/bin bash blind.sh ask` (sem o binário) | ✅ mensagem "independência: NÃO" + `exit=2` |
| 5 | `claude -p --plugin-dir plugins/furi-build "/blind Em uma frase: …"` (fim a fim, dev mode) | ✅ a skill carregou, o Bash rodou sem prompt de permissão (`allowed-tools`), a resposta voltou integral |
| 6 | `pnpm check` + segundo `gen:plugins` (sha256 dos manifestos) + `gray-matter` nos 4 frontmatters editados | ✅ 28 skills, relações resolvem, typecheck ok; manifestos idênticos na 2ª geração; `requires` lidos como `["solve","blind"]`, `["method","solve","blind"]` ×2 |

Não coberto: a LP rodando (`lib/skills.ts` descobre por diretório e deriva `hasScripts`/`hasReferences` — por leitura, não executado); `/blind pair` e `review` com o modelo grande em `--effort max` (smokes rodaram em `haiku --effort low`).

## Arquivos

`plugins/furi-build/skills/blind/{SKILL.md,scripts/blind.sh,references/system-ask.md,references/system-pair.md,references/system-review.md}` · `plugins/furi-build/skills/method/{SKILL.md,references/04-spec.md,references/05-test-cases.md,references/08-code-review.md,references/09-testing.md,references/gateways.md,references/rationalizations.md}` · `plugins/furi-build/skills/{fast,todo}/SKILL.md` · `scripts/generate-plugins.mjs` (descrição) · `README.md` · `docs/01-problem/blind-judge.md` · `docs/04-spec/blind-judge.md`
