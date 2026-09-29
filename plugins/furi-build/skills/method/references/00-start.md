# Step 0 — Start (estrutura + roteamento)

**Antes de qualquer step: as pastas estão certas, eu sei o que já existe e cada parte do pedido tem um arquivo dono.** Roda uma vez e não produz artefato; o Roteamento é o que os Steps 1-6 atualizam. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Retomar, se o `<objetivo>.md` desta esteira já existe em `track/`: seguir do step que a pasta dele diz — o que está fora do git em `track/` e é de outra esteira fica intocado
- [ ] Arrumar a estrutura: `git rm` no que o git rastreia em `track/` (esteira concluída) e `git mv` das pastas antigas de `docs/` para o contrato abaixo, do maior para o menor — e commitar só isso (`chore: arruma docs/track`), fora do commit da feature
- [ ] Ler todo `docs/**/*.md`, quebrar o pedido em partes e rotear cada uma, pasta a pasta, ao arquivo que já é dono dela — criar só quando nenhum é dono, com o motivo, nomeado pela capacidade, nunca pelo ticket ou pela feature; mesclar no dono os irmãos que cobrem o mesmo
- [ ] Publicar no chat os blocos **Estrutura** e **Roteamento** e perguntar se sobrou ambiguidade

Contrato — `docs/`: `00-context` · `01-problem` · `02-user-stories` · `03-use-cases` · `04-spec` · `05-design` (era `04-design`) · `06-test-cases` (era `05-test-cases`); `track/`: `07-todo` · `08-implementation` · `09-code-review` · `10-run-test`.

**Doc vivo:** o arquivo descreve a capacidade como ela é hoje. Atualizar reescreve a seção no presente — o substituído sai, sem `Round N`, `-iterN` nem changelog; o histórico é do git. Arquivo acima de ~30 KB vira pasta, um arquivo por subcapacidade (`docs/04-spec/acesso.md` → `docs/04-spec/acesso/sessao.md` e `…/bloqueio.md`); arquivo novo só nasce dessa divisão ou de capacidade nova. O `track/` é efêmero: um arquivo só por esteira, `<objetivo>.md` (nome único), que nasce em `07-todo` e muda de pasta a cada step — a pasta é o status — até o Step 11 apagá-lo; nunca vai ao git, e sem esteira rodando as pastas ficam vazias. `00-context/` é brainstorming fora da esteira; o que virar trabalho entra pelo Step 1. Conhecimento permanente vive em `.claude/`.

**Estrutura:** pastas no contrato · removidas · renomeadas · commit · ✅/❌. **Roteamento:** parte → arquivo dono, por pasta (ou `novo: <nome> — motivo`) · mesclas.
