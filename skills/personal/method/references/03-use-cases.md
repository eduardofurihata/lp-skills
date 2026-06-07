# Step 3 — Use Cases

## Reler antes
- Step 2 (User Stories)

## Artefato
- **Pasta:** `docs/03-use-cases/`
- **Arquivo:** `<tópico>.md`

## Regra

**Para cada user story do Step 2, derive os Use Cases que cobrem TODAS as possibilidades.**

Completude é obrigatória. Para cada story, enumere sem omitir:

- **Todos os atores/personas** envolvidos (não só o principal)
- **Happy path** (fluxo feliz)
- **Fluxos alternativos** (caminhos válidos diferentes do happy path)
- **Fluxos de erro** (validação, rede, timeout, permissão, estado inválido, concorrência)
- **Transições de estado** relevantes (vazio, parcial, completo, expirado, bloqueado)

Cada combinação distinta de (ator × fluxo × estado) = **1 UC separado**. Não agrupe.

## Formato por UC

```markdown
## UC-N — <nome curto>
- **Ator**: [persona]
- **Precondição**: [estado inicial]
- **Fluxo**: [passos 1..N, actor-focused, sem código]
- **Resultado**: [estado final ou erro]
```

## Gateway 3 → 4

- [ ] Toda user story do Step 2 tem UC(s) derivado(s)
- [ ] Para cada story: happy path + alternativos + erros + todos os atores cobertos (nada omitido)
- [ ] Artefato `docs/03-use-cases/<tópico>.md` existe com conteúdo substantivo
