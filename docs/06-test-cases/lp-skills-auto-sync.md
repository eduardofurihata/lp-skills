# LP de Skills com Auto-Sync — Test Cases

## Análise de Complexidade

Implementação tem 3 superfícies:
1. **LP (Next.js)** — Hero, SkillCard, ScopeSelector, InstallPromptViewer, StickyBar (5 componentes + página)
2. **Script de sync** — rsync resolvendo symlinks, debounce, lockfile, push handling
3. **E2E install flow** — clone, symlinks, hook config (3 escopos)

Complexidade: **alta**. 10 TCs cobrindo bugs únicos em cada superfície.

---

## TC-1: SkillCard toggle persiste estado visual e atualiza contagem
- **Bug único**: Card visualmente fica selecionado, mas estado interno não é alterado (ou vice-versa) → contagem do StickyBar incorreta.
- **Pré-condição**: LP carregada em desktop, nenhuma skill selecionada
- **Passos**:
  1. Clicar no card "method"
  2. Observar borda do card (deve ficar violet) e checkbox (deve ficar checked)
  3. Observar StickyBar — texto deve mudar de "Selecione skills..." para "1 skill selecionada"
  4. Clicar novamente no card "method"
  5. Observar reversão visual e StickyBar voltando ao empty state
- **Resultado**: Toggle bidirecional funciona; estado visual sincronizado com contagem
- **Prova**: screenshot dos dois estados

## TC-2: ScopeSelector gera prompts diferentes para cada escopo
- **Bug único**: Trocar escopo não regenera o prompt, ou gera prompt errado (ex: escopo "Local" sem o passo do .gitignore).
- **Pré-condição**: LP com 2 skills selecionadas (ex: `method`, `commit`)
- **Passos**:
  1. Selecionar escopo "Global", abrir InstallPromptViewer
  2. Verificar prompt contém `~/.claude/skills/` e NÃO contém `.gitignore`
  3. Fechar dialog, trocar para "Projeto compartilhado", reabrir
  4. Verificar prompt contém `<project>/.claude/skills/` e NÃO contém `.gitignore`
  5. Trocar para "Projeto local", reabrir
  6. Verificar prompt contém `<project>/.claude/skills/` E `.gitignore`
- **Resultado**: 3 prompts distintos, conteúdo correto por escopo
- **Prova**: 3 screenshots do dialog

## TC-3: Copy button copia o prompt para clipboard e dispara toast
- **Bug único**: Botão não copia (clipboard API silenciosamente falha em HTTP/iframe), ou copia mas toast não aparece.
- **Pré-condição**: InstallPromptViewer aberto com prompt visível
- **Passos**:
  1. Clicar no botão "Copy"
  2. Observar toast "Copiado!" aparecer (3s)
  3. Em terminal externo, executar `wl-paste` (Linux) ou abrir editor e fazer Ctrl+V
- **Resultado**: Conteúdo do clipboard = texto exato do prompt; toast visível
- **Prova**: screenshot do toast + texto colado

## TC-4: Empty state no StickyBar quando zero skills selecionadas
- **Bug único**: StickyBar mostra botão de copiar mesmo sem seleção, gerando prompt vazio/inválido.
- **Pré-condição**: LP carregada, nenhuma skill selecionada
- **Passos**:
  1. Observar StickyBar
  2. Verificar texto "Selecione skills para gerar o prompt" (ou similar)
  3. Verificar que botão "Copiar" está desabilitado OU não visível
- **Resultado**: Empty state explícito, usuário entende próximo passo
- **Prova**: screenshot

## TC-5: SkillGrid renderiza todas as skills do repo `skills/`
- **Bug único**: Skills com frontmatter quebrado são silenciosamente omitidas, ou ordem é não-determinística (race no Promise.all).
- **Pré-condição**: Build com N skills em `./skills/` (sabemos o número esperado)
- **Passos**:
  1. `ls skills/ | wc -l` → contar dirs no FS
  2. Carregar LP
  3. Contar SkillCards visíveis no grid
  4. Verificar ordem alfabética pelo nome
- **Resultado**: count(cards) === count(dirs com SKILL.md válido); ordem alfabética
- **Prova**: screenshot do grid + output do `ls`

