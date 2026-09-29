# Step 11 — Done

**Step terminal — não existe Step 12.** O que a esteira aprendeu e ainda vale vai para os docs vivos, o arquivo dela sai do `track/` e **só então** o trabalho é commitado, num **único commit**, na branch atual: consolidar primeiro, commitar por último. Nenhuma decisão nova de arquitetura ou design se toma aqui. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Invocar o `/solve` via Skill tool
- [ ] Levar aos docs do Roteamento o que o `track/` decidiu e ainda vale — desvio do plano que virou regra entra na D-N do spec; o resto morre com o arquivo da esteira
- [ ] Conferir que cada doc tocado descreve o estado de agora, sem `Round N`, `-iterN` nem changelog (`00-start.md` § Doc vivo)
- [ ] Escrever a mensagem do commit: `feat(<escopo>): <descrição>` e, no corpo, o placar `X de N PASSED via front` do `## Test Cases (QA)` e as 5 linhas de princípios, sem prosa: **Reutilizado** (DRY, § 3.1 do plano) · **Descartado** (YAGNI, § 3.2) · **Motores** (§ 3.3: nasceram, cresceram, absorveram) · **Elevado** (perímetro § 3.5: o que subiu e o que já estava no nível #1) · **DS ganhou** (`/front`, se tem UI; nada → "coube no DS existente")
- [ ] Apagar só o arquivo desta esteira, `track/*/<objetivo>.md`, e a evidência dela — nunca o `track/` inteiro, que pode ter esteira em paralelo
- [ ] Commitar uma vez, na branch atual: `git add -A -- . ':(exclude)track'` + `git commit` com essa mensagem — código, docs e remoções; nenhum commit da feature antes, nenhum depois
- [ ] Encerrar dizendo o que foi feito — sem pendência, próximo passo nem sugestão

Tudo ✅ → feature encerrada. **Fim do protocolo.**
