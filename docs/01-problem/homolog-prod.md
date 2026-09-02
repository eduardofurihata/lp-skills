# Homolog e Prod — levar o trabalho aos ambientes

## Problema

O produto não sabe **reconciliar o que está pronto com o que está no ar**: as skills de entrega terminam no merge, e ninguém verifica se a mudança subiu, funciona e está configurada no ambiente.

## Contexto

O `/merge` mergeia o PR na `dev`, atualiza o Jira e oferece `dev`→`main` como apêndice (Phase 6, ~30 linhas). O deploy é **declarado**, nunca observado: o único vestígio é um comentário no bash (`# 2) main → GitHub ← DEPLOYA PROD (GH Actions)`). Não há check de run, configuração de ambiente nem smoke no ar.

O gap já estava registrado e sem dono — `docs/04-spec/fast-todo-restructure.md:76`: *"/todo termina em Step 11: smoke em prod exige cerimônia que /todo não tem (não tem acesso à infra de deploy)"*. O `/merge` não assumiu essa cerimônia, e nenhuma outra skill assumiu.

Consequência direta: **uma task pode estar na branch — mergeada, commitada, tudo certo no git — e não estar no ar.** O run falhou, o runner self-hosted estava offline, faltou uma env var, a migration não rodou. Nada disso aparece no git, e o `/merge` declara sucesso.

Agravante de arquitetura: ir para produção tem **dois donos com contratos opostos** — `/merge` Phase 6 (pergunta sempre, com assert de convergência) e `/sync dev > main` (sem gate, por design: *"quem digita é quem autoriza"*, `sync/SKILL.md:144`). Duas fontes da mesma regra é o defeito que o princípio **Motores** nomeia.

## Afetados

- **Eduardo (dev e mantenedor)** — descobre manualmente, e depois, que a feature não subiu; diagnostica o gap à mão a cada ciclo.
- **Dev que abriu o PR** — recebe "mergeado ✓" e assume entregue; o retrabalho volta dias depois, sem rastro do que faltou.
- **Quem valida em homolog (PO/QA/stakeholder)** — testa o ambiente, não encontra a feature, e não tem como distinguir "não subiu" de "subiu quebrada" ou "subiu sem configuração".
- **Usuário final em produção** — recebe deploy parcial ou quebrado sem ninguém observando: pagamento LIVE e dado real dependem de um push que ninguém conferiu.

## A capacidade que falta

**Reconciliar ambiente com origem:** dado um ambiente-alvo, saber qual é a distância entre o estado desejado (tudo que está pronto, no ar, funcionando e configurado) e o estado atual (o que responde na URL agora) — e fechar essa distância.

Hoje essa capacidade não tem dono. O `/merge` cobre um pedaço dela (mergear), o `/sync` cobre outro (promover branch), e os pedaços que restam — deployar, configurar, verificar no ar — não são cobertos por ninguém.
