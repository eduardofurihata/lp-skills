---
cmd: "check-stop"
expect: "block"
must: ["SKILL.md:14", "ambíguo"]
class: "positivo-verdadeiro"
origin: "sessão 2026-09-12 lp-skills — 3.º bloqueio real, a parte certa: SKILL.md:14 sozinho não aponta para nada (há dezenas de SKILL.md)"
fixture: {"git": true, "files": {"plugins/furi-toolbox/skills/proof/SKILL.md": 40, "plugins/furi-build/skills/method/SKILL.md": 200}}
---
A proibição de `isolation: "worktree"` em subagentes está em `SKILL.md:14`.
