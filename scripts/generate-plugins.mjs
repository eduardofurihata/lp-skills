#!/usr/bin/env node
// generate-plugins.mjs — fonte única: o frontmatter dos SKILL.md.
// Emite, de forma idempotente:
//   1. skills/<cat>/<slug>/.claude-plugin/plugin.json  (um single-skill-root plugin por skill)
//   2. .claude-plugin/marketplace.json                  (catálogo do marketplace `lp-skills`)
// Rodar 2× produz bytes idênticos (git diff vazio) — chaves em ordem fixa, plugins ordenados.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = path.join(ROOT, "skills");
const CATEGORIES = ["personal", "eduzz"];
const MARKETPLACE_NAME = "lp-skills";
const OWNER = { name: "Eduardo Furihata" };
const MARKETPLACE_DESCRIPTION =
  "Skills do Claude Code do Furihata — pessoais e Eduzz.";

// Primeira frase do description (cap 200 chars) — o frontmatter é longo demais
// para o campo `description` de um manifesto.
function firstSentence(desc) {
  const trimmed = String(desc ?? "").trim();
  const match = trimmed.match(/^(.+?[.!?])(\s|$)/);
  let sentence = match ? match[1] : trimmed;
  if (sentence.length > 200) sentence = sentence.slice(0, 197).trimEnd() + "…";
  return sentence;
}

// `requires` no frontmatter: string ("method") ou lista (["a","b"]). Espelha lib/skills.ts.
function parseRequires(value) {
  if (typeof value === "string") {
    const v = value.trim();
    return v ? [v] : [];
  }
  if (Array.isArray(value)) {
    return value.filter((v) => typeof v === "string" && v.trim()).map((v) => v.trim());
  }
  return [];
}

function writeJson(filePath, obj) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2) + "\n");
}

const plugins = [];

for (const category of CATEGORIES) {
  const bucket = path.join(SKILLS_DIR, category);
  if (!fs.existsSync(bucket)) continue;

  const slugs = fs
    .readdirSync(bucket, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .map((d) => d.name)
    .sort();

  for (const slug of slugs) {
    const skillMd = path.join(bucket, slug, "SKILL.md");
    if (!fs.existsSync(skillMd)) continue;

    const { data } = matter(fs.readFileSync(skillMd, "utf8"));
    const name = typeof data.name === "string" ? data.name : slug;
    const description = firstSentence(data.description);
    const dependencies = parseRequires(data.requires).map((n) => ({ name: n }));

    // plugin.json — chaves em ordem fixa; `skills:["./"]` = single-skill-root
    // explícito (invocação = frontmatter `name`, bare, cross-versão). Sem `version`
    // de propósito → versionamento por git-SHA (auto-update a cada push; `version`
    // fixo exigiria bump manual e reintroduziria "o dev não recebe o update").
    const plugin = { name, description, author: OWNER, skills: ["./"] };
    if (dependencies.length) plugin.dependencies = dependencies;
    writeJson(path.join(bucket, slug, ".claude-plugin", "plugin.json"), plugin);

    plugins.push({
      name,
      source: `./skills/${category}/${slug}`,
      description,
      category,
    });
  }
}

// Bundles ("builders") — plugins agregadores, sem skill própria: só `dependencies`
// apontando para todas as skills da categoria. Instalar o bundle puxa a categoria
// inteira de uma vez; as skills individuais continuam instaláveis à parte.
const byCategory = { personal: [], eduzz: [] };
for (const p of plugins) byCategory[p.category].push(p.name);

const BUILDERS = [
  {
    name: "furi-builder",
    category: "personal",
    description:
      "Bundle — instala todas as skills pessoais do Furihata de uma vez.",
  },
  {
    name: "eduzz-builder",
    category: "eduzz",
    description:
      "Bundle — instala todas as skills de trabalho (Eduzz) de uma vez.",
  },
];

for (const builder of BUILDERS) {
  const dependencies = byCategory[builder.category]
    .slice()
    .sort()
    .map((name) => ({ name }));
  writeJson(path.join(ROOT, "bundles", builder.name, ".claude-plugin", "plugin.json"), {
    name: builder.name,
    description: builder.description,
    author: OWNER,
    dependencies,
  });
  plugins.push({
    name: builder.name,
    source: `./bundles/${builder.name}`,
    description: builder.description,
    category: builder.category,
  });
}

plugins.sort((a, b) => a.name.localeCompare(b.name));

const marketplace = {
  name: MARKETPLACE_NAME,
  owner: OWNER,
  metadata: { description: MARKETPLACE_DESCRIPTION },
  plugins,
};
writeJson(path.join(ROOT, ".claude-plugin", "marketplace.json"), marketplace);

console.log(
  `generate-plugins: ${plugins.length} plugin.json + marketplace.json gerados.`,
);
