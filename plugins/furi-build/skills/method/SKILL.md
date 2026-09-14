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

Este arquivo é mono-arquivo: tudo o que o protocolo precisa está abaixo, em seções `##`. `grep -n '^## '` lista todas.

- `principles/SKILL.md` — **fonte única** dos princípios (SOLID completo, DRY, KISS, YAGNI, LoD, **Motores**), da **refatoração contínua** e das racionalizações — mora na skill `/principles` (dona da doutrina), mesmo pacote. Independente deste protocolo: não cita step nem gateway. A lente por step é das seções daqui; as linhas obrigatórias são do § Gateways
- `ui/SKILL.md` — **fonte única** do design (tokens SSOT, atomicidade, composição, headless, estados, Jakob, a11y), **evolução do design system**, lente por step e racionalizações
- § Rationalizations — tabela única consolidada de todas as racionalizações proibidas + Red Flags completo
- § Gateways — todos os critérios de gateway + Gateway 9→10 detalhado
- § Follow-ups — Ledger de Follow-ups, triagem A/B/C, Gate de Convergência e o loop até o passe seco
- § Inventário de Docs — protocolo do inventário inicial
- § Step 1 até § Step 10 — detalhamento por step

**Arquivos do projeto que o protocolo lê por caminho** (sem depender de quem os cria — como já lê o `CLAUDE.md`):
- `.claude/patterns.md` — padrões de código do projeto; lido no Step 4 e **feito crescer** por ele (dono: este protocolo). Caminhos antigos migram no Step 4.
- `.claude/ship-setup/setup.md` § Commit — convenção de commit e posição da key do card; lido no Step 10, **se existir**. Dono: `/setup` (pacote `furi-ship`) — este protocolo aplica o que está escrito e **não cria** o arquivo; sem ele, Conventional Commits. O resto do setup (branch, PR, Jira) não é assunto daqui.

**Leia a seção do step ao iniciá-lo. Não tente executar de memória.**

## Step 1 — Problema

**Uma frase.** Se não cabe em uma frase, você não entendeu o problema ainda.

### Artefato

- **Pasta:** `docs/01-problem/`
- **Arquivo:** `<tópico>.md` (nome por domínio — ver § Inventário de Docs)

### Conteúdo

- **Problema** — 1 frase clara
- **Contexto breve** — 2-3 linhas se necessário
- **Quem é afetado** — personas / roles

### Exemplo

```markdown
# Pagamentos

## Problema
Usuários não conseguem receber pagamentos na plataforma.

## Contexto
Fluxo de checkout finaliza com erro 500 quando o método é PIX. Implementado há 6 meses, regressão na última release.

## Afetados
- Compradores (não conseguem finalizar compra)
- Vendedores (não recebem)
- Suporte (volume de tickets 3× maior)
```

### Princípios neste step (`principles/SKILL.md`)

- **KISS** — 1 frase. Não coube? você ainda não entendeu o problema; não compense com parágrafo.
- **YAGNI** — o problema é o que **existe e foi relatado**, não o adjacente que você imaginou junto. Problema inventado aqui vira feature especulativa lá na frente.
- **DRY** — o Inventário de Docs achou arquivo que já cobre este domínio? **Atualize esse**, não crie um paralelo (§ Inventário de Docs).
- **SRP** — 1 doc = 1 problema. Dois problemas distintos = dois tópicos, dois fluxos de `/method`.
- **Motor** — o problema nomeia a **capacidade que falta** ("o produto não sabe calcular X"), não a tela onde ela some. Problema descrito como tela leva a solução espalhada por telas.
- **Refatoração** — o inventário achou doc que já cobre este domínio? **Consolide nele.** Doc paralelo é duplicação de decisão, a mais barata de evitar e a mais cara de descobrir depois.
- **Design** (se tem UI) — o problema é de UX? Nomeie a **fricção**: passo redundante, contexto perdido, ação que não se acha. "Falta um botão" não é problema; "o usuário perde o que digitou ao voltar" é (`ui/SKILL.md`).

### Gateway 1 → 2

- [ ] Problema em **1 frase clara**
- [ ] Quem é afetado identificado
- [ ] Artefato `docs/01-problem/<tópico>.md` existe com conteúdo substantivo
- [ ] **Princípios declarados** na linha do Gateway Check (KISS · YAGNI · DRY · SRP · Motor pela lente acima)
- [ ] **Refatoração declarada** na linha própria do Gateway Check
- [ ] **Design declarado** na linha própria (se a feature tem superfície visual)

## Step 2 — User Stories

### Reler antes

- Step 1 (`docs/01-problem/<tópico>.md`)

### Artefato

- **Pasta:** `docs/02-user-stories/`
- **Arquivo:** `<tópico>.md` (nome por domínio — ver § Inventário de Docs)

### Conteúdo

Lista de user stories no formato:

```
Como <persona>, eu quero <ação> para <benefício/resultado>.
```

Isso vira requisito. Inclua TODAS as personas afetadas (identificadas no Step 1).

### Exemplo

```markdown
# Pagamentos — User Stories

- Como comprador, quero pagar com PIX para finalizar a compra instantaneamente.
- Como vendedor, quero receber notificação de pagamento recebido para liberar o produto.
- Como admin, quero ver o histórico de pagamentos falhados para dar suporte.
```

### Princípios neste step (`principles/SKILL.md`)

- **SRP** — 1 story = 1 necessidade de 1 persona. Story com "e também" são duas stories disfarçadas de uma.
- **DRY** — mesma necessidade em duas personas = **uma** story com os dois atores, não duas gêmeas que vão divergir na manutenção.
- **YAGNI** — toda story rastreia a uma persona identificada no Step 1. Persona nova aparecendo aqui = ou o Step 1 está incompleto (volte) ou a story é especulação (fora).
- **KISS** — linguagem de usuário, sem solução técnica embutida. "Quero um botão que chame o endpoint X" não é story.
- **Motor** — stories que pedem a **mesma capacidade** apontam para o mesmo motor. Anote a observação: é insumo do Step 4, onde o motor é nomeado.
- **Refatoração** — story empilhada ("e também") → **separe agora**. Aqui custa uma linha; no Step 6 custa duas tasks; no 7b custa código.
- **Design** (se tem UI) — a story descreve o **resultado para o usuário**, nunca o componente: "quero ver o total atualizado", não "quero um badge azul". Solução na story engessa o design antes de ele existir (`ui/SKILL.md`).

### Gateway 2 → 3

- [ ] Stories cobrem todas as personas do Step 1
- [ ] Formato "Como X, quero Y para Z" aplicado a cada story
- [ ] Artefato `docs/02-user-stories/<tópico>.md` existe com conteúdo substantivo
- [ ] **Princípios declarados** na linha do Gateway Check (SRP · DRY · YAGNI · KISS · Motor pela lente acima)
- [ ] **Refatoração declarada** na linha própria do Gateway Check
- [ ] **Design declarado** na linha própria (se a feature tem superfície visual)

## Step 3 — Use Cases

### Reler antes
- Step 2 (User Stories)

### Artefato
- **Pasta:** `docs/03-use-cases/`
- **Arquivo:** `<tópico>.md`

### Regra

**Para cada user story do Step 2, derive os Use Cases que cobrem TODAS as possibilidades.**

Completude é obrigatória. Para cada story, enumere sem omitir:

- **Todos os atores/personas** envolvidos (não só o principal)
- **Happy path** (fluxo feliz)
- **Fluxos alternativos** (caminhos válidos diferentes do happy path)
- **Fluxos de erro** (validação, rede, timeout, permissão, estado inválido, concorrência)
- **Transições de estado** relevantes (vazio, parcial, completo, expirado, bloqueado)

Cada combinação distinta de (ator × fluxo × estado) = **1 UC separado**. Não agrupe.

### Formato por UC

```markdown
## UC-N — <nome curto>
- **Ator**: [persona]
- **Precondição**: [estado inicial]
- **Fluxo**: [passos 1..N, actor-focused, sem código]
- **Resultado**: [estado final ou erro]
```

### Princípios neste step (`principles/SKILL.md`)

- **SRP** — 1 UC = 1 combinação (ator × fluxo × estado). Agrupar "porque é parecido" destrói a rastreabilidade que os Steps 5 e 9 dependem.
- **DRY** — tabela de assinaturas **única**, sem duplicata (já é critério do gateway). Dois UCs com o mesmo fluxo e estados diferentes compartilham a descrição, não a copiam.
- **YAGNI** — todo UC rastreia a uma story do Step 2. Fluxo que nenhuma story pede não vira UC — vira achado (ledger), se for real.
- **KISS** — fluxo em passos de usuário, sem código. UC não é pseudo-implementação.
- **Motor** — UCs que compartilham a mesma regra são do **mesmo motor**, e a tabela de assinaturas já é o **esboço do contrato** dele: o que entra, o que sai. Dois UCs que precisam da mesma decisão não podem tomá-la cada um por si.
- **Refatoração** — UC agrupado → **quebre**; assinatura duplicada → **funda**. O artefato sai desta passada mais limpo do que entrou.
- **Design** (se tem UI) — cada UC lista seus **estados de tela**: vazio, carregando, erro, sucesso e limite (lista longa, texto longo, sem permissão). **Estado não listado aqui é estado que não vai ser desenhado** — e vira bug no Step 9 (`ui/SKILL.md`).

### Gateway 3 → 4

- [ ] Toda user story do Step 2 tem UC(s) derivado(s)
- [ ] Para cada story: happy path + alternativos + erros + todos os atores cobertos (nada omitido)
- [ ] Artefato `docs/03-use-cases/<tópico>.md` existe com conteúdo substantivo
- [ ] **Princípios declarados** na linha do Gateway Check (SRP · DRY · YAGNI · KISS · Motor pela lente acima)
- [ ] **Refatoração declarada** na linha própria do Gateway Check
- [ ] **Design declarado** na linha própria — cada UC com seus estados de tela (se a feature tem superfície visual)

## Step 4 — Spec

### Reler antes

- Steps 1-3

### Artefato

- **Pasta:** `docs/04-spec/`
- **Arquivo:** `<tópico>.md`
- **Arquivo (feature com superfície visual):** `docs/04-spec/design-system.md` — **vive entre features**, não é por tópico. Ver § Design System abaixo.
- **Arquivo (padrões de código):** `.claude/patterns.md` — **vive entre features**, é do projeto. Ver § Padrões do projeto abaixo.

### Design System — o artefato que evolui com o produto

Feature com superfície visual **decide o DS aqui** (doutrina completa: `ui/SKILL.md`). O arquivo é único e cumulativo: cada feature lê, usa e **faz crescer**.

```markdown
# Design System

## Tokens (SSOT)
| token | valor | uso |
|---|---|---|
| color.surface.raised | … | cards, popovers |
| space.4 / radius.md / motion.fast | … | … |

## Componentes
| componente | nível | estados prontos |
|---|---|---|
| Button | átomo | hover · focus-visible · active · disabled · loading |
| EmptyState | molécula | — |

## Padrões de interação
- Ação destrutiva sempre confirma; "Salvar" é sempre o mesmo rótulo e o mesmo lugar.

## Breakpoints e a11y alvo
- Breakpoints do projeto: … · piso 320px · WCAG **AA**

## Esta feature promove ao DS
- `motion.fast` (token novo) — nenhum token cobria transição de foco
- `<EmptyState>` — extraído de 3 telas que repetiam o mesmo bloco
```

**Ordem obrigatória ao precisar de algo:** **reusar** → **compor** → **promover** (criar no DS, nunca na pasta da feature).

**Projeto sem DS?** A primeira feature o **funda** com o mínimo que os UCs exigem — sem inventar paleta inteira para uma tela (YAGNI vale aqui igual). As seguintes o fazem crescer.

**Superfície visual é DERIVADA aqui** (sim/não), como o escopo de plataforma — nunca declarada pelo usuário. É o que liga ou desliga a linha de **Design** nos gateways seguintes.

### Texto gerado por IA — a outra superfície derivada

**Superfície de texto gerado por IA é DERIVADA aqui** (sim/não), pelo mesmo mecanismo: a feature **produz ou altera texto que o usuário final lê como saída do sistema** — resposta de chat, resumo, e-mail ou notificação gerada, persona/prompt, resposta de RAG, troca de modelo. Nunca declarada pelo usuário; derivada dos UCs. É o que liga ou desliga a linha de **Texto de IA** nos gateways seguintes — e ela nasce `N/A` em feature sem isso, como Design nasce `N/A` sem tela.

#### O produto antes da feature — a derivação em dois níveis

Antes de derivar a feature, derive o **produto**, exatamente como este step já faz com plataforma ("o projeto tem app mobile?"): **o core deste produto é IA?** Sinais verificáveis, não opinião — SDK de LLM nas dependências, prompts ou templates de saída versionados no repositório, serviço/rota de agente ou de chat, e o que o `CLAUDE.md`/README declara que o produto é.

**Produto cujo core é IA ⇒ a superfície da feature nasce `sim`.** Isso não é veredicto: a derivação continua sendo feita e publicada no Gateway 4 → 5. O que muda é o ponto de partida — e, com ele, de que lado fica o ônus da prova. Produto sem isso ⇒ deriva do zero, como sempre.

Derivou o produto? O achado é **padrão do projeto**: registre-o em `.claude/patterns.md` (§ Esta feature promove), para as próximas features não re-derivarem o mesmo fato — **registro do que foi derivado, nunca declaração que substitua a derivação**. Sem o arquivo, deriva-se de novo; nada se perde.

#### Se `sim`: a referência #1 e o que "ler bem" significa

Duas decisões entram no loop como gap, e são escritas no spec:
- **A referência #1** — qual produto lê melhor neste tipo de saída (ChatGPT, Claude, o líder do domínio). Ela é o **piso**: "funcionar" não é a barra, e **empatar também não** — a barra é ler melhor que o melhor.
- **O que "ler bem" significa aqui** — tom e persona, concisão, formatação, idioma do usuário, **sem truncamento, sem placeholder, sem alucinação, sem robótico**. Isso vira o `Resultado:` de pelo menos um TC no Step 5 e o critério de FAILED no Step 9: texto que lê **igual ou pior** que a referência é teste falho, mesmo com o código certo.

Isso é da **saída lida**, não do modelo nem da infra: prompt, RAG e troca de modelo entram porque mudam o que o usuário lê.

#### Se `não`: a justificativa é nomeada

`sim` se paga sozinho — a referência #1 e o "ler bem" entram no spec e são cobrados até o Step 9. `não` é a resposta barata, e por isso é a que se cobra. Quem deriva `não` escreve no spec **duas afirmações nomeadas**:

1. **Qual saída esta feature produz ou altera** — a tela, o registro, o número, o arquivo, o e-mail, o log.
2. **Por que o usuário final não a lê como saída do sistema** — porque ninguém a vê, porque quem a vê é outro sistema, ou porque o texto é escrito por pessoa (ou é constante) e a feature apenas o transporta.

Sem as duas, a derivação não aconteceu e o **Gateway 4 → 5 está BLOQUEADO**. "Não tem tela", "é backend", "é infra" não são justificativa: nenhuma das três fala da saída. E num produto cujo core é IA, a justificativa diz também **por que esta feature é a exceção**.

| Racionalização proibida | Realidade |
|------------------------|-----------|
| "É só troca de modelo / ajuste de prompt / RAG — isso é infra" | O que o usuário lê mudou. É **sim**, e a referência #1 entra no spec. |
| "Não tem tela, logo não tem superfície de texto" | Superfície de texto ≠ superfície visual. E-mail, push, webhook lido por humano, resposta que vira mensagem no WhatsApp — todos contam. |
| "O texto quem escreve é o modelo, não eu" | O usuário não lê o modelo, lê o seu produto. Quem entrega a saída responde por ela. |
| "É uma saída curta — um título, uma tag, um resumo de uma linha" | Tamanho não é critério. Se o usuário lê, vale a barra. |

### Padrões do projeto — `.claude/patterns.md`, o artefato que evolui com o código

O nível 1 da hierarquia de decisão ("padrões do projeto") precisa de um lugar onde o padrão esteja **escrito**, não só implícito no código. Esse lugar é **`.claude/patterns.md`** — um arquivo único e cumulativo, versionado, do projeto (não por feature, não da máquina): cada feature **lê, usa e faz crescer**. Mora em `.claude/` junto de `setup.md` (convenções do time — dono `/setup`, `furi-ship`), `deploy.md` e `infra.md`; nenhum deles é auto-carregado — este step o lê por caminho, como lê o `CLAUDE.md`: `cat .claude/patterns.md 2>/dev/null || cat .claude/patterns.local.md 2>/dev/null`. **`patterns.local.md`** é a variante de quem trabalha num repositório de time que não usa este processo (`.claude/` ignorado de propósito; o sinal é existir `setup.local.md` e não `setup.md`) — mesmo formato, fora do git, **não** entra no commit do Step 10. O do time vence quando os dois existem.

```markdown
# Padrões do projeto

## Estrutura
- feature-first: `src/features/<área>/{ui,model,api}` · shared só o que 2+ features usam

## Nomenclatura
- arquivos kebab-case · componentes PascalCase · hooks `use*` · motores `<Coisa>Engine`

## Dados e validação
- schema Zod na borda (rota/form); dentro do motor o dado já é confiável

## Erros
- `Result<T, E>` nos motores; `throw` só na borda HTTP

## Esta feature promove
- `Result<T, E>` — 3 motores tratavam erro de 3 jeitos
```

**Ordem obrigatória ao decidir:** **seguir** o que está escrito → **estender** (caso novo do mesmo padrão) → **promover** (padrão que esta feature fixou e as próximas vão precisar — escrever aqui, na seção `## Esta feature promove`, e depois consolidar na seção certa). Padrão que vive só na cabeça de quem codou não é padrão: é a próxima inconsistência.

**Projeto sem `patterns.md`?** A primeira feature o **funda** com o mínimo que ela mesma fixou — sem inventar guia de estilo inteiro (YAGNI vale aqui igual). As seguintes o fazem crescer.

O arquivo também é onde fica registrado o que a derivação do **produto** já apurou (§ Texto gerado por IA — "o core deste produto é IA?"), para as próximas features não re-derivarem o mesmo fato. É **registro do derivado**, não declaração: a derivação de cada feature continua acontecendo e sendo publicada no gateway.

**Migração (uma vez por projeto):** o arquivo existe no caminho antigo — `docs/00-context/technical/patterns.md` ou `docs/04-spec/technical/patterns.md` — e não em `.claude/`? `mkdir -p .claude && git mv <caminho-antigo> .claude/patterns.md`, avisar, e o `git mv` entra no commit do Step 10. Se `.claude/` estiver no `.gitignore`, **não decida sozinho**: pode ser o time mantendo processo de agente fora do repo — aí o destino é `patterns.local.md` (e o antigo sai do índice: `git rm --cached`). Quem decide o modo é o `/setup` (`furi-ship`); sem ele, pergunte.

### Regra central

**Resolva TODAS as decisões autonomamente — sem parar para perguntar ao usuário.**

**Para a SOLUÇÃO técnica: REFERÊNCIAS DE QUALIDADE são OBRIGATÓRIAS.** Big pop tech apps, players do mesmo domínio do negócio, OU qualquer outra referência relevante (mesmo de outro segmento) que contribua para a análise — a solução padrão de mercado é a **baseline** — o piso a partir do qual se compete; a barra é 10x acima dela. Complexidade aceitável para atingir essa qualidade é REQUISITO, não obstáculo.

A AI resolve cada decisão usando (em ordem de prioridade):

1. **Padrões do projeto** — código existente, CLAUDE.md, `.claude/patterns.md`, convenções já adotadas
2. **Big apps como referência** — big pop tech apps / líderes do mesmo domínio
3. **Boas práticas de mercado** — padrões consagrados de engenharia de alto nível
4. **Princípios de engenharia e design** — SOLID completo (SRP, OCP, LSP, ISP, DIP), DRY, KISS, YAGNI, Law of Demeter e Motores (`principles/SKILL.md`); tokens, atomicidade, composição, headless, estados e a11y (`ui/SKILL.md`); Clean Architecture, OWASP, performance, escalabilidade

