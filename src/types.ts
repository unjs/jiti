export type TransformOptions = {
  source: string,
  filename?: string,
  ts?: Boolean
  retainLines?: Boolean
  legacy?: Boolean
}

export type TRANSFORM_RESULT = {
  code: string,
  error?: any
}
