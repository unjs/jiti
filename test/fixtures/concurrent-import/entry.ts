export async function start(): Promise<string> {
  const mod = await import("./a");
  return mod.use();
}
