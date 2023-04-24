#!/usr/bin/env node

const { readFileSync } = require("fs");

const argv = process.argv.slice(2);
const [filename, path] = argv



const jiti = require("../..")(process.cwd());

const source = readFileSync(path, 'utf8')

jiti.evalModule(filename, source);
