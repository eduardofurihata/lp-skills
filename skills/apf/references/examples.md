# APF Examples — Worked Cases

Exemplos completos do método em ação. Mostram fluxo dinâmico (análise inicial → ≤7 perguntas → inferência → cálculo) com saídas finais no formato §7 da methodology.

## Exemplos

Os exemplos mostram o **fluxo real** de uma entrevista dinâmica: análise inicial, pergunta gerada, resposta, análise atualizada, próxima pergunta. Não há roteiro prescrito.

### 1.  Exemplo Greenfield

**Input do usuário:**
> "Quero um app pra dono de pet anotar consultas, vacinas e remédios. Vou cobrar uma assinatura mensal e mandar lembretes por e-mail."

---

**Análise inicial da IA (sem perguntar nada ainda):**

Lendo o input:
- Domínio inferível: petcare individual (B2C).
- ILFs candidatos: Pet, Dono, Consulta, Vacina, Remédio, Assinatura (6).
- EIFs candidatos: gateway de pagamento (assinatura), provider de email (lembretes).
- Workflow implícito: "lembretes" = automação (cron) → +EOs.
- Faixa inicial estimada: 130–280 PF.

Lacunas principais (ranqueadas por |Δ PF|):
1. Escopo / perfis — uso pessoal único? múltiplos donos no mesmo app? veterinário também acessa? **(impacto enorme)**
2. Lembretes automáticos ou manuais? — define se há cron/EO automatizado.
3. Audit/compliance? — domínio saúde frequentemente exige.
4. Dashboard analítico? — saúde do pet ao longo do tempo é caso comum.
5. Integrações além de pagamento+email — mapa pra clínicas, login Google?
6. Estrutura de Pet — só dados básicos ou prontuário rico?

---

**Pergunta 1** (IA escolhe escopo/perfis — maior incerteza, molda tudo):

> "Esse app é só pro seu uso pessoal com seu pet, ou você pretende vender pra outros donos cadastrarem os pets deles?"

Resposta: "vou vender pra outros donos, cada um com sua conta"

*Análise atualizada:* SaaS B2C com tenant por usuário. Mas dentro do app, 1 perfil só (dono). Sem multi-perfil. Faixa: 150–230 PF.

---

**Pergunta 2** (IA escolhe workflow/automação):

> "Os lembretes de vacina/remédio são disparados automaticamente pelo sistema, ou o dono cria cada um manualmente?"

Resposta: "automáticos — sistema lembra com base nas datas"

*Análise atualizada:* Cron + EOs automáticos. +1 ILF Lembrete (cron schedule) + 1 EO automático. Faixa: 160–230 PF.

---

**Pergunta 3** (IA escolhe dashboard — adicional grande potencial):

> "O dono vai querer ver gráficos ou histórico visual da saúde do pet (peso ao longo do tempo, calendário, etc)?"

Resposta: "não, só lista das próximas vacinas/remédios"

*Análise atualizada:* Sem Q6/dashboard. Apenas EQs simples (listas). Faixa estreita: 160–200 PF.

---

**Pergunta 4** (IA escolhe audit/compliance):

> "Precisa guardar histórico de quem editou o quê, ou pode sobrescrever direto?"

Resposta: "pode sobrescrever, é só pessoal"

*Análise atualizada:* Sem audit. Sem +ILF Audit. Faixa: 160–185 PF.

---

**Pergunta 5** (IA escolhe estrutura de entidade central):

> "Quando você anota uma consulta, é uma ficha rica (sintomas, exames, anexos) ou só data + médico + observação?"

Resposta: "só data + clínica + observação curta"

*Análise atualizada:* Consulta = Low confirmado. Provavelmente todos os ILFs são Low. Faixa: 175–185 PF.

---

**Critério de parada (§3.5):** faixa de PF estreitou para ±5%; lacunas grandes resolvidas; próxima pergunta plausível teria |Δ PF| < 10. **Encerrar com 5 perguntas (de 7 disponíveis).**

---

**Inferência final:**

ILFs descobertos:
- Pet (~10 DETs, 1 RET, Low → 7)
- Dono (~12 DETs, 1 RET, Low → 7)
- Consulta (~15 DETs, 1 RET, Low → 7) — confirmado simples na P5
- Vacina (~8 DETs, 1 RET, Low → 7)
- Remédio (~10 DETs, 1 RET, Low → 7)
- Assinatura (~12 DETs, 1 RET, Low → 7)
- Lembrete (~8 DETs, 1 RET, Low → 7) — adicionado após P2
- Total ILFs: 7 × 7 = **49 PF**

