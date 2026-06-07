# AFL Agent Response — Quality Rubric

5 dimensions, scored **1–5 each**. **Pass = every dimension ≥ 4.** No averaging.

Score with evidence: every dimension score must cite at least one quoted line from the response that supports it.

---

## 1. Coherence — Does it make sense end-to-end?

| Score | Anchor |
|-------|--------|
| 5 | Flows logically. No contradictions. Each sentence builds on the last. Conclusion follows the argument. |
| 4 | One minor stumble (a transition that's slightly off, a list item that doesn't quite fit) but the overall message lands. |
| 3 | Reads OK in parts but has a contradiction, a non-sequitur, or a section that doesn't connect. User has to re-read to follow. |
| 2 | Multiple jumps, contradictions, or fragments that don't form a coherent answer. |
| 1 | Word salad, repetitive loops, or clearly broken output. |

**Common 3-or-below symptoms**
- Repeats the question instead of answering
- Lists steps that contradict each other
- Switches topic mid-paragraph
- Says "in conclusion" without anything to conclude
- Bullet points that don't share a subject

---

## 2. Accuracy — Are facts grounded in the source?

| Score | Anchor |
|-------|--------|
| 5 | Every factual claim is supported by the datasource / context provided. Numbers, names, dates correct. No invention. |
| 4 | One minor imprecision (a paraphrase that's slightly loose, a rounded number) but no false claim. |
| 3 | One small factual error or unsupported claim that a careful user would catch. |
| 2 | Multiple unsupported claims, or one significant factual error (wrong number, wrong name, wrong date). |
| 1 | Hallucinated content, contradicts the source, or fabricates entities (rows, fields, features that don't exist). |

**Common 3-or-below symptoms**
- Cites a value not present in the datasource
- Invents a feature, field, or column that doesn't exist
- States "always / never" with no basis
- Mixes data from different rows/records
- Confidently asserts something the context didn't establish

---

## 3. Tone & Voice — Is the persona consistent and professional?

| Score | Anchor |
|-------|--------|
| 5 | Matches the configured agent persona exactly. Language register correct. PT-BR / EN as configured (no mixing). No corporate-AI clichés. |
| 4 | Mostly on-voice; one slightly off phrasing or one filler line. |
| 3 | Generic AI tone where a specific persona was configured, OR awkward translation, OR unnecessary disclaimers. |
| 2 | Wrong language, wrong register (too casual / too formal for the persona), or persona slips repeatedly. |
| 1 | Robotic boilerplate, leaks system prompt, or breaks character entirely. |

**Common 3-or-below symptoms**
- "Como uma IA, eu..." / "As an AI language model..."
- Over-apologizing, hedging on every sentence
- English phrases dropped into PT-BR for no reason (or vice versa)
- Doesn't use the persona's name / voice at all
- Generic "happy to help!" sign-offs that the persona wouldn't use

---

## 4. Usefulness — Can the user act on this?

| Score | Anchor |
|-------|--------|
| 5 | Answers exactly what was asked. Concrete. The user knows what to do, or now knows what they wanted to know. |
| 4 | Answers the question with one minor unnecessary tangent or one missing detail. |
| 3 | Partial answer; user still has to ask a follow-up to get the actual information. |
| 2 | Generic advice instead of a specific answer. Fluff. "It depends on your use case" without exploring it. |
| 1 | Doesn't answer the question. Refuses without reason. Bounces the question back. |

**Common 3-or-below symptoms**
- Lists options without picking one when the user asked for a recommendation
- Restates the question as the answer
- Adds disclaimers but no substance
- Defers to "consult a professional" inappropriately
- Answers a different (easier) question than the one asked

---

## 5. Competitive Quality — Does it beat top-tier AI apps?

**This is the highest-bar dimension.** Imagine you sent the exact same prompt to ChatGPT (latest GPT), Claude (latest Opus/Sonnet), Gemini (latest), and Perplexity. Would the AFL response **win** or **tie**?

| Score | Anchor |
|-------|--------|
| 5 | Wins — better grounded in our data, more on-persona, or genuinely sharper than what a generic top-tier model would say. |
| 4 | Ties — at least as good as the top-tier baseline. |
| 3 | Slightly worse — top-tier baseline would be noticeably better. User would prefer the competitor. |
| 2 | Clearly worse than a generic top-tier answer. |
| 1 | Embarrassing next to a top-tier baseline. |

**To score honestly**
- Mentally (or actually) draft what ChatGPT / Claude would say to the same prompt
- Compare side-by-side
- AFL **wins** ONLY if it leverages something the generic models can't (your datasource, your persona, your domain context, your tool calls)
- If AFL produces a generic answer that any LLM would produce, it's a **tie at best** — and that's not why the user came to AFL

**Common 3-or-below symptoms**
- Could have been generated without any AFL-specific context
- Misses an angle that top-tier models would catch
- Less concise / less specific than a baseline answer
- Doesn't use the user's datasource or persona at all
- Wraps a thin answer in long boilerplate

---

## Scoring Protocol — End of every TC

1. Read the prompt that was sent to the agent (verbatim).
2. Read the **full** response (no skimming, no truncating).
3. For **each** of the 5 dimensions:
   - Quote a specific line from the response as evidence
   - Write a 1–2 sentence justification
   - Assign a score 1–5
4. **Verdict:**
   - `functional == ✅ AND every dim ≥ 4` → TC PASSED
   - Otherwise → TC FAILED → escalate to TC-N.b
5. Capture all 5 scores + justifications + verdict in the TC log under "Agent Quality Capture".

## Honest scoring guardrails

- **No quote, no score above 3.** If you can't cite evidence, you didn't score — you guessed.
- **No averaging.** Every dim must clear 4 independently. A 5/5/5/5/3 is a FAIL, not a 4.6.
- **Length ≠ quality.** A 5-line response can score 5/5; a 30-line response can score 2/5.
- **Self-comparison is not Competitive Quality.** "Better than the previous version" doesn't count — compare to top-tier external products.
- **Native speaker ≠ on-persona.** PT-BR being fluent doesn't mean Tone & Voice scores 5 — match against the configured persona, not generic correctness.
- **Defaults for short outputs:** if the response is shorter than 1 sentence, default Usefulness ≤ 3 unless the prompt was a yes/no question.
- **If you'd accept a score-3 answer as a user**, the rubric is wrong OR the response is wrong. Either fix the rubric (with evidence) or fail the TC. Do not pass.
