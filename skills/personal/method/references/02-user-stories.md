# Step 2 — User Stories

## Reler antes

- Step 1 (`docs/01-problem/<tópico>.md`)

## Artefato

- **Pasta:** `docs/02-user-stories/`
- **Arquivo:** `<tópico>.md` (nome por domínio — ver `inventario-docs.md`)

## Conteúdo

Lista de user stories no formato:

```
Como <persona>, eu quero <ação> para <benefício/resultado>.
```

Isso vira requisito. Inclua TODAS as personas afetadas (identificadas no Step 1).

## Exemplo

```markdown
# Pagamentos — User Stories

- Como comprador, quero pagar com PIX para finalizar a compra instantaneamente.
- Como vendedor, quero receber notificação de pagamento recebido para liberar o produto.
- Como admin, quero ver o histórico de pagamentos falhados para dar suporte.
```

## Princípios neste step (`principios.md`)

- **SRP** — 1 story = 1 necessidade de 1 persona. Story com "e também" são duas stories disfarçadas de uma.
- **DRY** — mesma necessidade em duas personas = **uma** story com os dois atores, não duas gêmeas que vão divergir na manutenção.
- **YAGNI** — toda story rastreia a uma persona identificada no Step 1. Persona nova aparecendo aqui = ou o Step 1 está incompleto (volte) ou a story é especulação (fora).
- **KISS** — linguagem de usuário, sem solução técnica embutida. "Quero um botão que chame o endpoint X" não é story.

## Gateway 2 → 3

- [ ] Stories cobrem todas as personas do Step 1
- [ ] Formato "Como X, quero Y para Z" aplicado a cada story
- [ ] Artefato `docs/02-user-stories/<tópico>.md` existe com conteúdo substantivo
- [ ] **Princípios declarados** na linha do Gateway Check (SRP · DRY · YAGNI · KISS pela lente acima)
