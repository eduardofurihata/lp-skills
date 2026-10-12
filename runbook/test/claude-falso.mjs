#!/usr/bin/env node
// claude-falso.mjs — um `claude -p` de mentira para os testes: responde conforme um roteiro e registra
// cada chamada. Nenhum token gasto, e a ordem das respostas é sempre a mesma.
//
// RUNBOOK_FALSO_ROTEIRO   JSON com uma lista de respostas, consumidas em ordem (contador em <roteiro>.n):
//   { "estruturada": {...} }          resposta com structured_output
//   { "texto": "..." }                resposta só com result
//   { "nota": 95, "lacunas": [...] }  veredito de juiz
//   { "erro": "...", "codigo": 1 }    falha
//   { "dormir": 3000, ... }           demora antes de responder
//   { "custo": 0.1 }                  total_cost_usd informado
// RUNBOOK_FALSO_REGISTRO  JSONL onde cada chamada é anexada: { n, args, entrada, cwd, pwx, claudecode }
import fs from "node:fs";

const roteiro = JSON.parse(fs.readFileSync(process.env.RUNBOOK_FALSO_ROTEIRO, "utf8"));
const contador = `${process.env.RUNBOOK_FALSO_ROTEIRO}.n`;
const n = fs.existsSync(contador) ? Number(fs.readFileSync(contador, "utf8")) : 0;
fs.writeFileSync(contador, String(n + 1));

const args = process.argv.slice(2);
const entrada = fs.readFileSync(0, "utf8");
fs.appendFileSync(
  process.env.RUNBOOK_FALSO_REGISTRO,
  `${JSON.stringify({ n, args, entrada, cwd: process.cwd(), pwx: process.env.PWX_SESSION ?? null, claudecode: process.env.CLAUDECODE ?? null })}\n`,
);

const valorDe = (flag) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : null);
const sessao = valorDe("--session-id") ?? valorDe("--resume") ?? `juiz-${n}`;
const r = roteiro[n] ?? { erro: `roteiro acabou na chamada ${n}`, codigo: 1 };

function responder() {
  if (r.erro) {
    process.stdout.write(JSON.stringify({ type: "result", is_error: true, result: r.erro, session_id: sessao }));
    process.exit(r.codigo ?? 1);
  }
  const saida = {
    type: "result",
    subtype: "success",
    is_error: false,
    session_id: sessao,
    total_cost_usd: r.custo ?? 0,
    result: r.texto ?? "",
  };
  if (r.estruturada !== undefined) saida.structured_output = r.estruturada;
  if (r.nota !== undefined) saida.structured_output = { nota: r.nota, lacunas: r.lacunas ?? [] };
  process.stdout.write(JSON.stringify(saida));
  process.exit(0);
}

if (r.dormir) setTimeout(responder, r.dormir);
else responder();
