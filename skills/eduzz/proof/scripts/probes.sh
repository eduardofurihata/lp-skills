#!/usr/bin/env bash
# probes.sh — as 5 sondas do /proof: o que o diff NÃO tem linha para mostrar.
#
# O diff é a projeção de duas pontas. Ele mostra a mudança, não o que ela ALCANÇA
# nem o que ela DEIXOU ATRÁS. Cada sonda faz uma pergunta que a leitura do diff não faz.
#
# Diagnóstico, não gate: sai 0 sempre. Sonda sem hit imprime "n/a" com o motivo —
# sonda calada é o que faz um achado virar omissão.
set -uo pipefail

BASE=""; EXT=""; RADICAL=""; MD=0; VETERANO=""; NOVO=""

usage() {
  cat <<'USAGE'
uso: probes.sh [--base <ref>] [--ext '<glob>'] [--radical <nome>]
               [--veterano <literal>] [--novo <literal>] [--md]

  --base       ref de comparação. Omitido: descobre por gh pr view -> branch de
               integração (dev/main/master) -> merge-base.
  --ext        glob de arquivos p/ os greps. Omitido: DERIVADO do próprio diff.
  --radical    nome da família p/ a sonda 4 quando ela é preexistente (não aparece no diff).
  --veterano   literal veterano do catálogo p/ a sonda 3 (sobrescreve a heurística).
  --novo       literal novo do catálogo p/ a sonda 3 (sobrescreve a heurística).
  --md         emite a tabela de veredito em markdown, pronta p/ colar no relatório.
USAGE
}

while [ $# -gt 0 ]; do
  case "$1" in
    --base) BASE="${2:-}"; shift 2 ;;
    --ext) EXT="${2:-}"; shift 2 ;;
    --radical) RADICAL="${2:-}"; shift 2 ;;
    --veterano) VETERANO="${2:-}"; shift 2 ;;
    --novo) NOVO="${2:-}"; shift 2 ;;
    --md) MD=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "arg desconhecido: $1" >&2; usage; exit 2 ;;
  esac
done

git rev-parse --git-dir >/dev/null 2>&1 || { echo "não é um repositório git" >&2; exit 2; }

# ---------------------------------------------------------------- base
# Ordem: o que foi pedido -> o que a PR declara -> a branch de integração que existir.
# Nunca assumida: se nada resolver, o script diz e para, em vez de comparar com o vazio.
BASE_ORIGEM="--base"
if [ -z "$BASE" ]; then
  BASE_REF="$(gh pr view --json baseRefName -q .baseRefName 2>/dev/null || true)"
  if [ -n "$BASE_REF" ]; then
    BASE_ORIGEM="gh pr view ($BASE_REF)"
  else
    for c in dev main master; do
      if git rev-parse --verify -q "origin/$c" >/dev/null 2>&1 || git rev-parse --verify -q "$c" >/dev/null 2>&1; then
        BASE_REF="$c"; BASE_ORIGEM="branch de integração ($c)"; break
      fi
    done
  fi
  [ -z "${BASE_REF:-}" ] && { echo "não achei base (nem PR, nem dev/main/master). Passe --base." >&2; exit 2; }
  BASE="$(git merge-base "origin/$BASE_REF" HEAD 2>/dev/null || git merge-base "$BASE_REF" HEAD 2>/dev/null || true)"
  [ -z "$BASE" ] && { echo "merge-base com $BASE_REF falhou. Passe --base." >&2; exit 2; }
fi
BASE_SHORT="$(git rev-parse --short "$BASE" 2>/dev/null || echo "$BASE")"

TOCADOS="$(git diff "$BASE...HEAD" --name-only 2>/dev/null || true)"
N_TOCADOS="$(printf '%s\n' "$TOCADOS" | grep -c . || true)"
N_COMMITS="$(git rev-list --count "$BASE..HEAD" 2>/dev/null || echo 0)"

