// estado.mjs — o run em disco, em ~/.runbook/runs/<id>/:
//   estado.json      cursor, sessão, saídas, contadores, custo — a verdade do run
//   processo.yaml    o retrato do processo no início: retomar usa este, nunca o arquivo que pode ter mudado
//   eventos.jsonl    cada acontecimento, com a linha legível que o chat repassa
//   chamadas/        a resposta bruta de cada chamada ao agente, para auditoria
//   arquivos/        as evidências que os passos gravarem ({run.dir})
//   trava            o pid do único processo que pode mexer no run agora
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomBytes, randomUUID } from "node:crypto";

export const raizRunbook = () => process.env.RUNBOOK_HOME || path.join(os.homedir(), ".runbook");
export const pastaRuns = () => path.join(raizRunbook(), "runs");
export const pastaDoRun = (id) => path.join(pastaRuns(), id);
export const pastaArquivos = (id) => path.join(pastaDoRun(id), "arquivos");

export function novoRun(processo, entrada, cwd) {
  const agora = new Date();
  const carimbo = agora.toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15);
  const id = `${processo.nome}-${carimbo}-${randomBytes(2).toString("hex")}`;
  const dir = pastaDoRun(id);
  fs.mkdirSync(path.join(dir, "chamadas"), { recursive: true });
  fs.mkdirSync(path.join(dir, "arquivos"), { recursive: true });
  fs.writeFileSync(path.join(dir, "processo.yaml"), processo.fonte);
  const estado = {
    v: 1,
    id,
    processo: { nome: processo.nome, origem: processo.origem, hash: processo.hash, passos: processo.passos.length },
    entrada,
    cwd,
    criado: agora.toISOString(),
    atualizado: agora.toISOString(),
    status: "novo", // novo · rodando · parada · fim · erro · interrompido · parado
    cursor: 0,
    sessao: { cli: processo.sessao.cli, id: randomUUID(), iniciada: false, custoVisto: 0 },
    saidas: {},
    parciais: {}, // para_cada em andamento: as saídas dos itens já feitos
    rodadas: {}, // juiz/comando: em que rodada do laço o passo está
    retornos: {}, // o que o juiz ou o comando devolveu para o passo refazer
    pulos: {}, // passos que o dev mandou pular, com o motivo dele
    perguntas: {}, // quantas vezes o agente perguntou ao dev no passo corrente
    pendente: null, // a fala do dev ainda não entregue à conversa de trabalho
    parada: null, // { passo, tipo: parada | pergunta | escalada, mensagem, opcoes? }
    custo: { total: 0, porPasso: {} },
    tempo: { porPasso: {} },
    chamadas: 0,
    segmento: 0, // linha de eventos.jsonl onde começou a execução corrente
  };
  salvarEstado(estado);
  return estado;
}

export function salvarEstado(estado) {
  estado.atualizado = new Date().toISOString();
  const arq = path.join(pastaDoRun(estado.id), "estado.json");
  const tmp = `${arq}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(estado, null, 2));
  fs.renameSync(tmp, arq);
}

export function lerEstado(id) {
  try {
    return JSON.parse(fs.readFileSync(path.join(pastaDoRun(id), "estado.json"), "utf8"));
  } catch {
    return null;
  }
}

export function listarRuns() {
  let nomes = [];
  try {
    nomes = fs.readdirSync(pastaRuns());
  } catch {
    return [];
  }
  return nomes
    .map(lerEstado)
    .filter(Boolean)
    .sort((a, b) => (a.atualizado < b.atualizado ? 1 : -1));
}

// id exato, prefixo único ou "ultimo"
export function acharRun(pedido) {
  const runs = listarRuns();
  if (!pedido || pedido === "ultimo") return runs[0]?.id ?? null;
  if (runs.some((r) => r.id === pedido)) return pedido;
  const achados = runs.filter((r) => r.id.startsWith(pedido));
  return achados.length === 1 ? achados[0].id : null;
}

export function registrarChamada(estado, passoId, dados) {
  estado.chamadas += 1;
  const arq = path.join(pastaDoRun(estado.id), "chamadas", `${String(estado.chamadas).padStart(3, "0")}-${passoId}.json`);
  fs.writeFileSync(arq, JSON.stringify(dados, null, 2));
}

export const vivo = (pid) => {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === "EPERM";
  }
};

const arqTrava = (id) => path.join(pastaDoRun(id), "trava");

export function quemTrava(id) {
  try {
    const pid = Number(fs.readFileSync(arqTrava(id), "utf8"));
    return vivo(pid) ? pid : null;
  } catch {
    return null;
  }
}

export function travar(id) {
  try {
    fs.writeFileSync(arqTrava(id), String(process.pid), { flag: "wx" });
    return true;
  } catch {
    if (quemTrava(id)) return false;
    fs.writeFileSync(arqTrava(id), String(process.pid));
    return true;
  }
}

export function destravar(id) {
  try {
    if (Number(fs.readFileSync(arqTrava(id), "utf8")) === process.pid) fs.rmSync(arqTrava(id));
  } catch {
    // já destravado
  }
}
