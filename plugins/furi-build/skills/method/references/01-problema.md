# Step 1 — Problema

**Uma frase, e ela descreve o problema, não a solução.** "Falta um endpoint de X" é solução disfarçada; se não cabe em uma frase, você não entendeu o problema ainda.

**Chame e use:** `/solve` via Skill tool · `11-follow-ups.md`

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

- A frase nomeia a **capacidade que falta**, não a tela onde ela some — e, com UI, a **fricção**, não o widget: "falta um botão" não é problema; "o usuário não consegue voltar sem perder o que digitou" é.
- Um problema por frase: a que tem "e" são dois, cada um na sua seção.
- Um problema com N afetados, não N problemas gêmeos.

## Gateway 1 → 2

- [ ] Problema em **1 frase clara**, sem solução embutida
- [ ] Quem é afetado identificado (persona/role)
- [ ] Artefato `docs/01-problem/<tópico>.md` existe com conteúdo substantivo
- [ ] As **quatro linhas obrigatórias** publicadas (`SKILL.md` § Gateway Check)
