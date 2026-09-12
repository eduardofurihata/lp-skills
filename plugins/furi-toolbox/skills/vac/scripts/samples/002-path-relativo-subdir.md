---
cmd: "check-stop"
expect: "pass"
class: "falso-positivo-path"
origin: "sessão 2026-09-12 lp-skills — 2.º bloqueio real: cwd tinha mudado para plugins/furi-toolbox/evals e o path saiu relativo ao subdir; o arquivo e as linhas existiam"
fixture: {"git": true, "files": {"plugins/furi-toolbox/evals/README.md": 15, "lib/skills.ts": 120}}
---
Formato dos casos aterrado — [VERIFICADO] `evals/README.md:3-13` + `vac-nao-inventa-passed/case.yaml` acima: `case.yaml` (`schema_version 1.1`), `prompt.md` (frontmatter `max_turns`), `graders/*.md`.