# ---------------------------------------------------------------- extensão
# Derivada do diff, não fixada: é o que faz o script valer em qualquer repo/linguagem.
EXT_ORIGEM="--ext"
# Extensões de LINGUAGEM primeiro. Sem isto, um repo com muito .json/.md de dado
# afoga as sondas em prosa: medido nesta PR, docs/skills/*.json produziu falso
# positivo em 3 das 5 sondas.
CODE_EXTS="ts tsx js jsx mjs cjs py go rs java kt rb php cs swift c cc cpp h hpp scala sh bash sql vue svelte ex exs erl clj lua pl r m"
if [ -z "$EXT" ]; then
  TODAS="$(printf '%s\n' "$TOCADOS" | grep -oE '\.[A-Za-z0-9]+$' | sed 's/^\.//' | sort | uniq -c | sort -rn | awk '{print $2}')"
  SELE=""
  for e in $TODAS; do
    case " $CODE_EXTS " in *" $e "*) SELE="$SELE $e" ;; esac
  done
  if [ -n "$SELE" ]; then
    EXT="$(printf '%s\n' $SELE | head -4 | sed 's/^/*./' | paste -sd' ' -)"
    EXT_ORIGEM="derivada do diff (extensões de código)"
  elif [ -n "$TODAS" ]; then
    EXT="$(printf '%s\n' $TODAS | head -3 | sed 's/^/*./' | paste -sd' ' -)"
    EXT_ORIGEM="derivada do diff (nenhuma extensão de código)"
  else
    EXT="*"; EXT_ORIGEM="fallback (nenhuma extensão no diff)"
  fi
fi
read -r -a EXT_ARR <<< "$EXT"
PATHSPEC=(); for e in "${EXT_ARR[@]}"; do PATHSPEC+=("$e"); done

VER_1A="n/a"; VER_1B="n/a"; VER_2="n/a"; VER_3="n/a"; VER_4="n/a"; VER_5="n/a"

hdr() { echo; echo "════ $1"; }

echo "/proof · 5 sondas — o que o diff não mostra"
echo "repo:  $(basename "$(git rev-parse --show-toplevel)")  ·  branch: $(git rev-parse --abbrev-ref HEAD)"
echo "base:  $BASE_SHORT  ($BASE_ORIGEM)  ·  $N_TOCADOS arquivos · $N_COMMITS commits"
echo "ext:   $EXT  ($EXT_ORIGEM)"

# ════════════════════════════════════════════════════════════════ 1 · TRAJETÓRIA
# Pergunta: revisei o objeto que vai ser MERGEADO?
# `git diff base...HEAD` mostra o estado LÍQUIDO. Blob que entrou e saiu dentro da
# branch tem diff zero — invisível — e sobrevive ao merge sem squash.
hdr "1 · trajetória — que blob entrou e SAIU dentro da branch"

ADICIONADOS="$(git log --diff-filter=A --name-only --format="" "$BASE..HEAD" 2>/dev/null | grep -v '^$' | sort -u || true)"
VIVOS="$(git ls-tree -r --name-only HEAD 2>/dev/null | sort || true)"
FANTASMAS="$(comm -23 <(printf '%s\n' "$ADICIONADOS") <(printf '%s\n' "$VIVOS") 2>/dev/null || true)"
N_ADD="$(printf '%s\n' "$ADICIONADOS" | grep -c . || true)"
N_FANT="$(printf '%s\n' "$FANTASMAS" | grep -c . || true)"

if [ "$N_FANT" -gt 0 ]; then
  echo "$N_FANT de $N_ADD blobs adicionados NÃO estão em HEAD (entraram e saíram):"
  printf '%s\n' "$FANTASMAS" | while read -r f; do
    [ -z "$f" ] && continue
    C="$(git log --diff-filter=A --format=%h -1 "$BASE..HEAD" -- "$f" 2>/dev/null || true)"
    SZ="$(git cat-file -s "$C:$f" 2>/dev/null || echo '?')"
    echo "  $C:$f  (${SZ} bytes)"
  done
  echo "  → triagem humana: refator legítimo (arquivo criado e movido) ou vazamento?"
  VER_1A="$N_FANT de $N_ADD blobs entraram e saíram"
else
  echo "n/a — nenhum blob adicionado saiu antes de HEAD ($N_ADD adicionados, todos vivos)"
  VER_1A="n/a — 0 fantasmas em $N_ADD adicionados"
fi

echo
echo "-- credencial nos blobs adicionados (estrutural: pega o que está CODIFICADO) --"
# `git log -S 'isAdmin'` volta VAZIO num JWT: o payload é base64. Por isso a sonda
# casa a FORMA do segredo, não a palavra que ele contém.
CRED="$(git log -p --diff-filter=A --format="COMMIT %h" "$BASE..HEAD" 2>/dev/null | grep -E \
  '^(COMMIT|\+\+\+ |\+.*(eyJ[A-Za-z0-9_-]{10,}\.|-----BEGIN [A-Z ]*PRIVATE KEY|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{20,}|gho_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{35}))' \
  || true)"
