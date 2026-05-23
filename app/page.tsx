import { Hero } from "@/components/Hero";
import { SkillsClient } from "@/components/SkillsClient";
import { getSkills } from "@/lib/skills";

export const revalidate = 300;

export default async function HomePage() {
  const skills = await getSkills();

  return (
    <>
      <Hero count={skills.length} />
      <SkillsClient skills={skills} />
    </>
  );
}
