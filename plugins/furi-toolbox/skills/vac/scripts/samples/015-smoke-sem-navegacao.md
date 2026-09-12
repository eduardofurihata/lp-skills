---
cmd: "check-stop"
expect: "block"
must: ["smoke-no-nav", "run-not-watched"]
class: "ledger"
origin: "formato de saída de plugins/furi-ship/skills/homolog/SKILL.md:77-91 publicado sem navegação, sem curl e sem gh run na janela"
ledger: {"reads": ["lib/skills.ts"], "bash": ["git status --short"]}
fixture: {"files": {"lib/skills.ts": 120}}
---
## ✅ /homolog — homolog no ar e verificado

- Diagnóstico: 1 PR pendente de merge
- PRs: #42 aprovado + mergeado em dev · branch deletada: remota ✓ + local ✓
- Deploy: run 12345 ✓ verde
- Smoke: https://homolog.example.test — 3/3 cards verificados no ar
- `main`: NÃO tocada
