# Follow-ups — Ledger + Loop de Convergência

> **O `/method` fecha SECO.** Nada de "abro um card pra isso depois". Todo achado que este trabalho criou, tocou ou expôs é **resolvido dentro desta execução** — e resolver escopo novo significa rodar o `/method` COMPLETO (Step 1 → 10, com `/solve`) para ele.

O loop **não é um step novo** (os 10 steps são contrato; não existe Step 11). É um **wrapper** com dois pontos de enforcement:

| Ponto | Onde acontece | O quê |
|-------|---------------|-------|
| **Captura** | TODOS os steps (1 → 10) | Todo achado fora do escopo documentado entra no **Ledger de Follow-ups**. Cada Gateway Check publica quantos foram detectados no step. |
| **Resolução** | **Entrada do Step 10**, antes de mover o card e antes do commit | **Gate de Convergência**: ledger com item aberto → roda `/method` completo para ele → volta ao Gate. Só libera o Step 10 com **passe seco**. |

Capturar durante e resolver no fim preserva a esteira de produção (`SKILL.md` — "Não Pergunte Entre Steps"): o achado não interrompe a feature, mas também não escapa.

```
Step 1 ──┐
  ...    │ captura contínua → Ledger
Step 9 ──┘
   │
   ▼
GATE DE CONVERGÊNCIA (entrada do Step 10)
   │
   ├─ item ABERTO no ledger?
   │     └─ SIM → /method completo (1→10, com /solve) para o item
   │              └─ esse ciclo alimenta o MESMO ledger
   │              └─ ciclo aninhado NÃO commita
   │              └─ volta ao Gate
   │
   └─ NÃO → passe seco → Step 10 libera: move o card + UM commit
```

---

## Triagem — 3 baldes (é o que faz o loop convergir)

**"Zero follow-ups" sem critério de qualificação não termina nunca** — todo repositório tem melhoria infinita. Todo achado é classificado em UM dos três baldes, e a classificação é registrada:

| Balde | Definição | Destino |
|-------|-----------|---------|
| **A — Bloqueante** | Defeito **dentro** do escopo documentado (docs 01-04) desta feature | **Corrige AGORA**, no step em que apareceu. Regra já existente do Step 8 ("corrigir imediatamente, não apenas documentar"). Registra no ledger como `RESOLVIDO-NO-STEP` para rastro. |
| **B — Ciclo próprio** | Escopo **novo** que este trabalho **criou, tocou ou expôs como quebrado/incompleto** | Ledger `ABERTO` → resolvido no Gate de Convergência por um **`/method` completo próprio**. |
| **C — Fora do universo** | Pré-existente, **não tocado** por este trabalho, sem relação causal com ele | **Não é follow-up.** Ledger `DESCARTADO` + justificativa de uma linha. Auditável — não some em silêncio, e não trava o Gate. |

**Critério de B** ("criou, tocou ou expôs") é o mesmo do **perímetro** da refatoração contínua (`principios.md`) — o Step 7b e o `/solve` elevam o que está *dentro* do perímetro; o que este trabalho expôs *fora* dele vira ciclo próprio. Não é doutrina nova: é a mesma linha divisória vista dos dois lados.

**Violação de princípio é achado como qualquer outro.** Duplicação, responsabilidade misturada, abstração especulativa, acoplamento indevido (`principios.md`) entram na MESMA triagem: no código desta feature ou em arquivo que você abriu → **A**, corrige agora; exposta/agravada por este trabalho em código adjacente → **B**; pré-existente e intocada → **C** com justificativa. **YAGNI não é fundamento para C** — "não vou mexer porque não preciso" é exatamente o escape que a regra abaixo proíbe.

**Na dúvida entre B e C → B.** Custo de um ciclo a mais é baixo; ponta solta em produção é cara.

**Proibido usar C como escape.** "Isso já estava quebrado antes" só vale se este trabalho **não** passou por ali. Tocou no arquivo, mudou o comportamento, ou a feature depende daquilo → é B.

---

## Onde o ledger mora

Seção **`## Follow-ups`** no card `kanban/06-todo/<tópico>.md`.

Mesma mecânica do checklist `## Test Cases (QA)` (ver `06-todo.md`): superfície **viva**, semeada no Step 6, atualizada até o fim, e **copiada para `kanban/10-done/<tópico>.md` ANTES do card de to-do ser deletado**. O card some; o registro sobrevive no done.

**Achado nos Steps 1-5** (o card ainda não existe): fica na linha de follow-ups do Gateway Check do step e é **semeado no ledger no Step 6**, junto com o checklist de TCs.

### Formato

```markdown
## Follow-ups

| # | Achado | Detectado em | Balde | Status | Resolução |
|---|--------|--------------|-------|--------|-----------|
| F1 | Endpoint `/x` sem validação de payload | Step 8 | A | RESOLVIDO-NO-STEP | corrigido na iteração 2 do review |
| F2 | Modal de erro não tem i18n — exposto pelo novo fluxo | Step 9 | B | RESOLVIDO-POR-CICLO | ciclo F2 → `kanban/10-done/i18n-modal-erro.md` |
| F3 | `LegacyTable` usa `any` — arquivo não tocado nesta feature | Step 7b | C | DESCARTADO | pré-existente, sem relação causal; nenhum arquivo desta feature depende dele |
| F4 | Cache de sessão invalida cedo demais | Step 9 | B | **ABERTO** | — |
```

**Status possíveis:** `ABERTO` · `RESOLVIDO-NO-STEP` (balde A) · `RESOLVIDO-POR-CICLO` (balde B fechado) · `DESCARTADO` (balde C).

