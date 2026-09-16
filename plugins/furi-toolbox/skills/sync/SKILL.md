---
name: sync
description: 'Use when user invokes /sync with a branch expression like "main > dev", "dev = main" or "A = B > C gh = local" — a notation for synchronizing git branches: `=` converges to the same commit (nobody loses work), `>` flows one way (right never flows back), `gh = local` means local and GitHub identical. Conflicts resolved by understanding both sides; never --force, reset --hard, rebase or branch deletion.'
effort: max
handoff: prod
argument-hint: "<expressão> — ex: main > dev | dev = main | A = B > C gh = local"
disable-model-invocation: true
---

# /sync — sincronizar branches por notação

Você escreve a **direção**, o `/sync` executa o git. **Nenhum commit é perdido, nunca** — se não der sem perder trabalho de alguém, o `/sync` **para e reporta**. Merge que não compila **não é pushado**.

## A notação — `grupo ( '>' grupo )* [ gh = local ]`, grupo = `branch ( '=' branch )*`

| Sinal | Significado |
|---|---|
| `A = B` | **convergência**: as duas terminam no **mesmo SHA** |
| `A > B` | **fluxo**: `A` entra em `B`; `B` **nunca** volta para `A` — `A` sai intocada |
| `gh = local` | declarativo — já é o comportamento padrão |

`main > dev` (hotfix desce sem arrastar a sujeira da `dev`) · `dev > main` (deploy prod) · `A = B > C = D` (`{A,B}` convergem → entram em `{C,D}` → convergem). Só **branch** entra na expressão.

## Passos

0. **`gh ↔ local`, sempre.** `git fetch origin --prune`; cada branch mencionada incorpora o `origin` (`merge origin/B`; só remota → `checkout -b`; só local → o push cria; **não existe → PARA**).
1. **Grupo `=`** converge **junto**, nunca em pares (em pares, `A` fica atrás). Holder = a mais à esquerda: tudo entra nela por merge; as outras a alcançam com `merge --ff-only` — falhou → **PARA**.
2. **Fluxo `>`**, da esquerda para a direita: registre o SHA da esquerda, convirja o grupo destino, merge do holder esquerdo no holder direito, ff das outras. **No fim, o SHA da esquerda mudou → violação, reporta alto.** Destino com commits próprios ganha um merge commit — correto.
3. **Conflito é engenharia.** Leia os dois lados e **preserve as duas intenções**; a direção desempata só contradição real; lockfile se regenera; escolha que perde trabalho de alguém → **PARA**. Typecheck/build **antes do push**.
4. **Push de toda branch mencionada.** Rejeitado non-fast-forward → refetch, re-merge, **uma** tentativa; de novo → para.
5. **Relatório:** SHA antes → depois por branch, commits ganhos, **todo** conflito (arquivo, o que colidiu, como resolveu), o que foi pushado; origem de `>` marcada **intocada**.

## Contrato

Árvore limpa (senão PARA); remote `origin`. `/sync dev > main` dispara o deploy de prod **sem gate** — quem digita autoriza. Isto **move branch, não entrega produção**: run, configs e smoke são o `/prod`.

<HARD-GATE>
NUNCA `--force` · NUNCA `reset --hard` · NUNCA `rebase` · NUNCA deletar branch · NUNCA `--ours`/`--theirs` cego · NUNCA pushar merge que não compila · origem de `>` sai no MESMO SHA, verificado.
</HARD-GATE>

## PARE se pensar
"dou `--force` que alinha" · "`rebase` deixa limpo" · "conflito chato, `--theirs`" · "`A > B`, mas mergeio `B` de volta" · "`A = B = C` em pares" · "pusho sem checar se compila"
