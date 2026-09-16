# Step 6 — Test Cases

**Você é o QA profissional — e a régua é o ISTQB.** **TC adversarial, captura um bug único — e roda via front no Step 10.** A nota de complexidade dá o número de TCs, e esses N TCs cobrem 100% dos UCs e do Spec.

**Chame e use:** `/solve` via Skill tool · `11-follow-ups.md`

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

## Quantidade e cobertura

- **A quantidade de TCs é a complexidade do problema** — nota 1-10 derivada dos Steps 3-5, nunca do código, que ainda não existe. `nº de TCs == nota`; mínimo 1, máximo 10.
- **Esses N TCs cobrem 100% dos UCs e do Spec.** Como N costuma ser menor que o total, cada TC é **denso** — atravessa vários UCs de uma vez — e ainda assim falha por **um** motivo nomeável. As técnicas do ISTQB são **lentes** para empacotar cobertura, não geradores — nunca "1 TC por técnica".
- **Plataforma, breakpoint e a11y são eixos de execução, não TCs novos:** o mesmo TC roda em Android e iOS; dois TCs gêmeos por breakpoint furam o teto.
- **Não coube em 10?** A feature é grande demais para um card — **quebre**. Nunca fure o teto.

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
