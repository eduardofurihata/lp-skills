# Step 11 — Check Follow-ups

**O protocolo fecha SECO: nenhum follow-up sai pendente.** Achado ou é fora de escopo — descartado na triagem, com prova, e nunca reportado — ou é escopo e se resolve **aqui**, por um `/method` próprio, sem perguntar. Não existe terceira via: "bloqueado", "precisa de permissão", "fica para o deploy" é escopo e tem ciclo. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Invocar o `/solve` via Skill tool
- [ ] Reler o ledger `obra/11-follow-ups/<tópico>.md`, semeado no Step 7
- [ ] Varrer os artefatos e gateways dos Steps 1-10 atrás de achado que não entrou no ledger
- [ ] Descartar o fora de escopo (C): pré-existente, não tocado, sem relação causal — provado com diff e dependência, nunca com "dono de X"; tocou no arquivo ou a feature depende daquilo → é B; na dúvida, B
- [ ] Conferir que todo A — defeito dentro do escopo documentado (docs 01-06) — foi corrigido no step em que apareceu
- [ ] Rodar um ciclo por B — escopo novo que o trabalho criou, tocou ou expôs, código ou não (permissão, config, publicação): invocar `furi-build:method` via Skill tool, Steps 0 → 11 completos, Step 12 inteiro menos o commit, e marcar `RESOLVIDO-POR-CICLO` com o link do done
- [ ] Repetir a varredura até o passe seco: zero `ABERTO`, zero item novo — ciclo que gera follow-up continua o loop
- [ ] Publicar o Gate de Convergência no chat
- [ ] Publicar o Gateway 11 → 12 com as linhas do `SKILL.md` § Gateway Check

O ledger — status `ABERTO` · `RESOLVIDO-NO-STEP` (A) · `RESOLVIDO-POR-CICLO` (B) · `DESCARTADO` (C); resolvido ou descartado **não reabre**, senão o loop nunca converge:

```markdown
# <Tópico> — Follow-ups
| # | Achado | Detectado em | Balde | Status | Resolução |
| F1 | Modal de erro sem i18n — exposto pelo novo fluxo | Step 10 | B | RESOLVIDO-POR-CICLO | `obra/12-done/i18n-modal-erro.md` |
```

O Gate:

```markdown
## Gate de Convergência — Follow-ups
- Itens: **T** (A: a · B: b · C: c) · ciclos executados: **N** (Fn → done)
- Itens ABERTOS: **0** · novos no último passe: **0** → **passe seco**
- **Veredicto: ✅ CONVERGIU** / ❌ BLOQUEADO — abertos: [Fn]
```

❌ = proibido o Step 12 — nem mover o artefato, nem commitar. **Só o ciclo raiz commita**: um commit cobrindo a feature e todos os ciclos.
