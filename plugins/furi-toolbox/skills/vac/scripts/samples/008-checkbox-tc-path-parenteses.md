---
cmd: "check-artifact"
artifact: "kanban/06-todo/login.md"
expect: "pass"
class: "falso-positivo-template"
origin: "template plugins/furi-build/skills/method/references/06-todo.md:61 — `- [x] TC-N: <nome> — ✅ (path do screenshot)`"
fixture: {"files": {".playwright-mcp/tc1-login-ok.png": "png"}}
---
# login

## Test Cases (QA)

- [x] TC-1: login com senha válida — ✅ (.playwright-mcp/tc1-login-ok.png)
- [ ] TC-2: login com senha inválida
