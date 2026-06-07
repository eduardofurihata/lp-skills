# Step 11 — Reproduzir no front + PARAR para validação humana

**Effort: max**


## Objetivo
Preparar o browser no estado imediatamente anterior ao trigger do bug, para que o usuário clique e veja o bug acontecer ao vivo.

## Sub-steps

### 11.1 — Abrir browser na URL correta
Navegar para o ponto de início do fluxo exato documentado no step 10. Não usar URL alternativa.

### 11.2 — Executar todos os passos EXCETO o trigger final
- Seguir exatamente as pré-condições e passos do step 10
- **Parar imediatamente antes do trigger do bug** (botão, ação, submit, etc.)
- Não clicar o trigger — o usuário vai clicar

### 11.3 — Posicionar browser no trigger e tirar screenshot
Screenshot mostrando a tela com o trigger visível e pronto para clicar. O estado deve ser idêntico ao que causaria o bug.

### 11.4 — Registrar no card .md
```markdown
## Reprodução Final (Step 11)
- Executado em: [data]
- Screenshot pré-trigger: [nome/link do arquivo]
- Trigger do bug: [descrição do elemento a clicar]
- Causa raiz confirmada: sim / parcial / a definir no step 12
```

```yaml
step: 11
step-status: done
```

### 11.5 — PARAR e publicar no chat

```markdown
## ✅ Browser posicionado — aguardando sua validação

O ambiente está pronto. Para ver o bug:

**👉 Clique em: [nome exato do botão/elemento]**
(URL atual: [url])

Screenshot de referência: [evidência do estado atual]

---
Após confirmar o bug, rode `/jira`. O step 12 irá verificar e instruir o switch de modelo.
```

**PARAR. Aguardar usuário confirmar o bug e rodar `/jira`.**

## FINISH MODE
Em FINISH MODE: registrar "Validação automática (finish mode)" no card .md e continuar para step 12 automaticamente.

## Critério de Saída
- Reprodução executada com sucesso via browser
- Screenshot de evidência capturada
- Card .md atualizado (`step: 11, step-status: done`)
- **PARADO — aguardando usuário rodar `/jira`**
