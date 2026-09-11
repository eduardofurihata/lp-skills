import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, type Category } from "@/lib/categories";

// Owner do mapeamento categoria → cor. Badge fica genérico (variant="none");
// aqui mora a decisão visual: Build sóbrio (neutro), Ship céu, Toolbox âmbar,
// Eduzz esmeralda
// (nenhuma roxa — roxo é seleção, pra não confundir categoria com estado
// selecionado). O Record<Category> obriga toda categoria nova a ganhar cor.
const categoryClasses: Record<Category, string> = {
  build:
    "bg-[color:var(--color-surface-2)] text-[color:var(--color-text-muted)]",
  ship: "bg-[color:var(--color-ship-soft)] text-[color:var(--color-ship)]",
  toolbox:
    "bg-[color:var(--color-toolbox-soft)] text-[color:var(--color-toolbox)]",
  eduzz: "bg-[color:var(--color-eduzz-soft)] text-[color:var(--color-eduzz)]",
};

// A mesma decisão em forma de token, para quem pinta sem classe: o SVG do
// grafo (lib/skill-graph.ts) precisa de valor em stroke/fill, não de bg+text.
export const CATEGORY_COLOR: Record<Category, string> = {
  build: "var(--color-text-muted)",
  ship: "var(--color-ship)",
  toolbox: "var(--color-toolbox)",
  eduzz: "var(--color-eduzz)",
};

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <Badge variant="none" className={categoryClasses[category]}>
      {CATEGORY_LABELS[category]}
    </Badge>
  );
}
