#!/usr/bin/env bash
# delta.sh — carimbo e delta do /proof.
#
# Prova tem carimbo: vale para o SHA que auditou e para nenhum outro. Este script faz as
# duas pontas disso:
#   delta.sh --stamp [--base <ref>]   imprime a linha de carimbo do HEAD atual (vai no cabeçalho)
#   delta.sh <relatório.md>           o que entrou desde o carimbo daquele relatório: commits
#                                     (marcando os que tocam coordenadas de achados anteriores —
#                                     o CONSERTO de um achado é código não auditado), arquivos,
#                                     e a lista de achados anteriores a re-verificar.
# Diagnóstico, não gate: sai 0 sempre.
set -uo pipefail

MODE=""; BASE=""; REL=""
while [ $# -gt 0 ]; do
  case "$1" in
    --stamp) MODE="stamp"; shift ;;
    --base) BASE="${2:-}"; shift 2 ;;
    -h|--help) sed -n '2,12p' "$0"; exit 0 ;;
    *) REL="$1"; MODE="${MODE:-delta}"; shift ;;
  esac
done
git rev-parse --git-dir >/dev/null 2>&1 || { echo "não é um repositório git" >&2; exit 2; }

descobrir_base() {
  [ -n "$BASE" ] && { git merge-base "$BASE" HEAD 2>/dev/null || git rev-parse "$BASE"; return; }
  local ref; ref="$(gh pr view --json baseRefName -q .baseRefName 2>/dev/null || true)"
  if [ -z "$ref" ]; then for c in dev main master; do
    git rev-parse --verify -q "origin/$c" >/dev/null 2>&1 && { ref="$c"; break; }
    git rev-parse --verify -q "$c" >/dev/null 2>&1 && { ref="$c"; break; }
  done; fi
  [ -z "$ref" ] && { echo "não achei base (nem PR, nem dev/main/master). Passe --base." >&2; exit 2; }
  git merge-base "origin/$ref" HEAD 2>/dev/null || git merge-base "$ref" HEAD
}

if [ "$MODE" = "stamp" ]; then
  B="$(descobrir_base)"; H="$(git rev-parse HEAD)"
  # hash do DIFF, não só do SHA: um rebase/amend muda o SHA sem mudar o conteúdo, e vice-versa
  D="$(git diff "$B...HEAD" | sha256sum | cut -c1-12)"
  SUJO=""; git diff --quiet 2>/dev/null && git diff --cached --quiet 2>/dev/null || SUJO=" +dirty"
  echo "> Carimbo: HEAD ${H:0:12} · base ${B:0:12} · diff ${D}${SUJO} · $(date -u +%Y-%m-%dT%H:%MZ)"
  exit 0
fi

[ -z "$REL" ] && { echo "uso: delta.sh --stamp | delta.sh <relatório.md>" >&2; exit 2; }
[ -f "$REL" ] || { echo "relatório não encontrado: $REL" >&2; exit 2; }

STAMP_HEAD="$(grep -m1 -oE '^> Carimbo: HEAD [0-9a-f]{7,40}' "$REL" | grep -oE '[0-9a-f]{7,40}$' || true)"
STAMP_BASE="$(grep -m1 -oE '^> Carimbo:.*base [0-9a-f]{7,40}' "$REL" | grep -oE '[0-9a-f]{7,40}$' || true)"
STAMP_DATA="$(grep -m1 -oE '^> Carimbo:.*· [0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9:]+Z' "$REL" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9:]+Z$' || true)"

