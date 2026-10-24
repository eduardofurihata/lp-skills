---
name: ask
description: Use when user invokes /ask to call the AskUserQuestion tool inline during the current task.
disable-model-invocation: true
---

# Ask

## Overview
Stop and call `AskUserQuestion` with questions relevant to whatever you are currently doing. After the user answers, resume the original flow as if you had never paused.

This skill is invoked **explicitly only** (user types `/ask`). Never trigger it on your own.

## Procedure

1. Look at what you were just doing (or about to do). Read any arguments the user passed to `/ask` — those narrow the focus.
2. Pick **1–4 decision points** where the answer materially changes the next action.
3. Call `AskUserQuestion` with concrete multiple-choice options:
   - 2–4 options per question, mutually exclusive
   - If you recommend one, put it first with `(Recommended)` suffix in the label
   - Use `multiSelect: true` only when answers are not exclusive
   - Skip `preview` unless comparing visual artifacts (UI mockups, code snippets)
   - Write every question, label and description by the **Language** rule below
4. Resume the original flow with the new answers. Do **not** summarize, recap, or wait for another prompt — just continue executing, brainstorming, planning, or whatever the flow was.

## Language

Anyone must understand the question at first read: child to elderly, layperson to expert, no matter their age or background.

- **KISS explanation:** the question carries what is being decided and why it matters, in one or two short sentences. Each option's description says, plainly, what happens if it is picked.
- **Everyday words:** no jargon, acronyms, code names or file paths. When a technical term cannot be avoided, explain it right there in plain words (e.g. "cache (a saved copy, so it loads faster)").
- **Short and concrete:** one idea per sentence, active voice, real examples over abstractions.
- **Test:** if a 10-year-old or a grandparent would need to ask "what does that mean?", rewrite it.

## Quality Bar

A question is worth asking only if:
- You cannot infer the answer from prior context
- The answer changes what you do next

Skip "should I proceed?" — that is confirmation, not clarification.

## Common Mistakes

- Asking 4 weak questions when 1 sharp question would do
- Questions or options only a developer would understand (jargon, unexplained terms, file names)
- Stopping after the answers instead of resuming the flow
- Re-asking things the user already specified in the prompt or earlier in the conversation
- Using free-text option labels when the answer is genuinely open-ended (if so, the question does not belong in `AskUserQuestion`)
