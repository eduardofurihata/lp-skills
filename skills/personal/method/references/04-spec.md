# Step 4 — Spec (Autonomous Decision Loop)

## Reler antes

- Steps 1-3

## Artefato

- **Pasta:** `docs/04-spec/`
- **Arquivo:** `<tópico>.md`

## Regra central

**Resolva TODAS as decisões autonomamente — sem parar para perguntar ao usuário.**

**Para a SOLUÇÃO técnica: REFERÊNCIAS DE QUALIDADE são OBRIGATÓRIAS.** Big pop tech apps, players do mesmo domínio do negócio, OU qualquer outra referência relevante (mesmo de outro segmento) que contribua para a análise — a solução padrão de mercado é a baseline para competir no nível #1. Complexidade aceitável para atingir essa qualidade é REQUISITO, não obstáculo.

A AI resolve cada decisão usando (em ordem de prioridade):

1. **Padrões do projeto** — código existente, CLAUDE.md, `docs/04-spec/technical/patterns.md`, convenções já adotadas
2. **Big apps como referência** — Instagram, Spotify, Gmail, Notion, Meta, iFood, Uber, Airbnb, LinkedIn, Twitter/X
3. **Boas práticas de mercado** — padrões consagrados de engenharia de alto nível
4. **Princípios de engenharia** — SOLID, Clean Architecture, OWASP, performance, acessibilidade, escalabilidade

## Autonomous Decision Loop

```
ROUND = 0

REPETIR até zero gaps:
  ROUND += 1

  1. ANALISAR — Releia TUDO:
     - Docs steps 1-3
     - Decisões tomadas em rounds anteriores
     - Código existente relevante
     - CLAUDE.md e docs/04-spec/technical/patterns.md

  2. IDENTIFICAR GAPS — Decisões em aberto:
     Stack/tecnologia | Regras de negócio | UI/UX e consistência visual | Edge cases
     Integrações | Permissões/roles | Dados/schemas | Performance | Segurança
     **Escopo de plataforma** (web/android/ios) — derivado da feature, não declarado
     **UI/UX obrigatório:** como features similares se comportam no app hoje? como big apps resolvem?

  3. RESOLVER CADA GAP — Para cada decisão:
     - Decisão tomada (clara, direta)
     - Justificativa (por que esta é a melhor escolha)
     - Referência (padrão do projeto / big app / princípio)
     - Alternativas descartadas (o que foi considerado e por que saiu)

  4. RE-ANALISAR (do zero) — Com decisões tomadas, releia TUDO:
     - Decisões geraram NOVAS ambiguidades?
     - Contradições com algo anterior?
     - Dimensões não cobertas? (segurança, performance, a11y, mobile, i18n, rollback)

  5. DECISÃO: gaps restantes? → novo round. Zero gaps? → sair.

SAÍDA: "✅ Spec completo — [N] rounds, [M] decisões, zero ambiguidades"
  - Resumo de TODAS as decisões com justificativas.
```

## Regras do Loop

- **Sem limite de rounds** — rode quantos for necessário.
- **Cada round re-analisa TUDO do zero** — não confie na memória.
- **Mínimo 1 round** — features "simples" escondem complexidade.
- **NÃO pergunte ao usuário** — resolva baseado na hierarquia acima.
- **Contradição interna** → resolva pela opção mais consistente com o projeto existente; documente o motivo.
- **Hierarquia de decisão:** padrão existente no projeto > big apps > boas práticas > julgamento técnico.
- **Qualidade > velocidade** — 5 rounds com spec perfeito > 1 round com retrabalho.

## Escopo de Plataforma — Derivado, não declarado

**PROIBIDO** aceitar "web-only, skip mobile" como declaração do usuário. O escopo de plataforma é derivado da Verificação de Realidade (Step 3) + análise do projeto:

- Projeto tem app mobile? Feature tem superfície mobile?
- Se superfície existe em mobile → TCs mobile OBRIGATÓRIOS (Android + iOS).
- Se projeto é web-only (confirmado por ausência de código mobile) → documentar explicitamente no spec "feature não tem superfície mobile".

## Quando parar e perguntar

**Apenas se:**
1. Decisão **IRREVERSÍVEL** (rollback custoso, escolha de fornecedor, estrutura de dados core)
2. **2+ caminhos radicalmente opostos** (não variações sutis)
3. **Alto impacto** que só o usuário pode julgar

"Não tenho certeza do melhor approach" **NÃO** é motivo para parar. Resolva pela hierarquia e documente.

## Gateway 4 → 5

- [ ] Autonomous Decision Loop fechou com **zero gaps**
- [ ] Cada decisão com justificativa + referência + alternativas descartadas
- [ ] Escopo de plataforma derivado (não declarado)
- [ ] Artefato `docs/04-spec/<tópico>.md` existe com conteúdo substantivo
