# Step 1 — Problema

**Uma frase.** Se não cabe em uma frase, você não entendeu o problema ainda.

**Chame e use:** `/solve` · `/principles` · `/front` (se tem UI) — os três via Skill tool · `11-follow-ups.md` · `rationalizations.md`

## Artefato

`docs/01-problem/<tópico>.md` — nome por domínio; doc que já cobre o domínio se **atualiza**, não se duplica (`00-start.md`).

```markdown
# <Tópico>

## Problema
<1 frase>

## Contexto
<2-3 linhas, se necessário>

## Afetados
- <persona / role> (<como é afetada>)
```

## Princípios neste step

- **KISS** — a âncora deste step é KISS aplicado; e a frase descreve o **problema**, não a solução: "falta um endpoint de X" é solução disfarçada.
- **YAGNI** — o problema é o que existe, não o adjacente que ninguém relatou.
- **DRY** — o inventário achou doc que já cobre isso? **atualize**, não crie paralelo.
- **Motor** — o problema nomeia a **capacidade que falta**, não a tela onde ela some.
- **Refatoração** — doc que já cobre o domínio → **consolide**, não crie um paralelo.
- **Design** (se tem UI) — nomeie a **fricção** (passo redundante, contexto perdido, ação que não se acha), não o widget: "falta um botão" não é problema; "o usuário não consegue voltar sem perder o que digitou" é.

## Gateway 1 → 2

- [ ] Problema em **1 frase clara**
- [ ] Quem é afetado identificado (persona/role)
- [ ] Artefato `docs/01-problem/<tópico>.md` existe com conteúdo substantivo — doc do mesmo domínio foi **atualizado**, não duplicado
- [ ] As **quatro linhas obrigatórias** publicadas (`SKILL.md` § Gateway Check)
