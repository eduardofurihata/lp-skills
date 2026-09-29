# Step 0 — Start (estrutura + roteamento)

**Antes de qualquer step: as pastas estão certas, eu sei o que já existe e cada parte do pedido tem um arquivo dono.** Roda uma vez e não produz artefato; o Roteamento é o que os Steps 1-6 atualizam. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Conferir as pastas do projeto contra o contrato abaixo
- [ ] Remover com `git rm`, antes de tudo, o que o git rastreia em `track/` — é esteira concluída; o histórico fica no git
- [ ] Renumerar as pastas antigas de `docs/` com `git mv`, do maior para o menor — senão um rename sobrescreve o outro
- [ ] Deixar intocado o que está fora do git em `track/` — é de outra esteira, interrompida ou em paralelo; só se retoma o arquivo com o nome deste objetivo, do step que a pasta dele diz
- [ ] Corrigir pasta fora do contrato, duplicada ou com lacuna — pasta que não existe não se cria vazia
- [ ] Commitar só a arrumação antes do Step 1 (`chore: arruma docs/track`), fora do commit da feature
- [ ] Ler o conteúdo de todo `docs/**/*.md` e do `track/` restante num scan único — o nome não diz tudo
- [ ] Quebrar o pedido em partes, uma por capacidade do produto que ele toca
- [ ] Rotear cada parte, pasta a pasta, ao arquivo que já é dono da capacidade — mesma área, fluxo, tela ou regra
- [ ] Criar arquivo só quando nenhum é dono, com o motivo escrito, nomeado pela capacidade (`carteira.md`), nunca pelo ticket, pela feature ou pela iteração
- [ ] Mesclar no dono, sem perder conteúdo, os irmãos que o Roteamento toca e cobrem a mesma capacidade; obsoletos → deletar
- [ ] Listar o que há em `docs/00-context/` como insumo, sem renumerar nem virar artefato
- [ ] Publicar no chat os blocos **Estrutura** e **Roteamento**
- [ ] Perguntar antes do Step 1 se sobrou ambiguidade de estrutura

Contrato — `docs/`: `00-context` · `01-problem` · `02-user-stories` · `03-use-cases` · `04-spec` · `05-design` (era `04-design`) · `06-test-cases` (era `05-test-cases`); `track/`: `07-todo` · `08-implementation` · `09-code-review` · `10-run-test`.

**Doc vivo:** o arquivo descreve a capacidade como ela é hoje. Atualizar reescreve a seção no presente — o substituído sai, sem `Round N`, `-iterN` nem changelog; o histórico é do git. Arquivo acima de ~30 KB vira pasta, um arquivo por subcapacidade (`docs/04-spec/acesso.md` → `docs/04-spec/acesso/sessao.md` e `…/bloqueio.md`); arquivo novo só nasce dessa divisão ou de capacidade nova. O `track/` é efêmero: um arquivo só por esteira, `<objetivo>.md` (nome único), que nasce em `07-todo` e muda de pasta a cada step — a pasta é o status — até o Step 11 apagá-lo; nunca vai ao git, e sem esteira rodando as pastas ficam vazias. `00-context/` é brainstorming fora da esteira; o que virar trabalho entra pelo Step 1. Conhecimento permanente vive em `.claude/`.

**Estrutura:** pastas no contrato N/11 · renomeadas · removidas · commit · fora do contrato · ✅/❌. **Roteamento:** docs lidos (N em M pastas) · parte → arquivo dono, por pasta (ou `novo: <nome> — motivo`) · mesclas.
