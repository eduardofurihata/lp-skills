---
name: proof
description: 'Use when user invokes /proof to code review a PR, diff or branch by auditing the EVIDENCE, not the mechanism — the missing part is proof the change is reached, exercised, and holds in the target env. Three passes (value trace, test proof, world boundary) plus six probes for what the diff cannot show — a secret committed-and-removed, an anti-pattern surviving elsewhere, a new member (package, field, literal) missing where its siblings are listed, a sibling under another guard, a merged or failed read written back, a moved field still read by the old name — audits tests by mutation and fixture fidelity (the spec-named input, both sides of a threshold), stamps the report with the audited SHA and diffs it against the previous one (a fix is unaudited code), and reports per-finding confidence plus what was NOT covered. Runs BEFORE the PR exists; the report (terminal + gitignored `.proof/<scope>.md`) is the deliverable. A PR number is SCOPE, not a destination — commenting requires `--comment`. Never approves, merges or writes code.'
effort: max
argument-hint: "[nº da PR | branch | vazio = diff atual] [--comment]"
---

# /proof — Code review que audita a prova

O mecanismo quase sempre está certo. O que falta é a **prova** de que ele é **alcançado**, é
**exercitado**, e **continua valendo no ambiente de destino**. Este skill audita as três — não
relê o código procurando erro de digitação.

Ele roda **antes de a PR existir** — que é quando o resultado ainda muda o código. A entrega é
o **texto**, e o que fazer com ele é decisão sua: consertar agora, colar na PR, ou descartar.

> 🚫 **NÃO escreve código, NÃO commita, NÃO aprova, NÃO pede changes, NÃO mergeia, NÃO publica.**
> O relatório é a entrega: terminal + `.proof/<escopo>.md`, e o destino é seu. Publicar exige
> `--comment` explícito. Conserto é `/fast`, depois — **e depois do conserto, `/proof` de novo.**
> **Não é o Step 8 do `/method`** — aquele roda dentro do protocolo, com relatório **versionado**
> em `kanban/08-code-review/`. O `/proof` é avulso, sem docs e sem card: o `.proof/` é
> gitignored, descartável, sobrescrito a cada rodada.

## Iron Law

> **Precisão > tokens.** Achado só existe com **coordenada** e **como falha** — entrada
> concreta → saída errada. Sem os dois é preferência de estilo: descarte, não reporte.
> Coordenada é `arquivo:linha` **dentro ou fora do diff**, ou `<commit>:<arquivo>` quando o
> defeito mora no trajeto da branch. Exigir linha do diff é como esta skill fica cega para
> as sondas do §1 — achado que não cabe no formato não chega nem a "não coberto".
>
> **Prova tem carimbo.** Vale para o SHA que auditou e para nenhum outro — o commit que
> conserta os achados inclusive. Relatório sem carimbo não diz de que código fala.

## Convenções (CONTRATO)

`$ARGUMENTS` = `[escopo] [--comment]`, em qualquer ordem.

| Arg | Escopo — que diff auditar | Destino |
|---|---|---|
| vazio | working tree + commits à frente da base | terminal + arquivo |
| `AV-2095` / branch | `git diff <base>...<branch>` | terminal + arquivo |
| `171` (nº) | o diff da PR, com a branch base mesclada antes de ler | terminal + arquivo |
| `--comment` (**exige** nº de PR) | — | idem **+** `gh pr comment` |

- **Nº de PR é escopo, não destino.** Receber `171` não autoriza escrever na PR: os três
  escopos têm o MESMO destino, e só a flag acrescenta um canal.
- **`--comment` sem nº de PR: recuse e pare.** Não audite "e avise no fim" — a pessoa pediu
  publicação, e devolver só o texto calado é o caso 4 do Pass C aplicado à própria skill
  (colapsar `indisponível-para-apurar` em `ausente-de-fato`).
