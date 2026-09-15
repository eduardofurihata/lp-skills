# Step 7 — Implementação (7a: Plano + 7b: Codificar)

**Chame e use:** `/solve` · `/principles` · `/front` (se tem UI) — os três via Skill tool · `lentes.md` (linha deste step) · `follow-ups.md`

## 7a — Plano de Implementação (OBRIGATÓRIO antes de codar)

### Artefato

`kanban/07-implementation/<tópico>.md` — prompt-mestre autocontido; nome por domínio; doc que já cobre o domínio se **atualiza**, não se duplica (`inventario-docs.md`).

### Estrutura

```markdown
# Plano de Implementação — <feature>

## 1. Contexto Consolidado
- Problema (de 01-problem), Stories (de 02-user-stories), Use Cases (de 03-use-cases), Spec (de 04-spec), Design (de 04-design, se tem UI)

## 2. Código Existente Relevante
- CADA arquivo/módulo a modificar/reutilizar: o que faz, impacto, dependências, padrões
- **Configuração i18n (OBRIGATÓRIO verificar):** o projeto tem i18n? Procure `next-intl`, `react-i18next`, `next-i18next`, `i18n.config*`, `i18next`, pasta `locales/`, `translations/`, `messages/`, `lang/`.
  - Se SIM: identifique biblioteca, arquivos de chaves, convenção de naming (ex: `feature.section.key`). Liste TODAS as strings user-facing novas/alteradas como chaves. Proibido literal hardcoded. Se múltiplos idiomas, traduza para todos.
  - Se NÃO: documente no plano e prossiga com strings literais.

## 3. Estratégia de Implementação
- Ordem de tasks (de 06-todo), abordagem técnica por task, arquivos a criar/modificar, dependências
- **Referência big apps:** como as big pop tech apps / líderes do domínio resolvem este problema de UX?
- **Responsabilidade por arquivo (SRP):** para CADA arquivo a criar/modificar, uma frase — o que ele faz. Não coube em uma frase → o arquivo está fazendo duas coisas.

## 3.1 Reúso antes de criar (DRY) — OBRIGATÓRIO
Resultado do grep em `packages/shared/`, `src/lib/`, `src/components/ui/`, `src/hooks/` (e equivalentes do projeto):

| Preciso de | Já existe? | Decisão |
|---|---|---|
| <capacidade> | `caminho/arquivo.ts` | reutilizar / estender / **criar (por quê nada serve)** |

**Arquivo novo só entra nesta tabela com a justificativa de por que o existente não serve.** "Não procurei" não é resposta.

## 3.2 O que NÃO vamos construir (YAGNI) — OBRIGATÓRIO
Abstrações, camadas, flags, configs e generalizações que foram **consideradas e descartadas** por não ter UC (Step 3) que as exija:

- <coisa descartada> — descartada porque nenhum UC pede; se aparecer demanda, entra depois.

Seção vazia é suspeita: significa que nada foi cogitado, ou que tudo que foi cogitado entrou.

## 3.3 Motores — OBRIGATÓRIO
Toda capacidade tem **um** dono (`principles/SKILL.md` § Motores):

| Capacidade | Motor | Ação |
|---|---|---|
| <o que o sistema precisa saber fazer> | `caminho/motor.ts` | **nasce** / **estende** / **absorve** lógica dispersa de `a.tsx`, `b.ts` |

**Absorver é planejado, não improvisado:** liste onde a mesma regra está espalhada hoje e que passa a só chamar o motor.

## 3.4 Design System — OBRIGATÓRIO se a feature tem superfície visual
Lido de `docs/04-design/<tópico>.md` (as telas decididas no Step 4b) e de `docs/04-design/design-system.md` (doutrina: `/front`):

| Preciso de | DS tem? | Decisão |
|---|---|---|
| <token/componente> | sim / não | **reusar** / **compor** de X+Y / **promover ao DS** (nunca criar na pasta da feature) |

- **Padrões existentes no app** que a feature toca: quais segue (consistência) e quais **eleva** por estarem abaixo do nível #1 (`front/SKILL.md` § *Consistência é lei; mediocridade não é*)
- **Tokens novos** a promover: … (com o motivo de nenhum existente servir)
- **Estados a implementar** por componente: vazio · carregando · erro · sucesso · limite · hover/focus/active/disabled/selected
- **Zero valor literal planejado** — se o plano já traz `#hex` ou `13px`, o 7b nasce errado.

