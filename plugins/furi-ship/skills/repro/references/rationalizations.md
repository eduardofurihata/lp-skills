# Racionalizações Proibidas — /repro (Step 0, reprodução, validações humanas e ship)

**Qualquer uma dessas frases = PARE. Esse pensamento É a violação. Volte e execute do jeito certo.**

> A fase de implementação/testes roda no `/method` — skill separada, invocada via Skill tool (`furi-build:method`); as racionalizações canônicas dela estão em `plugins/furi-build/skills/method/references/rationalizations.md`. Esta tabela cobre o **Step 0 e a orquestração**, o **entendimento** (§ 4), a **reprodução** (§ 5), as **validações humanas** (§ 6 e § 8) e o **ship** (§ 9).

## Step 0 e orquestração

| Frase | Realidade |
|-------|-----------|
| "Já sei o board / o setup desta sessão, sigo sem invocar" | Mencionar não é invocar. `/jira` e `/setup` entram pelo Skill tool **toda** vez. |
| "`git checkout main && git pull`, como sempre" | A integração vem da topologia (`deploy-context.md` § 1) e a branch do motor `pipeline/references/branch.md`. `main` pode nem ser a integração. |
| "Já conheço o `/method`, sigo sem invocar" | Mencionar não é invocar. O `/method` entra pelo Skill tool, **toda** vez — sem a chamada, não há Gate Check, gateways nem audits. BLOQUEADO. |

## Entender o problema (§ 4)

| Frase | Realidade |
|-------|-----------|
| "Já sei o que o card significa, não preciso ler o código" | Leia o código. A nota de entendimento (≥ 90) exige base real, não suposição. |
| "Entendi mais ou menos, tá bom" | `< 90` = loop. Reveja (mais código/contexto) até `≥ 90`. Sem atalho. |
| "Conheço o codebase, não preciso mapear" | Memória falha; uso transitivo surpreende. Leia o que importa. |
| "O card tinha print, mas o texto já explica" | O anexo é o que o solicitante viu. A nota do § 5 é dada contra ele — leia antes. |

## Reproduzir na superfície certa (§ 5)

| Frase | Realidade |
|-------|-----------|
| "É feature, não preciso tocar a superfície" | Feature exige mapear o fluxo na superfície e identificar ONDE implementar. |
| "Deduzi pelos logs / stacktrace" | Logs localizam; reprodução na superfície é obrigatória. Chegue ao comportamento por onde o usuário chega. |
| "Vou simular o ambiente de cabeça pelo schema" | Sem simulação mental. Reprodução real ou nada. |
| "É API, não tem front, então leio o código" | API tem superfície: a chamada real com o payload do card. Reproduza a resposta errada, não a suposição. |
| "Reproduzi no browser, mas o card é do app mobile" | A superfície é onde o solicitante viu: card mobile → emulador/simulador (tabela por contexto do Step 9 do `/method`). |
| "A reprodução é parecida com o card" | Parecida ≠ exata. Passos exatos do card. A nota (≥ 90) mede justamente isso. |
| "Usuário default está bom" | Só se o card não especificar condições. Senão crie o ambiente certo (`can create users: yes`). |
| "Sem evidência, mas vi funcionando" | Evidência é prova — screenshot, ou a resposta real. Sem evidência = sem reprodução. |
| "Não consegui reproduzir, mas pelo código o bug é..." | NUNCA. Pare e pergunte ao usuário. |

## Validações humanas (§ 6 + § 8)

| Frase | Realidade |
|-------|-----------|
| "Em finish mode pulo a validação humana" | NÃO. As 2 validações (ver o bug / confirmar que sumiu) são OBRIGATÓRIAS mesmo em finish. |
| "Mostro o resultado direto, sem o dev clicar" | NÃO. O dev dispara o trigger e confirma ao vivo — antes e depois. |
| "Pulo direto pra URL final" | NÃO. Execute todos os passos, pare 1 antes do trigger. |
| "Gravo `phase: ship` já, o dev vai aprovar mesmo" | NÃO. A phase muda **depois** da confirmação — é ela que o CONTINUE lê. |

## Scope e decisões silenciosas

| Frase | Realidade |
|-------|-----------|
| "Escopo é claro, decido sozinho" | Autoridade é do usuário. Zona cinza = AskUserQuestion obrigatória — em qualquer modo, `finish` inclusive. |
| "Problema reproduzido mas fora do card, ignoro" | PROIBIDO decidir em silêncio. Use AskUserQuestion com os 6 campos: O que é / Como reproduzi / Causa provável / Possível solução / Relação com o card / Recomendação. |

## Ship (§ 9)

| Frase | Realidade |
|-------|-----------|
| "Invoco o `/pull-request` direto após o human check" | NÃO. Pergunte antes ("quer que eu rode o `/pull-request`?") — salvo em `finish`. |
| "`git add -A` antes do `/pull-request`, pra limpar a árvore" | O commit de código é do `/method` (Step 10). Antes do `/pull-request` só entra o registro, por caminho explícito (`git add docs/jira/todo/<KEY>.md`). Código novo → `/method` (re-review), nunca commit avulso. |
| "Abro o PR com `gh pr create`, é a mesma coisa" | NÃO. Mencionar não é invocar: o `/pull-request` tem o corpo 3-em-1, a idempotência e o espelho no Jira. |
| "O `/pull-request` parou (árvore suja / branch atrás), sigo à mão" | NÃO. O guard dele é contrato: resolva (registro por caminho explícito; integração pelo motor + re-teste no `/method`) e invoque de novo. |

## Red Flags Universais — PARE em qualquer fase ao ouvir/pensar:

- "só desta vez" / "essa é diferente porque X"
- "sou tech lead / CEO / autoridade, autorizo pular"
- "é literalmente 1 [botão/linha/componente]"
- "código já tá pronto, pulo a investigação"
- "verifiquei no código, não preciso reproduzir na superfície"
- "tsc passou, tá testado"
- "BLOCKED por X" (sem ter tentado resolver: criar usuário, dado, flag, subir serviço, próximo `pw#` do pool)
- "Quer que eu continue?" (não pergunte entre sub-steps; execute)

**Todas significam: PARE. Releia o reference da fase atual. Execute do jeito certo.**
