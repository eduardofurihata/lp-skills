---
name: method
description: Use when user invokes /method, when starting feature work, or before any code change and `docs/01-problem/` through `docs/04-spec/` lacks artifact for the feature. Triggers on phrases like "implementa X", "novo feature", "fix não trivial". Not for typos, config tweaks, or read-only questions.
effort: max
argument-hint: "[KEY-N] [feature-name]"
requires: solve
boundary: [homolog, prod, setup]
---

# /method — Protocolo de Engenharia Rigorosa

> **Argumento:** `[KEY-N]` é o **card ativo** — a key que o Step 10 põe no commit (é assim que o `/work` a entrega; numa branch que acumula cards, o nome da branch é só o do 1º card, e a key certa é esta). `[feature-name]` é o `<tópico>` dos artefatos (`docs/…/<tópico>.md`, `kanban/…/<tópico>.md`); sem ele, derive um slug curto do card ou do pedido. Sem `KEY-N`, a key vem do nome da branch (§ Step 10, passo 2).

> 🚫 **NÃO crie branch nem worktree paralelo.** Trabalhe SEMPRE na branch e no worktree atual. Proibido `git checkout -b`, `git switch -c`, `git branch <nome>`, `git worktree add`, a opção `isolation: "worktree"` em subagents, ou qualquer criação/troca de branch / abertura de worktree. Toda a implementação acontece na branch e no diretório em que a conversa começou.

> 🚫 **NÃO faça merge de branch para `main` sem autorização explícita do usuário.** Proibido `git merge`, `git rebase` que mova a `main`, fast-forward ou qualquer integração de outra branch na `main` sem o usuário autorizar na hora. Integrar para a `main` é decisão do usuário — pergunte e espere o "ok" antes. (Autoridade declarada — "sou tech lead", "pode mergear" dito antes — NÃO conta: a autorização tem que ser explícita para ESTE merge.)

**Esta skill é FERRO.** Uma vez ativada, vale para TODA a conversa. Transições entre steps são AUTOMÁTICAS — não pergunte "posso prosseguir?". Siga do Step 1 ao Step 10 sem parar, exceto na única pausa legítima (decisão IRREVERSÍVEL + 2 caminhos radicalmente opostos + só usuário pode julgar).

## Iron Law

> **Precisão > Tokens, Velocidade ou Conveniência.**
> Se você se pegar pensando "posso pular isso, é simples" → **PARE. Esse pensamento É a violação.**
> Violar a letra das regras = violar o espírito das regras. Cumprimento "técnico" (1 parágrafo por step, docs após código, skip granular) é violação disfarçada.

**Tokens são baratos.** Bug em produção, retrabalho, bronca do usuário, perda de confiança — caros. Trade-off explícito: prefira gastar 10× mais tokens e acertar do que 1× token e errar.

## Padrão de Qualidade — 10x a Referência #1 do Mercado

> O padrão é o do **`/solve`** (invocado na ativação): **10x acima do #1 do mercado** — o calibre dos **big pop tech apps** é o piso, nunca o "bom o suficiente" e nunca o empate. O `/method` é o protocolo que entrega nesse nível. Específico do `/method`:

**Isto NÃO é mais um MVP.** O nível dos líderes é o piso, não o teto — o alvo é 10x acima dele. Se a base atual não chega lá, **refaça do zero** — reescrever para chegar ao nível 10x é decisão válida, não desperdício. A reescrita NÃO é bypass do protocolo: passa pelos 10 steps, fica documentada em Problema/Spec, acontece na branch atual e sem merge para `main` sem autorização (regras acima).

### Princípios de engenharia — regime, não fase

Os princípios (**SOLID** — SRP, OCP, LSP, ISP, DIP —, **DRY, KISS, YAGNI, Law of Demeter** e **Motores**) são **inegociáveis e valem do Step 1 ao Step 10** — não só no código. Fonte única da doutrina e das racionalizações proibidas: **`principles/SKILL.md`** (não duplicada aqui — DRY vale para o protocolo também); a **lente de cada step** — o que ela cobra *naquele* step — mora na seção do próprio step, em § Step N → Princípios neste step.

