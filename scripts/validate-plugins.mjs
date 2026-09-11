#!/usr/bin/env node
// validate-plugins.mjs — o check que torna "publicar = dar push" confiável.
//
// Cada cliente (Claude Code, Codex, Agent Plugins) só descobre um pacote quebrado
// na hora de instalar, sem erro legível. Este script falha ANTES, no CI:
//
//   1. plugins/<pkg>/plugin.json conforma com o Agent Plugins v1 (o schema é
//      additionalProperties:false — um campo a mais invalida o pacote inteiro)
//   2. os 3 manifestos de cada pacote existem, são JSON válido e o `name` deles
//      é o nome do diretório (é por ele que o cliente resolve a dependência)
//   3. toda skill tem SKILL.md com `name` e `description` no frontmatter — sem
//      eles o cliente não sabe quando invocar
//   4. os 2 marketplaces apontam para diretórios que existem
//   5. todo caminho `plugins/…md` citado dentro de uma skill resolve no disco
//
// Uso: node scripts/validate-plugins.mjs   (exit 1 em qualquer falha)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLUGINS_DIR = path.join(ROOT, "plugins");
const AGENT_PLUGINS_SCHEMA =
  "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json";

// Agent Plugins v1: topo é additionalProperties:false. Estes são TODOS os campos
// que o schema define — qualquer outro invalida o manifesto.
const AGENT_PLUGINS_FIELDS = new Set([
  "$schema",
  "name",
  "version",
  "description",
  "author",
  "homepage",
  "repository",
  "license",
  "keywords",
  "extensions",
]);
const AGENT_PLUGINS_AUTHOR_FIELDS = new Set(["name", "email", "url"]);
// name: 1-64 chars, lowercase alfanumérico com . e -, sem -- nem .. consecutivos.
const NAME_RE = /^(?!.*(--|\.\.))[a-z0-9]([a-z0-9.-]{0,62}[a-z0-9])?$/;

const errors = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    fail(path.relative(ROOT, file), `JSON inválido — ${e.message}`);
    return null;
  }
}

const packages = fs
  .readdirSync(PLUGINS_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("."))
  .map((d) => d.name)
  .sort();

if (packages.length === 0) fail("plugins/", "nenhum pacote encontrado");

for (const pkg of packages) {
  const root = path.join(PLUGINS_DIR, pkg);

  // (1) Agent Plugins v1 — o manifesto da raiz.
  const apPath = path.join(root, "plugin.json");
  const rel = path.relative(ROOT, apPath);
  if (!fs.existsSync(apPath)) {
    fail(rel, "faltando (Agent Plugins v1 — Cursor, Codex, Copilot, VS Code)");
  } else {
    const m = readJson(apPath);
    if (m) {
      if (m.$schema !== AGENT_PLUGINS_SCHEMA)
        fail(rel, `$schema deve ser "${AGENT_PLUGINS_SCHEMA}"`);
      if (typeof m.name !== "string" || !NAME_RE.test(m.name))
        fail(rel, `name inválido: ${JSON.stringify(m.name)}`);
      if (m.name !== pkg) fail(rel, `name "${m.name}" ≠ diretório "${pkg}"`);
      for (const k of Object.keys(m))
        if (!AGENT_PLUGINS_FIELDS.has(k))
          fail(rel, `campo "${k}" não existe no schema (additionalProperties:false)`);
      if (m.author && typeof m.author === "object")
        for (const k of Object.keys(m.author))
          if (!AGENT_PLUGINS_AUTHOR_FIELDS.has(k))
            fail(rel, `author.${k} não existe no schema`);
    }
  }

  // (2) os manifestos dos clientes nativos.
  for (const [dir, label] of [
    [".claude-plugin", "Claude Code"],
    [".codex-plugin", "Codex"],
  ]) {
    const p = path.join(root, dir, "plugin.json");
    const r = path.relative(ROOT, p);
    if (!fs.existsSync(p)) {
      fail(r, `faltando (${label})`);
      continue;
    }
    const m = readJson(p);
    if (m && m.name !== pkg) fail(r, `name "${m.name}" ≠ diretório "${pkg}"`);
  }

  // (3) as skills: skills/<slug>/SKILL.md com name + description.
  const skillsDir = path.join(root, "skills");
  if (!fs.existsSync(skillsDir)) {
    fail(path.relative(ROOT, skillsDir), "faltando — é onde os 3 clientes procuram");
    continue;
  }
  const slugs = fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .map((d) => d.name);
  if (slugs.length === 0)
    fail(path.relative(ROOT, skillsDir), "nenhuma skill dentro");

  for (const slug of slugs) {
    const md = path.join(skillsDir, slug, "SKILL.md");
    const r = path.relative(ROOT, md);
    if (!fs.existsSync(md)) {
      fail(r, "faltando — a pasta não é uma skill");
      continue;
    }
    const { data } = matter(fs.readFileSync(md, "utf8"));
    if (typeof data.name !== "string" || !data.name.trim())
      fail(r, "frontmatter sem `name` (é o nome de invocação)");
    if (typeof data.description !== "string" || !data.description.trim())
      fail(r, "frontmatter sem `description` (é o gatilho de invocação)");
  }
}

