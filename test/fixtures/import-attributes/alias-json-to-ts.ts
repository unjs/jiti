// `#config.json` is resolved by jiti's alias option at runtime; TypeScript
// cannot see it, so the specifier is expected to be unresolvable here.
// @ts-expect-error - runtime-only alias
import cfg from "#config.json" with { type: "css" };

export default cfg;
