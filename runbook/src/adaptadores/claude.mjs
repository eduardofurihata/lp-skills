// claude.mjs — o adaptador do Claude Code, com o login de quem roda (OAuth ou chave, o que o `claude` já usar).
//
// trabalhar: a conversa de trabalho. O 1º passo cria a sessão com --session-id; os seguintes continuam
//   a MESMA sessão com --resume — o agente lembra de tudo o que leu, sem resumo no meio.
// julgar: o juiz cego, o mesmo bloco da sessão cega do /brain — diretório vazio, --safe-mode (sem
//   CLAUDE.md, skills, plugins, hooks, MCP), sem ferramenta nenhuma, entrada por stdin. Com `ferramentas`,
//   o juiz confere na fonte: continua sem a conversa, num diretório vazio e sem as ferramentas embutidas,
//   mas sem --safe-mode (que desliga o MCP) e com só as ferramentas pedidas liberadas (dontAsk). As embutidas
//   pedidas (ex.: Read) ficam ligadas e só alcançam as `pastas` dadas (a de evidências do run, por --add-dir).
//
// Interface de um adaptador (a mesma para codex, gemini, agy depois):
//   trabalhar({ sessao, iniciar, preambulo, prompt, esquema, permissao, ferramentas, modelo, esforco, cwd, env, limiteMs })
//     → { ok, texto, estruturada, sessaoCriada, custoTotal, erro, registro }
//   julgar({ entrada, ferramentas, pastas, minimo, modelo, esforco, env, limiteMs }) → { ok, veredito: { nota, lacunas }, custo, erro, registro }
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// os hooks de quem roda (notificação, Orca, o close-tab do pwx no fim de sessão) não disparam a cada passo
const SEM_HOOKS = JSON.stringify({ disableAllHooks: true });

const REGRAS_DO_JUIZ = `- A régua é o critério que o texto pede. Não invente critério novo; comprimento não é qualidade.
- Nota de 0 a 100: 100 = atende por completo; abaixo de 90 = há lacuna que muda o resultado.
- Lacunas: o que falta ou está errado, concreto e corrigível, uma por item. Sem elogio, sem preâmbulo.
- Não presuma o que não está no texto; o que não dá para verificar é lacuna.
- Responda no idioma do texto recebido.

Responda só com JSON: {"nota": <0 a 100>, "lacunas": ["…"]}`;

const SISTEMA_DO_JUIZ = `Você é um juiz cego: não existe conversa anterior, arquivo, projeto, memória nem ferramenta — só o texto que chega agora. Julgue só o que está nele.

${REGRAS_DO_JUIZ}`;

const SISTEMA_DO_JUIZ_NA_FONTE = `Você é um juiz independente: não viu a conversa que produziu o texto que chega agora. Você tem só ferramentas de leitura — use-as para conferir na fonte o que o texto afirma, em vez de confiar nele. Nunca escreva nem mude nada.

${REGRAS_DO_JUIZ}`;

const ESQUEMA_DO_JUIZ = {
  type: "object",
  properties: { nota: { type: "number" }, lacunas: { type: "array", items: { type: "string" } } },
  required: ["nota", "lacunas"],
};

// os argumentos do juiz: cego (--safe-mode, nenhuma ferramenta) ou, com `ferramentas`, na fonte — sem a conversa,
// só as ferramentas pedidas (dontAsk), as embutidas entre elas ligadas em --tools e confinadas às `pastas`
export function argumentosDoJuiz(op) {
  const naFonte = op.ferramentas?.length > 0;
  const embutidas = (op.ferramentas ?? []).filter((f) => !f.startsWith("mcp__"));
  return [
    "-p",
    "--output-format",
    "json",
    ...(naFonte
      ? ["--settings", SEM_HOOKS, "--permission-mode", "dontAsk", "--permission-prompts", "none", "--allowedTools", op.ferramentas.join(",")]
      : ["--safe-mode"]),
    ...(naFonte ? (op.pastas ?? []).flatMap((p) => ["--add-dir", p]) : []),
    "--no-session-persistence",
    "--system-prompt",
    naFonte ? SISTEMA_DO_JUIZ_NA_FONTE : SISTEMA_DO_JUIZ,
    "--json-schema",
    JSON.stringify(ESQUEMA_DO_JUIZ),
    ...(op.modelo ? ["--model", op.modelo] : []),
    ...(op.esforco ? ["--effort", op.esforco] : []), // o mesmo do processo: o juiz não herda o settings.json no --safe-mode
    "--tools", // variádica: vem por último, como no /brain
    naFonte ? embutidas.join(",") : "",
  ];
}

function semClaudeCode(env) {
  const e = { ...(env ?? process.env) };
  delete e.CLAUDECODE; // um Claude dentro do outro
  return e;
}