## 3.5 Perímetro da refatoração — OBRIGATÓRIO
O que esta feature vai **abrir, ler ou atravessar** — e o que sobe em cada um (`principles/SKILL.md` § Refatoração contínua):

| Arquivo do perímetro | Por que entra | O que será elevado |
|---|---|---|
| `caminho/arquivo.ts` | editado / lido p/ entender / dependente do grep / no caminho do fluxo | duplicação → motor · naming · >40 linhas · morto · `a.b.c.d` · **ou** "já está no nível #1" |

## 4. Mapa de Test Cases → Código
- Para CADA TC: qual código atende, edge cases, validações necessárias

## 5. Riscos e Pontos de Atenção
- Edge cases especiais, integrações, impactos existentes, pontos para pausar e perguntar

## 6. Checklist de Implementação
- [ ] Task 1: descrição — arquivos: [lista]
```

### Regras

- Plano COMPLETO e AUTOCONTIDO — qualquer pessoa/AI implementa lendo apenas este arquivo + código
- Dúvida técnica → resolva autonomamente (`/solve` > código existente). Documente no plano.
- Plano é **vivo**: pode ser atualizado **durante 7b** para registrar desvios/aprendizados. **Não pode** ser editado **após** 7b para retrofit.

## 7b — Codificar

Implemente seguindo o plano como referência-mestre com **disciplina de engenharia rigorosa**.

### Antes de codar cada task

- **Reler** `kanban/07-implementation/<feature>.md` — o plano já decidiu reúso (§ 3.1), o que não entra (§ 3.2), motores (§ 3.3), DS (§ 3.4) e perímetro (§ 3.5)
- **Identificar a camada:** controller/service/component/hook/schema/shared — respeite responsabilidades
- **Visual:** conforme § 3.4 do plano e `docs/04-design/design-system.md` — doutrina no `/front`
- **i18n (se configurado):** conforme § 2 do plano — string user-facing nova/alterada é chave de tradução; literal hardcoded em projeto com i18n = bug, mesmo com o texto "correto"

### Práticas Obrigatórias

**Arquitetura — o `/principles` na íntegra (invocado neste step), por arquivo aberto:** SOLID (os cinco), DRY, KISS, YAGNI, Law of Demeter, Motores, camadas e direção de dependências, com os limiares numéricos de lá. O plano já decidiu o que reusar (§ 3.1), o que não construir (§ 3.2) e qual motor é dono de cada regra (§ 3.3): o 7b **executa** essas decisões. Encontrou a mesma regra fora do motor → **absorve** conforme § 3.3, e o chamador passa a só chamar.

> Desvio do que o plano decidiu em § 3.1-3.4 é **decisão nova**: registre no plano (que é vivo em 7b) com o motivo. Desviar em silêncio é como a abstração especulativa entra sem ninguém decidir.

**Refatoração Obrigatória — a cada passada o código sobe** (`principles/SKILL.md` § Refatoração contínua): para CADA arquivo do perímetro do § 3.5, a tabela *Achou → Faça* de lá é o checklist, e a **regra do saldo** é o que o gateway cobra — o arquivo subiu, ou está declarado como já no nível #1. Dentro do perímetro, sem timidez; fora dele, balde C (`follow-ups.md`).

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

## Gateways 7a → 7b e 7b → 8

Critérios e formato: `gateways.md` — as quatro linhas obrigatórias do Gateway Check inclusive.
