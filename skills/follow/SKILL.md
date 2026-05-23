---
name: follow
description: Ative o protocolo de enforcement de 11 passos — metodologia rigorosa com gate check, docs obrigatórios, code review em loop, e teste real via front. Use para qualquer feature ou mudança de código.
effort: max
argument-hint: "[feature-name or jira-card]"
---

Ative o protocolo de enforcement e siga rigorosamente para toda a conversa.

Este protocolo opera com **precisão de Plan Mode** sem ativar o Plan Mode do Claude Code. Isso significa:

- **Leia com extremo cuidado** todos os arquivos e todo o contexto antes de agir
- **Pare e pergunte ao usuário** quando tiver QUALQUER dúvida — cada step pode (e deve) pausar para confirmar antes de prosseguir
- **Nunca assuma** — se não tem certeza, pergunte. É melhor perguntar 5 vezes do que errar 1
- **100% de precisão** — prefira lentidão com acerto a velocidade com erro
- **Releia** os docs gerados nos steps anteriores antes de cada novo step (releitura acumulativa)
- Não use Plan Mode real — este protocolo já é o plano automatizado

---

## Metodologia Completa (11 passos obrigatórios)

### Por que essa ordem?

- Cada passo produz um artefato .md que alimenta o próximo.
- Sem problema claro → AI resolve a coisa errada.
- Sem user stories → AI inventa requisitos.
- Sem use cases → AI ignora edge cases.
- Sem spec → AI chuta stack e arquitetura.
- **Cada step DEVE reler todos os docs anteriores** antes de produzir o seu. Isso garante coerência acumulativa.

### Os 11 passos

1. **Problema** — O que doi? (1 frase. Se nao cabe em uma frase, voce nao entendeu o problema ainda.)
2. **User Stories** — O que o usuario precisa? ("Como X, eu quero Y para Z"). Lista curta, vira requisito.
3. **Use Cases** — Para cada story: caminho feliz + o que pode dar errado (erros, edge cases, timeouts, permissoes).
4. **Spec** — Decisoes que a AI nao deve tomar por voce (stack, constraints, modulos existentes, regras de negocio).
5. **Test Cases** — Escreva os test cases ANTES de codar. Cada test case comeca no login e termina com prova real. Derive dos use cases com explosao combinatoria (inputs x estados x permissoes x condicoes).
6. **To Do** — Quebre em tasks pequenas e rastreaveis. Cada task = uma unidade que a AI consegue resolver em um prompt.
7. **Implementar** — 7a: Criar prompt personalizado com plano completo em `kanban/07-implementation/`. 7b: AI gera codigo usando o plano como referencia, revisa, itera.
8. **Code Review** — Review critico automatico do diff da branch em loop. Gerar relatorio detalhado em `kanban/08-code-review/`. Corrigir erros imediatamente. Loop ate limpo. Nunca criar/aprovar PR.
9. **Run Test** — Rode os testes REAIS (nao apenas type check). Build sem erros, testes passando, lint/type check limpo. Se algo falha, volta pro 7.
10. **Done** — Task revisada, testada, funcionando. Mova de TODO → Done.
11. **Ship** — Deploy em staging primeiro, smoke test, producao.

### Na pratica

#### 1. Problema
Uma frase. Se nao cabe em uma frase, voce nao entendeu o problema ainda.

> "Usuarios nao conseguem receber pagamentos na plataforma."

#### 2. User Stories
Lista curta do que o usuario precisa. Isso vira requisito para a AI.

> - Como vendedor, eu quero cadastrar minha conta bancaria
> - Como vendedor, eu quero ver o status dos meus pagamentos
> - Como admin, eu quero ver relatorio de transacoes

#### 3. Use Cases
Para cada story, defina: o que da certo e o que da errado. A AI precisa disso para gerar codigo robusto.

> **Cadastrar conta bancaria**
> - Sucesso: dados validos -> salva -> confirma
> - Erro: dados invalidos -> mostra quais campos
> - Erro: banco fora do ar -> retry + notifica

#### 4. Spec
Decisoes que a AI nao deve tomar por voce.

> - Stack: Next.js, Prisma, PostgreSQL
> - API de pagamento: Stripe
> - Auth: ja existe, usar o modulo atual
> - Nao criar tabelas novas sem aprovacao

#### 5. Test Cases
Escreva os test cases **antes** de implementar. Test cases cobrem a **jornada real do usuario**, de ponta a ponta:

```
Login -> navega -> executa acao -> valida resultado -> print de prova
```

**Por que a AI muda o jogo aqui:** Test cases nascem dos use cases (passo 3). Cada use case tem variaveis — inputs, estados, permissoes, dados, condicoes de rede, timing. Um humano testa as combinacoes obvias e para. A AI combina todas essas variaveis entre si, gerando infinitas combinacoes que um humano sozinho nunca conseguiria cobrir.

> **Exemplo: Cadastro de conta bancaria**
> 1. Login com credenciais validas
> 2. Navegar ate Configuracoes > Pagamentos
> 3. Preencher dados bancarios
> 4. Submeter formulario
> 5. Validar mensagem de sucesso
> 6. Verificar dados salvos no perfil
> 7. Print da tela como prova real

Regras:
- Cada test case comeca no login e termina com print de prova
- Cobrir caminho feliz + erros dos use cases
- Sem print de prova = nao testou
- Derivar dos use cases — cada test case nasce de um cenario (feliz ou de erro) do passo 3
- Explosao combinatoria — a AI cruza variaveis entre si para cobrir combinacoes que nenhum humano pensaria sozinho

#### 6. To Do
Quebre em tasks pequenas e rastreaveis. Cada task = uma unidade que a AI consegue resolver em um prompt.

> - [ ] Criar endpoint POST /payments/account
> - [ ] Validacao de dados bancarios
> - [ ] Integracao Stripe Connect
> - [ ] Tela de cadastro de conta
> - [ ] Tela de status de pagamentos

#### 7. Implementar

**7a — Plano/Prompt personalizado**: Antes de codar, crie `kanban/07-implementation/<feature>.md` consolidando TODO o contexto (steps 1-6 + codigo existente). Este arquivo e o prompt-mestre que guia a implementacao.

**7b — Codificar**: Use o plano como referencia. Itere:

```
plano criado -> AI gera seguindo plano -> revisa -> ajusta -> repete
```

Regras:
- Nunca comece a codar sem o plano criado
- Revise cada output antes de aceitar
- Itere em pedacos pequenos, nao peca tudo de uma vez
- Atualize o plano se decisoes mudarem

#### 8. Code Review Critico
Review critico automatico do diff da branch em loop. Gere relatorio detalhado em `kanban/08-code-review/<feature>.md`.

- `git diff main...HEAD` — revisar tudo
- Cruzar com plano, use cases, test cases — o codigo cobre tudo?
- Codigo morto, imports nao usados, bugs logicos, padroes violados, seguranca, performance
- SE encontrar erro → corrigir e re-revisar (loop ate ZERO issues)
- Criar relatorio critico com TODOS os achados (inclusive os ja corrigidos)
- SE PR existir → atualizar com comentarios/descricao (nunca criar/aprovar)
- Loop until limpo — nao aceitar "bom o suficiente"

