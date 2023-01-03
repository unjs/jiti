import test, { FeedService } from "./test";
import { test as satisfiesTest } from "./satisfies";
export type { Test } from "./types";

console.log(test(), FeedService);
console.log(satisfiesTest());
