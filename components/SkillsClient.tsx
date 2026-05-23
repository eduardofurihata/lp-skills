"use client";

import { useCallback, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SkillGrid } from "@/components/SkillGrid";
import { StickyInstallBar } from "@/components/StickyInstallBar";
import type { Skill } from "@/lib/skills";
import type { Scope } from "@/lib/install-prompt";

interface SkillsClientProps {
  skills: Skill[];
}

export function SkillsClient({ skills }: SkillsClientProps) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [scope, setScope] = useState<Scope>("global");

  const toggle = useCallback((slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);

  const selectedSlugs = skills
    .filter((s) => selected.has(s.slug))
    .map((s) => s.slug);

  return (
    <TooltipProvider delayDuration={150}>
      <main className="mx-auto w-full max-w-7xl px-6 pb-32 pt-12">
        <SkillGrid skills={skills} selected={selected} onToggle={toggle} />
      </main>
      <StickyInstallBar
        selectedSlugs={selectedSlugs}
        scope={scope}
        onScopeChange={setScope}
        onClear={clear}
      />
    </TooltipProvider>
  );
}
