# Step 14 — Criar Test Cases

**Effort: max**


## Objetivo
Criar N test cases (N = score de complexidade do step 13), todos executáveis via front, cada um com step de prova (screenshot após trigger) e TaskCreate individual.

## Regras Absolutas dos TCs

1. **Via front obrigatório** — verificação de código não conta como TC
2. **Step de prova após o trigger** — sempre incluir passo de screenshot/verificação visual
3. **TaskCreate individual por TC** — criar uma task separada para cada TC
4. **Artefato-pai obrigatório** — cada TC deriva de um problema/interpretação do mapa
5. **TC sem artefato-pai = filler** — deletar e recriar corretamente

## Template de TC

```markdown
### TC-N — [Nome descritivo em 3-5 palavras]

**Derivado de:** [Interpretação X / Problema Y do Mapa]
**Tipo:** Happy path / Negative / Edge case / Regression

**Pré-condições:**
- Usuário: [tipo exato]
- Dados: [estado necessário]
- URL de início: [URL exata]

**Passos:**
1. [Ação exata]
2. [Ação exata]
3. [Trigger — ação que aciona o comportamento]
4. ⚡ **PROVA:** Tirar screenshot da tela após o trigger
5. [Verificar elemento/mensagem/comportamento específico]

**Resultado esperado (após o fix):** [o que deve acontecer]
**Resultado atual (bug):** [o que acontece agora sem o fix]
**Critério de PASSED:** [condição objetiva e verificável]
```

## Sub-steps

### 14.1 — Listar artefatos-pai
Cada problema/interpretação REPRODUCED no Mapa de Problemas precisa de pelo menos 1 TC.

### 14.2 — Criar N TCs seguindo o template
N = score do step 13. Distribuir TCs priorizando:
- TC-1: reprodução exata do bug principal
- TC-2: variação de condição (usuário diferente / estado diferente)
- TC-3+: edge cases, fluxos laterais, regressões

### 14.3 — Criar TaskCreate individual por TC
```
TaskCreate: "TC-1 — [nome do TC]"
TaskCreate: "TC-2 — [nome do TC]"
...
TaskCreate: "TC-N — [nome do TC]"
```

### 14.4 — Atualizar card .md
Preencher seção "Test Cases" com todos os N TCs completos.

```yaml
step: 14
step-status: done
```

## Critério de Saída
- N TCs criados (N = score exato do step 13)
- Cada TC tem step de prova (⚡ PROVA: screenshot)
- Cada TC tem TaskCreate individual criada
- Todos derivam de artefato do Mapa de Problemas
- Card .md atualizado com todos os TCs

Após step 14 completar: rode `/jira` para continuar. Step 15 usa o mesmo modelo (Opus).
