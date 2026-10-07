# Claude Code — o padrão da minha máquina

O que eu espero do Claude Code em **qualquer** máquina. Descreve o **quê**, nunca o **como**: o como depende do SO e de quem implementa. Quem for montar uma máquina nova (eu ou um agente) lê isto, implementa do jeito certo para aquele SO e só considera pronto quando o critério de cada item passa.

Repo público: aqui entram só intenções. Nunca token, caminho de credencial ou dado de cliente.

---

## 1. Notificações: o Claude me chama quando é a minha vez

**Intenção.** Mando uma tarefa e vou fazer outra coisa. Não fico olhando o terminal: o sistema me avisa quando o Claude precisa de mim, e um clique me põe de volta no lugar certo.

**Quando dispara.** Sempre que a vez passa para mim:

| Situação | Mensagem | Som | Some em |
|---|---|---|---|
| Terminou a resposta | Resposta concluída | "concluído" | ~5 min |
| Pergunta (Ask tool) | ❓ Preciso da sua resposta | "pergunta" | ~5 min |
| Plano pronto (plan mode) | 📋 Plano pronto — aprova? | "pergunta" | ~5 min |
| Pedindo permissão | a mensagem do próprio Claude | "pergunta" | ~5 min |

**Comportamento esperado.**
- Pergunta e plano avisam **na hora** em que aparecem, sem esperar o tempo ocioso.
- O título traz o **nome do projeto**.
- Há dois sons distintos: "terminou" e "precisa de você". Dá para saber qual é sem olhar.
- Uma notificação nova da mesma **sessão** substitui a anterior, sem empilhar. Duas sessões no mesmo projeto não se apagam.
- Some sozinha no tempo da tabela. Não pode sumir em 5 s (curto demais) nem ficar para sempre.
- **Clique** leva ao app de onde a sessão roda: numa IDE, a janela **daquele projeto** e o **terminal daquela sessão** (mesmo com vários Claude abertos na janela); num terminal, o app do terminal.
- Vale para **toda** sessão do Claude Code CLI, em qualquer terminal ou IDE. A config é global, não por projeto.
- Passa pelo Não Perturbe / Foco: o notificador é exceção, o resto continua silenciado.
- Nunca atrasa nem bloqueia o Claude. Se falhar, falha calada.

**Pronto quando.** Com outro app em foco:
- os quatro casos tocam o som certo e mostram o banner na tela, não só na Central;
- os banners somem no tempo certo;
- o clique volta à janela do projeto e ao terminal exato da sessão, com dois Claude abertos na mesma janela.

**Armadilhas já pagas.**
- *macOS.* Com Não Perturbe ativo, tudo cai calado na Central: o banner nunca aparece, mesmo com permissão dada.
- *macOS.* O tempo do banner não é configurável: "Temporário" some em ~5 s e "Persistente" fica até o clique. Para ter ~5 min, use Persistente e remova a notificação por conta própria.
- *Auto-dismiss.* Cada timer só remove se ainda for o da notificação mais recente da sessão; sem isso, o timer de uma notificação antiga apaga a nova segundos depois de ela aparecer.
- *macOS.* A notificação nativa do `osascript` não serve: o clique abre o Script Editor.
- *macOS.* O notificador nasce com notificações bloqueadas. É preciso liberar em Ajustes → Notificações.
- *IDE (VS Code e forks).* Abrir a pasta só foca a janela, não o terminal. Escolher o terminal exige algo dentro da IDE (uma extensão) que ache o terminal pelo processo da sessão.
- *Linux/KDE.* O clique precisa de uma ação na notificação e de algo que foque a janela por classe.

---

## 2. O resto do setup (intenções já em uso)

- **Plugins:** marketplace `lp-skills` (furi-build, furi-ship, furi-toolbox) e os da Eduzz/AFL instalados, todos com **auto-update ligado**.
- **Permissões:** modo bypass por padrão, sem o diálogo de confirmação.
- **Effort:** definido por modelo, não forçado globalmente.
- **pwx:** toda sessão já começa sabendo que o navegador da máquina é o `pwx`; ao encerrar a sessão, a aba do navegador daquela sessão fecha sozinha.
- **Atalhos:** `claude` / `claudew` no terminal e os perfis "Claude" / "Claude Ultra" nas IDEs. Ver `/claude-shortcuts`.

---

## 3. Onde está implementado hoje (referência, não instrução)

| Máquina | Notificações |
|---|---|
| Mac | `~/.claude/hooks/notify.sh` + terminal-notifier + extensão `furi.focus-terminal` na IDE (URI com os PIDs da sessão); hooks `Stop`, `PreToolUse` (AskUserQuestion\|ExitPlanMode), `Notification` (permissão) |
| Nobara (antigo) | `~/.claude/hooks/claude-notify.sh` + notify-send; hooks `Stop`, `PreToolUse` (AskUserQuestion, ExitPlanMode) |
