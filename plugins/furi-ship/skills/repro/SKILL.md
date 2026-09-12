---
name: repro
description: 'Use when user invokes /repro [KEY-N] to take a bug card from live reproduction to pull request on ANY board of the personal Atlassian. The bug is reproduced where the user sees it BEFORE any code, and the dev sees it twice: before and after the fix. Discovers the board (/jira-board) and the team conventions (/setup), branches through the branch engine shared with /work, moves the card to in-progress, understands (≥90) and reproduces (≥90, in a loop) the scenario on the right surface (web via Playwright, mobile on the emulator, API with a real call), stops so the dev clicks the trigger and sees the bug, runs /method (which invokes /solve) to fix + review + QA + commit, stops again so the dev confirms the bug is gone, then asks before invoking /pull-request. `/repro finish` skips every optional question but never the two human checks. Feature cards: maps where the change lands instead of a bug.'
effort: max
requires: [jira-board, setup, solve, method, pull-request]
handoff: homolog
argument-hint: "[KEY-N] | finish [KEY-N] | (empty = continuar card ativo)"
---

# /repro — Reproduzir → corrigir → provar (card do Jira, qualquer board)

Pega um card de bug de **qualquer board** do Atlassian pessoal e leva da **reprodução ao vivo** até o **PR**, **10x acima da referência #1 do mercado**. **Skill standalone do projeto pessoal.** O que a distingue: o bug é reproduzido **onde o usuário o vê, antes de qualquer código**, e o dev o vê **duas vezes** — antes do fix (o trigger na tela, o bug acontecendo) e depois (o mesmo trigger, o bug sumido). Carrega o `/solve` na ativação e reusa o `/method` (que o recarrega) como protocolo de engenharia; o ship é o `/pull-request`.

> 🚫 NÃO pusha nem abre PR por conta própria: o ship é o **`/pull-request`**, invocado no § 9 depois de perguntar (ou direto em `finish`). NÃO mergeia — isso é `/homolog`/`/prod`.

## Ordem de Operações ao Ativar

**ANTES de tudo — invoque o `/solve`.** Toda vez que o `/repro` for ativado, a PRIMEIRA ação é **invocar o `/solve` via Skill tool** (`furi-build:solve`; a forma curta `solve` também resolve) para carregar o padrão — **10x acima da referência #1 do mercado**. Chamada real, não "seguir de memória": sem a invocação, o passo não aconteceu. O `/solve` define o nível; o `/repro` é quem leva o bug da reprodução ao PR **nesse nível** — e o `/method` (§ 7) recarrega o mesmo `/solve` quando rodar. Depois disso, siga o Fluxo a partir do § 0.

## Iron Law

> **Esta skill é FERRO.** Vale para TODA a conversa. **Violating the letter of the rules is violating the spirit of the rules.**
> **Precisão > tokens > velocidade.** Tokens são baratos. Bug em produção é caro. Mire **10x acima da referência #1 do mercado** (padrão do `/solve`) — o líder do domínio é o piso, não o teto; complexidade pra chegar lá é requisito, não obstáculo. "É simples, pulo" = a violação.
> Os princípios (**SOLID · DRY · KISS · YAGNI · LoD · Motores**), a **refatoração contínua** e o **design** (tokens, atomicidade, estados, a11y — quando tem tela) vêm juntos e valem em **todos** os steps — doutrina em `plugins/furi-build/skills/principles/SKILL.md`, cobrada gateway a gateway pelo `/method` que o `/repro` invoca. Card "pequeno" não relaxa nenhum deles.

## Argument parsing

| Arg | Modo | Ação |
|-----|------|------|
| `KEY-N` (ou URL do card) | START | roda § 0 → § 6 e **PARA** na validação humana do bug |
| `finish KEY-N` / `finish` | FINISH | roda tudo até o § 10 sem parar — **exceto as 2 validações humanas (§ 6 e § 8), que continuam obrigatórias** |
| vazio | CONTINUE | detecta o card ativo e retoma de onde parou (abaixo) |

**`finish` = zero paradas programadas além das 2 validações humanas.** Suprime "quer que eu continue?", a pergunta antes do ship (§ 9) e qualquer confirmação opcional. **Não** suprime a pergunta de **ambiguidade real** do § 4 (zona cinza é do usuário em qualquer modo) nem os guards do `/pull-request` (árvore suja, branch atrás da integração).

