# Inventário de Docs — Protocolo Obrigatório

**Rodar UMA VEZ no início, antes de qualquer step.** Economiza tokens (evita re-scan por step) e garante decisões consistentes de criar/editar/mesclar/excluir.

## Passos

```
1. LISTAR TUDO — Glob docs/**/*.md (todas as pastas de uma vez)
2. LER — Read o CONTEÚDO de CADA arquivo existente (não só o nome)
   - Muitos arquivos: leia pelo menos título + H2s + primeira frase de cada seção
3. MONTAR MAPA MENTAL — Para cada arquivo: tópico/domínio, features documentadas
4. ANOTAR — Quais arquivos existentes se relacionam com a feature atual?
   - Mesma área? Mesmo fluxo? Mesma tela? Mesmo domínio?
```

## Regras de Organização

- **Ler = ler o CONTEÚDO, não apenas o nome do arquivo.** Glob retorna nomes; nomes não dizem tudo.
- **Features relacionadas = mesmo arquivo.** Ex: "adicionar PIX" + "adicionar boleto" → `pagamentos.md`.
- **Nome do arquivo reflete o DOMÍNIO/TÓPICO, não o nome da task/feature.**
  - ✅ `pagamentos.md`, `autenticacao.md`, `dashboard-admin.md`
  - ❌ `feat-1.md`, `add-pix.md`, `add-boleto.md`
- **Ao mesclar arquivos, preserve todo conteúdo relevante.** Apenas reorganize.
- **Dentro do arquivo, use H2/H3 para separar features** quando necessário.

## Decisão Create-vs-Update-vs-Merge-vs-Delete

Após o inventário, para a feature atual:

| Situação | Ação |
|----------|------|
| Arquivo relacionado existe (mesmo domínio) | **ATUALIZAR** (adicionar seção ou mesclar) |
| Nada relacionado existe | **CRIAR** arquivo novo nomeado por tópico/domínio |
| Arquivos redundantes encontrados | **MESCLAR** em um só; deletar os redundantes |
| Arquivos obsoletos encontrados | **DELETAR** |

## Anti-Padrão

```
❌ Glob docs/01-problem/*.md → não encontra "minha-feature.md" → cria novo
```

Correto:

```
✅ Inventário já feito → sabe que existe pagamentos.md → PIX é pagamento → ATUALIZA o existente
```

**O critério é DOMÍNIO/TÓPICO, não nome exato da feature.** Se a pasta tem `dashboard.md` e sua feature é "adicionar filtro no dashboard", você ATUALIZA `dashboard.md` — não cria `filtro-dashboard.md`.

## Aplicação em cada Step

O mapa do inventário informa a ação em TODOS os steps:
- Step 1: `docs/01-problem/` → criar/atualizar arquivo de domínio
- Step 2: `docs/02-user-stories/` → idem
- … (repete para steps 3-9)
- Step 10: `kanban/10-done/` → arquivo de domínio, referencia TODOS os artefatos prévios
