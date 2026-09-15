# Step 11 — Check Follow-ups

**O protocolo fecha SECO.** Nada de "abro um card pra isso depois": todo achado que este trabalho criou, tocou ou expôs é resolvido **dentro desta execução**, e escopo novo se resolve **invocando o `/method`** para ele — ciclo completo.

**Chame e use:** `/solve` · `/principles` · `/front` (se tem UI) — os três via Skill tool · `rationalizations.md`

**A captura é contínua** (Steps 1 a 10 alimentam o ledger, e cada Gateway Check declara quantos achados o step produziu); **a resolução é aqui**. Capturar durante e resolver num ponto só preserva a esteira (`SKILL.md` § Não Pergunte Entre Steps): o achado não interrompe a feature, mas também não escapa.

```
Step 1 ──┐
  ...    │ captura contínua → kanban/11-follow-ups/<tópico>.md
Step 10 ─┘
   │
   ▼
STEP 11 — CHECK FOLLOW-UPS
   │
   ├─ item ABERTO no ledger?
   │     └─ SIM → /method completo (0→12, com /solve) para o item
   │              └─ esse ciclo alimenta o MESMO ledger
   │              └─ ciclo aninhado NÃO commita
   │              └─ volta ao Gate
   │
   └─ NÃO → passe seco → Gateway 11 → 12 libera o Done
```

## Artefato

`kanban/11-follow-ups/<tópico>.md` — o **ledger**: superfície viva, **semeada no Step 7** (To Do) com o que apareceu nos Steps 1-6, alimentada por todos os steps e fechada aqui. No Step 12 ela é **copiada para `kanban/12-done/<tópico>.md`** antes de o card de to-do ser deletado.

```markdown
# <Tópico> — Follow-ups

| # | Achado | Detectado em | Balde | Status | Resolução |
|---|--------|--------------|-------|--------|-----------|
| F1 | Endpoint `/x` sem validação de payload | Step 9 | A | RESOLVIDO-NO-STEP | corrigido na iteração 2 do review |
| F2 | Modal de erro não tem i18n — exposto pelo novo fluxo | Step 10 | B | RESOLVIDO-POR-CICLO | ciclo F2 → `kanban/12-done/i18n-modal-erro.md` |
| F3 | `LegacyTable` usa `any` — arquivo não tocado nesta feature | Step 8b | C | DESCARTADO | pré-existente, sem relação causal; nenhum arquivo desta feature depende dele |
| F4 | Cache de sessão invalida cedo demais | Step 10 | B | **ABERTO** | — |
```

**Status possíveis:** `ABERTO` · `RESOLVIDO-NO-STEP` (balde A) · `RESOLVIDO-POR-CICLO` (balde B fechado) · `DESCARTADO` (balde C).

O ledger é também o **registro de dedup**: item já `RESOLVIDO-*` ou `DESCARTADO` **não reabre**. Sem isso o loop nunca converge — um achado rejeitado voltaria a cada passe.

## Triagem — 3 baldes (é o que faz o loop convergir)

**"Zero follow-ups" sem critério de qualificação não termina nunca** — todo repositório tem melhoria infinita. Todo achado é classificado em UM dos três baldes, e a classificação é registrada:

| Balde | Definição | Destino |
|-------|-----------|---------|
| **A — Bloqueante** | Defeito **dentro** do escopo documentado (docs 01-06) desta feature | **Corrige AGORA**, no step em que apareceu. Regra já existente do Step 9 ("corrigir imediatamente, não apenas documentar"). Registra no ledger como `RESOLVIDO-NO-STEP` para rastro. |
| **B — Ciclo próprio** | Escopo **novo** que este trabalho **criou, tocou ou expôs como quebrado/incompleto** | Ledger `ABERTO` → resolvido **aqui**, por um **`/method` completo próprio**. |
| **C — Fora do universo** | Pré-existente, **não tocado** por este trabalho, sem relação causal com ele | **Não é follow-up.** Ledger `DESCARTADO` + justificativa de uma linha. Auditável — não some em silêncio, e não trava o Gate. |

