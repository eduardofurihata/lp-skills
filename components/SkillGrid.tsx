"use client";

import { SkillCard } from "@/components/SkillCard";
import type { Skill } from "@/lib/skills";

interface SkillGridProps {
  skills: Skill[];
  selected: Set<string>;
  onToggle: (slug: string) => void;
}

export function SkillGrid({ skills, selected, onToggle }: SkillGridProps) {
  if (skills.length === 0) {
    return (
      <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-12 text-center">
        <p className="text-sm text-[color:var(--color-text-muted)]">
          Nenhuma skill encontrada. Rode o sync para popular o repositório.
        </p>
      </div>
    );
  }

  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      {skills.map((skill, i) => (
        <li
          key={skill.slug}
          className="fade-up"
          style={{ animationDelay: `${Math.min(i * 30, 600)}ms` }}
        >
          <SkillCard
            skill={skill}
            selected={selected.has(skill.slug)}
            onToggle={() => onToggle(skill.slug)}
          />
        </li>
      ))}
    </ul>
  );
}