HITS="$(printf '%s\n' "$CRED" | grep -cE '^\+[^+]' || true)"
if [ "$HITS" -gt 0 ]; then
  printf '%s\n' "$CRED" | grep -B2 -E '^\+[^+]' | cut -c1-160
  echo "  → $HITS linha(s) com forma de segredo. Decodifique o \`exp\` antes de chamar de VIVA:"
  echo "    viva / expirada (com o exp) / não apurável — colapsar os dois últimos é afirmação falsa."
  VER_1B="$HITS linha(s) com forma de segredo"
else
  echo "n/a — nenhuma forma de segredo conhecida nos blobs adicionados"
  VER_1B="n/a — 0 hits"
fi

# ════════════════════════════════════════════════════════════════ 2 · IRMÃS DO REMOVIDO
# Pergunta: o que mais fala essa língua?
# Remoção conserta a OCORRÊNCIA e preserva a CLASSE. Grepar a linha `-` inteira é
# inutilizável (file move devolve toda linha como removida E viva), então extraímos
# a ASSINATURA e filtramos por RARIDADE.
hdr "2 · irmãs do removido — a assinatura da linha '-' sobrevive em outro arquivo?"

ASSINATURAS="$(git diff "$BASE...HEAD" --diff-filter=M -- "${PATHSPEC[@]}" 2>/dev/null \
  | grep '^-[^-]' \
  | grep -oE '[A-Za-z_$][A-Za-z0-9_$]*(\[[0-9]+\]|\.[A-Za-z_$][A-Za-z0-9_$]*)+' \
  | sort -u || true)"
N_ASS="$(printf '%s\n' "$ASSINATURAS" | grep -c . || true)"
RARAS=""
if [ "$N_ASS" -gt 0 ]; then
  RARAS="$(printf '%s\n' "$ASSINATURAS" | while read -r s; do
    [ -z "$s" ] && continue
    n="$(git grep -F -c "$s" -- "${PATHSPEC[@]}" 2>/dev/null | awk -F: '{t+=$NF} END{print t+0}')"
    if [ "$n" -ge 1 ] && [ "$n" -le 3 ]; then printf '%s\t%s\n' "$n" "$s"; fi
  done | sort -n || true)"
fi
N_RARAS="$(printf '%s\n' "$RARAS" | grep -c . || true)"

# A discriminação que separa sinal de ruído: assinatura cujos hits vivos estão em
# arquivo que a PR NÃO TOCOU. Assinatura que só reaparece em arquivo tocado é o
# próprio diff se olhando no espelho.
TMP_TOC="$(mktemp)"; printf '%s\n' "$TOCADOS" | sort -u > "$TMP_TOC"
FORA=""
if [ "$N_RARAS" -gt 0 ]; then
  FORA="$(printf '%s\n' "$RARAS" | while IFS=$'\t' read -r n s; do
    [ -z "$s" ] && continue
    arqs="$(git grep -l -F "$s" -- "${PATHSPEC[@]}" 2>/dev/null | sort -u || true)"
    intactos="$(comm -23 <(printf '%s\n' "$arqs") "$TMP_TOC" 2>/dev/null | grep -c . || true)"
    [ "$intactos" -gt 0 ] && printf '%s\t%s\t%s\n' "$n" "$intactos" "$s"
  done | sort -k2 -rn || true)"
fi
rm -f "$TMP_TOC"
N_FORA="$(printf '%s\n' "$FORA" | grep -c . || true)"

if [ "$N_FORA" -gt 0 ]; then
  echo "$N_ASS assinaturas removidas → $N_RARAS raras → $N_FORA sobrevivem em arquivo NÃO TOCADO:"
  printf '%s\n' "$FORA" | head -12 | while IFS=$'\t' read -r n fora s; do
    [ -z "$s" ] && continue
    echo "  ${n}× $s  ($fora fora do diff)"
    TMP_T2="$(mktemp)"; printf '%s\n' "$TOCADOS" | sort -u > "$TMP_T2"
    git grep -n -F "$s" -- "${PATHSPEC[@]}" 2>/dev/null | while IFS= read -r l; do
      f="${l%%:*}"; grep -qxF "$f" "$TMP_T2" || echo "      $l" | cut -c1-150
    done | head -2
    rm -f "$TMP_T2"
  done
  [ "$N_FORA" -gt 12 ] && echo "  … e $((N_FORA-12)) outras"
  echo "  → o padrão saiu de um caminho e ficou nos outros. Cada uma é candidata."
  VER_2="$N_ASS removidas → $N_RARAS raras → $N_FORA fora do diff"
