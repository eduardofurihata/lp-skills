// motor.mjs — o laço: um passo por vez, na ordem do processo; só avança quando o passo cumpre o que exige.
//
// Quem decide o próximo passo é este laço, nunca o agente. O agente recebe UM passo, numa conversa
// que continua de um passo para o outro; a resposta só vale se trouxer cada campo do `exige`.
// Juiz abaixo da nota, comando que falha ou resposta incompleta: o laço volta, tenta de novo ou
// para e chama o dev — nada segue em silêncio.
import { spawn } from "node:child_process";
import { renderizar, valorDe } from "./modelo.mjs";
import { exigeDe, faltasNaSaida } from "./processo.mjs";
import { registrarChamada } from "./estado.mjs";
import { fmtCusto, fmtDuracao } from "./eventos.mjs";

export const PREAMBULO = [
  "Você está num processo conduzido pelo runbook: um motor manda um passo por vez para esta conversa e confere cada resposta antes de mandar o próximo.",
  "Faça só o passo pedido agora, por completo — não adiante passos e não pule partes dele.",
  "Quando o passo pedir campos, responda no formato estruturado, com todos eles.",
  "Se o passo depende de uma decisão ou de uma informação que só o dev tem, não invente: devolva só o campo `pergunta` (e `opcoes`, com 2 a 4 escolhas, quando houver escolhas claras). O motor para, o dev responde, e você continua este mesmo passo.",
].join("\n");

// perguntas ao dev num mesmo passo antes de virar escalada: perguntar não pode ser jeito de não fazer
const MAX_PERGUNTAS = 3;

const indiceDe = (processo, id) => processo.passos.findIndex((p) => p.id === id);

// "Tudo ok", "tudo ok" e "Tudo ok." são a mesma resposta
const normalizar = (s) => String(s).trim().replace(/[\s.!]+$/u, "").toLowerCase();
const mesmaResposta = (a, b) => normalizar(a) === normalizar(b);

// `se:` — o passo só roda se o valor existe: texto não vazio, lista não vazia, true, número ≠ 0
const existe = (v) =>
  typeof v === "string"
    ? v.trim() !== ""
    : Array.isArray(v)
      ? v.length > 0
      : typeof v === "number"
        ? v !== 0
        : typeof v === "boolean"
          ? v
          : Boolean(v) && typeof v === "object" && Object.keys(v).length > 0;

// `local`: dentro de um bloco, as saídas dos passos de dentro já feitos para o item corrente
const contexto = (ctx, item, local) => ({
  entrada: ctx.estado.entrada,
  passos: local ? { ...ctx.estado.saidas, ...local } : ctx.estado.saidas,
  item,
  run: { dir: ctx.dirArquivos, id: ctx.estado.id },
});

// `ferramentas` aceita variáveis; a que vale uma lista se espalha: ["{ler.ferramentas}"] → um nome por item
function ferramentasDe(ctx, passo, item, local) {
  const c = contexto(ctx, item, local);
  return passo.ferramentas
    .flatMap((f) => {
      const so = /^\{([^{}]+)\}$/.exec(f.trim());
      const v = so ? valorDe(so[1], c) : renderizar(f, c);
      return Array.isArray(v) ? v : [v];
    })
    .map((f) => (typeof f === "string" ? f.trim() : ""))
    .filter(Boolean);
}

export async function executar(ctx) {
  const { estado, processo, emitir, salvar } = ctx;
  const total = processo.passos.length;
  estado.status = "rodando";
  salvar(estado);
  while (estado.cursor < total) {
    const passo = processo.passos[estado.cursor];
    const rot = `[${estado.cursor + 1}/${total}] ${passo.id}`;
    if (passo.se && !existe(valorDe(passo.se, contexto(ctx)))) {
      // não se aplica: fica no relatório, nunca some em silêncio
      estado.saidas[passo.id] = { nao_se_aplica: true };
      emitir("nao_se_aplica", { passo: passo.id, se: passo.se }, `⤼ ${rot} — não se aplica (${passo.se} vazio)`);
      estado.cursor += 1;
      salvar(estado);
      continue;
    }
    emitir("passo", { passo: passo.id, n: estado.cursor + 1 }, `▶ ${rot}`);
    const inicio = Date.now();
    const r = await rodarPasso(ctx, passo, rot);
    const dur = Date.now() - inicio;
    estado.tempo.porPasso[passo.id] = (estado.tempo.porPasso[passo.id] ?? 0) + dur;
    if (r.parar) {
      salvar(estado);
      return r.parar;
    }
    if (r.voltarPara !== undefined) {
      recomecarEm(estado, processo, r.voltarPara);
      salvar(estado);
      continue;
    }
    estado.saidas[passo.id] = r.saida;
    delete estado.perguntas?.[passo.id];
    const extra = [fmtDuracao(dur), fmtCusto(estado.custo.porPasso[passo.id])].filter(Boolean).join(" · ");
    emitir("feito", { passo: passo.id, saida: r.saida }, `✓ ${rot}${r.resumo ? ` — ${r.resumo}` : ""} (${extra})`);
    estado.cursor += 1;
    salvar(estado);
  }
  estado.status = "fim";
  salvar(estado);
  emitir("fim", { custo: estado.custo.total }, relatorio(estado, processo, ctx.dirArquivos));
  return "fim";
}

