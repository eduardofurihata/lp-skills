---
name: vac
description: 'Use when user invokes /vac — vacina contra alucinação. Turns on the anti-hallucination regime for EVERY session from now on (hooks live in the plugin, dormant until `/vac`; `/vac off` turns them off) and composes with any other skill without touching it: `/vac /method x` runs /method under the regime. Every claim carries a state — VERIFICADO (evidence on the same line), AUSENTE (where you searched), INDISPONÍVEL (what was missing and what you tried), INFERIDO (from what, confirmed how) — repo facts only after Read/Grep in this context window, world state only via tools, never from memory; the hook checks coordinates, evidence files, claims in gate sections, gate stamps and — via the session transcript — whether the Read, command, Skill, TaskCreate or TaskList you cite actually happened. Two blocks per prompt, then a persisted pending note. With a target (`artefato.md`, `diff`, `última`) it verifies claim by claim in a clean-context subagent. `log`, `caso`, `scan`, `mapa`, `status` close the loop: every block becomes a golden-set case; `.claude/vac/` maps replace re-exploration. Triggers on "isso existe mesmo?", "você rodou?", "cita a linha", "sem inventar", "prova isso", "sem alucinar". Not for building features; not a code reviewer (that is /proof).'
effort: max
argument-hint: "[off | /skill args… | artefato.md | diff | última | log [N] | caso [id] | scan <dir> | mapa [nome] | status | tarefa]"
---

# /vac — vacina contra alucinação

**Alucinação não é um bug com fix: é uma taxa, e ela cai por camadas.** Prompt dizendo "não invente" é a camada de menor retorno — este repositório tem três gerações de regra assim e os relatórios continuaram saindo com `PASSED` sem evidência. O `/vac` põe as camadas que faltavam: um **vocabulário** onde abster é resposta válida, **evidência como parte da sintaxe** da afirmação, **hooks** que injetam o cartão em cada prompt e conferem o barato no `Stop`, no `Write`/`Edit` de artefato e no fim de cada subagente (arquivo existe? linha existe? claim tem lastro? o comando citado rodou mesmo?), um **verificador em contexto limpo** que julga o que o gerador não pode julgar — a própria prova —, um **log** que transforma cada bloqueio em caso do golden set, e **mapas** validados por scan que substituem a re-exploração entre sessões.

**Ligou, ficou — em toda sessão.** Os hooks vivem no plugin (`plugins/furi-toolbox/hooks/hooks.json`): sempre registrados, dormentes até `/vac` gravar `~/.claude/vac-data/vac/on` (um teste de arquivo em shell, sem Node, quando desligado). Ligado, valem no prompt seguinte, na sessão nova, no `claude -p`, no cron, no `--resume`, no subagente que qualquer skill abrir (`SubagentStart` injeta o cartão; `SubagentStop` confere o retorno com o transcript do próprio subagente; `PostToolUse` do `Agent` cobre o síncrono), no gateway publicado depois da compactação (`SessionStart` com `compact|resume|fork` reinjeta o cartão, lista os artefatos tocados e os mapas). `/vac off` desliga; `VAC=0` desliga num processo; `VAC_ON=1` liga sem o arquivo (evals); `VAC_STRICT=0` transforma bloqueio em aviso — e cada uso vai para o log como dívida.

**Sinergia por superposição, nunca por edição.** O `/vac` não muda o `/method`, o `/todo`, o `/homolog`. Ele acrescenta uma exigência a qualquer formato que outra skill peça: **mantenha o formato dela inteiro e ponha o estado + a evidência na linha**. Os gates delas estão mapeados em `scripts/gates.json` (leitura humana em `references/gates.md`): o Gateway Check continua com as linhas que o `/method` manda; cada ✅ delas passa a vir com `arquivo:linha`, `` `comando` → saída ``, `tool: … → …` ou `screenshot: path` — ou vira o estado real. As formas de evidência delas (`— ✅ (path)` do `/todo`, `**Screenshot:** path`, nome de arquivo em célula de tabela, `run <id>`) contam como evidência; a coluna "Evidência" vazia é o próprio `/method` dizendo "não revisado".

## Modos — pela forma do argumento

