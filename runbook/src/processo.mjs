// processo.mjs — lê o processo (YAML), valida tudo antes de rodar e compila o `exige` em JSON Schema.
//
// Processo inválido não começa: ids, tipos, referências e laços são conferidos aqui, uma vez,
// para o motor nunca descobrir no passo 7 que o passo 3 não existe.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import YAML from "yaml";
import { referencias } from "./modelo.mjs";

export const TIPOS_EXIGE = { texto: "string", numero: "number", booleano: "boolean", lista: "array", objeto: "object" };
const TIPOS_PASSO = ["faca", "juiz", "comando", "parada"];
const ID = /^[a-z0-9][a-z0-9_-]*$/i;
const RESERVADOS = new Set(["entrada", "item", "run"]);
// campos que o agente usa para perguntar ao dev: existem em todo run, nenhum `exige` pode usá-los
const CAMPOS_DA_PERGUNTA = { pergunta: { type: "string" }, opcoes: { type: "array", items: { type: "string" } } };
const PERMISSOES = ["livre", "leitura"];
const CLIS = ["claude"];
const ESFORCOS = ["low", "medium", "high", "xhigh", "max"];
const CAMPOS_DO_PROCESSO = ["nome", "descricao", "entrada", "sessao", "resultado", "passos"];
const CAMPOS_DA_SESSAO = ["cli", "permissao", "modelo", "esforco", "ferramentas"];
const CAMPOS_POR_TIPO = {
  faca: ["exige", "tentativas", "para_cada", "permissao", "ferramentas", "limite"],
  juiz: ["ate", "max", "volta_para", "ferramentas", "limite"],
  comando: ["espera", "volta_para", "max", "limite"],
  parada: ["segue", "volta_para"],
};
const LIMITE_PADRAO = { faca: "30m", juiz: "10m", comando: "10m" };

export function duracaoEmMs(valor) {
  const m = /^(\d+(?:\.\d+)?)\s*(ms|s|m|h)$/.exec(String(valor ?? "").trim());
  return m ? Number(m[1]) * { ms: 1, s: 1000, m: 60_000, h: 3_600_000 }[m[2]] : null;
}

const inteiro = (v, min, max = Infinity) => Number.isInteger(v) && v >= min && v <= max;

export function lerProcesso(arquivo) {
  const origem = path.resolve(arquivo);
  let fonte;
  try {
    fonte = fs.readFileSync(origem, "utf8");
  } catch (e) {
    return { erros: [`não consegui ler ${origem}: ${e.code ?? e.message}`] };
  }
  return interpretarProcesso(fonte, origem);
}

export function interpretarProcesso(fonte, origem = "<texto>") {
  let dados;
  try {
    dados = YAML.parse(fonte);
  } catch (e) {
    return { erros: [`YAML inválido: ${e.message}`] };
  }
  const erros = [];
  const processo = normalizar(dados, erros);
  if (processo) validarLigacoes(processo, erros);
  if (erros.length) return { erros };
  return {
    erros: [],
    processo: {
      ...processo,
      esquema: esquemaDoRun(processo.passos),
      origem,
      fonte,
      hash: createHash("sha256").update(fonte).digest("hex").slice(0, 12),
    },
  };
}

function desconhecidos(obj, permitidos, onde, erros) {
  for (const k of Object.keys(obj)) if (!permitidos.includes(k)) erros.push(`${onde}: campo desconhecido \`${k}\``);
}

