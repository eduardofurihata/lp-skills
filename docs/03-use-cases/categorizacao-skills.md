# Categorização de Skills (Pessoal / Eduzz) — Use Cases

## Leitura / modelo de dados

### UC-1 — Ler skill do bucket `personal`
- **Ator**: Sistema (leitor `lib/skills.ts`), no build/ISR
- **Precondição**: existe `skills/personal/<slug>/SKILL.md` com frontmatter válido
- **Fluxo**: varre `skills/personal/*` → parseia frontmatter → deriva `category: "personal"` do nome da pasta-pai
- **Resultado**: objeto `Skill` com `category: "personal"`

### UC-2 — Ler skill do bucket `eduzz`
- **Ator**: Sistema (leitor)
- **Precondição**: existe `skills/eduzz/<slug>/SKILL.md` válido
- **Fluxo**: varre `skills/eduzz/*` → parseia → deriva `category: "eduzz"`
- **Resultado**: objeto `Skill` com `category: "eduzz"`

### UC-3 — Skill sem `SKILL.md` dentro de um bucket
- **Ator**: Sistema (leitor)
- **Precondição**: existe pasta `skills/personal/<slug>/` sem `SKILL.md`
- **Fluxo**: tenta ler `SKILL.md` → falha
- **Resultado**: skill ignorada (retorna null e é filtrada), sem quebrar o build

### UC-4 — Diretório solto na raiz de `skills/` (fora de bucket)
- **Ator**: Sistema (leitor)
- **Precondição**: existe `skills/<algo>/` que não é `personal` nem `eduzz`
- **Fluxo**: leitor só percorre os buckets conhecidos (`personal`, `eduzz`); diretórios fora deles são ignorados
- **Resultado**: nada quebra; conteúdo fora dos buckets não aparece no catálogo

### UC-5 — Bucket vazio
- **Ator**: Sistema (leitor)
- **Precondição**: `skills/eduzz/` existe mas sem subpastas
- **Fluxo**: varredura retorna lista vazia para o bucket
- **Resultado**: catálogo mostra só o outro bucket; sem erro

### UC-6 — Colisão de slug entre buckets
- **Ator**: Autor
- **Precondição**: tentativa de ter `skills/personal/foo` e `skills/eduzz/foo`
- **Fluxo**: instalação cria symlink `~/.claude/skills/foo` — destino colide
- **Resultado**: regra documentada — slug é único global; hoje os conjuntos são disjuntos (sem colisão). Validação detecta duplicata.

## Exibição no site

### UC-7 — Card exibe categoria (Pessoal)
- **Ator**: Dev usuário
- **Precondição**: skill com `category: "personal"` renderizada
- **Fluxo**: card mostra badge/indicador "Pessoal"
- **Resultado**: usuário identifica o contexto da skill

### UC-8 — Card exibe categoria (Eduzz)
- **Ator**: Dev usuário
- **Precondição**: skill com `category: "eduzz"`
- **Fluxo**: card mostra badge "Eduzz"
- **Resultado**: usuário identifica skill de trabalho

### UC-9 — Filtrar por "Pessoal"
- **Ator**: Dev usuário
- **Precondição**: catálogo com as duas categorias
- **Fluxo**: seleciona filtro "Pessoal" → grid mostra só personal
- **Resultado**: só skills personal visíveis; contagem atualizada

### UC-10 — Filtrar por "Eduzz"
- **Ator**: Colega da Eduzz
- **Precondição**: idem
- **Fluxo**: seleciona "Eduzz" → grid mostra só eduzz
- **Resultado**: só skills eduzz visíveis

### UC-11 — Ver "Todas"
- **Ator**: Dev usuário
- **Precondição**: idem
- **Fluxo**: filtro "Todas" (default) → grid mostra ambas, agrupadas/marcadas por categoria
- **Resultado**: catálogo completo

### UC-12 — Filtro com seleção ativa preservada
- **Ator**: Dev usuário
- **Precondição**: usuário já marcou skills de ambos os buckets
- **Fluxo**: troca o filtro de categoria
- **Resultado**: seleção é preservada (filtro só afeta visibilidade, não a seleção); o prompt gerado inclui as selecionadas mesmo as ocultas pelo filtro

## Instalação

### UC-13 — Gerar prompt com path por categoria
- **Ator**: Dev usuário
- **Precondição**: 1 skill selecionada do bucket eduzz (ex.: `jira`)
- **Fluxo**: gera prompt; o source vira `~/.claude/lp-skills-source/skills/eduzz/jira`; destino do symlink continua `~/.claude/skills/jira`
- **Resultado**: prompt correto, destino plano (Claude Code carrega de `~/.claude/skills/<slug>`)

