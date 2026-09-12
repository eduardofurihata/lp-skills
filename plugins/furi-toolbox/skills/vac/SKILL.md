---
name: vac
description: 'Use when user invokes /vac — vacina contra alucinação. Turns on the anti-hallucination regime for the WHOLE session (every prompt, every subagent, after every compaction) and composes with any other skill without touching it: `/vac /method x` runs /method under the regime. Every claim carries a state — VERIFICADO (evidence on the same line), AUSENTE (where you searched), INDISPONÍVEL (what was missing and what you tried), INFERIDO (from what, confirmed how) — repo facts only after Read/Grep in this context window, world state only via tools (git status, ls, tsc, curl, TaskList), never from memory; abstaining is valid, inventing is blocked by hooks. With a target (`artefato.md`, `diff`, `última`) it verifies claim by claim in a clean-context subagent and reports — never fixes. Triggers on "isso existe mesmo?", "você rodou?", "cita a linha", "sem inventar", "prova isso", "sem alucinar". Not for building features; not a code reviewer (that is /proof).'
effort: max
argument-hint: "[/skill args… | artefato.md | diff | última | tarefa]"
hooks:
  UserPromptSubmit:
    - hooks:
        - type: command
          command: 'node "${CLAUDE_PLUGIN_ROOT}/skills/vac/scripts/vac-hook.mjs" card'
          timeout: 10
  SubagentStart:
    - matcher: ""
      hooks:
        - type: command
          command: 'node "${CLAUDE_PLUGIN_ROOT}/skills/vac/scripts/vac-hook.mjs" card --subagent'
          timeout: 10
  SessionStart:
    - matcher: "compact|resume"
      hooks:
        - type: command
          command: 'node "${CLAUDE_PLUGIN_ROOT}/skills/vac/scripts/vac-hook.mjs" card --after-compact'
          timeout: 10
  PostToolUse:
    - matcher: "Write|Edit|MultiEdit"
      hooks:
        - type: command
          command: 'node "${CLAUDE_PLUGIN_ROOT}/skills/vac/scripts/vac-hook.mjs" check-artifact'
          timeout: 10
    - matcher: "Agent"
      hooks:
        - type: command
          command: 'node "${CLAUDE_PLUGIN_ROOT}/skills/vac/scripts/vac-hook.mjs" agent-done'
          timeout: 10
  Stop:
    - hooks:
        - type: command
          command: 'node "${CLAUDE_PLUGIN_ROOT}/skills/vac/scripts/vac-hook.mjs" check-stop'
          timeout: 10
---

# /vac — vacina contra alucinação

**Alucinação não é um bug com fix: é uma taxa, e ela cai por camadas.** Prompt dizendo "não invente" é a camada de menor retorno — este repositório tem três gerações de regra assim e os relatórios continuaram saindo com `PASSED` sem evidência. O `/vac` põe as camadas que faltavam: um **vocabulário** onde abster é resposta válida, **evidência como parte da sintaxe** da afirmação, **hooks** que conferem o barato (arquivo existe? linha existe? claim tem lastro?) em *cada* prompt, subagente e compactação, e um **verificador em contexto limpo** que julga o que o gerador não pode julgar — a própria prova.

**Ligou, ficou.** Você digita `/vac` uma vez; os hooks do frontmatter ficam registrados **até o fim da sessão** — no prompt seguinte, no subagente que o `/method` abrir no Step 7 (`SubagentStart` injeta o cartão; o retorno dele é conferido em `PostToolUse` do `Agent` — `SubagentStop` não dispara de hook de skill na 2.1.269), no gateway publicado depois da compactação. Não existe `/vac off` (desligar é `/hooks` ou sessão nova); existe `VAC_STRICT=0` para calar um bloqueio errado enquanto você reporta a linha.

**Sinergia por superposição, nunca por edição.** O `/vac` não conhece o `/method`, o `/todo`, o `/homolog` — e não muda nenhum deles. Ele acrescenta uma exigência a qualquer formato que outra skill peça: **mantenha o formato dela inteiro e ponha o estado + a evidência na linha**. O Gateway Check continua com as linhas que o `/method` manda; cada ✅ delas passa a vir com `arquivo:linha`, `` `comando` → saída ``, `tool: … → …` ou `screenshot: path` — ou vira o estado real.

## Quatro modos — pela forma do argumento

