#!/usr/bin/env bash
# install.sh — instala o comando `runbook` (idempotente). Uso: runbook/install.sh
# Deixa ~/.local/bin/runbook apontando para este checkout, com o node absoluto no shim: roda mesmo
# onde o nvm não está no PATH. Precisa de Node >= 20 e das dependências do workspace do lp-skills.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
BIN="$HOME/.local/bin"
mkdir -p "$BIN"

command -v node >/dev/null || { echo "node não encontrado (precisa de Node >= 20)"; exit 1; }
NODE="$(command -v node)"
[ "$("$NODE" -p 'process.versions.node.split(".")[0]')" -ge 20 ] || { echo "precisa de Node >= 20 (tem $("$NODE" -v))"; exit 1; }

if [ ! -d "$HERE/node_modules/yaml" ]; then
  command -v pnpm >/dev/null || { echo "pnpm não encontrado: rode 'pnpm install' na raiz do lp-skills"; exit 1; }
  (cd "$HERE/.." && pnpm install --frozen-lockfile >/dev/null)
fi

cat > "$BIN/runbook" <<EOF
#!/bin/sh
# gerado por $HERE/install.sh
exec "$NODE" "$HERE/bin/runbook.mjs" "\$@"
EOF
chmod 0755 "$BIN/runbook"

case ":$PATH:" in *":$BIN:"*) ;; *) echo "adicione $BIN ao PATH";; esac
echo "pronto: $BIN/runbook $("$BIN/runbook" --version) · teste: runbook validar $HERE/exemplos/ola.yaml"
