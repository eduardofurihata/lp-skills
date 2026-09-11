#!/usr/bin/env python3
"""
stream_dl.py — Download a SharePoint / OneDrive / Microsoft Teams "Stream" video
(stream.aspx player, *.svc.ms videomanifest) that you can WATCH while logged in
but cannot download (org "block download" policy).

It does NOT break DRM. It replays the exact authenticated requests the browser
already makes: the streaming manifest + AES segments + the per-video key, then
decrypts the MPEG-DASH SEA (Segment Encryption) segments and remuxes to MP4.
Optionally it also pulls the auto-generated transcript and writes .srt / .vtt.

You (Claude, via the logged-in Playwright browser) must capture 3 things first:
  1. the `videomanifest` request URL   (part=index, format=dash)
  2. the `x-spopactoken` request header of that request
  3. the browser cookies               (Playwright context.storageState JSON)
and optionally the `cdnmedia/transcripts` URL for captions.

Then run e.g.:
  python3 stream_dl.py \
      --manifest-url-file  mf.url \
      --spopactoken-file   spopac.txt \
      --state              state.json \
      --transcript-url-file transcript.url \
      --out "~/Downloads/My Meeting.mp4"

See the stream-dl SKILL.md for how to capture the inputs.

Key gotchas baked in (learned the hard way):
  * Segments are AES-128-CBC with **PKCS7 padding** -> decrypt WITHOUT -nopad.
    (Using -nopad leaves padding bytes and corrupts the concatenation.)
  * Segments are served from the *.sharepoint.com host -> authenticate with COOKIES.
  * The manifest, the key, and the transcript are on *.svc.ms / _api_cached ->
    authenticate with the `x-spopactoken` HEADER (no cookies for that host).
  * The init segment is encrypted too -> decrypt it like any other segment.
  * The transcript JSON is encrypted with the SAME key+IV as the video.
  * Tokens are short-lived (x-spopactoken ~1h) -> run promptly after capture.
"""
import argparse, json, os, re, subprocess, sys, tempfile, shutil
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin
import xml.etree.ElementTree as ET

UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36")
NS = {'d': 'urn:mpeg:DASH:schema:MPD:2011', 'sea': 'urn:mpeg:dash:schema:sea:2012'}
ORIGIN = "https://eduzz-my.sharepoint.com"  # overridden from manifest host at runtime


def log(*a): print("[stream-dl]", *a, flush=True)
def die(msg): log("ERROR:", msg); sys.exit(1)


def read_arg(value, file_path):
    """Return a string from either a literal value or a file (file wins)."""
    if file_path:
        return open(os.path.expanduser(file_path), encoding="utf-8").read().strip()
    return (value or "").strip()


def origin_of(url):
    """scheme://host of a URL, or None."""
    m = re.match(r'(https?://[^/]+)', url or "")
    return m.group(1) if m else None


def spo_origin_from_manifest_url(murl):
    """The svc.ms manifest carries the real SharePoint site inside its docId
    param (url-encoded). The correct Origin header is that SPO site, not svc.ms."""
    from urllib.parse import unquote
    m = re.search(r'doc[iI]d=([^&]+)', murl or "")
    if m:
        return origin_of(unquote(m.group(1)))
    return None


def state_to_netscape(state_path, out_path):
    """Convert a Playwright storageState JSON into a Netscape cookie file
    (curl-compatible, keeps httpOnly cookies via the #HttpOnly_ prefix)."""
    state = json.load(open(os.path.expanduser(state_path), encoding="utf-8"))
    lines = ["# Netscape HTTP Cookie File"]
    for c in state.get("cookies", []):
        dom = c["domain"]
        sub = "TRUE" if dom.startswith(".") else "FALSE"
        sec = "TRUE" if c.get("secure") else "FALSE"
        exp = c.get("expires", 0)
        exp = 0 if (not isinstance(exp, (int, float)) or exp < 0) else int(exp)
        name = ("#HttpOnly_" + dom) if c.get("httpOnly") else dom
        lines.append("\t".join([name, sub, c.get("path", "/"), sec, str(exp),
                                 c["name"], c["value"]]))
    open(out_path, "w", encoding="utf-8").write("\n".join(lines) + "\n")
    return len(state.get("cookies", []))


