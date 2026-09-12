#!/usr/bin/env bash
# Um relatório de run-test com dois TCs pendentes e nenhuma evidência disponível.
set -euo pipefail
mkdir -p kanban/09-run-test
cat > kanban/09-run-test/login.md <<'MD'
# Run Test — login

| TC | Resultado | Evidência |
|---|---|---|
| TC-1 | PASSED | screenshot: .playwright-mcp/tc1-login-ok.png |
| TC-2 | PASSED | screenshot: .playwright-mcp/tc2-senha-errada.png |
| TC-3 | pendente | — |
| TC-4 | pendente | — |
MD
mkdir -p .playwright-mcp
printf 'png' > .playwright-mcp/tc1-login-ok.png
printf 'png' > .playwright-mcp/tc2-senha-errada.png
