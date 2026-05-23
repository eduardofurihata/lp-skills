#!/usr/bin/env bash
# sync-from-local.sh — Sincroniza ~/.claude/skills/ -> repo lp-skills + commit + push.
# Pensado para ser disparado por hook SessionStart do Claude Code.
# Resolve symlinks (rsync -aL), exclui backups, é idempotente, com lockfile e debounce.

set -uo pipefail

REPO_DIR="${LP_SKILLS_REPO:-$HOME/GitHub/lp-skills}"
LOCAL_SKILLS="${LP_SKILLS_SRC:-$HOME/.claude/skills}"
LOCK="/tmp/lp-skills-sync.lock"
LOG="/tmp/lp-skills-sync.log"
DEBOUNCE_SEC=30

log() {
  printf '[%s] %s\n' "$(date -Iseconds)" "$*" >> "$LOG"
}

# Debounce: pula se último run < DEBOUNCE_SEC
if [[ -f "$LOCK" ]]; then
  last_mtime=$(stat -c %Y "$LOCK" 2>/dev/null || echo 0)
  now=$(date +%s)
  age=$((now - last_mtime))
  if [[ $age -lt $DEBOUNCE_SEC ]]; then
    exit 0
  fi
fi

# Lockfile não-bloqueante: se outra instância roda, sai
exec 9>"$LOCK"
if ! flock -n 9; then
  exit 0
fi
touch "$LOCK"

# Sanidade
if [[ ! -d "$REPO_DIR" ]]; then
  log "repo dir não encontrado: $REPO_DIR"
  exit 1
fi
if [[ ! -d "$LOCAL_SKILLS" ]]; then
  log "skills locais não encontradas: $LOCAL_SKILLS"
  exit 1
fi
if ! command -v rsync >/dev/null 2>&1; then
  log "rsync não instalado"
  exit 1
fi

cd "$REPO_DIR" || { log "cd falhou: $REPO_DIR"; exit 1; }

# Pull com rebase apenas se houver remote origin configurado
if git remote get-url origin >/dev/null 2>&1; then
  if ! git pull --rebase --autostash origin main >>"$LOG" 2>&1; then
    log "pull/rebase falhou, abortando rebase"
    git rebase --abort >/dev/null 2>&1 || true
    exit 1
  fi
else
  log "sem remote origin — pulando pull (bootstrap?)"
fi

mkdir -p "$REPO_DIR/skills"

# Sync com symlinks resolvidos, sem backups, sem links inseguros
rsync_status=0
rsync -aL --delete --safe-links \
  --exclude='*.bak' \
  --exclude='*.bak*' \
  --exclude='*.backup' \
  --exclude='*.7z' \
  --exclude='.DS_Store' \
  "$LOCAL_SKILLS/" "$REPO_DIR/skills/" >>"$LOG" 2>&1 || rsync_status=$?

if [[ $rsync_status -ne 0 ]]; then
  log "rsync falhou com código $rsync_status"
  exit 1
fi

# Mask de credenciais e dados sensíveis no repo público
# (local mantém os valores reais para uso de teste; repo recebe placeholder)
if command -v sed >/dev/null 2>&1; then
  while IFS= read -r -d '' file; do
    sed -i \
      -e 's/test2@test\.com/<test-user-email>/g' \
      -e 's/Test123!@#/<test-user-password>/g' \
      "$file"
  done < <(find "$REPO_DIR/skills" -type f -name '*.md' -print0 2>/dev/null)
fi

# Idempotência: só commita se houver diff em skills/
if git diff --quiet skills/ && git diff --cached --quiet skills/; then
  exit 0
fi

git add skills/ >>"$LOG" 2>&1

if ! git commit -m "chore(sync): skills $(date -Iseconds)" >>"$LOG" 2>&1; then
  log "commit falhou"
  exit 1
fi

if git remote get-url origin >/dev/null 2>&1; then
  if ! git push origin main >>"$LOG" 2>&1; then
    log "push falhou — resolver manualmente, nunca force-push"
    exit 1
  fi
else
  log "sem remote — commit local feito, sem push (bootstrap?)"
fi

log "sync ok"
exit 0