function rodarPasso(ctx, passo, rot) {
  if (passo.tipo === "bloco") return fazerBloco(ctx, passo, rot);
  if (passo.tipo === "faca") return passo.para_cada ? fazerParaCada(ctx, passo, rot) : fazer(ctx, passo, rot);
  if (passo.tipo === "juiz") return julgar(ctx, passo, rot);
  if (passo.tipo === "comando") return comandar(ctx, passo, rot);
  return pedirAoDev(ctx, passo, rot);
}

// voltar a um passo refaz tudo dali em diante, inclusive os para_cada pela metade
function recomecarEm(estado, processo, indice) {
  estado.cursor = indice;
  for (const p of processo.passos.slice(indice)) delete estado.parciais[p.id];
}

function contarCusto(estado, passoId, usd) {
  if (typeof usd !== "number" || !(usd > 0)) return;
  estado.custo.porPasso[passoId] = (estado.custo.porPasso[passoId] ?? 0) + usd;
  estado.custo.total += usd;
}

// na conversa retomada o agente informa o total acumulado da sessão; o passo custou a diferença
function contarCustoDaSessao(estado, passoId, totalDaSessao) {
  if (typeof totalDaSessao !== "number") return;
  const delta = totalDaSessao - estado.sessao.custoVisto;
  estado.sessao.custoVisto = Math.max(estado.sessao.custoVisto, totalDaSessao);
  contarCusto(estado, passoId, delta);
}

// `bloco`: { passo, local, k, n } quando o passo é um dos de dentro de um bloco, no item k de n
function montarPrompt(ctx, passo, item, faltou, bloco) {
  const { estado, processo } = ctx;
  const partes = [];
  const p = estado.pendente;
  if (p)
    partes.push(
      p.tipo === "pergunta"
        ? `O dev respondeu à sua pergunta («${p.pergunta}»): ${p.texto}`
        : p.tipo === "escalada"
          ? `O dev orientou sobre «${p.passo}»: ${p.texto}`
          : `O dev respondeu à parada «${p.passo}»: ${p.texto}`,
    );
  if (estado.retornos[passo.id]) partes.push(estado.retornos[passo.id]);
  if (faltou) partes.push(`Sua resposta anterior não trouxe: ${faltou.join(", ")}. Responda de novo, com todos os campos.`);
  const nome = bloco
    ? `Passo ${indiceDe(processo, bloco.passo.id) + 1}/${processo.passos.length} — ${bloco.passo.id}, item ${bloco.k + 1}/${bloco.n} — ${passo.id}`
    : `Passo ${indiceDe(processo, passo.id) + 1}/${processo.passos.length} — ${passo.id}`;
  partes.push(`${nome}:\n${renderizar(passo.texto, contexto(ctx, item, bloco?.local))}`);
  partes.push(
    `Campos da resposta: ${Object.entries(exigeDe(passo)).map(([c, t]) => `${c} (${t})`).join(", ")} — ou \`pergunta\`, se o passo depender do dev.`,
  );
  return partes.join("\n\n");
}

