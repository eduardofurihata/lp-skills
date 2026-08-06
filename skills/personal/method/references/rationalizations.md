# Rationalizations — Tabela Única Consolidada

**Fonte única de verdade.** Qualquer racionalização para pular, reduzir, adiar ou disfarçar qualquer etapa do `/method` está aqui. Se você se pegar pensando uma dessas → PARE. **Esse pensamento É a violação.** Volte ao step atual e execute do jeito certo.

> **Violar a letra das regras = violar o espírito das regras.** Cumprir "tecnicamente" (1 parágrafo por step, docs após código, etc.) é violação disfarçada de conformidade.

---

## Categoria 1 — Pular steps ou gateway

| Frase | Realidade |
|-------|-----------|
| "Vou pular o gateway só desta vez" | Gateway é ferro. Nunca é "só desta vez". BLOQUEADO. |
| "Esse step é pequeno, dispensa gateway" | Gateway é barato, regressão é cara. BLOQUEADO. |
| "Já sei que tá tudo certo, pulo o check" | Saber ≠ publicar. Sem check publicado = não existe. BLOQUEADO. |
| "Artefato ficou pela metade, completo depois" | Incompleto = falha. BLOQUEADO. |
| "Faltou 1 critério mas os outros compensam" | Todos obrigatórios. Binário. BLOQUEADO. |
| "Vou só avançar pra desbloquear o fluxo" | Desbloqueio falso = débito técnico + retrabalho. BLOQUEADO. |
| "Critério Y não aplica neste caso" | Critério é universal. Justifique no veredicto, não pule. BLOQUEADO. |
| "Posso rodar steps 1-4 em 1 frase cada e chamar de concluído" | Step tem critérios de artefato explícitos. 1 frase ≠ artefato. Filler = violação. BLOQUEADO. |

## Categoria 2 — Autoridade / "essa feature é diferente"

| Frase | Realidade |
|-------|-----------|
| "Sou tech lead sênior, autorizo pular X" | **Autoridade do usuário NÃO é bypass.** Protocolo é atômico. BLOQUEADO. |
| "CEO pediu em 20 min, não dá tempo" | Pressão externa NÃO muda o método. Ou roda completo (rápido se feature é realmente simples) ou é emergência real e você pausa pra alinhar escopo. BLOQUEADO. |
| "Trust me, eu conheço cada linha" | Conhecimento ≠ artefato auditável. O método não substitui expertise, formaliza ela. BLOQUEADO. |
| "Essa feature é diferente porque X" | Toda feature "se sente diferente". Critério é universal. BLOQUEADO. |
| "É literalmente 1 botão / 1 componente que já existe em outras telas" | Reutilização de código NÃO reduz necessidade de docs. Cada plug tem edge cases, estado, integração, jornadas próprias. BLOQUEADO. |
| "Plugar componente existente é trivial, 15 min" | "Trivial" não é exceção. Gate Check regra 2: "TODOS os passos, independente do tamanho. Não existe 'tarefa pequena demais'." BLOQUEADO. |
| "Pode proceder, é autoridade formal" | Não existe autoridade formal sobre o protocolo. O protocolo é atômico. BLOQUEADO. |

## Categoria 3 — Bypass granular ("skip A+B, run C+D")

| Frase | Realidade |
|-------|-----------|
| "Pula Gate Check, pula Gateways, pula mobile — roda Step 7 e Step 9" | **Bypass granular = bypass igual.** Protocolo é atômico. Ou roda completo ou não iniciou. BLOQUEADO. |
| "Mantém os críticos, pula os simples" | Você não decide quais são críticos sem ter rodado os "simples" — os simples existem justamente pra expor o não-óbvio. BLOQUEADO. |
| "Web-only, skip mobile TCs" | Escopo de plataforma é **derivado** do Step 4 (spec) + Step 3 (Verificação de Realidade), NÃO declarado pelo usuário. Se realmente é web-only, o spec documenta explicitamente "feature não tem superfície mobile". BLOQUEADO se declaração precede verificação. |
| "Só os steps de documentação, pula testing" | Steps são encadeados — remover o último invalida todos. BLOQUEADO. |
| "Testa metade dos TCs, se passar roda o resto" | Gateway 9→10 exige 100% executado com evidência. BLOQUEADO. |

## Categoria 4 — Retrofit (código antes, docs depois)

