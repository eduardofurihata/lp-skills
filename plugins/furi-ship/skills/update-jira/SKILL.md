---
name: update-jira
description: 'Use when user invokes /update-jira [KEY…] (bare /update-jira = all my cards in progress and code review) — checks each card''s real state (GitHub, deploy, infra config and in-app config such as access to grant or admin settings, tests only the environment can prove, pending items), posts it as a comment and moves the column only on clear evidence. Read-only everywhere but the card: never deploys, never edits the description. Refuses without Jira.'
argument-hint: "[KEY…] [/skill…]"
disable-model-invocation: true
boundary: [homolog, prod]
---

# /update-jira — o estado real de cada card meu, no card

O board diz o que alguém lembrou de mover; o GitHub e os ambientes dizem o que aconteceu — cada card passa a dizer o mesmo que eles. Fora do card, só leitura: deploy é do /homolog e do /prod, descrição é do /recard. Sem Jira → recuse. **Os `- [ ]` são o checklist do run, em `.claude/ship/run.md`:** escreva cada um, marque `- [x]` ao fechar, retome do primeiro aberto; quem o criou apaga ao fim.

- [ ] Ler `.claude/ship/setup.md § Card`: board, dono, colunas de andamento e de code review, e as de destino (homolog, concluído); falta → pergunte e grave ali
- [ ] Listar os cards do dono nessas colunas; KEY no argumento → só esses
- [ ] Por card, achar repo e branch: dev info do Jira, links e comentários, a KEY no nome da branch ou do PR, os repos locais; não achou → pendência "sem código ligado"
- [ ] Conferir o GitHub: branch, commits, PR (aberto, review, checks, conflito, mergeado e em qual base)
- [ ] Conferir o deploy pelo `.claude/ship/infra.md` do repo e pela skill de infra da conta, quando instalada (repo Eduzz/Labzz → aws-prod): está em homolog? em prod? qual commit está publicado; sem mapa → pendência "/infra"
- [ ] Conferir a config de infra: env, secrets, migrations, flags que a mudança exige × o que existe em cada ambiente
- [ ] Conferir a config no software, o que precisa ser feito dentro do app em homolog e em prod para a entrega valer: acesso, permissão ou perfil a liberar, toggle ou parâmetro no admin, cadastro, integração configurada na tela, allowlist, webhook no console de terceiro. Fonte: card e comentários, descrição do PR e o diff (permissão ou role nova, chave de setting nova, seed que não roda em prod, tela admin nova). Confira só lendo (pwx no painel já logado, API, consulta de leitura), nunca configure; não deu para ver → pendência "config no app: o quê, com quem tem o acesso"
- [ ] Conferir os testes que só o ambiente prova, o que o teste local não cobre e precisa ser visto em homolog ou prod: integração real com terceiro, job ou cron no agendador, e-mail ou webhook de verdade, dado real, domínio e certificado, permissão com usuário real. Fonte: plano de teste do card, seção de testes do PR, comentários e o diff (integração ou job novo). Feito = evidência com link (comentário, log, painel, print); dá para ver só lendo → veja (pwx, log, painel); teste com efeito colateral (compra, envio, escrita) nunca roda aqui → pendência "teste em <ambiente>: o quê, quem roda"
- [ ] Juntar as pendências por tipo (código, infra, config no app, teste no ambiente) e por ambiente: o que falta para avançar e com quem está
- [ ] Comentar em cada card
- [ ] Mover a coluna só com evidência: PR aberto → code review; mergeado e publicado em homolog → a de homolog; publicado em prod e nada pendente em prod → concluído; na dúvida não move e o comentário diz por quê
- [ ] Reler os cards: o comentário renderiza, a coluna é a esperada
- [ ] Retornar a tabela

O comentário abre com `Status real — <data>` e segue: Onde está (PR, ambiente, commit) · Feito · Pendente (por tipo: o quê, com quem) · Próximo passo; fato com link, nunca palpite. A tabela: KEY · coluna antes → depois · PR · ambiente · pendência (com o tipo).
