---
name: repro
description: 'Use ONLY when the user explicitly invokes /repro (bare /repro = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:repro` via the Skill tool. NEVER activate on your own initiative. — adds live reproduction to the ship pipeline — a MODIFIER, not a target: the bug is reproduced where the user sees it BEFORE any code, and the dev sees it twice, before and after the fix. Alone (`/repro KEY-N` or `/repro "description"`) it only reproduces: syncs the branch, understands (≥90), reproduces (≥90, in a loop) on the right surface (web via Playwright, mobile on the emulator, API with a real call), stops so the dev clicks the trigger and sees the bug, and ENDS — the reproduction stays in the conversation; nothing is implemented, nothing is committed. Composed with a target in any order — `/repro /work`, `/work /repro`, `/repro /prod` — it reproduces first, then delegates to the target, which runs its loop with the second human check (dev sees the fix) after the commit. Composed with /card (`/repro /card "…"`) it reproduces and then the card is created with the observed steps in PM/PO/QA voice. Works on any Jira board (/jira) and without Jira. `finish` skips optional questions but never the two human checks. Feature cards: maps where the change lands instead of a bug.'
effort: max
requires: [jira, setup, pipeline, work, pull-request, homolog, prod, card]
argument-hint: "[KEY-N | descrição] [/work | /pull-request | /homolog | /prod] [/card] [finish] | (vazio = continuar o card ativo)"
---

# /repro — reproduzir onde o usuário vê, e provar que sumiu (modificador do pipeline)

**Modificador**, não alvo. O que ele acrescenta a qualquer alvo é uma característica: **o bug é reproduzido onde o usuário o vê, antes de qualquer código, e o dev o vê duas vezes** — antes do fix (o trigger na tela, o bug acontecendo) e depois (o mesmo trigger, o bug sumido). Sozinho, reproduz e para; com um alvo (`/repro /work`, `/repro /prod`, em qualquer ordem), reproduz e entrega ao alvo, que roda o loop com a segunda parada humana dentro.

> 🚫 Sozinho, NÃO implementa, NÃO commita, NÃO pusha. Reproduzir e parar é o que ele é. Corrigir é `/repro /work` (ou qualquer alvo mais distante); virar card é `/repro /card`.

## Iron Law

> **Esta skill é FERRO.** Vale para TODA a conversa. **Violating the letter of the rules is violating the spirit of the rules.**
> **Precisão > tokens > velocidade.** Bug em produção é caro. "É simples, pulo" = a violação.
> **Reprodução é na superfície onde o usuário vê, com nota ≥ 90, e o dev confirma ao vivo.** Código localiza; reproduzir prova. As duas paradas humanas são obrigatórias em **qualquer** modo — `finish` inclusive.

## Argument parsing

`pipeline/SKILL.md` § composicao primeiro. A ordem de execução é fixa — **`repro` → `card` → alvo** — não importa a ordem digitada:

| Arg | O que acontece |
|---|---|
| `KEY-N` (ou URL) · `<descrição>` | **sozinho**: § 0 → § 5 (parada 1) e **encerra** |
| `… /card` | § 0 → § 5, depois `Skill(skill: "card", args: "<o resto>")` — o card nasce com os passos observados |
| `… /work` · `/pull-request` · `/homolog` · `/prod` | § 0 → § 5, depois `Skill(skill: "<alvo>", args: "/repro <o resto>")` — o alvo vê a reprodução feita, funde a **parada 2** depois de `commit`, e roda o loop |
| `finish` | zero paradas opcionais além das 2 humanas; passa adiante intacto |
| vazio | CONTINUE: o card ativo é o `docs/jira/todo/*.md` cuja `branch:` é a atual — vários → pergunte; nenhum → "Nenhum card ativo. Use `/repro KEY-N`." Retoma pelo `phase:` (abaixo) |

**`finish`** suprime "quer que eu continue?" e qualquer confirmação opcional. **Não** suprime a pergunta de **ambiguidade real** do § 3 nem as duas paradas humanas.

**CONTINUE** por `phase:` do registro: `investigation` → retomar do § 3; `commit`/`human-check` → o alvo que estava rodando é quem retoma (rode-o de novo: `/<alvo> KEY-N` — o loop re-diagnostica e a parada 2 fica onde estava). *Registro gravado por uma versão anterior pode trazer o valor legado `method` — é o mesmo estágio.*

