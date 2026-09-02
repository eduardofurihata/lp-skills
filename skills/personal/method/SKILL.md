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

### Princípios de engenharia — regime, não fase

Os princípios (**SOLID** — SRP, OCP, LSP, ISP, DIP —, **DRY, KISS, YAGNI, Law of Demeter** e **Motores**) são **inegociáveis e valem do Step 1 ao Step 10** — não só no código. Fonte única, com a **lente de cada step** e as racionalizações proibidas: **`references/principios.md`** (não duplicados aqui — DRY vale para o protocolo também).

- **SOLID são cinco, não um.** Declarar só o SRP deixa OCP, LSP, ISP e DIP fora — e o que não é nomeado nunca é revisado.
- **Motores:** toda capacidade tem **um** dono. Regra espalhada por telas é defeito, não estilo; achou pedaço solto → **absorve**.
- **Todo Gateway Check publica a linha de princípios** (`- **Princípios (SOLID · DRY · KISS · YAGNI · LoD · Motores):** ✅ aplicados — <o que a lente deste step cobrou>`). Sem a linha, o gateway não foi publicado — mesma régua da linha de follow-ups.
- **KISS/YAGNI matam a complexidade *desnecessária*; a *necessária* para o nível #1 continua sendo requisito.** YAGNI nunca é desculpa para entregar menos que o UC pede nem para descartar achado real (isso é balde B).
- Cobrar só no 7b é tarde: a complexidade especulativa nasce no **Spec (4)** e no **Plano (7a)** e chega no código como fato consumado.

### Refatoração contínua — a cada passada o código sobe

Refatorar não é step nem pedido: é o padrão em **tudo por onde o trabalho passa**. O **perímetro** é o arquivo editado, o aberto só para entender, o dependente que o grep revelou e o caminho que o fluxo atravessa. **Dentro dele, refatore bastante**; fora, é balde C.

- **Regra do saldo:** nenhum arquivo do perímetro sai no nível em que entrou — ou subiu, ou você **declara** que já estava no nível #1.
- **Todo Gateway Check publica a linha de refatoração** (`- **Refatoração (tudo por onde passou):** ✅ <N> elevados — <o que subiu>`). Nos Steps 1-6 ela é sobre o **artefato** (doc consolidado, story separada, UC quebrado), e nunca é vazia.
- Detalhe: `references/principios.md` § Refatoração contínua e `references/07-implementation.md`.

### Design — regime, não fase

Feature com **superfície visual** (derivada no Step 4, nunca declarada pelo usuário) obedece a **`references/design.md`**: tokens como fonte única, atomicidade, composição > configuração, headless, todos os estados, Lei de Jakob, consistência semântica, preservação de contexto, fluxos modulares — e **WCAG AA como piso**.

- **O design system evolui com o produto:** precisou de algo que ele não tem → **reusar → compor → promover** (criar no DS, nunca na pasta da feature), registrando em `docs/04-spec/design-system.md`.
- **Consistência é lei; mediocridade não é.** Padrão existente abaixo do nível #1 **não se copia** — eleva-se ou vira achado no ledger. É essa a diferença entre UI consistente e UI que nunca melhora.
- **Gateway de feature com UI publica a linha de design** (`- **Design (tokens · atomicidade · composição · estados · a11y):** ✅ …`). Sem superfície visual: declare `❌ N/A` **uma vez**, no Gateway 4→5.

Auto-check em cada gateway: *"Um líder do domínio assinaria isto — e assinaria esta tela?"* Se não → não está pronto.

**PARE se pensar:** "é só um MVP" · "depois a gente melhora" · "tá bom o suficiente" · "deixa o legado como está pra não refazer".

## Regras Invioláveis (fecham brechas conhecidas)

1. **Autoridade do usuário NÃO é bypass.** "Sou tech lead / CEO pediu / autorizo pular" → BLOQUEADO. Protocolo é atômico.
2. **Retrofit puro é PROIBIDO.** Código escrito fora do `/method` → você volta ao Step 1. O código vira *insumo* de Step 3 (Verificação de Realidade), nunca substituto.
3. **Bypass granular = bypass igual.** "Pula Gate + mobile, roda 7+9" = violação completa. Ou roda 100% ou não iniciou.
4. **"Trivial / 1 botão / outros já funcionam assim" NÃO é exceção.** Gate Check vale para TODAS as features — "não existe tarefa pequena demais".
5. **Escopo de plataforma é DERIVADO** (Step 4 + Verificação de Realidade), nunca declarado pelo usuário.
6. **Sem artefato .md = step não executado.** Exibir texto no chat sem salvar arquivo = falha.
7. **Zero follow-ups — o protocolo fecha SECO.** Achado fora do escopo documentado, em qualquer step, vai para o **Ledger de Follow-ups**. O Step 10 só inicia com o ledger sem item aberto — e cada item aberto se resolve rodando o **`/method` COMPLETO (Step 1→10, com `/solve`)** para ele. Ciclo de follow-up pode gerar novo follow-up: entra no mesmo ledger, o loop continua até o **passe seco**. "Vira card", "abro depois", "fica de follow-up" = BLOQUEADO. Card de follow-up é privilégio do **reviewer** (`/homolog` e `/prod`, via `prod/references/findings.md`), nunca saída do dev. Ver `references/follow-ups.md`.

8. **Princípios valem em TODO step — não só no código.** SOLID (os **cinco**: SRP, OCP, LSP, ISP, DIP), DRY, KISS, YAGNI, Law of Demeter e **Motores** são cobrados do Step 1 ao 10, cada um pela lente do step (`references/principios.md`), e **declarados na linha obrigatória de todo Gateway Check**. "Princípio é coisa de código", "aplico tudo no 7b", "SOLID eu cubro com o SRP", "está implícito" = BLOQUEADO.

