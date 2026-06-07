# Racionalizações Proibidas — /jira (Step 0 + orquestração)

**Qualquer uma dessas frases = PARE. Esse pensamento É a violação. Volte e execute do jeito certo.**

> A fase de implementação/testes roda no `/method` vendorizado — as racionalizações canônicas dela estão em `references/method/references/rationalizations.md`. Esta tabela cobre o **Step 0** (investigação/reprodução), as **validações humanas** e o **ship**.

## Entender o problema (Step 0.5)

| Frase | Realidade |
|-------|-----------|
| "Já sei o que o card significa, não preciso ler o código" | Leia o código. A nota de entendimento (≥ 90) exige base real, não suposição. |
| "Entendi mais ou menos, tá bom" | `< 90` = loop. Reveja (mais código/contexto) até `≥ 90`. Sem atalho. |
| "Conheço o codebase, não preciso mapear" | Memória falha; uso transitivo surpreende. Leia o que importa. |

## Reproduzir no front (Step 0.6)

| Frase | Realidade |
|-------|-----------|
| "É feature, não preciso tocar o front" | Feature exige mapear o fluxo via front e identificar ONDE implementar. |
| "Deduzi pelos logs / stacktrace" | Logs localizam; reprodução via front é obrigatória. Chegue ao comportamento via front. |
| "Vou simular o ambiente de cabeça pelo schema" | Sem simulação mental. Reprodução real via front ou nada. |
| "A reprodução é parecida com o card" | Parecida ≠ exata. Passos exatos do card. A nota (≥ 90) mede justamente isso. |
| "Usuário default está bom" | Só se o card não especificar condições. Senão crie o ambiente certo (`can create users: yes`). |
| "Sem screenshot, mas vi funcionando" | Screenshot é prova. Sem screenshot = sem reprodução. |
| "Não consegui reproduzir, mas pelo código o bug é..." | NUNCA. Pare e pergunte ao usuário. |

## Validações humanas (Step 0.8 + human-check)

| Frase | Realidade |
|-------|-----------|
| "Em finish mode pulo a validação humana" | NÃO. As 2 validações (ver o bug / confirmar que sumiu) são OBRIGATÓRIAS mesmo em finish. |
| "Mostro o resultado direto, sem o dev clicar" | NÃO. O dev clica no trigger e confirma ao vivo. |
| "Pulo direto pra URL final" | NÃO. Execute todos os passos de navegação, pare 1 antes do trigger. |

## Scope e decisões silenciosas

| Frase | Realidade |
|-------|-----------|
| "Escopo é claro, decido sozinho" | Autoridade é do usuário. Zona cinza = AskUserQuestion obrigatória. |
| "Problema reproduzido mas fora do card, ignoro" | PROIBIDO decidir em silêncio. Use AskUserQuestion com os 6 campos: O que é / Como reproduzi / Causa provável / Possível solução / Relação com o card / Recomendação. |

## Ship

| Frase | Realidade |
|-------|-----------|
| "Faço o ship direto após o human-check" | NÃO. Pergunte antes ("quer que eu rode o ship?"). |
| "`git add -A` no ship" | O commit é do `/method` (Step 10). O ship faz push + PR + Jira, não um segundo commit. |

## Red Flags Universais — PARE em qualquer fase ao ouvir/pensar:

- "só desta vez" / "essa é diferente porque X"
- "sou tech lead / CEO / autoridade, autorizo pular"
- "é literalmente 1 [botão/linha/componente]"
- "código já tá pronto, pulo a investigação"
- "verifiquei no código, não preciso reproduzir no front"
- "tsc passou, tá testado"
- "BLOCKED por X" (sem ter tentado resolver: criar usuário, dado, flag, subir serviço)
- "Quer que eu continue?" (não pergunte entre sub-steps; execute)

**Todas significam: PARE. Releia o reference da fase atual. Execute do jeito certo.**
