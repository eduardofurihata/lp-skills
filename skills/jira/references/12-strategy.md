# Step 12 — Estratégia de solução

**Effort: max**

---

## Objetivo
Definir com precisão como o bug será corrigido: quais arquivos, quais mudanças, qual impacto esperado.

## Sub-steps

### 12.1 — Reler card .md completo
Especialmente: descrição original, interpretações, mapa de problemas, causa raiz identificada.

### 12.2 — Analisar código da causa raiz
Ler o(s) arquivo(s) identificados na investigação:
- Lógica atual (o que está fazendo)
- Por que está causando o bug (raiz real)
- Pontos de entrada e saída do fluxo

### 12.3 — Mapear fluxos impactados pela correção
```markdown
## Fluxos Impactados pela Correção
- [Fluxo 1 — principal]: [como a correção afeta]
- [Fluxo 2 — lateral]: [possível efeito colateral]
- [Fluxo 3 — edge case]: [se aplicável]
```

### 12.4 — Definir abordagem de solução
```markdown
## Estratégia de Solução

**Referências de mercado (OBRIGATÓRIO):**
[Big pop tech apps, players do mesmo domínio, OU outras referências relevantes (mesmo de outro segmento) que contribuam para a análise — solução do mercado é baseline para competir no nível #1. Complexidade aceitável para essa qualidade é REQUISITO, não obstáculo.]

**Abordagem:** [descrição clara do que será feito, alinhada à referência acima]

**Arquivos a modificar:**
- `path/to/file.ts:linha` — [o que muda e por quê]
- `path/to/other.ts:linha` — [o que muda]

**Arquivos a criar (se necessário):**
- `path/to/new-file.ts` — [propósito]

**Por que esta abordagem:**
[justificativa técnica — por que esta e não alternativas]

**Alternativas descartadas:**
- [alternativa] — [por que descartada]

**Riscos e side-effects:**
[o que pode ser afetado indiretamente]
```

### 12.5 — Validar cobertura das interpretações
A estratégia resolve TODOS os problemas marcados como reproduzidos no step 7-9?
- Se não → expandir a estratégia ou registrar como fora do escopo (com justificativa)

## Critério de Saída
- Estratégia definida com arquivos e linhas específicos
- Fluxos impactados mapeados
- Riscos documentados
- Estratégia cobre todos os problemas REPRODUCED
- Pronto para análise de complexidade (step 13)
