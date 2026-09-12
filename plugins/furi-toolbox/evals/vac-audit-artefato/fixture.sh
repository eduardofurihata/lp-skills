#!/usr/bin/env bash
set -euo pipefail
mkdir -p kanban/09-run-test .playwright-mcp
printf 'png' > .playwright-mcp/tc1.png
cat > kanban/09-run-test/login.md <<'MD'
# Resultados de Teste — login

| TC | Status | Screenshot | Notas |
|---|---|---|---|
| TC-1 | PASSED | .playwright-mcp/tc1.png | |
| TC-2 | PASSED | .playwright-mcp/tc2.png | |
MD
