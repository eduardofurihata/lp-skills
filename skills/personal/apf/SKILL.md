---
name: apf
description: Use when measuring functional size in Function Points (PF/FP). Triggers on "estima em pontos de função", "function points", "tamanho funcional", "/apf", "APF", "IFPUG", "NESMA", or any request to size a greenfield app or brownfield feature delta in PF.
effort: max
argument-hint: "[descrição do app/feature]"
---

# /apf — Medição de Pontos de Função (IFPUG CPM 4.3.1, ISO/IEC 20926)

Esta skill mede tamanho funcional via **IFPUG Detailed adaptativo** com entrevista dinâmica de até 7 perguntas. Output reprodutível, defensável, auditável.

## Iron Law

> **Precisão por estrutura > velocidade por atalho.**
> Se você se pegar pensando "é só CRUD, peso médio basta" → PARE. Esse pensamento É a violação.
> Pesos Low/Avg/High via matriz IFPUG são obrigatórios. Não negociáveis pela pressão do usuário.

## Regras Invioláveis

1. **Pesos só via matriz** (`references/methodology.md` §3.1): DET×RET para arquivos, DET×FTR para transações. **NUNCA cravar peso médio** ("ILF=10" plano = violação). Pesos válidos: ILF 7/10/15, EIF 5/7/10, EI 3/4/6, EO 4/5/7, EQ 3/4/6.
2. **Sem VAF / GSC** — devolver UFP puro. Mencionar "VAF=1.0" ou "GSCs neutralizadas" = sinal de violação.
3. **Sem multiplicadores externos** — não aplicar fator por perfis (×1.20), canal (+9 PF mobile), integração (+16 PF gateway), profundidade. Cada complexidade vira função classificada pela matriz.
4. **HARD LIMIT 7 perguntas. 1 por turn.** `AskUserQuestion` chamado com array de 1 elemento. NUNCA empilhar múltiplas perguntas por chamada. Análise visível entre cada turn.
5. **Sem templates fixos.** Cada pergunta gerada na hora a partir do contexto específico. Sem catálogo prescrito de "dimensões obrigatórias" — IA escolhe a pergunta que mais reduz incerteza no PF total.
6. **Pressão do usuário não bypass.** "Tô com pressa, é só CRUD, sem perguntas" → ainda aplicar matriz, ainda fazer ≥1 pergunta crítica se há ambiguidade grande. Modo Indicative (`PF ≈ 35×ILFs + 15×EIFs`) só se usuário **explicitamente** pedir "estimativa rápida / ordem de grandeza / pré-proposta".

## Fluxo

1. **Detectar modo** (`references/methodology.md` §6): Greenfield / Brownfield (caminho de pasta) / Indicative (pediu rápido).
2. **Análise inicial** sem perguntar: identificar ILFs/EIFs candidatos do input, faixa inicial de PF, lacunas de maior |Δ PF|.
3. **Loop ≤7 perguntas** (`references/methodology.md` §6.1):
   - Avaliar lacuna de maior `incerteza × impacto`.
   - Formular pergunta na hora (linguagem simples, criança de 8 anos responde).
   - `AskUserQuestion` com 1 pergunta.
   - Atualizar modelo mental, recalcular incertezas.
   - Parar antes de 7 se faixa apertou ≤±10%.
4. **Inferir DETs/RETs/FTRs** por função a partir das respostas + contexto. Marcar origem (resposta P_n / sinal textual / default).
5. **Aplicar matriz** → Low/Avg/High → peso → `PF_total = Σ qtd × peso`.
6. **Output** no formato `references/methodology.md` §7 (tabelas com classificação por função, premissas, sensibilidade top 3).

## Quick Reference

- Matriz IFPUG completa, regras de desempate, modos: **`references/methodology.md`**
- Exemplos worked (greenfield petcare 182 PF + brownfield plano de saúde 106 PF + uber/fisio 267 PF): **`references/examples.md`**
- Racionalizações comuns + counters: **`references/rationalizations.md`**

## Common Rationalizations (STOP)

| Excuse | Reality |
|---|---|
| "É só CRUD, peso médio basta" | CRUD simples geralmente vira Low (3 PF), não Avg (4). Aplique matriz. |
| "Usuário disse sem perguntas" | Pergunte ao menos 1-2 dimensões críticas. Avise: "vou perguntar X que afeta ±N PF". |
| "Mobile aumenta esforço, +9 PF" | NÃO. PF é independente de plataforma. Mobile aparece como push token (1 EI) + push send (1 EO), classificados pela matriz. |
| "3 perfis = ×1.20 sobre total" | NÃO. Telas distintas viram EQs distintas (já contadas). Sem multiplicador. |
| "VAF=1.0 neutraliza" | VAF é proibido. UFP puro. Não mencione. |
| "Pesos médios são equivalentes" | Não. ILF Cliente (12 DETs, 1 RET) = Low (7 PF) ≠ ILF Pedido (25 DETs, 3 RETs) = Avg (10 PF). Diferença real de 3 PF/entidade que se acumula. |
| "Usuário disse 'só me dá um número' → Indicative" | NÃO. Indicative só com gatilhos explícitos ("estimativa rápida", "ordem de grandeza", "pré-proposta"). Pressa ≠ aceitar ±50% imprecisão. Default = Detailed. |

## Red Flags — STOP

- Cravando ILF=10, EI=4 em todas funções sem matriz
- Mais de 7 perguntas
- Múltiplas perguntas em 1 chamada `AskUserQuestion`
- Mencionando VAF, GSC, multiplicadores, "fator de ajuste"
- Aplicando "+35 PF dashboard" / "+9 PF mobile" / "×1.20 perfis"
- Pulando entrevista quando input é vago e usuário não pediu Indicative

**Tudo isso significa: violação. Volte ao Fluxo §1.**
