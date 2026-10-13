# runbook

Executa um processo escrito em YAML **passo a passo**: cada passo vai para a **mesma conversa** do agente, e o motor só manda o próximo quando a resposta traz tudo o que o passo exige. Juízes rodam em sessão nova e cega; paradas esperam o dev; comandos rodam sem IA. **Quem decide o próximo passo é o motor, nunca o modelo.**

Por que existe: num SKILL.md, a lista de passos é um pedido — o modelo segura o plano e decide o que pular. Nos runs auditados do ship, o checklist virou registro (escrito depois, marcado em lote), a escada não era chamada e juízes eram reaproveitados. Aqui a sequência é código.

## Instalar

```bash
runbook/install.sh          # ~/.local/bin/runbook → este checkout (Node >= 20)
runbook validar runbook/exemplos/ola.yaml
```

Usa o login do `claude` da máquina (OAuth ou chave — o que ele já usar). Nada de API key própria.

## Um processo

```yaml
nome: ola
entrada: [tema]                       # vira --tema "…" no run
sessao: { cli: claude, permissao: leitura }
passos:
  - id: escrever
    faca: "Escreva 3 frases sobre {entrada.tema} e um título."
    exige: { frases: lista, titulo: texto }
  - id: julgar
    juiz: "Critério: frases claras e sobre {entrada.tema}. Frases: {escrever.frases}"
    ate: 90
  - id: confirmar
    parada: "Título: {escrever.titulo}. Sigo?"
  - id: conferir
    comando: "test -n {escrever.titulo}"
  - id: traduzir
    para_cada: escrever.frases
    faca: "Traduza para o inglês: {item}"
    exige: { traducao: texto }
```

| Passo | O que faz | Campos |
|---|---|---|
| `faca` | pedido à conversa de trabalho; a resposta tem de trazer cada campo de `exige`, senão nova tentativa dizendo o que faltou; esgotou → para e chama o dev | `exige` (`texto` · `numero` · `booleano` · `lista` · `objeto`), `tentativas` (2), `para_cada`, `permissao`, `ferramentas`, `limite` (30m) |
| `juiz` | sessão nova, cega, devolve `{nota, lacunas}`; abaixo de `ate` volta ao `volta_para` com as lacunas e refaz dali; passou de `max` → para e chama o dev. Com `ferramentas`, confere na fonte: continua sem ver a conversa, mas usa só as ferramentas listadas (ex.: ler o card no Jira em vez de confiar na cópia); as embutidas entre elas (ex.: `Read`) alcançam só a pasta de evidências do run (`{run.dir}`), para o juiz abrir os prints que o registro cita | `ate` (90), `max` (3), `volta_para` (o `faca` anterior), `ferramentas`, `limite` (10m) |
| `comando` | roda no projeto, sem IA; código ≠ `espera` → volta ao `volta_para` com a saída, ou para e chama o dev | `espera` (0), `volta_para`, `max` (3), `limite` (10m) |
| `parada` | mostra a mensagem e espera o dev; a resposta vira `{<id>.resposta}` e entra no próximo `faca` | — |

- **`se: "<passo>.<campo>"`** (em qualquer passo): o passo só roda se o valor existe — texto não vazio, lista não vazia, `true`, número ≠ 0. Senão, `⤼ não se aplica`, e o relatório mostra. Ex.: o recard do `/repro` só roda com card (`se: card.tem_card`).
- **`resultado:`** (no processo): um texto com variáveis mostrado no `■ FIM` — é como quem chamou recebe o produto do run. Passo que não se aplicou sai vazio.
- **Variáveis:** `{entrada.x}` · `{<passo>.<campo>}` · `{<passo>}` (a saída inteira) · `{item}` (no `para_cada`) · `{run.dir}` (pasta de evidências do run) · `{run.id}`. `{{` e `}}` são chaves literais. Em `comando`, cada valor entra **citado para o shell** — a saída de um agente nunca vira comando.
- **Validação antes de rodar:** ids únicos, referências só a entradas declaradas e a passos anteriores, `volta_para` só para um `faca` anterior, tipos e campos conhecidos. Processo inválido não começa.
- **Permissão:** `livre` (o padrão) roda com `bypassPermissions`; `leitura` roda com `dontAsk` — só leitura e comandos de leitura passam. `ferramentas` libera nomes a mais (ex.: o MCP do Jira num passo de leitura) e aceita variáveis: uma que vale uma lista se espalha (`["{ler.ferramentas}"]` → um nome por item).

## Modo chat

**O padrão de dentro de um Claude Code** (a variável `CLAUDECODE` presente; `--chat` força em qualquer lugar, `--fundo` desliga): cada passo `faca` é feito **no chat que chamou o run**, à vista do dev, e não num agente em segundo plano. O motor continua dono da sequência: ele pede o passo (`✋ SUA VEZ`, saída 11), o chat o faz e devolve os campos com `runbook entregar <run>` (o JSON pelo argumento ou pelo stdin), e o motor confere o `exige` (faltou → pede de novo, dizendo o quê), roda os juízes cegos em sessão limpa, para nas paradas e decide o próximo passo. Uma entrega que não é objeto JSON é recusada sem mexer no run.

