# Step 16 — Code Review

**Effort: max**


## Objetivo
Revisar o próprio código antes de testar, identificando problemas antes de executar os TCs.

## Sub-steps

### 16.1 — Ver diff completo das mudanças
```bash
git diff
```
Rever cada linha alterada sem exceção.

### 16.2 — Aplicar checklist de revisão

Publicar o checklist no chat antes de qualquer veredicto:

```markdown
## Code Review — Step 16

**Lógica:**
- [ ] A lógica resolve o bug sem introduzir novos bugs?
- [ ] Edge cases cobertos?
- [ ] Sem lógica morta (código nunca alcançado)?
- [ ] Condições de erro tratadas?

**Segurança:**
- [ ] Sem SQL injection / XSS / injeção?
- [ ] Dados de usuário tratados corretamente?
- [ ] Sem secrets hardcoded?

**Qualidade:**
- [ ] Sem console.log de debug?
- [ ] Tipos TypeScript corretos (sem `any` desnecessário)?
- [ ] Segue naming conventions do codebase?
- [ ] Sem código comentado?

**i18n (app multilíngue):**
- [ ] Nenhum texto visível ao usuário hardcoded? (usar `t('key')` ou equivalente)
- [ ] Novas strings adicionadas aos arquivos de tradução?
- [ ] Chaves de i18n seguem o padrão de nomenclatura do projeto?
- [ ] Pluralização e interpolação cobertas (se aplicável)?

**Cobertura dos TCs:**
- [ ] A implementação permite que todos os N TCs passem?
- [ ] Algum TC não seria coberto por esta implementação?

**Veredicto:** ✅ Aprovado para testes / ❌ Bloqueado — [problema encontrado]
```

### 16.3 — Se ❌ Bloqueado
1. Corrigir o problema identificado no step 15
2. Repetir a verificação tsc/eslint
3. Repetir o code review (16.1 → 16.2)
4. Só avançar quando ✅ Aprovado

```yaml
step: 16
step-status: done
```

## Critério de Saída
- Checklist 100% ✅
- Veredicto: ✅ Aprovado publicado no chat
- Zero console.logs
- Zero erros tsc
- Pronto para step 17a

**Após aprovação:** rode `/jira` para iniciar step 17a. O step 17a irá instruir o switch de modelo quando iniciado.
