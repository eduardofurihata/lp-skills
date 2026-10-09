---
name: principles
description: 'Use ONLY when the user explicitly invokes /principles (bare /principles = the target is whatever the conversation is already about), or when another skill invokes `furi-build:principles` via the Skill tool. NEVER activate on your own initiative. — the engineering doctrine: SOLID (all five), DRY, KISS, YAGNI, Law of Demeter, Motores (one owner per capability) and continuous refactoring (everything the work touches goes up). With a target (folder, file, diff, commit) it raises it without changing behaviour; `audit` = report only. Never commits, never creates a branch.'
effort: max
argument-hint: "[pasta/ | arquivo | diff | commit <sha>] [audit]"
---

# /principles — Engenharia: regime, não fase

Fonte única da doutrina de engenharia: vale do primeiro rascunho ao último review, no doc e no código, no que você escreve e no que toca. **Cada `- [ ]` é uma tarefa:** feche uma antes da próxima.

- [ ] Atuar como engenheiro sênior, do tipo que assina o que entrega
- [ ] Aplicar o SRP: uma responsabilidade por unidade
- [ ] Aplicar o OCP: crescer por extensão, não por `if` novo
- [ ] Aplicar o LSP: quem implementa o contrato honra o contrato
- [ ] Aplicar o ISP: interface pequena
- [ ] Aplicar o DIP: depender de abstração, na direção do domínio
- [ ] Aplicar o DRY: uma fonte de verdade — procurar antes de criar
- [ ] Aplicar o KISS: a solução mais simples que atinge o nível #1
- [ ] Aplicar o YAGNI: só o que o requisito exige, zero abstração especulativa
- [ ] Dar um dono a cada capacidade — o motor: nome = capacidade, contrato pequeno, o chamador só chama
- [ ] Aplicar a LoD: falar só com o vizinho, dependência numa direção, zero ciclo
- [ ] Elevar todo arquivo do perímetro ou declará-lo no nível #1 — fora dele, listar sem mexer
- [ ] Declarar o perímetro do alvo
- [ ] Elevar o que está abaixo sem mudar comportamento — mudar é achado
- [ ] Relatar: subiu · já no nível · achados fora do perímetro

`audit` = só relatório. Nunca commita, nunca cria branch.
