import { CATEGORY_PACKAGE, type Category } from "./categories";

// Bundle ("builder") — o plugin que empacota uma categoria inteira de skills.
// Um por categoria: furi-build (o método: /principles, /ui, /solve, /method, /fast, /todo, /proto),
// furi-ship (a entrega: /jira-board, /setup, /infra, /card, /work, /repro,
// /pull-request, /homolog, /prod) e furi-toolbox (ferramentas avulsas). Não se
// instala skill isolada — instala-se o pacote, que já traz todas dentro.
export interface Bundle {
  name: string;
  label: string;
  category: Category;
  // Skill do pacote usada como exemplo no passo de teste do prompt — tem que
  // existir DENTRO deste pacote, senão o teste "falha" num install que deu certo.
  example: string;
}

// Repo/marketplace fonte das skills (Claude Code plugin marketplace).
const REPO_SLUG = "eduardofurihata/lp-skills";
const MARKETPLACE = "lp-skills";

// Os pacotes. `name` vem de CATEGORY_PACKAGE (derivado do marketplace gerado),
// para o nome nunca divergir do diretório em plugins/.
export const BUNDLES: Bundle[] = [
  {
    name: CATEGORY_PACKAGE.build,
    label: "Construir — método e QA",
    category: "build",
    example: "/method",
  },
  {
    name: CATEGORY_PACKAGE.ship,
    label: "Entregar — Jira, PR e deploy",
    category: "ship",
    example: "/work",
  },
  {
    name: CATEGORY_PACKAGE.toolbox,
    label: "Ferramentas avulsas",
    category: "toolbox",
    example: "/save",
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

const testStep = (example: string) =>
  `5) Abra uma sessão NOVA do Claude Code (um CLI separado) e teste digitando uma skill do pacote — ex.: ${example}`;

const UPDATE_FOOTER = `Com o auto-update ligado, versão nova entra sozinha no próximo start do Claude Code. Pra puxar na hora: /plugin marketplace update ${MARKETPLACE}`;

// Comandos `/plugin` para instalar um pacote inteiro. Instalar o pacote traz
// TODAS as skills dentro dele; cada skill é chamada pelo nome curto (/method,
// /repro). furi-ship puxa o furi-build junto (dependência declarada).
export function generateBundlePrompt(bundle: Bundle): string {
  return `${INTRO}

${ADD_STEP}

2) Instale o pacote "${bundle.name}" — traz todas as skills (${bundle.label}):
   /plugin install ${bundle.name}@${MARKETPLACE}

${AUTOUPDATE_STEP}

${VERIFY_STEP}

${testStep(bundle.example)}

${UPDATE_FOOTER}`;
}
