// modelo.mjs — as variáveis dos textos do processo: {entrada.x}, {passo.campo}, {item}, {run.dir}.
//
// `{{` e `}}` viram chaves literais, para um texto poder mostrar um exemplo como {{nome}} ao agente.
// Em `comando`, cada valor entra já citado para o shell: a saída de um agente nunca vira comando.

const RE = /\{([A-Za-z_][\w-]*(?:\.[\w-]+)*)\}/g;
const ABRE = "\u0000(";
const FECHA = "\u0000)";
const proteger = (t) => String(t ?? "").replaceAll("{{", ABRE).replaceAll("}}", FECHA);
const restaurar = (t) => t.replaceAll(ABRE, "{").replaceAll(FECHA, "}");

export function referencias(texto) {
  return [...proteger(texto).matchAll(RE)].map((m) => m[1]);
}

export function valorDe(caminho, contexto) {
  const [raiz, ...resto] = caminho.split(".");
  let v =
    raiz === "entrada"
      ? contexto.entrada
      : raiz === "item"
        ? contexto.item
        : raiz === "run"
          ? contexto.run
          : contexto.passos?.[raiz];
  for (const chave of resto) v = v == null ? undefined : v[chave];
  return v;
}

const comoTexto = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v, null, 2));
export const citarShell = (s) => `'${String(s).replaceAll("'", `'\\''`)}'`;

export function renderizar(texto, contexto, { shell = false } = {}) {
  return restaurar(
    proteger(texto).replace(RE, (_, caminho) => {
      const v = comoTexto(valorDe(caminho, contexto));
      return shell ? citarShell(v) : v;
    }),
  );
}
