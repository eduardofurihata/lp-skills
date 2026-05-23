"use client";

import { ClipboardCopy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScopeSelector } from "@/components/ScopeSelector";
import { InstallPromptViewer } from "@/components/InstallPromptViewer";
import { SCOPE_LABELS, type Scope } from "@/lib/install-prompt";

interface StickyInstallBarProps {
  selectedSlugs: string[];
  scope: Scope;
  onScopeChange: (scope: Scope) => void;
  onClear: () => void;
}

export function StickyInstallBar({
  selectedSlugs,
  scope,
  onScopeChange,
  onClear,
}: StickyInstallBarProps) {
  const count = selectedSlugs.length;
  const hasSelection = count > 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Sparkles
            className="h-4 w-4 text-[color:var(--color-accent)]"
            aria-hidden="true"
          />
          <p className="text-sm text-[color:var(--color-text)]">
            {hasSelection ? (
              <>
                <span className="font-semibold">{count}</span> skill
                {count > 1 ? "s" : ""} selecionada{count > 1 ? "s" : ""}
                <span className="ml-2 text-[color:var(--color-text-muted)]">
                  · escopo {SCOPE_LABELS[scope]}
                </span>
              </>
            ) : (
              <span className="text-[color:var(--color-text-muted)]">
                Selecione skills para gerar o prompt de instalação.
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasSelection && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              Limpar
            </Button>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="accent"
                size="md"
                disabled={!hasSelection}
                aria-label="Abrir prompt de instalação"
              >
                <ClipboardCopy className="h-4 w-4" />
                Gerar prompt
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Prompt de instalação</DialogTitle>
                <DialogDescription>
                  Escolha o escopo e copie o prompt para colar no seu Claude
                  Code.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <ScopeSelector value={scope} onChange={onScopeChange} />
                <InstallPromptViewer skills={selectedSlugs} scope={scope} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
