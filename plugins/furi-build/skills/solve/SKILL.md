---
name: solve
description: 'Use when the user invokes /solve — resolve the requested task 10x above the #1 in the market. The leading big pop tech apps in the relevant domain are the baseline — the floor, never the target; world-class is where the work starts, not where it stops.'
effort: max
argument-hint: "[o que resolver]"
requires: [principles, ui]
---

# /solve — Resolver 10x acima do #1

Resolva mirando **10x acima do #1 do mercado** — o calibre dos **big pop tech apps** é o **piso**, não o alvo: nem o "bom o suficiente", nem o empate com o melhor que existe.

> **nível 10x** — o nome da barra em todas as skills. O líder reconhecido do domínio é a **baseline**; o alvo é uma ordem de grandeza acima dele.

**10x não é dez vezes mais coisa.** Quase sempre é o passo que deixou de existir, não a funcionalidade que entrou — quem chega lá acrescentando escopo não subiu a barra, inchou o produto.

**Isto não é mais um MVP — e a solução já nasce escalável.** Se a base atual não chega lá, **refaça do zero**: reescrever para atingir o nível 10x é decisão válida, não desperdício. O que sai daqui é o que vai **rodar em produção com o produto crescendo** — não a versão que funciona na demo e alguém troca depois.

**Escalável é prova, não adjetivo.** A solução aguenta o volume que o produto já espera — a consulta não piora quando a tabela cresce, o caminho quente não refaz trabalho, limites e concorrência são **decididos**, não descobertos em produção — e **cresce por composição, não por edição**: capacidade nova entra no motor, não como mais um `if` no que já funciona.

**A tensão com YAGNI — resolvida:** escalável é **não plantar o gargalo que você já sabe que vem**; especulativo é **construir a infra de um gargalo que ninguém tem**. Índice na coluna que a query filtra é escalável; sharding para os dez usuários de hoje é especulação — BLOQUEADO.

## Como resolver

1. **Defina a referência — e a capacidade em jogo.** Quem são os líderes reconhecidos DESTE domínio — os big pop tech apps que o mercado admira (descubra pelo contexto da tarefa)? O que eles fazem é a **baseline** — o piso, nunca o teto; **o alvo é 10x acima dele**. Ao mesmo tempo, nomeie **qual capacidade** a tarefa exige e **quem é o dono dela** hoje (o motor, se existir).
2. **Supere por uma ordem de grandeza — consolidando.** Igualar o melhor que existe é o **piso** da entrega, não o objetivo dela: entregue 10x acima. A capacidade sai desta passada com **um dono** (motor) e, se tem tela, apoiada no **design system** — reusando, compondo ou promovendo, nunca inventando solto.
3. **Auto-check antes de entregar.** *"O líder do domínio trocaria o dele por isto — e a tela dele por esta?"* Se não → não está pronto, refaça.

Qualidade vem antes de esforço, tempo ou tokens. A complexidade necessária para chegar nesse nível é requisito, não obstáculo. Genérico ou mediano = falha.

## Princípios de engenharia e clareza — skill `/principles`

**ANTES de tudo — invoque o `/principles` via Skill tool** (`furi-build:principles`; a forma curta `principles` também resolve). Sem alvo, ele entra em modo régua: a doutrina (SOLID · DRY · KISS · YAGNI · LoD · Motores · refatoração do perímetro · regra do saldo) e as provas de clareza (simples · eficiente · premium · humano · IA) passam a valer em tudo que você tocar. Chamada real, não "seguir de memória": sem a invocação, o passo não aconteceu.

**A divisão é essa:** o `/solve` decide **o quanto** existe — o nível 10x e a complexidade que ele exige; o `/principles` garante que tudo o que existe esteja na forma mais clara e curta, e inteiro. A doutrina é independente deste protocolo: ela não conhece `/solve` nem `/method` — quem a aplica ao trabalho em curso é quem a invoca.

Nível 10x é também no código, não só no resultado visível — e não é fase: vale em cada decisão, cada arquivo, cada artefato. **É a barra contra a qual a doutrina mede tudo o que a passada tocou.**

## Design — quando tem tela, o nível 10x é visual também

**ANTES de tocar em qualquer tela — invoque o `/ui` via Skill tool** (`furi-build:ui`; a forma curta `ui` também resolve). Sem alvo, ele entra em modo régua: a doutrina de design (tokens como fonte única · atomicidade · composição > configuração · headless · todos os estados · Lei de Jakob · consistência semântica · preservação de contexto · fluxos modulares) e a régua do moderno (hierarquia, escala, tipografia, motion, densidade, a11y AA, responsivo nos breakpoints do projeto) passam a valer em tudo que você desenhar. Chamada real, não "seguir de memória": sem a invocação, o passo não aconteceu.

**A divisão é a mesma da engenharia:** o `/solve` define o **nível** visual — quem é o benchmark, o que os líderes do domínio entregam nessa tela; o `/ui` define a **forma** que a superfície precisa ter para chegar lá. Nível 10x no código não salva uma tela medíocre, e tela bonita não salva um fluxo que perde o contexto do usuário.

**Auto-check visual antes de entregar** (junto com "o líder do domínio trocaria o dele por isto?"): *a tela deixou o benchmark **para trás** — 10x, não empate —, ou só ficou parecida com as outras do produto?* O resto do auto-check — visual e de engenharia — é das doutrinas, já carregadas pelas duas chamadas.

> Rodando dentro do `/method`: as doutrinas e as racionalizações estão em `principles/SKILL.md` e `ui/SKILL.md`; a lente de cada step e as linhas obrigatórias do Gateway Check estão nos references do `/method` (`method/references/<step>.md` § Princípios neste step e `gateways.md`) — mesmas doutrinas, cobradas step a step.

## PARE se pensar
"tá bom o suficiente" · "igualei o líder, tá ótimo" · "10x é força de expressão" · "depois a gente melhora" · "é só um detalhe, ninguém repara" · "a versão simples já resolve" · "deixa o legado como está pra não refazer" · "refatoro depois, numa PR só de refactor" · "a UI tá igual às outras, então tá certa" · "é só uma cor, hardcode não faz mal" · "a11y/mobile/estado vazio depois" · "depois a gente escala" · "com poucos registros funciona" · "já conheço o `/principles`, sigo sem invocar" · "já conheço o `/ui`, sigo sem invocar"
