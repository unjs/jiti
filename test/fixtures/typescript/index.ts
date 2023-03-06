import test, { FeedService } from "./test";
import Clazz from "./decorators";
import { test as satisfiesTest } from "./satisfies";

export type { Test } from "./types";

console.log(test(), FeedService, Clazz);
console.log(satisfiesTest());