**CONTINUE:** o card ativo é o `docs/jira/todo/*.md` cuja `branch:` é a branch atual — vários → pergunte qual; nenhum → "Nenhum card ativo. Use `/repro KEY-N` para começar." O § 0 roda sempre (a leitura é toda invocação); depois confira que está na `branch:` do registro (senão `checkout`) e sincronize (`work/references/branch.md` § 5). Routing pelo `phase:` do registro:

| `phase` | Ação |
|---------|------|
| `investigation` | retomar do § 4, pulando o que o registro já tem |
| `method` | re-invocar o `/method` (Skill tool — `furi-build:method`, com `KEY-N`); ele retoma pelo checklist do card do kanban |
| `human-check` | § 8 |
| `ship` | § 9 |

## Convenções (CONTRATO)

- **Qualquer projeto** do Atlassian pessoal, sempre via `mcp__atlassian__*`. A key sai do argumento (`ALK-42` → projeto `ALK`) ou da **memória do projeto** quando o argumento não traz uma — **nada hardcoded**.
- **Board vem do `/jira-board`** (§ 0, dependência obrigatória), que lê a memória do projeto e pergunta só na primeira vez. Não descubra nem pergunte o board aqui.
- **Modo de trabalho e nome da branch vêm do `/setup`** (§ 0, dependência obrigatória) e são aplicados pelo motor **`work/references/branch.md`** (§ 2) — `branch por card`, `branch acumula cards` ou `direto na integração`: **nada hardcoded aqui**, nem "default", nem "exceção". Pedido explícito na sessão vence para esta invocação e não reescreve o arquivo — o § 10 oferece `/setup branch` se for pra virar padrão.
- **Status de "em andamento" é descoberto, nunca inventado** — a mecânica é do **`prod/references/jira-sync.md`** (fonte única).
- Card não encontrado → o projeto pode estar em **outro site Atlassian** (o MCP alcança só o site do seu `JIRA_URL`). Diga isso; não aproxime para outra key.
- O `/method` trabalha SEMPRE na branch atual e **nunca cria branch** — por isso a branch nasce no § 2, antes de invocá-lo.
- **O registro `docs/jira/todo/KEY-N.md` é o estado do card:** o `phase:` roteia o CONTINUE e o human check re-executa o que está escrito nele. Entra no commit do Step 10 do `/method` (já com `phase: method`); depois disso, só por caminho explícito (§ 8) — nunca `git add -A`.
- **Superfície = onde o usuário vê o bug**, nunca o código: a tela/rota (web), o app (mobile) ou o endpoint (API) que o card e o anexo nomeiam. Ler o código localiza; reproduzir prova.

## Fluxo

### 0. Board do projeto e convenções do time (SEMPRE, antes de tudo)
1. **Invoque o `/jira-board`** — via **Skill tool** (`furi-ship:jira-board`; a forma curta `jira-board` também resolve). Chamada real, não "seguir de memória": sem a invocação, o passo não aconteceu. Dependência obrigatória, junto do `/solve`, do `/method` e do `/pull-request`: ele lê a memória do projeto e, se não houver board gravado, pergunta e grava. Devolve `{site, key, boardId, boardName, url, origem}`.
2. **Invoque o `/setup`** — via **Skill tool** (`furi-ship:setup`; a forma curta `setup` também resolve). Dependência obrigatória: ele lê `.claude/ship-setup/setup.md` (do time, versionado — ou `setup.local.md`, só seu, quando o repositório mantém `.claude/` fora do git; a decisão é dele) e, se não existir, infere, pergunta o mínimo e grava. Devolve `{branch: {modo, nome}, commit, pr, jira, infra, guidelines, origem}` — o § 2 usa `branch`, o § 8 usa `commit`.

Duas invocações separadas, cada uma com a sua pergunta isolada (uma vez na vida do repositório). Key explícita no argumento **vence** o que veio da memória e **não** a reescreve. Nunca assuma o board nem as convenções, nem pergunte por eles aqui.

### 1. Buscar o card
`mcp__atlassian__jira_get_issue` (`issue_key: KEY-N`): título, descrição, tipo (`BUG` | `FEATURE`), `## Como testar`, assignee, **anexos**. Colar a descrição **real** do card; se houver ambiguidade, listar ≥2 interpretações (insumo do § 4).

> **Anexo de imagem ou vídeo → baixe e leia antes de decidir** (`jira_download_attachments` / `jira_get_issue_images`): é o que o solicitante viu, e é contra ele que a nota do § 5 é dada. O card vem em voz de PM/PO/QA — diz **o quê** e **por quê**; se prescrever solução, é ruído: a arquitetura é do `/method`.

