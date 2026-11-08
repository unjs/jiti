import {
  childRequireMain,
  childImportMetaMain,
  childMainFilename,
} from "./main-child";

const output = {
  parentRequireMain: Boolean(require.main && require.main === module),
  parentImportMetaMain: import.meta.main,
  childRequireMain,
  childImportMetaMain,
  childMainFilename,
};

console.log(JSON.stringify(output));
