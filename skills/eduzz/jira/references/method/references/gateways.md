# Gateways — Critérios Bloqueantes entre Steps

**Cada transição entre steps exige um Gateway Check explícito publicado no chat ANTES de iniciar o próximo step. Sem check visível = step não transitou.**

## Princípios (Ferro)

1. **Binário.** ✅ LIBERADO ou ❌ BLOQUEADO. Sem "quase", sem "mostly", sem "faço depois".
2. **Visível.** Publicado no chat ANTES de transitar. Gateway silencioso = não existe.
3. **Bloqueante.** ❌ → volta ao step atual e corrige. Nunca "pula pra arrumar depois".
4. **Atômico.** Não existe bypass granular. Pular 1 critério = pular o gateway. Ou 100% ou BLOQUEADO.
5. **Universal.** "Não se aplica nesta feature" não é opção. Justifique no veredicto ou cumpra.

> Racionalizações para pular Gateway → ver `rationalizations.md` categoria 1 e 3.

## Formato Padrão (publicar em chat)

```markdown
## Gateway Check — Step N → Step N+1
- [ ] Artefato existe? (docs/XX-foo/<tópico>.md criado/atualizado com conteúdo substantivo)
- [ ] Critério específico 1 do gateway (ver tabela)
- [ ] Critério específico 2
- [ ] Critério específico 3
- **Veredicto:** ✅ LIBERADO / ❌ BLOQUEADO — motivo: [listar critério falhado]
```

## Tabela de Critérios (TODOS obrigatórios por linha)

| Gateway | Critérios específicos |
|---------|----------------------|
| **Gate Check inicial** | docs/01-problem/, docs/02-user-stories/, docs/03-use-cases/, docs/04-spec/ contêm doc cobrindo esta feature. Exibir visualmente no chat antes de qualquer código. |
| **1 → 2** | Problema em **1 frase clara**; quem é afetado identificado |
| **2 → 3** | Stories cobrem todas as personas; formato "Como X, quero Y para Z" |
| **3 → 4** | Use Cases derivados (ator × fluxo × estado); tabela de assinaturas única (sem duplicata); seção `## Verificação de Realidade` com cada passo do happy path mapeado a arquivo:linha OU 🔨 gap |
| **4 → 5** | Autonomous Decision Loop fechou com **zero gaps**; cada decisão tem justificativa + referência (padrão do projeto > big app > boa prática); escopo de plataforma (web/android/ios) **derivado** aqui, não declarado |
| **5 → 6** | Nota de complexidade (1-10) publicada e derivada dos Steps 3-4; **nº de TCs == nota e ≤ 10** (diverge → BLOQUEADO); **os TCs contemplam 100% dos UCs (Step 3) + detalhes do Step 4** (somatório das linhas `Cobre`, nada descoberto); nenhum TC redundante (significância); cada TC com **Bug único** + observável no front; Android E iOS = execução no Step 9, não TCs extras |
| **6 → 7a** | Tasks atômicas (1 prompt cada); cada task rastreável; dependências mapeadas |
| **7a → 7b** | Plano autocontido (contexto + estratégia + mapa TC→código + checklist); i18n planejado se projeto tem i18n; referência de big apps citada para decisões UI/UX |
| **7b → 8** | Todas tasks do checklist marcadas; tsc/lint passam; "tocou = refatora" executado por arquivo aberto; TCs de regressão criados para features dependentes impactadas |
| **8 → 9** | Veredicto **APROVADO** em 8b; zero issues pendentes; PR existente atualizado (se houver) |
| **9 → 10** | Ver detalhado abaixo — TODOS TCs PASSED via front, evidência 1:1, último ciclo SEM mudanças de código |

## Gateway 9 → 10 (Detalhado — o mais crítico)

**Pré-requisitos formais (ambos obrigatórios, publicados no chat ANTES deste Gateway):**

1. **Audit Pré-Execução** ✅ publicado (ratio M==N de TaskCreate individual antes de qualquer TC rodar). Ver `09-testing.md` seção "Audit Pré-Execução".
2. **Audit Pós-Execução** ✅ publicado (ratio C==N de completed + E==N de evidência). Ver `09-testing.md` seção "Audit Pós-Execução".

