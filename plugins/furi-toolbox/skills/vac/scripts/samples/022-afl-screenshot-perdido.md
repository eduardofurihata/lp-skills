---
cmd: "check-artifact"
expect: "block"
must: ["Evidência: `av-1459-repro-dropdown.png`"]
class: "positivo-verdadeiro"
note: "mina labzz-afl 2026-09-12 — screenshot citado que não existe em lugar nenhum nem no histórico do git"
origin: "labzz-afl artefato docs/01-problem/agent-skill-association.md — pointer: Evidência: `av-1459-repro-dropdown.png`"
artifact: "docs/01-problem/agent-skill-association.md"
---
# Associação de Skills ao Agente — Escopo de Visibilidade

> Origem: Jira **AV-1459** (Bug, Media). Reporter: Alexandre Rezende.
> Domínio: configuração de agente → aba **Skills** → "Adicionar skill".

## Problema

Na configuração de um agente, a lista de skills oferecida para associação **não é
escopada ao contexto do agente**: um agente **pessoal** exibe também skills
**organizacionais** (e de **plataforma**), quando deveria oferecer apenas as
skills do escopo daquele agente.

## Contexto

- A aba "Skills" da config do agente (`AgentSkillsManager`) busca o catálogo com
  `GET /api/skills` **sem filtro de visibilidade** e mostra tudo que o usuário
  enxerga (união de `personal` + `organizational` das suas orgs + `platform`).
- O mesmo componente é montado em **dois** contextos (agente **pessoal** e agente
  **organizacional**) com a **mesma** chamada sem escopo, então o vazamento ocorre
  nos dois sentidos (pessoal mostra org; org mostra as pessoais do usuário e de
  outras orgs).
- O backend `GET /api/skills` está **correto** para o catálogo geral (página
  `/skills`); o defeito é a ausência de um escopo "skills associáveis a ESTE
  agente".
- Reproduzido em http://localhost:8080 (agente pessoal "Agente Teste AV462"): o
  dropdown lista `AV1459 Skill Pessoal`, `AV1459 Skill Organização` e
  `AV1459 Skill Plataforma` juntas. Evidência: `av-1459-repro-dropdown.png`.

## Afetados

- **Dono de agente pessoal** — vê e pode habilitar skills da organização que não
  pertencem ao escopo pessoal do agente (confusão + risco de acoplar um agente
  pessoal a uma capacidade/segredo organizacional).
- **Membro de organização configurando agente organizacional** — vê suas skills
  pessoais e, potencialmente, skills de outras orgs misturadas às da org do
  agente (ruído + risco de habilitar algo fora do escopo da org).
- **Administrador/Produto** — comportamento diverge do modelo mental de
  visibilidade (pessoal × organizacional × plataforma) já adotado no catálogo de
  skills, gerando inconsistência de produto.

