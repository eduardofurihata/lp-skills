#!/usr/bin/env node
// vac-hook.mjs — os hooks do /vac. Um script, um subcomando por evento.
// Zero dependências, sem rede, sem escrita no repositório-alvo.
//
// Lê o JSON que o Claude Code entrega ao hook em stdin e responde por:
//   exit 0 + JSON no stdout  → injeta contexto (card) ou avisa (systemMessage)
//   exit 2 + motivo no stderr → bloqueia; o motivo volta para o modelo corrigir
//   exit 0 silencioso         → nada a dizer
//
// Subcomandos de hook (hooks/hooks.json do plugin):
//   card [--subagent | --after-compact | --session-start]   UserPromptSubmit / SubagentStart / SessionStart
//   check-artifact                       PostToolUse (Write|Edit|MultiEdit) em artefato de processo
//   check-stop [--subagent]              Stop / SubagentStop (verificador → carimbo; outro → confere + ledger)
//   agent-done                           PostToolUse (Agent): verificador → carimbo; outro → confere o retorno
//   stamp                                carimbo direto de um relatório em last_assistant_message
// Subcomandos de linha de comando (o modelo chama via Bash; o usuário também pode):
//   on | off | status                    toggle do regime (<data>/vac/on)
//   log [--tail N] [--kind k] [--session s] [--json]
//   caso <id|last> [--slug s] [--expect block|pass] [--out DIR]   log → sample do golden set
//   scan <paths…> [--json]               analyze em lote sobre .md (read-only)
//   scan --map <arquivo…> [--fix] [--version x.y.z]                valida mapas .claude/vac/*.md
//   probe                                grava o payload no log (VAC_DEBUG=1)
//
// Flags: --data <dir>   onde persistir (carimbos, log, sessões). Sem a flag: ~/.claude/vac-data — um lugar só,
//                       para hooks (env com CLAUDE_PLUGIN_DATA) e o modelo (Bash sem ela) concordarem.
// Env:   VAC_STRICT=0   bloqueios viram aviso + linha "bypass" no log (o cartão continua)
//        VAC_RETRIES=N  bloqueios por prompt antes do fallback (default 2)
//        VAC_ON=1       regime ligado sem o arquivo de toggle (evals, claude -p)
//        VAC_DEBUG=1    liga o `probe`
//
// Módulos: vac-rules.mjs (regras, puras) · vac-store.mjs (persistência) · vac-map.mjs (mapas)
//          vac-ledger.mjs (transcript). Precisão > recall em todos: o que passa com dúvida vira `note`.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  ARTIFACT_RE,
  VERDICT_RE,
  analyze,
  describe,
  gateSections,
  loadGates,
  projectRoots,
  resolveFile,
  sections,
  sha256File,
  stripMentions,
} from "./vac-rules.mjs";
import * as store from "./vac-store.mjs";
import { mapsSummary, scanMap, transcriptVersion } from "./vac-map.mjs";
import { ledgerChecks, updateLedger } from "./vac-ledger.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
process.stdout.on("error", () => process.exit(0)); // `| head` fecha o pipe: não é erro do hook
const SKILL_FILE = path.join(HERE, "..", "SKILL.md"); // o cartão mora no SKILL.md, entre <!-- vac:card --> e <!-- /vac:card -->
const MAX_ITEMS = 8;
const MAX_REASON = 1800;
const VAC_RETRIES = Math.max(1, Number(process.env.VAC_RETRIES) || 2);

// ---------------------------------------------------------------------------
// Entrada / ambiente
// ---------------------------------------------------------------------------

function readStdin() {
  if (process.stdin.isTTY) return {}; // chamado à mão, sem pipe: não espera stdin
  try {
    const raw = fs.readFileSync(0, "utf8");
    return raw.trim() ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function argValue(flag) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function positional() {
  const out = [];
  const argv = process.argv.slice(3);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      if (!["--json", "--fix", "--map", "--subagent", "--after-compact", "--session-start"].includes(argv[i])) i++;
      continue;
    }
    out.push(argv[i]);
  }
  return out;
}

function strict() {
  return process.env.VAC_STRICT !== "0";
}

