import type { JITIOptions } from './jiti'

export interface TransformOptions extends JITIOptions {
  source: string
  filename: string
  ts?: boolean
  [key: string]: any
}
