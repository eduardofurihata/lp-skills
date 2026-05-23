---
name: notion-push
description: Use when the user types `/notion-push <slug>` to push local MD edits back to Notion via pm-forge (http://localhost:9432).
---

# /notion-push — chama pm-forge para subir edições locais

Quando o usuário digitar `/notion-push <slug>` (ex: `/notion-push insta`), execute este fluxo:

1. **Validar input:** extraia o `<slug>`. Se ausente, peça.
2. **Disparar push via HTTP:**
   ```
   POST http://localhost:9432/api/wikis/<slug>/push
   ```
3. **Tratamento de 409 conflicts:**
   Se response status === 409, o pm-forge detectou conflitos pendentes. Reporte:
   > "Conflitos pendentes em <N>. Resolva em http://localhost:9432/wikis/<slug>/conflicts antes de tentar de novo."
4. **Polling do job:** se 202, polling em `/api/jobs/<job_id>`. Mostre `progress.message`.
5. **Conclusão:** quando `done`, reporte ops totais e success/error counts. Se houver erros, sugira ver detalhes em http://localhost:9432/wikis/<slug>/history.
6. **Erro de conexão:** mesmo handling de `/notion-pull`.

## Tools necessários

- Bash (curl) ou WebFetch

## Padrão de output

```
[pm-forge] Refresh + pull silencioso + diff...
[pm-forge] Executando 3 op(s)...
[pm-forge] Op 1/3 ✓
[pm-forge] Op 2/3 ✓
[pm-forge] Op 3/3 ✓
[pm-forge] ✓ Push concluído. 3 sucessos, 0 erros.
```

Se conflitos:
```
[pm-forge] ⚠ 2 conflito(s) detectado(s).
Abra http://localhost:9432/wikis/insta/conflicts pra resolver.
```
