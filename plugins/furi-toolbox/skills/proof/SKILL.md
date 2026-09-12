---
name: proof
description: 'Use when user invokes /proof to code review a PR, diff or branch by auditing the EVIDENCE, not the mechanism — the missing part is proof the change is reached, exercised, and holds in the target env. A method, not a checklist: three passes (value trace, test proof, world boundary), six probes for what the diff cannot show (a secret committed-and-removed, an anti-pattern surviving elsewhere, a new member missing where its siblings are listed, a sibling under another guard, a merged or failed read written back, a moved field still read by the old name), tests audited by mutation and fixture fidelity, a stamp with the audited SHA and a delta against the previous run (a fix is unaudited code), per-finding confidence, and an explicit list of what was NOT covered. Works in any git repository, any language, any forge — probes are described as movements the agent adapts to the language found, never as scripts. Runs as a subagent (context: fork, effort high) so the main session is never blocked — the whole report comes back as the result, never a file in the audited repo. Runs BEFORE the PR exists; the report is the deliverable. A PR number is SCOPE, not a destination — commenting requires `--comment`. Never approves, merges or writes code.'
context: fork
effort: high
argument-hint: "[nº da PR | branch | vazio = diff atual] [--desde <sha>] [--comment]"
---

# /proof — Code review que audita a prova

O mecanismo quase sempre está certo. O que falta é a **prova** de que ele é **alcançado**, é
**exercitado**, e **continua valendo no ambiente de destino**. Este método audita as três — não
relê o código procurando erro de digitação.

Ele roda **antes de a PR existir** — que é quando o resultado ainda muda o código. A entrega é
o **texto**, e o que fazer com ele é decisão sua: consertar agora, colar na PR, ou descartar.

> 🚫 **NÃO escreve código, NÃO commita, NÃO aprova, NÃO pede changes, NÃO mergeia, NÃO publica,
> NÃO cria arquivo no repositório auditado.** O relatório é a entrega e volta **inteiro** como
> resultado. Publicar exige `--comment` explícito. Conserto é outra passada, depois — **e depois
> do conserto, `/proof` de novo.**

Funciona em **qualquer repositório git, qualquer linguagem, qualquer forja**. Onde este texto diz
"a forma de declaração da linguagem", é o agente quem a reconhece no arquivo que tem na frente —
campo de struct, atributo de classe, coluna de schema, chave de DTO, entrada de enum. Nada aqui
pressupõe stack.

## Onde roda

`context: fork` — o `/proof` roda num **subagente**, com `effort: high` e **sem `model:` fixo** —
ele usa o modelo padrão de subagente (`CLAUDE_CODE_SUBAGENT_MODEL`, se configurado; senão o da
sessão), então acompanha a atualização de modelo em vez de ficar preso a um alias. Os greps, os
gates e a matriz de mutação não têm por que entrar no contexto de quem pediu a auditoria; e
`high` é o teto certo para um trabalho que é mecânico na maior parte — quem quiser `max` numa
rodada específica muda o frontmatter, não há override por argumento. `background` fica omitido:
**a sessão não espera** — o relatório chega como notificação quando a auditoria termina.

O que o método abaixo já assume por causa disso:

- **O retorno abre com uma instrução para quem o recebe.** Como o relatório passa pelo agente
  principal antes de chegar à pessoa, a primeira linha é
  `⚠️ Relatório do /proof — exiba inteiro, sem resumir, sem reordenar.` A proibição de resumir
  já era doutrina; agora tem destinatário nomeado.
- **Sem canal com o usuário.** Um fork não pergunta no meio. Onde faltar o que decidir —
  escopo ambíguo, base não resolvida, `--comment` sem PR ou sem CLI —, o método **para e devolve
  a pergunta como resultado**: relatório curto, com o que faltou, sem auditar o alvo errado.
- **Sem a conversa.** O fork não vê rodadas anteriores: o delta existe **só** com `--desde <sha>`.
  Sem ele, a seção Delta diz `indisponível-para-apurar` — e o rodapé do relatório entrega o
  comando pronto para a próxima rodada.
- **Fora do Claude Code** (Codex, Cursor) as chaves são ignoradas e o `/proof` roda inline, na
  sessão. Mesmo método, mesmo relatório: nada aqui depende de estar em fork.

## Iron Law

> **Precisão > tokens.** Achado só existe com **coordenada** e **como falha** — entrada
> concreta → saída errada. Sem os dois é preferência de estilo: descarte, não reporte.
> Coordenada é `arquivo:linha` **dentro ou fora do diff**, ou `<commit>:<arquivo>` quando o
> defeito mora no trajeto da branch. Exigir linha do diff é como este método fica cego para
> as sondas — achado que não cabe no formato não chega nem a "não coberto".
>
> **Prova tem carimbo.** Vale para o SHA que auditou e para nenhum outro — o commit que
> conserta os achados inclusive. Relatório sem carimbo não diz de que código fala.
>
> **Três estados, nunca dois:** `valor` / `ausente-de-fato` / `indisponível-para-apurar`.
> Vale para o gate que o projeto não tem, o banco que não dá para acessar, o consumidor que
> mora em outro repo, o carimbo anterior que não está à mão. Colapsar os dois últimos vira
> **afirmação falsa** — pior que erro, porque tem forma de resposta.