- Primeiro token é nº de PR se casar `^[0-9]+$`; é branch/`KEY-N` se `git rev-parse --verify`
  achar. Não achou nenhum dos dois → **pergunte**, não audite o alvo errado.
- A base é **descoberta** (`gh pr view --json baseRefName`, senão a branch de integração do repo), nunca assumida.
- Gates rodam pelo **comando documentado do projeto**. Se o comando não roda, isso **é** um achado.
- **Existe `.proof/<escopo>.md` anterior? O delta é lido ANTES do diff** —
  `bash scripts/delta.sh .proof/<escopo>.md` (caminho relativo a esta skill): commits e arquivos
  desde o carimbo, com os que **tocam coordenada de achado anterior** marcados, e cada achado
  anterior como checklist. Sem carimbo (relatório de versão antiga) → `indisponível-para-apurar`,
  dito no relatório, com a aproximação por mtime que o script imprime.

## Fluxo

### 0. Preparação — sem isto o resto é leitura

1. Worktree isolada; **base mesclada antes de ler** — revise o código como ele vai ficar.
2. `build` · `lint` · `test` do que foi tocado, com **número** (suítes/testes), nunca "verde".
3. Vermelho que já existe na base: prove por hash ou rodando na base limpa, e **separe** — não é deste PR.
4. SQL editado roda contra banco real (`EXPLAIN`, `BEGIN/ROLLBACK`). Dublê de banco prova a regra e **nunca** prova que o SQL é válido.
5. Conflito textual ≠ conflito semântico: onde o merge saiu limpo, compare os conjuntos de linhas `+/-` dos dois lados. Ao decidir um conflito, **o lado que tem teste ganha**.
6. Base mesclada mostra as duas **pontas**. O **trajeto** é outro objeto e se lê à parte — rode as sondas do §1 **antes** do diff. Merge sem squash escreve o trajeto inteiro na base.
7. **Carimbo**: `bash scripts/delta.sh --stamp` dá a linha (`HEAD · base · hash do diff · data`) que vai no cabeçalho. Hash do **diff**, não só o SHA: rebase muda o SHA sem mudar o conteúdo, e o inverso.
8. **Commits que consertam achados anteriores são o escopo de maior prior.** Conserto é escrito para fazer UMA frase sumir, por quem acabou de ler o diagnóstico, no menor escopo — e costuma MOVER código (promover um util a pacote é criar um membro novo com N sítios de registro). Os três passes valem para ele como para qualquer outro; "fechou o achado" se prova por teste ou mutação, não por leitura do commit.

### 1. Pass A — o rastro (o valor que não chega)

Para cada campo, controle ou regra tocado — **e para cada um que a mudança alcança sem
tocar** — percorra e **nomeie o elo que falha**:

| Sujeito | Rastro | Falha típica |
|---|---|---|
| Campo | produtor → serialização → DTO → comando → handler → repositório → coluna → leitor | declarado numa ponta e o `DEFAULT` vence na outra; argumento extra ignorado em silêncio; coluna fora do `SELECT` |
| Controle | decide? · **algo o executa?** · cobre o território inteiro? · rollout visível fora do código? | guard não referenciado; regra escopada a metade das pastas; flag só no default do módulo |
| Regra duplicada | quantas cópias o grep acha; paridade é **estrutural** (tipo total) ou disciplinar? | a terceira cópia — o grep que acha duas acha ela |
| Dois modos | create/update · novo/existente · stream/não-stream · REST/MCP/CLI: o campo atravessa **CADA** entrada? No modo existente, round-trip: carrega → salva sem mexer → gravado == original | campo chega ao update e não ao create; derivação de consulta gravada quando a consulta veio vazia — o edit apaga o que o create gravou |

**As seis sondas — o que o diff não tem linha para mostrar.** O diff é a projeção de duas
pontas: mostra a mudança, não o que ela **alcança** nem o que **deixou atrás**.

