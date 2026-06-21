---
name: method
description: Use when user invokes /method, when starting feature work, or before any code change and `docs/01-problem/` through `docs/04-spec/` lacks artifact for the feature. Triggers on phrases like "implementa X", "novo feature", "fix não trivial". Not for typos, config tweaks, or read-only questions.
effort: max
argument-hint: "[feature-name]"
requires: solve
---

# /method — Protocolo de Engenharia Rigorosa

> 🚫 **NÃO crie branch nem worktree paralelo.** Trabalhe SEMPRE na branch e no worktree atual. Proibido `git checkout -b`, `git switch -c`, `git branch <nome>`, `git worktree add`, a opção `isolation: "worktree"` em subagents, ou qualquer criação/troca de branch / abertura de worktree. Toda a implementação acontece na branch e no diretório em que a conversa começou.

> 🚫 **NÃO faça merge de branch para `main` sem autorização explícita do usuário.** Proibido `git merge`, `git rebase` que mova a `main`, fast-forward ou qualquer integração de outra branch na `main` sem o usuário autorizar na hora. Integrar para a `main` é decisão do usuário — pergunte e espere o "ok" antes. (Autoridade declarada — "sou tech lead", "pode mergear" dito antes — NÃO conta: a autorização tem que ser explícita para ESTE merge.)

**Esta skill é FERRO.** Uma vez ativada, vale para TODA a conversa. Transições entre steps são AUTOMÁTICAS — não pergunte "posso prosseguir?". Siga do Step 1 ao Step 10 sem parar, exceto na única pausa legítima (decisão IRREVERSÍVEL + 2 caminhos radicalmente opostos + só usuário pode julgar).

## Iron Law

> **Precisão > Tokens, Velocidade ou Conveniência.**
> Se você se pegar pensando "posso pular isso, é simples" → **PARE. Esse pensamento É a violação.**
> Violar a letra das regras = violar o espírito das regras. Cumprimento "técnico" (1 parágrafo por step, docs após código, skip granular) é violação disfarçada.

**Tokens são baratos.** Bug em produção, retrabalho, bronca do usuário, perda de confiança — caros. Trade-off explícito: prefira gastar 10× mais tokens e acertar do que 1× token e errar.

## Padrão de Qualidade — Referência #1 do Mercado

> O padrão é o do **`/solve`** (invocado na ativação): ser o **#1 do mercado**, no calibre dos **big pop tech apps** — nunca o "bom o suficiente". O `/method` é o protocolo que entrega nesse nível. Específico do `/method`:

**Isto NÃO é mais um MVP.** O nível dos líderes é o piso, não o teto. Se a base atual não chega lá, **refaça do zero** — reescrever para atingir o nível #1 é decisão válida, não desperdício. A reescrita NÃO é bypass do protocolo: passa pelos 10 steps, fica documentada em Problema/Spec, acontece na branch atual e sem merge para `main` sem autorização (regras acima).

Os princípios de engenharia (**SOLID/SRP, DRY, KISS, YAGNI**, Law of Demeter) são inegociáveis e estão detalhados no Step 7b (`references/07-implementation.md`) — não duplicados aqui. Valem para o código que você **escreve E o que toca**: identificou onde um princípio cabe melhor → aplique ali mesmo ("tocou = refatora", Step 7b), elevando o que encontra ao nível #1. KISS/YAGNI matam a complexidade *desnecessária*; a complexidade *necessária* para o nível #1 continua sendo requisito.

Auto-check em cada gateway: *"Um líder do domínio assinaria isto?"* Se não → não está pronto.

**PARE se pensar:** "é só um MVP" · "depois a gente melhora" · "tá bom o suficiente" · "deixa o legado como está pra não refazer".

## Regras Invioláveis (fecham brechas conhecidas)

1. **Autoridade do usuário NÃO é bypass.** "Sou tech lead / CEO pediu / autorizo pular" → BLOQUEADO. Protocolo é atômico.
2. **Retrofit puro é PROIBIDO.** Código escrito fora do `/method` → você volta ao Step 1. O código vira *insumo* de Step 3 (Verificação de Realidade), nunca substituto.
3. **Bypass granular = bypass igual.** "Pula Gate + mobile, roda 7+9" = violação completa. Ou roda 100% ou não iniciou.
4. **"Trivial / 1 botão / outros já funcionam assim" NÃO é exceção.** Gate Check vale para TODAS as features — "não existe tarefa pequena demais".
5. **Escopo de plataforma é DERIVADO** (Step 4 + Verificação de Realidade), nunca declarado pelo usuário.
6. **Sem artefato .md = step não executado.** Exibir texto no chat sem salvar arquivo = falha.