echo "## Delta desde o carimbo anterior"
echo
if [ -z "$STAMP_HEAD" ] || ! git cat-file -e "$STAMP_HEAD^{commit}" 2>/dev/null; then
  # Sem carimbo (relatório de versão anterior) o delta é `indisponível-para-apurar` — dizer isso
  # é o Pass C item 4. O mtime do arquivo é a aproximação honesta que existe.
  MT="$(date -u -r "$REL" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || stat -f %Sm -t %Y-%m-%dT%H:%M:%SZ "$REL" 2>/dev/null || true)"
  echo "Relatório \`$REL\` **sem carimbo** (anterior a esta versão do /proof): delta por SHA \`indisponível-para-apurar\`."
  echo "Aproximação pelo mtime do arquivo (${MT:-?}) — commits desta branch DEPOIS de o relatório ser escrito:"
  echo
  git log --format='  %h %ad %s' --date=format:'%d/%m %H:%M' --since="$MT" 2>/dev/null | head -40
  echo
  echo "→ trate TODOS como não auditados; o próximo relatório sai com carimbo."
  exit 0
fi

H="$(git rev-parse HEAD)"
echo "Relatório \`$REL\` · carimbo HEAD \`${STAMP_HEAD:0:12}\`${STAMP_DATA:+ ($STAMP_DATA)} · HEAD atual \`${H:0:12}\`"
echo
if [ "$(git rev-parse "$STAMP_HEAD")" = "$H" ]; then
  echo "**HEAD não mudou desde o carimbo.** O relatório descreve o código atual."
  git diff --quiet 2>/dev/null && git diff --cached --quiet 2>/dev/null || echo "(working tree sujo — o que não está commitado não tem carimbo)"
  exit 0
fi

# coordenadas dos achados anteriores: `arquivo:linha` nas linhas logo abaixo de cada título
TMP="$(mktemp)"; trap 'rm -f "$TMP"' EXIT
grep -oE '`[A-Za-z0-9_./@-]+:[0-9]+' "$REL" | tr -d '`' | cut -d: -f1 | sort -u > "$TMP"

N_C="$(git rev-list --count "$STAMP_HEAD..HEAD" 2>/dev/null || echo 0)"
N_CONS=0
echo "**$N_C commit(s)** depois do carimbo:"
echo
while read -r h; do
  [ -z "$h" ] && continue
  toca="$(git show --format= --name-only "$h" 2>/dev/null | sort -u | comm -12 - "$TMP" | head -3 | paste -sd',' -)"
  mark=""; [ -n "$toca" ] && { mark="   ← toca achado anterior ($toca)"; N_CONS=$((N_CONS+1)); }
  echo "  $(git log -1 --format='%h %ad %s' --date=format:'%d/%m %H:%M' "$h" | cut -c1-140)$mark"
done <<< "$(git rev-list --reverse "$STAMP_HEAD..HEAD" 2>/dev/null)"
echo
[ "$N_CONS" -gt 0 ] && echo "$N_CONS commit(s) tocam arquivo de achado anterior: **é o conserto, e conserto é código não auditado** — escopo de maior prior."
echo

N_F="$(git diff --name-only "$STAMP_HEAD" HEAD 2>/dev/null | grep -c . || true)"
if [ -n "$STAMP_BASE" ] && git cat-file -e "$STAMP_BASE^{commit}" 2>/dev/null; then
  N_ANT="$(git diff --name-only "$STAMP_BASE...$STAMP_HEAD" 2>/dev/null | grep -c . || true)"
  N_NOVOS="$(comm -23 <(git diff --name-only "$STAMP_HEAD" HEAD 2>/dev/null | sort -u) <(git diff --name-only "$STAMP_BASE...$STAMP_HEAD" 2>/dev/null | sort -u) | grep -c . || true)"
  echo "**$N_F arquivo(s)** mudaram desde o carimbo; **$N_NOVOS** não estavam no escopo anterior ($N_ANT arquivos)."
else
  echo "**$N_F arquivo(s)** mudaram desde o carimbo."
fi
echo
echo "Achados anteriores a re-verificar — \`fechado (prova: …)\` / \`aberto\` / \`mudou de forma\`:"
echo
grep -nE '^### (🔴|🟠|🟡)' "$REL" | while IFS=: read -r ln titulo; do
  coord="$(sed -n "$((ln+1)),$((ln+3))p" "$REL" | grep -oE '`[^`]+:[0-9]+[^`]*`' | head -1 || true)"
  echo "  - [ ] ${titulo#\#\#\# }${coord:+ — $coord}"
done