function rodar(bin, args, { entrada, cwd, env, limiteMs }) {
  return new Promise((resolve) => {
    let out = "";
    let err = "";
    let estourou = false;
    const filho = spawn(bin, args, { cwd, env: semClaudeCode(env), stdio: ["pipe", "pipe", "pipe"] });
    filho.stdout.on("data", (d) => (out += d));
    filho.stderr.on("data", (d) => (err += d));
    const relogio = limiteMs
      ? setTimeout(() => {
          estourou = true;
          filho.kill("SIGINT"); // SIGINT encerra o turno; SIGTERM o deixaria pela metade
          setTimeout(() => filho.kill("SIGKILL"), 10_000).unref();
        }, limiteMs)
      : null;
    filho.on("error", (e) => {
      clearTimeout(relogio);
      resolve({ codigo: null, out, err: `${err}${e.message}`, estourou });
    });
    filho.on("close", (codigo) => {
      clearTimeout(relogio);
      resolve({ codigo, out, err, estourou });
    });
    filho.stdin.on("error", () => {});
    filho.stdin.end(entrada ?? "");
  });
}

function json(texto) {
  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
}

// --output-format json imprime um objeto: result, session_id, is_error, total_cost_usd, structured_output
function interpretar({ codigo, out, err, estourou }, sessao) {
  const registro = { codigo, stdout: out.slice(-20_000), stderr: err.slice(-4000) };
  if (estourou) return { ok: false, erro: "passou do limite de tempo", registro };
  const j = json(out.trim()) ?? json(out.trim().split("\n").pop() ?? "");
  if (!j || typeof j !== "object") {
    const motivo = (err.trim() || out.trim() || `saiu com ${codigo}`).split("\n").slice(-3).join(" ");
    return { ok: false, erro: motivo.slice(0, 400), registro };
  }
  const base = {
    registro,
    sessaoCriada: Boolean(sessao) && j.session_id === sessao,
    custoTotal: typeof j.total_cost_usd === "number" ? j.total_cost_usd : null,
  };
  if (codigo !== 0 || j.is_error) return { ...base, ok: false, erro: String(j.result ?? j.error ?? `saiu com ${codigo}`).slice(0, 400) };
  const texto = typeof j.result === "string" ? j.result : "";
  return { ...base, ok: true, texto, estruturada: j.structured_output ?? null };
}

// plano B, se o schema não vier aplicado: um JSON com "nota" no texto, ou uma linha "NOTA: n"
function veredito(estruturada, texto) {
  const de = (o) =>
    o && typeof o.nota === "number" ? { nota: o.nota, lacunas: Array.isArray(o.lacunas) ? o.lacunas.map(String) : [] } : null;
  const direto = de(estruturada);
  if (direto) return direto;
  const bloco = /\{[\s\S]*"nota"[\s\S]*\}/.exec(texto ?? "");
  const doTexto = bloco ? de(json(bloco[0])) : null;
  if (doTexto) return doTexto;
  const linha = /NOTA:\s*(\d{1,3})/i.exec(texto ?? "");
  if (!linha) return null;
  const lacunas = (texto.split(/LACUNAS?:/i)[1] ?? "")
    .split("\n")
    .map((l) => l.replace(/^\s*[-*]\s*/, "").trim())
    .filter(Boolean);
  return { nota: Number(linha[1]), lacunas };
}

export function adaptadorClaude({ bin = process.env.RUNBOOK_CLAUDE_BIN || "claude" } = {}) {
  return {
    nome: "claude",

    async trabalhar(op) {
      const chamar = (iniciar) => {
        const args = [
          "-p",
          "--output-format",
          "json",
          ...(iniciar ? ["--session-id", op.sessao] : ["--resume", op.sessao]),
          "--permission-mode",
          op.permissao === "leitura" ? "dontAsk" : "bypassPermissions",
          "--permission-prompts",
          "none",
          "--settings",
          SEM_HOOKS,
        ];
        if (iniciar && op.preambulo) args.push("--append-system-prompt", op.preambulo);
        if (op.esquema) args.push("--json-schema", JSON.stringify(op.esquema));
        if (op.ferramentas?.length) args.push("--allowedTools", op.ferramentas.join(","));
        if (op.modelo) args.push("--model", op.modelo);
        if (op.esforco) args.push("--effort", op.esforco);
        return rodar(bin, args, { entrada: op.prompt, cwd: op.cwd, env: op.env, limiteMs: op.limiteMs });
      };
      let r = interpretar(await chamar(op.iniciar), op.sessao);
      // a sessão já existe (uma tentativa anterior a criou e caiu depois): continua a mesma
      if (!r.ok && op.iniciar && /already (in use|exists)|já (existe|em uso)/i.test(`${r.erro} ${r.registro.stderr}`))
        r = { ...interpretar(await chamar(false), op.sessao), sessaoCriada: true };
      if (r.ok && op.esquema && !r.estruturada) r.estruturada = json(r.texto.trim());
      return r;
    },

    async julgar(op) {
      const vazio = fs.mkdtempSync(path.join(os.tmpdir(), "runbook-juiz-"));
      const args = argumentosDoJuiz(op);
      const bruto = await rodar(bin, args, { entrada: op.entrada, cwd: vazio, env: op.env, limiteMs: op.limiteMs });
      fs.rmSync(vazio, { recursive: true, force: true });
      const r = interpretar(bruto, null);
      const custo = r.custoTotal ?? 0;
      if (!r.ok) return { ok: false, erro: r.erro, custo, registro: r.registro };
      const v = veredito(r.estruturada, r.texto);
      return v
        ? { ok: true, veredito: v, custo, registro: r.registro }
        : { ok: false, erro: "o juiz não devolveu nota", custo, registro: r.registro };
    },
  };
}
