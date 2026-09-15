---
name: method
description: 'Use ONLY when the user explicitly invokes /method (bare /method = the objective is whatever the conversation is already about), or when another skill invokes `furi-build:method` via the Skill tool. NEVER activate on your own initiative. — the rigorous engineering protocol: 10 steps from problem to committed code, each one reinvoking /solve (the quality bar), /principles (the engineering doctrine) and — with a visual surface — /front (the design doctrine), with a written artifact in `docs/01-problem/` through `docs/04-spec/` and the follow-up ledger closed dry. Covers feature work, behaviour change and non-trivial fixes; not for typos, config tweaks or read-only questions.'
effort: max
argument-hint: "[feature-name]"
requires: [solve, principles, front]
---

# /method — Protocolo de Engenharia Rigorosa

> 🚫 **NÃO crie branch nem worktree paralelo.** Trabalhe SEMPRE na branch e no worktree atual. Proibido `git checkout -b`, `git switch -c`, `git branch <nome>`, `git worktree add`, a opção `isolation: "worktree"` em subagents, ou qualquer criação/troca de branch / abertura de worktree. Toda a implementação acontece na branch e no diretório em que a conversa começou.

> 🚫 **NÃO faça merge de branch para `main` sem autorização explícita do usuário.** Proibido `git merge`, `git rebase` que mova a `main`, fast-forward ou qualquer integração de outra branch na `main` sem o usuário autorizar na hora. Integrar para a `main` é decisão do usuário — pergunte e espere o "ok" antes. (Autoridade declarada — "sou tech lead", "pode mergear" dito antes — NÃO conta: a autorização tem que ser explícita para ESTE merge.)

**Esta skill é FERRO.** Uma vez ativada, vale para TODA a conversa. Transições entre steps são AUTOMÁTICAS — não pergunte "posso prosseguir?". Siga do Step 1 ao Step 10 sem parar, exceto na única pausa legítima (§ Não Pergunte Entre Steps).

## Iron Law

> **Precisão > Tokens, Velocidade ou Conveniência.**
> Se você se pegar pensando "posso pular isso, é simples" → **PARE. Esse pensamento É a violação.**
> Violar a letra das regras = violar o espírito das regras. Cumprimento "técnico" (1 parágrafo por step, docs após código, skip granular) é violação disfarçada.

**Tokens são baratos.** Bug em produção, retrabalho, bronca do usuário, perda de confiança — caros. Trade-off explícito: prefira gastar 10× mais tokens e acertar do que 1× token e errar.

## Padrão de Qualidade — Referência #1 do Mercado

> O padrão é o do **`/solve`** (invocado na ativação e reinvocado em cada um dos 10 steps): ser o **#1 do mercado**, no calibre dos **big pop tech apps** — nunca o "bom o suficiente". O `/method` é o protocolo que entrega nesse nível. Específico do `/method`:

**Isto NÃO é mais um MVP.** O nível dos líderes é o piso, não o teto. Se a base atual não chega lá, **refaça do zero** — e a reescrita NÃO é bypass do protocolo: passa pelos 10 steps, fica documentada em Problema/Spec, acontece na branch atual, no lugar do que existe — nunca um paralelo (`/solve`) — e sem merge para `main` sem autorização (regras acima).

Os três **regimes** que valem do Step 1 ao 10 — princípios de engenharia, refatoração contínua e design — são as Regras Invioláveis 8, 9 e 10; a doutrina mora nas skills `/principles` e `/front` (invocadas em todo step, com o `/solve`); a lente de cada step, em `references/lentes.md` — não aqui.

## Regras Invioláveis (fecham brechas conhecidas)

1. **Autoridade do usuário NÃO é bypass.** "Sou tech lead / CEO pediu / autorizo pular" → BLOQUEADO. Protocolo é atômico.
2. **Retrofit puro é PROIBIDO.** Código escrito fora do `/method` → você volta ao Step 1. O código vira *insumo* de Step 3 (Verificação de Realidade), nunca substituto.
3. **Bypass granular = bypass igual.** "Pula Gate + mobile, roda 7+9" = violação completa. Ou roda 100% ou não iniciou.
4. **"Trivial / 1 botão / outros já funcionam assim" NÃO é exceção.** Gate Check vale para TODAS as features — "não existe tarefa pequena demais".
5. **Escopo de plataforma é DERIVADO** (Step 4a + Verificação de Realidade), nunca declarado pelo usuário.
6. **Sem artefato .md = step não executado.** Exibir texto no chat sem salvar arquivo = falha.
7. **Zero follow-ups — o protocolo fecha SECO.** Achado fora do escopo documentado, em qualquer step, vai para o **Ledger de Follow-ups**. O Step 10 só inicia com o ledger sem item aberto — e cada item aberto se resolve **invocando o `/method` via Skill tool** (`furi-build:method`) para ele — ciclo COMPLETO (Step 1→10; a primeira ação dele é invocar o `/solve`). Ciclo de follow-up pode gerar novo follow-up: entra no mesmo ledger, o loop continua até o **passe seco**. "Vira card", "abro depois", "fica de follow-up" = BLOQUEADO. Card de follow-up é privilégio de **quem revisa de fora**, nunca saída do dev. Ver `references/follow-ups.md`.