function normalizar(d, erros) {
  if (!d || typeof d !== "object" || Array.isArray(d)) {
    erros.push("o processo é um mapa com `nome` e `passos`");
    return null;
  }
  desconhecidos(d, CAMPOS_DO_PROCESSO, "processo", erros);
  if (typeof d.nome !== "string" || !ID.test(d.nome)) erros.push("`nome` é obrigatório (letras, números, - e _)");

  const entrada = d.entrada ?? [];
  if (!Array.isArray(entrada) || entrada.some((e) => typeof e !== "string" || !ID.test(e)))
    erros.push("`entrada` é uma lista de nomes (letras, números, - e _)");

  const s = d.sessao ?? {};
  if (typeof s !== "object" || Array.isArray(s)) erros.push("`sessao` é um mapa");
  else desconhecidos(s, CAMPOS_DA_SESSAO, "sessao", erros);
  const sessao = {
    cli: s.cli ?? "claude",
    permissao: s.permissao ?? "livre",
    modelo: s.modelo ?? null,
    esforco: s.esforco ?? null,
    ferramentas: s.ferramentas ?? [],
  };
  if (!CLIS.includes(sessao.cli)) erros.push(`sessao.cli: "${sessao.cli}" ainda não tem adaptador (por ora: ${CLIS.join(", ")})`);
  if (!PERMISSOES.includes(sessao.permissao)) erros.push(`sessao.permissao: ${PERMISSOES.join(" | ")}`);
  if (sessao.esforco !== null && !ESFORCOS.includes(sessao.esforco)) erros.push(`sessao.esforco: ${ESFORCOS.join(" | ")}`);
  if (!Array.isArray(sessao.ferramentas) || sessao.ferramentas.some((f) => typeof f !== "string"))
    erros.push("sessao.ferramentas é uma lista de nomes de ferramenta");

  if (!Array.isArray(d.passos) || !d.passos.length) {
    erros.push("`passos` é uma lista com pelo menos um passo");
    return null;
  }
  const ids = new Set();
  const passos = d.passos.map((p, i) => normalizarPasso(p, i, ids, erros));
  const resultado = d.resultado ?? "";
  if (typeof resultado !== "string") erros.push("`resultado` é um texto (com variáveis) mostrado no fim do run");
  return { nome: d.nome, descricao: d.descricao ?? "", entrada, sessao, resultado, passos };
}

function normalizarPasso(p, i, ids, erros) {
  const onde = `passo ${i + 1}${typeof p?.id === "string" ? ` (${p.id})` : ""}`;
  if (!p || typeof p !== "object" || Array.isArray(p)) {
    erros.push(`${onde}: é um mapa com \`id\` e um de ${TIPOS_PASSO.join(", ")}`);
    return null;
  }
  const tipos = TIPOS_PASSO.filter((t) => p[t] !== undefined);
  if (tipos.length !== 1) erros.push(`${onde}: precisa de exatamente um de ${TIPOS_PASSO.join(", ")}`);
  const tipo = tipos[0];
  if (typeof p.id !== "string" || !ID.test(p.id)) erros.push(`${onde}: \`id\` é obrigatório (letras, números, - e _)`);
  else if (RESERVADOS.has(p.id)) erros.push(`${onde}: \`${p.id}\` é um nome reservado`);
  else if (ids.has(p.id)) erros.push(`${onde}: id repetido`);
  else ids.add(p.id);
  if (!tipo) return null;
  if (typeof p[tipo] !== "string" || !p[tipo].trim()) erros.push(`${onde}: o texto de \`${tipo}\` é uma string não vazia`);
  desconhecidos(p, ["id", tipo, "se", ...CAMPOS_POR_TIPO[tipo]], onde, erros);

  const passo = { id: p.id, tipo, texto: p[tipo], indice: i, se: p.se ?? null };
  if (passo.se !== null && (typeof passo.se !== "string" || !/^[\w-]+(\.[\w-]+)*$/.test(passo.se)))
    erros.push(`${onde}: \`se\` é "passo.campo" (ou "entrada.x"): o passo só roda se esse valor existe`);
  if (tipo === "faca") {
    if (p.exige !== undefined) {
      if (!p.exige || typeof p.exige !== "object" || Array.isArray(p.exige) || !Object.keys(p.exige).length)
        erros.push(`${onde}: \`exige\` é um mapa campo → tipo (${Object.keys(TIPOS_EXIGE).join(", ")})`);
      else
        for (const [campo, t] of Object.entries(p.exige)) {
          if (!ID.test(campo)) erros.push(`${onde}: campo \`${campo}\` do exige: use letras, números, - e _`);
          if (campo in CAMPOS_DA_PERGUNTA) erros.push(`${onde}: \`${campo}\` é um campo reservado (o agente o usa para perguntar ao dev)`);
          if (!(t in TIPOS_EXIGE)) erros.push(`${onde}: exige.${campo}: tipo "${t}" — use ${Object.keys(TIPOS_EXIGE).join(", ")}`);
        }
    }
    passo.exige = p.exige ?? null;
    passo.tentativas = p.tentativas ?? 2;
    if (!inteiro(passo.tentativas, 1)) erros.push(`${onde}: \`tentativas\` é um inteiro ≥ 1`);
    passo.para_cada = p.para_cada ?? null;
    if (passo.para_cada !== null && (typeof passo.para_cada !== "string" || !/^[\w-]+(\.[\w-]+)?$/.test(passo.para_cada)))
      erros.push(`${onde}: \`para_cada\` é "passo.campo" (uma lista de um passo anterior)`);
    passo.permissao = p.permissao ?? null;
    if (passo.permissao !== null && !PERMISSOES.includes(passo.permissao)) erros.push(`${onde}: permissao: ${PERMISSOES.join(" | ")}`);
  }
  if (tipo === "faca" || tipo === "juiz") {
    passo.ferramentas = p.ferramentas ?? [];
    if (!Array.isArray(passo.ferramentas) || passo.ferramentas.some((f) => typeof f !== "string"))
      erros.push(`${onde}: \`ferramentas\` é uma lista de nomes (aceita variáveis: "{passo.campo}")`);
  }
  if (tipo === "juiz") {
    passo.ate = p.ate ?? 90;
    if (!inteiro(passo.ate, 0, 100)) erros.push(`${onde}: \`ate\` é a nota mínima, de 0 a 100`);
    passo.max = p.max ?? 3;
    if (!inteiro(passo.max, 1)) erros.push(`${onde}: \`max\` é um inteiro ≥ 1`);
    passo.volta_para = p.volta_para ?? null;
  }
  if (tipo === "comando") {
    passo.espera = p.espera ?? 0;
    if (!inteiro(passo.espera, 0, 255)) erros.push(`${onde}: \`espera\` é o código de saída esperado, de 0 a 255`);
    passo.volta_para = p.volta_para ?? null;
    passo.max = p.max ?? 3;
    if (!inteiro(passo.max, 1)) erros.push(`${onde}: \`max\` é um inteiro ≥ 1`);
  }
  if (tipo === "parada") {
    passo.segue = p.segue ?? null;
    passo.volta_para = p.volta_para ?? null;
    if (passo.segue !== null && (typeof passo.segue !== "string" || !passo.segue.trim()))
      erros.push(`${onde}: \`segue\` é a resposta do dev que aprova (um texto)`);
    if ((passo.segue === null) !== (passo.volta_para === null))
      erros.push(`${onde}: \`segue\` e \`volta_para\` andam juntos — a resposta que segue, e para onde volta qualquer outra`);
  }
  if (tipo !== "parada") {
    passo.limiteMs = duracaoEmMs(p.limite ?? LIMITE_PADRAO[tipo]);
    if (passo.limiteMs === null) erros.push(`${onde}: \`limite\` é uma duração como 90s, 20m ou 1h`);
  }
  return passo;
}

