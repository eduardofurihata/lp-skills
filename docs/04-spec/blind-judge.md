# Juiz cego — Spec

> Decisões tomadas com o usuário em 2026-09-11/12, a partir das sondagens do Claude Code 2.1.269 registradas em `docs/01-problem/blind-judge.md`.

## Round 1 — A primitiva

### D-01 — `/blind` é `claude -p --safe-mode`, não um subagente
**Decisão:** a sessão cega é um processo novo — `env -u CLAUDECODE claude -p --safe-mode --effort <E> --system-prompt "<fixo por modo>" --exclude-dynamic-system-prompt-sections --tools "<lista>"`, prompt por stdin. Três modos: `ask` (`--tools ""`, roda em `mktemp -d`), `pair` (`--tools ""`, duas rodadas com a ordem trocada), `review` (`--tools "Read,Grep,Glob"`, roda no diretório atual).
**Justificativa:** um fork herda o harness, o `CLAUDE.md`, o diretório e o prompt do autor — tira custo de contexto, não viés. A sondagem provou que `--safe-mode` não carrega conversa, `CLAUDE.md`, memória, git status, MCP, plugins, skills nem hooks, e que `--tools ""` zera as ferramentas.
**Alternativas descartadas:** `--bare` (só autentica com `ANTHROPIC_API_KEY`; o usuário usa a assinatura); `--restricted` (não testado; `--tools` como allowlist já dá o mesmo, testado); `--disallowedTools` (variádica, engole o prompt — e obriga a manter uma lista de negação que envelhece).

### D-02 — Mora no `furi-build`
**Decisão:** `plugins/furi-build/skills/blind/`; `method`, `fast` e `todo` declaram `requires: […, blind]`.
**Justificativa:** README § Critério de pacote — vai para o toolbox só a skill "de quem nenhuma outra depende **ou invoca**"; o `/method` invoca o `/blind` no Step 8 e no Step 9. Continua invocável sozinha (`/blind <pergunta>`), que foi a pergunta original do usuário.

### D-03 — O script é a fonte única do comando
**Decisão:** `scripts/blind.sh` (bash, `set -uo pipefail`, `usage()`) monta e roda o comando; os três system prompts fixos moram em `references/system-{ask,pair,review}.md`; a skill só documenta como chamar. `--out F` grava a saída integral para o caller colar com `cat`.
**Justificativa:** a combinação de flags é longa e foi testada; digitar de novo a cada uso é onde a flag some. O `pair` precisa de lógica (duas ordens, mapeamento 1/2 → A/B, consolidação) que não cabe em prosa. Precedente: `vac/scripts/vac-hook.mjs`, `claude-shortcuts/scripts/*.sh`.

### D-04 — Modelo herdado, `--model` só rebaixa; `--effort max`
**Decisão:** sem `--model` o processo usa o modelo da sessão/settings; `--model` existe para rebaixar de propósito (`haiku` nos smokes). `--effort max` por default, sobreponível.
**Justificativa:** mesma doutrina do `context: fork` (README:150): o modelo grande é o default e muda de nome. Um juiz preguiçoso é pior que nenhum.

## Round 2 — Onde o `/method` usa

### D-05 — Só onde o veredicto é julgamento: Step 8 e o TC de texto de IA do Step 9
**Decisão:** revisão fria como **condição de saída** do loop do 8a (passo 9: só com 1-8 limpos; `RESULTADO: 0 A` com carimbo do bundle atual fecha; fix reabre) e juiz pareado como **quem compara** com a referência #1 no Step 9 (`RESULTADO: A` = PASSED; `B`, `EMPATE`, `DISCORDAM`, `INDETERMINADO` = FAILED). Regra Inviolável 11 no `method/SKILL.md`.
**Justificativa:** onde o veredicto é fato (screenshot, task, contagem), a evidência 1:1 já segura. Gateways são fuzzy e são dez — custo × 10 por pouco sinal. O 7b e a execução do 9 precisam de mãos; o cego não tem.
**Descartado por ora (candidatos seguintes):** TCs cegos no Step 5 (gerar do spec e diffar); triagem `C = DESCARTADO` do ledger julgada às cegas.

