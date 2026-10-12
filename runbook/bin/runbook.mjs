#!/usr/bin/env node
// runbook — executa processos (YAML) passo a passo, com o agente na mesma conversa do começo ao fim.
//
// O trabalho roda num processo próprio, em segundo plano; quem acompanha (terminal, chat) só lê os
// eventos. Fechar o terminal ou o Monitor do chat expirar não derruba o run: `runbook seguir` volta a
// acompanhar. `run`, `responder`, `pular` e `retomar` acompanham até a próxima parada ou o fim.
import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { interpretarProcesso, lerProcesso } from "../src/processo.mjs";
import {
  acharRun,
  destravar,
  lerEstado,
  listarRuns,
  novoRun,
  pastaArquivos,
  pastaDoRun,
  quemTrava,
  salvarEstado,
  travar,
  vivo,
} from "../src/estado.mjs";
import { TERMINAIS, emissor, lerEventos } from "../src/eventos.mjs";
import { aplicarResposta, executar } from "../src/motor.mjs";
import { adaptadorClaude } from "../src/adaptadores/claude.mjs";

const ESTE = fileURLToPath(import.meta.url);
const VERSAO = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

class Uso extends Error {
  constructor(msg, codigo = 2) {
    super(msg);
    this.codigo = codigo;
  }
}

function analisarOpcoes(args) {
  const posicionais = [];
  const opcoes = {};
  for (let k = 0; k < args.length; k++) {
    const a = args[k];
    if (!a.startsWith("--")) {
      posicionais.push(a);
      continue;
    }
    const [chave, ...valor] = a.slice(2).split("=");
    if (valor.length) opcoes[chave] = valor.join("=");
    else if (k + 1 < args.length && !args[k + 1].startsWith("--")) opcoes[chave] = args[++k];
    else opcoes[chave] = true;
  }
  return { posicionais, opcoes };
}

function runPedido(pedido) {
  const id = acharRun(pedido);
  if (!id) throw new Uso(pedido ? `nenhum run único com "${pedido}" — veja: runbook lista` : "nenhum run nesta máquina");
  return id;
}

function processoDoRun(id) {
  const fonte = fs.readFileSync(path.join(pastaDoRun(id), "processo.yaml"), "utf8");
  const { processo, erros } = interpretarProcesso(fonte, lerEstado(id)?.processo?.origem);
  if (erros.length) throw new Uso(`o retrato do processo do run ${id} não é válido:\n  ${erros.join("\n  ")}`, 1);
  return processo;
}

function adaptadorDe(processo) {
  if (processo.sessao.cli === "claude") return adaptadorClaude();
  throw new Error(`sem adaptador para ${processo.sessao.cli}`);
}

// uma janela do pwx por run; fecha quando o run termina (no meio, numa parada, o dev pode precisar dela)
function fecharPwx(id) {
  try {
    spawnSync(process.env.RUNBOOK_PWX_BIN || "pwx", ["close-tab"], {
      env: { ...process.env, PWX_SESSION: `runbook-${id}` },
      stdio: "ignore",
      timeout: 15_000,
    });
  } catch {
    // sem pwx nesta máquina
  }
}

// uma execução começa sempre por uma linha própria em eventos.jsonl; quem acompanha lê dali em diante
function iniciarSegmento(estado, linha) {
  estado.segmento = lerEventos(estado.id).length;
  salvarEstado(estado);
  emissor(estado.id)("segmento", {}, linha);
}

function iniciarTrabalhador(estado) {
  const log = fs.openSync(path.join(pastaDoRun(estado.id), "trabalhador.log"), "a");
  const filho = spawn(process.execPath, [ESTE, "_trabalhar", estado.id], {
    detached: true,
    stdio: ["ignore", log, log],
    cwd: estado.cwd,
    env: process.env,
  });
  filho.unref();
  fs.closeSync(log);
  // à parte do estado.json: o trabalhador já pode estar gravando o estado dele
  fs.writeFileSync(path.join(pastaDoRun(estado.id), "pid"), String(filho.pid));
}

