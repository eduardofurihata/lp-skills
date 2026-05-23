# Fast/Todo — Spec

## Reler

- `docs/01-problem/fast-todo-restructure.md`
- `docs/02-user-stories/fast-todo-restructure.md`
- `docs/03-use-cases/fast-todo-restructure.md`

## Escopo de plataforma (DERIVADO)

- **Web-only**: o projeto é uma LP Next.js servida em https://lp-skills.vercel.app. Não há código mobile (verificado: nenhum `app/(mobile)`, `expo`, `react-native`, `swift`, `kotlin` no repo).
- Skills são markdown consumido pelo Claude Code (CLI no terminal); não há superfície mobile.
- **Decisão**: feature não tem superfície mobile. TCs serão apenas web (Playwright + verificação manual da LP).

## Decisões (Autonomous Decision Loop)

### Round 1

#### D-01 — Steps incluídos no /fast
- **Decisão**: /fast roda steps 1-8 + 10. Pula apenas step 9 (testing) e step 11 (ship).
- **Justificativa**: US-01 quer encerrar dev sem QA via front; US-02 quer Code Review automático.
- **Referência**: padrão do projeto (/method tem 11 steps; /fast é variante com 2 omissões).
- **Alternativas descartadas**:
  - Stop em 7b (atual): viola US-02 (sem Code Review).
  - Incluir Step 11 (ship): contradiz "sem QA formal", smoke em prod requer evidência.
  - Incluir Step 9: contradiz US-01.

#### D-02 — Steps no /todo
- **Decisão**: Phase 1 (scan), Phase 2 (Code Review condicional — só legacy), Phase 3 (Testing), Phase 4 (Done dual-path).
- **Justificativa**: US-04 quer QA opcional; US-05 quer legacy compat.
- **Referência**: design pattern do `/test` original + adaptação para dual-format.
- **Alternativas descartadas**:
  - Sempre rodar Code Review: redundante para novo (já rodou no /fast).
  - Nunca rodar Code Review: deixa legacy sem review (regressão de qualidade).

#### D-03 — Schema do tracking
- **Decisão**: Frontmatter com `status` (dev) + `tests` (QA) como campos independentes.
  - Novo (criado por /fast): `status: done`, `tests: pending` → após /todo: `tests: passed`
  - Legacy (criado pelo /fast antigo): `status: pending-test` (reconhecido só) → após /todo: `status: done`, `tests: passed`
- **Justificativa**: US-03 quer estado claro; US-05 quer legacy compat sem migração manual.
- **Referência**: padrão de bookkeeping com campos ortogonais (visto em Notion DB schemas, GitHub Actions workflow status).
- **Alternativas descartadas**:
  - Único campo `status`: confunde dev-status com qa-status.
  - Script de migração legacy → novo: scope creep, /todo já lida via dual-recognition.

#### D-04 — Naming
- **Decisão**: renomear `/test` → `/todo`.
- **Justificativa**: US-08 quer naming semântico; `/todo` opera sobre `docs/todo/`, mnemônico direto.
- **Referência**: princípio "naming as documentation" (Clean Code, Ousterhout).
- **Alternativas descartadas**:
  - Manter /test: não reflete o que a skill faz (não é teste de código, é QA via front).
  - /qa, /validate: mais abstratos que /todo (que casa com a pasta).

#### D-05 — Symlink local
- **Decisão**: remover `~/.claude/skills/test` (apontava para path inexistente após rename); criar `~/.claude/skills/todo -> /home/furihata/GitHub/lp-skills/skills/todo`.
- **Justificativa**: README.md do projeto documenta o symlink pattern; usuário no Linux.
- **Referência**: workflow do autor (README.md "Workflow do autor").
- **Alternativas descartadas**:
  - Não atualizar: skill quebrada localmente para o usuário.
  - Symlink ambos `/test` e `/todo`: confunde naming (US-08).

