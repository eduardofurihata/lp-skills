// adaptador.test.mjs — os argumentos do juiz: cego, ou na fonte com só as ferramentas pedidas.
import { test } from "node:test";
import assert from "node:assert/strict";
import { argumentosDoJuiz } from "../src/adaptadores/claude.mjs";

const depois = (args, flag) => args[args.indexOf(flag) + 1];

test("juiz sem ferramentas: cego — --safe-mode, nenhuma ferramenta, nenhuma pasta", () => {
  const args = argumentosDoJuiz({ ferramentas: [], pastas: ["/run/arq"] });
  assert.ok(args.includes("--safe-mode"));
  assert.ok(!args.includes("--add-dir"));
  assert.equal(args.at(-2), "--tools");
  assert.equal(args.at(-1), "");
});

test("juiz com ferramentas: só as pedidas, as embutidas ligadas e confinadas à pasta do run", () => {
  const args = argumentosDoJuiz({ ferramentas: ["Read", "mcp__x__y"], pastas: ["/run/arq"], esforco: "medium" });
  assert.ok(!args.includes("--safe-mode"));
  assert.equal(depois(args, "--permission-mode"), "dontAsk");
  assert.equal(depois(args, "--allowedTools"), "Read,mcp__x__y");
  assert.equal(depois(args, "--add-dir"), "/run/arq");
  assert.equal(depois(args, "--effort"), "medium");
  assert.equal(args.at(-2), "--tools");
  assert.equal(args.at(-1), "Read");
});

test("juiz só com MCP: nenhuma embutida ligada", () => {
  const args = argumentosDoJuiz({ ferramentas: ["mcp__atlassian__jira_get_issue"], pastas: ["/run/arq"] });
  assert.equal(args.at(-1), "");
});
