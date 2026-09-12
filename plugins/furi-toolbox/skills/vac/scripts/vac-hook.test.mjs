// vac-hook.test.mjs — o hook, exercitado como o Claude Code o chama:
// processo filho, JSON em stdin, exit code + stdout/stderr como resposta.
//   node --test plugins/furi-toolbox/skills/vac/scripts/
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const HOOK = path.join(path.dirname(fileURLToPath(import.meta.url)), "vac-hook.mjs");
let root; // projeto-alvo falso
let data; // <data> do plugin

function run(sub, input, extraArgs = []) {
  const r = spawnSync(process.execPath, [HOOK, sub, "--data", data, ...extraArgs], {
    input: JSON.stringify({ cwd: root, prompt_id: crypto.randomUUID(), ...input }), // cada chamada = um prompt novo (o contador de retries é por prompt)
    encoding: "utf8",
    env: { ...process.env, CLAUDE_PROJECT_DIR: root, VAC_STRICT: "1" },
  });
  return { code: r.status, out: r.stdout, err: r.stderr };
}

before(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "vac-root-"));
  data = fs.mkdtempSync(path.join(os.tmpdir(), "vac-data-"));
  fs.mkdirSync(path.join(root, "lib"));
  fs.writeFileSync(path.join(root, "lib", "skills.ts"), Array.from({ length: 120 }, (_, i) => `line ${i + 1}`).join("\n"));
  fs.mkdirSync(path.join(root, "kanban", "08-code-review"), { recursive: true });
  fs.mkdirSync(path.join(root, "kanban", "09-run-test"), { recursive: true });
  fs.mkdirSync(path.join(root, ".playwright-mcp"), { recursive: true });
  fs.writeFileSync(path.join(root, ".playwright-mcp", "tc1.png"), "png");
});

after(() => {
  fs.rmSync(root, { recursive: true, force: true });
  fs.rmSync(data, { recursive: true, force: true });
});

// --- card ------------------------------------------------------------------

test("card: injeta o cartão como additionalContext do evento recebido", () => {
  const r = run("card", { hook_event_name: "UserPromptSubmit" });
  assert.equal(r.code, 0);
  const json = JSON.parse(r.out);
  assert.equal(json.hookSpecificOutput.hookEventName, "UserPromptSubmit");
  assert.match(json.hookSpecificOutput.additionalContext, /\[\/vac · regime ativo\]/);
  assert.ok(!json.hookSpecificOutput.additionalContext.includes("<!--"), "comentários HTML não vazam");
  assert.ok(json.hookSpecificOutput.additionalContext.length <= 950, `cartão ≤ 950 caracteres (tem ${json.hookSpecificOutput.additionalContext.length})`);
});

test("card --subagent: acrescenta a instrução de não herdar", () => {
  const r = run("card", { hook_event_name: "SubagentStart" }, ["--subagent"]);
  const ctx = JSON.parse(r.out).hookSpecificOutput.additionalContext;
  assert.match(ctx, /subagente/);
});

test("card --after-compact: avisa que o contexto é resumo", () => {
  const r = run("card", { hook_event_name: "SessionStart" }, ["--after-compact"]);
  const ctx = JSON.parse(r.out).hookSpecificOutput.additionalContext;
  assert.match(ctx, /compactado/);
});

// --- check-stop ------------------------------------------------------------

test("check-stop: coordenada válida → silêncio", () => {
  const r = run("check-stop", { last_assistant_message: "O leitor está em lib/skills.ts:67." });
  assert.equal(r.code, 0);
  assert.equal(r.err, "");
});

test("check-stop: linha além do arquivo → bloqueia com o tamanho real", () => {
  const r = run("check-stop", { last_assistant_message: "Veja lib/skills.ts:9999." });
  assert.equal(r.code, 2);
  assert.match(r.err, /lib\/skills\.ts:9999 — arquivo tem 120 linhas/);
});

test("check-stop: arquivo inexistente → bloqueia", () => {
  const r = run("check-stop", { last_assistant_message: "Definido em lib/graph.ts:12" });
  assert.equal(r.code, 2);
  assert.match(r.err, /lib\/graph\.ts:12 — arquivo não existe/);
});

