# Step 2 — User Stories

**`Como <persona>, quero <ação> para <benefício>.`** Em linguagem de usuário: "quero um botão que chame o endpoint X" não é story, é solução disfarçada de necessidade.

**Chame e use:** `/solve` · `/principles` · `/front` (se tem UI) — os três via Skill tool · `11-follow-ups.md`

## Artefato

`docs/02-user-stories/<tópico>.md` — nome por domínio; doc que já cobre o domínio se **atualiza**, não se duplica (`00-start.md`). Toda persona do Step 1 tem story aqui; story sem persona de lá não entra.

```markdown
# <Tópico> — User Stories

- Como <persona>, quero <ação> para <benefício>.
```

Cada story vira requisito: é dela que o Step 3 deriva os Use Cases.

## Princípios neste step

- **SRP** — 1 story = 1 necessidade de 1 persona. Não empilhe duas no "e também".
- **DRY** — mesma necessidade em 2 personas = 1 story com 2 atores, não 2 stories gêmeas.
- **YAGNI** — story sem persona do Step 1 = especulação → fora.
- **KISS** — é a âncora deste step: linguagem de usuário. A story diz o **benefício**, não o mecanismo.
- **Motor** — stories que pedem a mesma capacidade apontam para o **mesmo motor**; anote, o Step 4 vai usar.
- **Refatoração** — story empilhada → **separe** agora, custa uma linha.
- **Design** (se tem UI) — a story descreve o **resultado para o usuário**, nunca o componente: "quero ver o total atualizado", não "quero um badge azul".

## Gateway 2 → 3

- [ ] Stories cobrem **todas** as personas do Step 1; nenhuma story sem persona de lá
- [ ] Formato "Como X, quero Y para Z" em cada uma, em linguagem de usuário
- [ ] Artefato `docs/02-user-stories/<tópico>.md` existe com conteúdo substantivo
- [ ] As **quatro linhas obrigatórias** publicadas (`SKILL.md` § Gateway Check)
