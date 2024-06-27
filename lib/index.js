function onError(err) {
  throw err; /* ↓ Check stack trace ↓ */
}

module.exports = function createJiti(filename, opts = {}) {
  const _createJITI = require("../dist/jiti");

  if (!opts.transform) {
    opts.transform = require("../dist/babel");
  }

  const nativeImport = (id) => import(id);

  return _createJITI(filename, opts, {
    onError,
    nativeImport
  });
};
