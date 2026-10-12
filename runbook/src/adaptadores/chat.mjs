// chat.mjs — o adaptador do modo chat: o passo `faca` é feito no chat que chamou o run, à vista do dev.
//
// trabalhar: grava o pedido em <run>/tarefa.json, emite `✋ SUA VEZ` (quem acompanha sai com 11) e espera
//   o chat entregar a resposta em <run>/entrega.json (`runbook entregar`). Sem limite de tempo: o dev está
//   olhando. O laço do motor não muda — quem cobra o `exige`, refaz e julga continua sendo ele.
// julgar: o do adaptador de quem julga (o `claude`): o juiz continua cego, em sessão limpa.
import fs from "node:fs";
import path from "node:path";

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

export const arqTarefa = (pasta) => path.join(pasta, "tarefa.json");
export const arqEntrega = (pasta) => path.join(pasta, "entrega.json");

const recuar = (texto) =>
  texto
    .split("\n")
    .map((l) => (l ? `  ${l}` : l))
    .join("\n");

export function adaptadorChat({ pasta, emitir, id, juiz, intervaloMs = 250 }) {
  return {
    nome: "chat",

    async trabalhar(op) {
      fs.rmSync(arqEntrega(pasta), { force: true }); // uma entrega velha nunca responde a um pedido novo
      fs.writeFileSync(arqTarefa(pasta), JSON.stringify({ prompt: op.prompt, desde: new Date().toISOString() }, null, 2));
      emitir(
        "tarefa",
        { prompt: op.prompt },
        [
          "✋ SUA VEZ — faça aqui no chat, só este passo e por completo:",
          recuar(op.prompt),
          `  entregue: runbook entregar ${id} <<'JSON'`,
          "  { …os campos… }",
          "  JSON",
        ].join("\n"),
      );
      while (!fs.existsSync(arqEntrega(pasta))) await esperar(intervaloMs);
      const entrega = JSON.parse(fs.readFileSync(arqEntrega(pasta), "utf8"));
      fs.rmSync(arqEntrega(pasta), { force: true });
      fs.rmSync(arqTarefa(pasta), { force: true });
      return { ok: true, texto: "", estruturada: entrega, sessaoCriada: true, custoTotal: null, registro: { entrega } };
    },

    julgar: (op) => juiz.julgar(op),
  };
}
