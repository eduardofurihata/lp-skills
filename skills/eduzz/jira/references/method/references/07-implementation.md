# Step 7 — Implementação (7a: Plano + 7b: Codificar)

## 7a — Plano de Implementação (OBRIGATÓRIO antes de codar)

### Reler antes

- Steps 1-6 (todos) + código existente relevante

### Artefato

- **Pasta:** `kanban/07-implementation/`
- **Arquivo:** `<tópico>.md` — prompt-mestre autocontido

### Estrutura

```markdown
# Plano de Implementação — <feature>

## 1. Contexto Consolidado
- Problema (de 01-problem), Stories (de 02-user-stories), Use Cases (de 03-use-cases), Spec (de 04-spec)

## 2. Código Existente Relevante
- CADA arquivo/módulo a modificar/reutilizar: o que faz, impacto, dependências, padrões
- **Configuração i18n (OBRIGATÓRIO verificar):** o projeto tem i18n? Procure `next-intl`, `react-i18next`, `next-i18next`, `i18n.config*`, `i18next`, pasta `locales/`, `translations/`, `messages/`, `lang/`.
  - Se SIM: identifique biblioteca, arquivos de chaves, convenção de naming (ex: `feature.section.key`). Liste TODAS as strings user-facing novas/alteradas como chaves. Proibido literal hardcoded. Se múltiplos idiomas, traduza para todos.
  - Se NÃO: documente no plano e prossiga com strings literais.

## 3. Estratégia de Implementação
- Ordem de tasks (de 06-todo), abordagem técnica por task, arquivos a criar/modificar, dependências
- **Referência big apps:** como Instagram, Spotify, Gmail, Notion, Meta, iFood, Uber, Airbnb resolvem este problema de UX?
- **Consistência UI/UX:** quais padrões visuais e de interação já existem no app? Linguagem visual existente (cores, espaçamentos, tipografia, animações, componentes, feedback) é LEI.

## 4. Mapa de Test Cases → Código
- Para CADA TC: qual código atende, edge cases, validações necessárias

## 5. Riscos e Pontos de Atenção
- Edge cases especiais, integrações, impactos existentes, pontos para pausar e perguntar

## 6. Checklist de Implementação
- [ ] Task 1: descrição — arquivos: [lista]
```

### Regras

- Plano COMPLETO e AUTOCONTIDO — qualquer pessoa/AI implementa lendo apenas este arquivo + código
- Dúvida técnica → resolva autonomamente (padrão do projeto > big apps > boas práticas). Documente no plano.
- Plano é **vivo**: pode ser atualizado **durante 7b** para registrar desvios/aprendizados. **Não pode** ser editado **após** 7b para retrofit.

## 7b — Codificar

Implemente seguindo o plano como referência-mestre com **disciplina de engenharia rigorosa**.

### Antes de codar cada task

- **Reler** `kanban/07-implementation/<feature>.md`
- **Identificar a camada:** controller/service/component/hook/schema/shared — respeite responsabilidades
- **Buscar código reutilizável ANTES de criar:** Grep/Glob em `packages/shared/`, `src/lib/`, `src/components/ui/`, `src/hooks/`. Se existe parecido, reutilize — NÃO duplique.
- **Verificar direção de dependências:** shared → api/web ok. api → web ou web → api proibido.
- **Consistência UI/UX:** antes de criar/modificar componente visual, analise features similares já existentes. Padrões visuais e de interação = LEI. Não invente estilo novo. Sem padrão local → use big apps como referência.
- **i18n (se configurado):** TODA string user-facing nova/alterada DEVE ser chave de tradução, nunca literal. Strings literais hardcoded em projeto com i18n = bug, mesmo se texto estiver "correto".

### Práticas Obrigatórias