function ctxOf(input, sub, extra = {}) {
  return {
    event: input.hook_event_name,
    sub,
    session: input.session_id ?? null,
    prompt_id: input.prompt_id ?? null,
    cwd: input.cwd ?? process.cwd(),
    ...extra,
  };
}

// ---------------------------------------------------------------------------
// Saída
// ---------------------------------------------------------------------------

function inject(eventName, text) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: eventName, additionalContext: text } }));
  process.exit(0);
}

function warn(message) {
  process.stdout.write(JSON.stringify({ systemMessage: message }));
  process.exit(0);
}

const FOOTER =
  "Coordenada de outro repositório? Use caminho absoluto. Sem como apurar? Troque o ✅ por [AUSENTE]/[INDISPONÍVEL]/[INFERIDO] com o motivo. Falso positivo? VAC_STRICT=0 e reporte a linha (vira caso: /vac caso).";

// Itens → bloqueio (exit 2) ou, com VAC_STRICT=0, aviso + linha de bypass no log. Notas só vão para o log.
function emit(header, items, ctx, text) {
  const blocks = items.filter((i) => i.severity === "block");
  const notes = items.filter((i) => i.severity !== "block");
  if (notes.length) store.logEvent("note", { ...ctx, items: notes });
  if (!blocks.length) return false;
  const mode = ctx.mode || "stop";
  const lines = blocks.slice(0, MAX_ITEMS).map((i) => `- ${describe(i, mode)}`);
  if (blocks.length > MAX_ITEMS) lines.push(`- … e mais ${blocks.length - MAX_ITEMS}`);
  if (!strict()) {
    store.logEvent("bypass", { ...ctx, items: blocks, text });
    warn(`[/vac] VAC_STRICT=0 — ${blocks.length} afirmação(ões) sem lastro passaram sem bloqueio: ${lines[0].slice(2, 160)}`);
  }
  store.logEvent("block", { ...ctx, items: blocks, text });
  process.stderr.write(`${header}\n${lines.join("\n")}\n${FOOTER}`.slice(0, MAX_REASON));
  process.exit(2);
}

// ---------------------------------------------------------------------------
// Cartão
// ---------------------------------------------------------------------------

function cardText() {
  const skill = fs.readFileSync(SKILL_FILE, "utf8");
  const m = skill.match(/<!--\s*vac:card\s*-->([\s\S]*?)<!--\s*\/vac:card\s*-->/);
  if (!m) throw new Error("SKILL.md sem o bloco <!-- vac:card --> … <!-- /vac:card -->");
  return m[1].trim();
}

function touchedArtifacts(roots) {
  for (const root of roots) {
    try {
      const out = execFileSync("git", ["status", "--short", "--", "docs", "kanban", ".claude"], {
        cwd: root,
        encoding: "utf8",
        timeout: 3000,
        stdio: ["ignore", "pipe", "ignore"],
      });
      const lines = out.split(/\r?\n/).filter(Boolean);
      if (lines.length) return lines.slice(0, 20).join("\n");
    } catch {
      /* sem git ou fora de repo: sem lista */
    }
  }
  return "";
}

