---
name: sync
description: 'Use when user invokes /sync with a branch expression like "main > dev", "dev = main", "feat/x = dev = main" or "A = B > C gh = local" — a notation for synchronizing git branches. `=` means bidirectional convergence (both branches end at the SAME commit, nobody loses work); `>` means one-way flow (left goes into right, and the right NEVER flows back into the left — the source stays untouched). Chained `=` forms an equality group that converges together, not in pairs. `gh = local` declares that every mentioned branch must be identical locally and on GitHub. Resolves conflicts by reading and understanding both sides, never ours/theirs blind, and always reports them. Never uses --force, reset --hard, rebase, or branch deletion. Typical uses: "main > dev" (hotfix down into a dirty integration branch), "dev > main" (prod deploy), "gh = local" (unstick local/remote divergence).'
effort: max
argument-hint: "<expressão> — ex: main > dev | dev = main | A = B > C gh = local"
---

# /sync — sincronizar branches por notação

Você escreve a **direção**, o `/sync` executa o git. A promessa é uma só:

> **Nenhum commit é perdido. Nunca.** Se não der pra cumprir o pedido sem perder trabalho de alguém, o `/sync` **para e reporta** — não chuta.

## Iron Law

> **Precisão > velocidade.** Um sync errado em `main` vira deploy errado em prod. Conflito se resolve **lendo e entendendo os dois lados**, nunca `ours`/`theirs` cego, nunca "aceito um pra compilar". Se o resultado do merge não compila, ele **não é pushado**.

## A notação

```
expressão := grupo ( '>' grupo )*  [ 'gh' '=' 'local' ]
grupo     := branch ( '=' branch )*
```

| Sinal | Significado | Garantia |
|-------|-------------|----------|
| `A = B` | **convergência bidirecional** — as duas terminam **no mesmo commit** | ninguém perde commit; `A` e `B` ficam no mesmo SHA |
| `A > B` | **fluxo unidirecional** — o que está em `A` entra em `B` | `B` **NUNCA** volta pra `A`; `A` fica intocada |
| `gh = local` | **declarativo** — reafirma que local e GitHub ficam iguais | é o comportamento padrão (ver Passo 0); aceito e reconhecido |

### Exemplos

| Expressão | Intenção |
|-----------|----------|
| `main > dev` | hotfix desce pra `dev` suja, **sem** arrastar a sujeira da `dev` pra main |
| `dev > main` | deploy prod (`dev` entra em main, main não volta) |
| `dev = main` | deploy prod **e** main volta pra `dev` — as duas no mesmo ponto |
| `feat/x = dev` | atualiza a feature branch com a `dev` e vice-versa |
| `A = B = C` | as três num único ponto |
| `A = B > C = D` | `{A,B}` convergem → entram em `{C,D}` → `{C,D}` convergem. `A` e `B` não recebem nada de `C`/`D` |
| `gh = local` | sem outras branches: converge **a branch atual** com o `origin` |

> **A notação só aceita branch.** `dev` = a **branch** de integração (antes da `main`); `main` = produção. Nome de **ambiente** (homolog, staging, prod) não entra na expressão — o ambiente é consequência do push, não um lado do sync.

## Passo 0 — `gh ↔ local` (sempre, implícito)

O `/sync` **sempre pusha**. Logo, antes de qualquer coisa, cada branch mencionada tem que incorporar o que só existe no `origin` — senão o push é rejeitado. É por isso que `gh = local` é declarativo: já acontece por padrão.

```bash
git fetch origin --prune
```

Para **cada** branch mencionada:

| Estado | Ação |
|--------|------|
| existe local **e** em `origin` | `git checkout B && git merge origin/B` (conflito → resolver) |
| existe só em `origin` | `git checkout -b B origin/B` |
| existe só local | nada agora; o push do fim cria com `-u` |
| não existe em lugar nenhum | **PARA** — o `/sync` não inventa branch |

> Trazer `origin/B` pra `B` **não viola** a proteção do `>`: é a mesma branch, só o outro lado dela.

## Passo 1 — grupo de igualdade (`=`)

Branches ligadas por `=` convergem **juntas**, num único ponto. **Não em pares sequenciais** — em `A = B = C`, fazer `A=B` e depois `B=C` faria o `B` avançar com o conteúdo do `C` e deixaria o **`A` atrás**.

Holder = a branch **mais à esquerda** do grupo (é a que você escreveu primeiro).

```bash
# 1) tudo entra no holder
git checkout B1
git merge B2      # conflito → resolver entendendo os 2 lados
git merge B3
# 2) todas as outras alcançam o holder por fast-forward
git checkout B2 && git merge --ff-only B1
git checkout B3 && git merge --ff-only B1
```

