# Step 8 — Code Review Crítico

**Chame e use:** `/solve` (Skill tool) · `principios.md` § Lente por step · `design.md` § Lente por step (se tem UI) · `follow-ups.md`

## 8a — Revisão em Loop

```
REPETIR até 100% limpo:
  1. git status + git diff (e --cached) — TODAS as mudanças desta feature, ainda não commitadas
  2. Reler plano (7a) — código implementa tudo?
  3. Reler TCs (5) — todos cenários cobertos?
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
     - **Saldo do perímetro (§ 3.5 do plano):** todo arquivo que este trabalho abriu, leu ou atravessou saiu melhor do que entrou — ou está declarado como já no nível #1?
     - **Princípios, UM A UM e POR NOME:** a tabela de `principios.md` é o checklist — para cada linha, a *falha típica* aconteceu aqui? Os cinco do SOLID inclusive. E o plano foi cumprido — § 3.1 (reúso), § 3.2 (nada furado sem registro), § 3.3 (motores)?
     - **Design, UM A UM e POR NOME** (só com superfície visual): a tabela de `design.md`, mesma mecânica; § 3.4 do plano cumprido?
     - **Nível referência #1** (`/solve`): está no calibre dos big pop tech apps / líderes do domínio, não só "funciona"?
  6. Problema encontrado → triagem A/B/C (`follow-ups.md`):
     - **A** → corrigir IMEDIATAMENTE → voltar ao 1
     - **B** / **C** → registrar no ledger (`## Follow-ups` do card de to-do); B vira ciclo /method no Gate de Convergência
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
| Nível vs. referência #1 (big pop tech apps) | ✅/⚠️ | |

Nenhuma linha pode ficar em branco — princípio sem veredicto = princípio não revisado.

## Análise de Design (por princípio — `design.md`) — só com superfície visual

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

Feature sem superfície visual: escreva `N/A — sem superfície visual (derivado do Step 4a)` **uma vez**, no lugar da tabela.

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

Critérios e formato: `gateways.md` — as quatro linhas obrigatórias do Gateway Check inclusive.
