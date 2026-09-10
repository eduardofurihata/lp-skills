# Env Config — deixar o ambiente configurado para a mudança funcionar

> **Fonte única da configuração de ambiente.** Invocado pelo `reconcile.md` quando o gap é "está no ar e não funciona porque falta configuração".

**Responsabilidade única:** aplicar no ambiente o que a mudança exige — env vars, secrets, migrations, feature flags e seeds. Não deploya (`deploy-run.md`), não verifica comportamento (`smoke.md`).

## Iron Law

> **Valor de secret é PEDIDO, nunca inferido — e nunca escrito em arquivo.** Credencial inventada em produção é falha silenciosa que parece configuração feita; secret versionado sobrevive a `git rm` e vaza para sempre. Tudo o mais se descobre; o valor, não.

## Contrato

| Entrada | Saída |
|---|---|
| alvo + o `## DevOps` do(s) PR(s) da release + `deploy-context.md` | `aplicados[]` + `pendentes[]` (com o motivo de cada pendente) |

## 1 — De onde vem a lista

O `/pull-request` já produz o checklist, em todo PR:

```markdown
## DevOps
- [ ] Migrations: [sim — qual / não]
- [ ] Variáveis de ambiente novas: [listar / nenhuma]
- [ ] Dependências novas: [listar / nenhuma]
- [ ] Passos de deploy fora do padrão: [listar / nenhum]
```

**Este arquivo é o consumidor que faltava.** O checklist existia e ninguém executava — era contrato escrito sem quem cumprisse.

Reunir a lista de **todos** os PRs que entraram no ambiente desde o último deploy verificado (uma release publica o acumulado, não um PR). PR sem a seção, ou com ela em branco → **não presumir "nenhuma"**: conferir o diff em busca de `process.env`, `ConfigService`, arquivos de migration e seeds novos, e reportar o que achou.

## 2 — Os cinco tipos

| Tipo | Como se confere o que já existe | Como se aplica |
|---|---|---|
| **Env var** (não sensível) | listagem do ambiente conforme o `deploy.md` | seta pelo comando do `deploy.md`; valor derivável (URL, flag, nome) pode ser proposto — **confirmando** com o usuário |
| **Secret** | listar **nomes**, nunca valores | **pergunta o valor** ao usuário e aplica. Zero exceção |
| **Migration** | estado de migration do ambiente (comando do `deploy.md`) | roda as pendentes; é **etapa do release**, depois do deploy do código |
| **Feature flag** | onde o `deploy.md` registra | liga/desliga o que a mudança exige |
| **Seed** | o que a feature precisa existir no banco para aparecer | roda o seed registrado |

**Ordem:** código no ar (verde) → migrations → env/secrets → flags → seeds → smoke. Migration antes do código no ar quebra a versão que está rodando; flag antes da migration liga tela para dado que não existe.

## 3 — Secret: o único caminho

1. Identificar **o nome** da variável e **onde** ela vive (do `deploy.md`).
2. Conferir se já existe no ambiente — **pelo nome**. Existe e a mudança não pede troca → nada a fazer.
3. Falta → **perguntar**:
   > "O PR `<n>` exige `<NOME_DA_VAR>` em `<ambiente>` (vive em `<onde>`). Não tenho esse valor. Me passa o valor, ou você prefere setar direto lá?"
4. Aplicar pelo comando do `deploy.md`.
5. **Não escrever o valor** em nenhum lugar: nem no `deploy.md`, nem no card, nem no kanban, nem no relatório, nem no commit. O que se registra é *"`<NOME>` configurada em `<ambiente>`"*.

**Nunca:** gerar valor plausível para destravar · copiar valor do `.env` local para o ambiente (promove segredo de dev a prod sem ninguém decidir) · reaproveitar o valor de homolog em prod.

## 4 — Ambos os ambientes, quando é release de produção

Ao subir para produção na topologia de duas branches, a configuração é aplicada em **prod e homolog**: o resync `main`→`dev` deixa as duas branches iguais, e homolog com configuração defasada passa a mentir na próxima validação. Prod primeiro (é o que tem usuário real), homolog em seguida.

## 5 — O que fica pendente

Não deu para aplicar (o usuário não tinha o valor, o acesso não é seu, a plataforma recusou) → entra em `pendentes[]` **com o motivo**, o gap **não** fecha, e o `smoke.md` não é chamado como se estivesse tudo pronto. Reportar:
> "`<ambiente>` está sincronizado mas **não configurado**: falta `<X>` porque `<motivo>`. A feature `<Y>` não vai funcionar até isso."

## Red Flags — STOP

- "Criei a env var com um valor plausível" → NÃO. Valor de secret **nunca** é inferido. Pergunte.
- "Copiei do meu `.env` local" → NÃO. Isso promove segredo de desenvolvimento a produção sem ninguém decidir.
- "Uso em prod o mesmo valor de homolog" → NÃO. São ambientes distintos por definição; se fossem iguais não haveria dois.
- "Anoto o valor no `deploy.md` para não perguntar de novo" → NÃO. **Nunca.** Vaza em commit e sobrevive a `git rm`.
- "O PR não tem seção DevOps, então não há configuração" → NÃO. Confira o diff (`process.env`, migrations, seeds) e reporte o que achou.
- "Rodo a migration antes do deploy, para o banco estar pronto" → NÃO. Quebra a versão que está rodando agora. Código no ar primeiro.
- "Configurei só o ambiente que estou soltando" → NÃO, quando é release de prod: o resync iguala as branches e homolog fica mentindo.
- "Faltou uma variável, mas o resto está ok, chamo o smoke" → NÃO. Gap aberto é gap aberto: o smoke vai falhar e o diagnóstico vira ruído.
- "Não tenho acesso, então marco como feito e aviso" → NÃO. Vai para `pendentes[]` com o motivo, e o objetivo **não** é declarado atingido.