## Convenções (CONTRATO)

- **Qualquer projeto** do Atlassian, via `mcp__atlassian__*`; **sem Jira** (`Rastreamento` ≠ Jira) o objetivo é a descrição — reproduz do mesmo jeito.
- **Board e estrutura vêm do `/jira`; modo e nome da branch vêm do `/setup`** — Step 0, a cada invocação. A branch é do motor `pipeline/SKILL.md` § branch (§ 2) — o mesmo do pipeline; `<integração>` detectada, nunca assumida.
- **Superfície = onde o usuário vê o bug**, nunca o código: a tela/rota (web), o app (mobile) ou o endpoint (API) que o card e o anexo nomeiam.
- **O registro `docs/jira/todo/KEY-N.md` existe só quando há card e um alvo vai consumir** (a parada 2 re-executa o que está escrito nele; quem implementa usa o cenário observado como caso de teste de referência). Sozinho, ou sem card, a reprodução fica **na conversa** — é dali que o `/card` ou o alvo seguinte a aproveitam.
- **A parada 2** é § Human Check: o loop do alvo a executa depois do estágio `commit` — esta seção é o único protocolo que sai daqui para o pipeline.

## Fluxo

### 0. Jira, convenções e composição (SEMPRE)

1. **Invoque o `/jira`** — via **Skill tool** (`furi-ship:jira`; a forma curta `jira` também resolve). Chamada real: sem a invocação, o passo não aconteceu. Devolve `{rastreamento, site, key, …, estrutura}`.
2. **Invoque o `/setup`** — via **Skill tool** (`furi-ship:setup`; a forma curta `setup` também resolve). Devolve `{branch, commit, pr, jira, …}` — o § 2 usa `branch`. Duas invocações separadas, cada uma com a sua pergunta isolada.
3. **`pipeline/SKILL.md` § composicao** — quem roda o quê: a tabela acima.

### 1. Buscar o objetivo

**Com card:** `mcp__atlassian__jira_get_issue` (`issue_key: KEY-N`): título, descrição, tipo (`BUG` | `FEATURE`), `## Como testar`, assignee, **anexos**. Colar a descrição **real**; ambiguidade → listar ≥ 2 interpretações (insumo do § 3).

> **Anexo de imagem ou vídeo → baixe e leia antes de decidir** (`jira_download_attachments` / `jira_get_issue_images`): é o que o solicitante viu, e é contra ele que a nota do § 4 é dada. O card vem em voz de PM/PO/QA — diz **o quê** e **por quê**; se prescrever solução, é ruído.

**Sem card:** o objetivo é a descrição do argumento — a superfície e o cenário saem dela; o que faltar, pergunte.

### 2. gh → integração → branch

A mecânica é do **`pipeline/SKILL.md` § branch**, fonte única. Entrada: `branch: {modo, nome}` do `/setup`, a key (ou o slug do objetivo, sem card) e `<integração>` (`pipeline/SKILL.md` § deploy-context, passo 1). Saída: o checkout na branch de trabalho, sincronizada. É nela que o alvo vai trabalhar — e é dela que a reprodução parte, porque o código que reproduz o bug tem de ser o código que será corrigido.

**Com card e alvo composto:** criar `docs/jira/todo/KEY-N.md` (e as pastas `docs/jira/todo/`, `docs/jira/done/` se faltarem):
```yaml
card: KEY-N
title: <título do Jira>
type: BUG | FEATURE
branch: <branch de trabalho>
phase: investigation
```
Assignee (se ainda não for o executor): `jira_update_issue`. Status: `pipeline/SKILL.md` § jira-sync com a etapa **trabalho começou**.

### 3. Entender o problema (nota ≥ 90) + gate de perguntas

Ler o **código** relevante e entender o problema. Nota **0–100** à precisão do entendimento; `< 90` → ler mais e repontuar, **em loop até ≥ 90**.

- **Ambiguidade real** (2 caminhos opostos, requisito faltando, decisão que só o usuário julga) → **PARAR e perguntar** (`AskUserQuestion`) — em qualquer modo, `finish` inclusive.
- `≥ 90` e sem ambiguidade → seguir. **Não invente pergunta.**
- Problema **fora do card** → nunca decidir em silêncio: `AskUserQuestion` com os 6 campos (O que é / Como reproduzi / Causa provável / Possível solução / Relação com o card / Recomendação).