**Critério de B** ("criou, tocou ou expôs") é o mesmo do **perímetro** da refatoração contínua (`principles/SKILL.md` § Refatoração contínua) — o Step 8b e o `/solve` elevam o que está *dentro* do perímetro; o que este trabalho expôs *fora* dele vira ciclo próprio. Não é doutrina nova: é a mesma linha divisória vista dos dois lados.

**Violação de princípio é achado como qualquer outro.** Duplicação, responsabilidade misturada, abstração especulativa, acoplamento indevido (`/principles`) entram na MESMA triagem: no código desta feature ou em arquivo que você abriu → **A**, corrige agora; exposta/agravada por este trabalho em código adjacente → **B**; pré-existente e intocada → **C** com justificativa. **YAGNI não é fundamento para C** — "não vou mexer porque não preciso" é exatamente o escape que a regra abaixo proíbe.

**Na dúvida entre B e C → B.** Custo de um ciclo a mais é baixo; ponta solta em produção é cara.

**Proibido usar C como escape.** "Isso já estava quebrado antes" só vale se este trabalho **não** passou por ali. Tocou no arquivo, mudou o comportamento, ou a feature depende daquilo → é B.

---

## Gate de Convergência (o gateway de saída deste step)

Publicar no chat — é o que libera o Step 12, antes do `rm` do card e antes do commit:

```markdown
## Gate de Convergência — Follow-ups
- Itens no ledger: **T** (A: **a** · B: **b** · C: **c**)
- Ciclos de follow-up executados: **N** — listar (Fn → `kanban/12-done/<f>.md`)
- Itens **ABERTOS**: **0**
- Itens novos detectados no último passe: **0** → **passe seco**
- **Veredicto: ✅ CONVERGIU** / ❌ BLOQUEADO — abertos: [listar Fn]
```

**❌ BLOQUEADO = PROIBIDO iniciar o Step 12.** Nem mover o card, nem commitar, nem escrever resumo de conclusão. Invoque o `/method` (Skill tool) para cada item aberto, rode o ciclo completo e **republique o Gate**.

**Passe seco** = uma varredura completa do ledger que encontra **zero itens `ABERTO`** E **zero itens novos** desde o passe anterior. Ciclo de follow-up que gera novo follow-up ⇒ o passe **não** foi seco ⇒ o loop continua.

Sem `✅ CONVERGIU` publicado no chat, o Step 12 não começa.

---

## Como rodar um ciclo de follow-up

Um item `ABERTO` (balde B) é resolvido por um **`/method` completo**, não por um remendo:

