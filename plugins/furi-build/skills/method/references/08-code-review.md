# Step 8 — Code Review Crítico

## Princípios neste step (`principles/SKILL.md`)

Revisar **contra a lista, princípio a princípio e por nome** — não por proxy, e **os cinco do SOLID**, não só o SRP. É o que a tabela `## Análise de Qualidade` do 8b cobra linha a linha (e a `## Análise de Design`, com superfície visual): a capacidade vazou do motor? existe segunda fonte da mesma regra? o contrato virou tripa exposta? o **saldo do perímetro** fecha — todo arquivo que a passada tocou subiu ou já estava no nível 10x? Violação encontrada entra na triagem A/B/C (`follow-ups.md`): dentro do escopo, corrige agora; escopo novo, ledger.

## 8a — Revisão em Loop

```
REPETIR até 100% limpo:
  1. git diff main...HEAD — TODAS as mudanças
  2. Reler plano (7a) — código implementa tudo?
  3. Reler TCs (6) — todos cenários cobertos?
  4. Reler use cases (3) — edge cases tratados?
  5. Revisar CADA arquivo:
     - Código morto / imports não usados?
     - Bugs lógicos / edge cases?
     - Padrões do projeto violados? (consultar spec)
     - Segurança (XSS, injection, secrets, auth bypass)?
     - Consistência com codebase?
     - Consistência UI/UX — padrões visuais/interação existentes respeitados?
     - Performance (N+1, re-renders, memory leaks)?
     - Acessibilidade (se frontend)?
     - Erros (não genérico, não silencioso)?
     - Faz EXATAMENTE o que use cases pedem — nem mais, nem menos?
     - **Saldo do perímetro (§ 3.5 do plano):** todo arquivo que este trabalho abriu, leu ou atravessou saiu melhor do que entrou — ou está declarado como já no nível 10x?
     - **Princípios, UM A UM e POR NOME** (`principles/SKILL.md` — a MESMA lista contra a qual o 7b escreveu):
       · **SRP** — arquivo/função/componente faz uma coisa? >40 linhas sem extrair? lógica+UI juntos?
       · **OCP** — comportamento novo entrou como `if`/`case` no meio do que já existia, em vez de composição?
       · **LSP** — alguma implementação lança onde o contrato não prevê, ou exige mais do que ele exige?
       · **ISP** — interface obrigando a implementar o que o cliente não usa?
       · **DIP** — regra de negócio importando client de infra (Prisma, HTTP, lib) direto?
       · **DRY** — lógica que já existe em shared/lib/components foi duplicada? (grep, não memória)
       · **KISS** — dá pra fazer o mesmo com menos? abstração que só complica?
       · **YAGNI** — entrou algo que nenhum UC exige? o § 3.2 do plano foi furado sem registro?
       · **LoD / acoplamento** — `a.b.c.d`? dependência circular? direção `api ↔ web` violada?
       · **Motores** — a capacidade vazou do motor? existe **segunda fonte** da mesma regra? o contrato virou tripa exposta? o § 3.3 foi cumprido?
       · **Camadas** — lógica de negócio em controller/componente?
     - **Design, UM A UM e POR NOME** (`ui/SKILL.md` — só se a feature tem superfície visual):
       · **Tokens** — sobrou valor literal (`#hex`, `13px`) onde devia ser token?
       · **Atomicidade** — átomo conhecendo regra de negócio ou fazendo fetch?
       · **Composição > configuração** — >2 props booleanas de aparência?
       · **Headless** — comportamento e aparência no mesmo arquivo?
       · **Estados** — vazio, carregando, erro, sucesso, limite + hover/focus-visible/active/disabled/loading/selected: todos existem?
       · **Consistência semântica / Jakob** — mesma ação com nome, ícone e lugar diferentes? padrão inventado sem motivo escrito?
       · **Preservação de contexto** — voltar apaga? filtro/rascunho/scroll sobrevivem?
       · **A11y (AA)** — contraste, foco visível, teclado, nome acessível, alvo ≥24px?
       · **DS** — componente visual novo nasceu na pasta da feature em vez de ser **promovido**?
     - **Nível 10x:** o calibre dos big pop tech apps / líderes do domínio é o **piso** — isto está 10x acima dele, ou só "funciona"? ("O líder do domínio trocaria o dele por isto — e a tela dele por esta?")
  6. Problema encontrado → CLASSIFICAR e agir:
     - dentro do escopo documentado (docs 01-04) → **balde A**: corrigir IMEDIATAMENTE → voltar ao 1
     - escopo novo que este trabalho criou/tocou/expôs → **balde B**: registrar ABERTO no ledger
       (`## Follow-ups` do card de to-do) → vira ciclo /method próprio no Gate de Convergência
     - pré-existente e não tocado por este trabalho → **balde C**: registrar DESCARTADO + justificativa
     Na dúvida entre B e C → B. Ver `follow-ups.md`.
  7. PR existente → atualizar comentários/descrição
  8. Loop até ZERO issues de balde A — NÃO aceitar "bom o suficiente"
  9. Revisão fria (`/blind review`) — só com 1-8 limpos, sobre a mudança INTEIRA como está agora:
     - bundle montado por comando, nunca digitado (§ Revisão fria, abaixo); carimbo = sha256 do bundle
     - saída colada INTEGRAL em 8b § Revisão Fria; cada achado do revisor → CLASSIFICAR (6)
     - achado A → corrigir → volta ao 1 (a mudança mudou; a revisão fria roda de novo no fim)
     - o loop só fecha com `RESULTADO: 0 A` de uma revisão fria cujo carimbo é o do bundle ATUAL
