# Step 4a — Spec

**Toda decisão em aberto, resolvida aqui — sem perguntar.** Zero ambiguidade sobra para o Step 5.

**Chame e use:** `/solve` (Skill tool) · `principios.md` § Lente por step · `design.md` § Lente por step (se tem UI) · `follow-ups.md`

## Artefato

`docs/04-spec/<tópico>.md` — nome por domínio; doc que já cobre o domínio se **atualiza**, não se duplica (`inventario-docs.md`).

```markdown
# <Tópico> — Spec

## Escopo derivado
- **Plataformas:** web · android · ios — <o que a Verificação de Realidade (Step 3) e o código do projeto sustentam>
- **Superfície visual:** sim / não — <por quê>

## Decisões
### D-N — <decisão em uma frase>
- **Justificativa:** <por que esta é a melhor escolha>
- **Referência:** <`/solve` (big app / boa prática / princípio) ou código existente>
- **UC que exige:** UC-N
- **Já existe no projeto?** <mecanismo encontrado → reusar/estender | nada → criar>
- **Descartadas:** <alternativa — por que saiu>
```

## Hierarquia de decisão

Cada decisão se resolve, nesta ordem:

1. **`/solve`** — a referência #1: big pop tech apps / líderes do domínio, boas práticas consagradas (Clean Architecture, OWASP, performance, escalabilidade) e os princípios (`principios.md`; `design.md` se tem UI)
2. **Código existente** — o código do projeto, CLAUDE.md, `docs/04-spec/technical/patterns.md`, convenções já adotadas

## Autonomous Decision Loop

```
ROUND = 0

REPETIR até zero gaps:
  ROUND += 1

  1. ANALISAR — releia TUDO:
     - Docs dos Steps 1-3
     - Decisões dos rounds anteriores
     - Código existente relevante
     - CLAUDE.md e docs/04-spec/technical/patterns.md

  2. IDENTIFICAR GAPS — decisões em aberto:
     Stack/tecnologia | Regras de negócio | Edge cases | Integrações
     Permissões/roles | Dados/schemas | Performance | Segurança
     **Escopo de plataforma** (web/android/ios) — derivado, não declarado
     **Superfície visual** (sim/não) — derivada, não declarada
     **Motores** — qual capacidade esta feature exige, e quem é o dono dela?

  3. RESOLVER CADA GAP — no formato D-N do artefato:
     decisão · justificativa · referência · UC que exige · já existe? · descartadas

  4. RE-ANALISAR (do zero) — com as decisões tomadas, releia TUDO:
     - Decisões geraram NOVAS ambiguidades? Contradizem algo anterior?
     - Dimensões não cobertas? (segurança, performance, i18n, rollback)
     - A decisão espalha uma regra que já tem dono? → **absorve no motor**

  5. DECISÃO: gaps restantes? → novo round. Zero gaps? → sair.

SAÍDA: "✅ Spec completo — [N] rounds, [M] decisões, zero ambiguidades"
```

- **Sem limite de rounds** — rode quantos for necessário.
- **Cada round re-analisa TUDO do zero** — não confie na memória.
- **Mínimo 1 round** — features "simples" escondem complexidade.
- **Contradição interna** → a opção mais consistente com o projeto existente; documente o motivo.

## Escopo derivado, nunca declarado

**PROIBIDO** aceitar "web-only, skip mobile" ou "isso não tem UI" como declaração do usuário. Os dois saem da Verificação de Realidade (Step 3) + análise do projeto:

- Projeto tem app mobile? A feature tem superfície mobile? Se tem → Android e iOS entram no escopo.
- Projeto web-only (confirmado pela ausência de código mobile) → o spec documenta "feature não tem superfície mobile".
- **Superfície visual = sim** quando algum UC lista estados de tela (Step 3) ou algum passo do happy path acontece numa tela do projeto.

## Gateway 4a → 4b

Critérios e formato: `gateways.md` — as quatro linhas obrigatórias do Gateway Check inclusive. Sem superfície visual, a linha de Design declara `❌ N/A` **uma vez** aqui e o próximo step é o 5.
