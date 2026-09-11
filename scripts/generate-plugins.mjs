#!/usr/bin/env node
// generate-plugins.mjs — fonte única: o frontmatter dos SKILL.md.
// Emite, de forma idempotente:
//   1. skills/<cat>/.claude-plugin/plugin.json  (UM plugin por categoria, que
//      empacota TODAS as skills da categoria via `skills:[./<slug>, …]`)
//   2. .claude-plugin/marketplace.json           (catálogo: 1 plugin por categoria)
//   3. plugins/<builder>/                         (pacotes nativos do Codex, com cópia
//      das skills da categoria e .codex-plugin/plugin.json)
//   4. .agents/plugins/marketplace.json           (catálogo nativo do Codex)
// Rodar 2× produz bytes idênticos (git diff vazio) — chaves em ordem fixa,
// listas ordenadas. Também PODA artefatos do modelo antigo (1 plugin por skill
// + bundles/ agregadores), já que este script é a autoridade dos gerados.
//
// Modelo: 1 plugin ("builder") por categoria — 4, não 23. Cada builder é a pasta
// da categoria (skills/build, skills/ship, skills/toolbox, skills/eduzz) como
// raiz de plugin; as skills continuam em skills/<cat>/<slug>/ e entram no plugin
// pelo array `skills`. Categoria é dona primeiro: skill de trabalho é `eduzz`,
// antes de qualquer critério. Entre as pessoais, `toolbox` é a das avulsas — sem
// `requires` e sem ninguém que dependa delas — por isso o builder nasce sem
// `dependencies`; `ship` é quem toca board/GitHub/ambiente (`jira-board` e quem
// o lista em `requires`) e depende de `build` (o método), nunca o inverso. Skill
// empacotada segue sendo chamada por `/method` (forma curta resolve sem
// ambiguidade); a forma canônica namespaced `/furi-build:method` também funciona.
import fs from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = path.join(ROOT, "skills");
const CATEGORIES = ["build", "ship", "toolbox", "eduzz"];
const MARKETPLACE_NAME = "lp-skills";
const OWNER = { name: "Eduardo Furihata" };
const CODEX_MARKETPLACE_DIR = path.join(ROOT, ".agents", "plugins");
const CODEX_MARKETPLACE_PATH = path.join(
  CODEX_MARKETPLACE_DIR,
  "marketplace.json",
);
const CODEX_PLUGINS_DIR = path.join(ROOT, "plugins");
const PACKAGE_VERSION = JSON.parse(
  fs.readFileSync(path.join(ROOT, "package.json"), "utf8"),
).version;
const MARKETPLACE_DESCRIPTION =
  "Skills do Claude Code do Furihata — build (o método), ship (a entrega), ferramentas avulsas e Eduzz.";

// Um builder por categoria: o plugin que empacota a categoria inteira.
const BUILDERS = {
  build: {
    name: "furi-build",
    description:
      "Skills de construção do Furihata — /principles, /ui, /solve, /method, /fast, /todo, /proto: do problema ao commit local, com QA. É a base que furi-ship e eduzz-builder puxam.",
    codex: {
      displayName: "Furi Build",
      shortDescription: "Método de construção, QA e commit local.",
      longDescription:
        "Conduza o trabalho do problema ao commit local com o método de engenharia do Furihata.",
      category: "Developer Tools",
      brandColor: "#8B5CF6",
      defaultPrompt: "Conduza esta feature com o método Furi Build.",
      keywords: ["development", "planning", "quality", "workflow"],
    },
  },
  ship: {
    name: "furi-ship",
    description:
      "Skills de entrega do Furihata — /jira-board, /card, /work, /pull-request, /homolog, /prod: do card no Jira até produção. Puxa junto o furi-build (o /work roda o /method; /card e os motores usam /solve e /todo).",
    codex: {
      displayName: "Furi Ship",
      shortDescription: "Do card no Jira até homologação e produção.",
      longDescription:
        "Conduza cards, pull requests, homologação e produção com o fluxo de entrega do Furihata.",
      category: "Developer Tools",
      brandColor: "#0EA5E9",
      defaultPrompt: "Conduza a entrega desta mudança com o Furi Ship.",
      keywords: ["jira", "pull-request", "deployment", "delivery"],
    },
  },
  toolbox: {
    name: "furi-toolbox",
    description:
      "Ferramentas avulsas do Furihata — /ask, /chat, /save, /sync, /make-dev, /ctt e mais. Cada uma funciona sozinha, sem depender de outra skill.",
    codex: {
      displayName: "Furi Toolbox",
      shortDescription: "Ferramentas avulsas para o fluxo de desenvolvimento.",
      longDescription:
        "Use atalhos e utilitários independentes para conversar, salvar, sincronizar e preparar projetos.",
      category: "Productivity",
      brandColor: "#F59E0B",
      defaultPrompt: "Use a ferramenta Furi mais adequada para esta tarefa.",
      keywords: ["utilities", "git", "productivity", "workflow"],
    },
  },
  eduzz: {
    name: "eduzz-builder",
    description:
      "Skills de trabalho (Eduzz) — /jira, /afl, /proof, /video-teams. Puxa junto o furi-build (o /jira roda o /method e o /solve; o /afl roda o /jira).",
    codex: {
      displayName: "Eduzz Builder",
      shortDescription: "Fluxos de trabalho da Eduzz.",
      longDescription:
        "Trabalhe em cards, AFLs, provas e vídeos da Eduzz com os fluxos especializados do Furihata.",
      category: "Productivity",
      brandColor: "#10B981",
      defaultPrompt: "Conduza este trabalho da Eduzz com o Eduzz Builder.",
      keywords: ["eduzz", "jira", "workflow", "development"],
    },
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

function hashDirectory(directory, hash, base = directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      hashDirectory(entryPath, hash, base);
      continue;
    }
    if (!entry.isFile()) continue;
    hash.update(path.relative(base, entryPath));
    hash.update("\0");
    hash.update(fs.readFileSync(entryPath));
    hash.update("\0");
  }
}

