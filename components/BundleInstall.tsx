"use client";

import { Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InstallPromptViewer } from "@/components/InstallPromptViewer";
import { BUNDLES, generateBundlePrompt } from "@/lib/install-prompt";
import type { Category } from "@/lib/categories";

interface BundleInstallProps {
  counts: Record<Category, number>;
}

// A instalação da LP: escolher 1 dos 2 pacotes. Cada pacote é um plugin que já
// traz todas as skills da categoria dentro — não existe install por skill.
export function BundleInstall({ counts }: BundleInstallProps) {
  return (
    <section className="mb-8 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
      <div className="mb-4 flex items-center gap-2">
        <Package
          className="h-4 w-4 shrink-0 text-[color:var(--color-accent)]"
          aria-hidden="true"
        />
        <h2 className="text-sm font-semibold text-[color:var(--color-text)]">
          Instale um pacote — já vem com todas as skills dentro
        </h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {BUNDLES.map((bundle) => (
          <Dialog key={bundle.name}>
            <DialogTrigger asChild>
              <button
                type="button"
                aria-label={`Instalar pacote ${bundle.name}`}
                className="flex flex-col gap-1 rounded-lg border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-2)] p-4 text-left transition-colors hover:border-[color:var(--color-accent)] hover:bg-[color:var(--color-accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-semibold text-[color:var(--color-text)]">
                    {bundle.name}
                  </span>
                  <span className="text-xs text-[color:var(--color-text-muted)]">
                    {counts[bundle.category]} skills
                  </span>
                </span>
                <span className="text-xs text-[color:var(--color-text-muted)]">
                  {bundle.label}
                </span>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Pacote {bundle.name}</DialogTitle>
                <DialogDescription>
                  {bundle.label} ({counts[bundle.category]} skills). Cole no
                  prompt do Claude Code (onde você digita, não no terminal).
                </DialogDescription>
              </DialogHeader>
              <InstallPromptViewer prompt={generateBundlePrompt(bundle)} />
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </section>
  );
}
