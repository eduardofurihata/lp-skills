---
cmd: "check-stop"
expect: "block"
must: ["nope.png", "arquivo não existe"]
class: "positivo-verdadeiro"
origin: "template plugins/furi-build/skills/method/references/09-testing.md:308 — `**Screenshot:** <path>`; o hook antigo aceitava a linha como evidência sem conferir o arquivo"
fixture: {"files": {".playwright-mcp/tc1.png": "png"}}
---
## TC-2: texto gerado por IA — ✅ PASSED

**Screenshot:** .playwright-mcp/nope.png