function codexVersion(category, builder, slugs) {
  const hash = createHash("sha256");
  hash.update(JSON.stringify({ name: builder.name, ...builder.codex }));
  for (const slug of slugs) {
    const source = path.join(SKILLS_DIR, category, slug);
    hash.update(`${slug}\0`);
    hashDirectory(source, hash);
  }
  return `${PACKAGE_VERSION}+codex.${hash.digest("hex").slice(0, 12)}`;
}

function generateCodexPlugin(category, builder, slugs) {
  const pluginRoot = path.join(CODEX_PLUGINS_DIR, builder.name);
  const destinationSkills = path.join(pluginRoot, "skills");

  // Os pacotes do Codex são artefatos gerados: a fonte permanece em skills/<cat>.
  fs.rmSync(destinationSkills, { recursive: true, force: true });
  fs.mkdirSync(destinationSkills, { recursive: true });
  for (const slug of slugs) {
    fs.cpSync(
      path.join(SKILLS_DIR, category, slug),
      path.join(destinationSkills, slug),
      { recursive: true },
    );
  }

  const codex = builder.codex;
  const manifest = {
    name: builder.name,
    version: codexVersion(category, builder, slugs),
    description: builder.description,
    author: {
      name: OWNER.name,
      url: "https://github.com/eduardofurihata",
    },
    homepage: "https://lp-skills.vercel.app",
    repository: "https://github.com/eduardofurihata/lp-skills",
    license: "MIT",
    keywords: codex.keywords,
    skills: "./skills/",
    interface: {
      displayName: codex.displayName,
      shortDescription: codex.shortDescription,
      longDescription: codex.longDescription,
      developerName: OWNER.name,
      category: codex.category,
      capabilities: ["Interactive", "Write"],
      defaultPrompt: [codex.defaultPrompt],
      brandColor: codex.brandColor,
    },
  };
  writeJson(path.join(pluginRoot, ".codex-plugin", "plugin.json"), manifest);

  return {
    name: builder.name,
    source: {
      source: "local",
      path: `./plugins/${builder.name}`,
    },
    policy: {
      installation: "AVAILABLE",
      authentication: "ON_INSTALL",
    },
    category: codex.category,
  };
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
const slugsByCategory = Object.fromEntries(CATEGORIES.map((c) => [c, []]));

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
// da categoria Y (Y≠X), o builder de X depende do builder de Y. Ex.: /work (ship)
// requer /method (build) → furi-ship depende de furi-build; /jira (eduzz) requer
// /method → eduzz-builder depende de furi-build.
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
const codexPlugins = [];

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
  codexPlugins.push(generateCodexPlugin(category, builder, slugs));
}

plugins.sort((a, b) => a.name.localeCompare(b.name));

const marketplace = {
  name: MARKETPLACE_NAME,
  owner: OWNER,
  metadata: { description: MARKETPLACE_DESCRIPTION },
  plugins,
};
writeJson(path.join(ROOT, ".claude-plugin", "marketplace.json"), marketplace);

const codexMarketplace = {
  name: MARKETPLACE_NAME,
  interface: { displayName: "LP Skills" },
  plugins: codexPlugins,
};
writeJson(CODEX_MARKETPLACE_PATH, codexMarketplace);

const skillCount = skills.length;
console.log(
  `generate-plugins: ${plugins.length} plugins do Claude Code e ${codexPlugins.length} do Codex (${skillCount} skills empacotadas) + marketplaces gerados.`,
);
