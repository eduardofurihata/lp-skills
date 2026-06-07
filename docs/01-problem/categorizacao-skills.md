# Categorização de Skills (Pessoal / Eduzz)

## Problema
As skills do Claude Code do Furihata estão fragmentadas em dois repositórios sem separação entre uso pessoal e uso de trabalho (Eduzz), impedindo um catálogo único e organizado.

## Contexto
Hoje as skills "pessoais" (chat, commit, method, fast…) vivem no repo público `lp-skills` (com site Next.js + instalação via symlink/auto-sync), enquanto as skills de trabalho (afl, jira, notion-pull, notion-push) vivem no repo privado `labzz-skillzz` (marketplace nativa + frontend próprio). São dois sites, dois mecanismos de distribuição e nenhuma forma de ver/filtrar "o que é pessoal" vs "o que é Eduzz". O produto AFL já é público (agentsforlife.org), então o conteúdo de trabalho pode ser centralizado no repo público — desde que organizado em buckets e com uma sanitização leve (remover a credencial de teste exibida, generalizar o project key `AV-` no `/jira` e concentrar a especificidade `AV-*` no `/afl`, limpar paths internos do `notion-*`).

## Afetados
- **Autor (Furihata)** — quer um catálogo único, sem manter dois repos/sites; quer enxergar e instalar skills separadas por contexto (pessoal vs Eduzz).
- **Devs usuários do site** — querem filtrar o catálogo por categoria e instalar só o que faz sentido pro seu contexto.
- **Colegas da Eduzz (potencial)** — querem achar as skills de trabalho (jira/afl/notion) no mesmo lugar, marcadas como "Eduzz".
