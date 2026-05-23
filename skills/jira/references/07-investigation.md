# Step 7 — Investigação: Simular no front

**Effort: max**


## Objetivo
Reproduzir o ambiente e condições exatas do card e acionar o comportamento descrito via browser. Sem simulação mental — reprodução real ou nada.

## Sub-steps

### 7.1 — Preparar ambiente completo
Criar ou configurar tudo necessário antes de abrir o browser:
```
- Criar usuário do tipo correto (se necessário): test2@test.com / Test123!@# ou criar novo
- Injetar dados necessários via API/banco/seed
- Configurar integrações necessárias
- Identificar URL/fluxo exato descrito no card
```
Não usar "usuário default" se o card especifica condições. Criar o ambiente certo.

### 7.2 — Executar simulação real via front
Seguir os passos descritos no card à risca:
- Use a URL/fluxo exato mencionado
- Use o tipo de conta/usuário especificado
- Execute o trigger descrito

### 7.3 — Analisar código (complementar, se necessário)
Se a simulação não revelou claramente o comportamento, analisar código da área afetada:
- Localizar arquivo/componente relevante
- Identificar fluxo de dados
- Buscar condições que causam o comportamento

Logs ajudam a localizar, mas reprodução via front é obrigatória.

### 7.4 — Registrar resultado no card .md
```markdown
## Mapa de Problemas

### Simulação — Iteração N
- Ambiente preparado: [o que foi criado/configurado]
- Passos executados: [exatamente o que foi feito]
- Comportamento observado: [o que aconteceu]
- Screenshot: [evidência capturada ou "não capturado"]
- Hipótese de causa: [o que pode estar causando]
```

## Critério de Saída
- Simulação executada via browser (não mental)
- Comportamento observado registrado no card .md
- Pronto para avaliação de correspondência (step 8)

## ❌ Racionalizações Proibidas

| Frase | Realidade |
|-------|-----------|
| "Deduzí pelos logs / stacktrace" | Logs localizam, mas reprodução via front é obrigatória. |
| "Vou simular mentalmente pelo schema" | Sem simulação mental. Reprodução real via front. |
| "Não consegui reproduzir, mas pelo código o bug é..." | NUNCA. Pare e pergunte ao usuário. |
| "Usuário default está bom" | Só se o card NÃO especificar condições. |
