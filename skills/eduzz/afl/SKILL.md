---
name: afl
description: Use when working on an AFL (Agents for Life) Jira card — runs the full /jira workflow (Step 0 investigação → /method → human check → ship) PLUS a mandatory text-quality gate that reads the actual agent response and scores it against a world-class rubric (would it beat ChatGPT/Claude/Gemini/Perplexity?). Use this instead of /jira on the AFL repo whenever the change can affect any user-facing agent output (chat, summaries, prompts, LLM swap, RAG, persona).
argument-hint: "[CARD-CODE] | finish [CARD-CODE] | (empty to continue active card)"
---

# AFL — Agent-Quality-Aware Jira Workflow

**Esta skill é FERRO. Vale para TODA a conversa.**
**Violating the letter of the rules is violating the spirit of the rules.**
**Functional pass ≠ AFL pass.** A response that "works" but reads worse than a top-tier AI app is a FAILED test.

---

## What this skill is

`/afl` = `/jira` + mandatory **Agent Response Quality Gate** durante os testes e a validação.

- Mesmo workflow do `/jira`: **Step 0 (investigação) → `/method` (vendorizado) → human check → ship**. Mesmos gateways, mesmos audits, mesmos argumentos.
- Uma diferença: durante o **Step 9 (Testing) do `/method`** e o **human-check do `/jira`**, você DEVE avaliar **o texto real que o agente produziu** contra uma rubrica de classe mundial — não só verificar que a feature funciona.

**Why this exists:** AFL competes head-to-head com ChatGPT, Claude, Perplexity, Gemini. Um usuário que lê uma resposta medíocre troca pelo concorrente. A régua é "empata ou ganha de um app top-tier neste prompt", não "a feature existe e não quebrou".

## How to run it

1. Invoque o `/jira` com os mesmos argumentos (`AV-N`, `finish AV-N`, ou vazio). Siga o workflow do `/jira` em `~/.claude/skills/jira/SKILL.md`: **Step 0 → `/method` vendorizado (`references/method/`) → human check → ship**.
2. **No Step 9 (Testing) do `/method` e no human-check**, aplique adicionalmente o Agent Response Quality Gate abaixo. NÃO substitua os critérios do `/method`/`/jira` — SOME a eles.
3. Registre os resultados do gate no mesmo TC log + audit que o Step 9 do `/method` já exige.

NÃO bifurque nem renomeie steps. O overlay `/afl` é puramente aditivo.

---

## When the Quality Gate Applies

Aplique sempre que o card puder afetar qualquer saída de texto do agente para o usuário:
- Texto de resposta do agente (chat, canal, mensagem)
- Resumos de tool-use / respostas finais do agente
- Mudanças de prompt (system prompt, persona, instruções, RAG)
- Troca de LLM / modelo (Bedrock, OpenAI, …)
- Leitura de datasource que alimenta uma resposta
- Qualquer feature cuja saída o usuário final lê como texto do agente

Se o card for puramente backend SEM impacto em texto de agente (ex.: race de cache Redis, OAuth 500, config de infra), declare `Quality Gate: N/A — no agent-text impact` no audit do Step 9 e pule o gate.

**Default é APLICAR. Pular exige justificativa explícita no audit.**

---

## The Quality Gate — runs at the END of EVERY TC

**O gate é o passo FINAL dentro da execução de cada TC** (no Step 9 do `/method`). Sem ele, um TC **não pode** ser marcado PASSED — mesmo que a feature funcione. O pass funcional e o pass de qualidade são AND, não OR.

### Per-TC flow (estende o loop de Testing do /method Step 9, para TC que produz texto de agente)

Para cada TC que gera texto de agente, execute nesta ordem exata:

1. Preparar ambiente (per /method Step 9)
2. Executar os passos do teste via front (per /method Step 9)
3. Capturar o screenshot (per /method Step 9)
4. **Capturar o texto completo da resposta do agente, verbatim** ← AFL gate começa
5. **Pontuar a resposta nas 5 dimensões da rubrica, cada uma com uma linha de evidência citada**
6. **Veredito:** PASSED só se `functional == ✅ AND toda dim ≥ 4/5`. Senão FAILED.

### Gate outcomes

- **Todas dims ≥ 4 AND functional ✅** → TC PASSED → próximo TC
- **Qualquer dim < 4 (mesmo com functional ✅)** → TC FAILED → publicar `TC-N FAILED — quality gate: [dim]=score` → corrigir (tunar prompt / RAG / modelo / persona). **Per /method, qualquer fix invalida a validação: volta ao Code Review (Step 8) e re-testa TUDO (Step 9).**
- **Functional ❌** → TC FAILED (per /method) — o gate de qualidade não precisa pontuar, mas capture o transcript mesmo assim para o contexto da correção.

A qualidade é só mais uma forma do TC falhar dentro do loop que o `/method` já impõe.

### Rubric (5 dimensions, 1–5 each)