| Sonda | Pergunta ausente | Achado típico |
|---|---|---|
| 1 · trajetória | revisei o objeto que vai ser **mergeado**? | credencial commitada e removida na mesma branch: diff líquido zero, permanente no merge sem squash |
| 2 · irmãs do removido | o que mais fala essa língua? | o padrão saiu de um caminho e ficou nos outros — a classe sobrevive ao conserto da ocorrência |
| 3 · membro órfão | o bloco que **enumera os irmãos** tem o novo? | pacote novo fora do Dockerfile/CI/`postinstall` que lista os outros à mão; campo novo no `update` e não no `create`; membro de catálogo que nenhum estágio trata. Diferencial por **bloco**, em **qualquer** arquivo (descritor de build incluído) |
| 4 · gêmea assimétrica | a irmã é **chamada** sob a mesma guarda? | uma gated por `x !== undefined`, a outra sempre roda: divergência já instalada |
| 5 · escrita colateral | o que isto **grava** é o que precisou **ler** — ou o que **não conseguiu**? | patcha a visão mesclada: o update que removia a chave a vê voltar; `setValue` de valor derivado de lista, sem guarda: consulta vazia grava `''` |
| 6 · campo mudou de mão | o produtor moveu/apagou um campo: **quem ainda lê o antigo?** | leitor em outro serviço (evento, fila) segue lendo o campo velho; arquivo **meio-migrado** — uma linha lê o novo, outra 60 linhas abaixo só o antigo |

```bash
bash scripts/probes.sh --md      # caminho relativo a ESTA skill; base e extensão auto-descobertas
```

- **As sete linhas do veredito vão para o relatório, `n/a` incluído.** Sonda calada é como
  achado vira omissão — e omissão é pior que erro, porque tem forma de resposta.
- **Credencial no trajeto usa os três estados** do Pass C item 4: `viva` / `expirada` (com o
  `exp` **decodificado**) / `não apurável`. `git log -S '<palavra>'` volta vazio num JWT — o
  payload é base64; só a sonda estrutural acha. Afirmar "viva" sem decodificar é você
  cometendo o item 4.
- **Membro órfão se prova por DIFERENCIAL de conjuntos, não por contagem** — e por **bloco**, não
  por arquivo: o arquivo que ligava o campo no caminho de update o TINHA, e o bloco do create,
  400 linhas acima, não. Os rótulos da sonda ordenam a triagem: `DEPENDE` (a raiz de pacote do
  sítio referencia o membro novo — o registro é exigido), `MEIO-LIGADO`/`MEIO-MIGRADO` (o arquivo
  liga um caminho e não o outro), `TOCADO`.
- Sondas 3, 4 e 6 são **heurísticas**: aceitam `--novo/--veterano/--caminho`, `--radical` e
  `--campo k=k2`, e dizem quando não sabem. Família preexistente não aparece no diff — se a
  mudança alterou a irmã de uma família antiga, nomeie o radical. Renomeação distante (hunks
  diferentes) não é detectada — nomeie o campo.

- **"Que evidência existe de que este controle já rodou uma vez?"** Contador em zero, `catch` gravando "inconclusivo" desde sempre, workflow com zero execuções.
- Todo `as any`, `?` e `??` novo é um verificador desligado: **o que ele estava dizendo?**
- Consertar uma camada troca erro por **perda silenciosa**? Então conserte a mais funda, não o call-site que estourou.

### 2. Pass B — a prova (o teste que não testa)

Não pergunte "tem teste". Pergunte se ele **pode falhar**:

| Sinal | O que é |
|---|---|
| asserção negativa (`not.toBe`) sobre valor que pode ser `undefined` | vacuidade — passaria com qualquer coisa |
| constantes que **não colidem** | passa pelo motivo errado; não distingue o caminho do vizinho |
| a verificação e sua fonte da verdade são o mesmo objeto | tautologia — verde para sempre por construção |
| teste de resiliência que fixa o **valor** do estado degradado | assere o defeito; passa *por causa* dele |
| suíte não compila · aborta por OOM · não termina pelo comando documentado | não é vermelha, **evaporou** |
| fixture **inventada** para uma guarda que tem adversário nomeado | prova a guarda sobre um caso para o qual ela não foi escrita |

**Aceite = mutação.** Reintroduza o defeito, ou apague uma guarda por vez, e registre a matriz:
qual mutação quebra quantos testes. Guarda cuja mutação não quebra nada não é guarda — a
proteção mora em outro lugar, e o comentário que afirma o contrário é a parte cara, porque a
próxima refatoração confia nele.

**Mutação prova que a guarda DECIDE; a tabela de fixtures prova que decide CERTO.** Uma não
substitui a outra — "19 testes reprovam quando a régua some" convive com a régua disparando na
frase literal do card e calando no plano numerado. Para todo predicado, regex, limiar ou janela
que o diff cria ou muda:

1. **Execute-o sobre as entradas que a spec nomeia** — a frase do critério de aceite, o caso do
   docblock ("com `KAN` nos dois sites…"), a mensagem do incidente. Verbatim, não um substituto
   conveniente (`OPS` no lugar da chave que colide; um relato de 520 chars no lugar dos 97 do
   card). Registre a tabela `entrada · tamanho · resultado · esperado`.
2. **Limiar tem dois lados.** Um caso logo dentro e um logo fora, com **forma e tamanho reais** —
   fixture de 51 chars não exercita uma janela de 280; plano numerado de 300 chars é a forma
   comum, não a exceção. Toda calibragem tem um falso-positivo e um falso-negativo à espreita.
3. **Comentário removido que descreve defeito passado é oráculo de regressão.** O caso que ele
   narrava ("o agente devolvia o anúncio como resposta final") tem teste, ou o achado é "a
   regressão que o comentário documentava ficou sem prova".

> **Guarda-da-guarda:** guarda nova tem que reprovar quando o parsing dela falha, nunca aprovar vazio.

### 3. Pass C — a fronteira com o mundo (o que só falha em prod)

1. **O que lê estado do ambiente?** Ordem de coluna, existência de tabela, env, tag de imagem, estado do tracking de migration — propriedade do ambiente, **não do repositório**. Valide contra o destino, nos dois estados que existem no mundo.
2. **Guarda protege o estado ANTES, não o depois.** Idempotência dispara depois da conversão — o estado que produção não tem. Operação pesada = opt-in explícito.
3. **Runner transacional:** a falha de um item rola todos. Não misture item pesado ou ambiente-dependente com item obrigatório.
4. **Três estados, nunca dois:** `valor` / `ausente-de-fato` / `indisponível-para-apurar`. Colapsar os dois últimos vira **afirmação falsa** — pior que erro, porque tem forma de resposta.
5. **Nunca cacheie o resultado de um caminho que falhou**, e não marque `resolvido` fora do ramo de sucesso.
6. Fail-open pode em exibição, nunca em autorização. **Silêncio não pode em lugar nenhum** — logue com a mensagem do erro. Erro engolido no cliente transforma conserto de backend em "salvou" sem ter salvo.
7. **Comentário no raio do diff é afirmação factual** — confira contra o comportamento. Duas prosas contraditórias no mesmo arquivo é defeito. Comentário que cita consumidor, índice usado ou medição vai conferido contra o mundo. E mensagem de erro, recusa e descrição de tool são **API, não prosa**: recusa que aconselha ação impossível ("obtenha o id listando os arquivos", numa fonte que por construção não tem integração para listar) é dead-end que nenhum teste pega — o teste assere que a recusa saiu, nunca que o conselho é **seguível**. Onde o chamador é um LLM, ele vai **tentar** o conselho.
8. **O instrumento contamina a medida.** `EXPLAIN` sem `ANALYZE` faz scan real; `count(*)` escolhe o índice que você ia dropar. Rode o diagnóstico duas vezes: se o contador mexeu, é você.
9. **O que compila não é o que sobe.** Descritor de build/deploy (Dockerfile, compose, CI, Makefile, `postinstall`, tfvars) enumera dependências **à mão** e não passa por `tsc` nem por teste: pacote novo que o serviço importa e o Dockerfile não copia sobe em crash-loop com a suíte inteira verde. A sonda 3 lê esses arquivos; o Pass C confere que o artefato que vai ao destino contém o que o código exige.

