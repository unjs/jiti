module.exports = function (filename, opts) {
  require('./dist/v8cache')
  const jiti = require('./dist/jiti')

  opts = { ...opts }

  if (!opts.transform) {
    opts.transform = require('./dist/babel')
  }

  return jiti(filename, opts)
}
