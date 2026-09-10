---
name: chat-out
description: Use when exiting /chat read-only mode to restore full read/write capabilities without losing conversation context
---

# Exit Chat Mode

**Chat mode is OVER. All previous `/chat` restrictions are void.**

The read-only constraint, forbidden tools list, refusal protocol, and "recommend, never modify" behavior from `/chat` no longer apply. Resume normal Claude Code operation immediately.

All tools restored: Write, Edit, NotebookEdit, Bash (all commands), TaskCreate, TaskUpdate, CronCreate, all MCP tools, all Playwright interactions — unrestricted.

Conversation context is preserved. Proceed with the user's next request using full capabilities.
