# Fluxo do modo alvo — o motor que as réguas rodam

> **Este arquivo é a fonte única do fluxo de avaliação.** Toda skill que dá nota a um alvo e o corrige até passar roda ESTE fluxo: `/principles` (clareza e princípios de engenharia) e `/ui` (design). Cada uma traz só o que é dela: a tabela de alvos, os seis pilares, a tabela de pesos e o que cada passo exige naquele domínio. **Sem a leitura deste arquivo, o modo alvo não roda.**

O motor não conhece domínio: ele não sabe o que é um token nem o que é um motor de frete. Ele sabe transformar **achados** em **nota**, e nota em **correção** — sempre do zero, sempre com o alvo lido do disco.

1. **Alvo e jeito** — pelo argumento. `audit` (ou "só avalia") em qualquer posição = só relatório, nada é alterado; sem `audit` = **força**: avalia e corrige. Que argumento vira que alvo, e o que se lê de cada um: **tabela de alvos da skill**.

2. **Snapshot** — `git status` limpo é pré-condição para tudo que escreve: é o que permite desfazer. Sujo → pare e peça para commitar antes. Dispensam: `audit` (nada é escrito) e o alvo que **já é** a alteração pendente — `diff`, ou o arquivo/pasta alvo com a sujeira só dentro dele. Nunca dispensam: `projeto`, e sujeira fora do alvo — é ela que impede desfazer. Em `commit <sha>`, as correções entram no working tree como mudança nova e a **mensagem só recebe uma proposta** — reescrever histórico não é destas skills.

3. **Passada** — inventário **do zero**: leia o alvo inteiro, agora, do disco — e releia a doutrina da skill. Monte a tabela de novo — não copie linhas da passada anterior nem use a conversa. Cada "não" vira uma linha da tabela do Output final; o mesmo achado em N lugares é 1 linha com os N lugares, e o peso conta por lugar. **Um achado, um pilar** — o mais específico. O que esta régua exige a mais antes de julgar (o que ler primeiro, o que precisa ser visto rodando): **passo 3 da skill**.

4. **Baldes** — triagem A/B/C do alvo. Todo achado é classificado; nenhum fica só na cabeça.

   | Balde | O que é | Faz |
   |---|---|---|
   | **A** | dentro do alvo e corrigível sem mudar comportamento | **corrige agora** |
   | **B** | fora do alvo mas exposto por ele — ou dentro, mas exige mudar comportamento, ou uma decisão de produto que não é desta passada | **lista com caminho, não toca**; fica para um ciclo próprio de trabalho |
   | **C** | pré-existente sem relação com o alvo, ou gosto pessoal sem regra no projeto | **descarta com 1 linha de motivo** |

5. **Nota** — por pilar, os **seis da skill**. Cada um: `100 − Σ pesos dos achados de balde A dele`, piso 0. Nota final = a **menor** das seis; nenhum pilar compensa outro. Quanto vale cada gravidade: **tabela de pesos da skill** — sempre positivos, porque a fórmula já subtrai.

6. **Checks — linha de base** — os do próprio projeto, se existem (quais: **lista da skill**), antes de corrigir (passo 7). Sem checks → diga no output.

7. **Corrige** (força) — todo balde A. Só dentro do alvo. **Comportamento idêntico:** a correção muda a forma, nunca o que o alvo faz. Correção que precisaria sair do alvo → pergunte, ou vira B. Nunca `git commit`, nunca `git push`, nunca `--amend`. No fim, os checks de novo: verde não vira vermelho — virou, é seu, corrija antes de seguir. O que conta como comportamento idêntico neste domínio, e o que exige **perguntar antes**: **passo 7 da skill**.

8. **Repete** os passos 3 → 5 e 7 até uma passada do zero dar **todo pilar ≥ 95**. Em `audit`, o fluxo termina no passo 5. Três passadas seguidas sem a nota subir → pare e mostre o que trava (quase sempre é uma decisão que não é sua).

## Output final

```
/<skill> <alvo> · força | audit
Nota: <antes> → <depois>   (<os seis pilares da skill>: nn/nn/nn/nn/nn/nn → nn/nn/nn/nn/nn/nn)

| pilar | achado | arquivo:linha | peso | balde | status |
|---|---|---|---|---|---|
| … | … | … | 5 | A | corrigido   (audit: aberto) |
| … | … | … | 10 | B | aberto — fora do alvo |
| … | … | … | 2 | C | descartado: <motivo> |

Passadas: N · Checks: <os do projeto> ✓   (ou: nenhum no projeto)
Próximo: revisar o diff e commitar
```

A skill acrescenta as linhas que só ela tem — nunca remove as de cima.

Em `audit`: `Nota: <antes>` só, sem "depois"; `Passadas: 1`; `Checks:` só a conferência do passo 3 — os do projeto não rodam, não há antes/depois; `Próximo: /<skill> <alvo>` para aplicar.

## Racionalizações proibidas do motor — PARE se pensar

As da doutrina estão na skill; estas são do fluxo.

| Frase | Realidade |
|---|---|
| "A nota é 94, arredonda" | A nota é calculada dos achados, não sentida. Abaixo de 95 → outra passada. BLOQUEADO. |
| "Reavalio de memória, já conheço o alvo" | Cada passada lê o alvo do disco, do zero. Memória herda o erro da passada anterior. BLOQUEADO. |
| "Li 5 arquivos, o resto deve estar igual" | Leitura completa, sem amostragem. O que não foi lido não foi avaliado. BLOQUEADO. |
| "Não é do alvo, mas já que estou aqui" | Fora do alvo é balde B (listar) ou C (descartar com motivo) — nunca correção silenciosa. BLOQUEADO. |
| "Marco como C pra fechar logo" | C é pré-existente sem relação com o alvo, com 1 linha de motivo — não é gaveta de achado inconveniente. BLOQUEADO. |
| "O check já estava vermelho, não é meu" | Linha de base no passo 6 justamente para isso: diga o que já estava vermelho no output, e não deixe verde virar vermelho. BLOQUEADO. |
| "Commito pra não perder" · "amend na mensagem, é rapidinho" | Estas skills nunca commitam, nunca dão push, nunca fazem `--amend`. Commitar não é delas. BLOQUEADO. |
| "Já conheço o fluxo, sigo de memória" | A leitura deste arquivo é o que faz o modo alvo rodar. Sem ela não há baldes, não há nota e não há critério de parada — sobra opinião. BLOQUEADO. |
| "Pulo o passo 5 e corrijo o que vi" | Sem nota não há critério de parada: o passo 8 precisa de número para comparar. BLOQUEADO. |
