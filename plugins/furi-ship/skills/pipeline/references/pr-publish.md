# PR Publish — fechar os estágios `push` e `pr`: publicar a branch e abrir (ou atualizar) o PR

> **Motor de estágio.** Invocado só pelo `reconcile.md` quando `push` ou `pr` está aberto. Era o corpo do `/pull-request`; agora o `/pull-request` só declara o alvo e este motor faz. Os dois estágios moram aqui porque o segundo é uma consequência do primeiro **quando o setup pede**: `Abre PR: não` ⇒ o estágio `pr` não existe e este motor fecha em `push`.

**Responsabilidade única:** pôr a branch em `origin` e, se o repositório usa PR, abrir **ou atualizar** o PR na integração com o corpo 3-em-1 — depois espelhar em cada card do Jira e promover o kanban. Não revisa (`pr-cycle.md`), não mergeia, não commita (`work-cycle.md` já fechou).

## Iron Law

> **Idempotente, e os cards vêm dos commits.** Roda de novo na mesma branch a cada card do lote: PR aberto → **atualiza**; nenhum → cria. Nunca um segundo `create` (o GitHub recusa dois PRs da mesma head, e um PR novo perderia o review do aberto). O nome da branch é só o do 1º card; cada card entrou pelo próprio commit, com a própria key — é essa lista que faz o título, o `## Cards` e o espelho no Jira. **Os nomes dos cards ficam claros em tudo**: título, corpo e comentário citam `<KEY>-<N> — <título>`.

## Contrato

| Entrada | Saída |
|---|---|
| branch de trabalho (com o commit do estágio anterior) + `<integração>` (do `deploy-context.md` § 1) + `setup` (§ PR `Abre PR`, `Template`; § Commit posição da key) + `jira` (estrutura ou `≠ Jira`) | branch em `origin`; PR criado/atualizado (ou "publicado sem PR"); cards comentados/transicionados; kanban em `11-ship`; `{pr, url, keys[]}` para o loop |

## Sinal de fechado (o que o `reconcile` confere)

```bash
git fetch origin
git rev-parse HEAD; git rev-parse origin/<branch>                       # iguais ⇒ push fechado
gh pr list --head <branch> --base <integração> --state open --json number,url,title   # 1 PR, com todas as keys dos commits ⇒ pr fechado (só com Abre PR: sim)
```

**Ambíguo:**

| Sinal | O que fazer |
|---|---|
| a integração andou desde o commit (`git rev-list --left-right --count origin/<integração>...HEAD` → esquerda > 0) | **não é este motor**: é o estágio `branch` reaberto — o loop re-diagnostica, `branch.md` § 5 traz `origin/<integração>` (merge, nunca rebase) e o `work-cycle` **re-testa**. Publicar só o que já passou; não resolver conflito não-testado |
| `origin/<branch>` à frente do local (outra máquina, sugestão aceita na UI) | merge de `origin/<branch>`, **nunca** `--force`; re-testa se mudou código |
| branch atual **é** a própria integração e `Abre PR: sim` | o alvo `pull-request` não faz sentido: **PARE e diga** — está na integração; o que se quer é `/homolog` ou `/prod`. Com `Abre PR: não` (trabalho `direto na integração`) estar nela é o esperado: o push é nela |
| PR aberto sem o card novo do lote no `## Cards` | estágio `pr` **aberto**: `gh pr edit`, nunca 2º `create` |
| PR **fechado** (não mergeado) e a branch viva | **perguntar** antes de reabrir ou criar outro — alguém fechou por um motivo |
| working tree suja | é o estágio `commit` reaberto — não publica; o loop volta ao `work-cycle` |

## Fluxo

### 1. Push

```bash
git push -u origin <branch>
```

Sempre — inclusive com `Abre PR: não`: publicar é isto; o PR é o que vem depois, quando o repositório usa.

### 2. Levantar o contexto da entrega (não inventar)

- **Cards da branch** — dos **commits**, nunca do nome da branch:
  ```bash
  git log origin/<integração>..HEAD --no-merges --format='%s%n%(trailers:key=Jira,valueonly)' | grep -oE '[A-Z][A-Z0-9]+-[0-9]+' | sort -u
  ```
  Só o **subject** e o trailer `Jira:` — o corpo livre cita cards *relacionados*, não os do commit; `--no-merges` porque um merge da integração traz keys alheias. Nenhuma key em commit nenhum → a do nome da branch; nenhuma em lugar algum → **publicação sem card** (diga isso, não invente uma — e sem Jira é o normal). Para cada key, `mcp__atlassian__jira_get_issue` → o título vai no `## Cards`.
- `git diff <integração>...<branch>` — o que realmente mudou.
- Docs do feature: `docs/01-problem` … `docs/05-test-cases` + `kanban/09-run-test` — de **cada** card do lote.
- Extrair daí: **o problema em linguagem leiga**, a **solução técnica**, os **TCs**, e o **impacto de deploy** (migrations? env novas? deps?).

### 3. Abrir ou atualizar o PR — corpo 3-em-1

**§ PR `Abre PR: não`** → **pule este passo inteiro** e siga para o 4: o push do passo 1 já publicou. Não crie PR "só desta vez" sem pedido explícito do usuário — mudar a convenção é `/setup pr`.

**Antes de criar, sempre:**
```bash
gh pr list --head <branch> --base <integração> --state open --json number,url -q '.[0]'
```
| Resultado | Ação |
|---|---|
| vazio | `gh pr create` (abaixo) |
| PR aberto | `gh pr edit <n> --title "<título>" --body "<corpo>"` — o **mesmo** título e corpo abaixo, regenerados: `## Cards` e as keys do título vêm dos commits; `O que foi feito`, `Solução`, `Como testar` e `DevOps` absorvem o que o card novo mudou. **Nunca** um segundo `create` |

