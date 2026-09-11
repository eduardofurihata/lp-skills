#!/usr/bin/env node
// generate-plugins.mjs — fonte única: o frontmatter dos SKILL.md.
//
// UM diretório por pacote, TRÊS manifestos, ZERO cópia de skill:
//
//   plugins/<pacote>/
//   ├── plugin.json                 (GERADO) Agent Plugins v1 — Cursor, Codex, Copilot, VS Code
//   ├── .claude-plugin/plugin.json  (GERADO) Claude Code
//   ├── .codex-plugin/plugin.json   (GERADO) Codex nativo
//   └── skills/<slug>/SKILL.md      FONTE — não gerada, não copiada
//
// Os três clientes convergem em `skills/<slug>/SKILL.md` e discordam só de ONDE
// o manifesto mora — e como cada um mora num lugar diferente, eles coexistem no
// mesmo diretório. Por isso não há cópia de distribuição: um push atualiza todos.
//
// O que este script emite (idempotente — rodar 2× produz bytes idênticos):
//   1. plugins/<pacote>/plugin.json                  Agent Plugins v1
//   2. plugins/<pacote>/.claude-plugin/plugin.json   Claude Code
//   3. plugins/<pacote>/.codex-plugin/plugin.json    Codex
//   4. .claude-plugin/marketplace.json               catálogo do Claude Code
//   5. .agents/plugins/marketplace.json              catálogo do Codex
// Também PODA artefatos dos modelos antigos (skills/ como raiz de plugin,
// 1-plugin-por-skill, bundles/), já que este script é a autoridade dos gerados.
//
// Modelo: 1 pacote por categoria — 4, não 25. A categoria de cada skill é
// derivada do pacote em que ela mora. Categoria é dona primeiro: skill de
// trabalho é `eduzz`, antes de qualquer critério. Entre as pessoais, `toolbox` é
// a das avulsas — sem `requires` e sem ninguém que dependa delas — por isso o
// pacote nasce sem `dependencies`; `ship` é quem toca board/GitHub/ambiente
// (`jira-board` e quem o lista em `requires`) e depende de `build` (o método),
// nunca o inverso. Skill empacotada segue sendo chamada por `/method` (forma
// curta resolve sem ambiguidade); a namespaced `/furi-build:method` também.
import fs from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLUGINS_DIR = path.join(ROOT, "plugins");
const MARKETPLACE_NAME = "lp-skills";
const OWNER = { name: "Eduardo Furihata" };
const REPO = "https://github.com/eduardofurihata/lp-skills";
const HOMEPAGE = "https://lp-skills.vercel.app";
const LICENSE = "MIT";
const AGENT_PLUGINS_SCHEMA =
  "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json";
const CLAUDE_MARKETPLACE_PATH = path.join(
  ROOT,
  ".claude-plugin",
  "marketplace.json",
);
const CODEX_MARKETPLACE_PATH = path.join(
  ROOT,
  ".agents",
  "plugins",
  "marketplace.json",
);
const PACKAGE_VERSION = JSON.parse(
  fs.readFileSync(path.join(ROOT, "package.json"), "utf8"),
).version;
const MARKETPLACE_DESCRIPTION =
  "Skills do Claude Code do Furihata — build (o método), ship (a entrega), ferramentas avulsas e Eduzz.";