- **Todo Gateway Check publica a linha de princípios** (`- **Princípios (SOLID · DRY · KISS · YAGNI · LoD · Motores):** ✅ aplicados — <o que a lente deste step cobrou>`). Sem a linha, o gateway não foi publicado — mesma régua da linha de follow-ups.
- **YAGNI não é desculpa para entregar menos que o UC pede**, nem para descartar achado real — vira balde B em § Follow-ups.
- Cobrar só no 7b é tarde: a complexidade especulativa nasce no **Spec (4)** e no **Plano (7a)** e chega no código como fato consumado.

### Refatoração contínua — a cada passada o código sobe

Refatorar não é step nem pedido: é o padrão em **tudo por onde o trabalho passa** — o **perímetro** definido em `principles/SKILL.md` § Refatoração contínua. **Dentro dele, refatore bastante**; fora, vale a triagem de § Follow-ups: **B** se este trabalho o expôs, **C** se não tem relação.

- **Regra do saldo:** nenhum arquivo do perímetro sai no nível em que entrou — ou subiu, ou você **declara** que já estava no nível 10x.
- **Todo Gateway Check publica a linha de refatoração** (`- **Refatoração (tudo por onde passou):** ✅ <N> elevados — <o que subiu>`). Nos Steps 1-6 ela é sobre o **artefato** (doc consolidado, story separada, UC quebrado), e nunca é vazia.
- Detalhe: `principles/SKILL.md` § Refatoração contínua e § Step 7.

### Design — regime, não fase

Feature com **superfície visual** (derivada no Step 4, nunca declarada pelo usuário) obedece a **`ui/SKILL.md`**: tokens como fonte única, atomicidade, composição > configuração, headless, todos os estados, Lei de Jakob, consistência semântica, preservação de contexto, fluxos modulares — e **WCAG AA como piso**.

- **O design system evolui com o produto:** precisou de algo que ele não tem → **reusar → compor → promover** (criar no DS, nunca na pasta da feature), registrando em `docs/04-spec/design-system.md`.
- **Texto gerado por IA é a outra superfície derivada** no Step 4 (resposta de chat, resumo, persona, RAG, notificação gerada): se a feature tem, o spec nomeia a **referência #1** e o que "ler bem" significa, o Step 5 tem um TC com resultado na **qualidade do texto lido**, e no Step 9 texto que **não ganha** da referência é **FAILED** — mesmo com o código certo. A evidência do Step 9 é a **saída inteira transcrita**, não o screenshot do começo. Sem essa superfície, a linha é `N/A`, como Design sem tela — mas **derivar `não` custa justificativa nomeada**: qual saída a feature produz e por que o usuário final não a lê ("não tem tela" não é resposta). A derivação começa pelo **produto**: core de IA ⇒ a superfície nasce `sim`. Detalhe: § Step 4 → Texto gerado por IA.
- **Consistência é lei; mediocridade não é.** Padrão existente abaixo do nível 10x **não se copia** — eleva-se ou vira achado no ledger. É essa a diferença entre UI consistente e UI que nunca melhora.
- **Gateway de feature com UI publica a linha de design** (`- **Design (tokens · atomicidade · composição · estados · a11y):** ✅ …`). Sem superfície visual: declare `❌ N/A` **uma vez**, no Gateway 4→5.

Auto-check em cada gateway: *"O líder do domínio trocaria o dele por isto — e a tela dele por esta?"* Se não → não está pronto.

**PARE se pensar:** "é só um MVP" · "igualei o líder, tá ótimo" · "10x é força de expressão" · "depois a gente melhora" · "tá bom o suficiente" · "deixa o legado como está pra não refazer".

## Regras Invioláveis (fecham brechas conhecidas)