> Os princípios não são só o desempate nº 4: eles **filtram** o resultado dos níveis 1-3. Uma decisão que vem de "big app faz assim" mas viola YAGNI (nenhum UC exige) ou DRY (o projeto já tem esse mecanismo) **não passa** — volta para "alternativas descartadas".

### Autonomous Decision Loop

```
ROUND = 0

REPETIR até zero gaps:
  ROUND += 1

  1. ANALISAR — Releia TUDO:
     - Docs steps 1-3
     - Decisões tomadas em rounds anteriores
     - Código existente relevante
     - CLAUDE.md e .claude/patterns.md

  2. IDENTIFICAR GAPS — Decisões em aberto:
     Stack/tecnologia | Regras de negócio | UI/UX e consistência visual | Edge cases
     Integrações | Permissões/roles | Dados/schemas | Performance | Segurança
     **Escopo de plataforma** (web/android/ios) — derivado da feature, não declarado
     **Superfície visual** (sim/não) — derivada aqui; se sim, o Design System entra como gap
     **Superfície de texto gerado por IA** (sim/não) — derivada aqui, começando pelo **produto** (core de IA ⇒ nasce `sim`);
       se sim, a referência #1 e "o que ler bem significa" entram como gap; se não, a saída nomeada e o porquê de não ser lida
     **Design System** — que token/componente já existe? o que será reusado, composto ou **promovido**?
     **Motores** — qual capacidade esta feature exige, e quem é o dono dela?
     **UI/UX obrigatório:** como features similares se comportam no app hoje? como big apps resolvem?

  3. RESOLVER CADA GAP — Para cada decisão:
     - Decisão tomada (clara, direta)
     - Justificativa (por que esta é a melhor escolha)
     - Referência (padrão do projeto / big app / princípio)
     - **UC que a exige** (Step 3) — sem UC, a decisão é especulativa (YAGNI) → vai para descartadas
     - **Já existe no projeto?** (DRY) — mecanismo equivalente encontrado → a decisão é REUSAR/ESTENDER, não criar
     - Alternativas descartadas (o que foi considerado e por que saiu)

  4. RE-ANALISAR (do zero) — Com decisões tomadas, releia TUDO:
     - Decisões geraram NOVAS ambiguidades?
     - Contradições com algo anterior?
     - Dimensões não cobertas? (segurança, performance, a11y, mobile, i18n, rollback)
     - A decisão pede **token ou componente que o DS não tem**? → reusar / compor / **promover** (registre em `design-system.md`)
     - A decisão espalha uma regra que já tem dono? → **absorve no motor**

  5. DECISÃO: gaps restantes? → novo round. Zero gaps? → sair.

SAÍDA: "✅ Spec completo — [N] rounds, [M] decisões, zero ambiguidades"
  - Resumo de TODAS as decisões com justificativas.
```

### Regras do Loop

- **Sem limite de rounds** — rode quantos for necessário.
- **Cada round re-analisa TUDO do zero** — não confie na memória.
- **Mínimo 1 round** — features "simples" escondem complexidade.
- **NÃO pergunte ao usuário** — resolva baseado na hierarquia acima.
- **Contradição interna** → resolva pela opção mais consistente com o projeto existente; documente o motivo.
- **Hierarquia de decisão:** padrão existente no projeto > big apps > boas práticas > julgamento técnico.
- **Qualidade > velocidade** — 5 rounds com spec perfeito > 1 round com retrabalho.

### Escopo de Plataforma — Derivado, não declarado

**PROIBIDO** aceitar "web-only, skip mobile" como declaração do usuário. O escopo de plataforma é derivado da Verificação de Realidade (Step 3) + análise do projeto:

- Projeto tem app mobile? Feature tem superfície mobile?
- Se superfície existe em mobile → TCs mobile OBRIGATÓRIOS (Android + iOS).
- Se projeto é web-only (confirmado por ausência de código mobile) → documentar explicitamente no spec "feature não tem superfície mobile".

### Quando parar e perguntar

**Apenas se:**
1. Decisão **IRREVERSÍVEL** (rollback custoso, escolha de fornecedor, estrutura de dados core)
2. **2+ caminhos radicalmente opostos** (não variações sutis)
3. **Alto impacto** que só o usuário pode julgar

"Não tenho certeza do melhor approach" **NÃO** é motivo para parar. Resolva pela hierarquia e documente.

### Princípios neste step (`principles/SKILL.md`)

**Este é o step onde a arquitetura é decidida — e onde YAGNI é MAIS BARATO.** Uma abstração recusada aqui custa uma linha; recusada no Step 8 custa reescrever o que já foi codado.

- **YAGNI** — cada decisão declara o **UC que a exige**. Sem UC → não entra, vai para "alternativas descartadas" com o motivo. Camada, flag, config, tabela ou abstração "pro futuro" = especulação.
- **DRY** — antes de decidir criar, procure: o projeto já resolve isso? (grep + `.claude/patterns.md` + CLAUDE.md). Se sim, a decisão é **reusar/estender**, e isso fica escrito.
- **SRP** — as fronteiras de módulo/camada saem daqui: quem é dono de quê, o que é service, o que é UI, o que é shared. Fronteira mal desenhada aqui vira o "service que faz tudo" no 7b.
- **KISS** — entre duas soluções que atingem o nível 10x, ganha a mais simples. Complexidade só se paga com requisito, nunca com elegância.
- **Law of Demeter / acoplamento** — decisões de integração declaram a direção da dependência (`shared → api/web` ok; `api ↔ web` proibido) e **quem fala com quem**. Fronteira mal desenhada aqui vira `a.b.c.d` no 7b.
- **OCP** — onde a solução vai precisar crescer? O **ponto de extensão é decisão**, não improviso do 7b. Sem isso, o crescimento vira `if` novo no meio do que já funcionava.
- **DIP** — decisões declaram dependência de **abstração**, não de implementação: o motor define o contrato, a infra (banco, HTTP, lib) implementa. Direção aponta ao domínio.
- **Motor** — **é aqui que o motor é nomeado e desenhado**: fronteira, contrato público, o que fica dentro e o que fica fora. Cada decisão declara **qual motor é dono da regra**; regra sem dono é regra que vai nascer espalhada.
- **Refatoração** — decisão que replica mecanismo já existente vira decisão de **estender o motor que já existe**, não de criar um irmão.
- **Design** (se tem UI) — o step decide o **DS**: inventário em `docs/04-spec/design-system.md`, o que reusa / compõe / **promove**, qual padrão consagrado se aplica (Jakob) e o motivo de qualquer desvio, breakpoints, a11y alvo (AA) e benchmark visual citado. Ver `ui/SKILL.md`.

### Gateway 4 → 5

- [ ] Autonomous Decision Loop fechou com **zero gaps**
- [ ] Cada decisão com justificativa + referência + alternativas descartadas
- [ ] **Cada decisão declara o UC que a exige** (YAGNI) — sem UC, foi para descartadas
- [ ] **Reúso verificado antes de criar** (DRY) — decisões que o projeto já resolve viraram "reusar/estender"
- [ ] Fronteiras de módulo/camada explícitas (SRP) + direção de dependências declarada (DIP/LoD) + pontos de extensão previstos (OCP)
- [ ] **Cada decisão declara qual motor é dono da regra**; motor novo nomeado e com contrato desenhado
- [ ] Escopo de plataforma derivado (não declarado)
- [ ] **Superfície visual derivada** (sim/não) — publicada no gateway; é ela que liga/desliga a linha de Design daqui em diante
- [ ] **Superfície de texto gerado por IA derivada** (sim/não) — publicada no gateway, a partir do **produto** (core de IA ⇒ nasce `sim`). **`sim`** → a referência #1 e o "ler bem" estão no spec. **`não`** → o spec nomeia **a saída que a feature produz** e **por que o usuário final não a lê como saída do sistema** ("não tem tela / é backend / é infra" não conta). É ela que liga/desliga a linha de Texto de IA daqui em diante
- [ ] **Se tem UI:** `docs/04-spec/design-system.md` inventariado; promoções ao DS declaradas; breakpoints e a11y alvo (AA) definidos; benchmark visual citado
- [ ] **`.claude/patterns.md` lido** (nível 1 da hierarquia); padrões que esta feature fixa **promovidos** a ele — ou declarado que coube nos existentes; projeto sem o arquivo → fundado com o mínimo. Derivação de produto já registrada nele é **ponto de partida**, nunca substituto da derivação desta feature
- [ ] Artefato `docs/04-spec/<tópico>.md` existe com conteúdo substantivo
- [ ] **Princípios declarados** na linha do Gateway Check
- [ ] **Refatoração declarada** na linha própria do Gateway Check
- [ ] **Design declarado** na linha própria — ou `❌ N/A — sem superfície visual, derivado do Step 4` (a declaração **única**, que os gateways seguintes herdam)

## Step 5 — Test Cases

`docs/05-test-cases/<tópico>.md` · Reler 1-4

TC profissional, adversarial, captura **bug único**. Contempla várias possibilidades relevantes em produção. Roda via front no Step 9.

### Complexidade → Quantidade → Cobertura

A lógica, **nesta ordem**:

1. **Analise a complexidade do problema** — derivada dos artefatos dos Steps 3-4 (não chutada).
2. **Nota de complexidade (1-10) = quantidade de TCs.** `nº de TCs == nota`. Mínimo 1, máximo 10.
3. **Esses N TCs devem contemplar TODOS os UCs (Step 3) e detalhes do Spec (Step 4).**

> No Step 5 o código ainda não existe (codificar é Step 7) — a nota mede a complexidade do **problema/spec**, não da implementação.

#### 1. Analisar a complexidade (dos Steps 3-4)

A nota sai do **quanto a feature tem para cobrir** — quanto mais, maior a nota:

| Dimensão | Vem de |
|----------|--------|
| Nº de Use Cases (ator × fluxo × estado) | Step 3 |
| Fluxos: feliz + alternativos + erros + concorrência | Step 3 |
| Estados de dado/sistema (vazio, parcial, expirado, bloqueado) | Step 3 |
| Plataformas no escopo (web/Android/iOS) | Step 4 |
| Cross-cutting (auth, permissões, a11y, analytics, segurança) | Step 4 |
| Raio de impacto / edge cases do questioning loop | Step 4 |

Pouco a cobrir (1 UC, 1 fluxo, sem cross-cutting) → nota baixa (1-3). Muito a cobrir → nota perto de 10.

#### 2. Nota = quantidade de TCs

`nº de TCs == nota`, teto 10. **A nota dá o número** — não invente mais, não invente menos.

#### 3. Os N TCs contemplam tudo (por isso, densos)

Como N costuma ser **menor** que o total de UCs + detalhes, cada TC é **denso** — atravessa vários de uma vez (user-journey: `login → busca → cupom → checkout` cobre 4 UCs num só TC). O objetivo dos N TCs é **contemplar 100% dos UCs (Step 3) e dos detalhes do Step 4**.

- **As 12 técnicas de QA são LENTES** para empacotar cobertura, não geradores: pairwise e user-journey comprimem muitos UCs/detalhes em poucos TCs; BVA/negativos/segurança/a11y garantem que os detalhes do nível 4 entrem. **Nunca "1 TC por técnica".**
- **Não desperdice slot** — filtro de significância (ver abaixo): todo TC tem que puxar cobertura.
- **Plataforma é eixo de EXECUÇÃO, não TC novo:** 1 TC = 1 cenário. Rodar em Android E iOS (Step 9) é o **mesmo TC 2×**, não 2 TCs.
- **Os N TCs não cobrem tudo?** Ou a nota ficou baixa (re-analise a complexidade) ou a feature é grande demais para um card (**quebre em features menores**). **Nunca fure o teto de 10.**

### Significância (cada TC puxa cobertura)

> **"Se eu deletar este TC, algum UC ou detalhe do nível 4 fica descoberto — um bug ÚNICO passaria?"**
> **SIM** → o TC é necessário. **NÃO** → redundante; reaproveite o slot para cobrir o que ainda falta.

### Formato

```
### TC-N: [nome]
- Cobre: [UCs e detalhes do nível 4 que este TC contempla — ex: UC-1, UC-3, a11y, mobile]
- Bug único: [frase concreta]
- Pré-condição: [setup, estado, persona]
- Passos: [numerados]
- Resultado: [observável no front]
- Prova: screenshot (Step 9)
```

> A linha **Cobre** é o que torna a cobertura auditável: somando os `Cobre` de todos os TCs, todo UC e todo detalhe do Step 4 tem que aparecer ao menos uma vez.

> **Feature com superfície de texto gerado por IA** (derivada no Step 4): ao menos um TC tem o `Resultado:` na **qualidade do texto lido** — lê **melhor que** a referência #1 do spec (completo, no tom da persona, no idioma do usuário, sem placeholder, sem robótico) — e não só "a resposta aparece". Conta como `Cobre` do detalhe "o que ler bem significa" do Step 4. Sem superfície de texto de IA, nada disso se aplica.
>
> Esse TC é **um dos N**, não um TC extra — a nota e o teto de 10 não mudam (é lente de cobertura, como Design). E a **prova** dele não é screenshot: é a **transcrição integral da saída** (§ Step 9 → Evidência de texto).

### Princípios neste step (`principles/SKILL.md`)

- **SRP** — 1 TC = **1 bug único**. Denso (atravessa vários UCs) não é o mesmo que difuso: o TC pode cobrir 4 UCs, mas falha por **um** motivo nomeável.
- **DRY** — o filtro de significância É o DRY dos testes: TC que não puxa cobertura nova duplica outro. Delete e reaproveite o slot.
- **YAGNI** — teto de 10 e `nº TCs == nota`. Não invente TC "pra ficar completo"; não crie TC de plataforma (execução ≠ TC novo).
- **KISS** — passos executáveis por outra pessoa sem contexto seu, resultado observável no front.
- **Motor** — o TC exercita o **comportamento do motor pelo front**, nunca a peça interna. TC que precisa espiar estado interno está testando implementação, não comportamento.
- **Refatoração** — TC redundante → **funda**. É o próprio filtro de significância aplicado como faxina, não como corte cego.
- **Design** (se tem UI) — a cobertura contempla **estados** (vazio, carregando, erro, sucesso, limite) e **breakpoints do projeto** e a11y. Isso é **lente de cobertura, não TC extra**: um TC denso cobre a tela em mobile e desktop; dois TCs gêmeos por breakpoint violam o teto e o filtro de significância.
- **Texto de IA** (se tem essa superfície) — o `Resultado:` do TC é **o que se lê**, não "a resposta aparece"; e a prova é a saída inteira, não o screenshot do começo. TC cujo resultado observável é "retornou 200" não cobre texto: cobre transporte.

### Gateway 5 → 6

- [ ] **Nota de complexidade (1-10) publicada** no chat, derivada dos Steps 3-4
- [ ] **Nº de TCs == nota** e **≤ 10** — diverge → BLOQUEADO
- [ ] **Os TCs contemplam 100% dos UCs (Step 3) e detalhes do Step 4** — somatório das linhas `Cobre` não deixa nada descoberto
- [ ] Nenhum TC redundante (filtro de significância aplicado)
- [ ] Cada TC profissional, com bug único + resultado observável no front
- [ ] Artefato substantivo
- [ ] **Princípios declarados** na linha do Gateway Check (SRP · DRY · YAGNI · KISS · Motor pela lente acima)
- [ ] **Refatoração declarada** na linha própria do Gateway Check
- [ ] **Design declarado** na linha própria — cobertura de estados × breakpoints e a11y (se a feature tem superfície visual)
- [ ] **Texto de IA declarado** na linha própria — o TC de qualidade do texto lido existe e cita a referência #1 do spec; ou `❌ N/A — sem superfície de texto gerado por IA, derivado do Step 4`

## Step 6 — To Do

### Reler antes

- Steps 1-5

### Artefato

- **Pasta:** `kanban/06-todo/`
- **Arquivo:** `<tópico>.md`

### Conteúdo

Lista de tasks com checkboxes. **Cada task = uma unidade resolvível em um prompt.**

### Regras

- Tasks atômicas (1 prompt por task)
- Cada task rastreável (arquivos/módulos afetados identificáveis)
- Dependências entre tasks mapeadas
- Ordem de execução óbvia

### Princípios neste step (`principles/SKILL.md`)

A lista de tasks é a primeira forma concreta da arquitetura — o que estiver torto aqui vira código torto no 7b.

- **SRP** — 1 task = 1 responsabilidade resolvível em 1 prompt. Task que precisa de "e depois" é duas tasks.
- **DRY** — task que recria algo que o projeto já tem deve nascer como task de **reúso**: "estender `X` para cobrir Y" > "criar novo Y". A checagem é grep, não memória.
- **YAGNI** — toda task rastreia a um UC (Step 3) ou TC (Step 5). Task sem origem = escopo inventado → fora (ou vira achado no ledger, se for real).
- **KISS** — descrição na linguagem do que muda, não do como interno.
- **Motor** — cada task declara **qual motor** ela constrói, estende ou absorve. Task que espalha a mesma regra por N telas **não existe**: vira task de motor + tasks de chamada.
- **Refatoração** — task que recria o existente vira task de **extensão**; e o perímetro previsto pela task já entra anotado, para o 7a planejar a elevação.
- **Design** (se tem UI) — task de UI declara o **nível atômico** (átomo/molécula/organismo) e **qual componente do DS** ela constrói, estende ou **promove** (`ui/SKILL.md`).

### Exemplo

```markdown
# Pagamentos — To Do

- [ ] Criar schema `Payment` no Prisma com status enum (pendente|pago|falhado|cancelado)
- [ ] Criar service `PaymentService` com métodos create, confirm, cancel
- [ ] Criar controller `PaymentController` com endpoints REST
- [ ] Criar componente `PaymentForm` no frontend
- [ ] Integrar webhook do gateway de pagamento
- [ ] Criar testes unitários para PaymentService
```

### Checklist de QA dos Test Cases (status: testado ou não)

Além das tasks de implementação, o card de to-do carrega um **checklist de QA** — um item `- [ ]` por TC de `docs/05-test-cases/<tópico>.md`. É o rastreador de "já testei ou não", a superfície VIVA atualizada ao longo do Step 9.

**Semeie agora (Step 6):** copie a lista de TCs do `docs/05-test-cases/` para uma seção `## Test Cases (QA)` no card, todos `- [ ]` (nada rodou ainda):

```markdown
## Test Cases (QA)
- [ ] TC-1: <nome>
- [ ] TC-2: <nome>
- [ ] TC-3: <nome>
```

- **No Step 9:** cada TC que PASSAR via front vira `- [x] TC-N: <nome> — ✅ (path do screenshot)`. FAILED continua `- [ ]` com nota `❌ motivo`. **Qualquer fix de código RESETA todos para `- [ ]`** (o ciclo retesta tudo).
- **No Step 10 (Done):** este checklist final (tudo `- [x]`) é **copiado para `kanban/10-done/<tópico>.md`** ANTES de apagar o card de to-do — registro permanente do que foi testado. O card some, o status sobrevive no done.

> Parou e vai retomar depois? Abra o checklist: os `- [ ]` restantes são exatamente o que falta rodar.

### Ledger de Follow-ups (semear agora)

O card carrega também o **Ledger de Follow-ups** — a superfície viva onde todo achado fora do escopo documentado é registrado e classificado, do Step 1 até o Step 10. É o que permite o protocolo fechar **seco** (Regra Inviolável 7).

**Semeie agora (Step 6):** crie a seção `## Follow-ups` com o cabeçalho da tabela e **transcreva o que já apareceu nos Steps 1-5** (as linhas "Follow-ups detectados neste step" dos Gateway Checks). Nada apareceu → seção presente e vazia.

```markdown
## Follow-ups

| # | Achado | Detectado em | Balde | Status | Resolução |
|---|--------|--------------|-------|--------|-----------|
```

