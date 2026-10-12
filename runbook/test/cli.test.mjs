// cli.test.mjs — o runbook de ponta a ponta, com o claude-falso no lugar do `claude`: o trabalho em
// segundo plano, quem acompanha, as paradas, o juiz cego, a conversa contínua, retomar e parar.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const BIN = fileURLToPath(new URL("../bin/runbook.mjs", import.meta.url));
const FALSO = fileURLToPath(new URL("./claude-falso.mjs", import.meta.url));
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

function cenario(roteiro, yaml) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "runbook-cli-"));
  const projeto = path.join(dir, "projeto");
  fs.mkdirSync(projeto);
  fs.writeFileSync(path.join(dir, "roteiro.json"), JSON.stringify(roteiro));
  fs.writeFileSync(path.join(dir, "processo.yaml"), yaml);
  const registro = path.join(dir, "registro.jsonl");
  const env = {
    ...process.env,
    RUNBOOK_HOME: path.join(dir, "home"),
    RUNBOOK_CLAUDE_BIN: FALSO,
    RUNBOOK_FALSO_ROTEIRO: path.join(dir, "roteiro.json"),
    RUNBOOK_FALSO_REGISTRO: registro,
    RUNBOOK_PWX_BIN: "true",
    CLAUDECODE: "1", // como dentro de uma sessão do Claude Code: o motor tem de tirar
  };
  return {
    dir,
    projeto,
    env,
    yaml: path.join(dir, "processo.yaml"),
    cli: (...args) => {
      const r = spawnSync(process.execPath, [BIN, ...args], { env, encoding: "utf8", timeout: 60_000 });
      return { codigo: r.status, saida: r.stdout, erro: r.stderr };
    },
    // o mesmo, com o stdin preenchido (o `entregar` lê o JSON dali)
    cliStdin: (stdin, ...args) => {
      const r = spawnSync(process.execPath, [BIN, ...args], { env, encoding: "utf8", timeout: 60_000, input: stdin });
      return { codigo: r.status, saida: r.stdout, erro: r.stderr };
    },
    emSegundoPlano: (...args) => {
      const filho = spawn(process.execPath, [BIN, ...args], { env });
      const r = { saida: "", codigo: null, pid: filho.pid };
      filho.stdout.on("data", (d) => (r.saida += d));
      r.fim = new Promise((res) => filho.on("close", (c) => res((r.codigo = c))));
      return r;
    },
    chamadas: () =>
      fs.existsSync(registro)
        ? fs.readFileSync(registro, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l))
        : [],
    estado: (id) => JSON.parse(fs.readFileSync(path.join(env.RUNBOOK_HOME, "runs", id, "estado.json"), "utf8")),
  };
}

const idDo = (saida) => /● RUN (\S+)/.exec(saida)?.[1];
const valorDe = (chamada, flag) => chamada.args[chamada.args.indexOf(flag) + 1];
const ate = async (cond, ms = 10_000) => {
  for (const fim = Date.now() + ms; Date.now() < fim; await esperar(50)) if (cond()) return true;
  return false;
};

const PROCESSO = `nome: e2e
entrada: [tema]
passos:
  - id: a
    faca: "escreva sobre {entrada.tema}"
    exige: { t: texto }
  - id: j
    juiz: "avalie {a.t}"
  - id: p
    parada: "sigo com {a.t}?"
  - id: b
    faca: continue
`;