9. **Refatoração é regime.** A cada passada, o código do **perímetro** sobe (regra do saldo). Linha própria em todo Gateway Check; sem ela, o gateway não foi publicado. "Só mexi numa linha", "abri só pra ler", "refatoro numa PR separada depois" = BLOQUEADO.

10. **Design é regime, e o DS evolui com o produto.** Feature com superfície visual obedece a `references/design.md`, declara a linha de design em todo gateway e **promove ao DS** o que não couber em reúso ou composição. "Copio a tela existente por consistência" (estando ruim), "a11y/mobile/estado vazio depois", "hardcodei a cor, é só uma" = BLOQUEADO.

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

> **A lente de cada step** — o que princípios, motores, refatoração e design cobram *naquele* step — está em `references/principios.md` § Lente por step e `references/design.md` § Lente por step. Não duplicada aqui, e não executável de memória.

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
- **1 TaskCreate por ciclo de follow-up:** "Follow-up F<n> — <achado>" (criado quando o item entra no ledger)
- **1 TaskCreate cobrindo Closeout (Step 10):** "Closeout — <feature>"

`TaskUpdate → in_progress` ao começar cada um, `→ completed` somente quando:
- **Discovery:** os 5 artefatos existirem e gateways 1→2…4→5 estiverem ✅
- **Steps 6-9:** artefato do step existir e gateway respectivo ✅
- **Follow-up:** o ciclo `/method` do item existir em `kanban/10-done/<f>.md` e o ledger marcar `RESOLVIDO-POR-CICLO`
- **Closeout:** **Gate de Convergência ✅ publicado (zero follow-ups abertos)**, artefato `kanban/10-done/` existir, card de `kanban/06-todo/` **movido (deletado) ANTES do commit**, e **um único commit** na branch atual capturando código + docs + card de done + remoção do todo (mover primeiro, commitar por último — nunca commit → move → commit de novo)

**Closeout NÃO completa com task de follow-up aberta.**

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
  ↳ Tudo PASSED sem mudanças de código → Gate de Convergência → Step 10
  ↳ FAILED ou fix necessário → Fix → volta ao Code Review (8) → Testing (9)
```

QUALQUER mudança de código (fix de bug, correção de review) invalida a validação anterior. O ciclo SÓ encerra com testing 100% PASSED e ZERO mudanças no último passe.

## Loop de Follow-ups (Gate de Convergência)

O protocolo fecha **seco**: nada adiado. A **captura** é contínua (todos os steps alimentam o **Ledger de Follow-ups** — seção `## Follow-ups` do card `kanban/06-todo/<tópico>.md`); a **resolução** acontece num único ponto — a **entrada do Step 10**, antes de mover o card e antes do commit.

```
Step 9 ✅ → GATE DE CONVERGÊNCIA (entrada do Step 10)
  ↳ Ledger com item ABERTO → /method COMPLETO (1→10, com /solve) para o item
                             ↳ o ciclo alimenta o MESMO ledger
                             ↳ ciclo aninhado NÃO commita
                             ↳ volta ao Gate
  ↳ Ledger SECO (zero abertos E zero novos no último passe) → Step 10 libera
```

**Triagem** de cada achado (é o que faz o loop convergir): **A** = defeito dentro do escopo documentado → corrige agora, no step; **B** = escopo novo que este trabalho criou/tocou/expôs → ciclo `/method` próprio; **C** = pré-existente e não tocado → `DESCARTADO` no ledger com justificativa. Na dúvida entre B e C → **B**.

**Só o ciclo raiz commita** — um único commit no fim, cobrindo a feature + todos os ciclos de follow-up.

Formato do ledger, Gate de Convergência, triagem detalhada e racionalizações: `references/follow-ups.md`.

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
- "isso vira card depois" / "follow-up pro próximo sprint" / "anoto como dívida"
- "achei mas tá fora do escopo, deixo registrado e sigo"
- "resolvo o follow-up direto no código, sem rodar o `/method` pra ele"
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
- "a11y / mobile / estado vazio depois"
- "o screenshot do happy path já prova" / "design é subjetivo, não dá pra cobrar em gateway"

**Todas significam: PARE. Releia `references/rationalizations.md`. Execute do jeito certo.**

## Não Pergunte Entre Steps

❌ "Step 3 completo. Posso prosseguir?" | "Vamos pro code review?" | "Antes de prosseguir, quero confirmar..."
✅ Terminou Step 3 → relê docs → inicia Step 4 automaticamente.

O protocolo é esteira de produção. Dúvidas de implementação → resolva pela hierarquia (padrão do projeto > big apps > boas práticas) e documente no spec. Única pausa legítima: decisão IRREVERSÍVEL + 2 caminhos radicalmente opostos + impacto que só usuário pode julgar.

## Arquivos de Referência

- `references/principios.md` — **fonte única** dos princípios (SOLID completo, DRY, KISS, YAGNI, LoD, **Motores**), **refatoração contínua**, lente por step, linhas obrigatórias do gateway e racionalizações
- `references/design.md` — **fonte única** do design (tokens SSOT, atomicidade, composição, headless, estados, Jakob, a11y), **evolução do design system**, lente por step e racionalizações
- `references/rationalizations.md` — tabela única consolidada de todas as racionalizações proibidas + Red Flags completo
- `references/gateways.md` — todos os critérios de gateway + Gateway 9→10 detalhado
- `references/follow-ups.md` — Ledger de Follow-ups, triagem A/B/C, Gate de Convergência e o loop até o passe seco
- `references/inventario-docs.md` — protocolo do inventário inicial
- `references/01-problema.md` até `references/10-done.md` — detalhamento por step

**Abra o reference relevante ao iniciar cada step. Não tente executar de memória.**