### 2. gh → integração → branch (REGRA DE OURO)
A mecânica é do **`work/references/branch.md`** (motor de branch), fonte única — siga-o, não o reescreva aqui. Entrada: `branch: {modo, nome}` do `/setup` (§ 0), a key do card e a integração resolvida pelo `prod/references/deploy-context.md` § 1. Saída: o checkout na branch de trabalho — feature branch, lote aberto ou a própria integração — sincronizada com `origin/<integração>`. É nela que o `/method` (§ 7) trabalha; ele **nunca** cria branch.

### 3. Registrar o card e mover → em andamento
Criar `docs/jira/todo/KEY-N.md` (criar `docs/jira/todo/` e `docs/jira/done/` se não existirem). Frontmatter mínimo:

```yaml
card: KEY-N
title: <título do Jira>
type: BUG | FEATURE
branch: <branch de trabalho do § 2>
phase: investigation
```
Colar a descrição real e as interpretações do § 1.

- Assignee (se ainda não for o executor): `mcp__atlassian__jira_update_issue` (`issue_key: KEY-N`, `fields: { "assignee": { "accountId": "<executor>" } }`).
- Status: mover o card para o **equivalente a "em andamento"** no workflow daquele projeto ("Em andamento", "In Progress", "Doing"…). A mecânica é do **`prod/references/jira-sync.md`**, fonte única — siga-o, não o reescreva aqui. Nenhuma equivalente no workflow? Avise e siga — o trabalho não trava por status.

### 4. Entender o problema (nota ≥ 90) + gate de perguntas
Ler o **código** relevante e entender o problema descrito no card. Dar uma **nota 0–100** à precisão do entendimento; `< 90` → ler mais código/contexto e repontuar, **em loop até `≥ 90`**. Registrar o entendimento no registro. Já mapeie o que o `/method` vai cobrar: **qual motor é dono** da capacidade (ou qual falta) e se há **superfície visual** — entendimento, não implementação.

- **Ambiguidade real** (2 caminhos opostos, requisito de produto faltando, decisão que só o usuário julga) que leitura não resolve → **PARAR e perguntar** (`AskUserQuestion`) antes de qualquer código — em qualquer modo, `finish` inclusive.
- `≥ 90` e sem ambiguidade → seguir. **Não invente pergunta.**
- Problema encontrado **fora do card** → nunca decidir em silêncio: `AskUserQuestion` com os 6 campos (O que é / Como reproduzi / Causa provável / Possível solução / Relação com o card / Recomendação).

### 5. Reproduzir na superfície certa (nota ≥ 90)
**A superfície é onde o solicitante viu o bug** — a rota/tela, o app ou o endpoint que o card e o anexo nomeiam. A ferramenta segue a mesma tabela por contexto do Step 9 do `/method` (`plugins/furi-build/skills/method/references/09-testing.md`, § Ferramenta por Contexto):

| Superfície | Como reproduzir |
|---|---|
| **Web** | Playwright MCP — instância `pw4`, pool `pw#` como fallback automático (ocupada → próximo índice livre; nunca SKIP/BLOCKED enquanto houver um) |
| **Mobile** | emulador Android / simulador iOS — a plataforma que o card nomeia; as duas, se ele não distinguir |
| **API / backend** | chamada real (curl/httpie) com o payload do card, contra o serviço rodando |

Reproduzir o cenário **exato** do card — usuário, dados, condições (`can create users: yes` — crie o que faltar). Dar uma **nota 0–100** à precisão da reprodução vs. **o que está escrito e anexado no card**; `< 90` → ajustar e repontuar, **em loop até `≥ 90`**. Ao atingir:
- **BUG:** registrar no `docs/jira/todo/KEY-N.md` exatamente **como** foi reproduzido — usuário, dados, ponto de partida (URL / tela / endpoint), passos, trigger, superfície (+ `pw#`). É esse registro que o § 6 e o § 8 re-executam.
- **FEATURE:** identificar e registrar **onde** vai nascer (arquivo / fluxo / tela / endpoint) e o estado atual desse lugar.

Não conseguiu reproduzir → **pergunte ao usuário**. Nunca "pelo código o bug é…".

### 6. Preparar + PARAR — validação humana do bug (pré-fix)
Rodar o fluxo de novo e parar **1 passo antes do trigger**: o gatilho visível na tela (web/mobile) ou a requisição montada e **não enviada** (API). Evidência do estado pré-trigger (screenshot, ou a requisição + o estado dos dados).

Publicar no chat: ambiente pronto + **"👉 Clique em / Execute: [elemento ou comando exato]"** + o comportamento atual (o bug; FEATURE: o estado do lugar onde vai nascer) + a evidência. **PARAR e aguardar o dev confirmar que viu — obrigatório também em `finish`.** Só depois da confirmação: `phase: method` no registro.

