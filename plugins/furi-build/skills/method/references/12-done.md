# Step 12 — Done

**Step terminal — não existe Step 13.** O card é promovido para `done` e **só então** o trabalho é commitado, num **único commit**, na branch atual. **Mover primeiro, commitar por último.** Só começa com o Gate de Convergência `✅ CONVERGIU` publicado no Step 11 — sem ele, nem done doc, nem `rm`, nem commit.

**Chame e use:** `/solve` via Skill tool · `11-follow-ups.md`

## Artefato — o done doc

`kanban/12-done/<tópico>.md` — nome por domínio (`00-start.md`), o card promovido, com:

- **Links** para todos os artefatos (`docs/01` … `docs/06`, `kanban/08` … `kanban/11`) e a **lista de arquivos de código** alterados.
- **Checklist por TC** (`- [x] TC-N`), copiado da seção `## Test Cases (QA)` do card de to-do — registro permanente do que foi testado.
- **Ledger final**, copiado de `kanban/11-follow-ups/<tópico>.md` — zero `ABERTO`, com o done de cada ciclo linkado.
- **Princípios — o que produziram**, 5 linhas sem prosa: **Reutilizado** (DRY, § 3.1 do plano) · **Descartado** (YAGNI, § 3.2) · **Motores** (§ 3.3: nasceram, cresceram, absorveram) · **Elevado** (perímetro § 3.5: o que subiu e o que já estava no nível #1) · **DS ganhou** (`/front`, se tem UI: tokens e componentes promovidos; nada → "coube no DS existente"). Sem elas o done doc mente por omissão: diz o que a feature faz e esconde **como ficou**.

## Ações — a ordem é contrato

1. **Mover o card.** Copie o checklist de QA e o ledger para o done doc, escreva-o e delete o card: `rm kanban/07-todo/<tópico>.md`. No kanban, a coluna é o status: to-do só tem trabalho ativo.
2. **Um único commit, na branch atual** (nunca crie branch): `git add -A` + `git commit -m "feat(<escopo>): <descrição>"` (Conventional Commits). Ele fecha o protocolo capturando tudo de uma vez — código, docs 01-11, card de done, remoção do to-do e **todos os ciclos de follow-up**. Código de steps anteriores fica **não-commitado** até aqui; commitar antes de mover força um segundo commit, que é exatamente o que esta ordem elimina. O SHA já vive no `git log` — anotá-lo no done não vale um segundo commit.

**Só o ciclo raiz commita**: ciclo de follow-up aninhado roda este step inteiro menos o commit (`11-follow-ups.md`). **Nenhuma decisão nova de arquitetura ou design se toma aqui** — o que aparecer é achado e reabre o Gate de Convergência, não vira ajuste de última hora.

## PARE se pensar
"o Step 10 passou, commito o código já" · "commito o código, movo o card, commito de novo" · "gravo o SHA no done e commito de novo" · "o ciclo de follow-up terminou, commito ele antes" · "achei uma última melhoria, ajusto antes de commitar"

## Checklist final — sem gateway de saída

- [ ] Gate de Convergência `✅ CONVERGIU` publicado no Step 11
- [ ] Done doc com links, arquivos de código, checklist por TC, ledger final e as **5 linhas de princípios**
- [ ] `kanban/07-todo/<tópico>.md` deletado **antes** do commit; `kanban/12-done/<tópico>.md` existe com conteúdo substantivo
- [ ] **Um único commit** na branch atual — código + docs + done + remoção do to-do + ciclos de follow-up; nenhum commit adiantado, nenhum extra depois

Tudo ✅ → feature encerrada. **Fim do protocolo.**
