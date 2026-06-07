# Step 9 — Loop: Refinamento e Nova Iteração

**Effort: max**


## Quando chegar aqui
Step 8 retornou % < 90%. Precisamos de nova hipótese antes de voltar ao step 7.

## Objetivo
Documentar por que a iteração anterior ficou abaixo de 90% e definir uma abordagem diferente para a próxima simulação.

## Sub-steps

### 9.1 — Análise do gap
```markdown
## Loop — Iteração N+1

**Por que a iteração N ficou em XX%:**
- Aspecto que não bateu: [descrever]
- Hipótese sobre o motivo: [por que não reproduziu corretamente]
```

### 9.2 — Definir nova hipótese
O que será diferente nesta próxima tentativa:
- Diferente tipo de usuário?
- Diferente estado de dados?
- Diferente URL ou fluxo?
- Diferente sequência de ações?

```markdown
**Nova abordagem (Iteração N+1):**
- Mudança principal: [o que vai ser diferente]
- Nova hipótese: [por que isso deve reproduzir melhor]
```

### 9.3 — Atualizar card .md e voltar ao step 7
Registrar a nova abordagem no card .md e executar step 7 novamente com essa hipótese.

## Gateway 9 → Step 7 (sempre)
Este step SEMPRE termina voltando ao step 7. Não há outra saída.

## Quando Sair do Loop
O loop termina quando step 8 retornar ≥ 90%. Neste caso, step 9 é pulado e vai direto para step 10.

## Escalar Após Múltiplas Iterações
Se após 3-5 iterações o % ainda não chegar a 90%, usar AskUserQuestion com 6 campos:
1. O que está sendo testado
2. O que foi tentado (todas as iterações)
3. O que está sendo observado
4. Hipótese atual sobre o gap
5. O que está impedindo a reprodução correta
6. Qual informação adicional ajudaria

## Critério de Saída
- Nova hipótese documentada no card .md
- Próxima iteração claramente definida
- Retornar ao step 7 com nova abordagem