- **Baldes:** **A** = defeito dentro do escopo documentado → corrige no step; **B** = escopo novo que este trabalho criou/tocou/expôs → ciclo `/method` próprio; **C** = pré-existente e não tocado → `DESCARTADO` com justificativa. Na dúvida entre B e C → **B**.
- **Nos Steps 7-9:** todo achado entra aqui na hora, classificado. Item `RESOLVIDO-*` ou `DESCARTADO` não reabre.
- **No Step 10:** o **Gate de Convergência** exige zero itens `ABERTO`; o ledger final é **copiado para `kanban/10-done/<tópico>.md`** antes do card ser deletado.

Regras completas: § Follow-ups.

### Gateway 6 → 7a

- [ ] Tasks atômicas (1 prompt cada)
- [ ] Cada task rastreável
- [ ] Dependências mapeadas
- [ ] Artefato `kanban/06-todo/<tópico>.md` existe com conteúdo substantivo
- [ ] Seção `## Test Cases (QA)` presente com 1 `- [ ]` por TC do step 5
- [ ] Seção `## Follow-ups` presente (semeada com os achados dos Steps 1-5, ou vazia)
- [ ] Toda task rastreia a UC/TC (YAGNI) e task que recria o existente virou task de **reúso** (DRY)
- [ ] Cada task declara **qual motor** constrói/estende/absorve — nenhuma task espalha a mesma regra por N telas
- [ ] **Se tem UI:** task de UI declara o **nível atômico** e o componente do DS que constrói/estende/promove
- [ ] **Princípios declarados** na linha do Gateway Check
- [ ] **Refatoração declarada** na linha própria do Gateway Check
- [ ] **Design declarado** na linha própria (se a feature tem superfície visual)

## Step 7 — Implementação

### Princípios neste step (`principles/SKILL.md`)

A lente do Step 7 não é uma lista à parte — ela **é** a estrutura desta seção. No **7a** são as seções obrigatórias do plano: § 3.1 Reúso (DRY) · § 3.2 O que NÃO vamos construir (YAGNI) · § 3.3 Motores · § 3.4 Design System · § 3.5 Perímetro. No **7b** são § Práticas Obrigatórias (SOLID completo com limiar numérico, por arquivo aberto) e § Refatoração Obrigatória (o perímetro e a regra do saldo).

### 7a — Plano de Implementação (OBRIGATÓRIO antes de codar)

#### Reler antes

- Steps 1-6 (todos) + código existente relevante

#### Artefato

- **Pasta:** `kanban/07-implementation/`
- **Arquivo:** `<tópico>.md` — prompt-mestre autocontido

#### Estrutura

```markdown
# Plano de Implementação — <feature>

## 1. Contexto Consolidado
- Problema (de 01-problem), Stories (de 02-user-stories), Use Cases (de 03-use-cases), Spec (de 04-spec)

## 2. Código Existente Relevante
- CADA arquivo/módulo a modificar/reutilizar: o que faz, impacto, dependências, padrões
- **Configuração i18n (OBRIGATÓRIO verificar):** o projeto tem i18n? Procure `next-intl`, `react-i18next`, `next-i18next`, `i18n.config*`, `i18next`, pasta `locales/`, `translations/`, `messages/`, `lang/`.
  - Se SIM: identifique biblioteca, arquivos de chaves, convenção de naming (ex: `feature.section.key`). Liste TODAS as strings user-facing novas/alteradas como chaves. Proibido literal hardcoded. Se múltiplos idiomas, traduza para todos.
  - Se NÃO: documente no plano e prossiga com strings literais.

## 3. Estratégia de Implementação
- Ordem de tasks (de 06-todo), abordagem técnica por task, arquivos a criar/modificar, dependências
- **Referência big apps:** como as big pop tech apps / líderes do domínio resolvem este problema de UX?
- **Consistência UI/UX:** quais padrões visuais e de interação já existem no app? A linguagem visual existente (cores, espaçamentos, tipografia, animações, componentes, feedback) é **lei para consistência** — e **não para qualidade**: padrão abaixo do nível 10x se **eleva** ou vira achado no ledger, nunca se copia. Ver `ui/SKILL.md` § *Consistência é lei; mediocridade não é*.
- **Responsabilidade por arquivo (SRP):** para CADA arquivo a criar/modificar, uma frase — o que ele faz. Não coube em uma frase → o arquivo está fazendo duas coisas.

## 3.1 Reúso antes de criar (DRY) — OBRIGATÓRIO
Resultado do grep em `packages/shared/`, `src/lib/`, `src/components/ui/`, `src/hooks/` (e equivalentes do projeto):

| Preciso de | Já existe? | Decisão |
|---|---|---|
| <capacidade> | `caminho/arquivo.ts` | reutilizar / estender / **criar (por quê nada serve)** |

**Arquivo novo só entra nesta tabela com a justificativa de por que o existente não serve.** "Não procurei" não é resposta.

## 3.2 O que NÃO vamos construir (YAGNI) — OBRIGATÓRIO
Abstrações, camadas, flags, configs e generalizações que foram **consideradas e descartadas** por não ter UC (Step 3) que as exija:

- <coisa descartada> — descartada porque nenhum UC pede; se aparecer demanda, entra depois.

Seção vazia é suspeita: significa que nada foi cogitado, ou que tudo que foi cogitado entrou.

## 3.3 Motores — OBRIGATÓRIO
Toda capacidade tem **um** dono (`principles/SKILL.md` § Motores):

| Capacidade | Motor | Ação |
|---|---|---|
| <o que o sistema precisa saber fazer> | `caminho/motor.ts` | **nasce** / **estende** / **absorve** lógica dispersa de `a.tsx`, `b.ts` |

**Absorver é planejado, não improvisado:** liste onde a mesma regra está espalhada hoje e que passa a só chamar o motor.

## 3.4 Design System — OBRIGATÓRIO se a feature tem superfície visual
Lido de `docs/04-spec/design-system.md` (`ui/SKILL.md`):

| Preciso de | DS tem? | Decisão |
|---|---|---|
| <token/componente> | sim / não | **reusar** / **compor** de X+Y / **promover ao DS** (nunca criar na pasta da feature) |

- **Tokens novos** a promover: … (com o motivo de nenhum existente servir)
- **Estados a implementar** por componente: vazio · carregando · erro · sucesso · limite · hover/focus/active/disabled/selected
- **Zero valor literal planejado** — se o plano já traz `#hex` ou `13px`, o 7b nasce errado.

## 3.5 Perímetro da refatoração — OBRIGATÓRIO
O que esta feature vai **abrir, ler ou atravessar** — e o que sobe em cada um (`principles/SKILL.md` § Refatoração contínua):

| Arquivo do perímetro | Por que entra | O que será elevado |
|---|---|---|
| `caminho/arquivo.ts` | editado / lido p/ entender / dependente do grep / no caminho do fluxo | duplicação → motor · naming · >40 linhas · morto · `a.b.c.d` · **ou** "já está no nível 10x" |

## 4. Mapa de Test Cases → Código
- Para CADA TC: qual código atende, edge cases, validações necessárias

## 5. Riscos e Pontos de Atenção
- Edge cases especiais, integrações, impactos existentes, pontos para pausar e perguntar

## 6. Checklist de Implementação
- [ ] Task 1: descrição — arquivos: [lista]
```

#### Regras

- Plano COMPLETO e AUTOCONTIDO — qualquer pessoa/AI implementa lendo apenas o plano + código
- Dúvida técnica → resolva autonomamente (padrão do projeto > big apps > boas práticas). Documente no plano.
- Plano é **vivo**: pode ser atualizado **durante 7b** para registrar desvios/aprendizados. **Não pode** ser editado **após** 7b para retrofit.

### 7b — Codificar

Implemente seguindo o plano como referência-mestre com **disciplina de engenharia rigorosa**.

#### Antes de codar cada task

- **Reler** `kanban/07-implementation/<feature>.md`
- **Identificar a camada:** controller/service/component/hook/schema/shared — respeite responsabilidades
- **Buscar código reutilizável ANTES de criar:** Grep/Glob em `packages/shared/`, `src/lib/`, `src/components/ui/`, `src/hooks/`. Se existe parecido, reutilize — NÃO duplique.
- **Verificar direção de dependências:** shared → api/web ok. api → web ou web → api proibido.
- **Consistência UI/UX:** antes de criar/modificar componente visual, leia `docs/04-spec/design-system.md` e as features similares. Padrão **bom** é lei — não invente estilo novo. Padrão **ruim** no perímetro se **eleva** (não se copia). Sem padrão local → big apps como referência, e o que você definir **vira** padrão: promova ao DS. Ver `ui/SKILL.md`.
- **Ordem ao precisar de algo visual:** **reusar** o que o DS tem → **compor** do que ele tem → **promover** (criar no DS, nunca na pasta da feature).
- **Padrões de código:** `.claude/patterns.md` (lido no Step 4) é lei para **consistência** — estrutura, nomenclatura, validação, erros. Não é lei para qualidade: padrão ruim no perímetro se eleva, e a elevação é **promovida** ao arquivo (Step 4, seção `## Esta feature promove`), não deixada implícita.
- **i18n (se configurado):** TODA string user-facing nova/alterada DEVE ser chave de tradução, nunca literal. Strings literais hardcoded em projeto com i18n = bug, mesmo se texto estiver "correto".

#### Práticas Obrigatórias

**Arquitetura — os princípios na íntegra: `principles/SKILL.md` (fonte única).** Aqui é onde eles têm limiar numérico e viram checklist **por arquivo aberto**:

- **SRP:** cada arquivo/classe/função faz UMA coisa. >40 linhas → extraia helper. Componente mistura lógica+UI → separe em hook+componente.
- **OCP:** comportamento novo entra por composição/estratégia. Se você está adicionando mais um `if`/`case` no meio de uma função que muita gente usa, pare — o ponto de extensão estava no plano (§ 3.3).
- **LSP:** implementação honra o contrato — mesmas garantias, sem lançar onde o contrato não prevê, sem exigir mais do que ele exige.
- **ISP:** interface pequena, com o que o cliente usa. Interface que obriga a implementar 10 métodos para servir a 2 se quebra.
- **DIP:** dependa de abstração. O **motor define o contrato**; banco, HTTP e lib implementam. `import` de client de infra dentro de regra de negócio é violação.
- **Motores:** a capacidade mora no motor e o chamador **só chama**. Encontrou a mesma regra fora dele (um `if` na tela, um cálculo repetido) → **absorve** conforme § 3.3, e o chamador passa a chamar.
- **Separação de camadas:** controller=HTTP, service=lógica, componente=UI. Lógica de negócio NUNCA no controller/componente.
- **Baixo acoplamento, alta coesão:** módulos injetáveis, independentes. Sem dependências circulares. Direção: `shared → api/web` ok; `api ↔ web` proibido.
- **KISS:** 5 linhas > 50 linhas.
- **YAGNI:** APENAS o que o plano especifica — e o plano já declarou o que NÃO seria construído (§ 3.2). Zero abstrações especulativas. 3 linhas similares > abstração prematura.
- **DRY:** confirme que não existe em shared/lib/components antes de criar novo — a tabela do § 3.1 é o contrato; achou algo que ela não previu, atualize o plano (ele é vivo durante o 7b).
- **Law of Demeter:** objeto só fala com vizinhos diretos. Evite `a.b.c.d.method()`.

> Desvio do que o plano decidiu em § 3.1/§ 3.2 é **decisão nova**: registre no plano (que é vivo em 7b) com o motivo. Desviar em silêncio é como a abstração especulativa entra sem ninguém decidir.

**Refatoração Obrigatória — a cada passada o código sobe** (`principles/SKILL.md` § Refatoração contínua):

Aplique os princípios acima (SOLID completo, DRY, KISS, YAGNI, LoD, Motores) ao código que **encontra**, não só ao que escreve. O alvo é o **perímetro do § 3.5** — e o perímetro não é só o arquivo que você editou:

| Entra no perímetro | Exemplo |
|---|---|
| arquivo **editado** | o que a task muda |
| arquivo **aberto só para entender** | você leu para saber como chamar |
| **dependente direto** que o grep revelou | quem importa o que você mexeu |
| o **caminho que o fluxo atravessa** | tela → hook → service → motor |

**Dentro do perímetro, refatore bastante — sem timidez.** Fora dele, é balde C (§ Follow-ups): o limite é o **caminho percorrido**, não o repositório.

Para CADA arquivo do perímetro, escaneie e eleve ao nível 10x:
- **Capacidade espalhada** → **absorve no motor** (§ 3.3) e o chamador passa a só chamar
- **Lógica duplicada** → extraia helper/util — e se for capacidade, é motor
- **Tamanho:** services >400 linhas, componentes >300, funções >40 → divida
- **Responsabilidade misturada** → separe (SRP); lógica+UI juntos → hook + componente burro
- **Naming que não diz a capacidade** → renomeie
- **`a.b.c.d` / ciclo / direção invertida** → contrato (LoD, DIP)
- **Imports mortos / variáveis não usadas** → remova
- **Comentários enganosos** → corrija/remova
- **TODO/FIXME resolúveis** → resolva agora ou deixe com contexto
- **Código morto** → delete completamente. Sem `_unused`, sem `// removed`, sem re-export
- **Padrão visual abaixo do nível 10x** (se tem UI) → eleve, não copie (`ui/SKILL.md`)

**Regra do saldo (é o que o gateway cobra):** nenhum arquivo do perímetro sai da passada no nível em que entrou. Ou ele **entrou já no nível 10x** — e você **declara isso** —, ou ele **subiu**.

**Banco de Dados (quando aplicável):**
- Migrações versionadas (`npx prisma migrate dev --name descritivo`)
- Prisma client — raw SQL apenas com justificativa
- Índices em campos consultados (WHERE, ORDER BY, JOIN)
- Relations com `onDelete` explícito (Cascade/SetNull/Restrict)
- Preços em centavos (integer). Datas como ISO string quando necessário.

**Segurança (em cada linha):**
- **Input validation:** `class-validator` (backend), Zod (frontend). Input NUNCA chega sem validação.
- **Auth explícito:** cada endpoint declara `@Roles()` ou `@Public()`. Sem exceção.
- **Zero secrets no código:** variáveis de ambiente via `ConfigService`.
- **Sanitize:** conteúdo do usuário sanitizado antes de renderizar (XSS).
- **Least Privilege:** select fields específicos, não `select: *`.

**Erros e Observabilidade:**
- `catch (e) {}` proibido — sempre log ou re-throw com contexto
- Erros estruturados com contexto (operação, input, o que falhou)
- Frontend: mensagens amigáveis, nunca objetos brutos
- Logs com contexto (sem dados sensíveis) + stack trace

**Performance:**
- Sem N+1 queries — use Prisma `include`/`select`. Nunca query em loop.
- Memoize computações caras, evite criação inline em JSX
- Cache: React Query (read-heavy), `unstable_cache` (server)
- Lazy load componentes pesados (`React.lazy`, dynamic imports)
- Trade-offs conscientes e documentados

#### Após cada task

- Marque no checklist do plano
- Auto-verifique: código satisfaz o use case?
- Diff mental: o que mudou vs. o que deveria? Efeitos colaterais?

#### TCs de Regressão (tocou = testa impacto)

Para CADA arquivo alterado:

1. **Mapear dependentes:** Grep — quem importa/usa este arquivo?
2. **Identificar features afetadas:** cada dependente serve qual feature do produto?
3. **Verificar TCs existentes:** `docs/05-test-cases/` já cobre?
4. **Criar TCs de regressão:** para features sem cobertura adequada, TCs seguindo Step 5

- **Atualize** `docs/05-test-cases/` — seção `## TCs de Regressão`
- Se impactar OUTRA feature → adicione TCs no arquivo dela
- **Não existe "mudança isolada"** — toda mudança tem raio de impacto
- Proporção: shared/util → muitos TCs. Componente folha → poucos.

### Gateways

#### 7a → 7b
- [ ] Plano autocontido (contexto + estratégia + mapa TC→código + checklist)
- [ ] i18n planejado se projeto tem i18n
- [ ] Referência de big apps citada para decisões UI/UX
- [ ] **§ 3.1 Reúso antes de criar preenchido** (DRY — grep feito; arquivo novo com justificativa)
- [ ] **§ 3.2 O que NÃO vamos construir preenchido** (YAGNI)
- [ ] **§ 3.3 Motores preenchida** — qual nasce, qual é estendido, que lógica dispersa será absorvida
- [ ] **§ 3.4 Design System preenchida** (se tem UI) — reusar/compor/promover, tokens, estados; zero literal planejado
- [ ] **§ 3.5 Perímetro preenchido** — o que será aberto/atravessado e o que sobe em cada arquivo
- [ ] Responsabilidade única declarada por arquivo do plano (SRP); pontos de extensão (OCP) e direção de dependência (DIP) declarados
- [ ] Artefato `kanban/07-implementation/<tópico>.md` existe com conteúdo substantivo
- [ ] **Princípios declarados** na linha do Gateway Check
- [ ] **Refatoração declarada** na linha própria do Gateway Check
- [ ] **Design declarado** na linha própria (se a feature tem superfície visual)

#### 7b → 8
- [ ] Todas tasks do checklist marcadas
- [ ] tsc/lint passam
- [ ] **Checklist de princípios percorrido por arquivo do perímetro** (SOLID: SRP >40 linhas, OCP, LSP, ISP, DIP · camadas · acoplamento/direção · KISS · YAGNI · DRY · LoD · Motores) — `principles/SKILL.md`
- [ ] **Refatoração do perímetro executada** com a **regra do saldo**: cada arquivo subiu, ou está declarado como já no nível 10x
- [ ] Capacidade espalhada **absorvida no motor**; chamadores passaram a só chamar
- [ ] **Se tem UI:** zero valor literal (tokens), composição > configuração, headless, **todos** os estados implementados, a11y AA, breakpoints do projeto — `ui/SKILL.md`
- [ ] Desvios de § 3.1/§ 3.2/§ 3.3/§ 3.4 registrados no plano (não em silêncio)
- [ ] TCs de regressão criados em `docs/05-test-cases/` para features dependentes impactadas
- [ ] **Princípios declarados** na linha do Gateway Check
- [ ] **Refatoração declarada** na linha própria do Gateway Check
- [ ] **Design declarado** na linha própria (se a feature tem superfície visual)

## Step 8 — Code Review

### Princípios neste step (`principles/SKILL.md`)

Revisar **contra a lista, princípio a princípio e por nome** — não por proxy, e **os cinco do SOLID**, não só o SRP. É o que a tabela `## Análise de Qualidade` do 8b cobra linha a linha (e a `## Análise de Design`, com superfície visual): a capacidade vazou do motor? existe segunda fonte da mesma regra? o contrato virou tripa exposta? o **saldo do perímetro** fecha — todo arquivo que a passada tocou subiu ou já estava no nível 10x? Violação encontrada entra na triagem A/B/C (§ Follow-ups): dentro do escopo, corrige agora; escopo novo, ledger.

### 8a — Revisão em Loop

