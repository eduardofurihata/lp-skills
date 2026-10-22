// processo.test.mjs — o processo é validado antes de rodar: o que estaria errado no passo 7 cai aqui.
import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { esquemaDoRun, faltasNaSaida, interpretarProcesso, lerProcesso } from "../src/processo.mjs";
import { citarShell, referencias, renderizar } from "../src/modelo.mjs";

const OLA = fileURLToPath(new URL("../exemplos/ola.yaml", import.meta.url));

const erros = (yaml) => interpretarProcesso(yaml).erros;
const umErro = (yaml, trecho) => {
  const e = erros(yaml);
  assert.ok(e.some((x) => x.includes(trecho)), `esperava um erro com "${trecho}", veio: ${JSON.stringify(e)}`);
};

test("o exemplo ola é válido e o juiz volta, por padrão, ao faca anterior", () => {
  const { processo, erros: e } = lerProcesso(OLA);
  assert.deepEqual(e, []);
  assert.equal(processo.nome, "ola");
  assert.equal(processo.passos.find((p) => p.id === "julgar").volta_para, "escrever");
  assert.match(processo.hash, /^[0-9a-f]{12}$/);
});

test("ids: obrigatórios, únicos e fora dos nomes reservados", () => {
  umErro("nome: x\npassos:\n  - faca: a\n", "`id` é obrigatório");
  umErro("nome: x\npassos:\n  - id: a\n    faca: a\n  - id: a\n    faca: b\n", "id repetido");
  umErro("nome: x\npassos:\n  - id: item\n    faca: a\n", "nome reservado");
});

test("cada passo tem exatamente um tipo e só os campos dele", () => {
  umErro("nome: x\npassos:\n  - id: a\n    faca: a\n    juiz: b\n", "exatamente um de");
  umErro("nome: x\npassos:\n  - id: a\n", "exatamente um de");
  umErro("nome: x\npassos:\n  - id: a\n    parada: ok\n    exige: { b: texto }\n", "campo desconhecido `exige`");
  umErro("nome: x\nfoo: 1\npassos:\n  - id: a\n    faca: a\n", "campo desconhecido `foo`");
});

test("exige só aceita os tipos conhecidos", () => {
  umErro("nome: x\npassos:\n  - id: a\n    faca: a\n    exige: { b: data }\n", 'tipo "data"');
});

test("referências só a entradas declaradas e a passos anteriores", () => {
  umErro("nome: x\npassos:\n  - id: a\n    faca: '{entrada.tema}'\n", '"tema" não está em `entrada`');
  umErro("nome: x\npassos:\n  - id: a\n    faca: '{b.c}'\n  - id: b\n    faca: x\n", '"b" não é um passo anterior');
  umErro("nome: x\npassos:\n  - id: a\n    faca: x\n    exige: { c: texto }\n  - id: b\n    faca: '{a.d}'\n", 'não produz "d"');
  umErro("nome: x\npassos:\n  - id: a\n    faca: '{item}'\n", "só existe em passo com para_cada");
  assert.deepEqual(erros("nome: x\npassos:\n  - id: a\n    faca: 'mostre {{nome}} literal'\n"), []);
});

test("juiz, comando e parada voltam só para um faca anterior", () => {
  umErro("nome: x\npassos:\n  - id: j\n    juiz: avalie\n", "precisa de um passo `faca` antes");
  umErro("nome: x\npassos:\n  - id: a\n    faca: x\n  - id: j\n    juiz: y\n  - id: k\n    juiz: z\n    volta_para: j\n", "volta_para tem de ser um passo `faca` anterior");
  umErro("nome: x\npassos:\n  - id: a\n    faca: x\n  - id: j\n    juiz: y\n    ate: 120\n", "`ate` é a nota mínima");
  umErro("nome: x\npassos:\n  - id: p\n    parada: ok?\n    segue: ok\n    volta_para: b\n  - id: b\n    faca: x\n", "volta_para tem de ser um passo `faca` anterior");
  umErro("nome: x\npassos:\n  - id: a\n    faca: x\n  - id: p\n    parada: ok?\n    segue: ok\n", "andam juntos");
  assert.deepEqual(erros("nome: x\npassos:\n  - id: a\n    faca: x\n  - id: p\n    parada: ok?\n    segue: ok\n    volta_para: a\n"), []);
});

