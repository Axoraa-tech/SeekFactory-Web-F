/** Retain the inquiry context across sign-in without accepting a caller-supplied redirect. */
export function inquiryReturnPath(
  path: "/messages" | "/rfq/new",
  values: Record<string, string | string[] | undefined>,
): string {
  const allowed = path === "/messages"
    ? ["with", "conversation", "product", "action"]
    : ["product", "category"];
  const query = new URLSearchParams();
  for (const key of allowed) {
    const raw = values[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value) query.set(key, value);
  }
  const suffix = query.toString();
  return suffix ? `${path}?${suffix}` : path;
}
