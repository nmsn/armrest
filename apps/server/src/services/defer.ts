export function defer(
  execCtx: { waitUntil: (p: Promise<unknown>) => void },
  promise: Promise<unknown>,
): void {
  execCtx.waitUntil(promise.catch((err) => console.error('[defer] Unhandled error:', err)));
}
