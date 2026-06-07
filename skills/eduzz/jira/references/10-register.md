# Step 10 — Registrar como reproduzir

**Effort: max**


## Objetivo
Documentar com precisão os passos exatos para reproduzir o comportamento, de forma que qualquer pessoa possa replicar sem contexto adicional.

## Sub-steps

### 10.1 — Documentar passos numerados
Baseado na simulação bem-sucedida (≥90% do step 8/9):

```markdown
## Passos para Reproduzir

**Pré-condições:**
- Ambiente: local / staging
- Usuário: [tipo/conta exata]
- Dados necessários: [estado específico]
- URL de início: [URL exata]

**Passos:**
1. Acessar [URL exata]
2. [Ação exata — sem ambiguidade]
3. [Ação exata]
4. Observar: [comportamento que ocorre]

**Resultado esperado:** [o que deveria acontecer]
**Resultado atual:** [o que acontece de fato]
```

### 10.2 — Incluir evidências
- Screenshot do estado antes do trigger (baseline)
- Screenshot do comportamento bugado
- Console logs relevantes (se o bug gera erro no console)

### 10.3 — Identificar causa raiz (se visível após investigação)
```markdown
## Causa Raiz (Hipótese)
- Arquivo: `path/to/file.ts:linha`
- Função: `nomeDaFunção`
- Descrição: [o que está errado na lógica]
```
Se a causa raiz ainda não está clara, registrar "a investigar" — não inventar.

### 10.4 — Atualizar card .md
Preencher seção "Passos para Reproduzir" com conteúdo completo.

```yaml
step: 10
step-status: done
```

## Critério de Saída
- Passos documentados de forma reproduzível por qualquer pessoa
- Pré-condições explícitas e completas
- Resultado esperado vs. atual claramente distintos
- Screenshots de evidência referenciados
- Causa raiz documentada (ou "a investigar")