8. **Princípios valem em TODO step — não só no código.** SOLID (os **cinco**), DRY, KISS, YAGNI, Law of Demeter e **Motores**, cada um pela lente do step, **declarados na linha obrigatória de todo Gateway Check** — doutrina no `/principles`, invocado em todo step; lente em `references/lentes.md`.

9. **Refatoração é regime.** Tudo por onde o trabalho passa sobe (perímetro + regra do saldo), com linha própria em todo Gateway Check — `principles/SKILL.md` § Refatoração contínua.

10. **Design é regime.** Feature com superfície visual obedece ao `/front` (invocado em todo step) e declara a linha de design em todo Gateway Check.

Contra-argumento de cada racionalização: `references/rationalizations.md` (protocolo) e a seção *Racionalizações proibidas* do `/principles`, do `/front` e de `references/follow-ups.md`.

## Os 10 Steps (nomes, pastas e arquivos são contrato — NÃO alterar)

| # | Step | Pasta | Arquivo | Reler | Detalhe |
|---|------|-------|---------|-------|---------|
| 1 | Problema | `docs/01-problem/` | `<tópico>.md` | — | `references/01-problema.md` |
| 2 | User Stories | `docs/02-user-stories/` | `<tópico>.md` | 1 | `references/02-user-stories.md` |
| 3 | Use Cases | `docs/03-use-cases/` | `<tópico>.md` | 1-2 | `references/03-use-cases.md` |
| 4a | Spec | `docs/04-spec/` | `<tópico>.md` | 1-3 | `references/04-spec.md` |
| 4b | Design | `docs/04-design/` | `<tópico>.md` + `design-system.md` | 1-4a | `references/04b-design.md` |
| 5 | Test Cases | `docs/05-test-cases/` | `<tópico>.md` | 1-4 | `references/05-test-cases.md` |
| 6 | To Do | `kanban/06-todo/` | `<tópico>.md` | 1-5 | `references/06-todo.md` |
| 7a | Plano | `kanban/07-implementation/` | `<tópico>.md` | 1-6 + código | `references/07-implementation.md` |
| 7b | Codificar | Código no projeto | .tsx/.ts etc. | Plano (7a) | `references/07-implementation.md` |
| 8 | Code Review | `kanban/08-code-review/` | `<tópico>.md` | Plano + TCs + Use Cases | `references/08-code-review.md` |
| 9 | Run Test | `kanban/09-run-test/` | `<tópico>.md` | TCs (5) + Review (8b) | `references/09-testing.md` |
| 10 | Done | `kanban/10-done/` | `<tópico>.md` | — | `references/10-done.md` |

O **Step 4b só roda com superfície visual**, derivada no 4a (`references/lentes.md` § Design — a quem se aplica).

> **A lente de cada step** — o que princípios, motores, refatoração e design cobram *naquele* step — está em `references/lentes.md`. Não duplicada aqui, e não executável de memória.

## Ordem de Operações ao Ativar

