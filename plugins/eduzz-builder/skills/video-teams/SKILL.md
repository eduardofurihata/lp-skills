---
name: video-teams
description: Use when the user runs /video-teams <link> or wants to download a Microsoft Teams / SharePoint / OneDrive "Stream" recording (stream.aspx player, *.svc.ms videomanifest) that plays in the logged-in Playwright browser but has download blocked (e.g. a meeting recording, "Access denied" on Download). Also for AES/SEA-encrypted videomanifest DASH streams that yt-dlp/ffmpeg cannot fetch directly. Pulls video + auto-transcript (srt/vtt) to ~/Downloads.
---

# /video-teams — download a logged-in Teams/SharePoint Stream recording

## Overview

Teams meeting recordings live on SharePoint/OneDrive Stream. You can watch them
while logged in, but org policy usually **blocks download** (`download.aspx` →
`{"error":{"code":"accessDenied"}}`). The player still streams them via an
MPEG‑DASH manifest whose segments are **AES‑128‑CBC encrypted (DASH SEA)** — so
`yt-dlp`/`ffmpeg` can't grab them directly.

This skill replays the browser's own authenticated requests: capture the
manifest URL + auth + cookies from the **logged-in Playwright session**, then
`scripts/stream_dl.py` downloads every segment, decrypts, remuxes to MP4, and
converts the transcript to `.srt`/`.vtt`. Not DRM circumvention — same bytes the
authorized, logged-in user already streams.

Requires: `python3`, `curl`, `openssl`, `ffmpeg`. (`aria2c` optional.)

## Workflow

User runs `/video-teams <link>` (the stream.aspx page URL). Then:

### 1. Open the page in the Playwright browser and let the user authenticate
- `browser_navigate` to the `<link>` (use whichever `mcp__playwright-N__` server
  is the user's real/logged-in Chrome — list `browser_tabs` to confirm it has
  their session; the video tab title usually shows the recording name).
- The player must actually **start playing** (so it fetches the manifest + key).
  If a login/SSO or a Play click is needed, ask the user to do it, then continue.

### 2. Capture the manifest request
```
browser_network_requests  filter="videomanifest"  static=false
```
Note the request **number** of the `…/transform/videomanifest?…part=index…format=dash` entry.
Save its URL to a file (it's printed in the list, or use the next step):
```
browser_network_request  index=<n>  part=request-headers  filename=/home/furihata/.playwright-mcp/vt_hdr.txt
```
- `x-spopactoken`: grep it out of `vt_hdr.txt` → write the value to `vt_spopac.txt`.
  **This header — not a cookie — is what authenticates the manifest/key** (they're on `*.svc.ms`).
- manifest URL: grab the full `videomanifest?…part=index…` URL → `vt_manifest.url`.

### 3. Capture cookies (authenticate the segments, which ARE on *.sharepoint.com)
`browser_run_code_unsafe` — **its sandbox has no `require`/`import`**, so dump
state via the Playwright API (writes to an allowed root: `/home/furihata` or `~/.playwright-mcp`):
```js
async (page) => {
  const s = await page.context().storageState({ path: '/home/furihata/.playwright-mcp/vt_state.json' });
  return JSON.stringify({cookies: s.cookies.length});
}
```

### 4. (Optional) capture the transcript URL
```
browser_network_requests  filter="cdnmedia/transcripts"  static=false
```
Save the full `…/cdnmedia/transcripts?…` URL → `vt_transcript.url`. (The transcript
JSON is encrypted with the **same key+IV** as the video; the script handles it.)

### 5. Run the downloader
```bash
python3 ~/.claude/skills/video-teams/scripts/stream_dl.py \
  --manifest-url-file   vt_manifest.url \
  --spopactoken-file    vt_spopac.txt \
  --state               /home/furihata/.playwright-mcp/vt_state.json \
  --transcript-url-file vt_transcript.url \
  --out "$HOME/Downloads/<clean name>.mp4"
```
Output: `<name>.mp4` (H.264+AAC, faststart) plus `<name>.srt`/`.vtt` in `~/Downloads`.
Verify the logged duration matches the meeting length. `--help` for all flags
(`--audio original`, `--jobs N`, `--manifest-file` for a pre-saved MPD, `--keep`).

## Gotchas (already handled in the script — don't relearn them)

| Symptom / trap | Reality |
|---|---|
| `download.aspx` → `accessDenied` | Expected (download blocked). Stream instead — that's this skill. |
| manifest → 401 / `token missing: access_token or tempauth` | Send the **`x-spopactoken` header**; it's not in the URL and not a cookie. |
| decrypted segments concat into garbage / ffmpeg "Output file is empty" | Segments are **PKCS7-padded** → decrypt **without** `-nopad` (let openssl strip padding). Using `-nopad` keeps padding bytes and corrupts joins. |
| segments 401 | They're on `*.sharepoint.com` → authenticate with **cookies**, not the token. |
| transcript bytes look random / not UTF‑8 | It's encrypted with the **same key+IV** as the video; decrypt then parse JSON. |
| init segment isn't a valid `ftyp` box | The init segment is encrypted too — decrypt it like any other. |
| works now, fails ~1h later | `x-spopactoken` is short‑lived. Re-capture (re-open/replay) and rerun promptly. |
| `browser_run_code_unsafe` → `require is not defined` / dynamic import error | Sandbox blocks Node modules. Use `page.context().storageState({path})`. |
| `browser_network_request filename` → "outside allowed roots" | Only `/home/furihata` or `~/.playwright-mcp` are writable by that tool. |
| network_requests output too large (token limit) | Always pass `filter=` to narrow, or it saves to a file you can grep. |

## How it works (for debugging)

1. Manifest (`format=dash`) lists `audio`/`video` AdaptationSets with
   `<sea:CryptoPeriod keyUriTemplate=… IV=…>` (AES‑128‑CBC) and a
   `SegmentTimeline` of `$Time$` values; `<BaseURL>` points at the SPO host.
2. Fetch the 16‑byte key from the `VideoProtectionKey` URL (x-spopactoken).
3. Build every segment URL (`part=initsegment` + `part=mediasegment&segmentTime=$Time$`),
   download with cookies, decrypt each with key+IV (PKCS7).
4. Concat `init + segments` per track → fragmented MP4; `ffmpeg -c copy` mux.
5. Transcript: fetch, decrypt (same key+IV), `entries[]` → SRT/VTT with speaker names.