```

### Revisão fria — a condição de saída do loop

Quem escreveu o plano não enxerga o ponto cego do plano: os passos 1-8 são o autor relendo o próprio trabalho. A **revisão fria** é a mesma checklist lida por uma sessão que não participou de nada — sem esta conversa, sem memória, sem `CLAUDE.md` — e que só pode **ler** o repositório (`blind/SKILL.md`, modo `review`). Ela roda **depois** de o autor declarar o loop limpo, nunca no lugar dele.

```bash
BASE=main            # a branch de integração de onde este trabalho saiu (dev, quando existe)
METHOD_REFS=<pasta references/ deste protocolo — de onde você abriu este arquivo>
BLIND="$METHOD_REFS/../../blind"   # a skill /blind, no mesmo pacote
T="$(mktemp -d)"
{
  echo "# Bundle — revisão fria de <tópico>"
  echo; echo "## Diff (working tree vs $BASE — o commit é do Step 10)"
  echo '```diff'; git diff "$BASE"; echo '```'
  echo; echo "## Status — arquivos novos ainda não rastreados: leia-os pelo caminho"; git status --short
  echo; echo "## Checklist (8a — item a item, por nome)"
  sed -n '/^  5\. Revisar CADA arquivo/,/^  6\. Problema encontrado/p' "$METHOD_REFS/08-code-review.md"   # a lista do passo 5, a mesma do 7b
  echo; echo "## Caminhos para ler antes de julgar"
  printf -- '- %s\n' docs/01-problem/<tópico>.md docs/02-user-stories/<tópico>.md docs/03-use-cases/<tópico>.md \
    docs/04-spec/<tópico>.md docs/05-test-cases/<tópico>.md kanban/07-implementation/<tópico>.md .claude/patterns.md CLAUDE.md
} > "$T/bundle.md"
sha256sum "$T/bundle.md"                                                          # carimbo — vai para o 8b
bash "$BLIND/scripts/blind.sh" review --file "$T/bundle.md" --out "$T/review.md"  # Bash tool: timeout de 10 min
```

Nada do bundle é digitado: diff, status e checklist saem de comando; o resto são caminhos que o revisor abre sozinho. Resumir o diff "porque é grande" é a porta por onde o viés volta — diff grande é `run_in_background` + `--out`.

**O que volta é fato do step.** `cat "$T/review.md"` vai **inteiro** para o 8b. Achado do revisor entra na triagem do passo 6 como qualquer outro; rebaixar um `A` dele para B/C exige a justificativa escrita na tabela do 8b — nunca em silêncio, nunca "ele não entendeu o contexto" (contexto que o revisor não viu é contexto que o usuário final também não vê). `RESULTADO: 0 A` com carimbo igual ao do bundle atual é o que fecha o loop; qualquer fix depois disso muda o bundle e reabre a revisão.

Sem o binário `claude` (Codex, Cursor): a revisão roda inline, na sessão, e o 8b abre a seção com `independência: NÃO`.

O Step 8 é o maior detector de follow-up do protocolo. **Nada do que aparecer aqui pode ficar só na cabeça ou só no relatório:** ou é corrigido agora (A), ou está `ABERTO` no ledger (B), ou está `DESCARTADO` com justificativa (C).

## 8b — Relatório

**Organizar** `kanban/08-code-review/` → criar/atualizar `<tópico>.md`:

```markdown
# Relatório de Code Review — <feature>

## Resumo
- Branch | Total de iterações do loop | Data | PR existente (sim/não)

## Arquivos Analisados
| Arquivo | Linhas ± | Tipo | Veredicto (✅ Limpo / ⚠️ Corrigido) |

## Problemas Encontrados e Corrigidos
### Issue #N — [título]
- Arquivo | Linha(s) | Severidade (🔴/🟡/🟢) | Categoria
- Descrição | Correção aplicada | Iteração

## Análise de Cobertura
- Stories atendidas | Use cases cobertos | TCs preparados | Gaps

## Análise de Segurança
Input validation | Auth | Dados sensíveis | Injection vectors (✅/❌/N/A)

