# Gateways — Critérios Bloqueantes entre Steps

**Cada transição entre steps exige um Gateway Check explícito publicado no chat ANTES de iniciar o próximo step. Sem check visível = step não transitou.**

## Princípios (Ferro)

1. **Binário.** ✅ LIBERADO ou ❌ BLOQUEADO. Sem "quase", sem "mostly", sem "faço depois".
2. **Visível.** Publicado no chat ANTES de transitar. Gateway silencioso = não existe.
3. **Bloqueante.** ❌ → volta ao step atual e corrige. Nunca "pula pra arrumar depois".
4. **Atômico.** Não existe bypass granular. Pular 1 critério = pular o gateway. Ou 100% ou BLOQUEADO.
5. **Universal.** "Não se aplica nesta feature" não é opção. Justifique no veredicto ou cumpra.
6. **Sem ponta solta.** Todo Gateway Check declara os follow-ups detectados no step. O que apareceu vai para o **Ledger de Follow-ups** classificado (A/B/C) — nunca fica só na cabeça, nunca vira "depois". Ver `follow-ups.md`.
7. **Princípios em todo gateway.** Todo Gateway Check declara como **SRP · DRY · KISS · YAGNI · LoD** foram aplicados no step, pela lente daquele step (`principios.md`). Princípio não declarado = princípio não aplicado.

> Racionalizações para pular Gateway → ver `rationalizations.md` categoria 1, 3, 10 e 11.

## Formato Padrão (publicar em chat)

```markdown
## Gateway Check — Step N → Step N+1
- [ ] Artefato existe? (docs/XX-foo/<tópico>.md criado/atualizado com conteúdo substantivo)
- [ ] Critério específico 1 do gateway (ver tabela)
- [ ] Critério específico 2
- [ ] Critério específico 3
- **Princípios (SRP · DRY · KISS · YAGNI · LoD):** ✅ aplicados — [1 linha: o que a lente deste step cobrou — ver `principios.md`]
- **Follow-ups detectados neste step:** N (registrados no ledger, classificados A/B/C) / nenhum
- **Veredicto:** ✅ LIBERADO / ❌ BLOQUEADO — motivo: [listar critério falhado]
```

**Duas linhas são obrigatórias em TODO Gateway Check** — princípios e follow-ups. Elas existem pelo mesmo motivo: o que não é declarado escapa.

- **Follow-ups:** mecanismo de captura do loop de convergência. Detectou e não registrou = a ponta escapou. Nos Steps 1-5 o card de to-do ainda não existe: anote na linha do gateway e **semeie o ledger no Step 6**.
- **Princípios:** mecanismo que impede o protocolo de virar burocracia de artefato. Cada step tem sua **lente** (`principios.md` § Lente por step) — declare o que ela cobrou. "N/A" não existe: nada a corrigir → escreva o que você verificou e não encontrou. Violação achada → triagem A/B/C como qualquer achado.

## Tabela de Critérios (TODOS obrigatórios por linha)

