#!/usr/bin/env bash
# blind.sh — abre uma sessão do Claude Code que não vê NADA desta: sem a conversa,
# sem CLAUDE.md, sem memória, sem MCP, sem plugins, sem hooks (`claude -p --safe-mode`).
#
#   ask     pergunta crua, sem ferramenta nenhuma                 (--tools "")
#   pair    juiz pareado: 2 textos sem rótulo contra critérios escritos, 2 rodadas com a ordem trocada
#   review  revisão fria: lê o repositório (Read/Grep/Glob), não executa nada, não vê a conversa
#
# Flags verificadas no Claude Code 2.1.269. Usa o login da sessão — não precisa de ANTHROPIC_API_KEY.
# Saída: 0 ok · 1 uso · 2 binário `claude` ausente · 3 a sessão cega falhou
set -uo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EFFORT="max"
MODEL=""
OUT=""
FILE=""
CRITERIA=""
INPUT=""
A=""
B=""

usage() {
  cat <<'EOF'
uso:
  blind.sh ask    [--file F] [--effort E] [--model M] [--out F]     prompt por stdin ou --file
  blind.sh pair   --criteria F --input F --a F --b F [--effort E] [--model M] [--out F]
  blind.sh review [--file F] [--effort E] [--model M] [--out F]     bundle por stdin ou --file; roda no diretório atual

  --effort   low|medium|high|xhigh|max (default: max)
  --model    alias do Claude Code — default: o da sessão; passe só para REBAIXAR (ex. haiku num smoke)
  --out F    grava a saída integral em F, além de imprimir
EOF
}

die() { echo "blind: $*" >&2; exit 1; }

MODE="${1:-}"
case "$MODE" in
  ask|pair|review) shift ;;
  -h|--help|"") usage; [ -n "$MODE" ] && exit 0; exit 1 ;;
  *) die "modo desconhecido: $MODE (ask | pair | review)" ;;
esac

while [ $# -gt 0 ]; do
  case "$1" in
    --file)     FILE="${2:-}";     shift 2 ;;
    --effort)   EFFORT="${2:-}";   shift 2 ;;
    --model)    MODEL="${2:-}";    shift 2 ;;
    --out)      OUT="${2:-}";      shift 2 ;;
    --criteria) CRITERIA="${2:-}"; shift 2 ;;
    --input)    INPUT="${2:-}";    shift 2 ;;
    --a)        A="${2:-}";        shift 2 ;;
    --b)        B="${2:-}";        shift 2 ;;
    -h|--help)  usage; exit 0 ;;
    *) die "opção desconhecida: $1" ;;
  esac
done

command -v claude >/dev/null 2>&1 || {
  echo "blind: binário 'claude' não encontrado — fora do Claude Code o julgamento roda inline, declarando 'independência: NÃO' na primeira linha do relatório." >&2
  exit 2
}

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

need_file() { # $1=nome da opção $2=caminho
  [ -n "$2" ] || die "$MODE exige --$1"
  [ -f "$2" ] || die "--$1: arquivo não encontrado: $2"
}

# Lê o prompt de --file ou do stdin para $1.
read_prompt() {
  if [ -n "$FILE" ]; then
    [ -f "$FILE" ] || die "--file: arquivo não encontrado: $FILE"
    cp "$FILE" "$1"
  else
    [ -t 0 ] && die "$MODE: passe o prompt por stdin ou --file"
    cat > "$1"
  fi
  [ -s "$1" ] || die "$MODE: prompt vazio"
}

# A sessão cega. $1=modo (escolhe o system prompt) $2=arquivo com o prompt $3=tools $4=diretório de trabalho
blind() {
  local sys="$SKILL_DIR/references/system-$1.md"
  [ -f "$sys" ] || die "system prompt ausente: $sys"
  ( cd "$4" && env -u CLAUDECODE claude -p --safe-mode --effort "$EFFORT" ${MODEL:+--model "$MODEL"} \
      --system-prompt "$(cat "$sys")" --exclude-dynamic-system-prompt-sections \
      --tools "$3" < "$2" )
}

