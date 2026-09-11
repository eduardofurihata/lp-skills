---
name: principles
description: 'Use when user invokes /principles — owner of the quality doctrine: SOLID, DRY, KISS, YAGNI, LoD, Motores and refactoring, plus the clarity bar (simple, efficient, premium, easy for humans and AI). With no argument (or invoked by /solve, and through it /method) it loads the doctrine for the ongoing work; with a target (projeto, pasta/, arquivo, commit <sha>, diff, doc) it scores it 0-100 per pillar and fixes it until every pillar is ≥95 — never changes behavior, never commits or pushes; `audit` = report only. Triggers on "força esse commit a ficar simples", "deixa essa pasta clean", "aplica os princípios nesse projeto", "avalia de 0 a 100", "simplifica isso". Not for building features (/solve, /method, /fast) nor for committing (/save).'
effort: max
argument-hint: "[projeto | pasta/ | arquivo | commit <sha> | diff | doc <arquivo>] [audit]"
---

# /principles — simples, eficiente e premium, para gente e para IA

**Esta skill é a doutrina de qualidade — os princípios de engenharia e a régua de clareza — e é quem força um alvo a cumpri-la.** Cada palavra do padrão é uma prova de sim/não; a nota de 0 a 100 é calculada dos achados, não sentida; cada passada reavalia o alvo do zero, sem herdar a anterior.

Compõe com o `/solve`, não compete: simples nunca é "entregar menos"; premium nunca é "adicionar o que ninguém pediu". O `/solve` decide **o quanto** existe; o `/principles` garante que tudo o que existe esteja na forma mais clara e curta — e inteiro.

## Dois modos

| Invocação | Modo | O que acontece |
|---|---|---|
| sem argumento — pelo `/solve` (e, por ele, toda skill que o invoca), pelo usuário ou por outra skill | **régua** | Leia `references/principios.md` agora (sem a leitura, a invocação não aconteceu). As provas abaixo e os princípios valem para tudo que você tocar daqui em diante. Sem passada, sem nota, sem output final. |
| com alvo | **alvo** | Fluxo abaixo: inventário → achados → baldes → nota → corrige → repete até passar (passo 8). |

## Princípios de engenharia — fonte única

SOLID (os cinco) · DRY · KISS · YAGNI · Law of Demeter · Motores · refatoração contínua (perímetro, regra do saldo, limiares numéricos): **`references/principios.md`**. Não se redefine aqui; aplica-se como está — é o pilar **Princípios**, e a prova é o arquivo inteiro. Tem tela? `method/references/design.md` (tokens, estados, a11y) vale junto.

## Simples · Eficiente · Premium — cada palavra é uma prova

Simples e Eficiente são a lente de SRP, DRY e KISS (`references/principios.md`) para qualquer alvo — commit, pasta, doc; Premium e os dois leitores são o que a doutrina não cobria.

| Pilar | Prova (sim/não) | Falha típica |
|---|---|---|
| **Simples** — 1 coisa | Cada unidade (arquivo, função, seção, commit) faz UMA coisa, e o nome diz qual | `utils.ts` com 12 funções sem parentesco · commit "ajustes gerais" |
| **Simples** — 1ª linha | A primeira linha (H1, cabeçalho, docstring, subject) diz o que é e para que serve | `# Notas` · `feat: wip` · arquivo que abre com 20 imports e nenhum cabeçalho |
| **Simples** — nome diz | Nome de arquivo, pasta, função e variável se entende sem abrir: sem abreviação, sem `v2/new/old/final`, sem sigla que o projeto não usa em todo lugar | `handleData` · `utils2.ts` · `final_FINAL.md` · `qtd` |
| **Simples** — zero sobra | Nada que ninguém usa nem lê: código, import ou arquivo morto, seção vazia, comentário que repete o código, TODO vencido | `// removed` · `_unused` · `## Referências` vazio |
| **Eficiente** — menor forma | Não existe versão mais curta com o mesmo significado e comportamento: 5 linhas > 50, 1 tabela > 3 parágrafos, sem preâmbulo | função de 60 linhas com 3 caminhos iguais · "antes de começar, é importante lembrar que…" |
| **Eficiente** — 1 fonte | Cada regra, valor ou decisão mora em UM lugar; o resto aponta | o mesmo limite em 2 arquivos · README repetindo o CONTRIBUTING |
| **Eficiente** — preciso | Todo número, nome, caminho e comando é real e exato | "roda o script de build" · `path/to/file` · link morto · "aproximadamente" |
| **Premium** — nada pela metade | Tudo que está presente está terminado: sem `TODO/WIP/???/(preencher)`, seção sem corpo, função que só lança "não implementado" | `## Como testar` vazio · `throw new Error("not implemented")` |
| **Premium** — fecha o ciclo | O leitor faz o que veio fazer sem sair para perguntar: doc diz como usar, pasta tem porta de entrada (README/índice), commit tem o porquê, skill tem output e "Próximo" | README que diz o que é, mas não como rodar |
| **Premium** — moderno | A forma atual da stack e do projeto: sem API descontinuada, sem legado ao lado do novo | `require` ao lado de `import` · `componentWillMount` · `moment` num projeto que já usa `date-fns` |
| **Premium** — acabamento | O formatter do projeto passa; sem erro de escrita no texto visível; sem lixo | `console.log('aqui')` · arquivo de debug esquecido |