async function fazer(ctx, passo, rot, item, rotItem = "", bloco = null) {
  const { estado, processo, adaptador, emitir, salvar } = ctx;
  // parada dentro de um bloco fica no bloco (é ele que o cursor aponta), com o passo de dentro em `sub`
  const dono = bloco ? [bloco.passo, { sub: passo.id }] : [passo, {}];
  let faltou = null;
  let erro = null;
  for (let t = 1; t <= passo.tentativas; t++) {
    if (t > 1)
      emitir(
        "tentativa",
        { passo: passo.id, tentativa: t },
        `↺ ${rot}${rotItem} — tentativa ${t}/${passo.tentativas}: ${faltou ? `faltou ${faltou.join(", ")}` : erro}`,
      );
    const prompt = montarPrompt(ctx, passo, item, faltou, bloco);
    const r = await adaptador.trabalhar({
      sessao: estado.sessao.id,
      iniciar: !estado.sessao.iniciada,
      preambulo: PREAMBULO,
      prompt,
      esquema: processo.esquema, // o mesmo em todo passo: o cache da conversa sobrevive
      permissao: passo.permissao ?? processo.sessao.permissao,
      ferramentas: [...processo.sessao.ferramentas, ...ferramentasDe(ctx, passo, item, bloco?.local)],
      modelo: processo.sessao.modelo,
      esforco: processo.sessao.esforco,
      cwd: estado.cwd,
      env: ctx.ambiente,
      limiteMs: passo.limiteMs,
    });
    registrarChamada(estado, passo.id, { tentativa: t, prompt, ...r.registro });
    if (r.sessaoCriada) estado.sessao.iniciada = true;
    contarCustoDaSessao(estado, passo.id, r.custoTotal);
    salvar(estado);
    if (!r.ok) {
      erro = r.erro;
      faltou = null;
      continue;
    }
    estado.pendente = null; // a fala do dev chegou à conversa
    delete estado.retornos[passo.id]; // e o retorno do juiz ou do comando também
    const pergunta = typeof r.estruturada?.pergunta === "string" ? r.estruturada.pergunta.trim() : "";
    if (pergunta) return perguntarAoDev(ctx, passo, rot + rotItem, pergunta, r.estruturada.opcoes, bloco?.passo);
    let saida = r.estruturada;
    if (!passo.exige && typeof saida?.resposta !== "string" && r.texto?.trim()) saida = { resposta: r.texto };
    const faltas = faltasNaSaida(saida, exigeDe(passo));
    if (!faltas.length) return { saida };
    faltou = faltas;
    erro = null;
  }
  return escalar(
    ctx,
    dono[0],
    rot + rotItem,
    faltou
      ? `a resposta não trouxe ${faltou.join(", ")} em ${passo.tentativas} tentativa(s)`
      : `o agente falhou ${passo.tentativas} vez(es) — ${erro}`,
    dono[1],
  );
}

// Bloco: para cada item, os passos de dentro em ordem; o item fecha antes do próximo começar. O que cada
// item produziu fica no estado (não só na memória da conversa); a saída do bloco é uma lista, um objeto
// por item, com a saída de cada passo de dentro: [{ github: {…}, deploy: {…} }, …].
async function fazerBloco(ctx, bloco, rot) {
  const { estado, emitir, salvar } = ctx;
  const lista = valorDe(bloco.para_cada, contexto(ctx));
  if (!Array.isArray(lista)) return escalar(ctx, bloco, rot, `${bloco.para_cada} não é uma lista`);
  if (!lista.length) return escalar(ctx, bloco, rot, `${bloco.para_cada} veio vazia — não há o que repetir; confirme`);
  const p = (estado.parciais[bloco.id] ??= { feitos: [], atual: {} });
  for (let k = p.feitos.length; k < lista.length; k++) {
    const rotItem = ` · item ${k + 1}/${lista.length}`;
    for (const sub of bloco.passos) {
      if (sub.id in p.atual) continue; // feito antes de uma parada ou de uma retomada
      const r = await fazer(ctx, sub, rot, lista[k], `${rotItem} · ${sub.id}`, { passo: bloco, local: p.atual, k, n: lista.length });
      if (r.parar) return r;
      p.atual[sub.id] = r.saida;
      delete estado.perguntas?.[sub.id];
      salvar(estado);
      emitir("item", { passo: bloco.id, item: k + 1, de: lista.length, sub: sub.id }, `  ✓ ${rot}${rotItem} · ${sub.id}`);
    }
    p.feitos.push(p.atual);
    p.atual = {};
    salvar(estado);
    emitir("item", { passo: bloco.id, item: k + 1, de: lista.length }, `  ✓ ${rot}${rotItem} fechado`);
  }
  delete estado.parciais[bloco.id];
  return { saida: p.feitos, resumo: `${p.feitos.length} itens` };
}

