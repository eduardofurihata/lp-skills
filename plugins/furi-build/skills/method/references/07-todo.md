# Step 7 — To Do

**Cada task = uma unidade resolvível em um prompt — e o artefato é a superfície viva da feature até o Done:** é o que permite parar e retomar de onde parou. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Invocar o `/solve` via Skill tool
- [ ] Quebrar o trabalho em tasks atômicas — a que tem "e depois" são duas — na linguagem do que muda, não do como interno
- [ ] Rastrear cada task a um UC (Step 3) ou TC (Step 6) — task sem origem não entra
- [ ] Trocar por reúso ("estender X") a task que recria o que já existe — a checagem é grep, não memória
- [ ] Declarar em cada task o motor que ela constrói, estende ou absorve; com UI, o nível atômico e o componente do DS
- [ ] Anotar o perímetro que cada task vai abrir — é o que o 8a usa para planejar a elevação
- [ ] Mapear as dependências e a ordem de execução
- [ ] Semear `## Test Cases (QA)` com um `- [ ] TC-N: <nome>` por TC do Step 6, todos abertos
- [ ] Escrever `track/07-todo/<tópico>.md` — nome por domínio; doc que já cobre o domínio se atualiza, não se duplica (`00-start.md`) — uma linha por task: `- [ ] <o que muda> · motor: <X> (nasce/estende/absorve) · UC-N/TC-N · arquivos: <lista>`
- [ ] Publicar o Gateway Check 7 → 8 com as linhas obrigatórias (`SKILL.md` § Gateway Check)

`## Test Cases (QA)` é o rastreador do Step 10: PASSED vira `- [x] TC-N — ✅ (path do screenshot)`, FAILED fica `- [ ]` com `❌ motivo`, e qualquer fix de código reseta todos. No Step 11 ele é copiado para o done antes de o to-do sumir. Parou? Os `- [ ]` restantes são o que falta rodar.
