// @ts-ignore
import etag from "etag";

console.log(
  "npm:etag:",
  etag("hello world") === `"b-Kq5sNclPz7QV2+lfQIuc6R7oRu0"`,
);
