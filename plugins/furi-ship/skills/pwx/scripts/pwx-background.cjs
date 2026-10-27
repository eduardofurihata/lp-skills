// pwx-background.cjs — pré-carregado (NODE_OPTIONS, via pwx) no daemon do playwright-cli e nos scripts de `pwx run`.
// O navegador é headless por padrão (`browser`), e aí nada disto importa. Vale no modo VISÍVEL (`browser show`, a
// pedido do usuário): enquanto ele assiste, sessão nova ou reconexão não arrancam a janela da frente dele.
// O Playwright cria aba com Target.createTarget sem `background`, e no macOS isso traz o navegador para a frente
// a cada sessão nova. Aqui cada sessão nasce numa janela própria em segundo plano: não rouba o foco e a aba,
// sendo a ativa da janela, segue visível (aba de fundo numa janela alheia fica `hidden` e trava o rAF/clique).
// Playwright mudou um dos trechos → aquele ajuste deixa de valer e o resto segue.
const Module = require('module'), path = require('path');
const BUNDLE = path.join('playwright-core', 'lib', 'coreBundle.js');
const FROM = '"Target.createTarget", { url: "about:blank", browserContextId: this._browserContextId }';
const TO = '"Target.createTarget", { url: "about:blank", browserContextId: this._browserContextId, newWindow: true, background: true }';
// `tab-select` (a reconexão do pwx à aba da sessão) chama page.bringToFront(), que no macOS ATIVA o Edge e o
// traz para a frente toda vez que o daemon cai e o pwx volta para a aba. A janela da sessão tem uma aba só, que já
// é a ativa dela: selecionar não precisa trazer nada para a frente.
const SELECT_TAB = /(async selectTab\(index\) \{[\s\S]{0,240}?)await tab2\.page\.bringToFront\(\);/;
const compile = Module.prototype._compile;
Module.prototype._compile = function (content, filename) {
  return compile.call(this, filename.endsWith(BUNDLE) ? content.replace(FROM, TO).replace(SELECT_TAB, '$1') : content, filename);
};
