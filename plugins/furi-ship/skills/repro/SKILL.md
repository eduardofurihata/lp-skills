---
name: repro
description: 'Use when user invokes /repro to add live reproduction to the ship pipeline — a MODIFIER, not a target: the bug is reproduced where the user sees it BEFORE any code, and the dev sees it twice, before and after the fix. Alone (`/repro KEY-N` or `/repro "description"`) it only reproduces: syncs the branch, understands (≥90), reproduces (≥90, in a loop) on the right surface (web via Playwright, mobile on the emulator, API with a real call), stops so the dev clicks the trigger and sees the bug, and ENDS — the reproduction stays in the conversation; no /method, no commit. Composed with a target in any order — `/repro /work`, `/work /repro`, `/repro /prod` — it reproduces first, then delegates to the target, which runs its loop with the second human check (dev sees the fix) after the commit. Composed with /card (`/repro /card "…"`) it reproduces and then the card is created with the observed steps in PM/PO/QA voice. Works on any Jira board (/jira) and without Jira. `finish` skips optional questions but never the two human checks. Feature cards: maps where the change lands instead of a bug.'
effort: max
requires: [jira, setup, pipeline, solve, work, pull-request, homolog, prod, card]
argument-hint: "[KEY-N | descrição] [/work | /pull-request | /homolog | /prod] [/card] [finish] | (vazio = continuar o card ativo)"
---

# /repro — reproduzir onde o usuário vê, e provar que sumiu (modificador do pipeline)

**Modificador**, não alvo. O que ele acrescenta a qualquer alvo é uma característica: **o bug é reproduzido onde o usuário o vê, antes de qualquer código, e o dev o vê duas vezes** — antes do fix (o trigger na tela, o bug acontecendo) e depois (o mesmo trigger, o bug sumido). Sozinho, reproduz e para; com um alvo (`/repro /work`, `/repro /prod`, em qualquer ordem), reproduz e entrega ao alvo, que roda o loop com a segunda parada humana dentro. **10x acima da referência #1 do mercado**: carrega o `/solve` na ativação.

> 🚫 Sozinho, NÃO invoca o `/method`, NÃO commita, NÃO pusha. Reproduzir e parar é o que ele é. Corrigir é `/repro /work` (ou qualquer alvo mais distante); virar card é `/repro /card`.

## Ordem de Operações ao Ativar

**ANTES de tudo — invoque o `/solve`.** Toda vez que o `/repro` for ativado, a PRIMEIRA ação é **invocar o `/solve` via Skill tool** (`furi-build:solve`; a forma curta `solve` também resolve) para carregar o padrão. Chamada real, não "seguir de memória". Depois, o Step 0.

## Iron Law

> **Esta skill é FERRO.** Vale para TODA a conversa. **Violating the letter of the rules is violating the spirit of the rules.**
> **Precisão > tokens > velocidade.** Bug em produção é caro. "É simples, pulo" = a violação.
> **Reprodução é na superfície onde o usuário vê, com nota ≥ 90, e o dev confirma ao vivo.** Código localiza; reproduzir prova. As duas paradas humanas são obrigatórias em **qualquer** modo — `finish` inclusive.

## Argument parsing

`pipeline/references/composicao.md` primeiro. A ordem de execução é fixa — **`repro` → `card` → alvo** — não importa a ordem digitada:

| Arg | O que acontece |
|---|---|
| `KEY-N` (ou URL) · `<descrição>` | **sozinho**: § 0 → § 5 (parada 1) e **encerra** |
| `… /card` | § 0 → § 5, depois `Skill(skill: "card", args: "<o resto>")` — o card nasce com os passos observados |
| `… /work` · `/pull-request` · `/homolog` · `/prod` | § 0 → § 5, depois `Skill(skill: "<alvo>", args: "/repro <o resto>")` — o alvo vê a reprodução feita, funde a **parada 2** depois de `commit`, e roda o loop |
| `finish` | zero paradas opcionais além das 2 humanas; passa adiante intacto |
| vazio | CONTINUE: o card ativo é o `docs/jira/todo/*.md` cuja `branch:` é a atual — vários → pergunte; nenhum → "Nenhum card ativo. Use `/repro KEY-N`." Retoma pelo `phase:` (abaixo) |

