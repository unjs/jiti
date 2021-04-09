import { lstatSync, accessSync, constants } from 'fs'
import { createHash } from 'crypto'

export function isDir (filename: string): boolean {
  try {
    const stat = lstatSync(filename)
    return stat.isDirectory()
  } catch (e) {
    // lstatSync throws an error if path doesn't exist
    return false
  }
}

export function isWritable (filename: string): boolean {
  try {
    accessSync(filename, constants.W_OK)
    return true
  } catch (e) {
    return false
  }
}

export function interopDefault (ex: any): any {
  return (ex && (typeof ex === 'object') && 'default' in ex) ? ex.default : ex
}

export function md5 (content: string, len = 8) {
  return createHash('md5').update(content).digest('hex').substr(0, len)
}
