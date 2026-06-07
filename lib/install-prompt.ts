import type { Category } from "./categories";

export type Scope = "global" | "project-shared" | "project-local";

export interface InstallSkill {
  slug: string;
  category: Category;
}

// Nó do catálogo usado para resolver dependências (subconjunto de Skill).
export interface SkillNode {
  slug: string;
  category: Category;
  requires: string[];
}

export const SCOPE_LABELS: Record<Scope, string> = {
  global: "Global",
  "project-shared": "Projeto (compartilhado)",
  "project-local": "Projeto (local — só pra mim)",
};

export const SCOPE_DESCRIPTIONS: Record<Scope, string> = {
  global: "Instala em ~/.claude/skills/. Disponível em todos os projetos.",
  "project-shared":
    "Instala em <projeto>/.claude/skills/. Vai pro git do projeto, todo o time tem.",
  "project-local":
    "Instala em <projeto>/.claude/skills/ + adiciona ao .gitignore. Só pra você.",
};

const REPO_URL = "https://github.com/eduardofurihata/lp-skills";
const SOURCE_DIR = "~/.claude/lp-skills-source";

// Fecho transitivo das dependências: dado o que o usuário selecionou, retorna
// a lista (deduplicada) de skills a instalar — cada uma com seu bucket — já
// incluindo as `requires` (ex.: jira puxa method; afl puxa jira → method).
export function expandDeps(
  selectedSlugs: string[],
  catalog: SkillNode[],
): InstallSkill[] {
  const bySlug = new Map(catalog.map((s) => [s.slug, s]));
  const out = new Map<string, InstallSkill>();

  const visit = (slug: string) => {
    if (out.has(slug)) return;
    const node = bySlug.get(slug);
    if (!node) return; // dependência fora do catálogo — ignora
    out.set(slug, { slug: node.slug, category: node.category });
    for (const dep of node.requires) visit(dep);
  };

  for (const slug of selectedSlugs) visit(slug);
  return [...out.values()];
}

export function generatePrompt({
  skills,
  scope,
}: {
  skills: InstallSkill[];
  scope: Scope;
}): string {
  if (skills.length === 0) {
    return "Selecione ao menos 1 skill para gerar o prompt.";
  }

  const skillList = skills.map((s) => s.slug).join(", ");
  const header = headerFor(scope, skillList);
  const steps = stepsFor(scope, skills);

  return `${header}\n\n${steps}`.trim();
}

function headerFor(scope: Scope, skillList: string): string {
  return `Por favor, instale estas skills do Claude Code do repositório público de Furihata.

- Repositório: ${REPO_URL}
- Skills a instalar (dependências já resolvidas): ${skillList}
- Escopo: ${SCOPE_LABELS[scope]}

Execute todos os passos abaixo. Reporte sucesso ou erros ao final.`;
}

function stepsFor(scope: Scope, skills: InstallSkill[]): string {
  const targetBaseExpr = targetBaseFor(scope);
  const preSteps = preStepsFor(scope);
  const symlinkBlock = symlinkBlockFor(skills, targetBaseExpr);

  return [
    preSteps,
    `1. Clone ou atualize o repositório fonte (uma única vez por máquina):

   if [ ! -d ${SOURCE_DIR} ]; then
     git clone ${REPO_URL} ${SOURCE_DIR}
   else
     git -C ${SOURCE_DIR} pull --ff-only
   fi`,
    symlinkBlock,
    `3. Configure auto-update em ~/.claude/settings.json:

   - No bloco hooks.SessionStart, adicione o hook abaixo (se ainda não existir):

   {
     "matcher": "",
     "hooks": [
       {
         "type": "command",
         "command": "git -C ${SOURCE_DIR} pull --ff-only -q 2>/dev/null &"
       }
     ]
   }

   - Não duplicar se já houver hook idêntico.`,
    `4. Verifique a instalação:

   ls -la ${targetBaseExpr}/ | grep lp-skills-source

5. Reporte ao usuário: skills instaladas, conflitos resolvidos, hook adicionado.`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function targetBaseFor(scope: Scope): string {
  switch (scope) {
    case "global":
      return "~/.claude/skills";
    case "project-shared":
    case "project-local":
      return "$(pwd)/.claude/skills";
  }
}

function preStepsFor(scope: Scope): string {
  if (scope === "global") return "";
  const projectSteps = [
    `0. Garanta que você está na raiz do projeto e que o diretório .claude/skills/ existe:

   mkdir -p .claude/skills`,
  ];
  if (scope === "project-local") {
    projectSteps.push(
      `0a. Adicione .claude/skills/ ao .gitignore (se ainda não estiver), para que essas skills fiquem só pra você:

   if [ -f .gitignore ] && ! grep -qxF '.claude/skills/' .gitignore; then
     echo '.claude/skills/' >> .gitignore
   fi`,
    );
  }
  return projectSteps.join("\n\n");
}

// Source-path inclui o bucket da categoria; destino do symlink continua plano
// (~/.claude/skills/<slug>), pois o Claude Code carrega skills de um nível só.
function symlinkBlockFor(skills: InstallSkill[], targetBase: string): string {
  const lines = skills
    .map(
      ({ slug, category }) =>
        `   - Se ${targetBase}/${slug} já é um diretório real (não symlink), faça:
       mv ${targetBase}/${slug} ${targetBase}/${slug}.backup-$(date +%s)
     Em seguida (sempre):
       ln -sfn ${SOURCE_DIR}/skills/${category}/${slug} ${targetBase}/${slug}`,
    )
    .join("\n\n");

  return `2. Para cada skill a instalar (incluindo dependências), crie um symlink em ${targetBase}/:

${lines}`;
}
