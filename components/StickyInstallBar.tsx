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
import { InstallPromptViewer } from "@/components/InstallPromptViewer";
import { generatePrompt, type InstallSkill } from "@/lib/install-prompt";

interface StickyInstallBarProps {
  installSkills: InstallSkill[];
  selectedCount: number;
  autoAddedSlugs: string[];
  onClear: () => void;
}

export function StickyInstallBar({
  installSkills,
  selectedCount,
  autoAddedSlugs,
  onClear,
}: StickyInstallBarProps) {
  const hasSelection = selectedCount > 0;

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
                <span className="font-semibold">{selectedCount}</span> skill
                {selectedCount > 1 ? "s" : ""} selecionada
                {selectedCount > 1 ? "s" : ""}
                {autoAddedSlugs.length > 0 && (
                  <span className="ml-2 text-[color:var(--color-text-muted)]">
                    + {autoAddedSlugs.join(", ")} (dependência
                    {autoAddedSlugs.length > 1 ? "s" : ""})
                  </span>
                )}
              </>
            ) : (
              <span className="text-[color:var(--color-text-muted)]">
                Selecione skills para gerar os comandos de instalação.
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
                aria-label="Abrir comandos de instalação"
              >
                <ClipboardCopy className="h-4 w-4" />
                Gerar comandos
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Comandos de instalação</DialogTitle>
                <DialogDescription>
                  Cole no seu Claude Code, em qualquer sistema operacional. As
                  dependências (ex.: o /method) entram automaticamente.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <InstallPromptViewer
                  prompt={generatePrompt({ skills: installSkills })}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