async function fazerParaCada(ctx, passo, rot) {
  const { estado, emitir, salvar } = ctx;
  const lista = valorDe(passo.para_cada, contexto(ctx));
  if (!Array.isArray(lista)) return escalar(ctx, passo, rot, `${passo.para_cada} não é uma lista`);
  if (!lista.length) return escalar(ctx, passo, rot, `${passo.para_cada} veio vazia — não há o que repetir; confirme`);
  const feitos = estado.parciais[passo.id] ?? [];
  for (let k = feitos.length; k < lista.length; k++) {
    const r = await fazer(ctx, passo, rot, lista[k], ` · item ${k + 1}/${lista.length}`);
    if (r.parar) return r;
    feitos.push(r.saida);
    estado.parciais[passo.id] = feitos;
    salvar(estado);
    emitir("item", { passo: passo.id, item: k + 1, de: lista.length }, `  ✓ ${rot} · item ${k + 1}/${lista.length}`);
  }
  delete estado.parciais[passo.id];
  return { saida: feitos, resumo: `${feitos.length} itens` };
}

const listaDeLacunas = (lacunas) => (lacunas?.length ? lacunas.map((l) => `- ${l}`).join("\n") : "- (o juiz não detalhou)");

async function julgar(ctx, passo, rot) {
  const { estado, processo, adaptador, emitir } = ctx;
  const material = renderizar(passo.texto, contexto(ctx));
  const ferramentas = ferramentasDe(ctx, passo);
  const r = await adaptador.julgar({
    entrada: material,
    ferramentas,
    pastas: [ctx.dirArquivos], // a pasta de evidências do run ({run.dir}): o que as ferramentas embutidas do juiz alcançam
    minimo: passo.ate,
    modelo: processo.sessao.modelo,
    esforco: processo.sessao.esforco,
    env: ctx.ambiente,
    limiteMs: passo.limiteMs,
  });
  registrarChamada(estado, passo.id, { material, ferramentas, ...r.registro });
  contarCusto(estado, passo.id, r.custo);
  if (!r.ok) return escalar(ctx, passo, rot, `o juiz falhou — ${r.erro}`);
  const { nota, lacunas } = r.veredito;
  const rodada = estado.rodadas[passo.id] ?? 1;
  if (nota >= passo.ate) {
    delete estado.rodadas[passo.id];
    return { saida: { nota, lacunas }, resumo: `nota ${nota} (mínimo ${passo.ate})` };
  }
  estado.saidas[passo.id] = { nota, lacunas };
  if (rodada >= passo.max)
    return escalar(
      ctx,
      passo,
      rot,
      `o juiz deu ${nota} (mínimo ${passo.ate}) na rodada ${rodada}/${passo.max}. Lacunas:\n${listaDeLacunas(lacunas)}`,
      { nota, lacunas },
    );
  estado.rodadas[passo.id] = rodada + 1;
  estado.retornos[passo.volta_para] =
    `Um juiz independente deu nota ${nota} (o mínimo é ${passo.ate}) ao que foi produzido. Refaça fechando estas lacunas:\n${listaDeLacunas(lacunas)}`;
  emitir(
    "volta",
    { passo: passo.id, nota, lacunas, para: passo.volta_para, rodada: rodada + 1 },
    `⚖ ${rot} — nota ${nota} < ${passo.ate} · volta para ${passo.volta_para} (rodada ${rodada + 1}/${passo.max})`,
  );
  return { voltarPara: indiceDe(processo, passo.volta_para) };
}

export function rodarShell(cmd, { cwd, env, limiteMs }) {
  return new Promise((resolve) => {
    let saida = "";
    let estourou = false;
    const filho = spawn("sh", ["-c", cmd], { cwd, env, stdio: ["ignore", "pipe", "pipe"] });
    filho.stdout.on("data", (d) => (saida += d));
    filho.stderr.on("data", (d) => (saida += d));
    const relogio = limiteMs
      ? setTimeout(() => {
          estourou = true;
          filho.kill("SIGTERM");
          setTimeout(() => filho.kill("SIGKILL"), 5000).unref();
        }, limiteMs)
      : null;
    filho.on("error", (e) => {
      clearTimeout(relogio);
      resolve({ codigo: -1, saida: `${saida}${e.message}`, estourou });
    });
    filho.on("close", (codigo) => {
      clearTimeout(relogio);
      resolve({ codigo: codigo ?? -1, saida, estourou });
    });
  });
}

