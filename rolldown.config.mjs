import { fileURLToPath } from "node:url";
import { defineConfig } from "rolldown";

const stubAlias = {
  "@babel/code-frame": fileURLToPath(
    import.meta.resolve("./stubs/babel-codeframe.mjs"),
  ),
  "@babel/helper-compilation-targets": fileURLToPath(
    import.meta.resolve("./stubs/helper-compilation-targets.mjs"),
  ),
};

const distDir = fileURLToPath(import.meta.resolve("./dist"));

// One config per entry to avoid a shared chunk and match rspack's two
// self-contained CJS bundles.
const entry = (name) =>
  defineConfig({
    input: { [name]: `./src/${name}.ts` },
    output: {
      format: "cjs",
      dir: distDir,
      entryFileNames: "[name].cjs",
      exports: "default",
      codeSplitting: false,
      minify: {
        compress: true,
        mangle: {
          keepNames: { function: true, class: true },
        },
      },
    },
    platform: "node",
    resolve: { alias: stubAlias },
    external: [/^node:/],
    onwarn(warning, warn) {
      const msg = warning.message || "";
      if (
        /the request of a dependency is an expression/.test(msg) ||
        /require\.extensions is not supported/.test(msg) ||
        /require function is used in a way in which/.test(msg)
      ) {
        return;
      }
      warn(warning);
    },
  });

export default [entry("jiti"), entry("babel")];
