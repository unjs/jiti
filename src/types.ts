
export type TransformOptions = {
  source: string,
  filename?: string,
  ts?: Boolean
  retainLines?: Boolean
  legacy?: Boolean
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
  interopDefault?: boolean
  cacheVersion?: string
  dynamicImport?: (id: string) => Promise<any>
  onError?: (error: Error) => void
  legacy?: boolean
  extensions?: string[]
  transformOptions?: Omit<TransformOptions, 'source'>
}
