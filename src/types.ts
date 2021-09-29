
export type TransformOptions = {
  source: string,
  filename?: string,
  ts?: boolean
  retainLines?: boolean
  legacy?: boolean
  [key: string]: any
}

export type TRANSFORM_RESULT = {
  code: string,
  error?: any
}

export type JITIOptions = {
  transform?: (opts: TransformOptions) => TRANSFORM_RESULT,
  debug?: boolean,
  cache?: boolean | string
  requireCache?: boolean
  v8cache?: boolean
  interopDefault?: boolean
  cacheVersion?: string
  onError?: (error: Error) => void
  legacy?: boolean
  extensions?: string[]
  transformOptions?: Omit<TransformOptions, 'source'>
}
