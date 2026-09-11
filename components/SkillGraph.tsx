"use client";

import { useMemo, useState } from "react";
import { Share2 } from "lucide-react";
import { CategoryBadge, CATEGORY_COLOR } from "@/components/CategoryBadge";
import type { CategoryFilterValue } from "@/components/CategoryFilter";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/categories";
import {
  buildSkillGraph,
  edgeOffset,
  edgePath,
  EDGE_KINDS,
  EDGE_LABELS,
  type EdgeKind,
  type GraphEdge,
  type GraphNode,
} from "@/lib/skill-graph";
import type { Skill } from "@/lib/skills";
import { cn } from "@/lib/utils";

interface SkillGraphProps {
  skills: Skill[];
  /** A mesma aba que filtra o grid: aqui ela realça, não esconde. */
  categoryFilter: CategoryFilterValue;
}

// Traço de cada camada. Sólido = dependência real; quanto mais frouxa a
// relação, mais interrompida a linha.
const EDGE_STYLE: Record<EdgeKind, { dash?: string; width: number }> = {
  requires: { width: 1.5 },
  handoff: { dash: "7 4", width: 1.3 },
  boundary: { dash: "2 4", width: 1.1 },
};

const EDGE_HINT: Record<EdgeKind, string> = {
  requires: "invoca a outra skill / precisa dela para rodar",
  handoff: "o próximo passo é a outra skill — você decide quando",
  boundary: "fronteira declarada: isso é assunto da outra skill",
};

const DIM = 0.14;