### 4. Reproduzir na superfície certa (nota ≥ 90)

| Superfície | Como reproduzir |
|---|---|
| **Web** | Playwright MCP — instância `pw4`, pool `pw#` como fallback automático (ocupada → próximo índice livre; nunca SKIP/BLOCKED enquanto houver um) |
| **Mobile** | emulador Android / simulador iOS — a plataforma que o card nomeia; as duas, se ele não distinguir |
| **API / backend** | chamada real (curl/httpie) com o payload do card, contra o serviço rodando |

Reproduzir o cenário **exato** — usuário, dados, condições (`can create users: yes` — crie o que faltar). Nota **0–100** à precisão vs. **o que está escrito e anexado**; `< 90` → ajustar e repontuar, **em loop até ≥ 90**. Ao atingir:
- **BUG:** registrar exatamente **como** foi reproduzido — usuário, dados, ponto de partida (URL / tela / endpoint), passos, trigger, superfície (+ `pw#`) — **no registro** (com card + alvo) ou **na conversa, num bloco explícito** (sozinho / sem card). É isso que a parada 2 re-executa e que o `/card` transcreve para o `## Como testar`.
- **FEATURE:** identificar e registrar **onde** vai nascer (arquivo / fluxo / tela / endpoint) e o estado atual desse lugar.

Não conseguiu reproduzir → **pergunte ao usuário**. Nunca "pelo código o bug é…".

### 5. Preparar + PARAR — parada 1: o dev vê o bug

Rodar o fluxo de novo e parar **1 passo antes do trigger**: o gatilho visível na tela (web/mobile) ou a requisição montada e **não enviada** (API). Evidência do estado pré-trigger (screenshot, ou a requisição + o estado dos dados).

Publicar no chat: ambiente pronto + **"👉 Clique em / Execute: [elemento ou comando exato]"** + o comportamento atual (o bug; FEATURE: o estado do lugar onde vai nascer) + a evidência. **PARAR e aguardar o dev confirmar que viu — obrigatório também em `finish`.**

Confirmou → o estágio `reprodução` está **fechado**. Com registro: `phase: commit`.

### 6. Encerrar ou delegar (`pipeline/SKILL.md` § composicao)

| Composição | O que acontece agora |
|---|---|
| **sozinho** | encerra com a saída abaixo. Nada de implementação, nada de commit |
| **`/card`** no argumento | `Skill(skill: "card", args: "<verbos restantes> <objetivo>")` — o `/card` lê a reprodução da conversa e escreve o `## Como testar` com os passos observados |
| **alvo** no argumento (sem `/card`) | `Skill(skill: "<alvo>", args: "/repro <objetivo>")` — o alvo vê `reprodução` fechado, funde a parada 2 (§ Human Check, depois de `commit`) e roda o loop até o estágio dele |

**A parada 2 é do loop do alvo**, não daqui: depois de o estágio `commit` fechar, o loop roda § Human Check — reproduz o **mesmo fluxo** do § 4/§ 5, para 1 passo antes do trigger, e o dev confirma que **o bug não acontece mais** (FEATURE: que funciona como o card diz). Obrigatório também em `finish`. Ao confirmar, o registro (se existe) vai a `phase: human-check` e entra no commit por caminho explícito — nunca `git add -A`.

## Saída (sozinho)

```
✅ /repro <KEY-N | objetivo> — reproduzido e visto pelo dev (antes ✔)
   Projeto: <KEY> · Board: <nome> [memória | argumento]   |   sem Jira
   Branch:  <branch>  [feature branch | lote | direto na integração]
   Repro:   <web pw# | mobile <plataforma> | API> · <ponto de partida> → <trigger>
   Passos:  <n passos, no bloco acima — é o que o /card ou o alvo vão usar>
   Próximo: /repro /work <obj> (corrige e prova) · /repro /prod <obj> (até produção) · /card (vira card com estes passos)
```

Composto, a saída é a do alvo (ou do `/card`) — com a linha `Repro:` dentro.

