---
cmd: "check-stop"
expect: "pass"
class: "falso-positivo-path"
origin: "sessão 2026-09-12 lp-skills — 4.º bloqueio real: `…/plugin-dev/skills/hook-development/SKILL.md:64` foi lido como path absoluto /plugin-dev/…"
fixture: {"git": true, "files": {"marketplaces/plugin-dev/skills/hook-development/SKILL.md": 80, "marketplaces/plugin-dev/skills/plugin-structure/SKILL.md": 400}}
---
Confirmado nos docs do `plugin-dev`: hooks de plugin vivem em `hooks/hooks.json` — [VERIFICADO] `grep -n` em `…/plugin-dev/skills/hook-development/SKILL.md:64` e `…/plugin-dev/skills/plugin-structure/SKILL.md:202`.
