---
name: afl
description: Use when working on an AFL (Agents for Life) Jira card — roda o /jira no contexto do AFL, mirando qualidade #1 de mercado em toda saída que o usuário lê como texto do agente. Instala o /jira junto (dependência).
argument-hint: "[CARD-CODE] | finish [CARD-CODE] | (empty to continue active card)"
requires: jira
---

# AFL — /jira no contexto Agents for Life

`/afl` = `/jira` rodando no contexto do **AFL (Agents for Life)**.

1. **Rode o `/jira`** com os mesmos argumentos recebidos (`[CARD-CODE]`, `finish [CARD-CODE]`, ou vazio). O `/jira` instala junto o `/method` (dependência), então o fluxo completo — Step 0 → /method → human check → ship — está disponível.

2. **Contexto Eduzz / AFL:**
   - Project key **`AV-*`**: card único `AV-36`; multi-card `AV-36-40`, `AV-36-40-55` (números crescentes, prefixo `AV-`). Sempre que o `/jira` pedir um `[CARD-CODE]`, considere o `AV-*`.
   - Ambiente LOCAL DEV; `can create users: yes`; test user sob demanda; push só no ship.

3. **Padrão de qualidade #1 (texto de agente):** quando o card afeta qualquer saída que o usuário lê como texto do agente (chat, resumos, prompts, persona, RAG, troca de modelo), a saída deve seguir o padrão das **big pop tech apps** e mirar ser **#1 do mercado** — não basta "funcionar", tem que **ganhar do melhor**. Uma resposta que lê pior que um app top de linha é um teste FALHO. Avalie isso durante os testes (Step 9 do `/method`) e no human check.

Tudo mais é idêntico ao `/jira`.
