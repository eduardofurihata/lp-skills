# Step 8 — Implementação (8a: Plano · 8b: Codificar)

**8a é o portão mais barato do protocolo** — o que o plano decidir errado vira código errado. Reúso, descarte, motor, DS e perímetro se decidem **por escrito** aqui; o 8b **executa**.

**Chame e use:** `/solve` via Skill tool

## 8a — Plano

`obra/08-implementation/<tópico>.md` — **autocontido**; nome por domínio; doc que já cobre o domínio se **atualiza** (`00-start.md`). O plano é **vivo** durante o 8b (desvio = decisão nova, com motivo) e **nunca** editado depois para retrofit.

```markdown
# Plano de Implementação — <feature>
## 1. Contexto — Steps 1-5 consolidados
## 2. Código existente — arquivos a tocar; i18n do projeto (lib, chaves) — string user-facing é chave, nunca literal
## 3. Estratégia — ordem das tasks (07-todo); referência big apps; responsabilidade de cada arquivo em uma frase; pontos de extensão e direção das dependências
### 3.1 Reúso antes de criar — preciso de → já existe? (grep) → reutilizar / estender / criar (justificado)
### 3.2 O que NÃO vamos construir — cogitado e descartado por não ter UC
### 3.3 Motores — capacidade → motor → nasce / estende / absorve
### 3.4 Design System (se tem UI) — preciso de → DS tem? → reusar / compor / promover; padrões a elevar; estados; zero literal
### 3.5 Perímetro — arquivo → por que entra → o que sobe, ou "já no nível #1"
## 4. Mapa TC → código · ## 5. Riscos · ## 6. Checklist de tasks
```

## 8b — Codificar

A cada task, **releia o plano**: ele já decidiu (§ 3.1-3.5).

- **Motor** — a capacidade mora nele e o chamador **só chama**; a mesma regra encontrada fora → **absorve**.
- **Perímetro** — cada arquivo do § 3.5 sai melhor do que entrou, ou declarado no nível #1 (`/principles`); fora dele, não se vasculha.
- **DS (se tem UI)** — zero literal, todos os estados, a11y AA, breakpoints do projeto; padrão ruim no perímetro se **eleva** (`/front`).
- **Em cada linha** — input validado, auth explícito, zero segredo no código, sanitize, least privilege; erro com contexto, nunca `catch {}`; sem N+1. O específico da stack: `.claude/patterns.md` do projeto.

**Tocou = testa impacto.** Para cada arquivo alterado: grep de quem o usa → features afetadas → `docs/06-test-cases/` cobre? Senão, TCs de regressão no arquivo da feature afetada.

## PARE se pensar

- **"Aplico tudo no 8b, lá é o lugar."** No 8b a complexidade especulativa já foi decidida no Spec e no Plano — você só implementa o erro. BLOQUEADO.

## Gateway 8a → 8b

- [ ] Plano autocontido, § 3.1 a § 3.5 preenchidas (3.4 se tem UI); i18n planejado se o projeto tem
- [ ] Artefato `obra/08-implementation/<tópico>.md` existe com conteúdo substantivo
- [ ] As **quatro linhas obrigatórias** publicadas (`SKILL.md` § Gateway Check)

## Gateway 8b → 9

- [ ] Todas as tasks marcadas; tsc/lint passam; desvios do plano **registrados**
- [ ] Capacidade espalhada **absorvida no motor**; perímetro elevado (regra do saldo); TCs de regressão criados
- [ ] **Se tem UI:** zero literal, todos os estados, a11y AA, breakpoints do projeto
- [ ] Follow-up que apareceu aqui, resolvido aqui — nada se caça
- [ ] As **quatro linhas obrigatórias** publicadas (`SKILL.md` § Gateway Check)
