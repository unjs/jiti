declare module "@babel/plugin-syntax-jsx" {
  declare function jsx(): {
    manipulateOptions(opts: any, parserOpts: { plugins: string[] }): void;
  };
  export default jsx;
}
