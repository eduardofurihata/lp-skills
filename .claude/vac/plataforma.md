# Plataforma — o que o Claude Code faz por baixo (verificado, não lembrado)

Mapa escrito à mão a partir da exploração de 2026-09-12 (sessão lp-skills). Fatos sem arquivo levam `verificado em: <versão>` e ficam desatualizados quando a versão do transcript muda; fatos com arquivo levam `arquivo:linha — "trecho"` e são validados por `vac-hook.mjs scan --map`. Leia por seção — só a que precisar.

## Hooks (eventos, entrada, saída)

- Hooks de skill (frontmatter `hooks:`) registram para todos os 33 eventos do binário, mas na prática `SubagentStop` não dispara de hook de skill — dispara de settings/plugin — verificado em: 2.1.269 · 2026-09-12
- Eventos que disparam de hook de skill: `UserPromptSubmit`, `SubagentStart` (injeta `additionalContext`), `Stop`, `PostToolUse` (inclusive matcher `Agent`) — verificado em: 2.1.269 · 2026-09-12
- Input base de todo hook: `session_id`, `transcript_path`, `cwd`, `prompt_id?` (UUID por prompt do usuário) — verificado em: 2.1.269 · 2026-09-12
- `Stop`: `stop_hook_active`, `last_assistant_message?`; `SubagentStop`: + `agent_id`, `agent_transcript_path`, `agent_type` — verificado em: 2.1.269 · 2026-09-12
- `SessionStart.source` ∈ {`startup`, `resume`, `clear`, `compact`, `fork`} — o matcher casa contra `source` — verificado em: 2.1.269 · 2026-09-12
- Saída comum de todo evento: `continue`, `suppressOutput`, `stopReason`, `decision` (approve|block), `reason`, `systemMessage` ("Warning message shown to the user") — verificado em: 2.1.269 · 2026-09-12
- `hookSpecificOutput.additionalContext` em `UserPromptSubmit`, `SessionStart` (+ `reloadSkills`), `SubagentStart`, `Stop`, `PostToolUse` (+ `classifierContext`), `PreToolUse`; `PreCompact`/`PostCompact`/`TaskCreated`/`TaskCompleted` só têm a saída comum — verificado em: 2.1.269 · 2026-09-12
- Bloqueio = `exit 2` + stderr (volta como feedback ao modelo); `stop_hook_active: true` no retry; `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP` limita bloqueios consecutivos de Stop — verificado em: 2.1.269 · 2026-09-12
- Só `${CLAUDE_PLUGIN_ROOT}` expande em hook de skill; `${CLAUDE_PLUGIN_DATA}` (= `~/.claude/plugins/data/<plugin>-<marketplace>/`) só em `hooks/hooks.json` de plugin — verificado em: 2.1.269 · 2026-09-12
- Hooks de plugin vivem em `hooks/hooks.json` (formato wrapper); editar o arquivo não afeta a sessão corrente — /home/furihata/.claude/plugins/marketplaces/claude-plugins-official/plugins/plugin-dev/skills/hook-development/SKILL.md:342 — "In plugins, define hooks in `hooks/hooks.json`:"
- Validador oficial de hooks.json: `scripts/validate-hook-schema.sh` do plugin-dev — /home/furihata/.claude/plugins/marketplaces/claude-plugins-official/plugins/plugin-dev/skills/hook-development/SKILL.md:707 — "Validate configuration with `scripts/validate-hook-schema.sh hooks/hooks.json`"

## Transcript e subagentes

