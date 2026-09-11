# Classes de defeito que o `/proof` existe para pegar

Cada passe e sonda do SKILL.md nasceu de uma classe medida — um defeito que passou por `tsc`,
pela suíte e por revisão de diff, e foi apanhado depois por gente ou por produção. Este arquivo
é a memória: para cada classe, a **pergunta** que o diff não faz, o **movimento mecânico** que a
responde, **por que as ferramentas usuais não pegam**, e um exemplo anônimo. Nada aqui é
específico de um projeto; os exemplos são a forma, não o caso.

Sete classes chegaram de uma vez, de uma única revisão humana de uma PR que tinha passado por um
`/proof` — nenhum dos sete achados estava nos arquivos auditados, porque a branch andou 95
arquivos depois do relatório, e três deles moravam no commit que **consertava** os achados do
próprio proof. As classes C1 e C2 são sobre isso; C3–C7 são o que uma segunda rodada também
teria deixado passar, pela forma das sondas de então.

---

## C1 · Carimbo e delta — evidência tem escopo e data

**Pergunta:** este relatório descreve o HEAD atual, ou um HEAD que já não existe?

**Movimento:** o cabeçalho leva `HEAD · base · hash(diff) · data` (`delta.sh --stamp`). Na rodada
seguinte, `delta.sh <relatório>` lista os commits e arquivos desde o carimbo e transforma cada
achado anterior em item a re-verificar — `fechado (prova: …)` / `aberto` / `mudou de forma`.
Hash do **diff**, não só o SHA: rebase muda o SHA sem mudar conteúdo; amend muda conteúdo e
pode manter a mensagem.

**Por que escapa:** nada expira um relatório. Ele continua sendo "o proof da branch" na cabeça
de quem abre a PR, e a PR carrega os números de gate como se valessem para o código novo. Sem
carimbo, a pergunta "isto vale para o que vai ser mergeado?" nem tem como ser feita.

**Exemplo:** relatório às 18:38 sobre 21 arquivos; PR aberta às 22:07 com o conserto dentro;
três cards empurrados para a mesma PR no dia seguinte. A revisão humana achou 7 defeitos — todos
nos 95 arquivos que entraram depois.

## C2 · O conserto reentra na auditoria

**Pergunta:** o commit que fechou o achado foi auditado com o mesmo rigor do código que o
motivou?

**Movimento:** o delta marca commits que tocam arquivo de coordenada de achado anterior
("← toca achado anterior") — por interseção de arquivos, porque a mensagem do commit raramente
cita o achado. Esses commits são escopo de maior prior nos três passes; "fechou o achado" se
prova por teste ou mutação, nunca por leitura do commit.

**Por que escapa:** conserto é escrito para fazer UMA frase sumir, por quem acabou de ler o
diagnóstico, no menor escopo possível — e frequentemente **move** código. Promover um util a
pacote compartilhado, como o achado pedia, cria um membro novo com N sítios de registro (C3).
Trocar "recusa" por "lista os dois sites", como o achado pedia, cria um valor derivado que o
modo *editar* grava sem guarda (C6).

**Exemplo:** dos 7 achados da revisão humana, 3 estavam no commit que fechava B1 e A3 do proof.

## C3 · Enumeração à mão — o membro novo e os sítios de registro dos irmãos

**Pergunta:** onde os irmãos do membro novo são listados **sem ele**?

**Movimento (sonda 3):** membro = caminho novo (pacote/diretório, ou arquivo numerado ao lado de
`0317_…`), identificador declarado em 2+ arquivos (o campo que viaja por DTO → entidade →
schema → mapper), ou literal de catálogo. Irmãos = entradas do mesmo nível / declarações vizinhas
(±30 linhas: decorators espaçam campos). Sítio = janela de N linhas com ≥2 irmãos da mesma forma
e o novo ausente. Em **qualquer** arquivo — `Dockerfile`, compose, CI, `Makefile`, manifesto,
terraform —, porque é lá que se enumera à mão. Diferencial por **bloco**, não por arquivo.
Rótulos: `DEPENDE` (a raiz de pacote do sítio referencia o membro novo — registro exigido),
`MEIO-LIGADO` (o arquivo tem o novo em outro bloco), `TOCADO`.

**Por que escapa:** descritor de build não compila e não roda em teste. Construtor posicional
aceita um argumento a menos sem reclamar. O diferencial por arquivo (a heurística anterior)
dizia "o arquivo tem o campo" — tinha, no caminho de update; o bloco do create, 400 linhas
acima, não.

**Exemplos:** pacote novo em `libs/`, importado por três serviços, ausente dos três Dockerfiles
(que copiam `libs/*` um a um) e do `postinstall` da raiz — install quebra, ou `Cannot find module`
no boot. Campo novo no DTO de criação, validado e documentado, que o `new CreateCommand(dto.a,
dto.b, …)` nunca lê: 201 e o campo descartado em silêncio.

## C4 · Campo mudou de mão — o produtor moveu, os leitores ficaram

**Pergunta:** quem ainda lê o campo antigo — inclusive em **outro serviço**?