### 4. As saídas que a PR quase nunca traz

Produza mesmo quando o código está perfeito:

- **Descontinuidade** — quem e quantos mudam de comportamento no dia do deploy, com número.
- **Degrau na série** — que métrica, coluna ou dashboard muda de definição sem backfill.
- **Premissa** — a correção pode estar certa e a *história* errada, e é a história que sobrevive no comentário e no card. Causa-raiz descrita ≠ incidente real → o fix é especulativo mesmo funcionando, e o defeito real segue aberto.
- **Procedimento de aceite** — diff entre o "Como testar" da PR e o do card/spec/issue. Precondição **adicionada** (uma chave que o card não manda desligar), passo removido ou esperado alterado é renegociação do critério: ou está escrita no card, ou é achado — a PR narra o teste que passou, não o que foi pedido. Sem fonte de aceite acessível → `indisponível-para-apurar`.
- **O que não é seu para decidir** — descontinuar canal, teto de gasto, virar flag. Decisão de negócio pede gate humano nomeado, não commit dentro de um PR grande.

### 5. Reportar

Confiança **por achado**, nunca no atacado. **Mesmo texto nos dois canais** — resumir num e
detalhar no outro é a divergência de prosa que o Pass C item 7 audita nos outros.

| Aspecto | Regra |
|---|---|
| Caminho | `.proof/<escopo>.md`, na raiz do projeto auditado |
| Slug | nº → `pr-171` · branch/`KEY-N` → nome sanitizado · vazio → branch atual |
| Sobrescreve | sim — é o diagnóstico do estado **atual**, não histórico; o carimbo diz qual |
| `.gitignore` | `git check-ignore -q .proof` falhou? **avise** no rodapé. Não edite, não commite. |

```
✅ /proof <escopo> — <N> achados (<B> bloqueadores)
> Carimbo: HEAD <sha> · base <sha> · diff <hash> · <data>        ← saída de delta.sh --stamp

## Delta desde o carimbo anterior                                 ← só quando há relatório anterior
<commits desde o carimbo, os que tocam achado anterior marcados · arquivos · por achado anterior:
 fechado (prova: <teste/mutação>) / aberto / mudou de forma>

## Bloqueadores
🔴 <título>  `arquivo:linha`  ✅ verificado
   Falha:    <entrada concreta → saída errada>
   Conserto: <1-2 linhas, no idioma do arquivo>

## Achados
🟠 <título>  `arquivo:linha`  ⚠️ não verificado — pista forte, não fato estabelecido

## Gates rodados
| gate                     | resultado                |
| build/lint/test <pacote> | <suítes> · <testes>      |
| mutação                  | <mutação> → <N> reprovam |
| fixtures                 | <entrada da spec> · <tamanho> → <resultado> vs <esperado> |
| 6 sondas do §1           | <sonda> → <veredito>     |

## O que NÃO foi coberto
<o que não rodou, e por quê — escrito, não implícito>

## Herdado, não deste PR
<achado + prova de que já existe na base>

## O que está certo (conferido, não aceito)
<premissas que o autor pode parar de defender>

---
📄 `.proof/<escopo>.md`
Válido para HEAD `<sha>`. Commit depois disso — inclusive o que conserta estes achados — é
código não auditado: rode `/proof` de novo.
⚠️ `.proof/` não está ignorado neste repo — adicione ao `.gitignore` antes de commitar.
```

