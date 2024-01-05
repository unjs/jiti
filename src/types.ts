// `@babel/preset-react` config, reference: https://babeljs.io/docs/babel-preset-react#development
export interface JsxOption {
  pragma?: string;
  pragmaFrag?: string;
  throwIfNamespace?: boolean;
  runtime?: "classic" | "automatic";
}

export type TransformOptions = {
  source: string;
  filename?: string;
  ts?: boolean;
  retainLines?: boolean;
  legacy?: boolean;
  jsx?: boolean | JsxOption;
  [key: string]: any;
};

export type TRANSFORM_RESULT = {
  code: string;
  error?: any;
};

export type JITIOptions = {
  transform?: (opts: TransformOptions) => TRANSFORM_RESULT;
  debug?: boolean;
  cache?: boolean | string;
  sourceMaps?: boolean;
  requireCache?: boolean;
  v8cache?: boolean;
  interopDefault?: boolean;
  esmResolve?: boolean;
  cacheVersion?: string;
  onError?: (error: Error) => void;
  legacy?: boolean;
  extensions?: string[];
  transformOptions?: Omit<TransformOptions, "source">;
  alias?: Record<string, string>;
  nativeModules?: string[];
  transformModules?: string[];
  experimentalBun?: boolean;
};
