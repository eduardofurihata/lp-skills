# Gateways — Critérios Bloqueantes entre Steps

**Cada transição crítica exige um Gateway Check explícito publicado no chat ANTES de iniciar o próximo step. Sem check visível = step não transitou.**

## Princípios (Ferro)

1. **Binário.** ✅ LIBERADO ou ❌ BLOQUEADO. Sem "quase", sem "mostly", sem "faço depois".
2. **Visível.** Publicado no chat ANTES de transitar. Gateway silencioso = não existe.
3. **Bloqueante.** ❌ → volta ao step atual e corrige. Nunca "pula pra arrumar depois".
4. **Atômico.** Pular 1 critério = pular o gateway. Ou 100% ou BLOQUEADO.

## Formato Padrão

```markdown
## Gateway Check — Step N → Step N+1
- [ ] Critério 1
- [ ] Critério 2
- **Veredicto:** ✅ LIBERADO / ❌ BLOQUEADO — motivo: [listar critério falhado]
```

---

## Tabela de Gateways

### Step 6 → Step 7 (Entender → Investigação)
- [ ] Seção "Ambiente Necessário" preenchida no card .md
- [ ] Ambiguidades do card registradas (SE existirem — não forçar)
- [ ] Tipo BUG ou FEATURE definido no frontmatter

### Step 8 (Avaliação) — Decisão de roteamento
Não é um gateway clássico mas uma decisão publicada:
```markdown
## % de Correspondência — Iteração N
- % de correspondência: XX%
- Veredicto: ✅ ≥90% — prosseguir para step 10 | ❌ <90% — ir para step 9
```
- ≥90%: prosseguir diretamente para step 10 (pular step 9)
- <90%: ir para step 9 (nova hipótese) → step 7 novamente

### Step 9 → Step 7 (Loop)
Sempre: nova hipótese documentada antes de retornar ao step 7.
- [ ] Razão do gap documentada
- [ ] Nova abordagem definida

### Step 9 → Step 10 (quando % ≥90%)
- [ ] % de correspondência ≥ 90% publicado no chat
- [ ] Screenshot de evidência da simulação existe
- [ ] Mapa de Problemas atualizado no card .md

### Step 11 → Step 12 (Reproduzir → Estratégia)
Step 11 completa normalmente. Step 12 verifica o modelo ao iniciar.
- [ ] Reprodução final executada via browser
- [ ] Screenshot de evidência final capturada
- [ ] Card .md atualizado (`step: 11, step-status: done`)
- **Veredicto:** ✅ LIBERADO — step 12 verificará o modelo ao iniciar

### Step 16 → Step 17a (Code Review → Rodar TCs)
Step 17a verifica o modelo ao iniciar.
- [ ] Checklist de code review 100% ✅
- [ ] Zero erros tsc/eslint
- [ ] Zero console.logs
- [ ] Veredicto "✅ Aprovado" publicado no chat
- **Veredicto:** ✅ LIBERADO — step 17a verificará o modelo ao iniciar

### Step 17a → Step 18 (TCs PASSED → Human Check)

**Pré-requisitos formais (AMBOS obrigatórios, publicados no chat ANTES deste Gateway):**
1. **Audit Pré-Execução** ✅ publicado
2. **Audit Pós-Execução** ✅ publicado

```markdown
## Gateway Check — Step 17a → Step 18
- Audit Pré-Execução publicado? ✅ SIM / ❌ NÃO
- Audit Pós-Execução publicado? ✅ SIM / ❌ NÃO
- TCs planejados: N
- TCs executados com evidência: N (✅ delta = 0)
- Status: N PASSED, 0 FAILED, 0 NOT_RUN
- Último ciclo sem mudanças de código? ✅ SIM
- **Veredicto:** ✅ LIBERADO para Step 18 / ❌ BLOQUEADO
```

### Step 17a → Step 17b (TC FAILED → Correção)
- [ ] Audit Pós-Execução publicado com F > 0 FAILED
- [ ] TCs FAILED identificados
- **Veredicto:** Step 17b verifica o modelo ao iniciar (Opus)

### Step 17b → Step 16 (Correção → Code Review)
- [ ] Root cause identificado e documentado
- [ ] Correção aplicada
- [ ] Zero erros tsc
- [ ] Pronto para code review em Opus

### Step 18 → Step 19 (Human Check → Ship)
- [ ] Fluxo original executado sem o bug
- [ ] Screenshot de evidência capturada
- [ ] Confirmação humana recebida (ou FINISH MODE registrado)

---

## Racionalizações Proibidas

| Racionalização | Realidade |
|----------------|-----------|
| "Gateway cobre tudo, audit é redundante" | NÃO. Audit = verificação intermediária. Gateway = certificação final. BLOQUEADO. |
| "Publico um audit só (combinado)" | NÃO. Dois audits distintos (antes + depois). BLOQUEADO. |
| "28 de 30 passaram, o resto é trivial" | NÃO. Delta > 0 = BLOQUEADO. |
| "1 TC falhou mas prioridade baixa" | FAILED fica FAILED. BLOQUEADO. |
| "% foi 85%, suficientemente próximo" | <90% = step 9. BLOQUEADO. |
| "Só criei TaskCreate de grupo, não individual" | 1 task de grupo ≠ TaskCreate individual por TC. BLOQUEADO. |
| "Code review aprovado antes da correção vale" | Qualquer mudança de código invalida code review anterior. Voltar ao step 16. |