**Sem os dois audits publicados no chat com ✅, este Gateway não pode ser publicado.** Publicá-lo sem eles = violação automática.

| Critério | Verificação obrigatória |
|----------|-------------------------|
| Audit Pré-Execução publicado ✅? | Bloco visível no chat com ratio M==N confirmado antes do primeiro TC |
| Audit Pós-Execução publicado ✅? | Bloco visível no chat com C==N, E==N, status agregado 100% PASSED |
| Cada TC tem TaskCreate próprio? | Duas camadas: 1 TaskCreate por grupo + 1 TaskCreate por TC individual. Ambos obrigatórios. |
| Todos TCs executados via front? | Cada TC tem screenshot com path documentado em `kanban/09-run-test/` |
| Evidence count = TC count? | Reconciliação: Predicted N = Evidence M. Delta = 0 obrigatório |
| Zero NOT_RUN / SKIPPED / BLOCKED? | Nenhum TC sem status de execução real |
| Zero FAILED? | TODOS os TCs em PASSED |
| Zero mudanças no último ciclo? | Último passe = 100% PASSED SEM nenhum fix de código |
| Mobile: iOS + Android cobertos? | Toda feature mobile com evidência nas DUAS plataformas |

```markdown
## Gateway Check — Step 9 → Step 10
- Audit Pré-Execução publicado? ✅ SIM (link/referência ao bloco) / ❌ NÃO
- Audit Pós-Execução publicado? ✅ SIM (link/referência ao bloco) / ❌ NÃO
- TCs planejados: N
- Tasks de grupo criadas: G (✅ todos TCs cobertos por algum grupo)
- Tasks individuais criadas (1 por TC): N (✅ ratio 1:1)
- TCs executados com evidência: N (✅ delta = 0)
- Status: N PASSED, 0 FAILED, 0 NOT_RUN, 0 SKIPPED, 0 BLOCKED
- Último ciclo sem mudanças de código? ✅ SIM
- Mobile iOS + Android? ✅ SIM / N/A (escopo derivado do Step 4 confirma feature sem superfície mobile)
- **Veredicto: ✅ LIBERADO para Step 10** / ❌ BLOQUEADO — motivo: [listar]
```

**Racionalizações proibidas para pular os audits:**

| Racionalização | Realidade |
|----------------|-----------|
| "Gateway já cobre tudo, audit é redundante" | NÃO. Audit = verificação intermediária obrigatória (antes e depois). Gateway = certificação final. BLOQUEADO sem audits. |
| "Faço o Gateway direto, os dois audits ficam implícitos" | NÃO. Audit implícito = audit inexistente. Cada um publicado visualmente. BLOQUEADO. |
| "Publico um audit só (combinado)" | NÃO. Dois audits distintos (antes + depois). BLOQUEADO. |

## Exceções (NÃO requer Gate Check inicial)

Apenas estes casos dispensam Gate Check. **Qualquer dúvida → Gate Check.**

- Bug fix trivial com escopo único-linha (typo visível, correção de literal exibida a usuário). Se envolve lógica, estado, condicional — NÃO é trivial.
- Refactor interno sem mudança de comportamento observável (rename, extract function sem alteração de output).
- Ajuste de configuração/infra (CI, env vars) que não toca código de produto.
- Pergunta sobre código sem alteração.

**NÃO são exceções:**
- "Demo" / "prova de conceito" / "só pra testar"
- "Feature trivial" / "é só plugar" / "1 botão"
- "Emergência" / "CEO pediu" / "prazo apertado"
- "Retrofit de código já escrito"
- "Componente já existe em outras telas"

Em dúvida: Gate Check. Custo é baixo, regressão é cara.

## Step 10 é terminal (sem gateway de saída)

Não existe Step 11. O Step 10 (Done) não tem gateway de saída — seu encerramento usa o **Checklist Final** de `10-done.md`: card movido (`kanban/06-todo/` deletado) + **commit** na branch atual com SHA registrado. Esse commit vale **só para o `/method` completo** (`/fast` e `/todo` não commitam).