**Arquitetura (SOLID, Clean Architecture):**
- **SRP:** cada arquivo/classe/função faz UMA coisa. >40 linhas → extraia helper. Componente mistura lógica+UI → separe em hook+componente.
- **Separação de camadas:** controller=HTTP, service=lógica, componente=UI. Lógica de negócio NUNCA no controller/componente.
- **Baixo acoplamento, alta coesão:** módulos injetáveis, independentes. Sem dependências circulares.
- **KISS:** 5 linhas > 50 linhas.
- **YAGNI:** APENAS o que o plano especifica. Zero abstrações especulativas. 3 linhas similares > abstração prematura.
- **DRY:** confirme que não existe em shared/lib/components antes de criar novo.
- **Law of Demeter:** objeto só fala com vizinhos diretos. Evite `a.b.c.d.method()`.

**Refatoração Obrigatória (tocou = refatora):**

Para CADA arquivo aberto para edição, escaneie:
- **Tamanho:** services >400 linhas, componentes >300 → avalie divisão
- **Imports mortos / variáveis não usadas** → remova
- **Lógica duplicada** → extraia helper/util
- **Naming ruim** → renomeie
- **Comentários enganosos** → corrija/remova
- **TODO/FIXME resolúveis** → resolva agora ou deixe com contexto
- **Código morto** → delete completamente. Sem `_unused`, sem `// removed`, sem re-export

**Banco de Dados (quando aplicável):**
- Migrações versionadas (`npx prisma migrate dev --name descritivo`)
- Prisma client — raw SQL apenas com justificativa
- Índices em campos consultados (WHERE, ORDER BY, JOIN)
- Relations com `onDelete` explícito (Cascade/SetNull/Restrict)
- Preços em centavos (integer). Datas como ISO string quando necessário.

**Segurança (em cada linha):**
- **Input validation:** `class-validator` (backend), Zod (frontend). Input NUNCA chega sem validação.
- **Auth explícito:** cada endpoint declara `@Roles()` ou `@Public()`. Sem exceção.
- **Zero secrets no código:** variáveis de ambiente via `ConfigService`.
- **Sanitize:** conteúdo do usuário sanitizado antes de renderizar (XSS).
- **Least Privilege:** select fields específicos, não `select: *`.

**Erros e Observabilidade:**
- `catch (e) {}` proibido — sempre log ou re-throw com contexto
- Erros estruturados com contexto (operação, input, o que falhou)
- Frontend: mensagens amigáveis, nunca objetos brutos
- Logs com contexto (sem dados sensíveis) + stack trace

**Performance:**
- Sem N+1 queries — use Prisma `include`/`select`. Nunca query em loop.
- Memoize computações caras, evite criação inline em JSX
- Cache: React Query (read-heavy), `unstable_cache` (server)
- Lazy load componentes pesados (`React.lazy`, dynamic imports)
- Trade-offs conscientes e documentados

### Após cada task

- Marque no checklist do plano
- Auto-verifique: código satisfaz o use case?
- Diff mental: o que mudou vs. o que deveria? Efeitos colaterais?

### TCs de Regressão (tocou = testa impacto)

Para CADA arquivo alterado:

1. **Mapear dependentes:** Grep — quem importa/usa este arquivo?
2. **Identificar features afetadas:** cada dependente serve qual feature do produto?
3. **Verificar TCs existentes:** `docs/05-test-cases/` já cobre?
4. **Criar TCs de regressão:** para features sem cobertura adequada, TCs seguindo Step 5

- **Atualize** `docs/05-test-cases/` — seção `## TCs de Regressão`
- Se impactar OUTRA feature → adicione TCs no arquivo dela
- **Não existe "mudança isolada"** — toda mudança tem raio de impacto
- Proporção: shared/util → muitos TCs. Componente folha → poucos.

## Gateways

### 7a → 7b
- [ ] Plano autocontido (contexto + estratégia + mapa TC→código + checklist)
- [ ] i18n planejado se projeto tem i18n
- [ ] Referência de big apps citada para decisões UI/UX
- [ ] Artefato `kanban/07-implementation/<tópico>.md` existe com conteúdo substantivo

### 7b → 8
- [ ] Todas tasks do checklist marcadas
- [ ] tsc/lint passam
- [ ] "tocou = refatora" executado por arquivo aberto
- [ ] TCs de regressão criados em `docs/05-test-cases/` para features dependentes impactadas
