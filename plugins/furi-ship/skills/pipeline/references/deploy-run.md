# Deploy Run — levar o deploy a um desfecho NOMEADO

> **Fonte única do que acontece entre o push e o ambiente atualizado.** Invocado pelo `reconcile.md` quando o gap é "está na branch e não está no ar".

**Responsabilidade única:** disparar (ou localizar) o run e levá-lo a **um** de três desfechos nomeados. Não configura ambiente (`env-config.md`), não verifica comportamento (`smoke.md`), não decide rollback (o usuário decide).

## Iron Law

> **Push é o gatilho; deploy é o run VERDE.** Anunciar "está no ar" porque o push foi aceito é declarar vitória no meio do caminho — é exatamente o defeito que estas skills existem para consertar. E **desfecho tem nome**: `verde`, `vermelho` ou `fila`. Nunca "provavelmente subiu".

## Contrato

| Entrada | Saída |
|---|---|
| alvo (`{ambiente, branch}`) + comandos do `deploy-context.md` | `verde` \| `vermelho` \| `fila` — com o SHA coberto e o link do run |

## 1 — Localizar ou disparar

O deploy é disparado **pelo push** na branch do ambiente (é o que o `deploy-context.md` registra em *Dispara por*). Depois do push, localizar o run correspondente:

```bash
gh run list --branch <branch> --limit 5          # o mais recente cujo headSha == HEAD
gh run watch <id> --exit-status                  # acompanha até terminar
```
Projeto que não usa GH Actions → os comandos vêm do `deploy.md` (§ *Como checar*). **Não improvise comando de plataforma que o doc não registra.**

**Nenhum run para o HEAD atual?** O push não disparou nada (workflow não cobre essa branch, ou foi desabilitado). Isso é um **gap de configuração**, não um deploy — reporte e não fique esperando.

## 2 — Os três desfechos

| Desfecho | Como se reconhece | O que fazer |
|---|---|---|
| **verde** | run `success`, e o `headSha` do run **cobre** o HEAD da branch | devolve `verde`: ambiente **sincronizado**. Ainda **não** é "funcionando" — quem encadeia os gaps seguintes é o `reconcile.md` |
| **vermelho** | run `failure` / `cancelled` / `timed_out` | § 3 |
| **fila** | run `queued` / `waiting` / `pending`, sem progresso | § 4 |

> **Verde ≠ verificado.** São dois eixos independentes: *o código está lá* e *funciona lá*. Um run verde com env var faltando entrega uma tela de erro — sincronizado e quebrado ao mesmo tempo.

## 3 — Vermelho: diagnostica, conserta o que é seu, redeploya

```bash
gh run view <id> --log-failed        # o log do passo que quebrou, não o log inteiro
```

1. **Ler e reportar a causa** — em uma frase, com o passo que falhou.
2. **É seu?** Configuração faltando, migration pendente, variável ausente, lockfile desatualizado → **devolve `vermelho` com a causa nomeada**, para o `reconcile.md` reabrir o gap certo (configuração é gap de `env-config`, não conserto daqui) e disparar o redeploy.
3. **Não é seu?** Bug de código, teste quebrado, credencial que só o usuário tem, quota, indisponibilidade da plataforma → **PARA** e reporta com a causa e o que destravaria.
4. **Teto de ~3 tentativas** por gap. Não convergiu → para. Redeploy em loop queima runner e esconde a causa real.

**Nunca anuncie "no ar" com run vermelho.** O estado é: *não subiu, e por isto*.

**Rollback é oferecido, nunca automático.** O comando está no `deploy.md` (§ *Rollback*). Em ambiente com usuário real, apresente:
> "O deploy de `<ambiente>` falhou em `<passo>`. O ar está com a versão anterior / com versão parcial. Rollback disponível: `<comando>`. Quer que eu rode? [sim/não]"

Rollback automático pode ser pior que a falha — migration já aplicada, estado parcial. Quem responde pelo produto decide.

## 4 — Fila: fila é fila

`queued` sem progresso quase sempre é **runner self-hosted offline** — o setup padrão destes projetos. Máquina desligada **enfileira** o job; ele não falhou e não vai rodar até a máquina voltar.