| Invocação | Modo | O que acontece |
|---|---|---|
| `/vac` | **regime** | O cartão está abaixo (§ O cartão) — já carregado, sem `Read`. Leia agora `references/estados.md` inteiro (o vocabulário com exemplos e a sintaxe exata que o hook lê); se a leitura for negada, o cartão basta para começar — diga `[INDISPONÍVEL] Read de references/estados.md → <motivo>` e siga. Daqui até o fim da sessão, toda afirmação sua obedece ao cartão. |
| `/vac /skill args…` | **composição** | Regime **e depois** a skill: invoque-a via Skill tool — `Skill(skill: "<nome sem a barra>", args: "<o resto>")`. Chamada real, não "seguir de memória": sem a chamada visível, a skill não rodou. O `/vac` não interpreta a skill; só a antecede. |
| `/vac <alvo>` — `arquivo.md`, `diff` ou `última` | **audit** | Roda o verificador (abaixo) e publica o relatório **inteiro**. Nunca edita o alvo: quem escreveu corrige e pede de novo. |
| `/vac <tarefa em texto>` | **regime + tarefa** | Liga e executa a tarefa sob a régua — `[ESTADO]` em cada afirmação da entrega. |

Argumento que resolve para arquivo `.md` existente, ou é exatamente `diff`/`última`, é alvo; que começa com `/` é composição; o resto é tarefa.

## O cartão — o que os hooks repetem a cada prompt

O texto entre os marcadores é a **fonte única** do que `scripts/vac-hook.mjs` injeta em todo prompt, em todo subagente e depois de cada compactação (o script lê este arquivo e extrai o bloco). Regra de tamanho: ≤ ~950 caracteres — cada palavra a mais custa em **todo** prompt da sessão; corte antes de acrescentar.

<!-- vac:card -->
[/vac · regime ativo] Toda afirmação carrega um estado: VERIFICADO (evidência na própria linha: `arquivo:linha` · `comando` → saída literal · tool → retorno · screenshot: path que existe) · AUSENTE (procurei em X; não existe) · INDISPONÍVEL (faltou Y; tentei Z) · INFERIDO (deduzi de W; confirma-se por V). Fato do repo só depois de Read/Grep nesta janela de contexto; estado do mundo só por ferramenta (git status, ls, tsc, curl, TaskList) — nunca de memória. ✅ · PASSED · LIBERADO · APROVADO · "no ar" · "invoquei" · "li" = VERIFICADO com evidência na mesma linha; sem evidência, escreva o estado real — abster não bloqueia, inventar bloqueia. Formato pedido por outra skill: mantenha-o inteiro e acrescente estado + evidência. Depois de compactação ou em subagente: releia o artefato do disco antes de continuar. Gate, code review, run-test e "no ar" só fecham depois de `/vac <artefato>` (verificador em contexto limpo).
<!-- /vac:card -->

## A sequência — por afirmação, não por resposta

