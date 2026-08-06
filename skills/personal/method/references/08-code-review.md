# Step 8 — Code Review Crítico

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
     - Regra "tocou = refatora" do 7b seguida?
     - **Princípios, UM A UM e POR NOME** (`principios.md` — a MESMA lista contra a qual o 7b escreveu):
       · **SRP** — arquivo/função/componente faz uma coisa? >40 linhas sem extrair? lógica+UI juntos?
       · **DRY** — lógica que já existe em shared/lib/components foi duplicada? (grep, não memória)
       · **KISS** — dá pra fazer o mesmo com menos? abstração que só complica?
       · **YAGNI** — entrou algo que nenhum UC exige? o § 3.2 do plano foi furado sem registro?
       · **LoD / acoplamento** — `a.b.c.d`? dependência circular? direção `api ↔ web` violada?
       · **Camadas** — lógica de negócio em controller/componente?
     - **Nível referência #1:** está no calibre dos big pop tech apps / líderes do domínio, não só "funciona"? ("Um líder do domínio assinaria isto?")
  6. Problema encontrado → CLASSIFICAR e agir:
     - dentro do escopo documentado (docs 01-04) → **balde A**: corrigir IMEDIATAMENTE → voltar ao 1
     - escopo novo que este trabalho criou/tocou/expôs → **balde B**: registrar ABERTO no ledger
       (`## Follow-ups` do card de to-do) → vira ciclo /method próprio no Gate de Convergência
     - pré-existente e não tocado por este trabalho → **balde C**: registrar DESCARTADO + justificativa
     Na dúvida entre B e C → B. Ver `follow-ups.md`.
  7. PR existente → atualizar comentários/descrição
  8. Loop até ZERO issues de balde A — NÃO aceitar "bom o suficiente"
```

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

## Análise de Qualidade (por princípio — `principios.md`)
| Princípio | Veredicto | Evidência / o que foi corrigido |
|---|---|---|
| SRP (responsabilidade única, camadas) | ✅/⚠️ | |
| DRY (duplicação, reúso do § 3.1) | ✅/⚠️ | |
| KISS (complexidade) | ✅/⚠️ | |
| YAGNI (especulação, § 3.2 respeitado) | ✅/⚠️ | |
| Law of Demeter / acoplamento | ✅/⚠️ | |
| Naming + consistência com o codebase | ✅/⚠️ | |
| Nível vs. referência #1 (big pop tech apps) | ✅/⚠️ | |

Nenhuma linha pode ficar em branco — princípio sem veredicto = princípio não revisado.

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
- Veredicto ❌ → voltar ao 7b → rodar Step 8 inteiro novamente
- Sem o .md criado = step NÃO completo

## Gateway 8 → 9

- [ ] Veredicto **APROVADO** em 8b
- [ ] Zero issues pendentes (balde A)
- [ ] **`## Análise de Qualidade` preenchida por princípio** (SRP · DRY · KISS · YAGNI · LoD · naming · nível #1) — nenhuma linha em branco
- [ ] **Princípios declarados** na linha do Gateway Check
- [ ] Achados fora de escopo classificados no ledger (B ou C) — seção `## Follow-ups Emitidos` preenchida
- [ ] PR existente atualizado (se houver)
- [ ] Artefato `kanban/08-code-review/<tópico>.md` existe com conteúdo substantivo
- [ ] **Follow-ups detectados neste step:** N (registrados no ledger) / nenhum