test("run vai até a parada (saída 10); responder vai até o fim (saída 0) — mesma conversa, juiz cego", () => {
  const c = cenario([{ estruturada: { t: "texto-a" } }, { nota: 95 }, { texto: "b feito" }], PROCESSO);
  const r1 = c.cli("run", "--fundo", c.yaml, "--tema", "café", "--dir", c.projeto);
  assert.equal(r1.codigo, 10, r1.erro);
  const id = idDo(r1.saida);
  assert.ok(id?.startsWith("e2e-"));
  assert.match(r1.saida, /▶ \[1\/4\] a/);
  assert.match(r1.saida, /✓ \[2\/4\] j — nota 95 \(mínimo 90\)/);
  assert.match(r1.saida, /⏸ PARADA \[3\/4\] p — sigo com texto-a\?/);
  assert.match(r1.saida, new RegExp(`runbook responder ${id}`));

  const r2 = c.cli("responder", id, "pode", "seguir");
  assert.equal(r2.codigo, 0, r2.erro);
  assert.match(r2.saida, /↳ resposta do dev em p: pode seguir/);
  assert.match(r2.saida, /■ FIM/);
  assert.equal(c.estado(id).status, "fim");

  const [trabalho1, juiz, trabalho2] = c.chamadas();
  const valor = (ch, flag) => ch.args[ch.args.indexOf(flag) + 1];
  const sessao = valor(trabalho1, "--session-id");
  assert.match(sessao, /^[0-9a-f-]{36}$/);
  assert.equal(valor(trabalho2, "--resume"), sessao); // a mesma conversa
  assert.ok(!trabalho2.args.includes("--session-id"));
  assert.match(trabalho1.args.join(" "), /--append-system-prompt/);
  assert.match(valor(trabalho1, "--settings"), /disableAllHooks/);
  assert.equal(valor(trabalho1, "--json-schema"), valor(trabalho2, "--json-schema")); // o cache sobrevive
  assert.ok(juiz.args.includes("--safe-mode") && juiz.args.includes("--no-session-persistence"));
  assert.deepEqual(juiz.args.slice(-2), ["--tools", ""]);
  assert.ok(!juiz.args.includes("--resume") && !juiz.args.includes("--session-id"));
  assert.equal(juiz.entrada, "avalie texto-a");
  assert.match(trabalho2.entrada, /O dev respondeu à parada «p»: pode seguir/);
  for (const ch of c.chamadas()) {
    assert.equal(ch.claudecode, null);
    assert.equal(ch.pwx, `runbook-${id}`);
  }
  assert.equal(fs.realpathSync(trabalho1.cwd), fs.realpathSync(c.projeto));
});

test("status e lista mostram onde o run está e como responder", () => {
  const c = cenario([{ estruturada: { t: "x" } }, { nota: 99 }], PROCESSO);
  const id = idDo(c.cli("run", "--fundo", c.yaml, "--tema", "y", "--dir", c.projeto).saida);
  const s = c.cli("status", id);
  assert.equal(s.codigo, 0);
  assert.match(s.saida, /status {3}parada/);
  assert.match(s.saida, /parada {3}sigo com x\?/);
  assert.match(c.cli("lista").saida, new RegExp(id));
});

test("uso inválido e processo inválido não começam run nenhum", () => {
  const c = cenario([], PROCESSO);
  const semEntrada = c.cli("run", "--fundo", c.yaml);
  assert.equal(semEntrada.codigo, 2);
  assert.match(semEntrada.erro, /falta --tema/);
  const sobra = c.cli("run", "--fundo", c.yaml, "--tema", "x", "--outra", "y");
  assert.equal(sobra.codigo, 2);
  fs.writeFileSync(path.join(c.dir, "ruim.yaml"), "nome: r\npassos:\n  - id: a\n    faca: '{b.c}'\n");
  const v = c.cli("validar", path.join(c.dir, "ruim.yaml"));
  assert.equal(v.codigo, 1);
  assert.match(v.erro, /"b" não é um passo anterior/);
  assert.equal(c.cli("validar", c.yaml).codigo, 0);
  assert.equal(c.cli("nada").codigo, 2);
  assert.equal(c.chamadas().length, 0);
});