#### 9. Run Test
Rode os testes para validar que tudo passa.

- Build sem erros
- Testes passando
- Lint/type check limpo
- Se algo falha, volta pro Implementar (7) e corrige

#### 10. Done
Task so e done quando:
- Codigo revisado
- Testes passando
- Funciona isoladamente

Mova cada task de TODO -> Done conforme finaliza. Nao acumule.

#### 11. Ship
- Deploy em staging primeiro
- Smoke test
- Producao

---

## Protocolo de Enforcement (OBRIGATÓRIO para toda a conversa)

### Ativação de Tasks (OBRIGATÓRIO)

Ao iniciar qualquer feature ou mudança de código, **crie tasks no Claude Code** usando `TaskCreate` para cada step da metodologia. Cada step = uma task. Marque como `in_progress` ao começar e `completed` ao finalizar. Isso permite ao usuário acompanhar o progresso em tempo real.

```
TaskCreate: "Step 1 — Problema: <feature>"
TaskCreate: "Step 2 — User Stories: <feature>"
TaskCreate: "Step 3 — Use Cases: <feature>"
TaskCreate: "Step 4 — Spec: <feature>"
TaskCreate: "Step 5 — Test Cases: <feature>"
TaskCreate: "Step 6 — To Do: <feature>"
TaskCreate: "Step 7a — Plano de Implementação: <feature>"
TaskCreate: "Step 7b — Codificar: <feature>"
TaskCreate: "Step 8 — Code Review Crítico: <feature>"
TaskCreate: "Step 9 — Run Test: <feature>"
TaskCreate: "Step 10 — Done: <feature>"
```

Regras:
- Crie TODAS as tasks de uma vez no início (antes de executar qualquer step)
- Use `TaskUpdate` para marcar `in_progress` ao começar cada step e `completed` ao finalizar
- O `activeForm` de cada task deve descrever o que está acontecendo (ex: "Criando docs/01-problem/...")
- Nunca avance para o próximo step sem marcar o anterior como `completed`

A partir de agora, ANTES de responder QUALQUER mensagem do usuário que envolva mudança de código, você DEVE:

### Gate Check (execute SEMPRE antes de codar)

Verifique se os arquivos .md das fases 1-4 existem para a feature em questão:

```
## Methodology Gate Check
- [ ] **Problema** — `docs/01-problem/<feature>.md` existe?
- [ ] **User Stories** — `docs/02-stories-and-cases/<feature>-user-stories.md` existe?
- [ ] **Use Cases** — `docs/02-stories-and-cases/<feature>-use-cases.md` existe?
- [ ] **Spec** — `docs/04-spec/<feature>.md` existe?
- [ ] **Status**: Pode prosseguir / BLOQUEADO — falta: [listar steps pendentes]
```

### Regras do Gate

1. **Se QUALQUER arquivo .md estiver faltando** → NÃO escreva código. Execute os steps faltantes (1-4) primeiro, criando os respectivos .md files. Se o usuário não forneceu contexto suficiente, pergunte.
2. **Se TODOS os arquivos existem** → prossiga seguindo a ordem completa. **TODOS os passos devem ser executados, independente do tamanho da tarefa.** Não existe "tarefa pequena demais" para pular passos.
3. **O Gate Check deve ser exibido VISUALMENTE** no início de cada resposta que envolva código. Sem exceções.
4. **Mesmo que o usuário peça diretamente "implementa X"** → rode o Gate Check primeiro. Se faltar contexto, pergunte. NÃO obedeça a ordem de implementar se os pré-requisitos não existirem.
5. **Se o usuário disser "pula" ou "ignora o gate"** → lembre que a metodologia é obrigatória e pergunte se ele realmente quer desativar (exigindo confirmação explícita).
6. **Cada passo deve produzir output visível E um artefato .md no filesystem** antes de avançar ao próximo. Sem exceções.

### Exceções (NÃO requer Gate Check)

- Bug fixes triviais (typo, ajuste de texto, correção pontual)
- Refactors internos sem mudança de comportamento
- Ajustes de configuração/infra
- Perguntas sobre código (sem alteração)

---

## Ordem obrigatória (TODOS os passos, SEMPRE, com output visível)

Após o Gate Check passar, execute CADA passo abaixo com output visível antes de avançar.

### Regra cardinal: cada step atualiza sua pasta respectiva em `docs/`

Nenhum step está completo sem o artefato .md no filesystem. A tabela abaixo é a referência:

| Step | Pasta | Arquivo | Ação |
|---|---|---|---|
| 1 — Problema | `docs/01-problem/` | `<tópico>.md` | **Organizar** pasta → criar ou atualizar |
| 2 — User Stories | `docs/02-user-stories/` | `<tópico>.md` | **Organizar** pasta → criar ou atualizar. Reler: step 1 |
| 3 — Use Cases | `docs/03-use-cases/` | `<tópico>.md` | **Organizar** pasta → criar ou atualizar. Reler: steps 1-2 |
| 4 — Spec | `docs/04-spec/` | `<tópico>.md` | **Organizar** pasta → criar ou atualizar. Reler: steps 1-3 |
| 5 — Test Cases | `docs/05-test-cases/` | `<tópico>.md` | **Organizar** pasta → criar ou atualizar. Reler: steps 1-4 |
| 6 — To Do | `kanban/06-todo/` | `<tópico>.md` | **Organizar** pasta → criar ou atualizar. Reler: steps 1-5 |
| 7a — Plano | `kanban/07-implementation/` | `<tópico>.md` | **Organizar** pasta → criar ou atualizar. Reler: steps 1-6 + código |
| 7b — Codificar | Código no projeto | Arquivos .tsx/.ts etc. | Editar/criar. Referência: plano (7a) |
| 8 — Code Review | `kanban/08-code-review/` | `<tópico>.md` | **Organizar** pasta → criar ou atualizar. Loop até limpo |
| 9 — Run Test | `kanban/09-run-test/` | `<tópico>.md` | **Organizar** pasta → criar ou atualizar. Reler: step 5 |
| 10 — Done | `kanban/10-done/` | `<tópico>.md` | **Organizar** pasta → criar ou atualizar. **Deletar** todo da feature |
| 11 — Ship | `kanban/11-ship/` | `<tópico>.md` | **Organizar** pasta → criar ou atualizar |

**Se o .md não foi criado/atualizado na pasta respectiva, o step NÃO foi executado.** Exibir texto na resposta sem salvar em disco = step não feito.

### Inventário de Docs (OBRIGATÓRIO — UMA VEZ antes de começar os steps)

**Antes de executar qualquer step**, faça um scan único de TODAS as pastas de docs para ter a visão geral. Isso economiza tokens (evita re-scan por step) e garante decisões consistentes de criar/editar/excluir.

