---
name: repro
description: 'Use ONLY when the user explicitly invokes /repro (bare /repro = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:repro` via the Skill tool. NEVER activate on your own initiative. — reproduces the report on the front as the user, judged ≥ 90; the dev sees the bug and the fix BEFORE the commit.'
requires: [infra, pwx]
argument-hint: "[KEY-N | descrição] [/skill…] | (vazio = card ativo)"
---

# /repro — reproduzir, julgar, mostrar

Reproduz o bug no front como o usuário, antes de codar; o dev o vê com o bug (parada 1) e sem (parada 2). Não coda. Com outras skills no argumento: entenda o que cada uma pede e execute tudo combinado, numa passada só — nunca uma antes ou depois da outra; quem codar deve a parada 2. Sem card: o mesmo processo, sem Jira e sem criar card. **Os `- [ ]` são o checklist do run, em `.claude/ship/run.md`:** escreva cada um, marque `- [x]` ao fechar, retome do primeiro aberto; um arquivo por run (mesmo encadeando skills), quem o criou apaga ao fim.

- [ ] Ler `.claude/ship/setup.md § Repro` (formato abaixo): board, onde reproduzir, conta base, se pode criar contas, acesso de leitura; falta → pergunte só o que faltar e grave ali
- [ ] Ler `.claude/ship/infra.md`: URL e como subir o ambiente do § Repro; falta → `Skill(skill: "infra")`
- [ ] Ler o card e anexos (no board do § Repro), ou a descrição; mover o card ao status de `/work`
- [ ] Entender o problema: quem, onde, o que faz, vê e esperava, causa; ambiguidade → pergunte
- [ ] Julgar o entendimento num subagente limpo (relato verbatim + entendimento → 0–100); ≥ 90 avança, senão de novo, sem limite
- [ ] Abrir o navegador: `Skill(skill: "pwx")` — todo passo no front, aqui e na parada 2, é por ele
- [ ] Montar o cenário: o dado real do relato pelo acesso de leitura do § Repro, se houver; a conta pelas regras de contas abaixo
- [ ] Reproduzir no front como usuário, pelo pwx: cenário exato, evidência por passo; não reproduziu → outro caminho, em loop até reproduzir — "não consegui" não existe; registrar ambiente, conta (papel, nunca a senha), dados, passos, trigger
- [ ] Julgar a reprodução noutro subagente (relato + registro + evidência → 0–100); ≥ 90 avança, senão de novo
- [ ] Parar um passo antes do trigger e mostrar: "👉 Clique em: [elemento exato]", o que vai acontecer, a evidência; esperar o dev
- [ ] Devolver a descrição oficial: superfície · ambiente · conta e dados · partida → passos → trigger · atual × esperado · evidência · causa

Parada 2, de quem fecha o commit, antes dele: reproduzir pelo pwx, mesmo ambiente, trigger disparado: o bug não aparece, com evidência; apareceu → sem commit; parada 1 de novo, `## ✅ Human check`; pare até o dev confirmar.

**§ Repro** no `setup.md` — só identificadores e caminhos, nunca senha ou token:

```
## Repro
- Board: <projeto ou board do Jira> (ou: o do § Card · sem Jira: nenhum)
- Ambiente: local | homolog | prod
- Conta base: <papel> · `.secrets/test-accounts.md` (ou: nenhuma)
- Criar contas de teste: sim, em <ambiente> | não
- Acesso de leitura: <skill, CLI ou MCP — ex. `Skill(skill: "X")`> · <ambiente> · <o que lê> (ou: nenhum)
```

**Contas de teste são do projeto, não da task.** Ficam em `.secrets/test-accounts.md` (ambiente · papel · login · senha · para quê · criada em), com `.secrets/` no `.gitignore`. Antes de criar, procure ali uma que sirva e reutilize; crie só quando nenhuma serve e o § Repro permite, e registre a nova no arquivo, para o próximo run não criar outra. Credencial colada no chat também vai para lá.

**Dados reais, só leitura.** O acesso do § Repro serve para achar o usuário e o dado do relato e montar o cenário igual ao dele — ver o bug, não mexer nos dados de quem o relatou. Só consulta (SELECT, GET, logs); nenhum INSERT/UPDATE/DELETE, migration, job, e-mail ou ação em nome de usuário real. Em prod, nada que mude estado — nem pelo front com a conta de alguém. O passo exige escrever → pare e pergunte antes.
