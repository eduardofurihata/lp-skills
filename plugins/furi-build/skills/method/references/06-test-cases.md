# Step 6 — Test Cases

**TC profissional, adversarial, captura um bug único — e roda via front no Step 10.** Contempla as possibilidades relevantes em produção: a nota de complexidade dá o número de TCs, e esses N TCs cobrem 100% dos UCs e do Spec.

**Chame e use:** `/solve` · `/principles` · `/front` (se tem UI) — os três via Skill tool · `11-follow-ups.md` · `rationalizations.md`

## Artefato

`docs/06-test-cases/<tópico>.md` — nome por domínio; doc que já cobre o domínio se **atualiza**, não se duplica (`00-start.md`). Todo UC do Step 3 e todo detalhe do Spec aparecem em alguma linha `Cobre`.

```markdown
# <Tópico> — Test Cases

### TC-N: <nome>
- Cobre: <UCs e detalhes do Step 4 que este TC contempla — ex: UC-1, UC-3, a11y, mobile>
- Bug único: <frase concreta>
- Pré-condição: <setup, estado, persona>
- Passos: <numerados>
- Resultado: <observável no front>
- Prova: screenshot (Step 10)
```

A linha **Cobre** é o que torna a cobertura auditável: somando os `Cobre` de todos os TCs, todo UC e todo detalhe do Step 4 tem que aparecer ao menos uma vez.

## Complexidade → Quantidade → Cobertura

A lógica, **nesta ordem**:

1. **Analise a complexidade do problema** — derivada dos artefatos dos Steps 3-5 (não chutada).
2. **Nota de complexidade (1-10) = quantidade de TCs.** `nº de TCs == nota`. Mínimo 1, máximo 10 — a nota dá o número, não invente mais nem menos.
3. **Esses N TCs devem contemplar TODOS os UCs (Step 3) e detalhes do Spec (Step 4).**

> No Step 6 o código ainda não existe (codificar é o Step 8b) — a nota mede a complexidade do **problema/spec**, não da implementação.

### Analisar a complexidade (dos Steps 3-5)

A nota sai do **quanto a feature tem para cobrir** — quanto mais, maior a nota:

| Dimensão | Vem de |
|----------|--------|
| Nº de Use Cases (ator × fluxo × estado) | Step 3 |
| Fluxos: feliz + alternativos + erros + concorrência | Step 3 |
| Estados de dado/sistema (vazio, parcial, expirado, bloqueado) | Step 3 |
| Plataformas no escopo (web/Android/iOS) | Step 4 |
| Cross-cutting (auth, permissões, a11y, analytics, segurança) | Step 4 |
| Telas × estados × breakpoints (se tem UI) | Step 5 |
| Raio de impacto / edge cases do questioning loop | Step 4 |

Pouco a cobrir (1 UC, 1 fluxo, sem cross-cutting) → nota baixa (1-3). Muito a cobrir → nota perto de 10.

### Os N TCs contemplam tudo (por isso, densos)

Como N costuma ser **menor** que o total de UCs + detalhes, cada TC é **denso** — atravessa vários de uma vez (user-journey: `login → busca → cupom → checkout` cobre 4 UCs num só TC). O objetivo dos N TCs é **contemplar 100% dos UCs (Step 3) e dos detalhes do Step 4**.

- **As técnicas de QA (pairwise, user-journey, BVA, negativos, segurança, a11y…) são LENTES** para empacotar cobertura, não geradores: pairwise e user-journey comprimem muitos UCs/detalhes em poucos TCs; BVA/negativos/segurança/a11y garantem que os detalhes do Step 4 entrem. **Nunca "1 TC por técnica".**
- **Não desperdice slot** — filtro de significância (ver abaixo): todo TC tem que puxar cobertura.
- **Plataforma é eixo de EXECUÇÃO, não TC novo:** 1 TC = 1 cenário. Rodar em Android E iOS (Step 10) é o **mesmo TC 2×**, não 2 TCs.
- **Os N TCs não cobrem tudo?** Ou a nota ficou baixa (re-analise a complexidade) ou a feature é grande demais para um card (**quebre em features menores**). **Nunca fure o teto de 10.**

## Significância (cada TC puxa cobertura)

> **"Se eu deletar este TC, algum UC ou detalhe do Step 4 fica descoberto — um bug ÚNICO passaria?"**
> **SIM** → o TC é necessário. **NÃO** → redundante; reaproveite o slot para cobrir o que ainda falta.

## Princípios neste step

- **SRP** — 1 TC = 1 bug único. Denso (atravessa 4 UCs) não é difuso: falha por **um** motivo nomeável.
- **DRY** — TC que não puxa cobertura nova é redundante; o filtro de significância é o DRY dos testes.
- **KISS** — passos executáveis por outra pessoa sem o seu contexto, resultado observável no front.
- **YAGNI** — teto de 10 e `nº TCs == nota`; não invente TC para "ficar completo".
- **Motor** — o TC exercita o **comportamento do motor pelo front**, nunca a peça interna: TC que espia estado interno testa implementação, não comportamento.
- **Refatoração** — TC redundante → **funda** (é o próprio filtro de significância).
- **Design** (se tem UI) — a cobertura contempla **estados × breakpoints** e a11y como **lente, não como TC extra**: um TC denso cobre a tela em mobile e desktop; dois TCs gêmeos por breakpoint furam o teto.

## Gateway 6 → 7

- [ ] **Nota de complexidade (1-10) publicada** no chat, derivada dos Steps 3-5
- [ ] **nº de TCs == nota** e **≤ 10** — diverge → BLOQUEADO
- [ ] Os TCs contemplam **100% dos UCs (Step 3) e dos detalhes do Spec (Step 4)** — somatório das linhas `Cobre` não deixa nada descoberto
- [ ] Nenhum TC redundante (filtro de significância aplicado)
- [ ] Cada TC com **bug único** + resultado observável no front; Android E iOS = execução no Step 10, não TCs extras
- [ ] Artefato `docs/06-test-cases/<tópico>.md` existe com conteúdo substantivo
- [ ] As **quatro linhas obrigatórias** publicadas (`SKILL.md` § Gateway Check)