1. **Invoque o `/method`** — via **Skill tool** (`furi-build:method`; a forma curta `method` também resolve), para o item. Chamada real, não "seguir de memória": sem a invocação, o ciclo não começou. A primeira ação do `/method` é invocar o `/solve` — mesmo padrão de qualidade (referência #1 do mercado).
2. **Steps 0 → 11 completos** para o item, com seus próprios artefatos (`docs/01-problem/<f>.md` … `kanban/11-follow-ups/<f>.md`), gateways publicados e Gate Check inicial. Tópico próprio, arquivos próprios — não enfie no `<tópico>` da feature-pai.
3. **Step 12 do ciclo — INTEIRO, MENOS O COMMIT.** Cria `kanban/12-done/<f>.md`, deleta `kanban/07-todo/<f>.md`, e para.
4. **Marca no ledger da feature-pai:** `RESOLVIDO-POR-CICLO` + link do done doc.
5. **Volta ao Gate de Convergência.**

### Ciclo aninhado NÃO commita

`12-done.md` manda `git add -A` + **um único commit**, e o código fica não-commitado até o Step 12. Se um ciclo aninhado commitasse, o `git add -A` dele varreria o código não-commitado da feature-pai para dentro do commit errado — quebrando os dois contratos.

> **Só o ciclo RAIZ commita.** Um único commit, no fim, cobrindo a feature + todos os ciclos de follow-up (código + docs de todos os tópicos + todos os cards de done + todas as remoções de to-do).

**Corrigir um item de balde B "direto no código", sem rodar o `/method` para ele, é PROIBIDO** — é escopo novo sem Gate Check, ou seja retrofit (Regra Inviolável 2).

---

## Rastreio em tasks

- **1 TaskCreate por ciclo de follow-up:** `"Follow-up F<n> — <achado>"`.
- `completed` somente quando o ciclo tiver `kanban/12-done/<f>.md` e o ledger marcar `RESOLVIDO-POR-CICLO`.
- A task de **Closeout** não pode completar com qualquer task de follow-up aberta.

---

## Princípios neste step

- **YAGNI ao contrário** — YAGNI mata especulação, **não achado real**: "é escopo novo, então não faço" é a inversão que este step existe para impedir.
- **Motor** — achado que é "a mesma regra em dois lugares" não vira ciclo genérico: vira absorção no motor, dentro do escopo, se o perímetro alcança (balde A).
- **Refatoração** — o balde C fecha o que este trabalho **não** tocou; o que ele tocou está no perímetro e já devia ter subido no step em que apareceu.
- **KISS** — o ciclo do follow-up resolve **aquele** achado, não a área inteira em volta dele.

## Gateway 11 → 12

- [ ] **Gate de Convergência ✅ CONVERGIU** publicado no chat — zero itens `ABERTO`, zero itens novos no último passe
- [ ] Cada item de balde **B** fechado por ciclo `/method` próprio, com o done doc linkado no ledger
- [ ] Cada item de balde **C** com justificativa de uma linha registrada
- [ ] Artefato `kanban/11-follow-ups/<tópico>.md` atualizado com o ledger final
- [ ] As **quatro linhas obrigatórias** publicadas (`SKILL.md` § Gateway Check)

## Racionalizações proibidas

| Frase | Realidade |
|-------|-----------|
| "Achei um bug lateral, abro card de follow-up" | Follow-up é débito com nome bonito. Balde B → ciclo `/method` agora. Card de follow-up é privilégio de **quem revisa de fora**, nunca saída do dev. BLOQUEADO. |
| "Deixo anotado no relatório e sigo" | Relatório **documenta**; ledger **obriga a resolver**. Anotar sem entrar no ledger = a ponta escapou. BLOQUEADO. |
| "Resolvo o follow-up direto no código, sem rodar o `/method` pra ele" | Escopo novo sem Gate Check = retrofit (Regra 2). Ou é balde A (dentro do escopo documentado) ou vira ciclo próprio. BLOQUEADO. |
| "Rodo o ciclo de follow-up de cabeça, sem invocar o `/method`" | Mencionar não é invocar. O ciclo começa com a chamada da skill via Skill tool — sem ela não há Gate Check nem gateways, só retrofit. BLOQUEADO. |
| "É escopo novo, YAGNI manda não fazer" | YAGNI mata complexidade **especulativa**, não achado **real**. Achado real que este trabalho expôs é B. BLOQUEADO. |
| "O ciclo de follow-up achou outro follow-up, isso não acaba nunca" | Acaba: o balde C fecha o que é pré-existente/não relacionado, e o ledger impede reabertura. O que não fecha é porque é real. BLOQUEADO. |
| "Documento a pendência no done doc, fica rastreado" | Documentar ≠ resolver. Done doc com pendência = protocolo não encerrou. BLOQUEADO. |
| "Só sobrou 1 item no ledger, é pequeno, fecho assim mesmo" | Gate é binário. 1 aberto = BLOQUEADO. |
| "Marco como C pra não travar o Gate" | Classificação errada de propósito = fraude documental. Na dúvida entre B e C → **B**. BLOQUEADO. |
| "Commito a feature e resolvo os follow-ups num commit depois" | Commit é o ÚLTIMO ato, depois da convergência. Dois commits = exatamente o que o Step 12 elimina. BLOQUEADO. |
| "O ciclo de follow-up é pequeno, rodo uma versão light do /method" | Não existe versão light (Categoria 9 de `rationalizations.md`). O ciclo roda 0→12 completo. BLOQUEADO. |
| "Bug conhecido, seguimos e o usuário decide depois" | Achado real de balde B não vira "bug conhecido". Vira ciclo. BLOQUEADO. |
