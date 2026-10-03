/**
 * Reads a backend response as JSON without throwing on a non-JSON body. A hosted backend that is
 * cold-starting or unreachable answers with an HTML error page; callers get a clean message
 * instead of a parse error.
 */
export async function readBackendJson(res: Response): Promise<unknown> {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : { success: res.ok };
  } catch {
    const waking = res.status === 502 || res.status === 503 || res.status === 504;
    return {
      success: false,
      message: waking
        ? "The server is starting up. Please try again in a few seconds."
        : `Backend returned an unreadable response (${res.status})`,
    };
  }
}
