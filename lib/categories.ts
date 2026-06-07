// Módulo PURO (sem node:*) — seguro no bundle client e no server.
// Owner do conceito de categoria, compartilhado por skills.ts (server),
// install-prompt.ts (client) e componentes.

export type Category = "personal" | "eduzz";

export const CATEGORIES: Category[] = ["personal", "eduzz"];

export const CATEGORY_LABELS: Record<Category, string> = {
  personal: "Pessoal",
  eduzz: "Eduzz",
};