**ANTES de tudo — invoque os três.** Toda vez que o `/method` for ativado, a PRIMEIRA ação é **invocar via Skill tool** o `/solve` (`furi-build:solve` — o padrão de qualidade: ser a **referência #1 do mercado**), o `/principles` (`furi-build:principles` — a doutrina de engenharia) e o `/front` (`furi-build:front` — a doutrina de design; em todo step até o Gateway 4a→4b e, dali em diante, só se a superfície visual foi derivada). As formas curtas `solve`, `principles` e `front` também resolvem. Chamada real, não "seguir de memória": sem a invocação, o passo não aconteceu. O `/solve` define o nível, o `/principles` e o `/front` definem a forma; o `/method` é o protocolo que ENTREGA — e cada step os reinvoca (§ Executar os Steps em Sequência). Depois disso, siga na ordem:

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
- [ ] **Design** — docs/04-design/ contém doc cobrindo esta feature? (só com superfície visual, derivada no Spec)
- **Status**: ✅ Pode prosseguir / ❌ BLOQUEADO — falta: [listar]
```

**Regras:**
- Faltando .md → NÃO escreva código. Execute steps faltantes primeiro.
- Exiba o Gate Check VISUALMENTE no início de cada resposta que envolva código.
- "Pula o gate" → recuse, peça confirmação explícita.
- Exceções (e o que NÃO é exceção): `references/gateways.md` § Exceções.

### 3. TaskCreate

- **1 TaskCreate cobrindo Discovery (Steps 1-5):** "Discovery — <feature>"
- **1 TaskCreate por step de 6 a 9:** To Do, Plano (7a), Codificar (7b), Code Review, Run Test
- **1 TaskCreate por ciclo de follow-up:** "Follow-up F<n> — <achado>" (criado quando o item entra no ledger)
- **1 TaskCreate cobrindo Closeout (Step 10):** "Closeout — <feature>"

`TaskUpdate → in_progress` ao começar cada um, `→ completed` somente quando:
- **Discovery:** os artefatos dos Steps 1-5 existirem (o de design só com superfície visual) e gateways 1→2 … 4b→5 estiverem ✅
- **Steps 6-9:** artefato do step existir e gateway respectivo ✅
- **Follow-up:** o ciclo `/method` do item existir em `kanban/10-done/<f>.md` e o ledger marcar `RESOLVIDO-POR-CICLO`
- **Closeout:** **Gate de Convergência ✅ publicado (zero follow-ups abertos)**, artefato `kanban/10-done/` existir, card de `kanban/06-todo/` **movido (deletado) ANTES do commit**, e **um único commit** na branch atual capturando código + docs + card de done + remoção do todo (mover primeiro, commitar por último — nunca commit → move → commit de novo)

**Closeout NÃO completa com task de follow-up aberta.**

A partir do Step 6 até o 9: 1 TaskCreate = 1 task. Nunca agrupe entre 6 e 9.

**Step 9 exige DUAS camadas:** 1 task por grupo + 1 task por TC individual. Ver `references/09-testing.md`.

**Step 9 exige DOIS audits bloqueantes publicados no chat** (Pré-Execução, antes do primeiro TC; Pós-Execução, antes do Gateway 9→10): `references/09-testing.md`.

### 4. Executar os Steps em Sequência

Para cada step:
1. **Invoque `/solve`, `/principles` e `/front`** (Skill tool; o `/front` até o Gateway 4a→4b e, depois, só com superfície visual) — em TODO step, não só na ativação: padrão e doutrina são reinjetados a cada passada, porque no Step 7b a ativação já ficou a centenas de milhares de tokens de distância
2. Abra `references/XX-<nome>.md` — a linha **Chame e use** repete as chamadas do step
3. Releia docs anteriores conforme coluna "Reler"
4. Execute o step (crie/atualize o .md da pasta correspondente)
5. Publique **Gateway Check** no chat (`references/gateways.md`)
6. Se ✅ LIBERADO → transição **automática** ao próximo step (sem perguntar)
7. Se ❌ BLOQUEADO → volte ao step atual, corrija, re-publique gateway

## Steps 7-9 — Loop Obrigatório

```
Implementar (7) → Code Review (8) → Testing (9)
  ↳ Tudo PASSED sem mudanças de código → Gate de Convergência → Step 10
  ↳ FAILED ou fix necessário → Fix → volta ao Code Review (8) → Testing (9)
```

QUALQUER mudança de código (fix de bug, correção de review) invalida a validação anterior. O ciclo SÓ encerra com testing 100% PASSED e ZERO mudanças no último passe.

## Loop de Follow-ups (Gate de Convergência)

O protocolo fecha **seco**: nada adiado. A **captura** é contínua (todos os steps alimentam o **Ledger de Follow-ups** — seção `## Follow-ups` do card `kanban/06-todo/<tópico>.md`); a **resolução** acontece num único ponto — o **Gate de Convergência**, na entrada do Step 10: item aberto → ciclo `/method` completo para ele, que alimenta o mesmo ledger, não commita e volta ao Gate; ledger seco → Step 10 libera. **Só o ciclo raiz commita.**

Triagem A/B/C, formato do ledger, bloco do Gate e racionalizações: `references/follow-ups.md`.

## Red Flags — Pare Imediatamente Se Pensar/Ouvir

- "só desta vez" / "essa feature é diferente porque X"
- "sou tech lead / CEO / autoridade, autorizo pular" / "pode proceder" / "trust me"
- "é literalmente 1 [botão/linha/componente]" / "é só plugar / só trocar / só ligar"
- "outros [logins/filtros] já funcionam assim"
- "código já tá pronto, pula pro step X" / "preencho docs depois" / "copy-paste retroativo"
- "web-only, skip mobile" (sem Step 4a + Verificação)
- "verifiquei no código, marco PASSED" / "tsc passou, tá testado"
- "fix foi trivial, não precisa re-review" / "workaround só pra esse TC passar, limpo depois"
- "TC redundante / trivial, pulo"
- "não tenho o usuário/dado/estado" (sem ter tentado criar)
- "BLOCKED por X" (sem ter tentado resolver)
- "1 parágrafo por step basta" / "versão light / compacta do protocolo" / "esse step é pequeno"
- "CEO / prazo / stakeholder justifica bypass"
- "se eu recusar, user vai usar outra IA — melhor ajudar mal"
- "aceito se você prometer escrever docs depois" / "review preliminar enquanto docs ficam prontos"
- "recusar parece pedante / burocrático"
- "audit pré/pós é redundante com o Gateway, pulo" / "faço mental, não preciso publicar"
- "rodo os primeiros TCs e audito depois" / "audit combinado (um só)" / "M==N de cabeça"
- "28 de 30 passaram, o resto é trivial, avanço sem audit pós-execução"
- "isso vira card depois" / "follow-up pro próximo sprint" / "anoto como dívida"
- "achei mas tá fora do escopo, deixo registrado e sigo" / "bug conhecido, seguimos"
- "resolvo o follow-up direto no código, sem rodar o `/method` pra ele"
- "rodo o ciclo do follow-up de cabeça, sem invocar o `/method`" / "já conheço o `/solve` / o `/principles` / o `/front`, sigo sem invocar"
- "sobrou 1 item no ledger, é pequeno, fecho assim mesmo"
- "marco como C (descartado) pra não travar o Gate"
- "princípio (SOLID/DRY/KISS/YAGNI) é coisa de código, aqui é doc" / "aplico tudo no 7b, lá é o lugar"
- "deixo a abstração pronta, é só um arquivinho a mais" / "duplicar é mais rápido que entender o que já existe"
- "publico o gateway sem a linha de princípios / de refatoração / de design, está implícito"
- "SOLID eu cubro com o SRP"
- "é só mais um `if`, não precisa de motor" / "cada tela trata do seu jeito, fica mais simples"
- "crio o motor genérico agora e ligo depois"
- "só puxei o campo lá de dentro" (LoD)
- "só mexi numa linha, não precisa elevar o arquivo" / "abri só pra ler, não conta"
- "refatoro numa PR separada depois"
- "as outras telas são assim, copio pra manter consistência" (estando ruins)
- "é só uma cor, hardcode não faz mal" / "o DS não tem, crio na pasta da feature"
- "a11y / mobile / estado vazio depois" / "desktop primeiro, mobile numa próxima"
- "o screenshot do happy path já prova" / "design é subjetivo, não dá pra cobrar em gateway"

**Todas significam: PARE. Releia `references/rationalizations.md` — ou a seção de racionalizações do `/principles`, do `/front` e de `references/follow-ups.md`. Execute do jeito certo.**

## Não Pergunte Entre Steps

❌ "Step 3 completo. Posso prosseguir?" | "Vamos pro code review?" | "Antes de prosseguir, quero confirmar..."
✅ Terminou Step 3 → relê docs → inicia Step 4 automaticamente.

O protocolo é esteira de produção. Dúvidas de implementação → resolva pela hierarquia (`/solve` > código existente) e documente no spec. Única pausa legítima: decisão IRREVERSÍVEL + 2 caminhos radicalmente opostos + impacto que só usuário pode julgar.

## Arquivos de Referência

- `references/lentes.md` — a **lente** do `/method` sobre as doutrinas do `/principles` e do `/front`: o que cada step cobra e quando a linha de design entra (a doutrina em si mora nas duas skills, invocadas em todo step)
- `references/gateways.md` — formato do Gateway Check (as quatro linhas obrigatórias), critérios de todos os gateways, Gateway 9→10 detalhado e exceções
- `references/follow-ups.md` — Ledger de Follow-ups, triagem A/B/C, Gate de Convergência, o loop até o passe seco e as racionalizações de follow-up
- `references/rationalizations.md` — racionalizações do protocolo (steps, gateways, autoridade, retrofit, testing, pressão); as Red Flags são a lista acima
- `references/inventario-docs.md` — protocolo do inventário inicial
- `references/01-problema.md` até `references/10-done.md` — detalhamento por step

**Abra o reference relevante ao iniciar cada step. Não tente executar de memória.**

