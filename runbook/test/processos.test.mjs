// processos.test.mjs — todo processo publicado num pacote (e todo exemplo) precisa validar:
// um processo quebrado não chega ao GitHub, porque o `pnpm check` e o CI rodam este teste.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lerProcesso } from "../src/processo.mjs";

const RAIZ = fileURLToPath(new URL("../../", import.meta.url));

function processos() {
  const achados = [];
  const olhar = (dir) => {
    for (const nome of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
      const arq = path.join(dir, nome);
      if (/\.ya?ml$/.test(nome) && /^passos:/m.test(fs.readFileSync(arq, "utf8"))) achados.push(arq);
    }
  };
  const plugins = path.join(RAIZ, "plugins");
  for (const pacote of fs.readdirSync(plugins)) {
    const skills = path.join(plugins, pacote, "skills");
    if (!fs.existsSync(skills)) continue;
    for (const skill of fs.readdirSync(skills)) {
      const dir = path.join(skills, skill);
      if (fs.statSync(dir).isDirectory()) olhar(dir);
    }
  }
  olhar(path.join(RAIZ, "runbook", "exemplos"));
  return achados;
}

test("acha os processos dos pacotes e os exemplos", () => {
  const nomes = processos().map((a) => path.relative(RAIZ, a));
  assert.ok(nomes.includes(path.join("plugins", "furi-ship", "skills", "repro", "processo.yaml")), nomes.join(", "));
});

for (const arq of processos())
  test(`processo válido: ${path.relative(RAIZ, arq)}`, () => assert.deepEqual(lerProcesso(arq).erros, []));
