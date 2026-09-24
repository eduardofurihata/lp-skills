# Setup — lp-skills

> Uma seção por skill do ship; cada uma grava a sua. Mapa da infra: `.claude/ship/infra.md`.
> Sem Jira: rastreamento local, nenhuma etapa move card.

## Work
- Branch: `main` direto
- Commit: Conventional Commits (`feat/fix/refactor/docs/chore(<escopo>): …`, escopo = pacote ou área), sem key de card
- DoD: `pnpm check` verde (README.md § Workflow do autor)
- Status da etapa: —

## Pull-request
- Destino: sem PR — só push na `main`
- Status da etapa: —

## Homolog
- Tem homolog: não — só existe a `main`
- Status da etapa: —

## Prod
- Processo de PR: não — o push na `main` é o release
- Deploy: integração Git da Vercel (a LP) + o próprio GitHub (o marketplace); o CI de Actions só valida os manifestos, não deploya
- Status da etapa: —
