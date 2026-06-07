# Categorização de Skills (Pessoal / Eduzz) — Test Cases

> **Complexidade: 8/10 → 8 TCs.** Derivada dos Steps 3-4: 25 UCs; modelo de dados + leitor 2 níveis; UI de filtro + badges; gerador de install por categoria; migração + sanitização de segurança + higiene de histórico git; descontinuação irreversível. Web-only, sem auth/roles/concorrência. TCs densos: cada um atravessa vários UCs.

> **Eixos de verificação:** TC-1..TC-5 via **front** (site rodando, Playwright). TC-6..TC-8 via **inspeção de repo** (grep/build/git) — são o "front" da camada de conteúdo/migração.

---

### TC-1: Leitor varre 2 níveis e deriva categoria, resiliente a lixo
- **Cobre**: UC-1, UC-2, UC-3, UC-4, UC-5, D1, D3
- **Bug único**: o leitor não deriva `category` da pasta-pai (ou lê bucket errado), ou quebra o build quando há `SKILL.md` ausente / diretório fora de bucket / bucket vazio.
- **Pré-condição**: estrutura `skills/personal/*` e `skills/eduzz/*` populada; injetar 1 pasta sem `SKILL.md` (ex.: `skills/personal/_tmp/`) e confirmar bucket `eduzz` não vazio.
- **Passos**:
  1. `next build` (ou `dev`) e abrir a home.
  2. Conferir que toda skill renderiza e cada uma tem categoria.
  3. Confirmar que a pasta sem `SKILL.md` não aparece e não derrubou o build.
- **Resultado**: home lista 11 personal + 4 eduzz = 15 skills; nenhuma com categoria errada; build verde mesmo com pasta inválida.
- **Prova**: screenshot da home + saída do build.

### TC-2: Badge de categoria correto na visão "Todas"
- **Cobre**: UC-7, UC-8, UC-11, D6, D17
- **Bug único**: card exibe badge de categoria ausente ou trocado (personal aparece como eduzz ou sem badge).
- **Pré-condição**: home no filtro default "Todas".
- **Passos**:
  1. Localizar o card `/chat` → deve ter badge "Pessoal".
  2. Localizar o card `/jira` → deve ter badge "Eduzz" (variante de destaque).
  3. Conferir Hero/copy menciona pessoais e de trabalho.
- **Resultado**: badges corretos por skill; Eduzz visualmente distinto; copy atualizada.
- **Prova**: screenshot dos dois cards.

### TC-3: Filtro Todas/Pessoal/Eduzz com contagem
- **Cobre**: UC-9, UC-10, UC-11, D5, D19
- **Bug único**: clicar numa tab de categoria não filtra o grid, ou a contagem por tab está errada.
- **Pré-condição**: home carregada.
- **Passos**:
  1. Clicar tab "Eduzz" → grid mostra só jira, afl, notion-pull, notion-push.
  2. Clicar tab "Pessoal" → grid mostra só as 11 personal (inclui make-dev).
  3. Clicar "Todas" → grid mostra as 15; contagens batem em cada tab.
- **Resultado**: filtro reflete a categoria; contagens corretas (Pessoal 11, Eduzz 4, Todas 15).
- **Prova**: screenshot de cada estado de filtro.

### TC-4: Filtro preserva seleção e o prompt inclui as ocultas
- **Cobre**: UC-12, D7, D18
- **Bug único**: trocar o filtro limpa a seleção, ou o prompt gerado perde skills selecionadas que o filtro ocultou.
- **Pré-condição**: filtro "Todas".
- **Passos**:
  1. Selecionar `/chat` (personal) e `/jira` (eduzz).
  2. Trocar filtro para "Pessoal" (o card `/jira` some da view).
  3. Abrir o prompt de instalação.
- **Resultado**: a barra ainda conta 2 selecionadas; o prompt inclui `chat` E `jira` (a oculta permanece). Se filtrar até zerar, empty state adequado.
- **Prova**: screenshot da seleção preservada + prompt com as duas skills.

### TC-5: Install prompt com path por categoria, destino plano, escopos
- **Cobre**: UC-13, UC-14, UC-15, D8, D9
- **Bug único**: o source-path não inclui o bucket (ou inclui o bucket errado), ou o destino do symlink ganha a categoria indevidamente.
- **Pré-condição**: nenhuma.
- **Passos**:
  1. Selecionar só `/jira` (eduzz), escopo Global → inspecionar prompt.
  2. Selecionar `/chat` + `/jira` (mista) → inspecionar prompt.
  3. Trocar escopo para "Projeto" → inspecionar prompt.
- **Resultado**: source `…/skills/eduzz/jira` e `…/skills/personal/chat`; destino sempre `~/.claude/skills/<slug>` (sem categoria); escopo e categoria coexistem.
- **Prova**: screenshot do prompt nos 3 cenários.