test("o trabalhador cai no meio de um passo: quem acompanha avisa, e retomar refaz o passo", async () => {
  const c = cenario([{ dormir: 8000, estruturada: { t: "lento" } }, { estruturada: { t: "refeito" } }], "nome: r\npassos:\n  - id: a\n    faca: x\n    exige: { t: texto }\n");
  const bg = c.emSegundoPlano("run", "--fundo", c.yaml, "--dir", c.projeto);
  assert.ok(await ate(() => idDo(bg.saida) && c.chamadas().length === 1));
  const id = idDo(bg.saida);
  const pid = Number(fs.readFileSync(path.join(c.env.RUNBOOK_HOME, "runs", id, "pid"), "utf8"));
  process.kill(-pid, "SIGKILL"); // queda sem aviso: o trabalhador e o agente que ele chamou
  assert.equal(await bg.fim, 1);
  assert.match(bg.saida, /o run parou sem terminar — continue com: runbook retomar/);
  const r = c.cli("retomar", id);
  assert.equal(r.codigo, 0, r.erro);
  assert.match(r.saida, /↻ retomando/);
  assert.deepEqual(c.estado(id).saidas.a, { t: "refeito" });
});

test("o trabalhador não é filho de quem acompanha: matar quem acompanha não derruba o run", async () => {
  const c = cenario([{ dormir: 1500, estruturada: { t: "feito" } }], "nome: o\npassos:\n  - id: a\n    faca: x\n    exige: { t: texto }\n");
  const bg = c.emSegundoPlano("run", "--fundo", c.yaml, "--dir", c.projeto);
  assert.ok(await ate(() => idDo(bg.saida) && c.chamadas().length === 1));
  const id = idDo(bg.saida);
  const pid = Number(fs.readFileSync(path.join(c.env.RUNBOOK_HOME, "runs", id, "pid"), "utf8"));
  const pai = Number(spawnSync("ps", ["-o", "ppid=", "-p", String(pid)], { encoding: "utf8" }).stdout.trim());
  assert.notEqual(pai, process.pid);
  const seguidor = spawnSync("pgrep", ["-P", String(process.pid)], { encoding: "utf8" }).stdout.split("\n").filter(Boolean).map(Number);
  assert.ok(!seguidor.includes(pid), "o trabalhador não pode estar entre os filhos do teste");
  assert.notEqual(pai, bg.pid);
  process.kill(bg.pid, "SIGKILL"); // como o Monitor do chat ao expirar: derruba quem acompanha
  assert.ok(await ate(() => c.estado(id).status === "fim", 15_000), "o run tem de terminar sozinho");
  assert.deepEqual(c.estado(id).saidas.a, { t: "feito" });
});

test("parar encerra o trabalhador e o agente; o run fica parado", async () => {
  const c = cenario([{ dormir: 8000, estruturada: { t: "x" } }], "nome: s\npassos:\n  - id: a\n    faca: x\n    exige: { t: texto }\n");
  const bg = c.emSegundoPlano("run", "--fundo", c.yaml, "--dir", c.projeto);
  assert.ok(await ate(() => idDo(bg.saida) && c.chamadas().length === 1));
  const id = idDo(bg.saida);
  const r = c.cli("parar", id);
  assert.equal(r.codigo, 0, r.erro);
  assert.equal(await bg.fim, 1);
  assert.match(bg.saida, /■ PARADO/);
  assert.equal(c.estado(id).status, "parado");
  assert.match(c.cli("retomar", id).erro, /foi parado/);
});

test("pergunta do agente: saída 10 com as opções; responder refaz o passo na mesma sessão", () => {
  const c = cenario(
    [{ estruturada: { pergunta: "Qual conta?", opcoes: ["admin", "comum"] } }, { estruturada: { t: "feito com admin" } }],
    "nome: q\npassos:\n  - id: a\n    faca: reproduza\n    exige: { t: texto }\n",
  );
  const r1 = c.cli("run", "--fundo", c.yaml, "--dir", c.projeto);
  assert.equal(r1.codigo, 10, r1.erro);
  assert.match(r1.saida, /⏸ PERGUNTA \[1\/1\] a — Qual conta\?/);
  assert.match(r1.saida, /opções: admin · comum/);
  const id = idDo(r1.saida);
  assert.match(c.cli("status", id).saida, /pergunta Qual conta\?\nopções {3}admin · comum/);
  const r2 = c.cli("responder", id, "admin");
  assert.equal(r2.codigo, 0, r2.erro);
  assert.match(r2.saida, /■ FIM/);
  const [ch1, ch2] = c.chamadas();
  assert.equal(valorDe(ch2, "--resume"), valorDe(ch1, "--session-id"));
  assert.match(ch2.entrada, /O dev respondeu à sua pergunta \(«Qual conta\?»\): admin/);
  assert.match(valorDe(ch1, "--json-schema"), /"pergunta"/);
  assert.deepEqual(c.estado(id).saidas.a, { t: "feito com admin" });
});