## Convenções (CONTRATO)

`$ARGUMENTS` = `[escopo] [--desde <sha>] [--comment]`, em qualquer ordem.

| Arg | Escopo — que diff auditar | Destino |
|---|---|---|
| vazio | working tree + commits à frente da base | relatório |
| `PROJ-123` / branch | `git diff <base>...<branch>` | relatório |
| `171` (nº) | o diff da PR/MR, com a branch base mesclada antes de ler | relatório |
| `--desde <sha>` | — | liga esta rodada à anterior: o delta parte deste HEAD |
| `--comment` (**exige** nº de PR/MR) | — | relatório **+** comentário na forja |

- **O relatório é texto e volta inteiro como resultado do subagente** (fora do Claude Code, no
  terminal). Não escreve arquivo — nem no repositório auditado, nem fora dele. Abre com a linha
  de instrução do § Onde roda: a proibição de resumir vale para o canal de volta.
- **Nº de PR é escopo, não destino.** Receber `171` não autoriza escrever na PR: os três
  escopos têm o MESMO destino, e só a flag acrescenta um canal.
- **`--comment` sem nº de PR, ou sem CLI da forja autenticada (`gh`, `glab`): recuse e pare.**
  Não audite "e avise no fim" — a pessoa pediu publicação, e devolver só o texto calado é
  colapsar `indisponível-para-apurar` em `ausente-de-fato` aplicado ao próprio método.
- Primeiro token é nº de PR se casar `^[0-9]+$`; é branch/`KEY-N` se `git rev-parse --verify`
  achar. Não achou nenhum dos dois → **pare e devolva a pergunta** como resultado, não audite o
  alvo errado.
- A base é **descoberta**, nunca assumida: a CLI da forja se houver (`gh pr view --json
  baseRefName`, `glab mr view`) → a branch de integração que o repo tem (`dev`, `develop`,
  `main`, `master`, nessa ordem, local ou em `origin/`) → `git merge-base <ref> HEAD`. Nada
  resolveu → **pare e devolva a pergunta**.
- **Carimbo anterior disponível?** (Só `--desde <sha>` — o subagente não vê a conversa.) O delta
  é lido **ANTES** do diff — §0 item 9. Sem carimbo → a seção Delta do relatório diz
  `indisponível-para-apurar` e trata o escopo inteiro como não auditado.

## Fluxo

### 0. Preparação — sem isto o resto é leitura

0. **Escopo resolvido, ou recusa — antes de qualquer outra coisa.** O primeiro token de
   `$ARGUMENTS` que não é flag tem que virar **uma** destas três coisas: nº de PR (`^[0-9]+$`, e
   a CLI da forja o acha), ref que `git rev-parse --verify --quiet <token>` acha, ou nada (escopo
   vazio = diff atual). Token presente que não resolve **não é escopo vazio** — é recusa. O
   retorno inteiro é este bloco, e o método **para aqui**:
   ```
   ⚠️ Relatório do /proof — exiba inteiro, sem resumir, sem reordenar.
   ⛔ /proof não auditou — escopo não resolvido
   > `<token>` não é nº de PR nem ref que `git rev-parse --verify` ache.
   Refs locais: <git branch --format='%(refname:short)' | head -12> · PRs abertas: <n, ou indisponível-para-apurar>
   Rode de novo com uma delas — ou sem argumento, para o diff atual.
   ```
   Auditar o diff atual no lugar do alvo pedido é o pior resultado possível: tem forma de
   relatório e responde a uma pergunta que ninguém fez.
1. **Working tree sujo é decisão, não detalhe.** Escopo vazio com mudança não commitada: escolha
   um modo e **declare no carimbo** —
   - `in-place`: audita o que está no disco, inclusive o não-commitado. A sonda 1 (trajetória)
     não enxerga o que não tem commit, e o relatório diz isso.
   - `worktree`: `git worktree add <tmp> HEAD` + base mesclada. O não-commitado fica fora, e o
     relatório diz isso.
   Nunca as duas promessas. Sem mudança não commitada, `worktree` é o padrão.
2. **Base mesclada antes de ler** — revise o código como ele vai ficar. No modo worktree, `git
   merge <base>` na worktree; no in-place, `git merge-tree --write-tree <base> HEAD` diz o que a
   mescla muda sem tocar o disco.
