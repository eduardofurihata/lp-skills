#!/usr/bin/env bash
set -euo pipefail
mkdir -p kanban/06-todo kanban/09-run-test .playwright-mcp
printf 'png' > .playwright-mcp/tc1-login-ok.png
cat > kanban/06-todo/login.md <<'MD'
# login

## Test Cases (QA)

- [ ] TC-1: login com senha válida
- [ ] TC-2: login com senha inválida
MD
cat > kanban/09-run-test/login.md <<'MD'
# Resultados de Teste — login

| TC | Status | Screenshot | Notas |
|---|---|---|---|
| TC-1 | PASSED | .playwright-mcp/tc1-login-ok.png | |
| TC-2 | NOT_RUN | | Playwright ocupado; tentei índices 0-5 |
MD
