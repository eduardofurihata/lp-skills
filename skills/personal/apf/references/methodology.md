# Metodologia de Medição APF/IFPUG (ISO/IEC 20926)

## Sumário

1. [Fundamentação](#1-fundamentação)
2. [Glossário](#2-glossário)
3. [Pesos e fórmula](#3-pesos-e-fórmula)
4. [Árvore de decisão de classificação](#4-árvore-de-decisão-de-classificação)
5. [Regras de desempate](#5-regras-de-desempate)
6. [Modos de uso](#6-modos-de-uso)
7. [Formato de output](#7-formato-de-output)
8. [Limitações conhecidas](#8-limitações-conhecidas)
9. [Referências](#9-referências)

---

## 1. Fundamentação

Este sistema usa **IFPUG Function Point Analysis** padronizado pela **ISO/IEC 20926:2009** em modo **Detailed** (CPM 4.3.1) — o método tradicional puro, sem simplificações categóricas.

A escolha vem de:

- **Padrão internacional consolidado:** IFPUG existe desde 1986 e é o método de contagem mais usado no mundo. ISO 20926 formaliza o método como norma desde 2003.
- **Reprodutibilidade defensável:** o IFPUG CPM (Counting Practices Manual) 4.3.1 define regras objetivas para classificação de funções em Low/Avg/High via matrizes DET×RET (arquivos) e DET×FTR (transações). Duas pessoas treinadas chegam a contagens com variação ≤10%.
- **Calibração disponível:** o ISBSG (International Software Benchmarking Standards Group) mantém base com >10.000 projetos em PF, permitindo validação contra benchmarks reais.
- **Adoção no Brasil:** padrão de fato em contratos públicos (SERPRO, Dataprev, Receita Federal). Há volume grande de literatura e certificação CFPS reconhecida.
- **Captura especificidade do projeto:** ao classificar cada função pela sua estrutura real (DETs/RETs/FTRs), o método responde ao *seu* sistema específico, não a uma média de domínio.

**Por que Detailed e não Estimated?** NESMA Estimated (ISO 24570) aplica peso médio fixo a cada função, ignorando complexidade. Isso achata a sensibilidade ao projeto específico — um ILF "Categoria" (3 campos, 1 RET) pesa igual a um ILF "Prontuário" (50+ campos, 5+ RETs). Detailed preserva essa diferença via matrizes IFPUG.

**UFP (Unadjusted Function Points)** é a métrica final — sem aplicar VAF/GSC. O VAF requer 14 julgamentos subjetivos (escala 0-5) sobre características gerais do sistema, o que destrói reprodutibilidade quando o input é descrição curta. ISO 20926 reconhece UFP como métrica válida e suficiente.

**Por que sem multiplicadores externos?** Multiplicadores como "×1.20 por perfis", "+35 PF por dashboard", "+9 PF por mobile" não fazem parte do CPM 4.3.1. O método tradicional captura essas complexidades naturalmente nas funções descobertas — perfis adicionais aparecem como filtros em EQs, dashboards aparecem como EOs específicos com cálculo, mobile aparece como EI/EO de push token. Não há fator inventado fora da contagem de funções.

**Modo adaptativo:** o detalhamento exigido pelo Detailed (DETs/RETs/FTRs por função) tradicionalmente exige requisitos prontos e dias de discovery. Este sistema usa **entrevista conduzida por IA**: a próxima pergunta depende da resposta anterior, partindo do input bruto até completar a contagem. Reduz centenas de perguntas técnicas a 15-40 perguntas conversacionais, com inferência guiada (IA propõe defaults, usuário confirma ou ajusta).

---

## 2. Glossário

Termos com definições alinhadas ao IFPUG CPM 4.3.1 e ISO/IEC 20926:2009.

| Termo | Definição |
|---|---|
| **PF / FP** | Function Point / Ponto de Função. Unidade de tamanho funcional de software. |
| **UFP** | Unadjusted Function Points. Soma dos PF antes de aplicar VAF. Métrica primária do ISO/IEC 20926. |
| **ILF** | Internal Logical File. Grupo de dados logicamente relacionados, mantido pela aplicação medida. Ex: tabela `pedidos` que o app cria/altera. |
| **EIF** | External Interface File. Grupo de dados referenciado pela aplicação mas mantido por outra. Ex: tabela de feriados consumida via API; webhooks que a app processa mas não mantém. |
| **EI** | External Input. Processo elementar que altera um ILF a partir de dado externo. Ex: criar/editar/excluir um pedido. |
| **EO** | External Output. Processo elementar que envia dado para fora **com** transformação/cálculo/agregação. Ex: relatório de faturamento, dashboard com somas, e-mail com dados calculados, recibo, push de evento. |
| **EQ** | External Inquiry. Processo elementar que envia dado para fora **sem** transformação (apenas leitura/filtro). Ex: detalhe de produto, listagem com filtro, autocomplete, busca textual. |
| **DET** | Data Element Type. Campo único, não-recursivo, identificável pelo usuário em uma transação ou arquivo. Cada coluna de banco visível para o usuário conta 1 DET. Botões de ação contam como 1 DET adicional. Mensagens de erro coletivamente contam como 1 DET. |
| **RET** | Record Element Type. Subgrupo lógico de DETs dentro de um ILF/EIF. Ex: ILF "Pessoa Física" tem RET "Dados Principais" + RET "Endereços" (sub-lista) = 2 RETs. ILF puro sem subgrupos = 1 RET. |
| **FTR** | File Type Referenced. Quantidade de ILFs/EIFs distintos lidos ou alterados por um EI/EO/EQ. Ex: criar Pedido lê Cliente + Produto + Estoque e grava Pedido = 4 FTRs. |
| **Low / Avg / High** | Níveis de complexidade IFPUG. Determinados por matrizes DET×RET (arquivos) ou DET×FTR (transações) — ver §3.1. Cada nível tem peso PF distinto. |
| **VAF** | Value Adjustment Factor. Multiplicador 0.65–1.35 baseado em 14 GSCs. **Não usado neste sistema** (subjetivo). |
| **GSC** | General System Characteristic. Uma das 14 características avaliadas no VAF. **Não usadas.** |
| **Função elementar** | Menor unidade de processamento significativa para o usuário. Critério IFPUG: auto-contida + significativa + deixa o sistema em estado consistente. |
| **Modo Detailed** | Contagem IFPUG completa (CPM 4.3.1) com classificação Low/Avg/High via DETs/RETs/FTRs. **Modo default** deste sistema. |
| **Modo Indicative** | Modo de pré-proposta. Conta apenas ILFs/EIFs e aplica fórmula NESMA Indicative (ISO 24570): `PF ≈ 35 × ILFs + 15 × EIFs`. Usado SOMENTE quando o usuário pede explicitamente faixa rápida e aceita precisão ±50%. |
| **Greenfield** | Modo de uso para projeto novo. Input = descrição livre. IA conduz entrevista a partir do zero. |
| **Brownfield** | Modo de uso para feature em projeto existente. Input = descrição livre + caminho do projeto. IA inspeciona o projeto e conta apenas o delta. |
| **Entrevista adaptativa** | Protocolo conversacional onde a IA gera cada próxima pergunta com base nas respostas anteriores. Substitui questionários fixos. Estruturada em 3 fases: Descoberta → Classificação → Cálculo. |
| **Inferência guiada** | Quando a IA propõe um default para uma pergunta com base no input/contexto, e o usuário confirma ou ajusta. Reduz fadiga de perguntas sem perder precisão. |

---

## 3. Pesos e fórmula

### 3.1 Matrizes de complexidade (CPM 4.3.1)

A complexidade de cada função é determinada por matrizes oficiais IFPUG.

**Para ILFs e EIFs — matriz DET × RET:**

| RETs | 1-19 DETs | 20-50 DETs | 51+ DETs |
|---|---|---|---|
| 1 | Low | Low | Avg |
| 2-5 | Low | Avg | High |
| 6+ | Avg | High | High |

**Para EIs — matriz DET × FTR:**

| FTRs | 1-4 DETs | 5-15 DETs | 16+ DETs |
|---|---|---|---|
| 0-1 | Low | Low | Avg |
| 2 | Low | Avg | High |
| 3+ | Avg | High | High |

**Para EOs e EQs — matriz DET × FTR:**

| FTRs | 1-5 DETs | 6-19 DETs | 20+ DETs |
|---|---|---|---|
| 0-1 | Low | Low | Avg |
| 2-3 | Low | Avg | High |
| 4+ | Avg | High | High |

### 3.2 Pesos por tipo e complexidade

| Tipo | Low | Avg | High |
|---|---|---|---|
| **ILF** | 7 | 10 | 15 |
| **EIF** | 5 | 7 | 10 |
| **EI** | 3 | 4 | 6 |
| **EO** | 4 | 5 | 7 |
| **EQ** | 3 | 4 | 6 |

### 3.3 Fórmula final

```
PF_total = Σ (qtd_função × peso_complexidade)
```

**Exemplo concreto (sistema pequeno):**

| Função | Tipo | DETs | RETs/FTRs | Complexidade | Peso |
|---|---|---|---|---|---|
| Cliente | ILF | 12 | 2 RETs | Low | 7 |
| Pedido | ILF | 25 | 3 RETs | Avg | 10 |
| Produto | ILF | 8 | 1 RET | Low | 7 |
| Stripe webhooks | EIF | 15 | 1 RET | Low | 5 |
| Cadastrar cliente | EI | 12 | 1 FTR | Low | 3 |
| Finalizar pedido | EI | 18 | 4 FTRs | High | 6 |
| Listar produtos | EQ | 6 | 1 FTR | Low | 3 |
| Relatório vendas mês | EO | 8 | 2 FTRs | Avg | 5 |

PF_total = 7+10+7+5+3+6+3+5 = **46 PF**

### 3.4 Não aplicar fatores adicionais

- **Sem VAF:** UFP é a métrica final.
- **Sem multiplicadores por perfis:** complexidade de roles é absorvida nas próprias funções (telas distintas geram EQs distintas; permissões granulares aumentam DETs de transações).
- **Sem adições fixas por canal/integração:** cada canal/integração descoberto vira função(ões) classificada(s) pela matriz.
- **Sem multiplicador por profundidade (CRUD/workflow/automação):** transações de workflow têm naturalmente mais FTRs e DETs, sendo classificadas mais altas pela matriz.

Cada complexidade adicional do sistema aparece nas funções descobertas durante a Fase 1 da entrevista, não em fatores inventados aplicados sobre o total.

---

## 4. Árvore de decisão de classificação

Para cada **função descoberta** (item de dados ou transação) durante a contagem, aplicar a árvore abaixo na ordem. A primeira regra que casa, decide. **Não pular**, **não combinar julgamentos** — é determinístico por design.

### 4.1 Classificar uma estrutura de dados (ILF vs EIF)

```
P1: A aplicação medida CRIA, ATUALIZA ou EXCLUI registros desta estrutura?
  └─ SIM  → ILF
  └─ NÃO → P2

P2: A aplicação LÊ ou REFERENCIA esta estrutura, mas outra aplicação a mantém?
  └─ SIM  → EIF
  └─ NÃO → não é ILF nem EIF (não conta)
```

**Regras complementares (CPM 4.3.1 §5):**

- "Mantida" significa que o app pode realizar EIs sobre ela (não basta replicar dado para cache).
- Se o app **só lê** uma tabela mantida no próprio banco mas escrita por outro serviço/módulo separado: **EIF**.
- Tabelas de referência (estados, países, CEPs) que o app só consulta sem manter: **EIF**.
- Tabelas auxiliares puramente técnicas (sessions, cache, queue jobs) que **não são identificáveis pelo usuário**: **não contam**.

### 4.2 Classificar uma transação (EI vs EO vs EQ)

```
P3: A transação ALTERA pelo menos um ILF (gravação)?
  └─ SIM  → EI
  └─ NÃO → P4

P4: A transação envia dado para fora COM transformação, cálculo, fórmula, agregação OU
    causa mudança de comportamento do sistema (ex: trigger, webhook, e-mail com dado calculado)?
  └─ SIM  → EO
  └─ NÃO → P5

P5: A transação envia dado para fora SEM transformação significativa
    (ex: leitura/filtro/listagem/busca/detalhe)?
  └─ SIM  → EQ
  └─ NÃO → não é função elementar (não conta)
```

**Regras complementares:**

- "Cálculo" inclui: soma, média, contagem agregada, conversão de moeda/unidade, formatação derivada (ex: "12 dias atrás"), classificação por regra de negócio.
- Filtros simples (WHERE/ORDER BY) **não** são cálculo → EQ.
- Concatenação de string básica (nome+sobrenome) **não** é cálculo → EQ.
- Joins/agregações em SQL para o resultado da consulta (ex: SUM, COUNT GROUP BY) **são** cálculo → EO.
- Send de e-mail/SMS/push automático após uma transação é uma **EO independente** (não é parte do EI gatilho).
- Listagem com **paginação derivada** (total de itens, página atual com cálculo) ainda é EQ — paginação é mecânica, não regra de negócio.

### 4.3 Identificar função elementar

Antes de classificar, confirmar que é função elementar — critérios IFPUG:

1. **Auto-contida:** o usuário considera a função completa por si só.
2. **Significativa:** tem valor de negócio reconhecível pelo usuário (não é detalhe técnico).
3. **Estado consistente:** ao final, o sistema fica em estado válido.

Se passa nos 3 → conta. Se falha em algum → não conta como função separada (ou agregar a uma maior).

---

## 5. Regras de desempate

Quando a árvore de decisão deixa ambiguidade, **sempre** aplicar a regra abaixo. Não improvisar.

### R1 — Em dúvida entre EO e EQ: escolher **EQ**

Justificativa: EQ tem peso menor (4 vs 5). Estimativa conservadora minimiza superdimensionamento. Quando o cálculo for marginal (formatação leve, "agora" vs timestamp), tratar como EQ.

### R2 — Em dúvida sobre múltiplos ILFs: **agrupar em 1 ILF**

Aplicação: se duas estruturas têm forte coesão lógica e são tratadas como "uma coisa só" pelo usuário (ex: Pedido + Itens do Pedido; Post + Tags do Post), conta-se **1 ILF** (a unidade primária; a outra é vista como RET ou sub-grupo).

Critério: a entidade secundária só faz sentido no contexto da primária? Sim → 1 ILF. Não → 2 ILFs.

### R3 — Em dúvida sobre múltiplos EIs no mesmo fluxo: **separar por intenção do usuário**

Critério: cada **intenção autônoma** do usuário é 1 EI. "Cadastrar produto" = 1 EI. "Cadastrar produto + adicionar foto" = 1 EI (mesma intenção). "Cadastrar produto" + "Atualizar estoque" = 2 EIs (intenções diferentes).

### R4 — CRUD básico: **contar 3 EIs (Create, Update, Delete) e 2 EQs (Read detail, Read list)**

Padrão para qualquer entidade com CRUD completo. Ajustar para baixo se input indicar:
- Sem Delete (apenas inativação) → 3 EIs (sendo o Update incluindo soft-delete)
- Sem List → 4 EIs e 1 EQ
- Read-only → 0 EIs, 2 EQs

### R5 — Notificação automática (e-mail, SMS, push, webhook): **conta como 1 EO independente** por canal

Mesmo que disparada como side-effect de um EI, é uma função elementar separada (gera output processado para fora).

### R6 — Auditoria/log: classificação por nível descoberto

Se durante a Fase 1 da entrevista o usuário confirmar que o sistema precisa de histórico/auditoria, classificar conforme o nível:

- **Sem histórico** (sobrescreve em mudança) → 0 PF de auditoria.
- **Histórico básico** (quem fez, quando) → +1 ILF "Log" (geralmente Low: poucos campos, 1 RET) + 1 EQ (consulta de log).
- **Auditoria completa** (quem, quando, o que mudou, valor anterior) → +1 ILF "Audit" (geralmente Avg: campos de antes/depois, 1-2 RETs) + 1-2 EOs (relatório de auditoria com filtro/agregação, export).
- **Versionamento** (versões antigas acessíveis) → +1 ILF "Version" (Avg-High dependendo da granularidade) + 1 EI (rollback) + 1 EQ (ver versão).

Cada função adicionada é classificada Low/Avg/High pela matriz §3 a partir dos DETs/RETs/FTRs reais — não há peso fixo por escolha de auditoria.

### R7 — Multi-tenant: +1 ILF Tenant + impacto em FTRs

Se o input ou inspeção do projeto (Brownfield) indicar isolamento entre clientes empresa (multi-tenant SaaS B2B), adicionar 1 ILF "Tenant" — geralmente Low (poucos campos: nome, slug, plano, status, configurações).

Adicionalmente, multi-tenant aumenta o FTR das transações principais (toda EI/EO/EQ relevante passa a referenciar o Tenant para isolamento). Esse aumento muda a classificação na matriz DET×FTR — sem fator inventado.

Não confundir com perfis de acesso (admin/cliente/operador), que são tratados via funções distintas (telas/relatórios separados quando há diferença real).

### R8 — Relatório com múltiplos filtros mas sem cálculo agregado: **EQ**, não EO

Filtrar e ordenar não é processamento. Mesmo com 10 filtros, ainda é EQ.

### R9 — Importação/exportação de dados (CSV, Excel, JSON): **1 EI (importar) + 1 EO (exportar com formatação/cálculo)**

Se a exportação for raw dump sem formatação → EQ.

### R10 — Login/logout/recuperação de senha: contar de forma padrão (auth)

- Cadastro de usuário: 1 EI sobre ILF Usuário
- Login: 1 EQ (sem alterar ILF) — exceto se gravar última-sessão, aí é EI
- Logout: 0 (mecânico)
- Recuperar senha: 1 EI (gerar token + altera ILF) + 1 EO (e-mail com link)
- Alterar senha: 1 EI

---

## 6. Modos de uso

### 6.1 Greenfield Detailed adaptativo (default)

**Quando:** o input é descrição de algo a construir, sem código existente.

**Procedimento — entrevista dinâmica de até 7 perguntas:**

1. **Análise inicial** (sem perguntar nada): IA lê o input, infere domínio, ILFs/EIFs candidatos, sinais de workflow/audit/integração, calcula faixa inicial de PF possível.

2. **Loop de até 7 perguntas** (`prompt-contagem.md` §3):
   - A cada turn, IA escolhe a dimensão com maior `incerteza × impacto |Δ PF|` ainda não investigada (§3.3 do prompt).
   - Formula a pergunta na hora, em linguagem natural, **gerando dinamicamente** (sem template).
   - Chama `AskUserQuestion` com **exatamente 1 pergunta** (nunca array com múltiplas).
   - Recebe resposta, atualiza modelo mental do sistema, recalcula incertezas.
   - Decide parar (§3.5 do prompt) ou continuar.
   - **Hard limit: 7 perguntas acumuladas. Pode parar antes.**

3. **Inferência final**: a partir do input + ≤7 respostas, IA infere lista completa de funções e classifica DETs/RETs/FTRs por função (§3.6 do prompt). Cada inferência é fundamentada em sinal textual ou resposta específica.

4. **Cálculo**: `PF_total = Σ (qtd × peso)` via matriz §3 desta metodologia. UFP puro, sem multiplicadores.

**Confiança esperada (ver §6.4):** geralmente **Médio** (mistura de respostas diretas + inferências). **Alto** quando o input é rico e as 7 perguntas cobrem dimensões grandes. **Baixo** quando input é muito vago e usuário responde poucas perguntas.

### 6.2 Brownfield Detailed adaptativo

**Quando:** input contém caminho de pasta OU pista clara de "adicionar a sistema X" / "feature em Y" / o working dir tem `package.json`, `pyproject.toml`, `go.mod`, etc.

**Procedimento de inspeção do projeto** (antes da entrevista):
1. Inspecionar stack: `package.json` / `requirements.txt` / `go.mod` / `Cargo.toml` / `pom.xml` / `Gemfile`.
2. Inspecionar schemas/migrations:
   - Prisma: `schema.prisma` ou `prisma/migrations/`
   - TypeORM/Sequelize: `entities/` ou `models/`
   - Django: `*/models.py`
   - Rails: `db/schema.rb` ou `db/migrate/`
   - Raw SQL: `migrations/` ou `sql/`
3. Inspecionar rotas/controllers:
   - Express/Koa/NestJS: `routes/` ou `controllers/`
   - Django: `urls.py` + `views.py`
   - Rails: `config/routes.rb` + controllers
4. Inspecionar dependências externas para EIFs já consumidos: stripe, sendgrid, twilio, auth0, firebase, etc.

**Inventário existente** (interno, antes da entrevista):
- ILFs já existentes (entidades com CRUD detectado nos models)
- EIFs já consumidos (SDKs identificados)
- Transações já implementadas (rotas/handlers)

**Procedimento de contagem do delta:**
1. Aplicar entrevista dinâmica de até 7 perguntas (igual a §6.1) **restrita ao escopo da nova feature**. A análise inicial inclui o inventário existente para evitar perguntas redundantes.
2. Para cada nova função, classificar via matriz §3 com DETs/RETs/FTRs **inferidos** das respostas + contexto.
3. Funções que apenas estendem entidades existentes (ex: novo campo em Cliente) NÃO contam como novas — só contariam se a complexidade aumentou ao ponto de mudar o ILF Cliente de Low → Avg, e nesse caso contar o delta de peso (10 − 7 = 3 PF).
4. Soma direta do delta.

**Confiança esperada (ver §6.4):** geralmente **Alto** quando inspeção foi bem-sucedida (a IA já tem 50% do contexto antes da entrevista) + entrevista cobriu dimensões grandes do delta.

### 6.3 Modo Indicative (atalho de pré-proposta)

**Quando usar:** o usuário PEDE explicitamente faixa rápida (estimativa preliminar de roadmap, pré-proposta comercial), aceitando precisão menor (±50%).

**Procedimento:**
1. Fase 1 abreviada: IA identifica apenas ILFs e EIFs do input (sem detalhar transações nem complexidade).
2. Aplicar fórmula NESMA Indicative (ISO/IEC 24570:2018, §6.4): `PF ≈ 35 × qtd_ILFs + 15 × qtd_EIFs`.
3. A fórmula assume CRUD padrão por entidade (~3 EIs + 2 EQs típicos por ILF, ~1 EQ + 1 EO típicos por EIF, com pesos médios).
4. Declarar Confiança Baixa por design — modo é uma aproximação intencional.
5. Sugerir ao usuário rodar Detailed adaptativo (§6.1 ou §6.2) quando precisão importar.

**Output Indicative simplificado:**

```markdown
## Contagem APF/IFPUG (modo Indicative)

⚠️ Estimativa de pré-proposta — precisão ±50%. Para número defensável, rodar Modo Detailed.

**PF total: <NÚMERO>** (NESMA Indicative, ISO/IEC 24570:2018)
**Confiança: Baixa** (por design do modo)

### Inventário considerado

- ILFs (<N>): <lista>
- EIFs (<N>): <lista>

### Cálculo

PF ≈ 35 × <N_ILFs> + 15 × <N_EIFs> = <NÚMERO>
```

### 6.4 Critérios objetivos de confiança

A confiança é determinada por **quanto da incerteza inicial foi resolvida** pelas perguntas + inferências, não por percentual de funções "respondidas diretamente" (a maioria é sempre inferida no modelo de ≤7 perguntas).

```
incerteza_inicial = amplitude da faixa de PF possível antes de qualquer pergunta
                    (ex: input vago "um app" → 100-1500 PF; input rico → 200-400 PF)

incerteza_residual = amplitude da faixa após ≤7 perguntas + inferências
                     (calculada considerando funções borderline + dimensões não investigadas)

resolução = 1 - (incerteza_residual / incerteza_inicial)

Se modo = Indicative → Baixo (forçado)
Senão se resolução ≥ 0.85 → Alto
Senão se 0.60 ≤ resolução < 0.85 → Médio
Senão → Baixo
```

**Aproximações práticas** (sem calcular faixas explicitamente, IA estima por feel):
- **Alto**: input rico + ≥4 dimensões grandes cobertas pelas perguntas + sem ambiguidades grandes nas inferências.
- **Médio**: input médio OU 2-3 dimensões cobertas OU algumas inferências fundamentadas mas não confirmadas.
- **Baixo**: input vago + usuário respondeu poucas perguntas + muitas inferências sem sinais fortes.

**Bonificação Brownfield:** quando inspeção do projeto foi bem-sucedida (stack + schemas + rotas lidos), considera-se que ~50% do contexto já foi obtido sem entrevista — bonificar um nível quando borderline.

**Penalização sem perguntas:** se o usuário não responder a NENHUMA pergunta (timeout/abandono), a IA aplica defaults conservadores e força Confiança Baixa.

---

## 7. Formato de output

Toda contagem deve devolver, em markdown estruturado:

```markdown
## Contagem APF/IFPUG

**PF total: <NÚMERO>** (IFPUG Detailed, UFP, ISO/IEC 20926:2009 / CPM 4.3.1)
**Confiança: <Alto / Médio / Baixo>**
**Modo: <Greenfield Detailed / Brownfield Detailed / Indicative>**

### Inventário descoberto

**ILFs (<N>):** <lista de nomes>
**EIFs (<N>):** <lista de nomes>
**EIs (<N>):** <lista descrição curta>
**EOs (<N>):** <lista descrição curta>
**EQs (<N>):** <lista descrição curta>

### Classificação detalhada

#### ILFs

| ILF | DETs | RETs | Complexidade | PF |
|---|---|---|---|---|
| <nome 1> | <N> | <N> | Low/Avg/High | 7/10/15 |
| ... | | | | |

#### EIFs

| EIF | DETs | RETs | Complexidade | PF |
|---|---|---|---|---|
| ... | | | | |

#### EIs

| EI | DETs | FTRs | Complexidade | PF |
|---|---|---|---|---|
| ... | | | | |

#### EOs

| EO | DETs | FTRs | Complexidade | PF |
|---|---|---|---|---|
| ... | | | | |

#### EQs

| EQ | DETs | FTRs | Complexidade | PF |
|---|---|---|---|---|
| ... | | | | |

### Resumo por tipo

| Tipo | Low | Avg | High | Subtotal PF |
|---|---|---|---|---|
| ILF | <N> | <N> | <N> | <SOMA> |
| EIF | <N> | <N> | <N> | <SOMA> |
| EI | <N> | <N> | <N> | <SOMA> |
| EO | <N> | <N> | <N> | <SOMA> |
| EQ | <N> | <N> | <N> | <SOMA> |
| **PF total** | | | | **<TOTAL>** |

### Premissas e defaults aplicados

- <funções classificadas via default da IA sem resposta direta — listar para transparência>
- <inferências sobre escopo (ex: "presumi que Audit guarda valor anterior, vira Avg")>
- <eventuais ambiguidades resolvidas por regras §5>

### Análise de sensibilidade — top 3

| Mudança hipotética | Δ PF | Premissa atual |
|---|---|---|
| <descrição da mudança 1> | <+N PF> | <premissa atual 1> |
| <descrição da mudança 2> | <+N PF> | <premissa atual 2> |
| <descrição da mudança 3> | <+N PF> | <premissa atual 3> |
```

**Regras do output:**
- PF total **sempre** no início, em destaque.
- Confiança **sempre** declarada conforme §6.4.
- Inventário sempre listado (ILFs até EQs) — ajuda auditoria.
- Classificação detalhada por tipo: **obrigatória** — é a transparência do método. Cada função aparece com seus DETs, RETs/FTRs e classificação.
- Resumo por tipo: matriz Low/Avg/High por tipo permite ver onde a complexidade se concentra.
- Premissas: listar TODOS os defaults aplicados pela IA, com motivo. Se uma função foi classificada Avg sem o usuário responder DETs, aparece aqui.
- Sensibilidade: 3 mudanças hipotéticas mais impactantes — geralmente reclassificações de funções borderline ou adição de novas funções relacionadas a feature questionada.
- Se modo Indicative: usar template simplificado de §6.3.

Se houver limitação aplicável (§8), incluir bloco de aviso ⚠️ no início do output, antes do PF total.

---

## 8. Limitações conhecidas

Este método **não se aplica bem** aos seguintes casos. Em todos eles, declarar Confiança Baixa explicitamente:

### 8.1 Sistemas real-time / embedded

IFPUG conta funções transacionais. Sistemas de controle (firmware de drone, automotivo, IoT industrial) têm a complexidade dominada por loops de controle e processamento de sinal — invisíveis para FP. Para esses casos, **COSMIC FP (ISO/IEC 19761)** é mais adequado.

### 8.2 Algoritmos científicos / numéricos pesados

Sistemas onde a "feature" é um algoritmo (ex: solver matemático, simulação física, otimização combinatória) — o esforço está no algoritmo, não nas transações. PF subestima drasticamente.

### 8.3 IA/ML core

Quando o produto é o modelo (ex: "treinar e servir um classificador"), o esforço de pipeline de dados, training, evaluation, MLOps não é capturado por IFPUG. Para a infraestrutura ao redor (cadastro de dataset, dashboard de métricas, API de predição) o método aplica.

### 8.4 Jogos

Mecânica de jogo, física, animação, balanceamento são invisíveis para FP. Aplicar apenas para cadastro de jogador, ranking, store interno, social — não para a engine.

### 8.5 Refatoração / modernização sem nova função

Trocar de framework, reescrever mantendo features → 0 PF (não há nova função). FP mede tamanho funcional, não esforço de migração.

### 8.6 Quando declarar limitação

A IA deve **explicitamente** dizer no output:
> "⚠️ Este sistema cai parcialmente fora do escopo do IFPUG (motivo: real-time control). PF aqui mede apenas a parte transacional/CRUD. Esforço total provavelmente subestimado."

### 8.7 Nota sobre Modo Detailed vs Estimated

Detailed (modo default deste sistema) mitiga parcialmente algumas limitações em relação a Estimated:
- Sistemas com poucas entidades muito complexas → matriz IFPUG eleva para High (15 PF), capturando melhor que peso médio fixo (10 PF).
- Sistemas com muitas entidades simples → matriz reduz para Low (7 PF), capturando melhor que 10 PF cravado.

As limitações 8.1-8.5 (real-time, algoritmos, ML core, jogos, refatoração) **continuam valendo** independente do modo — IFPUG não foi desenhado para esses casos.

---

## 9. Referências

### 9.1 Normas ISO

- **ISO/IEC 20926:2009** — Software and systems engineering — Software measurement — IFPUG functional size measurement method (norma primária deste sistema)
- **ISO/IEC 14143-1:2007** — Information technology — Software measurement — Functional size measurement — Part 1: Definition of concepts
- **ISO/IEC 14143-2:2011** — Conformity evaluation of software size measurement methods to ISO/IEC 14143-1
- **ISO/IEC 24570:2018** — Software engineering — NESMA functional size measurement method (referência apenas para o modo Indicative §6.3)
- **ISO/IEC 19761:2011** — COSMIC functional size measurement method (referência para 8.1)

### 9.2 Manuais técnicos

- **IFPUG CPM 4.3.1** — Counting Practices Manual (https://www.ifpug.org)
- **NESMA FPA Counting Practices Manual 2.3**
- **SiSP — Roteiro de Métricas de Software do SISP** (governo brasileiro, baseado em IFPUG)

### 9.3 Benchmarks

- **ISBSG (International Software Benchmarking Standards Group)** — base de dados com >10.000 projetos em PF para calibração

### 9.4 Bibliografia recomendada

- Garmus, D.; Herron, D. — *Function Point Analysis: Measurement Practices for Successful Software Projects* (Addison-Wesley, 2001)
- Vazquez, C.E.; Simões, G.S.; Albert, R.M. — *Análise de Pontos de Função* (Editora Érica, 13ª ed.)
- Meli, R. — *Early Function Points: a new estimation method for software projects* (publicação seminal sobre estimativa antecipada)

### 9.5 Histórico do método

- 1979 — Allan Albrecht (IBM) publica o método original
- 1986 — IFPUG fundado, padronização inicia
- 2003 — IFPUG vira ISO/IEC 20926
- 2009 — Versão atual ISO/IEC 20926:2009
- 2018 — NESMA vira ISO/IEC 24570