```
INVENTÁRIO (rodar UMA VEZ, no início):
  1. LISTAR TUDO — Glob docs/**/*.md (todas as pastas de uma vez)
  2. LER — Read CADA arquivo existente (conteúdo completo, não apenas nome)
     - Se muitos arquivos: ler pelo menos título + H2s + primeira frase de cada seção
  3. MONTAR MAPA MENTAL — Para cada arquivo: tópico/domínio que cobre, features documentadas
  4. ANOTAR — Quais arquivos existentes se relacionam com a feature atual?
     - Mesma área? Mesmo fluxo? Mesma tela? Mesmo domínio?

RESULTADO: Você agora sabe exatamente o que existe. Use esse mapa em TODOS os steps:
  - Arquivo relacionado existe → ATUALIZAR (adicionar seção ou mesclar)
  - Nada relacionado → CRIAR arquivo novo nomeado por tópico/domínio
  - Redundantes encontrados → MESCLAR em um só e deletar os redundantes
  - Obsoletos encontrados → DELETAR
```

**Regras de organização:**
- **Ler = ler o CONTEÚDO, não apenas o nome do arquivo.** Glob retorna nomes — nomes não dizem tudo.
- Features relacionadas = mesmo arquivo. Ex: "adicionar PIX" + "adicionar boleto" → `pagamentos.md`
- O nome do arquivo reflete o **domínio/tópico**, não o nome da task/feature
  - ✅ `pagamentos.md`, `autenticacao.md`, `dashboard-admin.md`
  - ❌ `feat-1.md`, `feat-2.md`, `add-pix.md`, `add-boleto.md`
- Ao mesclar arquivos, preserve todo conteúdo relevante — apenas reorganize
- Dentro do arquivo, use seções claras (H2/H3) para separar features quando necessário

**ANTI-PADRÃO (PROIBIDO):**
```
❌ Glob docs/01-problem/*.md → não encontra "minha-feature.md" → cria novo
```
O correto é:
```
✅ Inventário já feito → sabe que existe pagamentos.md → PIX é pagamento → ATUALIZA o existente
```
**O critério é DOMÍNIO/TÓPICO, não nome exato da feature.** Se a pasta tem `dashboard.md` e sua feature é "adicionar filtro no dashboard", você ATUALIZA `dashboard.md` — não cria `filtro-dashboard.md`.

### Regra de releitura

Antes de executar um step, **releia os docs de TODOS os steps anteriores** para essa feature. Isso garante coerência acumulativa — cada step se alimenta do anterior. Use Read tool em paralelo para reler todos de uma vez.

### Step 1 — Problema

- Defina o problema em 1 frase clara
- **OBRIGATÓRIO: Organize** `docs/01-problem/` → leia existentes → crie ou atualize `<tópico>.md`
- O arquivo contém: problema (1 frase), contexto breve, quem é afetado

```
## Step 1 — Problema
Arquivo criado/atualizado: docs/01-problem/<tópico>.md
```

### Step 2 — User Stories

- **Reler**: step 1
- Liste as user stories ("Como X, eu quero Y para Z")
- **OBRIGATÓRIO: Organize** `docs/02-user-stories/` → leia existentes → crie ou atualize `<tópico>.md`

```
## Step 2 — User Stories
Relido: step 1
Arquivo criado/atualizado: docs/02-user-stories/<tópico>.md
```

### Step 3 — Use Cases

- **Reler**: steps 1-2
- Para cada story: caminho feliz + o que pode dar errado (erros, edge cases, timeouts, permissões)
- **OBRIGATÓRIO: Organize** `docs/03-use-cases/` → leia existentes → crie ou atualize `<tópico>.md`

```
## Step 3 — Use Cases
Relidos: steps 1-2
Arquivo criado/atualizado: docs/03-use-cases/<tópico>.md
```

### Step 4 — Spec (Iterative Questioning Loop)

- **Reler**: docs dos steps 1-3
- Decisões técnicas que a AI não deve tomar sozinha (stack, constraints, módulos existentes, regras de negócio)

#### Questioning Loop Protocol (OBRIGATÓRIO)

Antes de criar o spec, rode um loop de perguntas até ter ZERO ambiguidades. O objetivo é extrair do usuário TODA decisão que a AI não deve tomar sozinha — stack, constraints, módulos, regras de negócio, UX, edge cases, integrações, permissões, dados, segurança, etc.

```
ROUND = 0

REPETIR até não ter mais perguntas:
  ROUND += 1

  1. ANALISAR — Releia TUDO disponível até agora:
     - docs/01-problem/<feature>.md
     - docs/02-stories/<feature>-user-stories.md
     - docs/02-stories/<feature>-use-cases.md
     - Respostas do usuário nas rounds anteriores (se houver)
     - Código existente relevante
     - CLAUDE.md e docs/04-spec/technical/patterns.md

  2. IDENTIFICAR GAPS — Com base na análise, identifique TODAS as decisões em aberto:
     - Stack/tecnologia não definida
     - Regras de negócio ambíguas ou implícitas
     - Comportamento de UI/UX não especificado + consistência visual com o app existente
     - **UI/UX obrigatório:** Como features similares se comportam no app hoje? Como big apps (Instagram, Spotify, Gmail, Notion, iFood, Uber, Airbnb) resolvem este problema?
     - Edge cases dos use cases sem decisão clara
     - Integrações externas sem detalhe
     - Permissões/roles não definidos
     - Dados/schemas não especificados
     - Constraints de performance/segurança
     - Conflitos entre requisitos
     - Qualquer coisa que tenha mais de uma forma de implementar

  3. FORMULAR PERGUNTAS — Para cada gap:
     - Pergunta clara e direta
     - Contexto breve de POR QUE precisa dessa decisão
     - Opções possíveis (quando aplicável) com prós/contras
     - Sugestão de default (quando aplicável, baseada nos padrões do projeto)

  4. APRESENTAR ao usuário — Mostre:
     - Round number (ex: "📋 Spec — Round 1 de perguntas")
     - Lista numerada de perguntas agrupadas por tema
     - Contexto de cada pergunta
     - Aguarde TODAS as respostas antes de prosseguir

  5. RECEBER respostas do usuário

  6. RE-ANALISAR (do zero) — Com as novas respostas, releia TUDO de novo:
     - Docs dos steps 1-3
     - TODAS as respostas acumuladas (rounds 1 até N)
     - Verifique se as respostas geraram NOVAS dúvidas
     - Verifique se respostas contradizem algo anterior
     - Verifique se agora tem contexto suficiente para decisões que antes eram gaps
     - Pense em dimensões que não cobriu antes (segurança? performance? acessibilidade? mobile? i18n? erro handling? rollback?)

  7. DECISÃO DO LOOP:
     - SE ainda há gaps, ambiguidades, ou novas perguntas → voltar ao passo 2 (novo round)
     - SE zero gaps E zero ambiguidades E confiança alta → sair do loop

SAÍDA DO LOOP:
  - Mostre ao usuário: "✅ Spec completo — [N] rounds, [M] perguntas totais, zero ambiguidades restantes"
  - Liste um resumo das decisões tomadas
  - Peça confirmação FINAL antes de criar o arquivo
```

