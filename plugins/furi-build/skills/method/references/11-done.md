# Step 11 — Done

**Step terminal — não existe Step 12.** O artefato é promovido para `done` e **só então** o trabalho é commitado, num **único commit**, na branch atual: mover primeiro, commitar por último. Nenhuma decisão nova de arquitetura ou design se toma aqui — follow-up que aparecer se resolve aqui, antes do commit. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Invocar o `/solve` via Skill tool
- [ ] Escrever `obra/11-done/<tópico>.md` (nome por domínio, `00-start.md`) com links para todos os artefatos (`docs/01` … `docs/06`, `obra/08` … `obra/10`) e a lista de arquivos de código alterados
- [ ] Copiar para o done doc o checklist por TC (`- [x] TC-N`) da seção `## Test Cases (QA)` do to-do
- [ ] Escrever as 5 linhas de princípios, sem prosa: **Reutilizado** (DRY, § 3.1 do plano) · **Descartado** (YAGNI, § 3.2) · **Motores** (§ 3.3: nasceram, cresceram, absorveram) · **Elevado** (perímetro § 3.5: o que subiu e o que já estava no nível #1) · **DS ganhou** (`/front`, se tem UI; nada → "coube no DS existente")
- [ ] Deletar o to-do: `rm obra/07-todo/<tópico>.md` — em `obra/`, a pasta é o status
- [ ] Commitar uma vez, na branch atual: `git add -A` + `git commit -m "feat(<escopo>): <descrição>"` — código, artefatos 01-10, done e remoções; nenhum commit antes, nenhum depois, e o SHA não vai ao done
- [ ] Encerrar dizendo o que foi feito — sem pendência, follow-up, próximo passo nem sugestão: se algo sobrou, um step não resolveu o que apareceu nele

Tudo ✅ → feature encerrada. **Fim do protocolo.**
