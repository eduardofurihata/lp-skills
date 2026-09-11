// Módulo PURO (sem node:*) — seguro no bundle client e no server.
// Owner do grafo de relações entre skills: transforma a lista de skills no
// layout já posicionado que o SkillGraph desenha.
//
// TRÊS CAMADAS DE ARESTA, três campos de frontmatter. É a doutrina do README
// ("mencionar não é invocar") em forma declarada:
//
//   requires  a skill invoca a outra via Skill tool / depende dela para rodar
//   handoff   o próximo passo é a outra skill — decisão do usuário, sem invocar
//   boundary  fronteira: "isso NÃO é meu, é do outro"
//
// Só `requires` estrutura o grafo (define os ranks) e só ele gera dependência
// entre pacotes em scripts/generate-plugins.mjs. As outras duas são overlays:
// dizem para onde o trabalho vai, não o que a skill precisa para funcionar.
import { CATEGORIES, type Category } from "./categories";
import type { Skill } from "./skills";

export type EdgeKind = "requires" | "handoff" | "boundary";

// Ordem = precedência de desenho. Uma aresta pode ter mais de um tipo
// (`homolog → prod` é requires E handoff): desenha pelo primeiro que casar,
// e o tooltip lista todos — nada de informação se perde.
export const EDGE_KINDS: readonly EdgeKind[] = [
  "requires",
  "handoff",
  "boundary",
];

export const EDGE_LABELS: Record<EdgeKind, string> = {
  requires: "requer",
  handoff: "entrega para",
  boundary: "fronteira com",
};

export interface GraphNode {
  name: string;
  slug: string;
  description: string;
  category: Category;
  rank: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  kinds: EdgeKind[];
  /**
   * Existe a recíproca (`homolog → prod` e `prod → homolog`). As duas direções
   * ficam como arestas separadas, cada uma com o SEU tipo — colapsar num traço
   * de seta dupla perderia que, por exemplo, `pull-request → prod` é fronteira
   * enquanto `prod → pull-request` é dependência. O par é só deslocado para os
   * traços não caírem um sobre o outro; ver `edgeOffset`.
   */
  mutual: boolean;
}

export interface SkillGraphLayout {
  /** Nós com pelo menos uma relação, empilhados por rank. */
  nodes: GraphNode[];
  /** Grau 0 nas três camadas — funcionam sozinhas, ficam numa faixa própria. */
  isolated: GraphNode[];
  edges: GraphEdge[];
  width: number;
  height: number;
  /** y onde começa a faixa das avulsas (para o componente rotular a régua). */
  isolatedY: number;
}

// Geometria. Rank 0 (as fundações) embaixo; quem depende sobe.
const NODE_H = 34;
const ROW_GAP = 84;
const COL_GAP = 30;
// Vão maior quando a categoria muda: dentro de um rank, o pacote vira um
// agrupamento visível sem precisar de caixa nem rótulo em volta.
const GROUP_GAP = 58;
const PAD_X = 28;
const PAD_Y = 26;
const ISOLATED_GAP = 68;
const CHAR_W = 7.4; // font-mono 12px
const NODE_PAD_X = 16;

const edgeKey = (from: string, to: string) => `${from} -> ${to}`;

// `/{name}` — a barra conta.
const nodeWidth = (name: string) =>
  Math.round((name.length + 1) * CHAR_W + NODE_PAD_X * 2);