Regras do Questioning Loop:
- **Não existe limite de rounds** — rode quantos forem necessários até esgotar TODAS as perguntas
- **Cada round re-analisa TUDO do zero** — não confie na memória, releia. As respostas do round anterior podem mudar o que precisa perguntar
- **Perguntas devem ser profissionais e completas** — não pergunte de forma vaga. Dê contexto, opções, e sugestão
- **Agrupe por tema** — organize as perguntas por categoria (UX, backend, segurança, etc.)
- **Mínimo 1 round** — mesmo que pareça simples, rode pelo menos 1 round. Features "simples" muitas vezes escondem complexidade
- **Se o usuário responder "você decide"** → documente a decisão que VOCÊ tomou e o motivo. O spec deve registrar TODA decisão, inclusive as delegadas
- **Se detectar contradição** entre respostas → aponte e peça esclarecimento antes de prosseguir
- **Qualidade > velocidade** — é melhor fazer 5 rounds e ter spec perfeito do que 1 round e voltar para corrigir no step 7

- **OBRIGATÓRIO: Organize** `docs/04-spec/` → leia existentes → crie ou atualize `<tópico>.md` (SOMENTE após o loop fechar com zero gaps e confirmação do usuário)

```
## Step 4 — Spec (Questioning Loop)
Relidos: steps 1-3
Rounds de perguntas: <N>
Total de perguntas: <M>
Decisões capturadas: <K>
Confirmação do usuário: ✅
Arquivo criado/atualizado: docs/04-spec/<tópico>.md
```

### Step 5 — Test Cases

- **Reler**: docs dos steps 1-4
- Escreva os cenários de teste ANTES de codar
- Cada test case começa no login e termina com prova real
- Derive dos use cases — a AI cruza variáveis (inputs x estados x permissões x condições) para cobertura combinatória
- **OBRIGATÓRIO: Organize** `docs/05-test-cases/` → leia existentes → crie ou atualize `<tópico>.md`
- O arquivo deve conter: pré-condição, passos numerados, resultado esperado, e método de verificação (Playwright MCP ou Android emulator)

```
## Step 5 — Test Cases
Relidos: steps 1-4
- TC-001: [cenário] — Pre-condição / Passos / Resultado esperado
- TC-002: [cenário] — ...
Arquivo criado/atualizado: docs/05-test-cases/<tópico>.md
```

### Step 6 — To Do

- **Reler**: docs dos steps 1-5
- Quebre a tarefa em tasks pequenas e rastreáveis
- **OBRIGATÓRIO: Organize** `kanban/06-todo/` → leia existentes → crie ou atualize `<tópico>.md`
- O arquivo contém: lista de tasks com checkboxes

```
## Step 6 — To Do
Relidos: steps 1-5
- [ ] task 1
- [ ] task 2
Arquivo criado/atualizado: kanban/06-todo/<tópico>.md
```

### Step 7 — Implementar

#### 7a — Plano de Implementação (OBRIGATÓRIO antes de codar)

Antes de escrever qualquer linha de código, crie um arquivo de plano que consolida TODO o contexto e serve como referência-mestre durante a implementação.

- **Reler**: docs dos steps 1-6 (todos, sem exceção)
- **Ler**: todo o código já implementado que seja relevante para a feature (componentes, services, hooks, routes, schemas, etc.)
- **OBRIGATÓRIO: Organize** `kanban/07-implementation/` → leia existentes → crie ou atualize `<tópico>.md`

O arquivo de plano DEVE conter:

```markdown
# Plano de Implementação — <feature>

## 1. Contexto Consolidado
- **Problema**: (resumo de docs/01-problem/<feature>.md)
- **User Stories**: (lista de docs/02-stories-and-cases/<feature>-user-stories.md)
- **Use Cases**: (resumo de docs/02-stories-and-cases/<feature>-use-cases.md — incluir caminhos felizes E de erro)
- **Spec/Constraints**: (decisões técnicas de docs/04-spec/<feature>.md)

## 2. Código Existente Relevante
- Listar CADA arquivo/módulo existente que será modificado ou reutilizado
- Para cada um: o que faz, como será impactado, dependências
- Padrões e convenções observados no codebase atual

## 3. Estratégia de Implementação
- Ordem de execução das tasks (de kanban/06-todo/<feature>.md)
- Para CADA task: abordagem técnica, arquivos a criar/modificar, dependências entre tasks
- Decisões de design e justificativas
- **Referência big apps:** Como apps populares (Instagram, Spotify, Gmail, Notion, Meta, iFood, Uber, Airbnb, etc.) resolvem este mesmo problema de UX? Use o padrão deles como referência default para decisões de UI/UX
- **Consistência UI/UX:** Quais padrões visuais e de interação já existem no app? A implementação DEVE seguir a linguagem visual existente (cores, espaçamentos, tipografia, animações, componentes, feedback visual)

## 4. Mapa de Test Cases → Código
- Para CADA TC de docs/05-test-cases/<feature>.md:
  - Qual código/componente atende esse TC
  - Edge cases que o código deve tratar
  - Validações e guardas necessárias

## 5. Riscos e Pontos de Atenção
- Edge cases dos use cases que exigem tratamento especial
- Integrações externas (APIs, serviços, banco)
- Impactos em funcionalidades existentes
- Pontos onde pausar e perguntar ao usuário

## 6. Checklist de Implementação
- [ ] Task 1: descrição — arquivos: [lista]
- [ ] Task 2: descrição — arquivos: [lista]
- ...
```

Regras do plano:
- **O plano deve ser COMPLETO e AUTOCONTIDO** — qualquer pessoa (ou AI) deve conseguir implementar a feature lendo apenas este arquivo + o código
- **Nunca comece a codar sem este arquivo criado** — ele é o artefato obrigatório do step 7a
- **Se ao criar o plano surgir dúvida ou ambiguidade** → PARE e pergunte ao usuário antes de prosseguir
- **O plano é vivo** — atualize-o durante a implementação se decisões mudarem

```
## Step 7a — Plano de Implementação
Relidos: steps 1-6 + código existente
Arquivo criado: kanban/07-implementation/<feature>.md
Dúvidas para o usuário: [listar se houver, ou "nenhuma"]
```

#### 7b — Codificar

Após o plano criado e validado, implemente seguindo-o como referência. Este step exige **disciplina de engenharia rigorosa** — não é só "gerar código", é gerar código **limpo, reutilizável, seguro e sustentável**.

##### Antes de codar cada task (Disciplina Pré-Código)

- **Reler**: `kanban/07-implementation/<feature>.md` (referência-mestre)
- **Identificar a camada**: a mudança pertence a qual camada? (controller/service/component/hook/schema/shared). Respeite a responsabilidade de cada camada.
- **Buscar código reutilizável ANTES de criar**: use Grep/Glob em `packages/shared/`, `src/lib/`, `src/components/ui/`, `src/hooks/` e equivalentes. Se já existe algo parecido, reutilize ou estenda — NÃO duplique.
- **Verificar direção de dependências**: camadas internas não importam de camadas externas. shared → api/web é ok. api → web ou web → api é proibido.
- **Consistência UI/UX (OBRIGATÓRIO)**: antes de criar/modificar qualquer componente visual, analise como features similares já se comportam no app. Padrões visuais e de interação existentes são LEI — não invente estilo novo. Quando não existir padrão no app, use como referência como os big apps (Instagram, Spotify, Gmail, Notion, iFood, Uber, Airbnb) resolvem o mesmo problema de UX.

