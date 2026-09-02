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

## Princípios neste step (`principios.md`)

- **SRP** — 1 UC = 1 combinação (ator × fluxo × estado). Agrupar "porque é parecido" destrói a rastreabilidade que os Steps 5 e 9 dependem.
- **DRY** — tabela de assinaturas **única**, sem duplicata (já é critério do gateway). Dois UCs com o mesmo fluxo e estados diferentes compartilham a descrição, não a copiam.
- **YAGNI** — todo UC rastreia a uma story do Step 2. Fluxo que nenhuma story pede não vira UC — vira achado (ledger), se for real.
- **KISS** — fluxo em passos de usuário, sem código. UC não é pseudo-implementação.
- **Motor** — UCs que compartilham a mesma regra são do **mesmo motor**, e a tabela de assinaturas já é o **esboço do contrato** dele: o que entra, o que sai. Dois UCs que precisam da mesma decisão não podem tomá-la cada um por si.
- **Refatoração** — UC agrupado → **quebre**; assinatura duplicada → **funda**. O artefato sai desta passada mais limpo do que entrou.
- **Design** (se tem UI) — cada UC lista seus **estados de tela**: vazio, carregando, erro, sucesso e limite (lista longa, texto longo, sem permissão). **Estado não listado aqui é estado que não vai ser desenhado** — e vira bug no Step 9 (`design.md`).

## Gateway 3 → 4

- [ ] Toda user story do Step 2 tem UC(s) derivado(s)
- [ ] Para cada story: happy path + alternativos + erros + todos os atores cobertos (nada omitido)
- [ ] Artefato `docs/03-use-cases/<tópico>.md` existe com conteúdo substantivo
- [ ] **Princípios declarados** na linha do Gateway Check (SRP · DRY · YAGNI · KISS · Motor pela lente acima)
- [ ] **Refatoração declarada** na linha própria do Gateway Check
- [ ] **Design declarado** na linha própria — cada UC com seus estados de tela (se a feature tem superfície visual)