// ── modo chat: o motor pede, o chat faz e entrega; o motor confere, julga e decide ──────────────

test("modo chat: cada `faca` é pedido ao chat (saída 11); o motor cobra o exige, julga e para como sempre", () => {
  const c = cenario([{ nota: 95 }], PROCESSO); // o único agente chamado é o juiz
  const r1 = c.cli("run", "--chat", c.yaml, "--tema", "café", "--dir", c.projeto);
  assert.equal(r1.codigo, 11, r1.erro);
  const id = idDo(r1.saida);
  assert.match(r1.saida, /modo chat/);
  assert.match(r1.saida, /▶ \[1\/4\] a\n✋ SUA VEZ/);
  assert.match(r1.saida, /escreva sobre café/);
  assert.match(r1.saida, /Campos da resposta: t \(texto\)/);
  assert.match(r1.saida, new RegExp(`runbook entregar ${id}`));
  assert.match(c.cli("status", id).saida, /esperando o chat/);

  // entrega ruim não mexe no run
  assert.equal(c.cli("entregar", id, "não é json").codigo, 2);
  assert.equal(c.cli("entregar", id, "[1]").codigo, 2);
  assert.match(c.cli("seguir", id).saida, /✋ SUA VEZ/); // seguir volta ao pedido corrente

  // faltou campo: nova tentativa do mesmo passo, dizendo o que faltou
  const r2 = c.cli("entregar", id, "{}");
  assert.equal(r2.codigo, 11, r2.erro);
  assert.match(r2.saida, /↳ entregue: \(nada\)/);
  assert.match(r2.saida, /↺ \[1\/4\] a — tentativa 2\/2: faltou t/);
  assert.match(r2.saida, /Sua resposta anterior não trouxe: t/);

  const r3 = c.cliStdin('{"t": "texto-a"}', "entregar", id);
  assert.equal(r3.codigo, 10, r3.erro);
  assert.match(r3.saida, /↳ entregue: t\n✓ \[1\/4\] a/);
  assert.match(r3.saida, /✓ \[2\/4\] j — nota 95/);
  assert.match(r3.saida, /⏸ PARADA \[3\/4\] p — sigo com texto-a\?/);
  assert.match(c.cli("entregar", id, '{"t":"x"}').erro, /espera uma resposta, não uma entrega/);

  const r4 = c.cli("responder", id, "pode");
  assert.equal(r4.codigo, 11, r4.erro);
  assert.match(r4.saida, /O dev respondeu à parada «p»: pode/);

  const r5 = c.cli("entregar", id, '{"resposta": "b feito"}');
  assert.equal(r5.codigo, 0, r5.erro);
  assert.match(r5.saida, /■ FIM/);
  const e = c.estado(id);
  assert.equal(e.modo, "chat");
  assert.deepEqual(e.saidas.a, { t: "texto-a" });
  assert.deepEqual(e.saidas.b, { resposta: "b feito" });
  assert.match(c.cli("entregar", id, "{}").erro, /já está fim/);

  const chamadas = c.chamadas();
  assert.equal(chamadas.length, 1);
  assert.ok(chamadas[0].args.includes("--safe-mode")); // o juiz continua cego
  assert.equal(chamadas[0].entrada, "avalie texto-a");
});