async function comandar(ctx, passo, rot) {
  const { estado, processo, emitir } = ctx;
  const cmd = renderizar(passo.texto, contexto(ctx), { shell: true });
  const r = await rodarShell(cmd, { cwd: estado.cwd, env: ctx.ambiente, limiteMs: passo.limiteMs });
  registrarChamada(estado, passo.id, { comando: cmd, codigo: r.codigo, estourou: r.estourou, saida: r.saida.slice(-20_000) });
  const saida = { codigo: r.codigo, saida: r.saida.slice(-4000) };
  if (r.codigo === passo.espera && !r.estourou) {
    delete estado.rodadas[passo.id];
    return { saida, resumo: `saiu ${r.codigo}` };
  }
  estado.saidas[passo.id] = saida;
  const cauda = r.saida.trim().split("\n").slice(-20).join("\n") || "(sem saída)";
  const motivo = r.estourou ? "passou do limite de tempo" : `saiu com ${r.codigo} (esperado ${passo.espera})`;
  const rodada = estado.rodadas[passo.id] ?? 1;
  if (passo.volta_para && rodada < passo.max) {
    estado.rodadas[passo.id] = rodada + 1;
    estado.retornos[passo.volta_para] = `O comando \`${cmd}\` ${motivo}. Saída:\n${cauda}\nCorrija para ele passar.`;
    emitir(
      "volta",
      { passo: passo.id, codigo: r.codigo, para: passo.volta_para, rodada: rodada + 1 },
      `✗ ${rot} — ${motivo} · volta para ${passo.volta_para} (rodada ${rodada + 1}/${passo.max})`,
    );
    return { voltarPara: indiceDe(processo, passo.volta_para) };
  }
  return escalar(ctx, passo, rot, `o comando ${motivo}:\n${cauda}`);
}

function pedirAoDev(ctx, passo, rot) {
  const { estado, emitir } = ctx;
  const mensagem = renderizar(passo.texto, contexto(ctx));
  estado.parada = { passo: passo.id, tipo: "parada", mensagem };
  estado.status = "parada";
  emitir(
    "parada",
    { passo: passo.id, mensagem },
    `⏸ PARADA ${rot} — ${mensagem}\n  responda: runbook responder ${estado.id} "<sua resposta>"`,
  );
  return { parar: "parada" };
}

function escalar(ctx, passo, rot, motivo, extra = {}) {
  const { estado, emitir } = ctx;
  estado.parada = { passo: passo.id, tipo: "escalada", mensagem: motivo, ...extra };
  estado.status = "parada";
  emitir(
    "escalada",
    { passo: passo.id, motivo },
    [
      `✗ ${rot} — ${motivo}`,
      `⏸ PARADA ${rot} — precisa de você.`,
      `  oriente e refaça: runbook responder ${estado.id} "<orientação>"`,
      `  ou siga sem ele: runbook pular ${estado.id} "<motivo>"`,
    ].join("\n"),
  );
  return { parar: "parada" };
}

// O agente devolveu uma pergunta em vez de chutar: o motor para, o dev responde, e o MESMO passo
// (o mesmo item, num para_cada) é refeito na mesma conversa, com a resposta no pedido.
function perguntarAoDev(ctx, passo, rot, pergunta, opcoes, bloco = null) {
  const { estado, emitir } = ctx;
  const [dono, sub] = bloco ? [bloco, { sub: passo.id }] : [passo, {}];
  estado.perguntas ??= {};
  const n = (estado.perguntas[passo.id] ?? 0) + 1;
  estado.perguntas[passo.id] = n;
  if (n > MAX_PERGUNTAS)
    return escalar(ctx, dono, rot, `o agente perguntou ${MAX_PERGUNTAS} vezes neste passo sem concluir; a última foi «${pergunta}»`, sub);
  const escolhas = Array.isArray(opcoes) ? opcoes.map((o) => String(o).trim()).filter(Boolean).slice(0, 4) : [];
  estado.parada = { passo: dono.id, ...sub, tipo: "pergunta", mensagem: pergunta, opcoes: escolhas };
  estado.status = "parada";
  emitir(
    "pergunta",
    { passo: passo.id, pergunta, opcoes: escolhas },
    [
      `⏸ PERGUNTA ${rot} — ${pergunta}`,
      ...(escolhas.length ? [`  opções: ${escolhas.join(" · ")}`] : []),
      `  responda: runbook responder ${estado.id} "<sua resposta>"`,
    ].join("\n"),
  );
  return { parar: "parada" };
}

