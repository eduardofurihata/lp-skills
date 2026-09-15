# Step 3 — Use Cases

**Para cada user story do Step 2, derive os Use Cases que cobrem TODAS as possibilidades.** Completude é obrigatória.

**Chame e use:** `/solve` · `/principles` · `/front` (se tem UI) — os três via Skill tool · `11-follow-ups.md`

## Regra

Para cada story, enumere sem omitir:

- **Todos os atores/personas** envolvidos (não só o principal)
- **Happy path** (fluxo feliz)
- **Fluxos alternativos** (caminhos válidos diferentes do happy path)
- **Fluxos de erro** (validação, rede, timeout, permissão, estado inválido, concorrência)
- **Transições de estado** relevantes (vazio, parcial, completo, expirado, bloqueado)

Cada combinação distinta de (ator × fluxo × estado) = **1 UC separado**. Não agrupe.

O fluxo é escrito em passos de usuário: UC que cita função, tabela ou endpoint desceu de nível — virou pseudo-implementação.

## Artefato

`docs/03-use-cases/<tópico>.md` — nome por domínio; doc que já cobre o domínio se **atualiza**, não se duplica (`00-start.md`). Toda story do Step 2 tem UC(s) aqui; UC sem story de lá não entra.

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

Tabela de assinaturas **única** — assinatura repetida em dois UCs é uma linha só, e é o esboço do contrato do motor que o Step 4 nomeia: assinatura igual em UCs diferentes é o sinal de que a regra tem um dono só.

A duplicata a caçar é **na tabela**, nunca nos UCs: o mesmo fluxo com outro ator continua sendo dois.

**Se tem UI:** estado que não for listado no UC não vai ser desenhado no Step 5 — e vira bug no Step 10.

## Gateway 3 → 4

- [ ] Use Cases derivados por **(ator × fluxo × estado)**, sem agrupar; todo UC rastreia a uma story
- [ ] Tabela de assinaturas **única**, sem duplicata
- [ ] Seção `## Verificação de Realidade` com cada passo do happy path mapeado a `arquivo:linha` OU 🔨 gap
- [ ] **Se tem UI:** cada UC lista seus **estados de tela** (vazio · carregando · erro · sucesso · limite)
- [ ] Artefato `docs/03-use-cases/<tópico>.md` existe com conteúdo substantivo
- [ ] As **quatro linhas obrigatórias** publicadas (`SKILL.md` § Gateway Check)
