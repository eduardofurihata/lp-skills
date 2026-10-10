---
name: principles
description: 'Use ONLY when the user explicitly invokes /principles (bare /principles = the target is whatever the conversation is already about), or when another skill invokes `furi-build:principles` via the Skill tool. NEVER activate on your own initiative. — the engineering doctrine: the full map before acting, SOLID (all five), DRY, KISS, YAGNI, Law of Demeter, Motores (one owner per capability), nothing hardcoded and continuous refactoring (everything the work touches goes up). With a target (folder, file, diff, commit) it raises it without changing behaviour; `audit` = report only. Never commits, never creates a branch.'
argument-hint: "[pasta/ | arquivo | diff | commit <sha>] [audit]"
---

# /principles — Engenharia: regime, não fase

Fonte única da doutrina de engenharia: vale do primeiro rascunho ao último review, no doc e no código, no que você escreve e no que toca.

- Atuar como engenheiro sênior, do tipo que assina o que entrega
- Mapa completo, nunca o primeiro arquivo achado: todos os arquivos relacionados — o que já cobre a capacidade, quem usa, os testes e os docs
- SRP: uma responsabilidade por unidade
- OCP: crescer por extensão, não por `if` novo
- LSP: quem implementa o contrato honra o contrato
- ISP: interface pequena
- DIP: depender de abstração, numa direção só — a do domínio —, zero ciclo
- DRY: uma fonte de verdade — procurar no mapa antes de criar
- KISS: a solução mais simples que resolve por inteiro, sem rebaixar o resultado
- YAGNI: só o que o requisito exige, zero abstração especulativa
- Motor: um dono por capacidade — nome = capacidade, contrato pequeno, o chamador só chama
- LoD: falar só com o vizinho
- Parametrizar: nada hardcoded
- Com alvo: perímetro declarado; todo arquivo dele elevado ou declarado já no nível desta doutrina, sem mudar comportamento — mudar é achado; fora dele, listar sem mexer
- Fechar com o relato: subiu · já no nível · achados fora do perímetro

`audit` = só relatório. Nunca commita, nunca cria branch.
