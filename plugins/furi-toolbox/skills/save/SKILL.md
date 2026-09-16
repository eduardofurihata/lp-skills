---
name: save
description: Use when user invokes /save in a git repo to commit current work, with optional override message in Conventional Commits format
argument-hint: "[mensagem opcional]"
context: fork
background: false
effort: low
disable-model-invocation: true
---

# /save

Commit autônomo de tudo que está no repo. Lida com lixo (delete) e com o que deve ser ignorado (`.gitignore`). **Nunca pusha.** É aqui que termina quem corrige sem commitar: passada de princípios, refactor e limpeza deixam o trabalho no working tree de propósito, para o commit ser um ato separado e revisável.

Roda em **fork** (`effort: low`, sem `model:` fixo; `background: false` devolve o relatório inline). Um fork **não pergunta**: por isso existe o bucket **HOLD** — no ambíguo, não age. Fora do Claude Code roda inline, mesmo fluxo.

## Fluxo

1. **Pré-check.** Não é git repo → falha com mensagem clara (nunca `git init`). Tudo limpo → "nothing to commit".
2. **Classifica** cada arquivo de `git status --porcelain`:

   | Bucket | Critério |
   |---|---|
   | **COMMIT** | Código, docs, configs, lockfiles — conteúdo do projeto |
   | **GITIGNORE** | Build/deps/SO/IDE: `node_modules/`, `dist/`, `build/`, `.venv/`, `__pycache__/`, `.next/`, `.cache/`, `coverage/`, `.DS_Store`, `.vscode/`, `.idea/`, `.env*`, `*.log`, `*.pyc`, `*.swp`, `.*_cache/` |
   | **DELETE** | Só **untracked** com nome claramente scratch: `test_*.{py,js,ts,sh}`, `debug_*`, `tmp_*`, `tmp.*`, `scratch.*`, `*.tmp`, `*.bak`, `*~`, `untitled*` |
   | **HOLD** | Qualquer dúvida: não commita, não deleta, não ignora — fica intacto e é reportado com palpite de uma linha |

   Em dúvida → HOLD (falso positivo em DELETE é destrutivo). **Nunca** delete arquivo tracked-modified: para tirar do repo é GITIGNORE com `git rm --cached`. Submodule → skip, no relatório.
3. **Aplica**, nesta ordem: GITIGNORE (append deduplicado, criando o arquivo se preciso; `git rm --cached` no já trackeado) → DELETE (`rm -f`) → STAGE com `git add --` e **caminhos explícitos** do COMMIT. Nunca `git add -A`: arrastaria o HOLD; HOLD já staged sai com `git restore --staged`. Nada para commit → aplica o resto e sai.
4. **Mensagem (Conventional Commits).** Argumento passado → usa; fora do padrão → `chore: <msg>` e avisa. Sem argumento → lê `git diff --cached` e gera `<type>(<scope>): <subject>` (imperativo, ≤ 72 chars; feat, fix, refactor, docs, chore, test, style, perf, build, ci); body opcional com o porquê. Sempre termina com `Co-Authored-By: Claude <noreply@anthropic.com>`.
5. **Commit** via heredoc (`git commit -m "$(cat <<'EOF' … EOF)"`). **Nunca** `--no-verify`, **nunca** `--amend`.
6. **Hook falhou?** Lê o output, corrige a causa raiz (lint, format), re-stage, **novo** commit. Correção não óbvia → para e mostra o output.

## Output

```
✓ Commit <short-hash>: <subject>
  Committed: N arquivos · Ignored: M (.gitignore) · Deleted: K
  ⚠ Em espera: J  (não commitados, intactos)
    <arquivo> — <palpite de uma linha>
```

`Em espera` só aparece com HOLD.

## PARE se pensar
"passo `--no-verify`" · "faço `--amend` no hook" · "`git add -A` é mais rápido" · "deleto o tracked, é lixo" · "chuto a classificação" · "já pusho de uma vez"
