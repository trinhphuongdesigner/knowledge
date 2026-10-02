/** Only accept same-site relative paths from `?next=`; anything else becomes "/". */
export function safeNext(next: unknown): string {
  if (typeof next !== "string" || next === "") return "/";
  if (!next.startsWith("/")) return "/";
  if (next.startsWith("//") || next.startsWith("/\\")) return "/";
  // Reject control characters (header injection / browser normalisation tricks).
  if (/[\u0000-\u001f\u007f]/.test(next)) return "/";
  return next;
}

/** CSRF check for Route Handlers: a present Origin header must match the request host. */
export function isSameOrigin(origin: string | null, host: string | null, forwardedHost?: string | null): boolean {
  if (!origin) return true;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  return originHost === host || (!!forwardedHost && originHost === forwardedHost);
}