| Gateway | Critérios específicos |
|---------|----------------------|
| **Gate Check inicial** | docs/01-problem/, docs/02-user-stories/, docs/03-use-cases/, docs/04-spec/ contêm doc cobrindo esta feature. Exibir visualmente no chat antes de qualquer código. |
| **1 → 2** | Problema em **1 frase clara**; quem é afetado identificado; **princípios:** KISS (cabe em 1 frase) · YAGNI (é o problema real, não o adjacente) · DRY (inventário checado — atualizou doc existente em vez de criar paralelo) |
| **2 → 3** | Stories cobrem todas as personas; formato "Como X, quero Y para Z"; **princípios:** SRP (1 story = 1 necessidade de 1 persona, sem "e também") · DRY (sem stories gêmeas) · YAGNI (toda story rastreia a uma persona do Step 1) |
| **3 → 4** | Use Cases derivados (ator × fluxo × estado); tabela de assinaturas única (sem duplicata); seção `## Verificação de Realidade` com cada passo do happy path mapeado a arquivo:linha OU 🔨 gap; **princípios:** SRP (1 UC = 1 combinação, sem agrupar) · YAGNI (todo UC rastreia a uma story) |
| **4 → 5** | Autonomous Decision Loop fechou com **zero gaps**; cada decisão tem justificativa + referência (padrão do projeto > big app > boa prática); escopo de plataforma (web/android/ios) **derivado** aqui, não declarado; **princípios:** cada decisão declara o **UC que a exige** (YAGNI) · decisão que replica mecanismo existente vira decisão de **reúso** (DRY) · fronteiras de módulo/camada explícitas (SRP) |
| **5 → 6** | Nota de complexidade (1-10) publicada e derivada dos Steps 3-4; **nº de TCs == nota e ≤ 10** (diverge → BLOQUEADO); **os TCs contemplam 100% dos UCs (Step 3) + detalhes do Step 4** (somatório das linhas `Cobre`, nada descoberto); nenhum TC redundante (significância); cada TC com **Bug único** + observável no front; Android E iOS = execução no Step 9, não TCs extras; **princípios:** SRP (1 TC = 1 bug único) · DRY (significância) · YAGNI (teto de 10) |
| **6 → 7a** | Tasks atômicas (1 prompt cada); cada task rastreável; dependências mapeadas; seção `## Follow-ups` semeada no card (com o que apareceu nos Steps 1-5, ou vazia); **princípios:** SRP (1 task = 1 responsabilidade) · DRY (task que recria o existente virou task de **reúso**) · YAGNI (toda task rastreia a UC/TC) |
| **7a → 7b** | Plano autocontido (contexto + estratégia + mapa TC→código + checklist); i18n planejado se projeto tem i18n; referência de big apps citada para decisões UI/UX; **seção `Reúso antes de criar` preenchida** (DRY — grep feito, arquivo novo só com justificativa); **seção `O que NÃO vamos construir` preenchida** (YAGNI — abstrações consideradas e descartadas); responsabilidade única declarada por arquivo do plano (SRP) |
| **7b → 8** | Todas tasks do checklist marcadas; tsc/lint passam; **checklist de princípios do 7b percorrido por arquivo aberto** (SRP >40 linhas · DRY · KISS · YAGNI · LoD · camadas · direção de dependências) — inclui "tocou = refatora"; TCs de regressão criados para features dependentes impactadas |
| **8 → 9** | Veredicto **APROVADO** em 8b; zero issues pendentes; **review percorreu os princípios um a um, por nome** (seção `## Análise de Qualidade` preenchida por princípio); achados fora de escopo do review classificados no ledger (A/B/C); PR existente atualizado (se houver) |
| **9 → 10** | Ver detalhado abaixo — TODOS TCs PASSED via front, evidência 1:1, último ciclo SEM mudanças de código |
| **Gate de Convergência** | Entrada do Step 10, ANTES de mover o card e do commit — ledger sem item `ABERTO` e zero itens novos no último passe (**passe seco**). Ver `follow-ups.md`. |

## Gateway 9 → 10 (Detalhado — o mais crítico)

**Pré-requisitos formais (ambos obrigatórios, publicados no chat ANTES deste Gateway):**

1. **Audit Pré-Execução** ✅ publicado (ratio M==N de TaskCreate individual antes de qualquer TC rodar). Ver `09-testing.md` seção "Audit Pré-Execução".
2. **Audit Pós-Execução** ✅ publicado (ratio C==N de completed + E==N de evidência). Ver `09-testing.md` seção "Audit Pós-Execução".

**Sem os dois audits publicados no chat com ✅, este Gateway não pode ser publicado.** Publicá-lo sem eles = violação automática.

| Critério | Verificação obrigatória |
|----------|-------------------------|
| Audit Pré-Execução publicado ✅? | Bloco visível no chat com ratio M==N confirmado antes do primeiro TC |
| Audit Pós-Execução publicado ✅? | Bloco visível no chat com C==N, E==N, status agregado 100% PASSED |
| Cada TC tem TaskCreate próprio? | Duas camadas: 1 TaskCreate por grupo + 1 TaskCreate por TC individual. Ambos obrigatórios. |
| Todos TCs executados via front? | Cada TC tem screenshot com path documentado em `kanban/09-run-test/` |
| Evidence count = TC count? | Reconciliação: Predicted N = Evidence M. Delta = 0 obrigatório |
| Zero NOT_RUN / SKIPPED / BLOCKED? | Nenhum TC sem status de execução real |
| Zero FAILED? | TODOS os TCs em PASSED |
| Zero mudanças no último ciclo? | Último passe = 100% PASSED SEM nenhum fix de código |
| Mobile: iOS + Android cobertos? | Toda feature mobile com evidência nas DUAS plataformas |
| Nenhum TC passou por workaround? | Todo fix aplicado no ciclo respeita os princípios (`principios.md`). TC que só passa violando SRP/DRY = **FAILED disfarçado**, não PASSED |

