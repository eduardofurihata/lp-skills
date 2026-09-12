#!/usr/bin/env bash
set -euo pipefail
cat > package.json <<'JSON'
{ "name": "x", "scripts": { "typecheck": "tsc --noEmit" } }
JSON
mkdir -p src && printf 'export const a: number = 1;\n' > src/a.ts
