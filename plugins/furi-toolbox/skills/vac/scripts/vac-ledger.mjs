// vac-ledger.mjs — o que realmente aconteceu nesta janela de contexto, lido do transcript.
// "Fato do repo só depois de Read/Grep nesta janela; estado do mundo só por ferramenta" deixa de
// ser doutrina e vira conferência: a evidência citada na resposta tem de corresponder a uma
// chamada real (Read, Bash, Skill, Agent, Task*, Playwright…) depois do último compact_boundary.
//
// Custo: índice incremental por sessão (<data>/vac/sessions/<id>.json → ledger.offset) — a cada
// Stop só os bytes novos do transcript são lidos; a janela zera em compactação. Transcripts de
// subagente (<projeto>/<session>/subagents/agent-<id>.jsonl) entram no mesmo índice, marcados.
// Zero hook por chamada de tool.

import fs from "node:fs";
import path from "node:path";
import { COORD_RE, EXT, VERDICT_RE, gateOf, loadGates, proseLines, resolveFile, sections, stripMentions, isPlaceholder } from "./vac-rules.mjs";

const MAX_BASH = 2000;
const MAX_LIST = 500;
const PATH_TOKEN_RE = new RegExp(`(?:~/|\\.{1,2}/|/)?(?:[\\w@.-]+/)*[\\w@.-]+\\.(?:${EXT})\\b`, "gu");

function fresh() {
  return {
    offset: 0,
    windows: 0,
    reads: {}, // abs → ["Read" | "Bash" | "Grep" | "Glob" | "agent"]
    bash: [],
    skills: [],
    userCommands: [],
    tools: {}, // nome → contagem (na janela)
    tasks: { create: 0, updateCompleted: 0, list: 0, ids: [] },
    writes: [],
    headings: [],
    nav: { hosts: [], screenshots: 0 },
    agents: {}, // agentId → { type, bg, stopped, toolUseId }
    received: [], // coordenadas vindas de retorno de agente / notificação
    verifierReports: [], // { alvo, m, at, published }
    pendingToolUse: {}, // tool_use_id → { name, input }
  };
}

function resetWindow(st) {
  const keep = { offset: st.offset, windows: st.windows + 1, agents: st.agents, verifierReports: st.verifierReports };
  Object.assign(st, fresh(), keep);
}

function push(arr, v, max = MAX_LIST) {
  if (v === undefined || v === null) return;
  arr.push(v);
  if (arr.length > max) arr.splice(0, arr.length - max);
}

function markRead(st, p, via, cwd) {
  if (!p || isPlaceholder(p)) return;
  const abs = path.isAbsolute(p) ? p : path.resolve(cwd || process.cwd(), p);
  const key = path.normalize(abs);
  st.reads[key] = [...new Set([...(st.reads[key] || []), via])];
}

