/**
 * Same rules as sign-up (see auth-card): used when setting a new password.
 * Returns message keys (auth.policy.*) so the UI can show them in the viewer's language.
 */
export function passwordPolicyErrors(password: string): string[] {
  const errors: string[] = [];
  if (password.length < 8) errors.push("auth.policy.minLength");
  if (password.length > 128) errors.push("auth.policy.maxLength");
  if (!/[A-Z]/.test(password)) errors.push("auth.policy.upper");
  if (!/[a-z]/.test(password)) errors.push("auth.policy.lower");
  if (!/[0-9]/.test(password)) errors.push("auth.policy.number");
  if (!/[^A-Za-z0-9]/.test(password)) errors.push("auth.policy.special");
  return errors;
}
