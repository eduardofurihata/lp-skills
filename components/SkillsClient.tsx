"use client";

import { useMemo, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  CategoryFilter,
  type CategoryFilterValue,
} from "@/components/CategoryFilter";
import { SkillGrid } from "@/components/SkillGrid";
import { SkillGraph } from "@/components/SkillGraph";
import { BundleInstall } from "@/components/BundleInstall";
import type { Skill } from "@/lib/skills";
import { CATEGORIES } from "@/lib/categories";

interface SkillsClientProps {
  skills: Skill[];
}

export function SkillsClient({ skills }: SkillsClientProps) {
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilterValue>("all");

  const counts = useMemo<Record<CategoryFilterValue, number>>(() => {
    const c = {
      all: skills.length,
      ...Object.fromEntries(CATEGORIES.map((cat) => [cat, 0])),
    } as Record<CategoryFilterValue, number>;
    for (const s of skills) c[s.category] += 1;
    return c;
  }, [skills]);

  const visible = useMemo(
    () =>
      categoryFilter === "all"
        ? skills
        : skills.filter((s) => s.category === categoryFilter),
    [skills, categoryFilter],
  );

  return (
    <TooltipProvider delayDuration={150}>
      <main className="mx-auto w-full max-w-7xl px-6 pb-24 pt-12">
        <BundleInstall counts={counts} />
        {/* O grafo fica com a lista inteira e só REALÇA a categoria escolhida:
            tirar os outros nós levaria junto as arestas que dão o contexto. */}
        <SkillGraph skills={skills} categoryFilter={categoryFilter} />
        <div className="mb-6">
          <CategoryFilter
            value={categoryFilter}
            onChange={setCategoryFilter}
            counts={counts}
          />
        </div>
        <SkillGrid skills={visible} />
      </main>
    </TooltipProvider>
  );
}
