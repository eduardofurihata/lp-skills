---
name: ctt
description: Use when user invokes /ctt to capture a request into the Claude Code task list (TaskCreate) instead of doing it now — an inbox for ideas that surface mid-conversation without derailing the current work.
---

# /ctt

Capture, don't execute. The user had an idea mid-flight and wants it **parked in the task list**, not done right now. `/ctt` turns the request into task(s) via `TaskCreate` and returns to whatever was happening.

This skill is invoked **explicitly only** (user types `/ctt`). Never trigger it on your own.

## Procedure

1. **Read the request** — the text after `/ctt`. No argument → capture what was just discussed: the last thing the user asked for, or the follow-up you just proposed and didn't do. If even that is ambiguous, ask *one* short question; don't guess a task into existence.
2. **Check `TaskList`** for something equivalent already pending. Duplicate → say so and stop, or update the existing task with `TaskUpdate` when the new phrasing adds real detail.
3. **Split by deliverable, then one `TaskCreate` per task.** Two independent asks in one `/ctt` = two calls, never one task with a list inside. Steps of a single deliverable stay together as one task.
4. **Write it so it survives the conversation** (see Task shape).
5. **Resume the original flow** — continue exactly where you left off. Never start the captured work as a side effect of capturing it.
6. **Confirm in one line per task**: id + subject. No recap, no plan, no "want me to start?".

## Task shape

The task will be read later, in a session that has none of this context. It has to stand alone.

- **subject** — imperative, one line, names the outcome: "Migrar runner self-hosted para escopo de org", not "runner".
- **description** — what needs to be done **and enough context to act on it cold**: repo/paths, the constraint the user stated, why it came up. A description that only makes sense next to this conversation is a broken task.
- **activeForm** — present continuous for the spinner ("Migrando runner para escopo de org").
- Keep the user's own framing and constraints. `/ctt` is capture, not redesign — don't improve the scope, don't add steps they didn't ask for. Something looks wrong or underspecified? Record it in the description as an open question and move on.

## Common Mistakes

- **Doing the work** — the whole point is not doing it now.
- **Bundling** — three asks compressed into one vague task; they get lost.
- **Context-free tasks** — "arrumar o deploy" with no repo, no file, no symptom. Useless in a week.
- **Recapping** — a paragraph explaining what you captured. One line, then back to work.
- **Asking to proceed** — the user said park it; parking is the answer.