test("sessao.esforco só aceita os níveis do claude", () => {
  umErro("nome: x\nsessao: { esforco: altissimo }\npassos:\n  - id: a\n    faca: x\n", "sessao.esforco");
  assert.deepEqual(erros("nome: x\nsessao: { esforco: medium }\npassos:\n  - id: a\n    faca: x\n"), []);
});

test("juiz aceita ferramentas, e as variáveis delas só apontam para passos anteriores", () => {
  assert.deepEqual(erros("nome: x\npassos:\n  - id: a\n    faca: x\n    exige: { f: lista }\n  - id: j\n    juiz: y\n    ferramentas: ['{a.f}', 'Read']\n"), []);
  umErro("nome: x\npassos:\n  - id: a\n    faca: x\n  - id: j\n    juiz: y\n    ferramentas: Read\n", "`ferramentas` é uma lista de nomes");
  umErro("nome: x\npassos:\n  - id: a\n    faca: x\n    exige: { f: lista }\n  - id: j\n    juiz: y\n    ferramentas: ['{a.g}']\n", 'não produz "g"');
  umErro("nome: x\npassos:\n  - id: a\n    faca: x\n    ferramentas: ['{b.f}']\n  - id: b\n    faca: y\n", '"b" não é um passo anterior');
});

test("para_cada aponta para uma lista de um passo anterior", () => {
  umErro("nome: x\npassos:\n  - id: a\n    faca: x\n    exige: { l: texto }\n  - id: b\n    faca: '{item}'\n    para_cada: a.l\n", "não é `lista`");
  umErro("nome: x\npassos:\n  - id: b\n    faca: '{item}'\n    para_cada: a.l\n", 'aponta para "a"');
});

test("limite é uma duração legível", () => {
  umErro("nome: x\npassos:\n  - id: a\n    faca: x\n    limite: logo\n", "`limite` é uma duração");
  assert.deepEqual(erros("nome: x\npassos:\n  - id: a\n    faca: x\n    limite: 90s\n"), []);
});

test("sessao: só o cli e as permissões conhecidas", () => {
  umErro("nome: x\nsessao: { cli: outro }\npassos:\n  - id: a\n    faca: x\n", "ainda não tem adaptador");
  umErro("nome: x\nsessao: { permissao: tudo }\npassos:\n  - id: a\n    faca: x\n", "sessao.permissao");
});

test("um schema só por run: a união dos campos, nenhum obrigatório, tipo omitido no conflito", () => {
  const { processo } = interpretarProcesso(`nome: t
passos:
  - id: a
    faca: x
    exige: { frases: lista, titulo: texto }
  - id: b
    faca: y
    exige: { titulo: texto, n: numero }
  - id: c
    faca: z
    exige: { n: texto }
  - id: d
    faca: livre
`);
  assert.deepEqual(processo.esquema, {
    type: "object",
    properties: {
      frases: { type: "array" },
      titulo: { type: "string" },
      n: {},
      resposta: { type: "string" },
      pergunta: { type: "string" },
      opcoes: { type: "array", items: { type: "string" } },
    },
  });
});

test("pergunta e opcoes são reservados: nenhum exige pode usá-los", () => {
  umErro("nome: x\npassos:\n  - id: a\n    faca: x\n    exige: { pergunta: texto }\n", "campo reservado");
  umErro("nome: x\npassos:\n  - id: a\n    faca: x\n    exige: { opcoes: lista }\n", "campo reservado");
});

test("a conferência do motor aponta o que faltou, campo a campo", () => {
  const exige = { frases: "lista", titulo: "texto", nota: "numero", ok: "booleano", extra: "objeto" };
  assert.deepEqual(faltasNaSaida({ frases: [], titulo: "t", nota: 1, ok: false, extra: {} }, exige), []);
  assert.deepEqual(faltasNaSaida({ frases: "x", titulo: " ", nota: "1", ok: 1 }, exige), [
    "frases (esperado lista)",
    "titulo (esperado texto)",
    "nota (esperado numero)",
    "ok (esperado booleano)",
    "extra",
  ]);
  assert.deepEqual(faltasNaSaida(null, { a: "texto" }), ["a"]);
});

