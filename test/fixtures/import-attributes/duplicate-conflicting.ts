// 探针 3: 同一 source 两组声明，第二组不匹配
import a from "./data.json" with { type: "json" };
import b from "./data.json" with { type: "css" };
export default { a, b };
