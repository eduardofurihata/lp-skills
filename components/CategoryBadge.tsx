import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, type Category } from "@/lib/categories";

// Owner do mapeamento categoria → cor. Badge fica genérico (variant="none");
// aqui mora a decisão visual: Pessoal sóbrio, Toolbox âmbar, Eduzz esmeralda
// (nenhuma roxa — roxo é seleção, pra não confundir categoria com estado
// selecionado). O Record<Category> obriga toda categoria nova a ganhar cor.
const categoryClasses: Record<Category, string> = {
  personal:
    "bg-[color:var(--color-surface-2)] text-[color:var(--color-text-muted)]",
  toolbox:
    "bg-[color:var(--color-toolbox-soft)] text-[color:var(--color-toolbox)]",
  eduzz: "bg-[color:var(--color-eduzz-soft)] text-[color:var(--color-eduzz)]",
};

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <Badge variant="none" className={categoryClasses[category]}>
      {CATEGORY_LABELS[category]}
    </Badge>
  );
}
