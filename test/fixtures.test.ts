import { join, resolve, dirname } from 'path'
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
      const { stdout, stderr } = await execa('node', [jitiPath, fixtureEntry], { cwd, stdio: 'pipe', reject: false })
      expect(stdout.replaceAll(cwd, '<cwd>').replaceAll(root, '<root>')).toMatchSnapshot('stdout')
      expect(stderr.replaceAll(cwd, '<cwd>').replaceAll(root, '<root>')).toMatchSnapshot('stderr')
    })
  }
})
