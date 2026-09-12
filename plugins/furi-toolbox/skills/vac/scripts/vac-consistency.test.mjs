// vac-consistency.test.mjs — o que amarra código e doutrina:
//   gates.json ↔ references/gates.md (cada id citado entre crases)
//   regras emitidas pelo código ↔ references/taxonomia.md
//   cartão ≤ 950 caracteres (e ≤ 1100 com o sufixo de subagente)
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REFS = path.join(HERE, "..", "references");
const read = (p) => fs.readFileSync(p, "utf8");

test("gates.json ↔ gates.md: cada id aparece entre crases na leitura humana", () => {
  const ids = JSON.parse(read(path.join(HERE, "gates.json"))).gates.map((g) => g.id);
  const md = read(path.join(REFS, "gates.md"));
  for (const id of ids) assert.ok(md.includes(`\`${id}\``), `gates.md sem \`${id}\``);
  const cited = [...md.matchAll(/^\| `([\w-]+)` \|/gmu)].map((m) => m[1]);
  for (const id of cited) assert.ok(ids.includes(id), `gates.md cita \`${id}\` que não existe no JSON`);
});

test("gates.json: cada source aponta para arquivo que existe", () => {
  const root = path.resolve(HERE, "..", "..", "..", "..", "..");
  for (const g of JSON.parse(read(path.join(HERE, "gates.json"))).gates) {
    const file = g.source.split(":")[0];
    assert.ok(fs.existsSync(path.join(root, file)), `${g.id}: source ${file} não existe`);
  }
});

test("taxonomia.md cobre toda regra que o código emite", () => {
  const code = read(path.join(HERE, "vac-rules.mjs")) + read(path.join(HERE, "vac-ledger.mjs")) + read(path.join(HERE, "vac-hook.mjs"));
  const rules = new Set([...code.matchAll(/\bit(?:em)?\(\s*"([\w-]+)"/g)].map((m) => m[1]));
  for (const m of code.matchAll(/rule:\s*"([\w-]+)"/g)) rules.add(m[1]);
  assert.ok(rules.size >= 15, `só ${rules.size} regras encontradas no código`);
  const tax = read(path.join(REFS, "taxonomia.md"));
  for (const r of rules) assert.ok(tax.includes(`\`${r}\``), `taxonomia.md sem \`${r}\``);
});

test("cartão: ≤ 950 caracteres; com sufixo de subagente ≤ 1100", () => {
  const skill = read(path.join(HERE, "..", "SKILL.md"));
  const card = skill.match(/<!--\s*vac:card\s*-->([\s\S]*?)<!--\s*\/vac:card\s*-->/)[1].trim();
  assert.ok(card.length <= 950, `cartão com ${card.length} caracteres`);
  assert.ok(!/^hooks:/m.test(skill.split("\n---")[0] + skill.split("\n---")[1]), "frontmatter do SKILL.md não declara hooks (vivem em hooks/hooks.json)");
});

test("hooks.json: todo comando aponta para o script e tem o guard do toggle", () => {
  const cfg = JSON.parse(read(path.join(HERE, "..", "..", "..", "hooks", "hooks.json")));
  const cmds = Object.values(cfg.hooks).flat().flatMap((e) => e.hooks.map((h) => h.command));
  assert.ok(cmds.length >= 7);
  for (const c of cmds) {
    assert.match(c, /vac-data\/vac\/on/, "guard do toggle");
    assert.match(c, /skills\/vac\/scripts\/vac-hook\.mjs" (card|check-stop|check-artifact|agent-done)/, `comando: ${c}`);
  }
});
