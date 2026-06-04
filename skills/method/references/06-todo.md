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

## Gateway 6 → 7a

- [ ] Tasks atômicas (1 prompt cada)
- [ ] Cada task rastreável
- [ ] Dependências mapeadas
- [ ] Artefato `kanban/06-todo/<tópico>.md` existe com conteúdo substantivo
- [ ] Seção `## Test Cases (QA)` presente com 1 `- [ ]` por TC do step 5
