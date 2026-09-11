---
name: ask
description: Use when user invokes /ask to call the AskUserQuestion tool inline during the current task.
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
4. Resume the original flow with the new answers. Do **not** summarize, recap, or wait for another prompt — just continue executing, brainstorming, planning, or whatever the flow was.

## Quality Bar

A question is worth asking only if:
- You cannot infer the answer from prior context
- The answer changes what you do next

Skip "should I proceed?" — that is confirmation, not clarification.

## Common Mistakes

- Asking 4 weak questions when 1 sharp question would do
- Stopping after the answers instead of resuming the flow
- Re-asking things the user already specified in the prompt or earlier in the conversation
- Using free-text option labels when the answer is genuinely open-ended (if so, the question does not belong in `AskUserQuestion`)