### D-06 — Entrada verbatim, saída integral, veredicto vinculante
**Decisão:** o bundle do review sai de comando (`git diff <base>`, `git status --short`, `sed` do passo 5 do próprio `08-code-review.md`, caminhos para o revisor abrir); a régua do juiz sai de `sed -n '/^## Texto gerado por IA/,/^## /p' docs/04-spec/<tópico>.md` — por isso o `04-spec.md` passa a exigir esse heading **exato** com `**Referência #1:**` e `**Ler bem significa:**`. A saída volta inteira (`cat` do `--out`) para o 8b / bloco do TC. O autor que discorda escreve ao lado, com justificativa; rebaixar um `A` do revisor exige linha na tabela.
**Justificativa:** o viés entra pela pergunta (prompt redigido na hora), pela entrada (resumo) e pela leitura ("ele não entendeu o contexto"). Fechar as três é o que faz o cego valer alguma coisa. Contexto que o juiz não vê é contexto que o usuário final também não vê.

### D-07 — Referência #1: real quando existir, sintética às cegas quando não
**Decisão:** o Step 9 obtém a saída da referência #1 para a **mesma entrada** — real (Playwright/app no produto de referência, transcrita, origem declarada) ou, sem acesso, **sintética**: `/blind ask` com prompt fixo ("Você é <referência #1>. Responda… como o melhor produto do mercado responderia"), gerada sem ver a nossa. Origem registrada no bloco do TC. `EMPATE` = FAILED nos dois casos.
**Justificativa:** antes a comparação era com uma resposta **imaginada pelo autor**. A sintética é um Claude sem contexto nenhum, bem instruído — se o produto não vence isso, não é "10x acima do #1". A real, quando existe, é sempre preferida.
**Alternativas descartadas:** só nota absoluta contra os critérios (perde o "lê melhor que" literal); só real (na maioria dos produtos não há como obter).

### D-08 — `pair` em duas ordens; `DISCORDAM` não é vitória
**Decisão:** o script roda (A,B) e (B,A) com os rótulos neutros `Texto 1`/`Texto 2`, exige a última linha `VENCEDOR: 1 | 2 | EMPATE`, mapeia para A/B e consolida em `RESULTADO: A | B | EMPATE | DISCORDAM | INDETERMINADO`. Por convenção `A` é o nosso.
**Justificativa:** efeito de posição é real em juiz LLM; concordância nas duas ordens é o mínimo para chamar de veredicto. O token `VEREDITO:` fica reservado ao contrato de outro verificador do toolbox; o `/blind` usa `RESULTADO:`/`VENCEDOR:`.

### D-09 — Fora do Claude Code: inline, declarando `independência: NÃO`
**Decisão:** sem binário `claude` o script sai com `2`; o julgamento roda inline e o relatório abre com `independência: NÃO`. Nunca pulado, nunca em silêncio.
**Justificativa:** Codex e Cursor não têm o CLI; mentir que houve juiz é pior que não ter.

### D-10 — Custo declarado
**Decisão:** `ask` 1 sessão · `pair` 2 (+1 se a referência for sintética) · `review` 1 por saída do loop. Chamada com `timeout` de 10 min no Bash tool; diff grande → `run_in_background` + `--out`.
**Justificativa:** Iron Law do `/method` — precisão > tokens. Contra o protocolo inteiro é a parte barata, e está escrito para ninguém "economizar" pulando.

## Sondagens (evidência das decisões)

| Comando | Resposta |
|---|---|
| `claude -p --safe-mode --system-prompt … --exclude-dynamic-system-prompt-sections --disallowedTools …` de dentro do `lp-skills`, perguntando por CLAUDE.md/AGENTS.md/memória/git status e por Read/Grep/Glob/Bash | `(1) NONE (2) NONE` |
| `--tools ""` (mesmas flags), pedindo a lista de ferramentas | `NO TOOLS.` |
| `--tools "Read,Grep,Glob"` + `--system-prompt-file`, pedindo a 1ª linha do `README.md` | leu (`# lp-skills`) — Read funciona, cwd = repo |
| `--disallowedTools "…" "<prompt posicional>"` | `Permission deny rule "Report" matches no known tool …` + `Error: Input must be provided…` — variádica engole o prompt |
| `env` da sessão | `CLAUDECODE` presente — o script faz `env -u CLAUDECODE` |
| `$ANTHROPIC_API_KEY` | `unset` — `--bare` indisponível |