test("check-stop: 2 bloqueios por prompt, depois fallback (pendência + systemMessage) que o card reinjeta", () => {
  const prompt_id = "p-fallback";
  const session_id = "s-fallback";
  const msg = { last_assistant_message: "Definido em lib/graph.ts:12", prompt_id, session_id };
  const first = run("check-stop", msg);
  assert.equal(first.code, 2);
  assert.match(first.err, /tentativa 1 de 2/);
  const second = run("check-stop", { ...msg, stop_hook_active: true });
  assert.equal(second.code, 2, "segunda tentativa ainda bloqueia");
  assert.match(second.err, /tentativa 2 de 2/);
  const third = run("check-stop", { ...msg, stop_hook_active: true });
  assert.equal(third.code, 0, "terceira: fallback, não bloqueia");
  assert.match(JSON.parse(third.out).systemMessage, /pendência gravada/);
  assert.ok(fs.existsSync(path.join(data, "vac", "pending", `${session_id}.json`)), "pendência persistida");
  const log = fs.readFileSync(path.join(data, "vac", "log.jsonl"), "utf8");
  assert.match(log, /"kind":"fallback"/);
  const card = run("card", { hook_event_name: "UserPromptSubmit", session_id });
  const ctx = JSON.parse(card.out).hookSpecificOutput.additionalContext;
  assert.match(ctx, /Pendência do \/vac no turno anterior/);
  assert.match(ctx, /lib\/graph\.ts:12/);
  assert.ok(!fs.existsSync(path.join(data, "vac", "pending", `${session_id}.json`)), "card apaga a pendência");
  const again = run("check-stop", { last_assistant_message: "Definido em lib/graph.ts:12", prompt_id: "p-next", session_id });
  assert.equal(again.code, 2, "prompt novo: contador zerado, bloqueia de novo");
});

test("check-stop: VAC_STRICT=0 → silêncio", () => {
  const r = spawnSync(process.execPath, [HOOK, "check-stop", "--data", data], {
    input: JSON.stringify({ cwd: root, last_assistant_message: "lib/graph.ts:12" }),
    encoding: "utf8",
    env: { ...process.env, VAC_STRICT: "0" },
  });
  assert.equal(r.status, 0);
});

test("check-stop: ✅ sem evidência fora de gate → silêncio (a régua é do modelo)", () => {
  const r = run("check-stop", { last_assistant_message: "- Pronto ✅ tudo certo" });
  assert.equal(r.code, 0);
});

test("check-stop: ✅ sem evidência em Gateway Check → bloqueia listando a linha", () => {
  const msg = [
    "## Gateway Check — Step 4 → Step 5",
    "- **Princípios (SOLID · DRY):** ✅ aplicados — a lente cobrou o UC",
    "- **Veredicto:** ✅ LIBERADO",
  ].join("\n");
  const r = run("check-stop", { last_assistant_message: msg });
  assert.equal(r.code, 2);
  assert.match(r.err, /claim sem evidência.*Princípios/);
  assert.doesNotMatch(r.err, /Veredicto/, "linha-resumo é isenta");
});

test("check-stop: ✅ com coordenada, comando→saída, tool: ou estado de abstenção → silêncio", () => {
  const msg = [
    "## Gateway Check — Step 4 → Step 5",
    "- **Princípios:** ✅ aplicados — SRP em lib/skills.ts:12",
    "- tsc ✅ `pnpm typecheck` → Found 0 errors",
    "- tasks ✅ tool: TaskList → 7 completed",
    "- TC-4 iOS — [INDISPONÍVEL] sem simulador; tentei `xcrun simctl list` → not found",
    "- **Veredicto:** ✅ LIBERADO",
  ].join("\n");
  const r = run("check-stop", { last_assistant_message: msg });
  assert.equal(r.code, 0, r.err);
});

test("check-stop: template dentro de bloco de código não conta", () => {
  const msg = "Formato:\n```markdown\n## Gateway Check\n- **Princípios:** ✅ aplicados\n- x.ts:9999\n```\nfim";
  const r = run("check-stop", { last_assistant_message: msg });
  assert.equal(r.code, 0, r.err);
});

test("check-stop: screenshot apontado que não existe → bloqueia; existente → passa", () => {
  const bad = run("check-stop", { last_assistant_message: "TC-1 PASSED — screenshot: .playwright-mcp/nope.png" });
  assert.equal(bad.code, 2);
  assert.match(bad.err, /nope\.png — arquivo não existe/);
  const ok = run("check-stop", { last_assistant_message: "TC-1 PASSED — screenshot: .playwright-mcp/tc1.png" });
  assert.equal(ok.code, 0, ok.err);
});

test("check-stop: gate 8→9 LIBERADO sem carimbo → bloqueia dizendo o comando", () => {
  const artifact = path.join(root, "kanban", "08-code-review", "feat.md");
  fs.writeFileSync(artifact, "# review\n- ok — [VERIFICADO] lib/skills.ts:1\n");
  const msg = "## Gateway Check — Step 8 → Step 9\n- **Veredicto:** ✅ LIBERADO";
  const r = run("check-stop", { last_assistant_message: msg });
  assert.equal(r.code, 2);
  assert.match(r.err, /gate 8→9 LIBERADO sem carimbo .* → rode \/vac kanban\/08-code-review\/feat\.md/);
});

