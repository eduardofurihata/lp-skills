# Step 15 — Implementação

**Effort: max**


## Objetivo
Implementar a correção seguindo exatamente a estratégia definida no step 12, sem scope creep.

## Sub-steps

### 15.1 — Reler strategy (step 12) e TCs (step 14) antes de escrever código
- Verificar lista de arquivos a modificar
- Verificar o que cada arquivo deve mudar
- Verificar o que os TCs vão validar — a implementação deve permitir que todos passem

### 15.2 — Implementar arquivo por arquivo
Para cada arquivo da estratégia:
1. **Ler o arquivo completo antes de editar** (nunca editar de memória)
2. Fazer a alteração mínima necessária
3. Verificar coerência lógica com o restante do arquivo
4. Não adicionar funcionalidades além do escopo

### 15.3 — Regra de escopo estrito
- Não refatorar código não relacionado ao fix
- Não adicionar features extras
- Não "melhorar" coisas não mencionadas na estratégia
- Código fora do escopo = regressão potencial

### 15.4 — Verificação básica pós-implementação
```bash
# TypeScript
npx tsc --noEmit

# ESLint (se configurado)
npx eslint [arquivos modificados]
```
Zero erros antes de prosseguir para code review.

### 15.5 — Registrar mudanças no card .md
```markdown
## Implementação
**Arquivos modificados:**
- `path/to/file.ts` — [descrição da mudança]

**Commit pendente:** sim
```

```yaml
step: 15
step-status: done
```

## Critério de Saída
- Todos os arquivos da estratégia modificados
- Zero erros de TypeScript nos arquivos modificados
- Sem código fora do escopo
- Sem console.logs de debug
- Pronto para code review (step 16)
