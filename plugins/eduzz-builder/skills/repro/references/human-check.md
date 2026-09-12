# Human Check — validação pós-fix (sem bug)

## ⛔ OBRIGATÓRIO — NÃO IGNORAR (mesmo em FINISH MODE)
Não há auto-aprovação aqui. O usuário **DEVE** clicar no trigger e confirmar pessoalmente que o bug não acontece mais. PARAR e aguardar confirmação real.

---

## Objetivo
Reproduzir **todos os passos de navegação** do fluxo do Step 0 e parar exatamente 1 passo antes do trigger — para o usuário clicar e ver o comportamento **corrigido** ao vivo.

## Sub-steps

### 1 — Preparar ambiente idêntico ao Step 0.6/0.7
Reconstruir o mesmo estado da reprodução original (Step 0):
- Mesmo usuário / conta
- Mesmo estado de dados (recriar se necessário)
- Mesma URL de início do fluxo registrado no card

### 2 — Executar TODOS os passos de navegação, um a um
**Não pular direto para a URL final.** Seguir cada passo registrado no Step 0.6 na ordem exata: clicar nos mesmos elementos, preencher os mesmos campos, passar pelas mesmas telas.

**Parar imediatamente antes do trigger.** O trigger (botão/link/ação) deve estar visível, pronto para clicar. **Não clicar.**

### 3 — Screenshot do estado pré-trigger
Screenshot mostrando a tela com o trigger visível e o contexto completo — idêntico ao ponto de gatilho do bug original.

### 3b — Se o card mexeu em texto gerado por IA
Superfície de texto gerado por IA (derivada no Step 4 do `/method`) = **sim**? Então o human check não é só "o trigger está na tela": o que o usuário vai julgar é a **saída**, e **é aqui que o "funciona, mas lê mal" aparece** — o clique dá certo, o texto lê torto. Prepare a leitura, não só o clique:

- Saída já visível na tela → **transcreva-a inteira** no bloco abaixo (ele não deve precisar rolar para julgar).
- Saída que só nasce no clique → diga **o que ele deve ler** quando clicar e **contra qual referência** (`docs/04-spec/<tópico>.md` § Texto gerado por IA).
- Nunca resuma a saída com as suas palavras: o que ele valida é o que o produto escreveu.

### 4 — Publicar no chat e PARAR COMPLETAMENTE

```markdown
## ✅ Human check — browser posicionado — sua vez

Executei todos os passos do fluxo original. O ambiente está idêntico ao ponto do bug.

**👉 Clique em: [nome exato do botão/elemento]**
(URL atual: [url])

Comportamento esperado agora (corrigido): [o que deve acontecer agora que o bug foi corrigido]

**O que ler na saída:** tom/persona · completa até o fecho · no idioma do usuário · sem placeholder · sem invenção — a barra é [referência #1 nomeada no spec]   ← só com superfície de texto gerado por IA

Screenshot do estado atual: [evidência]

---
Após confirmar que o bug não ocorre mais, responda "ok" / "approved" / "ship" — aí eu pergunto se rodo o ship.
```

Atualizar o card:
```yaml
phase: ship
```

**PARAR COMPLETAMENTE. Não iniciar o ship até receber confirmação explícita do usuário. Nenhuma exceção.**

## Critério de Saída
- Todos os passos de navegação executados (sem atalho para a URL final)
- Browser parado 1 passo antes do trigger, com screenshot
- **PARADO** — aguardando confirmação humana (obrigatório, sem exceção)
