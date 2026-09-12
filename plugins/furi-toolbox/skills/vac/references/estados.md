# Estados — o vocabulário fechado de toda afirmação

> **Alucinação é uma afirmação sem estado.** O modelo não inventa porque quer: inventa porque o único valor aceito era ✅. Quatro estados, e só quatro — o hook (`scripts/vac-hook.mjs`) lê exatamente esta sintaxe.

## Os quatro

| Estado | Quando | Forma obrigatória (na mesma linha) | Certo | Errado |
|---|---|---|---|---|
| **`[VERIFICADO]`** | Você **leu**, **rodou** ou **recebeu** o dado nesta janela de contexto | a evidência (tabela abaixo) | `- O gerador calcula a versão pelo hash — [VERIFICADO] scripts/generate-plugins.mjs:184` | `- O gerador calcula a versão pelo hash ✅` (✅ sem coordenada = prosa) |
| **`[AUSENTE]`** | Você procurou e **não existe** | **onde** procurou (comando + escopo) | `- Não há teste para o parser — [AUSENTE] \`grep -rn "parseFrontmatter" tests/ lib/\` → 0 resultados` | `- Não há teste para o parser.` (não procurou? procurou onde?) |
| **`[INDISPONÍVEL]`** | Você **não pôde apurar** — ferramenta, permissão, ambiente, tempo | **o que faltou** e **o que tentou** | `- TC-4 no iOS — [INDISPONÍVEL] sem simulador nesta máquina; tentei \`xcrun simctl list\` → command not found` | `- TC-4 no iOS — PASSED (funciona igual ao Android)` · `- TC-4 — BLOCKED` (sem tentativa nomeada: não é estado, é desistência) |
| **`[INFERIDO]`** | Você **deduziu** — de padrão, de nome, de convenção, de memória de treino | **de quê** deduziu e **como se confirma** | `- O hook roda com o cwd do projeto — [INFERIDO] do exemplo da doc; confirma-se com \`echo $PWD\` dentro do hook` | `- O hook roda com o cwd do projeto.` (afirmado como fato) |

**Regras de transição**

- `INFERIDO` **nunca** vira ✅ direto: primeiro confirma (vira `VERIFICADO`) ou fica `INFERIDO` até o fim — inclusive em gate.
- `AUSENTE` e `INDISPONÍVEL` **não bloqueiam** nenhum gateway de outra skill por si: a outra skill decide o que fazer com a informação (o `/method` manda perguntar ao usuário e marcar `NOT_RUN`, por exemplo). O que bloqueia é escrever ✅ no lugar deles.
- `INDISPONÍVEL` **sem tentativa nomeada não existe** — é a red flag "BLOCKED por X sem ter tentado" das outras skills, que continua valendo. Reduzir alucinação não pode virar abstenção gratuita: o estado certo *depois de tentar* é honesto e barato; o estado certo *sem tentar* não há.
- Palavras que **são** `VERIFICADO` e obedecem à mesma forma: `✅` · `PASSED` · `LIBERADO` · `APROVADO` · "no ar" · "verde" · "invoquei" · "li" · "publiquei" · "criei". Cumprimento de processo é afirmação como qualquer outra: "invoquei o `/solve`" tem evidência (a chamada `Skill` visível no transcript); "li o reference" tem evidência (o `Read` nesta janela — depois de uma compactação, não vale mais).

## Evidência — o que conta

| Tipo | Forma | Exemplo |
|---|---|---|
| Coordenada | `arquivo:linha` ou `arquivo:ini-fim`, relativa ao projeto | `lib/skills.ts:67` |
| Comando | `` `comando` → <trecho literal da saída> `` — a saída, não o resumo | `` `pnpm typecheck` → "Found 0 errors" `` |
| Ferramenta | `tool: <nome> → <retorno>` | `tool: TaskList → 7 tasks, 7 completed` |
| Screenshot / dump | `screenshot: <path>` ou `evidência: <path>` — **o path que a ferramenta retornou**, e que existe | `screenshot: .playwright-mcp/tc3-vazio-mobile.png` |

O que **não** conta: "verificado", "conferido", "funciona", "já validado antes", "o código diz", "tsc passou" (sem a saída), "grep feito" (sem o resultado), "o screenshot mostra" (sem o path), um path que ninguém conferiu com `ls`.

## Como o hook lê (a sintaxe é contrato)

- Estado: o token entre colchetes, maiúsculo — `[VERIFICADO]` `[AUSENTE]` `[INDISPONÍVEL]` `[INFERIDO]` (`[INDISPONIVEL]` sem acento também vale).
- Evidência na linha: qualquer um de `arquivo.ext:N`, `` `…` → ``, `tool:`, `screenshot:`, `evidência:`/`evidence:` — ou um bloco de código (```) começando na linha seguinte.
- Claim: linha com `✅`, `PASSED`, `LIBERADO`, `APROVADO`, `[VERIFICADO]` ou "no ar". Dentro de uma mensagem/artefato de **gate** (contém `Gateway Check`, `Audit Pré`/`Pós`, `Gate de Convergência`, `Veredicto`, `Checklist Final`, `PASSED` ou `Smoke`), claim sem evidência é bloqueado — uma vez, com as linhas listadas. Fora de gate, o hook não opina: a régua é sua.
- Coordenada citada que não resolve (arquivo inexistente ou linha maior que o arquivo) é bloqueada **em qualquer mensagem** — é a forma mais barata e mais comum de inventar.

## Mapa para os vocabulários que já existem (ponteiros — nada é redefinido aqui)

| Onde | Vocabulário | Equivale a |
|---|---|---|
| `/proof` § Três estados | `valor` · `ausente-de-fato` · `indisponível-para-apurar` — "colapsar os dois últimos vira afirmação falsa" | `VERIFICADO` · `AUSENTE` · `INDISPONÍVEL` (a origem deste vocabulário) |
| `/method` — `plugins/furi-build/skills/method/references/09-testing.md` § Status | `PASSED` · `FAILED` · `NOT_RUN` | `PASSED` = `VERIFICADO` com screenshot/dump; `NOT_RUN` = `INDISPONÍVEL` declarado (com o motivo) |
| `/prod` — `plugins/furi-ship/skills/prod/references/findings.md` § Classes | A (reprodução observada) · B (citação verbatim + grep) · C (opinião) | A e B são **tipos de evidência** de `VERIFICADO`; C é `INFERIDO` |
| `/infra` | `Confirmado por` · `não confirmado (motivo)` | `VERIFICADO` (com a fonte) · `INDISPONÍVEL` |
| `/setup`, `/jira-board` | `origem: arquivo \| perguntado \| memória \| criado agora` | proveniência = a evidência de `VERIFICADO` |

Quando uma dessas skills pede o vocabulário **dela**, use o dela — e acrescente o estado do `/vac` só onde ela não tem um (regra de superposição: nunca trocar o formato de outra skill).