elif [ "$N_RARAS" -gt 0 ]; then
  echo "n/a — $N_RARAS assinaturas raras, mas todas só reaparecem em arquivo TOCADO pela PR"
  VER_2="n/a — $N_RARAS raras, 0 fora do diff"
else
  echo "n/a — $N_ASS assinaturas removidas, nenhuma sobrevive rara no repo"
  VER_2="n/a — 0 de $N_ASS sobrevivem"
fi

# ════════════════════════════════════════════════════════════════ 3 · MEMBRO ÓRFÃO
# Pergunta: o estado que acabei de criar PODE existir?
# Membro novo num catálogo é ESTADO NOVO: passa a atravessar todo consumidor do
# conjunto. Contagem de arquivos NÃO distingue (22 vs 26 no caso medido) — só o
# DIFERENCIAL DE CONJUNTOS distingue.
hdr "3 · membro órfão — o membro NOVO aparece onde o VETERANO aparece?"

# Heurística em duas etapas, ambas necessárias (medidas):
#   (a) literal numa linha ADICIONADA que contém só o literal — forma de entrada de
#       array/Set/Record. Não escolha UM: head -1 pegou o catálogo errado.
#   (b) o veterano é IRMÃO DE VIZINHANÇA — literal na mesma forma, a poucas linhas
#       dele NO ARQUIVO FINAL. Eleger "o literal mais frequente do repo" seleciona
#       VOCABULÁRIO, não catálogo: escolheu 'summary', presente em 674 arquivos.
CANDS=""
if [ -n "$NOVO" ]; then
  CANDS="$NOVO"
else
  CANDS="$(git diff "$BASE...HEAD" -U0 -- "${PATHSPEC[@]}" 2>/dev/null \
    | grep -E "^\+[[:space:]]*['\"][a-z][a-z0-9_]{3,}['\"],?[[:space:]]*$" \
    | grep -oE "['\"][a-z][a-z0-9_]{3,}['\"]" | tr -d "\"'" | sort -u || true)"
fi
N_CAND="$(printf '%s\n' "$CANDS" | grep -c . || true)"

ACHOU_3=0; LINHAS_3=""; REPORTADOS=0
if [ "$N_CAND" -gt 0 ]; then
  echo "$N_CAND literal(is) adicionado(s) em forma de entrada de catálogo."
  for novo in $CANDS; do
    [ "$REPORTADOS" -ge 3 ] && break
    ARQ_NOVO="$(git grep -l -F "'$novo'" -- "${PATHSPEC[@]}" 2>/dev/null | sort -u || true)"
    [ -z "$ARQ_NOVO" ] && ARQ_NOVO="$(git grep -l -F "\"$novo\"" -- "${PATHSPEC[@]}" 2>/dev/null | sort -u || true)"
    [ -z "$ARQ_NOVO" ] && continue

    if [ -n "$VETERANO" ]; then
      IRMAOS="$VETERANO"
    else
      # irmãos de vizinhança: literais na mesma forma, ±6 linhas, no arquivo final
      IRMAOS="$(printf '%s\n' "$ARQ_NOVO" | head -3 | while read -r f; do
        [ -f "$f" ] || continue
        grep -nE "['\"]${novo}['\"]" "$f" 2>/dev/null | cut -d: -f1 | head -3 | while read -r ln; do
          a=$((ln>6 ? ln-6 : 1)); b=$((ln+6))
          sed -n "${a},${b}p" "$f" 2>/dev/null \
            | grep -E "^[[:space:]]*['\"][a-z][a-z0-9_]{3,}['\"],?[[:space:]]*$" \
            | grep -oE "['\"][a-z][a-z0-9_]{3,}['\"]" | tr -d "\"'"
        done
      done | sort -u | grep -vxF "$novo" || true)"
    fi
    [ -z "$IRMAOS" ] && continue

    for vet in $IRMAOS; do
      ARQ_VET="$(git grep -l -F "'$vet'" -- "${PATHSPEC[@]}" 2>/dev/null | sort -u || true)"
      [ -z "$ARQ_VET" ] && ARQ_VET="$(git grep -l -F "\"$vet\"" -- "${PATHSPEC[@]}" 2>/dev/null | sort -u || true)"
      N_VET="$(printf '%s\n' "$ARQ_VET" | grep -c . || true)"
      # veterano em MUITOS arquivos é vocabulário do repo, não membro de catálogo
      { [ "$N_VET" -lt 2 ] || [ "$N_VET" -gt 30 ]; } && continue
      ORFAOS="$(comm -23 <(printf '%s\n' "$ARQ_VET") <(printf '%s\n' "$ARQ_NOVO") 2>/dev/null || true)"
      N_ORF="$(printf '%s\n' "$ORFAOS" | grep -c . || true)"
      [ "$N_ORF" -eq 0 ] && continue
      echo "  '$novo' (novo, $(printf '%s\n' "$ARQ_NOVO" | grep -c .) arq) vs '$vet' (irmão, $N_VET arq): $N_ORF órfão(s)"
      printf '%s\n' "$ORFAOS" | head -8 | sed 's/^/      /'
      [ "$N_ORF" -gt 8 ] && echo "      … e $((N_ORF-8)) outros"
      ACHOU_3=1; REPORTADOS=$((REPORTADOS+1))
      LINHAS_3="${LINHAS_3}'$novo' vs '$vet': $N_ORF; "
      break
    done
  done
