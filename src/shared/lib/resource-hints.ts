/** Origins the browser should connect to early: media first (seek videos), then the API. */
export function resourceHintOrigins(...urls: Array<string | undefined>): string[] {
  const origins: string[] = [];
  for (const url of urls) {
    const value = url?.trim();
    if (!value) continue;
    try {
      const { origin, protocol } = new URL(value);
      if ((protocol === "https:" || protocol === "http:") && !origins.includes(origin)) origins.push(origin);
    } catch {
      // Not an absolute URL (unset or relative): nothing to connect to
    }
  }
  return origins;
}
