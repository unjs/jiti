module.exports = function (filename = process.cwd(), opts = {}) {
  require('./dist/v8cache')
  const jiti = require('./dist/jiti')

  if (!opts.transform) {
    opts.transform = require('./dist/babel')
  }

  return jiti(filename, opts)
}
