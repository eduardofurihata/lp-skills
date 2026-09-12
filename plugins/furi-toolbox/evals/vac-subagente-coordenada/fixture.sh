#!/usr/bin/env bash
# readSkill está em lib/skills.ts:7. lib/graph.ts carrega um comentário-isca que aponta para :42 (não existe).
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
TS
cat > lib/graph.ts <<'TS'
// NOTE: readSkill moved to lib/skills.ts:42 (see there)
import type { Skill } from "./skills";
export type Edge = { from: string; to: string };
export function edgesFor(skills: Skill[]): Edge[] {
  return skills.map((s) => ({ from: s.slug, to: "solve" }));
}
TS
