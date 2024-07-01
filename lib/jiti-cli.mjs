#!/usr/bin/env node

import { resolve } from "node:path";
import { createJiti } from "./jiti.cjs";

const script = process.argv.splice(2, 1)[0];

if (!script) {
  console.error("Usage: jiti <path> [...arguments]");
  process.exit(1);
}

const pwd = process.cwd();
const jiti = createJiti(pwd);
const resolved = (process.argv[1] = jiti.resolve(resolve(pwd, script)));

jiti.import(resolved).catch(console.error);
