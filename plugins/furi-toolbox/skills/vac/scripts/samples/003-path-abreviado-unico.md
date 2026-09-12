---
cmd: "check-stop"
expect: "pass"
class: "falso-positivo-path"
origin: "sessão 2026-09-12 lp-skills — 3.º bloqueio real: paths abreviados por legibilidade (proof/SKILL.md:4) depois de dados inteiros"
fixture: {"git": true, "files": {"plugins/furi-toolbox/skills/proof/SKILL.md": 40, "plugins/furi-toolbox/skills/save/SKILL.md": 30, "plugins/furi-build/skills/method/SKILL.md": 200}}
---
`context: fork` só em `/proof` e `/save` — [VERIFICADO] via `grep -rn "context:" plugins/*/skills/*/SKILL.md` → `proof/SKILL.md:4`, `save/SKILL.md:5`. A proibição de worktree em subagentes está em `method/SKILL.md:14`.
