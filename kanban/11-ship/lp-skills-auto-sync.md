# Ship — LP Skills Auto-Sync

## Branch / Commits / SHAs

- **Branch:** `main`
- **Repo:** [https://github.com/eduardofurihata/lp-skills](https://github.com/eduardofurihata/lp-skills) (público)
- **Commits** no histórico final:
  - `d6b2b82` feat: LP de skills do Claude Code com auto-sync (scaffold completo)
  - `f01eb1d` fix: use real GitHub repo URL in install prompt
- **Head SHA:** `f01eb1d79d5f375abb06dc3e2907ab9e2f1958a6` (local == remote)

## Data dos deploys

- **Staging:** N/A (Vercel free tier não usa staging separado nesse setup; preview deploys do GitHub PR cumprem a função para mudanças futuras)
- **Produção:** 2026-05-22 ~22:25 BRT
- **URL pública:** [https://lp-skills.vercel.app](https://lp-skills.vercel.app)
- **Vercel project:** `eduardo-furihatas-projects/lp-skills`
- **Build time:** 25s (compile) + 20s (deploy) = ~45s end-to-end

## Smoke Test em Produção

### Smoke 1 — HTTP base
- `curl https://lp-skills.vercel.app` → **HTTP 200** em 0.77s
- `<title>` correto: "Claude Code Skills — Furihata"
- HTML contém **15** instâncias de `Selecionar skill X` (todas as 15 skills renderizadas)

### Smoke 2 — Visual via Playwright
- Navegação para https://lp-skills.vercel.app → carregou sem erros de console
- Screenshot `prod-smoke.png` (full page): Hero + grid de 15 cards + sticky bar empty state — idêntico ao dev
- Selecionei skill `method` → card ficou violet + sticky bar atualizou para "1 skill selecionada · escopo Global"
- Cliquei "Gerar prompt" → dialog abriu com prompt mostrando URL **real** do GitHub (`https://github.com/eduardofurihata/lp-skills`)
- Screenshot `prod-prompt-dialog.png` confirma o prompt produzido em prod

### Smoke 3 — Sync end-to-end contra GitHub real
- `~/.claude/settings.json` atualizado com hook SessionStart apontando para `/home/furihata/GitHub/lp-skills/scripts/sync-from-local.sh &`
- Rodei `./scripts/sync-from-local.sh` manualmente após o setup
- Log: `[2026-05-22T22:22:34-03:00] sync ok` + `Already up to date` (idempotente — não criou commit lixo)
- `git rev-parse origin/main` == `git rev-parse HEAD` → SHAs sincronizadas com o GitHub real

## Feature Flags / Rollout

- Sem feature flags (single-page público)
- Sem rollout gradual (deploy direto via Vercel)

## Monitoramento

- **Vercel dashboard:** [https://vercel.com/eduardo-furihatas-projects/lp-skills](https://vercel.com/eduardo-furihatas-projects/lp-skills) — métricas de deploy, requests, web vitals
- **GitHub:** webhook push → Vercel auto-deploy. Próximo `git push` ao remoto reconstrói a LP automaticamente
- **Sync log:** `/tmp/lp-skills-sync.log` (local) — verificar se erros aparecerem; rotacionar manualmente se ficar grande
- **Conta de visitas / web vitals:** Vercel Analytics free tier (não habilitado por padrão — pode habilitar futuramente)

## Rollback Plan

### Para reverter um deploy ruim
```bash
# Listar deploys
vercel ls

# Promover deploy anterior pra production
vercel promote <previous-deployment-url>
```

### Para reverter mudanças nas skills
```bash
cd ~/GitHub/lp-skills
git revert HEAD          # ou git reset --hard <sha>
git push origin main     # disparará novo build na Vercel
```

### Para desativar o sync hook (em caso de loop / erro)
Editar `~/.claude/settings.json` e remover o bloco `SessionStart` que adicionei. O sync para imediatamente; LP continua online.

## Configuração final

- **Hook:** `SessionStart` em `~/.claude/settings.json` → roda `sync-from-local.sh &` (async) a cada nova sessão
- **Auto-update da LP:** push pro GitHub dispara webhook Vercel → rebuild em ~45s
- **Auto-update dos usuários finais:** quando colarem o install prompt, o Claude Code deles adiciona um hook SessionStart próprio que faz `git pull --ff-only` no `~/.claude/lp-skills-source/` toda nova sessão

## Status Final

- ✅ Repo GitHub público criado e populado
- ✅ Vercel deploy em produção (HTTP 200, < 1s)
- ✅ Smoke test visual em prod aprovado
- ✅ Sync hook instalado e validado contra GitHub real
- ✅ SHAs sincronizadas (local == remote)
- ✅ 10/10 TCs PASSED (Step 9)
- ✅ Zero issues abertas

**Done. Production live.**