## Índice das Seções
- `pipeline/SKILL.md` § composicao — quem roda o quê (§ 0, § 6)
- `pipeline/SKILL.md` § branch — motor de branch (§ 2)
- `pipeline/SKILL.md` § jira-sync — comentar + transicionar o card (§ 2)
- § Human Check — **parada 2**, executada pelo loop do alvo depois de `commit`
- § Racionalizações Proibidas — /repro — racionalizações proibidas

**Leia a seção relevante ao iniciar cada fase. Não execute de memória.**

## Red Flags — STOP

- "`/repro` sozinho, então reproduzo, corrijo e commito" → NÃO. **Sozinho, reproduz e para.** Corrigir é `/repro /work` — o estágio `commit` fecha dentro do loop do alvo.
- "`/repro /prod`: rodo o `/repro` inteiro com a correção e depois o `/prod`" → NÃO. Reproduzo, parada 1, e **delego**. O estágio `commit` fecha uma vez, dentro do loop do `/prod`.
- "`/prod /repro` — não sou eu quem foi digitado, ignoro" → NÃO. O `/prod` me delega (`pipeline/SKILL.md` § composicao); a ordem de execução é fixa: `repro → card → alvo`.
- "Descobri/perguntei o board direto aqui" → NÃO. Step 0 é o `/jira`.
- "Pulei o Step 0 porque já sei desta sessão" → NÃO. Leitura é **toda** invocação.
- "`git checkout main && git pull`, como sempre" → NÃO. `<integração>` vem da topologia e a branch do motor `pipeline/SKILL.md` § branch.
- "Verifiquei no código, não preciso reproduzir" → NÃO. Reprodução na superfície onde o usuário vê, nota ≥ 90. Código localiza; reproduzir prova.
- "É API/mobile, não tem front, então leio o código" → NÃO. API tem superfície (a chamada real); mobile tem o emulador.
- "Em `finish` pulo a validação humana" → NÃO. As 2 são obrigatórias em todo modo; `finish` suprime só o opcional.
- "Mostro o resultado direto, sem o dev clicar" → NÃO. O dev clica no trigger e confirma ao vivo — antes e depois.
- "Sem card, então não dá pra reproduzir" → NÃO. O objetivo é a descrição; a reprodução fica na conversa.
- "Sem card, crio um pra ter registro" → NÃO. Card é `/repro /card`, decisão do usuário. Sozinho, a conversa é o registro.
- "Gravei o registro num `/repro` sozinho, pra não perder" → NÃO. Registro só com card **e** alvo composto — quem consome é a parada 2 e quem implementa. Sozinho, fica na conversa.
- "Card ambíguo, mas reproduzo e vejo o que dá" → NÃO. Gate de perguntas é **antes** de reproduzir o que não se entendeu.
- "O card tinha print anexado, mas nem abri" → NÃO. A nota do § 4 é dada contra ele.
- "Já conheço o `/jira` / o `/setup`, sigo sem invocar" → NÃO. Skill entra pelo Skill tool, **toda** vez.
- "Terminei a reprodução, dou push / abro PR" → NÃO. Nem sozinho, nem composto: publicar é o estágio `push` do loop do alvo.

## Human Check — validação pós-fix (sem bug)

### ⛔ OBRIGATÓRIO — NÃO IGNORAR (mesmo em FINISH MODE)
Não há auto-aprovação aqui. O usuário **DEVE** clicar/executar o trigger e confirmar pessoalmente que o bug não acontece mais. PARAR e aguardar confirmação real.

---

### Objetivo
Reproduzir **todos os passos** do fluxo registrado no § 5 e parar exatamente 1 passo antes do trigger — para o usuário disparar e ver o comportamento **corrigido** ao vivo, na mesma superfície onde viu o bug.

### Sub-steps

#### 1 — Preparar ambiente idêntico ao § 5/§ 6
Reconstruir o mesmo estado da reprodução original, lendo `docs/jira/todo/<KEY>.md`:
- Mesmo usuário / conta
- Mesmo estado de dados (recriar se necessário)
- Mesmo ponto de partida registrado (URL / tela / endpoint) e mesma superfície (web `pw#` / mobile / API)

#### 2 — Executar TODOS os passos, um a um
**Não pular direto para a URL final.** Seguir cada passo registrado no § 5 na ordem exata: clicar nos mesmos elementos, preencher os mesmos campos, passar pelas mesmas telas — ou, no caso de API, montar a mesma requisição, com o mesmo payload, e **não enviar**.