### UC-14 — Gerar prompt com skills de categorias diferentes juntas
- **Ator**: Dev usuário
- **Precondição**: seleção mista (ex.: `chat` personal + `jira` eduzz)
- **Fluxo**: cada skill referencia seu path com categoria correta
- **Resultado**: prompt instala ambas, cada uma do bucket certo

### UC-15 — Escopo (global / projeto / projeto-local) preservado
- **Ator**: Dev usuário
- **Precondição**: feature de escopo existente (auto-sync) continua funcionando
- **Fluxo**: troca de escopo + categorias coexistem; categoria afeta o source-path, escopo afeta o destino
- **Resultado**: as duas dimensões funcionam ortogonalmente

## Migração / Sanitização (Autor)

### UC-16 — Mover skills atuais para `personal`
- **Ator**: Autor
- **Precondição**: 10 skills hoje em `skills/*` (apf, ask, chat, chat-out, claude-modes, commit, fast, method, solve, todo)
- **Fluxo**: `git mv skills/<slug> skills/personal/<slug>`
- **Resultado**: histórico preservado; todas em `personal`

### UC-17 — Trazer skills do labzz para buckets corretos
- **Ator**: Autor
- **Precondição**: labzz tem afl, jira, make-dev, notion-pull, notion-push
- **Fluxo**: `make-dev`→`personal`; `afl`, `jira`, `notion-pull`, `notion-push`→`eduzz`
- **Resultado**: 5 skills consolidadas, distribuídas por contexto

### UC-18 — Sanitizar credencial do `/jira`
- **Ator**: Autor
- **Precondição**: `jira/SKILL.md` e `07-investigation.md` exibem `test2@test.com / Test123!@#`
- **Fluxo**: remover o par exibido; manter `can create users: yes` / "criar usuário do tipo correto"
- **Resultado**: nenhuma credencial em texto; capacidade preservada (Claude cria conta)

### UC-19 — Generalizar `AV-` no `/jira`
- **Ator**: Autor
- **Precondição**: 30 ocorrências de `AV-` em 5 arquivos do jira
- **Fluxo**: substituir exemplos `AV-36`/`AV-N` por `PROJ-123` genérico; `argument-hint` continua `[CARD-CODE]`
- **Resultado**: `/jira` cego ao project key específico

### UC-20 — Concentrar `AV-*` no `/afl`
- **Ator**: Autor
- **Precondição**: `/afl` é o overlay Eduzz que aciona o `/jira`
- **Fluxo**: adicionar seção "Contexto Eduzz" no `/afl` documentando o padrão `AV-*` (ex.: AV-36, multi-card AV-36-40-55)
- **Resultado**: especificidade Eduzz vive só no `/afl`; ele "considera o av-*" ao acionar o jira

### UC-21 — Sanitizar paths/nomes internos do `notion-*`
- **Ator**: Autor
- **Precondição**: `notion-pull` tem `/home/furihata/GitHub/labzz-pm-forge` e nomes de doc reais ("Reels — Product Doc", "Stories", "AI Features", slug `insta`)
- **Fluxo**: generalizar path → `<caminho-do-pm-forge>`; nomes de doc → exemplos genéricos; `localhost:9432` mantido
- **Resultado**: sem path/username/doc interno exposto

## Descontinuação do labzz (Autor)

### UC-22 — Apagar pasta local do labzz
- **Ator**: Autor
- **Precondição**: migração commitada e pushada, build verde
- **Fluxo**: remover `/home/furihata/GitHub/labzz-skillzz`
- **Resultado**: pasta local removida

### UC-23 — Apagar repo GitHub do labzz
- **Ator**: Autor
- **Precondição**: idem; ação irreversível confirmada pelo usuário
- **Fluxo**: `gh repo delete eduardofurihata/labzz-skillzz`
- **Resultado**: repo removido

### UC-24 — Apagar projeto Vercel do labzz
- **Ator**: Autor
- **Precondição**: idem; projeto `frontend` (prj_Y1xoh…)
- **Fluxo**: remover projeto Vercel
- **Resultado**: deploy do labzz removido; sem afetar `lp-skills` (prj_OIEX…)

### UC-25 — settings.json do usuário não referencia labzz
- **Ator**: Sistema/Autor
- **Precondição**: `enabledPlugins: {}`, sem `labzz-skillzz` em `extraKnownMarketplaces`
- **Fluxo**: verificação; nada a limpar
- **Resultado**: descontinuação não quebra o Claude Code do usuário
