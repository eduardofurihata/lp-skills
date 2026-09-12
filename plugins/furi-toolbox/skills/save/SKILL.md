---
name: save
description: Use when user invokes /save in a git repo to commit current work, with optional override message in Conventional Commits format
argument-hint: "[mensagem opcional]"
context: fork
background: false
effort: low
---

# /save

Commit autônomo de tudo que está no repo. Lida com lixo (delete) e arquivos que devem ser ignorados (.gitignore). Nunca pusha.

> **É aqui que termina quem corrige sem commitar.** Uma passada de princípios, um refactor guiado, uma limpeza de pasta — deixam o trabalho no working tree de propósito, para que o commit seja um ato separado e revisável. Esse ato é este.

## Onde roda

`context: fork` — o `/save` roda num **subagente**, com `effort: low` e **sem `model:` fixo** — ele usa o modelo padrão de subagente (`CLAUDE_CODE_SUBAGENT_MODEL`, se configurado; senão o da sessão), então acompanha a atualização de modelo em vez de ficar preso a um alias. Classificar arquivo e redigir um Conventional Commit é trabalho mecânico: não pede o effort da sessão, e o `git diff` que ele lê não tem por que entrar no contexto de quem pediu o commit. `background: false` mantém a sessão chamadora esperando — ela recebe o relatório final inline, não uma notificação.

O que o fluxo abaixo já assume por causa disso:

- **Sem canal com o usuário.** Um fork não pergunta no meio. Por isso o bucket **HOLD** — no ambíguo, não age — no lugar de parar e perguntar.
- **Fora do Claude Code** (Codex, Cursor) as três chaves são ignoradas e o `/save` roda inline. Mesmo fluxo, mesmo HOLD: nada aqui depende de estar em fork.
- Dois `/save` ao mesmo tempo: o segundo não forka enquanto o primeiro estiver vivo.

## Fluxo

1. **Pré-check.** Não é git repo → falha com mensagem clara (não tenta `git init`). Working tree e index limpos → avisa "nothing to commit" e sai.

2. **Classifica** cada arquivo modificado/untracked/deleted (`git status --porcelain`):

   | Bucket | Critério |
   |---|---|
   | **COMMIT** | Código, docs, configs, lockfiles — conteúdo do projeto |
   | **GITIGNORE** | Build/deps/SO/IDE: `node_modules/`, `dist/`, `build/`, `.venv/`, `venv/`, `__pycache__/`, `.next/`, `.nuxt/`, `.cache/`, `target/`, `coverage/`, `.DS_Store`, `Thumbs.db`, `.vscode/`, `.idea/`, `.env`, `.env.local`, `*.log`, `*.pyc`, `*.swp`, `*.swo`, `.ruff_cache/`, `.pytest_cache/`, `.mypy_cache/` |
   | **DELETE** | Apenas se **untracked** e nome claramente scratch: `test_*.{py,js,ts,sh}`, `debug_*`, `tmp_*`, `tmp.*`, `scratch.*`, `*.tmp`, `*.bak`, `*~`, `untitled*`, `Untitled*` |
   | **HOLD** | Qualquer dúvida. Não commita, não deleta, não ignora: deixa intacto no working tree e reporta com palpite de uma linha. |

   **Regras de ouro:**
   - Em dúvida → HOLD. Falso positivo em DELETE é destrutivo, e o fork não tem como perguntar.
   - **Nunca** delete arquivo tracked-modified. Se quer remover do repo, vai para GITIGNORE com `git rm --cached`.

3. **Aplica** (nessa ordem):
   - **GITIGNORE** — append patterns no `.gitignore` (cria se não existe; deduplica). Para arquivos já trackeados, `git rm --cached <file>` antes.
   - **DELETE** — `rm -f` em cada arquivo classificado.
   - **STAGE** — `git add --` com os **caminhos explícitos** do bucket COMMIT (mais o `.gitignore`, se tocado). Nunca `git add -A`: ele arrastaria o HOLD para dentro do commit. Arquivo em HOLD que já estava staged sai do index com `git restore --staged <file>`.

4. **Mensagem (Conventional Commits):**
   - Argumento passado → usa. Se não está em Conventional Commits, reformata como `chore: <msg>` e avisa.
   - Sem argumento → lê `git diff --cached` e gera `<type>(<scope>): <imperative subject>` (subject ≤ 72 chars, imperativo: "add" não "added").
   - Types permitidos: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `style`, `perf`, `build`, `ci`.
   - Body opcional (linha em branco antes) explicando o WHY para mudanças não-triviais.
   - Sempre termina com:
     ```
     Co-Authored-By: Claude <noreply@anthropic.com>
     ```

5. **Commit.** Use heredoc para preservar formatação:
   ```bash
   git commit -m "$(cat <<'EOF'
   <message here>
   EOF
   )"
   ```
   **Nunca** `--no-verify`. **Nunca** `--amend`.

6. **Hook falha?** Lê output → fixa causa raiz (lint, format, etc.) → re-stage → faz **NOVO** commit (não amend). Se correção não está clara, para e mostra output ao usuário.

7. **Nunca pusha.** Mesmo com upstream tracking. Fora de escopo dessa skill.

## Output final

Imprima compacto:
```
✓ Commit <short-hash>: <subject>
  Committed: N arquivos
  Ignored:   M arquivos (.gitignore)
  Deleted:   K arquivos
  ⚠ Em espera: J  (não commitados, intactos)
    <arquivo> — <palpite de uma linha>
```

A linha `Em espera` só aparece quando há HOLD.

## Red flags — STOP

- `--no-verify` → **erro.** Investiga e fixa o hook.
- `git push` → **fora de escopo.** Esta skill só commita.
- `--amend` em hook failure → **erro.** Novo commit.
- Deletar arquivo tracked-modified → **erro.** Use GITIGNORE + `git rm --cached`.
- `git add -A` → **erro.** Stage por caminho explícito; com `-A` o HOLD entra no commit.
- Dúvida sobre classificação → **HOLD**, nunca chuta.

## Edge cases

| Situação | Comportamento |
|---|---|
| `.gitignore` não existe | Cria |
| Pattern já no `.gitignore` | Não duplica |
| Arquivo trackeado vira GITIGNORE | `git rm --cached` antes do append |
| Tudo classificado vira GITIGNORE/DELETE (nada para commit) | Aplica gitignore/delete e sai com "nothing to commit" |
| Submodule | Skip silencioso; menciona no relatório final |
| Tudo em HOLD (nada para commit) | Não commita; reporta os arquivos em espera e sai |
| Mixed staged + unstaged | Trata tudo no mesmo commit (semântica de `commit -a`) — **menos** o que caiu em HOLD, que sai do index |
| Override message não em Conventional Commits | Reformata como `chore: <msg>` e avisa |
