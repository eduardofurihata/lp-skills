# Step 5 — Test Cases

`docs/05-test-cases/<tópico>.md` · Reler 1-4

TC profissional, adversarial, captura **bug único**. Contempla várias possibilidades relevantes em produção. Roda via front no Step 9.

## Complexidade → Quantidade

Antes de escrever TCs, analise a complexidade da implementação e derive entre **1 e 10 TCs** proporcional a ela.

## Significância

> **"Se eu deletar, um bug ÚNICO passaria despercebido?"**
> **SIM** → TC existe. **NÃO** → filler.

## Formato

```
### TC-N: [nome]
- Bug único: [frase concreta]
- Pré-condição: [setup, estado, persona]
- Passos: [numerados]
- Resultado: [observável no front]
- Prova: screenshot (Step 9)
```

## Gateway 5 → 6

- [ ] Análise de complexidade publicada; 1-10 TCs derivados
- [ ] Cada TC profissional e com bug único
- [ ] Possibilidades relevantes contempladas
- [ ] Artefato substantivo