`--base` é `<integração>` (detectada). O título leva **todas** as keys da branch (passo 2), em ordem crescente, na posição que o § Commit do setup mandar: no escopo (`<tipo>(<KEY>-<N>, <KEY>-<M>): …`, o default abaixo), no início (`<KEY>-<N> <tipo>: …`), no fim (`<tipo>(<escopo>): … (<KEY>-<N>, <KEY>-<M>)`) ou ausente (`<tipo>(<escopo>): …` — as keys ficam no trailer `Jira:` do corpo, que é sempre escrito). Um card só → uma key. Se o § PR `Template:` apontar um arquivo (ex.: `.github/pull_request_template.md`), o corpo segue **as seções dele** — preenchidas, não deixadas em branco — e as 3 camadas daqui entram dentro delas (o `## O que foi feito` leigo e o `## Cards` são obrigatórios em qualquer template).

```bash
gh pr create --base <integração> --title "<tipo>(<KEY>-<N>, <KEY>-<M>): <título conciso>" --body "$(cat <<'EOF'
## O que foi feito
[Linguagem simples, ZERO jargão — qualquer pessoa, de qualquer idade ou nível de
conhecimento, entende o problema que existia e o que mudou. Concreto, com antes/depois.
Ex.: "Quando o paciente tentava agendar sem ter crédito, a tela travava. Agora aparece
um aviso claro e o paciente é levado direto pra tela de comprar crédito."]

## Cards
- <KEY>-<N> — <título do card no Jira>
- <KEY>-<M> — <título do card no Jira>

---

## Summary (técnico)
- [o que foi feito + abordagem]
- [decisões relevantes / trade-offs]

## Solução
[Descrição técnica da implementação — pro reviewer e pra IA lerem e entenderem o diff.]

## Como testar
- [ ] TC-1: [passo + resultado esperado]
- [ ] TC-N: ...

## DevOps
- [ ] Migrations: [sim — qual / não]
- [ ] Variáveis de ambiente novas: [listar / nenhuma]
- [ ] Dependências novas: [listar / nenhuma]
- [ ] Passos de deploy fora do padrão: [listar / nenhum]

Jira: <KEY>-<N>, <KEY>-<M>
🤖 Generated with Claude Code
EOF
)"
```
> A seção **"O que foi feito"** é a MESMA que vai pro Jira (passo 4). Escreva uma vez, use nos dois. Sem card, o `## Cards` diz `— (publicação sem card)` e o trailer `Jira:` não é escrito.

### 4. Espelhar em cada card do Jira

Para **cada** card do passo 2 — não só o do nome da branch. `jira-sync.md` com a etapa **publicado**: ele lê no `jira.md` o status de destino e se comenta; o rótulo é `PR: <URL>` (ou `Publicado em: <branch> @ <hash>` sem PR) + `Branch: <branch>`, e o corpo é a **mesma** descrição leiga do PR. PR **atualizado** (não criado): comenta só nos cards que **ainda não têm** o comentário deste motor — os anteriores já receberam o deles quando entraram. Sem Jira → o `jira-sync` é no-op declarado.

### 5. Promover o kanban

```bash
mv kanban/10-done/<feature>.md kanban/11-ship/<feature>.md
```
Frontmatter:
```yaml
pr: <URL do PR>                # sem PR: "— (push em <branch>)"
status: in-review
```
> O feature **não estava** em `kanban/10-done/`? É sinal de QA não rodada — mas se este motor rodou, o estágio `commit` estava fechado e o `work-cycle` já passou por isso. Anote e siga; o `pr-cycle` confere de novo antes de mergear.

### 6. Devolver ao loop

```
{ pr: <n> | —, url, keys: [...], branch, hash }
```

O loop re-diagnostica: `pr` (ou `push`) fechado abre `integrado`. Se o alvo era `/pull-request`, o loop para aqui e a skill reporta.

## Red Flags — STOP

- "Working tree sujo, mas pusho o que está commitado" → NÃO. É o estágio `commit` reaberto; o loop volta ao `work-cycle`. Este motor não decide isso.
- "A integração andou, resolvo o conflito aqui e pusho" → NÃO. Conflito resolvido é código novo sem teste. Estágio `branch` reaberto → `branch.md` § 5 → `work-cycle` re-testa.
- "O setup diz `Abre PR: não`, mas abro assim mesmo — é mais seguro" → NÃO. Convenção do time é contrato. Pushe, espelhe, **não crie PR**; mudar é `/setup pr`.
- "`Abre PR: não`, então nem pusho" → NÃO. O push é o passo 1, **sempre**. O que o `não` pula é o passo 3.
- "Já tem PR aberto pra essa branch, crio outro" → NÃO. `gh pr edit` no aberto.
- "Os cards do PR são os do nome da branch" → NÃO. São os dos **commits**. Num lote, o nome é só o do 1º card.
- "Sem card, então sem PR" → NÃO. PR sem card é publicação válida: `## Cards` diz que não há, e segue.
- "Escrevi o corpo do PR só com a parte técnica" → NÃO. As 3 camadas: leiga, técnica, DevOps. Quem lê o PR pode não ser dev — e o `## DevOps` é o que o `env-config` vai consumir.
- "Comentei no Jira só no card do nome da branch" → NÃO. Em **cada** card dos commits, com o nome de cada um claro.
- "Push recusado (`non-fast-forward`), uso `--force`" → NÃO. Merge de `origin/<branch>`, re-testa. `--force` não é caminho.