1. **Autoridade do usuário NÃO é bypass.** "Sou tech lead / CEO pediu / autorizo pular" → BLOQUEADO. Protocolo é atômico.
2. **Retrofit puro é PROIBIDO.** Código escrito fora do `/method` → você volta ao Step 1. O código vira *insumo* de Step 3 (Verificação de Realidade), nunca substituto.
3. **Bypass granular = bypass igual.** "Pula Gate + mobile, roda 7+9" = violação completa. Ou roda 100% ou não iniciou.
4. **"Trivial / 1 botão / outros já funcionam assim" NÃO é exceção.** Gate Check vale para TODAS as features — "não existe tarefa pequena demais".
5. **Escopo de plataforma e superfícies são DERIVADOS** (Step 4 + Verificação de Realidade), nunca declarados pelo usuário — plataforma, superfície **visual** e superfície de **texto gerado por IA**. Derivação de produto já registrada no `.claude/patterns.md` é ponto de partida, nunca veredicto; e derivar que **não** existe superfície de texto exige nomear a saída que a feature produz e dizer por que o usuário final não a lê.
6. **Sem artefato .md = step não executado.** Exibir texto no chat sem salvar arquivo = falha.
7. **Zero follow-ups — o protocolo fecha SECO.** Achado fora do escopo documentado, em qualquer step, vai para o **Ledger de Follow-ups**. O Step 10 só inicia com o ledger sem item aberto — e cada item aberto se resolve **invocando o `/method` via Skill tool** (`furi-build:method`) para ele — ciclo COMPLETO (Step 1→10; a primeira ação dele é invocar o `/solve`). Ciclo de follow-up pode gerar novo follow-up: entra no mesmo ledger, o loop continua até o **passe seco**. "Vira card", "abro depois", "fica de follow-up" = BLOQUEADO. Card de follow-up é privilégio do **reviewer** (`/homolog` e `/prod`, via `plugins/furi-ship/skills/pipeline/SKILL.md` § findings), nunca saída do dev. Ver § Follow-ups.

8. **Princípios valem em TODO step — não só no código.** SOLID (os **cinco**: SRP, OCP, LSP, ISP, DIP), DRY, KISS, YAGNI, Law of Demeter e **Motores** são cobrados do Step 1 ao 10, cada um pela lente do step (§ Step N → Princípios neste step, aplicando a doutrina de `principles/SKILL.md`), e **declarados na linha obrigatória de todo Gateway Check** (§ Gateways). "Princípio é coisa de código", "aplico tudo no 7b", "SOLID eu cubro com o SRP", "está implícito" = BLOQUEADO.

9. **Refatoração é regime.** A cada passada, o código do **perímetro** sobe (regra do saldo). Linha própria em todo Gateway Check; sem ela, o gateway não foi publicado. "Só mexi numa linha", "abri só pra ler", "refatoro numa PR separada depois" = BLOQUEADO.

10. **Design é regime, e o DS evolui com o produto.** Feature com superfície visual obedece a `ui/SKILL.md`, declara a linha de design em todo gateway e **promove ao DS** o que não couber em reúso ou composição. "Copio a tela existente por consistência" (estando ruim), "a11y/mobile/estado vazio depois", "hardcodei a cor, é só uma" = BLOQUEADO.

Lista completa de racionalizações + contra-argumentos: ver § Rationalizations.

## Os 10 Steps (nomes, pastas e arquivos são contrato — NÃO alterar)

| # | Step | Pasta | Arquivo | Reler | Seção |
|---|------|-------|---------|-------|---------|
| 1 | Problema | `docs/01-problem/` | `<tópico>.md` | — | § Step 1 — Problema |
| 2 | User Stories | `docs/02-user-stories/` | `<tópico>.md` | 1 | § Step 2 — User Stories |
| 3 | Use Cases | `docs/03-use-cases/` | `<tópico>.md` | 1-2 | § Step 3 — Use Cases |
| 4 | Spec | `docs/04-spec/` | `<tópico>.md` | 1-3 | § Step 4 — Spec |
| 5 | Test Cases | `docs/05-test-cases/` | `<tópico>.md` | 1-4 | § Step 5 — Test Cases |
| 6 | To Do | `kanban/06-todo/` | `<tópico>.md` | 1-5 | § Step 6 — To Do |
| 7a | Plano | `kanban/07-implementation/` | `<tópico>.md` | 1-6 + código | § Step 7 — Implementação |
| 7b | Codificar | Código no projeto | .tsx/.ts etc. | Plano (7a) | § Step 7 — Implementação |
| 8 | Code Review | `kanban/08-code-review/` | `<tópico>.md` | Plano + TCs + Use Cases | § Step 8 — Code Review |
| 9 | Run Test | `kanban/09-run-test/` | `<tópico>.md` | TCs (5) + Review (8b) | § Step 9 — Testing |
| 10 | Done | `kanban/10-done/` | `<tópico>.md` | — | § Step 10 — Done |