fi

if [ "$ACHOU_3" -eq 1 ]; then
  echo "  → cada arquivo é um estágio que trata o irmão e pode não tratar o novo."
  echo "  → prova por DIFERENCIAL de conjuntos; contagem de arquivos não distingue."
  VER_3="$(printf '%s' "$LINHAS_3" | cut -c1-80)"
elif [ "$N_CAND" -gt 0 ]; then
  echo "n/a — $N_CAND literais testados, nenhum com irmão de catálogo e arquivo órfão"
  VER_3="n/a — $N_CAND literais, 0 órfãos"
else
  echo "n/a — nenhum literal em forma de entrada de catálogo no diff."
  echo "  → catálogo que mudou de outra forma: passe --novo <lit> --veterano <lit>."
  VER_3="n/a — nenhum catálogo detectado"
fi

# ════════════════════════════════════════════════════════════════ 4 · GÊMEA ASSIMÉTRICA
# Pergunta: a função irmã é CHAMADA sob a mesma guarda?
# Compare as CHAMADAS, não os corpos: irmã chamada sob guarda diferente é a próxima
# divergência, já instalada.
hdr "4 · gêmea assimétrica — a irmã é chamada sob a mesma guarda?"

# Extrair família do diff é ruidoso: medido, o regex solto capturou palavras de
# COMENTÁRIO em português ('de', 'com', 'sem') como nome de função, e 'build' como
# família de 1248 chamadas — um verbo universal, não uma família. Por isso: exige
# declaração real, prefixo >= 4 chars, e conta chamadas só nos arquivos TOCADOS.
if [ -n "$RADICAL" ]; then
  FAMILIAS="$RADICAL"
  echo "família: '$RADICAL' (--radical)"
else
  NOMES="$(git diff "$BASE...HEAD" -- "${PATHSPEC[@]}" 2>/dev/null \
    | grep -oE '^\+[[:space:]]*(export[[:space:]]+)?(async[[:space:]]+)?(const|function|def|fn)[[:space:]]+[a-z][a-zA-Z0-9_]*' \
    | grep -oE '[a-z][a-zA-Z0-9_]*$' | sort -u || true)"
  FAMILIAS="$(printf '%s\n' "$NOMES" | grep -E '^[a-z]{4,}[A-Z]' \
    | grep -oE '^[a-z]{4,}' | sort | uniq -c | awk '$1>=2 {print $2}' || true)"
  N_FAM="$(printf '%s\n' "$FAMILIAS" | grep -c . || true)"
  [ "$N_FAM" -gt 0 ] && echo "famílias no diff (>=2 declarações com o mesmo radical): $(printf '%s ' $FAMILIAS)"
fi

TOC_CODE="$(printf '%s\n' "$TOCADOS" | while read -r f; do
  for e in "${EXT_ARR[@]}"; do case "$f" in ${e}) [ -f "$f" ] && echo "$f" ;; esac; done
done | sort -u || true)"

