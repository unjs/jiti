import * as dns from "node:dns";

const state = new Map<string, string>([["x", "ready"]]);

export function use(): string {
  void dns;
  return state.get("x")!;
}
