// @ts-ignore
import { z } from "zod";

console.log("npm:zod:", z.string().parse("hello world") === "hello world");
