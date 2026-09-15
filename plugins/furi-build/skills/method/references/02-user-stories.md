# Step 2 — User Stories

**`Como <persona>, quero <ação> para <benefício>.`** Em linguagem de usuário: "quero um botão que chame o endpoint X" não é story, é solução disfarçada de necessidade.

## Chame antes de escrever

- **`/solve`** (Skill tool) — o padrão desta passada: referência #1 do mercado. Invocação real, não de memória.
- **`principios.md`** § Lente por step — o que SOLID · DRY · KISS · YAGNI · LoD · Motores cobram **neste** step (mais `design.md`, se a feature tem superfície visual).
- **`follow-ups.md`** — achado fora do escopo documentado entra no Ledger classificado A/B/C; a linha de follow-ups é obrigatória no Gateway Check.

## Artefato

`docs/02-user-stories/<tópico>.md` — nome por domínio; doc que já cobre o domínio se **atualiza**, não se duplica (`inventario-docs.md`). Toda persona do Step 1 tem story aqui; story sem persona de lá não entra.

```markdown
# <Tópico> — User Stories

- Como <persona>, quero <ação> para <benefício>.
```

Cada story vira requisito: é dela que o Step 3 deriva os Use Cases.

## Gateway 2 → 3

Critérios e formato: `gateways.md` — as quatro linhas obrigatórias do Gateway Check inclusive.
