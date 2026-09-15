# Step 7 — To Do

**Cada task = uma unidade resolvível em um prompt — e o card é a superfície viva da feature até o Done.** Ele carrega as tasks e o checklist de QA (o ledger de follow-ups tem arquivo próprio, § abaixo): é o que permite parar e retomar de onde parou.

**Chame e use:** `/solve` · `/principles` · `/front` (se tem UI) — os três via Skill tool · `11-follow-ups.md`

## Artefato

`kanban/07-todo/<tópico>.md` — nome por domínio; doc que já cobre o domínio se **atualiza**, não se duplica (`00-start.md`). Toda task rastreia a um UC (Step 3) ou TC (Step 6); task sem origem não entra.

```markdown
# <Tópico> — To Do

- [ ] <task — o que muda> · motor: <X> (nasce / estende / absorve) · UC-N / TC-N · arquivos: <lista>

## Test Cases (QA)
- [ ] TC-1: <nome>
- [ ] TC-2: <nome>
```

## Regras

- Tasks atômicas (1 prompt por task) — a que tem "e depois" são duas
- Descrição na linguagem do **que muda**, não do como interno
- Cada task rastreável (arquivos/módulos afetados identificáveis)
- Task que recria o que já existe vira task de **reúso** ("estender X") — a checagem é grep, não memória
- Cada task declara **qual motor** constrói, estende ou absorve; nenhuma espalha a mesma regra por N telas
- **Se tem UI:** task de UI declara o **nível atômico** (átomo/molécula/organismo) e o componente do DS que constrói, estende ou promove
- O **perímetro** que a task vai abrir já entra anotado — é o que o 8a usa para planejar a elevação
- Dependências entre tasks mapeadas
- Ordem de execução óbvia

## Checklist de QA (status: testado ou não)

A seção `## Test Cases (QA)` do card é o rastreador de "já testei ou não" — a superfície VIVA atualizada ao longo do Step 10:

- **Semeie agora (Step 7):** um `- [ ]` por TC de `docs/06-test-cases/<tópico>.md`, todos abertos (nada rodou ainda).
- **No Step 10:** cada TC que PASSAR via front vira `- [x] TC-N: <nome> — ✅ (path do screenshot)`. FAILED continua `- [ ]` com nota `❌ motivo`. **Qualquer fix de código RESETA todos para `- [ ]`** (o ciclo retesta tudo).
- **No Step 12 (Done):** o checklist final (tudo `- [x]`) é **copiado para `kanban/12-done/<tópico>.md`** ANTES de apagar o card — registro permanente do que foi testado. O card some, o status sobrevive no done.

> Parou e vai retomar depois? Abra o checklist: os `- [ ]` restantes são exatamente o que falta rodar.

## Ledger de Follow-ups (semear agora)

O ledger — `kanban/11-follow-ups/<tópico>.md` — é onde todo achado fora do escopo documentado é registrado e classificado, do Step 1 ao Step 10. É o que permite o protocolo fechar **seco** (Regra Inviolável 7) no Step 11.

**Semeie agora (Step 7):** crie o arquivo com o cabeçalho da tabela e **transcreva o que já apareceu nos Steps 1-6** (as linhas "Follow-ups detectados neste step" dos Gateway Checks). Nada apareceu → arquivo criado e tabela vazia. Formato, baldes, status e dedup: `11-follow-ups.md`.

## Gateway 7 → 8

- [ ] Tasks atômicas (1 prompt cada), rastreáveis, com dependências mapeadas e ordem de execução óbvia
- [ ] Toda task rastreia a um UC/TC (YAGNI); task que recria o existente virou task de **reúso** (DRY)
- [ ] Cada task declara **qual motor** constrói, estende ou absorve — nenhuma espalha a mesma regra por N telas
- [ ] **Se tem UI:** task de UI declara o **nível atômico** e o componente do DS que constrói, estende ou promove
- [ ] Seção `## Test Cases (QA)` semeada — 1 `- [ ]` por TC do Step 6
- [ ] Ledger semeado em `kanban/11-follow-ups/<tópico>.md` (com o que apareceu nos Steps 1-6, ou vazio)
- [ ] Artefato `kanban/07-todo/<tópico>.md` existe com conteúdo substantivo
- [ ] As **quatro linhas obrigatórias** publicadas (`SKILL.md` § Gateway Check)