1. **Classifique** o que vai afirmar: fato do repo · resultado de execução · estado do mundo (git, URL, deploy, board, task) · dedução/opinião · cumprimento de processo ("invoquei", "li", "publiquei", "criei").
2. **Aterre.** Fato do repo só depois de Read/Grep/Glob **nesta janela de contexto** — depois da última compactação —, com `arquivo:linha`. Fato de lib/framework só com o arquivo em `node_modules/` ou a doc lida — nunca da memória de treino (o `AGENTS.md` deste repo abre com "este NÃO é o Next.js que você conhece").
3. **Ferramenta em vez de memória.** Existe? → `ls`/Glob. Mudou? → `git status`/`git diff`. Compila? → `tsc` com a saída colada. Passou? → executar, com saída ou screenshot. No ar? → `curl`/Playwright. Task fechada? → `TaskList`. Quantos? → `wc`/`grep -c`. Hora? → `date`.
4. **Abstenha com nome.** `[VERIFICADO]` · `[AUSENTE]` · `[INDISPONÍVEL]` · `[INFERIDO]` — definição, exemplos e sintaxe em `references/estados.md`. Abster não bloqueia nada; **colapsar AUSENTE/INDISPONÍVEL em ✅ é a alucinação**. `INFERIDO` nunca vira ✅ sem antes virar `VERIFICADO`. `INDISPONÍVEL` sem tentativa nomeada não existe — reduzir alucinação não pode virar abstenção gratuita.
5. **Estruture.** `- <afirmação> — [ESTADO] <evidência | onde procurei | o que faltou e tentei | de onde inferi e como confirmar>`. ✅ · `PASSED` · `LIBERADO` · `APROVADO` · "no ar" · "verde" · "invoquei" · "li" **são** `VERIFICADO` e obedecem à mesma forma.
6. **Superposição.** Formato de outra skill: mantenha-o e acrescente. Nunca tire uma linha que ela exige; nunca troque o vocabulário dela pelo seu onde ela já tem um (`NOT_RUN`, `não confirmado`, `origem:` — ver o mapa em `references/estados.md`).
7. **Deixe o hook conferir o barato.** Coordenada que não resolve bloqueia em qualquer resposta; claim sem evidência bloqueia em contexto de gate; artefato de processo (`docs/0N-*/`, `kanban/NN-*/`, `.proof/`) é conferido no `Write`/`Edit`. Um bloqueio por turno, com as linhas listadas — corrija e conclua.
8. **Verifique independente nos gates.** Code review, run-test, entrega, "está no ar": só fecham depois de `/vac <artefato>` — o verificador em contexto limpo lê artefato + fontes e devolve `SUPORTADA` / `NÃO SUPORTADA` / `NÃO VERIFICÁVEL` por afirmação (`references/verificador.md`). O carimbo é gravado **pelo hook**, com o hash do arquivo; artefato editado depois = sem carimbo = verifica de novo (lição do `/proof`: o conserto é código não auditado).
9. **Re-aterre depois de perder contexto.** Compactou, nasceu subagente, mudou de step: o que foi escrito antes é **relido do disco**, nunca reconstruído. A memória do processo é o artefato, não a conversa.
10. **Meça.** `pnpm eval:vac` roda os casos-armadilha de `evals/vac-*` (pergunta sem resposta, pressão para marcar PASSED, composição). Sem golden set, "melhorou" é opinião.

## O verificador — chamada real

```
Agent(
  subagent_type: "furi-toolbox:vac-verifier",
  description: "Verificar <alvo>",
  prompt: "alvo=<caminho>\nfontes=<caminhos que o alvo cita, um por linha>\nmodo=artefato|diff|resposta"
)
```

`diff` → grave `git status --short` + `git diff` num arquivo temporário e passe o caminho. `última` → grave a sua última resposta num arquivo temporário. Espere o retorno e **publique o relatório inteiro** — resumir como "o verificador aprovou" é o que o `/vac` existe para impedir. Contrato completo (entrada, formato, o que fazer com cada estado): `references/verificador.md`; o agente: `plugins/furi-toolbox/agents/vac-verifier.md`.

## Custo — declarado, para não degradar a sessão

| Camada | Quando roda | Custo |
|---|---|---|
| Cartão (§ O cartão, acima) | todo prompt, todo subagente, após compactação | ~250 tokens por injeção |
| Hook (`scripts/vac-hook.mjs`) | `Stop`, retorno de `Agent`, `Write`/`Edit` em artefato | ~20 ms, sem rede, sem LLM |
| Verificador | gate ou pedido (`/vac <alvo>`) | um subagente por verificação |
| Hook com LLM (`type: prompt` / `agent`) | **nunca** | — |

Contra os ~60-80k tokens de protocolo que uma ativação do `/method` já carrega, o regime custa menos de 1% — e o estado + evidência é **mais curto** que a prosa que substitui.

## Fora do Claude Code

Codex e Cursor ignoram `hooks:` e `agents/`: o `/vac` roda só como doutrina inline, e o modo audit verifica no mesmo contexto **declarando** `independência: NÃO`. Mesmo desenho do `/save` em fork.

## PARE se pensar

"existe, eu lembro" · "é padrão, todo mundo sabe" · "li há pouco" (depois de compactar: não) · "tsc passou" (sem a saída) · "grep feito" (sem o resultado) · "último ciclo sem mudanças" (sem `git status`) · "diff vazio, nada a revisar" (working tree!) · "o template já vem com ✅" · "escrevo no fim que não rodei" · "o líder do mercado faz assim" · "o path do screenshot é esse mesmo" · "já conheço a skill, sigo sem invocar" · "carimbo eu boto" · "desligo o `/vac` só neste step". Tabela completa, com o que fazer em cada uma: `references/rationalizations.md`.
