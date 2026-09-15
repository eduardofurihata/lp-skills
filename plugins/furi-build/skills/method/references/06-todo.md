# Step 6 — To Do

**Cada task = uma unidade resolvível em um prompt — e o card é a superfície viva da feature até o Done.** Ele carrega as tasks, o checklist de QA e o ledger de follow-ups: é o que permite parar e retomar de onde parou.

**Chame e use:** `/solve` (Skill tool) · `principios.md` § Lente por step · `design.md` § Lente por step (se tem UI) · `follow-ups.md`

## Artefato

`kanban/06-todo/<tópico>.md` — nome por domínio; doc que já cobre o domínio se **atualiza**, não se duplica (`inventario-docs.md`). Toda task rastreia a um UC (Step 3) ou TC (Step 5); task sem origem não entra.

```markdown
# <Tópico> — To Do

- [ ] <task — o que muda> · motor: <X> (nasce / estende / absorve) · UC-N / TC-N · arquivos: <lista>

## Test Cases (QA)
- [ ] TC-1: <nome>
- [ ] TC-2: <nome>

## Follow-ups

| # | Achado | Detectado em | Balde | Status | Resolução |
|---|--------|--------------|-------|--------|-----------|
```

## Regras

- Tasks atômicas (1 prompt por task)
- Cada task rastreável (arquivos/módulos afetados identificáveis)
- Dependências entre tasks mapeadas
- Ordem de execução óbvia

## Checklist de QA (status: testado ou não)

A seção `## Test Cases (QA)` do card é o rastreador de "já testei ou não" — a superfície VIVA atualizada ao longo do Step 9:

- **Semeie agora (Step 6):** um `- [ ]` por TC de `docs/05-test-cases/<tópico>.md`, todos abertos (nada rodou ainda).
- **No Step 9:** cada TC que PASSAR via front vira `- [x] TC-N: <nome> — ✅ (path do screenshot)`. FAILED continua `- [ ]` com nota `❌ motivo`. **Qualquer fix de código RESETA todos para `- [ ]`** (o ciclo retesta tudo).
- **No Step 10 (Done):** o checklist final (tudo `- [x]`) é **copiado para `kanban/10-done/<tópico>.md`** ANTES de apagar o card — registro permanente do que foi testado. O card some, o status sobrevive no done.

> Parou e vai retomar depois? Abra o checklist: os `- [ ]` restantes são exatamente o que falta rodar.

## Ledger de Follow-ups (semear agora)

A seção `## Follow-ups` do card é onde todo achado fora do escopo documentado é registrado e classificado, do Step 1 ao Step 10 — é o que permite o protocolo fechar **seco** (Regra Inviolável 7).

**Semeie agora (Step 6):** cabeçalho da tabela + **transcreva o que já apareceu nos Steps 1-5** (as linhas "Follow-ups detectados neste step" dos Gateway Checks). Nada apareceu → seção presente e vazia. Baldes, status, dedup e o que acontece com o ledger nos Steps 7-10: `follow-ups.md`.

## Gateway 6 → 7a

Critérios e formato: `gateways.md` — as quatro linhas obrigatórias do Gateway Check inclusive.
