const { addHook } = require('pirates')

const pwd = process.cwd()
const jiti = require('.')(pwd)

addHook(
  function (code, filename) {
    return jiti.transform({ source: code, filename, ts: filename.match(/.ts$/) })
  },
  { exts: ['.js', '.ts'] }
)
