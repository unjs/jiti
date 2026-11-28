// 探针 2: 求值时机 —— import 语句之后修改 kind
let kind = "css";
const pending = import("./data.json", { with: { type: kind } });
kind = "json";
export default await pending;