O `--ff-only` do passo 2 **tem** que funcionar: cada `Bi` é ancestral do merge commit criado no passo 1. Se um `--ff-only` falhar, algo saiu do esperado → **PARA e reporta**, não force nada.

Fim do passo: `B1 == B2 == B3`, mesmo SHA. Grupo de uma só branch → nada a fazer aqui.

## Passo 2 — fluxo protegido (`>`)

`Gesq > Gdir`, avaliado da **esquerda pra direita** (`A > B > C`: `A` entra em `B`, depois `B` — já com `A` dentro — entra em `C`).

```bash
# ANTES: registre o SHA de cada branch de Gesq (contrato de proteção)
git checkout <holder de Gdir>
git merge <outras branches de Gdir>   # convergência interna do grupo destino
git merge <holder de Gesq>            # o que entra, vindo da esquerda
# ff das outras branches de Gdir até o holder (igual ao Passo 1)
```

**Verificação de proteção (obrigatória, no fim):** re-checar o SHA de cada branch de `Gesq`. Mudou? O `/sync` violou o próprio contrato → **reporta alto**, não esconde.

`Gdir` tem commits próprios que `Gesq` não tem (o caso da `dev` suja) → nasce um **merge commit em `Gdir`**. É o comportamento correto: nada é descartado.

## Passo 3 — conflito

Conflito **não** é obstáculo, é trabalho de engenharia:

1. **Ler os dois lados.** O hunk, o código em volta, e o `git log` de cada lado pra entender *o que cada mudança queria fazer*.
2. **Preservar as duas intenções** quando são ortogonais — o caso comum é dois features mexendo no mesmo arquivo. Resolução correta contempla os dois. Jamais apagar a lógica de um lado só pra compilar.
3. **A direção é desempate, não atalho.** Em `A > B`, quando as duas mudanças são de fato contraditórias *na mesma regra*, `A` manda. Isso vale só pra contradição real.
4. **Lockfile / arquivo gerado** → regenerar, não merge à mão.
5. **PARA** quando qualquer escolha perde trabalho de alguém (regras de negócio contraditórias onde só o usuário decide).

**Gate pós-conflito:** houve conflito resolvido em código → rodar a verificação estática rápida do projeto (`tsc --noEmit`, `npm run build`, `make check`, o que o projeto expõe) **antes do push**. Falhou → conserta ou para. **Nunca pushar merge quebrado.**

## Passo 4 — push (sempre)

Para cada branch mencionada:

```bash
git push origin <branch>        # -u se origin ainda não tem
```

Push rejeitado como non-fast-forward → o `origin` andou durante a execução. Re-fetch, re-merge essa branch, re-verificar proteção, tentar **uma** vez. Rejeitou de novo → para e reporta. **Nunca** `--force`.

## Passo 5 — relatório

```
✅ /sync main > dev

  main   abc1234 → abc1234   (intocada ✓)
  dev    def5678 → 9ab0cde   +4 commits de main

  Conflitos resolvidos: 1
    src/api/auth.ts — main endurecia a validação de token, dev tinha
      adicionado refresh. Ortogonais → mantive as duas (validação
      endurecida + refresh preservado). Typecheck ✓

  Pushado: main, dev
```

Sempre reportar: SHA antes → depois de cada branch, commits ganhos, **todo** conflito (arquivo + o que colidiu + como resolveu + por quê), e o que foi pushado. Branch de origem de `>` sai marcada como **intocada**.

## Pré-condições (CONTRATO)

- **Árvore limpa.** Mudança não commitada → **PARA** e pede commit/stash. Um checkout falhando no meio do fluxo é pior que não começar.
- Remote = `origin`.
- `/sync dev > main` **deploya prod sem gate**, por design: a skill é standalone e chamada explicitamente — **quem digita é quem autoriza**. Sem acoplamento com `/merge`.

<HARD-GATE>
1. NUNCA `--force` / `--force-with-lease`.
2. NUNCA `reset --hard` (nem `reset` que descarte commit).
3. NUNCA `rebase` — reescrever história é perder o commit original.
4. NUNCA deletar branch.
5. NUNCA resolver conflito com `--ours`/`--theirs` cego.
6. NUNCA pushar merge cujo typecheck/build falhou.
7. Branch de origem de `>` sai no MESMO SHA em que entrou — verificado, não presumido.
</HARD-GATE>

## PARE se pensar

"dou `--force` que alinha na hora" · "`reset --hard` na branch atrasada, ela tá pra trás mesmo" · "`rebase` deixa o histórico mais limpo" · "conflito chato, `--theirs` e segue" · "`A > B`, mas mergeio `B` de volta em `A` pra ficar igual" · "`A = B = C` resolvo em pares" · "árvore suja, mas o checkout provavelmente passa" · "conflito resolvido, pusho sem checar se compila" · "essa branch não existe, crio ela" · "o push foi rejeitado, forço"
