# Smoke — provar, na URL do ambiente, que as features estão lá funcionando

> **Fonte única da verificação no ar.** Invocado pelo `reconcile.md` como **último** gap: é o passo que autoriza dizer "está no ar funcionando".

**Responsabilidade única:** abrir o ambiente publicado e provar que cada feature que deveria estar lá **está e funciona**. Não conserta, não deploya, não configura.

## Iron Law

> **É este passo que dá o direito de dizer "está no ar".** Sem ele, "deployado" é uma afirmação sobre o git, não sobre o produto. E a URL é a **do ambiente** — `localhost` prova apenas que a sua máquina funciona.

## Contrato

| Entrada | Saída |
|---|---|
| alvo (`{ambiente, URL}`) + os cards que deveriam estar no ar | `passou` \| `falhou[]` (com o que falhou e onde), + evidência |

## 1 — O escopo é o ambiente, não o PR

Verificar o `## Como testar` de **cada card** que deveria estar no ar **desde o último deploy verificado** — não apenas o card do PR desta rodada.

**Por quê:** um deploy publica o **acumulado** da branch. Se três PRs entraram e você só verifica o terceiro, os outros dois sobem sem ninguém olhar — e é exatamente a pergunta que quem valida faz ("todas as features subiram?").

Como montar a lista: os cards dos PRs mergeados desde o último smoke verde, mais os commits diretos na branch de integração no mesmo intervalo. Sem `## Como testar` no card → usar os TCs de `docs/05-test-cases/<feature>.md`; sem nenhum dos dois → reportar que a feature **não é verificável** e por quê (não invente critério de aceite).

## 2 — Como se executa

Playwright MCP, apontando para a **URL do ambiente** (do `deploy-context.md`):

1. Abrir a URL do ambiente. Não responde / 5xx / página de erro da plataforma → não é smoke falho de feature: é **ambiente fora do ar**, gap grave, reporte antes de qualquer outra coisa.
2. Autenticar com as credenciais de teste do ambiente (o `deploy.md` diz **onde** estão — nunca guarda o valor).
3. Para cada card: seguir os passos do `## Como testar` e observar o **resultado declarado**.
4. Registrar evidência por card (screenshot com caminho), como o Step 9 do `/method` exige.

**Ambiente de produção tem usuário real.** Smoke em prod é **leitura e caminho feliz**, com dado de teste quando é preciso escrever. Não criar pedido de verdade, não disparar cobrança, não mexer em dado de terceiro. Não dá para verificar sem efeito colateral → declare isso em vez de improvisar.

## 3 — Os desfechos

| Resultado | Significado | Ação |
|---|---|---|
| Todos os cards passam | ambiente **verificado** | `jira-sync.md` para cada card ("Em homolog/produção: `<URL>`") e o objetivo fecha |
| Algum card falha | objetivo **não** atingido | § 4 |
| Feature não verificável (sem critério) | não conta como passou | reporta explicitamente; não inventa critério |

## 4 — Falhou: é gap reaberto, não conclusão

Smoke falho **não** é o fim do trabalho com um aviso no rodapé — é um gap que voltou a abrir. Diagnosticar **qual** e **reportar ao `reconcile.md`**, que reabre o gap e chama o motor certo — este arquivo diagnostica, não invoca (D-23):

| Sintoma | Gap provável | Volta para |
|---|---|---|
| Feature simplesmente não existe na tela | não subiu (run de outro SHA, ou run em fila) | `deploy-run.md` |
| Tela de erro, 500, "variável não definida" | falta configuração | `env-config.md` |
| Feature existe mas se comporta diferente do card | defeito de código — ou o card não foi resolvido de fato | `pr-cycle.md` (e, se for achado fora do escopo, `findings.md`) |
| Só em produção falha, homolog estava ok | configuração divergente entre ambientes | `env-config.md` § 4 |

Em produção, além de reabrir o gap: **oferecer o rollback** (`deploy-run.md` § 3) — há usuário real vendo a falha agora.

## Red Flags — STOP

- "Testei em localhost e passou" → NÃO. Homolog é a branch de integração **no ar**; prod é prod. `localhost` prova que a sua máquina funciona.
- "Verifico só o card do PR desta rodada" → NÃO. O deploy publica o acumulado; a pergunta é se **todas** as features subiram.
- "Mergeou e o run ficou verde, então está funcionando" → NÃO. Verde é *sincronizado*. Funcionar é este passo.
- "A QA do dev já passou no Step 9, não preciso verificar no ar" → NÃO. Aquilo provou o **código**, na máquina dele. Isto prova o **ambiente** — env var, migration, build de produção.
- "Smoke falhou, mas o merge está feito, reporto e encerro" → NÃO. Gap reaberto: diagnostica e volta ao motor certo.
- "Não achei `## Como testar`, então considero ok" → NÃO. Sem critério, a feature não é verificável — e isso se **declara**, não se assume.
- "Crio um pedido de verdade em prod para testar o fluxo" → NÃO. Usuário real, cobrança real. Caminho feliz de leitura, dado de teste, ou declara que não é verificável sem efeito colateral.
- "A home abriu, o deploy está ok" → NÃO. Home no ar não diz nada sobre a feature que subiu.
