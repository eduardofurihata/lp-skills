# Taxonomia — tipo de falha → camada que pega → caso que cobre

> **Classificar o erro muda a correção.** Formato quebrado se resolve com schema; fato inventado com grounding; instrução ignorada com o caso que falhou virando exemplo; erro raro com guardrail + fallback. Esta tabela é o roteiro: quando um caso novo aparece (bloqueio real, `VAC_STRICT=0`, `fallback` no log, achado do `mine.mjs`), primeiro se classifica, depois se conserta a **camada** certa, depois se grava o caso. Cada `rule` que `vac-rules.mjs`/`vac-ledger.mjs` emite aparece aqui entre crases (teste de consistência).

Camadas: **cartão** (doutrina injetada) · **hook** (`coord`, `pointer`, `claim`, `stamp`, ledger `R-n`) · **verificador** (subagente em contexto limpo) · **eval** (caso de modelo, pago) · **scan/mine** (lote sobre projetos reais).

| # | Tipo de falha | Exemplo | Camada que pega | Regra | Caso |
|---|---|---|---|---|---|
| 1 | Coordenada inventada (arquivo não existe) | `lib/graph.ts:12` | hook | `coord` | teste `arquivo inexistente`; sample 004 (basename ambíguo) |
| 2 | Linha além do arquivo | `lib/skills.ts:9999` | hook | `coord` | teste `linha além do arquivo` |
| 3 | Coordenada envelhecida (o código mudou depois do artefato) | run-test antigo citando linha que moveu | verificador; `scan`/`mine` (classe envelhecido) — não é falha do turno | `coord-suffix` (note) | mine.mjs |
| 4 | Claim nu em gate | `- Princípios: ✅ aplicados` | hook | `claim` | teste `Gateway Check → bloqueia`; sample 006 |
| 5 | Menção ≠ uso | "a palavra `PASSED`", "nunca é PASSED" | precisão do hook (não bloqueia) | — | sample 001 |
| 6 | Screenshot/evidência morta | `screenshot: .playwright-mcp/nope.png`, `**Screenshot:** x.png`, célula "Evidência" apontando arquivo inexistente | hook | `pointer` | teste `screenshot`; samples 010, 016 |
| 7 | Contagem inventada | Audit Pré `M = 9` com 0 `TaskCreate` no transcript | ledger | `audit-counts`, `audit-completed` | sample 011; eval `vac-tarefa-longa-taskcreate` |
| 8 | Processo não cumprido | "invoquei o /solve" sem `Skill`; `RESULTADO:` sem `blind.sh` | ledger | `skill-not-invoked` | eval `vac-composicao` |
| 9 | Comando não rodado | `` `pnpm typecheck` → 0 errors `` sem `Bash` | ledger | `cmd-not-run` | sample 020 |
| 10 | Ferramenta não chamada | `tool: TaskList → 7 completed` sem `TaskList` (ou contagem ≠ disco) | ledger | `tool-not-called` | sample 018 |
| 11 | Herança pós-compactação | afirma do resumo; coordenada lida antes do `compact_boundary` | cartão `--after-compact` + janela do ledger zera | `coord-not-read` (note) | sample 019; eval `vac-pos-compactacao` |
| 12 | Hearsay de subagente | relata `x.ts:12` do Explore sem ler | `agent-done`/`SubagentStop` + R-1 | `coord`, `coord-not-read` | teste `agent-done Explore`; eval `vac-subagente-coordenada` |
| 13 | INFERIDO → ✅ sem confirmar | tabela de princípios com "parece" | verificador (semântico) | — | eval `vac-inferido-vira-ok` |
| 14 | Abstenção gratuita | `INDISPONÍVEL` sem tentativa nomeada | verificador; cartão | — | eval `vac-abstencao-gratuita` |
| 15 | Gate sem carimbo | `LIBERADO` sem `/vac <artefato>` | hook | `stamp` | teste `gate 8→9 sem carimbo` |
| 16 | Carimbo inválido | artefato editado depois da verificação | hook (sha256) | `stamp` | teste `edição invalida` |
| 17 | "No ar" sem verificação da sessão | bloco final de `/homolog` sem `/vac última` | hook | `stamp-session` | sample 015 |
| 18 | Verificador sem VEREDITO | relatório sem a linha final | `SubagentStop`/`agent-done` | `verdict` | teste `sem VEREDITO` |
| 19 | Relatório do verificador resumido | "o verificador aprovou" | ledger | `verifier-report-omitted` | sample 013 |
| 20 | "No ar" sem smoke | `Smoke: URL — 3/3` sem navegação nem `curl` | ledger | `smoke-no-nav` | sample 015; eval `vac-homolog-sem-smoke` |
| 21 | Deploy "verde" sem `gh run` | `run 123 ✓ verde` | ledger | `run-not-watched` | sample 015 |
| 22 | PR "aberto" sem `gh pr` | `## ✅ PR aberto` | ledger | `pr-not-created` | — |
| 23 | Commit afirmado sem `git commit` | Checklist Final com commit ✅ | ledger | `commit-claimed` | — |
| 24 | Audit "publicado" sem o heading | `Audit Pré-Execução publicado? ✅` | ledger | `heading-not-published` | sample 012 |
| 25 | Retry ignorado | mesmos itens depois de 2 bloqueios | fallback: pendência + `systemMessage` + log | — | teste `fallback` |
| 26 | Bypass | `VAC_STRICT=0` | log `bypass` + aviso | — | teste `VAC_STRICT=0` |
| 27 | Formato de outra skill trocado pelo do /vac | `NOT_RUN` → `[INDISPONÍVEL]` | eval | — | eval `vac-superposicao-todo` |
| 28 | Falso positivo de template | `— ✅ (path)`, tabela com célula preenchida, `Ratio ✅ SIM`, célula ✅ com prosa | precisão do hook (`note`) | `claim-prose-evidence`, `coord-ambiguous` | samples 005, 007, 008, 009, 017 |
| 29 | Falso positivo de path | relativo a subdir, abreviado, `…/` | resolução por sufixo | `coord-suffix` | samples 002, 003, 014 |
| 30 | Coordenada negada | "AUSENTE — não posso citar `lib/nope.ts:3` como fato" bloqueada como inválida (prova ao vivo, 2026-09-12) | precisão do hook (`note`) | `coord-negated` | sample 024 |

**Ordem de custo-benefício quando algo novo aparece:** golden set (sample ou eval) > regra do hook > cartão > ledger > verificador. Fine-tune não está na lista: nunca foi a resposta para "entrega errado".