#### D-06 — YAML escaping
- **Decisão**: descriptions contendo `` `tests: pending` `` ou similar com `:` literal interno são envolvidas em aspas simples no YAML.
- **Justificativa**: UC-13 documenta bug em produção; UC-17 documenta a correção.
- **Referência**: YAML 1.2 spec — strings com `: ` precisam de quoting; gray-matter usa js-yaml para parsing.
- **Alternativas descartadas**:
  - Aspas duplas: igualmente válido, mas projeto não tem padrão estabelecido; aspas simples são mais comuns em YAML idiomático.
  - Escape com `\`: não é convenção YAML.
  - Reescrever descriptions sem `:`: mata clareza do conteúdo.

#### D-07 — Step 11 (Ship)
- **Decisão**: Step 11 fica apenas no `/method` completo. Não adiciona ao `/fast` nem ao `/todo`.
- **Justificativa**: Step 11 exige smoke em prod com evidência — contradiz "sem QA formal" do /fast e "QA pós-dev" do /todo.
- **Referência**: design original do /method.
- **Alternativas descartadas**:
  - /todo termina em Step 11: smoke em prod exige cerimônia que /todo não tem (não tem acesso à infra de deploy).

### Round 2 — re-análise

#### D-08 — Pre-push validation
- **Decisão**: antes do `git push origin main`, rodar `pnpm build` localmente para garantir build limpo.
- **Justificativa**: evita deploy de código que quebra build; UC-13 + UC-18 dependem de build válido.
- **Referência**: CI/CD best practice (pre-commit hooks, pre-push validation).
- **Alternativas descartadas**:
  - Confiar no Vercel build: feedback loop lento (3-5 min vs 30 seg local).

#### D-09 — Verificação pós-deploy
- **Decisão**: após Vercel build Ready, visitar https://lp-skills.vercel.app via browser e confirmar 8 cards visíveis (apf, ask, chat, chat-out, commit, fast, method, todo).
- **Justificativa**: UC-18 + US-06 + US-07.
- **Referência**: padrão de smoke test pós-deploy.
- **Alternativas descartadas**:
  - Confiar no build log: build pode passar mas ISR cache servir HTML stale (UC-14).

#### D-10 — Cache invalidação se UC-18 falhar
- **Decisão**: se LP não mostrar todas as 8 skills após o deploy automático, force redeploy SEM cache via Vercel UI ("Redeploy" desmarcando "Use existing Build Cache") ou `vercel redeploy <url> --force` via CLI.
- **Justificativa**: UC-19; build cache do Turbopack pode reter HTML stale para pages estáticas quando `skills/` (fora de `app/`) muda.
- **Referência**: Next.js 16 docs sobre ISR; Vercel KB sobre build cache.
- **Alternativas descartadas**:
  - Limpar cache via API call: requer token; UI é mais simples.
  - Recriar projeto Vercel: nuclear option, desnecessário.

### Round 3 — re-análise final

#### Gaps potenciais checados

- **Cross-references quebradas?** Grep em `/method/SKILL.md`, `CLAUDE.md`, `AGENTS.md`, `README.md`, `lib/`, `app/`, `components/`, `scripts/` por `/test\b`, `/fast\b`, `pending-test` — **zero matches** (já confirmado nesta sessão).
- **i18n?** Projeto não tem i18n configurado (verificado: nenhum `next-intl`, `react-i18next`, `i18n.config*`, pastas `locales/`, `translations/`, `messages/`). Skills em PT-BR misto inglês; LP em PT-BR. Não aplicável.
- **A11y?** LP usa Radix UI primitives (acessível por padrão). SkillGrid usa `role="list"`, cards com `<button>`/`<input type="checkbox">` semânticos. Sem regressão esperada.
- **Performance?** Mudanças são apenas em SKILL.md (markdown) — não impacta bundle JS. Build adiciona +2 skills (10 vs 8 antes), tamanho negligenciável.
- **Segurança?** Sem novos endpoints, sem novos inputs do usuário, sem exposição de secrets. Skills são read-only no servidor.
- **Mobile?** Web-only (declarado em "Escopo de plataforma").
- **Rollback?** Cada commit é atômico e pode ser revertido individualmente. Se necessário: `git revert <sha>` (preserva histórico). Nunca `git reset --hard` em commit pushado.

## Solução técnica — Resumo

### Arquivos alterados (já em commits locais)

| Commit | Arquivo | Mudança |
|--------|---------|---------|
| `74aed17` | `skills/todo/SKILL.md` (renomeado de `skills/test/`) | Frontmatter (name: todo, description quoted), Phase 1 dual-format scan, Phase 2 condicional, Phase 4 dual-path, fluxo + Red Flags atualizados |
| `1a43061` | `skills/fast/SKILL.md` | Steps 8 + 10 incluídos, HARD-GATE/checklist/fluxo/tracking/Red Flags atualizados, seção "Loop Step 7b → Step 8" adicionada |
| `640c30c` | `skills/fast/SKILL.md` + `skills/todo/SKILL.md` (linha 3) | Descriptions wrapped em aspas simples para resolver YAML parsing |

### Arquivos NÃO alterados

- `lib/skills.ts` — funciona como está (lê dinâmico via `fs.readdir`)
- `app/page.tsx`, `components/SkillsClient.tsx`, `components/SkillGrid.tsx` — sem mudança
- `next.config.ts`, `package.json` — sem mudança
- `CLAUDE.md`, `AGENTS.md`, `README.md` — sem referências obsoletas (confirmado por grep)
- `skills/method/SKILL.md` e `skills/method/references/*` — sem referências obsoletas (confirmado por grep)

### Operações locais (não-código)

| Operação | Comando | Estado |
|----------|---------|--------|
| Symlink update | `rm ~/.claude/skills/test && ln -s …/skills/todo ~/.claude/skills/todo` | ✅ feito |
| Pre-push build | `pnpm build` | pendente |
| Push | `git push origin main` | pendente |
| Pós-deploy smoke | Browser visit `https://lp-skills.vercel.app` + count 8 cards | pendente |
| Cache invalidação (se necessário) | Vercel UI redeploy sem cache | contingência |

## Saída do Loop

✅ **Spec completo — 3 rounds, 10 decisões, zero ambiguidades.**
