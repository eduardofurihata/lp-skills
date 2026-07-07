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

// Passo 3: ligar o auto-update. Marketplace de terceiro nasce DESLIGADO. O jeito
// declarativo (e que sincroniza entre máquinas, porque vai no settings.json) é
// setar "autoUpdate": true na entrada do marketplace em extraKnownMarketplaces —
// é o MESMO campo que o toggle da UI grava. Como o prompt é colado no Claude
// Code, dá pra pedir pro próprio Claude fazer a edição.
const AUTOUPDATE_STEP = `3) Ligue o auto-update (novas versões entram sozinhas). Peça ao próprio Claude Code:
   «no meu ~/.claude/settings.json, na entrada "${MARKETPLACE}" dentro de "extraKnownMarketplaces", adicione "autoUpdate": true (cria a entrada se não existir)»`;

// Passo 4: confirmar que ligou (checar o settings.json, ou a tela do /plugin).
const VERIFY_STEP = `4) Confirme: a entrada "${MARKETPLACE}" no settings.json deve ficar com "autoUpdate": true.
   (Dá pra ver na UI também: /plugin → aba "Marketplaces" → "${MARKETPLACE}" mostra "Auto-update enabled".)`;

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
