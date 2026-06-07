# Step 8 — Avaliar % de correspondência

**Effort: max**


## Objetivo
Avaliar com precisão se o comportamento observado na simulação (step 7) corresponde ao que o card descreve. O resultado determina se prosseguimos ou voltamos.

## Sub-steps

### 8.1 — Comparar comportamento observado vs. card
```markdown
## Avaliação de Correspondência — Iteração N

| Aspecto | Card descreve | Simulação mostrou | Match? |
|---------|--------------|-------------------|--------|
| Trigger/Condição de acionamento | [x] | [y] | ✅/❌ |
| Comportamento exibido ao usuário | [x] | [y] | ✅/❌ |
| Tipo de usuário / contexto | [x] | [y] | ✅/❌ |
| Impacto / erro observado | [x] | [y] | ✅/❌ |
| URL / fluxo específico | [x] | [y] | ✅/❌ |
```

### 8.2 — Calcular e declarar % publicamente no chat

```markdown
## % de Correspondência — Iteração N
- Aspectos validados: N de M
- % de correspondência: XX%
- Veredicto: ✅ ≥90% — prosseguir para step 10 | ❌ <90% — ir para step 9
```

**Este bloco DEVE ser publicado no chat — não apenas no card .md.**

## Gateway 8 → Step 9 ou Step 10

| Resultado | Próximo step |
|-----------|-------------|
| % ≥ 90% | → **Step 10** (registrar reprodução) — pular step 9 |
| % < 90% | → **Step 9** (loop: nova hipótese) |

## Critério de Saída
- Comparação tabular publicada no chat
- % calculado e declarado explicitamente
- Decisão clara: step 10 ou step 9

## ❌ Racionalizações Proibidas

| Frase | Realidade |
|-------|-----------|
| "Comportamento é parecido com o card" | Parecido ≠ exato. Avalie aspecto por aspecto. |
| "85% é suficientemente próximo" | <90% = step 9. Sem exceções. |
| "Vou para step 10 sem publicar o %" | % deve ser publicado no chat antes de prosseguir. |
