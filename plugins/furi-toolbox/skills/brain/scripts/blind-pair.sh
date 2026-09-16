#!/usr/bin/env bash
# /brain — juiz cego em DUAS ordens (Fase 6, peso ≥ 8). A é sempre a NOSSA recomendação.
# Uso: blind-pair.sh <criterios.md> <problema.md> <recomendacao.md> <alternativa.md> [saida]
# Quatro arquivos escritos de verdade, nunca texto digitado. Códigos: 0 ok · 1 entrada ausente · 2 binário `claude` ausente · 3 a sessão cega falhou
set -u
CRIT="${1:?uso: blind-pair.sh <criterios> <problema> <A> <B> [saida]}"; IN="${2:?}"; A="${3:?}"; B="${4:?}"; OUT="${5:-/tmp/brain-pair.md}"; EFFORT="${EFFORT:-max}"
command -v claude >/dev/null 2>&1 || { echo "brain: binário 'claude' ausente — rode inline e declare 'independência: NÃO' no gate." >&2; exit 2; }
for f in "$CRIT" "$IN" "$A" "$B"; do [ -s "$f" ] || { echo "brain: entrada ausente ou vazia: $f" >&2; exit 1; }; done
SYS="$(cat <<'PROMPT'
Você é um juiz cego. Vai receber: os **critérios** (a única régua), o **problema** que os dois textos respondem, e dois textos — **Texto 1** e **Texto 2**. Você não sabe quem escreveu cada um e não deve tentar adivinhar: julgue o que está na página.

Regras:
1. A régua é só a dos critérios recebidos: critério que está lá conta; o que não está, não conta. Não invente critério novo ("mais completo", "parece mais profissional"). **Comprimento não é qualidade.**
2. Julgue **critério a critério**, citando trechos literais dos dois textos como evidência. Para cada um: qual texto atende melhor (1, 2 ou empate) e por quê, em uma ou duas linhas.
3. Recomendação sem o que a derrubaria, sem o que ela sacrifica ou sem confiança declarada é pior que uma mais modesta que tenha as três — a menos que os critérios digam o contrário.
4. Depois, o veredicto geral: qual texto a pessoa que tem esse problema preferiria receber — pelos critérios decisivos, não pela soma mecânica.
5. Sem elogio, sem preâmbulo. Não reescreva os textos; não sugira melhorias.
6. `EMPATE` só quando os dois atendem igualmente aos critérios decisivos — nunca como saída diplomática.
7. Responda no idioma dos critérios, com ortografia completa.

Formato de saída (exato):

## Por critério
- <critério>: Texto <1 | 2 | empate> — <evidência literal dos dois lados>

## Veredicto
<2 a 4 linhas>

VENCEDOR: <1 | 2 | EMPATE>

A última linha da resposta é obrigatoriamente `VENCEDOR: 1`, `VENCEDOR: 2` ou `VENCEDOR: EMPATE` — e nada depois dela.
PROMPT
)"
# uma rodada: $1 = Texto 1, $2 = Texto 2 — o prompt sai por `cat`, nunca digitado
round() {
  { echo "# Critérios (a única régua — verbatim)"; cat "$CRIT"; echo
    echo "# O problema (o que os dois textos respondem)"; cat "$IN"; echo
    echo "# Texto 1"; cat "$1"; echo
    echo "# Texto 2"; cat "$2"; echo
  } | ( cd "$(mktemp -d)" && env -u CLAUDECODE claude -p --safe-mode --effort "$EFFORT" --system-prompt "$SYS" --tools "" )
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
round "$A" "$B" > "$T/out1.md" || { echo "brain: a sessão cega falhou (rodada 1)" >&2; exit 3; }
round "$B" "$A" > "$T/out2.md" || { echo "brain: a sessão cega falhou (rodada 2)" >&2; exit 3; }
w1="$(winner "$T/out1.md")"; w2="$(winner "$T/out2.md")"
# mapeamento CRUZADO — a rodada 2 rodou INVERTIDA: lá o Texto 1 é o B e o Texto 2 é o A
case "$w1" in 1) r1=A ;; 2) r1=B ;; *) r1="$w1" ;; esac
case "$w2" in 1) r2=B ;; 2) r2=A ;; *) r2="$w2" ;; esac
if [ "$r1" = INDETERMINADO ] || [ "$r2" = INDETERMINADO ]; then res="INDETERMINADO — alguma rodada não terminou com a linha VENCEDOR"
elif [ "$r1" = "$r2" ]; then res="$r1"
else res="DISCORDAM — efeito de posição; não é vitória de ninguém"
fi
{ echo "# Juiz cego — 2 ordens"
  echo "- critérios: \`$CRIT\` · problema: \`$IN\` · A (nossa): \`$A\` · B: \`$B\`"; echo
  echo "## Rodada 1 — Texto 1 = A · Texto 2 = B"; cat "$T/out1.md"; echo
  echo "## Rodada 2 — Texto 1 = B · Texto 2 = A"; cat "$T/out2.md"; echo
  echo "## Consolidação"
  echo "- Rodada 1: $r1 · Rodada 2: $r2"
  echo "- RESULTADO: $res"
} > "$OUT"
cat "$OUT"
