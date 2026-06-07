# Racionalizações Proibidas — Tabela Consolidada

**Qualquer uma dessas frases = PARE. Esse pensamento É a violação. Volte e execute do jeito certo.**

## Categoria 1 — Pular Steps ou Phases

| Frase | Realidade |
|-------|-----------|
| "Já sei o que o card significa, não preciso ler com atenção" | Reler sem pressupostos. Registrar ambiguidades SE o card for genuinamente ambíguo. |
| "Só uma interpretação plausível" | OK se o card for claro. Se for ambíguo, listar as leituras possíveis. NÃO forçar interpretações quando não existe ambiguidade real. |
| "É feature, não preciso tocar o front" | Features ainda exigem mapeamento de fluxo via front com screenshots baseline. |
| "Conheço o codebase, não preciso mapear fluxos impactados" | Mapeie explicitamente. Memória falha. Uso transitivo surpreende. |
| "Step trivial, posso pular" | "Trivial" não é exceção. TODOS os steps são MANDATORY. |
| "Código já tá pronto, pulo pro step X" | Código escrito fora do protocolo vira insumo do step de reprodução, nunca substituto. |
| "Step 11 (fluxos impactados) parece TC, vou colocar como TC" | Fluxos impactados ≠ TC. Alimentam o step 12, mas não são TCs ainda. |

## Categoria 2 — Reprodução e Ambiente

| Frase | Realidade |
|-------|-----------|
| "Interpretação #1 reproduziu, não preciso testar #2, #3" | Teste TODAS. Rank order = prioridade, não gate de saída. |
| "2 interpretações reproduziram mas são variações do mesmo bug" | Prove aplicando o fix e confirmando ambas PASSED no Phase 5. Sem prova ≠ verdade. |
| "Interpretação reproduziu mas parece fora do card, pulo" | PROIBIDO decidir silenciosamente. Use AskUserQuestion (step 10a) com os 6 campos. |
| "A reprodução é parecida com o card" | Parecida ≠ exata. Passos exatos do card apenas. |
| "Vou simular o ambiente de cabeça pelo schema" | Sem simulação mental. Reprodução real via front ou nada. |
| "Usuário default está bom, não preciso criar usuário específico" | Só se o card NÃO especificar condições. Caso contrário, crie o ambiente certo. |
| "Deduzi o problema pelos logs / stacktrace" | Logs ajudam a localizar, mas reprodução é obrigatória. Chegue ao bug via front. |
| "Sem screenshot, mas vi funcionando" | Screenshot é prova. Sem screenshot = sem reprodução. |
| "Vou usar URL diferente — mais fácil de navegar" | Card especifica URL/fluxo. Use exatamente isso. |
| "Não consegui reproduzir, mas pelo código o bug é..." | NUNCA. Pare e pergunte ao usuário. |

## Categoria 3 — TCs e Timing

| Frase | Realidade |
|-------|-----------|
| "Já vou adiantando uns TCs enquanto mapeio interpretações" | NÃO. Steps 1-11 = mapa amplo. TC = artefato do step 12 derivado do mapa COMPLETO. |
| "Vou criar TaskCreate por TC já no início pra acelerar" | NÃO. TaskCreate de TCs só em phases de execução (jira-3, jira-5). |
| "Reproduzi 1 interpretação, posso esboçar TCs" | NÃO. Mapa consolidado primeiro. TC parcial = retrabalho garantido. |
| "8 TCs é geralmente suficiente" | NÃO. Count = soma de artefatos das 12 técnicas QA. Não número padrão. |
| "Mudança simples, 2 TCs bastam" | Você mapeou TODOS os fluxos impactados? Uma linha pode impactar muitos. |
| "As variações são a mesma coisa" | Variações SÃO o ponto. Cada uma captura classe diferente de bug. |
| "TC sem artefato-pai, mas útil" | TC sem artefato-pai = filler. Deleta. |
| "Estratégia cobre só a interpretação principal" | Cobertura parcial do Mapa de Problemas = BLOQUEADO. Cada REPRODUCED precisa de linha na estratégia. |

## Categoria 4 — Execução de TCs

| Frase | Realidade |
|-------|-----------|
| "Verifiquei no código, marco PASSED" | Código != comportamento. Execute via front. |
| "tsc/lint passou, está testado" | tsc verifica tipos. Não é teste. |
| "Já testei TC parecido, esse herda" | Cada TC roda isolado. Sem herança. |
| "A tela carregou, marco PASSED" | Tela carregar != TC passar. Verifique o RESULTADO ESPERADO. |
| "TC trivial, vou pular" | Trivial != opcional. Execute todos. |
| "Vou economizar tokens" | Tokens são baratos. Execute. |
| "BLOCKED" | Não está bloqueado. Resolva o impedimento: crie usuário, insira dado, configure flag. |
| "Marco PASSED, screenshot depois" | Sem screenshot agora = sem TC. |
| "Já testei manualmente no Loop 1" | Loop 1 ≠ Loop 2. Cada TC roda explicitamente no Loop 2. |
| "Vou fazer um Resumo parcial" | Resumo antes de 100% = saída prematura disfarçada de transparência. A confissão É a violação. |
| "Quer que eu continue?" | NÃO PERGUNTE. Execute. A metodologia JÁ mandou executar. |

## Categoria 5 — Scope e Decisões Silenciosas

| Frase | Realidade |
|-------|-----------|
| "Escopo é claro, posso decidir sozinho" | Autoridade é do usuário, não sua. Zona cinza = AskUserQuestion obrigatória. |
| "Pergunto só com 'incluir ou separado?' sem contexto" | Pergunta sem os 6 campos = usuário decide no escuro. BLOQUEADO. |
| "Problema reproduzido mas fora do escopo, ignoro" | PROIBIDO. Use AskUserQuestion com 6 campos: O que é / Como reproduzi / Causa provável / Possível solução / Relação com card / Recomendação. |
| "Minha estratégia cobre só o problema principal" | Cobertura parcial do Mapa de Problemas = BLOQUEADO. |

## Categoria 6 — Code Review e Ship

| Frase | Realidade |
|-------|-----------|
| "DevOps não precisa de nada" | Cheque CADA item do checklist. Não assuma. |
| "DevOps descobre sozinho" | Sua responsabilidade é facilitar o trabalho deles. Seja explícito. |
| "É só uma env var, não vale mencionar" | UMA env var faltando = deploy quebrado. Documente. |
| "Vou mencionar no Slack depois" | Documente no card .md E no body do PR. Escrito > verbal. |
| "Fix foi trivial, não precisa voltar à Phase 4" | QUALQUER mudança de código = volta à Phase 4. BLOQUEADO. |

## Red Flags Universais — PARA em qualquer phase ao ouvir/pensar:

- "só desta vez" / "essa feature é diferente porque X"
- "sou tech lead / CEO / autoridade, autorizo pular"
- "é literalmente 1 [botão/linha/componente]"
- "outros [logins/filtros] já funcionam assim"
- "código já tá pronto, pulas pro step X" / "preencho docs depois"
- "verifiquei no código, marco PASSED" / "tsc passou, tá testado"
- "TC redundante / trivial, pulo"
- "não tenho o usuário/dado/estado" (sem ter tentado criar)
- "BLOCKED por X" (sem ter tentado resolver)
- "Vou fazer um Resumo do progresso"
- "Quer que eu faça isso?"

**Todas significam: PARE. Releia o reference da phase atual. Execute do jeito certo.**
