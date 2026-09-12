# Work Cycle — fechar o estágio `commit`: do objetivo ao commit local, revisado e testado

> **Motor de estágio.** Invocado só pelo `reconcile.md` quando o estágio `commit` está aberto — o trabalho do objetivo ainda não está em commit na branch de trabalho. Era o corpo do `/work`; agora o `/work` só declara o alvo e este motor faz. Na borda, invoca o **`/method`** (`furi-build:method`) via Skill tool — chamada real, nunca reproduzida de memória.

**Responsabilidade única:** levar o objetivo (card ou trabalho sem card) até **um commit local** na branch de trabalho, com código + docs + card em `kanban/10-done/` — implementado, revisado e testado pelo `/method`. Não pusha (`pr-publish.md`), não abre PR, não cria branch (`branch.md`, o estágio anterior, já fechou).

## Iron Law

> **Precisão > tokens > velocidade.** Ler o card inteiro, entender ≥ 90, perguntar só o que muda o que será feito — e então delegar ao `/method`, que é o dono do protocolo. Este motor **prepara e delega**; não reimplementa um step sequer do `/method`.

## Contrato

| Entrada | Saída |
|---|---|
| objetivo (`<KEY>-<N>`, ou a descrição do trabalho sem card) + `branch` (já sincronizada, do estágio anterior) + `setup` (§ Commit) + `jira` (estrutura, ou `rastreamento ≠ Jira`) | commit local na branch, `kanban/10-done/<feature>.md` com `tests: passed`, `{commit, feature, keys[]}` para o loop |

## Sinal de fechado (o que o `reconcile` confere)

```bash
git status --porcelain                                   # vazio
git log origin/<integração>..HEAD --no-merges --format=%s # tem o trabalho do objetivo (a key, quando há card)
ls kanban/10-done/<feature>.md                           # existe, com `tests: passed`
```

**Ambíguo:**

| Sinal | O que fazer |
|---|---|
| árvore suja com código, sem commit | **não** commita avulso: é trabalho que não passou pelo `/method` — volta ao § 4 e o `/method` absorve a árvore como ponto de partida (ele lê o que existe) |
| card em `kanban/06-todo/` (o `/fast` parou no review) | QA não rodou: **invoque o `/todo`** (`furi-build:todo`) para aquele feature até 100% PASSED — é ele que promove a `10-done`; depois o `/method` fecha o Step 10 |
| `10-done` existe mas `tests:` não é `passed` | "done sem prova" = não testado. `/todo` de novo |
| commits na branch **sem key nenhuma** e há card | o commit anterior não seguiu o § Commit — não reescreva histórico; o commit deste ciclo leva a key, e o `pr-publish` deriva os cards dos commits que a têm |
| sem card e a árvore está limpa | não há objetivo: o estágio está **fechado por vazio** — o loop reporta gap zero |

## Fluxo

### 1. Buscar o objetivo

**Com card:** `mcp__atlassian__jira_get_issue` (`issue_key: <KEY>-<N>`): título, descrição, tipo, `## Como testar`, assignee, **anexos**. Colar a descrição **real** do card; ambiguidade → listar ≥ 2 interpretações (insumo do § 3).

> **O card vem em voz de PM/PO, QA ou Designer** (`/card`), não de dev — diz **o quê** e **por quê**, com rota, comportamento esperado e referência visual. Traduza para a **capacidade** que a feature exige. Card não é spec técnica: se prescrever solução, é ruído — quem deriva arquitetura é o `/method`.
> Tem **anexo de imagem**? Baixe (`jira_download_attachments` / `jira_get_issue_images`) e leia antes de decidir: é o que o solicitante viu.

**Sem card** (`rastreamento` ≠ Jira, ou o usuário chamou o alvo sem key): o objetivo é a descrição que veio no argumento ou, sem ela, **o trabalho que já está na árvore** (`git status --porcelain` + `git diff`). Nenhum dos dois → não há objetivo; devolva ao loop como fechado por vazio.

**Com reprodução na conversa** (o `/repro` compôs, ou rodou sozinho antes): os passos observados, a superfície e o trigger são insumo do entendimento — não refaça a reprodução aqui.

### 2. Mover o card → em andamento

