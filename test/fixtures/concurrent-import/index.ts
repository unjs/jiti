import { start } from "./entry";

function format(result: PromiseSettledResult<unknown>) {
  return result.status === "fulfilled"
    ? result.value
    : `${result.reason.name}: ${result.reason.message}`;
}

const calls = await Promise.allSettled([start(), start(), start()]);
console.log("concurrent:", calls.map((r) => format(r)).join(", "));

const failed = await Promise.allSettled([import("./fail"), import("./fail")]);
console.log("failed:", failed.map((r) => format(r)).join(", "));
// Native ESM keeps a failed module errored, jiti evaluates it again
const retry = await Promise.allSettled([import("./fail")]);
console.log(
  "retry:",
  retry[0].status === "fulfilled" ? retry[0].value.value : format(retry[0]),
);

// Native ESM has no module.children
if (typeof module !== "undefined" && module.children) {
  const failedChildren = module.children.filter((child) =>
    child.filename.endsWith("fail.ts"),
  );
  console.log("fail children:", failedChildren.length);
}

// Mark file as module for typescript
export default {};
