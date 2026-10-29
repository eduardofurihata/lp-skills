#!/usr/bin/env python3
"""Os prompts que o usuário digitou numa conversa do Claude Code, em ordem.

Fonte: ~/.claude/history.jsonl — o histórico de digitação (o da seta ↑). Guarda
só o que foi digitado: colado vira `[Pasted text #N]`, imagem vira `[Image #N]`,
e o resumo da conversa não o altera.

Uso: prompts.py <session-id>
"""
import json
import os
import re
import sys
from datetime import datetime

HISTORY = os.path.join(os.environ.get("CLAUDE_CONFIG_DIR", os.path.expanduser("~/.claude")), "history.jsonl")
SELF = re.compile(r"^/(?:[\w-]+:)?prompts\b")


def main() -> int:
    if len(sys.argv) != 2 or not sys.argv[1].strip():
        print("uso: prompts.py <session-id>", file=sys.stderr)
        return 2
    session = sys.argv[1].strip()

    try:
        lines = open(HISTORY, encoding="utf-8").readlines()
    except OSError as err:
        print(f"Não consegui ler {HISTORY}: {err}", file=sys.stderr)
        return 1

    prompts = []
    for line in lines:
        try:
            entry = json.loads(line)
        except json.JSONDecodeError:
            continue
        text = entry.get("display", "")
        if entry.get("sessionId") == session and text.strip() and not SELF.match(text):
            prompts.append((entry.get("timestamp", 0), text))

    if not prompts:
        print(f"Nenhum prompt desta conversa ({session}) em {HISTORY}.", file=sys.stderr)
        return 1

    prompts.sort(key=lambda p: p[0])
    for n, (ts, text) in enumerate(prompts, 1):
        hora = datetime.fromtimestamp(ts / 1000).strftime("%H:%M")
        print(f"=== {n} · {hora} ===\n{text}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