```markdown
## Gateway Check — Step 9 → Step 10
- Audit Pré-Execução publicado? ✅ SIM (link/referência ao bloco) / ❌ NÃO
- Audit Pós-Execução publicado? ✅ SIM (link/referência ao bloco) / ❌ NÃO
- TCs planejados: N
- Tasks de grupo criadas: G (✅ todos TCs cobertos por algum grupo)
- Tasks individuais criadas (1 por TC): N (✅ ratio 1:1)
- TCs executados com evidência: N (✅ delta = 0)
- Status: N PASSED, 0 FAILED, 0 NOT_RUN, 0 SKIPPED, 0 BLOCKED
- Último ciclo sem mudanças de código? ✅ SIM
- Mobile iOS + Android? ✅ SIM / N/A (escopo derivado do Step 4 confirma feature sem superfície mobile)
- **Princípios (SRP · DRY · KISS · YAGNI · LoD):** ✅ nenhum fix do ciclo passou por workaround — os fixes voltaram ao Step 8
- **Veredicto: ✅ LIBERADO para Step 10** / ❌ BLOQUEADO — motivo: [listar]
```

**Racionalizações proibidas para pular os audits:**

| Racionalização | Realidade |
|----------------|-----------|
| "Gateway já cobre tudo, audit é redundante" | NÃO. Audit = verificação intermediária obrigatória (antes e depois). Gateway = certificação final. BLOQUEADO sem audits. |
| "Faço o Gateway direto, os dois audits ficam implícitos" | NÃO. Audit implícito = audit inexistente. Cada um publicado visualmente. BLOQUEADO. |
| "Publico um audit só (combinado)" | NÃO. Dois audits distintos (antes + depois). BLOQUEADO. |

## Exceções (NÃO requer Gate Check inicial)

Apenas estes casos dispensam Gate Check. **Qualquer dúvida → Gate Check.**

- Bug fix trivial com escopo único-linha (typo visível, correção de literal exibida a usuário). Se envolve lógica, estado, condicional — NÃO é trivial.
- Refactor interno sem mudança de comportamento observável (rename, extract function sem alteração de output).
- Ajuste de configuração/infra (CI, env vars) que não toca código de produto.
- Pergunta sobre código sem alteração.

**NÃO são exceções:**
- "Demo" / "prova de conceito" / "só pra testar"
- "Feature trivial" / "é só plugar" / "1 botão"
- "Emergência" / "CEO pediu" / "prazo apertado"
- "Retrofit de código já escrito"
- "Componente já existe em outras telas"

Em dúvida: Gate Check. Custo é baixo, regressão é cara.

## Step 10 é terminal (sem gateway de saída) — mas tem gateway de ENTRADA

Não existe Step 11. O Step 10 (Done) não tem gateway de saída — seu encerramento usa o **Checklist Final** de `10-done.md`: card movido (`kanban/06-todo/` deletado) + **commit** na branch atual com SHA registrado. Esse commit vale **só para o `/method` completo** (`/fast`, `/todo` e ciclos de follow-up aninhados não commitam).

O que o Step 10 **tem** é um gateway de **entrada**: o **Gate de Convergência**. Antes de mover o card e antes do commit, o ledger de follow-ups precisa estar **seco** — zero itens `ABERTO`, zero itens novos no último passe. Item aberto → roda `/method` completo (1→10, com `/solve`) para ele → volta ao Gate. Bloco a publicar e regras completas: `follow-ups.md` e `10-done.md`.

**Publicar o Checklist Final sem o Gate de Convergência ✅ no chat = violação automática.**