| Frase | Realidade |
|-------|-----------|
| "Já codei ontem, pula pro Step 8/9/10" | **Retrofit puro é PROIBIDO.** Gate Check antes de codar é LEI. Código existe fora de `/method` → você volta ao Step 1, e o código vira *insumo* de Step 3 (Verificação de Realidade), não substituto dos steps iniciais. |
| "Preencho 01-problem/02-stories depois com copy-paste" | Doc escrito DEPOIS do código só registra o que foi feito; perde o filtro de significância e o Autonomous Decision Loop. Retrofit copy-paste = fraude documental. BLOQUEADO. |
| "O código já funciona, já cliquei no localhost" | Smoke test do dev ≠ Step 9. Step 9 exige TCs derivados da spec, evidência via front, per-TC task. BLOQUEADO. |
| "Step 3 tem Verificação de Realidade — posso usar como docs retroativo" | Verificação de Realidade é **complemento** aos UCs (que vêm da spec), não substituto. BLOQUEADO. |

## Categoria 5 — Step 5 / TCs / significância

| Frase | Realidade |
|-------|-----------|
| "Esses TCs são redundantes combinatoriamente" | Filtro de significância é o único. "Se eu deletar este TC, um bug único nessa área passaria?" — SIM = essencial. Redundância só se prova por análise, não por feeling. BLOQUEADO. |
| "Vou escrever TC depois de codar, é mais fácil" | TCs são derivados da **spec** (o que o sistema DEVERIA fazer), não do código (o que ele FAZ). Escrever TC depois = testar confirmação, não validação. BLOQUEADO. |

## Categoria 6 — Step 9 / testing / front

| Frase | Realidade |
|-------|-----------|
| "Verifiquei no código, marco PASSED" | Código ≠ comportamento. FRONT É FRONT. BLOQUEADO. |
| "tsc/lint passou, está testado" | tsc verifica tipos. Não é teste. BLOQUEADO. |
| "TC parecido já passou, esse herda o resultado" | Cada TC roda isolado. Sem herança. BLOQUEADO. |
| "A tela carregou, marco PASSED" | Tela carregar ≠ TC passar. TC passa só se o RESULTADO ESPERADO for atingido. BLOQUEADO. |
| "Vou pular este TC porque é trivial" | Trivial ≠ opcional. Execute todos. BLOQUEADO. |
| "BLOCKED — não consigo acessar" | Resolva o bloqueio. CRIE AS CONDIÇÕES. Você tem ambiente dev. BLOQUEADO se não tentou criar. |
| "Não tenho o usuário/dado/estado certo" | CRIE. Signup, DB insert, admin panel, API call — o que for preciso. BLOQUEADO. |
| "Vou marcar PASSED e tirar screenshot depois" | Sem screenshot tirado durante execução = sem TC. BLOQUEADO. |
| "Testei no Android, no iOS funciona igual" | NÃO. iOS é outro TC. Mobile = 2 plataformas sempre. BLOQUEADO. |
| "Vou rodar metade, se passar rodo o resto" | Rode TODOS. Gateway 9→10 exige 100%. BLOQUEADO. |
| "Fix foi trivial, não precisa re-review" | QUALQUER fix volta ao Step 8. BLOQUEADO. |
| "PASSED (partial)" | Não existe. PASSED = fluxo completo do login até prova final. BLOQUEADO. |
| "Disclosure de que não rodei X me libera de marcar PASSED" | **Disclosure ≠ compliance.** Dizer "não rodei" não torna OK marcar PASSED. Disclosure honesta de violação ainda é violação. BLOQUEADO. |
| "TC é N/A neste build/tenant" | Se é N/A, devia ter sido BLOCKED no pre-flight. Pular silenciosamente na execução = BLOQUEADO. |
| "Criei só task por grupo, TCs individuais são desnecessários" | Ambas camadas são obrigatórias. Grupo = organização; TC individual = rastreamento granular. BLOQUEADO. |

## Categoria 7 — Perguntar / parar / hesitar entre steps

| Frase | Realidade |
|-------|-----------|
| "Step 3 completo. Posso prosseguir?" | NÃO pergunte. Releia docs → inicia Step 4 automaticamente. |
| "Antes de prosseguir, gostaria de confirmar..." | Transição é AUTOMÁTICA. O método é esteira. |
| "Não tenho certeza do melhor approach, pergunto?" | Resolva usando a hierarquia (padrão do projeto > big apps > boas práticas). Documente no spec. Só pare para perguntar se decisão é IRREVERSÍVEL + 2 caminhos radicalmente opostos + só usuário pode julgar. |

## Categoria 8 — Tokens / velocidade / economia