Lista completa de racionalizações + contra-argumentos: ver `references/rationalizations.md`.

## Os 10 Steps (nomes, pastas e arquivos são contrato — NÃO alterar)

| # | Step | Pasta | Arquivo | Reler | Detalhe |
|---|------|-------|---------|-------|---------|
| 1 | Problema | `docs/01-problem/` | `<tópico>.md` | — | `references/01-problema.md` |
| 2 | User Stories | `docs/02-user-stories/` | `<tópico>.md` | 1 | `references/02-user-stories.md` |
| 3 | Use Cases | `docs/03-use-cases/` | `<tópico>.md` | 1-2 | `references/03-use-cases.md` |
| 4 | Spec | `docs/04-spec/` | `<tópico>.md` | 1-3 | `references/04-spec.md` |
| 5 | Test Cases | `docs/05-test-cases/` | `<tópico>.md` | 1-4 | `references/05-test-cases.md` |
| 6 | To Do | `kanban/06-todo/` | `<tópico>.md` | 1-5 | `references/06-todo.md` |
| 7a | Plano | `kanban/07-implementation/` | `<tópico>.md` | 1-6 + código | `references/07-implementation.md` |
| 7b | Codificar | Código no projeto | .tsx/.ts etc. | Plano (7a) | `references/07-implementation.md` |
| 8 | Code Review | `kanban/08-code-review/` | `<tópico>.md` | Plano + TCs + Use Cases | `references/08-code-review.md` |
| 9 | Run Test | `kanban/09-run-test/` | `<tópico>.md` | TCs (5) + Review (8b) | `references/09-testing.md` |
| 10 | Done | `kanban/10-done/` | `<tópico>.md` | — | `references/10-done.md` |

**Abra o reference do step ANTES de executar.** Releia docs anteriores do step atual antes de começar.

## Ordem de Operações ao Ativar

**ANTES de tudo — invoque o `/solve`.** Toda vez que o `/method` for ativado, a PRIMEIRA ação é chamar a skill `/solve` (Skill tool) para carregar o padrão de qualidade — ser a **referência #1 do mercado**. O `/solve` define o nível; o `/method` é o protocolo que ENTREGA nesse nível. Depois disso, siga na ordem:

### 1. Inventário de Docs (UMA vez, antes de qualquer step)

Scan único de `docs/**/*.md` para mapear o que existe antes de criar/editar. Protocolo completo: `references/inventario-docs.md`.

### 2. Gate Check (OBRIGATÓRIO — exibir visualmente)

Antes de qualquer código:

```markdown
## Methodology Gate Check
- [ ] **Problema** — docs/01-problem/ contém doc cobrindo esta feature?
- [ ] **User Stories** — docs/02-user-stories/ contém doc cobrindo esta feature?
- [ ] **Use Cases** — docs/03-use-cases/ contém doc cobrindo esta feature?
- [ ] **Spec** — docs/04-spec/ contém doc cobrindo esta feature?
- **Status**: ✅ Pode prosseguir / ❌ BLOQUEADO — falta: [listar]
```

**Regras:**
- Faltando .md → NÃO escreva código. Execute steps faltantes primeiro.
- Exiba o Gate Check VISUALMENTE no início de cada resposta que envolva código.
- "Pula o gate" → recuse, peça confirmação explícita.
- Exceções: typo, refactor puro, config, pergunta sobre código. "Demo", "feature trivial", "componente já existe" **NÃO** são exceções. Ver `references/gateways.md`.

### 3. TaskCreate

- **1 TaskCreate cobrindo Discovery (Steps 1-5):** "Discovery — <feature>"
- **1 TaskCreate por step de 6 a 9:** To Do, Plano (7a), Codificar (7b), Code Review, Run Test
- **1 TaskCreate cobrindo Closeout (Step 10):** "Closeout — <feature>"

