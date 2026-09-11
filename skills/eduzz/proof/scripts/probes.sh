#!/usr/bin/env bash
# probes.sh — as 6 sondas do /proof: o que o diff NÃO tem linha para mostrar.
#
# O diff é a projeção de duas pontas. Ele mostra a mudança, não o que ela ALCANÇA
# nem o que ela DEIXOU ATRÁS. Cada sonda faz uma pergunta que a leitura do diff não faz.
#
# Diagnóstico, não gate: sai 0 sempre. Sonda sem hit imprime "n/a" com o motivo —
# sonda calada é o que faz um achado virar omissão.
set -uo pipefail

BASE=""; EXT=""; RADICAL=""; MD=0; VETERANO=""; NOVO=""; CAMINHO=""; CAMPO=""; JANELA=25; TETO=200

usage() {
  cat <<'USAGE'
uso: probes.sh [--base <ref>] [--ext '<glob>'] [--radical <nome>]
               [--veterano <irmão>] [--novo <literal|identificador>] [--caminho <nó>]
               [--campo <k>[=<k2>]] [--janela N] [--teto N] [--md]

  --base       ref de comparação. Omitido: descobre por gh pr view -> branch de
               integração (dev/main/master) -> merge-base.
  --ext        glob de arquivos p/ os greps de código. Omitido: DERIVADO do diff.
  --radical    nome da família p/ a sonda 4 quando ela é preexistente (não aparece no diff).
  --veterano   irmão veterano p/ a sonda 3 (sobrescreve a heurística de vizinhança).
  --novo       membro novo p/ a sonda 3: literal de catálogo OU identificador (campo).
  --caminho    nó novo p/ a sonda 3 (diretório/pacote), ex.: libs/env.
  --campo      chave p/ a sonda 6: `k` (apagada) ou `k=k2` (movida de k para k2).
  --janela     largura da janela de enumeração da sonda 3, em linhas (default 25).
  --teto       irmão presente em mais arquivos que isto é vocabulário, não catálogo (default 200).
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
    --caminho) CAMINHO="${2:-}"; shift 2 ;;
    --campo) CAMPO="${2:-}"; shift 2 ;;
    --janela) JANELA="${2:-25}"; shift 2 ;;
    --teto) TETO="${2:-200}"; shift 2 ;;
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
# Ref simbólica (origin/main) vira o merge-base: "base...HEAD" já faz isso no diff, mas
# `git cat-file -e base:caminho` (sonda 3) e `git ls-tree base` precisam do commit concreto.
BASE="$(git merge-base "$BASE" HEAD 2>/dev/null || git rev-parse "$BASE")"
BASE_SHORT="$(git rev-parse --short "$BASE" 2>/dev/null || echo "$BASE")"

TOCADOS="$(git diff "$BASE...HEAD" --name-only 2>/dev/null || true)"
N_TOCADOS="$(printf '%s\n' "$TOCADOS" | grep -c . || true)"
N_COMMITS="$(git rev-list --count "$BASE..HEAD" 2>/dev/null || echo 0)"
TMPD="$(mktemp -d)"; trap 'rm -rf "$TMPD"' EXIT
printf '%s\n' "$TOCADOS" | sort -u > "$TMPD/tocados"

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

# Descritores de build/deploy/config — onde vive a enumeração À MÃO (Dockerfile, compose,
# CI, Makefile, manifesto, terraform). Ficam FORA de CODE_EXTS de propósito (a prosa de
# .json/.md afogava as sondas 2/4/5) e por isso entram só na sonda que procura SÍTIO de
# registro (3). Medido: um pacote novo ausente de 3 Dockerfiles e de um `postinstall`
# passou por tsc, jest e pela sonda 3 antiga — nenhum deles lê Dockerfile.
DESC_GLOBS=('*Dockerfile*' '*.yml' '*.yaml' '*.toml' '*Makefile*' '*.json' '*.tf' '*.tfvars' '*.mk' '*.cfg' '*.ini' '*.gradle' '*.csproj' '*.xml' '*.env*' '*.properties')
ALL_CODE=(); for e in $CODE_EXTS; do ALL_CODE+=("*.$e"); done
EXCL=(':!*.lock' ':!*lock.yaml' ':!*lock.json' ':!**/generated/**' ':!.proof/**' ':!*.min.*' ':!*.map' ':!*.snap')
TESTES=(':!*.spec.*' ':!*.test.*' ':!**/__tests__/**' ':!**/test/**' ':!**/tests/**' ':!*_test.go' ':!*test_*.py' ':!**/fixtures/**' ':!**/__mocks__/**')
# Palavras que a forma de declaração captura sem serem membro de família (keywords e vocabulário universal).
STOP='default|case|else|return|if|for|while|switch|try|catch|finally|export|import|const|let|var|type|interface|class|function|async|await|new|delete|this|super|constructor|get|set|static|abstract|declare|namespace|module|enum|yield|do|in|of|with|throw|typeof|instanceof|void|null|true|false|undefined|public|private|protected|readonly|id|key|value|name|data|error|result|status|message|label|title|description|url|path|items|props|children|className|style|onClick|onChange|params|options|config|args|body|query|user|res|req|next|err|logger|log|warn|info|debug|trace|fatal|level|e|i|j|k|x|y|z'

VER_1A="n/a"; VER_1B="n/a"; VER_2="n/a"; VER_3="n/a"; VER_4="n/a"; VER_5="n/a"; VER_6="n/a"

