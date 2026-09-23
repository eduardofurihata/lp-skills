# Step 2 — User Stories

**Em linguagem de usuário: o benefício, nunca o mecanismo.** "Quero um botão que chame o endpoint X" não é story, é solução disfarçada de necessidade.

**Chame e use:** `/solve` via Skill tool

## Artefato

`docs/02-user-stories/<tópico>.md` — nome por domínio; doc que já cobre o domínio se **atualiza**, não se duplica (`00-start.md`). Toda persona do Step 1 tem story aqui; story sem persona de lá não entra — e cada story é um requisito.

```markdown
# <Tópico> — User Stories

- Como <persona>, quero <ação> para <benefício>.
```

- 1 story = 1 necessidade de 1 persona; a que tem "e também" são duas.
- A mesma necessidade em duas personas é **uma** story com dois atores, não duas gêmeas.
- Stories que pedem a mesma capacidade apontam para o **mesmo motor** — anote, o Step 4 vai usar.
- **Se tem UI:** a story descreve o **resultado para o usuário**, nunca o componente: "quero ver o total atualizado", não "quero um badge azul".

## Gateway 2 → 3

- [ ] Stories cobrem **todas** as personas do Step 1; nenhuma story sem persona de lá
- [ ] Formato "Como X, quero Y para Z" em cada uma, em linguagem de usuário
- [ ] Artefato `docs/02-user-stories/<tópico>.md` existe com conteúdo substantivo
- [ ] Follow-up que apareceu aqui, resolvido aqui — nada se caça
- [ ] As **quatro linhas obrigatórias** publicadas (`SKILL.md` § Gateway Check)
