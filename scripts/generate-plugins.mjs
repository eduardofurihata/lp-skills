#!/usr/bin/env node
// generate-plugins.mjs — fonte única: o frontmatter dos SKILL.md.
// Emite, de forma idempotente:
//   1. skills/<cat>/.claude-plugin/plugin.json  (UM plugin por categoria, que
//      empacota TODAS as skills da categoria via `skills:[./<slug>, …]`)
//   2. .claude-plugin/marketplace.json           (catálogo com só 2 plugins)
// Rodar 2× produz bytes idênticos (git diff vazio) — chaves em ordem fixa,
// listas ordenadas. Também PODA artefatos do modelo antigo (1 plugin por skill
// + bundles/ agregadores), já que este script é a autoridade dos gerados.
//
// Modelo: 2 plugins ("builders"), não 21. Cada builder é a pasta da categoria
// (skills/personal, skills/eduzz) como raiz de plugin; as skills continuam em
// skills/<cat>/<slug>/ e entram no plugin pelo array `skills`. Skill empacotada
// segue sendo chamada por `/method` (forma curta resolve sem ambiguidade); a
// forma canônica namespaced `/furi-builder:method` também funciona.
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

// Um builder por categoria: o plugin que empacota a categoria inteira.
const BUILDERS = {
  personal: {
    name: "furi-builder",
    description:
      "Skills pessoais do Furihata — /method, /solve, /fast, /work, /pr, /merge e mais. Instala todas de uma vez.",
  },
  eduzz: {
    name: "eduzz-builder",
    description:
      "Skills de trabalho (Eduzz) — /jira, /afl, /notion-push, /notion-pull. Puxa junto o furi-builder (as pessoais que /jira e /afl usam).",
  },
};

// Primeira frase do description (cap 200 chars) — o frontmatter é longo demais
// para caber num campo `description` de manifesto.
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
    return value
      .filter((v) => typeof v === "string" && v.trim())
      .map((v) => v.trim());
  }
  return [];
}

function writeJson(filePath, obj) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2) + "\n");
}

// Poda o que o modelo antigo gerava, pra o repo não carregar manifesto órfão:
//   - skills/<cat>/<slug>/.claude-plugin/  (1-plugin-por-skill)
//   - bundles/                              (agregadores só-dependências)
function pruneLegacy(slugsByCategory) {
  for (const [category, slugs] of Object.entries(slugsByCategory)) {
    for (const slug of slugs) {
      const dir = path.join(SKILLS_DIR, category, slug, ".claude-plugin");
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
  fs.rmSync(path.join(ROOT, "bundles"), { recursive: true, force: true });
}

// 1ª passada: lê todas as skills (name, description, requires, categoria).
const skills = []; // { slug, category, name, description, requires }
const slugsByCategory = { personal: [], eduzz: [] };

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
    skills.push({
      slug,
      category,
      name: typeof data.name === "string" ? data.name : slug,
      description: firstSentence(data.description),
      requires: parseRequires(data.requires),
    });
    slugsByCategory[category].push(slug);
  }
}

pruneLegacy(slugsByCategory);

// Categoria de cada skill (pelo `name` de invocação, que é como `requires` aponta).
const categoryOfName = new Map(skills.map((s) => [s.name, s.category]));

// Deps cruzadas entre builders: se uma skill da categoria X `requires` uma skill
// da categoria Y (Y≠X), o builder de X depende do builder de Y. Ex.: /jira e /afl
// (eduzz) usam /method+/solve (personal) → eduzz-builder depende de furi-builder.
// Dentro da mesma categoria não há dep: o builder já traz todas as skills dela.
function crossBuilderDeps(category) {
  const others = new Set();
  for (const s of skills) {
    if (s.category !== category) continue;
    for (const req of s.requires) {
      const reqCat = categoryOfName.get(req);
      if (reqCat && reqCat !== category) others.add(BUILDERS[reqCat].name);
    }
  }
  return [...others].sort().map((name) => ({ name }));
}

// 2ª passada: escreve 1 plugin.json por categoria + monta as entradas do catálogo.
const plugins = [];

for (const category of CATEGORIES) {
  const slugs = slugsByCategory[category].slice().sort();
  if (slugs.length === 0) continue;

  const builder = BUILDERS[category];
  const deps = crossBuilderDeps(category);

  // plugin.json na raiz da categoria — chaves em ordem fixa. `skills:[./<slug>]`
  // lista explícita (sem `version` de propósito → versionamento por git-SHA:
  // cada push é uma versão, sem bump manual).
  const plugin = {
    name: builder.name,
    description: builder.description,
    author: OWNER,
    skills: slugs.map((slug) => `./${slug}`),
  };
  if (deps.length) plugin.dependencies = deps;
  writeJson(
    path.join(SKILLS_DIR, category, ".claude-plugin", "plugin.json"),
    plugin,
  );

  plugins.push({
    name: builder.name,
    source: `./skills/${category}`,
    description: builder.description,
    category,
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

const skillCount = skills.length;
console.log(
  `generate-plugins: ${plugins.length} plugins (${skillCount} skills empacotadas) + marketplace.json gerados.`,
);