hdr() { echo; echo "════ $1"; }
tocado() { grep -qxF "$1" "$TMPD/tocados"; }
snake() { printf '%s' "$1" | sed -E 's/([a-z0-9])([A-Z])/\1_\2/g' | tr 'A-Z' 'a-z'; }
# raiz de pacote de um arquivo: o ancestral mais próximo com manifesto; sem manifesto, "."
raiz_pacote() {
  local d; d="$(dirname "$1")"
  while [ "$d" != "." ] && [ "$d" != "/" ]; do
    for m in package.json go.mod pyproject.toml Cargo.toml pom.xml build.gradle composer.json Gemfile; do
      [ -e "$d/$m" ] && { echo "$d"; return; }
    done
    d="$(dirname "$d")"
  done
  echo "."
}

echo "/proof · 6 sondas — o que o diff não mostra"
echo "repo:  $(basename "$(git rev-parse --show-toplevel)")  ·  branch: $(git rev-parse --abbrev-ref HEAD)"
echo "base:  $BASE_SHORT  ($BASE_ORIGEM)  ·  $N_TOCADOS arquivos · $N_COMMITS commits"
echo "ext:   $EXT  ($EXT_ORIGEM)  ·  sonda 3: janela $JANELA linhas, teto de vocabulário $TETO arquivos"

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
# a ASSINATURA e filtramos por RARIDADE. (Campo que MUDOU DE MÃO não passa por aqui —
# tem leitores demais para ser raro; é a sonda 6.)
hdr "2 · irmãs do removido — a assinatura da linha '-' sobrevive em outro arquivo?"

git diff "$BASE...HEAD" --diff-filter=M -- "${PATHSPEC[@]}" 2>/dev/null \
  | grep '^-[^-]' \
  | grep -oE '[A-Za-z_$][A-Za-z0-9_$]*(\[[0-9]+\]|\.[A-Za-z_$][A-Za-z0-9_$]*)+' \
  | sort -u > "$TMPD/sigs" || true
N_ASS="$(grep -c . "$TMPD/sigs" || true)"
# UM grep para todas as assinaturas (medido: 176 greps individuais custavam minutos); a
# atribuição linha→assinatura é feita no awk por substring, que é o que -F já fazia.
if [ "$N_ASS" -gt 0 ]; then
  git grep -n -F -f "$TMPD/sigs" -- "${PATHSPEC[@]}" 2>/dev/null > "$TMPD/sighits" || true
  awk -F: -v sigf="$TMPD/sigs" -v tocf="$TMPD/tocados" '
    BEGIN { while ((getline s < sigf) > 0) if (s != "") S[++n] = s
            while ((getline t < tocf) > 0) T[t] = 1 }
    { file = $1; txt = substr($0, length($1) + length($2) + 3)
      for (i = 1; i <= n; i++) if (index(txt, S[i]) > 0) { occ[S[i]]++; if (!(file in T)) fora[S[i] SUBSEP file] = 1 } }
    END { for (s in occ) if (occ[s] >= 1 && occ[s] <= 3) {
            nf = 0; for (k in fora) { split(k, p, SUBSEP); if (p[1] == s) nf++ }
            print occ[s] "\t" nf "\t" s } }' "$TMPD/sighits" | sort -n > "$TMPD/raras"
fi
N_RARAS="$(grep -c . "$TMPD/raras" 2>/dev/null || true)"
# A discriminação que separa sinal de ruído: assinatura cujos hits vivos estão em
# arquivo que a PR NÃO TOCOU. Assinatura que só reaparece em arquivo tocado é o
# próprio diff se olhando no espelho.
awk -F'\t' '$2 > 0' "$TMPD/raras" 2>/dev/null | sort -t$'\t' -k2,2rn > "$TMPD/fora" || true
N_FORA="$(grep -c . "$TMPD/fora" 2>/dev/null || true)"

if [ "$N_FORA" -gt 0 ]; then
  echo "$N_ASS assinaturas removidas → $N_RARAS raras → $N_FORA sobrevivem em arquivo NÃO TOCADO:"
  head -12 "$TMPD/fora" | while IFS=$'\t' read -r n fora s; do
    [ -z "$s" ] && continue
    echo "  ${n}× $s  ($fora fora do diff)"
    grep -F "$s" "$TMPD/sighits" | while IFS= read -r l; do
      f="${l%%:*}"; tocado "$f" || echo "      $l" | cut -c1-150
    done | head -2
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
# Pergunta: o estado que acabei de criar PODE existir — e está REGISTRADO onde os irmãos estão?
# Membro novo de uma família é ESTADO NOVO: passa a atravessar todo consumidor do
# conjunto. Três formas de membro, um único motor:
#   caminho        — pacote/diretório novo (libs/env), ou arquivo NUMERADO (0318_x ao lado de 0317_y);
#   identificador  — campo novo declarado em 2+ arquivos: DTO, entidade, schema, mapper (o campo que VIAJA);
#   literal        — entrada nova de array/Set/Record ('x',).
# O diferencial é por BLOCO, não por arquivo (medido: o arquivo que enumerava os irmãos
# no caminho de update TINHA o campo novo — e o bloco do create, 400 linhas acima, não).
# Sítio = janela de $JANELA linhas com >=2 irmãos da MESMA FORMA e o novo ausente em ±janela.
# Irmão em mais de $TETO arquivos é vocabulário e sai. Descritores de build entram: é onde
# a enumeração à mão mora. Testes saem: fixture sem o campo novo não é defeito.
hdr "3 · membro órfão — o bloco que enumera os irmãos (em qualquer arquivo) tem o membro novo?"