| Dimension | Question | Pass |
|-----------|----------|------|
| Coherence | Makes sense end-to-end, no contradictions, logical flow | ≥ 4 |
| Accuracy | Facts grounded in source/context/datasource, no hallucination | ≥ 4 |
| Tone & Voice | Persona consistent, language correct (PT-BR/EN as configured), professional | ≥ 4 |
| Usefulness | User can act on this; actually answers what was asked | ≥ 4 |
| Competitive Quality | Beats or matches ChatGPT/Claude/Gemini/Perplexity for the same prompt | ≥ 4 |

**Leia a rubrica completa com âncoras e exemplos em `quality-rubric.md` ANTES de pontuar. NÃO pontue de memória.**

### Required capture per agent-text TC

```markdown
### TC-N — Agent Quality Capture

- Prompt sent to agent (verbatim): "<...>"
- Full response text (verbatim, no truncation): "<...>"
- Rubric:
  - Coherence: X/5 — quote: "<line from response>" — justification: ...
  - Accuracy: X/5 — quote: "<...>" — justification: ...
  - Tone & Voice: X/5 — quote: "<...>" — justification: ...
  - Usefulness: X/5 — quote: "<...>" — justification: ...
  - Competitive Quality: X/5 — vs <ChatGPT|Claude|Gemini|Perplexity>: ...
- Failing dimensions: [list, or "none"]
- Verdict: PASSED / FAILED
```

### Audit additions

**/method Step 9 — Audit Pós-Execução** (acrescentar ao bloco existente):
```
- TCs with agent text output: M (of N)
- Transcripts captured: M
- Rubric pass (all dims ≥ 4): M / total
- Below-threshold dims: [TC-X.dim=score, ...] or "none"
- Quality Gate verdict: ✅ ALL PASS  /  ❌ FAILED — re-running
```

**jira human-check — Pre-trigger message** (adicionar antes do "browser posicionado"):
```
**Agent quality verdict (do Step 9):** ✅ all agent-text TCs ≥ 4/5 every dimension
```

Se a qualidade FALHOU, você **não chega ao human-check** — volta ao fix + Code Review (Step 8) + re-teste (Step 9).

---

## Anti-rationalization

| Excuse | Reality |
|--------|---------|
| "Feature works, text quality is subjective" | The rubric exists precisely to make subjectivity disciplined. Use it. |
| "Users won't notice the wording" | Wording is exactly why users prefer one AI product over another. |
| "The model decided this" | We picked the model AND the prompt. Both are in scope. Tune them. |
| "Good enough for now" | "Good enough" is how you lose to a competitor whose default is great. |
| "Comparing to ChatGPT/Claude is unfair" | That IS the bar. Users compare us to them anyway. |
| "Screenshot is enough" | No. The transcript text is the artifact under test. |
| "I scored from memory" | Re-read the rubric. Quote evidence. Score with citations. |
| "It's a tiny prompt tweak" | A tiny prompt tweak shifts the output distribution. Re-test. |
| "The PT-BR is fine, I'm a native speaker" | Score against the rubric anchors anyway. Native ≠ on-persona. |
| "It scored 3 but I'd accept it as a user" | Then the rubric is wrong, OR the response is wrong. Either way: stop and resolve before passing. |

## Red flags — STOP and treat the TC as FAILED

- TC log has only a screenshot, no transcript
- A score given without a quoted line from the response
- A dimension marked "N/A" on an agent-text TC
- Compared to a weaker product instead of a top-tier one (ChatGPT, Claude, Gemini, Perplexity)
- Skipped the gate without declaring "no agent-text impact" in the audit
- Verdict "PASSED" with any dimension < 4
- Averaging dimensions to reach a passing number (averaging is forbidden — every dim must clear 4)

---

## Contexto Eduzz — Environment, Branching, Test User

O `/jira` é genérico (project key `PROJ-`). O `/afl` é o overlay Eduzz e injeta a especificidade real ao acionar o `/jira`:

- **Project key — `AV-*`:** os cards seguem o padrão `AV-*` — card único `AV-36`; multi-card `AV-36-40`, `AV-36-40-55`, `AV-36-40-55-72` (números em ordem crescente, prefixo `AV-`). Sempre que o `/jira` pedir um `[CARD-CODE]`, considere o `AV-*`.
- **Environment:** LOCAL DEV. `can create users: yes`, `can commit: yes`, NUNCA push fora do ship.
- **Test user:** criar sob demanda — `can create users: yes` cobre; não há credencial fixa.

Demais regras (branching, fases, gateways) idênticas ao `/jira`. See `~/.claude/skills/jira/SKILL.md`.

## Reference files

- `quality-rubric.md` — rubrica completa de 5 dimensões com âncoras e exemplos (LER antes do Step 9 / Testing)
- Workflow do `/jira` — `~/.claude/skills/jira/SKILL.md`
- Protocolo de testes — `~/.claude/skills/jira/references/method/references/09-testing.md`
- Human check — `~/.claude/skills/jira/references/human-check.md`

**Abra `quality-rubric.md` ANTES de pontuar qualquer TC. Não pontuar de memória.**