**Movimento (sonda 6):** hunk com `-k: v` / `+k2: v` (mesmo valor) → k moveu para k2; `-k: v`
sem par → k apagado. Para cada k, todos os leitores no repo, **sem filtro de raridade** (campo
de contrato tem leitores demais para ser "raro" — é por isso que a sonda 2 não o vê). Cada leitor
é uma decisão a registrar: intencional (deve parar de ler) / migrado (lê os dois) / colateral
(só lê o antigo). Arquivo com leitor migrado E não migrado = `MEIO-MIGRADO`, primeiro suspeito.

**Por que escapa:** o contrato atravessa a fila/evento; a suíte do serviço produtor não exercita
o consumidor. E o leitor que foi atualizado (o alarme, linha 1040) tranquiliza quem lê o diff —
o outro leitor do mesmo campo (o título, linha 1104) não está no diff.

**Exemplo:** o produtor do canal passa a mandar a pergunta em `perguntaParaAnalise` para não
duplicar a linha do usuário; o consumidor no outro serviço continua lendo `userMessage` para dar
título à conversa — toda conversa daquele canal nasce sem título.

## C5 · Fidelidade do fixture — a entrada que a spec nomeia

**Pergunta:** o teste exercita o caso para o qual a guarda foi escrita, ou um caso conveniente?

**Movimento (Pass B):** para todo predicado, regex, limiar ou janela do diff, **execute-o** sobre
as entradas literais da spec/card/docblock/incidente e registre `entrada · tamanho · resultado ·
esperado`. Limiar tem dois lados: um caso logo dentro, um logo fora, com forma e tamanho reais.
Comentário removido que descrevia defeito passado é oráculo: o caso que ele narrava precisa de
teste. Teste de guarda com fixture inventada, quando há adversário nomeado, é `⚠️`.

**Por que escapa:** mutação prova que a guarda **decide** ("19 testes reprovam quando a régua
some"), não que decide **certo**. Uma fixture de 51 chars não exercita uma janela de 280; um
docblock que diz "com `KAN` nos dois sites" testado com `OPS` passa pelo motivo errado. E o
"Como testar" da PR narra o teste que passou (com uma chave desligada), não o que o card pediu
(C7).

**Exemplos:** régua que olha só o fecho do texto dispara na frase literal do critério de aceite
(97 chars, cabe inteira na janela) e cala no plano numerado (o verbo de intenção sai da janela) —
o falso-negativo que um comentário removido documentava desde junho. Guarda "uma fonte, um site"
que casa a seleção por chave e falha justo na chave duplicada que o docblock cita.

## C6 · Dois modos, um caminho — round-trip no modo existente

**Pergunta:** o campo ou a derivação atravessa **cada** entrada (create/update, novo/existente,
stream/não-stream, REST/MCP/CLI) — e o modo existente sobrevive a "carrega → salva sem mexer"?

**Movimento (Pass A, sonda 5):** linha "Dois modos" na tabela de rastro; round-trip no modo
existente com o registro pré-existente; toda escrita derivada de consulta (`setValue` do que veio
de uma lista, de uma API) precisa de guarda de sucesso e de fallback para o valor guardado.

**Por que escapa:** o autor testa o caminho que estava construindo (criar). O componente de
edição é o mesmo, com `initialData` — e a derivação, calculada só da consulta ao vivo, grava `''`
quando a consulta falha ou vem vazia, apagando o que o create tinha gravado.

**Exemplo:** formulário que resolve o site a partir dos projetos escolhidos e grava
incondicionalmente; ao editar uma fonte cuja consulta de projetos falhou, o site gravado vira
vazio — e a fonte volta a sondar, que é o estado que a PR existia para remover.

## C7 · O procedimento de aceite é da spec, não da PR

**Pergunta:** o "Como testar" da PR é o do card?

**Movimento (Pass 4):** diff entre os passos da PR e os da spec/card/issue. Precondição
adicionada, passo removido ou esperado alterado é **renegociação** do critério — ou está escrita
no card, ou é achado. Sem fonte de aceite acessível → `indisponível-para-apurar`, dito.

**Por que escapa:** a PR é escrita por quem fez o teste passar; o passo que faz passar entra no
texto como se fosse o pedido. Quem revisa pela PR não vê a diferença; quem revisa pelo card vê.

**Exemplo:** o card diz "não pode aparecer o aviso de ação não executada"; o "Como testar" da PR
acrescenta "com a chave de ferramentas **desligada**", que o card não tem — e com a chave ligada
(o default) o aviso continua aparecendo.

---

## O que estas classes têm em comum

- **O diff é a projeção de duas pontas.** Nenhuma das sete aparece como linha do diff: C1/C2
  são sobre *quando* o diff foi lido; C3/C4 são sobre o que ele *alcança*; C5/C6/C7 são sobre o
  que o teste *não* pergunta.
- **A ferramenta que mede é a que mais engana.** `tsc` verde, suíte verde, mutação reprovando N
  — cada um responde a uma pergunta estreita e é lido como resposta à pergunta larga.
- **Registro é decisão, não checkbox.** Cada sítio órfão, cada leitor do campo antigo, cada
  precondição adicionada é uma decisão que alguém tomou sem escrever. O relatório pede que ela
  seja escrita — como omissão justificada ou como achado.
