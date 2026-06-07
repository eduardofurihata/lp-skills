"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  generatePrompt,
  type Scope,
  type InstallSkill,
} from "@/lib/install-prompt";

interface InstallPromptViewerProps {
  skills: InstallSkill[];
  scope: Scope;
}

export function InstallPromptViewer({ skills, scope }: InstallPromptViewerProps) {
  const prompt = useMemo(
    () => generatePrompt({ skills, scope }),
    [skills, scope],
  );
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      toast.success("Prompt copiado para o clipboard.");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const fallback = document.createElement("textarea");
      fallback.value = prompt;
      fallback.style.position = "fixed";
      fallback.style.opacity = "0";
      document.body.appendChild(fallback);
      fallback.select();
      try {
        document.execCommand("copy");
        toast.success("Prompt copiado (fallback).");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Não foi possível copiar. Selecione o texto manualmente.");
      } finally {
        document.body.removeChild(fallback);
      }
      console.error(err);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)]">
      <div className="flex items-center justify-between gap-2 border-b border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-2)] px-4 py-2">
        <span className="font-mono text-xs text-[color:var(--color-text-muted)]">
          prompt para colar no Claude Code
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          disabled={skills.length === 0}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copiar
            </>
          )}
        </Button>
      </div>
      <pre
        className="max-h-[60vh] overflow-auto px-4 py-4 font-mono text-xs leading-relaxed text-[color:var(--color-text)] whitespace-pre-wrap break-words"
        aria-label="Prompt de instalação"
      >
        {prompt}
      </pre>
    </div>
  );
}
