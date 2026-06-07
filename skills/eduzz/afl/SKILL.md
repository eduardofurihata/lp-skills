---
name: afl
description: Use when working on an AFL (Agents for Life) Jira card — runs the full /jira 19-step workflow PLUS a mandatory text-quality gate that reads the actual agent response and scores it against a world-class rubric (would it beat ChatGPT/Claude/Gemini/Perplexity?). Use this instead of /jira on the AFL repo whenever the change can affect any user-facing agent output (chat, summaries, prompts, LLM swap, RAG, persona).
argument-hint: "[CARD-CODE] | finish [CARD-CODE] | (empty to continue active card)"
---

# AFL — Agent-Quality-Aware Jira Workflow

**Esta skill é FERRO. Vale para TODA a conversa.**
**Violating the letter of the rules is violating the spirit of the rules.**
**Functional pass ≠ AFL pass.** A response that "works" but reads worse than a top-tier AI app is a FAILED test.

---

## What this skill is

`/afl` = `/jira` + mandatory **Agent Response Quality Gate** during validation steps.

- Same 19 steps. Same gateways. Same audits. Same arguments.
- One difference: in steps **17a, 17b, and 18**, you MUST evaluate the **actual text the agent produced** against a world-class rubric — not just verify the feature works.

**Why this exists:** AFL competes head-to-head with ChatGPT, Claude, Perplexity, Gemini. A user who reads a mediocre answer churns to the competitor. The bar is "would beat or tie a top-tier AI app on this prompt," not "feature exists and didn't crash."

## How to run it

1. Invoke the `/jira` skill with the same arguments you received (`AV-N`, `finish AV-N`, or empty). Follow the 19-step contract in `~/.claude/skills/jira/SKILL.md` exactly — numbering, files, gateways, audits.
2. **At steps 17a / 17b / 18**, additionally apply the Agent Response Quality Gate below. Do NOT replace /jira criteria — ADD to them.
3. Record gate results in the same TC log + audit blocks /jira already requires.

Do NOT fork or rename steps. The /afl overlay is purely additive.

---

## When the Quality Gate Applies

Apply whenever the card can affect any user-facing agent output:
- Agent reply text (chat, channel, message)
- Agent tool-use summaries / final answers
- Prompt changes (system prompt, persona, instructions, RAG)
- LLM provider / model swap (Bedrock, OpenAI, …)
- Datasource read that feeds an answer
- Any feature whose output the end user reads as agent text

If the card is purely backend with NO agent-text impact (e.g. Redis cache race, OAuth 500, infra config), declare `Quality Gate: N/A — no agent-text impact` in the step 17a audit and skip the gate.

**Default is APPLY. Skipping requires explicit justification in the audit.**

---

## The Quality Gate — runs at the END of EVERY TC

**The gate is the FINAL step inside each TC's execution.** Without it, a TC **cannot** be marked PASSED — even if the feature behaved correctly. The functional pass and the quality pass are AND, not OR.

### Per-TC flow (extends /jira step 17a.1 for any TC that produces agent text)

For each TC-N.a, execute in this exact order:

1. Prepare environment (per /jira)
2. Execute the test steps (per /jira)
3. Capture the screenshot (per /jira)
4. **Capture the full agent response text verbatim** ← AFL gate begins
5. **Score the response on all 5 rubric dimensions, each with a quoted evidence line**
6. **Verdict:** PASSED only if `functional == ✅ AND every dim ≥ 4/5`. Otherwise FAILED.

### Gate outcomes

- **All dims ≥ 4 AND functional ✅** → TC-N.a PASSED → mark TC-N.b N/A → next TC
- **Any dim < 4 (even if functional ✅)** → TC-N.a FAILED → publish `TC-N FAILED — quality gate: [dim]=score` → escalate to TC-N.b (tune prompt / RAG / model / persona) → re-run TC-N.a from step 1
- **Functional ❌** → TC-N.a FAILED (per /jira) — quality gate not required to score, but capture transcript anyway for the correction context

The same loop /jira already enforces. Quality is just another way the TC can fail.

### Rubric (5 dimensions, 1–5 each)

| Dimension | Question | Pass |
|-----------|----------|------|
| Coherence | Makes sense end-to-end, no contradictions, logical flow | ≥ 4 |
| Accuracy | Facts grounded in source/context/datasource, no hallucination | ≥ 4 |
| Tone & Voice | Persona consistent, language correct (PT-BR/EN as configured), professional | ≥ 4 |
| Usefulness | User can act on this; actually answers what was asked | ≥ 4 |
| Competitive Quality | Beats or matches ChatGPT/Claude/Gemini/Perplexity for the same prompt | ≥ 4 |

**Read the full rubric with anchors and examples in `quality-rubric.md` BEFORE scoring. Do NOT score from memory.**

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

**Step 17a — Audit Pós-Execução** (append to existing block):
```
- TCs with agent text output: M (of N)
- Transcripts captured: M
- Rubric pass (all dims ≥ 4): M / total
- Below-threshold dims: [TC-X.dim=score, ...] or "none"
- Quality Gate verdict: ✅ ALL PASS  /  ❌ FAILED — re-running
```

**Step 18 — Pre-trigger message** (add before "browser positioned"):
```
**Agent quality verdict (from 17a):** ✅ all agent-text TCs ≥ 4/5 every dimension
```

If quality FAILED, you do NOT reach step 18 — you loop back to 17b.

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
- **Environment:** LOCAL DEV. `can create users: yes`, `can commit: yes`, NUNCA push (só no step 19).
- **Test user:** criar sob demanda — `can create users: yes` cobre; não há credencial fixa.

Demais regras (branching, gateways, steps) idênticas ao `/jira`. See `~/.claude/skills/jira/SKILL.md`.

## Reference files

- `quality-rubric.md` — full 5-dimension rubric with scoring anchors and examples (READ before step 17a)
- All step references — `~/.claude/skills/jira/references/`

**Abra `quality-rubric.md` ANTES de pontuar qualquer TC. Não pontuar de memória.**
