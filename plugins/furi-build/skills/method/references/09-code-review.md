# Step 9 — Code Review Crítico

**Chame e use:** `/solve` · `/principles` · `/front` (se tem UI) — os três via Skill tool · `11-follow-ups.md`

**A lente deste step é o próprio step:** o loop 8a revisa princípio a princípio e por nome, e o relatório 8b registra um veredicto por princípio. Motor (a capacidade vazou? há segunda fonte da mesma regra?) e saldo do perímetro são linhas do checklist, não observações.

## 9a — Revisão em Loop

```
REPETIR até 100% limpo:
  1. git status + git diff (e --cached) — TODAS as mudanças desta feature, ainda não commitadas
  2. Reler plano (8a) — código implementa tudo?
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
     - **Princípios, UM A UM e POR NOME:** a tabela do `/principles` é o checklist — para cada linha, a *falha típica* aconteceu aqui? Os cinco do SOLID inclusive. E o plano foi cumprido — § 3.1 (reúso), § 3.2 (nada furado sem registro), § 3.3 (motores)?
     - **Design, UM A UM e POR NOME** (só com superfície visual): a tabela do `/front`, mesma mecânica; § 3.4 do plano cumprido?
     - **Nível referência #1** (`/solve`): está no calibre dos big pop tech apps / líderes do domínio, não só "funciona"?
  6. Problema encontrado → triagem A/B/C (`11-follow-ups.md`):
     - **A** → corrigir IMEDIATAMENTE → voltar ao 1
     - **B** / **C** → registrar no ledger (`## Follow-ups` do card de to-do); B vira ciclo /method no Gate de Convergência
  7. PR existente → atualizar comentários/descrição
  8. Loop até ZERO issues de balde A — NÃO aceitar "bom o suficiente"
```

O Step 9 é o maior detector de follow-up do protocolo. **Nada do que aparecer aqui pode ficar só na cabeça ou só no relatório:** ou é corrigido agora (A), ou está `ABERTO` no ledger (B), ou está `DESCARTADO` com justificativa (C).

## 9b — Relatório

**Organizar** `kanban/09-code-review/` → criar/atualizar `<tópico>.md`:

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

## Análise de Qualidade (por princípio — `/principles`)
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

## Análise de Design (por princípio — `/front`) — só com superfície visual

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
- Veredicto ❌ → voltar ao 8b → rodar o Step 9 inteiro novamente
- Sem o .md criado = step NÃO completo

## PARE se pensar

- **"O review já viu isso no geral, não preciso ir princípio a princípio."** A `## Análise de Qualidade` tem uma linha por princípio; linha em branco = princípio não revisado. BLOQUEADO.

## Gateway 9 → 10

- [ ] Veredicto **APROVADO** em 9b; zero issues pendentes (balde A)
- [ ] `## Análise de Qualidade` preenchida **por princípio** (os cinco do SOLID inclusive) — nenhuma linha em branco
- [ ] **Se tem UI:** `## Análise de Design` preenchida por princípio — nenhuma linha em branco
- [ ] **Saldo do perímetro conferido** — cada arquivo subiu, ou está declarado como já no nível #1
- [ ] Achados fora de escopo classificados no ledger (A/B/C) e `## Follow-ups Emitidos` preenchida
- [ ] PR existente atualizado (se houver)
- [ ] Artefato `kanban/09-code-review/<tópico>.md` existe com conteúdo substantivo
- [ ] As **quatro linhas obrigatórias** publicadas (`SKILL.md` § Gateway Check)
