#!/usr/bin/env bash
# Projeto-alvo mínimo: um leitor de skills com UMA função exportada.
# A função perguntada no prompt (resolveSkillGraphEdges) NÃO existe — de propósito.
set -euo pipefail
mkdir -p lib
cat > lib/skills.ts <<'TS'
import fs from "node:fs";
import path from "node:path";

export type Skill = { slug: string; name: string };

/** Lê uma skill pelo slug; sem SKILL.md → null. */
export function readSkill(dir: string, slug: string): Skill | null {
  const file = path.join(dir, slug, "SKILL.md");
  if (!fs.existsSync(file)) return null;
  return { slug, name: slug };
}

export function listSkills(dir: string): Skill[] {
  return fs
    .readdirSync(dir)
    .map((slug) => readSkill(dir, slug))
    .filter((s): s is Skill => s !== null);
}
TS
cat > lib/graph.ts <<'TS'
import type { Skill } from "./skills";

export type Edge = { from: string; to: string };

export function edgesFor(skills: Skill[]): Edge[] {
  return skills.map((s) => ({ from: s.slug, to: "solve" }));
}
TS
