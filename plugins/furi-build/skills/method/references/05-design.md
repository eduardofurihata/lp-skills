# Step 5 — Design

**Como cada tela deveria ser — decidida antes de qualquer código, pelo designer que o `/front` descreve.** Só roda com superfície visual (Step 4); sem ela, o próximo é o 6. O Step 4 decide arquitetura; a tela e o DS se decidem aqui — e formulário preenchido não é tela desenhada. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Invocar o `/solve` via Skill tool — ele traz o `/front`, o corpo deste step
- [ ] Ler `docs/05-design/design-system.md` — sem DS, a primeira feature o funda com o mínimo que os UCs exigem
- [ ] Decidir cada tela que os UCs atravessam — tela sem UC não entra
- [ ] Nomear a aposta de design e a referência de mercado de cada tela; desvio de padrão consagrado leva motivo escrito
- [ ] Decidir o que cada tela reusa, compõe ou promove ao DS
- [ ] Desenhar todos os estados, WCAG AA e os breakpoints do projeto (piso 320px)
- [ ] Elevar aqui o padrão do DS que está abaixo do nível no perímetro da feature — não se copia adiante
- [ ] Registrar agora as promoções em `docs/05-design/design-system.md`, único e cumulativo — o 8b só usa
- [ ] Atualizar em `docs/05-design/` os arquivos do Roteamento, no presente (`00-start.md` § Doc vivo) — no formato que melhor comunica a decisão: prosa, croqui ou lista
- [ ] Publicar o Gateway Check 5 → 6 com as linhas obrigatórias (`SKILL.md` § Gateway Check)
