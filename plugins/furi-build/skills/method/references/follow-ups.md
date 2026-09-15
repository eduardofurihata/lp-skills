## Follow-ups

> **O `/method` fecha SECO.** Achado não vira card nem fica para depois: resolve dentro desta execução.

Achado pode aparecer em qualquer step. Vai para o **ledger**, classificado. O Step 10 só começa com o ledger sem nada `ABERTO` — é o **Gate de Convergência** (§ Step 10 — Done).

### Os 3 baldes

| Balde | O que é | O que fazer |
|-------|---------|-------------|
| **A** | Defeito dentro do escopo documentado (docs 01-04) | Corrige agora, no step → `RESOLVIDO-NO-STEP` |
| **B** | Escopo novo que este trabalho criou, tocou ou expôs | `ABERTO` → um `/method` completo só para ele |
| **C** | Pré-existente, não tocado, sem relação com o trabalho | `DESCARTADO` + 1 linha de justificativa |

Na dúvida entre B e C, é **B**. Tocou no arquivo, mudou o comportamento ou a feature depende daquilo: é B. YAGNI não justifica C — YAGNI mata código especulativo, não achado real. Violação de princípio (`principles/SKILL.md`) é achado como qualquer outro.

### O ledger

Seção `## Follow-ups` do card `kanban/06-todo/<tópico>.md`. Semeada no Step 6, viva até o fim, copiada para o done doc antes de o card ser apagado. Achado dos Steps 1-5 espera na linha do Gateway Check até o card existir.

```markdown
| # | Achado | Detectado em | Balde | Status | Resolução |
|---|--------|--------------|-------|--------|-----------|
| F1 | Endpoint `/x` sem validação | Step 8 | A | RESOLVIDO-NO-STEP | corrigido no review |
| F2 | Modal de erro sem i18n, exposto pelo novo fluxo | Step 9 | B | RESOLVIDO-POR-CICLO | `kanban/10-done/i18n-modal-erro.md` |
| F3 | `LegacyTable` usa `any`, arquivo não tocado | Step 7b | C | DESCARTADO | nada desta feature depende dele |
```

Item resolvido ou descartado não reabre.

### Fechar um item B

Invoque o `/method` (Skill tool, `furi-build:method`) para o item. Tópico e artefatos próprios, Steps 1→9 completos, e o Step 10 inteiro **menos o commit** — só o ciclo raiz commita, um commit no fim cobrindo tudo. Depois marque `RESOLVIDO-POR-CICLO` no ledger e republique o Gate.

Corrigir um B direto no código, sem `/method`, é retrofit (Regra Inviolável 2). PROIBIDO.
