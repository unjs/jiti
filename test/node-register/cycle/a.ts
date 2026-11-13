import { getName } from "./b";

(globalThis as any).__jitiCycleEvaluations =
  ((globalThis as any).__jitiCycleEvaluations || 0) + 1;

export const name: string = "a";
export const result: string = getName();
