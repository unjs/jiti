async function run() {
  const { createJiti } = await import("../../../lib/jiti.mjs");
  const jiti = createJiti(__filename, { tsconfigPaths: true });

  // Wildcard path: @/* -> ./src/*
  const { greet } = (await jiti.import("@/utils/greet")) as any;
  console.log(greet("world"));

  // Exact path: @config -> ./src/config
  const { appName } = (await jiti.import("@config")) as any;
  console.log(appName);

  // Catch-all: * -> ./types/*
  const { APP_VERSION } = (await jiti.import("app-constants")) as any;
  console.log(APP_VERSION);

  // Mid-pattern wildcard: plugins/*/mod -> ./src/plugins/*
  const { loggerName } = (await jiti.import("plugins/logger/mod")) as any;
  console.log(loggerName);

  // Multiple fallback targets: ~/* -> ./generated/* then ./src/*
  // ./generated/utils/greet.ts exists, so it should resolve there first
  const { greet: genGreet } = (await jiti.import("~/utils/greet")) as any;
  console.log(genGreet("fallback"));
  // ./generated/config.ts does NOT exist, should fall through to ./src/config.ts
  const { appName: fallbackName } = (await jiti.import("~/config")) as any;
  console.log(fallbackName);
}

run();
