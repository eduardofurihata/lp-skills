# Step 9 — Code Review Crítico

**Revisar até 100% limpo, princípio a princípio e por nome — e nada do que aparecer fica só na cabeça:** corrigido agora (A), `ABERTO` no ledger (B) ou `DESCARTADO` com justificativa (C).

**Chame e use:** `/solve` via Skill tool · `11-follow-ups.md`

## 9a — Revisão em loop

Repita até zero issues de balde A — nunca "bom o suficiente":

1. `git status` + `git diff` (e `--cached`) — TODAS as mudanças desta feature, ainda não commitadas.
2. Releia o plano (8a), os TCs (6) e os UCs (3): implementa tudo, cobre todo cenário — **exatamente** o que os UCs pedem, nem mais, nem menos?
3. Revise CADA arquivo: código morto, bugs, segurança (XSS, injection, secrets, auth), performance (N+1, re-renders), erros silenciosos ou genéricos, consistência com o codebase.
4. **`/principles`, um a um e por nome** — os cinco do SOLID, DRY, KISS, YAGNI, LoD, Motores (há segunda fonte da mesma regra?) e o **saldo do perímetro** (§ 3.5: cada arquivo subiu, ou está declarado no nível #1). O plano foi cumprido (§ 3.1-3.3)?
5. **`/front`, se tem UI** — mesma mecânica com os guarda-chuvas: DS (zero literal, promoções registradas), consistência elevada, todos os estados, a11y AA, breakpoints; § 3.4 cumprido? E o **nível** (`/solve`): big pop tech app, não só "funciona"?
6. Problema → triagem A/B/C: **A** corrige agora e volta ao 1; **B**/**C** vão ao ledger.

## 9b — Relatório

`obra/09-code-review/<tópico>.md` — criar/atualizar:

```markdown
# Relatório de Code Review — <feature>
## Resumo — branch · iterações · PR existente (sim/não)
## Arquivos analisados — arquivo · veredicto (✅ limpo / ⚠️ corrigido)
## Problemas corrigidos — Issue #N: arquivo · severidade · descrição · correção
## Cobertura — stories · UCs · TCs · gaps
## Segurança — input · auth · dados sensíveis · injection (✅/❌/N/A)
## Análise de Qualidade — UMA linha por princípio: SRP · OCP · LSP · ISP · DIP · DRY · KISS · YAGNI · LoD · Motores · Refatoração (saldo) · nível #1 — veredicto + evidência
## Análise de Design (só com UI) — UMA linha por guarda-chuva do /front — veredicto + evidência; sem UI: `N/A — derivado do Step 4`, uma vez
## Follow-ups emitidos — achado · balde · status · destino (ou "nenhum")
## Veredicto — ✅ APROVADO / ❌ REQUER correções · confiança · notas para o teste
```

Relatório **brutalmente honesto**; achado fora do escopo vai ao **ledger**. **Não cria nem aprova PR** — só revisa, corrige e atualiza o existente. Veredicto ❌ → volta ao 8b e roda o Step 9 inteiro.

## PARE se pensar

- **"O review já viu isso no geral, não preciso ir princípio a princípio."** Uma linha por princípio; linha em branco = princípio não revisado. BLOQUEADO.

## Gateway 9 → 10

- [ ] Veredicto **APROVADO**; zero issues de balde A
- [ ] Qualidade (e Design, se tem UI) **por princípio**, nenhuma linha em branco; saldo do perímetro conferido
- [ ] Achados fora de escopo classificados no ledger (A/B/C)
- [ ] Artefato `obra/09-code-review/<tópico>.md` existe com conteúdo substantivo
- [ ] As **quatro linhas obrigatórias** publicadas (`SKILL.md` § Gateway Check)
