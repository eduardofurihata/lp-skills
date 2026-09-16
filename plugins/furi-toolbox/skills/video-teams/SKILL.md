---
name: video-teams
description: 'Use when the user runs /video-teams <link> to download a Microsoft Teams / SharePoint / OneDrive "Stream" recording (stream.aspx, *.svc.ms videomanifest) that plays in the logged-in Playwright browser but has download blocked — AES/SEA-encrypted DASH that yt-dlp/ffmpeg cannot fetch. Pulls video + transcript (srt/vtt) to ~/Downloads.'
disable-model-invocation: true
---

# /video-teams

Download is blocked (`download.aspx` → `accessDenied`), but the player streams an MPEG-DASH manifest with **AES-128-CBC (DASH SEA)** segments. This skill replays the browser's own authenticated requests — manifest URL + auth header + cookies from the **logged-in Playwright session** — and `scripts/stream_dl.py` downloads, decrypts, remuxes to MP4 and converts the transcript. Same bytes the authorized user already streams.

Requires `python3`, `curl`, `openssl`, `ffmpeg` (`aria2c` optional).

## Workflow — `/video-teams <link>`

1. **Play it in the logged-in browser** — `browser_navigate` on the `mcp__playwright-N__` server that holds the user's real session (`browser_tabs` confirms). It must actually **start playing** (that fetches manifest + key); login or Play click → ask the user.
2. **Capture the manifest.** `browser_network_requests filter="videomanifest" static=false` → the `…part=index…format=dash` entry; `browser_network_request index=<n> part=request-headers filename=<OUT>/vt_hdr.txt`, where `<OUT>` is the Playwright MCP output dir (default `~/.playwright-mcp`) as a **literal absolute path**. From it: `x-spopactoken` → `vt_spopac.txt` (**this header, not a cookie, authenticates manifest and key**); the full manifest URL → `vt_manifest.url`.
3. **Capture cookies** (they authenticate the segments): `browser_run_code_unsafe` with `async (page) => { await page.context().storageState({ path: '<OUT>/vt_state.json' }); }` — the sandbox has no `require`/`import`.
4. **Transcript (optional).** `browser_network_requests filter="cdnmedia/transcripts" static=false` → full URL → `vt_transcript.url`.
5. **Run the downloader** from the skill dir (`scripts/stream_dl.py` is relative to it):
   ```bash
   python3 scripts/stream_dl.py --manifest-url-file vt_manifest.url --spopactoken-file vt_spopac.txt \
     --state "$HOME/.playwright-mcp/vt_state.json" --transcript-url-file vt_transcript.url \
     --out "$HOME/Downloads/<clean name>.mp4"
   ```
   Verify the logged duration matches the meeting; `--help` lists the other flags.

## Gotchas the script already handles — don't relearn

| Trap | Reality |
|---|---|
| manifest → 401 / `token missing` | Send the `x-spopactoken` **header**; segments → 401 means **cookies**, not the token. |
| decrypted segments concat into garbage | PKCS7: decrypt **without** `-nopad`. Init segment and transcript are encrypted too (same key+IV). |
| works now, fails ~1h later | `x-spopactoken` is short-lived — re-capture and rerun promptly. |
| `filename` → "outside allowed roots" | Only the project cwd and `<OUT>` are writable, as literal absolute paths. Always pass `filter=` to `network_requests`. |