function cmdCard(input) {
  const event = input.hook_event_name || "UserPromptSubmit";
  const roots = projectRoots(input);
  const subagent = process.argv.includes("--subagent");
  const sessionStart = process.argv.includes("--session-start");
  const source = String(input.source || "");
  const afterCompact = process.argv.includes("--after-compact") || (sessionStart && /compact|resume/.test(source));
  let text = cardText();
  let variant = "prompt";
  if (subagent) {
    variant = "subagent";
    text +=
      "\nVocê é um subagente: não herde afirmações da conversa que o criou — releia as fontes do disco antes de afirmar. Há mapa validado em .claude/vac/? Use os ponteiros dele antes de varrer.";
  } else if (afterCompact) {
    variant = "after-compact";
    const touched = touchedArtifacts(roots);
    text =
      'Contexto compactado ou sessão retomada: o que você "lembra" é um resumo — não afirme nada a partir dele sem reler a fonte.\n' +
      text +
      (touched ? `\nArtefatos de processo modificados nesta árvore (releia antes de afirmar sobre eles):\n${touched}` : "");
  } else if (sessionStart) {
    variant = "session-start";
    const on = store.isOn() ? fs.existsSync(store.toggleFile()) && JSON.parse(fs.readFileSync(store.toggleFile(), "utf8")) : null;
    text += `\n[/vac ligado${on?.cwd ? ` em ${on.cwd}` : ""}${on?.at ? ` às ${on.at}` : ""} — \`/vac off\` desliga; \`/vac log\` mostra bloqueios e pendências]`;
  }
  if (afterCompact || sessionStart || subagent) {
    const maps = mapsSummary(roots, { version: transcriptVersion(input.transcript_path) });
    if (maps) text += `\nMapas validados agora (leia por seção, só o que precisar):\n${maps}`;
  }
  const pending = store.readPending(input);
  if (pending && !subagent) {
    text += `\nPendência do /vac no turno anterior (${pending.items?.length ?? 0} afirmação(ões) ficaram sem lastro depois de ${VAC_RETRIES} tentativas) — resolva ou marque o estado real antes de afirmar qualquer outra coisa:\n${(pending.items || []).slice(0, MAX_ITEMS).map((i) => `- ${i}`).join("\n")}`;
    store.clearPending(input);
  }
  if (!subagent) {
    const idx = store.loadSession(input);
    if (Object.keys(idx.blocks || {}).length) {
      idx.blocks = {};
      store.saveSession(input, idx);
    }
  }
  if (variant !== "prompt") store.logEvent("card", ctxOf(input, `card --${variant}`, { source }));
  inject(event, text);
}

// ---------------------------------------------------------------------------
// Carimbos e gates
// ---------------------------------------------------------------------------