EIFs:
- Gateway pagamento (~15 DETs, 1 RET, Low → 5)
- SMTP/Email (~5 DETs, 1 RET, Low → 5)
- Total EIFs: 2 × 5 = **10 PF**

EIs (inferidos por padrão CRUD + R10 auth):
- 21 CRUD (3 por ILF × 7 ILFs), todos Low (DETs poucos, 1 FTR) = 21 × 3 = 63 PF
- 1 EI Recover senha (R10) = 3 PF
- Total EIs: 22 × 3 = **66 PF**

EOs:
- Lembrete email automático (~5 DETs, 2 FTRs Remédio+Pet, Low → 4) — confirmado P2
- Recibo assinatura (~8 DETs, 2 FTRs, Low → 4)
- Email recover senha (~3 DETs, 1 FTR, Low → 4)
- Total EOs: 3 × 4 = **12 PF**

EQs:
- Ver detalhe + listar × 7 ILFs = 14 EQs Low (3 cada) = 42 PF
- Login (R10) = 3 PF
- Total EQs: 15 × 3 = **45 PF**

**PF total: 49 + 10 + 66 + 12 + 45 = 182 PF**

**Confiança: Alto** (5 perguntas cobriram lacunas principais; inferências fundamentadas em sinais textuais + respostas).

**Output final:**

```markdown
## Contagem APF/IFPUG

**PF total: 182** (IFPUG Detailed, UFP, ISO/IEC 20926:2009 / CPM 4.3.1)
**Confiança: Alto**
**Modo: Greenfield Detailed**

### Inventário descoberto

**ILFs (7):** Pet, Dono, Consulta, Vacina, Remédio, Assinatura, Lembrete
**EIFs (2):** Gateway pagamento, SMTP
**EIs (22):** CRUD × 7 entidades + Recover senha
**EOs (3):** Lembrete email automático, Recibo assinatura, Email recover senha
**EQs (15):** Ver/Listar × 7 + Login

### Resumo por tipo

| Tipo | Low | Avg | High | Subtotal PF |
|---|---|---|---|---|
| ILF | 7 | 0 | 0 | 49 |
| EIF | 2 | 0 | 0 | 10 |
| EI | 22 | 0 | 0 | 66 |
| EO | 3 | 0 | 0 | 12 |
| EQ | 15 | 0 | 0 | 45 |
| **PF total** | | | | **182** |

### Perguntas feitas (5 de 7)

1. Escopo/perfis → resposta: "vendido pra outros donos, 1 perfil só"
2. Lembretes automáticos? → resposta: "sim"
3. Dashboard? → resposta: "não, só listas"
4. Audit/histórico? → resposta: "pode sobrescrever"
5. Consulta é rica? → resposta: "simples"

**Encerramento antes de 7:** faixa estreitou para ±5%; próximas perguntas plausíveis teriam impacto < 10 PF.

### Inferências aplicadas

- Todas as 7 entidades classificadas Low por sinais consistentes (P5 confirmou Consulta simples; demais inferidas).
- 21 EIs CRUD inferidos como Low (padrão R4: poucos DETs, 1 FTR cada).
- Login + Recover senha inferidos via R10.
- 1 RET para todas as entidades (sinais de subgrupo ausentes).

### Análise de sensibilidade — top 3

| Mudança hipotética | Δ PF | Premissa atual |
|---|---|---|
| Adicionar dashboard com gráficos | +35 PF | Sem dashboard (P3) |
| Adicionar auditoria completa | +20 PF | Pode sobrescrever (P4) |
| Consulta vira Avg (sintomas+exames como subgrupos) | +5 PF | Consulta Low (P5) |
```

---

### 2.  Exemplo Brownfield

**Input do usuário:**
> "No projeto em /home/furihata/GitHub/petcare-saas, quero adicionar feature de plano de saúde do pet — o tutor pode contratar planos com cobertura de consultas e vacinas, e o sistema controla o que está dentro/fora do plano."

---

**Análise inicial da IA:**

PASSO 1: Brownfield (caminho explícito + "adicionar feature").