function pidDoTrabalhador(id) {
  try {
    const pid = Number(fs.readFileSync(path.join(pastaDoRun(id), "pid"), "utf8"));
    return vivo(pid) ? pid : null;
  } catch {
    return null;
  }
}

async function seguir(id, desde = 0) {
  let i = desde;
  let vistoVivo = Date.now();
  process.once("SIGINT", () => {
    process.stdout.write(`\n(o run continua em segundo plano — acompanhar: runbook seguir ${id})\n`);
    process.exit(0);
  });
  for (;;) {
    const eventos = lerEventos(id);
    for (; i < eventos.length; i++) {
      if (eventos[i].linha) process.stdout.write(`${eventos[i].linha}\n`);
      if (eventos[i].tipo in TERMINAIS) return TERMINAIS[eventos[i].tipo];
    }
    if (quemTrava(id) || pidDoTrabalhador(id)) vistoVivo = Date.now();
    else if (Date.now() - vistoVivo > 3000 && lerEventos(id).length === i) {
      process.stdout.write(`✗ o run parou sem terminar — continue com: runbook retomar ${id}\n`);
      return 1;
    }
    await esperar(250);
  }
}

const comandos = {
  async run(args) {
    const { posicionais, opcoes } = analisarOpcoes(args);
    if (!posicionais[0]) throw new Uso("uso: runbook run <processo.yaml> [--dir <pasta>] [--<entrada> <valor>…]");
    const { processo, erros } = lerProcesso(posicionais[0]);
    if (erros.length) throw new Uso(`processo inválido:\n${erros.map((e) => `  ✗ ${e}`).join("\n")}`, 1);
    const dir = path.resolve(typeof opcoes.dir === "string" ? opcoes.dir : process.cwd());
    delete opcoes.dir;
    const faltam = processo.entrada.filter((e) => typeof opcoes[e] !== "string");
    const sobram = Object.keys(opcoes).filter((k) => !processo.entrada.includes(k));
    if (faltam.length || sobram.length)
      throw new Uso(
        [
          ...faltam.map((f) => `falta --${f} <valor>`),
          ...sobram.map((s) => `--${s} não é entrada deste processo (entradas: ${processo.entrada.join(", ") || "nenhuma"})`),
        ].join("\n"),
      );
    if (!fs.existsSync(dir)) throw new Uso(`a pasta ${dir} não existe`);
    const estado = novoRun(processo, opcoes, dir);
    iniciarSegmento(estado, `● RUN ${estado.id} — ${processo.nome}, ${processo.passos.length} passos · acompanhar: runbook seguir ${estado.id}`);
    iniciarTrabalhador(estado);
    return seguir(estado.id, estado.segmento);
  },

  async seguir([pedido]) {
    const id = runPedido(pedido ?? "ultimo");
    return seguir(id, lerEstado(id).segmento);
  },

  responder: (args) => responder(args, false),
  pular: (args) => responder(args, true),

  async retomar([pedido]) {
    const id = runPedido(pedido);
    const estado = lerEstado(id);
    if (quemTrava(id)) return seguir(id, estado.segmento);
    if (estado.status === "fim") throw new Uso(`o run ${id} já terminou`, 0);
    if (estado.status === "parado") throw new Uso(`o run ${id} foi parado`);
    if (estado.status === "parada") throw new Uso(`o run ${id} espera você: runbook responder ${id} "<resposta>" (ou runbook pular)`);
    iniciarSegmento(estado, `↻ retomando ${id} no passo ${estado.cursor + 1}/${estado.processo.passos}`);
    iniciarTrabalhador(estado);
    return seguir(id, estado.segmento);
  },

  async parar([pedido]) {
    const id = runPedido(pedido);
    const estado = lerEstado(id);
    if (["fim", "parado"].includes(estado.status)) {
      console.log(`o run ${id} já está ${estado.status}`);
      return 0;
    }
    fs.writeFileSync(path.join(pastaDoRun(id), "parar"), "");
    const pid = quemTrava(id) ?? pidDoTrabalhador(id);
    if (pid) {
      try {
        process.kill(-pid, "SIGTERM"); // o grupo: o trabalhador e o agente que ele chamou
      } catch {
        try {
          process.kill(pid, "SIGTERM");
        } catch {
          // já saiu
        }
      }
      for (let t = 0; t < 40 && lerEstado(id).status !== "parado"; t++) await esperar(250);
    }
    if (lerEstado(id).status !== "parado") {
      const e = lerEstado(id);
      e.status = "parado";
      salvarEstado(e);
      emissor(id)("parado", {}, `■ PARADO ${id} — pelo dev`);
      fecharPwx(id);
    }
    console.log(`■ run ${id} parado`);
    return 0;
  },

  async status([pedido]) {
    const id = runPedido(pedido ?? "ultimo");
    const e = lerEstado(id);
    const processo = processoDoRun(id);
    const trabalhando = Boolean(quemTrava(id));
    const total = processo.passos.length;
    const linhas = [
      `run      ${id}`,
      `processo ${e.processo.nome} · ${e.processo.origem}`,
      `status   ${e.status}${trabalhando ? " (trabalhando agora)" : ""}`,
      `passo    ${e.status === "fim" ? `todos os ${total}` : `${e.cursor + 1}/${total} ${processo.passos[e.cursor]?.id ?? ""}`}`,
    ];
    if (e.parada) {
      const rotulo = { parada: "parada  ", pergunta: "pergunta", escalada: "escalada" }[e.parada.tipo] ?? "parada  ";
      linhas.push(`${rotulo} ${e.parada.mensagem.split("\n").join("\n         ")}`);
      if (e.parada.opcoes?.length) linhas.push(`opções   ${e.parada.opcoes.join(" · ")}`);
      linhas.push(`         responder: runbook responder ${id} "<resposta>"${e.parada.tipo === "parada" ? "" : ` · pular: runbook pular ${id} "<motivo>"`}`);
    }
    if (e.custo.total) linhas.push(`custo    $${e.custo.total.toFixed(2)}`);
    linhas.push(`pasta    ${pastaDoRun(id)}`);
    const ultimos = lerEventos(id).filter((ev) => ev.linha).slice(-6);
    if (ultimos.length) linhas.push("últimos eventos:", ...ultimos.map((ev) => `  ${ev.linha.split("\n")[0]}`));
    console.log(linhas.join("\n"));
    return 0;
  },

  async lista() {
    const runs = listarRuns();
    if (!runs.length) console.log("nenhum run nesta máquina");
    for (const r of runs)
      console.log(
        `${r.id}  ${r.status.padEnd(12)} passo ${String(Math.min(r.cursor + 1, r.processo.passos)).padStart(2)}/${r.processo.passos}  ${r.atualizado.slice(0, 16).replace("T", " ")}`,
      );
    return 0;
  },

  async validar([arquivo]) {
    if (!arquivo) throw new Uso("uso: runbook validar <processo.yaml>");
    const { processo, erros } = lerProcesso(arquivo);
    if (erros.length) throw new Uso(`✗ ${arquivo}\n${erros.map((e) => `  ✗ ${e}`).join("\n")}`, 1);
    const tipos = processo.passos.reduce((a, p) => ({ ...a, [p.tipo]: (a[p.tipo] ?? 0) + 1 }), {});
    console.log(`✓ ${processo.nome}: ${processo.passos.length} passos (${Object.entries(tipos).map(([t, n]) => `${n} ${t}`).join(", ")})`);
    return 0;
  },

  // o processo que de fato executa o run (chamado pelo run/responder/pular/retomar, em segundo plano)
  async _trabalhar([id]) {
    if (!travar(id)) return 3;
    const estado = lerEstado(id);
    const processo = processoDoRun(id);
    const emitir = emissor(id);
    const ambiente = { ...process.env, PWX_SESSION: `runbook-${id}` };
    delete ambiente.CLAUDECODE;
    const encerrar = (sinal) => {
      const pedidoDoDev = fs.existsSync(path.join(pastaDoRun(id), "parar"));
      estado.status = pedidoDoDev ? "parado" : "interrompido";
      salvarEstado(estado);
      if (pedidoDoDev) {
        emitir("parado", {}, `■ PARADO ${id} — pelo dev`);
        fecharPwx(id);
      } else emitir("caiu", { sinal }, `✗ run interrompido (${sinal}) — continue com: runbook retomar ${id}`);
      destravar(id);
      process.exit(1);
    };
    for (const s of ["SIGTERM", "SIGINT", "SIGHUP"]) process.on(s, () => encerrar(s));
    let fim;
    try {
      fim = await executar({
        estado,
        processo,
        adaptador: adaptadorDe(processo),
        emitir,
        salvar: salvarEstado,
        ambiente,
        dirArquivos: pastaArquivos(id),
      });
    } catch (e) {
      estado.status = "erro";
      salvarEstado(estado);
      emitir("erro", { erro: String(e?.stack ?? e) }, `✗ erro no motor: ${e?.message ?? e} — detalhes: runbook status ${id}`);
      fim = "erro";
    }
    if (fim === "fim") fecharPwx(id);
    destravar(id);
    return 0;
  },

  async ajuda() {
    console.log(`runbook ${VERSAO} — executa processos passo a passo

  runbook run <processo.yaml> [--dir <pasta>] [--<entrada> <valor>…]
                                           começa um run e acompanha até a próxima parada ou o fim
  runbook seguir [run]                     volta a acompanhar (sair não para o trabalho)
  runbook responder <run> "<resposta>"     responde a uma parada, ou orienta e refaz um passo escalado
  runbook pular <run> "<motivo>"           segue sem o passo parado — fica no relatório
  runbook status [run]                     onde o run está
  runbook lista                            os runs desta máquina
  runbook retomar <run>                    continua um run que caiu
  runbook parar <run>                      encerra um run
  runbook validar <processo.yaml>          confere um processo sem rodar

Saída: 0 fim · 10 parada (espera você) · 1 erro · 2 uso inválido. Runs em ~/.runbook/runs/.`);
    return 0;
  },
};