// Os pacotes, na ordem em que o catálogo os lista. `category` é o id que a LP
// usa (lib/categories.ts) e é derivado daqui: o pacote é a unidade física.
const PACKAGES = [
  {
    name: "furi-build",
    category: "build",
    description:
      "Skills de construção do Furihata — /principles, /ui, /solve, /method, /fast, /todo, /proto: do problema ao commit local, com QA. É a base que furi-ship e eduzz-builder puxam.",
    keywords: ["development", "planning", "quality", "workflow"],
    codex: {
      displayName: "Furi Build",
      shortDescription: "Método de construção, QA e commit local.",
      longDescription:
        "Conduza o trabalho do problema ao commit local com o método de engenharia do Furihata.",
      category: "Developer Tools",
      brandColor: "#8B5CF6",
      defaultPrompt: "Conduza esta feature com o método Furi Build.",
    },
  },
  {
    name: "furi-ship",
    category: "ship",
    description:
      "Skills de entrega do Furihata — /jira-board, /card, /work, /pull-request, /homolog, /prod: do card no Jira até produção. Puxa junto o furi-build (o /work roda o /method; /card e os motores usam /solve e /todo).",
    keywords: ["jira", "pull-request", "deployment", "delivery"],
    codex: {
      displayName: "Furi Ship",
      shortDescription: "Do card no Jira até homologação e produção.",
      longDescription:
        "Conduza cards, pull requests, homologação e produção com o fluxo de entrega do Furihata.",
      category: "Developer Tools",
      brandColor: "#0EA5E9",
      defaultPrompt: "Conduza a entrega desta mudança com o Furi Ship.",
    },
  },
  {
    name: "furi-toolbox",
    category: "toolbox",
    description:
      "Ferramentas avulsas do Furihata — /ask, /chat, /save, /sync, /make-dev, /ctt e mais. Cada uma funciona sozinha, sem depender de outra skill.",
    keywords: ["utilities", "git", "productivity", "workflow"],
    codex: {
      displayName: "Furi Toolbox",
      shortDescription: "Ferramentas avulsas para o fluxo de desenvolvimento.",
      longDescription:
        "Use atalhos e utilitários independentes para conversar, salvar, sincronizar e preparar projetos.",
      category: "Productivity",
      brandColor: "#F59E0B",
      defaultPrompt: "Use a ferramenta Furi mais adequada para esta tarefa.",
    },
  },
  {
    name: "eduzz-builder",
    category: "eduzz",
    description:
      "Skills de trabalho (Eduzz) — /jira, /afl, /proof, /video-teams. Puxa junto o furi-build (o /jira roda o /method e o /solve; o /afl roda o /jira).",
    keywords: ["eduzz", "jira", "workflow", "development"],
    codex: {
      displayName: "Eduzz Builder",
      shortDescription: "Fluxos de trabalho da Eduzz.",
      longDescription:
        "Trabalhe em cards, AFLs, provas e vídeos da Eduzz com os fluxos especializados do Furihata.",
      category: "Productivity",
      brandColor: "#10B981",
      defaultPrompt: "Conduza este trabalho da Eduzz com o Eduzz Builder.",
    },
  },
];

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
  const entries = fs
    .readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name));
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

// Cachebuster derivado do CONTEÚDO das skills do pacote: muda quando uma skill
// muda, para o cliente que compara versão (Codex) saber que há versão nova.
function contentVersion(pkg, slugs) {
  const hash = createHash("sha256");
  hash.update(JSON.stringify({ name: pkg.name, ...pkg.codex }));
  for (const slug of slugs) {
    hash.update(`${slug}\0`);
    hashDirectory(path.join(PLUGINS_DIR, pkg.name, "skills", slug), hash);
  }
  return hash.digest("hex").slice(0, 12);
}

// Poda o que os modelos antigos geravam, pra o repo não carregar manifesto órfão:
//   - skills/                  (era a raiz dos plugins do Claude Code)
//   - bundles/                 (agregadores só-dependências)
//   - plugins/<pkg>/skills/<slug>/.claude-plugin/  (1-plugin-por-skill)
function pruneLegacy(slugsByPackage) {
  // `skills/` só é apagada se carregar a MARCA do layout antigo (a pasta de
  // categoria era a raiz do plugin, com `.claude-plugin/` dentro). Sem a marca,
  // é uma pasta que alguém criou para outra coisa: avisa e não toca — um script
  // que apaga um diretório de nome genérico sem olhar o conteúdo é magia.
  const legacySkills = path.join(ROOT, "skills");
  if (fs.existsSync(legacySkills)) {
    const marked = fs
      .readdirSync(legacySkills, { withFileTypes: true })
      .some(
        (d) =>
          d.isDirectory() &&
          fs.existsSync(
            path.join(legacySkills, d.name, ".claude-plugin", "plugin.json"),
          ),
      );
    if (marked) fs.rmSync(legacySkills, { recursive: true, force: true });
    else
      console.warn(
        "generate-plugins: skills/ existe mas não é do layout antigo — não foi tocada.",
      );
  }
  fs.rmSync(path.join(ROOT, "bundles"), { recursive: true, force: true });
  for (const [pkgName, slugs] of Object.entries(slugsByPackage)) {
    for (const slug of slugs) {
      fs.rmSync(
        path.join(PLUGINS_DIR, pkgName, "skills", slug, ".claude-plugin"),
        { recursive: true, force: true },
      );
    }
  }
}

// 1ª passada: lê todas as skills (name, description, requires, pacote).
const skills = []; // { slug, pkg, category, name, description, requires }
const slugsByPackage = Object.fromEntries(PACKAGES.map((p) => [p.name, []]));

for (const pkg of PACKAGES) {
  const skillsDir = path.join(PLUGINS_DIR, pkg.name, "skills");
  if (!fs.existsSync(skillsDir)) continue;

  const slugs = fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .map((d) => d.name)
    .sort();

  for (const slug of slugs) {
    const skillMd = path.join(skillsDir, slug, "SKILL.md");
    if (!fs.existsSync(skillMd)) continue;

    const { data } = matter(fs.readFileSync(skillMd, "utf8"));
    skills.push({
      slug,
      pkg: pkg.name,
      category: pkg.category,
      name: typeof data.name === "string" ? data.name : slug,
      description: firstSentence(data.description),
      requires: parseRequires(data.requires),
    });
    slugsByPackage[pkg.name].push(slug);
  }
}