**Parar imediatamente antes do trigger.** O trigger (botão/link/ação/requisição) deve estar visível e pronto. **Não disparar.**

#### 3 — Evidência do estado pré-trigger
Screenshot mostrando a tela com o trigger visível e o contexto completo (web/mobile) — ou a requisição pronta + o estado dos dados (API) — idêntico ao ponto de gatilho do bug original.

#### 3b — Se o card mexeu em texto gerado por IA
Superfície de texto gerado por IA (derivada no spec da feature — `docs/04-spec/<tópico>.md` § Texto gerado por IA) = **sim**? Então o human check não é só "o trigger está na tela": o que o usuário vai julgar é a **saída**, e **é aqui que o "funciona, mas lê mal" aparece** — o clique dá certo, o texto lê torto. Prepare a leitura, não só o clique:

- Saída já visível na tela → **transcreva-a inteira** no bloco abaixo (ele não deve precisar rolar para julgar).
- Saída que só nasce no clique → diga **o que ele deve ler** quando clicar e **contra qual referência** (`docs/04-spec/<tópico>.md` § Texto gerado por IA).
- Nunca resuma a saída com as suas palavras: o que ele valida é o que o produto escreveu.

#### 4 — Publicar no chat e PARAR COMPLETAMENTE

```markdown
## ✅ Human check — superfície posicionada — sua vez

Executei todos os passos do fluxo original. O ambiente está idêntico ao ponto do bug.

**👉 Clique em / Execute: [nome exato do botão/elemento, ou o comando pronto]**
(URL / tela / endpoint atual: [onde está])

Comportamento esperado agora (corrigido): [o que deve acontecer agora que o bug foi corrigido]

**O que ler na saída:** tom/persona · completa até o fecho · no idioma do usuário · sem placeholder · sem invenção   ← só com superfície de texto gerado por IA

Evidência do estado atual: [screenshot, ou requisição + dados]

---
Após confirmar que o bug não ocorre mais, responda "ok" / "approved" / "ship" — aí eu pergunto se rodo o /pull-request (em finish, rodo direto).
```

**PARAR COMPLETAMENTE. Não gravar `phase: ship`, não commitar o registro, não invocar o `/pull-request` até receber confirmação explícita do usuário. Nenhuma exceção.** O que acontece na confirmação está no § 6 ("Ao confirmar").

### Critério de Saída
- Todos os passos executados (sem atalho para a URL final)
- Superfície parada 1 passo antes do trigger — browser/emulador posicionado, ou requisição montada e não enviada — com evidência
- **PARADO** — aguardando confirmação humana (obrigatório, sem exceção)

## Racionalizações Proibidas — /repro

**Qualquer uma dessas frases = PARE. Esse pensamento É a violação. Volte e execute do jeito certo.**

> A implementação e os testes acontecem no fechamento do estágio `commit` (`pipeline/SKILL.md` § work-cycle), dentro do loop do alvo — não aqui. Esta tabela cobre o **Step 0 e a orquestração**, o **entendimento** (§ 4), a **reprodução** (§ 5), as **validações humanas** (§ 5 e § Human Check) e o **ship** (§ 6).

### Step 0 e orquestração

| Frase | Realidade |
|-------|-----------|
| "Já sei o board / o setup desta sessão, sigo sem invocar" | Mencionar não é invocar. `/jira` e `/setup` entram pelo Skill tool **toda** vez. |
| "`git checkout main && git pull`, como sempre" | A integração vem da topologia (`pipeline/SKILL.md` § deploy-context, passo 1) e a branch do motor `pipeline/SKILL.md` § branch. `main` pode nem ser a integração. |

### Entender o problema (§ 4)

| Frase | Realidade |
|-------|-----------|
| "Já sei o que o card significa, não preciso ler o código" | Leia o código. A nota de entendimento (≥ 90) exige base real, não suposição. |
| "Entendi mais ou menos, tá bom" | `< 90` = loop. Reveja (mais código/contexto) até `≥ 90`. Sem atalho. |
| "Conheço o codebase, não preciso mapear" | Memória falha; uso transitivo surpreende. Leia o que importa. |
| "O card tinha print, mas o texto já explica" | O anexo é o que o solicitante viu. A nota do § 5 é dada contra ele — leia antes. |