O ledger é também o **registro de dedup**: item já `RESOLVIDO-*` ou `DESCARTADO` **não reabre**. Sem isso o loop nunca converge — um achado rejeitado voltaria a cada passe.

---

## Gate de Convergência (entrada do Step 10)

Publicar no chat **antes de qualquer ação do Step 10** — antes do `rm` do card, antes do commit:

```markdown
## Gate de Convergência — Follow-ups
- Itens no ledger: **T** (A: **a** · B: **b** · C: **c**)
- Ciclos de follow-up executados: **N** — listar (Fn → `kanban/10-done/<f>.md`)
- Itens **ABERTOS**: **0**
- Itens novos detectados no último passe: **0** → **passe seco**
- **Veredicto: ✅ CONVERGIU** / ❌ BLOQUEADO — abertos: [listar Fn]
```

**❌ BLOQUEADO = PROIBIDO iniciar o Step 10.** Nem mover o card, nem commitar, nem escrever resumo de conclusão. Rode o ciclo `/method` de cada item aberto e **republique o Gate**.

**Passe seco** = uma varredura completa do ledger que encontra **zero itens `ABERTO`** E **zero itens novos** desde o passe anterior. Ciclo de follow-up que gera novo follow-up ⇒ o passe **não** foi seco ⇒ o loop continua.

Sem `✅ CONVERGIU` publicado no chat, o Gateway/Checklist Final do Step 10 não pode ser cumprido.

---

## Como rodar um ciclo de follow-up

Um item `ABERTO` (balde B) é resolvido por um **`/method` completo**, não por um remendo:

1. **Invoque o `/solve`** — mesmo padrão de qualidade (referência #1 do mercado).
2. **Steps 1 → 9 completos** para o item, com seus próprios artefatos (`docs/01-problem/<f>.md` … `kanban/09-run-test/<f>.md`), gateways publicados e Gate Check inicial. Tópico próprio, arquivos próprios — não enfie no `<tópico>` da feature-pai.
3. **Step 10 do ciclo — INTEIRO, MENOS O COMMIT.** Cria `kanban/10-done/<f>.md`, deleta `kanban/06-todo/<f>.md`, e para.
4. **Marca no ledger da feature-pai:** `RESOLVIDO-POR-CICLO` + link do done doc.
5. **Volta ao Gate de Convergência.**

### Ciclo aninhado NÃO commita

`10-done.md` manda `git add -A` + **um único commit**, e o código fica não-commitado até o Step 10. Se um ciclo aninhado commitasse, o `git add -A` dele varreria o código não-commitado da feature-pai para dentro do commit errado — quebrando os dois contratos.

> **Só o ciclo RAIZ commita.** Um único commit, no fim, cobrindo a feature + todos os ciclos de follow-up (código + docs de todos os tópicos + todos os cards de done + todas as remoções de to-do).

Mesmo precedente do `/todo`, que promove o card mas não commita (`10-done.md`, "Escopo do commit").

**Corrigir um item de balde B "direto no código", sem rodar o `/method` para ele, é PROIBIDO** — é escopo novo sem Gate Check, ou seja retrofit (Regra Inviolável 2).

---

## Rastreio em tasks

- **1 TaskCreate por ciclo de follow-up:** `"Follow-up F<n> — <achado>"`.
- `completed` somente quando o ciclo tiver `kanban/10-done/<f>.md` e o ledger marcar `RESOLVIDO-POR-CICLO`.
- A task de **Closeout** não pode completar com qualquer task de follow-up aberta.

---

## Racionalizações proibidas

| Frase | Realidade |
|-------|-----------|
| "Achei um bug lateral, abro card de follow-up" | Follow-up é débito com nome bonito. Balde B → ciclo `/method` agora. Card de follow-up é privilégio do **reviewer** (`/homolog` e `/prod`, via `prod/references/findings.md`), nunca saída do dev. BLOQUEADO. |
| "Resolvo o follow-up direto no código, sem rodar o `/method` pra ele" | Escopo novo sem Gate Check = retrofit (Regra 2). Ou é balde A (dentro do escopo documentado) ou vira ciclo próprio. BLOQUEADO. |
| "É escopo novo, YAGNI manda não fazer" | YAGNI mata complexidade **especulativa**, não achado **real**. Achado real que este trabalho expôs é B. BLOQUEADO. |
| "O ciclo de follow-up achou outro follow-up, isso não acaba nunca" | Acaba: o balde C fecha o que é pré-existente/não relacionado, e o ledger impede reabertura. O que não fecha é porque é real. BLOQUEADO. |
| "Documento a pendência no done doc, fica rastreado" | Documentar ≠ resolver. Done doc com pendência = protocolo não encerrou. BLOQUEADO. |
| "Só sobrou 1 item no ledger, é pequeno, fecho assim mesmo" | Gate é binário. 1 aberto = BLOQUEADO. |
| "Marco como C pra não travar o Gate" | Classificação errada de propósito = fraude documental. Na dúvida entre B e C → **B**. BLOQUEADO. |
| "Commito a feature e resolvo os follow-ups num commit depois" | Commit é o ÚLTIMO ato, depois da convergência. Dois commits = exatamente o que o Step 10 elimina. BLOQUEADO. |
| "O ciclo de follow-up é pequeno, rodo uma versão light do /method" | Não existe versão light (Categoria 9 de `rationalizations.md`). O ciclo roda 1→10 completo. BLOQUEADO. |