# ---- hits de UMA forma: um grep com o novo + os irmãos; awk atribui o token com fronteira.
#      stdout TSV: arquivo \t linha \t V|N \t forma \t token
hits_tsv() {
  local forma="$1" novo="$2"; shift 2
  local args=(-e "$novo"); local t; for t in "$@"; do args+=(-e "$t"); done
  local W='-w'; [ "$forma" = "lit" ] && W=''
  git grep -n $W -F "${args[@]}" -- "${ALL_CODE[@]}" "${DESC_GLOBS[@]}" "${EXCL[@]}" "${TESTES[@]}" "${EXCL_EXTRA[@]}" 2>/dev/null \
    | awk -F: -v forma="$forma" -v novo="$novo" -v toks="$(printf '%s\n' "$@")" '
      BEGIN { nt = split(toks, T, "\n") }
      function boundary(line, tok,   p, off, a, b, L) {
        off = 1; L = length(tok)
        while ((p = index(substr(line, off), tok)) > 0) {
          p += off - 1; a = (p > 1) ? substr(line, p-1, 1) : ""; b = substr(line, p+L, 1)
          if (forma == "lit") { if ((a == "\047" || a == "\"") && (b == "\047" || b == "\"")) return 1 }
          else if (a !~ /[A-Za-z0-9_]/ && b !~ /[A-Za-z0-9_]/) return 1
          off = p + 1
        }
        return 0
      }
      { file = $1; ln = $2; line = substr($0, length(file) + length(ln) + 3)
        if (line ~ /^[[:space:]]*(import|from |use |using |#include)/ || line ~ /(from|require\(|import\()[[:space:]]*[\047"]/) next   # consumo (import/require), não registro
        if (boundary(line, novo)) print file "\t" ln "\tN\t" forma "\t" novo
        for (i = 1; i <= nt; i++) if (T[i] != "" && T[i] != novo && boundary(line, T[i])) print file "\t" ln "\tV\t" forma "\t" T[i] }'
}
# ---- tira os irmãos-vocabulário (> TETO arquivos) e os que não aparecem; anota quantos sobraram
filtrar_teto() {
  awk -F'\t' -v teto="$TETO" '
    { rows[++n] = $0; if ($3 == "V") files[$4 SUBSEP $5 SUBSEP $1] = 1 }
    END { for (k in files) { split(k, p, SUBSEP); cnt[p[1] SUBSEP p[2]]++ }
          for (i = 1; i <= n; i++) { split(rows[i], f, "\t")
            if (f[3] == "N" || (cnt[f[4] SUBSEP f[5]] >= 1 && cnt[f[4] SUBSEP f[5]] <= teto)) print rows[i] } }'
}
# ---- motor de sítios: stdin TSV do hits_tsv (já filtrado)
#      stdout TSV `arquivo \t linha \t irmãos \t meio`  (meio=1: o arquivo tem o novo em OUTRO bloco)
sitios_orfaos() {
  sort -t$'\t' -k1,1 -k4,4 -k2,2n | awk -F'\t' -v W="$JANELA" '
    function flush(   n, k, s, i, ok) {
      if (cs == "") return
      n = 0; s = ""
      for (k in vd) { n++; s = s (s == "" ? "" : ", ") k }
      if (n >= 2) {
        ok = 1
        for (i = cs - 4*W; i <= ce + 4*W; i++) if ((cf SUBSEP cform SUBSEP i) in nl) { ok = 0; break }
        if (ok) print cf "\t" cs "\t" s "\t" ((cf SUBSEP cform) in nf ? 1 : 0)
      }
      cs = ""; delete vd
    }
    { if ($3 == "N") { nl[$1 SUBSEP $4 SUBSEP ($2+0)] = 1; nf[$1 SUBSEP $4] = 1; next }
      rows[++nr] = $0 }
    END {
      cs = ""; cf = ""; cform = ""; ce = 0
      for (r = 1; r <= nr; r++) {
        split(rows[r], f, "\t")
        if (cs != "" && (f[1] != cf || f[4] != cform || f[2]+0 - ce > W)) flush()
        if (cs == "") { cs = f[2]+0; cf = f[1]; cform = f[4] }
        ce = f[2]+0; vd[f[5]] = 1
      }
      flush()
    }'
}
# ---- imprime os sítios de um candidato (um arquivo por linha, por prioridade); devolve 0 se achou
#      $3 = lista de tokens do novo (todas as formas), p/ o teste DEPENDE da raiz de pacote
relatar_sitios() {
  local rotulo="$1" tsv="$2" novotoks="${3:-}"
  local SIT; SIT="$(printf '%s\n' "$tsv" | filtrar_teto | sitios_orfaos)"
  local n; n="$(printf '%s\n' "$SIT" | grep -c . || true)"
  [ "$n" -eq 0 ] && return 1
  local narq; narq="$(printf '%s\n' "$SIT" | cut -f1 | sort -u | grep -c . || true)"
  printf '%s\n' "$SIT" | awk -F'\t' '{ if (!($1 in first)) { first[$1]=$2; irm[$1]=$3; meio[$1]=$4; cnt[$1]=0 } cnt[$1]++ }
    END { for (f in first) print meio[f] "\t" f "\t" first[f] "\t" cnt[f] "\t" irm[f] }' > "$TMPD/sit"
  local ndep=0 nmeio=0 ntoc=0
  declare -A DEP=()
  while IFS=$'\t' read -r meio f ln cnt irm; do
    pri=3; tag="            "
    if tocado "$f"; then pri=2; tag="TOCADO      "; ntoc=$((ntoc+1)); fi
    if [ "$meio" = "1" ]; then pri=1; tag="MEIO-LIGADO "; nmeio=$((nmeio+1)); fi
    # DEPENDE: a raiz de pacote deste sítio referencia o membro novo em algum lugar — o registro
    # é exigido, não opcional (o serviço que importa o pacote novo e o Dockerfile que não o copia).
    if [ -n "$novotoks" ]; then
      raiz="$(raiz_pacote "$f")"
      if [ -z "${DEP[$raiz]+x}" ]; then
        args=(); for t in $novotoks; do args+=(-e "$t"); done
        if git grep -q -w -F "${args[@]}" -- "$raiz" "${EXCL[@]}" "${EXCL_EXTRA[@]}" 2>/dev/null; then DEP[$raiz]=1; else DEP[$raiz]=0; fi
      fi
      [ "${DEP[$raiz]}" = "1" ] && { pri=0; tag="DEPENDE     "; ndep=$((ndep+1)); }
    fi
    extra=""; [ "$cnt" -gt 1 ] && extra="  (+$((cnt-1)) bloco(s))"
    printf '%s\t      %s %s:%s  (%s)%s\n' "$pri" "$tag" "$f" "$ln" "$irm" "$extra"
  done < "$TMPD/sit" | sort -t$'\t' -k1,1n > "$TMPD/sit.out"
  local resumo="$narq arquivo(s)"
  [ "$ndep" -gt 0 ] && resumo="$resumo · $ndep DEPENDE"
  [ "$nmeio" -gt 0 ] && resumo="$resumo · $nmeio MEIO-LIGADO"
  [ "$ntoc" -gt 0 ] && resumo="$resumo · $ntoc TOCADO"
  echo "  $rotulo  →  $n sítio(s) sem ele em $resumo:"
  cut -f2- "$TMPD/sit.out" | head -8 | cut -c1-170
  [ "$narq" -gt 8 ] && echo "      … e $((narq-8)) arquivo(s)"
  LINHAS_3="${LINHAS_3}${rotulo%% *}: $n sítios/$narq arq${ndep:+}; "
  return 0
}

ACHOU_3=0; LINHAS_3=""; REPORTADOS=0; N_CAND_3=0; EXCL_EXTRA=()

# ---- 3a · CAMINHO: nó novo = prefixo mais raso ausente na base; arquivo numerado = irmãos por número
NOS=""; NUMERADOS=""
if [ -n "$CAMINHO" ]; then
  NOS="$CAMINHO"
else
  while read -r p; do
    [ -z "$p" ] && continue
    dir="$(dirname "$p")"; node=""; pref=""
    if [ "$dir" != "." ]; then
      IFS=/ read -r -a parts <<< "$dir"
      for part in "${parts[@]}"; do
        pref="${pref:+$pref/}$part"
        if ! git cat-file -e "$BASE:$pref" 2>/dev/null; then node="$pref"; break; fi
      done
    fi
    if [ -n "$node" ]; then NOS="$NOS$node"$'\n'; continue; fi
    b="$(basename "$p")"
    [[ "$b" =~ ^[0-9]{3,}[_-] ]] && NUMERADOS="$NUMERADOS$p"$'\n'
  done <<< "$(git diff --diff-filter=A --name-only "$BASE...HEAD" 2>/dev/null)"
  NOS="$(printf '%s' "$NOS" | sort -u)"; NUMERADOS="$(printf '%s' "$NUMERADOS" | sort -u)"
fi

while read -r node; do
  [ -z "$node" ] && continue; [ "$REPORTADOS" -ge 5 ] && break
  N_CAND_3=$((N_CAND_3+1))
  parent="$(dirname "$node")"; nb="$(basename "$node")"
  if [ "$parent" = "." ]; then pfx=""; pb=""; SIBS="$(git ls-tree -d --name-only "$BASE" 2>/dev/null)"
  else pfx="$parent/"; pb="$(basename "$parent")"; SIBS="$(git ls-tree -d --name-only "$BASE" -- "$pfx" 2>/dev/null)"; fi
  SIBS="$(printf '%s\n' "$SIBS" | sed "s#^$pfx##" | grep -vxF "$nb" | grep -v '^$' || true)"
  [ -n "$VETERANO" ] && SIBS="$VETERANO"
  [ "$(printf '%s\n' "$SIBS" | grep -c .)" -lt 2 ] && continue
  EXCL_EXTRA=(":!$node/**")
  TSV=""; NOVOTOKS="$pfx$nb"
  TSV="$TSV$(hits_tsv path "$pfx$nb" $(printf '%s\n' "$SIBS" | sed "s#^#$pfx#"))"$'\n'
  if [ -n "$pb" ]; then
    # <pai>-<nome> cobre @escopo/<pai>-<nome>; <pai>_<nome> cobre a variante com underscore
    TSV="$TSV$(hits_tsv dash "$pb-$nb" $(printf '%s\n' "$SIBS" | sed "s#^#$pb-#"))"$'\n'
    TSV="$TSV$(hits_tsv under "${pb}_$nb" $(printf '%s\n' "$SIBS" | sed "s#^#${pb}_#"))"$'\n'
    NOVOTOKS="$NOVOTOKS $pb-$nb ${pb}_$nb"
  fi
  # nome de pacote derivado do package.json de um irmão — quando o nome NÃO usa o prefixo do pai
  for sib in $SIBS; do
    nm="$(git show "$BASE:$pfx$sib/package.json" 2>/dev/null | grep -m1 -oE '"name"[[:space:]]*:[[:space:]]*"[^"]+"' | sed -E 's/.*"([^"]+)"$/\1/')"
    [ -z "$nm" ] && continue
    case "$nm" in *"$sib"*) ;; *) continue ;; esac
    novo_pkg="${nm//$sib/$nb}"
    case "$novo_pkg" in *"$pb-$nb"*|*"${pb}_$nb"*) break ;; esac   # a forma dash/under já cobre
    TSV="$TSV$(hits_tsv pkg "$novo_pkg" $(printf '%s\n' "$SIBS" | while read -r s; do printf '%s\n' "${nm//$sib/$s}"; done))"$'\n'
    NOVOTOKS="$NOVOTOKS $novo_pkg"
    break
  done
  relatar_sitios "'$node' (caminho novo; irmãos: $(printf '%s\n' "$SIBS" | head -3 | paste -sd',' -)…)" "$TSV" "$NOVOTOKS" \
    && { ACHOU_3=1; REPORTADOS=$((REPORTADOS+1)); }
done <<< "$NOS"
EXCL_EXTRA=()

while read -r p; do
  [ -z "$p" ] && continue; [ "$REPORTADOS" -ge 5 ] && break
  N_CAND_3=$((N_CAND_3+1))
  dir="$(dirname "$p")"; b="$(basename "$p")"; stem="${b%.*}"; num="${b%%[_-]*}"
  vets="$(git ls-tree --name-only "$BASE" -- "$dir/" 2>/dev/null | sed 's#.*/##' | grep -E '^[0-9]{3,}[_-]' \
    | awk -v n="$num" '{ split($0, a, /[_-]/); if (a[1]+0 < n+0) print a[1]+0 "\t" $0 }' | sort -rn | head -3 | cut -f2 | sed 's/\.[^.]*$//')"
  [ "$(printf '%s\n' "$vets" | grep -c .)" -lt 2 ] && continue
  TSV="$(hits_tsv num "$stem" $vets)"
  relatar_sitios "'$b' (arquivo numerado; irmãos: $(printf '%s\n' "$vets" | paste -sd',' -))" "$TSV" \
    && { ACHOU_3=1; REPORTADOS=$((REPORTADOS+1)); }
done <<< "$NUMERADOS"

# ---- 3b · IDENTIFICADOR: campo declarado em >=2 arquivos (o campo que viaja)
DECL_RE='^[[:space:]]*(readonly[[:space:]]+|public[[:space:]]+|private[[:space:]]+|protected[[:space:]]+)?[A-Za-z_][A-Za-z0-9_]*[?]?[[:space:]]*[:=]'
git diff -U0 "$BASE...HEAD" -- "${PATHSPEC[@]}" "${TESTES[@]}" 2>/dev/null \
  | awk -v re="$DECL_RE" '/^\+\+\+ /{ f=substr($2,3); next }
      /^\+[^+]/ { l=substr($0,2); if (l ~ re) { sub(/^[[:space:]]*(readonly[[:space:]]+|public[[:space:]]+|private[[:space:]]+|protected[[:space:]]+)?/, "", l); match(l, /^[A-Za-z_][A-Za-z0-9_]*/); print f "\t" substr(l, 1, RLENGTH) } }' \
  | sort -u | grep -vE $'\t'"($STOP)\$" > "$TMPD/decls" || true
if [ -n "$NOVO" ] && [[ "$NOVO" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
  IDENTS="$NOVO"
else
  IDENTS="$(cut -f2 "$TMPD/decls" | sort | uniq -c | awk '$1>=2 {print $1 "\t" $2}' | sort -rn | head -3 | cut -f2)"
fi
while read -r id; do
  [ -z "$id" ] && continue; [ "$REPORTADOS" -ge 5 ] && break
  N_CAND_3=$((N_CAND_3+1))
  # vizinhos: identificadores na mesma forma de declaração, ±30 linhas (decorators espaçam os
  # campos de um DTO), em cada arquivo onde o novo foi declarado; os que se repetem em mais sítios primeiro
  ARQS="$(awk -F'\t' -v id="$id" '$2==id {print $1}' "$TMPD/decls" | sort -u)"
  [ -z "$ARQS" ] && ARQS="$(git grep -l -w -F -e "$id" -- "${PATHSPEC[@]}" "${TESTES[@]}" 2>/dev/null | head -6)"
  VIZ="$(printf '%s\n' "$ARQS" | while read -r f; do
    [ -f "$f" ] || continue
    grep -nE "^[[:space:]]*(readonly[[:space:]]+|public[[:space:]]+|private[[:space:]]+|protected[[:space:]]+)?${id}[?]?[[:space:]]*[:=]" "$f" 2>/dev/null | cut -d: -f1 | head -2 | while read -r ln; do
      a=$((ln>30 ? ln-30 : 1)); b=$((ln+30))
      sed -n "${a},${b}p" "$f" | grep -E "$DECL_RE" | sed -E 's/^[[:space:]]*(readonly[[:space:]]+|public[[:space:]]+|private[[:space:]]+|protected[[:space:]]+)?//' \
        | grep -oE '^[A-Za-z_][A-Za-z0-9_]*' | grep -vxF "$id" | grep -vxE "$STOP" | sort -u | sed "s#^#$f\t#"
    done
  done | sort -u | cut -f2 | sort | uniq -c | sort -rn | head -8 | awk '{print $2}')"
  [ -n "$VETERANO" ] && VIZ="$VETERANO"
  [ "$(printf '%s\n' "$VIZ" | grep -c .)" -lt 2 ] && continue
  TSV="$(hits_tsv camel "$id" $VIZ)"$'\n'
  sn="$(snake "$id")"
  if [ "$sn" != "$id" ]; then
    TSV="$TSV$(hits_tsv snake "$sn" $(for v in $VIZ; do snake "$v"; done))"$'\n'
  fi
  relatar_sitios "'$id' (identificador declarado em $(printf '%s\n' "$ARQS" | grep -c .) arq; irmãos: $(printf '%s\n' "$VIZ" | head -5 | paste -sd',' -))" "$TSV" \
    && { ACHOU_3=1; REPORTADOS=$((REPORTADOS+1)); }
done <<< "$IDENTS"

# ---- 3c · LITERAL: entrada nova de catálogo ('x',) — irmãos são vizinhos de ±6 linhas no arquivo final
if [ -n "$NOVO" ] && ! [[ "$NOVO" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
  CANDS="$NOVO"
elif [ -n "$NOVO" ]; then
  CANDS=""
else
  CANDS="$(git diff "$BASE...HEAD" -U0 -- "${PATHSPEC[@]}" "${TESTES[@]}" 2>/dev/null \
    | grep -E "^\+[[:space:]]*['\"][a-z][a-z0-9_]{3,}['\"],?[[:space:]]*$" \
    | grep -oE "['\"][a-z][a-z0-9_]{3,}['\"]" | tr -d "\"'" | sort -u || true)"
fi
for novo in $CANDS; do
  [ "$REPORTADOS" -ge 5 ] && break
  N_CAND_3=$((N_CAND_3+1))
  ARQ_NOVO="$(git grep -l -F -e "'$novo'" -e "\"$novo\"" -- "${PATHSPEC[@]}" 2>/dev/null | sort -u || true)"
  [ -z "$ARQ_NOVO" ] && continue
  if [ -n "$VETERANO" ]; then IRMAOS="$VETERANO"; else
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
  [ "$(printf '%s\n' "$IRMAOS" | grep -c .)" -lt 2 ] && continue
  # literal em MUITOS arquivos é vocabulário do repo, não membro de catálogo (medido: 30)
  TSV="$(TETO=30 hits_tsv lit "$novo" $IRMAOS)"
  relatar_sitios "'$novo' (literal de catálogo; irmãos: $(printf '%s\n' "$IRMAOS" | head -4 | paste -sd',' -))" "$(printf '%s\n' "$TSV")" \
    && { ACHOU_3=1; REPORTADOS=$((REPORTADOS+1)); }
done

if [ "$ACHOU_3" -eq 1 ]; then
  echo "  → cada sítio é um bloco que enumera os irmãos e pode não enumerar o novo: registro esquecido, ou"
  echo "    omissão que precisa de motivo escrito. DEPENDE = a raiz de pacote do sítio referencia o novo;"
  echo "    MEIO-LIGADO = o arquivo tem o novo em OUTRO bloco (um caminho ligado, o outro não)."
  VER_3="$(printf '%s' "$LINHAS_3" | cut -c1-90)"
elif [ "$N_CAND_3" -gt 0 ]; then
  echo "n/a — $N_CAND_3 candidato(s) (caminho/identificador/literal), nenhum com bloco de irmãos sem ele"
  VER_3="n/a — $N_CAND_3 candidatos, 0 sítios órfãos"
else
  echo "n/a — nenhum nó novo, arquivo numerado, campo declarado em 2+ arquivos ou literal de catálogo no diff."
  echo "  → família que mudou de outra forma: --caminho <nó>, --novo <campo|literal>, --veterano <irmão>."
  VER_3="n/a — nenhum candidato detectado"
fi

# ════════════════════════════════════════════════════════════════ 4 · GÊMEA ASSIMÉTRICA
# Pergunta: a função irmã é CHAMADA sob a mesma guarda?
# Compare as CHAMADAS, não os corpos: irmã chamada sob guarda diferente é a próxima
# divergência, já instalada. (Campo que chega ao update e não ao create é a sonda 3b.)
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
# Pergunta: o que isto GRAVA é o que precisou LER — ou o que NÃO CONSEGUIU ler?
# Resolver sobre a visão mesclada é correto; PATCHAR a visão mesclada transforma
# "remover chave" em impossível. E a variante: valor DERIVADO de consulta (lista de um
# picker, resposta de API) gravado sem guarda de sucesso — a consulta vazia/falhando
# vira '' no registro, e o modo "editar" apaga o que o modo "criar" tinha gravado.
hdr "5 · escrita colateral — o read-set virou write-set (ou o que não leu virou '')?"

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
echo
echo "-- escrita derivada de consulta, sem guarda de sucesso (setValue/assign de valor que vem de lista) --"
DERIV="$(git diff "$BASE...HEAD" -U0 -- "${PATHSPEC[@]}" "${TESTES[@]}" 2>/dev/null \
  | grep -E "^\+.*(setValue|setFieldValue|patchValue|\.reset|assign)\(" \
  | grep -vE "isSuccess|isError|status ===|\?\? *(initial|existing|current|prev|stored|saved)|initialData|defaultValue|Object\.assign\(\{\}" || true)"
N_DV="$(printf '%s\n' "$DERIV" | grep -c . || true)"
if [ "$N_DV" -gt 0 ]; then
  echo "$N_DV escrita(s) de formulário/estado sem sinal de guarda na mesma linha:"
  printf '%s\n' "$DERIV" | head -8 | sed 's/^/  /' | cut -c1-170
  echo "  → se o valor vem de consulta: a consulta vazia/falhando grava ''? O modo EDITAR sobrevive (carrega → salva → igual)?"
  VER_5="$VER_5 · $N_DV escrita(s) derivada(s) sem guarda"
else
  echo "n/a — nenhuma escrita de formulário/estado nas linhas adicionadas"
fi

# ════════════════════════════════════════════════════════════════ 6 · CAMPO MUDOU DE MÃO
# Pergunta: o produtor moveu (ou apagou) um campo — quem AINDA lê o antigo?
# Um `-k: v` / `+k2: v` no mesmo hunk muda o contrato de todo leitor de k, inclusive em
# OUTRO serviço (evento, fila, DTO). Não passa na sonda 2: campo tem leitores demais para
# ser "raro". Sem filtro de raridade nos MOVIDOS — cada leitor é uma decisão a registrar:
# intencional (deve parar de ler) / migrado (lê os dois) / colateral (só lê o antigo).
# Arquivo com leitor migrado E leitor não migrado é o primeiro suspeito (medido: o alarme
# na linha 1040 migrou; o título na 1104, 60 linhas abaixo, não). Chave APAGADA de nome
# genérico (`id`, `error`) tem milhares de leitores e vocabulário não é achado: passa pelo teto.
hdr "6 · campo mudou de mão — quem ainda lê o campo que o produtor moveu ou apagou?"

if [ -n "$CAMPO" ]; then
  k="${CAMPO%%=*}"; k2=""; [ "${CAMPO#*=}" != "$CAMPO" ] && k2="${CAMPO#*=}"
  printf '%s\x1f%s\x1f%s\n' "$k" "$k2" "--campo" > "$TMPD/movidos"
else
  git diff -U0 "$BASE...HEAD" -- "${PATHSPEC[@]}" "${TESTES[@]}" 2>/dev/null \
    | awk -v stop="^($STOP)\$" '
      function chave(l,   k, v) {
        if (!match(l, /^[[:space:]]*[A-Za-z_][A-Za-z0-9_]*[[:space:]]*:[[:space:]]*/)) return ""
        k = substr(l, 1, RLENGTH); sub(/^[[:space:]]*/, "", k); sub(/[[:space:]]*:[[:space:]]*$/, "", k)
        v = substr(l, RLENGTH + 1); sub(/[[:space:]]*,?[[:space:]]*$/, "", v)
        if (v == "" || v ~ /;$/ || v ~ /^[{[(]$/ || k ~ stop) return ""
        return k "\t" v
      }
      function flush(   k, a, r, kk) {
        for (k in rem) { if (k in add) continue
          r = rem[k]; kk = ""
          for (a in add) if (add[a] == r && a != k) { kk = a; break }
          print k "\037" kk "\037" f }
        delete rem; delete add
      }
      /^\+\+\+ /{ f = substr($2, 3); next }
      /^@@/{ flush(); next }
      /^-[^-]/{ kv = chave(substr($0, 2)); if (kv != "") { split(kv, p, "\t"); rem[p[1]] = p[2] } }
      /^\+[^+]/{ kv = chave(substr($0, 2)); if (kv != "") { split(kv, p, "\t"); add[p[1]] = p[2] } }
      END { flush() }' | sort -u > "$TMPD/movidos" || true
fi
N_MV="$(grep -c . "$TMPD/movidos" 2>/dev/null || true)"
ACHOU_6=0; LINHAS_6=""
if [ "$N_MV" -gt 0 ]; then
  # um par (k,k2) por vez, mesmo que movido em vários arquivos; um grep de leitores por chave;
  # chave APAGADA acima do teto é vocabulário. k2 genérico (2 letras, ou palavra universal) não
  # serve para dizer que um arquivo "já conhece o novo" — fica sem classificação MEIO-MIGRADO.
  : > "$TMPD/mv.rank"
  sort -t$'\037' -k1,2 -u "$TMPD/movidos" | awk -F'\037' '{ print ($2 == "" ? 1 : 0) "\037" $0 }' | sort | cut -d$'\037' -f2- | head -12 \
  | while IFS=$'\037' read -r k k2 f; do
    [ -z "$k" ] && continue
    git grep -nE "(\.|\[['\"])${k}([^A-Za-z0-9_]|$)|(^|[^A-Za-z0-9_.])${k}[?]?\.|[{,][[:space:]]*${k}[[:space:]]*[,}]" -- "${ALL_CODE[@]}" "${EXCL[@]}" "${TESTES[@]}" 2>/dev/null \
      | grep -vE "^[^:]*:[0-9]+:[[:space:]]*(readonly[[:space:]]+)?${k}[?]?[[:space:]]*:" > "$TMPD/leit.$k" || true
    n_l="$(grep -c . "$TMPD/leit.$k" || true)"; [ "$n_l" -eq 0 ] && continue
    n_a="$(cut -d: -f1 "$TMPD/leit.$k" | sort -u | grep -c . || true)"
    [ -z "$k2" ] && [ "$n_a" -gt "$TETO" ] && continue
    k2ok=1; { [ -z "$k2" ] || [ "${#k2}" -le 2 ] || printf '%s' "$k2" | grep -qxE "$STOP"; } && k2ok=0
    : > "$TMPD/sabe.$k"; [ "$k2ok" -eq 1 ] && git grep -l -w -F -e "$k2" -- "${ALL_CODE[@]}" "${EXCL[@]}" "${TESTES[@]}" 2>/dev/null > "$TMPD/sabe.$k"
    awk -F: -v k2="$k2" -v k2ok="$k2ok" -v sabef="$TMPD/sabe.$k" -v tocf="$TMPD/tocados" '
      BEGIN { while ((getline s < sabef) > 0) S[s] = 1; while ((getline t < tocf) > 0) T[t] = 1 }
      { file = $1; txt = substr($0, length($1) + length($2) + 3); tot[file]++
        if (k2 == "" || index(txt, k2) == 0) { nao[file]++; if (nao[file] <= 3) amostra[file] = amostra[file] "          " $2 ": " substr(txt, 1, 130) "\\n" } }
      END { for (f in tot) {
              if (k2ok == 1 && (f in S) && nao[f] > 0) { pri = 0; tag = "MEIO-MIGRADO" }
              else if (k2ok == 1 && (f in S)) { pri = 3; tag = "migrado     " }
              else if (f in T) { pri = 1; tag = "TOCADO      " }
              else { pri = 2; tag = "            " }
              printf "%d\037%s\037%s\037%d\037%d\037%s\n", pri, tag, f, nao[f]+0, tot[f], amostra[f] } }' "$TMPD/leit.$k" \
      | sort -t$'\037' -k1,1n > "$TMPD/files.$k"
    n_meio="$(awk -F'\037' '$1==0' "$TMPD/files.$k" | grep -c . || true)"
    printf '%s\037%s\037%s\037%s\037%s\037%s\n' "$k" "$k2" "$f" "$n_l" "$n_a" "$n_meio" >> "$TMPD/mv.rank"
  done
  # ranking: movido antes de apagado; mais MEIO-MIGRADO primeiro; depois o mais ESPECÍFICO (menos arquivos)
  awk -F'\037' '{ printf "%d\037%06d\037%06d\037%s\n", ($2 == "" ? 1 : 0), 999999 - $6, $5, $0 }' "$TMPD/mv.rank" | sort | cut -d$'\037' -f4- | head -3 \
  | while IFS=$'\037' read -r k k2 f n_l n_a n_meio; do
    [ -z "$k" ] && continue
    if [ -n "$k2" ]; then rot="'$k' → '$k2' (moveu em $f)"; else rot="'$k' (apagado em $f)"; fi
    n_toc="$(awk -F'\037' '$1==1' "$TMPD/files.$k" | grep -c . || true)"
    resumo="$n_a arquivo(s)"; [ "$n_meio" -gt 0 ] && resumo="$resumo · $n_meio MEIO-MIGRADO"; [ "$n_toc" -gt 0 ] && resumo="$resumo · $n_toc TOCADO"
    echo "  $rot: $n_l leitor(es) do campo antigo em $resumo"
    head -5 "$TMPD/files.$k" | while IFS=$'\037' read -r pri tag fl nao tot amostra; do
      echo "      $tag $fl — $nao de $tot leitor(es) sem o novo"
      [ "$pri" -eq 3 ] && continue
      printf '%s' "$amostra" | sed 's/\\n/\n/g' | grep -v '^$' | head -3 | cut -c1-150
    done
    [ "$n_a" -gt 5 ] && echo "      … e $((n_a-5)) arquivo(s)"
    printf "'%s'%s: %s leitores/%s arq%s; " "$k" "${k2:+→'$k2'}" "$n_l" "$n_a" "$([ "$n_meio" -gt 0 ] && echo ", $n_meio meio-migrado")" >> "$TMPD/linhas6"
  done
  [ -s "$TMPD/linhas6" ] && { LINHAS_6="$(cat "$TMPD/linhas6")"; ACHOU_6=1; }
fi
if [ "$ACHOU_6" -eq 1 ]; then
  echo "  → cada leitor é uma decisão: intencional (deve parar de ler) / migrado (lê os dois) / colateral (só lê o antigo)."
  echo "    MEIO-MIGRADO = o arquivo já lê o novo em outra linha e ainda lê só o antigo nesta."
  VER_6="$(printf '%s' "$LINHAS_6" | cut -c1-90)"
elif [ "$N_MV" -gt 0 ]; then
  echo "n/a — $N_MV chave(s) movida(s)/apagada(s) em objeto, nenhuma com leitor fora da própria linha (ou só vocabulário)"
  VER_6="n/a — $N_MV chaves, 0 leitores relevantes"
else
  echo "n/a — nenhuma chave de objeto movida ou apagada nos hunks do diff."
  echo "  → renomeação distante (linhas em hunks diferentes) não é detectada: passe --campo <k>=<k2>."
  VER_6="n/a — nenhuma chave movida/apagada"
fi

# ════════════════════════════════════════════════════════════════ VEREDITO
if [ "$MD" -eq 1 ]; then
  cat <<MDEOF

──────── cole no relatório (§5 Gates rodados) ────────

| sonda                  | veredito |
|------------------------|----------|
| 1a trajetória          | $VER_1A |
| 1b credencial          | $VER_1B |
| 2 irmãs do removido    | $VER_2 |
| 3 membro órfão         | $VER_3 |
| 4 gêmea assimétrica    | $VER_4 |
| 5 escrita colateral    | $VER_5 |
| 6 campo mudou de mão   | $VER_6 |
MDEOF
else
  hdr "veredito"
  echo "1a trajetória       $VER_1A"
  echo "1b credencial       $VER_1B"
  echo "2  irmãs removido   $VER_2"
  echo "3  membro órfão     $VER_3"
  echo "4  gêmea assim.     $VER_4"
  echo "5  escrita colat.   $VER_5"
  echo "6  campo mudou mão  $VER_6"
fi
echo
echo "As sete linhas vão para o relatório, 'n/a' incluído. Sonda calada = omissão."
exit 0
