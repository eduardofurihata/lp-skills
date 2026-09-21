# Step 11 — Check Follow-ups

**O protocolo fecha SECO.** Todo achado que este trabalho criou, tocou ou expôs se resolve **dentro desta execução** — escopo novo, por um `/method` completo próprio. A **captura** é contínua (Steps 1-10 alimentam o ledger); a **resolução** é aqui — o achado não interrompe a feature nem escapa.

**Chame e use:** `/solve` via Skill tool

## Artefato — o ledger

`obra/11-follow-ups/<tópico>.md` — semeado no Step 7, fechado aqui, movido ao done no Step 12.

```markdown
# <Tópico> — Follow-ups
| # | Achado | Detectado em | Balde | Status | Resolução |
| F1 | Modal de erro sem i18n — exposto pelo novo fluxo | Step 10 | B | RESOLVIDO-POR-CICLO | `obra/12-done/i18n-modal-erro.md` |
```

**Status:** `ABERTO` · `RESOLVIDO-NO-STEP` (A) · `RESOLVIDO-POR-CICLO` (B) · `DESCARTADO` (C). Item resolvido ou descartado **não reabre** — senão o loop nunca converge.

## Triagem — três baldes

- **A — Bloqueante.** Defeito **dentro** do escopo documentado (docs 01-06). Corrige **agora**, no step em que apareceu.
- **B — Ciclo próprio.** Escopo **novo** que este trabalho **criou, tocou ou expôs** — o critério do perímetro (`/principles`), visto de fora. `ABERTO` → `/method` completo para ele.
- **C — Fora do universo.** Pré-existente, **não tocado**, sem relação causal. `DESCARTADO` + justificativa de uma linha.

Violação de princípio entra na mesma triagem; regra duplicada dentro do perímetro é **absorção no motor** (A). **Na dúvida entre B e C → B.** C nunca é escape: tocou no arquivo ou a feature depende daquilo → é B. YAGNI mata especulação, não achado real.

## Gate de Convergência — publicar no chat

```markdown
## Gate de Convergência — Follow-ups
- Itens: **T** (A: a · B: b · C: c) · ciclos executados: **N** (Fn → done)
- Itens ABERTOS: **0** · novos no último passe: **0** → **passe seco**
- **Veredicto: ✅ CONVERGIU** / ❌ BLOQUEADO — abertos: [Fn]
```

**Passe seco** = zero `ABERTO` e zero item novo na varredura; ciclo que gera follow-up ⇒ o loop continua. ❌ = proibido iniciar o Step 12 — nem mover o artefato, nem commitar.

## Como rodar um ciclo (item B)

1. **Invoque o `/method` via Skill tool** (`furi-build:method`) para o item — sem a chamada, o ciclo não começou; corrigir B "direto no código" é retrofit.
2. **Steps 0 → 11 completos**, com tópico e artefatos próprios — resolve **aquele** achado, não a área em volta.
3. **Step 12 inteiro, MENOS o commit**: cria o done, deleta o to-do, para. **Só o ciclo raiz commita** — um commit cobrindo a feature e todos os ciclos.
4. Ledger da feature-pai: `RESOLVIDO-POR-CICLO` + link. Volta ao Gate.

## PARE se pensar
"abro card de follow-up" · "deixo anotado no relatório" · "resolvo direto no código" · "rodo o ciclo sem invocar" · "marco como C pra não travar" · "só sobrou 1 item" · "commito e resolvo depois"

## Gateway 11 → 12

- [ ] **Gate de Convergência ✅ CONVERGIU** publicado — passe seco
- [ ] Cada B fechado por ciclo `/method` próprio, done linkado; cada C justificado
- [ ] Ledger final em `obra/11-follow-ups/<tópico>.md`
- [ ] As **quatro linhas obrigatórias** publicadas (`SKILL.md` § Gateway Check)
