import {
  childRequireMain,
  childImportMetaMain,
  childMainFilename,
} from "./main-child";

const output = {
  parentRequireMain: Boolean(require.main && require.main === module),
  parentImportMetaMain: import.meta.main,
  // `require` shadowed by a parameter must not change the result
  parentShadowedImportMetaMain: (function check(require: unknown) {
    return require !== undefined && import.meta.main;
  })({}),
  childRequireMain,
  childImportMetaMain,
  childMainFilename,
};

console.log(JSON.stringify(output));
