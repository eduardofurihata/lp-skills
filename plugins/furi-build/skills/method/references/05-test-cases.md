# Step 5 — Test Cases

`docs/05-test-cases/<tópico>.md` · Reler 1-4

TC profissional, adversarial, captura **bug único**. Contempla várias possibilidades relevantes em produção. Roda via front no Step 9.

## Complexidade → Quantidade → Cobertura

A lógica, **nesta ordem**:

1. **Analise a complexidade do problema** — derivada dos artefatos dos Steps 3-4 (não chutada).
2. **Nota de complexidade (1-10) = quantidade de TCs.** `nº de TCs == nota`. Mínimo 1, máximo 10.
3. **Esses N TCs devem contemplar TODOS os UCs (Step 3) e detalhes do Spec (Step 4).**

> No Step 5 o código ainda não existe (codificar é Step 7) — a nota mede a complexidade do **problema/spec**, não da implementação.

### 1. Analisar a complexidade (dos Steps 3-4)

A nota sai do **quanto a feature tem para cobrir** — quanto mais, maior a nota:

| Dimensão | Vem de |
|----------|--------|
| Nº de Use Cases (ator × fluxo × estado) | Step 3 |
| Fluxos: feliz + alternativos + erros + concorrência | Step 3 |
| Estados de dado/sistema (vazio, parcial, expirado, bloqueado) | Step 3 |
| Plataformas no escopo (web/Android/iOS) | Step 4 |
| Cross-cutting (auth, permissões, a11y, analytics, segurança) | Step 4 |
| Raio de impacto / edge cases do questioning loop | Step 4 |

Pouco a cobrir (1 UC, 1 fluxo, sem cross-cutting) → nota baixa (1-3). Muito a cobrir → nota perto de 10.

### 2. Nota = quantidade de TCs

`nº de TCs == nota`, teto 10. **A nota dá o número** — não invente mais, não invente menos.

### 3. Os N TCs contemplam tudo (por isso, densos)

Como N costuma ser **menor** que o total de UCs + detalhes, cada TC é **denso** — atravessa vários de uma vez (user-journey: `login → busca → cupom → checkout` cobre 4 UCs num só TC). O objetivo dos N TCs é **contemplar 100% dos UCs (Step 3) e dos detalhes do Step 4**.

- **As 12 técnicas de QA são LENTES** para empacotar cobertura, não geradores: pairwise e user-journey comprimem muitos UCs/detalhes em poucos TCs; BVA/negativos/segurança/a11y garantem que os detalhes do nível 4 entrem. **Nunca "1 TC por técnica".**
- **Não desperdice slot** — filtro de significância (ver abaixo): todo TC tem que puxar cobertura.
- **Plataforma é eixo de EXECUÇÃO, não TC novo:** 1 TC = 1 cenário. Rodar em Android E iOS (Step 9) é o **mesmo TC 2×**, não 2 TCs.
- **Os N TCs não cobrem tudo?** Ou a nota ficou baixa (re-analise a complexidade) ou a feature é grande demais para um card (**quebre em features menores**). **Nunca fure o teto de 10.**

## Significância (cada TC puxa cobertura)

> **"Se eu deletar este TC, algum UC ou detalhe do nível 4 fica descoberto — um bug ÚNICO passaria?"**
> **SIM** → o TC é necessário. **NÃO** → redundante; reaproveite o slot para cobrir o que ainda falta.

## Formato

```
### TC-N: [nome]
- Cobre: [UCs e detalhes do nível 4 que este TC contempla — ex: UC-1, UC-3, a11y, mobile]
- Bug único: [frase concreta]
- Pré-condição: [setup, estado, persona]
- Passos: [numerados]
- Resultado: [observável no front]
- Prova: screenshot (Step 9)
```

> A linha **Cobre** é o que torna a cobertura auditável: somando os `Cobre` de todos os TCs, todo UC e todo detalhe do Step 4 tem que aparecer ao menos uma vez.

> **Feature com superfície de texto gerado por IA** (derivada no Step 4): ao menos um TC tem o `Resultado:` na **qualidade do texto lido** — lê **melhor que** a referência #1 do spec (completo, no tom da persona, no idioma do usuário, sem placeholder, sem robótico) — e não só "a resposta aparece". Conta como `Cobre` do detalhe "o que ler bem significa" do Step 4. Sem superfície de texto de IA, nada disso se aplica.
>
> Esse TC é **um dos N**, não um TC extra — a nota e o teto de 10 não mudam (é lente de cobertura, como Design). E a **prova** dele não é screenshot: é a **transcrição integral da saída** (`09-testing.md` § Evidência de texto).

## Princípios neste step (`principles/SKILL.md`)

- **SRP** — 1 TC = **1 bug único**. Denso (atravessa vários UCs) não é o mesmo que difuso: o TC pode cobrir 4 UCs, mas falha por **um** motivo nomeável.
- **DRY** — o filtro de significância É o DRY dos testes: TC que não puxa cobertura nova duplica outro. Delete e reaproveite o slot.
- **YAGNI** — teto de 10 e `nº TCs == nota`. Não invente TC "pra ficar completo"; não crie TC de plataforma (execução ≠ TC novo).
- **KISS** — passos executáveis por outra pessoa sem contexto seu, resultado observável no front.
- **Motor** — o TC exercita o **comportamento do motor pelo front**, nunca a peça interna. TC que precisa espiar estado interno está testando implementação, não comportamento.
- **Refatoração** — TC redundante → **funda**. É o próprio filtro de significância aplicado como faxina, não como corte cego.
- **Design** (se tem UI) — a cobertura contempla **estados** (vazio, carregando, erro, sucesso, limite) e **breakpoints do projeto** e a11y. Isso é **lente de cobertura, não TC extra**: um TC denso cobre a tela em mobile e desktop; dois TCs gêmeos por breakpoint violam o teto e o filtro de significância.
- **Texto de IA** (se tem essa superfície) — o `Resultado:` do TC é **o que se lê**, não "a resposta aparece"; e a prova é a saída inteira, não o screenshot do começo. TC cujo resultado observável é "retornou 200" não cobre texto: cobre transporte.

## Gateway 5 → 6

- [ ] **Nota de complexidade (1-10) publicada** no chat, derivada dos Steps 3-4
- [ ] **Nº de TCs == nota** e **≤ 10** — diverge → BLOQUEADO
- [ ] **Os TCs contemplam 100% dos UCs (Step 3) e detalhes do Step 4** — somatório das linhas `Cobre` não deixa nada descoberto
- [ ] Nenhum TC redundante (filtro de significância aplicado)
- [ ] Cada TC profissional, com bug único + resultado observável no front
- [ ] Artefato substantivo
- [ ] **Princípios declarados** na linha do Gateway Check (SRP · DRY · YAGNI · KISS · Motor pela lente acima)
- [ ] **Refatoração declarada** na linha própria do Gateway Check
- [ ] **Design declarado** na linha própria — cobertura de estados × breakpoints e a11y (se a feature tem superfície visual)
- [ ] **Texto de IA declarado** na linha própria — o TC de qualidade do texto lido existe e cita a referência #1 do spec; ou `❌ N/A — sem superfície de texto gerado por IA, derivado do Step 4`
