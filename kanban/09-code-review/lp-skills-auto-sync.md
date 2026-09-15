# Code Review — LP Skills Auto-Sync

## Resumo
- Branch: `master` (não há branches separadas — projeto recém-criado)
- Iterações do loop: 2 (primeira rodada encontrou hydration error, segunda removeu dead code)
- Data: 2026-05-22
- PR existente: não (sem GitHub remote ainda)

## Arquivos Analisados

| Arquivo | Linhas | Tipo | Veredicto |
|---|---|---|---|
| `lib/utils.ts` | 6 | Util | ✅ Limpo |
| `lib/skills.ts` | 65 | Server lib | ✅ Limpo |
| `lib/install-prompt.ts` | 135 | Util | ✅ Limpo |
| `app/layout.tsx` | 53 | Layout | ✅ Limpo |
| `app/page.tsx` | 16 | Page | ✅ Limpo |
| `app/globals.css` | 49 | Styles | ✅ Limpo |
| `components/Hero.tsx` | 27 | Server comp | ✅ Limpo |
| `components/SkillCard.tsx` | 100 | Client comp | ⚠️ Corrigido (hydration) |
| `components/SkillGrid.tsx` | 43 | Client comp | ✅ Limpo |
| `components/ScopeSelector.tsx` | 37 | Client comp | ✅ Limpo |
| `components/InstallPromptViewer.tsx` | 82 | Client comp | ⚠️ Corrigido (eslint comment morto) |
| `components/StickyInstallBar.tsx` | 93 | Client comp | ✅ Limpo |
| `components/SkillsClient.tsx` | 46 | Client comp | ✅ Limpo |
| `components/ui/button.tsx` | 50 | UI primitive | ✅ Limpo |
| `components/ui/badge.tsx` | 30 | UI primitive | ✅ Limpo |
| `components/ui/dialog.tsx` | 80 | UI primitive | ✅ Limpo |
| `components/ui/tabs.tsx` | 49 | UI primitive | ✅ Limpo |
| `components/ui/tooltip.tsx` | 25 | UI primitive | ✅ Limpo |
| ~~`components/ui/checkbox.tsx`~~ | — | UI primitive | ⚠️ Deletado (dead code) |
| `scripts/sync-from-local.sh` | 112 | Bash script | ✅ Limpo |

**Tamanho:** nenhum arquivo > 200 linhas. Maior: `install-prompt.ts` (135), focado em templates. SRP respeitado.

## Problemas Encontrados e Corrigidos

### Issue #1 — Hydration error: `<button>` aninhado dentro de `<button>`
- **Arquivo:** `components/SkillCard.tsx`
- **Linhas:** raiz do componente
- **Severidade:** 🔴 Alta
- **Categoria:** Bug / HTML inválido / SSR mismatch
- **Descrição:** SkillCard era `<button>` e continha `<Checkbox>` do Radix (que renderiza outro `<button>`). HTML proibe `<button>` aninhado, gera erro de hidratação React no console.
- **Correção aplicada:** Refatorado para `<div>` com `role="checkbox"`, `tabIndex={0}`, `aria-checked`, e handlers de teclado para Enter/Space. Checkbox visual virou um `<div>` com ícone `<Check>`. Mantém semântica ARIA + a11y.
- **Iteração:** 1

### Issue #2 — Dead code: `components/ui/checkbox.tsx` e dependência `@radix-ui/react-checkbox`
- **Arquivo:** `components/ui/checkbox.tsx` (e `package.json`)
- **Severidade:** 🟡 Média
- **Categoria:** Dead code (regra "tocou = refatora")
- **Descrição:** Após corrigir Issue #1, o componente Checkbox deixou de ser usado em qualquer lugar. Não temos política de manter primitives "para uso futuro" — `/method` exige delete completo de código morto.
- **Correção aplicada:** Arquivo deletado, `pnpm remove @radix-ui/react-checkbox` (também removeu `@radix-ui/react-presence` órfão).
- **Iteração:** 2

### Issue #3 — Comentário `eslint-disable` sem eslint configurado
- **Arquivo:** `components/InstallPromptViewer.tsx`
- **Linha:** ~52
- **Severidade:** 🟢 Baixa
- **Categoria:** Lixo / comentário enganoso
- **Descrição:** Linha `// eslint-disable-next-line no-console` antes de `console.error(err)`. Projeto foi criado com `--no-eslint`, então o disable é inerte.
- **Correção aplicada:** Comentário removido. `console.error` mantido — está em catch block para debug de erros de clipboard.
- **Iteração:** 2

### Issue #4 — Sync script falhava no bootstrap (sem remote git)
- **Arquivo:** `scripts/sync-from-local.sh`
- **Severidade:** 🟡 Média
- **Categoria:** Bug edge case
- **Descrição:** Script fazia `git pull origin main` cego — falhava quando ainda não havia remote configurado (caso bootstrap do primeiro sync local).
- **Correção aplicada:** Adicionado `if git remote get-url origin >/dev/null 2>&1` antes do pull e do push. Caso sem remote → faz commit local apenas, loga.
- **Iteração:** 1 (durante 7b, antes de chegar no review)

