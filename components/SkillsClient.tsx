"use client";

import { useCallback, useMemo, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  CategoryFilter,
  type CategoryFilterValue,
} from "@/components/CategoryFilter";
import { SkillGrid } from "@/components/SkillGrid";
import { StickyInstallBar } from "@/components/StickyInstallBar";
import type { Skill } from "@/lib/skills";
import type { Scope, InstallSkill } from "@/lib/install-prompt";

interface SkillsClientProps {
  skills: Skill[];
}

export function SkillsClient({ skills }: SkillsClientProps) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [scope, setScope] = useState<Scope>("global");
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilterValue>("all");

  const toggle = useCallback((slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);

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

  // Seleção deriva de TODAS as skills (não só as visíveis): trocar o filtro
  // não descarta uma skill selecionada que ficou oculta.
  const selectedSkills = useMemo<InstallSkill[]>(
    () =>
      skills
        .filter((s) => selected.has(s.slug))
        .map((s) => ({ slug: s.slug, category: s.category })),
    [skills, selected],
  );

  return (
    <TooltipProvider delayDuration={150}>
      <main className="mx-auto w-full max-w-7xl px-6 pb-32 pt-12">
        <div className="mb-6">
          <CategoryFilter
            value={categoryFilter}
            onChange={setCategoryFilter}
            counts={counts}
          />
        </div>
        <SkillGrid skills={visible} selected={selected} onToggle={toggle} />
      </main>
      <StickyInstallBar
        selectedSkills={selectedSkills}
        scope={scope}
        onScopeChange={setScope}
        onClear={clear}
      />
    </TooltipProvider>
  );
}
