# Step 12 — Done

**Step terminal — não existe Step 13.** O artefato é promovido para `done` e **só então** o trabalho é commitado, num **único commit**, na branch atual: mover primeiro, commitar por último. Nenhuma decisão nova de arquitetura ou design se toma aqui — o que aparecer é achado e reabre o Step 11. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Invocar o `/solve` via Skill tool
- [ ] Conferir o Gate `✅ CONVERGIU` publicado no Step 11; ausente → voltar ao 11, sem done doc, sem `rm`, sem commit
- [ ] Escrever `obra/12-done/<tópico>.md` (nome por domínio, `00-start.md`) com links para todos os artefatos (`docs/01` … `docs/06`, `obra/08` … `obra/11`) e a lista de arquivos de código alterados
- [ ] Copiar para o done doc o checklist por TC (`- [x] TC-N`) da seção `## Test Cases (QA)` do to-do
- [ ] Copiar para o done doc o ledger final — zero `ABERTO`, com o done de cada ciclo linkado
- [ ] Escrever as 5 linhas de princípios, sem prosa: **Reutilizado** (DRY, § 3.1 do plano) · **Descartado** (YAGNI, § 3.2) · **Motores** (§ 3.3: nasceram, cresceram, absorveram) · **Elevado** (perímetro § 3.5: o que subiu e o que já estava no nível #1) · **DS ganhou** (`/front`, se tem UI; nada → "coube no DS existente")
- [ ] Deletar o to-do e o ledger: `rm obra/07-todo/<tópico>.md obra/11-follow-ups/<tópico>.md` — em `obra/`, a pasta é o status
- [ ] Commitar uma vez, na branch atual e só no ciclo raiz (ciclo aninhado para no item anterior): `git add -A` + `git commit -m "feat(<escopo>): <descrição>"` — código, docs 01-11, done, remoções e todos os ciclos de follow-up; nenhum commit antes, nenhum depois, e o SHA não vai ao done
- [ ] Encerrar dizendo o que foi feito — sem pendência, follow-up, próximo passo nem sugestão: se algo sobrou, o Step 11 não convergiu

Tudo ✅ → feature encerrada. **Fim do protocolo.**
