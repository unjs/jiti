module.exports = function (filename = process.cwd(), opts = {}) {
  const jiti = require('./dist/jiti')

  if (!opts.transform) {
    opts.transform = require('./dist/babel')
  }

  return jiti(filename, opts)
}
