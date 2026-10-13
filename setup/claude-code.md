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
- **Clique** leva ao app de onde a sessão roda: numa IDE, a janela **daquele projeto** e o **terminal daquela sessão** (mesmo com vários Claude abertos na janela); num ADE com abas de agente (Orca), a **aba/pane daquela sessão**; num terminal, o app do terminal.
- Vale para **toda** sessão do Claude Code CLI, em qualquer terminal ou IDE. A config é global, não por projeto.
- Passa pelo Não Perturbe / Foco: o notificador é exceção, o resto continua silenciado.
- Nunca atrasa nem bloqueia o Claude. Se falhar, falha calada.

**Pronto quando.** Com outro app em foco:
- os quatro casos tocam o som certo e mostram o banner na tela, não só na Central;
- os banners somem no tempo certo;
- o clique volta à janela do projeto e ao terminal exato da sessão, com dois Claude abertos na mesma janela;
- o mesmo vale no Orca: com duas sessões em abas diferentes, o clique cai na aba de quem notificou, e a IDE continua funcionando igual.

**Armadilhas já pagas.**
- *macOS.* Com Não Perturbe ativo, tudo cai calado na Central: o banner nunca aparece, mesmo com permissão dada.
- *macOS.* O tempo do banner não é configurável: "Temporário" some em ~5 s e "Persistente" fica até o clique. Para ter ~5 min, use Persistente e remova a notificação por conta própria.
- *Auto-dismiss.* Cada timer só remove se ainda for o da notificação mais recente da sessão; sem isso, o timer de uma notificação antiga apaga a nova segundos depois de ela aparecer.
- *macOS.* A notificação nativa do `osascript` não serve: o clique abre o Script Editor.
- *macOS.* O notificador nasce com notificações bloqueadas. É preciso liberar em Ajustes → Notificações.
- *IDE (VS Code e forks).* Abrir a pasta só foca a janela, não o terminal. Escolher o terminal exige algo dentro da IDE (uma extensão) que ache o terminal pelo processo da sessão.
- *Linux/KDE.* O clique precisa de uma ação na notificação e de algo que foque a janela por classe.
- *ADE (Orca).* Só ativar o app abre a última aba vista, não a da sessão. Cada app hospedeiro precisa do seu ramo: identifique o hospedeiro pelo app que lançou a sessão e use o jeito dele de focar a aba (no Orca, o próprio CLI, com o identificador do terminal que ele injeta na sessão). Um ramo novo não pode mexer no das IDEs.

---

## 2. Navegador: pwx, uma janela por sessão

**Intenção.** O Claude usa um navegador real, já logado, sem me atrapalhar: não aparece onde não pedi, não rouba o foco e não deixa janela nem navegador para trás.

**Comportamento esperado.**
- Um navegador de automação por **papel**, que é uma conta/login. Os logins ficam salvos no perfil do papel e valem para todas as sessões.
- Cada sessão do Claude ganha **uma** janela por papel que usa, aberta em segundo plano. Nenhuma outra janela: nada de janela inicial vazia nem aba sem dono.
- A janela da sessão fecha quando a sessão acaba: `/exit`, terminal ou janela do app fechados, ou crash.
- O navegador do papel **fecha sozinho** quando fica sem janela de sessão e sem aba minha. O próximo uso o religa em segundos, ainda logado. Uma aba que eu abri nele o mantém ligado.
- Um comando nunca age na janela de outra sessão. Se a janela da sessão sumiu, ela é reaberta antes do comando.
- Toda sessão começa sabendo que o navegador da máquina é o `pwx` e recolhe janelas órfãs de sessões que morreram.
- Papel novo só para um login que nenhum papel tem.

**Pronto quando.**
- Sem nenhuma sessão usando o pwx, não há navegador de automação de pé.
- Uma sessão que abre uma página mostra exatamente 1 janela, em segundo plano.
- Fechar o terminal da sessão fecha a janela dela e, se era a última daquele papel, o navegador também. Ao reabrir, não aparece "Restaurar páginas?".
- Duas sessões no mesmo papel: fechar uma não mexe na janela da outra.
- Fechar a janela da sessão à mão e mandar outro comando reabre a janela da própria sessão.
- Uma aba aberta por mim no navegador de automação o mantém ligado depois que as sessões acabam.

**Armadilhas já pagas.**
- *Chromium.* Ele abre uma janela inicial vazia ao ligar, que não pertence a nenhuma sessão. Ligue sem janela inicial.
- *playwright-cli.* Num navegador sem nenhuma aba, conectar já cria uma. Essa aba é a janela da sessão; abrir outra dobra as janelas.
- *playwright-cli.* Quando a aba da sessão some, a "aba atual" do daemon passa para outra aba qualquer, inclusive a de outra sessão. Confira a janela registrada antes de cada comando.
- *macOS.* O app continua vivo sem nenhuma janela. Encerrar o navegador ocioso é trabalho do pwx.
- *Encerrar.* Matar o processo marca o perfil como travado, e a próxima abertura pede "Restaurar páginas?". Encerre pelo protocolo do navegador (CDP `Browser.close`).
- *Foco.* Aba nova criada sem `background` traz o navegador para a frente. Aba de fundo numa janela alheia fica `hidden` e trava clique e animação. Por isso cada sessão tem uma janela própria em segundo plano.
- *Corrida.* Um navegador que acabou de ligar ainda não tem janela registrada. O recolhimento de ociosos tem de esperar a conexão em andamento terminar.
- *Hooks.* O hook de fim de sessão roda sem nvm no PATH, então o node vai com caminho absoluto. Ele também tem tempo limite, então vários navegadores ociosos fecham em paralelo.
- *Instalação.* A cópia instalada não se atualiza com o plugin. Depois de atualizar a skill, rode o instalador dela de novo.

---

## 3. O resto do setup (intenções já em uso)

- **Plugins:** marketplace `lp-skills` (furi-build, furi-ship, furi-toolbox) e os da Eduzz/AFL instalados, todos com **auto-update ligado**.
- **Permissões:** modo bypass por padrão, sem o diálogo de confirmação.
- **Effort:** definido por modelo, não forçado globalmente.
- **Atalhos:** `claude` / `claudew` no terminal e os perfis "Claude" / "Claude Ultra" nas IDEs. Ver `/claude-shortcuts`.

---

## 4. Onde está implementado hoje (referência, não instrução)

| Máquina | Notificações |
|---|---|
| Mac | `~/.claude/hooks/notify.sh` + terminal-notifier + extensão `furi.focus-terminal` na IDE (URI com os PIDs da sessão); no Orca (`com.stablyai.orca`), `orca terminal switch --terminal $ORCA_TERMINAL_HANDLE`; hooks `Stop`, `PreToolUse` (AskUserQuestion\|ExitPlanMode), `Notification` (permissão) |
| Nobara (antigo) | `~/.claude/hooks/claude-notify.sh` + notify-send; hooks `Stop`, `PreToolUse` (AskUserQuestion, ExitPlanMode) |

**Navegador (pwx).** Skill `furi-ship:pwx`: `scripts/install.sh` instala `pwx`/`browser` em `~/.local/bin` e os hooks `SessionStart` (`pwx gc`) e `SessionEnd` (`pwx close-tab`); Edge com `--no-startup-window`, um perfil e uma porta CDP por papel (`~/.browser-automation/config.json`).
