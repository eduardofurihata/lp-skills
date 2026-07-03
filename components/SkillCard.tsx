"use client";

import { FileCode, BookOpen, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CategoryBadge } from "@/components/CategoryBadge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Skill } from "@/lib/skills";

interface SkillCardProps {
  skill: Skill;
}

// Card informativo (vitrine): mostra a skill que vem dentro do pacote. Sem
// seleção/checkbox — a instalação é por pacote inteiro, não por skill.
export function SkillCard({ skill }: SkillCardProps) {
  return (
    <div className="group relative flex h-full w-full flex-col gap-3 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 text-left transition-colors duration-200 hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-surface-2)]">
      <div className="flex flex-col gap-1.5">
        <h3 className="font-mono text-base font-semibold leading-tight text-[color:var(--color-text)]">
          /{skill.name}
        </h3>
        <div className="flex flex-wrap items-center gap-1.5">
          <CategoryBadge category={skill.category} />
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
      <p className="line-clamp-4 text-sm leading-relaxed text-[color:var(--color-text-muted)]">
        {skill.description || "Sem descrição."}
      </p>
    </div>
  );
}