Só com card. Assignee (se ainda não for o executor): `mcp__atlassian__jira_update_issue`. Status: `jira-sync.md` com a etapa **trabalho começou** — ele lê no `jira.md` o status e se comenta. Nenhuma equivalente → avisa e segue.

### 3. GATE de perguntas (analisar — perguntar SÓ se necessário)

Entender o objetivo lendo o **código** relevante. Já mapeie o que o `/method` vai cobrar: **qual motor é dono da regra** (ou qual falta) e **se há superfície visual** — entendimento, não implementação.

Nota **0–100** à clareza do que precisa ser feito:
- **< 90, ou ambiguidade real** (2 caminhos opostos, requisito de produto faltando, decisão que só o usuário julga) → **PARAR e perguntar** (`AskUserQuestion`) ANTES de implementar. Só seguir com a resposta.
- **≥ 90 e sem ambiguidade** → seguir. **Não invente pergunta.**

> O gate é **pré-implementação** e é sobre *produto/escopo*. Dúvida de *implementação* resolve pela hierarquia (padrão do projeto > big apps > boas práticas) e documenta no spec — não vira pergunta.

### 4. Rodar o `/method`

**Invoque o `/method`** — via **Skill tool** (`furi-build:method`; a forma curta `method` também resolve), **passando o objetivo como argumento** (`<KEY>-<N>`, ou o nome do feature sem card). Chamada real: sem a invocação, o passo não aconteceu. Ele:

1. chama o **`/solve`** (padrão 10x acima do #1 do mercado) na ativação;
2. roda discovery (1–5) → To Do (6) → Plano (7a) → Codificar (7b) → Code Review (8) → Run Test / QA via front (9) → Done (10);
3. trabalha **na branch atual** (nunca cria branch — o estágio `branch` já fechou), com os próprios gateways e audits — princípios (SOLID · DRY · KISS · YAGNI · LoD · Motores), refatoração do perímetro e, se há tela, design;
4. **converge os follow-ups antes de fechar**: todo achado fora de escopo vira ciclo `/method` completo até o passe seco (Regra Inviolável 7);
5. fecha no **Step 10**: um único commit local com código + docs + card em `kanban/10-done/` — com a key do **card ativo** onde o § Commit do setup mandar. Num lote, a branch é do 1º card; o commit é do card de hoje.

**Não duplicar nada do `/method` aqui** — ele é o dono do protocolo.

### 5. Devolver ao loop

```
{ commit: <hash>, feature: <nome>, keys: [<KEY>-<N>], kanban: kanban/10-done/<feature>.md }
```

O loop re-diagnostica: `commit` fechado abre `push`. Se o alvo era `/work`, o loop para aqui e a skill reporta.

## Red Flags — STOP

- "Sei o que o `/method` faz, implemento direto" → NÃO. Mencionar não é invocar. O `/method` entra pelo Skill tool, **toda** vez — é ele que tem os gateways, o review frio e a QA.
- "Deixo o `/method` criar a branch" → ele **não cria**. O estágio `branch` (`branch.md`) fechou antes de este motor rodar.
- "Invoquei o `/method` sem passar o card; ele tira a key da branch" → NÃO. Num lote a branch é do 1º card e o commit sairia com a key errada. O argumento é `<KEY>-<N>`.
- "Card claro, mas pergunto mesmo assim" → NÃO. ≥ 90 e sem ambiguidade → segue.
- "Card ambíguo, mas começo a codar e ajusto depois" → NÃO. Gate de perguntas é **antes**.
- "A árvore já tem código, só commito" → NÃO. Código que não passou pelo `/method` não tem review nem QA. O `/method` parte dele.
- "Não tem card, então não tem o que fazer" → depende: tem descrição ou árvore suja → é o objetivo. Nada → fechado por vazio, e o loop diz isso.
- "O card não falou de motor, então espalho a regra" → NÃO. O card fala de produto; a arquitetura é derivada no `/method`, e capacidade tem **um** dono.
- "O card tinha print anexado, mas nem abri" → NÃO. O anexo é o que o solicitante viu.
- "Terminei, já pusho" → NÃO. Este motor fecha em **commit local**. `push` é o próximo estágio, do `pr-publish.md` — e é o loop que decide se ele está na faixa.