3. **Gates são os que o projeto declara** — scripts do manifesto (`package.json`,
   `pyproject.toml`, `Cargo.toml`, `go.mod` + `Makefile`), `justfile`, o workflow de CI. Rode o
   do que foi tocado, com **número** (suítes/testes), nunca "verde". Três resultados, e os três
   vão para o relatório:
   - rodou → o número;
   - gate **declarado** que não roda pelo comando documentado → **achado** — é defeito do projeto,
     e o resto da auditoria fica sem rede;
   - projeto **sem gate declarado** → `indisponível-para-apurar`. Não é achado: repositório de
     conteúdo, infra ou prompt não tem suíte e não está errado por isso.
4. Vermelho que já existe na base: prove por hash ou rodando na base limpa, e **separe** — não é
   desta mudança.
5. SQL editado roda contra banco real (`EXPLAIN`, `BEGIN/ROLLBACK`). Dublê de banco prova a regra
   e **nunca** prova que o SQL é válido. Sem acesso ao banco → `indisponível-para-apurar`, com o
   SQL nomeado em `O que NÃO foi coberto`.
6. Conflito textual ≠ conflito semântico: onde o merge saiu limpo, compare os conjuntos de linhas
   `+/-` dos dois lados. Ao decidir um conflito, **o lado que tem teste ganha**.
7. Base mesclada mostra as duas **pontas**. O **trajeto** é outro objeto e se lê à parte — rode
   as sondas **antes** do diff. Merge sem squash escreve o trajeto inteiro na base.
8. **Carimbo** — a linha que vai no cabeçalho. Hash do **diff**, não só o SHA: rebase muda o SHA
   sem mudar o conteúdo, e o inverso.
   ```bash
   H=$(git rev-parse HEAD); B=$(git merge-base <base> HEAD)
   D=$(git diff "$B...HEAD" | sha256sum | cut -c1-12)
   git diff --quiet && git diff --cached --quiet || SUJO=" +dirty"
   echo "> Carimbo: HEAD ${H:0:12} · base ${B:0:12} · diff ${D}${SUJO} · $(date -u +%Y-%m-%dT%H:%MZ) · modo: <in-place|worktree>"
   ```
9. **Delta** — só com `--desde <sha>` (o subagente não vê a conversa, e carimbo anterior só chega por aí):
   ```bash
   git rev-list --reverse <sha>..HEAD                  # commits desde o carimbo
   git diff --name-only <sha> HEAD                     # arquivos que mudaram
   git show --format= --name-only <commit>             # por commit: os arquivos que ele toca
   ```
   O fork recebe o **SHA**, não a lista de achados anteriores. Então o delta que ele consegue
   produzir é: commits e arquivos desde o carimbo, e — por título do commit e arquivos tocados —
   quais são **provavelmente conserto** (`fix:`, arquivo de descritor, arquivo que a mudança
   original tocou). Esses são o escopo de maior prioridade (item 10), re-auditados do zero: o
   veredito sai como `fechado (prova: <teste/mutação>)` / `aberto` / `mudou de forma` **para o
   defeito que o commit diz consertar**, e a reclassificação achado-a-achado do relatório
   anterior fica com quem tem os dois relatórios — dito no Delta, como `indisponível-para-apurar`.
   Carimbo cujo SHA não existe mais (rebase) → `indisponível-para-apurar`, dito, e o escopo
   inteiro é não auditado.
10. **Commits que consertam achados anteriores são o escopo de maior prioridade.** Conserto é
    escrito para fazer UMA frase sumir, por quem acabou de ler o diagnóstico, no menor escopo —
    e costuma MOVER código (promover um util a pacote é criar um membro novo com N sítios de
    registro). Os três passes valem para ele como para qualquer outro; "fechou o achado" se
    prova por teste ou mutação, não por leitura do commit.

### 1. Pass A — o rastro (o valor que não chega)

Para cada campo, controle ou regra tocado — **e para cada um que a mudança alcança sem
tocar** — percorra e **nomeie o elo que falha**:

| Sujeito | Rastro | Falha típica |
|---|---|---|
| Campo | produtor → serialização → DTO → comando → handler → repositório → coluna → leitor | declarado numa ponta e o `DEFAULT` vence na outra; argumento extra ignorado em silêncio; coluna fora do `SELECT` |
| Controle | decide? · **algo o executa?** · cobre o território inteiro? · rollout visível fora do código? | guard não referenciado; regra escopada a metade das pastas; flag só no default do módulo |
| Regra duplicada | quantas cópias o grep acha; paridade é **estrutural** (tipo total) ou disciplinar? | a terceira cópia — o grep que acha duas acha ela |
| Dois modos | create/update · novo/existente · stream/não-stream · REST/RPC/CLI: o campo atravessa **CADA** entrada? No modo existente, round-trip: carrega → salva sem mexer → gravado == original | campo chega ao update e não ao create; derivação de consulta gravada quando a consulta veio vazia — o edit apaga o que o create gravou |

Depois do rastro, as **seis sondas** (seção própria, abaixo) — o que o diff não tem linha para
mostrar. As sete linhas de veredito vão para o relatório, `n/a` incluído.