// o que o passo `faca` tem de devolver: o `exige` dele, ou só a `resposta` em texto
export const exigeDe = (passo) => passo.exige ?? { resposta: "texto" };

// o que cada passo deixa para os seguintes referenciarem
export function camposDe(passo) {
  if (passo.tipo === "faca") return Object.keys(exigeDe(passo));
  if (passo.tipo === "juiz") return ["nota", "lacunas"];
  if (passo.tipo === "comando") return ["codigo", "saida"];
  return ["resposta"];
}

function validarLigacoes(processo, erros) {
  const anteriores = new Map();
  for (const p of processo.passos) {
    if (!p) continue;
    const onde = `${p.id}`;
    if (p.para_cada) {
      const [alvo, campo] = p.para_cada.split(".");
      const a = anteriores.get(alvo);
      if (!a) erros.push(`${onde}: para_cada aponta para "${alvo}", que não é um passo anterior`);
      else if (!campo && !a.para_cada) erros.push(`${onde}: para_cada precisa do campo da lista: "${alvo}.<campo>"`);
      else if (campo && a.para_cada) erros.push(`${onde}: "${alvo}" repete por item e já produz a lista — use para_cada: ${alvo}`);
      else if (campo && a.tipo === "faca" && a.exige && a.exige[campo] !== "lista")
        erros.push(`${onde}: para_cada aponta para ${p.para_cada}, que não é \`lista\` no exige de ${alvo}`);
    }
    if (p.tipo === "juiz" || p.tipo === "comando" || p.tipo === "parada") {
      if (p.volta_para) {
        const alvo = anteriores.get(p.volta_para);
        if (!alvo || alvo.tipo !== "faca") erros.push(`${onde}: volta_para tem de ser um passo \`faca\` anterior`);
      } else if (p.tipo === "juiz") {
        const ultimo = [...anteriores.values()].reverse().find((x) => x.tipo === "faca");
        if (ultimo) p.volta_para = ultimo.id;
        else erros.push(`${onde}: o juiz precisa de um passo \`faca\` antes dele (ou de volta_para)`);
      }
    }
    for (const ref of referencias(p.texto))
      conferirReferencia(ref, `{${ref}}`, { processo, anteriores, onde, erros, item: Boolean(p.para_cada) });
    for (const f of Array.isArray(p.ferramentas) ? p.ferramentas : [])
      for (const ref of referencias(f))
        conferirReferencia(ref, `ferramentas: ${f}`, { processo, anteriores, onde, erros, item: Boolean(p.para_cada), run: false });
    if (p.se) conferirReferencia(p.se, `se: ${p.se}`, { processo, anteriores, onde, erros, item: false, run: false });
    anteriores.set(p.id, p);
  }
  // o resultado é lido no fim: vale qualquer passo do processo
  for (const ref of referencias(processo.resultado))
    conferirReferencia(ref, `{${ref}}`, { processo, anteriores, onde: "resultado", erros, item: false });
}

