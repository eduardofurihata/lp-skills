---
name: prompts
description: Use when user invokes /prompts to get back every prompt they typed in the current Claude Code conversation, in order — the exact text read from disk plus a one-line summary each.
allowed-tools: Bash
disable-model-invocation: true
---

# /prompts

Devolve **tudo o que o usuário digitou nesta conversa**, em ordem: o texto exato e um resumo de uma linha. Só Claude Code.

A fonte é o histórico de digitação do Claude Code (`history.jsonl`, o da seta ↑), nunca a memória: depois que a conversa é resumida, o modelo só lembra uma versão aproximada. Esse histórico guarda só o digitado — texto colado vira `[Pasted text #N]`, imagem vira `[Image #N]`, comando de skill aparece como foi digitado (`/ask`), e resposta a pergunta, lembrete e saída de hook não entram.

## Fluxo

1. Rode:

   ```bash
   python3 "${CLAUDE_SKILL_DIR}/scripts/prompts.py" "${CLAUDE_SESSION_ID}"
   ```

   Sai um bloco `=== <n> · <hora> ===` por prompt, com o texto exato embaixo. O próprio `/prompts` já sai filtrado.
2. Falhou (sem `python3`, sem histórico, nenhum prompt achado) → mostre o erro do script e pare. **Nunca** monte a lista de memória.
3. Responda no formato abaixo e pare — sem comentário, análise ou sugestão depois.

## Saída

```
**1 · 17:22** — <resumo de uma linha, na língua do prompt>
> <texto exato, linha por linha, cada uma com `> `>

**2 · 17:23** — …
```

- Texto exato **byte a byte** do script: sem corrigir digitação, sem cortar, sem traduzir, sem expandir `[Pasted text #N]` ou `[Image #N]`.
- Resumo: o que o prompt pede, em até ~12 palavras. Comando (`/ask`, `/model`) → o que ele faz.
