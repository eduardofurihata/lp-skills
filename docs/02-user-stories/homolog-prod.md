# Homolog e Prod — User Stories

## Ambiente no ar

- Como **dev**, quero que o que está pronto esteja **no ar em homolog, funcionando e configurado**, para não descobrir depois que a entrega parou no merge.
- Como **dev**, quero que a skill **diagnostique o que falta** entre a origem e o ambiente, para não precisar conferir PR, run, env var e URL um por um à mão.
- Como **dev**, quero que a task **já commitada na branch mas fora do ar** seja tratada como trabalho pendente, para que "mergeado" nunca seja confundido com "entregue".
- Como **dev**, quero que produção só seja declarada no ar depois de **verificada na URL de produção**, para que usuário real não seja o primeiro a testar.

## O caminho até lá

- Como **dev**, quero que o PR seja **revisado e aprovado** antes de entrar, para que o gate de qualidade continue valendo quando o objetivo passa a ser o ambiente.
- Como **dev**, quero que **problema pontual no PR seja consertado na hora** e que **PR cru seja rejeitado e devolvido**, para que a pressa de subir não vire porta de entrada de lixo.
- Como **dev**, quero que **PR com escopo grande demais seja quebrado em cards**, para que o excedente volte para a fila em vez de entrar de carona.
- Como **dev**, quero que **QA pendente seja executada** antes de a mudança entrar, para que o ambiente não receba o que ninguém testou.
- Como **dev**, quero que **trabalho commitado sem PR ganhe um PR**, para que nada chegue ao ambiente sem passar pelo review.

## Configuração e verificação

- Como **dev**, quero que **env vars, secrets, migrations, feature flags e seeds** que a mudança exige sejam aplicados no ambiente, para que a feature funcione lá e não só na minha máquina.
- Como **dev**, quero que o **valor de todo secret seja pedido a mim**, nunca inferido, para que credencial inventada não vá para o ar.
- Como **dev**, quero que **deploy enfileirado por runner self-hosted offline** seja reportado como fila, para não ler "deployado" quando nada rodou.
- Como **dev**, quero saber **qual é o processo de deploy deste projeto** sem ter que explicá-lo de novo a cada invocação, para que a skill funcione igual em qualquer repositório meu.

## Quem valida e quem manda

- Como **PO/QA**, quero **abrir a URL de homolog e encontrar todas as features que subiram**, para validar sem depender de quem mergeou.
- Como **dev**, quero que **produção exija minha autorização explícita a cada release** no fluxo de duas branches, para que nenhum push a `main` aconteça por inércia.
- Como **dev de projeto de branch única**, quero **uma única skill que leve do PR ao ar em produção**, sem gate redundante, para que o fluxo simples não pague o custo do fluxo complexo.
- Como **mantenedor das skills**, quero que **uma capacidade tenha um dono só**, para que a regra de ir a produção não viva em dois lugares que divergem.
