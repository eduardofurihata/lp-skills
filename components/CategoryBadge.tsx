import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, type Category } from "@/lib/categories";

// Owner do mapeamento categoria → cor. Badge fica genérico (variant="none");
// aqui mora a decisão visual: Pessoal sóbrio, Eduzz esmeralda (distinto do
// roxo de seleção, pra não confundir categoria com estado selecionado).
const categoryClasses: Record<Category, string> = {
  personal:
    "bg-[color:var(--color-surface-2)] text-[color:var(--color-text-muted)]",
  eduzz: "bg-[color:var(--color-eduzz-soft)] text-[color:var(--color-eduzz)]",
};

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <Badge variant="none" className={categoryClasses[category]}>
      {CATEGORY_LABELS[category]}
    </Badge>
  );
}
