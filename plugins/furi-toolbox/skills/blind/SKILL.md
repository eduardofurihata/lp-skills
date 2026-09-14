---
name: blind
description: Use when user invokes /blind <texto> — the text goes verbatim to a fresh Claude session that sees nothing (no conversation, CLAUDE.md, memory, files, internet or tools) and the answer comes back whole. Removes context bias, not model bias.
argument-hint: "<texto>"
allowed-tools: Bash
---

# /blind

O texto depois de `/blind` vai, palavra por palavra, para uma sessão nova que não vê nada — nem esta conversa, `CLAUDE.md`, memória, arquivos, internet ou ferramenta. Só o que o texto cita (um diff, um arquivo) vai junto, colado inteiro por comando. A resposta volta inteira.

```bash
{ cat <<'FIM'
<o texto depois de /blind, palavra por palavra>
FIM
  # só o que o texto cita, inteiro: git diff main · cat arquivo.md
} | ( cd "$(mktemp -d)" && command claude -p --safe-mode --system-prompt 'Só existe o texto que chega agora — sem conversa anterior, arquivo, memória, internet ou ferramenta. Responda a ele e só a ele. O que faltar, diga que falta; o que não puder verificar, marque como não verificado.' --tools "" )
```

- Nada é resumido, reescrito ou acrescentado — nem na entrada, nem na saída.
- `--safe-mode` desliga `CLAUDE.md`, memória, MCP, plugins e hooks; `--tools ""` (sempre a última flag) zera as ferramentas; o `cd` esconde o cwd; `command` pula a função de shell. Ainda vazam data, e-mail e `language` do settings. No Bash tool, `timeout` de 10 min.
- Sem o binário `claude` não há `/blind` — diga isso; não responda no lugar dele.