// uma referência a entrada, a passo anterior, a {item} (num para_cada) ou a {run.dir}/{run.id}
function conferirReferencia(ref, rotulo, { processo, anteriores, onde, erros, item, run = true }) {
  const [raiz, campo, ...resto] = ref.split(".");
  if (raiz === "entrada") {
    if (!campo || resto.length || !processo.entrada.includes(campo))
      erros.push(`${onde}: ${rotulo} — "${campo ?? ""}" não está em \`entrada\``);
  } else if (raiz === "item") {
    if (!item) erros.push(`${onde}: ${rotulo} — {item} só existe em passo com para_cada`);
  } else if (raiz === "run") {
    if (!run || !["dir", "id"].includes(campo) || resto.length) erros.push(`${onde}: ${rotulo} — use {run.dir} ou {run.id}, só no texto de um passo`);
  } else {
    const alvo = anteriores.get(raiz);
    if (!alvo) erros.push(`${onde}: ${rotulo} — "${raiz}" não é um passo anterior`);
    else if (campo && alvo.para_cada) erros.push(`${onde}: ${rotulo} — "${raiz}" repete por item e produz uma lista; use ${raiz} inteiro`);
    else if (campo && !camposDe(alvo).includes(campo)) erros.push(`${onde}: ${rotulo} — o passo ${raiz} não produz "${campo}"`);
  }
}

// Um schema só por run: a união dos campos de todos os `faca`, nenhum obrigatório (tipo omitido quando
// dois passos divergem). O --json-schema entra no começo do prompt: um schema diferente a cada passo
// refaz o cache da conversa inteira (medido: US$ 0,26 num passo de uma linha). Quem cobra os campos de
// cada passo é o motor, com faltasNaSaida, e o pedido diz quais são.
export function esquemaDoRun(passos) {
  const tipos = new Map();
  for (const p of passos)
    if (p?.tipo === "faca")
      for (const [campo, tipo] of Object.entries(exigeDe(p))) tipos.set(campo, (tipos.get(campo) ?? new Set()).add(TIPOS_EXIGE[tipo]));
  const properties = {};
  for (const [campo, ts] of tipos) properties[campo] = ts.size === 1 ? { type: [...ts][0] } : {};
  return { type: "object", properties: { ...properties, ...CAMPOS_DA_PERGUNTA } };
}

// os campos do exige que a resposta não trouxe (ou trouxe com o tipo errado)
export function faltasNaSaida(saida, exige) {
  if (!exige) return [];
  if (!saida || typeof saida !== "object" || Array.isArray(saida)) return Object.keys(exige);
  const faltas = [];
  for (const [campo, tipo] of Object.entries(exige)) {
    const v = saida[campo];
    const ok =
      tipo === "texto"
        ? typeof v === "string" && v.trim() !== ""
        : tipo === "numero"
          ? typeof v === "number" && Number.isFinite(v)
          : tipo === "booleano"
            ? typeof v === "boolean"
            : tipo === "lista"
              ? Array.isArray(v)
              : v !== null && typeof v === "object" && !Array.isArray(v);
    if (!ok) faltas.push(v === undefined || v === null ? campo : `${campo} (esperado ${tipo})`);
  }
  return faltas;
}
