const g = globalThis as { retryEvaluations?: number };
g.retryEvaluations = (g.retryEvaluations || 0) + 1;
if (g.retryEvaluations === 1) {
  throw new Error("first evaluation fails");
}

export const value = "recovered";
