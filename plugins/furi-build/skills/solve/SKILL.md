---
name: solve
description: 'Use ONLY when the user explicitly invokes /solve (bare /solve = the objective is whatever the conversation is already about), or when another skill invokes `furi-build:solve` via the Skill tool. NEVER activate on your own initiative. — resolve the requested task at world-class level, benchmarking against the leading big pop tech apps in the relevant domain as the quality baseline, aiming to make us the #1 reference in the market.'
effort: max
argument-hint: "[o que resolver]"
---

# /solve — Resolver no nível da referência #1

Resolva mirando ser a **referência #1 do mercado** — no calibre dos **big pop tech apps**: não o "bom o suficiente", o melhor que existe.

**Isto não é mais um MVP.** Se a base atual não chega lá, **refaça do zero** — reescrever para atingir o nível #1 é decisão válida, não desperdício.

**Refazer é no lugar.** "Do zero" é sobre o conteúdo, não sobre o endereço: o arquivo, módulo, componente ou doc que já cobre a capacidade é **o que se reescreve** — nunca um `-v2`, um `-new`, um paralelo ao lado do antigo "pra limpar depois". Existe algo semelhante? **Ele** sobe ao nível #1, mesmo que o que ele faz hoje tenha mudado. Arquivo novo é só quando **nada** cobre a capacidade — e isso se prova com o grep, não se presume.

## Como resolver

1. **Defina a referência — e a capacidade em jogo.** Quem são os líderes reconhecidos DESTE domínio — os big pop tech apps que o mercado admira (descubra pelo contexto da tarefa)? O que eles fazem é a **baseline** — o piso, nunca o teto. Ao mesmo tempo, nomeie **qual capacidade** a tarefa exige e **quem é o dono dela** hoje (o motor, se existir).
2. **Iguale ou supere — consolidando.** Entregue no nível do melhor que existe e, onde der, vá além. A capacidade sai desta passada com **um dono** (motor) e, se tem tela, apoiada no **design system** — reusando, compondo ou promovendo, nunca inventando solto.
3. **Auto-check antes de entregar.** *"Um líder do domínio assinaria isto — e assinaria esta tela?"* Mais: duplicou algo que já existia? criou abstração que ninguém pediu? alguma unidade ficou com duas responsabilidades? a capacidade tem um dono ou ficou espalhada? dava pra fazer mais simples sem cair de nível? todo arquivo por onde passei saiu melhor do que entrou? se tem tela: sobrou literal, faltou estado, passou a11y? Se não → não está pronto, refaça.

Qualidade vem antes de esforço, tempo ou tokens. A complexidade necessária para chegar nesse nível é requisito, não obstáculo. Genérico ou mediano = falha.

## Princípios e design — a doutrina, não duplicada aqui

Nível #1 é também no código, não só no resultado visível — e, com tela, é visual também. A doutrina tem fonte única, a mesma que o `/method` cobra step a step:

- **`method/references/principios.md`** — os princípios de engenharia (**SOLID**, os cinco · **DRY** · **KISS** · **YAGNI** · **Law of Demeter** · **Motores**) e a **refatoração contínua**: tudo por onde o trabalho passa sobe, regra do saldo.
- **`method/references/design.md`** — o design (tokens como fonte única, atomicidade, composição, headless, todos os estados, Jakob, preservação de contexto, a11y AA) e como o design system evolui com o produto.

Leia-os: valem em cada decisão, cada arquivo, cada artefato — do primeiro rascunho ao último review. Lente por step, linhas do Gateway Check e racionalizações estão lá.

## PARE se pensar
"tá bom o suficiente" · "depois a gente melhora" · "é só um detalhe, ninguém repara" · "a versão simples já resolve" · "deixa o legado como está pra não refazer" · "o existente tá longe demais do nível, começo outro do lado" · "crio o novo agora, o antigo eu apago depois"
