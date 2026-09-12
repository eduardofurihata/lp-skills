# Promote — fechar o estágio `promovido`: a integração vai para a branch de produção

> **Motor de estágio.** Invocado só pelo `reconcile.md`, **depois** do gate autorizado, na topologia de duas branches (`<integração>` ≠ `<produção>`). Em branch única o estágio não existe. Era o Step 2 do `/prod`; agora o `/prod` só declara o alvo e este motor faz.

**Responsabilidade única:** levar `<integração>` para `<produção>` — sincronizada, com conflitos resolvidos e re-verificados — e fechar com o resync e o assert. O push em `<produção>` é o **gatilho** do deploy; o que vem depois (`deploy-run` → `env-config` → `smoke`) são os estágios seguintes, do loop.

## Iron Law

> **Prod tem usuários reais.** Pagamento LIVE, dado sensível, gente trabalhando agora. **Nunca promova `<integração>` stale ou com divergência aberta**, e **toda resolução de conflito que muda código exige re-review + re-verificação ANTES do push em `<produção>`**. `git add -A` não existe aqui: a árvore é compartilhada com sessões paralelas.

## Contrato

| Entrada | Saída |
|---|---|
| `<integração>` e `<produção>` (do `deploy-context.md` § 1) + gate **já autorizado** pelo loop (a pergunta é do `reconcile`, ao chegar neste estágio) + `verificado@homolog` fechado (o estágio anterior) | `origin/<produção>` == `origin/<integração>`, com o push que dispara o deploy; `{commits, cards[]}` para o loop |

## Sinal de fechado (o que o `reconcile` confere)

```bash
git fetch origin
git rev-list --count origin/<produção>..origin/<integração>          # 0
[ "$(git rev-parse origin/<integração>)" = "$(git rev-parse origin/<produção>)" ] && echo iguais
```

**Ambíguo:**

| Sinal | O que fazer |
|---|---|
| `origin/<produção>` tem commit que `<integração>` não tem (hotfix direto em prod) | divergência: merge nos **dois** sentidos, resolvendo os dois lados, e **re-review** do que mudou — ou `/sync <produção> > <integração>` antes (é a ferramenta de branch; ela não deploya) |
| `<integração>` local atrás de `origin/<integração>` | sincronizar antes (passo 0) — `<integração>` stale promove o que ninguém revisou |
| conflito em qualquer merge | resolver entendendo **os dois lados** — nunca `ff-only`-bail, nunca `ours`/`theirs` às cegas; intenção ambígua → **pergunte**; resolução que muda código → **re-review + re-verificação antes do push** |
| assert `✗` depois do resync | investigue antes de concluir. O release **não fecha** com branches divergentes |

## Fluxo — `sincronizar+resolver → promove → resync → assert`, nessa ordem

```bash
# === 0) FECHAR a <integração>: tudo atualizado + RESOLVER conflitos, ANTES de promover ===
git checkout <integração>
git fetch origin
git merge origin/<integração>          # traz TODOS os PRs mergeados; CONFLITO → resolver (os 2 lados)
# solto na árvore que é SEU (kanban, docs)? paths EXPLÍCITOS, nunca `git add -A`
git add <paths que VOCÊ editou>
git commit -m "chore(kanban): <o que fechou>"
git push origin <integração>           # no-op se não havia nada

# 1) <integração> → <produção> (promove)
git checkout <produção> && git pull --ff-only
git merge <integração>                 # CONFLITO → resolver → re-review + re-verificar ANTES do passo 2

# 2) <produção> → GitHub   ←  DISPARA o deploy de PROD
git push origin <produção>

# 3) resync <produção> → <integração>
git checkout <integração> && git merge <produção>
git push origin <integração>

# 4) ASSERT
git fetch origin
[ "$(git rev-parse origin/<integração>)" = "$(git rev-parse origin/<produção>)" ] \
  && echo "✓ origin/<integração> == origin/<produção>" || echo "✗ DIVERGIRAM — investigar"
```

`<integração>` e `<produção>` são os nomes **detectados** — `dev`/`main` é só o nosso padrão; o projeto pode chamar `develop`/`master`.

## Devolver ao loop

```
{ commits: <N>, cards: [<KEY>-<N>, …], sha: <HEAD de origin/<produção>> }
```

O loop re-diagnostica: `promovido` fechado abre `publicado@prod`. O `env-config` que vem depois aplica em **prod e homolog** — o resync igualou as branches, e homolog com configuração defasada mente na próxima validação.

## Red Flags — STOP

- "A `<integração>` local está atrás, mas o que importa é o que eu tenho" → NÃO. Sincroniza e resolve **antes**.
- "Resolvi o conflito e pushei pra `<produção>`" → NÃO. Conflito resolvido = código novo → re-review + re-verificação **antes** do push.
- "Uso `ours`/`theirs` pra destravar o merge" → NÃO. Entende os dois lados; ambíguo → pergunta.
- "Commito com `git add -A`, é mais rápido" → NÃO. A árvore é compartilhada com sessões paralelas; paths explícitos.
- "O assert deu `✗` mas o deploy passou, fecho assim" → NÃO. Release não fecha com `origin/<integração> != origin/<produção>`.
- "Pergunto a autorização aqui de novo, por segurança" → NÃO. O gate é do `reconcile`, ao chegar neste estágio — uma vez por release. Se você está aqui, foi autorizado agora.
- "Promovi e o release acabou" → NÃO. Promoção é um estágio; faltam publicado, configurado e verificado em prod.
- "Uso `/sync <integração> > <produção>` que é mais direto" → é uma ferramenta de **branch**, sem deploy observado, sem configuração e sem smoke. Para **entregar** produção, o caminho é o loop.
- "Escrevo `dev` e `main` nos comandos" → NÃO. Os nomes vêm do `deploy-context.md` § 1.
