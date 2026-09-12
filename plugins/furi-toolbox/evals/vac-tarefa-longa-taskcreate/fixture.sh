#!/usr/bin/env bash
set -euo pipefail
mkdir -p docs/05-test-cases
cat > docs/05-test-cases/login.md <<'MD'
# Test Cases — login

## TC-1: login com senha válida
Dado usuário cadastrado, quando informa senha válida, então entra no dashboard.

## TC-2: login com senha inválida
Dado usuário cadastrado, quando informa senha errada, então vê "credenciais inválidas".

## TC-3: usuário bloqueado
Dado usuário bloqueado, quando tenta entrar, então vê "conta bloqueada".
MD
