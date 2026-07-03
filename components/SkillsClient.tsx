"use client";

import { useMemo, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  CategoryFilter,
  type CategoryFilterValue,
} from "@/components/CategoryFilter";
import { SkillGrid } from "@/components/SkillGrid";
import { BundleInstall } from "@/components/BundleInstall";
import type { Skill } from "@/lib/skills";

interface SkillsClientProps {
  skills: Skill[];
}

export function SkillsClient({ skills }: SkillsClientProps) {
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilterValue>("all");

  const counts = useMemo<Record<CategoryFilterValue, number>>(() => {
    const c: Record<CategoryFilterValue, number> = {
      all: skills.length,
      personal: 0,
      eduzz: 0,
    };
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