PASSO 2 (inspeção): IA usa Read/Glob em `petcare-saas`. Schema Prisma identifica:
- ILFs existentes: Tenant, User, Pet, Owner, Consultation, Vaccine, Medication, Subscription
- EIFs existentes: Stripe, SendGrid (em `package.json`)

PASSO 3 (análise do delta):
- Domínio: extensão SaaS petcare existente.
- ILFs novos candidatos: Plano (catálogo), Cobertura (relação plano-procedimento), Contrato-Plano (instância).
- "Controla o que está dentro/fora" → +EQ Verificar cobertura.
- "Contratar" → +EI; provavelmente workflow (ativo/cancelado/suspenso).
- Faixa inicial delta: 60–160 PF.

Lacunas principais:
1. Audit/compliance — saúde + financeiro = forte sinal.
2. Workflow do contrato — quantos status?
3. Pagamento reusa Stripe ou novo? — afeta EIFs.
4. Verificar cobertura é apenas consulta ou bloqueia ação?
5. Dashboard de cobertura/utilização?

---

**Pergunta 1** (IA escolhe verificação de cobertura — define EQ central):

> "Quando o tutor agenda consulta/vacina, o sistema verifica se está coberta automaticamente, ou só registra e quem checa é o admin depois?"

Resposta: "sistema verifica e bloqueia se não está coberta"

*Análise atualizada:* +1 EQ Avg "Verificar cobertura" (cruza Cobertura+Plano+Procedimento). EI Agendar existente recebe +DETs (status coberto/não), mas não conta como novo. Faixa: 70–160 PF.

---

**Pergunta 2** (IA escolhe audit — domínio saúde+financeiro):

> "Precisa guardar histórico de mudanças nos contratos (quem alterou, quando, valor anterior) por compliance?"

Resposta: "sim, auditoria completa — saúde do pet é sensível"

*Análise atualizada:* +1 ILF Audit Avg (~25 DETs, 2 RETs) + 2 EOs (relatório, export) = +20 PF. R6 aplicada. Faixa: 90–160 PF.

---

**Pergunta 3** (IA escolhe workflow do contrato):

> "Contrato pode ter quantos estados? Só ativo/cancelado, ou também suspenso, atrasado, em renovação?"

Resposta: "ativo, suspenso, cancelado — com motivo diferente cada"

*Análise atualizada:* 3 transições de status = 3 EIs distintos (criar/contratar, cancelar, suspender). Cada um cruza Contrato + Owner + Audit = 3 FTRs. Suspender e Cancelar = Avg. Contratar (lê Plano+Cobertura+Owner, grava Contrato+Audit, 5 FTRs) = High. Faixa: 95–135 PF.

---

**Pergunta 4** (IA escolhe pagamento — define EIF novo ou reuso):

> "O pagamento do plano usa o Stripe que já existe (cartão recorrente) ou é avulso/PIX?"

Resposta: "Stripe recorrente, mesmo do existente"

*Análise atualizada:* Zero novos EIFs. Cobrança é estendida no fluxo existente (não conta como novo). Faixa: 95–125 PF.

---

**Pergunta 5** (IA escolhe dashboard — última grande lacuna):

> "Admin precisa de painel com métricas (taxa de utilização, churn, contratos ativos por plano), ou só lista simples por enquanto?"

Resposta: "só lista por enquanto"

*Análise atualizada:* Sem dashboard. Apenas EQs simples (listar contratos, listar planos). Faixa: 95–115 PF.

---

**Critério de parada:** faixa apertada (~±10%); 5 lacunas grandes resolvidas. **Encerrar com 5 perguntas.**

---

**Inferência final do delta:**

ILFs novos:
- Plano (~12 DETs, 1 RET, Low → 7) — catálogo simples
- Cobertura (~8 DETs, 1 RET, Low → 7) — relação binária
- Contrato-Plano (~18 DETs, 2 RETs — dados + histórico de status, Avg → 10) — confirmado workflow rico em P3
- Audit (~25 DETs, 2 RETs, Avg → 10) — confirmado P2
- Total: 2 Low + 2 Avg = 14 + 20 = **34 PF**

EIFs novos: **0** (Stripe reusado, P4).

