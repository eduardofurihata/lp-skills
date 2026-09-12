// Módulo PURO (sem node:*) — seguro no bundle client e no server.
// Owner do conceito de categoria, compartilhado por skills.ts (server),
// install-prompt.ts (client) e componentes. Cada categoria = 1 pacote em
// plugins/<pacote>/ = 1 entrada no marketplace; as skills dela moram em
// plugins/<pacote>/skills/<slug>/. Quem itera categorias lê CATEGORIES, nunca
// lista os ids na mão. Categoria nova = entrada em PACKAGES de
// scripts/generate-plugins.mjs (a fonte) + label aqui + cor em CategoryBadge.
import marketplace from "../.claude-plugin/marketplace.json";

export type Category = "build" | "ship" | "toolbox";

// Ordem de exibição na LP (o catálogo gerado é ordenado por nome de pacote).
export const CATEGORIES: Category[] = ["build", "ship", "toolbox"];

export const CATEGORY_LABELS: Record<Category, string> = {
  build: "Build",
  ship: "Ship",
  toolbox: "Toolbox",
};

// Pacote (diretório em plugins/) de cada categoria — DERIVADO do marketplace
// gerado, para o nome do pacote nunca divergir do que o gerador escreveu.
export const CATEGORY_PACKAGE = Object.fromEntries(
  marketplace.plugins.map((p) => [p.category, p.name]),
) as Record<Category, string>;
