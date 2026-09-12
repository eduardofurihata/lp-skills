# Taxonomia — tipo de falha → camada que pega → caso que cobre

> **Classificar o erro muda a correção.** Formato quebrado se resolve com schema; fato inventado com grounding; instrução ignorada com o caso que falhou virando exemplo; erro raro com guardrail + fallback. Esta tabela é o roteiro: quando um caso novo aparece (bloqueio real, `VAC_STRICT=0`, `fallback` no log, achado do `mine.mjs`), primeiro se classifica, depois se conserta a **camada** certa, depois se grava o caso. Cada `rule` que `vac-rules.mjs`/`vac-ledger.mjs`/`vac-pedido.mjs`/`vac-cobertura.mjs` emite aparece aqui entre crases (teste de consistência).

Camadas: **entrada** (`vac-pedido.mjs` — triagem do pedido no `UserPromptSubmit`; tudo nota, nada bloqueia) · **cobertura** (`vac-cobertura.mjs` — a conta declarada e o item calado, no `check-artifact` e no `Stop`; tudo nota) · **cartão** (doutrina injetada) · **hook** (`coord`, `pointer`, `claim`, `stamp`, ledger `R-n`) · **verificador** (subagente em contexto limpo) · **eval** (caso de modelo, pago) · **scan/mine** (lote sobre projetos reais).

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

### A entrada — o pedido (31-36)

O que está acima é alucinação de **fato**: a afirmação não tem lastro. O que está abaixo é alucinação de **escopo**: o pedido não tinha lastro, o modelo preencheu o vazio com o plausível e entregou trabalho impecável para a pergunta errada — e todas as regras acima passam, porque o código foi lido e os comandos rodaram. Procedência não é relevância.

| # | Tipo de falha | Exemplo | Camada que pega | Regra | Caso |
|---|---|---|---|---|---|
| 31 | Premissa falsa no pedido (arquivo ou skill que não existe) | "arruma o header.tsx que quebrou na home", sem `header.tsx` na árvore | entrada (nota) | `alvo-nao-resolve` | teste `arquivo citado que não existe` |
| 32 | Pedido reformulado no prompt seguinte | "não era isso, eu queria o do admin" | entrada (nota) — **é a métrica**, não o defeito: sem ela, calibrar 31-36 é no escuro | `reformulacao` | teste `retratação explícita` |
| 33 | Material colado pela metade | cerca de código aberta e nunca fechada | entrada (nota) | `colagem-truncada` | teste `cerca de código aberta` |
| 34 | Pipeline caro disparado sem escopo | `/method filtro` — 60-80k tokens de protocolo para um slug | entrada (nota) | `pipeline-sem-escopo` | teste `pipeline caro com escopo curto` |
| 35 | Pronome sem referente (o "isso" morreu com o contexto anterior) | "arruma isso" | entrada (nota) | `deixis-sem-referente` | teste `pronome sem alvo` |
| 36 | Trabalho de outra skill feito à mão | "commita tudo" sem `/save` | entrada (nota) | `skill-nao-roteada` | teste `pediu o que uma skill faz` |

### A cobertura (37-40)

O que está acima é alucinação de **fato** (a afirmação não tem lastro) e de **escopo** (o pedido não tinha). Isto aqui é a terceira face: **completude é uma afirmação implícita** — toda entrega afirma "isto é tudo", e era a única afirmação que ninguém cobrava. Item não entregue e não declarado é um `[AUSENTE]`/`[INDISPONÍVEL]` que o modelo calou: abster não bloqueia, **calar a omissão inventa completude**.

Nenhuma regra aqui precisa de transcript, de sessão ou de modelo — o denominador e o numerador estão na mesma string, escritos pelo próprio protocolo. Por isso são imunes às quatro coisas que quebram regra de transcript: compactação, subagente, plan mode e sobrescrita do pedido.

| # | Tipo de falha | Exemplo | Camada que pega | Regra | Caso |
|---|---|---|---|---|---|
| 37 | Conta declarada que não fecha | `Predicted: 10 · Evidence collected: 17 · Delta: 0` | cobertura (nota) | `cobertura-delta` | teste `Delta: 0 com Evidence > Predicted`; **88** nos repos |
| 38 | Item previsto sem evidência e sem Delta declarado | `Predicted: 6` · `Evidence collected: 5`, e nada mais | cobertura (nota) | `cobertura-faltando` | teste `Evidence < Predicted`; **3** nos repos |
| 39 | Item aberto e mudo em card que já fechou | `- [ ] Aplicar migration em staging` em `kanban/11-ship/` | cobertura (nota) | `cobertura-checkbox` | teste `item aberto e mudo`; **115** nos repos |
| 40 | Conteúdo elidido | "n_ativos conta sig_eff>0; **resto igual**" | `mine.mjs` — **ainda não no hook** | `cobertura-elisao` | teste `marcador de conteúdo cortado`; 5 em 6.581 artefatos e 1 em 11.670 mensagens — raro demais para virar regra do hook |

**O que a cobertura NÃO cobra** (medido, não suposto): `Delta` que fecha é a declaração honesta e passa · item aberto com estado em qualquer vocabulário do time (`NOT_RUN`, `❌ FAIL`, `⏳ pendente (env+restart)`, `⚠️ PARCIAL`, `skipped`) passa · checkbox em card que ainda não fechou é trabalho a fazer · `Evidence > Predicted` sem Delta é escopo extra, não omissão. Descartados por medição: o `Ratio X == Y?` do Audit Pré (1 disparo em 6.581 artefatos, e era falso positivo — o `audit-counts` já confere o bloco contra o transcript) · denominador por task list (7 `TaskCreate` em 655 transcripts, e o `/ctt` cria pendência de propósito) · denominador pelo pedido do usuário (`idx.pedido.raw` é sobrescrito a cada prompt, e puniria o turno que fecha em `AskUserQuestion`).

**Ordem de custo-benefício quando algo novo aparece:** golden set (sample ou eval) > regra do hook > cartão > ledger > verificador. Fine-tune não está na lista: nunca foi a resposta para "entrega errado".
