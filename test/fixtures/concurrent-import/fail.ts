import "node:dns";

const g = globalThis as { evaluations?: number };
g.evaluations = (g.evaluations || 0) + 1;
if (g.evaluations === 1) {
  throw new Error("first evaluation fails");
}

export const value = "recovered";
