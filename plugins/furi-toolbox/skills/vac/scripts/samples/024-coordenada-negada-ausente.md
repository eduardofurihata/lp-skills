---
cmd: "check-stop"
expect: "pass"
must_not: ["arquivo não existe"]
class: "falso-positivo-mencao"
origin: "prova ao vivo 2026-09-12 (claude -p --plugin-dir, VAC_ON=1): resposta honesta bloqueada por coordenada negada; o retry rebateu a sintaxe para escapar da regex"
fixture: {"files": {"lib/skills.ts": 2}}
---
AUSENTE — não posso citar `lib/nope.ts:3` como fato: `grep -rn "nope" lib/` → sem resultado, e `ls lib/` → apenas `skills.ts`; o arquivo `lib/nope.ts` e a função `nope` não existem neste repo.
