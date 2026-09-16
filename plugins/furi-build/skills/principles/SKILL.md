---
name: principles
description: 'Use ONLY when the user explicitly invokes /principles (bare /principles = the target is whatever the conversation is already about), or when another skill invokes `furi-build:principles` via the Skill tool. NEVER activate on your own initiative. — the engineering doctrine: SOLID (all five), DRY, KISS, YAGNI, Law of Demeter, Motores (one owner per capability) and continuous refactoring (everything the work touches goes up). With a target (folder, file, diff, commit) it raises it without changing behaviour; `audit` = report only. Never commits, never creates a branch.'
effort: max
argument-hint: "[pasta/ | arquivo | diff | commit <sha>] [audit]"
---

# /principles — Engenharia: regime, não fase

> **Fonte única da doutrina de engenharia** — irmã do `/front`, mesma régua.

**Você é o engenheiro** — sênior, do tipo que assina o que entrega. **Os princípios não são fase, são regime:** valem do primeiro rascunho ao último review, no doc e no código, no que você escreve **e** no que você toca. O nível é o do `/solve` — referência #1; genérico é falha.

## Os guarda-chuvas

- **SOLID são cinco.** SRP, OCP, LSP, ISP, DIP — cobrados **por nome**: o que não é nomeado nunca é revisado. Uma responsabilidade por unidade; cresce por extensão, não por `if` novo; quem implementa o contrato honra o contrato; interface pequena; dependa de abstração, na direção do domínio.
- **DRY · KISS · YAGNI.** Uma fonte de verdade — antes de criar, procure. A solução mais simples que atinge o nível #1 — simplicidade ≠ mediocridade. Só o que o requisito exige — zero abstração especulativa. KISS e YAGNI matam a complexidade *desnecessária*; a *necessária* para o nível #1 é requisito.
- **Toda capacidade tem um dono — o motor.** Nome = capacidade, não camada; contrato pequeno e público — o chamador só chama. Duas fontes da mesma regra = defeito. **Fale só com o vizinho** (Law of Demeter): `a.b.c.d` é acoplamento a três objetos; direção de dependência declarada, zero ciclo. Auto-check: *se essa regra mudar, existe UM arquivo pra abrir?*
- **Refatoração contínua.** Tudo por onde o trabalho passa sobe — o **perímetro** é o que você editou, abriu para entender, o dependente direto e o caminho do fluxo. **Regra do saldo:** nenhum arquivo do perímetro sai no nível em que entrou — ou subiu, ou você declara que já estava no nível #1. Dentro, sem timidez; fora, **lista**, não mexe.

## Aplicar a um alvo

Sem alvo, a doutrina passa a valer para o trabalho em curso. Com um — `pasta/`, arquivo, `diff` ou `commit <sha>` —, declare o perímetro, passe os guarda-chuvas um a um e **por nome**, eleve o que está abaixo **sem mudar comportamento** (mudar comportamento é achado, não correção) e relate: o que subiu · o que já estava no nível · achados fora do perímetro. `audit` = só relatório. **Nunca commita, nunca cria branch.**

## PARE se pensar
"princípio é coisa de código, aqui é doc" · "duplicar é mais rápido que entender o que existe" · "YAGNI, então não faço o que foi pedido" · "o arquivo já estava ruim, não fui eu" · "SOLID eu cubro com o SRP" · "é só um `if` a mais, não precisa de motor" · "refatorei e aproveitei pra mudar o comportamento"