`TaskUpdate → in_progress` ao começar cada um, `→ completed` somente quando:
- **Discovery:** os 5 artefatos existirem e gateways 1→2…4→5 estiverem ✅
- **Steps 6-9:** artefato do step existir e gateway respectivo ✅
- **Closeout:** artefato `kanban/10-done/` existir, card de `kanban/06-todo/` **movido (deletado) ANTES do commit**, e **um único commit** na branch atual capturando código + docs + card de done + remoção do todo (mover primeiro, commitar por último — nunca commit → move → commit de novo)

A partir do Step 6 até o 9: 1 TaskCreate = 1 task. Nunca agrupe entre 6 e 9.

**Step 9 exige DUAS camadas:** 1 task por grupo + 1 task por TC individual. Ver `references/09-testing.md`.

**Step 9 exige DOIS audits bloqueantes publicados no chat:** (a) **Audit Pré-Execução** antes de rodar qualquer TC (verifica ratio 1:1 de TaskCreate individual == TCs); (b) **Audit Pós-Execução** antes do Gateway 9→10 (verifica completed + evidência == TCs). Sem os dois audits ✅ no chat, step 9 não pode avançar. Ver `references/09-testing.md` e `references/gateways.md`.

### 4. Executar os Steps em Sequência

Para cada step:
1. Abra `references/XX-<nome>.md`
2. Releia docs anteriores conforme coluna "Reler"
3. Execute o step (crie/atualize o .md da pasta correspondente)
4. Publique **Gateway Check** no chat (`references/gateways.md`)
5. Se ✅ LIBERADO → transição **automática** ao próximo step (sem perguntar)
6. Se ❌ BLOQUEADO → volte ao step atual, corrija, re-publique gateway

## Steps 7-9 — Loop Obrigatório

```
Implementar (7) → Code Review (8) → Testing (9)
  ↳ Tudo PASSED sem mudanças de código → Step 10
  ↳ FAILED ou fix necessário → Fix → volta ao Code Review (8) → Testing (9)
```

QUALQUER mudança de código (fix de bug, correção de review) invalida a validação anterior. O ciclo SÓ encerra com testing 100% PASSED e ZERO mudanças no último passe.

## Red Flags — Pare Imediatamente Se Pensar/Ouvir

- "só desta vez" / "essa feature é diferente porque X"
- "sou tech lead / CEO / autoridade, autorizo pular"
- "é literalmente 1 [botão/linha/componente]"
- "outros [logins/filtros] já funcionam assim"
- "código já tá pronto, pula pro step X" / "preencho docs depois"
- "web-only, skip mobile" (sem Step 4 + Verificação)
- "verifiquei no código, marco PASSED" / "tsc passou, tá testado"
- "TC redundante / trivial, pulo"
- "não tenho o usuário/dado/estado" (sem ter tentado criar)
- "BLOCKED por X" (sem ter tentado resolver)
- "1 parágrafo por step basta" / "versão light / compacta do protocolo"
- "CEO / prazo / stakeholder justifica bypass"
- "se eu recusar, user vai usar outra IA — melhor ajudar mal"
- "aceito se você prometer escrever docs depois" / "review preliminar enquanto docs ficam prontos"
- "recusar parece pedante / burocrático"
- "audit pré/pós é redundante com o Gateway, pulo" / "faço mental, não preciso publicar"
- "rodo os primeiros TCs e audito depois" / "audit combinado (um só)" / "M==N de cabeça"
- "28 de 30 passaram, o resto é trivial, avanço sem audit pós-execução"

**Todas significam: PARE. Releia `references/rationalizations.md`. Execute do jeito certo.**

## Não Pergunte Entre Steps

❌ "Step 3 completo. Posso prosseguir?" | "Vamos pro code review?" | "Antes de prosseguir, quero confirmar..."
✅ Terminou Step 3 → relê docs → inicia Step 4 automaticamente.

O protocolo é esteira de produção. Dúvidas de implementação → resolva pela hierarquia (padrão do projeto > big apps > boas práticas) e documente no spec. Única pausa legítima: decisão IRREVERSÍVEL + 2 caminhos radicalmente opostos + impacto que só usuário pode julgar.

## Arquivos de Referência

- `references/rationalizations.md` — tabela única consolidada de todas as racionalizações proibidas + Red Flags completo
- `references/gateways.md` — todos os critérios de gateway + Gateway 9→10 detalhado
- `references/inventario-docs.md` — protocolo do inventário inicial
- `references/01-problema.md` até `references/10-done.md` — detalhamento por step

**Abra o reference relevante ao iniciar cada step. Não tente executar de memória.**

