---
name: repro
description: 'Use ONLY when the user explicitly invokes /repro (bare /repro = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:repro` via the Skill tool. NEVER activate on your own initiative. — a MODIFIER: understand the report and reproduce it on the front as the user, each graded ≥ 90 by a judge subagent; the dev sees the bug one step before it fires; return the official description. Alone it stops; with another /skill it delegates; whoever commits shows the dev the fix BEFORE the commit.'
effort: max
argument-hint: "[KEY-N | descrição] [/skill…] | (vazio = card ativo)"
---

# /repro — entender, reproduzir, julgar, o dev vê, devolver

**Modificador**: o bug é reproduzido no front, como o usuário, antes de qualquer código; o dev o vê duas vezes: com o bug (parada 1) e sem (parada 2, § Human Check). Raciocine fundo; não codifica. Lê `.claude/ship/setup.md`; a seção **§ Repro** é sua: superfícies, usuários e dados de teste — criada na primeira vez, atualizada ao aprender.

1. **Descobrir.** Objetivo: o card (**anexos** inclusos: o que o solicitante viu) ou a descrição; vazio = card ativo. Código: a branch do § Work, atualizada — o que reproduz é o que se corrige. Com card, mova-o para o status da etapa `/work`.
2. **Entender — o problema original.** Relato, anexos e código; escreva: quem, onde, o que faz, o que vê, o que esperava, causa provável. Ambiguidade real ou problema fora do card → pergunte, nunca decida em silêncio.
3. **Julgar o entendimento — um subagente dá a nota.** Contexto limpo: relato original verbatim + seu entendimento → nota 0–100 de fidelidade e o que falta. **≥ 90 avança**; senão passo 2 de novo — **sem limite**.
4. **Reproduzir — no front, simulando o usuário.** Browser automatizado (mobile: emulador), cenário **exato** (usuário, dados, condições — crie o que faltar), evidência a cada passo. Não reproduziu → pergunte, nunca "pelo código o bug é…". Registre **como**: usuário, dados, partida, passos, trigger, superfície.
5. **Julgar a reprodução — outro subagente.** Relato original + registro + evidência → nota 0–100 de "isto É o problema relatado" e o que diverge. **≥ 90 avança**; senão passo 4 — sem limite.
6. **O dev vê o bug — parada 1.** Rode o fluxo do zero e **pare um passo antes do trigger** (visível, não disparado). Publique onde está, **"👉 Clique em / Execute: [elemento exato]"**, o que vai acontecer, a evidência — e **pare** até o dev dizer que viu.
7. **Devolver — a descrição oficial, debugada.** Superfície · usuário e dados · partida → passos → trigger · atual vs esperado · evidência · causa localizada. Sozinho: encerre. Outra `/skill` no argumento: `Skill(skill: "<skill>", args: "<verbos restantes> <objetivo>")` — recebe a descrição e, se codar, deve a parada 2.

## Human Check — parada 2, de quem fecha o commit, ANTES dele

Corrigido → passo 4 de novo, ambiente **idêntico**, trigger disparado: **o bug não aparece**, com evidência; apareceu → volta ao código, sem commit. Então passo 6 de novo, como `## ✅ Human check — sua vez` com o esperado agora; **pare completamente** até o dev confirmar que viu corrigido. Só então o commit fecha.
