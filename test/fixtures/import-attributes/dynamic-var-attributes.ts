// 探针 1: options 里 with 的值是标识符
const attrs = { type: "css" };
export default await import("./data.json", { with: attrs });