// (4) os marketplaces apontam para diretórios que existem.
const claudeMkt = readJson(path.join(ROOT, ".claude-plugin", "marketplace.json"));
for (const p of claudeMkt?.plugins ?? []) {
  if (!fs.existsSync(path.join(ROOT, p.source)))
    fail(".claude-plugin/marketplace.json", `source inexistente: ${p.source}`);
}
const codexMkt = readJson(
  path.join(ROOT, ".agents", "plugins", "marketplace.json"),
);
for (const p of codexMkt?.plugins ?? []) {
  const rel = p.source?.path;
  if (!rel || !fs.existsSync(path.join(ROOT, rel)))
    fail(".agents/plugins/marketplace.json", `path inexistente: ${rel}`);
}

// (5) todo caminho de SKILL citado dentro de uma skill resolve.
//
// Uma skill cita dois tipos de caminho, e só um deles é deste repo:
//   - deste repo   → outra skill ou reference: `references/x.md`, `<slug>/SKILL.md`,
//                    `../<slug>/references/x.md`, `plugins/<pkg>/skills/…`
//   - do PROJETO onde a skill roda → `docs/04-spec/…`, `kanban/10-done/…`, `src/…`
// O segundo tipo não existe aqui e nunca deve ser cobrado — por isso a checagem
// é por forma do caminho, não por "existe no disco".
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".md")) out.push(p);
  }
  return out;
}

// Diretórios que pertencem ao projeto-alvo, não a este repo.
const TARGET_PROJECT_ROOTS = new Set([
  "docs",
  "kanban",
  "src",
  "app",
  "lib",
  "components",
  "scripts",
  "public",
  "tests",
  "test",
  "node_modules",
]);

for (const pkg of packages) {
  const pkgSkills = path.join(PLUGINS_DIR, pkg, "skills");
  if (!fs.existsSync(pkgSkills)) continue;
  const slugs = new Set(
    fs
      .readdirSync(pkgSkills, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name),
  );

  for (const file of walk(pkgSkills)) {
    const rel = path.relative(ROOT, file);
    const dir = path.dirname(file);
    // a pasta da skill dona deste arquivo (o SKILL.md ou um reference dela)
    const own = path.join(
      pkgSkills,
      path.relative(pkgSkills, file).split(path.sep)[0],
    );
    const text = fs.readFileSync(file, "utf8");

    for (const cited of new Set(
      text.match(/`((?:\.\.\/)?[\w.-]+(?:\/[\w.-]+)+\.md)`/g)?.map((m) =>
        m.slice(1, -1),
      ) ?? [],
    )) {
      const head = cited.split("/")[0];
      if (TARGET_PROJECT_ROOTS.has(head) && !cited.startsWith("plugins/"))
        continue; // caminho do projeto-alvo

      const candidates = cited.startsWith("plugins/")
        ? [path.join(ROOT, cited)] // cross-package, a partir da raiz do repo
        : cited.startsWith("../")
          ? [path.resolve(dir, cited), path.resolve(own, cited)]
          : slugs.has(head)
            ? [path.join(pkgSkills, cited)] // `<slug>/…` a partir da raiz do pacote
            : [path.join(own, cited), path.join(dir, cited)]; // `references/…` da skill

      if (!candidates.some((c) => fs.existsSync(c)))
        fail(rel, `caminho de skill citado não existe: ${cited}`);
    }
  }
}

if (errors.length) {
  console.error(`validate-plugins: ${errors.length} problema(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}

const total = packages.reduce(
  (n, p) =>
    n +
    fs
      .readdirSync(path.join(PLUGINS_DIR, p, "skills"), { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith(".")).length,
  0,
);
console.log(
  `validate-plugins: ok — ${packages.length} pacotes, ${total} skills, ` +
    `3 manifestos cada, 2 marketplaces, caminhos citados resolvem.`,
);