// --- stamp + gate ----------------------------------------------------------

test("stamp: grava o carimbo com o hash do alvo e destrava o gate; edição invalida", () => {
  const rel = "kanban/08-code-review/feat.md";
  const artifact = path.join(root, rel);
  const hash = crypto.createHash("sha256").update(fs.readFileSync(artifact)).digest("hex");
  const report = `## Verificação — ${rel}\n- ok — SUPORTADA lib/skills.ts:1\n\nVEREDITO: 1 suportadas / 0 não suportadas / 0 não verificáveis · alvo=${rel} sha256=${hash}`;
  const s = run("stamp", { hook_event_name: "SubagentStop", agent_type: "furi-toolbox:vac-verifier", last_assistant_message: report });
  assert.equal(s.code, 0, s.err);
  const stampFile = path.join(data, "vac", "stamps", `${hash}.ok`);
  assert.ok(fs.existsSync(stampFile), "carimbo gravado em <data>/vac/stamps");
  assert.equal(JSON.parse(fs.readFileSync(stampFile, "utf8")).m, 0);

  const gate = "## Gateway Check — Step 8 → Step 9\n- **Veredicto:** ✅ LIBERADO";
  assert.equal(run("check-stop", { last_assistant_message: gate }).code, 0, "com carimbo, libera");

  fs.appendFileSync(artifact, "- editado depois\n");
  const again = run("check-stop", { last_assistant_message: gate });
  assert.equal(again.code, 2, "alvo editado → hash novo → sem carimbo");
});

test("stamp: m > 0 no carimbo → gate bloqueia pedindo correção", () => {
  const rel = "kanban/09-run-test/feat.md";
  const artifact = path.join(root, rel);
  fs.writeFileSync(artifact, "# run-test\n- TC-1 PASSED — screenshot: .playwright-mcp/tc1.png\n");
  const hash = crypto.createHash("sha256").update(fs.readFileSync(artifact)).digest("hex");
  const report = `VEREDITO: 0 suportadas / 1 não suportadas / 0 não verificáveis · alvo=${rel} sha256=${hash}`;
  assert.equal(run("stamp", { last_assistant_message: report }).code, 0);
  const r = run("check-stop", { last_assistant_message: "## Gateway Check — Step 9 → Step 10\n- **Veredicto:** ✅ LIBERADO" });
  assert.equal(r.code, 2);
  assert.match(r.err, /1 afirmação\(ões\) NÃO SUPORTADA/);
});

test("stamp: sha256=indisponível → carimba com o hash calculado pelo hook", () => {
  const rel = "kanban/08-code-review/feat.md";
  const hash = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, rel))).digest("hex");
  const r = run("stamp", { last_assistant_message: `VEREDITO: 2 suportadas / 0 não suportadas / 0 não verificáveis · alvo=${rel} sha256=indisponível` });
  assert.equal(r.code, 0, r.err);
  assert.ok(fs.existsSync(path.join(data, "vac", "stamps", `${hash}.ok`)));
});

test("check-stop: contagem de linhas ignora o newline final (igual ao editor)", () => {
  fs.writeFileSync(path.join(root, "lib", "three.ts"), "a\nb\nc\n");
  const r = run("check-stop", { last_assistant_message: "veja lib/three.ts:4" });
  assert.equal(r.code, 2);
  assert.match(r.err, /arquivo tem 3 linhas/);
  assert.equal(run("check-stop", { last_assistant_message: "veja lib/three.ts:3" }).code, 0);
});

test("stamp: relatório sem VEREDITO → bloqueia o subagente pedindo a linha", () => {
  const r = run("stamp", { last_assistant_message: "## Verificação\n- tudo certo" });
  assert.equal(r.code, 2);
  assert.match(r.err, /sem a linha final/);
});

test("stamp: hash do VEREDITO diferente do arquivo → não grava, não bloqueia", () => {
  const rel = "kanban/08-code-review/feat.md";
  const fake = "a".repeat(64);
  const r = run("stamp", { last_assistant_message: `VEREDITO: 1 suportadas / 0 não / 0 não verificáveis · alvo=${rel} sha256=${fake}` });
  assert.equal(r.code, 0);
  assert.match(r.err, /não bate/);
  assert.ok(!fs.existsSync(path.join(data, "vac", "stamps", `${fake}.ok`)));
});

