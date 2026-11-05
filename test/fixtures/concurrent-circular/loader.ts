export async function loadJoiner() {
  const mod = await import("./joiner");
  return mod.value;
}
