// vac-samples.test.mjs — o golden set do hook: cada arquivo em samples/ é um caso real
// (bloqueio de sessão, artefato do labzz-afl) ou um template de outra skill, com o
// resultado esperado. Grátis, determinístico, roda em `pnpm test:vac`.
//
// Formato do sample (frontmatter com valores JSON):
//   cmd: "check-stop" | "check-stop --subagent" | "check-artifact" | "agent-done"
//   expect: "block" | "pass"
//   must: ["trecho do stderr", …]        must_not: [...]
//   fixture: {"git": true, "files": {"lib/x.ts": 120, "kanban/09-run-test/e/tc1.png": "png"}}   (n = linhas)
//   ledger: {"reads": ["lib/x.ts"], "bash": ["pnpm typecheck"], "skills": ["furi-build:solve"],
//            "taskCreate": 0, "taskCompleted": 0, "taskList": 0, "agentReports": ["VEREDITO: …"],
//            "headings": ["## Audit Pré-Execução"], "nav": ["https://x"], "compactAfter": false}
//   artifact: "kanban/09-run-test/x.md"   (check-artifact: o corpo vira esse arquivo)
//   agent: "Explore"                       (agent-done)
//   input: {"stop_hook_active": true}      (campos extras do stdin)
//   origin / class: proveniência e classificação (documentação)
// Corpo = last_assistant_message / artefato / retorno do agente, literal.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync, execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const HOOK = path.join(HERE, "vac-hook.mjs");
const SAMPLES = path.join(HERE, "samples");

export function parseSample(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error("sample sem frontmatter");
  const front = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (!kv) continue;
    try {
      front[kv[1]] = JSON.parse(kv[2]);
    } catch {
      front[kv[1]] = kv[2];
    }
  }
  return { front, body: m[2].replace(/\n$/, "") };
}

function mkFixture(root, fixture = {}) {
  for (const [rel, spec] of Object.entries(fixture.files || {})) {
    const abs = path.join(root, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, typeof spec === "number" ? Array.from({ length: spec }, (_, i) => `line ${i + 1}`).join("\n") + "\n" : String(spec));
  }
  if (fixture.git) execFileSync("git", ["init", "-q"], { cwd: root });
}

function mkTranscript(file, root, ledger = {}) {
  const lines = [];
  let n = 0;
  const use = (name, input) => {
    const id = `t${++n}`;
    lines.push(JSON.stringify({ type: "assistant", cwd: root, message: { role: "assistant", content: [{ type: "tool_use", id, name, input }] } }));
    return id;
  };
  const result = (id, content) => lines.push(JSON.stringify({ type: "user", message: { role: "user", content: [{ tool_use_id: id, type: "tool_result", content }] } }));
  for (const rel of ledger.reads || []) result(use("Read", { file_path: path.join(root, rel) }), "ok");
  for (const cmd of ledger.bash || []) result(use("Bash", { command: cmd }), "ok");
  for (const s of ledger.skills || []) result(use("Skill", { skill: s }), "ok");
  for (let i = 0; i < (ledger.taskCreate || 0); i++) result(use("TaskCreate", { subject: `t${i}` }), `Task #${i + 1} created`);
  for (let i = 0; i < (ledger.taskCompleted || 0); i++) result(use("TaskUpdate", { taskId: String(i + 1), status: "completed" }), "ok");
  for (let i = 0; i < (ledger.taskList || 0); i++) result(use("TaskList", {}), "3 tasks");
  (ledger.agentReports || []).forEach((text, i) => result(use("Agent", { subagent_type: "furi-toolbox:vac-verifier", prompt: "x" }), `agentId: ag${i}\n${text}`));
  for (const url of ledger.nav || []) result(use("mcp__playwright-0__browser_navigate", { url }), "ok");
  for (const h of ledger.headings || []) lines.push(JSON.stringify({ type: "assistant", message: { role: "assistant", content: [{ type: "text", text: `${h}\n- x` }] } }));
  if (ledger.compactAfter) lines.push(JSON.stringify({ type: "system", subtype: "compact_boundary" }));
  fs.writeFileSync(file, lines.join("\n") + "\n");
}

const files = fs.existsSync(SAMPLES) ? fs.readdirSync(SAMPLES).filter((f) => /^\d{3}-.*\.md$/.test(f)).sort() : [];

for (const file of files) {
  const { front, body } = parseSample(fs.readFileSync(path.join(SAMPLES, file), "utf8"));
  test(`sample ${file} → ${front.expect}`, () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "vac-sample-root-"));
    const data = fs.mkdtempSync(path.join(os.tmpdir(), "vac-sample-data-"));
    try {
      mkFixture(root, front.fixture);
      const input = { cwd: root, session_id: "sample", prompt_id: file, ...(front.input || {}) };
      if (front.ledger) {
        input.transcript_path = path.join(data, "transcript.jsonl");
        mkTranscript(input.transcript_path, root, front.ledger);
      }
      const [cmd, ...flags] = String(front.cmd || "check-stop").split(/\s+/);
      if (cmd === "check-artifact") {
        const abs = path.join(root, front.artifact || "kanban/09-run-test/sample.md");
        fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, body + "\n");
        input.tool_name = "Write";
        input.tool_input = { file_path: abs };
      } else if (cmd === "agent-done") {
        const type = front.agent || "Explore";
        input.tool_name = "Agent";
        input.tool_input = { subagent_type: type, prompt: "x", description: "x" };
        input.tool_response = { status: "completed", agentType: type, content: [{ type: "text", text: body }] };
      } else {
        input.last_assistant_message = body;
        if (flags.includes("--subagent")) input.agent_type = front.agent || "Explore";
      }
      const r = spawnSync(process.execPath, [HOOK, cmd, ...flags, "--data", data], {
        input: JSON.stringify(input),
        encoding: "utf8",
        env: { ...process.env, CLAUDE_PROJECT_DIR: root, VAC_STRICT: "1" },
      });
      const want = front.expect === "block" ? 2 : 0;
      assert.equal(r.status, want, `exit ${r.status}, esperado ${want}\nstderr: ${r.stderr}\nstdout: ${r.stdout}`);
      for (const s of front.must || []) assert.ok(r.stderr.includes(s), `stderr deveria conter "${s}":\n${r.stderr}`);
      for (const s of front.must_not || []) assert.ok(!r.stderr.includes(s), `stderr não deveria conter "${s}":\n${r.stderr}`);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
      fs.rmSync(data, { recursive: true, force: true });
    }
  });
}

test("samples: a pasta existe e tem pelo menos um caso de cada classe", () => {
  assert.ok(files.length >= 10, `${files.length} samples`);
  const classes = new Set(files.map((f) => parseSample(fs.readFileSync(path.join(SAMPLES, f), "utf8")).front.class));
  for (const c of ["positivo-verdadeiro", "falso-positivo-template", "falso-positivo-mencao", "ledger"]) assert.ok(classes.has(c), `sem sample da classe ${c}`);
});
