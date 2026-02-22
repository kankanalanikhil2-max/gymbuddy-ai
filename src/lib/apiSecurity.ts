/**
 * Shared API security helpers: body size limit, no secrets in code.
 */

/** Max JSON body size (512 KB) to mitigate DoS from huge payloads. */
export const MAX_BODY_BYTES = 512 * 1024;

/**
 * Returns true if request body size is within limit.
 * Use before request.json() to avoid parsing huge payloads.
 */
export function isBodySizeAcceptable(request: Request): boolean {
  const cl = request.headers.get("content-length");
  if (cl == null) return true; // unknown; allow (e.g. chunked). Server may have its own limit.
  const n = parseInt(cl, 10);
  return !Number.isNaN(n) && n >= 0 && n <= MAX_BODY_BYTES;
}
