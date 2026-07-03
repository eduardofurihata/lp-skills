# Distribuição de Skills via Plugin Marketplace — Test Cases

## Nota de complexidade: **10/10** → **10 TCs**

Derivada dos Steps 3-4 (+ Round 3): 14 UCs; mecanismo cross-OS (o núcleo do problema); gerador de manifestos; grafo de dependências transitivo; **bundles por categoria** (furi-builder/eduzz-builder) + LP; reescrita da LP + build; cleanup destrutivo seguro; install global + validação em CLI novo; segurança. Muito a cobrir → nota no teto. Eixo de execução = SO (validado localmente no Linux; o mecanismo de **cópia** é o que garante cross-OS). Sem mobile.

> **Cobertura de UC-12 (rename), UC-13 (offline), UC-14 (colisão):** são comportamentos do **próprio Claude Code**, não do nosso artefato (nosso código não implementa rename/clone-error/resolução-de-conflito). Pelo filtro de significância, não geram TC dedicado — documentamos as opções (`renames`, namespace `@lp-skills`) no README. UC-11 (dev-loop do autor) entra no TC-9.

---

### TC-1: Gerador produz 19 plugin.json + marketplace.json válidos e idempotentes
- **Cobre**: UC-8; spec #6, #10, #11; idempotência do gerador
- **Bug único**: gerador emite JSON inválido, não-determinístico, ou com `source` errado
- **Pré-condição**: `skills/**/SKILL.md` com frontmatter; `pnpm i` feito
- **Passos**: 1) `pnpm gen:plugins`; 2) contar `find skills -name plugin.json` == 19; 3) `node -e` validando JSON.parse de cada plugin.json e do marketplace.json; 4) conferir `source` de cada entry aponta pro dir certo e `name` == basename; 5) rodar de novo → `git diff --stat` vazio
- **Resultado**: 19 plugin.json + 1 marketplace.json, todos JSON válido; 2ª rodada não muda nada (idempotente)
- **Prova**: output do terminal

### TC-2: Dependências geradas batem 1:1 com o grafo `requires`
- **Cobre**: UC-3; spec #7; grafo de deps
- **Bug único**: dep faltando ou errada (ex.: `afl` sem `jira`, `method` sem `solve`, ou dep inventada num plugin sem `requires`)
- **Pré-condição**: TC-1 rodou
- **Passos**: 1) ler `dependencies` de afl, merge, jira, fast, work, todo, method; 2) confrontar com frontmatter `requires`; 3) confirmar que os 11 sem `requires` não têm `dependencies`
- **Resultado**: afl→[jira], merge→[todo], jira/fast/work/todo→[method], method→[solve]; os 11 restantes sem `dependencies`
- **Prova**: output do terminal

### TC-3: marketplace add (local) + install sem dep → invocação BARE
- **Cobre**: UC-1, UC-2; spec #2, #3, #4, #11
- **Bug único**: skill instala mas invoca namespaced (`/lp-skills:commit`) ou não carrega
- **Pré-condição**: TC-1 rodou; Claude Code CLI disponível
- **Passos**: 1) `claude plugin marketplace add ./` (path local do repo); 2) `claude plugin install commit@lp-skills`; 3) `claude plugin list` mostra `commit`; 4) checar nome de invocação exposto (bare `commit`, não `lp-skills:commit`)
- **Resultado**: `commit` instalado, invocação **bare**, zero symlink criado
- **Prova**: output de `claude plugin list` / inspeção

### TC-4: install com cadeia de deps resolve transitivo
- **Cobre**: UC-3; spec #7
- **Bug único**: instalar `afl` não puxa `jira`→`method`→`solve`
- **Pré-condição**: marketplace adicionado
- **Passos**: 1) `claude plugin install afl@lp-skills`; 2) `claude plugin list`
- **Resultado**: `afl`, `jira`, `method`, `solve` todos instalados
- **Prova**: output de `claude plugin list`

### TC-5: install é CÓPIA no cache (garantia cross-OS — o núcleo do problema)
- **Cobre**: UC-4; spec #1 (por que funciona no Windows)
- **Bug único**: install cria symlink (voltaria a quebrar no Windows) em vez de cópia real
- **Pré-condição**: TC-3/TC-4 instalaram plugins
- **Passos**: 1) localizar o dir do plugin em `~/.claude/plugins/`; 2) `test -L` (não é symlink) e `test -f …/SKILL.md` (arquivo real presente)
- **Resultado**: plugin é **cópia real** (não symlink) no cache → mecanismo independe de symlink/SO
- **Prova**: output de `ls -la` do cache

