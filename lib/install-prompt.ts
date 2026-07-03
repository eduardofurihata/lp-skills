import type { Category } from "./categories";

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

// Bundle ("builder") — plugin agregador que instala uma categoria inteira.
export interface Bundle {
  name: string;
  label: string;
  category: Category;
}

// Repo/marketplace fonte das skills (Claude Code plugin marketplace).
const REPO_SLUG = "eduardofurihata/lp-skills";
const MARKETPLACE = "lp-skills";

// Bundles disponíveis (espelham os plugins agregadores gerados em bundles/).
export const BUNDLES: Bundle[] = [
  { name: "furi-builder", label: "Todas as pessoais", category: "personal" },
  { name: "eduzz-builder", label: "Todas de trabalho (Eduzz)", category: "eduzz" },
];

const INTRO =
  "Cole estes comandos no prompt do Claude Code — a caixa onde você conversa com ele, NÃO no terminal do sistema.";

const ADD_STEP = `1) Adicione o marketplace (uma vez por máquina):
   /plugin marketplace add ${REPO_SLUG}`;

const TEST_STEP =
  "3) Abra uma sessão NOVA do Claude Code (um CLI separado) e teste digitando a skill — ex.: /method";

const UPDATE_FOOTER =
  "Para atualizar depois, quando houver versão nova: /plugin marketplace update";

// Fecho transitivo das dependências: dado o que o usuário selecionou, retorna
// a lista (deduplicada) de skills a instalar — já incluindo as `requires`
// (ex.: jira puxa method; afl puxa jira → method). O Claude Code também resolve
// deps na instalação, mas expandir aqui deixa a lista explícita no comando.
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

// Comandos `/plugin` para instalar skills individuais (deps já expandidas).
// Instalação via marketplace nativo: o Claude Code clona e COPIA o plugin pro
// cache per-OS (funciona igual em Windows/macOS/Linux — sem symlink, sem hook).
export function generatePrompt({ skills }: { skills: InstallSkill[] }): string {
  if (skills.length === 0) {
    return "Selecione ao menos 1 skill para gerar os comandos.";
  }

  const installLines = skills
    .map((s) => `   /plugin install ${s.slug}@${MARKETPLACE}`)
    .join("\n");

  return `${INTRO}

${ADD_STEP}

2) Instale as skills (as dependências entram automaticamente):
${installLines}

${TEST_STEP}

${UPDATE_FOOTER}`;
}

// Comandos `/plugin` para instalar um bundle inteiro (uma categoria de uma vez).
export function generateBundlePrompt(bundle: Bundle): string {
  return `${INTRO}

${ADD_STEP}

2) Instale o pacote "${bundle.name}" — traz todas as skills (${bundle.label}):
   /plugin install ${bundle.name}@${MARKETPLACE}

${TEST_STEP}

${UPDATE_FOOTER}`;
}
