import type { Test } from "./types";

export default function test() {
  return <Test>{
    file: __filename,
    dir: __dirname,
    resolve: require.resolve("./test"),
  };
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace smart_player_namespace {
  export declare class FeedService {}
}

export type FeedService2 = smart_player_namespace.FeedService;
export const FeedService = smart_player_namespace.FeedService;