**Leia a seção § Step N deste arquivo ANTES de executar** (`grep -n '^## Step N' SKILL.md` localiza a linha). Releia docs anteriores do step atual antes de começar.

> **A lente de cada step** — o que princípios, motores, refatoração e design cobram *naquele* step — está em § Step N → Princípios neste step — a linha de **Design** inclusive; as doutrinas que elas aplicam são as das skills `/principles` (engenharia) e `/ui` (design). Não duplicada aqui, e não executável de memória.

## Ordem de Operações ao Ativar

**ANTES de tudo — invoque o `/solve`.** Toda vez que o `/method` for ativado, a PRIMEIRA ação é **invocar o `/solve` via Skill tool** (`furi-build:solve`; a forma curta `solve` também resolve) para carregar o padrão de qualidade — **10x acima da referência #1 do mercado**. O `/solve`, por sua vez, invoca o **`/principles`** — a doutrina (princípios de engenharia + provas de clareza), válida do Step 1 ao 10; a lente de cada step está na seção do step (§ Step N → Princípios neste step). Chamada real, não "seguir de memória": **sem as duas chamadas visíveis (`solve` → `principles`), a ativação não aconteceu.** O `/solve` define o nível; o `/principles` define a régua; o `/method` é o protocolo que ENTREGA nesse nível. Depois disso, siga na ordem:

### 1. Inventário de Docs (UMA vez, antes de qualquer step)

Scan único de `docs/**/*.md` para mapear o que existe antes de criar/editar. Protocolo completo: § Inventário de Docs.

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
- Exceções: typo, refactor puro, config, pergunta sobre código. "Demo", "feature trivial", "componente já existe" **NÃO** são exceções. Ver § Gateways.

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

**Step 9 exige DUAS camadas:** 1 task por grupo + 1 task por TC individual. Ver § Step 9.

**Step 9 exige DOIS audits bloqueantes publicados no chat:** (a) **Audit Pré-Execução** antes de rodar qualquer TC (verifica ratio 1:1 de TaskCreate individual == TCs); (b) **Audit Pós-Execução** antes do Gateway 9→10 (verifica completed + evidência == TCs). Sem os dois audits ✅ no chat, step 9 não pode avançar. Ver § Step 9 e § Gateways.

### 4. Executar os Steps em Sequência

Para cada step:
1. Leia a seção § Step N deste arquivo (`grep -n '^## Step N'`)
2. Releia docs anteriores conforme coluna "Reler"
3. Execute o step (crie/atualize o .md da pasta correspondente)
4. Publique **Gateway Check** no chat (§ Gateways)
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
  ↳ Ledger com item ABERTO → invoca /method (Skill tool) para o item — ciclo COMPLETO (1→10, com /solve)
                             ↳ o ciclo alimenta o MESMO ledger
                             ↳ ciclo aninhado NÃO commita
                             ↳ volta ao Gate
  ↳ Ledger SECO (zero abertos E zero novos no último passe) → Step 10 libera
