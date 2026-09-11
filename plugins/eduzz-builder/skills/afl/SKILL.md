---
name: afl
description: 'Use when working on an AFL (Agents for Life) Jira card — runs /jira in the context of the AFL product: a platform of AI agents, so every feature is presumed to have a surface of AI-generated text the end user reads (chat reply, summary, persona, RAG answer) until Step 4 of /method derives otherwise — and that text is held to the #1-reference bar as a test criterion, not a nicety. Also carries what would be the AFL team setup that cannot live in the AFL repository. Installs /jira (and, through it, /method) as a dependency.'
argument-hint: "[CARD-CODE] | finish [CARD-CODE] | (empty to continue active card)"
requires: jira
---

# AFL — /jira no contexto Agents for Life

`/afl` = `/jira` rodando no **AFL (Agents for Life)**, uma plataforma de agentes de IA. Esta skill não tem fluxo próprio: ela dá ao `/jira` o que só o produto sabe, e sai da frente.

1. **Invoque o `/jira`** — via **Skill tool** (`eduzz-builder:jira`; a forma curta `jira` também resolve) — com os mesmos argumentos recebidos (`[CARD-CODE]`, `finish [CARD-CODE]`, ou vazio). Chamada real, não "seguir de memória": sem a invocação, o passo não aconteceu. O `/jira` traz o `/method` (dependência) e o invoca — Step 0 → `/method` → human check → ship.

2. **O produto é texto gerado por IA.** No AFL, toda feature **presume superfície de texto gerado por IA = sim** — resposta de chat, resumo, persona/prompt, resposta de RAG, troca de modelo — até o Step 4 do `/method` derivar o contrário (e, quando derivar, que diga por quê). A barra é a do `/method`, não uma cópia daqui: a **referência #1** e o "ler bem" ficam no spec (Step 4), pelo menos um TC tem o resultado na **qualidade do texto lido** (Step 5), e texto que lê pior que a referência é **FAILED** (Step 9). No **human check** do `/jira`, leia a saída como o usuário final lê — é onde o "funciona, mas lê mal" aparece.

3. **Por que esta skill existe.** O repositório do AFL é do time, e o processo deste fluxo é do Eduardo — por isso o `labzz-afl` **não versiona** `.claude/setup.md`, e o que seria o setup do AFL mora **aqui**, no pacote do dono do processo. O que é só da máquina (branch, PR, convenções de uso pessoal) fica em `.claude/setup.local.md`, fora do git — o `/jira` o lê no 0.1 e o `/setup` o cria no modo "só meu".

Tudo o mais — branch pelo `[CARD-CODE]` (`AV-N`, multi-card `AV-N-M`), ambiente, commit, ship — é o `/jira`, e está escrito lá, uma vez.
