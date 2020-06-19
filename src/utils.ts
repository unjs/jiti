import { lstatSync } from 'fs'

export function isDir (filename: string): boolean {
  try {
    const stat = lstatSync(filename)
    return stat.isDirectory()
  } catch (e) {
    // lstatSync throws an error if path doesn't exist
    return false
  }
}

export function interopDefault (ex: any): any {
  return (ex && (typeof ex === 'object') && 'default' in ex) ? ex.default : ex
}