No modo chat, `permissao`, `ferramentas` e `limite` dos passos `faca` não se aplicam: valem as permissões do chat, e o navegador é a aba do pwx do próprio chat. O trabalhador espera a entrega sem limite de tempo; `parar` o encerra.

## Comandos

```text
runbook run <processo.yaml> [--chat|--fundo] [--dir <pasta>] [--<entrada> <valor>…]   começa e acompanha até a próxima parada ou o fim
runbook entregar <run> '<json>'         modo chat: entrega o passo pedido (ou o JSON pelo stdin)
runbook seguir [run]                     volta a acompanhar — sair não para o trabalho
runbook responder <run> "<resposta>"     responde a uma parada, ou orienta e refaz um passo escalado
runbook pular <run> "<motivo>"           segue sem o passo parado — fica no relatório
runbook status [run] · lista · retomar <run> · parar <run> · validar <processo.yaml>
```

Saída: `0` fim · `10` parada (espera você) · `11` sua vez (modo chat) · `1` erro · `2` uso inválido.

Cada linha impressa é um evento: `▶` passo começou · `✓` passo feito (tempo, custo) · `↺` nova tentativa · `⚖` nota do juiz e volta · `✗` falha · `⏸ PARADA` (com o comando para responder) · `⏸ PERGUNTA` (o agente perguntando, com as opções) · `✋ SUA VEZ` (modo chat: o pedido do passo, com o comando para entregar) · `↳` entrega ou resposta · `■ FIM` (relatório).

## O agente pergunta

Dentro da sessão do runbook não há quem responda o AskUserQuestion (o `claude -p` roda com `--permission-prompts none`). Por isso o agente pergunta **pela resposta do passo**: se o passo depende de uma decisão ou de uma informação que só o dev tem, ele devolve `pergunta` (e `opcoes`, 2 a 4) em vez de chutar. O motor para (`⏸ PERGUNTA`, saída 10); a porta `/runbook` mostra a pergunta no chat com AskUserQuestion; `runbook responder <run> "<resposta>"` devolve a fala à **mesma conversa** e o **mesmo passo** é refeito (num `para_cada`, o mesmo item — os anteriores ficam). `pergunta` e `opcoes` são campos reservados de todo run. Limite: 3 perguntas por passo; a 4ª vira escalada — perguntar não pode ser jeito de não fazer.

## Como funciona

- **Uma conversa por run.** O 1º `faca` cria a sessão (`claude -p --session-id <uuid>`), os seguintes a continuam (`--resume <uuid>`), sempre com `--output-format json --json-schema` e lendo `structured_output`. O agente lembra de tudo o que leu; nada é resumido no meio.
- **Um schema por run:** a união dos campos de todos os `faca`, nenhum obrigatório — o mesmo em todo passo, porque um schema diferente refaz o cache da conversa inteira (medido: US$ 0,26 num passo de uma linha). Quem cobra os campos de cada passo é o motor, e o pedido diz quais são. Um `faca` sem `exige` devolve `resposta` (texto). O primeiro pedido leva um preâmbulo: faça só o passo pedido, por completo.
- **Modelo e esforço:** `sessao.modelo` e `sessao.esforco` (`low` · `medium` · `high` · `xhigh` · `max`) valem para todo passo, juízes inclusive. Sem eles, vale o padrão da máquina — e o juiz cego, em `--safe-mode`, pode não ler o `settings.json`; fixe no processo para não depender disso.
- **Juiz cego:** o bloco de sessão cega do `/brain` — diretório vazio, `--safe-mode`, `--tools ""`, sem persistência — com o schema `{nota, lacunas}`.
- **Seus hooks ficam de fora** (`--settings '{"disableAllHooks":true}'`): sem notificação a cada passo e sem o `close-tab` do pwx fechando o navegador entre passos.
- **Navegador:** `PWX_SESSION=runbook-<run>` e `PWX_OWNER_PID=0` — uma janela do pwx por run, de nenhum processo: sobrevive ao `claude` de cada passo e às paradas (o dev pode precisar dela) e fecha só no fim ou no `parar`.
- **Segundo plano:** o trabalho roda num processo próprio; `run`, `responder`, `pular` e `retomar` só acompanham os eventos. Fechar o terminal, ou o Monitor do chat expirar, não derruba o run.
- **Estado** em `~/.runbook/runs/<run>/` (`RUNBOOK_HOME` muda a raiz): `estado.json`, `processo.yaml` (o retrato do processo no início — retomar usa este), `eventos.jsonl`, `chamadas/` (a resposta bruta de cada chamada, para auditoria), `arquivos/` (`{run.dir}`).

## Adaptadores

`claude` hoje (`src/adaptadores/claude.mjs`). A interface — `trabalhar` (a conversa contínua) e `julgar` (sessão cega) — é a mesma que `codex exec`, `gemini -p` e `agy -p` vão implementar.

## Testes

```bash
pnpm test:runbook    # sem gastar token: um claude-falso responde por roteiro e registra cada chamada
```