| Invocação | Modo | O que acontece |
|---|---|---|
| `/vac` | **regime** | Rode via Bash, chamada real: `node "<diretório base desta skill>/scripts/vac-hook.mjs" on` (o diretório base vem na primeira linha da invocação) e cole a saída. Leia `references/estados.md` inteiro (o vocabulário e a sintaxe exata que o hook lê). Se a leitura for negada, o cartão basta — diga `[INDISPONÍVEL] Read de references/estados.md → <motivo>` e siga. Daqui em diante, em toda sessão, toda afirmação sua obedece ao cartão. |
| `/vac off` | **desliga** | `… vac-hook.mjs off`. Os hooks seguem registrados e dormentes; o regime vale até o fim deste turno. |
| `/vac /skill args…` | **composição** | Regime **e depois** a skill: `Skill(skill: "<nome sem a barra>", args: "<o resto>")`. Chamada real, não "seguir de memória": sem a chamada visível, a skill não rodou. |
| `/vac <alvo>` — `arquivo.md`, `diff` ou `última` | **audit** | Roda o verificador (abaixo) e publica o relatório **inteiro**. Nunca edita o alvo: quem escreveu corrige e pede de novo. `última` sobre um bloco de `/homolog`/`/prod` grava o carimbo de sessão que fecha o gate "no ar". |
| `/vac log [N]` | **log** | `… vac-hook.mjs log --tail N` e publique a saída inteira: bloqueios, bypasses, fallbacks, carimbos. Toda linha `bypass` ou `fallback` é dívida até virar caso. |
| `/vac caso [id\|last]` | **ciclo** | `… vac-hook.mjs caso <id\|last>` gera um sample em `scripts/samples/` a partir da entrada do log (dentro do lp-skills) ou imprime para colar. Falso positivo do hook → `expect: pass` + `class: falso-positivo-…`; falha do modelo → vira caso de `evals/vac-*`. Depois `pnpm test:vac`. |
| `/vac scan <dir>` | **lote** | `… vac-hook.mjs scan <dir>` confere todos os `.md` de processo de um projeto (read-only) e resume por regra — é o que separa positivo verdadeiro, envelhecido e falso positivo de template. |
| `/vac mapa [nome]` | **mapa** | Consolida a exploração desta sessão em `.claude/vac/<nome>.md` (`<nome>.local.md` se o repo ignora `.claude/`): um bullet por fato, `- <fato> — arquivo:linha — "trecho literal"`; fatos de plataforma levam `— verificado em: <versão> · <data>`. Roda `… scan --map <arquivo>` e publica o resumo. O hook confere cada ponteiro na escrita. |
| `/vac status` | **estado** | `… vac-hook.mjs status`: ligado/desligado, carimbos, últimos eventos. |
| `/vac <tarefa em texto>` | **regime + tarefa** | Liga e executa a tarefa sob a régua — `[ESTADO]` em cada afirmação da entrega. |

Argumento que resolve para arquivo `.md` existente, ou é exatamente `diff`/`última`, é alvo; `off`, `log`, `caso`, `scan`, `mapa`, `status` são modos; que começa com `/` é composição; o resto é tarefa.

## O cartão — o que os hooks repetem a cada prompt

O texto entre os marcadores é a **fonte única** do que `scripts/vac-hook.mjs` injeta em todo prompt, em todo subagente e depois de cada compactação (o script lê este arquivo e extrai o bloco). Regra de tamanho: ≤ 950 caracteres (`wc -m`; o teste impõe) — cada palavra a mais custa em **todo** prompt de toda sessão; corte antes de acrescentar.

<!-- vac:card -->
[/vac · regime ativo] Toda afirmação carrega um estado: VERIFICADO (evidência na própria linha: `arquivo:linha` · `comando` → saída literal · tool → retorno · screenshot: path que existe) · AUSENTE (procurei em X; não existe) · INDISPONÍVEL (faltou Y; tentei Z) · INFERIDO (deduzi de W; confirma-se por V). Fato do repo só após Read/Grep nesta janela; estado do mundo (git, URL, deploy, tasks) só por ferramenta agora — o hook confere no transcript se a leitura, o comando, a Skill, o TaskCreate ou o TaskList citados aconteceram. ✅ · PASSED · LIBERADO · APROVADO · ✓ · "no ar" · "invoquei" · "li" · "criei" = VERIFICADO com evidência na linha; sem ela, escreva o estado real — abster não bloqueia, inventar bloqueia. Formato de outra skill: mantenha inteiro e acrescente estado + evidência. Após compactação ou em subagente: releia do disco. Gate, review, run-test e "no ar" só fecham após `/vac <artefato>` — publique o relatório inteiro.
<!-- /vac:card -->