- **"Que evidência existe de que este controle já rodou uma vez?"** Contador em zero, `catch`
  gravando "inconclusivo" desde sempre, workflow com zero execuções.
- Todo cast forçado, optional chaining ou coalescência **novo** é um verificador desligado: **o
  que ele estava dizendo?**
- Consertar uma camada troca erro por **perda silenciosa**? Então conserte a mais funda, não o
  call-site que estourou.

### 2. Pass B — a prova (o teste que não testa)

Não pergunte "tem teste". Pergunte se ele **pode falhar**:

| Sinal | O que é |
|---|---|
| asserção negativa (`not equal`) sobre valor que pode ser nulo/indefinido | vacuidade — passaria com qualquer coisa |
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
frase literal da spec e calando no plano numerado. Para todo predicado, regex, limiar ou janela
que o diff cria ou muda:

1. **Execute-o sobre as entradas que a spec nomeia** — a frase do critério de aceite, o caso do
   docblock, a mensagem do incidente. Verbatim, não um substituto conveniente (a chave que não
   colide no lugar da que colide; um relato de 520 chars no lugar dos 97 da spec). Registre a
   tabela `entrada · tamanho · resultado · esperado`.
2. **Limiar tem dois lados.** Um caso logo dentro e um logo fora, com **forma e tamanho reais** —
   fixture de 51 chars não exercita uma janela de 280; plano numerado de 300 chars é a forma
   comum, não a exceção. Toda calibragem tem um falso-positivo e um falso-negativo à espreita.
3. **Comentário removido que descreve defeito passado é oráculo de regressão.** O caso que ele
   narrava tem teste, ou o achado é "a regressão que o comentário documentava ficou sem prova".

> **Guarda-da-guarda:** guarda nova tem que reprovar quando o parsing dela falha, nunca aprovar vazio.

### 3. Pass C — a fronteira com o mundo (o que só falha em prod)

1. **O que lê estado do ambiente?** Ordem de coluna, existência de tabela, env, tag de imagem,
   estado do tracking de migration — propriedade do ambiente, **não do repositório**. Valide
   contra o destino, nos dois estados que existem no mundo. Sem acesso ao destino →
   `indisponível-para-apurar`, nomeado.
2. **Guarda protege o estado ANTES, não o depois.** Idempotência dispara depois da conversão — o
   estado que produção não tem. Operação pesada = opt-in explícito.
3. **Runner transacional:** a falha de um item rola todos. Não misture item pesado ou
   ambiente-dependente com item obrigatório.
4. **Nunca cacheie o resultado de um caminho que falhou**, e não marque `resolvido` fora do ramo
   de sucesso.
5. Fail-open pode em exibição, nunca em autorização. **Silêncio não pode em lugar nenhum** —
   logue com a mensagem do erro. Erro engolido no cliente transforma conserto de backend em
   "salvou" sem ter salvo.
