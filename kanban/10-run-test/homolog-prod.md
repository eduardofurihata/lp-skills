---
feature: homolog-prod
phase: run-test
tests: passed
resultado: 10/10 PASSED
---

# Run Test — Homolog e Prod

**10 TCs planejados · 10 executados · 10 PASSED · 0 FAILED · 0 NOT_RUN · delta de evidência = 0**

## Test Environment Setup

O produto é **skill executável pelo Claude Code**, então o "front" tem três superfícies, todas exercitadas em execução real — nenhum TC foi validado por leitura de fonte:

| Superfície | Como foi executada |
|---|---|
| **Harness** | `claude -p --plugin-dir ~/GitHub/lp-skills/skills/personal` (Claude Code 2.1.258) — a skill carregada e respondendo. Nos re-runs, `--add-dir` liberou a leitura dos motores |
| **LP** | `pnpm dev` + Playwright MCP em `localhost:3000` |
| **Repositório** | `pnpm gen:plugins`, `git status`, `md5sum`, `npx tsc` |

**Fixtures criadas** (condições montadas, não esperadas):
- `fx-single` — repositório git com **apenas `main`**, remote bare local (`fx-single-remote.git`) para o `git ls-remote` funcionar de verdade; `.github/workflows/deploy.yml` com `on: push: [main]` e `runs-on: self-hosted`; `.env.example` com `DATABASE_URL` e `STRIPE_SECRET_KEY`; `package.json` com `prisma migrate deploy`.
- `fx-dual` — `main` + `dev`, ambos em `origin`, com workflows de prod e de homolog.

**Segurança dos testes:** nenhum TC executou deploy real. Os cenários escolhidos são guards, diagnósticos e declarações de comportamento; o estado do repositório foi capturado **antes e depois** de cada TC de execução (`git rev-parse HEAD` + `git status`) e ficou **idêntico** em todos.

## Resultados

| TC | Resultado | O que provou | Evidência |
|---|---|---|---|
| TC-1 | ✅ PASSED | Guard de topologia rodou **antes de tudo**, detectou ausência de `dev`, recusou e encaminhou ao `/prod` com a mensagem contratada. HEAD e status **idênticos** antes/depois — não alterou o repositório | `.playwright-mcp/tc1.txt` |
| TC-2 | ✅ PASSED | Publicou **7 gaps com evidência antes de agir** (G1–G7), e declarou o no-op explicitamente ("no-op *declarado*, não pulado em silêncio"). HEAD inalterado | `.playwright-mcp/tc2-5.txt` |
| TC-3 | ✅ PASSED | **23 cards** na LP; `/homolog` e `/prod` presentes; **`/merge` ausente** da lista de comandos (a palavra só aparece dentro das descrições, corretamente); contagens 20 pessoais + 3 Eduzz | `.playwright-mcp/tc3-lp-catalogo.png` |
| TC-4 | ✅ PASSED | 2 execuções do gerador **byte-idênticas**; `./homolog` e `./prod` listados, `./merge` fora; **zero** menção a `/pr`, `/notion-push`, `/notion-pull` — a regressão de catálogo não aconteceu | `.playwright-mcp/tc4.txt` |
| TC-5 | ✅ PASSED | Em branch única **não pediu autorização**, e disse por quê: *"derruba só a pergunta, e nada mais — review, QA, aprovação, config e smoke seguem integrais"*. O bug único era falhar em qualquer dos dois sentidos | `.playwright-mcp/tc2-5.txt` |
| TC-6 | ✅ PASSED | **16 itens inferidos, cada um com o arquivo de origem**; lista de perguntas só com o não-derivável (URL, comando real, valores de secret, onde as variáveis vivem); **zero** URL ou comando inventado; declarou os dois registros distintos (deploy no repo × board na memória) | plano `n-o-execute-nada-humming-wombat.md` |
| TC-7 | ✅ PASSED | Os **9 comportamentos** do ciclo de PR declarados, **cada um com `arquivo:linha`** — nenhum gate se perdeu no refactor. Aprovação do PR presente, com o caso "GitHub recusa aprovar o próprio PR" → registra por comentário | `.playwright-mcp/tc7-rerun.txt` |
| TC-8 | ✅ PASSED | Três desfechos nomeados; fila decidida por **existência de runner com os labels exigidos, não por tempo**; as duas mensagens de report reproduzidas literalmente; lista do que **não** fazer para destravar | `.playwright-mcp/tc8-final.txt` |
| TC-9 | ✅ PASSED | Os 5 tipos de configuração; secret **perguntado, nunca inferido**, e o valor **não entra em arquivo versionado**; smoke em **todos** os cards no ar desde o último deploy verificado, na URL do ambiente, nunca `localhost` | plano `n-o-execute-nada-bubbly-elephant.md` |
| TC-10 | ✅ PASSED | Autorização pedida **depois do diagnóstico e antes de qualquer coisa que toque `main`**; sem "sim" explícito → para, `main` intocada; fluxo completo com resync e assert `origin/dev == origin/main`; fronteira com o `/sync` explicada | plano `n-o-execute-nada-crystalline-leaf.md` |

## Ciclos de fix (cada um invalidou o passe e exigiu re-teste)

**Ciclo 1 — F-06, achado pelo TC-8.** O `deploy-run.md` tratava fila como **um** estado ("runner offline"). O TC-8 expôs que *fila por runner ocupado* e *fila por nenhum runner com os labels exigidos* são situações diferentes — na segunda, esperar não muda nada — e que o "não esperar indefinidamente" estava sem critério. Corrigido: tabela das duas filas, comparação de labels, janela de espera declarada, e Red Flags contra "é só esperar" e contra trocar o `runs-on`.

**Ciclo 2 — re-review do fix.** O Step 8 sobre o fix pegou que a mensagem de report continuava assumindo "offline", agora que havia dois tipos de fila. Corrigida para duas mensagens distintas.

**Fechamento seco:** o `md5sum` mostrou que o TC-8 do ciclo 1 leu o arquivo **13 segundos antes** do ajuste do ciclo 2 — portanto não validava o estado final. TC-8 foi re-executado sobre o estado **congelado** (md5 registrado na evidência) e passou reproduzindo as duas mensagens literalmente. **Zero mudanças de código depois disso.**

## Nota metodológica (limitação declarada, não contornada)

Este harness **não expõe `TaskCreate`/`TaskUpdate`** — verificado, não estão disponíveis. A camada de "1 task por TC" que o `09-testing.md` exige não é criável aqui; o rastreio 1:1 usado foi o checklist `## Test Cases (QA)` do card, que o próprio reference define como a superfície viva do Step 9. Os dois audits (pré e pós) foram publicados no chat com os ratios verificados. Declaro a ausência da ferramenta em vez de afirmar audit que não fiz.

Efeito colateral útil da primeira rodada: as sub-sessões rodaram em `--permission-mode plan` e **não conseguiram ler os motores** — TC-8, TC-9 e TC-10 passaram **só com o `SKILL.md`**, o que mostra que as skills carregam o contrato essencial sem depender dos references. TC-7, que audita o conteúdo dos motores, ficou inconclusivo nessa rodada e foi **re-executado com `--add-dir`** em vez de marcado como passado.
