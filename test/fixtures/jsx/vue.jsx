/** @jsx h */
import { h } from "vue";
import { renderToString } from "vue/server-renderer";

console.log(await renderToString(<h1>Hello, vue!</h1>));
