await Promise.allSettled([import("./broken")]);
// Still evaluating when the loader imports it
await new Promise((resolve) => setTimeout(resolve));

export const value = "joined";
