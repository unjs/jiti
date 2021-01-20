let dynamicImport
try {
  dynamicImport = require('./esm').dynamicImport
} catch (_err) {
  // Ignore since syntax is not supported in this environment
}

function onError (err) {
  throw err /* ↓ Check stack trace ↓ */
}

function getJiti (filename, opts) {
  require('../dist/v8cache')
  const jiti = require('../dist/jiti')

  opts = { dynamicImport, onError, ...opts }

  if (!opts.transform) {
    opts.transform = require('../dist/babel')
  }

  return jiti(filename, opts)
}

const addHook = require('pirates').addHook
const hookedJiti = getJiti()

addHook(
  function (code, filename) {
    return hookedJiti.transform({ source: code, filename, ts: filename.match(/.ts$/) })
  },
  { exts: ['.js', '.ts'] }
)

module.exports = getJiti
