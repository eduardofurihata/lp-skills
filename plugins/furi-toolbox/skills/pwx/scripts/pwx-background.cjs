// pwx-background.cjs — pré-carregado no daemon do playwright-cli (NODE_OPTIONS, via pwx).
// O Playwright cria aba com Target.createTarget sem `background`, e no macOS isso traz o navegador para a frente
// a cada sessão nova. Aqui a aba nasce em segundo plano; Playwright mudou o trecho → segue sem o ajuste.
const Module = require('module'), path = require('path');
const BUNDLE = path.join('playwright-core', 'lib', 'coreBundle.js');
const FROM = '"Target.createTarget", { url: "about:blank", browserContextId: this._browserContextId }';
const TO = '"Target.createTarget", { url: "about:blank", browserContextId: this._browserContextId, background: true }';
const compile = Module.prototype._compile;
Module.prototype._compile = function (content, filename) {
  return compile.call(this, filename.endsWith(BUNDLE) ? content.replace(FROM, TO) : content, filename);
};
