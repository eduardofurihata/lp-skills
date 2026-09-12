# Racionalizações — as que levam a inventar

> Só as que as outras skills **ainda não** cobrem. As de pular step, adiar, "é trivial", "sou tech lead" e "PASSED sem screenshot" já moram em `plugins/furi-build/skills/method/references/rationalizations.md` e continuam valendo — o `/vac` não as repete.

| Pensamento | Por que é alucinação | O que fazer |
|---|---|---|
| "O arquivo existe, eu criei no step anterior" | Criar não é existir agora: o usuário edita em paralelo, a compactação apagou o que você lembra, o `Write` pode ter falhado | `ls` / Glob nesta janela → `[VERIFICADO] tool: Glob → 1 arquivo` |
| "Essa função é padrão do framework" | A versão instalada não é a da sua memória de treino (`AGENTS.md` deste repo abre com "este NÃO é o Next.js que você conhece") | `node_modules/<pkg>/…` aberto, ou doc lida → coordenada; senão `[INFERIDO]` |
| "Li o reference agora há pouco" | Depois de uma compactação, "há pouco" é um resumo; em subagente, nunca foi lido | Read de novo, nesta janela |
| "tsc passou" / "lint passou" | Sem a saída colada é uma frase, não um resultado | `` `pnpm typecheck` → "Found 0 errors" `` |
| "grep feito, não existe" | Grep sem resultado transcrito é grep imaginado | `[AUSENTE] \`grep -rn X src/\` → 0 resultados` |
| "Último ciclo sem mudanças de código ✅" | Só o `git status` sabe | `` `git status --short` → (vazio) `` |
| "O diff está vazio, não há o que revisar" | `git diff main...HEAD` é vazio para trabalho **não-commitado** — que é o caso normal antes do Step 10 | `git status --short && git diff` (working tree) — diff vazio nos dois = **nada a revisar ≠ revisado** |
| "O template já vem com ✅, é só publicar" | Template pré-preenchido é a alucinação já digitada | Cada ✅ ganha evidência ou vira o estado real |
| "Escrevo 'não rodei X' no fim e libero o ✅ de cima" | Disclosure conserta a mentira, não o ✅ (`09-testing.md` § Disclosure ≠ compliance) | O ✅ vira `[INDISPONÍVEL]` na própria linha |
| "A referência #1 do mercado faria assim" | Você não abriu o produto do concorrente; é dedução | `[INFERIDO] de <o que você viu>; confirma-se por <como>` |
| "O screenshot está em `…/tc3.png`" | Path escrito de memória; o arquivo pode não existir (2 das 4 features "10/10" deste repo perderam a evidência) | O path que a ferramenta **retornou**, conferido com `ls` |
| "Invoquei o `/solve`" (sem chamada) | Mencionar não é invocar — a chamada `Skill` visível é a evidência | Invoca. Agora. |
| "Escrevo o carimbo do verificador eu mesmo" | O carimbo é o hook que grava, com o hash do arquivo — texto seu não vale | `/vac <artefato>` e espere o relatório |
| "O `/vac` está deixando tudo lento / verboso" | O cartão custa ~250 tokens por prompt; o verificador roda só em gate. Verboso é escrever prosa no lugar do estado | Estado + evidência é **mais curto** que a prosa que ele substitui |
| "Vou desligar o `/vac` só neste step" | Não há `/vac off` por desenho: regime é a sessão inteira | Se o hook errou (falso positivo), `VAC_STRICT=0` — e reporte a linha para afinar o marcador |

**PARE se pensar:** "existe, eu lembro" · "é padrão, todo mundo sabe" · "li há pouco" · "passou, confia" · "o template já diz ✅" · "escrevo no fim que não rodei" · "o líder faz assim" · "o path é esse mesmo" · "já conheço, sigo sem invocar" · "carimbo eu boto" · "desligo só agora".
