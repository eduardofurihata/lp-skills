// eventos.mjs — cada acontecimento do run vira um registro em eventos.jsonl com a linha legível
// que o terminal mostra e o chat repassa. Quem acompanha só lê este arquivo.
import fs from "node:fs";
import path from "node:path";
import { pastaDoRun } from "./estado.mjs";

// o evento que encerra uma execução, e o código de saída de quem acompanha
// tarefa (modo chat): quem acompanha sai, o trabalhador continua esperando a entrega do chat
export const TERMINAIS = { fim: 0, parada: 10, pergunta: 10, escalada: 10, tarefa: 11, erro: 1, caiu: 1, parado: 1 };

const arqEventos = (id) => path.join(pastaDoRun(id), "eventos.jsonl");

export function emissor(id) {
  return (tipo, dados = {}, linha = "") => {
    const ev = { ts: new Date().toISOString(), tipo, ...dados, linha };
    fs.appendFileSync(arqEventos(id), `${JSON.stringify(ev)}\n`);
    return ev;
  };
}

export function lerEventos(id) {
  try {
    return fs
      .readFileSync(arqEventos(id), "utf8")
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l));
  } catch {
    return [];
  }
}

export const fmtDuracao = (ms) =>
  ms < 60_000 ? `${Math.max(0, Math.round(ms / 1000))}s` : `${Math.floor(ms / 60_000)}m${String(Math.round((ms % 60_000) / 1000)).padStart(2, "0")}s`;

export const fmtCusto = (usd) => (usd ? `$${usd.toFixed(2)}` : "");
