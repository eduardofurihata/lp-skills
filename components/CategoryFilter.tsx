"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  type Category,
} from "@/lib/categories";

export type CategoryFilterValue = "all" | Category;

interface CategoryFilterProps {
  value: CategoryFilterValue;
  onChange: (value: CategoryFilterValue) => void;
  counts: Record<CategoryFilterValue, number>;
}

// "Todas" + uma aba por categoria, na ordem de CATEGORIES (nunca listadas na mão).
const TABS: { value: CategoryFilterValue; label: string }[] = [
  { value: "all", label: "Todas" },
  ...CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] })),
];

export function CategoryFilter({
  value,
  onChange,
  counts,
}: CategoryFilterProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onChange(v as CategoryFilterValue)}
    >
      <TabsList className="max-w-md">
        {TABS.map((t) => (
          <TabsTrigger key={t.value} value={t.value}>
            {t.label}
            <span className="ml-1.5 text-[color:var(--color-text-dim)]">
              {counts[t.value]}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
