# Infra — lp-skills

> Mantido pelo `/infra`. **Inventário**: o que existe, onde, sob qual conta, e onde vive cada segredo — nunca o valor.
> Processo de deploy (ambientes, como checar, como setar, rollback): `.claude/ship-setup/deploy.md`.
> Convenções do time: `.claude/ship-setup/setup.md`.
>
> Mapeado em 2026-09-11. Fontes: `.vercel/project.json`, `.github/workflows/ci.yml`, `app/`, `lib/`, `components/` (grep de `process.env`), ausência de `.secrets/`, `.env*`, `.mcp.json`, `prisma/`. Confirmado por `vercel whoami` + `vercel project ls` e `gh repo view`.

## Provedores e contas
| Provedor | Conta / projeto (identificador) | Região | Para quê | Confirmado por |
|---|---|---|---|---|
| Vercel | time `team_N84tcI44WHCnsv3yVMJADoUZ` · projeto `lp-skills` (`prj_OIEX4hHuHPmxL4ccd84KPM71Tsd4`) | — (edge da Vercel) | hospedagem da LP; integração Git deploya cada push na `main` | `.vercel/project.json` · `vercel project ls` (conta `eduardofurihata`) |
| GitHub | `eduardofurihata/lp-skills` (público) | — | fonte do marketplace (`.claude-plugin/marketplace.json`, `.agents/plugins/marketplace.json`) que Claude Code, Codex e Cursor puxam; CI de manifestos | `gh repo view` |

## Serviços
| Serviço | Onde roda | Domínio / URL | Banco / storage |
|---|---|---|---|
| LP (Next.js, estática em build) | Vercel, prod = `main` | https://lp-skills.vercel.app | nenhum — lê o frontmatter dos `SKILL.md` do próprio repositório em build time (`lib/skills.ts`) |
| Marketplace de plugins | GitHub (o repositório é o produto) | `github.com/eduardofurihata/lp-skills` | — |
| CI (`.github/workflows/ci.yml`) | GitHub Actions, `ubuntu-latest` | — | — · **não deploya**: só regenera e valida os manifestos |

## Domínios e DNS
| Domínio | Registrador | DNS | Aponta para | Observação |
|---|---|---|---|---|
| `lp-skills.vercel.app` | Vercel (subdomínio da plataforma) | Vercel | o projeto | sem domínio próprio; TLS pela Vercel |

## Onde vive cada segredo
| Segredo (nome da variável) | Onde mora localmente | Onde mora no ambiente | Como se obtém / renova |
|---|---|---|---|
| **nenhum** | — | — | — |

Não há `.secrets/`, `.env*`, `.mcp.json`, nem `process.env` no app; o workflow de CI não referencia `${{ secrets.* }}`. O deploy é a integração Git da Vercel — a autenticação é da conta Vercel ligada ao GitHub, não um token no repositório. Se um dia houver variável: comando para setar no `.claude/ship-setup/deploy.md`; a linha dela entra aqui (nome + onde vive + como se obtém — nunca o valor).

## Artefatos em `.secrets/` (não são credencial)
| Caminho | O que é | De quando | Pode apagar? |
|---|---|---|---|
| — | não há `.secrets/` neste projeto | — | — |

## Se vazar — ordem de revogação
Nada a revogar no escopo do repositório. O acesso que existe é o da conta Vercel (`eduardofurihata`) e do GitHub — credenciais da **máquina**, não do projeto: `vercel logout` / `gh auth logout` e re-login nas contas.

## Identificadores em uso (não são segredo)
```
Vercel
  time ............ team_N84tcI44WHCnsv3yVMJADoUZ
  projeto ......... prj_OIEX4hHuHPmxL4ccd84KPM71Tsd4  "lp-skills"
  produção ........ https://lp-skills.vercel.app  (Node 24.x)

GitHub
  repositório ..... eduardofurihata/lp-skills  (público)
  marketplace ..... /plugin marketplace add eduardofurihata/lp-skills
```