test("variáveis: valores no texto, chaves duplas literais, e citadas no shell", () => {
  const ctx = { entrada: { tema: "café" }, passos: { a: { l: ["x", "y"], t: "it's" } }, run: { dir: "/r" } };
  assert.equal(renderizar("{entrada.tema} em {run.dir}", ctx), "café em /r");
  assert.equal(renderizar("{a.l}", ctx), '[\n  "x",\n  "y"\n]');
  assert.equal(renderizar("{{literal}} {a.t}", ctx), "{literal} it's");
  assert.equal(renderizar("echo {a.t}", ctx, { shell: true }), `echo ${citarShell("it's")}`);
  assert.deepEqual(referencias("{a.b} {{c}} {entrada.x}"), ["a.b", "entrada.x"]);
});

test("se: só referência a entrada ou a passo anterior, e campo que ele produz", () => {
  umErro("nome: x\npassos:\n  - id: a\n    se: b.c\n    faca: x\n  - id: b\n    faca: y\n", 'se: b.c — "b" não é um passo anterior');
  umErro("nome: x\npassos:\n  - id: a\n    faca: x\n    exige: { c: texto }\n  - id: b\n    se: a.z\n    faca: y\n", 'o passo a não produz "z"');
  umErro("nome: x\npassos:\n  - id: a\n    se: '{a.b}'\n    faca: x\n", "`se` é");
  assert.deepEqual(erros("nome: x\nentrada: [k]\npassos:\n  - id: a\n    se: entrada.k\n    faca: x\n  - id: b\n    se: a.resposta\n    parada: ok\n"), []);
});

test("resultado: referências a qualquer passo do processo, conferidas antes de rodar", () => {
  umErro("nome: x\nresultado: '{nada.x}'\npassos:\n  - id: a\n    faca: x\n", 'resultado: {nada.x} — "nada" não é um passo anterior');
  umErro("nome: x\nresultado: '{item}'\npassos:\n  - id: a\n    faca: x\n", "{item} só existe");
  assert.deepEqual(erros("nome: x\nresultado: '{a.resposta} em {run.dir}'\npassos:\n  - id: a\n    faca: x\n"), []);
});

const BLOCO = `nome: x
passos:
  - id: lista
    faca: liste
    exige: { itens: lista }
  - id: card
    para_cada: lista.itens
    passos:
      - id: a
        faca: "olhe {item}"
        exige: { pr: texto }
      - id: b
        faca: "use {a.pr} e {lista.itens}"
        exige: { pendencias: lista }
  - id: fim
    faca: "junte {card}"
    exige: { texto: texto }
`;

test("bloco: passos de dentro veem {item}, os de fora e os de dentro anteriores, com campo", () => {
  const { processo, erros: e } = interpretarProcesso(BLOCO);
  assert.deepEqual(e, []);
  const card = processo.passos.find((p) => p.id === "card");
  assert.equal(card.tipo, "bloco");
  assert.deepEqual(card.passos.map((s) => s.id), ["a", "b"]);
  // o schema do run tem os campos de dentro do bloco
  assert.deepEqual(Object.keys(processo.esquema.properties), ["itens", "pr", "pendencias", "texto", "pergunta", "opcoes"]);
});

test("bloco: só faca dentro, sem se nem para_cada, com para_cada no bloco e ids únicos", () => {
  umErro(BLOCO.replace("    para_cada: lista.itens\n", ""), "o bloco precisa de `para_cada`");
  umErro(BLOCO.replace("      - id: b\n        faca:", "      - id: b\n        juiz:").replace("        exige: { pendencias: lista }\n", ""), "dentro de um bloco, só passo `faca`");
  umErro(BLOCO.replace("        exige: { pr: texto }\n", "        exige: { pr: texto }\n        se: lista.itens\n"), "não leva `se` nem `para_cada`");
  umErro(BLOCO.replace("      - id: b\n", "      - id: lista\n"), "id repetido");
  umErro(BLOCO.replace("junte {card}", "junte {a.pr}"), '"a" não é um passo anterior');
  umErro(BLOCO.replace("olhe {item}", "olhe {b.pendencias}"), '"b" não é um passo anterior');
  umErro(BLOCO.replace("junte {card}", "junte {card.a}"), "repete por item e produz uma lista");
});