### TC-6: Sanitização do /jira — credencial removida e AV- generalizado
- **Cobre**: UC-18, UC-19, D13, D14
- **Bug único**: a credencial `test2@test.com / Test123!@#` permanece em algum arquivo, ou sobra `AV-` no `/jira` (acoplamento ao Eduzz no genérico).
- **Pré-condição**: skills migradas para `skills/eduzz/jira`.
- **Passos**:
  1. `grep -rn "test2@test\|Test123" skills/eduzz/jira` → zero ocorrências.
  2. `grep -rnE "AV-[0-9]" skills/eduzz/jira` → zero ocorrências.
  3. Confirmar `can create users: yes` presente e `argument-hint: "[CARD-CODE]"`.
- **Resultado**: sem credencial, sem `AV-` no jira, capacidade de criar usuário preservada.
- **Prova**: saída dos greps.

### TC-7: afl carrega AV-* e notion sanitizado
- **Cobre**: UC-20, UC-21, D15, D16
- **Bug único**: o padrão `AV-*` não foi concentrado no `/afl`, ou o path interno/nomes de doc permanecem no `notion-*`.
- **Pré-condição**: skills migradas para `skills/eduzz/`.
- **Passos**:
  1. `grep -n "AV-\*\|Contexto Eduzz" skills/eduzz/afl/SKILL.md` → presente.
  2. `grep -rn "/home/furihata/GitHub/labzz-pm-forge\|Reels — Product Doc\|AI Features" skills/eduzz/notion-pull` → zero.
  3. Confirmar `localhost:9432` mantido no notion.
- **Resultado**: `/afl` documenta `AV-*`; notion sem path/username/doc interno; endpoint local genérico mantido.
- **Prova**: saída dos greps.

### TC-8: Migração íntegra, slug único e descontinuação segura
- **Cobre**: UC-6, UC-16, UC-17, UC-22, UC-23, UC-24, UC-25, D10, D11, D12, D21
- **Bug único**: skill some/duplica na migração, slug colide entre buckets, ou o labzz é apagado antes do push/build verde (perda).
- **Pré-condição**: migração feita; commit/push pendente para a fase de descontinuação.
- **Passos**:
  1. Contar: 11 dirs em `skills/personal/` (10 + make-dev) e 4 em `skills/eduzz/`; nenhum slug repetido entre buckets.
  2. `next build` verde + `git status` limpo após commit.
  3. **Gate de descontinuação** (Step 10, pós-push): `gh repo view eduardofurihata/labzz-skillzz` falha (removido); projeto Vercel `frontend` removido; `ls labzz-skillzz` falha; `grep labzz ~/.claude/settings.json` → nada (UC-25).
- **Resultado**: nenhuma skill perdida; sem colisão; labzz removido **somente após** push + build verde; Claude Code do usuário intacto.
- **Prova**: contagens + build + (closeout) saídas de `gh`/`vercel`/`ls` confirmando remoção.

---

## Cobertura (auditoria)

| UC | TC | | UC | TC |
|----|----|----|----|----|
| UC-1..5 | TC-1 | | UC-13..15 | TC-5 |
| UC-6 | TC-8 | | UC-16,17 | TC-8 |
| UC-7,8 | TC-2 | | UC-18,19 | TC-6 |
| UC-9,10 | TC-3 | | UC-20,21 | TC-7 |
| UC-11 | TC-2,3 | | UC-22,23,24,25 | TC-8 |
| UC-12 | TC-4 | | | |

Todos os 25 UCs cobertos; decisões D1-D21 mapeadas. Nenhum TC redundante (cada um puxa cobertura distinta: dados / badges / filtro / seleção / install / sanitização-jira / sanitização-afl+notion / migração+descontinuação).

## TCs de Regressão (raio de impacto do Step 7b)

Arquivos alterados e features dependentes:

- **`lib/install-prompt.ts`** (assinatura `string[]`→`InstallSkill[]`, source-path com bucket) → impacta a feature **auto-sync/instalação** (`lp-skills-auto-sync`). **Coberto por TC-5** (path por categoria, destino plano, escopos) — nenhum TC novo necessário, é o mesmo cenário.
- **`lib/skills.ts`** (shape `Skill` ganha `category`, varredura 2 níveis) → impacta `page.tsx`/grid. **Coberto por TC-1/TC-2/TC-3**.
- **`components/ui/badge.tsx`** (variante `none` adicionada) → mudança **retrocompatível**: variantes `default`/`accent`/`outline` inalteradas; badge de effort (`variant="accent"`) sem mudança de comportamento. Sem regressão a cobrir.
- **`StickyInstallBar`/`InstallPromptViewer`/`SkillsClient`** (prop `selectedSlugs`→`selectedSkills`) → consumidores internos da mesma feature; **cobertos por TC-4/TC-5**.

Conclusão: o raio de impacto cai dentro dos TC-1..TC-5 já especificados. Nenhuma outra feature exige TC novo.

## Gateway 5 → 6 ✅
- [x] Nota de complexidade publicada (8/10), derivada dos Steps 3-4
- [x] Nº de TCs == nota (8) e ≤ 10
- [x] TCs contemplam 100% dos UCs + detalhes do Spec (tabela de cobertura)
- [x] Nenhum TC redundante (filtro de significância)
- [x] Cada TC com bug único + resultado observável
- [x] Artefato substantivo
