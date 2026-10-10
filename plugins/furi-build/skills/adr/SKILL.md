---
name: adr
description: 'Use ONLY when the user explicitly invokes /adr (bare /adr = the objective is whatever the conversation is already about), or when another skill invokes `furi-build:adr` via the Skill tool. NEVER activate on your own initiative. — the whole decision record in ONE file, docs/adr/NNNN-<slug>.md: problem, user stories, use cases, spec, design and test cases. Never edited: a new decision is a new ADR. Invokes no other skill; never implements nor commits.'
argument-hint: "[objetivo]"
---

# /adr — do problema aos test cases, num arquivo só

O registro de decisão inteiro, do problema aos test cases, num único `docs/adr/NNNN-<slug>.md` — o Step 1 do `/method`, ou avulso. Funciona sozinha: não invoca outra skill, não cria `track/`, não implementa, não commita. **Cada `- [ ]` é uma tarefa:** feche uma antes da próxima.

- [ ] Entender o objetivo: o argumento ou, sem ele, o que a conversa já discute; ambíguo → pergunte
- [ ] Ler os docs e o código que o objetivo toca — a spec decide com base no que existe, não no que se imagina
- [ ] Criar `docs/adr/NNNN-<slug>.md` (próximo número livre, 4 dígitos, slug pela capacidade); se muda a decisão de um ADR anterior, no antigo só o status vira `Substituído por ADR-NNNN`
- [ ] Escrever o arquivo no formato abaixo, as 6 seções na ordem
- [ ] Reler: problema sem solução e dentro dos limites, cada story com use case, cada UC e cada decisão da spec cobertos por um TC
- [ ] Encerrar com o caminho do arquivo e um resumo de 3 linhas, sem implementar nem commitar; invocada por outra skill → devolve só o caminho, e o final dela vence

## Formato

```markdown
# ADR NNNN — <título>

Status: Proposto · Data: <AAAA-MM-DD>

## 1. Problema
<1 frase, ≤150 chars, sem solução>

<contexto, ≤300 chars: quem sofre, onde, impacto>

## 2. User stories
- US-1 — Como <quem>, quero <o quê>, para <por quê>

## 3. Use cases
### UC-1 — <nome> (US-1)
Ator · Pré-condição · Fluxo principal (passos) · Fluxos alternativos e de erro · Pós-condição

## 4. Spec
<cada ponto em aberto decidido: a decisão, o motivo, o que fica de fora; regras, dados, contratos, limites>

## 5. Design
<cada tela: estados (carregando, vazio, erro, cheio), layout, interação, tokens do `design-system.md` quando existir>
<sem tela → "N/A — <motivo>">

## 6. Test cases
### TC-1 — <nome> (UC-1)
Pré-condição → passos → resultado esperado
```

Até 10 TCs, cobrindo os UCs e a spec. Tudo no presente, sem `Round N`, changelog nem "antes era". ADR não se edita: decisão nova é ADR novo.
