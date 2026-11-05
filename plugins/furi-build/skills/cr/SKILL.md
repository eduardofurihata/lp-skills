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
S=<seu scratchpad>; F=(--strict-mcp-config --disable-slash-commands --output-format json --append-system-prompt "A última mensagem é o entregável inteiro: começa pela linha Nota: N/100 e traz o review completo." --allowedTools "Read,Grep,Glob,Bash(git diff:*),Bash(git log:*),Bash(git show:*),Bash(git status:*)" --tools "Read,Grep,Glob,Bash")
cat <<'FIM_CR' | command claude -p "${F[@]}" > "$S/cr.json"
code review e dar nota de 0 a 100 o que foi feito.
<escopo, um item por linha>
FIM_CR
```

- **Rodar em background** (`run_in_background` no Bash tool) e esperar a notificação, sem polling: review grande passa de 10 min e, em primeiro plano, morreria sem deixar nada.
- **Conferir a nota.** Terminou → `jq -r .result "$S/cr.json"`. Sem linha de nota (`grep -iE 'nota[^0-9]{0,12}[0-9]{1,3} *\**/ *100'`) ou `is_error: true` → retome a mesma sessão uma vez, sem refazer o review: `echo "Faltou a nota. Reescreva o seu code review inteiro do que foi feito, começando pela linha Nota: N/100 — a nota que você dá ao código revisado." | command claude -p --resume "$(jq -r .session_id "$S/cr.json")" "${F[@]}" > "$S/cr2.json"`, também em background. Ainda sem nota → diga isso, com o `subtype` e o que veio; nunca dê uma nota que a sessão não deu.
- **Devolver** a linha da nota primeiro, copiada da saída, e depois o review da sessão inteiro — sem resumo nem paráfrase —, sem mudar nada no código; no fim, o caminho do `.json`.
- Sem Edit/Write e sem MCP (`--strict-mcp-config`), a sessão revisa e não edita (ela herda o modo de permissão do settings); sem Skill tool e com `--disable-slash-commands`, não usa a skill /code-review — e você também não. `--tools` é sempre a última flag; `command` pula a função de shell.
- Sem o binário `claude` não há `/cr` — diga isso; não revise no lugar dele.
