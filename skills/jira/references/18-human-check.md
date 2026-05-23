# Step 18 — Human check no front (sem bug)

**Effort: max**


## ⛔ FINISH MODE — NÃO IGNORAR
**Step 18 é OBRIGATÓRIO mesmo em FINISH MODE.** Não há auto-aprovação aqui. O usuário DEVE clicar no trigger e confirmar pessoalmente. PARAR e aguardar confirmação real.

---

## Objetivo
Executar **todos os passos de navegação** do fluxo original e parar exatamente 1 passo antes do trigger — para que o usuário clique e veja o comportamento corrigido ao vivo.

## Sub-steps

### 18.1 — Preparar ambiente idêntico ao step 11
Configurar exatamente o mesmo estado da reprodução original:
- Mesmo usuário / conta
- Mesmo estado de dados (recriar se necessário)
- Começar da mesma URL de início do step 10

### 18.2 — Executar TODOS os passos de navegação do step 10, um por um
**Não pular para a URL final diretamente.** Seguir cada passo registrado no step 10 na ordem exata:
- Clicar nos mesmos elementos
- Preencher os mesmos campos
- Passar pelas mesmas telas intermediárias

**Parar imediatamente antes do trigger do bug.** O trigger (botão/link/ação) deve estar visível na tela, pronto para clicar. Não clicar.

### 18.3 — Screenshot do estado pré-trigger
Screenshot mostrando a tela com o trigger visível e o contexto completo. O estado deve ser idêntico ao ponto de gatilho do bug original.

### 18.4 — Publicar no chat e PARAR COMPLETAMENTE

```markdown
## ✅ Step 18 — Browser posicionado — sua vez

Executei todos os passos do fluxo original. O ambiente está idêntico ao ponto do bug.

**👉 Clique em: [nome exato do botão/elemento]**
(URL atual: [url])

Comportamento esperado após o clique: [descrição do que deve acontecer agora que o bug está corrigido]

Screenshot do estado atual: [evidência]

---
Após confirmar que o bug não ocorre mais, confirme com "ok", "approved", "ship" ou rode `/jira`.
```

```yaml
step: 18
step-status: done
```

**PARAR COMPLETAMENTE. Não iniciar step 19 até receber confirmação explícita do usuário. Nenhuma exceção.**

## Critério de Saída
- Todos os passos de navegação executados (não atalho direto para URL)
- Browser parado 1 passo antes do trigger
- Screenshot capturada mostrando o trigger visível
- **PARADO** — aguardando confirmação humana (obrigatório, sem exceção)