**`finish`** suprime "quer que eu continue?" e qualquer confirmação opcional. **Não** suprime a pergunta de **ambiguidade real** do § 3 nem as duas paradas humanas.

**CONTINUE** por `phase:` do registro: `investigation` → retomar do § 3; `method`/`human-check` → o alvo que estava rodando é quem retoma (rode-o de novo: `/<alvo> KEY-N` — o loop re-diagnostica e a parada 2 fica onde estava).

## Convenções (CONTRATO)

- **Qualquer projeto** do Atlassian, via `mcp__atlassian__*`; **sem Jira** (`Rastreamento` ≠ Jira) o objetivo é a descrição — reproduz do mesmo jeito.
- **Board e estrutura vêm do `/jira`; modo e nome da branch vêm do `/setup`** — Step 0, a cada invocação. A branch é do motor `pipeline/references/branch.md` (§ 2) — o mesmo do pipeline; `<integração>` detectada, nunca assumida.
- **Superfície = onde o usuário vê o bug**, nunca o código: a tela/rota (web), o app (mobile) ou o endpoint (API) que o card e o anexo nomeiam.
- **O registro `docs/jira/todo/KEY-N.md` existe só quando há card e um alvo vai consumir** (a parada 2 re-executa o que está escrito nele; o `/method` usa o cenário como TC de referência). Sozinho, ou sem card, a reprodução fica **na conversa** — é dali que o `/card` ou o alvo seguinte a aproveitam.
- **A parada 2** é `references/human-check.md`: o loop do alvo a executa depois do estágio `commit` — este arquivo é o único protocolo que sai daqui para o pipeline.

## Fluxo

### 0. Jira, convenções e composição (SEMPRE)

1. **Invoque o `/jira`** — via **Skill tool** (`furi-ship:jira`; a forma curta `jira` também resolve). Chamada real: sem a invocação, o passo não aconteceu. Devolve `{rastreamento, site, key, …, estrutura}`.
2. **Invoque o `/setup`** — via **Skill tool** (`furi-ship:setup`; a forma curta `setup` também resolve). Devolve `{branch, commit, pr, jira, …}` — o § 2 usa `branch`. Duas invocações separadas, cada uma com a sua pergunta isolada.
3. **`pipeline/references/composicao.md`** — quem roda o quê: a tabela acima.

### 1. Buscar o objetivo

**Com card:** `mcp__atlassian__jira_get_issue` (`issue_key: KEY-N`): título, descrição, tipo (`BUG` | `FEATURE`), `## Como testar`, assignee, **anexos**. Colar a descrição **real**; ambiguidade → listar ≥ 2 interpretações (insumo do § 3).

> **Anexo de imagem ou vídeo → baixe e leia antes de decidir** (`jira_download_attachments` / `jira_get_issue_images`): é o que o solicitante viu, e é contra ele que a nota do § 4 é dada. O card vem em voz de PM/PO/QA — diz **o quê** e **por quê**; se prescrever solução, é ruído.

**Sem card:** o objetivo é a descrição do argumento — a superfície e o cenário saem dela; o que faltar, pergunte.

### 2. gh → integração → branch

A mecânica é do **`pipeline/references/branch.md`**, fonte única. Entrada: `branch: {modo, nome}` do `/setup`, a key (ou o slug do objetivo, sem card) e `<integração>` (`pipeline/references/deploy-context.md` § 1). Saída: o checkout na branch de trabalho, sincronizada. É nela que o alvo vai trabalhar — e é dela que a reprodução parte, porque o código que reproduz o bug tem de ser o código que será corrigido.

**Com card e alvo composto:** criar `docs/jira/todo/KEY-N.md` (e as pastas `docs/jira/todo/`, `docs/jira/done/` se faltarem):
```yaml
card: KEY-N
title: <título do Jira>
type: BUG | FEATURE
branch: <branch de trabalho>
phase: investigation
```
Assignee (se ainda não for o executor): `jira_update_issue`. Status: `jira-sync.md` com a etapa **trabalho começou**.

### 3. Entender o problema (nota ≥ 90) + gate de perguntas

Ler o **código** relevante e entender o problema. Nota **0–100** à precisão do entendimento; `< 90` → ler mais e repontuar, **em loop até ≥ 90**. Já mapeie o que o `/method` vai cobrar: **qual motor é dono** da capacidade e se há **superfície visual** — entendimento, não implementação.

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