```

**Triagem** de cada achado (é o que faz o loop convergir): **A** = defeito dentro do escopo documentado → corrige agora, no step; **B** = escopo novo que este trabalho criou/tocou/expôs → ciclo `/method` próprio; **C** = pré-existente e não tocado → `DESCARTADO` no ledger com justificativa. Na dúvida entre B e C → **B**.

**Só o ciclo raiz commita** — um único commit no fim, cobrindo a feature + todos os ciclos de follow-up.

Formato do ledger, Gate de Convergência, triagem detalhada e racionalizações: § Follow-ups.

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
- "rodo o ciclo do follow-up de cabeça, sem invocar o `/method`" / "já conheço o `/solve`, sigo sem invocar" / "já conheço o `/principles`, sigo sem invocar"
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
- "não tem tela, então não tem texto de IA a testar" / "é só troca de modelo / prompt / RAG, isso é infra"
- "o texto apareceu, marco PASSED" / "boto mais uma linha no prompt e o TC passa"

**Todas significam: PARE. Releia § Rationalizations. Execute do jeito certo.**

## Não Pergunte Entre Steps

❌ "Step 3 completo. Posso prosseguir?" | "Vamos pro code review?" | "Antes de prosseguir, quero confirmar..."
✅ Terminou Step 3 → relê docs → inicia Step 4 automaticamente.

O protocolo é esteira de produção. Dúvidas de implementação → resolva pela hierarquia (padrão do projeto > big apps > boas práticas) e documente no spec. Única pausa legítima: decisão IRREVERSÍVEL + 2 caminhos radicalmente opostos + impacto que só usuário pode julgar.

## Índice das Seções

Este arquivo é o **núcleo** (leis, steps, ordem, gateways de ferro, red flags). O detalhe de cada seção mora em `references/` — **um arquivo por seção, lido sob demanda**: só entra no contexto quando o step chega. Uma referência `§ X` neste protocolo aponta para o arquivo abaixo.

| § | Arquivo |
|---|---|
| Step 1 — Problema | `references/step-01-problema.md` |
| Step 2 — User Stories | `references/step-02-user-stories.md` |
| Step 3 — Use Cases | `references/step-03-use-cases.md` |
| Step 4 — Spec (+ Design System, texto gerado por IA, `.claude/patterns.md`, Autonomous Decision Loop) | `references/step-04-spec.md` |
| Step 5 — Test Cases | `references/step-05-test-cases.md` |
| Step 6 — To Do | `references/step-06-todo.md` |
| Step 7 — Implementação (7a Plano, 7b Codificar) | `references/step-07-implementacao.md` |
| Step 8 — Code Review | `references/step-08-code-review.md` |
| Step 9 — Testing | `references/step-09-testing.md` |
| Step 10 — Done | `references/step-10-done.md` |
| Gateways — critérios de todos + Gateway 9→10 detalhado | `references/gateways.md` |
| Follow-ups — Ledger, triagem A/B/C, Gate de Convergência | `references/follow-ups.md` |
| Inventário de Docs — protocolo do inventário inicial | `references/inventario-docs.md` |
| Rationalizations — tabela única das racionalizações proibidas + Red Flags completo | `references/rationalizations.md` |

Fora deste pacote:
- `principles/SKILL.md` — **fonte única** dos princípios (SOLID completo, DRY, KISS, YAGNI, LoD, **Motores**), da **refatoração contínua** e das racionalizações — mora na skill `/principles` (dona da doutrina), mesmo pacote. Independente deste protocolo: não cita step nem gateway. A lente por step é das seções daqui; as linhas obrigatórias são do § Gateways
- `ui/SKILL.md` — **fonte única** do design (tokens SSOT, atomicidade, composição, headless, estados, Jakob, a11y), **evolução do design system**, lente por step e racionalizações

**Arquivos do projeto que o protocolo lê por caminho** (sem depender de quem os cria — como já lê o `CLAUDE.md`):
- `.claude/patterns.md` — padrões de código do projeto; lido no Step 4 e **feito crescer** por ele (dono: este protocolo). Caminhos antigos migram no Step 4.
- `.claude/ship-setup/setup.md` § Commit — convenção de commit e posição da key do card; lido no Step 10, **se existir**. Dono: `/setup` (pacote `furi-ship`) — este protocolo aplica o que está escrito e **não cria** o arquivo; sem ele, Conventional Commits. O resto do setup (branch, PR, Jira) não é assunto daqui.

**Ao iniciar um step, leia o arquivo dele em `references/` (inteiro, `Read`). Ao chegar num gateway, leia `references/gateways.md`; ao capturar um achado, `references/follow-ups.md`. Não tente executar de memória.**
