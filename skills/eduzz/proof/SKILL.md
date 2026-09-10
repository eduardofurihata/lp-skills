---
name: proof
description: 'Use when user invokes /proof to code review a PR, diff or branch by auditing the EVIDENCE, not the mechanism — the missing part is proof the change is reached, exercised, and holds in the target env. Runs three passes (value trace, test proof, world boundary) plus five automated probes for what a diff has no line to show — secret committed-and-removed inside the branch, the removed anti-pattern surviving in an untouched file, a new catalog member no stage handles, an asymmetrically-guarded sibling, and a merged view written back — audits tests by mutation, and reports with per-finding confidence plus what was NOT covered. Built to run BEFORE the PR exists: the report IS the deliverable, handed back as text (terminal + a gitignored `.proof/<scope>.md`) so the user decides what to do with it — fix now, paste into the PR, or discard. A PR number is SCOPE, never a destination: posting it as a PR comment requires the explicit `--comment` flag. Never approves, requests changes, merges, or writes code — fixing is another invocation.'
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
> `--comment` explícito. Conserto é `/fast`, depois.
> **Não é o Step 8 do `/method`** — aquele roda dentro do protocolo, com relatório **versionado**
> em `kanban/08-code-review/`. O `/proof` é avulso, sem docs e sem card: o `.proof/` é
> gitignored, descartável, sobrescrito a cada rodada.

## Iron Law

> **Precisão > tokens.** Achado só existe com **coordenada** e **como falha** — entrada
> concreta → saída errada. Sem os dois é preferência de estilo: descarte, não reporte.
> Coordenada é `arquivo:linha` **dentro ou fora do diff**, ou `<commit>:<arquivo>` quando o
> defeito mora no trajeto da branch. Exigir linha do diff é como esta skill fica cega para
> as cinco sondas do §1 — achado que não cabe no formato não chega nem a "não coberto".

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

## Fluxo

### 0. Preparação — sem isto o resto é leitura

1. Worktree isolada; **base mesclada antes de ler** — revise o código como ele vai ficar.
2. `build` · `lint` · `test` do que foi tocado, com **número** (suítes/testes), nunca "verde".
3. Vermelho que já existe na base: prove por hash ou rodando na base limpa, e **separe** — não é deste PR.
4. SQL editado roda contra banco real (`EXPLAIN`, `BEGIN/ROLLBACK`). Dublê de banco prova a regra e **nunca** prova que o SQL é válido.
5. Conflito textual ≠ conflito semântico: onde o merge saiu limpo, compare os conjuntos de linhas `+/-` dos dois lados. Ao decidir um conflito, **o lado que tem teste ganha**.
6. Base mesclada mostra as duas **pontas**. O **trajeto** é outro objeto e se lê à parte — rode as sondas do §1 **antes** do diff. Merge sem squash escreve o trajeto inteiro na base.

### 1. Pass A — o rastro (o valor que não chega)

Para cada campo, controle ou regra tocado — **e para cada um que a mudança alcança sem
tocar** — percorra e **nomeie o elo que falha**:

| Sujeito | Rastro | Falha típica |
|---|---|---|
| Campo | produtor → serialização → DTO → comando → handler → repositório → coluna → leitor | declarado numa ponta e o `DEFAULT` vence na outra; argumento extra ignorado em silêncio; coluna fora do `SELECT` |
| Controle | decide? · **algo o executa?** · cobre o território inteiro? · rollout visível fora do código? | guard não referenciado; regra escopada a metade das pastas; flag só no default do módulo |
| Regra duplicada | quantas cópias o grep acha; paridade é **estrutural** (tipo total) ou disciplinar? | a terceira cópia — o grep que acha duas acha ela |

**As cinco sondas — o que o diff não tem linha para mostrar.** O diff é a projeção de duas
pontas: mostra a mudança, não o que ela **alcança** nem o que **deixou atrás**.

| Sonda | Pergunta ausente | Achado típico |
|---|---|---|
| 1 · trajetória | revisei o objeto que vai ser **mergeado**? | credencial commitada e removida na mesma branch: diff líquido zero, permanente no merge sem squash |
| 2 · irmãs do removido | o que mais fala essa língua? | o padrão saiu de um caminho e ficou nos outros — a classe sobrevive ao conserto da ocorrência |
| 3 · membro órfão | o estado que criei **pode existir**? | membro novo de catálogo que nenhum estágio trata: nasce inalcançável |
| 4 · gêmea assimétrica | a irmã é **chamada** sob a mesma guarda? | uma gated por `x !== undefined`, a outra sempre roda: divergência já instalada |
| 5 · escrita colateral | o que isto **grava** é o que precisou **ler**? | patcha a visão mesclada: o update que removia a chave a vê voltar |

```bash
bash scripts/probes.sh --md      # caminho relativo a ESTA skill; base e extensão auto-descobertas
```

- **As seis linhas do veredito vão para o relatório, `n/a` incluído.** Sonda calada é como
  achado vira omissão — e omissão é pior que erro, porque tem forma de resposta.
- **Credencial no trajeto usa os três estados** do Pass C item 4: `viva` / `expirada` (com o
  `exp` **decodificado**) / `não apurável`. `git log -S '<palavra>'` volta vazio num JWT — o
  payload é base64; só a sonda estrutural acha. Afirmar "viva" sem decodificar é você
  cometendo o item 4.