##### Práticas Obrigatórias Durante a Codificação

###### Arquitetura e Design (SOLID, Clean Architecture)

- **SRP (Single Responsibility)**: cada arquivo/classe/função faz UMA coisa. Se uma função excede ~40 linhas, extraia helper. Se um componente mistura lógica de negócio com UI, separe em hook + componente.
- **Separação de camadas**: controller lida com HTTP, service lida com lógica, componente lida com UI. Lógica de negócio NUNCA no controller ou componente.
- **Baixo acoplamento, alta coesão**: módulos novos devem ser injetáveis e independentes. Evite dependências circulares.
- **KISS**: implemente da forma mais simples que resolva o problema. Se existe uma solução em 5 linhas, não escreva 50.
- **YAGNI**: implemente APENAS o que o plano especifica. Zero abstrações especulativas, zero "e se precisar no futuro". Três linhas similares é melhor que uma abstração prematura.
- **DRY**: antes de criar utility/helper/componente novo, confirme que não existe em `packages/shared/`, `src/lib/`, ou `src/components/ui/`. Se existe algo similar, estenda-o.
- **Law of Demeter**: um objeto só fala com seus vizinhos diretos. Evite cadeias como `a.b.c.d.method()`. Se precisar acessar algo profundo, crie um método intermediário.

###### Refatoração Obrigatória ao Tocar (regra "tocou = refatora")

**Tocou no arquivo = revisa e refatora. Sem exceção.**

Para CADA arquivo aberto para edição, escaneie obrigatoriamente:

- **Tamanho do arquivo**: services > 400 linhas → avalie se precisa dividir. Componentes > 300 linhas → avalie se precisa extrair sub-componentes. Não é hard block, mas DEVE ser avaliado e justificado se mantiver.
- **Imports mortos e variáveis não usadas** → remova imediatamente.
- **Lógica duplicada dentro do arquivo** → extraia para helper/util.
- **Naming ruim** → renomeie para clareza (variáveis, funções, componentes).
- **Comentários enganosos ou desatualizados** → corrija ou remova. Não adicione comentários onde o código é auto-explicativo.
- **`TODO`/`FIXME` resolúveis** → se pode resolver agora, resolva. Se não pode, deixe com contexto claro.
- **Código morto** (funções não chamadas, branches impossíveis, exports não usados) → delete completamente. Sem `_unused`, sem `// removed`, sem re-export por compatibilidade.

###### Banco de Dados (quando aplicável)

- Migrações SEMPRE versionadas (`npx prisma migrate dev --name nome-descritivo`).
- Use Prisma client — raw SQL apenas com justificativa clara.
- Verifique índices em campos frequentemente consultados (WHERE, ORDER BY, JOIN).
- Relations devem ter `onDelete` explícito (Cascade, SetNull, ou Restrict — nunca default silencioso).
- Preços em centavos (integer). Datas como ISO string quando necessário.

###### Segurança (em cada linha de código)

- **Validação de input**: DTOs com `class-validator` no backend, Zod no frontend. Input do usuário NUNCA chega à lógica de negócio sem validação.
- **Auth explícito**: cada endpoint novo declara `@Roles()` ou `@Public()`. Sem exceção.
- **Zero secrets no código**: variáveis de ambiente via `ConfigService`. Nunca hardcode tokens, keys, ou senhas.
- **Sanitize**: conteúdo do usuário é sanitizado antes de renderizar (prevenir XSS).
- **Least Privilege**: peça apenas os dados/permissões necessários. Select fields específicos, não `select: *`.

###### Tratamento de Erros e Observabilidade

- **Sem catches silenciosos**: `catch (e) {}` é proibido. Sempre log ou re-throw com contexto.
- **Erros estruturados**: services retornam erros com contexto (qual operação, qual input, o que falhou). Não lance exceções genéricas para erros de negócio.
- **Frontend**: mensagens amigáveis para o usuário, nunca objetos de erro brutos.
- **Logs com contexto**: ao logar erro, inclua operação, input relevante (sem dados sensíveis), e stack trace.

###### Performance (escolhas conscientes)

- **Evite N+1 queries**: use Prisma `include` ou `select` apropriadamente. Nunca query dentro de loop.
- **Evite re-renders desnecessários**: memoize computações caras, evite criação inline de objetos/funções em JSX.
- **Use cache existente**: React Query para dados read-heavy, `unstable_cache` no server.
- **Lazy load**: componentes pesados carregam sob demanda (`React.lazy`, dynamic imports).
- **Trade-offs conscientes**: se otimizar, documente por quê. Se não otimizar, justifique que o volume atual não exige.

##### Após completar cada task (Checkpoint Pós-Task)

- Marque a task no checklist do plano (`kanban/07-implementation/<feature>.md`)
- Auto-verifique: o código satisfaz o use case específico que atende?
- Diff mental rápido: o que mudou vs. o que deveria ter mudado? Algum efeito colateral?

##### TCs de Regressão Obrigatórios (regra "tocou = testa impacto")

**Tocou no arquivo = identifica features impactadas e cria TCs de regressão. Mesmo que NÃO sejam da task atual.**

Para CADA arquivo alterado, analise o raio de impacto:

1. **Mapear dependentes**: quem importa/usa este arquivo? Use Grep para encontrar todos os importadores. Cada importador é um candidato a impacto.
2. **Identificar features afetadas**: para cada dependente, qual feature do produto ele serve? (ex: editou um hook de auth → impacta login, signup, profile, qualquer tela autenticada).
3. **Verificar TCs existentes**: consulte `docs/05-test-cases/` — já existem TCs que cobrem essas features impactadas?
4. **Criar TCs de regressão**: para CADA feature impactada que NÃO tenha cobertura adequada nos TCs existentes, crie novos TCs seguindo os princípios do Step 5:
   - Começa no login, termina com prova real (screenshot)
   - Pré-condição, passos numerados, resultado esperado
   - Caminho feliz + cenários de erro relevantes
   - Explosão combinatória quando aplicável (inputs x estados x permissões)

**OBRIGATÓRIO: Atualize** `docs/05-test-cases/<feature>.md` via Edit tool — adicione seção `## TCs de Regressão` com os novos TCs. Se impactar OUTRA feature, adicione TCs no arquivo dela (ex: `docs/05-test-cases/<outra-feature>.md`). Se não existir arquivo de TC para a feature impactada, crie.

Regras:
- **Não existe "mudança isolada"** — toda mudança tem raio de impacto. Se acha que não tem, analisou mal. Reanalize.
- **TCs de regressão são OBRIGATÓRIOS no Step 9** — devem ser executados junto com os TCs da feature, com a mesma exigência de prova real.
- **Proporção**: a quantidade de TCs de regressão deve ser proporcional ao risco. Mudança em shared/util → muitos TCs. Mudança em componente folha → poucos TCs.
- **Não duplique**: se já existe um TC que cobre o cenário, referencie-o em vez de criar outro.