if [ -n "$FAMILIAS" ] && [ -n "$TOC_CODE" ]; then
  ACHOU_4=0
  for radical in $FAMILIAS; do
    CHAMADAS="$(printf '%s\n' "$TOC_CODE" | tr '\n' '\0' | xargs -0 grep -nE "(^|[^A-Za-z0-9_])${radical}[A-Z][A-Za-z0-9_]*\(" 2>/dev/null \
      | grep -vE '(export |const |function |def |fn )[a-z]*'"${radical}" || true)"
    N_CH="$(printf '%s\n' "$CHAMADAS" | grep -c . || true)"
    # Verbo universal não é família: se chamam de todo lado, o radical não discrimina.
    { [ "$N_CH" -lt 2 ] || [ "$N_CH" -gt 40 ]; } && continue
    GUARDADAS="$(printf '%s\n' "$CHAMADAS" | grep -cE 'if ?\(|&&|\?\.|\?|when |unless ' || true)"
    if [ "$GUARDADAS" -gt 0 ] && [ "$GUARDADAS" -lt "$N_CH" ]; then
      echo "  '$radical*': $N_CH chamadas nos arquivos tocados, $GUARDADAS sob guarda → ASSIMETRIA"
      printf '%s\n' "$CHAMADAS" | head -6 | sed 's/^/      /' | cut -c1-150
      ACHOU_4=1
      VER_4="'$radical*' — $GUARDADAS de $N_CH chamadas sob guarda"
    fi
  done
  if [ "$ACHOU_4" -eq 0 ]; then
    echo "n/a — nenhuma família com guarda divergente entre as chamadas"
    VER_4="n/a — nenhuma assimetria"
  fi
else
  echo "n/a — nenhuma família declarada no diff. Família PREEXISTENTE não aparece nele:"
  echo "  → se a mudança alterou a irmã de uma família antiga, passe --radical <nome>."
  VER_4="n/a — nenhuma família no diff (preexistente exige --radical)"
fi

# ════════════════════════════════════════════════════════════════ 5 · ESCRITA COLATERAL
# Pergunta: o que isto GRAVA é o que precisou LER?
# Resolver sobre a visão mesclada é correto; PATCHAR a visão mesclada transforma
# "remover chave" em impossível.
hdr "5 · escrita colateral — o read-set virou write-set?"

# Exige spread em OBJETO ('{' antes do primeiro '...') e descarta string com escape
# de JSON — medido, docs/skills/*.json trouxe 2 falsos positivos de prosa.
MERGED="$(git diff "$BASE...HEAD" -- "${PATHSPEC[@]}" 2>/dev/null \
  | grep -E '^\+.*\{[^"]*\.\.\..*,.*\.\.\.' | grep -v '\\n' || true)"
N_MG="$(printf '%s\n' "$MERGED" | grep -c . || true)"
if [ "$N_MG" -gt 0 ]; then
  echo "$N_MG linha(s) adicionada(s) com visão mesclada de duas fontes:"
  printf '%s\n' "$MERGED" | head -10 | sed 's/^/  /' | cut -c1-170
  echo "  → resolver sobre a mescla, ok. GRAVAR a mescla: o update que removia a chave a vê voltar."
  VER_5="$N_MG linha(s) com visão mesclada"
else
  echo "n/a — nenhuma mescla de duas fontes nas linhas adicionadas"
  VER_5="n/a — 0 hits"
fi

# ════════════════════════════════════════════════════════════════ VEREDITO
if [ "$MD" -eq 1 ]; then
  cat <<MDEOF

──────── cole no relatório (§5 Gates rodados) ────────

| sonda                | veredito |
|----------------------|----------|
| 1a trajetória        | $VER_1A |
| 1b credencial        | $VER_1B |
| 2 irmãs do removido  | $VER_2 |
| 3 membro órfão       | $VER_3 |
| 4 gêmea assimétrica  | $VER_4 |
| 5 escrita colateral  | $VER_5 |
MDEOF
else
  hdr "veredito"
  echo "1a trajetória       $VER_1A"
  echo "1b credencial       $VER_1B"
  echo "2  irmãs removido   $VER_2"
  echo "3  membro órfão     $VER_3"
  echo "4  gêmea assim.     $VER_4"
  echo "5  escrita colat.   $VER_5"
fi
echo
echo "As seis linhas vão para o relatório, 'n/a' incluído. Sonda calada = omissão."
exit 0
