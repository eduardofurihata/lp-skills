"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SCOPE_DESCRIPTIONS,
  type Scope,
} from "@/lib/install-prompt";

interface ScopeSelectorProps {
  value: Scope;
  onChange: (scope: Scope) => void;
}

const TABS: { value: Scope; label: string }[] = [
  { value: "global", label: "Global" },
  { value: "project-shared", label: "Projeto" },
  { value: "project-local", label: "Projeto (local)" },
];

export function ScopeSelector({ value, onChange }: ScopeSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <Tabs value={value} onValueChange={(v) => onChange(v as Scope)}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <p className="px-1 text-xs text-[color:var(--color-text-muted)]">
        {SCOPE_DESCRIPTIONS[value]}
      </p>
    </div>
  );
}