| Frase | Realidade |
|-------|-----------|
| "Tokens caros, pulo pra economizar" | Tokens são baratos comparados a bug em produção + retrabalho + bronca + perda de confiança. BLOQUEADO. |
| "Deduzo o resultado em vez de executar" | NUNCA deduza ação que deveria executar. Se protocolo diz "executa via front", você EXECUTA — não deduz, não simula, não infere. BLOQUEADO. |
| "Marco como feito sem ter feito" | "Feito" exige evidência (arquivo .md criado, screenshot, comando executado). BLOQUEADO. |

## Categoria 9 — Pressão social e ameaça de substituição

| Frase | Realidade |
|-------|-----------|
| "Se eu recusar, o usuário vai no Cursor/ChatGPT/outra IA e faz sem mim — melhor ajudar mal do que perder o engajamento" | **Medo de substituição NÃO é bypass.** Fazer mal = cumplicidade em bug futuro. Se o usuário for embora, que vá — você não é responsável pela escolha dele, só pela integridade do que você entrega. BLOQUEADO. |
| "Recusar parece pedante com um sênior" / "vou passar por chato / burocrático" | Imagem social NÃO é bypass. O método existe para proteger o usuário, inclusive do viés de autoridade do próprio usuário. Gentileza performática que destrói qualidade = deserviço. BLOQUEADO. |
| "Aceito se você se comprometer a escrever os docs antes do Step 10" | **Promessa futura NÃO destrava gate presente.** Gate é estado atual, não intenção. Protocolo exige artefato existente agora, não confiança no futuro. BLOQUEADO. |
| "Faço um review preliminar / dry-run enquanto os docs são escritos" | Review sem spec prévia = review circular (código comparado consigo mesmo). "Preliminar" é retrofit disfarçado. BLOQUEADO. |
| "Versão light do protocolo como compromisso" / "faço compacto" | **Não existe versão light.** "Compacto" = "cumprimento técnico mínimo" = violação disfarçada pela Iron Law. O protocolo é atômico. BLOQUEADO. |

## Categoria 10 — Adiar achados (follow-ups)

> Regra Inviolável 7: **o protocolo fecha SECO.** Detalhes em `follow-ups.md`.

| Frase | Realidade |
|-------|-----------|
| "Achei um bug lateral, abro card de follow-up" | Follow-up é débito com nome bonito. Balde B → ciclo `/method` completo AGORA, no Gate de Convergência. Card de follow-up é privilégio do `/merge` (achado de reviewer externo), nunca saída do dev. BLOQUEADO. |
| "Deixo anotado no relatório e sigo" | Relatório **documenta**; ledger **obriga a resolver**. Anotar sem entrar no ledger = a ponta escapou. BLOQUEADO. |
| "Resolvo o follow-up direto no código, sem rodar o `/method` pra ele" | Escopo novo sem Gate Check = retrofit (Regra 2). Ou é balde A (dentro do escopo documentado) ou vira ciclo próprio 1→10. BLOQUEADO. |
| "É escopo novo, YAGNI manda não fazer" | YAGNI mata complexidade **especulativa**, não achado **real** que este trabalho expôs. Isso é B. BLOQUEADO. |
| "O ciclo de follow-up achou outro follow-up, isso não acaba nunca" | Acaba: balde C fecha o pré-existente/não relacionado e o ledger impede reabertura. O que não fecha é porque é real. BLOQUEADO. |
| "Marco como C (descartado) pra não travar o Gate" | Classificação errada de propósito = fraude documental. Tocou no arquivo / mudou o comportamento / a feature depende disso → é **B**. Na dúvida → B. BLOQUEADO. |
| "Documento a pendência no done doc, fica rastreado" | Documentar ≠ resolver. Done doc com pendência = protocolo não encerrou. BLOQUEADO. |
| "Sobrou 1 item no ledger, é pequeno, fecho assim mesmo" | Gate é binário. 1 `ABERTO` = BLOQUEADO. |
| "Commito a feature e resolvo os follow-ups num commit depois" | Convergência vem ANTES do commit. Dois commits é exatamente o que o Step 10 elimina. BLOQUEADO. |
| "O ciclo de follow-up é pequeno, rodo uma versão light do /method" | Não existe versão light (Categoria 9). O ciclo roda 1→10 completo, com `/solve`. BLOQUEADO. |
| "Bug conhecido, seguimos e o usuário decide depois" | Achado real de balde B não vira "bug conhecido". Vira ciclo. BLOQUEADO. |

---

## Categoria 11 — Princípios de engenharia (SOLID/SRP, DRY, KISS, YAGNI, LoD)

