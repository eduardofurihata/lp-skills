---
name: proof
description: 'Use when user invokes /proof to code review a PR, diff or branch by auditing the EVIDENCE, not the mechanism — the missing part is proof the change is reached, exercised, and holds in the target env. Runs three passes (value trace, test proof, world boundary), audits tests by mutation, and reports with per-finding confidence plus what was NOT covered. Posts the report as a PR comment when given a PR number; never approves, requests changes, merges, or writes code — fixing is another invocation.'
effort: max
argument-hint: "[nº da PR | branch | vazio = diff atual]"
---

# /proof — Code review que audita a prova

O mecanismo quase sempre está certo. O que falta é a **prova** de que ele é **alcançado**, é
**exercitado**, e **continua valendo no ambiente de destino**. Este skill audita as três — não
relê o código procurando erro de digitação.

> 🚫 **NÃO escreve código, NÃO commita, NÃO aprova, NÃO pede changes, NÃO mergeia.**
> Com nº de PR publica o relatório como **comentário** (`gh pr comment`) — nunca
> `gh pr review`: quem carimba estado de review é pessoa, não skill. Conserto é outra
> invocação (`/fast`), porque quem conserta perde a independência de revisar.
> **Não é o Step 8 do `/method`** — aquele roda dentro do protocolo, com relatório em
> `kanban/08-code-review/`. O `/proof` é avulso: revisa o que existe agora, sem docs, sem card.

## Iron Law

> **Precisão > tokens.** Achado só existe com `arquivo:linha` **e como falha** — entrada
> concreta → saída errada. Sem os dois é preferência de estilo: descarte, não reporte.

## Convenções (CONTRATO)

| Arg | Escopo | Publica |
|---|---|---|
| `171` (nº) | a PR, com a branch base mesclada antes de ler | ✅ comentário na PR |
| `AV-2095` / branch | `git diff <base>...<branch>` | ❌ só terminal |
| vazio | working tree + commits à frente da base | ❌ só terminal |

- A base é **descoberta** (`gh pr view --json baseRefName`, senão a branch de integração do repo), nunca assumida.
- Gates rodam pelo **comando documentado do projeto**. Se o comando não roda, isso **é** um achado.

## Fluxo

### 0. Preparação — sem isto o resto é leitura

1. Worktree isolada; **base mesclada antes de ler** — revise o código como ele vai ficar.
2. `build` · `lint` · `test` do que foi tocado, com **número** (suítes/testes), nunca "verde".
3. Vermelho que já existe na base: prove por hash ou rodando na base limpa, e **separe** — não é deste PR.
4. SQL editado roda contra banco real (`EXPLAIN`, `BEGIN/ROLLBACK`). Dublê de banco prova a regra e **nunca** prova que o SQL é válido.
5. Conflito textual ≠ conflito semântico: onde o merge saiu limpo, compare os conjuntos de linhas `+/-` dos dois lados. Ao decidir um conflito, **o lado que tem teste ganha**.

### 1. Pass A — o rastro (o valor que não chega)

Para cada campo, controle ou regra tocado, percorra e **nomeie o elo que falha**:

| Sujeito | Rastro | Falha típica |
|---|---|---|
| Campo | produtor → serialização → DTO → comando → handler → repositório → coluna → leitor | declarado numa ponta e o `DEFAULT` vence na outra; argumento extra ignorado em silêncio; coluna fora do `SELECT` |
| Controle | decide? · **algo o executa?** · cobre o território inteiro? · rollout visível fora do código? | guard não referenciado; regra escopada a metade das pastas; flag só no default do módulo |
| Regra duplicada | quantas cópias o grep acha; paridade é **estrutural** (tipo total) ou disciplinar? | a terceira cópia — o grep que acha duas acha ela |

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
7. **Comentário no raio do diff é afirmação factual** — confira contra o comportamento. Duas prosas contraditórias no mesmo arquivo é defeito. Comentário que cita consumidor, índice usado ou medição vai conferido contra o mundo.
8. **O instrumento contamina a medida.** `EXPLAIN` sem `ANALYZE` faz scan real; `count(*)` escolhe o índice que você ia dropar. Rode o diagnóstico duas vezes: se o contador mexeu, é você.

### 4. As saídas que a PR quase nunca traz

Produza mesmo quando o código está perfeito:

- **Descontinuidade** — quem e quantos mudam de comportamento no dia do deploy, com número.
- **Degrau na série** — que métrica, coluna ou dashboard muda de definição sem backfill.
- **Premissa** — a correção pode estar certa e a *história* errada, e é a história que sobrevive no comentário e no card. Causa-raiz descrita ≠ incidente real → o fix é especulativo mesmo funcionando, e o defeito real segue aberto.
- **O que não é seu para decidir** — descontinuar canal, teto de gasto, virar flag. Decisão de negócio pede gate humano nomeado, não commit dentro de um PR grande.

### 5. Reportar

Confiança **por achado**, nunca no atacado. Com nº de PR, o mesmo texto vai por `gh pr comment`.

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

## O que NÃO foi coberto
<o que não rodou, e por quê — escrito, não implícito>

## Herdado, não deste PR
<achado + prova de que já existe na base>

## O que está certo (conferido, não aceito)
<premissas que o autor pode parar de defender>
```

## Red Flags — STOP

- "A suíte está verde, então está coberto" → NÃO. Verde afirma "não há regressão". **Não afirma que os achados estão cobertos.**
- "Tem teste pro caso" → NÃO até a mutação provar. Teste que nunca falhou não é teste.
- "O guard está lá, vi no decorator" → NÃO. Estar referenciado ≠ decidir ≠ ser alcançado.
- "Rodei na minha máquina" → NÃO decide nada sobre ordem de coluna, env ou tracking de migration. Meça no destino.
- "É só remover, não tem uso" → NÃO. Pergunte **o que deixou de funcionar para isto ficar sem uso** antes de propor remoção.
- "Achei um bug mas não sei reproduzir" → reporte como `⚠️ não verificado`, com arquivo e linha. **Nunca** como fato.
- "O código está perfeito, aprovo" → falta a descontinuidade e o degrau na série. O passe 4 não é opcional.
- "Vou consertar já que estou aqui" → NÃO. A PR passaria a ter autor e revisor iguais.
- "Vou dar `gh pr review --approve`" → NÃO, nunca. Comentário só.
