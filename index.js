const transforms = {
  babel: () => require('./dist/babel'),
  esbuild: () => require('./dist/esbuild')
}

module.exports = function (filename, opts) {
  require('./dist/v8cache')
  const jiti = require('./dist/jiti')

  opts = { ...opts }

  if (!opts.transform || typeof opts.transform === 'string') {
    opts.transform = (transforms[opts.transform] || transforms.babel)()

    if (opts.transform === 'esbuild' && !opts.sync) {
      require('./dist/esbuild').getService()
    }
  }

  return jiti(filename, opts)
}
