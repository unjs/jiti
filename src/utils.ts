export function debug (...args: string[]) {
  if (process.env.JITI_DEBUG) {
    // eslint-disable-next-line no-console
    console.log('[jiti]', ...args)
  }
}
