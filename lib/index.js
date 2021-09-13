let dynamicImport
try {
  dynamicImport = require('./esm').dynamicImport
} catch (_err) {
  // Ignore since syntax is not supported in this environment
}

function onError (err) {
  throw err /* ↓ Check stack trace ↓ */
}

module.exports = function (filename, opts) {
  if (!(opts && opts.v8cache === false) && !process.env.DISABLE_V8_COMPILE_CACHE) {
    // enable v8cache by default
    require('../dist/v8cache')
  }
  const jiti = require('../dist/jiti')

  opts = { dynamicImport, onError, ...opts }

  if (!opts.transform) {
    opts.transform = require('../dist/babel')
  }

  return jiti(filename, opts)
}
