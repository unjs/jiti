/**
 * Transpiled by esbuild: https://hyrious.me/esbuild-repl/?version=0.25.3&t=export+function+fn%28%29+%7B%7D&o=--format%3Dcjs
 *
 * Original ESM code:
 * ```js
 * export function fn() {}
 * ```
 *
 * Transpiled CJS code: ↓↓↓
 */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === "object") || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toCommonJS = (mod) =>
  __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var stdin_exports = {};
__export(stdin_exports, {
  fn: () => fn,
});
module.exports = __toCommonJS(stdin_exports);
function fn() {}