Catálogo das classes de defeito que motivaram cada passe e sonda, com o movimento mecânico de
cada uma: `references/classes.md`.

## Red Flags — STOP

- "A suíte está verde, então está coberto" → NÃO. Verde afirma "não há regressão". **Não afirma que os achados estão cobertos.**
- "Tem teste pro caso" → NÃO até a mutação provar. Teste que nunca falhou não é teste.
- "A matriz de mutação reprova N, a régua está certa" → NÃO. Mutação prova que **decide**, não que decide **certo** — cadê a entrada que a spec nomeia, dos dois lados do limiar?
- "O guard está lá, vi no decorator" → NÃO. Estar referenciado ≠ decidir ≠ ser alcançado.
- "Rodei na minha máquina" → NÃO decide nada sobre ordem de coluna, env ou tracking de migration. Meça no destino.
- "É só remover, não tem uso" → NÃO. Pergunte **o que deixou de funcionar para isto ficar sem uso** antes de propor remoção.
- "Achei um bug mas não sei reproduzir" → reporte como `⚠️ não verificado`, com arquivo e linha. **Nunca** como fato.
- "O código está perfeito, aprovo" → falta a descontinuidade e o degrau na série. O passe 4 não é opcional.
- "Vou consertar já que estou aqui" → NÃO — e o motivo não é autor ≠ revisor: rodando antes da PR, você é os dois. É que **quem conserta para de auditar** — o `O que NÃO foi coberto` encurta e a matriz de mutação nunca roda. Conserto é `/fast`, depois.
- "Já rodei o /proof nesta branch" → NÃO. O relatório é de um SHA, e a branch andou. Medido: 7 achados de uma revisão humana, **nenhum** nos arquivos que o proof tinha auditado — 95 entraram depois.
- "Consertei os achados, a PR pode abrir" → NÃO. O conserto é o código mais enviesado da branch e ainda não foi auditado — 3 dos 7 achados daquela revisão moravam no commit que fechava os achados do proof.
- "Adicionei o pacote/campo e o `tsc` passou" → NÃO até o bloco que enumera os irmãos ter o novo. Descritor de build não compila; construtor posicional aceita um argumento a menos.
- "O produtor mudou o campo e os testes passam" → NÃO até cada leitor do campo antigo estar classificado: intencional / migrado / colateral. Leitor em outro serviço não está na suíte deste.
- "Existe PR aberta, então comento" → NÃO. Nº de PR é **escopo, não destino**. Sem `--comment`, o texto é seu.
- "O relatório é longo — resumo no terminal e salvo o completo no arquivo" → NÃO. Mesmo texto nos dois.
- "O diff não mostra esse arquivo, então ele não está na PR" → NÃO. Arquivo que entrou e saiu na mesma branch é invisível em `git diff <base>...HEAD` e **permanente** no merge sem squash. O escopo é o trajeto, não as duas pontas.
- "Tirei o padrão do lugar onde ele dava erro" → NÃO até o grep da assinatura voltar vazio. Remoção sem raio conserta a **ocorrência** e preserva a **classe** — que então sobrevive à auditoria seguinte. Já aconteceu 3x com o mesmo padrão.
- "Só adicionei o tipo na lista" → NÃO. Membro novo em catálogo é **estado novo**: prove que cada estágio que trata o veterano trata este também, ou é estado que nasce inalcançável.
- "A credencial expirou, então não é achado" → NÃO. Expirar é sorte, não controle — o processo escreveu segredo em histórico permanente. E afirmar "viva" sem decodificar o `exp` é o Pass C item 4 aplicado a você.
- "Vou dar `gh pr review --approve`" → NÃO, nunca, em nenhuma forma: quem carimba estado de review é pessoa, não skill. Comentário, só com `--comment` explícito.