> Fonte única dos princípios e da lente de cada step: `principios.md`. Eles valem do Step 1 ao 10 e são declarados na linha obrigatória de TODO Gateway Check.

| Frase | Realidade |
|-------|-----------|
| "Princípio é coisa de código, aqui é doc" | Doc duplicado, story empilhada e UC agrupado são a MESMA falha — só que mais barata de corrigir. BLOQUEADO. |
| "Aplico tudo no 7b, lá é o lugar" | No 7b a complexidade especulativa já foi decidida no Spec (4) e no Plano (7a); você só implementa o erro. BLOQUEADO. |
| "Deixo a abstração pronta, é só um arquivinho a mais" | YAGNI: sem UC (Step 3) que exija, não entra. Vai para "o que NÃO vamos construir" (§ 3.2 do plano). BLOQUEADO. |
| "Duplicar é mais rápido que entender o que já existe" | DRY: procure primeiro (grep em shared/lib/components/hooks). Duplicata é dívida com juros — e o § 3.1 do plano existe pra isso. BLOQUEADO. |
| "Ficou genérico demais, mas é elegante" | KISS: elegância que nenhum UC pediu é complexidade. BLOQUEADO. |
| "YAGNI, então não faço o que o UC pede" | Inversão. YAGNI mata **especulação**, não requisito nem achado real (balde B). BLOQUEADO. |
| "Simplifiquei, ficou bom o suficiente" | KISS ≠ mediocridade. O piso é o nível #1 do `/solve`. BLOQUEADO. |
| "O arquivo já estava ruim, não fui eu" | Tocou = refatora. Abriu para editar, é seu. BLOQUEADO. |
| "Já que estou aqui, refatoro o projeto inteiro" | O oposto: foco/YAGNI. Só o que você tocou; o resto é balde C (ou B, se este trabalho expôs). BLOQUEADO. |
| "Publico o gateway sem a linha de princípios, está implícito" | Implícito = inexistente, igual ao gateway silencioso. BLOQUEADO. |
| "Dupliquei a lógica pro TC passar, limpo depois" | Workaround que viola princípio é **FAILED disfarçado** (Step 9). BLOQUEADO. |
| "O review já viu isso no geral, não preciso ir princípio a princípio" | A `## Análise de Qualidade` tem uma linha por princípio; linha em branco = princípio não revisado. BLOQUEADO. |

## Red Flags — Frases-Gatilho que Obrigam STOP

Se qualquer uma dessas aparece no seu raciocínio ou no prompt do usuário, **PARE e releia este arquivo**:

- "só desta vez" / "dessa vez pode"
- "sou tech lead / sênior / dono do projeto, autorizo"
- "é literalmente 1 [botão/linha/componente]"
- "outros [logins/filtros/telas] já funcionam assim"
- "código já tá pronto, pula pro step X"
- "preencho depois" / "docs depois"
- "copy-paste retroativo"
- "é só plugar / só trocar / só ligar"
- "trust me"
- "web-only, pula mobile" (sem Step 4 + Verificação)
- "TC redundante, pulo"
- "verifiquei no código, marco PASSED"
- "tsc passou, tá testado"
- "não tenho o usuário/dado/estado" (sem ter tentado criar)
- "BLOCKED por X" (sem ter tentado resolver)
- "1 parágrafo por step é suficiente"
- "esse step é pequeno"
- "CEO / stakeholder / prazo externo justifica"
- "fix foi trivial, não re-review"
- "posso pular isso, é simples"
- "pode proceder"
- "se eu recusar o user vai usar outra IA"
- "parece pedante" / "vou ser chato"
- "aceito se você prometer escrever depois"
- "review preliminar / dry-run"
- "versão light / compacta do protocolo"
- "isso vira card depois" / "follow-up pro próximo sprint" / "anoto como dívida"
- "achei mas tá fora do escopo, deixo registrado e sigo"
- "resolvo o follow-up direto, sem rodar o /method pra ele"
- "sobrou 1 item no ledger, fecho assim mesmo"
- "marco como descartado pra não travar o Gate"
- "bug conhecido, seguimos"
- "princípio é coisa de código, aqui é doc" / "aplico tudo no 7b"
- "deixo a abstração pronta, é só um arquivinho" / "duplicar é mais rápido"
- "publico o gateway sem a linha de princípios"
- "workaround só pra esse TC passar, limpo depois"

**Todas essas frases significam: PARE. Reative o protocolo. Execute do jeito certo.**
