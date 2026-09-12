// vac-pedido.test.mjs — a triagem do pedido, sinal por sinal, com fixture de disco.
// Grátis e determinístico: sem modelo, sem rede. Roda em `pnpm test:vac`.
//
// O que cada teste protege é o custo do falso positivo: o alvo desta camada é o prompt do
// usuário, e ruído aqui aparece em cima do que ELE escreveu — mais caro que ruído em artefato.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { skillsDoMapa, triagem } from "./vac-pedido.mjs";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "vac-pedido-"));
fs.mkdirSync(path.join(root, "lib"), { recursive: true });
fs.writeFileSync(path.join(root, "lib", "skills.ts"), "export const x = 1;\n");
execFileSync("git", ["-C", root, "init", "-q"], { stdio: "ignore" });
const roots = [root];
const skills = ["demo:vac", "demo:method", "demo:fast", "demo:save"];

const regras = (p, ctx = {}) => triagem(p, { roots, skills, ...ctx }).sinais.map((s) => s.rule);

// --- S1 · alvo-nao-resolve ---------------------------------------------------

test("arquivo citado que não existe é premissa falsa do pedido", () => {
  assert.deepEqual(regras("arruma o header.tsx que quebrou na home"), ["alvo-nao-resolve"]);
});

test("arquivo que existe não vira sinal", () => {
  assert.deepEqual(regras("olha o lib/skills.ts e me diz o que falta"), []);
});

test("pedir para CRIAR arquivo que ainda não existe é o normal, não premissa falsa", () => {
  assert.deepEqual(regras("cria um novo lib/format.ts com a função de data"), []);
});

test("menção entre crases não é alvo (a mesma régua do /vac para a saída)", () => {
  assert.deepEqual(regras("me explica por que `header.tsx` não seria um bom nome"), []);
});

test("skill citada que não existe no mapa vira sinal; a que existe, não", () => {
  assert.deepEqual(regras("/vaca liga o regime"), ["alvo-nao-resolve"]);
  assert.deepEqual(regras("/vac status"), []);
});

test("sem roots não há disco para consultar: nenhum sinal de alvo", () => {
  assert.deepEqual(triagem("arruma o header.tsx", { roots: [] }).sinais, []);
});

// --- S2 · reformulacao -------------------------------------------------------

test("retratação explícita do prompt anterior", () => {
  const r = regras("não era isso, eu queria o filtro do admin", { anterior: "arruma o filtro da home" });
  assert.ok(r.includes("reformulacao"));
});

test("reformulação lexical: mesmas palavras, pedido repetido", () => {
  const antes = "gera o relatório mensal de vendas por região no dashboard";
  const r = regras("gera o relatório mensal de vendas por região agrupado no dashboard", { anterior: antes });
  assert.ok(r.includes("reformulacao"));
});

test("pedido novo e diferente não é reformulação", () => {
  assert.deepEqual(regras("agora escreve os testes do parser", { anterior: "arruma o filtro da home" }), []);
});

test("sem prompt anterior não há reformulação a detectar", () => {
  assert.deepEqual(regras("não era isso"), ["deixis-sem-referente"]);
});

// --- S3 · colagem-truncada ---------------------------------------------------

test("cerca de código aberta e nunca fechada", () => {
  assert.deepEqual(regras("olha esse trecho:\n```ts\nconst x = 1"), ["colagem-truncada"]);
});

test("cerca fechada não é truncagem", () => {
  assert.deepEqual(regras("olha esse trecho:\n```ts\nconst x = 1\n```"), []);
});

// --- S4 · pipeline-sem-escopo ------------------------------------------------

test("pipeline caro com escopo curto", () => {
  assert.deepEqual(regras("/method filtro"), ["pipeline-sem-escopo"]);
});

test("pipeline com card não é escopo curto", () => {
  assert.deepEqual(regras("/method KEY-12"), []);
});

test("pipeline com arquivo real não é escopo curto", () => {
  assert.deepEqual(regras("/fast lib/skills.ts"), []);
});

test("pipeline com escopo escrito não é sinal", () => {
  assert.deepEqual(regras("/method refatora o filtro da home para usar o motor de busca novo"), []);
});

// --- S5 · deixis-sem-referente -----------------------------------------------

test("pronome sem alvo em pedido curto", () => {
  assert.deepEqual(regras("arruma isso"), ["deixis-sem-referente"]);
});

test("pronome COM alvo nomeado não é dêixis solta", () => {
  assert.deepEqual(regras("arruma isso no lib/skills.ts"), []);
});

test("pronome em pedido longo tem referente no próprio texto", () => {
  assert.deepEqual(regras("arruma isso que o parser de frontmatter quebra quando o valor tem dois pontos e vira string vazia"), []);
});

// --- S6 · skill-nao-roteada --------------------------------------------------

test("pediu o que uma skill faz, sem chamá-la", () => {
  assert.deepEqual(regras("commita tudo que tá pronto"), ["skill-nao-roteada"]);
});

test("chamou a skill: nada a rotear", () => {
  assert.deepEqual(regras("/save commita tudo que tá pronto"), []);
});

// --- forma --------------------------------------------------------------------

test("prompt vazio não produz sinal", () => {
  assert.deepEqual(triagem("", { roots }).sinais, []);
  assert.deepEqual(triagem(undefined, { roots }).sinais, []);
});

test("todo sinal nasce como nota — Fase 1 não bloqueia nem injeta", () => {
  const s = triagem("arruma isso do header.tsx", { roots, skills }).sinais;
  assert.ok(s.length > 0);
  for (const i of s) assert.equal(i.severity, "note");
});

test("skillsDoMapa lê os slugs dos headings do mapa gerado por `pnpm map`", () => {
  const mapa = "# Mapa\n\n## demo:method\n\n- x\n\n## demo:vac\n\n- y\n";
  assert.deepEqual(skillsDoMapa(mapa), ["demo:method", "demo:vac"]);
});