# Monta o prompt do juiz: critérios + entrada + Texto 1 + Texto 2 → $3
compose_pair() {
  {
    echo "# Critérios (a única régua — verbatim)"; cat "$CRITERIA"; echo
    echo "# Entrada (o que disparou os dois textos)"; cat "$INPUT"; echo
    echo "# Texto 1"; cat "$1"; echo
    echo "# Texto 2"; cat "$2"; echo
  } > "$3"
}

# Última linha `VENCEDOR:` da saída → 1 | 2 | EMPATE | INDETERMINADO
winner_of() {
  local w
  w="$(grep -E '^[[:space:]]*\**VENCEDOR\**:' "$1" | tail -1 \
      | sed -E 's/^[[:space:]]*\**VENCEDOR\**:[[:space:]]*//; s/[[:space:]*`.]+$//' \
      | tr '[:lower:]' '[:upper:]')"
  case "$w" in 1|2|EMPATE) echo "$w" ;; *) echo "INDETERMINADO" ;; esac
}

# Traduz o vencedor da rodada para A/B: $1=vencedor $2=quem é o Texto 1 $3=quem é o Texto 2
map_round() {
  case "$1" in 1) echo "$2" ;; 2) echo "$3" ;; *) echo "$1" ;; esac
}

REPORT="$TMP/report.md"

case "$MODE" in
  ask)
    read_prompt "$TMP/prompt.md"
    blind ask "$TMP/prompt.md" "" "$TMP" > "$REPORT" || { echo "blind: a sessão cega falhou" >&2; exit 3; }
    ;;

  review)
    read_prompt "$TMP/prompt.md"
    blind review "$TMP/prompt.md" "Read,Grep,Glob" "$PWD" > "$REPORT" || { echo "blind: a sessão cega falhou" >&2; exit 3; }
    ;;

  pair)
    need_file criteria "$CRITERIA"; need_file input "$INPUT"; need_file a "$A"; need_file b "$B"
    compose_pair "$A" "$B" "$TMP/round1.md"
    compose_pair "$B" "$A" "$TMP/round2.md"
    blind pair "$TMP/round1.md" "" "$TMP" > "$TMP/out1.md" || { echo "blind: rodada 1 falhou" >&2; exit 3; }
    blind pair "$TMP/round2.md" "" "$TMP" > "$TMP/out2.md" || { echo "blind: rodada 2 falhou" >&2; exit 3; }
    r1="$(map_round "$(winner_of "$TMP/out1.md")" A B)"
    r2="$(map_round "$(winner_of "$TMP/out2.md")" B A)"
    if [ "$r1" = INDETERMINADO ] || [ "$r2" = INDETERMINADO ]; then res="INDETERMINADO — alguma rodada não terminou com a linha VENCEDOR"
    elif [ "$r1" = "$r2" ]; then res="$r1"
    else res="DISCORDAM — efeito de posição; não é vitória de ninguém"
    fi
    {
      echo "# /blind pair — juiz cego, 2 ordens"
      echo "- critérios: \`$CRITERIA\` · entrada: \`$INPUT\` · A: \`$A\` · B: \`$B\`"
      echo "- effort: $EFFORT · model: ${MODEL:-o da sessão}"
      echo
      echo "## Rodada 1 — Texto 1 = A · Texto 2 = B"
      cat "$TMP/out1.md"; echo
      echo "## Rodada 2 — Texto 1 = B · Texto 2 = A"
      cat "$TMP/out2.md"; echo
      echo "## Consolidação"
      echo "- Rodada 1: $r1 · Rodada 2: $r2"
      echo "- RESULTADO: $res"
    } > "$REPORT"
    ;;
esac

cat "$REPORT"
[ -n "$OUT" ] && cp "$REPORT" "$OUT"
exit 0
