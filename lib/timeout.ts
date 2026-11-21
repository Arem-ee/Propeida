/**
 * Bound an outbound call that does not expose its own AbortSignal.
 *
 * The underlying request is not cancelled, but the caller is released and
 * the rejected promise is handled. Use for SDKs (Resend) that expose no
 * timeout option; prefer a native signal where one exists (Upstash).
 */
export async function withTimeout<T>(
  work: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      work,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} timed out`)), ms)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}
