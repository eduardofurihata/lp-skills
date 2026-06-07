# Step 6 — Entender o card

**Effort: max**


## Objetivo
Extrair todos os requisitos, condições e contexto do card antes de investigar. Sem pressupostos. O objetivo é ter clareza suficiente para reproduzir o bug exatamente.

## Sub-steps

### 6.1 — Reler descrição completa sem pressupostos
Do zero, prestando atenção em:
- Condições específicas de trigger
- Tipo de usuário/conta afetado
- URLs ou fluxos específicos mencionados
- Dados ou estado necessário para reproduzir

### 6.2 — Identificar ambiente necessário
```markdown
## Ambiente Necessário
- Usuário: [conta normal / admin / conta específica / tipo de plano]
- Dados: [produto específico / configuração / estado]
- Integrações: [integração ativa / webhook / API]
- URL/Fluxo: [URL exata mencionada no card]
```

### 6.3 — Considerar ambiguidades (se existirem)
Usuários frequentemente escrevem cards de forma imprecisa. Se o texto do card permitir múltiplas leituras genuínas, registrá-las:

```markdown
## Ambiguidades do Card (se houver)
- Ponto ambíguo: [descrever]
  - Leitura A: [interpretação]
  - Leitura B: [interpretação]
```

**Regra:** Registrar ambiguidades apenas se o card for genuinamente ambíguo.
- Card claro → nenhuma ambiguidade necessária, uma interpretação é suficiente
- Card ambíguo → listar as leituras para guiar a investigação
- **NÃO forçar múltiplas interpretações quando o card é claro**

### 6.4 — Mapear área do código (preliminar)
Sem mergulhar no código — apenas identificar módulo/componente/área provável com base no card.

### 6.5 — Atualizar card .md
Preencher seção "Ambiente Necessário" e, se aplicável, "Ambiguidades do Card".

## Critério de Saída
- Seção "Ambiente Necessário" preenchida
- Ambiguidades registradas SE o card for ambíguo (opcional quando card é claro)
- Pronto para investigação (step 7)

## ❌ Bloqueantes
- Ambiente completamente indefinido → Definir antes de iniciar step 7