Premium se mede contra o que o alvo **promete** (nome + 1ª linha), nunca contra o que daria para acrescentar.

## Dois leitores

| Pilar | Prova (sim/não) | Falha típica |
|---|---|---|
| **Humano** — teste do leigo | Alguém de fora, de qualquer idade, lê só o nome e a 1ª linha e responde "o que é e para que serve" | `core/` · `misc.md` · `chore: stuff` |
| **Humano** — uma leitura basta | Ordem = ordem de uso; todo termo é definido antes de ser usado; ninguém precisa voltar para entender | glossário no fim · passo 3 depende do passo 7 |
| **IA** — acha em 1 grep | Nome do arquivo e da pasta = nome do que contém (capacidade, domínio), não camada genérica | `Button` dentro de `comp1.tsx` · cálculo de frete em `helpers.ts` |
| **IA** — decide pela 1ª linha | Lendo só o cabeçalho, o agente sabe se é ali que mexe: 1 coisa por arquivo, propósito declarado | script sem docstring · `index.ts` que só reexporta 40 coisas |
| **IA** — zero magia | Nada acontece fora do que está escrito no alvo ou apontado por caminho: sem registro automático, config que age à distância, convenção que só mora na cabeça de alguém | rota registrada em outro arquivo sem aparecer no da rota · `.env` que ninguém documentou |
| **IA** — comando roda sem gente | Todo comando citado roda por copy-paste: sem pergunta interativa, sem variável não declarada, e diz se deu certo | `make setup` que faz perguntas · "roda os testes" (qual comando?) |
| **IA** — igual aos irmãos | Mesma forma, mesmo nome, mesmo lugar que os vizinhos — a IA aprende com um e acerta os outros | `a.service.ts` ao lado de `bService.ts` · `## Como testar` só em um doc |

## Onde a prova muda de forma

| Prova | projeto · pasta | arquivo | commit · diff | doc · skill · prompt |
|---|---|---|---|---|
| 1ª linha | H1 + 1ª frase do README (ou índice da pasta); nome da pasta | cabeçalho ou docstring | commit: subject como o `/save` escreve (Conventional Commits), corpo com o porquê se não for óbvio · diff: — | H1 + tese |
| 1 coisa | 1 domínio por pasta; irmãos com parentesco | 1 responsabilidade | 1 intenção por commit ou diff | 1 assunto por doc; 1 ideia por seção |
| 1 fonte | entre pastas e entre docs | dentro do arquivo | o diff não copia o que já existe no repo (`grep` antes) | não repete outro doc — aponta |
| fecha o ciclo | README com como rodar e testar | entrada → saída explícitas | mensagem responde "por quê"; diff não deixa nada pela metade | como usar + próximo passo |
| comando roda | scripts de `package.json` e `Makefile` | — | — | comandos citados |
| igual aos irmãos | convenção de nome e layout entre pastas | vs. arquivos da mesma pasta | vs. `git log --oneline -20` | vs. docs irmãos |

## Fluxo (modo alvo)

1. **Alvo e jeito** — pelo argumento. `audit` (ou "só avalia") em qualquer posição = só relatório, nada é alterado; sem `audit` = **força**: avalia e corrige.

   | Argumento | Alvo | O que se lê |
   |---|---|---|
   | `commit <sha>` · `HEAD` · `HEAD~n` | mensagem **e** diff do commit | `git show <sha>` |
   | `diff` · `alteração` | tudo não commitado (staged, unstaged, untracked) | `git diff HEAD` + os untracked de `git status --porcelain`, lidos do disco |
   | `projeto` · `repo` · `.` | todos os arquivos rastreados | `git ls-files` — leitura completa, sem amostragem |
   | caminho de pasta | a pasta e tudo dentro | cada arquivo dela |
   | caminho de arquivo (`doc`, `skill` ou `prompt` na frente escolhe a coluna da tabela acima) | o arquivo | o arquivo + `grep` de quem o usa |

2. **Snapshot** — `git status` limpo é pré-condição para tudo que escreve (projeto, pasta, arquivo, commit): é o que permite desfazer. Sujo → pare e peça para commitar antes (`/save`). Dispensam: `diff` (o alvo é o que está sujo) e `audit` (nada é escrito). Em `commit <sha>`, as correções entram no working tree como mudança nova e a **mensagem só recebe uma proposta** — reescrever histórico não é desta skill.

