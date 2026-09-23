# Step 4 — Spec

**Toda decisão em aberto, resolvida aqui — sem perguntar.** Zero ambiguidade sobra para os steps seguintes.

**Chame e use:** `/solve` via Skill tool

## Artefato

`docs/04-spec/<tópico>.md` — nome por domínio; doc que já cobre o domínio se **atualiza**, não se duplica (`00-start.md`).

```markdown
# <Tópico> — Spec

## Escopo derivado
- **Plataformas:** web · android · ios — <o que a Verificação de Realidade (Step 3) e o código sustentam>
- **Superfície visual:** sim / não — <por quê>

## Decisões
### D-N — <decisão em uma frase>
- **Justificativa e referência:** <por quê; `/solve` (big app / boa prática) ou código existente>
- **UC que exige:** UC-N
- **Já existe no projeto?** <mecanismo → reusar/estender | nada → criar>
- **Motor dono da regra:** <nasce / estende / absorve lógica dispersa> · **depende de:** <abstração, e em que direção> · **cresce por:** <ponto de extensão>
- **Descartadas:** <alternativa — por que saiu>
```

## Hierarquia de decisão

1. **`/solve`** — a referência #1 e as boas práticas consagradas.
2. **Código existente** — o projeto, `CLAUDE.md`, `.claude/patterns.md`, convenções já adotadas.

Empate entre soluções no nível #1: ganha a **mais simples**. Decisão sem UC que a exija vai para `Descartadas`, não para o código.

## Autonomous Decision Loop

Repita até **zero gaps**, sem limite de rounds e nunca menos de um — feature "simples" esconde complexidade:

1. **Analise tudo** — docs dos Steps 1-3, decisões dos rounds anteriores, código relevante, `CLAUDE.md`.
2. **Identifique os gaps** — stack, regras de negócio, edge cases, integrações, permissões, dados, performance, segurança, i18n, rollback; **plataforma** e **superfície visual** (derivadas, nunca declaradas); **qual capacidade a feature exige e quem é o dono dela**.
3. **Resolva cada gap** como uma D-N do artefato.
4. **Re-analise do zero** — as decisões criaram ambiguidade nova, contradizem algo, espalham regra que já tem dono (→ absorve no motor)?

Saída: `✅ Spec completo — [N] rounds, [M] decisões, zero ambiguidades`.

## Escopo derivado, nunca declarado

"Web-only" e "não tem UI" não se aceitam do usuário. **Plataforma** = o que o código do projeto tem (app mobile existe e a feature aparece nele → Android e iOS entram). **Superfície visual = sim** quando algum UC lista estados de tela ou algum passo acontece numa tela.

## PARE se pensar

- **"Não tem UI, pulo o `/front`."** Superfície visual é **derivada** aqui. Sem ela, declare `❌ N/A` uma vez no Gateway 4 → 5 — é o que dispensa o `/front` dali em diante. Antes disso, BLOQUEADO.

## Gateway 4 → 5

- [ ] Loop fechou com **zero gaps**; cada D-N com todos os campos do artefato
- [ ] **Plataforma** e **superfície visual** derivadas aqui, não declaradas
- [ ] Artefato `docs/04-spec/<tópico>.md` existe com conteúdo substantivo
- [ ] Follow-up que apareceu aqui, resolvido aqui — nada se caça
- [ ] As **quatro linhas obrigatórias** publicadas (`SKILL.md` § Gateway Check)

**Sem superfície visual:** a linha de Design declara `❌ N/A — derivado do Step 4` **uma vez** aqui, o Step 5 não roda, os gateways seguintes herdam — o próximo é o **Step 6**.