Confirmou → o estágio `reprodução` está **fechado**. Com registro: `phase: method`.

### 6. Encerrar ou delegar (`composicao.md`)

| Composição | O que acontece agora |
|---|---|
| **sozinho** | encerra com a saída abaixo. Nada de `/method`, nada de commit |
| **`/card`** no argumento | `Skill(skill: "card", args: "<verbos restantes> <objetivo>")` — o `/card` lê a reprodução da conversa e escreve o `## Como testar` com os passos observados |
| **alvo** no argumento (sem `/card`) | `Skill(skill: "<alvo>", args: "/repro <objetivo>")` — o alvo vê `reprodução` fechado, funde a parada 2 (`references/human-check.md`, depois de `commit`) e roda o loop até o estágio dele |

**A parada 2 é do loop do alvo**, não daqui: depois do `/method` fechar o commit, o loop roda `references/human-check.md` — reproduz o **mesmo fluxo** do § 4/§ 5, para 1 passo antes do trigger, e o dev confirma que **o bug não acontece mais** (FEATURE: que funciona como o card diz). Obrigatório também em `finish`. Ao confirmar, o registro (se existe) vai a `phase: human-check` e entra no commit por caminho explícito — nunca `git add -A`.

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

## Arquivos de Referência
- `pipeline/references/composicao.md` — quem roda o quê (§ 0, § 6)
- `pipeline/references/branch.md` — motor de branch (§ 2)
- `pipeline/references/jira-sync.md` — comentar + transicionar o card (§ 2)
- `references/human-check.md` — **parada 2**, executada pelo loop do alvo depois de `commit`
- `references/rationalizations.md` — racionalizações proibidas

**Abra o reference relevante ao iniciar cada fase. Não execute de memória.**

## Red Flags — STOP

- "`/repro` sozinho, então reproduzo, corrijo e commito" → NÃO. **Sozinho, reproduz e para.** Corrigir é `/repro /work` — o `/method` roda dentro do loop do alvo.
- "`/repro /prod`: rodo o `/repro` inteiro com `/method` e depois o `/prod`" → NÃO. Reproduzo, parada 1, e **delego**. O `/method` roda uma vez, dentro do loop do `/prod`.
- "`/prod /repro` — não sou eu quem foi digitado, ignoro" → NÃO. O `/prod` me delega (`composicao.md`); a ordem de execução é fixa: `repro → card → alvo`.
- "Descobri/perguntei o board direto aqui" → NÃO. Step 0 é o `/jira`.
- "Pulei o Step 0 porque já sei desta sessão" → NÃO. Leitura é **toda** invocação.
- "`git checkout main && git pull`, como sempre" → NÃO. `<integração>` vem da topologia e a branch do motor `branch.md`.
- "Verifiquei no código, não preciso reproduzir" → NÃO. Reprodução na superfície onde o usuário vê, nota ≥ 90. Código localiza; reproduzir prova.
- "É API/mobile, não tem front, então leio o código" → NÃO. API tem superfície (a chamada real); mobile tem o emulador.
- "Em `finish` pulo a validação humana" → NÃO. As 2 são obrigatórias em todo modo; `finish` suprime só o opcional.
- "Mostro o resultado direto, sem o dev clicar" → NÃO. O dev clica no trigger e confirma ao vivo — antes e depois.
- "Sem card, então não dá pra reproduzir" → NÃO. O objetivo é a descrição; a reprodução fica na conversa.
- "Sem card, crio um pra ter registro" → NÃO. Card é `/repro /card`, decisão do usuário. Sozinho, a conversa é o registro.
- "Gravei o registro num `/repro` sozinho, pra não perder" → NÃO. Registro só com card **e** alvo composto — quem consome é a parada 2 e o `/method`. Sozinho, fica na conversa.
- "Card ambíguo, mas reproduzo e vejo o que dá" → NÃO. Gate de perguntas é **antes** de reproduzir o que não se entendeu.
- "O card tinha print anexado, mas nem abri" → NÃO. A nota do § 4 é dada contra ele.
- "Já conheço o `/solve` / o `/jira` / o `/setup`, sigo sem invocar" → NÃO. Skill entra pelo Skill tool, **toda** vez.
- "Terminei a reprodução, dou push / abro PR" → NÃO. Nem sozinho, nem composto: publicar é o estágio `push` do loop do alvo.