// --- agent-done (PostToolUse do Agent) --------------------------------------

function agentInput(agentType, text, subagentType = agentType) {
  return {
    hook_event_name: "PostToolUse",
    tool_name: "Agent",
    tool_input: { subagent_type: subagentType, prompt: "x", description: "x" },
    tool_response: { status: "completed", agentType, content: [{ type: "text", text }] },
  };
}

test("agent-done: verificador terminou → carimba pelo tool_response", () => {
  const rel = "kanban/08-code-review/agent.md";
  fs.writeFileSync(path.join(root, rel), "# review\n- ok — [VERIFICADO] lib/skills.ts:2\n");
  const hash = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, rel))).digest("hex");
  const report = `## Verificação\n- ok — SUPORTADA lib/skills.ts:2\n\nVEREDITO: 1 suportadas / 0 não suportadas / 0 não verificáveis · alvo=${rel} sha256=${hash}`;
  const r = run("agent-done", agentInput("furi-toolbox:vac-verifier", report));
  assert.equal(r.code, 0, r.err);
  assert.ok(fs.existsSync(path.join(data, "vac", "stamps", `${hash}.ok`)));
});

test("agent-done: verificador sem VEREDITO → bloqueia pedindo a linha", () => {
  const r = run("agent-done", agentInput("furi-toolbox:vac-verifier", "## Verificação\n- tudo certo"));
  assert.equal(r.code, 2);
  assert.match(r.err, /sem a linha final/);
});

test("agent-done: outro subagente com coordenada inventada → bloqueia; limpo → silêncio", () => {
  const bad = run("agent-done", agentInput("Explore", "A função está em lib/nope.ts:3"));
  assert.equal(bad.code, 2);
  assert.match(bad.err, /retorno do subagente \(Explore\)/);
  const ok = run("agent-done", agentInput("Explore", "A função está em lib/skills.ts:3"));
  assert.equal(ok.code, 0, ok.err);
});

test("agent-done: outra tool que não Agent → silêncio", () => {
  const r = run("agent-done", { tool_name: "Read", tool_input: {}, tool_response: "x" });
  assert.equal(r.code, 0);
});

// --- check-artifact --------------------------------------------------------

test("check-artifact: só valida artefatos de processo", () => {
  const r = run("check-artifact", { tool_name: "Write", tool_input: { file_path: path.join(root, "lib", "skills.ts") } });
  assert.equal(r.code, 0);
});

test("check-artifact: run-test com PASSED sem evidência e screenshot inexistente → bloqueia ambos", () => {
  const file = path.join(root, "kanban", "09-run-test", "x.md");
  fs.writeFileSync(file, "# Run Test\n- TC-1 PASSED\n- TC-2 PASSED — screenshot: .playwright-mcp/zzz.png\n");
  const r = run("check-artifact", { tool_name: "Write", tool_input: { file_path: file } });
  assert.equal(r.code, 2);
  assert.match(r.err, /claim sem evidência: "- TC-1 PASSED"/);
  assert.match(r.err, /zzz\.png — arquivo não existe/);
});

test("check-artifact: corrigido para INDISPONÍVEL com motivo → passa", () => {
  const file = path.join(root, "kanban", "09-run-test", "x.md");
  fs.writeFileSync(file, "# Run Test\n- TC-1 — [INDISPONÍVEL] screenshot não gerado (Playwright ocupado; tentei índices 0-5)\n- TC-2 PASSED — screenshot: .playwright-mcp/tc1.png\n");
  const r = run("check-artifact", { tool_name: "Edit", tool_input: { file_path: file } });
  assert.equal(r.code, 0, r.err);
});

// --- robustez --------------------------------------------------------------

test("stdin vazio ou inválido → nunca derruba a sessão", () => {
  const r = spawnSync(process.execPath, [HOOK, "check-stop", "--data", data], { input: "not json", encoding: "utf8" });
  assert.equal(r.status, 0);
});

test("subcomando desconhecido → exit 0 com aviso", () => {
  const r = spawnSync(process.execPath, [HOOK, "nope"], { input: "{}", encoding: "utf8" });
  assert.equal(r.status, 0);
  assert.match(r.stderr, /desconhecido/);
});

test("--data com placeholder não expandido → cai no fallback sem quebrar", () => {
  const r = spawnSync(process.execPath, [HOOK, "card", "--data", "${CLAUDE_PLUGIN_DATA}"], {
    input: JSON.stringify({ hook_event_name: "UserPromptSubmit" }),
    encoding: "utf8",
  });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /additionalContext/);
});
