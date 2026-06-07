"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORY_LABELS, type Category } from "@/lib/categories";

export type CategoryFilterValue = "all" | Category;

interface CategoryFilterProps {
  value: CategoryFilterValue;
  onChange: (value: CategoryFilterValue) => void;
  counts: Record<CategoryFilterValue, number>;
}

const TABS: { value: CategoryFilterValue; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "personal", label: CATEGORY_LABELS.personal },
  { value: "eduzz", label: CATEGORY_LABELS.eduzz },
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
