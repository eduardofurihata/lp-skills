# Step 6 — To Do

## Reler antes

- Steps 1-5

## Artefato

- **Pasta:** `kanban/06-todo/`
- **Arquivo:** `<tópico>.md`

## Conteúdo

Lista de tasks com checkboxes. **Cada task = uma unidade resolvível em um prompt.**

## Regras

- Tasks atômicas (1 prompt por task)
- Cada task rastreável (arquivos/módulos afetados identificáveis)
- Dependências entre tasks mapeadas
- Ordem de execução óbvia

## Princípios neste step (`principios.md`)

A lista de tasks é a primeira forma concreta da arquitetura — o que estiver torto aqui vira código torto no 7b.

- **SRP** — 1 task = 1 responsabilidade resolvível em 1 prompt. Task que precisa de "e depois" é duas tasks.
- **DRY** — task que recria algo que o projeto já tem deve nascer como task de **reúso**: "estender `X` para cobrir Y" > "criar novo Y". A checagem é grep, não memória.
- **YAGNI** — toda task rastreia a um UC (Step 3) ou TC (Step 5). Task sem origem = escopo inventado → fora (ou vira achado no ledger, se for real).
- **KISS** — descrição na linguagem do que muda, não do como interno.

## Exemplo

```markdown
# Pagamentos — To Do

- [ ] Criar schema `Payment` no Prisma com status enum (pendente|pago|falhado|cancelado)
- [ ] Criar service `PaymentService` com métodos create, confirm, cancel
- [ ] Criar controller `PaymentController` com endpoints REST
- [ ] Criar componente `PaymentForm` no frontend
- [ ] Integrar webhook do gateway de pagamento
- [ ] Criar testes unitários para PaymentService
```

## Checklist de QA dos Test Cases (status: testado ou não)

Além das tasks de implementação, o card de to-do carrega um **checklist de QA** — um item `- [ ]` por TC de `docs/05-test-cases/<tópico>.md`. É o rastreador de "já testei ou não", a superfície VIVA atualizada ao longo do Step 9.

**Semeie agora (Step 6):** copie a lista de TCs do `docs/05-test-cases/` para uma seção `## Test Cases (QA)` no card, todos `- [ ]` (nada rodou ainda):

```markdown
## Test Cases (QA)
- [ ] TC-1: <nome>
- [ ] TC-2: <nome>
- [ ] TC-3: <nome>
```

- **No Step 9:** cada TC que PASSAR via front vira `- [x] TC-N: <nome> — ✅ (path do screenshot)`. FAILED continua `- [ ]` com nota `❌ motivo`. **Qualquer fix de código RESETA todos para `- [ ]`** (o ciclo retesta tudo).
- **No Step 10 (Done):** este checklist final (tudo `- [x]`) é **copiado para `kanban/10-done/<tópico>.md`** ANTES de apagar o card de to-do — registro permanente do que foi testado. O card some, o status sobrevive no done.

> Parou e vai retomar depois? Abra o checklist: os `- [ ]` restantes são exatamente o que falta rodar.

## Ledger de Follow-ups (semear agora)

O card carrega também o **Ledger de Follow-ups** — a superfície viva onde todo achado fora do escopo documentado é registrado e classificado, do Step 1 até o Step 10. É o que permite o protocolo fechar **seco** (Regra Inviolável 7).

**Semeie agora (Step 6):** crie a seção `## Follow-ups` com o cabeçalho da tabela e **transcreva o que já apareceu nos Steps 1-5** (as linhas "Follow-ups detectados neste step" dos Gateway Checks). Nada apareceu → seção presente e vazia.

```markdown
## Follow-ups

| # | Achado | Detectado em | Balde | Status | Resolução |
|---|--------|--------------|-------|--------|-----------|
```

- **Baldes:** **A** = defeito dentro do escopo documentado → corrige no step; **B** = escopo novo que este trabalho criou/tocou/expôs → ciclo `/method` próprio; **C** = pré-existente e não tocado → `DESCARTADO` com justificativa. Na dúvida entre B e C → **B**.
- **Nos Steps 7-9:** todo achado entra aqui na hora, classificado. Item `RESOLVIDO-*` ou `DESCARTADO` não reabre.
- **No Step 10:** o **Gate de Convergência** exige zero itens `ABERTO`; o ledger final é **copiado para `kanban/10-done/<tópico>.md`** antes do card ser deletado.

Regras completas: `follow-ups.md`.

## Gateway 6 → 7a

- [ ] Tasks atômicas (1 prompt cada)
- [ ] Cada task rastreável
- [ ] Dependências mapeadas
- [ ] Artefato `kanban/06-todo/<tópico>.md` existe com conteúdo substantivo
- [ ] Seção `## Test Cases (QA)` presente com 1 `- [ ]` por TC do step 5
- [ ] Seção `## Follow-ups` presente (semeada com os achados dos Steps 1-5, ou vazia)
- [ ] Toda task rastreia a UC/TC (YAGNI) e task que recria o existente virou task de **reúso** (DRY)
- [ ] **Princípios declarados** na linha do Gateway Check
