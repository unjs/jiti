import "node:dns";

const g = globalThis as { concurrentRootsEvaluations?: number };
g.concurrentRootsEvaluations = (g.concurrentRootsEvaluations || 0) + 1;

export const shared = {};