function normalizedHash(text) {
  const norm = text
    .split(/\r?\n/)
    .map((l) => l.trim().replace(/^#{1,6}\s+/, "").replace(/\s+/g, " "))
    .filter(Boolean)
    .join("\n");
  return crypto.createHash("sha256").update(norm).digest("hex");
}

function newestMd(dir) {
  if (!fs.existsSync(dir)) return undefined;
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join(dir, f))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return files[0];
}

function rootOf(abs, roots) {
  return roots.find((r) => abs.startsWith(r + path.sep)) || roots[0];
}

// O artefato que um gate cobra: path citado na seção → gravado nesta janela → o mais recente da pasta.
function gateArtifact(gate, secText, roots, session) {
  const tryPath = (p, how) => {
    if (!p) return undefined;
    const r = resolveFile(p, roots);
    return r.abs ? { abs: r.abs, root: rootOf(r.abs, roots), how } : undefined;
  };
  const cited = gate.artifactFromTextRe ? tryPath(secText.match(gate.artifactFromTextRe)?.[1], "citado") : undefined;
  if (cited) return cited;
  if (gate.artifactDir) {
    const inText = secText.match(new RegExp(`(${gate.artifactDir.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/[\\w@.-]+\\.md)`, "u"))?.[1];
    const found = tryPath(inText, "citado");
    if (found) return found;
    const written = (session.writes || []).filter((w) => w.includes(`/${gate.artifactDir}/`)).at(-1);
    const fromLedger = written ? tryPath(written, "gravado nesta janela") : undefined;
    if (fromLedger) return fromLedger;
    const root = roots.find((r) => fs.existsSync(path.join(r, gate.artifactDir)));
    if (!root) return undefined; // projeto sem esteira /method: nada a cobrar
    const newest = newestMd(path.join(root, gate.artifactDir));
    return newest ? { abs: newest, root, how: "mais recente (cite o path no gate)" } : undefined;
  }
  return undefined;
}

// Gates carimbados: verifier (carimbo por hash do artefato) ou session (bloco verificado nesta sessão).
function missingStamps(text, roots, gates, session) {
  const items = [];
  for (const { sec, gate } of gateSections(text, gates)) {
    const plain = stripMentions(sec.text);
    if (gate.releaseRe && !gate.releaseRe.test(plain)) continue;
    if (gate.stampWhenRe && !gate.stampWhenRe.test(sec.text)) continue;
    const release = gate.release || "fechado";
    if (gate.stamp === "verifier") {
      const art = gateArtifact(gate, sec.text, roots, session);
      if (!art) continue;
      const rel = path.relative(art.root, art.abs);
      const stamp = store.readStamp(sha256File(art.abs));
      if (!stamp)
        items.push({ rule: "stamp", severity: "block", text: `gate ${gate.label} ${release} sem carimbo do verificador para ${rel} → rode /vac ${rel}` });
      else if (Number(stamp.m) > 0)
        items.push({ rule: "stamp", severity: "block", text: `gate ${gate.label} ${release} com ${stamp.m} afirmação(ões) NÃO SUPORTADA(s) em ${rel} → corrija e rode /vac ${rel} de novo` });
    } else if (gate.stamp === "session") {
      const nsha = normalizedHash(sec.text);
      const ok = (session.stamps || []).some((s) => Number(s.m) === 0 && (s.nshas || []).includes(nsha));
      if (!ok)
        items.push({
          rule: "stamp-session",
          severity: "block",
          text: `gate ${gate.label}: bloco "no ar" sem verificação nesta sessão → grave o bloco final num arquivo, rode /vac <arquivo> e publique o mesmo texto`,
        });
    }
  }
  return items;
}

function stampFrom(text, input) {
  const m = text.match(VERDICT_RE);
  if (!m) {
    const ctx = ctxOf(input, "stamp");
    if (!strict()) {
      store.logEvent("bypass", { ...ctx, items: [{ rule: "verdict", severity: "block", text: "relatório do verificador sem VEREDITO" }] });
      warn("[/vac] VAC_STRICT=0 — relatório do verificador sem a linha VEREDITO; carimbo não gravado.");
    }
    store.logEvent("block", { ...ctx, items: [{ rule: "verdict", severity: "block", text: "relatório do verificador sem VEREDITO" }], text });
    process.stderr.write(
      "[/vac] relatório do verificador sem a linha final `VEREDITO: <n> suportadas / <m> não suportadas / <k> não verificáveis · alvo=<path> sha256=<hash|indisponível>` — o carimbo não foi gravado. Termine o relatório com ela.",
    );
    process.exit(2);
  }
  const [, n, mm, k, target, claimed] = m;
  const roots = projectRoots(input);
  const r = resolveFile(target, roots);
  if (!r.abs) {
    process.stderr.write(`[/vac] alvo do VEREDITO não encontrado: ${target} — carimbo não gravado.`);
    process.exit(0);
  }
  const actual = sha256File(r.abs);
  if (/^[0-9a-f]{64}$/.test(claimed) && actual !== claimed) {
    process.stderr.write(
      `[/vac] sha256 do VEREDITO (${claimed.slice(0, 12)}…) não bate com o arquivo atual (${actual.slice(0, 12)}…) — o alvo mudou durante a verificação; carimbo não gravado. Rode \`sha256sum ${target}\` e verifique de novo.`,
    );
    process.exit(0);
  }
  const info = { alvo: target, n: Number(n), m: Number(mm), k: Number(k), at: new Date().toISOString(), session: input.session_id ?? null };
  store.writeStamp(actual, info);
  // carimbo de sessão: o hash normalizado do alvo inteiro e de cada seção dele (para `/vac última` sobre um bloco de gate)
  const content = fs.readFileSync(r.abs, "utf8");
  const nshas = [normalizedHash(content), ...sections(content).map((s) => normalizedHash(s.text))];
  const idx = store.loadSession(input);
  idx.stamps = [...(idx.stamps || []).slice(-50), { sha256: actual, nshas, m: Number(mm), alvo: target, at: info.at }];
  store.saveSession(input, idx);
  store.logEvent("stamp", ctxOf(input, "stamp", { target, n: info.n, m: info.m, k: info.k, sha256: actual }));
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Conferências
// ---------------------------------------------------------------------------

function cmdCheckArtifact(input) {
  if (!/^(Write|Edit|MultiEdit)$/.test(input.tool_name || "")) process.exit(0);
  const file = input.tool_input?.file_path;
  if (!file || !ARTIFACT_RE.test(file)) process.exit(0);
  const roots = projectRoots(input);
  const r = resolveFile(file, roots);
  if (!r.abs) process.exit(0);
  const text = fs.readFileSync(r.abs, "utf8");
  const items = analyze(text, { roots, mode: "artifact", artifactAbs: r.abs });
  const rel = path.relative(rootOf(r.abs, roots), r.abs);
  emit(`[/vac] ${rel} gravado com afirmações sem lastro — corrija o artefato:`, items, ctxOf(input, "check-artifact", { mode: "artifact", target: rel }), text);
  process.exit(0);
}

function fallback(input, blocks, ctx, n) {
  const described = blocks.map((i) => describe(i, ctx.mode));
  store.writePending(input, { prompt_id: input.prompt_id ?? null, items: described });
  store.logEvent("fallback", { ...ctx, tries: n, items: blocks });
  warn(
    `[/vac] ${blocks.length} afirmação(ões) sem lastro continuam depois de ${VAC_RETRIES} tentativas — pendência gravada e reinjetada no próximo prompt (\`/vac log\`): ${described[0].slice(0, 160)}`,
  );
}

function cmdCheckStop(input) {
  const sub = process.argv.includes("--subagent");
  const text = input.last_assistant_message || "";
  if (sub && /vac-verifier/.test(String(input.agent_type || ""))) return stampFrom(text, input);
  if (!text.trim()) process.exit(0);
  const roots = projectRoots(input);
  const gates = loadGates();
  const session = store.loadSession(input);
  const ledger = updateLedger(input, session, { subagent: sub });
  const mode = sub ? "agent" : "stop";
  const items = [
    ...analyze(text, { roots, gates, mode }),
    ...missingStamps(text, roots, gates, session),
    ...ledgerChecks(text, { roots, gates, ledger, input }),
  ];
  const ctx = ctxOf(input, sub ? "check-stop --subagent" : "check-stop", { mode, agent: sub ? { id: input.agent_id, type: input.agent_type } : undefined });
  const blocks = items.filter((i) => i.severity === "block");
  if (!blocks.length) {
    store.clearPending(input);
    if (items.length) store.logEvent("note", { ...ctx, items });
    store.saveSession(input, session);
    process.exit(0);
  }
  const key = input.prompt_id || (sub ? `agent:${input.agent_id || "?"}` : "turn");
  let n = session.blocks?.[key] || 0;
  if (input.stop_hook_active === true && n === 0) n = 1; // outro hook (ou contador perdido) já bloqueou uma vez
  n += 1;
  session.blocks = { ...(session.blocks || {}), [key]: n };
  store.saveSession(input, session);
  if (n > VAC_RETRIES && strict()) return fallback(input, blocks, ctx, n);
  const who = sub ? "retorno do subagente" : "resposta";
  emit(
    `[/vac] Bloqueado antes de encerrar — a ${who} tem afirmações sem lastro (tentativa ${n} de ${VAC_RETRIES}). Corrija e conclua:`,
    items,
    ctx,
    text,
  );
  process.exit(0);
}

function agentReport(input) {
  const r = input.tool_response;
  if (!r) return "";
  if (typeof r === "string") return r;
  const c = r.content;
  if (typeof c === "string") return c;
  if (Array.isArray(c)) return c.map((b) => (typeof b === "string" ? b : (b?.text ?? ""))).join("\n");
  return "";
}

function cmdAgentDone(input) {
  if (input.tool_name !== "Agent") process.exit(0);
  const type = String(input.tool_response?.agentType ?? input.tool_input?.subagent_type ?? "");
  const text = agentReport(input);
  const agentId = text.match(/agentId:\s*([\w-]+)/)?.[1];
  const session = store.loadSession(input);
  if (/vac-verifier/.test(type)) {
    const stopped = agentId && session.agents?.[agentId]?.stopped;
    if (stopped) process.exit(0); // o SubagentStop já carimbou (ou bloqueou) o próprio verificador
    return stampFrom(text, input);
  }
  if (!text.trim() || /Async agent launched successfully/.test(text)) process.exit(0); // background: o relatório chega depois
  const roots = projectRoots(input);
  const gates = loadGates();
  const ledger = updateLedger(input, session, { agentId });
  const items = [...analyze(text, { roots, gates, mode: "agent" }), ...ledgerChecks(text, { roots, gates, ledger, input, agentId })];
  store.saveSession(input, session);
  emit(
    `[/vac] O retorno do subagente (${type || "?"}) tem afirmações sem lastro — não o repasse como fato; confira ou marque o estado real:`,
    items,
    ctxOf(input, "agent-done", { mode: "agent", agent: { id: agentId, type } }),
    text,
  );
  process.exit(0);
}

function cmdStamp(input) {
  return stampFrom(input.last_assistant_message || "", input);
}

// ---------------------------------------------------------------------------
// Linha de comando: toggle, log, caso, scan
// ---------------------------------------------------------------------------

function cmdOn(input) {
  const file = store.turnOn({ cwd: input.cwd || process.cwd(), session: input.session_id ?? null });
  store.logEvent("toggle", { on: true, cwd: input.cwd || process.cwd() });
  process.stdout.write(`[/vac] regime ligado — ${file}\n`);
}

function cmdOff(input) {
  const file = store.turnOff();
  store.logEvent("toggle", { on: false, cwd: input.cwd || process.cwd() });
  process.stdout.write(`[/vac] regime desligado — ${file} removido (os hooks seguem registrados e dormentes)\n`);
}

function cmdStatus() {
  const on = fs.existsSync(store.toggleFile());
  const last = store.readLog({ tail: 5 });
  process.stdout.write(
    [
      `regime: ${on ? "ligado" : "desligado"}${process.env.VAC_ON === "1" ? " (VAC_ON=1)" : ""} · data: ${store.dataDir()}`,
      `carimbos: ${store.countStamps()} · retries por prompt: ${VAC_RETRIES} · strict: ${strict()}`,
      `últimos eventos: ${last.map((e) => `${e.kind}${e.sub ? `(${e.sub})` : ""}`).join(", ") || "nenhum"}`,
    ].join("\n") + "\n",
  );
}

function cmdLog() {
  const entries = store.readLog({ tail: Number(argValue("--tail")) || 20, kind: argValue("--kind"), session: argValue("--session") });
  if (process.argv.includes("--json")) return process.stdout.write(JSON.stringify(entries, null, 2) + "\n");
  if (!entries.length) return process.stdout.write("(log vazio)\n");
  for (const e of entries) {
    const items = (e.items || []).slice(0, 3).map((i) => `    - ${i.rule}: ${i.text}${i.detail ? ` — ${i.detail}` : ""}`);
    process.stdout.write(`${e.id}  ${e.kind}${e.sub ? ` ${e.sub}` : ""}${e.session ? `  sessão ${String(e.session).slice(0, 8)}` : ""}${e.cwd ? `  ${e.cwd}` : ""}\n${items.join("\n")}${items.length ? "\n" : ""}`);
  }
}

function cmdCaso() {
  const id = positional()[0] || "last";
  const entry = id === "last" ? store.readLog({ tail: 1, kind: "block" })[0] : store.findLog(id);
  if (!entry) {
    process.stderr.write(`[/vac] entrada "${id}" não encontrada no log (${store.logFile()})\n`);
    return process.exit(1);
  }
  const slug = (argValue("--slug") || entry.items?.[0]?.rule || "caso").replace(/[^\w-]+/g, "-").toLowerCase();
  const expect = argValue("--expect") || "block";
  const cmd = entry.sub || "check-stop";
  const must = expect === "block" ? (entry.items || []).slice(0, 3).map((i) => i.text) : [];
  const front = {
    cmd,
    expect,
    must,
    class: "a-classificar",
    origin: `log ${entry.id} · sessão ${entry.session ?? "?"} · ${entry.cwd ?? "?"} · ${entry.at}`,
  };
  const body = entry.text || "";
  const fm = Object.entries(front)
    .map(([k, v]) => `${k}: ${typeof v === "string" ? JSON.stringify(v) : JSON.stringify(v)}`)
    .join("\n");
  const sample = `---\n${fm}\n---\n${body}\n`;
  const outDir = argValue("--out") || [path.join(process.cwd(), "plugins/furi-toolbox/skills/vac/scripts/samples"), path.join(HERE, "samples")].find((d) => fs.existsSync(d));
  if (!outDir) return process.stdout.write(sample);
  const n = fs.readdirSync(outDir).filter((f) => /^\d{3}-/.test(f)).length + 1;
  const file = path.join(outDir, `${String(n).padStart(3, "0")}-${slug}.md`);
  fs.writeFileSync(file, sample);
  process.stdout.write(`${file}\n`);
}

function listMd(p, out = []) {
  const st = fs.statSync(p);
  if (st.isFile()) {
    if (p.endsWith(".md")) out.push(p);
    return out;
  }
  for (const d of fs.readdirSync(p, { withFileTypes: true })) {
    if (d.name === "node_modules" || d.name === ".git" || d.name === ".next") continue;
    listMd(path.join(p, d.name), out);
  }
  return out;
}

function cmdScan(input) {
  const json = process.argv.includes("--json");
  const paths = positional();
  if (process.argv.includes("--map")) {
    const roots = projectRoots(input);
    const version = argValue("--version") || transcriptVersion(input.transcript_path);
    const results = paths.map((p) => scanMap(path.resolve(p), { roots, fix: process.argv.includes("--fix"), version }));
    if (json) return process.stdout.write(JSON.stringify(results, null, 2) + "\n");
    for (const r of results) {
      process.stdout.write(r.summary + "\n");
      for (const m of r.moved) process.stdout.write(`  movido  ${m.path}:${m.from} → :${m.to} (§ ${m.heading})\n`);
      for (const a of r.absent) process.stdout.write(`  AUSENTE ${a.path}:${a.at} — ${a.reason} (§ ${a.heading})\n`);
      for (const o of r.outdated) process.stdout.write(`  desatualizado § ${o.heading}: verificado em ${o.was}, agora ${o.now}\n`);
    }
    return;
  }
  const rootArg = argValue("--root");
  const files = paths.flatMap((p) => listMd(path.resolve(p)));
  const results = [];
  for (const abs of files) {
    const roots = rootArg ? [path.resolve(rootArg)] : projectRoots({ cwd: path.dirname(abs) });
    const text = fs.readFileSync(abs, "utf8");
    const items = analyze(text, { roots, mode: "artifact", artifactAbs: abs });
    results.push({ file: abs, items });
  }
  if (json) return process.stdout.write(JSON.stringify(results, null, 2) + "\n");
  const byRule = {};
  let blocked = 0;
  for (const r of results) {
    if (r.items.some((i) => i.severity === "block")) blocked++;
    for (const i of r.items) byRule[`${i.rule}/${i.severity}`] = (byRule[`${i.rule}/${i.severity}`] || 0) + 1;
  }
  process.stdout.write(`${results.length} arquivo(s) · ${blocked} bloqueariam · ${Object.entries(byRule).map(([k, v]) => `${k}=${v}`).join(" · ")}\n`);
  for (const r of results) for (const i of r.items.filter((x) => x.severity === "block").slice(0, 3)) process.stdout.write(`  ${path.relative(process.cwd(), r.file)}: ${describe(i, "artifact")}\n`);
}

function cmdProbe(input) {
  if (process.env.VAC_DEBUG !== "1") process.exit(0);
  store.logEvent("probe", { input });
  process.exit(0);
}

const COMMANDS = {
  card: cmdCard,
  "check-artifact": cmdCheckArtifact,
  "check-stop": cmdCheckStop,
  "agent-done": cmdAgentDone,
  stamp: cmdStamp,
  on: cmdOn,
  off: cmdOff,
  status: cmdStatus,
  log: cmdLog,
  caso: cmdCaso,
  scan: cmdScan,
  probe: cmdProbe,
};

const sub = process.argv[2];
const run = COMMANDS[sub];
if (!run) {
  process.stderr.write(`vac-hook: subcomando desconhecido "${sub}". Use: ${Object.keys(COMMANDS).join(" | ")}\n`);
  process.exit(0); // nunca derruba a sessão por erro de configuração
}
try {
  run(readStdin());
} catch (err) {
  process.stderr.write(`vac-hook ${sub}: ${err?.message ?? err}\n`);
  process.exit(0); // erro interno do hook não bloqueia o modelo
}
