# Step 1 — Problema

**Uma frase.** Se não cabe em uma frase, você não entendeu o problema ainda.

## Artefato

- **Pasta:** `docs/01-problem/`
- **Arquivo:** `<tópico>.md` (nome por domínio — ver `inventario-docs.md`)

## Conteúdo

- **Problema** — 1 frase clara
- **Contexto breve** — 2-3 linhas se necessário
- **Quem é afetado** — personas / roles

## Exemplo

```markdown
# Pagamentos

## Problema
Usuários não conseguem receber pagamentos na plataforma.

## Contexto
Fluxo de checkout finaliza com erro 500 quando o método é PIX. Implementado há 6 meses, regressão na última release.

## Afetados
- Compradores (não conseguem finalizar compra)
- Vendedores (não recebem)
- Suporte (volume de tickets 3× maior)
```

## Princípios neste step (`principios.md`)

- **KISS** — 1 frase. Não coube? você ainda não entendeu o problema; não compense com parágrafo.
- **YAGNI** — o problema é o que **existe e foi relatado**, não o adjacente que você imaginou junto. Problema inventado aqui vira feature especulativa lá na frente.
- **DRY** — o Inventário de Docs achou arquivo que já cobre este domínio? **Atualize esse**, não crie um paralelo (`inventario-docs.md`).
- **SRP** — 1 doc = 1 problema. Dois problemas distintos = dois tópicos, dois fluxos de `/method`.
- **Motor** — o problema nomeia a **capacidade que falta** ("o produto não sabe calcular X"), não a tela onde ela some. Problema descrito como tela leva a solução espalhada por telas.
- **Refatoração** — o inventário achou doc que já cobre este domínio? **Consolide nele.** Doc paralelo é duplicação de decisão, a mais barata de evitar e a mais cara de descobrir depois.
- **Design** (se tem UI) — o problema é de UX? Nomeie a **fricção**: passo redundante, contexto perdido, ação que não se acha. "Falta um botão" não é problema; "o usuário perde o que digitou ao voltar" é (`design.md`).

## Gateway 1 → 2

- [ ] Problema em **1 frase clara**
- [ ] Quem é afetado identificado
- [ ] Artefato `docs/01-problem/<tópico>.md` existe com conteúdo substantivo
- [ ] **Princípios declarados** na linha do Gateway Check (KISS · YAGNI · DRY · SRP · Motor pela lente acima)
- [ ] **Refatoração declarada** na linha própria do Gateway Check
- [ ] **Design declarado** na linha própria (se a feature tem superfície visual)
