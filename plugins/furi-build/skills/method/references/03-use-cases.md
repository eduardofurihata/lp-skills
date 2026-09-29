# Step 3 — Use Cases

**Para cada story do Step 2, os Use Cases que cobrem TODAS as possibilidades** — completude é obrigatória. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Invocar o `/solve` via Skill tool
- [ ] Enumerar, por story, todos os atores — não só o principal
- [ ] Enumerar o happy path
- [ ] Enumerar os fluxos alternativos
- [ ] Enumerar os fluxos de erro: validação, rede, timeout, permissão, estado inválido, concorrência
- [ ] Enumerar as transições de estado: vazio, parcial, completo, expirado, bloqueado
- [ ] Separar um UC por combinação de ator × fluxo × estado — nunca agrupar
- [ ] Escrever cada fluxo em passos de usuário — UC que cita função, tabela ou endpoint virou pseudo-implementação
- [ ] Listar, com UI, os estados de tela de cada UC: vazio · carregando · erro · sucesso · limite — estado não listado não se desenha no Step 5 e vira bug no Step 10
- [ ] Montar a tabela única de assinaturas (o que entra → o que sai | UCs), sem duplicata — assinatura igual em UCs diferentes é uma regra com um dono só, o motor que o Step 4 nomeia
- [ ] Mapear cada passo do happy path a `arquivo:linha` ou 🔨 gap
- [ ] Escrever `docs/03-use-cases/<tópico>.md` — nome por domínio; doc que já cobre o domínio se atualiza, não se duplica (`00-start.md`) — com `## UC-N — <nome>` (Ator · Precondição · Fluxo · Resultado · Estados de tela), `## Assinaturas` e `## Verificação de Realidade`; todo UC rastreia a uma story
- [ ] Publicar o Gateway Check 3 → 4 com as linhas obrigatórias (`SKILL.md` § Gateway Check)

A duplicata a caçar é na tabela, nunca nos UCs: o mesmo fluxo com outro ator continua sendo dois.
