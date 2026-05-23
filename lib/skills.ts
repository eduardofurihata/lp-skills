import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export interface Skill {
  slug: string;
  name: string;
  description: string;
  effort?: string;
  argumentHint?: string;
  hasReferences: boolean;
  hasScripts: boolean;
  hasData: boolean;
}

const SKILLS_DIR = path.resolve(process.cwd(), "skills");

export async function getSkills(): Promise<Skill[]> {
  let entries: import("node:fs").Dirent[];
  try {
    entries = await fs.readdir(SKILLS_DIR, { withFileTypes: true });
  } catch {
    return [];
  }

  const skillDirs = entries.filter(
    (e) => e.isDirectory() && !e.name.startsWith("."),
  );

  const skills = await Promise.all(
    skillDirs.map(async (dir): Promise<Skill | null> => {
      const skillPath = path.join(SKILLS_DIR, dir.name);
      const skillFile = path.join(skillPath, "SKILL.md");
      try {
        const content = await fs.readFile(skillFile, "utf-8");
        const { data } = matter(content);
        const subdirs = await fs.readdir(skillPath, { withFileTypes: true });
        return {
          slug: dir.name,
          name: typeof data.name === "string" ? data.name : dir.name,
          description:
            typeof data.description === "string" ? data.description : "",
          effort: typeof data.effort === "string" ? data.effort : undefined,
          argumentHint:
            typeof data["argument-hint"] === "string"
              ? data["argument-hint"]
              : undefined,
          hasReferences: subdirs.some(
            (d) => d.isDirectory() && d.name === "references",
          ),
          hasScripts: subdirs.some(
            (d) => d.isDirectory() && d.name === "scripts",
          ),
          hasData: subdirs.some((d) => d.isDirectory() && d.name === "data"),
        };
      } catch {
        return null;
      }
    }),
  );

  return skills
    .filter((s): s is Skill => s !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}
