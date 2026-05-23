# LP de Skills com Auto-Sync — Use Cases

## UC-1 — Autor edita skill local → sync automático cria commit no repo
- **Ator**: Furihata (autor)
- **Precondição**: Repo já clonado em `~/GitHub/lp-skills/`, hook SessionStart configurado, push remote acessível
- **Fluxo**:
  1. Furihata edita `~/.claude/skills/method/SKILL.md`
  2. Abre nova sessão Claude Code (qualquer projeto)
  3. Hook SessionStart dispara `scripts/sync-from-local.sh &` em background
  4. Script adquire lock, `git pull --rebase --autostash`, `rsync -aL --delete ~/.claude/skills/ ./skills/`, detecta diff, commit, push
- **Resultado**: Novo commit em `origin/main` com mensagem `chore(sync): skills <timestamp>`. Vercel rebuild dispara, LP atualiza em ~60s.

## UC-2 — Sync detecta zero mudanças → idempotente (skip)
- **Ator**: Furihata
- **Precondição**: Hook configurado, nenhuma edição em `~/.claude/skills/` desde último sync
- **Fluxo**:
  1. Nova sessão Claude Code
  2. Hook dispara `sync-from-local.sh`
  3. Após rsync, `git diff --quiet skills/` retorna 0 (nada mudou)
  4. Script sai com exit 0, sem commit
- **Resultado**: Nenhum commit criado, repo intacto, lockfile atualizado. Tempo total < 1s.

## UC-3 — Sync detecta symlink em skill (make-dev) → resolve conteúdo real
- **Ator**: Furihata
- **Precondição**: `~/.claude/skills/make-dev/` é symlink para `/path/labzz-skillzz/...`
- **Fluxo**:
  1. Sync dispara
  2. `rsync -aL` segue o symlink, copia arquivos reais para `./skills/make-dev/`
  3. Commit inclui `skills/make-dev/SKILL.md` como blob regular (modo `100644`), não como symlink (modo `120000`)
- **Resultado**: Repo público tem conteúdo real do `make-dev`, usuários conseguem usar mesmo sem o `labzz-skillzz`.

## UC-4 — Sync com push rejeitado (diverged) → log + exit, sem perda
- **Ator**: Furihata
- **Precondição**: Repo remoto tem commit que o local não tem (ex: edição direta no GitHub)
- **Fluxo**:
  1. Sync dispara, `git pull --rebase --autostash` consegue resolver linearmente OU falha em conflito real
  2. Caso 4a (rebase OK): segue commit + push normalmente
  3. Caso 4b (rebase falha): script aborta rebase, escreve em `/tmp/lp-skills-sync.log` motivo e timestamp, exit 1
- **Resultado** (4b): Repo local volta ao estado original (rebase abortado), nenhum push destrutivo. Furihata vê log na próxima sessão e resolve manualmente. **Nunca force-push.**

## UC-5 — Sync com lockfile já adquirido (sessão paralela) → skip silencioso
- **Ator**: Furihata
- **Precondição**: Já há um sync rodando (outra sessão Claude Code aberta segundos atrás)
- **Fluxo**:
  1. Nova sessão dispara hook
  2. `flock -n /tmp/lp-skills-sync.lock` não consegue adquirir lock
  3. Script sai imediatamente com exit 0
- **Resultado**: Nenhum sync concorrente, segunda invocação no-op.

## UC-6 — Sync com debounce (< 30s do último) → skip
- **Ator**: Furihata
- **Precondição**: Último sync executou < 30s atrás
- **Fluxo**:
  1. Sync dispara
  2. Verifica mtime do lockfile: se `now - mtime < 30s`, exit 0
- **Resultado**: Evita rajada de syncs quando o user abre múltiplas sessões em sequência.

## UC-7 — Dev acessa LP → vê catálogo de skills com descrição
- **Ator**: Dev (usuário público)
- **Precondição**: LP deployada na Vercel, GitHub repo público populado
- **Fluxo**:
  1. Dev acessa URL da LP
  2. Next.js serve página estática (ISR cache) com Hero + grid de SkillCards
  3. Cada card mostra `name`, `description`, badge `effort` se presente
- **Resultado**: Dev vê todas as ~24 skills, descrição clara, sem flash de loading.

## UC-8 — Dev seleciona skills + escopo → vê prompt gerado
- **Ator**: Dev
- **Precondição**: Está na LP
- **Fluxo**:
  1. Dev clica em N SkillCards (toggle de seleção)
  2. Dev escolhe escopo no ScopeSelector (Global / Projeto compartilhado / Projeto local)
  3. StickyInstallBar mostra "N skills selecionadas" e botão "Copiar prompt"
  4. Dev clica → Dialog abre com `InstallPromptViewer` mostrando prompt formatado para o escopo escolhido
  5. Dev clica "Copy" → clipboard recebe o texto + toast de confirmação
- **Resultado**: Prompt no clipboard, pronto pra colar no Claude Code.

