# Human Check — validação pós-fix (sem bug)

## ⛔ OBRIGATÓRIO — NÃO IGNORAR (mesmo em FINISH MODE)
Não há auto-aprovação aqui. O usuário **DEVE** clicar/executar o trigger e confirmar pessoalmente que o bug não acontece mais. PARAR e aguardar confirmação real.

---

## Objetivo
Reproduzir **todos os passos** do fluxo registrado no § 5 do `SKILL.md` e parar exatamente 1 passo antes do trigger — para o usuário disparar e ver o comportamento **corrigido** ao vivo, na mesma superfície onde viu o bug.

## Sub-steps

### 1 — Preparar ambiente idêntico ao § 5/§ 6
Reconstruir o mesmo estado da reprodução original, lendo `docs/jira/todo/<KEY>.md`:
- Mesmo usuário / conta
- Mesmo estado de dados (recriar se necessário)
- Mesmo ponto de partida registrado (URL / tela / endpoint) e mesma superfície (web `pw#` / mobile / API)

### 2 — Executar TODOS os passos, um a um
**Não pular direto para a URL final.** Seguir cada passo registrado no § 5 na ordem exata: clicar nos mesmos elementos, preencher os mesmos campos, passar pelas mesmas telas — ou, no caso de API, montar a mesma requisição, com o mesmo payload, e **não enviar**.

**Parar imediatamente antes do trigger.** O trigger (botão/link/ação/requisição) deve estar visível e pronto. **Não disparar.**

### 3 — Evidência do estado pré-trigger
Screenshot mostrando a tela com o trigger visível e o contexto completo (web/mobile) — ou a requisição pronta + o estado dos dados (API) — idêntico ao ponto de gatilho do bug original.

### 3b — Se o card mexeu em texto gerado por IA
Superfície de texto gerado por IA (derivada no Step 4 do `/method`) = **sim**? Então o human check não é só "o trigger está na tela": o que o usuário vai julgar é a **saída**, e **é aqui que o "funciona, mas lê mal" aparece** — o clique dá certo, o texto lê torto. Prepare a leitura, não só o clique:

- Saída já visível na tela → **transcreva-a inteira** no bloco abaixo (ele não deve precisar rolar para julgar).
- Saída que só nasce no clique → diga **o que ele deve ler** quando clicar e **contra qual referência** (`docs/04-spec/<tópico>.md` § Texto gerado por IA).
- Nunca resuma a saída com as suas palavras: o que ele valida é o que o produto escreveu.

### 4 — Publicar no chat e PARAR COMPLETAMENTE

```markdown
## ✅ Human check — superfície posicionada — sua vez

Executei todos os passos do fluxo original. O ambiente está idêntico ao ponto do bug.

**👉 Clique em / Execute: [nome exato do botão/elemento, ou o comando pronto]**
(URL / tela / endpoint atual: [onde está])

Comportamento esperado agora (corrigido): [o que deve acontecer agora que o bug foi corrigido]

**O que ler na saída:** tom/persona · completa até o fecho · no idioma do usuário · sem placeholder · sem invenção — a barra é [referência #1 nomeada no spec]   ← só com superfície de texto gerado por IA

Evidência do estado atual: [screenshot, ou requisição + dados]

---
Após confirmar que o bug não ocorre mais, responda "ok" / "approved" / "ship" — aí eu pergunto se rodo o /pull-request (em finish, rodo direto).
```

**PARAR COMPLETAMENTE. Não gravar `phase: ship`, não commitar o registro, não invocar o `/pull-request` até receber confirmação explícita do usuário. Nenhuma exceção.** O que acontece na confirmação está no `SKILL.md` § 8 ("Ao confirmar").

## Critério de Saída
- Todos os passos executados (sem atalho para a URL final)
- Superfície parada 1 passo antes do trigger — browser/emulador posicionado, ou requisição montada e não enviada — com evidência
- **PARADO** — aguardando confirmação humana (obrigatório, sem exceção)
