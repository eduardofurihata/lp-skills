# Step 7 — To Do

**Cada task = uma unidade resolvível em um prompt — e o artefato é a superfície viva da feature até o Done.** Carrega as tasks e o checklist de QA; é o que permite parar e retomar de onde parou.

**Chame e use:** `/solve` via Skill tool

## Artefato

`obra/07-todo/<tópico>.md` — nome por domínio; doc que já cobre o domínio se **atualiza**, não se duplica (`00-start.md`). Toda task rastreia a um UC (Step 3) ou TC (Step 6); task sem origem não entra.

```markdown
# <Tópico> — To Do

- [ ] <task — o que muda> · motor: <X> (nasce / estende / absorve) · UC-N / TC-N · arquivos: <lista>

## Test Cases (QA)
- [ ] TC-1: <nome>
```

## Regras

- Tasks atômicas (1 prompt por task) — a que tem "e depois" são duas; descrição na linguagem do **que muda**, não do como interno.
- Task que recria o que já existe vira task de **reúso** ("estender X") — a checagem é grep, não memória.
- Cada task declara **qual motor** constrói, estende ou absorve — nenhuma espalha a mesma regra por N telas. **Se tem UI:** declara o nível atômico e o componente do DS que constrói, estende ou promove.
- O **perímetro** que a task vai abrir já entra anotado — é o que o 8a usa para planejar a elevação.
- Dependências mapeadas, ordem de execução óbvia.

## Checklist de QA — testado ou não

A seção `## Test Cases (QA)` é o rastreador vivo do Step 10:

- **Agora:** um `- [ ]` por TC de `docs/06-test-cases/<tópico>.md`, todos abertos.
- **No Step 10:** TC que PASSA via front vira `- [x] TC-N — ✅ (path do screenshot)`; FAILED continua `- [ ]` com `❌ motivo`. **Qualquer fix de código reseta todos para `- [ ]`** — o ciclo retesta tudo.
- **No Step 11:** o checklist final (tudo `- [x]`) é copiado para `obra/11-done/<tópico>.md` ANTES de apagar o to-do — o to-do some, o status sobrevive.

> Parou e vai retomar? Os `- [ ]` restantes são exatamente o que falta rodar.

## Gateway 7 → 8

- [ ] Tasks atômicas, rastreáveis a UC/TC, com dependências e ordem; recriar o existente virou **reúso**
- [ ] Cada task declara **qual motor** (e, com UI, o nível atômico e o componente do DS)
- [ ] `## Test Cases (QA)` semeada — 1 `- [ ]` por TC do Step 6
- [ ] Artefato `obra/07-todo/<tópico>.md` existe com conteúdo substantivo
- [ ] Follow-up que apareceu aqui, resolvido aqui — nada se caça
- [ ] As **quatro linhas obrigatórias** publicadas (`SKILL.md` § Gateway Check)