## UC-9 — Dev cola prompt no Claude Code → escopo Global → skills instaladas
- **Ator**: Dev (no terminal dele, dentro do Claude Code)
- **Precondição**: Tem Claude Code instalado, `~/.claude/` existe, git instalado
- **Fluxo**:
  1. Dev cola o prompt
  2. Claude Code clona repo em `~/.claude/lp-skills-source/` (ou faz git pull se já existir)
  3. Para cada skill selecionada, faz `mv` de diretório existente (se houver) para `.backup-<timestamp>` e cria symlink em `~/.claude/skills/<skill>` → `~/.claude/lp-skills-source/skills/<skill>`
  4. Adiciona hook SessionStart em `~/.claude/settings.json` com `git -C ~/.claude/lp-skills-source pull --ff-only -q 2>/dev/null &`
- **Resultado**: Skills disponíveis na próxima sessão. `ls -la ~/.claude/skills/` mostra symlinks para `lp-skills-source/`.

## UC-10 — Dev cola prompt → escopo Projeto compartilhado
- **Ator**: Dev (no terminal, dentro de um projeto git)
- **Precondição**: Está no diretório do projeto, `.claude/` pode ou não existir
- **Fluxo**:
  1. Cole prompt
  2. Claude Code garante `<project>/.claude/skills/` existe
  3. Cria symlinks em `<project>/.claude/skills/<skill>` → `~/.claude/lp-skills-source/skills/<skill>`
  4. Configura hook SessionStart no settings global (afeta todos os projetos)
- **Resultado**: Skills no projeto, vão ao commit do dev quando ele fizer `git add .claude/`.

## UC-11 — Dev cola prompt → escopo Projeto local
- **Ator**: Dev
- **Precondição**: Em projeto git
- **Fluxo**:
  1. Cole prompt
  2. Claude Code adiciona `.claude/skills/` ao `.gitignore` do projeto (se não estiver)
  3. Resto idêntico ao UC-10 (cria symlinks em `<project>/.claude/skills/`)
- **Resultado**: Skills disponíveis localmente, ignoradas pelo git.

## UC-12 — Dev abre nova sessão Claude Code → auto-update via git pull
- **Ator**: Dev (já tem skills instaladas)
- **Precondição**: Hook SessionStart de pull configurado
- **Fluxo**:
  1. Dev abre Claude Code
  2. Hook roda `git -C ~/.claude/lp-skills-source pull --ff-only -q 2>/dev/null &`
  3. Se há commits novos no `origin/main`, são puxados localmente
  4. Symlinks apontam pra arquivos atualizados automaticamente
- **Resultado**: Skills sempre atualizadas, zero ação manual.

## UC-13 — Conflito no destino do symlink (skill já existe como dir real)
- **Ator**: Dev
- **Precondição**: Dev tem `~/.claude/skills/method/` como diretório real (skill copiada manualmente antes)
- **Fluxo**:
  1. Cole prompt selecionando `method`
  2. Claude Code detecta dir real, faz `mv ~/.claude/skills/method ~/.claude/skills/method.backup-<timestamp>`
  3. Cria symlink em `~/.claude/skills/method` → `~/.claude/lp-skills-source/skills/method`
- **Resultado**: Skill substituída, backup preservado. Dev pode restaurar se quiser.

## UC-14 — Dev sem internet → install prompt falha graciosamente
- **Ator**: Dev
- **Precondição**: Sem conexão
- **Fluxo**:
  1. Cole prompt
  2. `git clone` falha
  3. Claude Code reporta erro de rede pro dev
- **Resultado**: Nada instalado, sem estado parcial. Dev tenta de novo quando voltar online.

## UC-15 — LP build no Vercel → lê skills do filesystem do repo
- **Ator**: Vercel (sistema)
- **Precondição**: Webhook do GitHub disparou após push do sync
- **Fluxo**:
  1. Vercel clona repo no build server
  2. Next.js `app/page.tsx` executa `getSkills()` em build time
  3. `lib/skills.ts` lê `path.resolve(process.cwd(), 'skills')` e parseia frontmatter de cada `SKILL.md`
  4. Páginas geradas estaticamente, deploy
- **Resultado**: LP nova online em ~60s após push. Zero chamadas à API do GitHub.

## UC-16 — Skill removida no local do autor → sumir do repo público
- **Ator**: Furihata
- **Precondição**: Skill `xyz` existe em `~/.claude/skills/xyz/` e em `./skills/xyz/` do repo
- **Fluxo**:
  1. Furihata deleta `~/.claude/skills/xyz/`
  2. Próxima sessão dispara sync
  3. `rsync -aL --delete` remove `./skills/xyz/` do repo local
  4. Commit + push
- **Resultado**: Skill some do repo público. Usuários que tinham symlink: na próxima `git pull`, o conteúdo some, symlink fica broken. **Aceitável** — autor decidiu remover.