### Reproduzir na superfície certa (§ 5)

| Frase | Realidade |
|-------|-----------|
| "É feature, não preciso tocar a superfície" | Feature exige mapear o fluxo na superfície e identificar ONDE implementar. |
| "Deduzi pelos logs / stacktrace" | Logs localizam; reprodução na superfície é obrigatória. Chegue ao comportamento por onde o usuário chega. |
| "Vou simular o ambiente de cabeça pelo schema" | Sem simulação mental. Reprodução real ou nada. |
| "É API, não tem front, então leio o código" | API tem superfície: a chamada real com o payload do card. Reproduza a resposta errada, não a suposição. |
| "Reproduzi no browser, mas o card é do app mobile" | A superfície é onde o solicitante viu: card mobile → emulador/simulador. |
| "A reprodução é parecida com o card" | Parecida ≠ exata. Passos exatos do card. A nota (≥ 90) mede justamente isso. |
| "Usuário default está bom" | Só se o card não especificar condições. Senão crie o ambiente certo (`can create users: yes`). |
| "Sem evidência, mas vi funcionando" | Evidência é prova — screenshot, ou a resposta real. Sem evidência = sem reprodução. |
| "Não consegui reproduzir, mas pelo código o bug é..." | NUNCA. Pare e pergunte ao usuário. |

### Validações humanas (§ 5 + § Human Check)

| Frase | Realidade |
|-------|-----------|
| "Em finish mode pulo a validação humana" | NÃO. As 2 validações (ver o bug / confirmar que sumiu) são OBRIGATÓRIAS mesmo em finish. |
| "Mostro o resultado direto, sem o dev clicar" | NÃO. O dev dispara o trigger e confirma ao vivo — antes e depois. |
| "Pulo direto pra URL final" | NÃO. Execute todos os passos, pare 1 antes do trigger. |
| "Gravo `phase: ship` já, o dev vai aprovar mesmo" | NÃO. A phase muda **depois** da confirmação — é ela que o CONTINUE lê. |

### Scope e decisões silenciosas

| Frase | Realidade |
|-------|-----------|
| "Escopo é claro, decido sozinho" | Autoridade é do usuário. Zona cinza = AskUserQuestion obrigatória — em qualquer modo, `finish` inclusive. |
| "Problema reproduzido mas fora do card, ignoro" | PROIBIDO decidir em silêncio. Use AskUserQuestion com os 6 campos: O que é / Como reproduzi / Causa provável / Possível solução / Relação com o card / Recomendação. |

### Ship (§ 6)

| Frase | Realidade |
|-------|-----------|
| "Invoco o `/pull-request` direto após o human check" | NÃO. Pergunte antes ("quer que eu rode o `/pull-request`?") — salvo em `finish`. |
| "`git add -A` antes do `/pull-request`, pra limpar a árvore" | O commit de código é do estágio `commit`. Antes do `/pull-request` só entra o registro, por caminho explícito (`git add docs/jira/todo/<KEY>.md`). Código novo reabre o estágio `commit` (re-review e re-teste), nunca commit avulso. |
| "Abro o PR com `gh pr create`, é a mesma coisa" | NÃO. Mencionar não é invocar: o `/pull-request` tem o corpo 3-em-1, a idempotência e o espelho no Jira. |
| "O `/pull-request` parou (árvore suja / branch atrás), sigo à mão" | NÃO. O guard dele é contrato: resolva (registro por caminho explícito; integração pelo motor + re-teste no fechamento do `commit`) e invoque de novo. |

### Red Flags Universais — PARE em qualquer fase ao ouvir/pensar:

- "só desta vez" / "essa é diferente porque X"
- "sou tech lead / CEO / autoridade, autorizo pular"
- "é literalmente 1 [botão/linha/componente]"
- "código já tá pronto, pulo a investigação"
- "verifiquei no código, não preciso reproduzir na superfície"
- "tsc passou, tá testado"
- "BLOCKED por X" (sem ter tentado resolver: criar usuário, dado, flag, subir serviço, próximo `pw#` do pool)
- "Quer que eu continue?" (não pergunte entre sub-steps; execute)

**Todas significam: PARE. Releia a seção da fase atual. Execute do jeito certo.**