// A resposta do dev a uma parada, pergunta ou escalada. Parada: a fala vira a saída do passo e segue;
// com `segue`, só essa resposta segue, e qualquer outra volta ao volta_para com a fala do dev — sem
// `max`: quem reprova de novo é o próprio dev. Pergunta: a fala volta para a conversa e o mesmo passo
// é refeito. Escalada: refaz o passo (o juiz e o comando voltam ao volta_para) com a orientação dele.
// Pular só existe por ordem do dev, com o motivo dele, e aparece no relatório. Dentro de um bloco, a
// resposta vale só para o passo de dentro, no item corrente: os itens fechados ficam, pular pula só ele.
export function aplicarResposta(estado, processo, texto, { pular = false } = {}) {
  const { passo: id, tipo, sub } = estado.parada;
  const i = indiceDe(processo, id);
  const passo = processo.passos[i];
  if (sub) {
    const p = (estado.parciais[id] ??= { feitos: [], atual: {} });
    if (tipo !== "pergunta") delete estado.perguntas?.[sub];
    if (pular) {
      p.atual[sub] = { pulado: texto };
      estado.pulos[`${id} · item ${p.feitos.length + 1} · ${sub}`] = texto;
    } else estado.pendente = { passo: sub, tipo, texto, pergunta: estado.parada.mensagem };
    estado.cursor = i;
  } else if (tipo === "parada" && !pular && passo.segue && !mesmaResposta(texto, passo.segue)) {
    estado.retornos[passo.volta_para] = `O dev reprovou na parada «${id}»: ${texto}\nRefaça levando isso em conta.`;
    recomecarEm(estado, processo, indiceDe(processo, passo.volta_para));
  } else if (tipo === "parada") {
    estado.saidas[id] = pular ? { resposta: "", pulado: texto } : { resposta: texto };
    if (pular) estado.pulos[id] = texto;
    else estado.pendente = { passo: id, tipo, texto };
    estado.cursor = i + 1;
  } else if (pular) {
    estado.pulos[id] = texto;
    estado.saidas[id] = { ...(estado.saidas[id] ?? {}), pulado: texto };
    delete estado.rodadas[id];
    delete estado.parciais[id];
    delete estado.perguntas?.[id];
    estado.cursor = i + 1;
  } else if (tipo === "pergunta") {
    // os itens já feitos de um para_cada ficam; refaz-se só o que perguntou
    estado.pendente = { passo: id, tipo, texto, pergunta: estado.parada.mensagem };
    estado.cursor = i;
  } else {
    estado.pendente = { passo: id, tipo, texto };
    delete estado.rodadas[id];
    delete estado.perguntas?.[id];
    if (passo.tipo === "juiz" && estado.parada.lacunas)
      estado.retornos[passo.volta_para] =
        `Um juiz independente deu nota ${estado.parada.nota} (o mínimo é ${passo.ate}). Refaça fechando estas lacunas:\n${listaDeLacunas(estado.parada.lacunas)}`;
    const volta = (passo.tipo === "juiz" || passo.tipo === "comando") && passo.volta_para ? indiceDe(processo, passo.volta_para) : i;
    recomecarEm(estado, processo, volta);
  }
  estado.parada = null;
}

export function relatorio(estado, processo, dirArquivos) {
  const tempo = Object.values(estado.tempo.porPasso).reduce((a, b) => a + b, 0);
  const marcas = processo.passos.map((p) => {
    const s = estado.saidas[p.id];
    if (estado.pulos[p.id] !== undefined) return `⤼ ${p.id} (pulado pelo dev: ${estado.pulos[p.id]})`;
    if (s?.nao_se_aplica) return `⤼ ${p.id} (não se aplica)`;
    if (p.tipo === "juiz") return `✓ ${p.id} (nota ${s?.nota})`;
    if (p.para_cada) {
      const pulados = Object.keys(estado.pulos).filter((k) => k.startsWith(`${p.id} · `)).length;
      return `✓ ${p.id} (${Array.isArray(s) ? s.length : 0} itens${pulados ? ` · ${pulados} passo(s) de dentro pulado(s)` : ""})`;
    }
    return `✓ ${p.id}`;
  });
  // o que o processo declara mostrar no fim — é como o chat recebe o produto do run
  const resultado = processo.resultado
    ? renderizar(processo.resultado, { entrada: estado.entrada, passos: estado.saidas, run: { dir: dirArquivos, id: estado.id } }).trim()
    : "";
  return [
    `■ FIM ${estado.id} — ${processo.passos.length} passos · ${fmtDuracao(tempo)}${estado.custo.total ? ` · ${fmtCusto(estado.custo.total)}` : ""}`,
    `  ${marcas.join(" · ")}`,
    ...(resultado ? ["", resultado] : []),
  ].join("\n");
}
