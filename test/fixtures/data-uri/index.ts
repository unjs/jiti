const script = `export default {a: "A"}`;
const uri = "data:text/javascript;charset=utf-8," + encodeURIComponent(script);
import(uri);