## Análise de Qualidade (por princípio — `principles/SKILL.md`)
| Princípio | Veredicto | Evidência / o que foi corrigido |
|---|---|---|
| SRP (responsabilidade única, camadas) | ✅/⚠️ | |
| OCP (extensão sem editar o que funciona) | ✅/⚠️ | |
| LSP (implementação honra o contrato) | ✅/⚠️ | |
| ISP (interface do tamanho do cliente) | ✅/⚠️ | |
| DIP (depende de abstração, direção ao domínio) | ✅/⚠️ | |
| DRY (duplicação, reúso do § 3.1) | ✅/⚠️ | |
| KISS (complexidade) | ✅/⚠️ | |
| YAGNI (especulação, § 3.2 respeitado) | ✅/⚠️ | |
| Law of Demeter / acoplamento | ✅/⚠️ | |
| Motores (§ 3.3 — um dono por capacidade) | ✅/⚠️ | |
| Refatoração (saldo do perímetro, § 3.5) | ✅/⚠️ | |
| Naming + consistência com o codebase | ✅/⚠️ | |
| Nível 10x (o #1 do domínio é o piso) | ✅/⚠️ | |

Nenhuma linha pode ficar em branco — princípio sem veredicto = princípio não revisado.

## Análise de Design (por princípio — `ui/SKILL.md`) — só com superfície visual

| Princípio | Veredicto | Evidência / o que foi corrigido |
|---|---|---|
| Tokens = SSOT (zero literal) | ✅/⚠️ | |
| Atomicidade (nível certo, átomo sem regra) | ✅/⚠️ | |
| Composição > configuração | ✅/⚠️ | |
| Headless (lógica ⟂ apresentação) | ✅/⚠️ | |
| Estados (todos desenhados) | ✅/⚠️ | |
| Consistência semântica / Jakob | ✅/⚠️ | |
| Preservação de contexto | ✅/⚠️ | |
| A11y (WCAG AA) + responsivo (breakpoints, 320px) | ✅/⚠️ | |
| DS evoluiu (promoções registradas, nada solto na feature) | ✅/⚠️ | |

Feature sem superfície visual: escreva `N/A — sem superfície visual (derivado do Step 4)` **uma vez**, no lugar da tabela.

## Revisão Fria (`/blind review`)
- Carimbo do bundle (sha256) | Rodadas de revisão fria nesta review | Independência: SIM (sessão cega) / NÃO (inline — sem binário `claude`)

### Saída integral da última rodada
> <`cat` do `review.md` — do primeiro ao último caractere, sem cortar, sem "[…]">

### Triagem dos achados do revisor
| # | Achado (do revisor) | Balde sugerido | Balde final | Justificativa (obrigatória quando rebaixa A → B/C) |

Última rodada com `RESULTADO: 0 A` e carimbo igual ao do bundle atual? ✅ / ❌ (❌ = o loop não fechou)

## Follow-ups Emitidos
| # | Achado | Balde (A/B/C) | Status | Destino |
(A = corrigido nesta revisão · B = ABERTO no ledger, vira ciclo /method · C = DESCARTADO + justificativa)
Nenhum? → "nenhum follow-up emitido neste review".

## Veredicto Final
- Status: ✅ APROVADO / ❌ REQUER correções
- Confiança: Alta/Média/Baixa (justificar se não Alta)
- Notas para o teste: pontos que exigem atenção
```

## Regras Rígidas

- **NÃO crie PR** — apenas revise e corrija
- **NÃO aprove PR** — apenas comente se existir
- **Atualizar PR existente** = PERMITIDO (`gh pr view` para verificar)
- Qualquer erro encontrado = corrigido imediatamente, não apenas documentado
- **Achado fora do escopo ≠ achado ignorado.** Não cabe corrigir aqui (é escopo novo) → **ledger**, não "anoto no relatório e sigo". Relatório documenta; ledger obriga a resolver.
- Relatório **brutalmente honesto**
- **Revisão fria não é opcional nem substituível** pelo loop do autor: sem `RESULTADO: 0 A` no bundle final, o veredicto do 8b **não pode ser APROVADO** — e "ele não entendeu o contexto" não rebaixa achado: justificativa escrita na tabela, ou corrige
- Veredicto ❌ → voltar ao 7b → rodar Step 8 inteiro novamente
- Sem o .md criado = step NÃO completo

## Gateway 8 → 9

- [ ] Veredicto **APROVADO** em 8b
- [ ] Zero issues pendentes (balde A)
- [ ] **Revisão fria** (`/blind review`) com `RESULTADO: 0 A` e carimbo igual ao do bundle atual — saída integral colada no 8b, achados do revisor triados (rebaixamento com justificativa)
- [ ] **`## Análise de Qualidade` preenchida por princípio** (SOLID: SRP, OCP, LSP, ISP, DIP · DRY · KISS · YAGNI · LoD · Motores · Refatoração · naming · nível 10x) — nenhuma linha em branco
- [ ] **`## Análise de Design` preenchida por princípio** (se tem UI) — nenhuma linha em branco
- [ ] **Princípios declarados** na linha do Gateway Check
- [ ] **Refatoração declarada** na linha própria do Gateway Check
- [ ] **Design declarado** na linha própria (se a feature tem superfície visual)
- [ ] Achados fora de escopo classificados no ledger (B ou C) — seção `## Follow-ups Emitidos` preenchida
- [ ] PR existente atualizado (se houver)
- [ ] Artefato `kanban/08-code-review/<tópico>.md` existe com conteúdo substantivo
- [ ] **Follow-ups detectados neste step:** N (registrados no ledger) / nenhum
