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

## Gateway 6 → 7a

- [ ] Tasks atômicas (1 prompt cada)
- [ ] Cada task rastreável
- [ ] Dependências mapeadas
- [ ] Artefato `kanban/06-todo/<tópico>.md` existe com conteúdo substantivo
