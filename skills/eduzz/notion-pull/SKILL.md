---
name: notion-pull
description: Use when the user types `/notion-pull <slug>` to trigger a pull on the local pm-forge app (http://localhost:9432). Syncs the wiki content from Notion to the local filesystem.
---

# /notion-pull — chama pm-forge para puxar uma wiki

Quando o usuário digitar `/notion-pull <slug>` (ex: `/notion-pull exemplo`), execute este fluxo:

1. **Validar input:** extraia o `<slug>` (último token). Se ausente, peça pro usuário fornecer.
2. **Disparar pull via HTTP:**
   ```
   POST http://localhost:9432/api/wikis/<slug>/pull
   ```
   Aceite query `?full=true` se usuário disser "pull completo" / "full".
3. **Polling do job:** a resposta retorna `{ job_id }`. Faça polling em:
   ```
   GET http://localhost:9432/api/jobs/<job_id>
   ```
   a cada ~1s. Mostre o `progress.message` como output incremental ao usuário.
4. **Conclusão:** quando `status === 'done'`, reporte "Pull concluído. Wiki em `~/pm-forge/<slug>/`". Sugira `cd ~/pm-forge/<slug> && claude` se quiser editar.
5. **Erro de conexão:** se `fetch` falha (ECONNREFUSED ou similar), responda:
   > "pm-forge não está rodando. Execute `pm-forge` ou `make dev` no diretório do app primeiro (`<caminho-do-pm-forge>` ou onde o app está)."

## Tools necessários

- Bash (curl) ou WebFetch pra chamadas HTTP

## Padrão de output

```
[pm-forge] Pull incremental: 3 página(s) modificada(s)...
[pm-forge] Baixando "Doc A" (1/3)
[pm-forge] Baixando "Doc B" (2/3)
[pm-forge] Baixando "Doc C" (3/3)
[pm-forge] ✓ Concluído. ~/pm-forge/exemplo/
```
