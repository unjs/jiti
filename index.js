module.exports = function (filename, opts) {
  require('./dist/v8cache')
  const jiti = require('./dist/jiti')

  opts = { ...opts }

  if (!opts.transform || typeof opts.transform === 'string') {
    switch (opts.transform) {
      case 'esbuild-async':
        opts.transform = require('./dist/esbuild-async')
        break

      case 'esbuild-sync':
        opts.transform = require('./dist/esbuild-sync')
        break

      case 'babel':
      default:
        opts.transform = require('./dist/babel')
    }
  }

  return jiti(filename, opts)
}
