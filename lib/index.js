let dynamicImport
try {
  dynamicImport = require('./esm').dynamicImport
} catch (_err) {
  // Ignore since syntax is not supported in this environment
}

module.exports = function (filename, opts) {
  require('../dist/v8cache')
  const jiti = require('../dist/jiti')

  opts = { dynamicImport, ...opts }

  if (!opts.transform) {
    opts.transform = require('../dist/babel')
  }

  return jiti(filename, opts)
}
