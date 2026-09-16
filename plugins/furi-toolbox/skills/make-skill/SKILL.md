---
name: make-skill
description: 'Use when user invokes /make-skill <what the skill must do | path to a SKILL.md> — writes (or rewrites) one SKILL.md under the rule: simple, clean, minimal, readable by a human and by the model, efficient, written as an order (never a how-to), under 3333 chars; places it where this repo keeps skills and proves it.'
effort: max
argument-hint: "<o que a skill faz | caminho de um SKILL.md> [nome]"
disable-model-invocation: true
---

# /make-skill — entender, escrever, medir, colocar, provar

Entra uma frase, ou o caminho de uma skill; sai **um** `SKILL.md` que cabe em 3333 caracteres e se lê como ordem: o humano entende de relance, o modelo age sem interpretar. Cinco passos, cada um provado antes do seguinte:

1. **Entender — o que a skill faz, em uma frase.** Verbo + objeto + resultado. Caminho no argumento → a skill existente é a entrada: leia inteira, guarde o que ela faz, descarte como ela conta. Nome de uma palavra, o verbo ou a coisa (`/save`, `/card`), minúsculas e hífen. A frase não fecha em uma linha → pergunte uma vez; já existe skill que faz isso → diga e pare.
2. **Escrever — a ordem, não o como.** Frontmatter: `name`; `description` com a capacidade, aberta por `Use when user invokes /<name>`, nunca gatilho; `argument-hint`; `disable-model-invocation: true` — outra skill vai invocá-la → em vez da trava, a sentinela `NEVER activate on your own initiative.` na description. Corpo: título `# /<name> — <os verbos dos passos>`, uma frase de abertura, passos numerados `**Verbo — para quê.**` com a regra e a prova de cada um, e acabou. Fora: seção de exemplo, red flag, PARE, guarda-chuva; comando, tool, regex, API — o como é do projeto e muda; adjetivo, repetição, o que o modelo não precisa para agir, o que o humano não lê de relance. Lista fica lista, nunca vira parágrafo. Código mora em `scripts/` ao lado, nunca no .md.
3. **Medir — abaixo de 3333, em bytes e em caracteres.** Estourou → corte duplicação antes de conteúdo; meça de novo.
4. **Colocar — onde o repo guarda skills.** Repo com `plugins/<pacote>/skills/` → lá, no pacote que o README dele manda; senão `.claude/skills/<name>/SKILL.md`. Reescrita fica no caminho de origem. Skill que já existe com esse nome → mostre e pergunte antes de sobrescrever.
5. **Provar.** Releia o arquivo contra os passos 2 e 3, regra por regra; o validador do repo, quando existe, passa. Devolva caminho, bytes e caracteres.