- Transcript da sessão: `~/.claude/projects/<slug>/<session_id>.jsonl`; toda linha traz `"version":"x.y.z"` — verificado em: 2.1.269 · 2026-09-12
- Compactação no transcript: linha `{"type":"system","subtype":"compact_boundary"}` + mensagem `user` com `"isCompactSummary":true` ("This session is being continued from a previous conversation…") — verificado em: 2.1.269 · 2026-09-12
- `tool_use` do assistente: `{"type":"tool_use","id","name","input"}`; `tool_result` do usuário: `{"tool_use_id","type":"tool_result","content"}` (string ou blocos) — verificado em: 2.1.269 · 2026-09-12
- Transcripts de subagente: `<projects>/<slug>/<session_id>/subagents/agent-<id>.jsonl` + `agent-<id>.meta.json` (`agentType`, `description`, `toolUseId`, `requestShape: background|…`); o `tool_result` do `Agent` traz `agentId: <id>` — verificado em: 2.1.269 · 2026-09-12
- Agente em background: o `tool_result` é "Async agent launched successfully…"; o relatório chega como `<task-notification>` (com `<task-id>`) numa mensagem `user` — verificado em: 2.1.269 · 2026-09-12
- Comando de barra do usuário aparece como `<command-name>/x</command-name>` na mensagem `user`; skill invocada pelo modelo é `tool_use` `Skill` com `{"skill","args"}` — verificado em: 2.1.269 · 2026-09-12
- Task list persiste em `~/.claude/tasks/<list-id>/<n>.json` (`{id, subject, description, status, blocks, blockedBy}`); list-id = `CLAUDE_CODE_TASK_LIST_ID` || team || session id — verificado em: 2.1.269 · 2026-09-12

## Plugins, cache e build

- A sessão carrega o plugin do cache `~/.claude/plugins/cache/lp-skills/<plugin>/<sha12>/` (SHA do clone GitHub do marketplace); mudança local só chega após commit + push — verificado em: 2.1.269 · 2026-09-12
- Teste local sem commit: `claude --plugin-dir plugins/furi-toolbox` — verificado em: 2.1.269 · 2026-09-12
- Versão dos manifestos Agent Plugins/Codex = `package.json.version` + sha256 do conteúdo de `skills/` (o manifesto Claude Code não tem versão: é por SHA do git) — scripts/generate-plugins.mjs:167 — "function contentVersion(pkg, slugs) {"
- O gerador só apaga `skills/` legado, `bundles/` e `.claude-plugin` dentro de skills — `hooks/` e `agents/` entram por convenção de pasta — scripts/generate-plugins.mjs:181 — "function pruneLegacy(slugsByPackage) {"
- CI roda `gen:plugins` + idempotência + `validate:plugins` + `typecheck`; testes do hook e evals não rodam no CI — .github/workflows/ci.yml:37 — "produz — alguém editou uma skill sem rodar `pnpm gen:plugins`."
- Testes do hook: `node --test` nativo sobre `plugins/furi-toolbox/skills/vac/scripts/` — package.json:15 — "node --test plugins/furi-toolbox/skills/vac/scripts/"

## Evals (`claude plugin eval`)

- Caso = diretório com `prompt.md` (+ frontmatter `max_turns`, `allowed_tools`) e `graders/*.md` (`type: llm|regex|tool_used`); `case.yaml` quando há fixture (`context.scaffold_script`) — verificado em: 2.1.269 · 2026-09-12
- `case.yaml` também aceita `context.history_file` (→ `--resume`), `context.add_dirs`, `execution.{prompt,max_turns,timeout_seconds,model,allowed_tools,append_system_prompt,env}` e `runs` — verificado em: 2.1.269 · 2026-09-12
- Prompt que começa com `/vac` expande sem chamada `Skill` (o grader `tool_used: Skill` não conta para ele) — plugins/furi-toolbox/evals/README.md:12 — "a skill expande direto"
- Fixture só roda com `--scaffold`; cada run parte de workspace vazio — plugins/furi-toolbox/evals/README.md:13 — "só rodam com `--scaffold`"
- Saída: `evals/results/<timestamp>/{aggregate-result.json, report.html}` (ignorado pelo git); ninguém consome o JSON — verificado em: 2.1.269 · 2026-09-12
- Suíte do vac: 3 runs por caso, teto `--max-cost-usd 20`; última rodada real custou US$ 0,90 para 1 caso × 3 runs — package.json:16 — "claude plugin eval plugins/furi-toolbox --case 'vac-*'"
