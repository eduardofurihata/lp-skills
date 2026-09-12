// vac-store.mjs — tudo que o /vac persiste fora do repositório-alvo, num lugar só.
//   <data>/vac/on                      toggle do regime (existe = ligado)
//   <data>/vac/log.jsonl               uma linha por bloqueio/bypass/fallback/carimbo/nota
//   <data>/vac/stamps/<sha256>.ok      carimbo do verificador por hash do artefato
//   <data>/vac/sessions/<id>.json      índice da sessão (bloqueios por prompt, ledger, carimbos de sessão)
//   <data>/vac/pending/<id>.json       pendência do fallback, reinjetada no próximo cartão
// <data> = --data <dir> | $CLAUDE_PLUGIN_DATA | ~/.claude/vac-data  (nunca o repo).

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

function argValue(flag) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

export function dataDir() {
  const fromArg = argValue("--data");
  // Um diretório só: os hooks (que recebem CLAUDE_PLUGIN_DATA no env) e o modelo (que roda on/off/log/status via Bash, sem
  // a variável) precisam ler e escrever no mesmo lugar — senão o log some do `/vac log` e o toggle não é visto.
  const candidates = [fromArg, path.join(os.homedir(), ".claude", "vac-data")];
  const dir = candidates.find((c) => c && !c.startsWith("${") && c.trim());
  return path.join(dir, "vac");
}

function ensure(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(file, obj) {
  ensure(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(obj));
}

// --- toggle -----------------------------------------------------------------

export function toggleFile() {
  return path.join(dataDir(), "on");
}
export function isOn() {
  return process.env.VAC_ON === "1" || fs.existsSync(toggleFile());
}
export function turnOn(info = {}) {
  writeJson(toggleFile(), { at: new Date().toISOString(), ...info });
  return toggleFile();
}
export function turnOff() {
  try {
    fs.unlinkSync(toggleFile());
  } catch {
    /* já desligado */
  }
  return toggleFile();
}

// --- log ---------------------------------------------------------------------

const LOG_MAX = 5 * 1024 * 1024;
export function logFile() {
  return path.join(dataDir(), "log.jsonl");
}

export function logEvent(kind, payload = {}) {
  try {
    const file = logFile();
    ensure(path.dirname(file));
    try {
      if (fs.statSync(file).size > LOG_MAX) fs.renameSync(file, file.replace(/\.jsonl$/, ".1.jsonl"));
    } catch {
      /* sem log ainda */
    }
    const at = new Date().toISOString();
    const id = `${at}-${crypto.randomBytes(2).toString("hex")}`;
    const entry = { id, at, kind, ...payload };
    if (typeof entry.text === "string" && entry.text.length > 32 * 1024) entry.text = entry.text.slice(0, 32 * 1024);
    fs.appendFileSync(file, JSON.stringify(entry) + "\n");
    return entry;
  } catch {
    return undefined; // log nunca derruba o hook
  }
}

export function readLog({ tail = 20, kind, session } = {}) {
  const file = logFile();
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, "utf8").split("\n").filter(Boolean);
  const entries = [];
  for (let i = lines.length - 1; i >= 0 && entries.length < tail; i--) {
    let e;
    try {
      e = JSON.parse(lines[i]);
    } catch {
      continue;
    }
    if (kind && e.kind !== kind) continue;
    if (session && e.session !== session) continue;
    entries.push(e);
  }
  return entries.reverse();
}

export function findLog(id) {
  const file = logFile();
  if (!fs.existsSync(file)) return undefined;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    if (!line.includes(`"id":"${id}"`)) continue;
    try {
      return JSON.parse(line);
    } catch {
      /* linha quebrada */
    }
  }
  return undefined;
}

// --- carimbos ---------------------------------------------------------------

export function stampFile(hash) {
  return path.join(dataDir(), "stamps", `${hash}.ok`);
}
export function readStamp(hash) {
  const file = stampFile(hash);
  if (!fs.existsSync(file)) return undefined;
  return readJson(file, {});
}
export function writeStamp(hash, info) {
  writeJson(stampFile(hash), info);
  return stampFile(hash);
}
export function countStamps() {
  try {
    return fs.readdirSync(path.join(dataDir(), "stamps")).filter((f) => f.endsWith(".ok")).length;
  } catch {
    return 0;
  }
}

// --- sessão -----------------------------------------------------------------

export function sessionKey(input = {}) {
  return String(input.session_id || "anon").replace(/[^\w.-]/g, "_");
}
export function sessionFile(input) {
  return path.join(dataDir(), "sessions", `${sessionKey(input)}.json`);
}
export function loadSession(input) {
  return readJson(sessionFile(input), { blocks: {}, stamps: [] });
}
export function saveSession(input, idx) {
  writeJson(sessionFile(input), idx);
}

// --- pendência (fallback) ---------------------------------------------------

export function pendingFile(input) {
  return path.join(dataDir(), "pending", `${sessionKey(input)}.json`);
}
export function readPending(input) {
  return readJson(pendingFile(input), undefined);
}
export function writePending(input, info) {
  writeJson(pendingFile(input), { at: new Date().toISOString(), ...info });
}
export function clearPending(input) {
  try {
    fs.unlinkSync(pendingFile(input));
  } catch {
    /* nada pendente */
  }
}
