// Módulo PURO (sem node:*) — seguro no bundle client e no server.
// Owner do conceito de categoria, compartilhado por skills.ts (server),
// install-prompt.ts (client) e componentes. Cada categoria = 1 pasta em
// skills/<cat>/ = 1 plugin no marketplace. Quem itera categorias lê CATEGORIES,
// nunca lista os ids na mão. Categoria nova = entrada aqui + cor em
// CategoryBadge + bundle em install-prompt.ts + builder em
// scripts/generate-plugins.mjs (o .mjs não importa este módulo).

export type Category = "personal" | "toolbox" | "eduzz";

export const CATEGORIES: Category[] = ["personal", "toolbox", "eduzz"];

export const CATEGORY_LABELS: Record<Category, string> = {
  personal: "Pessoal",
  toolbox: "Toolbox",
  eduzz: "Eduzz",
};
