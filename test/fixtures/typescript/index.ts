import test, { type FeedService as _FeedService } from "./test";
import Clazz from "./decorators";
import { test as satisfiesTest } from "./satisfies";
import { child } from "./parent.mjs";
// @ts-expect-error (needs allowImportingTsExtensions)
import defPromise from "./def-promise.cts";
import "./namespace";

export type { Test } from "./types";

console.log(test(), Clazz);
console.log(satisfiesTest());
console.log(child());
console.log(await defPromise);