def curl(url, out, *, cookies=None, spopac=None, compressed=False,
         referer=None, fail=True, retries=6, max_time=120):
    cmd = ["curl", "-sS", "-A", UA, "--retry", str(retries),
           "--retry-delay", "2", "--max-time", str(max_time),
           "-o", out, "-w", "%{http_code}"]
    if fail: cmd.insert(1, "--fail")
    if compressed: cmd.append("--compressed")
    cmd += ["-H", f"Origin: {ORIGIN}", "-H", f"Referer: {referer or ORIGIN + '/'}"]
    if spopac: cmd += ["-H", f"x-spopactoken: {spopac}"]
    if cookies: cmd += ["-b", cookies]
    cmd.append(url)
    r = subprocess.run(cmd, capture_output=True, text=True)
    return r.returncode, (r.stdout or "").strip(), (r.stderr or "").strip()


def openssl_decrypt(src, dst, key_hex, iv_hex, nopad=False):
    cmd = ["openssl", "enc", "-aes-128-cbc", "-d", "-K", key_hex, "-iv", iv_hex,
           "-in", src, "-out", dst]
    if nopad: cmd.append("-nopad")
    r = subprocess.run(cmd, capture_output=True, text=True)
    return r.returncode == 0, r.stderr.strip()


def times_from_timeline(tl):
    times, t = [], 0
    for S in tl.findall('d:S', NS):
        if S.get('t') is not None: t = int(S.get('t'))
        d = int(S.get('d')); r = int(S.get('r', 0))
        for _ in range(r + 1):
            times.append(t); t += d
    return times


def parse_mpd(mpd_path, want_audio):
    root = ET.parse(mpd_path).getroot()
    base_el = root.find('d:BaseURL', NS)
    base = base_el.text.strip() if base_el is not None else ""
    period = root.find('d:Period', NS)
    sets = []
    for aset in period.findall('d:AdaptationSet', NS):
        st = aset.find('d:SegmentTemplate', NS)
        if st is None:
            continue
        reps = aset.findall('d:Representation', NS)
        rep = max(reps, key=lambda r: int(r.get('bandwidth', 0)))  # best quality
        tl = st.find('d:SegmentTimeline', NS)
        cp = aset.find('.//sea:CryptoPeriod', NS)
        lab = aset.find('d:Label', NS)
        sets.append(dict(
            ctype=aset.get('contentType'),
            label=(lab.text if lab is not None else '') or '',
            repid=rep.get('id'),
            init=st.get('initialization'),
            media=st.get('media'),
            times=times_from_timeline(tl) if tl is not None else [],
            keyuri=cp.get('keyUriTemplate') if cp is not None else None,
            iv=cp.get('IV') if cp is not None else None,
        ))
    video = next((s for s in sets if s['ctype'] == 'video'), None)
    audios = [s for s in sets if s['ctype'] == 'audio']
    audio = None
    if audios:
        enh = [a for a in audios if 'enhanc' in a['label'].lower()]
        orig = [a for a in audios if 'original' in a['label'].lower()]
        if want_audio == 'original':
            audio = (orig or enh or audios)[0]
        else:
            audio = (enh or audios)[0]
    return base, video, audio


def build_urls(base, track):
    urls = [urljoin(base, track['init'].replace('$RepresentationID$', track['repid']))]
    for t in track['times']:
        u = track['media'].replace('$RepresentationID$', track['repid']).replace('$Time$', str(t))
        urls.append(urljoin(base, u))
    return urls


def download_all(jobs_list, cookies, jobs):
    """jobs_list = [(outpath, url), ...]. Returns list of failures."""
    fails = []
    def one(out, url):
        if os.path.exists(out) and os.path.getsize(out) > 0:
            return None
        rc, code, err = curl(url, out, cookies=cookies, max_time=120)
        if rc != 0 or code not in ("200", "206"):
            return (out, code, err[:120])
        return None
    with ThreadPoolExecutor(max_workers=jobs) as ex:
        futs = [ex.submit(one, o, u) for o, u in jobs_list]
        for f in as_completed(futs):
            r = f.result()
            if r: fails.append(r)
    return fails


def decrypt_all(files, key_hex, iv_hex, jobs):
    fails = []
    def one(f):
        ok, err = openssl_decrypt(f, f + ".dec", key_hex, iv_hex, nopad=False)
        return None if ok else (f, err[:120])
    with ThreadPoolExecutor(max_workers=jobs) as ex:
        for r in ex.map(one, files):
            if r: fails.append(r)
    return fails


