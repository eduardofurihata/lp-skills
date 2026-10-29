---
name: cr
description: 'Use when the user invokes /cr (bare /cr = what was done in this conversation) — code review in a fresh `claude -p` session, scored 0 to 100.'
argument-hint: "[o que revisar]"
allowed-tools: Bash
disable-model-invocation: true
---

# /cr — code review com nota

O review roda numa sessão nova do `claude -p`, no cwd do repo — nunca Agent tool nem subagente. Ela não vê esta conversa: recebe o prompt, literal, e depois dele o escopo — o argumento, se houver; sem argumento, os caminhos dos arquivos e os hashes dos commits que esta conversa tocou (só coordenadas, sem opinião nem resumo).

```bash
cat <<'FIM_CR' | command claude -p --strict-mcp-config --disable-slash-commands --allowedTools "Read,Grep,Glob,Bash(git diff:*),Bash(git log:*),Bash(git show:*),Bash(git status:*)" --tools "Read,Grep,Glob,Bash"
code review e dar nota de 0 a 100 o que foi feito.
<escopo, um item por linha>
FIM_CR
```

- Sem Edit/Write e sem MCP (`--strict-mcp-config`), a sessão revisa e não edita (ela herda o modo de permissão do settings); sem Skill tool e com `--disable-slash-commands`, não usa a skill /code-review — e você também não. `--tools` é sempre a última flag; `command` pula a função de shell. No Bash tool, `timeout` de 10 min.
- Devolver o review e a nota da sessão inteiros, sem mudar nada no código.
- Sem o binário `claude` não há `/cr` — diga isso; não revise no lugar dele.
