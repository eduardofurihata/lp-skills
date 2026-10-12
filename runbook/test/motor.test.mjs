// motor.test.mjs — o laço, com um adaptador de mentira: a ordem, as voltas, as escaladas e as paradas.
import { test, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { interpretarProcesso } from "../src/processo.mjs";
import { novoRun, salvarEstado } from "../src/estado.mjs";
import { aplicarResposta, executar, relatorio } from "../src/motor.mjs";

let projeto;
before(() => {
  process.env.RUNBOOK_HOME = fs.mkdtempSync(path.join(os.tmpdir(), "runbook-home-"));
  projeto = fs.mkdtempSync(path.join(os.tmpdir(), "runbook-proj-"));
});

function adaptadorFalso(roteiro) {
  const chamadas = [];
  let i = 0;
  const proxima = () => roteiro[i++] ?? { erro: `roteiro acabou na chamada ${i - 1}` };
  return {
    chamadas,
    async trabalhar(op) {
      chamadas.push({ tipo: "trabalhar", ...op });
      const r = proxima();
      if (r.erro) return { ok: false, erro: r.erro, registro: {} };
      return { ok: true, texto: r.texto ?? "", estruturada: r.estruturada ?? null, sessaoCriada: true, custoTotal: r.custoTotal ?? null, registro: {} };
    },
    async julgar(op) {
      chamadas.push({ tipo: "julgar", ...op });
      const r = proxima();
      if (r.erro) return { ok: false, erro: r.erro, registro: {} };
      return { ok: true, veredito: { nota: r.nota, lacunas: r.lacunas ?? [] }, custo: r.custo ?? 0, registro: {} };
    },
  };
}

function preparar(yaml, entrada = {}) {
  const { processo, erros } = interpretarProcesso(yaml, "teste.yaml");
  assert.deepEqual(erros, []);
  const estado = novoRun(processo, entrada, projeto);
  const eventos = [];
  return { processo, estado, eventos, emitir: (tipo, dados, linha) => eventos.push({ tipo, ...dados, linha }) };
}

const rodar = (p, adaptador) =>
  executar({ ...p, adaptador, salvar: salvarEstado, ambiente: process.env, dirArquivos: path.join(projeto, "arq") });

const prompts = (a) => a.chamadas.filter((c) => c.tipo === "trabalhar").map((c) => c.prompt);

test("executa na ordem, na mesma conversa, e só avança com o que o passo exige", async () => {
  const p = preparar(`nome: t
passos:
  - id: a
    faca: primeiro
    exige: { x: texto }
  - id: b
    faca: "segundo, depois de {a.x}"
    exige: { y: numero }
`);
  const a = adaptadorFalso([{ estruturada: { x: "um" } }, { estruturada: { y: 2 } }]);
  assert.equal(await rodar(p, a), "fim");
  assert.deepEqual(p.estado.saidas, { a: { x: "um" }, b: { y: 2 } });
  const [c1, c2] = a.chamadas;
  assert.equal(c1.iniciar, true);
  assert.equal(c2.iniciar, false);
  assert.equal(c1.sessao, c2.sessao);
  assert.match(c2.prompt, /Passo 2\/2 — b:\nsegundo, depois de um/);
  // o mesmo schema em todo passo (o cache da conversa sobrevive); quem cobra os campos é o motor
  assert.deepEqual(c1.esquema, c2.esquema);
  assert.deepEqual(Object.keys(c1.esquema.properties), ["x", "y", "pergunta", "opcoes"]);
  assert.equal(c1.esquema.required, undefined);
  assert.match(c1.prompt, /Campos da resposta: x \(texto\) — ou `pergunta`, se o passo depender do dev\./);
  assert.ok(p.eventos.some((e) => e.tipo === "fim" && e.linha.startsWith("■ FIM")));
});

test("resposta sem um campo: tenta de novo dizendo o que faltou", async () => {
  const p = preparar("nome: t\npassos:\n  - id: a\n    faca: x\n    exige: { x: texto }\n");
  const a = adaptadorFalso([{ estruturada: {} }, { estruturada: { x: "ok" } }]);
  assert.equal(await rodar(p, a), "fim");
  assert.match(prompts(a)[1], /não trouxe: x/);
  assert.ok(p.eventos.some((e) => e.tipo === "tentativa" && e.linha.includes("faltou x")));
});

test("esgotou as tentativas: não segue — para e chama o dev", async () => {
  const p = preparar("nome: t\npassos:\n  - id: a\n    faca: x\n    exige: { x: texto }\n  - id: b\n    faca: y\n");
  const a = adaptadorFalso([{ estruturada: {} }, { estruturada: { y: 1 } }]);
  assert.equal(await rodar(p, a), "parada");
  assert.equal(p.estado.parada.tipo, "escalada");
  assert.equal(p.estado.cursor, 0);
  assert.equal(a.chamadas.length, 2); // o passo b não foi chamado
  const ev = p.eventos.find((e) => e.tipo === "escalada");
  assert.match(ev.linha, /runbook responder .* runbook pular|runbook pular/s);
});

test("juiz abaixo da nota: volta ao faca com as lacunas e julga de novo", async () => {
  const p = preparar("nome: t\npassos:\n  - id: a\n    faca: escreva\n    exige: { t: texto }\n  - id: j\n    juiz: 'avalie {a.t}'\n");
  const a = adaptadorFalso([
    { estruturada: { t: "v1" } },
    { nota: 70, lacunas: ["falta o exemplo"] },
    { estruturada: { t: "v2" } },
    { nota: 95 },
  ]);
  assert.equal(await rodar(p, a), "fim");
  assert.match(prompts(a)[1], /nota 70 \(o mínimo é 90\)[\s\S]*falta o exemplo/);
  const juizes = a.chamadas.filter((c) => c.tipo === "julgar");
  assert.equal(juizes[1].entrada, "avalie v2");
  assert.equal(p.estado.saidas.j.nota, 95);
  assert.ok(p.eventos.some((e) => e.tipo === "volta" && e.linha.includes("volta para a")));
});

test("juiz com ferramentas: recebe os nomes renderizados, e a lista de um passo anterior se espalha", async () => {
  const p = preparar("nome: t\npassos:\n  - id: a\n    faca: leia\n    exige: { f: lista, k: texto }\n  - id: j\n    juiz: 'confira {a.k}'\n    ferramentas: ['{a.f}', 'mcp__x__{a.k}']\n  - id: s\n    faca: siga\n");
  const a = adaptadorFalso([{ estruturada: { f: ["mcp__j__get", " ", "mcp__j__comments"], k: "get" } }, { nota: 95 }, { estruturada: { resposta: "ok" } }]);
  assert.equal(await rodar(p, a), "fim");
  const [juiz] = a.chamadas.filter((c) => c.tipo === "julgar");
  assert.deepEqual(juiz.ferramentas, ["mcp__j__get", "mcp__j__comments", "mcp__x__get"]);
});

test("juiz sem ferramentas: segue cego", async () => {
  const p = preparar("nome: t\npassos:\n  - id: a\n    faca: x\n  - id: j\n    juiz: avalie\n");
  const a = adaptadorFalso([{ estruturada: { resposta: "r" } }, { nota: 95 }]);
  assert.equal(await rodar(p, a), "fim");
  assert.deepEqual(a.chamadas.find((c) => c.tipo === "julgar").ferramentas, []);
});

test("juiz que não chega à nota em max rodadas: escala, com as lacunas", async () => {
  const p = preparar("nome: t\npassos:\n  - id: a\n    faca: x\n    exige: { t: texto }\n  - id: j\n    juiz: 'avalie {a.t}'\n    max: 2\n");
  const a = adaptadorFalso([{ estruturada: { t: "1" } }, { nota: 50, lacunas: ["l1"] }, { estruturada: { t: "2" } }, { nota: 60, lacunas: ["l2"] }]);
  assert.equal(await rodar(p, a), "parada");
  assert.equal(p.estado.parada.passo, "j");
  assert.equal(p.estado.parada.nota, 60);
  assert.match(p.estado.parada.mensagem, /l2/);
});

test("comando: o código esperado avança; outro código volta ao faca com a saída", async () => {
  const p = preparar(`nome: t
passos:
  - id: a
    faca: produza
    exige: { v: texto }
  - id: c
    comando: "test {a.v} = ok"
    volta_para: a
`);
  const a = adaptadorFalso([{ estruturada: { v: "nao" } }, { estruturada: { v: "ok" } }]);
  assert.equal(await rodar(p, a), "fim");
  assert.match(prompts(a)[1], /O comando `test 'nao' = ok` saiu com 1/);
  assert.equal(p.estado.saidas.c.codigo, 0);
});

test("comando: a saída de um agente entra citada — nunca vira comando", async () => {
  const alvo = path.join(projeto, "invadido");
  const p = preparar("nome: t\npassos:\n  - id: a\n    faca: x\n    exige: { v: texto }\n  - id: c\n    comando: 'echo {a.v}'\n");
  const a = adaptadorFalso([{ estruturada: { v: `x; touch ${alvo}` } }]);
  assert.equal(await rodar(p, a), "fim");
  assert.equal(fs.existsSync(alvo), false);
  assert.match(p.estado.saidas.c.saida, /x; touch/);
});

test("comando que falha sem volta_para: escala", async () => {
  const p = preparar("nome: t\npassos:\n  - id: c\n    comando: 'exit 3'\n");
  assert.equal(await rodar(p, adaptadorFalso([])), "parada");
  assert.match(p.estado.parada.mensagem, /saiu com 3 \(esperado 0\)/);
});

test("parada: para, e a resposta do dev chega ao próximo faca", async () => {
  const p = preparar("nome: t\npassos:\n  - id: a\n    faca: x\n  - id: p\n    parada: 'sigo com {a.resposta}?'\n  - id: b\n    faca: y\n");
  const a = adaptadorFalso([{ texto: "feito" }, { texto: "segui" }]);
  assert.equal(await rodar(p, a), "parada");
  assert.equal(p.estado.parada.mensagem, "sigo com feito?");
  aplicarResposta(p.estado, p.processo, "pode seguir");
  assert.equal(await rodar(p, a), "fim");
  assert.match(prompts(a)[1], /O dev respondeu à parada «p»: pode seguir/);
  assert.equal(p.estado.saidas.p.resposta, "pode seguir");
  assert.equal(p.estado.pendente, null);
});

test("juiz depois de uma parada: reprova, refaz o faca, a parada pergunta de novo e, aprovado, segue", async () => {
  const p = preparar("nome: t\npassos:\n  - id: a\n    faca: capture\n    exige: { t: lista }\n  - id: p\n    parada: 'aprova {a.t}?'\n  - id: j\n    juiz: 'o dev aprovou? {p.resposta}'\n    volta_para: a\n  - id: b\n    faca: publique\n");
  const a = adaptadorFalso([
    { estruturada: { t: ["1.png", "2.png"] } },
    { nota: 20, lacunas: ["imagem 2 reprovada: não mostra o erro"] },
    { estruturada: { t: ["1.png", "2b.png"] } },
    { nota: 100 },
    { estruturada: { resposta: "publicado" } },
  ]);
  assert.equal(await rodar(p, a), "parada");
  aplicarResposta(p.estado, p.processo, "1 ok, 2 reprovada: não mostra o erro");
  assert.equal(await rodar(p, a), "parada");
  assert.match(prompts(a)[1], /imagem 2 reprovada/);
  assert.equal(p.estado.parada.passo, "p");
  assert.match(p.estado.parada.mensagem, /2b\.png/);
  aplicarResposta(p.estado, p.processo, "tudo ok");
  assert.equal(await rodar(p, a), "fim");
  const juizes = a.chamadas.filter((c) => c.tipo === "julgar").map((c) => c.entrada);
  assert.deepEqual(juizes, ["o dev aprovou? 1 ok, 2 reprovada: não mostra o erro", "o dev aprovou? tudo ok"]);
  assert.equal(p.estado.saidas.b.resposta, "publicado");
});

test("para_cada: um pedido por item, com {item}, e a saída é a lista", async () => {
  const p = preparar("nome: t\npassos:\n  - id: a\n    faca: liste\n    exige: { l: lista }\n  - id: b\n    faca: 'traduza {item}'\n    para_cada: a.l\n    exige: { t: texto }\n");
  const a = adaptadorFalso([{ estruturada: { l: ["um", "dois"] } }, { estruturada: { t: "one" } }, { estruturada: { t: "two" } }]);
  assert.equal(await rodar(p, a), "fim");
  assert.deepEqual(p.estado.saidas.b, [{ t: "one" }, { t: "two" }]);
  assert.match(prompts(a)[1], /traduza um/);
  assert.match(prompts(a)[2], /traduza dois/);
});

test("para_cada com lista vazia não passa em silêncio", async () => {
  const p = preparar("nome: t\npassos:\n  - id: a\n    faca: liste\n    exige: { l: lista }\n  - id: b\n    faca: '{item}'\n    para_cada: a.l\n");
  assert.equal(await rodar(p, adaptadorFalso([{ estruturada: { l: [] } }])), "parada");
  assert.match(p.estado.parada.mensagem, /veio vazia/);
});

test("escalada respondida: refaz o passo com a orientação do dev", async () => {
  const p = preparar("nome: t\npassos:\n  - id: a\n    faca: x\n    exige: { x: texto }\n    tentativas: 1\n");
  const a = adaptadorFalso([{ estruturada: {} }, { estruturada: { x: "agora sim" } }]);
  assert.equal(await rodar(p, a), "parada");
  aplicarResposta(p.estado, p.processo, "use o campo x");
  assert.equal(await rodar(p, a), "fim");
  assert.match(prompts(a)[1], /O dev orientou sobre «a»: use o campo x/);
});

test("pular só por ordem do dev, e fica no relatório", async () => {
  const p = preparar("nome: t\npassos:\n  - id: a\n    faca: x\n    exige: { x: texto }\n    tentativas: 1\n  - id: b\n    faca: y\n");
  const a = adaptadorFalso([{ estruturada: {} }, { texto: "b feito" }]);
  assert.equal(await rodar(p, a), "parada");
  aplicarResposta(p.estado, p.processo, "não se aplica aqui", { pular: true });
  assert.equal(await rodar(p, a), "fim");
  assert.match(relatorio(p.estado, p.processo), /⤼ a \(pulado pelo dev: não se aplica aqui\)/);
});

test("custo: o passo custa a diferença do total acumulado da sessão", async () => {
  const p = preparar("nome: t\npassos:\n  - id: a\n    faca: x\n  - id: b\n    faca: y\n");
  const a = adaptadorFalso([{ texto: "1", custoTotal: 0.1 }, { texto: "2", custoTotal: 0.25 }]);
  assert.equal(await rodar(p, a), "fim");
  assert.ok(Math.abs(p.estado.custo.porPasso.a - 0.1) < 1e-9);
  assert.ok(Math.abs(p.estado.custo.porPasso.b - 0.15) < 1e-9);
  assert.ok(Math.abs(p.estado.custo.total - 0.25) < 1e-9);
});

test("o primeiro pedido leva o preâmbulo; a permissão vem do passo ou da sessão", async () => {
  const p = preparar("nome: t\nsessao: { permissao: leitura }\npassos:\n  - id: a\n    faca: x\n  - id: b\n    faca: y\n    permissao: livre\n");
  const a = adaptadorFalso([{ texto: "1" }, { texto: "2" }]);
  assert.equal(await rodar(p, a), "fim");
  assert.match(a.chamadas[0].preambulo, /um passo por vez/);
  assert.equal(a.chamadas[0].permissao, "leitura");
  assert.equal(a.chamadas[1].permissao, "livre");
});

test("pergunta: o motor para, a resposta volta à mesma conversa e o passo é refeito", async () => {
  const p = preparar("nome: t\npassos:\n  - id: a\n    faca: escreva para alguém\n    exige: { s: texto }\n  - id: b\n    faca: y\n");
  const a = adaptadorFalso([
    { estruturada: { pergunta: "Para quem?", opcoes: ["Ana", "Bia"] } },
    { estruturada: { s: "Olá, Ana" } },
    { texto: "b feito" },
  ]);
  assert.equal(await rodar(p, a), "parada");
  assert.equal(p.estado.parada.tipo, "pergunta");
  assert.deepEqual(p.estado.parada.opcoes, ["Ana", "Bia"]);
  const ev = p.eventos.find((e) => e.tipo === "pergunta");
  assert.match(ev.linha, /⏸ PERGUNTA \[1\/2\] a — Para quem\?\n  opções: Ana · Bia\n  responda: runbook responder/);
  aplicarResposta(p.estado, p.processo, "Ana");
  assert.equal(p.estado.cursor, 0); // o mesmo passo
  assert.equal(await rodar(p, a), "fim");
  assert.match(prompts(a)[1], /O dev respondeu à sua pergunta \(«Para quem\?»\): Ana/);
  assert.equal(a.chamadas[1].sessao, a.chamadas[0].sessao);
  assert.equal(a.chamadas[1].iniciar, false);
  assert.deepEqual(p.estado.saidas.a, { s: "Olá, Ana" });
  assert.equal(p.estado.perguntas.a, undefined); // o contador zera quando o passo termina
});

test("pergunta num faca sem exige também para", async () => {
  const p = preparar("nome: t\npassos:\n  - id: a\n    faca: x\n");
  const a = adaptadorFalso([{ estruturada: { pergunta: "Qual?" }, texto: '{"pergunta":"Qual?"}' }, { texto: "pronto" }]);
  assert.equal(await rodar(p, a), "parada");
  assert.equal(p.estado.parada.tipo, "pergunta");
  aplicarResposta(p.estado, p.processo, "esse");
  assert.equal(await rodar(p, a), "fim");
  assert.deepEqual(p.estado.saidas.a, { resposta: "pronto" });
});

test("a 4ª pergunta no mesmo passo vira escalada", async () => {
  const p = preparar("nome: t\npassos:\n  - id: a\n    faca: x\n    exige: { s: texto }\n");
  const pergunta = { estruturada: { pergunta: "?" } };
  const a = adaptadorFalso([pergunta, pergunta, pergunta, pergunta]);
  for (let k = 0; k < 3; k++) {
    assert.equal(await rodar(p, a), "parada");
    assert.equal(p.estado.parada.tipo, "pergunta");
    aplicarResposta(p.estado, p.processo, `resposta ${k}`);
  }
  assert.equal(await rodar(p, a), "parada");
  assert.equal(p.estado.parada.tipo, "escalada");
  assert.match(p.estado.parada.mensagem, /perguntou 3 vezes/);
});

test("pergunta no meio de um para_cada retoma no mesmo item, sem refazer os anteriores", async () => {
  const p = preparar("nome: t\npassos:\n  - id: a\n    faca: liste\n    exige: { l: lista }\n  - id: b\n    faca: 'traduza {item}'\n    para_cada: a.l\n    exige: { t: texto }\n");
  const a = adaptadorFalso([
    { estruturada: { l: ["um", "dois", "tres"] } },
    { estruturada: { t: "one" } },
    { estruturada: { pergunta: "dois em qual registro?" } },
    { estruturada: { t: "two" } },
    { estruturada: { t: "three" } },
  ]);
  assert.equal(await rodar(p, a), "parada");
  assert.deepEqual(p.estado.parciais.b, [{ t: "one" }]);
  aplicarResposta(p.estado, p.processo, "formal");
  assert.equal(await rodar(p, a), "fim");
  assert.deepEqual(p.estado.saidas.b, [{ t: "one" }, { t: "two" }, { t: "three" }]);
  assert.match(prompts(a)[3], /O dev respondeu à sua pergunta[\s\S]*traduza dois/);
  assert.equal(a.chamadas.length, 5);
});

test("pular uma pergunta: o passo fica de fora, no relatório", async () => {
  const p = preparar("nome: t\npassos:\n  - id: a\n    faca: x\n    exige: { s: texto }\n  - id: b\n    faca: y\n");
  const a = adaptadorFalso([{ estruturada: { pergunta: "?" } }, { texto: "b feito" }]);
  assert.equal(await rodar(p, a), "parada");
  aplicarResposta(p.estado, p.processo, "não precisa", { pular: true });
  assert.equal(await rodar(p, a), "fim");
  assert.match(relatorio(p.estado, p.processo), /⤼ a \(pulado pelo dev: não precisa\)/);
});

test("se: o passo só roda se o valor existe; senão fica no relatório como não se aplica", async () => {
  const p = preparar(`nome: t
passos:
  - id: a
    faca: x
    exige: { tem: booleano, nome: texto }
  - id: b
    se: a.tem
    faca: "use {a.nome}"
    exige: { r: texto }
  - id: c
    se: a.nome
    faca: "sempre: {a.nome}"
  - id: d
    se: b.r
    parada: "não chega aqui"
`);
  const a = adaptadorFalso([{ estruturada: { tem: false, nome: "Ana" } }, { texto: "c feito" }]);
  assert.equal(await rodar(p, a), "fim");
  assert.equal(a.chamadas.length, 2); // b não rodou; c rodou
  assert.deepEqual(p.estado.saidas.b, { nao_se_aplica: true });
  assert.ok(p.eventos.some((e) => e.tipo === "nao_se_aplica" && e.linha === "⤼ [2/4] b — não se aplica (a.tem vazio)"));
  assert.ok(p.eventos.some((e) => e.tipo === "nao_se_aplica" && e.passo === "d")); // b.r não existe: d também não se aplica
  assert.match(relatorio(p.estado, p.processo), /⤼ b \(não se aplica\) · ✓ c · ⤼ d \(não se aplica\)/);
});

test("resultado: o processo diz o que mostrar no fim; passo que não se aplicou sai vazio", async () => {
  const p = preparar(`nome: t
entrada: [quem]
resultado: |
  Descrição: {a.d}
  Link: {b.url}
passos:
  - id: a
    faca: "para {entrada.quem}"
    exige: { d: texto, tem: booleano }
  - id: b
    se: a.tem
    faca: publique
    exige: { url: texto }
`, { quem: "dev" });
  const a = adaptadorFalso([{ estruturada: { d: "o bug X", tem: false } }]);
  assert.equal(await rodar(p, a), "fim");
  const fim = p.eventos.find((e) => e.tipo === "fim").linha;
  assert.match(fim, /^■ FIM .*\n {2}✓ a · ⤼ b \(não se aplica\)\n\nDescrição: o bug X\nLink:$/);
});