## A sequência — por afirmação, não por resposta

1. **Classifique** o que vai afirmar: fato do repo · resultado de execução · estado do mundo (git, URL, deploy, board, task) · dedução/opinião · cumprimento de processo ("invoquei", "li", "publiquei", "criei", "commitei", task fechada).
2. **Aterre.** Fato do repo só depois de Read/Grep/Glob **nesta janela de contexto** — depois da última compactação —, com `arquivo:linha`. Fato de lib/framework só com o arquivo em `node_modules/` ou a doc lida — nunca da memória de treino (o `AGENTS.md` deste repo abre com "este NÃO é o Next.js que você conhece").
3. **Ferramenta em vez de memória.** Existe? → `ls`/Glob. Mudou? → `git status`/`git diff`. Compila? → `tsc` com a saída colada. Passou? → executar, com saída ou screenshot. No ar? → `curl`/Playwright. Task fechada? → `TaskList`, e "N/N concluídas" cita `tool: TaskList → …`. Quantos? → `wc`/`grep -c`. Hora? → `date`.
4. **Abstenha com nome.** `[VERIFICADO]` · `[AUSENTE]` · `[INDISPONÍVEL]` · `[INFERIDO]` — definição, exemplos e sintaxe em `references/estados.md`. Abster não bloqueia nada; **colapsar AUSENTE/INDISPONÍVEL em ✅ é a alucinação**. `INFERIDO` nunca vira ✅ sem antes virar `VERIFICADO`. `INDISPONÍVEL` sem tentativa nomeada não existe — reduzir alucinação não pode virar abstenção gratuita.
5. **Estruture.** `- <afirmação> — [ESTADO] <evidência | onde procurei | o que faltou e tentei | de onde inferi e como confirmar>`. ✅ · `PASSED` · `LIBERADO` · `APROVADO` · ✓ · "no ar" · "invoquei" · "li" · "criei" **são** `VERIFICADO` e obedecem à mesma forma. Menção não é uso: o token entre crases ou aspas não afirma nada.
6. **Superposição.** Formato de outra skill: mantenha-o e acrescente. Nunca tire uma linha que ela exige; nunca troque o vocabulário dela pelo seu onde ela já tem um (`NOT_RUN`, `não confirmado`, `origem:` — ver o mapa em `references/estados.md`).
7. **Deixe o hook conferir o barato.** No `Stop`, no `Write`/`Edit` de artefato (`docs/01-05-*/`, `kanban/06-11-*/`, `.claude/vac/`) e no fim de cada subagente: coordenada que não resolve (com resolução por sufixo único — `proof/SKILL.md:4` vale, `SKILL.md:14` é ambíguo), evidência apontada que não existe, claim sem evidência em **seção de gate** (heading do mapa de gates ou linha `Veredicto:`), gate carimbado sem carimbo, e — pelo transcript — comando citado sem `Bash`, `tool: X` sem chamada de X, `TaskCreate` declarados sem `TaskCreate` reais, `invoquei /x` sem `Skill`, "no ar" sem navegação, `run <id>` sem `gh run`, relatório do verificador recebido e não publicado. **Dois bloqueios por prompt**, com as linhas listadas; no terceiro, o hook não bloqueia mais: grava a pendência, avisa (`systemMessage`) e a reinjeta no próximo prompt até você resolvê-la — em modo auto ninguém lê o aviso, então a pendência é o que sobrevive.
8. **Verifique independente nos gates.** Code review, run-test, entrega, "está no ar": só fecham depois de `/vac <artefato>` — o verificador em contexto limpo lê artefato + fontes e devolve `SUPORTADA` / `NÃO SUPORTADA` / `NÃO VERIFICÁVEL` por afirmação (`references/verificador.md`). O carimbo é gravado **pelo hook**, com o hash do arquivo; artefato editado depois = sem carimbo = verifica de novo (lição do `/proof`: o conserto é código não auditado). Para "no ar" (`/homolog`, `/prod`), o alvo é o próprio bloco final: grave-o num arquivo, `/vac <arquivo>`, publique **o mesmo texto**.
9. **Re-aterre depois de perder contexto — e antes de explorar.** Compactou, nasceu subagente, mudou de step: o que foi escrito antes é **relido do disco**, nunca reconstruído. Antes de varrer um repo, `ls .claude/vac/`: o `SessionStart` já injetou `mapa …: N ok · M ausentes`; ponteiro válido dispensa a varredura, mas leia a linha citada antes de afirmar sobre o conteúdo (o scan prova que o trecho está lá, não que a interpretação vale). Explore do zero só o que o scan devolveu como ausente — e feche com `/vac mapa` para a próxima sessão não pagar de novo.
10. **Meça.** `pnpm test:vac` roda os testes do hook e o golden set de `scripts/samples/` (casos reais e templates, grátis); `pnpm eval:vac` roda os casos de modelo de `evals/vac-*` (pagos). Nenhuma mudança no cartão, nas regras ou nos gates entra sem os dois. Sem golden set, "melhorou" é opinião.