async function responder(args, pular) {
  const [pedido, ...resto] = args;
  const texto = resto.join(" ").trim();
  if (!pedido || !texto) throw new Uso(pular ? 'uso: runbook pular <run> "<motivo>"' : 'uso: runbook responder <run> "<resposta>"');
  const id = runPedido(pedido);
  if (quemTrava(id)) throw new Uso(`o run ${id} está rodando — acompanhe: runbook seguir ${id}`);
  const estado = lerEstado(id);
  if (estado.status !== "parada" || !estado.parada) throw new Uso(`o run ${id} não está numa parada (status: ${estado.status})`);
  const processo = processoDoRun(id);
  const passo = estado.parada.passo;
  aplicarResposta(estado, processo, texto, { pular });
  estado.status = "retomando";
  iniciarSegmento(estado, pular ? `↳ o dev pulou ${passo}: ${texto}` : `↳ resposta do dev em ${passo}: ${texto}`);
  iniciarTrabalhador(estado);
  return seguir(id, estado.segmento);
}

const [cmd = "ajuda", ...args] = process.argv.slice(2);
const apelidos = { "--version": "versao", "-v": "versao", "--help": "ajuda", "-h": "ajuda", help: "ajuda" };
const nome = apelidos[cmd] ?? cmd;
if (nome === "versao") console.log(VERSAO);
else if (!comandos[nome]) {
  console.error(`comando desconhecido: ${cmd} — veja: runbook ajuda`);
  process.exitCode = 2;
} else
  comandos[nome](args).then(
    (codigo) => (process.exitCode = codigo ?? 0),
    (e) => {
      if (e instanceof Uso) {
        (e.codigo === 0 ? console.log : console.error)(e.message);
        process.exitCode = e.codigo;
      } else {
        console.error(e?.stack ?? e);
        process.exitCode = 1;
      }
    },
  );
