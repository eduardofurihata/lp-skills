# Step 5 — Design

**Como cada tela deveria ser — decidida antes de qualquer código, pelo designer que o `/front` descreve.** Só roda com superfície visual (derivada no Step 4); sem ela, o Gateway 4 → 5 já declarou N/A e o próximo step é o 6.

**Chame e use:** `/solve` via Skill tool

**O corpo deste step é o `/front`.** Ele chega pelo `/solve`; desenhe como ele manda — criativo, inovador, moderno, premium, no nível da referência #1 do domínio, com o design system como lei e como coisa que cresce. Este reference não diz como a tela deve ser: diz onde a decisão fica registrada e o que o gateway confere. Formulário preenchido não é tela desenhada.

## Artefato

`docs/05-design/<tópico>.md` — nome por domínio; doc que já cobre o domínio se **atualiza**, não se duplica (`00-start.md`). Toda tela que os UCs (Step 3) atravessam está aqui; tela sem UC não entra. Cada uma sai **decidida**: o que ela é, a aposta de design que carrega, a referência de mercado que a inspira, o que reusa, compõe ou **promove** ao DS. Prosa, croqui, lista — o formato é o que melhor comunica a decisão; o que não pode faltar é o que o `/front` cobra.

`docs/05-design/design-system.md` — **único e cumulativo**, vive entre features: cada uma lê, usa e faz crescer. Projeto sem DS? A primeira feature o **funda** com o mínimo que os UCs exigem. O que este step promove entra nele **agora** — o 8b só usa. Padrão do DS abaixo do nível no perímetro desta feature: **eleva** aqui — não se copia adiante.

## PARE se pensar

- **"Resolvo o design dentro do Spec, o Step 5 é formalidade."** O Step 4 decide arquitetura; a tela e o DS se decidem **aqui**, em `docs/05-design/`. Pular = a tela nasce no 8b sem DS e sem estados. BLOQUEADO.
- **"Preenchi os campos, está desenhado."** Campo preenchido não é decisão de design. A régua é o `/front`: a tela sai como um designer sênior a assinaria, ou não saiu. BLOQUEADO.

## Gateway 5 → 6

- [ ] `docs/05-design/<tópico>.md` decide **toda tela** que os UCs atravessam, cobrada pelos guarda-chuvas do `/front` — DS reusado, composto ou promovido; consistência elevada; **todos os estados**, **WCAG AA** e **breakpoints do projeto** (piso 320px) desenhados
- [ ] Referência de mercado nomeada; desvio de padrão consagrado com motivo escrito
- [ ] `docs/05-design/design-system.md` inventariado, com as **promoções já registradas**
- [ ] Follow-up que apareceu aqui, resolvido aqui — nada se caça
- [ ] As **quatro linhas obrigatórias** publicadas (`SKILL.md` § Gateway Check)