export function buildSkillGraph(skills: Skill[]): SkillGraphLayout {
  // `requires`/`handoff`/`boundary` apontam pelo `name` de invocação — é a
  // mesma resolução que packageOfName faz em scripts/generate-plugins.mjs.
  const byName = new Map(skills.map((s) => [s.name, s]));

  // 1. Merge das três camadas numa aresta por par. Alvo que não resolve some
  //    aqui sem alarde; quem falha por isso é scripts/validate-plugins.mjs.
  const merged = new Map<string, GraphEdge>();
  for (const skill of skills) {
    for (const kind of EDGE_KINDS) {
      for (const target of skill[kind]) {
        if (target === skill.name || !byName.has(target)) continue;
        const key = edgeKey(skill.name, target);
        const edge = merged.get(key);
        if (edge) edge.kinds.push(kind);
        else
          merged.set(key, {
            from: skill.name,
            to: target,
            kinds: [kind],
            mutual: false,
          });
      }
    }
  }
  for (const edge of merged.values())
    edge.mutual = merged.has(edgeKey(edge.to, edge.from));
  const edges = [...merged.values()];

  // 2. Ranks. `solve ↔ ui` e `homolog ↔ prod` são ciclos mútuos e intencionais
  //    no requires: em vez de escolher uma back-edge para quebrar (a escolha
  //    inverteria o fluxo — prod acabaria abaixo de homolog), condensa os
  //    componentes fortemente conexos e ranqueia o DAG resultante. Os nós de um
  //    mesmo ciclo caem no mesmo rank, lado a lado.
  const requires = new Map<string, string[]>(
    skills.map((s) => [s.name, s.requires.filter((r) => byName.has(r))]),
  );
  const rank = rankByComponent(requires);

  // 3. Quem não tem nenhuma relação sai do corpo do grafo.
  const connected = new Set<string>();
  for (const e of edges) {
    connected.add(e.from);
    connected.add(e.to);
  }

  const toNode = (s: Skill): GraphNode => ({
    name: s.name,
    slug: s.slug,
    description: s.description,
    category: s.category,
    rank: rank.get(s.name) ?? 0,
    x: 0,
    y: 0,
    w: nodeWidth(s.name),
    h: NODE_H,
  });

  const nodes = skills.filter((s) => connected.has(s.name)).map(toNode);
  const isolated = skills.filter((s) => !connected.has(s.name)).map(toNode);

  // 4. Posições. Cada rank é uma linha centrada; dentro dela, a ordem é
  //    categoria (a da LP) e depois nome — o que já mantém os pares de um
  //    ciclo vizinhos, porque são do mesmo pacote.
  const maxRank = nodes.reduce((m, n) => Math.max(m, n.rank), 0);
  const rows: GraphNode[][] = Array.from({ length: maxRank + 1 }, () => []);
  for (const n of nodes) rows[n.rank].push(n);
  for (const row of rows) row.sort(compareNodes);
  if (isolated.length) isolated.sort(compareNodes);

  const rowWidth = (row: GraphNode[]) =>
    row.reduce((sum, n, i) => sum + n.w + (i ? gapBefore(row, i) : 0), 0);
  const contentWidth = Math.max(
    ...rows.map(rowWidth),
    isolated.length ? rowWidth(isolated) : 0,
  );
  const width = contentWidth + PAD_X * 2;

  rows.forEach((row, r) => {
    layoutRow(row, width, PAD_Y + (maxRank - r) * ROW_GAP);
  });

  const isolatedY = PAD_Y + maxRank * ROW_GAP + NODE_H + ISOLATED_GAP;
  layoutRow(isolated, width, isolatedY);

  const lastY = isolated.length ? isolatedY : PAD_Y + maxRank * ROW_GAP;
  return {
    nodes,
    isolated,
    edges,
    width,
    height: lastY + NODE_H + PAD_Y,
    isolatedY,
  };
}

// Vão à esquerda do i-ésimo nó da linha.
function gapBefore(row: GraphNode[], i: number): number {
  return row[i].category === row[i - 1].category ? COL_GAP : GROUP_GAP;
}

function layoutRow(row: GraphNode[], width: number, y: number): void {
  const total = row.reduce(
    (sum, n, i) => sum + n.w + (i ? gapBefore(row, i) : 0),
    0,
  );
  let x = (width - total) / 2;
  row.forEach((n, i) => {
    if (i) x += gapBefore(row, i);
    n.x = Math.round(x);
    n.y = y;
    x += n.w;
  });
}

function compareNodes(a: GraphNode, b: GraphNode): number {
  const byCategory =
    CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category);
  return byCategory !== 0 ? byCategory : a.name.localeCompare(b.name);
}

// Rank = maior caminho de dependência até uma folha, com os componentes
// fortemente conexos (Tarjan) condensados num nó só — é o que faz um ciclo
// mútuo virar uma linha, em vez de uma escada arbitrária.
function rankByComponent(deps: Map<string, string[]>): Map<string, number> {
  const component = stronglyConnected(deps);

  // DAG condensado: componente → componentes de que ele depende.
  const componentDeps = new Map<number, Set<number>>();
  for (const [name, targets] of deps) {
    const from = component.get(name)!;
    const set = componentDeps.get(from) ?? new Set<number>();
    for (const t of targets) {
      const to = component.get(t)!;
      if (to !== from) set.add(to);
    }
    componentDeps.set(from, set);
  }

  const depth = new Map<number, number>();
  const rankOf = (c: number): number => {
    const seen = depth.get(c);
    if (seen !== undefined) return seen;
    depth.set(c, 0); // guarda contra reentrada; o DAG condensado não tem ciclo
    let max = -1;
    for (const d of componentDeps.get(c) ?? []) max = Math.max(max, rankOf(d));
    const value = max + 1;
    depth.set(c, value);
    return value;
  };

  return new Map(
    [...deps.keys()].map((name) => [name, rankOf(component.get(name)!)]),
  );
}

