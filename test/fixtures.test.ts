import { join, resolve, dirname } from 'pathe'
import { execa } from 'execa'
import { describe, it, expect } from 'vitest'
import fg from 'fast-glob'

describe('fixtures', async () => {
  const jitiPath = resolve(__dirname, '../bin/jiti.js')

  const root = dirname(__dirname)
  const dir = join(__dirname, 'fixtures')
  const fixtures = await fg('*/index.*', { cwd: dir })

  for (const fixture of fixtures) {
    it(dirname(fixture), async () => {
      const fixtureEntry = join(dir, fixture)
      const cwd = dirname(fixtureEntry)

      // Clean up absolute paths and sourcemap locations for stable snapshots
      function cleanUpSnap (str:string) {
        return str
          .replace(/\\/g, '/')
          .split(cwd).join('<cwd>') // workaround for replaceAll in Node 14
          .split(root).join('<root>') // workaround for replaceAll in Node 14
          .replace(/:\d+:\d+([)'\n])/g, '$1')
      }

      const { stdout, stderr } = await execa('node', [jitiPath, fixtureEntry], { cwd, stdio: 'pipe', reject: false })
      expect(cleanUpSnap(stdout)).toMatchSnapshot('stdout')
      expect(cleanUpSnap(stderr)).toMatchSnapshot('stderr')
    })
  }
})