**Duas filas, e a distinção é a resposta:**

| Fila | Como se reconhece | O que significa |
|---|---|---|
| **vai rodar** — runner online, ocupado com outro job | há runner `online` cujos **labels** atendem ao `runs-on` do job | é espera real. Aguarde **uma** janela declarada (~2–3 min, ou o que o `deploy.md` registrar) e reconfira |
| **não vai rodar nunca** — nenhum runner compatível online | todos `offline`, **ou** os online não têm os labels que o `runs-on` exige | é **ausência**, não lentidão. Reportar imediatamente; esperar não muda nada |

```bash
gh run list --branch <branch> --limit 3       # status queued persistente
gh api repos/{owner}/{repo}/actions/runners --jq '.runners[] | {name, status, labels: [.labels[].name]}'
```
**Label que não casa enfileira igual a runner desligado** — um job com `runs-on: [self-hosted, gpu]` fica em fila para sempre se o único runner online tem só `self-hosted`. Comparar os labels exigidos com os dos runners online é parte do diagnóstico, não detalhe.

Conferir o runner conforme o `deploy.md` (§ *Runner*) e reportar **o tipo de fila**, não "aguardando":
> *não vai rodar:* "O deploy de `<ambiente>` está **enfileirado e não vai rodar** (não falhou, não rodou): nenhum runner online atende ao `runs-on: <labels>` — `<nome>` está offline. O ar segue com a versão anterior. Destrava ligando o runner: o job pega sozinho."
> *vai rodar:* "O deploy de `<ambiente>` está **na fila** — runner `<nome>` online e ocupado. Reconferi depois de `<janela>` e ainda estava em fila; o ar segue com a versão anterior."

- **Fila NÃO é sucesso** — não transiciona card, não diz "no ar", não segue para o smoke.
- **Fila NÃO é falha** — não manda ninguém caçar bug de código, não sugere rollback.
- **Não esperar indefinidamente.** Fila do tipo "não vai rodar nunca" → reporta **na hora**. Fila do tipo "vai rodar" → **uma** janela de espera declarada, e se continuar em fila depois dela, reporta. Em nenhum caso o loop fica esperando: reportou o estado, o gap fica aberto e a skill encerra dizendo o que falta.
- **Não contornar.** Não reaponte o workflow para runner GitHub-hosted, não cancele e re-dispare esperando sorte diferente, não edite o `runs-on` para "destravar". O runner é a máquina do usuário; mudar isso é decisão dele.

## Red Flags — STOP

- "Pushei para a branch, então deployei" → NÃO. Push é gatilho; deploy é o run **verde**, observado.
- "O run está `queued` há 10 minutos, deve ter passado" → NÃO. Runner offline enfileira. **Fila é fila** — reporta como fila.
- "Está em fila, então é só esperar mais" → NÃO necessariamente. Sem runner online **com os labels que o job exige**, esperar não muda nada: é ausência, não lentidão. Confira os labels antes de chamar de espera.
- "Troco o `runs-on` para GitHub-hosted para destravar" → NÃO. Isso muda a infra do usuário por conta própria — e gasta minutos que ele evita de propósito.
- "Deu timeout no watch, considero sucesso e sigo" → NÃO. Timeout não é desfecho: reclassifique em vermelho ou fila e reporte.
- "Run verde, então a feature está funcionando" → NÃO. Verde = **sincronizado**. Funcionar é o `smoke.md` que prova.
- "Falhou, mas dou rollback depois" → NÃO. Se há usuário real no ar, a decisão de rollback é **agora**, e é do usuário.
- "Rodo rollback automático para deixar o ar estável" → NÃO. Migration aplicada, estado parcial: pode ser pior que a falha. Ofereça.
- "Redeployo até passar" → NÃO. Teto de ~3. Depois disso a causa não é transitória.
- "Não achei run, mas o push funcionou, então subiu" → NÃO. Sem run, nada foi publicado: é gap de configuração do workflow.
- "Uso `vercel --prod` porque conheço a plataforma" → NÃO. O comando é o que o `deploy.md` registra. Comando improvisado deploya o que ninguém pediu.
