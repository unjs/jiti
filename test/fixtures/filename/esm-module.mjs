import { getStackTrace } from "./get-stack-trace.cjs";

export const url = import.meta.url;
export const stackTop = getStackTrace();