```
Exemplo de análise de impacto:
  Arquivo alterado: src/hooks/useAuth.ts
  Dependentes encontrados: LoginScreen, SignupScreen, ProfileScreen, SettingsScreen, AppointmentList
  Features impactadas: login, signup, perfil, configurações, agendamentos
  TCs existentes: login (TC-001 a TC-005), signup (TC-010 a TC-012)
  TCs de regressão criados:
  - TC-REG-001: Perfil — após login, dados do perfil carregam corretamente
  - TC-REG-002: Configurações — tela de settings acessível e funcional
  - TC-REG-003: Agendamentos — lista de agendamentos carrega com auth válido
```

- **Artefato**: arquivos de código editados/criados no projeto + TCs de regressão em `docs/05-test-cases/`

```
## Step 7b — Codificar
Referência: kanban/07-implementation/<feature>.md
Arquivos alterados:
- path/to/file1.tsx (descrição da mudança)
- path/to/file2.ts (descrição da mudança)
Refatorações aplicadas:
- path/to/file1.tsx: [removidos N imports mortos, extraído helper X, renomeado Y]
- path/to/file3.ts: [função Z dividida em 2, nome melhorado]
Princípios aplicados: [SRP, DRY, KISS, etc. — listar os que influenciaram decisões]
TCs de regressão adicionados:
- docs/05-test-cases/<feature>.md: TC-REG-001, TC-REG-002 (impacto em <feature-impactada>)
- docs/05-test-cases/<outra-feature>.md: TC-REG-003 (impacto via shared hook)
Checklist atualizado: kanban/07-implementation/<feature>.md
```

### Step 8 — Code Review Crítico (após cada implementação)

Após o Step 7 e ANTES do Step 9, execute um code review crítico e rigoroso em loop. Este step é **CRÍTICO para a qualidade do todo** — não é formalidade, é a última barreira antes do teste.

#### 8a — Revisão em Loop (OBRIGATÓRIO)

```
REPETIR até 100% limpo:
  1. Rodar `git diff main...HEAD` para ver TODAS as mudanças na branch
  2. Reler `kanban/07-implementation/<feature>.md` — o código implementa tudo que foi planejado?
  3. Reler `docs/05-test-cases/<feature>.md` — o código cobre todos os cenários?
  4. Reler `docs/02-stories-and-cases/<feature>-use-cases.md` — todos os edge cases estão tratados?
  5. Revisar CADA arquivo alterado com análise crítica:
     - Código morto / imports não usados?
     - Bugs lógicos / edge cases não tratados?
     - Padrões do projeto violados? (consultar docs/04-spec/)
     - Segurança (XSS, injection, secrets expostos, auth bypass)?
     - Consistência com o resto do codebase?
     - **Consistência UI/UX** — componentes seguem os padrões visuais e de interação existentes no app? Padrão de big apps respeitado?
     - Performance (queries N+1, re-renders, memory leaks)?
     - Acessibilidade (se frontend)?
     - Tratamento de erros adequado (não genérico, não silencioso)?
     - O código faz EXATAMENTE o que os use cases pedem — nem mais, nem menos?
     - Regra "tocou = refatora" do Step 7b foi seguida? (imports limpos, sem dead code novo, arquivos dentro dos limites de linha, naming claro, SOLID/DRY/KISS respeitados)
  6. SE encontrar QUALQUER problema → corrigir IMEDIATAMENTE e voltar ao passo 1
  7. SE PR existir na branch → atualizar com comentários e descrição
  8. Loop until ZERO issues — NÃO aceitar "bom o suficiente"
```

#### 8b — Relatório de Code Review (OBRIGATÓRIO)

Após o loop fechar limpo, **OBRIGATÓRIO: Organize** `kanban/08-code-review/` → leia existentes → crie ou atualize `<tópico>.md`.

O relatório DEVE ser **crítico, detalhado e honesto** — não é para passar, é para garantir qualidade. Estrutura obrigatória:

```markdown
# Relatório de Code Review — <feature>

## Resumo da Revisão
- **Branch**: <branch-name>
- **Total de iterações do loop**: <número> (quantas vezes o loop rodou até ficar limpo)
- **Data**: <data>
- **PR existente**: sim/não (se sim, atualizada)

## Arquivos Analisados
Para CADA arquivo alterado:
| Arquivo | Linhas alteradas | Tipo de mudança | Veredicto |
|---|---|---|---|
| path/to/file.tsx | +XX -YY | feature/fix/refactor | ✅ Limpo / ⚠️ Corrigido |

## Problemas Encontrados e Corrigidos
Para CADA problema encontrado durante o loop (mesmo os já corrigidos):
### Issue #N — [título descritivo]
- **Arquivo**: path/to/file
- **Linha(s)**: XX-YY
- **Severidade**: 🔴 Crítico / 🟡 Importante / 🟢 Menor
- **Categoria**: Bug lógico / Segurança / Performance / Padrão violado / Dead code / etc.
- **Descrição**: O que estava errado e por que é problema
- **Correção aplicada**: O que foi feito para corrigir
- **Iteração**: Em qual iteração do loop foi encontrado/corrigido

## Análise de Cobertura
- **User Stories atendidas**: listar cada story e se o código a atende
- **Use Cases cobertos**: listar cada use case (feliz + erro) e se o código trata
- **Test Cases preparados**: listar cada TC e se o código tem os caminhos necessários para passar
- **Gaps identificados**: algum requisito que NÃO está coberto pelo código?

## Análise de Segurança
- Input validation: ✅/❌
- Auth/authorization: ✅/❌/N/A
- Dados sensíveis expostos: ✅/❌
- Injection vectors: ✅/❌

## Análise de Qualidade
- Código duplicado: sim/não (se sim, justificativa)
- Complexidade ciclomática: aceitável/alta
- Naming e legibilidade: ok/melhorias aplicadas
- Consistência com codebase: ok/ajustes feitos

## Veredicto Final
- **Status**: ✅ APROVADO para testes / ❌ REQUER mais correções
- **Confiança**: Alta / Média / Baixa (justificar se não for Alta)
- **Notas para o teste**: pontos específicos que o teste deve validar com atenção
```

Regras RÍGIDAS:
- **NÃO crie PR** — apenas revise e corrija
- **NÃO aprove PR** — apenas comente se existir
- **Atualizar PR existente** com comentários e descrição = PERMITIDO (use `gh pr view` para verificar se existe)
- Considere o nome da branch como referência do card (ex: `nivee` → feature nivee)
- **Qualquer erro encontrado deve ser corrigido imediatamente, não apenas documentado**
- **O relatório deve ser BRUTALMENTE honesto** — se a confiança não é Alta, explique por que
- **Se o veredicto for ❌** → volte ao Step 7b, corrija, e rode o Step 8 inteiro novamente
- **O relatório NÃO é opcional** — sem `kanban/08-code-review/<feature>.md` criado, o step NÃO está completo

```
## Step 8 — Code Review Crítico
Iterações do loop: <N>
Problemas encontrados: <N> (todos corrigidos)
Arquivo criado: kanban/08-code-review/<feature>.md
Veredicto: ✅ APROVADO / ❌ VOLTAR ao Step 7b
```

### Step 9 — Run Test

- **tsc/lint são pré-requisitos obrigatórios, mas NÃO substituem o teste real**
- Rode tsc/lint primeiro. Se falhar, volte pro Step 7.
- Depois de tsc/lint passar, rode o **teste real** usando a ferramenta correta:

#### Escolha do método de teste (OBRIGATÓRIO — não é opcional):

| Contexto da mudança | Ferramenta | Como |
|---|---|---|
| **Mobile (React Native)** | Android emulator via ADB | Usar Bash tool com `adb shell` commands para navegar e validar. Ou pedir ao usuário para testar no device e enviar screenshot. |
| **Web (Next.js/frontend)** | MCP Playwright | Usar tools `mcp__playwright-*` (browser_navigate, browser_click, browser_snapshot, etc.) para testar o fluxo real no browser. |
| **API/Backend** | curl/httpie ou test suite | Chamar endpoints reais ou rodar test suite existente. |

#### Regras RÍGIDAS:
- **NUNCA marque um TC como PASSED apenas com tsc** — tsc verifica tipos, não comportamento
- **CADA TC deve ter prova real**: screenshot (Playwright snapshot / emulator screenshot) ou output do comando
- **NUNCA aceite SKIP ou BLOCKED** — se não conseguir testar, resolva o bloqueio (instale tool, suba emulator, ajuste config, peça credenciais). Só pergunte ao usuário como ÚLTIMO recurso após esgotar todas as tentativas.
- **FORCE até conseguir testar via FRONT** — cada TC deve ser executado como se fosse um usuário real navegando no app (login → navegar → executar ação → validar resultado → screenshot de prova). Sem atalhos de API ou verificação apenas por código.
- Após cada teste, marcar o resultado: **PASSED** (com evidência) ou **FAILED** (motivo + fix imediato). Não existe status BLOCKED ou SKIP.
- **OBRIGATÓRIO: Organize** `kanban/09-run-test/` → leia existentes → crie ou atualize `<tópico>.md` com resultados
- **OBRIGATÓRIO: Atualize** `docs/05-test-cases/<tópico>.md` com status PASSED/FAILED via Edit tool
- **OBRIGATÓRIO: Execute TODOS os TCs de regressão** criados no Step 7b — mesma exigência de prova real. TCs de regressão validam que features impactadas pela mudança continuam funcionando.
- Se algo falha (TC da feature OU TC de regressão), volta pro Step 7 e corrige

```
## Step 9 — Run Test (duas baterias)

### 1ª Bateria (pós-implementação, antes do code review)
Pré-requisitos: tsc ✅ lint ✅
Feature TCs:
- TC-001: [cenário] — PASSED (screenshot)
- TC-002: [cenário] — PASSED (screenshot)
Regression TCs:
- TC-REG-001: [feature impactada — cenário] — PASSED (screenshot)
Resultado 1ª bateria: ✅ ALL PASSED
Arquivo: kanban/09-run-test/<feature>-batch1.md

### 2ª Bateria (pós-code review, reteste completo do zero)
Code review alterou: [listar arquivos/lógica alterada pelo review]
Feature TCs (re-executados do zero):
- TC-001: [cenário] — PASSED (screenshot NOVO)
- TC-002: [cenário] — PASSED (screenshot NOVO)
Regression TCs (re-executados do zero):
- TC-REG-001: [feature impactada — cenário] — PASSED (screenshot NOVO)
Resultado 2ª bateria: ✅ ALL PASSED
Arquivo final: kanban/09-run-test/<feature>.md (contém ambas as baterias)
Arquivo atualizado: docs/05-test-cases/<feature>.md
```

**ANTI-PADRÕES (PROIBIDOS):**
```
## Step 9 — Run Test
Ran tsc --noEmit, no new errors. All pre-existing.
- TC-001: Tap Stripe card — needs manual test on device.
```
Isso NÃO é o Step 9. O tsc é pré-requisito, não o teste. "Needs manual test" sem executar = não testou.

```
- TC-003: BLOCKED (emulator não disponível)
- TC-004: SKIP (não consegui acessar a tela)
```
BLOCKED e SKIP não existem. Resolva o problema e teste. Se o emulator não sobe, suba. Se a tela não carrega, debugue. Force até testar via front como um usuário real faria.

### Step 10 — Done

- Task revisada, testada, funcionando
- **OBRIGATÓRIO: Organize** `kanban/10-done/` → leia existentes → crie ou atualize `<tópico>.md` — resumo final com:
  - Links para todos os docs criados (steps 1-9)
  - Lista de arquivos de código alterados
  - Status final dos test cases (todos PASSED)
  - Conteúdo do todo (tasks completadas) incorporado no resumo final
- **OBRIGATÓRIO: Delete** `kanban/06-todo/<feature>.md` via Bash (`rm`) — o todo folder só contém trabalho ativo. Quando uma feature está done, seu arquivo todo deve ser removido. Se todas as features estão done, `kanban/06-todo/` deve estar vazio (exceto README.md se existir).

```
## Step 10 — Done
- Código revisado
- Testes passando
- Arquivo criado: kanban/10-done/<feature>.md
- Arquivo deletado: kanban/06-todo/<feature>.md (todo folder = only active work)
```

**NÃO pule do Gate Check direto para o Implementar.** O To Do e Test Cases devem ser exibidos ANTES de qualquer código ser escrito.

---

## Loops de Execução (Steps 7-9 detalhados)

Após os steps 1-6 estarem completos (docs criados), a execução segue **quatro loops obrigatórios** com **duas baterias completas de teste**:

```
Loop 1: Implementar + Testar (1ª bateria)
  → Garante que o código funciona ANTES do code review

Loop 2: Code Review Crítico
  → Revisa, corrige, refatora. Pode alterar código significativamente.

Loop 3: Reteste Completo (2ª bateria)
  → Retesta TUDO do zero após o code review — porque o review MUDA código.

Loop 4: Done
  → Só entra aqui com 2 baterias de teste PASSED.
```

**Por que duas baterias?** O code review (Loop 2) frequentemente corrige bugs, refatora, e altera lógica. Código que passava nos testes ANTES do review pode quebrar DEPOIS. Uma única bateria de testes NÃO é suficiente — é obrigatório retestar TODO o fluxo após o review.

---

### Loop 1 — Implementar e Testar (Steps 7a + 7b + 1ª bateria de testes)

```
PREPARAR:
  1. Ler TODOS os docs da feature: steps 1-6
  2. Ler o código existente relevante (componentes, services, hooks, routes, schemas)
  3. Criar prompt/plano em kanban/07-implementation/<feature>.md (Step 7a)
  4. Perguntar ao usuário se o plano está OK antes de prosseguir

IMPLEMENTAR:
  5. Reler kanban/07-implementation/<feature>.md como referência-mestre
  6. Implementar a correção/feature seguindo o plano (Step 7b)
     — Aplicar TODAS as práticas obrigatórias do Step 7b (SOLID, refatoração, segurança, etc.)
     — Criar TCs de regressão para features impactadas
  7. SE problema NÃO resolvido → atualizar o plano com aprendizados e voltar ao passo 5
  8. SE problema resolvido → atualizar checklist do plano em kanban/07-implementation/<feature>.md

1ª BATERIA DE TESTES (obrigatória ANTES do code review):
  9. Rodar tsc/lint — se falhar, voltar ao passo 5
  10. Executar TODOS os TCs da feature via front (PW Browser MCP ou ADB)
  11. Executar TODOS os TCs de regressão criados no Step 7b
  12. Para CADA TC: PASSED (com screenshot) ou FAILED (fix imediato + re-test)
  13. SE algum TC FAILED após fix → voltar ao passo 5
  14. SE todos PASSED → registrar resultados em kanban/09-run-test/<feature>-batch1.md
  15. Prosseguir para Loop 2
```

