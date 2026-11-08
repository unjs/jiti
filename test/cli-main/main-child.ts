export const childRequireMain = Boolean(
  require.main && require.main === module,
);
export const childImportMetaMain = import.meta.main;
export const childMainFilename = require.main?.filename;