pruneLegacy(slugsByPackage);

// Pacote de cada skill (pelo `name` de invocação, que é como `requires` aponta).
const packageOfName = new Map(skills.map((s) => [s.name, s.pkg]));

// Deps cruzadas entre pacotes: se uma skill do pacote X `requires` uma skill do
// pacote Y (Y≠X), X depende de Y. Ex.: /work (ship) requer /method (build) →
// furi-ship depende de furi-build. Dentro do mesmo pacote não há dep: ele já
// traz todas as skills. Só o manifesto do Claude Code tem esse campo — o schema
// do Agent Plugins v1 é `additionalProperties: false` e não define dependências.
function crossPackageDeps(pkgName) {
  const others = new Set();
  for (const s of skills) {
    if (s.pkg !== pkgName) continue;
    for (const req of s.requires) {
      const reqPkg = packageOfName.get(req);
      if (reqPkg && reqPkg !== pkgName) others.add(reqPkg);
    }
  }
  return [...others].sort().map((name) => ({ name }));
}

// 2ª passada: escreve os 3 manifestos de cada pacote + as entradas dos catálogos.
const claudePlugins = [];
const codexPlugins = [];

for (const pkg of PACKAGES) {
  const slugs = slugsByPackage[pkg.name];
  if (slugs.length === 0) continue;

  const pluginRoot = path.join(PLUGINS_DIR, pkg.name);
  const digest = contentVersion(pkg, slugs); // hash do dir: calcula 1×, usa nos 2 manifestos
  const deps = crossPackageDeps(pkg.name);

  // (1) Agent Plugins v1 — manifesto na RAIZ. Schema é additionalProperties:false,
  // então só os campos que ele define; as skills são descobertas por `skills/`.
  writeJson(path.join(pluginRoot, "plugin.json"), {
    $schema: AGENT_PLUGINS_SCHEMA,
    name: pkg.name,
    version: `${PACKAGE_VERSION}+${digest}`,
    description: pkg.description,
    author: { name: OWNER.name, url: REPO },
    homepage: HOMEPAGE,
    repository: REPO,
    license: LICENSE,
    keywords: pkg.keywords,
  });

  // (2) Claude Code — manifesto em .claude-plugin/. Sem `version` de propósito:
  // o versionamento é por git SHA (cada push é uma versão, sem bump manual). Sem
  // campo `skills`: o diretório `skills/` na raiz do plugin é sempre escaneado.
  const claudePlugin = {
    name: pkg.name,
    description: pkg.description,
    author: OWNER,
  };
  if (deps.length) claudePlugin.dependencies = deps;
  writeJson(path.join(pluginRoot, ".claude-plugin", "plugin.json"), claudePlugin);

  // (3) Codex — manifesto em .codex-plugin/, com `skills` apontando a pasta.
  writeJson(path.join(pluginRoot, ".codex-plugin", "plugin.json"), {
    name: pkg.name,
    version: `${PACKAGE_VERSION}+codex.${digest}`,
    description: pkg.description,
    author: { name: OWNER.name, url: "https://github.com/eduardofurihata" },
    homepage: HOMEPAGE,
    repository: REPO,
    license: LICENSE,
    keywords: pkg.keywords,
    skills: "./skills/",
    interface: {
      displayName: pkg.codex.displayName,
      shortDescription: pkg.codex.shortDescription,
      longDescription: pkg.codex.longDescription,
      developerName: OWNER.name,
      category: pkg.codex.category,
      capabilities: ["Interactive", "Write"],
      defaultPrompt: [pkg.codex.defaultPrompt],
      brandColor: pkg.codex.brandColor,
    },
  });

  claudePlugins.push({
    name: pkg.name,
    source: `./plugins/${pkg.name}`,
    description: pkg.description,
    category: pkg.category,
  });

  codexPlugins.push({
    name: pkg.name,
    source: { source: "local", path: `./plugins/${pkg.name}` },
    policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
    category: pkg.codex.category,
  });
}

claudePlugins.sort((a, b) => a.name.localeCompare(b.name));

writeJson(CLAUDE_MARKETPLACE_PATH, {
  name: MARKETPLACE_NAME,
  owner: OWNER,
  metadata: { description: MARKETPLACE_DESCRIPTION },
  plugins: claudePlugins,
});

writeJson(CODEX_MARKETPLACE_PATH, {
  name: MARKETPLACE_NAME,
  interface: { displayName: "LP Skills" },
  plugins: codexPlugins,
});

console.log(
  `generate-plugins: ${claudePlugins.length} pacotes × 3 manifestos (Agent Plugins + Claude Code + Codex) ` +
    `+ 2 marketplaces · ${skills.length} skills, 0 copiadas.`,
);