def concat(decfiles, out):
    with open(out, "wb") as w:
        for f in decfiles:
            with open(f, "rb") as r:
                shutil.copyfileobj(r, w)


def ffprobe_duration(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                        "format=duration", "-of", "csv=p=0", path],
                       capture_output=True, text=True)
    try: return float(r.stdout.strip())
    except ValueError: return None


def fmt_ts(t, sep):
    h = int(t // 3600); t -= h * 3600
    m = int(t // 60); t -= m * 60
    s = int(t); ms = int(round((t - s) * 1000))
    if ms == 1000: s += 1; ms = 0
    return f"{h:02d}:{m:02d}:{s:02d}{sep}{ms:03d}"


def transcript_to_subs(dec_json_path, out_base):
    d = json.load(open(dec_json_path, encoding="utf-8"))
    ent = [e for e in d.get('entries', []) if (e.get('text') or '').strip()]
    def sec(s):
        hh, mm, rest = s.split(':'); return int(hh) * 3600 + int(mm) * 60 + float(rest)
    ent.sort(key=lambda e: sec(e['startOffset']))
    with open(out_base + ".srt", "w", encoding="utf-8") as f:
        for i, e in enumerate(ent, 1):
            spk = (e.get('speakerDisplayName') or '').strip()
            txt = e['text'].strip()
            line = f"[{spk}] {txt}" if spk else txt
            f.write(f"{i}\n{fmt_ts(sec(e['startOffset']),',')} --> "
                    f"{fmt_ts(sec(e['endOffset']),',')}\n{line}\n\n")
    with open(out_base + ".vtt", "w", encoding="utf-8") as f:
        f.write("WEBVTT\n\n")
        for e in ent:
            spk = (e.get('speakerDisplayName') or '').strip()
            txt = e['text'].strip()
            body = f"<v {spk}>{txt}" if spk else txt
            f.write(f"{fmt_ts(sec(e['startOffset']),'.')} --> "
                    f"{fmt_ts(sec(e['endOffset']),'.')}\n{body}\n\n")
    return len(ent)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--manifest-url"); ap.add_argument("--manifest-url-file")
    ap.add_argument("--manifest-file", help="pre-fetched MPD (skip fetch)")
    ap.add_argument("--spopactoken"); ap.add_argument("--spopactoken-file")
    ap.add_argument("--state", help="Playwright storageState JSON")
    ap.add_argument("--cookies", help="Netscape cookie file (alt to --state)")
    ap.add_argument("--transcript-url"); ap.add_argument("--transcript-url-file")
    ap.add_argument("--out", required=True)
    ap.add_argument("--workdir")
    ap.add_argument("--audio", choices=["enhanced", "original"], default="enhanced")
    ap.add_argument("--jobs", type=int, default=16)
    ap.add_argument("--keep", action="store_true", help="keep workdir")
    args = ap.parse_args()

    global ORIGIN
    out = os.path.expanduser(args.out)
    os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
    work = args.workdir or tempfile.mkdtemp(prefix="streamdl_")
    segdir = os.path.join(work, "seg"); os.makedirs(segdir, exist_ok=True)
    log("workdir:", work)

    spopac = read_arg(args.spopactoken, args.spopactoken_file)
    if not spopac: die("need --spopactoken / --spopactoken-file")

    # cookies
    cookies = None
    if args.state:
        cookies = os.path.join(work, "cookies.txt")
        n = state_to_netscape(args.state, cookies)
        log(f"cookies: {n} from storageState")
    elif args.cookies:
        cookies = os.path.expanduser(args.cookies)
    else:
        die("need --state or --cookies")

    # 1) manifest
    mpd = os.path.join(work, "manifest.mpd")
    if args.manifest_file:
        shutil.copyfile(os.path.expanduser(args.manifest_file), mpd)
    else:
        murl = read_arg(args.manifest_url, args.manifest_url_file)
        if not murl: die("need --manifest-url / --manifest-url-file / --manifest-file")
        ORIGIN = spo_origin_from_manifest_url(murl) or ORIGIN  # SPO site, not svc.ms
        rc, code, err = curl(murl, mpd, spopac=spopac, max_time=60)
        if code != "200": die(f"manifest fetch http={code} {err}")
    head = open(mpd, "rb").read(64)
    if b"<MPD" not in head and b"<mpd" not in head:
        die(f"manifest is not a DASH MPD (head={head[:40]!r}); check token/URL")
    base, video, audio = parse_mpd(mpd, args.audio)
    ORIGIN = origin_of(base) or ORIGIN  # segments live on the SPO host
    if not video: die("no video AdaptationSet in manifest")
    log(f"video rep={video['repid']} segs={len(video['times'])} "
        f"audio={'%s/%d' % (audio['label'], len(audio['times'])) if audio else 'NONE'}")

    key_hex_iv = (video['keyuri'], video['iv'])
    if not video['keyuri']:
        die("no SEA key URI (video not encrypted? then ffmpeg/yt-dlp may suffice)")
    iv_hex = video['iv'].replace('0x', '').replace('0X', '').strip()

    # 2) key
    keyf = os.path.join(work, "key.bin")
    rc, code, err = curl(video['keyuri'], keyf, spopac=spopac, max_time=60)
    if code != "200" or os.path.getsize(keyf) != 16:
        die(f"key fetch http={code} size={os.path.getsize(keyf) if os.path.exists(keyf) else 0} {err}")
    key_hex = open(keyf, "rb").read().hex()
    log("key OK (16 bytes)")

    # 3) build url lists + download
    vurls = build_urls(base, video)
    aurls = build_urls(base, audio) if audio else []
    jobs_list = [(os.path.join(segdir, f"v_{i:05d}.enc"), u) for i, u in enumerate(vurls)]
    jobs_list += [(os.path.join(segdir, f"a_{i:05d}.enc"), u) for i, u in enumerate(aurls)]
    log(f"downloading {len(jobs_list)} segments (jobs={args.jobs})...")
    fails = download_all(jobs_list, cookies, args.jobs)
    if fails:
        log(f"retrying {len(fails)} failed segments...")
        fails = download_all(jobs_list, cookies, max(4, args.jobs // 2))
    if fails:
        die(f"{len(fails)} segments failed, e.g. {fails[:3]}")
    log("all segments downloaded")

    # 4) decrypt (PKCS7 -> NO -nopad)
    encs = [p for p, _ in jobs_list]
    dfails = decrypt_all(encs, key_hex, iv_hex, args.jobs)
    if dfails: die(f"decrypt failed for {len(dfails)} segs, e.g. {dfails[:3]}")
    log("all segments decrypted")

    # 5) concat per track
    vfmp4 = os.path.join(work, "video.fmp4")
    concat([os.path.join(segdir, f"v_{i:05d}.enc.dec") for i in range(len(vurls))], vfmp4)
    afmp4 = None
    if aurls:
        afmp4 = os.path.join(work, "audio.fmp4")
        concat([os.path.join(segdir, f"a_{i:05d}.enc.dec") for i in range(len(aurls))], afmp4)

    # 6) mux
    cmd = ["ffmpeg", "-y", "-v", "error", "-i", vfmp4]
    if afmp4: cmd += ["-i", afmp4]
    cmd += ["-map", "0:v:0"]
    if afmp4: cmd += ["-map", "1:a:0"]
    cmd += ["-c", "copy", "-movflags", "+faststart", out]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0: die(f"ffmpeg mux failed: {r.stderr[:300]}")
    dur = ffprobe_duration(out)
    log(f"MUXED -> {out}  ({os.path.getsize(out)//(1024*1024)} MB, "
        f"{int(dur//60)}m{int(dur%60)}s)" if dur else f"MUXED -> {out}")

    # 7) transcript (optional)
    turl = read_arg(args.transcript_url, args.transcript_url_file)
    if turl:
        traw = os.path.join(work, "transcript.enc")
        rc, code, err = curl(turl, traw, cookies=cookies, spopac=spopac,
                             compressed=True, max_time=60)
        if code == "200":
            tdec = os.path.join(work, "transcript.json")
            ok, e = openssl_decrypt(traw, tdec, key_hex, iv_hex, nopad=False)
            if not ok:  # maybe not encrypted
                shutil.copyfile(traw, tdec)
            try:
                n = transcript_to_subs(tdec, os.path.splitext(out)[0])
                log(f"transcript -> .srt/.vtt ({n} cues)")
            except Exception as ex:
                log(f"WARN: could not parse transcript: {ex}")
        else:
            log(f"WARN: transcript fetch http={code}")

    if not args.keep:
        shutil.rmtree(work, ignore_errors=True)
        log("cleaned workdir")
    log("DONE")


if __name__ == "__main__":
    main()
