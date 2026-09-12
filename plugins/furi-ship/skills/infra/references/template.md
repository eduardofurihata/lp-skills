# Template — `.claude/ship-setup/infra.md`

Escrito pelo `/infra` (passo 5 do fluxo) a partir do que foi inferido, confirmado e perguntado. **Nenhum valor de segredo, em nenhuma linha** — o gate anti-vazamento (passo 6) recusa o arquivo se um aparecer. Colunas vazias ficam `—`; o que não foi confirmado fica `não confirmado (motivo)`.

```markdown
# Infra — <projeto>

> Mantido pelo `/infra`. **Inventário**: o que existe, onde, sob qual conta, e onde vive cada segredo — nunca o valor.
> Processo de deploy (ambientes, como checar, como setar, rollback): `.claude/ship-setup/deploy.md`.
> Convenções do time: `.claude/ship-setup/setup.md`.
<!-- Eduzz/Labzz: > Conta AWS inteira: `~/GitHub/eduzz-aws` (`docs/MAPA-AWS.md`, skill `aws-prod`). Este mapa é só o recorte deste projeto — stack `<qual>` do § 2 de lá. -->

## Provedores e contas
| Provedor | Conta / projeto (identificador) | Região | Para quê | Confirmado por |
|---|---|---|---|---|
| Vercel | projeto `<nome>` (`prj_…`) | — | hospedagem | `.vercel/project.json` · `vercel project ls` |
| Neon | projeto `<nome>` | `<região>` | Postgres de produção | `neonctl projects list` |
| AWS | conta `<id>` | `us-east-1` | <serviços> | `aws sts get-caller-identity` |
| Google Cloud | projeto `<id>` (nº `<n>`) | — | <APIs> | `gcloud config list` |
| … | | | | não confirmado (CLI não autenticada) |

## Serviços
| Serviço | Onde roda | Domínio / URL | Banco / storage |
|---|---|---|---|
| app | Vercel (prod = `main`) | https://… | Neon `<projeto>` |
| cron diário | cron-job.org | → `/api/cron/…` | — |

## Domínios e DNS
| Domínio | Registrador | DNS | Aponta para | Observação |
|---|---|---|---|---|
| `<apex>` | Registro.br | Cloudflare | Vercel (A + CNAME) | DNSSEC ativo · TLS pela Vercel |

## Onde vive cada segredo   <!-- NOME e LUGAR. Nunca o valor. -->
| Segredo (nome da variável) | Onde mora localmente | Onde mora no ambiente | Como se obtém / renova |
|---|---|---|---|
| `DATABASE_URL` | `.secrets/tokens.env` (cópia em `.env.prod`) | Vercel → Settings → Environment Variables | painel Neon → Connection string |
| `RESEND_API_KEY` | `.secrets/tokens.env` | Vercel | painel Resend → API Keys |
| `JIRA_API_TOKEN` | `.secrets/atlassian.env` (⚠️ cópia — o mesmo token vive em `<outro repo>`) | `.mcp.json` lê do arquivo | id.atlassian.com → API tokens |
| chave SSH `<nome>` | `.secrets/<arquivo>` + `<arquivo>.pub` (+ passphrase em `<arquivo>-passphrase`) | — | gerada localmente; pública cadastrada em `<onde>` |
| conta de serviço Google | `.secrets/google-service-account.json` | — | `gcloud iam service-accounts keys create` |
| `VERCEL_TOKEN` | **não mora aqui** — só no GitHub | GitHub → Settings → Secrets (`VERCEL_TOKEN`) | Vercel → Tokens |

## Artefatos em `.secrets/` (não são credencial)
| Caminho | O que é | De quando | Pode apagar? |
|---|---|---|---|
| `.secrets/<x>-dump/` | dump pré-migração do banco `<y>` | 2026-07-31 | depois de validar a migração |
| `.secrets/<x>-desativacao-<data>/` | `tfstate`, `tfvars`, exports do ECS/ALB/Route53 de antes da desativação | <data> | histórico — manter |
| `.secrets/<x>-REMOVIDO` | credencial revogada, mantida como registro | — | sim |

## Se vazar — ordem de revogação
1. `<credencial-mestra>` primeiro só se `<painel>` já estiver aberto — senão tranca fora.
2. `<token>` em `<painel> → <tela>`.
3. …

## Identificadores em uso (não são segredo)
```
<provedor>
  conta ........... <id>  "<nome>"
  projeto ......... <id>
  ⚠️ <conta parecida que NÃO é a deste projeto, e por quê>
```
```

## O que entra × o que não entra

| Entra (identificador) | Não entra (credencial / estado) |
|---|---|
| account id, project id, org id, número de conta | chave, token, senha, passphrase, connection string com senha |
| região, nome de serviço, domínio, URL pública | conteúdo de `*.pem`, `id_*`, `*.json` de conta de serviço |
| nome de variável e **onde** ela mora | o valor da variável |
| nome de arquivo em `.secrets/` e o que ele é | o conteúdo do arquivo |
| "há rotação em andamento — não apague a `-old`" (julgamento) | quantos containers rodam, fatura, ocupação de disco (estado) |

## Exemplo de diff (report do passo 5)

```
🗺️ Infra: 7 provedores · 14 segredos mapeados · 3 artefatos   [atualizado]
  + apareceu:  .secrets/cloudflare.env (CLOUDFLARE_DNS_TOKEN) · provedor Cloudflare
  − sumiu:     .secrets/gratta-urls.txt (URL vencida — o README já previa o descarte)
  ~ mudou:     Resend: domínio verificado `envio.…` → apex (README, 26/08)
  ? não confirmado: conta AWS (aws CLI não autenticada)
```