### TC-6: update reflete commit novo (git-SHA versioning)
- **Cobre**: UC-5; spec #8
- **Bug único**: `marketplace update` é no-op mesmo com commit novo, ou não propaga conteúdo
- **Pré-condição**: um plugin instalado; marketplace local
- **Passos**: 1) editar 1 linha de uma skill instalada + `pnpm gen:plugins` + commit; 2) `claude plugin marketplace update`; 3) inspecionar o conteúdo no cache
- **Resultado**: conteúdo atualizado presente no cache pós-update
- **Prova**: diff/grep do arquivo no cache

### TC-7: LP gera comandos `/plugin` corretos + `pnpm build` verde
- **Cobre**: UC-6, UC-7; spec #12, #18; build da LP
- **Bug único**: LP ainda mostra prompt de symlink, gera comando errado, ou o build quebra
- **Pré-condição**: LP editada; `pnpm i`
- **Passos**: 1) `pnpm build` termina sem erro; 2) `pnpm dev`; 3) Playwright: abrir LP, selecionar `afl`, abrir o viewer; 4) conferir texto = `/plugin marketplace add eduardofurihata/lp-skills` + `/plugin install afl@lp-skills` (com a cadeia de deps visível); 5) conferir badge/filtro de categoria
- **Resultado**: LP mostra comandos `/plugin` corretos, deps expandidas, categoria; build verde
- **Prova**: screenshot da LP + output do build

### TC-8: cleanup remove só o que é do repo; preserva terceiros e demais hooks
- **Cobre**: UC-9; spec #14
- **Bug único**: cleanup apaga `ui-ux-pro-max`/`video-teams`, deixa symlink órfão, ou remove o hook errado (ex.: mata o hook `Stop` de notificação)
- **Pré-condição**: estado atual (16+ symlinks do repo; hook `SessionStart` do sync-skills; dirs reais de terceiros)
- **Passos**: 1) executar o cleanup; 2) `ls -la ~/.claude/skills/` → nenhum symlink apontando pra `lp-skills/skills`; 3) `ui-ux-pro-max/` e `video-teams/` intactos; 4) `~/.claude/settings.json`: hook `SessionStart` do sync-skills removido, hooks `Stop`/demais **intactos**, JSON válido
- **Resultado**: só os symlinks do repo removidos; terceiros preservados; settings.json válido com só o hook-alvo removido
- **Prova**: `ls -la` + diff do settings.json

### TC-9: install GLOBAL do GitHub + validação em CLI NOVO + segurança + dev-loop
- **Cobre**: UC-10, UC-11; spec #15, #19; segurança
- **Bug único**: skill só funciona na sessão atual (não global), secret vaza no corpo, ou o autor perde edição imediata
- **Pré-condição**: marketplace.json/plugin.json commitados e **pushados** pro GitHub; cleanup feito
- **Passos**: 1) `claude plugin marketplace add eduardofurihata/lp-skills` (do GitHub); 2) instalar skills globalmente; 3) **abrir novo** `claude` CLI; 4) `claude plugin list` + invocar 1 skill (ex.: `/method`) e 1 com `scripts/` (`claude-modes`); 5) grep de secrets (`test2@`, tokens) nos SKILL.md; 6) validar que `--plugin-dir` no repo carrega a skill em modo dev (edição imediata)
- **Resultado**: skills disponíveis **globalmente** via GitHub num CLI novo; skill-com-scripts funciona do cache; zero secrets; dev-loop `--plugin-dir` funciona
- **Prova**: output do CLI novo + `claude plugin list` + grep limpo

### TC-10: Bundle instala a categoria inteira (furi-builder / eduzz-builder)
- **Cobre**: Round 3 (spec #21-23); pacote por categoria
- **Bug único**: instalar `eduzz-builder` não puxa as skills eduzz; ou a LP não oferece/gera o comando do bundle
- **Pré-condição**: builders gerados + marketplace (local) atualizado
- **Passos**: 1) uninstall de 1-2 skills-folha da categoria; 2) `claude plugin install eduzz-builder@lp-skills`; 3) confirmar que as skills voltaram via dependência; 4) na LP (Playwright), abrir o pacote `eduzz-builder` e conferir o comando `/plugin install eduzz-builder@lp-skills`
- **Resultado**: bundle puxa a categoria inteira; LP mostra o comando do pacote com a contagem correta
- **Prova**: output de `claude plugin list` + screenshot da LP

## Gateway 5 → 6 ✅
- [x] Nota de complexidade **10** publicada, derivada dos Steps 3-4 (+ Round 3)
- [x] **10 TCs == nota 10**, ≤ 10
- [x] Somatório dos `Cobre` cobre 100% dos UCs testáveis (1-10) + detalhes do spec; UC-12/13/14 justificados como comportamento do Claude Code (fora do nosso runtime)
- [x] Sem TC redundante (cada um puxa cobertura única)
- [x] Cada TC com bug único + resultado observável
- [x] Artefato substantivo