EIs novos:
- CRUD Plano (3 Low: 1 FTR cada) = 9
- CRUD Cobertura (3 Low: 1 FTR cada) = 9
- Contratar (~10 DETs, 5 FTRs Plano+Cobertura+Owner+Contrato+Audit, High → 6)
- Cancelar Contrato (~5 DETs, 3 FTRs Contrato+Owner+Audit, Avg → 4)
- Suspender Contrato (~5 DETs, 3 FTRs, Avg → 4)
- Total: 6 Low + 2 Avg + 1 High = 18 + 8 + 6 = **32 PF**

EOs novos:
- Notif contrato aprovado (~6 DETs, 2 FTRs, Low → 4)
- Notif cancelamento (~6 DETs, 2 FTRs, Low → 4)
- Relatório auditoria (~15 DETs, 3 FTRs Audit+Contrato+User, Avg → 5)
- Export auditoria (~20 DETs, 3 FTRs, Avg → 5)
- Total: 2 Low + 2 Avg = 8 + 10 = **18 PF**

EQs novos:
- Ver Plano, Listar Planos (2 Low, 1 FTR cada) = 6
- Ver Cobertura, Listar Coberturas (2 Low) = 6
- Ver Contrato, Listar Contratos (2 Low) = 6
- Verificar cobertura (~5 DETs, 3 FTRs, Avg → 4) — confirmado P1
- Total: 6 Low + 1 Avg = 18 + 4 = **22 PF**

**PF delta total: 34 + 0 + 32 + 18 + 22 = 106 PF**

**Confiança: Alto** (Brownfield com inspeção bem-sucedida + 5 perguntas dirigidas + inferências fundamentadas).

**Output final:**

```markdown
## Contagem APF/IFPUG

**PF total (delta): 106** (IFPUG Detailed, UFP, ISO/IEC 20926:2009 / CPM 4.3.1)
**Confiança: Alto**
**Modo: Brownfield Detailed**

> Inventário existente: Tenant, User, Pet, Owner, Consultation, Vaccine, Medication, Subscription (ILFs); Stripe, SendGrid (EIFs). Conta apenas o delta da feature "Plano de saúde do pet".

### Inventário descoberto (delta)

**ILFs novos (4):** Plano, Cobertura, Contrato-Plano, Audit
**EIFs novos (0):** —
**EIs novos (9):** CRUD Plano (3), CRUD Cobertura (3), Contratar, Cancelar, Suspender
**EOs novos (4):** Notif aprovado, Notif cancelado, Relatório auditoria, Export auditoria
**EQs novos (7):** Ver/Listar Plano (2), Ver/Listar Cobertura (2), Ver/Listar Contrato (2), Verificar cobertura

### Resumo por tipo (delta)

| Tipo | Low | Avg | High | Subtotal PF |
|---|---|---|---|---|
| ILF | 2 | 2 | 0 | 34 |
| EIF | 0 | 0 | 0 | 0 |
| EI | 6 | 2 | 1 | 32 |
| EO | 2 | 2 | 0 | 18 |
| EQ | 6 | 1 | 0 | 22 |
| **PF total (delta)** | | | | **106** |

### Perguntas feitas (5 de 7)

1. Verificação de cobertura é automática? → "sim, bloqueia se não coberta"
2. Audit completa? → "sim, compliance saúde"
3. Quantos status do contrato? → "ativo, suspenso, cancelado"
4. Pagamento usa Stripe existente? → "sim"
5. Dashboard de cobertura? → "só lista"

**Encerramento antes de 7:** faixa apertada para ±10%; lacunas grandes resolvidas.

### Inferências aplicadas

- Plano e Cobertura inferidos Low (entidades de catálogo simples).
- Contrato-Plano = Avg pelo workflow rico confirmado em P3 (status + motivos).
- Audit = Avg via R6 confirmado em P2.
- Contratar = High por inferência: 5 FTRs cruzando entidades (lê 3, grava 2). Confirma sinal forte de combinação.
- Verificar cobertura = Avg (cruza 3 arquivos, P1). Borderline com Low.
- Stripe e SendGrid não contam (P4 confirmou reuso).

### Análise de sensibilidade — top 3

| Mudança hipotética | Δ PF | Premissa atual |
|---|---|---|
| Adicionar dashboard de cobertura/utilização | +35 PF | Sem dashboard (P5) |
| Auditoria com versionamento (rollback) | +18 PF | Auditoria completa (P2) |
| Verificar cobertura subir para High | +2 PF | Avg (P1) |
```