## TC-6: Responsive — grid reflowa corretamente em mobile/tablet/desktop
- **Bug único**: Grid quebra em mobile (overflow horizontal), ou StickyBar cobre conteúdo.
- **Pré-condição**: LP carregada
- **Passos**:
  1. Resize browser para 360px (mobile) → grid 1 coluna, sem overflow
  2. Resize para 768px (tablet) → grid 2 colunas
  3. Resize para 1280px (desktop) → grid 3 colunas
  4. Em mobile, scroll até o fim → último card visível acima da StickyBar
- **Resultado**: Layout reflowa sem quebra, conteúdo nunca coberto pela StickyBar
- **Prova**: 3 screenshots em viewports diferentes

## TC-7: sync-from-local.sh — primeira execução com mudanças faz commit + push
- **Bug único**: Sync detecta diff mas não commita (ex: `git add` falha por path errado) ou commita sem push.
- **Pré-condição**: Repo limpo, autor edita marker `# SYNC_TEST_001` em `~/.claude/skills/method/SKILL.md`
- **Passos**:
  1. `cd ~/GitHub/lp-skills && git log --oneline -1` → guardar SHA atual
  2. Executar `./scripts/sync-from-local.sh` manualmente
  3. `git log --oneline -1` → SHA mudou
  4. `git show HEAD --stat` → arquivo `skills/method/SKILL.md` modificado
  5. `git ls-remote origin main` → SHA remoto = SHA local
- **Resultado**: Novo commit `chore(sync): skills <iso>`, push completou
- **Prova**: outputs colados de `git log` e `git ls-remote`

## TC-8: sync-from-local.sh — segunda execução sem mudanças é idempotente
- **Bug único**: Script faz commit vazio ou roda push desnecessário, gerando ruído.
- **Pré-condição**: TC-7 acabou de rodar, sem novas edições
- **Passos**:
  1. `git log --oneline -1` → SHA atual
  2. Executar `./scripts/sync-from-local.sh` segunda vez
  3. Aguardar conclusão (< 2s esperado)
  4. `git log --oneline -1` → SHA inalterado
  5. Verificar `/tmp/lp-skills-sync.log` não tem erros novos
- **Resultado**: Zero commits novos, exit 0, log sem warnings
- **Prova**: outputs antes/depois

## TC-9: sync-from-local.sh — resolve symlink (make-dev) em arquivo regular
- **Bug único**: rsync sem `-L` (ou sem `--safe-links`) commita symlink quebrado, usuários finais não conseguem usar a skill.
- **Pré-condição**: `~/.claude/skills/make-dev` é symlink válido para `/path/labzz-skillzz/...`
- **Passos**:
  1. Executar `./scripts/sync-from-local.sh` (após edição que dispare commit, se necessário)
  2. `git ls-tree HEAD skills/make-dev/SKILL.md` → verificar modo
  3. Modo deve ser `100644` (blob), NÃO `120000` (symlink)
  4. `cat skills/make-dev/SKILL.md` → conteúdo real visível, não path de symlink
- **Resultado**: make-dev no repo é arquivo regular com conteúdo real
- **Prova**: output de `git ls-tree` + `cat`

## TC-10: sync-from-local.sh — debounce + lockfile previne corrida em sessões paralelas
- **Bug único**: Duas sessões em sequência rápida disparam dois rsyncs simultâneos, corrompendo o working tree, OU disparam dois commits idênticos.
- **Pré-condição**: Repo limpo, edição feita em `~/.claude/skills/method/SKILL.md`
- **Passos**:
  1. Disparar 2 execuções do script em paralelo:
     `./scripts/sync-from-local.sh & ./scripts/sync-from-local.sh & wait`
  2. `git log --oneline -3` → apenas 1 novo commit (não 2)
  3. Imediatamente após (< 30s), disparar 3ª execução
  4. Esperar < 100ms para ela sair (debounce)
  5. `git log --oneline -3` → ainda apenas 1 novo commit
- **Resultado**: Lockfile evita corrida; debounce evita re-runs próximos
- **Prova**: timing + git log
