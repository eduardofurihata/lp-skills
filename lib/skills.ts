import fs from "node:fs/promises";
import path from "node:path";
import type { Dirent } from "node:fs";
import matter from "gray-matter";
import { CATEGORIES, type Category } from "./categories";

export interface Skill {
  slug: string;
  name: string;
  description: string;
  effort?: string;
  argumentHint?: string;
  hasReferences: boolean;
  hasScripts: boolean;
  hasData: boolean;
  category: Category;
}

const SKILLS_DIR = path.resolve(process.cwd(), "skills");

export async function getSkills(): Promise<Skill[]> {
  const buckets = await Promise.all(CATEGORIES.map(readBucket));
  return buckets.flat().sort((a, b) => a.name.localeCompare(b.name));
}

// Lê um bucket (skills/<category>/*). Bucket ausente/vazio → [].
async function readBucket(category: Category): Promise<Skill[]> {
  const bucketDir = path.join(SKILLS_DIR, category);
  let entries: Dirent[];
  try {
    entries = await fs.readdir(bucketDir, { withFileTypes: true });
  } catch {
    return [];
  }

  const skills = await Promise.all(
    entries
      .filter((e) => e.isDirectory() && !e.name.startsWith("."))
      .map((dir) => readSkill(category, dir.name)),
  );

  return skills.filter((s): s is Skill => s !== null);
}

// Lê uma skill. Sem SKILL.md (ou frontmatter inválido) → null (ignorada).
async function readSkill(
  category: Category,
  slug: string,
): Promise<Skill | null> {
  const skillPath = path.join(SKILLS_DIR, category, slug);
  try {
    const content = await fs.readFile(path.join(skillPath, "SKILL.md"), "utf-8");
    const { data } = matter(content);
    const subdirs = await fs.readdir(skillPath, { withFileTypes: true });
    const hasDir = (name: string) =>
      subdirs.some((d) => d.isDirectory() && d.name === name);

    return {
      slug,
      name: typeof data.name === "string" ? data.name : slug,
      description: typeof data.description === "string" ? data.description : "",
      effort: typeof data.effort === "string" ? data.effort : undefined,
      argumentHint:
        typeof data["argument-hint"] === "string"
          ? data["argument-hint"]
          : undefined,
      hasReferences: hasDir("references"),
      hasScripts: hasDir("scripts"),
      hasData: hasDir("data"),
      category,
    };
  } catch {
    return null;
  }
}