```
REPETIR até 100% limpo:
  1. git diff main...HEAD — TODAS as mudanças
  2. Reler plano (7a) — código implementa tudo?
  3. Reler TCs (6) — todos cenários cobertos?
  4. Reler use cases (3) — edge cases tratados?
  5. Revisar CADA arquivo:
     - Código morto / imports não usados?
     - Bugs lógicos / edge cases?
     - Padrões do projeto violados? (consultar spec)
     - Segurança (XSS, injection, secrets, auth bypass)?
     - Consistência com codebase?
     - Consistência UI/UX — padrões visuais/interação existentes respeitados?
     - Performance (N+1, re-renders, memory leaks)?
     - Acessibilidade (se frontend)?
     - Erros (não genérico, não silencioso)?
     - Faz EXATAMENTE o que use cases pedem — nem mais, nem menos?
     - **Saldo do perímetro (§ 3.5 do plano):** todo arquivo que este trabalho abriu, leu ou atravessou saiu melhor do que entrou — ou está declarado como já no nível 10x?
     - **Princípios, UM A UM e POR NOME** (`principles/SKILL.md` — a MESMA lista contra a qual o 7b escreveu):
       · **SRP** — arquivo/função/componente faz uma coisa? >40 linhas sem extrair? lógica+UI juntos?
       · **OCP** — comportamento novo entrou como `if`/`case` no meio do que já existia, em vez de composição?
       · **LSP** — alguma implementação lança onde o contrato não prevê, ou exige mais do que ele exige?
       · **ISP** — interface obrigando a implementar o que o cliente não usa?
       · **DIP** — regra de negócio importando client de infra (Prisma, HTTP, lib) direto?
       · **DRY** — lógica que já existe em shared/lib/components foi duplicada? (grep, não memória)
       · **KISS** — dá pra fazer o mesmo com menos? abstração que só complica?
       · **YAGNI** — entrou algo que nenhum UC exige? o § 3.2 do plano foi furado sem registro?
       · **LoD / acoplamento** — `a.b.c.d`? dependência circular? direção `api ↔ web` violada?
       · **Motores** — a capacidade vazou do motor? existe **segunda fonte** da mesma regra? o contrato virou tripa exposta? o § 3.3 foi cumprido?
       · **Camadas** — lógica de negócio em controller/componente?
     - **Design, UM A UM e POR NOME** (`ui/SKILL.md` — só se a feature tem superfície visual):
       · **Tokens** — sobrou valor literal (`#hex`, `13px`) onde devia ser token?
       · **Atomicidade** — átomo conhecendo regra de negócio ou fazendo fetch?
       · **Composição > configuração** — >2 props booleanas de aparência?
       · **Headless** — comportamento e aparência no mesmo arquivo?
       · **Estados** — vazio, carregando, erro, sucesso, limite + hover/focus-visible/active/disabled/loading/selected: todos existem?
       · **Consistência semântica / Jakob** — mesma ação com nome, ícone e lugar diferentes? padrão inventado sem motivo escrito?
       · **Preservação de contexto** — voltar apaga? filtro/rascunho/scroll sobrevivem?
       · **A11y (AA)** — contraste, foco visível, teclado, nome acessível, alvo ≥24px?
       · **DS** — componente visual novo nasceu na pasta da feature em vez de ser **promovido**?
     - **Nível 10x:** o calibre dos big pop tech apps / líderes do domínio é o **piso** — isto está 10x acima dele, ou só "funciona"? ("O líder do domínio trocaria o dele por isto — e a tela dele por esta?")
  6. Problema encontrado → CLASSIFICAR e agir:
     - dentro do escopo documentado (docs 01-04) → **balde A**: corrigir IMEDIATAMENTE → voltar ao 1
     - escopo novo que este trabalho criou/tocou/expôs → **balde B**: registrar ABERTO no ledger
       (`## Follow-ups` do card de to-do) → vira ciclo /method próprio no Gate de Convergência
     - pré-existente e não tocado por este trabalho → **balde C**: registrar DESCARTADO + justificativa
     Na dúvida entre B e C → B. Ver § Follow-ups.
  7. PR existente → atualizar comentários/descrição
  8. Loop até ZERO issues de balde A — NÃO aceitar "bom o suficiente"
```

O Step 8 é o maior detector de follow-up do protocolo. **Nada do que aparecer aqui pode ficar só na cabeça ou só no relatório:** ou é corrigido agora (A), ou está `ABERTO` no ledger (B), ou está `DESCARTADO` com justificativa (C).

### 8b — Relatório

**Organizar** `kanban/08-code-review/` → criar/atualizar `<tópico>.md`:

```markdown
# Relatório de Code Review — <feature>

## Resumo
- Branch | Total de iterações do loop | Data | PR existente (sim/não)

## Arquivos Analisados
| Arquivo | Linhas ± | Tipo | Veredicto (✅ Limpo / ⚠️ Corrigido) |

## Problemas Encontrados e Corrigidos
### Issue #N — [título]
- Arquivo | Linha(s) | Severidade (🔴/🟡/🟢) | Categoria
- Descrição | Correção aplicada | Iteração

## Análise de Cobertura
- Stories atendidas | Use cases cobertos | TCs preparados | Gaps

## Análise de Segurança
Input validation | Auth | Dados sensíveis | Injection vectors (✅/❌/N/A)

