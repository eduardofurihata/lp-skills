#!/usr/bin/env bash
set -euo pipefail
mkdir -p kanban/08-code-review lib
printf 'export function parse(s: string) { return s.split(","); }\nexport function parse2(s: string) { return s.split(","); }\n' > lib/parse.ts
cat > kanban/08-code-review/login.md <<'MD'
# Code Review — login

## Análise de Qualidade

| Princípio | Veredicto | Evidência |
|---|---|---|
| SRP | ✅ | lib/parse.ts:1 |
| DRY | [INFERIDO] parece sem duplicação | — |
MD