function noteBash(st, cmd, cwd) {
  const norm = String(cmd).replace(/\s+/g, " ").trim();
  push(st.bash, norm, MAX_BASH);
  for (const m of norm.matchAll(PATH_TOKEN_RE)) markRead(st, m[0].replace(/^~\//, `${process.env.HOME || ""}/`), "Bash", cwd);
}

function contentText(content) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map((b) => (typeof b === "string" ? b : (b?.text ?? ""))).join("\n");
  return "";
}

function recordCoords(st, text) {
  for (const { line } of proseLines(text)) for (const m of line.matchAll(COORD_RE)) push(st.received, m[1]);
}

function onToolUse(st, block, cwd) {
  const name = block.name || "";
  const input = block.input || {};
  st.tools[name] = (st.tools[name] || 0) + 1;
  st.pendingToolUse[block.id] = { name, input };
  switch (true) {
    case name === "Read":
      markRead(st, input.file_path, "Read", cwd);
      break;
    case name === "Grep":
    case name === "Glob":
      if (input.path) markRead(st, input.path, name, cwd);
      break;
    case name === "Bash":
      noteBash(st, input.command || "", cwd);
      break;
    case name === "Skill":
      push(st.skills, String(input.skill || ""));
      break;
    case name === "Agent":
      break; // pareado com o tool_result (agentId)
    case name === "TaskCreate":
      st.tasks.create++;
      break;
    case name === "TaskUpdate":
      if (input.status === "completed") st.tasks.updateCompleted++;
      if (input.taskId) push(st.tasks.ids, String(input.taskId));
      break;
    case name === "TaskList":
      st.tasks.list++;
      break;
    case /^(Write|Edit|MultiEdit)$/.test(name):
      if (input.file_path) push(st.writes, path.isAbsolute(input.file_path) ? input.file_path : path.resolve(cwd || process.cwd(), input.file_path));
      break;
    case /browser_navigate$/.test(name):
      try {
        push(st.nav.hosts, new URL(input.url).host);
      } catch {
        /* url inválida */
      }
      break;
    case /take_screenshot$/.test(name):
      st.nav.screenshots++;
      break;
  }
}

function onToolResult(st, block) {
  const pending = st.pendingToolUse[block.tool_use_id];
  const text = contentText(block.content);
  if (pending?.name === "Agent") {
    const id = text.match(/agentId:\s*([\w-]+)/)?.[1];
    if (id) st.agents[id] = { ...(st.agents[id] || {}), type: String(pending.input.subagent_type || ""), bg: !!pending.input.run_in_background, toolUseId: block.tool_use_id };
    if (!/Async agent launched successfully/.test(text)) recordCoords(st, text); // síncrono: o relatório está aqui
    const v = text.match(VERDICT_RE);
    if (v) push(st.verifierReports, { alvo: v[4], m: Number(v[2]), published: false });
  }
  if (pending) delete st.pendingToolUse[block.tool_use_id];
}

function onUserText(st, text) {
  for (const m of text.matchAll(/<command-name>\s*(\/[\w:-]+)\s*<\/command-name>/g)) push(st.userCommands, m[1]);
  if (text.includes("<task-notification>")) {
    const id = text.match(/<task-id>\s*([\w-]+)\s*<\/task-id>/)?.[1];
    if (id) st.agents[id] = { ...(st.agents[id] || {}), stopped: true };
    recordCoords(st, text);
    const v = text.match(VERDICT_RE);
    if (v) push(st.verifierReports, { alvo: v[4], m: Number(v[2]), published: false });
  }
}

function onAssistantText(st, text) {
  for (const { line } of proseLines(text)) {
    const h = line.match(/^\s{0,3}#{1,6}\s+(.*?)\s*$/);
    if (h) push(st.headings, h[1]);
    if (/VEREDITO:/.test(line)) for (const r of st.verifierReports) r.published = true;
  }
}

// Lê os bytes novos do transcript e atualiza o estado (mutado).
function ingest(file, st, cwd) {
  let size;
  try {
    size = fs.statSync(file).size;
  } catch {
    return st;
  }
  if (st.offset > size) Object.assign(st, fresh()); // arquivo trocado/truncado: do zero
  if (st.offset === size) return st;
  const fd = fs.openSync(file, "r");
  const buf = Buffer.alloc(size - st.offset);
  fs.readSync(fd, buf, 0, buf.length, st.offset);
  fs.closeSync(fd);
  const chunk = buf.toString("utf8");
  const lastNl = chunk.lastIndexOf("\n");
  if (lastNl < 0) return st; // linha incompleta: espera o próximo Stop
  st.offset += Buffer.byteLength(chunk.slice(0, lastNl + 1), "utf8");
  for (const line of chunk.slice(0, lastNl).split("\n")) {
    if (!line) continue;
    if (!(line.includes('"tool_use"') || line.includes('"tool_result"') || line.includes("compact_boundary") || line.includes('"isCompactSummary":true') || line.includes('"role":"assistant"') || line.includes("<command-name>") || line.includes("task-notification"))) continue;
    let e;
    try {
      e = JSON.parse(line);
    } catch {
      continue;
    }
    if (e.type === "system" && e.subtype === "compact_boundary") {
      resetWindow(st);
      continue;
    }
    if (e.isCompactSummary) {
      resetWindow(st);
      continue;
    }
    const content = e.message?.content;
    if (e.type === "assistant" && Array.isArray(content)) {
      for (const b of content) {
        if (b?.type === "tool_use") onToolUse(st, b, e.cwd || cwd);
        else if (b?.type === "text" && b.text) onAssistantText(st, b.text);
      }
    } else if (e.type === "user") {
      if (typeof content === "string") onUserText(st, content);
      else if (Array.isArray(content)) for (const b of content) {
          if (b?.type === "tool_result") onToolResult(st, b);
          else if (b?.type === "text" && b.text) onUserText(st, b.text);
        }
    }
  }
  return st;
}

// Transcript do subagente: por agentId (agente em background: o tool_result diz "agentId: x") ou, para o síncrono,
// pelo tool_use_id do PostToolUse pareado com o toolUseId do agent-<id>.meta.json.
function subagentFile(input, agentId) {
  if (!input.transcript_path) return undefined;
  const dir = path.join(path.dirname(input.transcript_path), path.basename(input.transcript_path, ".jsonl"), "subagents");
  if (agentId) {
    const f = path.join(dir, `agent-${agentId}.jsonl`);
    return fs.existsSync(f) ? f : undefined;
  }
  if (!input.tool_use_id || !fs.existsSync(dir)) return undefined;
  for (const m of fs.readdirSync(dir).filter((x) => x.endsWith(".meta.json"))) {
    try {
      if (JSON.parse(fs.readFileSync(path.join(dir, m), "utf8")).toolUseId === input.tool_use_id) {
        const f = path.join(dir, m.replace(/\.meta\.json$/, ".jsonl"));
        return fs.existsSync(f) ? f : undefined;
      }
    } catch {
      /* meta parcial */
    }
  }
  return undefined;
}

// Atualiza o índice da sessão (session.ledger / session.subagents) e devolve a visão consolidada para as regras.
export function updateLedger(input, session, { subagent = false, agentId } = {}) {
  const cwd = input.cwd || process.cwd();
  let main = null;
  if (input.transcript_path && fs.existsSync(input.transcript_path)) {
    session.ledger = session.ledger || fresh();
    main = ingest(input.transcript_path, session.ledger, cwd);
  }
  // Subagentes: o específico (SubagentStop / agent-done) e, na sessão principal, TODOS os desta sessão — o relatório
  // deles volta ao contexto e a resposta pode citar o que eles rodaram.
  session.subagents = session.subagents || {};
  const subFiles = new Set();
  const specific = subagent ? input.agent_transcript_path : subagentFile(input, agentId);
  if (specific && fs.existsSync(specific)) subFiles.add(specific);
  if (!subagent && input.transcript_path) {
    const dir = path.join(path.dirname(input.transcript_path), path.basename(input.transcript_path, ".jsonl"), "subagents");
    try {
      for (const f of fs.readdirSync(dir)) if (f.endsWith(".jsonl")) subFiles.add(path.join(dir, f));
    } catch {
      /* sem subagentes */
    }
  }
  const subs = [];
  for (const f of subFiles) {
    const key = path.basename(f);
    session.subagents[key] = session.subagents[key] || fresh();
    subs.push(ingest(f, session.subagents[key], cwd));
  }
  if (specific && (agentId || input.agent_id) && session.ledger) session.ledger.agents[agentId || input.agent_id] = { ...(session.ledger.agents[agentId || input.agent_id] || {}), stopped: !!subagent || undefined };
  if (!main && !subs.length) return null;
  const a = main || fresh();
  const b = subs.reduce((acc, x) => ({
    reads: { ...acc.reads, ...x.reads },
    bash: [...acc.bash, ...x.bash],
    skills: [...acc.skills, ...x.skills],
    userCommands: [...acc.userCommands, ...x.userCommands],
    tools: Object.entries(x.tools).reduce((t, [k, v]) => ({ ...t, [k]: (t[k] || 0) + v }), { ...acc.tools }),
    tasks: { create: acc.tasks.create + x.tasks.create, updateCompleted: acc.tasks.updateCompleted + x.tasks.updateCompleted, list: acc.tasks.list + x.tasks.list, ids: [] },
    writes: [...acc.writes, ...x.writes],
    headings: [...acc.headings, ...x.headings],
    nav: { hosts: [...acc.nav.hosts, ...x.nav.hosts], screenshots: acc.nav.screenshots + x.nav.screenshots },
    received: [...acc.received, ...x.received],
  }), fresh());
  const merged = {
    available: true,
    reads: { ...a.reads, ...b.reads },
    bash: [...a.bash, ...b.bash],
    skills: [...a.skills, ...b.skills],
    userCommands: [...a.userCommands, ...b.userCommands],
    tools: { ...a.tools },
    tasks: { create: a.tasks.create + b.tasks.create, updateCompleted: a.tasks.updateCompleted + b.tasks.updateCompleted, list: a.tasks.list + b.tasks.list },
    writes: [...a.writes, ...b.writes],
    headings: [...a.headings, ...b.headings],
    nav: { hosts: [...a.nav.hosts, ...b.nav.hosts], screenshots: a.nav.screenshots + b.nav.screenshots },
    agents: a.agents,
    received: [...a.received, ...b.received],
    verifierReports: a.verifierReports,
  };
  for (const [k, v] of Object.entries(b.tools)) merged.tools[k] = (merged.tools[k] || 0) + v;
  session.writes = merged.writes; // usado por gateArtifact
  return merged;
}

// --- regras -----------------------------------------------------------------

const CMD_HEADS = new Set("git gh pnpm npm npx node tsc curl ls wc grep rg cat sed make docker kubectl aws sha256sum bash python pytest go cargo".split(" "));

function tokens(s) {
  return s.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
}
function ranBash(ledger, cmd) {
  const t = tokens(cmd);
  if (!t.length) return true;
  return ledger.bash.some((b) => {
    const bt = new Set(tokens(b));
    const hit = t.filter((x) => bt.has(x)).length;
    return bt.has(t[0]) && hit / t.length >= 0.6;
  });
}
function taskDirCompleted(input) {
  const id = process.env.CLAUDE_CODE_TASK_LIST_ID || input.session_id;
  if (!id) return undefined;
  const dir = path.join(process.env.HOME || "", ".claude", "tasks", id);
  try {
    let total = 0;
    let completed = 0;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith(".json")) continue;
      total++;
      try {
        if (JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")).status === "completed") completed++;
      } catch {
        /* arquivo parcial */
      }
    }
    return total ? { total, completed } : undefined; // diretório só com .lock/.highwatermark não é "0 de 0 concluídas"
  } catch {
    return undefined;
  }
}

function it(rule, severity, text, detail) {
  return { rule, severity, text, detail };
}

export function ledgerChecks(text, { roots, gates, ledger, input = {} } = {}) {
  if (!ledger?.available) return [];
  gates = gates || loadGates();
  const items = [];
  const secs = sections(text).map((sec) => ({ sec, gate: gateOf(sec, gates) }));
  const inGate = (sec) => secs.find((x) => x.sec === sec)?.gate;
  // Disclosure ≠ compliance (rationalizations.md): a isenção vale na PRÓPRIA linha de contagem — "TaskCreate criados: 10 (sem a
  // ferramenta)" ainda afirma 10; "TaskCreate: [INDISPONÍVEL] sem a ferramenta; rastreio no checklist (10)" não afirma nada.
  const UNAVAILABLE_RE = /(?:sem\s+(?:a\s+)?(?:ferramenta|tool)\s+Task|Task(?:Create|Update|List)[^\n]{0,40}(?:não existe|não está dispon|indispon|não expõe)|\[INDISPON[IÍ]VEL\])/iu;
  const readSet = new Set(Object.keys(ledger.reads));
  const received = new Set(ledger.received);

  for (const { sec, gate } of secs) {
    for (const l of sec.lines) {
      const line = l.line;
      const plain = stripMentions(line);
      const gated = !!gate;

      // R-1 coordenada [VERIFICADO] (ou em gate) sem leitura nesta janela
      if (/\[VERIFICADO\]/.test(line) || gated) {
        for (const m of line.replace(/https?:\/\/\S+/g, "").matchAll(COORD_RE)) {
          const p = m[1];
          if (isPlaceholder(p)) continue;
          const r = resolveFile(p, roots);
          if (!r.abs) continue; // coordenada inválida já é bloqueio de outra regra
          const abs = path.normalize(r.abs);
          if (readSet.has(abs) || received.has(p) || [...received].some((x) => abs.endsWith(x.replace(/^(?:\.{1,2}\/)+/, "")))) continue;
          items.push(it("coord-not-read", "note", `${p}:${m[2]}`, "sem Read/Grep/Bash desse arquivo nesta janela (nem em retorno de agente) — releia antes de afirmar"));
        }
      }

      // R-2 `cmd` → saída sem Bash correspondente
      for (const m of line.matchAll(/`([^`\n]+)`\s*(?:→|->|=>)/g)) {
        const cmd = m[1].trim();
        const head = tokens(cmd)[0] || "";
        if (!CMD_HEADS.has(head.replace(/^.*\//, ""))) continue;
        if (ranBash(ledger, cmd)) continue;
        items.push(it("cmd-not-run", gated ? "block" : "note", `\`${cmd.slice(0, 80)}\``, "comando citado como executado, sem Bash correspondente nesta janela"));
      }

      // R-3 tool: X → sem chamada de X
      for (const m of plain.matchAll(/\btool:\s*([A-Za-z_][\w-]*)\s*(?:→|->|=>)?\s*([^\n]*)/g)) {
        const tool = m[1];
        if (!(ledger.tools[tool] > 0)) {
          items.push(it("tool-not-called", gated ? "block" : "note", `tool: ${tool}`, `nenhuma chamada de ${tool} nesta janela`));
          continue;
        }
        if (tool === "TaskList") {
          const claimed = m[2].match(/(\d+)\s*(?:completed|conclu[ií]d)/i)?.[1];
          const disk = taskDirCompleted(input);
          if (claimed && disk && Number(claimed) !== disk.completed)
            items.push(it("tool-not-called", "block", `tool: TaskList → ${claimed} completed`, `no disco há ${disk.completed} de ${disk.total} tasks completed`));
        }
      }

      // R-7 "invoquei /x" sem Skill(x) (ou /blind sem blind.sh)
      for (const m of plain.matchAll(/\b(?:invoquei|chamei|rodei|executei)\b[^\n/]{0,30}\/([\w:-]+)/giu)) {
        const name = m[1].toLowerCase();
        const short = name.split(":").pop();
        const ok =
          ledger.skills.some((s) => s.toLowerCase().endsWith(short)) ||
          ledger.userCommands.some((c) => c.toLowerCase().endsWith(short)) ||
          (short === "blind" && ledger.bash.some((b) => /blind\.sh/.test(b)));
        if (!ok) items.push(it("skill-not-invoked", gated ? "block" : "note", `/${name}`, "sem chamada Skill nem comando do usuário nesta janela"));
      }

      if (!gated) continue;

      // R-9 deploy "run <id> ✓ verde" sem gh run
      const run = plain.match(/\brun\s+#?(\d{4,})\b/);
      if (run && /verde|✓|green/.test(plain) && !ledger.bash.some((b) => /\bgh run (?:view|watch)\b/.test(b) && b.includes(run[1])) && !ledger.bash.some((b) => /\bgh run list\b/.test(b)))
        items.push(it("run-not-watched", "block", `run ${run[1]}`, "nenhum `gh run view|watch <id>` (nem `gh run list`) nesta janela"));

      // R-8 smoke / "no ar" com URL sem navegação nem curl
      if (/\bSmoke\b|\bno ar\b/.test(plain)) {
        const url = line.match(/https?:\/\/([\w.-]+)/);
        if (url) {
          const host = url[1];
          const navigated = ledger.nav.hosts.includes(host) || ledger.bash.some((b) => /\bcurl\b/.test(b) && b.includes(host));
          if (!navigated) items.push(it("smoke-no-nav", "block", host, "nenhuma navegação (Playwright) nem curl nesse host nesta janela"));
        }
      }

      // R-11 commit afirmado sem git commit
      if (/\bcommit(?:ado|ei)?\b/.test(plain) && /✅|✓|\[VERIFICADO\]/.test(plain) && !ledger.bash.some((b) => /\bgit commit\b/.test(b)) && !ledger.skills.some((s) => /save$/.test(s)))
        items.push(it("commit-claimed", "block", line.trim().slice(0, 100), "nenhum `git commit` (nem /save) nesta janela"));
    }

    if (!gate) continue;
    const secText = sec.text;
    const gid = gate.id || "";
    const ledgerRules = new Set(gate.ledger || []);

    // R-4 Audit Pré: TaskCreate declarados × reais. Quem declarou a tool indisponível ("TaskCreate não existe nesta
    // sessão") foi honesto — o substituto é assunto do /method, não alucinação: R-4 não se aplica.
    const bodyLines = sec.lines.map((l) => l.line);
    if (ledgerRules.has("audit-counts") || /Audit\s+Pr[ée]/i.test(sec.heading)) {
      const nums = bodyLines
        .filter((l) => (/TaskCreate/u.test(l) || (/TaskCreate/u.test(sec.heading) && /\bcriad[ao]s?\b/iu.test(l))) && !UNAVAILABLE_RE.test(l))
        .flatMap((l) => [...l.matchAll(/(?<!\d):\s*\**\s*(\d+)\b(?!\s*:|\s*==|\s*por)/g)].map((m) => Number(m[1])));
      const claimed = nums.length ? Math.max(...nums) : 0;
      if (claimed > 0 && ledger.tasks.create < claimed)
        items.push(it("audit-counts", "block", `TaskCreate declarados: ${claimed}`, `o transcript desta janela tem ${ledger.tasks.create} TaskCreate`));
    }

    // R-5 Audit Pós: completed declarados × reais (TaskUpdate ou disco)
    if (ledgerRules.has("audit-completed") || /Audit\s+P[óo]s/i.test(sec.heading)) {
      const c = bodyLines.filter((l) => /Task|completed/iu.test(l) && !UNAVAILABLE_RE.test(l)).join("\n").match(/(?:completed|conclu[ií]d[ao]s?)[^\n\d]{0,40}(\d+)/iu)?.[1];
      const disk = taskDirCompleted(input);
      if (c && ledger.tasks.updateCompleted < Number(c) && !(disk && disk.completed >= Number(c)))
        items.push(it("audit-completed", "block", `tasks completed declaradas: ${c}`, `TaskUpdate(completed) nesta janela: ${ledger.tasks.updateCompleted}${disk ? `; no disco: ${disk.completed}` : ""}`));
    }

    // R-6 "Audit … publicado? ✅" sem o heading no transcript
    for (const m of secText.matchAll(/Audit\s+(Pr[ée]|P[óo]s)[^\n]*?publicad[oa]\?\s*✅/giu)) {
      const re = m[1].startsWith("Pr") ? /Audit\s+Pr[ée]/i : /Audit\s+P[óo]s/i;
      if (!ledger.headings.some((h) => re.test(h))) items.push(it("heading-not-published", "block", m[0].slice(0, 80), "nenhum heading de Audit publicado nesta janela"));
    }

    // R-10 PR aberto/atualizado sem gh pr / push
    if (gid === "pull-request-close" && !ledger.bash.some((b) => /\bgh pr (?:create|edit)\b|\bgit push\b/.test(b)))
      items.push(it("pr-not-created", "block", sec.heading.slice(0, 80), "nenhum `gh pr create|edit` nem `git push` nesta janela"));
  }

  // R-12 relatório do verificador recebido e não publicado
  if ((ledger.verifierReports || []).some((r) => r.published === false) && !/VEREDITO:/.test(text))
    items.push(it("verifier-report-omitted", "block", "relatório do verificador", "chegou nesta janela e a resposta não publica a linha VEREDITO — publique o relatório inteiro"));

  return items;
}
