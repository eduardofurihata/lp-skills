---
name: solve
description: Use when the user invokes /solve — resolve the requested task at world-class level, benchmarking against the leading big pop tech apps in the relevant domain as the quality baseline, aiming to make us the #1 reference in the market.
effort: max
argument-hint: "[o que resolver]"
requires: principles
---

# /solve — Resolver no nível da referência #1

Resolva mirando ser a **referência #1 do mercado** — no calibre dos **big pop tech apps**: não o "bom o suficiente", o melhor que existe.

**Isto não é mais um MVP.** Se a base atual não chega lá, **refaça do zero** — reescrever para atingir o nível #1 é decisão válida, não desperdício.

## Como resolver

1. **Defina a referência — e a capacidade em jogo.** Quem são os líderes reconhecidos DESTE domínio — os big pop tech apps que o mercado admira (descubra pelo contexto da tarefa)? O que eles fazem é a **baseline** — o piso, nunca o teto. Ao mesmo tempo, nomeie **qual capacidade** a tarefa exige e **quem é o dono dela** hoje (o motor, se existir).
2. **Iguale ou supere — consolidando.** Entregue no nível do melhor que existe e, onde der, vá além. A capacidade sai desta passada com **um dono** (motor) e, se tem tela, apoiada no **design system** — reusando, compondo ou promovendo, nunca inventando solto.
3. **Auto-check antes de entregar.** *"Um líder do domínio assinaria isto — e assinaria esta tela?"* Mais o **saldo**: todo arquivo por onde passei saiu melhor do que entrou? Se não → não está pronto, refaça.

Qualidade vem antes de esforço, tempo ou tokens. A complexidade necessária para chegar nesse nível é requisito, não obstáculo. Genérico ou mediano = falha.

## Princípios de engenharia e clareza — skill `/principles`

**ANTES de tudo — invoque o `/principles` via Skill tool** (`furi-build:principles`; a forma curta `principles` também resolve). Sem alvo, ele entra em modo régua: a doutrina (SOLID · DRY · KISS · YAGNI · LoD · Motores · refatoração do perímetro · regra do saldo) e as provas de clareza (simples · eficiente · premium · humano · IA) passam a valer em tudo que você tocar. Chamada real, não "seguir de memória": sem a invocação, o passo não aconteceu.

Nível #1 é também no código, não só no resultado visível — e não é fase: vale em cada decisão, cada arquivo, cada artefato. **Tudo por onde passa sobe**: nenhum arquivo do perímetro sai no nível em que entrou — ou subiu, ou você declara que já estava no nível #1.

## Design — quando tem tela, o nível #1 é visual também

Nível #1 no código não salva uma tela medíocre. Feature com superfície visual obedece à mesma doutrina do protocolo — fonte única: **`method/references/design.md`**.

- **Tokens são a fonte única** — cor, espaçamento, tipografia, raio, motion vêm do token. Literal em componente é hardcode visual.
- **Atomicidade · composição > configuração · headless** — átomo não conhece regra de negócio; `<Card><Card.Header/></Card>` em vez de props que ligam pedaços; comportamento em hook, aparência em componente burro.
- **Todos os estados** — vazio, carregando, erro, sucesso, limite; hover, focus-visible, active, disabled, loading, selected. **Estado não desenhado = estado quebrado.**
- **Lei de Jakob e consistência semântica** — o usuário aprendeu em outro produto; a mesma ação tem o mesmo nome, ícone e lugar em todo o produto.
- **Preservação de contexto** — nunca pedir de novo o que o sistema já sabe; voltar não apaga.
- **A11y AA é piso** e responsivo nos breakpoints do projeto, 320px de piso.
- **O DS evolui com o produto:** precisou de algo que ele não tem → **reusar → compor → promover** (criar no DS, nunca solto na feature).
- **Consistência é lei; mediocridade não é.** Padrão existente abaixo do nível #1 não se copia — eleva-se.

KISS/YAGNI matam a complexidade *desnecessária*; a complexidade *necessária* para o nível #1 continua sendo requisito. E **YAGNI nunca é desculpa para entregar menos do que foi pedido** nem para ignorar achado real.

**Auto-check antes de entregar** (junto com "um líder do domínio assinaria isto?"): *duplicou algo que já existia? criou abstração que ninguém pediu? alguma unidade ficou com duas responsabilidades? a capacidade tem um dono ou ficou espalhada? dava pra fazer mais simples sem cair de nível? todo arquivo do perímetro subiu? se tem tela: sobrou literal, faltou estado, passou a11y?*

> Rodando dentro do `/method`: a lente de cada step, as linhas obrigatórias do Gateway Check e as racionalizações estão em `principles/SKILL.md` e `method/references/design.md` — mesma doutrina, cobrada step a step.

## PARE se pensar
"tá bom o suficiente" · "depois a gente melhora" · "é só um detalhe, ninguém repara" · "a versão simples já resolve" · "deixa o legado como está pra não refazer" · "copio e adapto, é mais rápido" · "deixo preparado pro dia que precisar" · "o arquivo já estava ruim, não fui eu" · "SOLID eu cubro com o SRP" · "é só mais um `if`, não precisa de motor" · "cada tela trata do seu jeito" · "só puxei o campo lá de dentro" · "abri só pra ler, não conta" · "refatoro depois, numa PR só de refactor" · "a UI tá igual às outras, então tá certa" · "é só uma cor, hardcode não faz mal" · "a11y/mobile/estado vazio depois" · "já conheço o `/principles`, sigo sem invocar"