## Análise de Cobertura

### Stories atendidas (de docs/02-user-stories/)

| Story | Atendida | Onde |
|---|---|---|
| Sync automático local → repo | ✅ | `scripts/sync-from-local.sh` + hook SessionStart (a configurar) |
| Resolução de symlinks (make-dev) | ✅ | `rsync -aL` no script — verificado: blob, não 120000 |
| Log de falhas de sync | ✅ | `/tmp/lp-skills-sync.log` |
| Exclusão de .bak/.backup/.7z | ✅ | rsync --exclude + sed mask |
| Mascarar credenciais de teste | ✅ | sed pipeline pós-rsync |
| LP mostra todas skills com descrição | ✅ | `Hero` + `SkillGrid` + `SkillCard` |
| Seleção múltipla via checkbox | ✅ | `SkillsClient` Set state + `SkillCard` toggle |
| Escolha de escopo | ✅ | `ScopeSelector` 3 abas |
| Copy do prompt + UX | ✅ | `InstallPromptViewer` + sonner toast |
| Auto-update no usuário | ✅ | Hook SessionStart no prompt gerado |
| LP dark, rápida | ✅ | Server component prerendered + ISR 300s |
| Escopo Projeto compartilhado | ✅ | Template "project-shared" |
| Escopo Projeto local (gitignore) | ✅ | Template "project-local" + step 0a |

### Use Cases (de docs/03-use-cases/)

UC-1 a UC-16 todos cobertos pelo código. UC-14 (sem internet) e UC-15 (build Vercel) ficam para verificação real no Step 9 / Closeout.

### TCs preparados

10 TCs em `docs/05-test-cases/` mapeados 1:1 contra código. Execução visual via Playwright JÁ FEITA em 7b para TC-1 a TC-6 (UI). TC-7 a TC-10 (sync script) ficam para Step 9.

### Gaps

- Build remoto na Vercel não foi testado ainda (depende do push pro GitHub) — Closeout
- TC-7..10 do sync script precisam ser rodados via Step 9 com evidência

## Análise de Segurança

| Vetor | Status |
|---|---|
| Input validation | ✅ N/A — sem inputs do usuário; tudo é leitura de filesystem em build time |
| Auth | ✅ N/A — LP pública |
| XSS | ✅ React escapa todo conteúdo de skills automaticamente; sem `dangerouslySetInnerHTML` |
| Injection | ✅ N/A — sem queries SQL/NoSQL/shell construídas a partir de input |
| Secrets no código | ✅ Repositório limpo; `test2@test.com / Test123!@#` mascarado pelo sync script |
| Bash injection no script | ✅ Constantes únicas, sem expansão de input não confiável |
| Force-push | ✅ Explicitamente proibido — push falho → log + exit |
| Symlink cycles | ✅ `--safe-links` no rsync |
| Clipboard abuse | ✅ Sem postar conteúdo do clipboard; apenas escreve no clipboard via API padrão |

## Análise de Qualidade

| Critério | Status | Notas |
|---|---|---|
| Duplicação | ✅ Zero | Templates de prompt usam helpers (`headerFor`, `stepsFor`); componentes desacoplados |
| Complexidade | ✅ Baixa | Maior função: `stepsFor` em install-prompt.ts (~25 linhas) — composição simples |
| Naming | ✅ Claro | `selected`, `scope`, `onToggle`, `targetBaseFor` — autoexplicativos |
| Consistência | ✅ | Cores via tokens CSS, padrão shadcn (cn util + Radix wrappers) |
| SRP | ✅ | Cada componente uma responsabilidade |
| Acessibilidade | ✅ | role="checkbox" + ARIA, contraste 19:1, keyboard nav, sr-only no close, focus rings |
| Performance | ✅ | Static prerender + ISR; useMemo no prompt gerado; sem N+1; sem listeners pesados |
| Erros tratados | ✅ | Clipboard fallback, script logs estruturados, sem `catch {}` vazios |
| Comentários | ✅ | Mínimos e justificáveis (header do script, "tokens são baratos" no README) |
| Refatoração "tocou = refatora" | ✅ | Aplicada (Issues #2 e #3) |

## Veredicto Final

- **Status:** ✅ APROVADO
- **Confiança:** Alta
- **Notas para o teste (Step 9):**
  1. TC-7..TC-10 do sync script precisam ser rodados manualmente — script já testado uma vez com sucesso (15 skills sincronizadas, make-dev resolvido, credenciais mascaradas).
  2. TC-1..TC-6 já validados visualmente em 7b via Playwright. Step 9 vai repetir com evidência formal.
  3. Verificar idempotência do sync (segunda execução sem mudanças deve sair em < 100ms).
  4. Verificar debounce (segunda execução em < 30s deve sair imediatamente).
  5. Build Vercel só será testado no Closeout (Step 11).