3. **Passada** — inventário **do zero**: leia o alvo inteiro, agora, do disco — e `references/principios.md`, a régua do pilar Princípios. Monte a tabela de novo — não copie linhas da passada anterior nem use a conversa. Cada "não" vira uma linha da tabela do Output final; o mesmo achado em N lugares é 1 linha com os N lugares, e o peso conta por lugar. **Um achado, um pilar** — o mais específico: se uma prova de clareza o nomeia, é dela; Princípios fica com o que só `principios.md` — e, com tela, `design.md` — cobre (OCP, LSP, ISP, DIP, YAGNI, LoD, Motores, perímetro, limiares; tokens, estados, a11y). Todo caminho (`ls`), comando (existe) e link (responde) citado pelo alvo é conferido — é a prova "preciso" em qualquer projeto.

4. **Baldes** — a triagem A/B/C do `/method` (`method/references/follow-ups.md`), com o alvo no lugar do escopo da feature. Todo achado é classificado; nenhum fica só na cabeça.

   | Balde | O que é | Faz |
   |---|---|---|
   | **A** | dentro do alvo e corrigível sem mudar comportamento | **corrige agora** |
   | **B** | fora do alvo mas exposto por ele (o helper que importa, o doc que linka) — ou dentro, mas exige mudar comportamento ou decisão de produto | **lista com caminho, não toca**; o próximo é `/method` ou `/fast` |
   | **C** | pré-existente sem relação com o alvo, ou gosto pessoal sem regra no projeto | **descarta com 1 linha de motivo** |

5. **Nota** — por pilar, os seis: Simples, Eficiente, Premium, Humano, IA, Princípios. `100 − Σ pesos dos achados de balde A`, piso 0. Nota final = a **menor** das seis; nenhum pilar compensa outro.

   | Peso | Quando |
   |---|---|
   | **−10 grave** | um leitor falha: não dá para saber o que é, achar, rodar ou confiar — 1ª linha ausente ou enganosa, comando quebrado, magia, pela metade, 2 fontes da mesma verdade, regra sem dono |
   | **−5 média** | entende-se, mas com esforço que não precisava: forma mais longa, nome que não diz, sobra, legado ao lado do novo, limiar numérico estourado |
   | **−2 leve** | acabamento: formatação, escrita, pequena diferença dos irmãos |

6. **Checks — linha de base** — os do próprio projeto, se existem (`package.json` scripts `lint`, `typecheck`/`tsc`, `test`, `format`; `Makefile` alvos `lint`, `test`, `check`), antes de tocar em qualquer coisa. Sem checks → diga no output.

7. **Corrige** (força) — todo balde A. Só dentro do alvo. Comportamento idêntico: refatorar não é feature. Apagar um arquivo inteiro ou renomear um nome público/exportado → **pergunte antes**. Correção que precisaria sair do alvo → pergunte, ou vira B. Nunca `git commit`, nunca `git push`, nunca `--amend`. No fim, os checks de novo: verde não vira vermelho — virou, é seu, corrija antes de seguir.

8. **Repete** os passos 3 → 5 e 7 até uma passada do zero dar **todo pilar ≥ 95**. `audit` para depois do passo 5. Três passadas seguidas sem a nota subir → pare e mostre o que trava (quase sempre é uma decisão do usuário).

## Output final

```
/principles <alvo> · força | audit
Nota: <antes> → <depois>   (Simples · Eficiente · Premium · Humano · IA · Princípios: nn/nn/nn/nn/nn/nn → nn/nn/nn/nn/nn/nn)

| pilar | achado | arquivo:linha | peso | balde | status |
|---|---|---|---|---|---|
| … | … | … | −5 | A | corrigido   (audit: aberto) |
| … | … | … | −10 | B | aberto — fora do alvo |
| … | … | … | −2 | C | descartado: <motivo> |

Mensagem proposta: <subject>   (só em commit <sha>)
Passadas: N · Checks: lint ✓ · typecheck ✓ · test ✓   (ou: nenhum no projeto)
Próximo: /save
```

Em `audit`: `Nota: <antes>` só, sem "depois"; `Passadas: 1`; `Checks:` só a conferência do passo 3 — lint/test não rodam, não há antes/depois; `Próximo: /principles <alvo>` para aplicar.

## PARE se pensar

"é só um nome, todo mundo entende" · "simplifiquei, ficou bom o suficiente" · "premium é adicionar mais" · "a nota é 94, arredonda" · "reavalio de memória, já conheço o alvo" · "li 5 arquivos, o resto deve estar igual" · "não é do alvo, mas já que estou aqui" · "tiro esse `if`, ninguém deve usar" · "a IA entende sem cabeçalho" · "é doc, princípio é coisa de código" · "o lint já estava vermelho, não é meu" · "renomeio o export, depois vejo quem usa" · "commito pra não perder" · "amend na mensagem, é rapidinho" · "marco como C pra fechar logo" · "já conheço os princípios, não preciso ler o arquivo"
