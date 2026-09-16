# Step 6 — Test Cases

**TC profissional, adversarial, captura um bug único — e roda via front no Step 10.** A nota de complexidade dá o número de TCs, e esses N TCs cobrem 100% dos UCs e do Spec.

**Chame e use:** `/solve` · `/principles` · `/front` (se tem UI) — os três via Skill tool · `11-follow-ups.md`

## Artefato

`docs/06-test-cases/<tópico>.md` — nome por domínio; doc que já cobre o domínio se **atualiza**, não se duplica (`00-start.md`).

```markdown
# <Tópico> — Test Cases

### TC-N: <nome>
- Cobre: <UCs e detalhes do Step 4 que este TC contempla — ex: UC-1, UC-3, a11y, mobile>
- Bug único: <frase concreta>
- Pré-condição: <setup, estado, persona>
- Passos: <numerados, executáveis por outra pessoa sem o seu contexto>
- Resultado: <observável no front>
- Prova: screenshot (Step 10)
```

A linha **Cobre** torna a cobertura auditável: somando os `Cobre` de todos os TCs, todo UC (Step 3) e todo detalhe do Spec (Step 4) aparece ao menos uma vez. O resultado é observável **no front** — TC que espia estado interno testa implementação, não comportamento.

## Complexidade → quantidade → cobertura

1. **Nota de complexidade (1-10)**, derivada dos artefatos dos Steps 3-5 — não do código, que ainda não existe. Ela mede **quanto há para cobrir**: UCs, fluxos, estados, plataformas, cross-cutting (auth, a11y, segurança), telas × breakpoints. Pouco → 1-3; muito → perto de 10.
2. **nº de TCs == nota.** Mínimo 1, máximo 10 — a nota dá o número, não invente mais nem menos.
3. **Esses N TCs contemplam 100%** dos UCs e dos detalhes do Spec. Como N costuma ser menor que o total, cada TC é **denso** — um user-journey `login → busca → cupom → checkout` cobre 4 UCs num só TC. Denso não é difuso: o TC continua falhando por **um** motivo nomeável.

- As técnicas de QA (pairwise, user-journey, BVA, negativos, segurança, a11y) são **lentes** para empacotar cobertura, não geradores — nunca "1 TC por técnica".
- **Plataforma, breakpoint e a11y são eixos de execução, não TCs novos:** rodar em Android E iOS no Step 10 é o mesmo TC 2×; dois TCs gêmeos por breakpoint furam o teto.
- Os N TCs não cobrem tudo? Ou a nota ficou baixa (re-analise) ou a feature é grande demais para um card (**quebre**). Nunca fure o teto de 10.

## Significância — cada TC puxa cobertura

> *"Se eu deletar este TC, algum UC ou detalhe do Step 4 fica descoberto — um bug ÚNICO passaria?"* SIM → necessário. NÃO → redundante; reaproveite o slot para o que ainda falta.

## PARE se pensar

- **"Escrevo os TCs depois de codar, é mais fácil."** TC deriva da **spec** (o que o sistema DEVERIA fazer), não do código (o que ele FAZ). Depois = confirmação, não validação. BLOQUEADO.

## Gateway 6 → 7

- [ ] **Nota de complexidade publicada**, derivada dos Steps 3-5; **nº de TCs == nota**, ≤ 10
- [ ] Somatório das linhas `Cobre` não deixa UC nem detalhe do Spec descoberto; nenhum TC redundante
- [ ] Cada TC com **bug único** e resultado observável no front
- [ ] Artefato `docs/06-test-cases/<tópico>.md` existe com conteúdo substantivo
- [ ] As **quatro linhas obrigatórias** publicadas (`SKILL.md` § Gateway Check)
