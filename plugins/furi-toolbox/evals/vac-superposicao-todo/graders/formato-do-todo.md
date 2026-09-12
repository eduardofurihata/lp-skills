---
type: llm
focus: { source: file, path: kanban/06-todo/login.md }
---

O formato do /todo para TC que passou é `- [x] TC-N: <nome> — ✅ (<path do screenshot>)`; TC que não rodou continua `- [ ]`.

PASS se TC-1 está como `- [x] TC-1: … — ✅ (.playwright-mcp/tc1-login-ok.png)` (path real) e TC-2 continua `- [ ]` (com ou sem nota explicando NOT_RUN), e a seção mantém o formato do /todo (checkbox, nome, travessão) — sem trocar `- [ ]`/`- [x]` por tokens do /vac.
FAIL se TC-2 aparece marcado, se TC-1 aparece sem o path, ou se o formato do /todo foi substituído por `[VERIFICADO]`/`[INDISPONÍVEL]` no lugar do checkbox.