- **Membro órfão se prova por DIFERENCIAL de conjuntos, não por contagem** — no caso medido
  novo e veterano tinham contagem parecida e o defeito estava na diferença.
- Sonda 3 e 4 são **heurísticas**: aceitam `--novo/--veterano` e `--radical`, e dizem quando
  não sabem. Família preexistente não aparece no diff — se a mudança alterou a irmã de uma
  família antiga, nomeie o radical.

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

**Aceite = mutação.** Reintroduza o defeito, ou apague uma guarda por vez, e registre a matriz:
qual mutação quebra quantos testes. Guarda cuja mutação não quebra nada não é guarda — a
proteção mora em outro lugar, e o comentário que afirma o contrário é a parte cara, porque a
próxima refatoração confia nele.

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

### 4. As saídas que a PR quase nunca traz

Produza mesmo quando o código está perfeito:

- **Descontinuidade** — quem e quantos mudam de comportamento no dia do deploy, com número.
- **Degrau na série** — que métrica, coluna ou dashboard muda de definição sem backfill.
- **Premissa** — a correção pode estar certa e a *história* errada, e é a história que sobrevive no comentário e no card. Causa-raiz descrita ≠ incidente real → o fix é especulativo mesmo funcionando, e o defeito real segue aberto.
- **O que não é seu para decidir** — descontinuar canal, teto de gasto, virar flag. Decisão de negócio pede gate humano nomeado, não commit dentro de um PR grande.

### 5. Reportar

Confiança **por achado**, nunca no atacado. **Mesmo texto nos dois canais** — resumir num e
detalhar no outro é a divergência de prosa que o Pass C item 7 audita nos outros.

| Aspecto | Regra |
|---|---|
| Caminho | `.proof/<escopo>.md`, na raiz do projeto auditado |
| Slug | nº → `pr-171` · branch/`KEY-N` → nome sanitizado · vazio → branch atual |
| Sobrescreve | sim — é o diagnóstico do estado **atual**, não histórico |
| `.gitignore` | `git check-ignore -q .proof` falhou? **avise** no rodapé. Não edite, não commite. |

```
✅ /proof <escopo> — <N> achados (<B> bloqueadores)

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
| 5 sondas do §1           | <sonda> → <veredito>     |

## O que NÃO foi coberto
<o que não rodou, e por quê — escrito, não implícito>

## Herdado, não deste PR
<achado + prova de que já existe na base>

## O que está certo (conferido, não aceito)
<premissas que o autor pode parar de defender>

---
📄 `.proof/<escopo>.md`
⚠️ `.proof/` não está ignorado neste repo — adicione ao `.gitignore` antes de commitar.
```

## Red Flags — STOP

- "A suíte está verde, então está coberto" → NÃO. Verde afirma "não há regressão". **Não afirma que os achados estão cobertos.**
- "Tem teste pro caso" → NÃO até a mutação provar. Teste que nunca falhou não é teste.
- "O guard está lá, vi no decorator" → NÃO. Estar referenciado ≠ decidir ≠ ser alcançado.
- "Rodei na minha máquina" → NÃO decide nada sobre ordem de coluna, env ou tracking de migration. Meça no destino.
- "É só remover, não tem uso" → NÃO. Pergunte **o que deixou de funcionar para isto ficar sem uso** antes de propor remoção.
- "Achei um bug mas não sei reproduzir" → reporte como `⚠️ não verificado`, com arquivo e linha. **Nunca** como fato.
- "O código está perfeito, aprovo" → falta a descontinuidade e o degrau na série. O passe 4 não é opcional.
- "Vou consertar já que estou aqui" → NÃO — e o motivo não é autor ≠ revisor: rodando antes da PR, você é os dois. É que **quem conserta para de auditar** — o `O que NÃO foi coberto` encurta e a matriz de mutação nunca roda. Conserto é `/fast`, depois.
- "Existe PR aberta, então comento" → NÃO. Nº de PR é **escopo, não destino**. Sem `--comment`, o texto é seu.
- "O relatório é longo — resumo no terminal e salvo o completo no arquivo" → NÃO. Mesmo texto nos dois.
- "O diff não mostra esse arquivo, então ele não está na PR" → NÃO. Arquivo que entrou e saiu na mesma branch é invisível em `git diff <base>...HEAD` e **permanente** no merge sem squash. O escopo é o trajeto, não as duas pontas.
- "Tirei o padrão do lugar onde ele dava erro" → NÃO até o grep da assinatura voltar vazio. Remoção sem raio conserta a **ocorrência** e preserva a **classe** — que então sobrevive à auditoria seguinte. Já aconteceu 3x com o mesmo padrão.
- "Só adicionei o tipo na lista" → NÃO. Membro novo em catálogo é **estado novo**: prove que cada estágio que trata o veterano trata este também, ou é estado que nasce inalcançável.
- "A credencial expirou, então não é achado" → NÃO. Expirar é sorte, não controle — o processo escreveu segredo em histórico permanente. E afirmar "viva" sem decodificar o `exp` é o Pass C item 4 aplicado a você.
- "Vou dar `gh pr review --approve`" → NÃO, nunca, em nenhuma forma: quem carimba estado de review é pessoa, não skill. Comentário, só com `--comment` explícito.
