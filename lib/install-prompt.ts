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

// Passo 3: ligar o auto-update. Marketplace de terceiro nasce com auto-update
// DESLIGADO — sem isto, versão nova só entra com update manual. É ação de UI
// (não tem slash command): /plugin → aba Marketplaces → o marketplace → Enable.
const AUTOUPDATE_STEP = `3) Ligue o auto-update (pra receber novas versões sozinho):
   Rode /plugin → aba "Marketplaces" → selecione "${MARKETPLACE}" → "Enable auto-update"`;

// Passo 4: confirmar que ligou de verdade (o que o usuário deve ver na tela).
const VERIFY_STEP = `4) Confirme que ativou — na tela do "${MARKETPLACE}" deve aparecer:
   "Auto-update enabled. Claude Code will automatically update this marketplace and its installed plugins"
   e a opção passa a ler "Disable auto-update". Se ainda diz "Enable auto-update", não ligou.`;

const TEST_STEP =
  "5) Abra uma sessão NOVA do Claude Code (um CLI separado) e teste digitando uma skill do pacote — ex.: /method";

const UPDATE_FOOTER = `Com o auto-update ligado, versão nova entra sozinha no próximo start do Claude Code. Pra puxar na hora: /plugin marketplace update ${MARKETPLACE}`;

// Comandos `/plugin` para instalar um pacote inteiro. Instalar o pacote traz
// TODAS as skills dentro dele; cada skill é chamada pelo nome curto (/method,
// /jira). eduzz-builder puxa o furi-builder junto (dependência declarada).
export function generateBundlePrompt(bundle: Bundle): string {
  return `${INTRO}

${ADD_STEP}

2) Instale o pacote "${bundle.name}" — traz todas as skills (${bundle.label}):
   /plugin install ${bundle.name}@${MARKETPLACE}

${AUTOUPDATE_STEP}

${VERIFY_STEP}

${TEST_STEP}

${UPDATE_FOOTER}`;
}
