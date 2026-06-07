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

## Gateway 1 → 2

- [ ] Problema em **1 frase clara**
- [ ] Quem é afetado identificado
- [ ] Artefato `docs/01-problem/<tópico>.md` existe com conteúdo substantivo