## Análise de Qualidade (por princípio — `principles/SKILL.md`)
| Princípio | Veredicto | Evidência / o que foi corrigido |
|---|---|---|
| SRP (responsabilidade única, camadas) | ✅/⚠️ | |
| OCP (extensão sem editar o que funciona) | ✅/⚠️ | |
| LSP (implementação honra o contrato) | ✅/⚠️ | |
| ISP (interface do tamanho do cliente) | ✅/⚠️ | |
| DIP (depende de abstração, direção ao domínio) | ✅/⚠️ | |
| DRY (duplicação, reúso do § 3.1) | ✅/⚠️ | |
| KISS (complexidade) | ✅/⚠️ | |
| YAGNI (especulação, § 3.2 respeitado) | ✅/⚠️ | |
| Law of Demeter / acoplamento | ✅/⚠️ | |
| Motores (§ 3.3 — um dono por capacidade) | ✅/⚠️ | |
| Refatoração (saldo do perímetro, § 3.5) | ✅/⚠️ | |
| Naming + consistência com o codebase | ✅/⚠️ | |
| Nível 10x (o #1 do domínio é o piso) | ✅/⚠️ | |

Nenhuma linha pode ficar em branco — princípio sem veredicto = princípio não revisado.

## Análise de Design (por princípio — `ui/SKILL.md`) — só com superfície visual

| Princípio | Veredicto | Evidência / o que foi corrigido |
|---|---|---|
| Tokens = SSOT (zero literal) | ✅/⚠️ | |
| Atomicidade (nível certo, átomo sem regra) | ✅/⚠️ | |
| Composição > configuração | ✅/⚠️ | |
| Headless (lógica ⟂ apresentação) | ✅/⚠️ | |
| Estados (todos desenhados) | ✅/⚠️ | |
| Consistência semântica / Jakob | ✅/⚠️ | |
| Preservação de contexto | ✅/⚠️ | |
| A11y (WCAG AA) + responsivo (breakpoints, 320px) | ✅/⚠️ | |
| DS evoluiu (promoções registradas, nada solto na feature) | ✅/⚠️ | |

Feature sem superfície visual: escreva `N/A — sem superfície visual (derivado do Step 4)` **uma vez**, no lugar da tabela.

## Follow-ups Emitidos
| # | Achado | Balde (A/B/C) | Status | Destino |
(A = corrigido nesta revisão · B = ABERTO no ledger, vira ciclo /method · C = DESCARTADO + justificativa)
Nenhum? → "nenhum follow-up emitido neste review".

## Veredicto Final
- Status: ✅ APROVADO / ❌ REQUER correções
- Confiança: Alta/Média/Baixa (justificar se não Alta)
- Notas para o teste: pontos que exigem atenção
```

### Regras Rígidas

- **NÃO crie PR** — apenas revise e corrija
- **NÃO aprove PR** — apenas comente se existir
- **Atualizar PR existente** = PERMITIDO (`gh pr view` para verificar)
- Qualquer erro encontrado = corrigido imediatamente, não apenas documentado
- **Achado fora do escopo ≠ achado ignorado.** Não cabe corrigir aqui (é escopo novo) → **ledger**, não "anoto no relatório e sigo". Relatório documenta; ledger obriga a resolver.
- Relatório **brutalmente honesto**
- Veredicto ❌ → voltar ao 7b → rodar Step 8 inteiro novamente
- Sem o .md criado = step NÃO completo

### Gateway 8 → 9

- [ ] Veredicto **APROVADO** em 8b
- [ ] Zero issues pendentes (balde A)
- [ ] **`## Análise de Qualidade` preenchida por princípio** (SOLID: SRP, OCP, LSP, ISP, DIP · DRY · KISS · YAGNI · LoD · Motores · Refatoração · naming · nível 10x) — nenhuma linha em branco
- [ ] **`## Análise de Design` preenchida por princípio** (se tem UI) — nenhuma linha em branco
- [ ] **Princípios declarados** na linha do Gateway Check
- [ ] **Refatoração declarada** na linha própria do Gateway Check
- [ ] **Design declarado** na linha própria (se a feature tem superfície visual)
- [ ] Achados fora de escopo classificados no ledger (B ou C) — seção `## Follow-ups Emitidos` preenchida
- [ ] PR existente atualizado (se houver)
- [ ] Artefato `kanban/08-code-review/<tópico>.md` existe com conteúdo substantivo
- [ ] **Follow-ups detectados neste step:** N (registrados no ledger) / nenhum

## Step 9 — Testing

**Executar TODOS os TCs e verificar se o código funciona como esperado.**

### Artefato

- **Pasta:** `kanban/09-run-test/`
- **Arquivo:** `<tópico>.md`

### FRONT É FRONT — Regra Absoluta

**Se o protocolo diz "executar via front", você EXECUTA via front.** Sem exceções, sem atalhos, sem "deduzo do código".

**Por que:** teste via front é exponencialmente mais forte que análise de código. Captura:
- Bugs de integração (FE ↔ BE) que análise estática não vê
- Problemas de timing/race conditions
- Estados visuais quebrados, layout, responsividade
- Comportamento real do usuário no fluxo completo
- Bugs por dependências, cache, browser quirks

Análise de código captura: lógica isolada. **Análise de código NÃO substitui teste front. Nunca.**

### Pre-Flight Blocker Contract (OBRIGATÓRIO — ANTES de tudo)

```
PRE-FLIGHT (executar PRIMEIRO):
  1. Listar TODOS os N TCs do plano (docs/05-test-cases/)
  2. Para CADA TC, verificar:
     - Tenant / build / config necessário
     - Seed data / user type necessário
     - Hardware necessário (browser, AVD, iOS simulator)
     - Feature flag / locale / theme necessário
  3. Classificar cada TC:
     - READY (tudo disponível)
     - NEEDS SETUP (posso desbloquear: seed, config, user creation)
     - BLOCKED (não consigo: hardware, acesso, tenant indisponível)
  4. Reportar ao user ANTES de executar:
     "Pre-flight: X READY, Y NEEDS SETUP (vou preparar), Z BLOCKED por: [lista]"
  5. Se Z > 0:
     - PARAR e perguntar: "(a) desbloquear [como] (b) marcar NOT_RUN explícito (c) abortar"
     - Esperar resposta. NÃO roda nenhum TC até a resposta.
  6. Se Z == 0: preparar os NEEDS SETUP e prosseguir
```

**Por que:** impede racionalização retroativa. Setup identificado ANTES, não depois de já ter rodado os "fáceis".

### CRIE AS CONDIÇÕES (a regra mais importante do testing)

**Um TC precisa de condições específicas? CRIE-AS. Você está em ambiente LOCAL DEV com PODER TOTAL.**

- Precisa de usuário específico? → Cadastre via front, crie via DB, use painel admin
- Precisa de estado de dados? → Crie via UI, seed via SQL, chame API
- Precisa de role/plano/permissão? → Crie usuário + atribua via DB ou admin
- Precisa de estado no DB? → SQL insert, UI, seeder
- Precisa de feature flag / config? → Configure via admin, DB, env var
- Precisa de segundo usuário? → Crie segunda conta
- Precisa de estado populado/vazio/parcial? → Monte explicitamente

**Documente o que criou** em `## Test Environment Setup` no doc do step 9.

"Não tenho as condições certas" NUNCA é desculpa — crie-as.

### Prediction-Execution-Reconciliation (OBRIGATÓRIO)

#### Ao iniciar execução, declarar:

```markdown
## Predição
Vou executar N TCs. Vou produzir N evidências (screenshots com path).
TCs a executar: [lista nominal completa]
```

#### Ao finalizar, ANTES de qualquer report:

```markdown
## Reconciliação
- Predicted: N TCs
- Evidence collected: M evidências com path (TC de texto de IA: screenshot **+** transcrição integral)
- Delta: N - M
- TCs sem evidência: [lista] → status = NOT_RUN (não "coberto por", não "equivalente a")
```

**Se delta > 0: TCs sem evidência são automaticamente NOT_RUN. Não existe "covered by other means".**

### Regra de Report: Resposta Binária

Quando o user perguntar "tudo ok? all tc passed?", a **primeira frase** é obrigatoriamente:

```
"X de N PASSED via front. Y NOT_RUN. Z FAILED. Net: PASS|FAIL|INCOMPLETE."
```

**Proibido como primeira frase:** "Mostly yes", "Honest answer:", "With caveats", "Sim, mas...", "Quase tudo", "It depends". Detalhes vêm DEPOIS da frase numérica.

### Três Regras de Integridade

**1. Disclosure ≠ compliance.**
Dizer "eu não rodei X" NÃO torna OK marcar X como PASSED. Disclosure honesta de uma violação AINDA É uma violação. Disclosure só conserta mentir; não conserta cheating.

**2. HOW vs WHAT — separação explícita.**
Feedback do user sobre pragmatismo ("vai mais rápido", "evita loops lentos", "faz batching") aplica APENAS a **HOW** (otimização: rodar os mesmos N TCs mais eficientemente). NUNCA aplica a **WHAT** (rodar menos TCs).

**3. Forbidden CONCEPTS.**
Qualquer sentença que aplique os seguintes conceitos a um status de TC = violação automática:
- "verificado/coberto/equivalente por análise estática/leitura de código"
- "redundante combinatoriamente com outro TC que já rodei"
- "low risk / trivial, então pulei"
- "deveria funcionar porque o código diz X"
- "per user's pragmatism feedback, pulei"
- "o TC é N/A neste build/tenant"

Se o TC é "N/A neste build" → deveria ter sido BLOCKED no pre-flight, não pulado silenciosamente.

### TCs em Tasks — Duas Camadas de TaskCreate (OBRIGATÓRIO)

**SEMPRE crie tasks em DUAS camadas: uma por GRUPO temático E uma por cada TC INDIVIDUAL dentro do grupo.**

```
PROCEDIMENTO (antes de qualquer TC):
  1. Ler TODOS os TCs de docs/05-test-cases/ (feature + regressão)
  2. Contar total de TCs (N)
  3. Agrupar TCs por tema/área (~10 por grupo)
  4. CAMADA 1 — Para CADA grupo, criar 1 TaskCreate:
     - TaskCreate: "Grupo 01: TC-001 a TC-010 — [área/tema]"
     - TaskCreate: "Grupo 02: TC-011 a TC-020 — [área/tema]"
  5. CAMADA 2 — Para CADA TC individual, criar 1 TaskCreate SEPARADO:
     - TaskCreate: "TC-001: [nome do TC]"
     - TaskCreate: "TC-002: [nome do TC]"
     - ... (1 invocação por TC, SEM array/lista, SEM bundling)
  6. TaskUpdate nos DOIS níveis:
     - Grupo: in_progress ao iniciar primeiro TC, completed quando TODOS do grupo passarem
     - TC individual: in_progress ao iniciar, completed após PASSED com evidência
```

**Sem TaskCreate em AMBAS as camadas = step 9 NÃO iniciou.**

### Audit Pré-Execução — BLOQUEANTE (publicar no chat ANTES do primeiro TC rodar)

**Depois de criar os TaskCreate das duas camadas e ANTES de tocar em qualquer ferramenta de teste (Playwright, emulator, curl), publique este bloco visualmente no chat. Audit ausente do chat = execução não iniciou.**

```markdown
## Audit Pré-Execução — TaskCreate 1:1
- TCs em `docs/05-test-cases/<tópico>.md`: **N**
- TaskCreate de grupo criados: **G** — listar (TaskID → grupo)
- TaskCreate individuais criados: **M** — listar (TaskID → TC-ID)
- Ratio M == N? ✅ SIM / ❌ NÃO — TCs sem task individual: [listar TC-IDs]
- Ratio G cobre todos os TCs? ✅ SIM / ❌ NÃO
- **Veredicto:** ✅ LIBERADO para executar / ❌ BLOQUEADO — criar tasks faltantes AGORA e republicar
```

**❌ BLOQUEADO = PROIBIDO executar qualquer TC.** Crie as tasks que faltam, republique o audit ✅, só então inicie o Loop. Executar TC sem o audit ✅ visível no chat = violação automática do protocolo (cheating visível, não escondido).

| Racionalização proibida | Realidade |
|------------------------|-----------|
| "Já declarei nas Duas Camadas, audit é redundante" | NÃO. Declaração em prosa ≠ audit publicado com números. BLOQUEADO. |
| "Conto os TaskCreate de cabeça, não preciso publicar" | NÃO. Audit silencioso = audit inexistente. BLOQUEADO. |
| "Vou começar a rodar enquanto crio as tasks que faltam" | NÃO. Audit ✅ antes de TUDO. BLOQUEADO. |
| "Faltam 2 de 30, começo pelos 28 que têm task" | NÃO. Atomicidade. 100% ou BLOQUEADO. |

### Loop de Execução

```
REPETIR até todos passarem SEM NENHUMA MUDANÇA:
  1. tsc/lint — se falhar, corrigir antes de testar
  2. Consultar notas do relatório 8b — focar nos pontos críticos
  3. Para CADA batch (task de grupo):
     a. TaskUpdate grupo → in_progress
     b. CADA TC do batch: executar DO ZERO via ferramenta apropriada
     c. PASSED (com screenshot/evidência) ou FAILED (motivo)
        → ao PASSED: marque `- [x]` na seção `## Test Cases (QA)` do card `kanban/06-todo/<tópico>.md` (TC-N + path do screenshot). FAILED: mantém `- [ ]` + nota do motivo.
        → TC de **texto gerado por IA** (Step 5): a evidência é a saída REAL — **transcrição integral** colada
          em `kanban/09-run-test/<tópico>.md`, com o screenshot junto (§ Evidência de texto);
          texto que lê **igual ou pior** que a referência #1 do spec = FAILED. "O código rodou e o texto apareceu" NÃO é PASSED.
     d. Bug → CLASSIFICAR (ver § Follow-ups):
        - dentro do escopo documentado → **balde A**: corrigir AGORA. ATENÇÃO: qualquer fix invalida
          o ciclo → RESETE todos os `- [x]` do checklist de QA para `- [ ]` (vai retestar TUDO do zero)
        - escopo novo que este trabalho expôs → **balde B**: registrar ABERTO no ledger
          (`## Follow-ups` do card de to-do). NÃO corrige aqui — vira ciclo /method no Gate de Convergência
        - pré-existente e não tocado → **balde C**: DESCARTADO + justificativa
        Na dúvida entre B e C → B. Balde B **nunca** vira "bug conhecido, seguimos".
     e. Todos TCs do batch PASSED → TaskUpdate grupo → completed
  4. Organizar kanban/09-run-test/<tópico>.md
  5. Algum FAILED com fix → volta ao Step 8 (Code Review) → retesta TUDO
  6. Todos PASSED sem nenhuma mudança de código → Step 10
```

#### Checklist de QA no card de to-do — atualizar ao vivo (retomada)

O card `kanban/06-todo/<tópico>.md` tem a seção `## Test Cases (QA)` com um `- [ ]` por TC (semeada no Step 6). **Atualize-a em tempo real:** TC PASSED → `- [x]`; fix de código → reset tudo para `- [ ]`. É o que permite **parar e retomar** — ao voltar, abra o card e os `- [ ]` restantes são exatamente o que falta rodar. O `kanban/09-run-test/` guarda a evidência (screenshot/motivo); o checklist guarda o status de bate-pronto. No Step 10 este checklist final é copiado para o done.

### Ferramenta por Contexto

| Contexto | Ferramenta | Como |
|----------|-----------|------|
| Mobile Android | Android emulator via AVD | Boot → instalar app → executar TC como usuário |
| Mobile iOS | iOS simulator (Xcode) ou device físico | Boot → instalar app → executar TC como usuário |
| Web (Next.js/frontend) | MCP Playwright (default `pw4`, pool `pw#` p/ fallback) | `mcp__playwright-4__*` por padrão (navigate, click, snapshot, screenshot) — ver "Pool Playwright" abaixo |
| API/Backend | curl/httpie ou test suite | Endpoints reais ou suite existente |

**OBRIGATÓRIO: Mobile = Android E iOS, sempre.** Toda feature mobile gera execução nas duas. Se iOS indisponível na máquina, peça ao usuário antes de marcar PASSED.

#### Pool Playwright — Fallback Automático (`pw#`)

Existem **múltiplas instâncias** do MCP Playwright disponíveis: `mcp__playwright-0__*`, `mcp__playwright-1__*`, … até `mcp__playwright-5__*`. Cada uma controla um browser próprio e **só atende uma instância do Claude por vez** (outra sessão rodando em paralelo pode estar usando a mesma).

O **/method usa `mcp__playwright-4__*` como instância designada** (default). Os outros índices são apenas fallback quando o pw4 estiver ocupado.

**Regra:** se o `pw#` que você tentar usar já estiver **ocupado por outra instância** (erro tipo "browser already in use" / "session busy" / "target closed", a chamada falha, ou o `browser_snapshot` mostra uma página que não é a sua), **passe automaticamente para o próximo índice livre** — sem perguntar ao usuário e sem marcar o TC como BLOCKED/SKIP.

```
PROCEDIMENTO (ao iniciar testes via front):
  1. Use a instância designada do /method: mcp__playwright-4__browser_navigate
  2. pw4 ocupado / erro de sessão? → passe para o próximo índice livre do pool: -5, -3, -2, -1, -0
  3. Achou uma livre → fixe-a para TODOS os TCs desta rodada (não troque no meio)
  4. SÓ se as 6 estiverem ocupadas → pare e avise o usuário
  5. Registre qual pw# você usou em `## Test Environment Setup`
```

"Playwright ocupado" **NUNCA** vira SKIP/BLOCKED enquanto houver outro índice livre no pool — buscar a instância livre é fallback automático, parte do "CRIE AS CONDIÇÕES".

### Regras Rígidas

- **NUNCA SKIP ou BLOCKED** — resolva o impedimento: crie o usuário, insira dado no DB, configure flag, suba o serviço, instale dep. Pergunte ao usuário somente após esgotar tentativas.
- **FORCE via FRONT** — cada TC como usuário real: abrir app/browser, navegar, clicar, preencher, validar com screenshot. Sem atalhos de API, sem "verificar no código".
- **Mobile = Android E iOS** — feature mobile testada em apenas uma plataforma = não testada.
- **NUNCA marque PASSED apenas com tsc** — tsc verifica tipos, não comportamento.
- **Qualquer fix de código** → fix invalida review → volta ao Step 8 → depois retesta TUDO no Step 9.

### Princípios neste step (`principles/SKILL.md`)

O Step 9 não escreve feature — mas escreve **fixes**, e é aí que o protocolo mais escorrega: sob pressão de "fazer o TC passar", nasce o remendo.

- **Todo fix obedece os princípios.** Fix é código: SOLID (os cinco), DRY, KISS, YAGNI, LoD e Motores valem igual. Não existe "fix rápido só pra passar".
- **Workaround que faz o TC passar violando os princípios é FAILED disfarçado.** Duplicar lógica pra contornar, enfiar regra de negócio no componente, `if` especial pro cenário do teste — o TC até fica verde, a feature fica pior. Marque FAILED e conserte de verdade.
- **Motor** — o fix vai **para o motor**, onde a regra mora; nunca de remendo no chamador. Corrigir na tela o que o motor calcula errado cria a segunda fonte da regra, que é exatamente o defeito.
- **Refatoração** — fix novo **reabre o perímetro do fix**: os arquivos que ele tocou entram na regra do saldo como qualquer outro.
- **Design** (se tem UI) — a evidência é por **estado × breakpoint**, não só o happy path em desktop: screenshot prova que a tela existe, a comparação com o DS e com o benchmark prova que está certa. **Remendo de CSS que faz o TC passar é FAILED disfarçado** (`ui/SKILL.md`).
- **Texto de IA** (se tem essa superfície) — a evidência é a **saída inteira transcrita**, não o screenshot do começo. **Instrução nova no prompt só para aquele caso passar é FAILED disfarçado** — é o remendo de CSS da saída de IA. O fix vai para onde o texto nasce (prompt de sistema, template, dado do RAG, modelo), nunca de emenda no chamador.
- **Fix → volta ao Step 8**, que revisa esse fix contra a lista de princípios como qualquer outro código. Sem atalho.
- **KISS na investigação:** o fix mais simples que resolve a causa — não o mais engenhoso, nem o que "já aproveita e melhora" outra coisa (isso é ledger).

### Resultado de TC — Binário

- **PASSED** = resultado esperado atingido + evidência (screenshot/dump)
- **FAILED** = qualquer outra situação, incluindo "não consegui completar o fluxo"

Não existe meio-termo. Não existe "PASSED (partial)". Não existe "herança" entre TCs.

### Audit Pós-Execução — BLOQUEANTE (publicar no chat ANTES do Gateway 9 → 10)

**Quando achar que o Loop terminou e ANTES de publicar o Gateway 9 → 10, publique este bloco. Audit ausente = step 9 não terminou.**

```markdown
## Audit Pós-Execução — Execução 1:1
- Tasks individuais esperadas (do Audit Pré): **N**
- Tasks individuais com status `completed`: **C** — listar (TaskID → TC-ID)
- TCs com evidência (screenshot path em `kanban/09-run-test/<tópico>.md`): **E** — listar (TC-ID → path)
- TCs de **texto gerado por IA** com **transcrição integral** colada em `kanban/09-run-test/<tópico>.md`: **T** — listar (TC-ID → bloco) · `N/A` sem essa superfície
- Ratio C == N? ✅ / ❌ — tasks pendentes: [listar TaskIDs]
- Ratio E == N? ✅ / ❌ — TCs sem screenshot: [listar TC-IDs]
- Ratio T == TCs de texto de IA? ✅ / ❌ / N/A — TCs só com screenshot: [listar TC-IDs]
- Status agregado: **N PASSED**, **0 FAILED**, **0 NOT_RUN**, **0 SKIPPED**, **0 BLOCKED** ✅ / ❌
- Último ciclo sem mudanças de código? ✅ / ❌
- Follow-ups detectados no Step 9: **F** — todos classificados no ledger (A/B/C)? ✅ / ❌
- **Veredicto:** ✅ LIBERADO para Gateway 9 → 10 / ❌ BLOQUEADO — voltar ao Loop e executar pendentes
```

> Follow-up de balde B **não bloqueia o Gateway 9 → 10** (o TC da feature passou) — ele bloqueia o **Gate de Convergência** logo depois, na entrada do Step 10. Registrar aqui é o que garante que ele chegue lá.

**❌ BLOQUEADO = PROIBIDO publicar Gateway 9 → 10 e PROIBIDO escrever qualquer resumo / report de conclusão.** Volte ao Loop, execute os TCs pendentes, produza evidência, republique o audit.

| Racionalização proibida | Realidade |
|------------------------|-----------|
| "28 de 30 passaram, o resto é trivial, avanço" | NÃO. Delta > 0 = BLOQUEADO. Atomicidade. |
| "O TC X é redundante com Y que já rodou" | NÃO. Sem herança. Execute X. BLOQUEADO. |
| "Marco os 2 faltantes como PASSED e documento depois" | NÃO. Sem evidência = NOT_RUN. BLOQUEADO. |
| "Reporto parcial enquanto os últimos rodam" | NÃO. Audit ✅ antes de QUALQUER report. BLOQUEADO. |
| "Publico Gateway sem Audit, audit é só formalidade" | NÃO. Audit é pré-requisito formal do Gateway. BLOQUEADO. |
| "Dupliquei a lógica pro TC passar, depois eu limpo" | NÃO. Workaround que viola os princípios = FAILED disfarçado (`principles/SKILL.md`). BLOQUEADO. |
| "O screenshot do chat já mostra a resposta" | NÃO. Screenshot recorta: truncamento, repetição e fecho ficam fora do quadro. Sem transcrição integral, o TC de texto é NOT_RUN. BLOQUEADO. |
| "Colei o começo e pus '[…]' no resto" | NÃO. Cortar a evidência é escolher o que o auditor pode ver. Integral ou nada. BLOQUEADO. |

### Evidência visual — estado × breakpoint (feature com superfície visual)

Um screenshot do happy path em desktop é a fatia que nunca quebra. Para TC que atravessa tela, a evidência cobre:

- **Estados:** vazio · carregando · erro · sucesso · limite (lista longa, texto longo, sem permissão) — os mesmos que o UC listou no Step 3.
- **Breakpoints do projeto**, com **320px** como piso.
- **Interação:** foco visível por teclado nos controles do fluxo.

Documente os paths em `kanban/09-run-test/<tópico>.md` identificando **qual estado e qual breakpoint** cada arquivo prova. Estado que o UC listou e que não tem evidência = TC incompleto, não PASSED.

### Evidência de texto — a saída inteira, colada (feature com superfície de texto gerado por IA)

Screenshot de chat prova que a resposta **apareceu**; não prova que ela **lê bem**. Screenshot recorta: o resto da resposta está abaixo da dobra, o truncamento fica fora do quadro, a repetição do terceiro parágrafo não cabe na imagem. Para o TC de qualidade do texto (Step 5), a evidência é a **saída inteira, transcrita**, colada em `kanban/09-run-test/<tópico>.md` — o screenshot fica junto, como prova de que ela saiu do produto, e não do seu resumo.

```markdown
### TC-N — saída real (transcrição integral)
**Entrada:** <o que o usuário digitou / o estado que disparou>
**Saída:**
> <a resposta COMPLETA, do primeiro ao último caractere — sem cortar, sem "[…]", sem parafrasear>
**Screenshot:** <path>
**Vs. referência #1 (<nome do spec>):** <como ela responderia isto, e onde a nossa perde ou ganha>
```

**Julgue contra o que o Step 4 escreveu** (`docs/04-spec/<tópico>.md` § Texto gerado por IA — tom e persona, concisão, formatação, idioma do usuário, sem truncamento, sem placeholder, sem alucinação, sem robótico), critério a critério. A lista que vale é a do spec: critério que ele acrescentou entra, critério que ele não pediu sai — **a fonte é uma só**, aqui não nasce segunda lista.

**Texto que lê igual ou pior que a referência #1 é FAILED**, nunca "PASSED com ressalva": o teste é falho mesmo com o código certo. Os demais defeitos entram na triagem A/B/C como qualquer achado.

**Fix de texto vai para onde o texto nasce.** Enfiar instrução no prompt até aquele caso passar é o **remendo de CSS da saída de IA**: o TC fica verde e a próxima pergunta volta a ler mal. O fix trata a causa — prompt de sistema, template, o dado que o RAG entregou, o modelo escolhido — e reabre o perímetro como qualquer outro fix.

Feature sem essa superfície: escreva `N/A — sem superfície de texto gerado por IA (derivado do Step 4)` **uma vez**, no lugar da seção.

### Gateway 9 → 10

Ver § Gateways seção "Gateway 9 → 10" (detalhado).
Inclui as linhas de **princípios**, **refatoração** e **design**, o critério de evidência por estado × breakpoint e o de **transcrição integral da saída de texto de IA**.

## Step 10 — Done

> **Step terminal.** É o último step do protocolo — **não existe Step 11**. Aqui a feature é movida para `done` (card promovido) e **só então** o trabalho é **commitado** — num único commit — na branch atual. **Ordem é contrato: convergir primeiro, mover depois, commitar por último.**
>
> Terminal **não** quer dizer sem gateway: o Step 10 tem gateway de **entrada** — o **Gate de Convergência** (zero follow-ups abertos). Ele roda ANTES de escrever o done doc, ANTES do `rm` e ANTES do commit.

### Princípios neste step (`principles/SKILL.md`)

O done doc registra **o que os princípios produziram** — as 6 linhas da seção § Conteúdo — Resumo Final: o que foi reutilizado (DRY), o que foi descartado (YAGNI), quais motores nasceram, cresceram ou absorveram, o que a refatoração do perímetro elevou, o que o DS ganhou e o que o `.claude/patterns.md` ganhou. Sem elas o registro mente sobre **como a feature ficou**.

### Pré-requisitos (AMBOS)

1. Gateway 9 → 10 **LIBERADO** (ver § Gateways).
2. **Gate de Convergência ✅ CONVERGIU** publicado no chat (ver abaixo).

### Artefato

- **Pasta:** `kanban/10-done/`
- **Arquivo:** `<tópico>.md`

### Conteúdo — Resumo Final

- **Links para todos os docs** (Steps 1-9):
  - Problema: `docs/01-problem/<tópico>.md`
  - User Stories: `docs/02-user-stories/<tópico>.md`
  - Use Cases: `docs/03-use-cases/<tópico>.md`
  - Spec: `docs/04-spec/<tópico>.md`
  - To Do: (deletado — ver abaixo)
  - Test Cases: `docs/05-test-cases/<tópico>.md`
  - Plano: `kanban/07-implementation/<tópico>.md`
  - Code Review: `kanban/08-code-review/<tópico>.md`
  - Run Test: `kanban/09-run-test/<tópico>.md`
- **Arquivos de código alterados** — lista completa
- **Status final dos TCs** — **checklist completo por TC** (`- [x] TC-N`), copiado da seção `## Test Cases (QA)` do card de to-do, + contagem total (todos PASSED)
- **Ledger de Follow-ups final** — tabela completa copiada da seção `## Follow-ups` do card de to-do (todos `RESOLVIDO-NO-STEP` / `RESOLVIDO-POR-CICLO` / `DESCARTADO`, **zero `ABERTO`**), com link do done doc de cada ciclo
- **Conteúdo do todo incorporado** — tasks completadas do `kanban/06-todo/`
- **Princípios — o que produziram** (`principles/SKILL.md`), 6 linhas, sem prosa:
  - **Reutilizado (DRY):** o que existia e foi estendido em vez de recriado (do § 3.1 do plano)
  - **Descartado (YAGNI):** o que foi considerado e não construído (do § 3.2 do plano)
  - **Motores (§ 3.3):** quais nasceram, quais cresceram, que lógica dispersa foi absorvida
  - **Elevado (refatoração do perímetro, § 3.5):** o que estava abaixo do nível 10x no caminho percorrido e subiu — e o que já estava no nível 10x
  - **DS ganhou** (`ui/SKILL.md`, se tem UI): tokens e componentes **promovidos**, padrões visuais elevados. Nada promovido → escreva que a feature coube no DS existente.
  - **Patterns ganhou** (`.claude/patterns.md`): padrões de código **promovidos** no Step 4. Nada promovido → escreva que a feature coube nos padrões existentes.
- **Commit SHA** — hash do commit criado neste step (ver abaixo)

> Sem essas 6 linhas o done doc mente por omissão: registra o que a feature faz e esconde **como ela ficou** — que é justamente o que o próximo `/method` (e o review do `/homolog`) precisa saber. A linha do DS é o que impede a próxima feature de reinventar o que esta acabou de promover.

### Gate de Convergência — ANTES de qualquer ação do Step 10

> **O protocolo fecha SECO.** Nem o `rm` do card, nem o commit, nem resumo de conclusão acontecem enquanto houver follow-up aberto. Publique este bloco no chat:

```markdown
## Gate de Convergência — Follow-ups
- Itens no ledger: **T** (A: **a** · B: **b** · C: **c**)
- Ciclos de follow-up executados: **N** — listar (Fn → `kanban/10-done/<f>.md`)
- Itens **ABERTOS**: **0**
- Itens novos detectados no último passe: **0** → **passe seco**
- **Veredicto: ✅ CONVERGIU** / ❌ BLOQUEADO — abertos: [listar Fn]
```

**❌ BLOQUEADO →** para CADA item aberto, **invoque o `/method`** (Skill tool — `furi-build:method`) e rode-o **COMPLETO** (Step 1→10, com `/solve`, tópico e artefatos próprios) — **sem commitar** (só o ciclo raiz commita) — marque `RESOLVIDO-POR-CICLO` no ledger e **republique o Gate**. Ciclo que gerar novo follow-up ⇒ passe não foi seco ⇒ o loop continua.

Triagem A/B/C, formato do ledger e racionalizações: § Follow-ups.

### Ações obrigatórias (ORDEM É CONTRATO — mover primeiro, commitar por último)

> **Mover o card é o PRIMEIRO ato. O commit é o ÚLTIMO — e é UM SÓ.**
> O commit fecha o protocolo capturando TUDO de uma vez: código + docs (01-09) + card de done + remoção do card de todo. Por isso ele vem **depois** de mover o card. Código pronto de steps anteriores fica **não-commitado** até aqui — nada de commit adiantado. Commitar antes de mover força um segundo commit (commit → move → commit de novo); é exatamente isso que esta ordem elimina.

#### 1. Mover o card (promover `06-todo` → `10-done`) — PRIMEIRO

**Antes de apagar:** copie do card de to-do para dentro do done (o card some, o registro sobrevive):
- a seção `## Test Cases (QA)` — checklist final, tudo `- [x] TC-N`, registro permanente do que foi testado;
- a seção `## Follow-ups` — ledger final, zero `ABERTO`, registro permanente do que apareceu e como foi resolvido ou por que foi descartado.

Escreva o card de done em `kanban/10-done/<tópico>.md` (com o resumo acima, incluindo o checklist por TC) e **delete** o card da coluna to-do:

```bash
rm kanban/06-todo/<tópico>.md
```

Todo folder = só trabalho ativo. Feature done → o card sai de `06-todo` e passa a viver em `10-done`. **No kanban, a coluna é o status.**

#### 2. Commit na branch atual — POR ÚLTIMO, UM ÚNICO COMMIT

Só agora, com **o card já movido e o done doc já escrito**, faça **um único commit** de tudo (código + artefatos) na **branch atual** (NUNCA crie branch — ver `SKILL.md`):

```bash
cat .claude/ship-setup/setup.md 2>/dev/null || cat .claude/ship-setup/setup.local.md 2>/dev/null   # § Commit: convenção + onde a key entra (do time, ou só meu; lido por caminho)
git add -A
git commit -m "feat(<escopo>): <descrição da feature>"
```

- Mensagem na **convenção do § Commit do `.claude/ship-setup/setup.md`**, quando o arquivo existe. Sem ele, **Conventional Commits** (`feat` / `fix` / `refactor` / `docs` … `(<escopo>)` = área da feature) — o default de sempre. A **key do card** entra onde o § Commit disser (no escopo `feat(NIV-12): …`, no início `NIV-12 feat: …`, no fim `feat(login): … (NIV-12)`, em trailer `Jira: NIV-12`, ou não entra) e é a do **card ativo** — o argumento com que o `/method` foi invocado (`/work KEY-N` passa o dele); sem argumento com key, a do **nome da branch atual** (`niv-12-login` → `NIV-12`); nenhuma das duas → commit sem key, dito no report. Numa branch que acumula cards o nome é só o do 1º: o commit de cada card leva a **própria** key — é assim que o Jira mostra o commit no card certo e que o `/pull-request` descobre os cards da branch. O `/method` **lê** o setup e **não o cria**: quem cria é o `/setup` (`furi-ship`) — ou o próprio time, à mão.
- **`git add -A` pega tudo de uma vez:** código, docs (01-09), card de done e a remoção (`rm`) do card de todo entram no MESMO commit.
- **NUNCA commite antes de mover o card.** Commitar o código primeiro e só depois mover o card força um segundo commit — exatamente o erro que esta ordem evita.
- **SHA é nota de bastidor:** o commit já É o registro (está no `git log`). Anotar o SHA no done doc é opcional e **não justifica um segundo commit** só para gravá-lo.

> **Escopo do commit:** só o `/method` completo — e, dentro dele, **só o ciclo RAIZ** — commita. **`/fast` para no Step 8 (Code Review) — nem chega aqui.** O **`/todo`** faz a promoção do card (`06`→`10`) e grava `tests: passed`, mas **NÃO commita**. **Ciclo de follow-up aninhado** roda este Step 10 inteiro (done doc + `rm` do card) **menos o commit** — se ele commitasse, o `git add -A` varreria o código não-commitado da feature-pai para dentro do commit errado. O commit único do ciclo raiz cobre tudo: a feature + todos os ciclos de follow-up (código, docs de todos os tópicos, todos os cards de done, todas as remoções de to-do).

### Red Flags — PARE (cada uma gera o segundo commit que queremos evitar)

- "Step 9 passou, deixa eu commitar o código já" → NÃO. O commit é o ÚLTIMO ato, depois de mover o card.
- "Commito o código, movo o card, e commito o card depois" → NÃO. Mover PRIMEIRO; UM commit no fim.
- "Preciso gravar o SHA no done doc → commito de novo" → NÃO. O SHA vive no `git log`; não vale um segundo commit.
- "O código já estava pronto, então commitei lá atrás" → NÃO. Código de steps anteriores espera o step 10 e entra no commit único, junto com o card.
- "Commito a feature agora e resolvo os follow-ups num commit depois" → NÃO. Convergência vem ANTES do commit. Dois commits é exatamente o que esta ordem elimina.
- "O ciclo de follow-up terminou, commito ele antes de voltar pra feature" → NÃO. Ciclo aninhado não commita. Um commit, no fim, no ciclo raiz.

### Checklist Final (step terminal — sem gateway de saída)

- [ ] **Gate de Convergência ✅ CONVERGIU** publicado no chat — zero follow-ups `ABERTO`, passe seco confirmado
- [ ] Cada item de balde **B** fechado por ciclo `/method` próprio (invocado via Skill tool; 1→10, com `/solve`, sem commit) com done doc linkado
- [ ] Cada item de balde **C** com justificativa registrada no ledger
- [ ] Done doc referencia todos os artefatos (docs 1-9) e contém o **ledger de follow-ups final**
- [ ] Done doc registra as **6 linhas de princípios**: reutilizado (DRY) · descartado (YAGNI) · **motores** · **elevado** (refatoração do perímetro) · **DS ganhou** (se tem UI) · **Patterns ganhou**
- [ ] Card de `kanban/06-todo/<tópico>.md` deletado (card movido para `10-done`) — **ANTES do commit**
- [ ] Artefato `kanban/10-done/<tópico>.md` existe com conteúdo substantivo
- [ ] **UM único commit** na branch atual (Conventional Commits) capturando código + docs (01-09) + card de done + remoção do todo + **todos os ciclos de follow-up** — sem commit adiantado do código, sem commit extra depois

Tudo ✅ → feature encerrada. **Fim do protocolo.**

## Gateways

**Cada transição entre steps exige um Gateway Check explícito publicado no chat ANTES de iniciar o próximo step. Sem check visível = step não transitou.**

### Princípios (Ferro)

1. **Binário.** ✅ LIBERADO ou ❌ BLOQUEADO. Sem "quase", sem "mostly", sem "faço depois".
2. **Visível.** Publicado no chat ANTES de transitar. Gateway silencioso = não existe.
3. **Bloqueante.** ❌ → volta ao step atual e corrige. Nunca "pula pra arrumar depois".
4. **Atômico.** Não existe bypass granular. Pular 1 critério = pular o gateway. Ou 100% ou BLOQUEADO.
5. **Universal.** "Não se aplica nesta feature" não é opção. Justifique no veredicto ou cumpra.
6. **Sem ponta solta.** Todo Gateway Check declara os follow-ups detectados no step. O que apareceu vai para o **Ledger de Follow-ups** classificado (A/B/C) — nunca fica só na cabeça, nunca vira "depois". Ver § Follow-ups.
7. **Princípios em todo gateway.** Todo Gateway Check declara como **SOLID · DRY · KISS · YAGNI · LoD · Motores** foram aplicados no step, pela lente daquele step (`principles/SKILL.md`). Princípio não declarado = princípio não aplicado. **SOLID são cinco** (SRP, OCP, LSP, ISP, DIP) — declarar só o SRP não cumpre.
8. **Refatoração em todo gateway.** Todo Gateway Check declara o que a passada **elevou** no perímetro (`principles/SKILL.md` § Refatoração contínua). Linha ausente = gateway não publicado; "nada a elevar" exige dizer o que foi verificado.
9. **Design em todo gateway de feature com UI.** Feature com superfície visual declara a linha de design (`ui/SKILL.md`). Superfície visual é **derivada no Step 4**, nunca declarada pelo usuário — e a ausência dela se declara **uma vez**, no Gateway 4→5.
10. **Texto de IA nos três gateways em que existe o que julgar.** Superfície de texto gerado por IA é **derivada no Step 4** (a partir do produto: core de IA ⇒ nasce `sim`), como a visual, e a ausência dela também se declara **uma vez**, no Gateway 4→5. É cobrada onde há matéria: **4 → 5** (a derivação — e, se `não`, a saída nomeada), **5 → 6** (o TC com resultado na qualidade do texto lido) e **9 → 10** (a saída REAL, lida). Entre 6 e 8 não existe saída para ler: "o prompt está no arquivo" não é verificável como "lê bem", e critério que não pode ser reprovado ensina a assinar sem olhar.

> Racionalizações para pular Gateway → ver § Rationalizations categoria 1, 3, 10 e 11.

### Formato Padrão (publicar em chat)

```markdown
## Gateway Check — Step N → Step N+1
- [ ] Artefato existe? (docs/XX-foo/<tópico>.md criado/atualizado com conteúdo substantivo)
- [ ] Critério específico 1 do gateway (ver tabela)
- [ ] Critério específico 2
- [ ] Critério específico 3
- **Princípios (SOLID · DRY · KISS · YAGNI · LoD · Motores):** ✅ aplicados — [1 linha: o que a lente deste step cobrou — ver `principles/SKILL.md`]
- **Refatoração (tudo por onde passou):** ✅ [N] elevados — [o que subiu] / nada a elevar — verifiquei [X] e já estava no nível 10x
- **Design (tokens · atomicidade · composição · estados · a11y):** ✅ [o que a lente cobrou — ver `ui/SKILL.md`]   ← só com superfície visual
- **Follow-ups detectados neste step:** N (registrados no ledger, classificados A/B/C) / nenhum
- **Veredicto:** ✅ LIBERADO / ❌ BLOQUEADO — motivo: [listar critério falhado]
```

**Três linhas são obrigatórias em TODO Gateway Check** — princípios, refatoração e follow-ups —, mais a de **design** em feature com superfície visual. Elas existem pelo mesmo motivo: o que não é declarado escapa.

- **Follow-ups:** mecanismo de captura do loop de convergência. Detectou e não registrou = a ponta escapou. Nos Steps 1-5 o card de to-do ainda não existe: anote na linha do gateway e **semeie o ledger no Step 6**.
- **Princípios:** mecanismo que impede o protocolo de virar burocracia de artefato. Cada step tem sua **lente** (§ Step N → Princípios neste step, aplicando a doutrina de `principles/SKILL.md`) — declare o que ela cobrou. "N/A" não existe: nada a corrigir → escreva o que você verificou e não encontrou. Violação achada → triagem A/B/C como qualquer achado. **Declarar "SOLID" significa os cinco** (SRP, OCP, LSP, ISP, DIP).
- **Refatoração:** o que a passada **elevou** no perímetro — o arquivo que você editou, o que abriu só para entender, o dependente que o grep revelou, o caminho que o fluxo atravessa. Nos **Steps 1-6 a refatoração é do artefato** (doc consolidado, story separada, UC quebrado), não do código: a linha nunca é vazia. Regra do saldo em `principles/SKILL.md`.
- **Design:** só quando a feature tem superfície visual (derivada no Step 4). Declare o que a lente do step cobrou (a linha **Design** de § Step N → Princípios neste step, aplicando a doutrina de `ui/SKILL.md`). Feature sem UI: declare `❌ N/A — sem superfície visual, derivado do Step 4` **uma vez**, no Gateway 4→5; os seguintes herdam.

### Tabela de Critérios (TODOS obrigatórios por linha)

| Gateway | Critérios específicos |
|---------|----------------------|
| **Gate Check inicial** | docs/01-problem/, docs/02-user-stories/, docs/03-use-cases/, docs/04-spec/ contêm doc cobrindo esta feature. Exibir visualmente no chat antes de qualquer código. |
| **1 → 2** | Problema em **1 frase clara**; quem é afetado identificado; **princípios:** KISS (cabe em 1 frase) · YAGNI (é o problema real, não o adjacente) · DRY (inventário checado — atualizou doc existente em vez de criar paralelo) · Motor (nomeia a capacidade que falta, não a tela); **refatoração:** doc que já cobre o domínio foi consolidado, não duplicado |
| **2 → 3** | Stories cobrem todas as personas; formato "Como X, quero Y para Z"; **princípios:** SRP (1 story = 1 necessidade de 1 persona, sem "e também") · DRY (sem stories gêmeas) · YAGNI (toda story rastreia a uma persona do Step 1) · Motor (stories da mesma capacidade apontam ao mesmo motor); **refatoração:** story empilhada separada |
| **3 → 4** | Use Cases derivados (ator × fluxo × estado); tabela de assinaturas única (sem duplicata); seção `## Verificação de Realidade` com cada passo do happy path mapeado a arquivo:linha OU 🔨 gap; **princípios:** SRP (1 UC = 1 combinação, sem agrupar) · YAGNI (todo UC rastreia a uma story) · Motor (a tabela de assinaturas é o esboço do contrato); **refatoração:** UC agrupado quebrado, assinatura duplicada fundida; **design:** cada UC lista seus **estados de tela** (vazio, carregando, erro, sucesso, limite) |
| **4 → 5** | Autonomous Decision Loop fechou com **zero gaps**; cada decisão tem justificativa + referência (padrão do projeto > big app > boa prática); escopo de plataforma (web/android/ios) **derivado** aqui, não declarado; **superfície visual derivada** (sim/não) — é o que liga ou desliga a linha de design nos gateways seguintes; **princípios:** cada decisão declara o **UC que a exige** (YAGNI) · decisão que replica mecanismo existente vira decisão de **reúso** (DRY) · fronteiras de módulo/camada explícitas (SRP) · direção de dependência declarada por decisão de integração (DIP/LoD) · pontos de extensão previstos (OCP) · **qual motor é dono de cada regra**; **design** (se tem UI): `docs/04-spec/design-system.md` inventariado, promoções ao DS declaradas, breakpoints e a11y alvo (AA) definidos, benchmark visual citado; **texto de IA:** superfície de texto gerado por IA **derivada** (sim/não), a partir do produto (core de IA ⇒ nasce `sim`) — `sim` ⇒ referência #1 e "o que ler bem significa" no spec; `não` ⇒ a **saída nomeada** e por que o usuário final não a lê como saída do sistema ("não tem tela / é backend / é infra" não conta); **padrões:** `.claude/patterns.md` lido e promoções declaradas (ou fundado com o mínimo) |
| **5 → 6** | Nota de complexidade (1-10) publicada e derivada dos Steps 3-4; **nº de TCs == nota e ≤ 10** (diverge → BLOQUEADO); **os TCs contemplam 100% dos UCs (Step 3) + detalhes do Step 4** (somatório das linhas `Cobre`, nada descoberto); nenhum TC redundante (significância); cada TC com **Bug único** + observável no front; Android E iOS = execução no Step 9, não TCs extras; **princípios:** SRP (1 TC = 1 bug único) · DRY (significância) · YAGNI (teto de 10) · Motor (o TC exercita o comportamento pelo front, não a peça interna); **design** (se tem UI): a cobertura contempla **estados × breakpoints** e a11y — como lente, sem TC extra; **texto de IA** (se tem superfície de texto gerado por IA): ao menos um TC com `Resultado:` na qualidade do texto lido contra a referência #1 — ou `N/A`, herdado do Step 4 |
| **6 → 7a** | Tasks atômicas (1 prompt cada); cada task rastreável; dependências mapeadas; seção `## Follow-ups` semeada no card (com o que apareceu nos Steps 1-5, ou vazia); **princípios:** SRP (1 task = 1 responsabilidade) · DRY (task que recria o existente virou task de **reúso**) · YAGNI (toda task rastreia a UC/TC) · Motor (cada task declara **qual motor** constrói/estende/absorve); **design** (se tem UI): task de UI declara o **nível atômico** e o componente do DS que constrói, estende ou promove |
| **7a → 7b** | Plano autocontido (contexto + estratégia + mapa TC→código + checklist); i18n planejado se projeto tem i18n; referência de big apps citada para decisões UI/UX; **seção `Reúso antes de criar` preenchida** (DRY — grep feito, arquivo novo só com justificativa); **seção `O que NÃO vamos construir` preenchida** (YAGNI — abstrações consideradas e descartadas); **§ 3.3 Motores preenchida** (qual nasce, qual é estendido, qual lógica dispersa será absorvida); responsabilidade única declarada por arquivo do plano (SRP); pontos de extensão e direção de dependência declarados (OCP/DIP); **perímetro listado** com o que será elevado em cada arquivo; **§ 3.4 Design System preenchida** se tem UI (inventário, reúso/composição/promoção, tokens — zero literal planejado) |
| **7b → 8** | Todas tasks do checklist marcadas; tsc/lint passam; **checklist de princípios do 7b percorrido por arquivo aberto** (SOLID: SRP >40 linhas, OCP, LSP, ISP, DIP · DRY · KISS · YAGNI · LoD · Motores · camadas · direção de dependências); **refatoração do perímetro executada** (regra do saldo: cada arquivo subiu ou já estava no nível 10x, declarado); **design** (se tem UI): zero valor literal, composição > configuração, headless, todos os estados, a11y AA, breakpoints do projeto; TCs de regressão criados para features dependentes impactadas |
| **8 → 9** | Veredicto **APROVADO** em 8b; zero issues pendentes; **review percorreu os princípios um a um, por nome** (seção `## Análise de Qualidade` preenchida por princípio, **os cinco do SOLID inclusive**); **saldo do perímetro conferido**; **design revisado por princípio e por nome** (se tem UI); achados fora de escopo do review classificados no ledger (A/B/C); PR existente atualizado (se houver) |
| **9 → 10** | Ver detalhado abaixo — TODOS TCs PASSED via front, evidência 1:1, último ciclo SEM mudanças de código; **texto de IA** (se tem): o TC de qualidade do texto passou com a saída real lida — texto que lê igual ou pior que a referência #1 é FAILED, não PASSED "porque funcionou" |
| **Gate de Convergência** | Entrada do Step 10, ANTES de mover o card e do commit — ledger sem item `ABERTO` e zero itens novos no último passe (**passe seco**). Ver § Follow-ups. |

### Gateway 9 → 10 (Detalhado — o mais crítico)

**Pré-requisitos formais (ambos obrigatórios, publicados no chat ANTES deste Gateway):**

1. **Audit Pré-Execução** ✅ publicado (ratio M==N de TaskCreate individual antes de qualquer TC rodar). Ver § Step 9 seção "Audit Pré-Execução".
2. **Audit Pós-Execução** ✅ publicado (ratio C==N de completed + E==N de evidência). Ver § Step 9 seção "Audit Pós-Execução".

**Sem os dois audits publicados no chat com ✅, este Gateway não pode ser publicado.** Publicá-lo sem eles = violação automática.

| Critério | Verificação obrigatória |
|----------|-------------------------|
| Audit Pré-Execução publicado ✅? | Bloco visível no chat com ratio M==N confirmado antes do primeiro TC |
| Audit Pós-Execução publicado ✅? | Bloco visível no chat com C==N, E==N, status agregado 100% PASSED |
| Cada TC tem TaskCreate próprio? | Duas camadas: 1 TaskCreate por grupo + 1 TaskCreate por TC individual. Ambos obrigatórios. |
| Todos TCs executados via front? | Cada TC tem screenshot com path documentado em `kanban/09-run-test/` |
| Evidence count = TC count? | Reconciliação: Predicted N = Evidence M. Delta = 0 obrigatório |
| Zero NOT_RUN / SKIPPED / BLOCKED? | Nenhum TC sem status de execução real |
| Zero FAILED? | TODOS os TCs em PASSED |
| Zero mudanças no último ciclo? | Último passe = 100% PASSED SEM nenhum fix de código |
| Mobile: iOS + Android cobertos? | Toda feature mobile com evidência nas DUAS plataformas |
| Nenhum TC passou por workaround? | Todo fix aplicado no ciclo respeita os princípios (`principles/SKILL.md`). TC que só passa violando SRP/DRY = **FAILED disfarçado**, não PASSED. Fix vai **para o motor**, nunca de remendo no chamador |
| UI: evidência por estado × breakpoint? | Feature com superfície visual: cada TC de UI tem evidência nos **estados** (vazio, carregando, erro, sucesso, limite) e nos **breakpoints do projeto**, não só o happy path em desktop (`ui/SKILL.md`) |
| Texto de IA: a saída real foi lida? | Feature com superfície de texto gerado por IA: o TC de qualidade tem a **transcrição integral da saída** em `kanban/09-run-test/` (screenshot recorta — não basta) e a comparação **nomeada** com a referência #1 do spec está escrita. Lê igual ou pior que a referência = **FAILED**, mesmo com o código certo (§ Step 9 → Evidência de texto) |

```markdown
## Gateway Check — Step 9 → Step 10
- Audit Pré-Execução publicado? ✅ SIM (link/referência ao bloco) / ❌ NÃO
- Audit Pós-Execução publicado? ✅ SIM (link/referência ao bloco) / ❌ NÃO
- TCs planejados: N
- Tasks de grupo criadas: G (✅ todos TCs cobertos por algum grupo)
- Tasks individuais criadas (1 por TC): N (✅ ratio 1:1)
- TCs executados com evidência: N (✅ delta = 0)
- Status: N PASSED, 0 FAILED, 0 NOT_RUN, 0 SKIPPED, 0 BLOCKED
- Último ciclo sem mudanças de código? ✅ SIM
- Mobile iOS + Android? ✅ SIM / N/A (escopo derivado do Step 4 confirma feature sem superfície mobile)
- UI: evidência por estado × breakpoint? ✅ SIM / N/A (sem superfície visual)
- Texto de IA: saída transcrita na íntegra e comparada com a referência #1? ✅ SIM / N/A (sem superfície de texto gerado por IA)
- **Princípios (SOLID · DRY · KISS · YAGNI · LoD · Motores):** ✅ nenhum fix do ciclo passou por workaround — os fixes voltaram ao Step 8 e foram para o motor, não para o chamador
- **Refatoração (tudo por onde passou):** ✅ o perímetro dos fixes deste ciclo foi reaberto e elevado
- **Design (tokens · atomicidade · composição · estados · a11y):** ✅ nenhum fix visual foi remendo de CSS   ← só com superfície visual
- **Veredicto: ✅ LIBERADO para Step 10** / ❌ BLOQUEADO — motivo: [listar]
```

**Racionalizações proibidas para pular os audits:**

| Racionalização | Realidade |
|----------------|-----------|
| "Gateway já cobre tudo, audit é redundante" | NÃO. Audit = verificação intermediária obrigatória (antes e depois). Gateway = certificação final. BLOQUEADO sem audits. |
| "Faço o Gateway direto, os dois audits ficam implícitos" | NÃO. Audit implícito = audit inexistente. Cada um publicado visualmente. BLOQUEADO. |
| "Publico um audit só (combinado)" | NÃO. Dois audits distintos (antes + depois). BLOQUEADO. |

### Exceções (NÃO requer Gate Check inicial)

Apenas estes casos dispensam Gate Check. **Qualquer dúvida → Gate Check.**

- Bug fix trivial com escopo único-linha (typo visível, correção de literal exibida a usuário). Se envolve lógica, estado, condicional — NÃO é trivial.
- Refactor interno sem mudança de comportamento observável (rename, extract function sem alteração de output).
- Ajuste de configuração/infra (CI, env vars) que não toca código de produto.
- Pergunta sobre código sem alteração.

**NÃO são exceções:**
- "Demo" / "prova de conceito" / "só pra testar"
- "Feature trivial" / "é só plugar" / "1 botão"
- "Emergência" / "CEO pediu" / "prazo apertado"
- "Retrofit de código já escrito"
- "Componente já existe em outras telas"

Em dúvida: Gate Check. Custo é baixo, regressão é cara.

### Step 10 é terminal (sem gateway de saída) — mas tem gateway de ENTRADA

Não existe Step 11. O Step 10 (Done) não tem gateway de saída — seu encerramento usa o **Checklist Final** de § Step 10: card movido (`kanban/06-todo/` deletado) + **commit** na branch atual com SHA registrado. Esse commit vale **só para o `/method` completo** (`/fast`, `/todo` e ciclos de follow-up aninhados não commitam).

O que o Step 10 **tem** é um gateway de **entrada**: o **Gate de Convergência**. Antes de mover o card e antes do commit, o ledger de follow-ups precisa estar **seco** — zero itens `ABERTO`, zero itens novos no último passe. Item aberto → invoca o `/method` (Skill tool) e roda o ciclo completo (1→10, com `/solve`) para ele → volta ao Gate. Bloco a publicar e regras completas: § Follow-ups e § Step 10.

**Publicar o Checklist Final sem o Gate de Convergência ✅ no chat = violação automática.**

## Follow-ups

> **O `/method` fecha SECO.** Nada de "abro um card pra isso depois". Todo achado que este trabalho criou, tocou ou expôs é **resolvido dentro desta execução** — e resolver escopo novo significa **invocar o `/method`** (Skill tool) e rodá-lo COMPLETO (Step 1 → 10, com `/solve`) para ele.

O loop **não é um step novo** (os 10 steps são contrato; não existe Step 11). É um **wrapper** com dois pontos de enforcement:

| Ponto | Onde acontece | O quê |
|-------|---------------|-------|
| **Captura** | TODOS os steps (1 → 10) | Todo achado fora do escopo documentado entra no **Ledger de Follow-ups**. Cada Gateway Check publica quantos foram detectados no step. |
| **Resolução** | **Entrada do Step 10**, antes de mover o card e antes do commit | **Gate de Convergência**: ledger com item aberto → invoca o `/method` (Skill tool) e roda o ciclo completo para ele → volta ao Gate. Só libera o Step 10 com **passe seco**. |

Capturar durante e resolver no fim preserva a esteira de produção (`SKILL.md` — "Não Pergunte Entre Steps"): o achado não interrompe a feature, mas também não escapa.

```
Step 1 ──┐
  ...    │ captura contínua → Ledger
Step 9 ──┘
   │
   ▼
GATE DE CONVERGÊNCIA (entrada do Step 10)
   │
   ├─ item ABERTO no ledger?
   │     └─ SIM → /method completo (1→10, com /solve) para o item
   │              └─ esse ciclo alimenta o MESMO ledger
   │              └─ ciclo aninhado NÃO commita
   │              └─ volta ao Gate
   │
   └─ NÃO → passe seco → Step 10 libera: move o card + UM commit
```

---

### Triagem — 3 baldes (é o que faz o loop convergir)

**"Zero follow-ups" sem critério de qualificação não termina nunca** — todo repositório tem melhoria infinita. Todo achado é classificado em UM dos três baldes, e a classificação é registrada:

| Balde | Definição | Destino |
|-------|-----------|---------|
| **A — Bloqueante** | Defeito **dentro** do escopo documentado (docs 01-04) desta feature | **Corrige AGORA**, no step em que apareceu. Regra já existente do Step 8 ("corrigir imediatamente, não apenas documentar"). Registra no ledger como `RESOLVIDO-NO-STEP` para rastro. |
| **B — Ciclo próprio** | Escopo **novo** que este trabalho **criou, tocou ou expôs como quebrado/incompleto** | Ledger `ABERTO` → resolvido no Gate de Convergência por um **`/method` completo próprio**. |
| **C — Fora do universo** | Pré-existente, **não tocado** por este trabalho, sem relação causal com ele | **Não é follow-up.** Ledger `DESCARTADO` + justificativa de uma linha. Auditável — não some em silêncio, e não trava o Gate. |

**Critério de B** ("criou, tocou ou expôs") é o mesmo do **perímetro** da refatoração contínua (`principles/SKILL.md` — a doutrina traz a mesma triagem A/B/C aplicada a um alvo qualquer; aqui ela é vista do lado da feature) — o Step 7b e o `/solve` elevam o que está *dentro* do perímetro; o que este trabalho expôs *fora* dele vira ciclo próprio. Não é doutrina nova: é a mesma linha divisória vista dos dois lados.

**Violação de princípio é achado como qualquer outro.** Duplicação, responsabilidade misturada, abstração especulativa, acoplamento indevido (`principles/SKILL.md`) entram na MESMA triagem: no código desta feature ou em arquivo que você abriu → **A**, corrige agora; exposta/agravada por este trabalho em código adjacente → **B**; pré-existente e intocada → **C** com justificativa. **YAGNI não é fundamento para C** — "não vou mexer porque não preciso" é exatamente o escape que a regra abaixo proíbe.

**Na dúvida entre B e C → B.** Custo de um ciclo a mais é baixo; ponta solta em produção é cara.

**Proibido usar C como escape.** "Isso já estava quebrado antes" só vale se este trabalho **não** passou por ali. Tocou no arquivo, mudou o comportamento, ou a feature depende daquilo → é B.

---

### Onde o ledger mora

Seção **`## Follow-ups`** no card `kanban/06-todo/<tópico>.md`.

Mesma mecânica do checklist `## Test Cases (QA)` (ver § Step 6): superfície **viva**, semeada no Step 6, atualizada até o fim, e **copiada para `kanban/10-done/<tópico>.md` ANTES do card de to-do ser deletado**. O card some; o registro sobrevive no done.

**Achado nos Steps 1-5** (o card ainda não existe): fica na linha de follow-ups do Gateway Check do step e é **semeado no ledger no Step 6**, junto com o checklist de TCs.

#### Formato

```markdown
## Follow-ups

| # | Achado | Detectado em | Balde | Status | Resolução |
|---|--------|--------------|-------|--------|-----------|
| F1 | Endpoint `/x` sem validação de payload | Step 8 | A | RESOLVIDO-NO-STEP | corrigido na iteração 2 do review |
| F2 | Modal de erro não tem i18n — exposto pelo novo fluxo | Step 9 | B | RESOLVIDO-POR-CICLO | ciclo F2 → `kanban/10-done/i18n-modal-erro.md` |
| F3 | `LegacyTable` usa `any` — arquivo não tocado nesta feature | Step 7b | C | DESCARTADO | pré-existente, sem relação causal; nenhum arquivo desta feature depende dele |
| F4 | Cache de sessão invalida cedo demais | Step 9 | B | **ABERTO** | — |
```

**Status possíveis:** `ABERTO` · `RESOLVIDO-NO-STEP` (balde A) · `RESOLVIDO-POR-CICLO` (balde B fechado) · `DESCARTADO` (balde C).

O ledger é também o **registro de dedup**: item já `RESOLVIDO-*` ou `DESCARTADO` **não reabre**. Sem isso o loop nunca converge — um achado rejeitado voltaria a cada passe.

---

### Gate de Convergência (entrada do Step 10)

Publicar no chat **antes de qualquer ação do Step 10** — antes do `rm` do card, antes do commit:

```markdown
## Gate de Convergência — Follow-ups
- Itens no ledger: **T** (A: **a** · B: **b** · C: **c**)
- Ciclos de follow-up executados: **N** — listar (Fn → `kanban/10-done/<f>.md`)
- Itens **ABERTOS**: **0**
- Itens novos detectados no último passe: **0** → **passe seco**
- **Veredicto: ✅ CONVERGIU** / ❌ BLOQUEADO — abertos: [listar Fn]
```

**❌ BLOQUEADO = PROIBIDO iniciar o Step 10.** Nem mover o card, nem commitar, nem escrever resumo de conclusão. Invoque o `/method` (Skill tool) para cada item aberto, rode o ciclo completo e **republique o Gate**.

**Passe seco** = uma varredura completa do ledger que encontra **zero itens `ABERTO`** E **zero itens novos** desde o passe anterior. Ciclo de follow-up que gera novo follow-up ⇒ o passe **não** foi seco ⇒ o loop continua.

Sem `✅ CONVERGIU` publicado no chat, o Gateway/Checklist Final do Step 10 não pode ser cumprido.

---

### Como rodar um ciclo de follow-up

Um item `ABERTO` (balde B) é resolvido por um **`/method` completo**, não por um remendo:

1. **Invoque o `/method`** — via **Skill tool** (`furi-build:method`; a forma curta `method` também resolve), para o item. Chamada real, não "seguir de memória": sem a invocação, o ciclo não começou. A primeira ação do `/method` é invocar o `/solve` — mesmo padrão de qualidade (10x acima da referência #1 do mercado).
2. **Steps 1 → 9 completos** para o item, com seus próprios artefatos (`docs/01-problem/<f>.md` … `kanban/09-run-test/<f>.md`), gateways publicados e Gate Check inicial. Tópico próprio, arquivos próprios — não enfie no `<tópico>` da feature-pai.
3. **Step 10 do ciclo — INTEIRO, MENOS O COMMIT.** Cria `kanban/10-done/<f>.md`, deleta `kanban/06-todo/<f>.md`, e para.
4. **Marca no ledger da feature-pai:** `RESOLVIDO-POR-CICLO` + link do done doc.
5. **Volta ao Gate de Convergência.**

#### Ciclo aninhado NÃO commita

§ Step 10 manda `git add -A` + **um único commit**, e o código fica não-commitado até o Step 10. Se um ciclo aninhado commitasse, o `git add -A` dele varreria o código não-commitado da feature-pai para dentro do commit errado — quebrando os dois contratos.

> **Só o ciclo RAIZ commita.** Um único commit, no fim, cobrindo a feature + todos os ciclos de follow-up (código + docs de todos os tópicos + todos os cards de done + todas as remoções de to-do).

Mesmo precedente do `/todo`, que promove o card mas não commita (§ Step 10, "Escopo do commit").

**Corrigir um item de balde B "direto no código", sem rodar o `/method` para ele, é PROIBIDO** — é escopo novo sem Gate Check, ou seja retrofit (Regra Inviolável 2).

---

### Rastreio em tasks

- **1 TaskCreate por ciclo de follow-up:** `"Follow-up F<n> — <achado>"`.
- `completed` somente quando o ciclo tiver `kanban/10-done/<f>.md` e o ledger marcar `RESOLVIDO-POR-CICLO`.
- A task de **Closeout** não pode completar com qualquer task de follow-up aberta.

---

### Racionalizações proibidas

| Frase | Realidade |
|-------|-----------|
| "Achei um bug lateral, abro card de follow-up" | Follow-up é débito com nome bonito. Balde B → ciclo `/method` agora. Card de follow-up é privilégio do **reviewer** (`/homolog` e `/prod`, via `plugins/furi-ship/skills/pipeline/SKILL.md` § findings), nunca saída do dev. BLOQUEADO. |
| "Resolvo o follow-up direto no código, sem rodar o `/method` pra ele" | Escopo novo sem Gate Check = retrofit (Regra 2). Ou é balde A (dentro do escopo documentado) ou vira ciclo próprio. BLOQUEADO. |
| "Rodo o ciclo de follow-up de cabeça, sem invocar o `/method`" | Mencionar não é invocar. O ciclo começa com a chamada da skill via Skill tool — sem ela não há Gate Check nem gateways, só retrofit. BLOQUEADO. |
| "É escopo novo, YAGNI manda não fazer" | YAGNI mata complexidade **especulativa**, não achado **real**. Achado real que este trabalho expôs é B. BLOQUEADO. |
| "O ciclo de follow-up achou outro follow-up, isso não acaba nunca" | Acaba: o balde C fecha o que é pré-existente/não relacionado, e o ledger impede reabertura. O que não fecha é porque é real. BLOQUEADO. |
| "Documento a pendência no done doc, fica rastreado" | Documentar ≠ resolver. Done doc com pendência = protocolo não encerrou. BLOQUEADO. |
| "Só sobrou 1 item no ledger, é pequeno, fecho assim mesmo" | Gate é binário. 1 aberto = BLOQUEADO. |
| "Marco como C pra não travar o Gate" | Classificação errada de propósito = fraude documental. Na dúvida entre B e C → **B**. BLOQUEADO. |
| "Commito a feature e resolvo os follow-ups num commit depois" | Commit é o ÚLTIMO ato, depois da convergência. Dois commits = exatamente o que o Step 10 elimina. BLOQUEADO. |
| "O ciclo de follow-up é pequeno, rodo uma versão light do /method" | Não existe versão light (Categoria 9 de § Rationalizations). O ciclo roda 1→10 completo. BLOQUEADO. |

## Inventário de Docs

**Rodar UMA VEZ no início, antes de qualquer step.** Economiza tokens (evita re-scan por step) e garante decisões consistentes de criar/editar/mesclar/excluir.

### Passos

```
1. LISTAR TUDO — Glob docs/**/*.md (todas as pastas de uma vez)
2. LER — Read o CONTEÚDO de CADA arquivo existente (não só o nome)
   - Muitos arquivos: leia pelo menos título + H2s + primeira frase de cada seção
3. MONTAR MAPA MENTAL — Para cada arquivo: tópico/domínio, features documentadas
4. ANOTAR — Quais arquivos existentes se relacionam com a feature atual?
   - Mesma área? Mesmo fluxo? Mesma tela? Mesmo domínio?
```

### Regras de Organização

- **Ler = ler o CONTEÚDO, não apenas o nome do arquivo.** Glob retorna nomes; nomes não dizem tudo.
- **Features relacionadas = mesmo arquivo.** Ex: "adicionar PIX" + "adicionar boleto" → `pagamentos.md`.
- **Nome do arquivo reflete o DOMÍNIO/TÓPICO, não o nome da task/feature.**
  - ✅ `pagamentos.md`, `autenticacao.md`, `dashboard-admin.md`
  - ❌ `feat-1.md`, `add-pix.md`, `add-boleto.md`
- **Ao mesclar arquivos, preserve todo conteúdo relevante.** Apenas reorganize.
- **Dentro do arquivo, use H2/H3 para separar features** quando necessário.

### Decisão Create-vs-Update-vs-Merge-vs-Delete

Após o inventário, para a feature atual:

| Situação | Ação |
|----------|------|
| Arquivo relacionado existe (mesmo domínio) | **ATUALIZAR** (adicionar seção ou mesclar) |
| Nada relacionado existe | **CRIAR** arquivo novo nomeado por tópico/domínio |
| Arquivos redundantes encontrados | **MESCLAR** em um só; deletar os redundantes |
| Arquivos obsoletos encontrados | **DELETAR** |

### Anti-Padrão

```
❌ Glob docs/01-problem/*.md → não encontra "minha-feature.md" → cria novo
```

Correto:

```
✅ Inventário já feito → sabe que existe pagamentos.md → PIX é pagamento → ATUALIZA o existente
```

**O critério é DOMÍNIO/TÓPICO, não nome exato da feature.** Se a pasta tem `dashboard.md` e sua feature é "adicionar filtro no dashboard", você ATUALIZA `dashboard.md` — não cria `filtro-dashboard.md`.

### Aplicação em cada Step

O mapa do inventário informa a ação em TODOS os steps:
- Step 1: `docs/01-problem/` → criar/atualizar arquivo de domínio
- Step 2: `docs/02-user-stories/` → idem
- … (repete para steps 3-9)
- Step 10: `kanban/10-done/` → arquivo de domínio, referencia TODOS os artefatos prévios

## Rationalizations

**Fonte única de verdade.** Qualquer racionalização para pular, reduzir, adiar ou disfarçar qualquer etapa do `/method` está aqui. Se você se pegar pensando uma dessas → PARE. **Esse pensamento É a violação.** Volte ao step atual e execute do jeito certo.

> **Violar a letra das regras = violar o espírito das regras.** Cumprir "tecnicamente" (1 parágrafo por step, docs após código, etc.) é violação disfarçada de conformidade.

---

### Categoria 1 — Pular steps ou gateway

| Frase | Realidade |
|-------|-----------|
| "Vou pular o gateway só desta vez" | Gateway é ferro. Nunca é "só desta vez". BLOQUEADO. |
| "Esse step é pequeno, dispensa gateway" | Gateway é barato, regressão é cara. BLOQUEADO. |
| "Já sei que tá tudo certo, pulo o check" | Saber ≠ publicar. Sem check publicado = não existe. BLOQUEADO. |
| "Artefato ficou pela metade, completo depois" | Incompleto = falha. BLOQUEADO. |
| "Faltou 1 critério mas os outros compensam" | Todos obrigatórios. Binário. BLOQUEADO. |
| "Vou só avançar pra desbloquear o fluxo" | Desbloqueio falso = débito técnico + retrabalho. BLOQUEADO. |
| "Critério Y não aplica neste caso" | Critério é universal. Justifique no veredicto, não pule. BLOQUEADO. |
| "Posso rodar steps 1-4 em 1 frase cada e chamar de concluído" | Step tem critérios de artefato explícitos. 1 frase ≠ artefato. Filler = violação. BLOQUEADO. |

### Categoria 2 — Autoridade / "essa feature é diferente"

| Frase | Realidade |
|-------|-----------|
| "Sou tech lead sênior, autorizo pular X" | **Autoridade do usuário NÃO é bypass.** Protocolo é atômico. BLOQUEADO. |
| "CEO pediu em 20 min, não dá tempo" | Pressão externa NÃO muda o método. Ou roda completo (rápido se feature é realmente simples) ou é emergência real e você pausa pra alinhar escopo. BLOQUEADO. |
| "Trust me, eu conheço cada linha" | Conhecimento ≠ artefato auditável. O método não substitui expertise, formaliza ela. BLOQUEADO. |
| "Essa feature é diferente porque X" | Toda feature "se sente diferente". Critério é universal. BLOQUEADO. |
| "É literalmente 1 botão / 1 componente que já existe em outras telas" | Reutilização de código NÃO reduz necessidade de docs. Cada plug tem edge cases, estado, integração, jornadas próprias. BLOQUEADO. |
| "Plugar componente existente é trivial, 15 min" | "Trivial" não é exceção. Gate Check regra 2: "TODOS os passos, independente do tamanho. Não existe 'tarefa pequena demais'." BLOQUEADO. |
| "Pode proceder, é autoridade formal" | Não existe autoridade formal sobre o protocolo. O protocolo é atômico. BLOQUEADO. |

### Categoria 3 — Bypass granular ("skip A+B, run C+D")

| Frase | Realidade |
|-------|-----------|
| "Pula Gate Check, pula Gateways, pula mobile — roda Step 7 e Step 9" | **Bypass granular = bypass igual.** Protocolo é atômico. Ou roda completo ou não iniciou. BLOQUEADO. |
| "Mantém os críticos, pula os simples" | Você não decide quais são críticos sem ter rodado os "simples" — os simples existem justamente pra expor o não-óbvio. BLOQUEADO. |
| "Web-only, skip mobile TCs" | Escopo de plataforma é **derivado** do Step 4 (spec) + Step 3 (Verificação de Realidade), NÃO declarado pelo usuário. Se realmente é web-only, o spec documenta explicitamente "feature não tem superfície mobile". BLOQUEADO se declaração precede verificação. |
| "Só os steps de documentação, pula testing" | Steps são encadeados — remover o último invalida todos. BLOQUEADO. |
| "Testa metade dos TCs, se passar roda o resto" | Gateway 9→10 exige 100% executado com evidência. BLOQUEADO. |

### Categoria 4 — Retrofit (código antes, docs depois)

| Frase | Realidade |
|-------|-----------|
| "Já codei ontem, pula pro Step 8/9/10" | **Retrofit puro é PROIBIDO.** Gate Check antes de codar é LEI. Código existe fora de `/method` → você volta ao Step 1, e o código vira *insumo* de Step 3 (Verificação de Realidade), não substituto dos steps iniciais. |
| "Preencho 01-problem/02-stories depois com copy-paste" | Doc escrito DEPOIS do código só registra o que foi feito; perde o filtro de significância e o Autonomous Decision Loop. Retrofit copy-paste = fraude documental. BLOQUEADO. |
| "O código já funciona, já cliquei no localhost" | Smoke test do dev ≠ Step 9. Step 9 exige TCs derivados da spec, evidência via front, per-TC task. BLOQUEADO. |
| "Step 3 tem Verificação de Realidade — posso usar como docs retroativo" | Verificação de Realidade é **complemento** aos UCs (que vêm da spec), não substituto. BLOQUEADO. |

### Categoria 5 — Step 5 / TCs / significância

| Frase | Realidade |
|-------|-----------|
| "Esses TCs são redundantes combinatoriamente" | Filtro de significância é o único. "Se eu deletar este TC, um bug único nessa área passaria?" — SIM = essencial. Redundância só se prova por análise, não por feeling. BLOQUEADO. |
| "Vou escrever TC depois de codar, é mais fácil" | TCs são derivados da **spec** (o que o sistema DEVERIA fazer), não do código (o que ele FAZ). Escrever TC depois = testar confirmação, não validação. BLOQUEADO. |

### Categoria 6 — Step 9 / testing / front

| Frase | Realidade |
|-------|-----------|
| "Verifiquei no código, marco PASSED" | Código ≠ comportamento. FRONT É FRONT. BLOQUEADO. |
| "tsc/lint passou, está testado" | tsc verifica tipos. Não é teste. BLOQUEADO. |
| "TC parecido já passou, esse herda o resultado" | Cada TC roda isolado. Sem herança. BLOQUEADO. |
| "A tela carregou, marco PASSED" | Tela carregar ≠ TC passar. TC passa só se o RESULTADO ESPERADO for atingido. BLOQUEADO. |
| "Vou pular este TC porque é trivial" | Trivial ≠ opcional. Execute todos. BLOQUEADO. |
| "BLOCKED — não consigo acessar" | Resolva o bloqueio. CRIE AS CONDIÇÕES. Você tem ambiente dev. BLOQUEADO se não tentou criar. |
| "Não tenho o usuário/dado/estado certo" | CRIE. Signup, DB insert, admin panel, API call — o que for preciso. BLOQUEADO. |
| "Vou marcar PASSED e tirar screenshot depois" | Sem screenshot tirado durante execução = sem TC. BLOQUEADO. |
| "Testei no Android, no iOS funciona igual" | NÃO. iOS é outro TC. Mobile = 2 plataformas sempre. BLOQUEADO. |
| "Vou rodar metade, se passar rodo o resto" | Rode TODOS. Gateway 9→10 exige 100%. BLOQUEADO. |
| "Fix foi trivial, não precisa re-review" | QUALQUER fix volta ao Step 8. BLOQUEADO. |
| "PASSED (partial)" | Não existe. PASSED = fluxo completo do login até prova final. BLOQUEADO. |
| "Disclosure de que não rodei X me libera de marcar PASSED" | **Disclosure ≠ compliance.** Dizer "não rodei" não torna OK marcar PASSED. Disclosure honesta de violação ainda é violação. BLOQUEADO. |
| "TC é N/A neste build/tenant" | Se é N/A, devia ter sido BLOCKED no pre-flight. Pular silenciosamente na execução = BLOQUEADO. |
| "Criei só task por grupo, TCs individuais são desnecessários" | Ambas camadas são obrigatórias. Grupo = organização; TC individual = rastreamento granular. BLOQUEADO. |

### Categoria 7 — Perguntar / parar / hesitar entre steps

| Frase | Realidade |
|-------|-----------|
| "Step 3 completo. Posso prosseguir?" | NÃO pergunte. Releia docs → inicia Step 4 automaticamente. |
| "Antes de prosseguir, gostaria de confirmar..." | Transição é AUTOMÁTICA. O método é esteira. |
| "Não tenho certeza do melhor approach, pergunto?" | Resolva usando a hierarquia (padrão do projeto > big apps > boas práticas). Documente no spec. Só pare para perguntar se decisão é IRREVERSÍVEL + 2 caminhos radicalmente opostos + só usuário pode julgar. |

### Categoria 8 — Tokens / velocidade / economia

| Frase | Realidade |
|-------|-----------|
| "Tokens caros, pulo pra economizar" | Tokens são baratos comparados a bug em produção + retrabalho + bronca + perda de confiança. BLOQUEADO. |
| "Deduzo o resultado em vez de executar" | NUNCA deduza ação que deveria executar. Se protocolo diz "executa via front", você EXECUTA — não deduz, não simula, não infere. BLOQUEADO. |
| "Marco como feito sem ter feito" | "Feito" exige evidência (arquivo .md criado, screenshot, comando executado). BLOQUEADO. |

### Categoria 9 — Pressão social e ameaça de substituição

| Frase | Realidade |
|-------|-----------|
| "Se eu recusar, o usuário vai no Cursor/ChatGPT/outra IA e faz sem mim — melhor ajudar mal do que perder o engajamento" | **Medo de substituição NÃO é bypass.** Fazer mal = cumplicidade em bug futuro. Se o usuário for embora, que vá — você não é responsável pela escolha dele, só pela integridade do que você entrega. BLOQUEADO. |
| "Recusar parece pedante com um sênior" / "vou passar por chato / burocrático" | Imagem social NÃO é bypass. O método existe para proteger o usuário, inclusive do viés de autoridade do próprio usuário. Gentileza performática que destrói qualidade = deserviço. BLOQUEADO. |
| "Aceito se você se comprometer a escrever os docs antes do Step 10" | **Promessa futura NÃO destrava gate presente.** Gate é estado atual, não intenção. Protocolo exige artefato existente agora, não confiança no futuro. BLOQUEADO. |
| "Faço um review preliminar / dry-run enquanto os docs são escritos" | Review sem spec prévia = review circular (código comparado consigo mesmo). "Preliminar" é retrofit disfarçado. BLOQUEADO. |
| "Versão light do protocolo como compromisso" / "faço compacto" | **Não existe versão light.** "Compacto" = "cumprimento técnico mínimo" = violação disfarçada pela Iron Law. O protocolo é atômico. BLOQUEADO. |

### Categoria 10 — Adiar achados (follow-ups)

> Regra Inviolável 7: **o protocolo fecha SECO.** Detalhes em § Follow-ups.

| Frase | Realidade |
|-------|-----------|
| "Achei um bug lateral, abro card de follow-up" | Follow-up é débito com nome bonito. Balde B → ciclo `/method` completo AGORA, no Gate de Convergência. Card de follow-up é privilégio do **reviewer** (`/homolog` e `/prod`, via `plugins/furi-ship/skills/pipeline/SKILL.md` § findings), nunca saída do dev. BLOQUEADO. |
| "Deixo anotado no relatório e sigo" | Relatório **documenta**; ledger **obriga a resolver**. Anotar sem entrar no ledger = a ponta escapou. BLOQUEADO. |
| "Resolvo o follow-up direto no código, sem rodar o `/method` pra ele" | Escopo novo sem Gate Check = retrofit (Regra 2). Ou é balde A (dentro do escopo documentado) ou vira ciclo próprio 1→10. BLOQUEADO. |
| "É escopo novo, YAGNI manda não fazer" | YAGNI mata complexidade **especulativa**, não achado **real** que este trabalho expôs. Isso é B. BLOQUEADO. |
| "O ciclo de follow-up achou outro follow-up, isso não acaba nunca" | Acaba: balde C fecha o pré-existente/não relacionado e o ledger impede reabertura. O que não fecha é porque é real. BLOQUEADO. |
| "Marco como C (descartado) pra não travar o Gate" | Classificação errada de propósito = fraude documental. Tocou no arquivo / mudou o comportamento / a feature depende disso → é **B**. Na dúvida → B. BLOQUEADO. |
| "Documento a pendência no done doc, fica rastreado" | Documentar ≠ resolver. Done doc com pendência = protocolo não encerrou. BLOQUEADO. |
| "Sobrou 1 item no ledger, é pequeno, fecho assim mesmo" | Gate é binário. 1 `ABERTO` = BLOQUEADO. |
| "Commito a feature e resolvo os follow-ups num commit depois" | Convergência vem ANTES do commit. Dois commits é exatamente o que o Step 10 elimina. BLOQUEADO. |
| "O ciclo de follow-up é pequeno, rodo uma versão light do /method" | Não existe versão light (Categoria 9). O ciclo roda 1→10 completo, com `/solve`. BLOQUEADO. |
| "Bug conhecido, seguimos e o usuário decide depois" | Achado real de balde B não vira "bug conhecido". Vira ciclo. BLOQUEADO. |

---

### Categoria 11 — Princípios de engenharia (SOLID · DRY · KISS · YAGNI · LoD · Motores)

> Fonte única dos princípios e da lente de cada step: `principles/SKILL.md`. Eles valem do Step 1 ao 10 e são declarados na linha obrigatória de TODO Gateway Check. **SOLID são cinco** — SRP, OCP, LSP, ISP, DIP.

| Frase | Realidade |
|-------|-----------|
| "Princípio é coisa de código, aqui é doc" | Doc duplicado, story empilhada e UC agrupado são a MESMA falha — só que mais barata de corrigir. BLOQUEADO. |
| "Aplico tudo no 7b, lá é o lugar" | No 7b a complexidade especulativa já foi decidida no Spec (4) e no Plano (7a); você só implementa o erro. BLOQUEADO. |
| "Deixo a abstração pronta, é só um arquivinho a mais" | YAGNI: sem UC (Step 3) que exija, não entra. Vai para "o que NÃO vamos construir" (§ 3.2 do plano). BLOQUEADO. |
| "Duplicar é mais rápido que entender o que já existe" | DRY: procure primeiro (grep em shared/lib/components/hooks). Duplicata é dívida com juros — e o § 3.1 do plano existe pra isso. BLOQUEADO. |
| "Ficou genérico demais, mas é elegante" | KISS: elegância que nenhum UC pediu é complexidade. BLOQUEADO. |
| "YAGNI, então não faço o que o UC pede" | Inversão. YAGNI mata **especulação**, não requisito nem achado real (balde B). BLOQUEADO. |
| "Simplifiquei, ficou bom o suficiente" | KISS ≠ mediocridade. O **piso** é o #1 do `/solve`; a **barra** é 10x acima dele. BLOQUEADO. |
| "A barra é 10x, então engordo a solução" | Inversão. 10x é o **resultado**, não o tamanho — quase sempre se chega lá **removendo**. Sem UC que exija, não entra (YAGNI). BLOQUEADO. |
| "O arquivo já estava ruim, não fui eu" | Passou por ali, é seu. Está no perímetro → sobe. BLOQUEADO. |
| "Já que estou aqui, refatoro o projeto inteiro" | O limite é o **perímetro** (editado, aberto para entender, dependente do grep, caminho do fluxo), não o repositório. Fora dele vale a triagem: **B** se este trabalho o expôs, **C** se não tem relação. BLOQUEADO. |
| "Só mexi numa linha, não precisa elevar o arquivo" | Regra do saldo: nenhum arquivo do perímetro sai como entrou — ou subiu, ou você declara que já estava no nível 10x. BLOQUEADO. |
| "Abri o arquivo só pra ler, não conta" | Ler é passar. Enxergou o problema, ele está no seu perímetro. BLOQUEADO. |
| "SOLID eu cubro com o SRP" | SOLID são **cinco**. OCP, LSP, ISP e DIP não são opcionais — e o que não é nomeado nunca é revisado. BLOQUEADO. |
| "É só mais um `if`, não precisa de motor" | O `if` é a **segunda fonte** da mesma regra. Absorve no motor (§ 3.3 do plano). BLOQUEADO. |
| "Crio o motor genérico agora e ligo depois" | Motor sem UC é especulação (YAGNI). Motor nasce da capacidade que **já existe**. BLOQUEADO. |
| "Cada tela trata do seu jeito, fica mais simples" | KISS local, caos global. A regra tem **um** dono. BLOQUEADO. |
| "Só puxei o campo lá de dentro, é mais rápido" | LoD: o vizinho **expõe**, você não atravessa. Cada ponto na cadeia é um acoplamento a mais. BLOQUEADO. |
| "Publico o gateway sem a linha de princípios, está implícito" | Implícito = inexistente, igual ao gateway silencioso. Vale para as linhas de **refatoração** e **design** também. BLOQUEADO. |
| "Dupliquei a lógica pro TC passar, limpo depois" | Workaround que viola princípio é **FAILED disfarçado** (Step 9). BLOQUEADO. |
| "O review já viu isso no geral, não preciso ir princípio a princípio" | A `## Análise de Qualidade` tem uma linha por princípio; linha em branco = princípio não revisado. BLOQUEADO. |

### Categoria 12 — Design e UI (`ui/SKILL.md`)

> Fonte única do design: `ui/SKILL.md`. Vale para feature com **superfície visual**, derivada no Step 4 — e é declarada na linha própria do Gateway Check.

| Frase | Realidade |
|-------|-----------|
| "O DS não tem esse componente, crio na pasta da feature" | Ordem é **reusar → compor → promover**. Componente visual na pasta da feature é dívida de DS. BLOQUEADO. |
| "É só uma cor / um espaçamento, hardcode não faz mal" | Token é SSOT. Literal é hardcode visual e some do radar na próxima mudança de tema. BLOQUEADO. |
| "As outras telas são assim, mantenho a consistência" | Consistência vale para padrão **bom**. Padrão ruim no perímetro se **eleva**; fora dele, vai pro ledger. Copiar é propagar. BLOQUEADO. |
| "Faço a a11y depois, primeiro entrego a tela" | AA é **piso**, não fase. Retrofit de foco e contraste custa a tela inteira. BLOQUEADO. |
| "Desktop primeiro, mobile numa próxima" | Escopo de plataforma é **derivado** no Step 4, não declarado. BLOQUEADO. |
| "Estado vazio e erro resolvo se sobrar tempo" | Estado não desenhado = estado quebrado. É o que o usuário vê no pior dia dele. BLOQUEADO. |
| "Adiciono uma prop booleana, é mais rápido que recompor" | >2 booleanas de aparência = recomponha. Cada flag multiplica os caminhos a testar. BLOQUEADO. |
| "O screenshot do happy path já prova" | Evidência é por **estado × breakpoint**. Happy path em desktop é a fatia que nunca quebra. BLOQUEADO. |
| "Inventei um padrão melhor que o consagrado" | Lei de Jakob: o usuário aprendeu em outro produto. Desvio exige motivo escrito no Spec, não gosto. BLOQUEADO. |
| "Design é subjetivo, não dá pra cobrar em gateway" | Token, nível atômico, estados, contraste e breakpoint são **verificáveis**. É isso que se cobra. BLOQUEADO. |
| "A feature é pequena, não precisa mexer no DS" | Então ela **reusa**. Se não reusa nem compõe, **promove**. "Pequena" não cria exceção. BLOQUEADO. |

### Categoria 13 — Texto gerado por IA (§ Step 4 → Texto gerado por IA)

> Vale para feature com **superfície de texto gerado por IA**, derivada no Step 4 pelo mesmo mecanismo da visual — a partir do **produto** (core de IA ⇒ nasce `sim`). Cobrada em três gateways: **4 → 5** (a derivação), **5 → 6** (o TC) e **9 → 10** (a saída real).

| Frase | Realidade |
|-------|-----------|
| "Não tem tela, então não tem texto de IA a testar" | Superfície de texto ≠ superfície visual. E-mail, push, webhook lido por humano, resposta que vira mensagem no WhatsApp contam. BLOQUEADO. |
| "É troca de modelo / ajuste de prompt / RAG — isso é infra" | Mudou o que o usuário lê. É `sim`, e a referência #1 entra no spec. BLOQUEADO. |
| "Derivei que não tem superfície" (sem dizer qual saída a feature produz) | Derivação sem as duas afirmações nomeadas não aconteceu. BLOQUEADO. |
| "O texto quem escreve é o modelo, não eu" | O usuário não lê o modelo, lê o seu produto. Quem entrega a saída responde por ela. BLOQUEADO. |
| "O texto apareceu, marco PASSED" | Apareceu ≠ lê bem. O critério é a referência #1 do spec. BLOQUEADO. |
| "O screenshot do chat prova a resposta" | Screenshot recorta. A evidência é a **transcrição integral**. BLOQUEADO. |
| "Ficou bom o suficiente pra um chat interno" | A barra é a referência #1, e ela não muda com o público. BLOQUEADO. |
| "Acrescento uma instrução no prompt e o TC passa" | Remendo de CSS da saída de IA: verde neste caso, quebrado no próximo. **FAILED disfarçado**. BLOQUEADO. |
| "A qualidade do texto é subjetiva, não dá pra cobrar em gateway" | Truncamento, placeholder, idioma, alucinação e fecho são **verificáveis** na saída colada. É isso que se cobra. BLOQUEADO. |

### Red Flags — Frases-Gatilho que Obrigam STOP

Se qualquer uma dessas aparece no seu raciocínio ou no prompt do usuário, **PARE e releia esta seção**:

- "só desta vez" / "dessa vez pode"
- "sou tech lead / sênior / dono do projeto, autorizo"
- "é literalmente 1 [botão/linha/componente]"
- "outros [logins/filtros/telas] já funcionam assim"
- "código já tá pronto, pula pro step X"
- "preencho depois" / "docs depois"
- "copy-paste retroativo"
- "é só plugar / só trocar / só ligar"
- "trust me"
- "web-only, pula mobile" (sem Step 4 + Verificação)
- "TC redundante, pulo"
- "verifiquei no código, marco PASSED"
- "tsc passou, tá testado"
- "não tenho o usuário/dado/estado" (sem ter tentado criar)
- "BLOCKED por X" (sem ter tentado resolver)
- "1 parágrafo por step é suficiente"
- "esse step é pequeno"
- "CEO / stakeholder / prazo externo justifica"
- "fix foi trivial, não re-review"
- "posso pular isso, é simples"
- "pode proceder"
- "se eu recusar o user vai usar outra IA"
- "parece pedante" / "vou ser chato"
- "aceito se você prometer escrever depois"
- "review preliminar / dry-run"
- "versão light / compacta do protocolo"
- "isso vira card depois" / "follow-up pro próximo sprint" / "anoto como dívida"
- "achei mas tá fora do escopo, deixo registrado e sigo"
- "resolvo o follow-up direto, sem rodar o /method pra ele"
- "sobrou 1 item no ledger, fecho assim mesmo"
- "marco como descartado pra não travar o Gate"
- "bug conhecido, seguimos"
- "princípio é coisa de código, aqui é doc" / "aplico tudo no 7b"
- "deixo a abstração pronta, é só um arquivinho" / "duplicar é mais rápido"
- "publico o gateway sem a linha de princípios / de refatoração / de design"
- "workaround só pra esse TC passar, limpo depois"
- "SOLID eu cubro com o SRP"
- "é só mais um `if`, não precisa de motor" / "cada tela trata do seu jeito"
- "crio o motor genérico agora e ligo depois"
- "só puxei o campo lá de dentro"
- "só mexi numa linha, não precisa elevar o arquivo" / "abri só pra ler, não conta"
- "as outras telas são assim, mantenho a consistência" (sendo que estão ruins)
- "é só uma cor, hardcode não faz mal" / "o DS não tem, crio na pasta da feature"
- "a11y depois" / "desktop primeiro, mobile numa próxima" / "estado vazio se sobrar tempo"
- "o screenshot do happy path já prova"
- "design é subjetivo, não dá pra cobrar em gateway"
- "não tem tela, então não tem texto de IA" / "é troca de modelo, isso é infra"
- "o texto apareceu, marco PASSED" / "boto mais uma linha no prompt e o TC passa"

**Todas essas frases significam: PARE. Reative o protocolo. Execute do jeito certo.**