### 7. Rodar o /method
Com o problema **entendido e reproduzido**, **invoque o `/method`** — via **Skill tool** (`furi-build:method`; a forma curta `method` também resolve), **passando o card como argumento** (`KEY-N`). Chamada real, não "seguir de memória": sem a invocação, o passo não aconteceu. Dependência obrigatória. Ele:
1. chama o **`/solve`** na ativação;
2. roda discovery (1–5) → To Do (6) → Plano (7a) → Codificar (7b) → Code Review (8) → Run Test / QA (9) → Done (10), com seus próprios gateways e audits — princípios, refatoração do perímetro e design, se houver tela;
3. trabalha **na branch do § 2** (nunca cria branch) — o registro do § 5 e a conversa são insumo do discovery dele: o cenário reproduzido é o TC de referência do bug;
4. converge os follow-ups antes de fechar — o card sai sem ponta solta;
5. fecha no **Step 10**: um único commit local (código + docs + card do kanban + o registro, já com `phase: method`) com a key do card ativo onde o § Commit mandar.

**Não duplicar nada do `/method` aqui** — ele é o dono do protocolo. Quando ele fechar no Step 10, atualize o registro: `phase: human-check`.

### 8. Human check (pós-fix)
Rode **`references/human-check.md`**: reproduza o **mesmo fluxo do § 5/§ 6**, pare 1 passo antes do trigger e deixe o dev clicar/executar para confirmar que **o bug não acontece mais** (FEATURE: que funciona como o card diz). **PARAR — obrigatório também em `finish`.**

**Ao confirmar:** `phase: ship` no registro e **commit do registro por caminho explícito**, na convenção do § Commit do `/setup` (§ 0):
```bash
git add docs/jira/todo/KEY-N.md
git commit -m "docs(KEY-N): registro do /repro — reproduzido e validado pelo dev"   # a key onde o § Commit mandar
```
Nunca `git add -A`, nunca código: código novo volta ao `/method` (re-review), não entra em commit avulso. Sem esse commit a árvore fica suja e o guard "working tree limpo" do `/pull-request` para a skill.

### 9. Ship — /pull-request
Perguntar:

> "Bug validado. Quer que eu rode o **`/pull-request`** (push + PR + espelho no Jira)?"

Em **`finish`** não pergunta: invoca. **Não** → parar; o registro fica em `phase: ship` e o `/repro` (CONTINUE) retoma daqui — ou o usuário roda `/pull-request` quando quiser.
**Sim** → **invoque o `/pull-request`** — via **Skill tool** (`furi-ship:pull-request`; a forma curta `pull-request` também resolve). Chamada real, não "seguir de memória": abrir o PR "à mão" pula o corpo 3-em-1, a idempotência e o espelho no Jira. Ele roda o próprio Step 0 (leitura é toda invocação, sem pergunta nova), pusha, cria ou atualiza o PR na integração, comenta e transiciona cada card da branch, e promove `kanban/10-done → 11-ship`.

**Depois:** `mv docs/jira/todo/KEY-N.md docs/jira/done/KEY-N.md` e, no frontmatter, `shipped: true` e `pr: <URL>` (sem PR — § PR `Abre PR: não`: `pr: — (push em <branch> @ <hash>)`). Fica na árvore sem commit, como o `kanban/11-ship/` que o `/pull-request` deixa.

### 10. Encerrar
```
✅ /repro KEY-N — reproduzido, validado pelo dev (antes ✔ · depois ✔), corrigido e publicado.
   Projeto: <KEY>  ·  Board: <nome do board> [memória do projeto | argumento]
   Setup:   <branch por card | branch acumula cards | direto na integração> [arquivo | criado agora | override de sessão]
   Branch:  <branch>  [feature branch | lote: <n> cards — <keys, dos commits> | direto na integração]
   Repro:   <web pw# | mobile <plataforma> | API> · <ponto de partida> → <trigger>
   Commit:  <hash> (do /method) + <hash> (registro)
   PR:      <URL> (base: <integração>)        ← sem PR (§ PR `Abre PR: não`): "push em <branch> @ <hash>"
   Jira:    em revisão (comentário + transição, via /pull-request)
   Registro: docs/jira/done/KEY-N.md (shipped: true)  ·  Kanban: kanban/11-ship/<feature>.md
   Próximo: /homolog (review + gate de QA + merge + deploy + verificação no ar) — ou /prod, em branch única
```
"Não" no § 9 → variante curta: `✅ /repro KEY-N — validado pelo dev; ship pendente. Registro: docs/jira/todo/KEY-N.md (phase: ship). Próximo: /repro (retoma no ship) ou /pull-request.`

