---
cmd: "check-stop"
expect: "pass"
must_not: ["coord-not-read"]
class: "ledger"
origin: "regra R-1 nasce como note: coordenada [VERIFICADO] cujo Read ficou antes do compact_boundary vai para o log, não bloqueia — sobe para block quando o golden set mostrar precisão"
ledger: {"reads": ["lib/skills.ts"], "compactAfter": true}
fixture: {"files": {"lib/skills.ts": 120}}
---
- O leitor de skills está em lib/skills.ts:7 — [VERIFICADO] lib/skills.ts:7
