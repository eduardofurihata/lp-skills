# Step 11 — Ship

## Pré-requisito

Gateway 10 → 11 **LIBERADO** (ver `gateways.md`).

## Fluxo de Deploy

1. Deploy em **staging** primeiro
2. **Smoke test** em staging (fluxo principal, não TCs completos)
3. Deploy em **produção**
4. Smoke test em produção
5. Monitoramento por 30-60 min

## Artefato

- **Pasta:** `kanban/11-ship/`
- **Arquivo:** `<tópico>.md`

## Conteúdo

- **Branch / PR / commit SHA** deployado
- **Data/hora** dos deploys (staging + prod)
- **Smoke test resultados** — o que foi validado em cada ambiente
- **Feature flags** ativadas / rollout gradual se aplicável
- **Monitoramento** — métricas observadas, alertas configurados
- **Rollback plan** — como reverter se necessário

## Regras

- **NUNCA** deploy direto em prod sem staging
- **NUNCA** marque "ship" sem smoke test executado com evidência
- Qualquer regressão detectada no smoke test → rollback + volta ao Step 8
