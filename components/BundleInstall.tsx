"use client";

import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
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

// Atalho pra instalar uma categoria inteira de uma vez (bundles furi-builder /
// eduzz-builder), sem precisar selecionar skill por skill.
export function BundleInstall({ counts }: BundleInstallProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Package
          className="h-4 w-4 shrink-0 text-[color:var(--color-accent)]"
          aria-hidden="true"
        />
        <p className="text-sm text-[color:var(--color-text)]">
          Não quer escolher uma a uma? Instale um{" "}
          <span className="font-semibold">pacote inteiro</span>.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {BUNDLES.map((bundle) => (
          <Dialog key={bundle.name}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                aria-label={`Instalar pacote ${bundle.name}`}
              >
                {bundle.name}
                <span className="text-[color:var(--color-text-muted)]">
                  · {counts[bundle.category]}
                </span>
              </Button>
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
    </div>
  );
}