export function SkillGraph({ skills, categoryFilter }: SkillGraphProps) {
  const graph = useMemo(() => buildSkillGraph(skills), [skills]);
  const [layers, setLayers] = useState<Set<EdgeKind>>(
    () => new Set(EDGE_KINDS),
  );
  const [pinned, setPinned] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const focus = hovered ?? pinned;

  const nodeByName = useMemo(
    () =>
      new Map(
        [...graph.nodes, ...graph.isolated].map((n) => [n.name, n] as const),
      ),
    [graph],
  );

  // Só as arestas das camadas ligadas — com o tipo de maior precedência que
  // sobreviveu, que é por ele que a linha é desenhada.
  const visible = useMemo(
    () =>
      graph.edges
        .map((e) => ({ edge: e, kind: e.kinds.find((k) => layers.has(k)) }))
        .filter((e): e is { edge: GraphEdge; kind: EdgeKind } => !!e.kind),
    [graph, layers],
  );

  // Quem fica aceso. `null` = ninguém esmaecido.
  const lit = useMemo(() => {
    if (focus) {
      const set = new Set([focus]);
      for (const { edge } of visible) {
        if (edge.from === focus) set.add(edge.to);
        if (edge.to === focus) set.add(edge.from);
      }
      return set;
    }
    if (categoryFilter !== "all")
      return new Set(
        [...nodeByName.values()]
          .filter((n) => n.category === categoryFilter)
          .map((n) => n.name),
      );
    return null;
  }, [focus, visible, categoryFilter, nodeByName]);

  const nodeOpacity = (n: GraphNode) => (!lit || lit.has(n.name) ? 1 : DIM);
  const edgeLit = (e: GraphEdge) =>
    !lit ? null : lit.has(e.from) && lit.has(e.to);
  const onFocusEdge = (e: GraphEdge) =>
    !!focus && (e.from === focus || e.to === focus);

  const toggle = (kind: EdgeKind) =>
    setLayers((prev) => {
      const next = new Set(prev);
      // A última camada não desliga: um grafo sem aresta não é um grafo.
      if (next.has(kind) && next.size > 1) next.delete(kind);
      else next.add(kind);
      return next;
    });

  return (
    <section className="mb-8 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
      <div className="mb-1 flex items-center gap-2">
        <Share2
          className="h-4 w-4 shrink-0 text-[color:var(--color-accent)]"
          aria-hidden="true"
        />
        <h2 className="text-sm font-semibold text-[color:var(--color-text)]">
          Como as skills se puxam
        </h2>
      </div>
      <p className="mb-4 text-sm leading-relaxed text-[color:var(--color-text-muted)]">
        Cada skill declara suas relações no próprio frontmatter — este mapa é
        desenhado a partir delas. Embaixo ficam as fundações; quem depende sobe.
      </p>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="flex flex-wrap gap-1.5">
          {EDGE_KINDS.map((kind) => {
            const on = layers.has(kind);
            return (
              <button
                key={kind}
                type="button"
                onClick={() => toggle(kind)}
                aria-pressed={on}
                title={EDGE_HINT[kind]}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors",
                  on
                    ? "border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-2)] text-[color:var(--color-text)]"
                    : "border-[color:var(--color-border)] text-[color:var(--color-text-dim)]",
                )}
              >
                <svg width="22" height="6" aria-hidden="true">
                  <line
                    x1="1"
                    y1="3"
                    x2="21"
                    y2="3"
                    stroke="currentColor"
                    strokeWidth={EDGE_STYLE[kind].width}
                    strokeDasharray={EDGE_STYLE[kind].dash}
                  />
                </svg>
                {EDGE_LABELS[kind]}
              </button>
            );
          })}
        </div>
        {/* A cor de cada nó é o pacote em que a skill é instalada. */}
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
          {CATEGORIES.map((category) => (
            <li
              key={category}
              className="flex items-center gap-1.5 text-xs text-[color:var(--color-text-dim)]"
            >
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-[3px] border"
                style={{ borderColor: CATEGORY_COLOR[category] }}
              />
              {CATEGORY_LABELS[category]}
            </li>
          ))}
        </ul>
      </div>

      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <svg
          width={graph.width}
          height={graph.height}
          viewBox={`0 0 ${graph.width} ${graph.height}`}
          className="mx-auto block"
          role="img"
          aria-label={`Grafo de relações entre ${nodeByName.size} skills`}
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            {["off", "on"].map((state) => (
              <marker
                key={state}
                id={`skill-arrow-${state}`}
                viewBox="0 0 8 8"
                refX="7"
                refY="4"
                markerWidth="9"
                markerHeight="9"
                markerUnits="userSpaceOnUse"
                orient="auto"
              >
                <path
                  d="M 0 1 L 7 4 L 0 7 z"
                  fill={
                    state === "on"
                      ? "var(--color-accent)"
                      : "var(--color-text-dim)"
                  }
                />
              </marker>
            ))}
          </defs>

          {/* A régua que separa o corpo do grafo das skills sem relação. */}
          {graph.isolated.length > 0 && (
            <g aria-hidden="true">
              <line
                x1="16"
                y1={graph.isolatedY - 26}
                x2={graph.width - 16}
                y2={graph.isolatedY - 26}
                stroke="var(--color-border)"
                strokeDasharray="3 5"
              />
              <text
                x={graph.width / 2}
                y={graph.isolatedY - 32}
                textAnchor="middle"
                className="fill-[color:var(--color-text-dim)] text-[10px] uppercase tracking-wider"
              >
                funcionam sozinhas
              </text>
            </g>
          )}

          <g fill="none">
            {visible.map(({ edge, kind }) => {
              const from = nodeByName.get(edge.from)!;
              const to = nodeByName.get(edge.to)!;
              const on = onFocusEdge(edge);
              const shown = edgeLit(edge);
              return (
                <path
                  key={`${edge.from} ${edge.to}`}
                  d={edgePath(from, to, edgeOffset(edge))}
                  stroke={on ? "var(--color-accent)" : "var(--color-text-dim)"}
                  strokeWidth={EDGE_STYLE[kind].width}
                  strokeDasharray={EDGE_STYLE[kind].dash}
                  markerEnd={`url(#skill-arrow-${on ? "on" : "off"})`}
                  opacity={on ? 0.95 : shown === false ? DIM : 0.55}
                />
              );
            })}
          </g>

          <g>
            {[...graph.nodes, ...graph.isolated].map((node) => {
              const active = focus === node.name;
              const color = CATEGORY_COLOR[node.category];
              return (
                <g
                  key={node.name}
                  tabIndex={0}
                  role="button"
                  aria-label={`/${node.name}`}
                  aria-pressed={pinned === node.name}
                  opacity={nodeOpacity(node)}
                  className="cursor-pointer outline-none transition-opacity"
                  onMouseEnter={() => setHovered(node.name)}
                  onFocus={() => setHovered(node.name)}
                  onBlur={() => setHovered(null)}
                  onClick={() =>
                    setPinned((p) => (p === node.name ? null : node.name))
                  }
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" && e.key !== " ") return;
                    e.preventDefault();
                    setPinned((p) => (p === node.name ? null : node.name));
                  }}
                >
                  <title>{node.description}</title>
                  <rect
                    x={node.x}
                    y={node.y}
                    width={node.w}
                    height={node.h}
                    rx="8"
                    fill="var(--color-surface-2)"
                    stroke={active ? "var(--color-accent)" : color}
                    strokeWidth={active ? 1.6 : 1}
                    opacity={active ? 1 : 0.85}
                  />
                  <text
                    x={node.x + node.w / 2}
                    y={node.y + node.h / 2 + 4}
                    textAnchor="middle"
                    fill={active ? "var(--color-accent)" : color}
                    className="font-mono text-[12px]"
                  >
                    /{node.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <div className="min-h-[9.5rem] sm:min-h-[7.5rem]">
        <GraphDetail
          node={focus ? nodeByName.get(focus) : undefined}
          edges={graph.edges}
          pinned={pinned === focus}
        />
      </div>
    </section>
  );
}

// O que um tooltip não daria: as relações da skill em foco, nos dois sentidos,
// legível no toque (onde hover não existe).
function GraphDetail({
  node,
  edges,
  pinned,
}: {
  node?: GraphNode;
  edges: GraphEdge[];
  pinned: boolean;
}) {
  if (!node)
    return (
      <p className="mt-4 border-t border-[color:var(--color-border)] pt-4 text-sm text-[color:var(--color-text-dim)]">
        Toque numa skill para acender as relações dela e prendê-la aqui.
        <span className="sm:hidden"> Arraste o mapa para os lados.</span>
      </p>
    );

  const outgoing = EDGE_KINDS.map((kind) => ({
    label: EDGE_LABELS[kind],
    names: edges
      .filter((e) => e.from === node.name && e.kinds.includes(kind))
      .map((e) => e.to),
  })).filter((row) => row.names.length > 0);

  const required = edges
    .filter((e) => e.to === node.name && e.kinds.includes("requires"))
    .map((e) => e.from);

  const rows = [
    ...outgoing,
    ...(required.length ? [{ label: "requerida por", names: required }] : []),
  ];

  return (
    <div className="mt-4 border-t border-[color:var(--color-border)] pt-4">
      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        <h3 className="font-mono text-sm font-semibold text-[color:var(--color-text)]">
          /{node.name}
        </h3>
        <CategoryBadge category={node.category} />
        {pinned && (
          <span className="text-[10px] uppercase tracking-wider text-[color:var(--color-text-dim)]">
            fixada — clique de novo para soltar
          </span>
        )}
      </div>
      <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-[color:var(--color-text-muted)]">
        {node.description || "Sem descrição."}
      </p>
      {rows.length === 0 ? (
        <p className="text-sm text-[color:var(--color-text-dim)]">
          Sem relações declaradas — funciona sozinha.
        </p>
      ) : (
        <dl className="flex flex-col gap-1.5 text-sm">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex flex-wrap items-baseline gap-2"
            >
              <dt className="text-[color:var(--color-text-dim)]">
                {row.label}
              </dt>
              <dd className="flex flex-wrap gap-1.5 font-mono text-[color:var(--color-text-muted)]">
                {row.names.map((n) => (
                  <span key={n}>/{n}</span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
