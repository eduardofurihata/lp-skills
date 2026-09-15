# Step 3 — Use Cases

**Chame e use:** `/solve` · `/principles` · `/front` (se tem UI) — os três via Skill tool · `lentes.md` (linha deste step) · `follow-ups.md`

## Regra

**Para cada user story do Step 2, derive os Use Cases que cobrem TODAS as possibilidades.**

Completude é obrigatória. Para cada story, enumere sem omitir:

- **Todos os atores/personas** envolvidos (não só o principal)
- **Happy path** (fluxo feliz)
- **Fluxos alternativos** (caminhos válidos diferentes do happy path)
- **Fluxos de erro** (validação, rede, timeout, permissão, estado inválido, concorrência)
- **Transições de estado** relevantes (vazio, parcial, completo, expirado, bloqueado)

Cada combinação distinta de (ator × fluxo × estado) = **1 UC separado**. Não agrupe.

## Artefato

`docs/03-use-cases/<tópico>.md` — nome por domínio; doc que já cobre o domínio se **atualiza**, não se duplica (`inventario-docs.md`). Toda story do Step 2 tem UC(s) aqui; UC sem story de lá não entra.

```markdown
# <Tópico> — Use Cases

## UC-N — <nome curto>
- **Ator**: <persona>
- **Precondição**: <estado inicial>
- **Fluxo**: <passos 1..N, em linguagem de usuário, sem código>
- **Resultado**: <estado final ou erro>
- **Estados de tela**: vazio · carregando · erro · sucesso · limite   ← só com superfície visual

## Assinaturas
| Assinatura (o que entra → o que sai) | UCs |
|---|---|
| <assinatura> | UC-1, UC-3 |

## Verificação de Realidade
| Passo do happy path | Onde está |
|---|---|
| <passo> | `arquivo:linha` ou 🔨 gap |
```

Tabela de assinaturas **única** — assinatura repetida em dois UCs é uma linha só. Ela é o esboço do contrato do motor que o Step 4 nomeia.

## Gateway 3 → 4

Critérios e formato: `gateways.md` — as quatro linhas obrigatórias do Gateway Check inclusive.
