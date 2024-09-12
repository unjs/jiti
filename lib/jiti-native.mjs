import _createJiti from "../dist/jiti.cjs";

/**
 * @typedef {import('./types').Jiti} Jiti
 * @typedef {import('./types').JitiOptions} JitiOptions
 */

/**
 * @param {string} message
 */
function unsupportedError(message) {
  throw new Error(
    `[jiti] ${message} (import or require \`jiti/node\` for more features).`,
  );
}

/**
 * @param {string} parentURL
 * @param {JitiOptions} opts
 * @returns {Jiti}
 */
export function createJiti(parentURL, _opts) {
  /** @type {Jiti} */
  function jiti() {
    throw unsupportedError(
      "`jiti()` is not supported in native mode, use `jiti.import()` instead.",
    );
  }

  jiti.resolve = () => {
    throw unsupportedError("`jiti.resolve()` is not supported in native mode.");
  };

  jiti.esmResolve = (id, opts) => {
    try {
      return import.meta.resolve(id, opts?.parentURL || parentURL);
    } catch (error) {
      if (opts?.try) {
        return undefined;
      } else {
        throw error;
      }
    }
  };

  jiti.import = async function (id, opts) {
    const resolved = await this.esmResolve(id, opts);
    if (!resolved) {
      if (opts?.try) {
        return undefined;
      } else {
        throw new Error(`Cannot resolve module '${id}'`);
      }
    }
    return import(resolved);
  };

  jiti.transform = () => {
    throw unsupportedError(
      "`jiti.transform()` is not supported in native mode.",
    );
  };

  jiti.evalModule = () => {
    throw unsupportedError(
      "`jiti.evalModule()` is not supported in native mode.",
    );
  };

  jiti.main = undefined;
  jiti.extensions = Object.create(null);
  jiti.cache = Object.create(null);

  return jiti;
}

export default createJiti;
