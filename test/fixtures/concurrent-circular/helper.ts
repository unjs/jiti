export async function loadE() {
  const mod = await import("./e");
  return mod.e;
}
