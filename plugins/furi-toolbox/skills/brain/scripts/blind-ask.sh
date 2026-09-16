#!/usr/bin/env bash
# /brain — sessão cega, modo `ask` (Fase 3, peso ≥ 8): a pergunta LITERAL, numa sessão sem ferramenta nenhuma.
# Uso: blind-ask.sh <arquivo-com-a-pergunta-verbatim> [saida]   — códigos: 0 ok · 1 entrada ausente · 2 binário `claude` ausente · 3 a sessão cega falhou
set -u
IN="${1:?uso: blind-ask.sh <pergunta.md> [saida.md]}"; OUT="${2:-/tmp/brain-ask.md}"; EFFORT="${EFFORT:-max}"
[ -s "$IN" ] || { echo "brain: entrada ausente ou vazia: $IN" >&2; exit 1; }
command -v claude >/dev/null 2>&1 || { echo "brain: binário 'claude' ausente — rode inline e declare 'independência: NÃO' no gate." >&2; exit 2; }
SYS="$(cat <<'PROMPT'
Você é uma sessão cega: não existe conversa anterior, arquivo, projeto, memória nem ferramenta — só o texto que chega agora. Responda a ele, e só a ele.

- Não presuma contexto que não está no texto. Se faltar algo decisivo, diga o que falta em vez de inventar.
- Literal e direto: sem preâmbulo, sem elogio, sem resumo do que foi perguntado.
- O que você não pode verificar vem marcado como não verificado — nunca afirmado.
- Pedido de hipóteses: liste as que o texto sustenta, inclusive as incômodas, sem ordenar por preferência e sem escolher uma.
- Responda no idioma do texto recebido, com ortografia completa (acentos inclusive).
PROMPT
)"
# `env -u CLAUDECODE` resolve `claude` no PATH (não numa função de shell); o `cd` esconde o cwd; `--tools` é variádica e vem por último; o prompt entra por stdin.
( cd "$(mktemp -d)" && env -u CLAUDECODE claude -p --safe-mode --effort "$EFFORT" --system-prompt "$SYS" --tools "" ) < "$IN" > "$OUT" \
  || { echo "brain: a sessão cega falhou" >&2; exit 3; }
cat "$OUT"
