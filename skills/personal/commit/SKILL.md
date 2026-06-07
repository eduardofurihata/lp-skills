---
name: commit
description: Use when user invokes /commit in a git repo to commit current work, with optional override message in Conventional Commits format
argument-hint: "[mensagem opcional]"
---

# /commit

Commit autônomo de tudo que está no repo. Lida com lixo (delete) e arquivos que devem ser ignorados (.gitignore). Nunca pusha.

## Fluxo

1. **Pré-check.** Não é git repo → falha com mensagem clara (não tenta `git init`). Working tree e index limpos → avisa "nothing to commit" e sai.

2. **Classifica** cada arquivo modificado/untracked/deleted (`git status --porcelain`):

   | Bucket | Critério |
   |---|---|
   | **COMMIT** | Código, docs, configs, lockfiles — conteúdo do projeto |
   | **GITIGNORE** | Build/deps/SO/IDE: `node_modules/`, `dist/`, `build/`, `.venv/`, `venv/`, `__pycache__/`, `.next/`, `.nuxt/`, `.cache/`, `target/`, `coverage/`, `.DS_Store`, `Thumbs.db`, `.vscode/`, `.idea/`, `.env`, `.env.local`, `*.log`, `*.pyc`, `*.swp`, `*.swo`, `.ruff_cache/`, `.pytest_cache/`, `.mypy_cache/` |
   | **DELETE** | Apenas se **untracked** e nome claramente scratch: `test_*.{py,js,ts,sh}`, `debug_*`, `tmp_*`, `tmp.*`, `scratch.*`, `*.tmp`, `*.bak`, `*~`, `untitled*`, `Untitled*` |
   | **PERGUNTAR** | Qualquer dúvida. Lista os files ambíguos com palpite de uma linha e espera resposta. |

   **Regras de ouro:**
   - Em dúvida → PERGUNTAR. Falso positivo em DELETE é destrutivo.
   - **Nunca** delete arquivo tracked-modified. Se quer remover do repo, vai para GITIGNORE com `git rm --cached`.

3. **Aplica** (nessa ordem):
   - **GITIGNORE** — append patterns no `.gitignore` (cria se não existe; deduplica). Para arquivos já trackeados, `git rm --cached <file>` antes.
   - **DELETE** — `rm -f` em cada arquivo classificado.
   - **STAGE** — `git add -A`.

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
```

## Red flags — STOP

- `--no-verify` → **erro.** Investiga e fixa o hook.
- `git push` → **fora de escopo.** Esta skill só commita.
- `--amend` em hook failure → **erro.** Novo commit.
- Deletar arquivo tracked-modified → **erro.** Use GITIGNORE + `git rm --cached`.
- Dúvida sobre classificação → **PERGUNTA**, nunca chuta.

## Edge cases

| Situação | Comportamento |
|---|---|
| `.gitignore` não existe | Cria |
| Pattern já no `.gitignore` | Não duplica |
| Arquivo trackeado vira GITIGNORE | `git rm --cached` antes do append |
| Tudo classificado vira GITIGNORE/DELETE (nada para commit) | Aplica gitignore/delete e sai com "nothing to commit" |
| Submodule | Skip silencioso; menciona no relatório final |
| Mixed staged + unstaged | Trata tudo no mesmo commit (semântica de `commit -a`) |
| Override message não em Conventional Commits | Reformata como `chore: <msg>` e avisa |
