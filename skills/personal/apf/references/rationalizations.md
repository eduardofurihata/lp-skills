# APF — Racionalizações comuns + counters

Catálogo de excuses que agentes (e a IA) tendem a fazer ao medir PF, com contra-argumentos explícitos. Baseado em baseline real de agente sem skill.

## R1 — "É só CRUD básico, peso médio basta"

**Racionalização:** Como o sistema descrito é simples, dá pra cravar ILF=10, EI=4, EQ=4 sem aplicar matriz.

**Contra:** CRUD básico tipicamente vira **Low** (ILF 7, EI 3, EQ 3), não Avg. Cravar peso médio em CRUD simples **superestima ~25%** (3 PF/EI vs 4 PF/EI = +33% por função). Aplique matriz §3.1 da methodology.

## R2 — "Usuário pediu sem perguntas"

**Racionalização:** "Tô com pressa, não quero perguntas" → assumi tudo, fiz zero perguntas.

**Contra:** Usuário pode aceitar **0 perguntas** (modo Indicative com confiança Baixa) ou ≤7 (Detailed). Mas se ele NÃO pediu Indicative explícito ("estimativa rápida", "ordem de grandeza"), fazer zero perguntas viola o método. Solução: faça **≥1 pergunta crítica** com aviso de impacto: "Pra dar número defensável, preciso saber X — afeta ±30 PF. Posso perguntar?" Usuário tem chance de dizer "não, manda no Indicative".

## R3 — "Mobile aumenta esforço, soma +9 PF"

**Racionalização:** App mobile dá mais trabalho de código que web, então adiciono PF.

**Contra:** PF é métrica **funcional**, não de esforço. **Independente de plataforma.** Mobile aparece naturalmente como funções: push token (1 EI Low) + push send (1 EO Low) — classificadas pela matriz como qualquer outra. Não somar +9 PF cravado.

## R4 — "3 perfis = ×1.20 sobre o total"

**Racionalização:** Mais perfis = sistema mais complexo, então multiplica.

**Contra:** **Sem multiplicador externo.** A complexidade de roles aparece nas próprias funções: telas distintas viram EQs distintas, permissões granulares aumentam DETs, painéis admin diferentes do user viram EOs separados. Tudo **já contado** ao listar funções na Fase 1. Multiplicar de novo = duplicação.

## R5 — "VAF=1.0 para neutralizar"

**Racionalização:** Mencionar VAF mostra rigor metodológico.

**Contra:** **VAF é proibido neste método.** GSCs (14 características gerais avaliadas 0-5) são subjetivas e destroem reprodutibilidade com input curto. ISO 20926 reconhece UFP-only como aplicação válida. Mencionar VAF mesmo "neutralizado" sinaliza confusão entre IFPUG strict e IFPUG legacy. Output deve dizer: "UFP puro, sem VAF".

## R6 — "Tudo é Avg" (default IA preguiçoso)

**Racionalização:** Quando não sei DETs/RETs, assumo Avg pra todas funções.

**Contra:** Isso **distorce o resultado**. Sinais textuais quase sempre sugerem Low ou High:
- "Cadastro simples" → Low
- "Perfil completo" → Avg
- "Prontuário com texto livre + estruturado + anexos" → High
- "Tabela de categoria" → Low

Aplique inferência §3.6 da methodology, não default cego. Marque como inferência se não confirmado.

## R7 — "Mais de 7 perguntas pra ser preciso"

**Racionalização:** Pra ter confiança Alta preciso fazer 10-15 perguntas.

**Contra:** **HARD LIMIT 7.** A IA deve escolher as 7 perguntas que mais reduzem incerteza. Mais que 7 = fadiga. Se faltar precisão depois de 7, declarar Confiança Médio + listar dimensões não cobertas em sensibilidade. **Não** ultrapassar.

## R8 — "Pergunta sobre ILFs depois sobre EIs depois sobre EOs"

**Racionalização:** Estruturar perguntas por categoria IFPUG é organizado.

**Contra:** Catálogo prescrito vira questionário fixo. **Cada pergunta deve ser gerada com base na lacuna de maior impacto** no momento — pode ser sobre escopo (turn 1), sobre regra de cobertura (turn 2), sobre integração específica (turn 3). Sem ordem fixa.

## R9 — "Empilho 4 perguntas em 1 chamada AskUserQuestion"

**Racionalização:** A tool aceita array `questions`, posso aproveitar.

**Contra:** **Aceita array, mas use 1 elemento.** Empilhar 4 perguntas viola o princípio "análise entre cada pergunta": agente decide as 4 antes de receber resposta da P1. Resposta da P1 deveria modificar P2. Sempre 1 por chamada.

## R11 — "Usuário disse 'só me dá um número' → ativo Indicative"

**Racionalização:** Frases como "só me dá um número", "tô com pressa", "preciso rápido" me dão licença pra Indicative.

**Contra:** **Não.** Indicative só ativa com gatilhos **explícitos**: "estimativa rápida", "ordem de grandeza", "pré-proposta", "faixa de chute", ou declaração explícita "aceito ±50% de imprecisão". "Só me dá um número" é pedido legítimo de **Detailed** — o usuário quer o número, mas com base sólida. Pressa de cronograma ≠ aceitação de imprecisão. Quando em dúvida: **Detailed (default)**, faça as perguntas críticas (≤7), entregue o número.

## R10 — "Pulo análise inicial, vou direto perguntar"

**Racionalização:** Perguntas dão contexto, então começo perguntando.

**Contra:** **Análise inicial sem perguntar** é etapa obrigatória. A IA deve inferir o que dá do input bruto, calcular faixa inicial, identificar lacunas — só DEPOIS escolhe a primeira pergunta. Pular análise = primeira pergunta vai sobre dimensão errada.

## Red Flags consolidados — STOP imediato

- Cravando ILF=10, EI=4, EQ=4 plano em todas funções
- Mencionando VAF, GSC, "fator de ajuste técnico"
- Aplicando "+35 PF dashboard" / "+9 PF mobile" / "×1.20 perfis"
- Mais de 7 perguntas
- Múltiplas perguntas em 1 chamada AskUserQuestion
- Pulando análise inicial
- Pulando entrevista quando input vago e usuário não pediu Indicative
- "É só CRUD" como justificativa pra simplificar pesos
- Tudo classificado Avg sem inferência ativa

**Cada um destes = volte ao Fluxo SKILL.md §1.**