6. **Comentário no raio do diff é afirmação factual** — confira contra o comportamento. Duas
   prosas contraditórias no mesmo arquivo é defeito. Comentário que cita consumidor, índice usado
   ou medição vai conferido contra o mundo. E mensagem de erro, recusa e descrição de tool são
   **API, não prosa**: recusa que aconselha ação impossível ("obtenha o id listando os
   arquivos", numa fonte que por construção não lista) é dead-end que nenhum teste pega — o
   teste assere que a recusa saiu, nunca que o conselho é **seguível**. Onde o chamador é um
   LLM, ele vai **tentar** o conselho.
7. **O instrumento contamina a medida.** `EXPLAIN` sem `ANALYZE` faz scan real; `count(*)`
   escolhe o índice que você ia dropar. Rode o diagnóstico duas vezes: se o contador mexeu, é
   você.
8. **O que compila não é o que sobe.** Descritor de build/deploy (Dockerfile, compose, CI,
   Makefile, `postinstall`, tfvars) enumera dependências **à mão** e não passa por compilador nem
   por teste: pacote novo que o serviço importa e o Dockerfile não copia sobe em crash-loop com
   a suíte inteira verde. A sonda 3 lê esses arquivos; o Pass C confere que o artefato que vai
   ao destino contém o que o código exige.

### 4. As saídas que a PR quase nunca traz

Produza mesmo quando o código está perfeito — e escreva "nenhuma — conferido" quando for o caso,
porque "nenhuma" e "não olhei" têm a mesma cara quando ficam em branco:

- **Descontinuidade** — quem e quantos mudam de comportamento no dia do deploy, com número.
- **Degrau na série** — que métrica, coluna ou dashboard muda de definição sem backfill.
- **Premissa** — a correção pode estar certa e a *história* errada, e é a história que sobrevive
  no comentário e no card. Causa-raiz descrita ≠ incidente real → o fix é especulativo mesmo
  funcionando, e o defeito real segue aberto.
- **Procedimento de aceite** — diff entre o "Como testar" da PR e o da spec/card/issue.
  Precondição **adicionada** (uma chave que a spec não manda desligar), passo removido ou
  esperado alterado é renegociação do critério: ou está escrita na spec, ou é achado — a PR
  narra o teste que passou, não o que foi pedido. Sem fonte de aceite acessível →
  `indisponível-para-apurar`.
- **O que não é seu para decidir** — descontinuar canal, teto de gasto, virar flag. Decisão de
  negócio pede gate humano nomeado, não commit dentro de uma PR grande.

### 5. Reportar

Confiança **por achado**, nunca no atacado. O relatório sai **inteiro** — como retorno do subagente e,
fora do Claude Code, no terminal. Resumir num canal e detalhar no outro é a divergência de
prosa que o Pass C item 6 audita nos outros.

```
⚠️ Relatório do /proof — exiba inteiro, sem resumir, sem reordenar.
✅ /proof <escopo> — <N> achados (<B> bloqueadores)
> Carimbo: HEAD <sha> · base <sha> · diff <hash>[ +dirty] · <data> · modo: <in-place|worktree>

## Delta desde o carimbo anterior                     ← só com --desde
<commits desde o carimbo, os que tocam achado anterior marcados · arquivos · por achado anterior:
 fechado (prova: <teste/mutação>) / aberto / mudou de forma>
<ou: indisponível-para-apurar — sem carimbo anterior; escopo inteiro tratado como não auditado>

## Bloqueadores
🔴 <título>  `arquivo:linha`  ✅ verificado
   Falha:    <entrada concreta → saída errada>
   Conserto: <1-2 linhas, no idioma do arquivo>

## Achados
🟠 <título>  `arquivo:linha`  ⚠️ não verificado — pista forte, não fato estabelecido

## Gates rodados
| gate                       | resultado                                                   |
| <comando do projeto>       | <suítes> · <testes>  — ou  indisponível-para-apurar: <motivo> |
| mutação                    | <mutação> → <N> reprovam                                    |
| fixtures                   | <entrada da spec> · <tamanho> → <resultado> vs <esperado>   |
| sonda 1a trajetória        | <veredito ou n/a — motivo>                                  |
| sonda 1b credencial        | <veredito ou n/a — motivo>                                  |
| sonda 2 irmãs do removido  | <veredito ou n/a — motivo>                                  |
| sonda 3 membro órfão       | <veredito ou n/a — motivo>                                  |
| sonda 4 gêmea assimétrica  | <veredito ou n/a — motivo>                                  |
| sonda 5 escrita colateral  | <veredito ou n/a — motivo>                                  |
| sonda 6 campo mudou de mão | <veredito ou n/a — motivo>                                  |

## O que NÃO foi coberto
<o que não rodou, e por quê — escrito, não implícito>

## Herdado, não desta mudança
<achado + prova de que já existe na base>

## O que está certo (conferido, não aceito)
<premissas que o autor pode parar de defender>

---
Válido para HEAD `<sha>`. Commit depois disso — inclusive o que conserta estes achados — é
código não auditado: rode `/proof --desde <sha>` de novo.
```

## As sondas — o que o diff não tem linha para mostrar

O diff é a projeção de **duas pontas**: mostra a mudança, não o que ela **alcança** nem o que
**deixou atrás**. Cada sonda faz uma pergunta que a leitura do diff não faz. Os comandos abaixo
são o **movimento**, não a resposta: são `git` puro, portáteis; a **forma** — o que é uma
declaração, uma chamada, uma chave — é a da linguagem do arquivo, e é o agente quem a reconhece.
Sonda sem hit imprime `n/a` **com o motivo** — sonda calada é como achado vira omissão, e
omissão é pior que erro, porque tem forma de resposta.

### 1 · trajetória

- **Pergunta:** revisei o objeto que vai ser **mergeado** — ou só as duas pontas?
- **Movimento:**
  ```bash
  comm -23 <(git log --diff-filter=A --name-only --format= <base>..HEAD | sort -u) \
           <(git ls-tree -r --name-only HEAD | sort)            # 1a · blobs que entraram e SAÍRAM
  git log -p --diff-filter=A --format='COMMIT %h' <base>..HEAD | grep -nE '^(COMMIT|\+\+\+ |\+[^+])' \
    | grep -E -e 'eyJ[A-Za-z0-9_-]{10,}\.' -e 'BEGIN [A-Z ]*PRIVATE KEY' -e 'AKIA[0-9A-Z]{16}' \
              -e 'gh[pos]_[A-Za-z0-9]{20,}' -e 'sk-[A-Za-z0-9]{20,}' -e 'xox[baprs]-[A-Za-z0-9-]{10,}' \
              -e 'AIza[0-9A-Za-z_-]{35}'                                 # 1b · forma de segredo
  ```
  (Dois estágios de propósito: um regex só, com `^\+.*` na frente de sete alternâncias, estoura
  o limite de complexidade de alguns `grep` — o comando tem que rodar na máquina que houver.)
  Para cada fantasma de 1a: `git cat-file -s <commit>:<arquivo>` e triagem — refator legítimo
  (criado e movido na mesma branch) ou vazamento. Em 1b a sonda casa a **forma** do segredo,
  não a palavra: `git log -S 'isAdmin'` volta vazio num JWT porque o payload é base64. Credencial
  achada usa os três estados — `viva` / `expirada` (com o `exp` **decodificado**) / `não
  apurável`. Afirmar "viva" sem decodificar é você cometendo a Iron Law.
- **Descarte:** fantasma que `git log --follow` liga a um arquivo vivo é rename, não vazamento.
- **Escapa:** `git diff <base>...HEAD` mostra o estado **líquido** — o que entrou e saiu tem
  diff zero, e é permanente no merge sem squash.

### 2 · irmãs do removido

- **Pergunta:** tirei o padrão daqui — **o que mais fala essa língua?**
- **Movimento:** das linhas `-` do diff (arquivos **modificados**, não movidos — `--diff-filter=M`),
  extraia a **assinatura**, não a linha inteira: a expressão qualificada (`obj.campo.sub`,
  `pkg.Func`, `self.attr`) ou a chamada com o argumento característico. Uma lista, um grep —
  a lista mora num `mktemp`, nunca dentro do repositório auditado:
  ```bash
  S=$(mktemp)                                   # as assinaturas extraídas, uma por linha
  git grep -n -F -f "$S" -- ':!*.lock' ':!**/test*/**' ':!*.snap'
  ```
- **Descarte:** reporte só a assinatura que sobrevive em arquivo que a mudança **não tocou** — a
  que só reaparece em arquivo tocado é o diff se olhando no espelho. Assinatura com mais de ~3
  ocorrências vivas é vocabulário, não padrão. Campo de contrato tem leitores demais para passar
  por aqui — é a sonda 6.
- **Escapa:** remoção conserta a **ocorrência** e preserva a **classe** — que então sobrevive à
  auditoria seguinte, porque ela também só lê o diff.

### 3 · membro órfão

- **Pergunta:** o estado que acabei de criar **pode existir** — e está registrado onde os irmãos
  estão? Onde o bloco que **enumera os irmãos** não tem o novo?
- **Movimento:** três formas de membro, um motor. **Caminho** — diretório ou pacote novo (o
  prefixo mais raso em que `git cat-file -e <base>:<prefixo>` falha), ou arquivo numerado ao
  lado de outro numerado (`0318_x` ao lado de `0317_y`). **Identificador** — nome declarado em
  linhas `+` de **2+ arquivos** (o campo que viaja por DTO → entidade → schema → mapper), na
  forma de declaração da linguagem. **Literal** — entrada nova de array/enum/set/catálogo.
  Irmãos = entradas do mesmo nível, ou declarações vizinhas (±30 linhas — decorators e
  docstrings espaçam). Grepe o novo **e** os irmãos, em código **e** onde se enumera à mão:
  ```bash
  git grep -n -w -F -e <novo> -e <irmão1> -e <irmão2> -- \
    '*Dockerfile*' '*.yml' '*.yaml' '*.toml' '*Makefile*' '*.json' '*.tf' '*.xml' '*.gradle' '*.csproj' '*.env*' \
    '<extensões de código do diff>' ':!*.lock' ':!**/test*/**' ':!**/fixtures/**'
  ```
  Sítio órfão = janela de ~25 linhas com **≥2 irmãos** e o novo ausente num raio de 4 janelas.
  Cheque também a forma snake/kebab do nome (o pacote `@escopo/pai-novo`, a coluna
  `novo_campo`). Rótulos, que ordenam a triagem: `DEPENDE` (a raiz de pacote do sítio referencia
  o membro novo — o registro é **exigido**), `MEIO-LIGADO` (o arquivo tem o novo em outro
  bloco), `TOCADO`. O diferencial é por **bloco**, nunca por arquivo.
- **Descarte:** irmão presente em dezenas de arquivos é vocabulário, não catálogo; linha de
  `import`/`require`/`use` é consumo, não registro; teste, fixture e lockfile fora — fixture sem
  o campo novo não é defeito.
- **Escapa:** descritor de build não compila e não roda em teste; construtor posicional aceita
  um argumento a menos sem reclamar; o diferencial por arquivo dizia "tem o campo" — tinha, no
  caminho de update, e o bloco do create 400 linhas acima não.

### 4 · gêmea assimétrica

- **Pergunta:** a função irmã é **chamada** sob a mesma guarda?
- **Movimento:** família = declarações **novas** no diff com o mesmo radical (≥2, radical de ≥4
  letras: `buildX`/`buildY`, `parse_a`/`parse_b`), na forma de declaração da linguagem. Família
  **preexistente** não aparece no diff — se a mudança alterou a irmã de uma família antiga,
  nomeie o radical à mão. Compare as **chamadas** nos arquivos tocados, não os corpos:
  ```bash
  grep -nE '(^|[^A-Za-z0-9_])<radical>[A-Z_][A-Za-z0-9_]*\(' <arquivos tocados>
  ```
  e conte quantas estão sob guarda (`if`, `&&`, `?.`, `when`, `unless`, `match`, `ok &&`) contra o
  total. Guardadas > 0 e < total é assimetria.
- **Descarte:** radical chamado de todo lado (dezenas de chamadas) é verbo universal, não família;
  0 ou 1 chamada não tem assimetria possível.
- **Escapa:** o diff mostra os corpos lado a lado, parecidos; a divergência mora no call-site,
  que pode não estar no diff.

### 5 · escrita colateral

- **Pergunta:** o que isto **grava** é o que precisou **ler** — ou o que **não conseguiu** ler?
- **Movimento:** nas linhas `+`, duas formas. **(a)** Visão mesclada de duas fontes gravada de
  volta — spread/merge de `{...guardado, ...novo}` (ou `{**a, **b}`, `merge(a, b)`,
  `Object.assign`) que depois vira argumento de `save`/`update`/`write`. Resolver sobre a mescla
  é correto; **gravar** a mescla faz "remover chave" virar impossível — o update que removia a
  chave a vê voltar. **(b)** Valor **derivado de consulta** (o item de uma lista, a resposta de
  uma API) gravado sem guarda de sucesso — `setValue`/`assign`/`form.set`/atribuição ao modelo
  sem `if ok`, `?? guardado` ou `initialData` no bloco. Consulta vazia ou falhando grava `''`, e
  o modo **editar** apaga o que o modo **criar** gravou. Para (b) o teste é o round-trip: carregue
  um registro existente → salve sem mexer → gravado == original.
- **Descarte:** escrita com fallback explícito para o valor guardado; spread dentro de string ou
  de JSON de prosa.
- **Escapa:** o autor testa o caminho que estava construindo (criar); o componente de edição é o
  mesmo, com dados iniciais, e ninguém o roda com a consulta falhando.

### 6 · campo mudou de mão

- **Pergunta:** o produtor moveu ou apagou um campo — **quem ainda lê o antigo**, inclusive em
  outro serviço?
- **Movimento:** no diff `-U0`, `-k: v` com `+k2: v` (mesmo valor) no mesmo hunk = `k` moveu para
  `k2`; `-k: v` sem par = `k` apagado. Renomeação distante (hunks diferentes) não é detectada —
  nomeie o campo à mão. Para cada `k`:
  ```bash
  git grep -n -w -F <k> -- ':!*.lock'          # TODO o repo, SEM filtro de raridade
  ```
  Cada leitor é uma decisão a registrar: `intencional` (deve parar de ler) / `migrado` (lê os
  dois) / `colateral` (só lê o antigo). Arquivo com leitor migrado **e** não migrado =
  `MEIO-MIGRADO`, primeiro suspeito. Leitor fora deste repo (o consumidor da fila, do evento, do
  webhook) → `indisponível-para-apurar`, **nomeado**.
- **Descarte:** chave de nome genérico (`id`, `name`, `error`) tem milhares de leitores —
  vocabulário; passe pelo teto e **diga** que passou.
- **Escapa:** o contrato atravessa a fila; a suíte do produtor não exercita o consumidor. E o
  leitor que foi atualizado (linha 1040) tranquiliza quem lê o diff — o outro leitor do mesmo
  campo (linha 1104, 60 linhas abaixo) não está nele.

## O que admite uma sonda nova

Cada sonda acima nasceu de um defeito que passou por compilador, suíte e revisão de diff, e foi
apanhado depois por gente ou por produção. Uma sonda nova entra no catálogo quando tem os
**quatro**; sem um deles é preferência, não sonda:

1. **Pergunta que o diff não tem linha para mostrar.** Se a resposta está numa linha `+`/`-`, é
   leitura do diff — e leitura do diff já é o Pass A.
2. **Movimento mecânico.** Um comando que outra pessoa roda e chega ao mesmo conjunto de
   candidatos.
3. **Regra de descarte nomeada, com número.** O que separa sinal de vocabulário. Sonda sem
   descarte reporta o repositório inteiro.
4. **Nasceu de um defeito medido.** Sonda preventiva ("e se…") é hipótese, não classe.

## Quando a auditoria termina

Não termina quando os achados acabam — termina quando a **cobertura está declarada**:

- cada campo, controle e regra que a mudança toca **ou alcança** tem veredito nos três passes
  (rastro, prova, fronteira) — ou está nomeado em `O que NÃO foi coberto`;
- as sete linhas de sonda estão preenchidas, `n/a` **com motivo** incluído;
- todo predicado, regex, limiar ou janela do diff tem sua tabela de fixtures (a entrada da spec,
  os dois lados do limiar) — ou está nomeado em `O que NÃO foi coberto`;
- as cinco saídas do §4 estão escritas, mesmo vazias ("descontinuidade: nenhuma — conferido");
- o carimbo está no cabeçalho, e o delta está escrito ou declarado indisponível.

Relatório que atende os cinco está pronto mesmo com zero achados. Relatório com dez achados e
sem `O que NÃO foi coberto` não está.

## Red Flags — STOP

- "A suíte está verde, então está coberto" → NÃO. Verde afirma "não há regressão". **Não afirma que os achados estão cobertos.**
- "O projeto não tem suíte, então não tem como auditar" → NÃO. Gate ausente é `indisponível-para-apurar`, escrito — e os três passes e as seis sondas não dependem de suíte nenhuma.
- "Tem teste pro caso" → NÃO até a mutação provar. Teste que nunca falhou não é teste.
- "A matriz de mutação reprova N, a régua está certa" → NÃO. Mutação prova que **decide**, não que decide **certo** — cadê a entrada que a spec nomeia, dos dois lados do limiar?
- "O guard está lá, vi no decorator" → NÃO. Estar referenciado ≠ decidir ≠ ser alcançado.
- "Rodei na minha máquina" → NÃO decide nada sobre ordem de coluna, env ou tracking de migration. Meça no destino.
- "É só remover, não tem uso" → NÃO. Pergunte **o que deixou de funcionar para isto ficar sem uso** antes de propor remoção.
- "Achei um bug mas não sei reproduzir" → reporte como `⚠️ não verificado`, com arquivo e linha. **Nunca** como fato.
- "O código está perfeito, aprovo" → falta a descontinuidade e o degrau na série. O §4 não é opcional.
- "Vou consertar já que estou aqui" → NÃO — e o motivo não é autor ≠ revisor: rodando antes da PR, você é os dois. É que **quem conserta para de auditar** — o `O que NÃO foi coberto` encurta e a matriz de mutação nunca roda. Conserto é outra passada, depois.
- "Já rodei o /proof nesta branch" → NÃO. O relatório é de um SHA, e a branch andou. Medido: 7 achados de uma revisão humana, **nenhum** nos arquivos que o proof tinha auditado — 95 entraram depois.
- "Consertei os achados, a PR pode abrir" → NÃO. O conserto é o código mais enviesado da branch e ainda não foi auditado — 3 dos 7 achados daquela revisão moravam no commit que fechava os achados do proof.
- "Rodei o grep que a sonda sugere e não deu nada" → NÃO até conferir a **forma**. O comando é o movimento; a declaração, a chamada e a chave são as da linguagem deste arquivo — se o grep procurou a forma de outra, o `n/a` é falso.
- "Adicionei o pacote/campo e o compilador passou" → NÃO até o bloco que enumera os irmãos ter o novo. Descritor de build não compila; construtor posicional aceita um argumento a menos.
- "O produtor mudou o campo e os testes passam" → NÃO até cada leitor do campo antigo estar classificado: intencional / migrado / colateral. Leitor em outro serviço não está na suíte deste.
- "Existe PR aberta, então comento" → NÃO. Nº de PR é **escopo, não destino**. Sem `--comment`, o texto é seu.
- "O relatório é longo — resumo o retorno" → NÃO. Mesmo texto sempre, de volta para quem chamou — e a primeira linha diz a quem recebe que também não resuma.
- "Preciso perguntar antes de auditar" → NÃO há canal: devolva a pergunta como resultado e pare. Auditar o alvo errado é pior que não auditar — tem forma de relatório.
- "O token não resolveu, então audito o diff atual" → NÃO. Medido: o método fez exatamente isso na primeira rodada em fork — relatório completo, 4 achados, sobre um alvo que ninguém pediu. Token presente que não resolve é o bloco de recusa do §0 item 0, e fim.
- "Não veio `--desde`, mas eu lembro do carimbo anterior" → NÃO lembra: o fork nasce sem a conversa. Delta é `indisponível-para-apurar`, escrito.
- "O diff não mostra esse arquivo, então ele não está na PR" → NÃO. Arquivo que entrou e saiu na mesma branch é invisível em `git diff <base>...HEAD` e **permanente** no merge sem squash. O escopo é o trajeto, não as duas pontas.
- "Tirei o padrão do lugar onde ele dava erro" → NÃO até o grep da assinatura voltar vazio. Remoção sem raio conserta a **ocorrência** e preserva a **classe** — que então sobrevive à auditoria seguinte. Já aconteceu 3x com o mesmo padrão.
- "Só adicionei o tipo na lista" → NÃO. Membro novo em catálogo é **estado novo**: prove que cada estágio que trata o veterano trata este também, ou é estado que nasce inalcançável.
- "A credencial expirou, então não é achado" → NÃO. Expirar é sorte, não controle — o processo escreveu segredo em histórico permanente. E afirmar "viva" sem decodificar o `exp` é a Iron Law aplicada a você.
- "Vou dar approve na PR" → NÃO, nunca, em nenhuma forma: quem carimba estado de review é pessoa, não método. Comentário, só com `--comment` explícito.
