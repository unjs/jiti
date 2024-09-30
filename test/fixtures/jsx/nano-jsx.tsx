/** @jsx h */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, renderSSR } from "nano-jsx";

console.log(renderSSR(() => <h1>Hello, nano-jsx!</h1>));