Regras do Loop 1:
- **Nunca comece a codar sem o plano criado** — o plano é pré-requisito absoluto
- **Nunca declare resolvido sem evidência** (screenshot PW / output ADB)
- **Nunca pule a 1ª bateria de testes** — o code review DEVE receber código já testado e funcional
- **Nunca pare o loop sem resolver** — se travar, pergunte ao usuário
- O plano é vivo — atualize-o com cada iteração do loop (decisões mudadas, abordagens descartadas)
- Após resolver, registre a solução que funcionou no doc da feature
- A 1ª bateria usa as mesmas regras rígidas do Step 9 (sem SKIP, sem BLOCKED, prova real via front)

### Loop 2 — Code Review Crítico (Step 8)

```
REPETIR até ZERO issues:
  1. Rodar `git diff main...HEAD` para ver TODAS as mudanças
  2. Reler kanban/07-implementation/<feature>.md — o código implementa tudo?
  3. Reler docs/05-test-cases/<feature>.md — todos os cenários cobertos?
  4. Reler docs/02-stories-and-cases/<feature>-use-cases.md — edge cases tratados?
  5. Revisar CADA arquivo com análise crítica (segurança, performance, padrões, lógica)
  6. SE encontrar problema → corrigir IMEDIATAMENTE e voltar ao passo 1
  7. SE limpo → criar relatório em kanban/08-code-review/<feature>.md
  8. SE veredicto ❌ no relatório → voltar ao Step 7b, corrigir, e reiniciar este loop
  9. SE veredicto ✅ → prosseguir para Loop 3 (2ª bateria de testes)
```

Regras do Loop 2:
- **O code review é o guardião da qualidade** — não é formalidade, é crítico
- **Brutalmente honesto** — se algo está "ok mas poderia ser melhor", corrija agora
- **O relatório documenta TUDO** — inclusive problemas já corrigidos, para rastreabilidade
- **NÃO aceitar "bom o suficiente"** — o loop só fecha com ZERO issues
- **ATENÇÃO**: qualquer correção feita aqui INVALIDA a 1ª bateria de testes — por isso a 2ª bateria (Loop 3) é obrigatória

### Loop 3 — Reteste Completo (2ª bateria de testes — Step 9 final)

**Esta é a bateria definitiva.** O code review (Loop 2) pode ter alterado código, corrigido bugs, refatorado lógica, ou mudado comportamento. Tudo que passou na 1ª bateria precisa ser retestado do ZERO.

```
REPETIR até todos os TCs passarem:
  1. Ler docs/05-test-cases/<feature>.md (TCs da feature + TCs de regressão)
  2. Consultar kanban/08-code-review/<feature>.md — focar nos "pontos para o teste" do relatório
  3. Identificar o que o code review ALTEROU — esses pontos recebem atenção redobrada
  4. Para CADA test case (feature + regressão): executar DO ZERO via PW Browser MCP (web) ou ADB (mobile)
     — NÃO reaproveite screenshots da 1ª bateria. Cada TC deve ser re-executado por completo.
  5. Marcar resultado: PASSED (com evidência NOVA) ou FAILED (com motivo)
  6. SE encontrou bug → corrigir IMEDIATAMENTE e re-executar o TC
  7. Criar/atualizar kanban/09-run-test/<feature>.md com resultados da 2ª bateria
     — O relatório final deve conter AMBAS as baterias para rastreabilidade
  8. SE algum TC ainda FAILED → voltar para Loop 2 (re-review + re-fix + re-test)
  9. SE todos PASSED → prosseguir para Step 10 (Done)
```

Regras do Loop 3:
- **NUNCA aceitar SKIP ou BLOCKED** — não existe. Se algo impede o teste, resolva o impedimento (suba serviço, instale dep, ajuste config). Só pergunte ao usuário após esgotar todas as tentativas.
- **FORCE via FRONT** — cada TC deve ser testado como um usuário real faria: abrir o app/browser, navegar, clicar, preencher, validar visualmente com screenshot. Sem atalhos de API, sem "verificar no código", sem "funciona em teoria".
- **TUDO do zero** — a 2ª bateria re-executa 100% dos TCs, não apenas os afetados pelo review. O motivo: correções no review podem ter efeitos colaterais inesperados.
- Se um TC falha, corrija o bug e re-execute imediatamente — loop até PASSED
- Só saia do loop quando 100% dos TCs estiverem PASSED com evidência visual NOVA (screenshot)
- Use credenciais de teste fornecidas pelo usuário (ou crie usuários se necessário)
- **Usar notas do relatório de code review** como guia para testes mais rigorosos nos pontos críticos
- **Se Loop 3 falhar e exigir correção de código** → o fix invalida o review → voltar ao Loop 2 → depois Loop 3 novamente. O ciclo só encerra quando: review limpo + 2ª bateria 100% PASSED.

### Referência de card (adaptável)

Quando o usuário fornecer um card Jira como `$ARGUMENTS`, use como referência principal. Quando não houver card Jira, os docs da feature em `docs/` são a referência:
- `docs/01-problem/<feature>.md` = descrição do problema
- `kanban/06-todo/<feature>.md` = tasks e solução aplicada
- `docs/05-test-cases/<feature>.md` = test cases a executar
- `kanban/07-implementation/<feature>.md` = plano/prompt de implementação
- `kanban/08-code-review/<feature>.md` = relatório de code review
- `kanban/09-run-test/<feature>.md` = resultados dos testes

---

## Comportamento

- Trate TODAS as instruções em CLAUDE.md como obrigatórias, não como sugestões.
- Se houver conflito entre instruções de diferentes CLAUDE.md, o arquivo mais específico (subdiretório) tem prioridade sobre o raiz.
- Se o argumento `$ARGUMENTS` for fornecido, use como contexto adicional para a feature.
- **O protocolo de enforcement persiste por TODA a conversa** — não apenas na resposta imediata.
- Se perceber que está desviando das instruções ou do gate, corrija imediatamente.
- O Gate Check é sua primeira ação antes de qualquer código. Trate como um pre-commit hook mental.

### Precisão > Velocidade

- **Pause entre steps**: ao finalizar um step, releia o que produziu e valide se está correto antes de avançar. Se tiver dúvida, pergunte ao usuário.
- **Leitura profunda**: antes de cada step, leia TODOS os arquivos relevantes (docs dos steps anteriores + código existente). Não confie na memória — releia.
- **Pergunte sempre que**: (1) a decisão impactar arquitetura, (2) houver mais de uma forma de implementar, (3) o requisito estiver ambíguo, (4) o step anterior tiver algo que não faz sentido.
- **Nunca invente contexto**: se o usuário não disse, não assuma. Pergunte.
