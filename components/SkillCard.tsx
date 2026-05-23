"use client";

import { Check, FileCode, BookOpen, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Skill } from "@/lib/skills";

interface SkillCardProps {
  skill: Skill;
  selected: boolean;
  onToggle: () => void;
}

export function SkillCard({ skill, selected, onToggle }: SkillCardProps) {
  return (
    <div
      role="checkbox"
      tabIndex={0}
      aria-checked={selected}
      aria-label={`Selecionar skill ${skill.name}`}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      className={cn(
        "group relative flex h-full w-full cursor-pointer flex-col gap-3 rounded-xl border bg-[color:var(--color-surface)] p-5 text-left transition-all duration-200 hover:bg-[color:var(--color-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]",
        selected
          ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)] ring-1 ring-[color:var(--color-accent)]/40"
          : "border-[color:var(--color-border)] hover:border-[color:var(--color-border-strong)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-mono text-base font-semibold leading-tight text-[color:var(--color-text)]">
            /{skill.name}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5">
            {skill.effort && (
              <Badge variant="accent" className="font-mono">
                effort: {skill.effort}
              </Badge>
            )}
            {skill.hasReferences && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded text-[color:var(--color-text-dim)]">
                    <BookOpen className="h-3.5 w-3.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Contém references/</TooltipContent>
              </Tooltip>
            )}
            {skill.hasScripts && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded text-[color:var(--color-text-dim)]">
                    <FileCode className="h-3.5 w-3.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Contém scripts/</TooltipContent>
              </Tooltip>
            )}
            {skill.hasData && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded text-[color:var(--color-text-dim)]">
                    <Database className="h-3.5 w-3.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Contém data/</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        <div
          aria-hidden="true"
          className={cn(
            "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
            selected
              ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent)] text-white"
              : "border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-2)] text-transparent",
          )}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </div>
      </div>
      <p className="line-clamp-4 text-sm leading-relaxed text-[color:var(--color-text-muted)]">
        {skill.description || "Sem descrição."}
      </p>
    </div>
  );
}