## O verificador — chamada real

```
Agent(
  subagent_type: "furi-toolbox:vac-verifier",
  description: "Verificar <alvo>",
  prompt: "alvo=<caminho>\nfontes=<caminhos que o alvo cita, um por linha>\nmodo=artefato|diff|resposta"
)
```

`diff` → grave `git status --short` + `git diff` num arquivo temporário e passe o caminho. `última` → grave a sua última resposta (ou o bloco final de gate) num arquivo temporário. Espere o retorno e **publique o relatório inteiro** — resumir como "o verificador aprovou" é o que o `/vac` existe para impedir, e o hook bloqueia quando o `VEREDITO` chega e não é publicado. Contrato completo: `references/verificador.md`; o agente: `plugins/furi-toolbox/agents/vac-verifier.md`.

## Custo — declarado, para não degradar a sessão

| Camada | Quando roda | Custo |
|---|---|---|
| Guard dos hooks (shell) | todo evento, regime desligado | ~2-25 ms, sem Node |
| Cartão (§ O cartão) | todo prompt, todo subagente, após compactação | ≤ 950 caracteres (~250 tokens) por injeção; mapas: uma linha por arquivo |
| Hook (`scripts/vac-hook.mjs`) | `Stop`, `SubagentStop`, retorno de `Agent`, `Write`/`Edit` em artefato | ~60-120 ms: regras + leitura **incremental** do transcript (só os bytes novos; primeira indexação de sessão grande ≤ 0,5 s uma vez) |
| Verificador | gate ou pedido (`/vac <alvo>`) | um subagente por verificação |
| Hook com LLM (`type: prompt` / `agent`) | **nunca** | — |

Contra os ~60-80k tokens de protocolo que uma ativação do `/method` já carrega, o regime custa menos de 1% — e o estado + evidência é **mais curto** que a prosa que substitui. Persistência (`~/.claude/vac-data/vac/`): `on`, `log.jsonl`, `stamps/`, `sessions/`, `pending/` — nunca no repositório-alvo.

## Fora do Claude Code

Codex e Cursor ignoram `hooks/` e `agents/`: o `/vac` roda só como doutrina inline, e o modo audit verifica no mesmo contexto **declarando** `independência: NÃO`. Mesmo desenho do `/save` em fork.

## PARE se pensar

"existe, eu lembro" · "é padrão, todo mundo sabe" · "li há pouco" (depois de compactar: não) · "tsc passou" (sem a saída) · "grep feito" (sem o resultado) · "último ciclo sem mudanças" (sem `git status`) · "diff vazio, nada a revisar" (working tree!) · "o template já vem com ✅" · "escrevo no fim que não rodei" · "o líder do mercado faz assim" · "o path do screenshot é esse mesmo" · "já conheço a skill, sigo sem invocar" · "carimbo eu boto" · "o verificador aprovou, não preciso colar" · "desligo o `/vac` só neste step" · "o hook errou, VAC_STRICT=0 e sigo" (sem virar caso). Tabela completa, com o que fazer em cada uma: `references/rationalizations.md`.
