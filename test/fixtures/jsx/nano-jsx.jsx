/** @jsx h */
import { h, renderSSR } from "nano-jsx";

console.log(renderSSR(() => <h1>Hello, nano-jsx!</h1>));