// Tarjan iterativo: devolve o id do componente fortemente conexo de cada nó.
function stronglyConnected(deps: Map<string, string[]>): Map<string, number> {
  const index = new Map<string, number>();
  const low = new Map<string, number>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  const component = new Map<string, number>();
  let counter = 0;
  let components = 0;

  for (const root of deps.keys()) {
    if (index.has(root)) continue;
    // Cada quadro guarda onde parou na lista de vizinhos do nó.
    const frames: { node: string; next: number }[] = [{ node: root, next: 0 }];
    index.set(root, counter);
    low.set(root, counter++);
    stack.push(root);
    onStack.add(root);

    while (frames.length) {
      const frame = frames[frames.length - 1];
      const targets = deps.get(frame.node) ?? [];

      if (frame.next < targets.length) {
        const next = targets[frame.next++];
        if (!index.has(next)) {
          index.set(next, counter);
          low.set(next, counter++);
          stack.push(next);
          onStack.add(next);
          frames.push({ node: next, next: 0 });
        } else if (onStack.has(next)) {
          low.set(frame.node, Math.min(low.get(frame.node)!, index.get(next)!));
        }
        continue;
      }

      // Vizinhos esgotados: fecha o nó e propaga o low para o pai.
      if (low.get(frame.node) === index.get(frame.node)) {
        const id = components++;
        let member: string;
        do {
          member = stack.pop()!;
          onStack.delete(member);
          component.set(member, id);
        } while (member !== frame.node);
      }
      frames.pop();
      const parent = frames[frames.length - 1];
      if (parent)
        low.set(
          parent.node,
          Math.min(low.get(parent.node)!, low.get(frame.node)!),
        );
    }
  }

  return component;
}

/**
 * Lado para onde uma aresta recíproca se desvia: +1 / -1 pelos nomes, para as
 * duas direções caírem em lados opostos e continuarem legíveis. 0 = sem par.
 */
export function edgeOffset(edge: GraphEdge): number {
  if (!edge.mutual) return 0;
  return edge.from < edge.to ? 1 : -1;
}

const SPREAD = 10;
/** Folga entre a ponta da seta e a borda do nó, para a seta não sumir nela. */
const TIP_GAP = 7;

/** Curva entre dois nós: âncoras escolhidas pela posição relativa. */
export function edgePath(from: GraphNode, to: GraphNode, offset = 0): string {
  if (from.y === to.y) {
    // Mesmo rank: sai e entra pela lateral. Um par recíproco vira uma lente —
    // uma curva por cima, a outra por baixo.
    const right = to.x > from.x;
    const x1 = right ? from.x + from.w : from.x;
    const x2 = (right ? to.x : to.x + to.w) + (right ? -TIP_GAP : TIP_GAP);
    const y = from.y + from.h / 2;
    const span = Math.abs(x2 - x1);
    const lift = Math.min(34, span / 2 + 14) * (offset < 0 ? -1 : 1);
    // Nunca passa da metade do vão: com vizinhos colados, um alcance maior
    // cruzaria os pontos de controle e a curva viraria um laço.
    const reach = Math.min(span * 0.45, 26) * (right ? 1 : -1);
    return `M ${x1} ${y} C ${x1 + reach} ${y - lift}, ${x2 - reach} ${y - lift}, ${x2} ${y}`;
  }

  const fx = from.x + from.w / 2 + offset * SPREAD;
  const tx = to.x + to.w / 2 + offset * SPREAD;
  const down = to.y > from.y;
  const y1 = down ? from.y + from.h : from.y;
  const y2 = (down ? to.y : to.y + to.h) + (down ? -TIP_GAP : TIP_GAP);
  const bend = (Math.abs(y2 - y1) / 2) * (down ? 1 : -1);
  return `M ${fx} ${y1} C ${fx} ${y1 + bend}, ${tx} ${y2 - bend}, ${tx} ${y2}`;
}
