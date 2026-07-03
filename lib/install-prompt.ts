import type { Category } from "./categories";

// Bundle ("builder") — o plugin que empacota uma categoria inteira de skills.
// O marketplace tem só 2: furi-builder (pessoais) e eduzz-builder (trabalho).
// Não se instala skill isolada — instala-se o pacote, que já traz todas dentro.
export interface Bundle {
  name: string;
  label: string;
  category: Category;
}

// Repo/marketplace fonte das skills (Claude Code plugin marketplace).
const REPO_SLUG = "eduardofurihata/lp-skills";
const MARKETPLACE = "lp-skills";

// Os 2 pacotes (espelham os plugins gerados em skills/<cat>/.claude-plugin/).
export const BUNDLES: Bundle[] = [
  { name: "furi-builder", label: "Todas as pessoais", category: "personal" },
  {
    name: "eduzz-builder",
    label: "Todas de trabalho (Eduzz)",
    category: "eduzz",
  },
];

const INTRO =
  "Cole estes comandos no prompt do Claude Code — a caixa onde você conversa com ele, NÃO no terminal do sistema.";

const ADD_STEP = `1) Adicione o marketplace (uma vez por máquina):
   /plugin marketplace add ${REPO_SLUG}`;

const TEST_STEP =
  "3) Abra uma sessão NOVA do Claude Code (um CLI separado) e teste digitando uma skill do pacote — ex.: /method";

const UPDATE_FOOTER =
  "Para atualizar depois, quando houver versão nova: /plugin marketplace update";

// Comandos `/plugin` para instalar um pacote inteiro. Instalar o pacote traz
// TODAS as skills dentro dele; cada skill é chamada pelo nome curto (/method,
// /jira). eduzz-builder puxa o furi-builder junto (dependência declarada).
export function generateBundlePrompt(bundle: Bundle): string {
  return `${INTRO}

${ADD_STEP}

2) Instale o pacote "${bundle.name}" — traz todas as skills (${bundle.label}):
   /plugin install ${bundle.name}@${MARKETPLACE}

${TEST_STEP}

${UPDATE_FOOTER}`;
}