test("modo chat: para_cada pede um item por vez", () => {
  const c = cenario(
    [],
    "nome: pc\npassos:\n  - id: a\n    faca: liste\n    exige: { itens: lista }\n  - id: b\n    para_cada: a.itens\n    faca: \"traduza {item}\"\n    exige: { tr: texto }\n",
  );
  const id = idDo(c.cli("run", c.yaml, "--chat", "--dir", c.projeto).saida);
  const r1 = c.cli("entregar", id, '{"itens": ["gato", "cão"]}');
  assert.equal(r1.codigo, 11, r1.erro);
  assert.match(r1.saida, /traduza gato/);
  const r2 = c.cli("entregar", id, '{"tr": "cat"}');
  assert.match(r2.saida, /✓ \[2\/2\] b · item 1\/2/);
  assert.match(r2.saida, /traduza cão/);
  const r3 = c.cli("entregar", id, '{"tr": "dog"}');
  assert.equal(r3.codigo, 0, r3.erro);
  assert.deepEqual(c.estado(id).saidas.b, [{ tr: "cat" }, { tr: "dog" }]);
  assert.equal(c.chamadas().length, 0);
});

test("modo chat: parar encerra o trabalhador que espera a entrega", async () => {
  const c = cenario([], "nome: pp\npassos:\n  - id: a\n    faca: x\n    exige: { t: texto }\n");
  const r = c.cli("run", c.yaml, "--chat", "--dir", c.projeto);
  assert.equal(r.codigo, 11, r.erro);
  const id = idDo(r.saida);
  assert.equal(c.cli("parar", id).codigo, 0);
  assert.equal(c.estado(id).status, "parado");
  assert.match(c.cli("entregar", id, '{"t":"x"}').erro, /já está parado/);
});

test("modo chat: o trabalhador cai esperando a entrega; retomar pede o mesmo passo, e o já entregue fica", async () => {
  const c = cenario([], 'nome: rc\npassos:\n  - id: a\n    faca: x\n    exige: { t: texto }\n  - id: b\n    faca: "continue de {a.t}"\n    exige: { u: texto }\n');
  const id = idDo(c.cli("run", c.yaml, "--chat", "--dir", c.projeto).saida);
  const r1 = c.cli("entregar", id, '{"t": "salvo"}');
  assert.equal(r1.codigo, 11, r1.erro);
  assert.match(r1.saida, /continue de salvo/);
  const pid = Number(fs.readFileSync(path.join(c.env.RUNBOOK_HOME, "runs", id, "pid"), "utf8"));
  process.kill(-pid, "SIGKILL"); // queda sem aviso, no meio da espera
  assert.ok(await ate(() => c.cli("entregar", id, '{"u": "x"}').erro.includes("se caiu: runbook retomar")));
  const r2 = c.cli("retomar", id);
  assert.equal(r2.codigo, 11, r2.erro);
  assert.match(r2.saida, /↻ retomando/);
  assert.match(r2.saida, /✋ SUA VEZ[\s\S]*continue de salvo/);
  const r3 = c.cli("entregar", id, '{"u": "fim"}');
  assert.equal(r3.codigo, 0, r3.erro);
  assert.deepEqual(c.estado(id).saidas, { a: { t: "salvo" }, b: { u: "fim" } });
});

test("o modo vem de quem chama: de dentro de um Claude Code é chat; de um terminal comum, fundo; --fundo e --chat forçam", () => {
  const yaml = "nome: m\npassos:\n  - id: a\n    faca: x\n    exige: { t: texto }\n";
  const c = cenario([{ estruturada: { t: "fundo" } }, { estruturada: { t: "forçado" } }], yaml);
  const chat = c.cli("run", c.yaml, "--dir", c.projeto); // o cenário tem CLAUDECODE=1
  assert.equal(chat.codigo, 11, chat.erro);
  c.cli("parar", idDo(chat.saida));
  const fora = spawnSync(process.execPath, [BIN, "run", c.yaml, "--dir", c.projeto], {
    env: { ...c.env, CLAUDECODE: "" },
    encoding: "utf8",
    timeout: 60_000,
  });
  assert.equal(fora.status, 0, fora.stderr);
  assert.equal(c.estado(idDo(fora.stdout)).modo, "fundo");
  const forcado = c.cli("run", "--fundo", c.yaml, "--dir", c.projeto);
  assert.equal(forcado.codigo, 0, forcado.erro);
  assert.equal(c.cli("run", "--chat", "--fundo", c.yaml, "--dir", c.projeto).codigo, 2);
});