Houve override de sessão no § 2? Uma linha a mais, **oferecendo** — nunca gravando: *"Hoje foi `<modo>`; quer que vire o padrão deste repositório?"* — um "sim" e você invoca `/setup branch` (skill interna: o usuário não a digita).

## Ambiente

```
environment: LOCAL DEV
can create users: yes   (crie as condições da reprodução — usuário, dado, flag, serviço)
commit: /method Step 10 + o registro, por caminho explícito (§ 8)
push: só dentro do /pull-request (§ 9)
```

## Arquivos de Referência
- O protocolo de implementação é o **`/method`** (pacote `furi-build`, dependência — invocado no § 7)
- `work/references/branch.md` — motor de branch (§ 2)
- `prod/references/jira-sync.md` — comentar + transicionar o card (§ 3)
- `references/human-check.md` — validação humana pós-fix (§ 8)
- `references/rationalizations.md` — racionalizações proibidas

**Abra o reference relevante ao iniciar cada fase. Não execute de memória.**

## Red Flags — STOP

- "Descobri/perguntei o board direto aqui" → NÃO. § 0 é o `/jira-board`; ele é o único dono da memória do projeto.
- "Pulei o § 0 porque já sei o board desta sessão" → NÃO. A leitura da memória é **toda** invocação.
- "Assumi que crio branch (é o fluxo dos devs)" / "assumi que trabalho direto (é o meu repo)" → NÃO. O modo vem do **`/setup`** § Branch, a cada invocação. Sem arquivo, o `/setup` pergunta — uma vez na vida do repositório.
- "O usuário pediu branch hoje, atualizei o `.claude/ship-setup/setup.md`" → NÃO. Override de sessão vale pra invocação. Só `/setup branch` reescreve o arquivo.
- "`git checkout main && git pull`, como sempre" → NÃO. A integração vem da topologia (`deploy-context.md` § 1) e a branch do motor `work/references/branch.md` — `main` pode nem ser a integração.
- "O status 'Em andamento' não existe nesse projeto, então inventei um" → NÃO. Escolha entre as transições que existem; nenhuma equivalente → avisa e segue.
- "Deixo o `/method` criar a branch" → ele **não cria**. A branch nasce no § 2.
- "Invoquei o `/method` sem passar o card; ele tira a key da branch" → NÃO. Num lote a branch é do 1º card e o commit sairia com a key errada. O argumento é `KEY-N`.
- "Já conheço o `/solve` / o `/jira-board` / o `/setup` / o `/method` / o `/pull-request`, sigo sem invocar" → NÃO. Mencionar não é invocar: a skill entra pelo Skill tool, **toda** vez.
- "Card claro, mas pergunto mesmo assim" → NÃO. ≥90 e sem ambiguidade → segue. Pergunta só quando a resposta **muda o que será feito**.
- "Card ambíguo, mas começo a codar e ajusto depois" → NÃO. Gate de perguntas é **antes** de implementar — e antes de reproduzir o que não se entendeu.
- "O card tinha print anexado, mas nem abri" → NÃO. O anexo é o que o solicitante viu; a nota do § 5 é dada contra ele.
- "Verifiquei no código, não preciso reproduzir" → NÃO. Reprodução na superfície onde o usuário vê, com nota ≥ 90. Código localiza; reproduzir prova.
- "É API/mobile, não tem front, então leio o código" → NÃO. API tem superfície (a chamada real); mobile tem o emulador. A tabela é a do § 5.
- "Em `finish` pulo a validação humana" → NÃO. As 2 (§ 6 e § 8) são obrigatórias em todo modo; `finish` suprime só o opcional.
- "Mostro o resultado direto, sem o dev clicar" → NÃO. O dev clica no trigger e confirma ao vivo — antes e depois.
- "Gravei `phase: ship` antes do dev confirmar" → NÃO. A phase muda **depois** da confirmação — é ela que o CONTINUE lê.
- "Árvore suja, dou `git add -A` pra destravar o `/pull-request`" → NÃO. Só o registro, por caminho explícito (§ 8); código novo volta ao `/method`.
- "Terminei, dou push / abro o PR com `gh pr create`" → NÃO. Ship é o `/pull-request` pelo Skill tool, depois de perguntar (salvo `finish`).
- "Invoco o `/pull-request` direto após o human check" → NÃO. Pergunte antes — salvo em `finish`.
