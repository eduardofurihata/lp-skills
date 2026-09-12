// vac-map.mjs — mapas de exploração reusáveis (.claude/vac/*.md), validados por scan.
// Entrada de mapa (contrato):
//   - <fato> — <arquivo>:<linha>[-<fim>] — "<trecho literal>"
//   - <fato> — verificado em: <versão do Claude Code> · <data>
// O scan faz grep do trecho no arquivo: na linha citada → ok; em outra linha → movido
// (com --fix, re-aponta no próprio mapa); em lugar nenhum → ausente (re-explorar só aquele item).
// Zero LLM: é node + string search. O conteúdo do mapa só entra no contexto quando alguém o lê.

import fs from "node:fs";
import path from "node:path";
import { EXT, expandHome } from "./vac-rules.mjs";

const ENTRY_RE = new RegExp(`—\\s*((?:~/|\\.{0,2}/)?[\\w@./-]+\\.(?:${EXT})):(\\d+)(?:-(\\d+))?\\s*—\\s*"(.+)"\\s*$`, "u");
const VERSION_RE = /—\s*verificado em:\s*v?(\d+\.\d+\.\d+)/u;
const HEADING_RE = /^\s{0,3}#{1,6}\s+(.*?)\s*$/;

function resolve(p, roots) {
  const home = expandHome(p);
  if (path.isAbsolute(home)) return fs.existsSync(home) ? home : undefined;
  for (const r of roots) {
    const c = path.join(r, p);
    if (fs.existsSync(c)) return c;
  }
  return undefined;
}

export function scanMap(file, { roots = [process.cwd()], fix = false, version } = {}) {
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  const cache = new Map();
  const res = { file, ok: 0, moved: [], absent: [], outdated: [], entries: 0 };
  let heading = "";
  let changed = false;
  lines.forEach((line, i) => {
    const h = line.match(HEADING_RE);
    if (h) {
      heading = h[1];
      return;
    }
    const v = line.match(VERSION_RE);
    if (v) {
      res.entries++;
      if (version && v[1] !== version) res.outdated.push({ line: i + 1, heading, was: v[1], now: version });
      else res.ok++;
      return;
    }
    const m = line.match(ENTRY_RE);
    if (!m) return;
    res.entries++;
    const [, p, ln, , quote] = m;
    const abs = resolve(p, roots);
    if (!abs) {
      res.absent.push({ line: i + 1, heading, path: p, at: Number(ln), reason: "arquivo não existe" });
      return;
    }
    if (!cache.has(abs)) cache.set(abs, fs.readFileSync(abs, "utf8").split(/\r?\n/));
    const src = cache.get(abs);
    const want = Number(ln);
    if (src[want - 1]?.includes(quote)) {
      res.ok++;
      return;
    }
    const found = src.findIndex((l) => l.includes(quote));
    if (found < 0) {
      res.absent.push({ line: i + 1, heading, path: p, at: want, reason: "trecho não encontrado" });
      return;
    }
    res.moved.push({ line: i + 1, heading, path: p, from: want, to: found + 1 });
    if (fix) {
      lines[i] = line.replace(`${p}:${ln}`, `${p}:${found + 1}`);
      changed = true;
    }
  });
  if (fix && changed) fs.writeFileSync(file, lines.join("\n"));
  const plat = res.outdated.length ? `plataforma desatualizada (${res.outdated[0].was} → ${res.outdated[0].now})` : "plataforma ok";
  res.summary = `mapa ${file}: ${res.ok} ok · ${res.moved.length} movido(s)${fix && changed ? " (re-apontados)" : ""} · ${res.absent.length} ausente(s) · ${plat}`;
  return res;
}

// Todos os mapas de um projeto (.claude/vac/*.md) — para a linha do cartão no SessionStart.
export function listMaps(roots) {
  const out = [];
  for (const r of roots) {
    const dir = path.join(r, ".claude", "vac");
    try {
      for (const f of fs.readdirSync(dir)) if (f.endsWith(".md")) out.push(path.join(dir, f));
    } catch {
      /* sem mapas */
    }
  }
  return [...new Set(out)];
}

export function mapsSummary(roots, { version } = {}) {
  const maps = listMaps(roots);
  if (!maps.length) return "";
  return maps
    .map((m) => {
      try {
        const r = scanMap(m, { roots, version });
        const rel = roots.map((root) => path.relative(root, m)).sort((a, b) => a.length - b.length)[0];
        const size = Math.round(fs.statSync(m).size / 1024);
        const absent = r.absent.length ? ` — ausentes: ${r.absent.map((a) => `${a.path}:${a.at}`).slice(0, 5).join(", ")}` : "";
        return `${r.summary.replace(m, `${rel} (${size} KB)`)}${absent}`;
      } catch (e) {
        return `mapa ${m}: erro ao ler (${e.message})`;
      }
    })
    .join("\n");
}

// Versão do Claude Code registrada no transcript (toda linha traz "version":"x.y.z").
export function transcriptVersion(transcriptPath) {
  try {
    const fd = fs.openSync(transcriptPath, "r");
    const buf = Buffer.alloc(64 * 1024);
    const n = fs.readSync(fd, buf, 0, buf.length, 0);
    fs.closeSync(fd);
    return buf.toString("utf8", 0, n).match(/"version":"(\d+\.\d+\.\d+)"/)?.[1];
  } catch {
    return undefined;
  }
}
